var jp = jp || {};

/**
 * @TODO Defer debug (such as lines drawn) until after everything has run (perhaps break into a separate file)
 * @TODO A web worker should probably be used to set the maps (for greatly increased speed)
 * @type {{map: null, debug: boolean, maxHeight: null, connectionLib: null, connectionId: null, setMap: setMap, addTileConnection: addTileConnection, setAngledDrop: setAngledDrop, setLedgeConnections: setLedgeConnections, setAnchor: setAnchor, setConnection: setConnection, getConnection: getConnection, getConnectionId: getConnectionId, getTileMoveType: getTileMoveType, getTile: getTile, setTile: setTile, blocked: blocked, getCost: getCost, getNeighbors: getNeighbors}}
 */
window.MapMovement = Class.extend({
  map: null, // An array of all existing movement tiles
  debug: false, // Real time updates for movement tiles
  maxHeight: null, // Maximum supported height we'll use for clearance to cut down on search time
  connectionLib: null, // Id references for our edges in connections
  connectionId: null,
  collision: null,
  clearance: null,

  init: function (width, height, maxHeight, maxJump, collision, clearance) {
    this.setCollision(collision)
      .setClearance(clearance)
      .setMap(width, height, maxHeight, maxJump);

    return this;
  },

  /**
   * @TODO Must be set to null for proper memory clearance
   */
  setCollision: function (collision) {
    this.collision = collision;
    return this;
  },

  /**
   * @TODO Must be set to null for proper memory clearance
   */
  setClearance: function (clearance) {
    this.clearance = clearance;
    return this;
  },

  /**
   * Sets clearance values, reliant on the Map API to have collision data set
   * @param width Width of the map
   * @param height Height of the map
   * @param maxHeight {number} Maximum height we will support for movement paths
   * @param maxJump {number} Maximum jump distance we will calculate on the map, speeds up linking
   * jump platforms together
   */
  setMap: function (width, height, maxHeight, maxJump) {
    if (this.debug === true) var start = Date.now(); // Used to record the total run time
    var ledges = []; // A collection
    var x, y, tile, ledge;
    this.maxHeight = maxHeight;
    this.connectionLib = {};
    this.connectionId = 0;

    // Build initial map while discovering locations of walkways and ledges
    this.map = [];
    for (y = 0; y < height; y++) {
      this.map.push([]);
      for (x = 0; x < width; x++) {
        tile = {
          x: x,
          y: y
        };

        // Set movement tiles depending upon the discovered type
        switch (this.getTileMoveType(x, y)) {
          case 'blocked':
            tile.type = 0;
            break;
          case 'walkway':
            tile.type = 1;
            tile.cost = 1;
            tile.clearance = this.clearance.getFlatValue(x, y, this.maxHeight); // Maximum clearance support
            break;
          case 'ledge-right':
            tile.type = 2; // Indicates a potential jump pad
            tile.cost = 2;
            tile.clearance = this.clearance.getFlatValue(x, y, this.maxHeight);
            tile.direction = 1; // Right facing
            break;
          case 'ledge-left':
            tile.type = 2;
            tile.cost = 2;
            tile.clearance = this.clearance.getFlatValue(x, y, this.maxHeight);
            tile.direction = -1; // Left facing
            break;
          case 'ledge-both':
            tile.type = 2;
            tile.cost = 2;
            tile.clearance = this.clearance.getFlatValue(x, y, this.maxHeight);
            tile.direction = 0; // Facing both directions
            break;
          default:
            break;
        }

        // We need to record edges by reference id and in a tmp array for further processing
        if (tile.type === 2) {
          tile.id = this.getConnectionId();
          tile.connections = [];
          this.setConnection(tile);
          ledges.push(tile);
        }

        this.map[y].push(tile);
      }
    }

    // Loop through all of our gathered ledges
    while (ledges.length > 0) {
      ledge = ledges.pop();

      // Make sure ledges with two sides set two angled drops
      if (ledge.direction !== 0) {
        this.setAngledDrop(ledge.x, ledge.y, ledge.direction, maxJump * 3);
        this.setAnchor(ledge.x, ledge.y, ledge.direction, 10);
        this.setLedgeConnections(ledge, ledges, maxJump, ledge.direction);
      } else {
        this.setAngledDrop(ledge.x, ledge.y, -1, maxJump * 3);
        this.setAngledDrop(ledge.x, ledge.y, 1, maxJump * 3);
        this.setAnchor(ledge.x, ledge.y, 1, 10);
        this.setAnchor(ledge.x, ledge.y, -1, 10);
        this.setLedgeConnections(ledge, ledges, maxJump, -1);
        this.setLedgeConnections(ledge, ledges, maxJump, 1);
      }

    }
    return this;
  },

  addTileConnection: function (tile, id) {
    tile.connections.push(id);

    return this;
  },

  setAngledDrop: function (xO, yO, direction, maxDepth) {
    var distance, originTile, targetTile, len, i,
      x = xO + direction,
      y = yO + 1;

    while (y < maxDepth) {
      for (i = 0, len = 2; i < len; i++, y++) {

        // Check below to see if we hit a tile
        if (this.collision.blocked(x, y + 1) && !this.collision.outOfBounds(x, y + 1)) {
          distance = jp.helper.distanceM(xO, yO, x, y);
          originTile = this.getTile(xO, yO);

          // @TODO Normalize adding tiles into a method and use throughout this file
          targetTile = this.getTile(x, y);
          targetTile.type = 2;
          targetTile.x = x;
          targetTile.y = y;

          if (!targetTile.connections) targetTile.connections = [];
          if (!targetTile.id) {
            targetTile.id = this.getConnectionId();
            this.setConnection(targetTile);
          }

          // Connect ids of both tiles
          this.addTileConnection(originTile, targetTile.id, distance)
            .addTileConnection(targetTile, originTile.id, distance);

          return this;
        }

        if (y > yO + maxDepth || this.collision.outOfBounds(x + direction, y + 1)) {
          return this;
        }
      }

      x += direction;
    }

    return this;
  },

  /**
   * Loops through and checks for a relationship between ledges
   * @param l {object} The ledge itself
   * @param ledges {array|object} An array of ledge objects
   * @param maxJump {number} Maximum jump we'll look for (determines search distance on ledges)
   */
  setLedgeConnections: function (l, ledges, maxJump, direction) {
    var startX, endX, startY, endY, distance;

    // We need to pre-cache a search area to look
    // Determine x direction to look in
    if (direction === 1) {
      startX = l.x;
      endX = l.x + maxJump + 1; // Fix max jumps, computers start counting from 0
    } else {
      startX = l.x - maxJump - 1;
      endX = l.x;
    }

    // Determine y direction to look
    startY = l.y - maxJump;
    endY = l.y + maxJump;

    for (var i = 0, len = ledges.length; i < len; i++) {
      if (l.x !== ledges[i].x && // Skip same x index
        (l.direction !== ledges[i].direction || ledges[i].direction === 0) && // Do the directions align?
        ledges[i].x > startX && ledges[i].x < endX && ledges[i].y > startY && ledges[i].y < endY && // Inside search area?
        jp.jump.isJumpPossible(l.x, l.y, ledges[i].x, ledges[i].y, this.collision, 1)) { // @TODO isJumpPossible should get a proper jump value from the pathfinder

        // We have a positive, link both
        distance = jp.helper.distanceM(l.x, l.y, ledges[i].x, ledges[i].y);
        this.addTileConnection(l, ledges[i].id, distance);
        l.connections.push(ledges[i].id);
        ledges[i].connections.push(l.id);
      }
    }

    return this;
  },

  /**
   * Creates a fall map marker by dropping a straight line off the side until it hits bottom
   */
  setAnchor: function (x, y, direction, maxDepth) {
    x += direction;
    for (var i = 0; i < maxDepth; i++) {
      if (this.collision.blocked(x, y + i + 1) && !this.collision.outOfBounds(x, y + i + 1)) {
        var tile = this.getTile(x, y + i);
        tile.x = x;
        tile.y = y + i;
        tile.id = this.getConnectionId();
        tile.type = 3;
        this.setConnection(tile);

        this.addTileConnection(this.getTile(x - direction, y), tile.id);

        break;
      }

      if (this.collision.outOfBounds(x, y + i + 1)) break;
    }

    return this;
  },

  setConnection: function (tile) {
    this.connectionLib[tile.id] = tile;
    return this;
  },

  getConnection: function (id) {
    return this.connectionLib[id];
  },

  getConnectionId: function () {
    return this.connectionId += 1;
  },

  /**
   * Crawls through data from the collision map to discover ledges and walkways (movable tile types)
   * @param x
   * @param y
   */
  getTileMoveType: function (x, y) {
    var type;

    // Check if the tile not blocked, has a standing tile below, and not out of bounds
    if (!this.collision.blocked(x, y) && this.collision.blocked(x, y + 1) && !this.collision.outOfBounds(x, y + 1)) {

      // Walkway check
      if (this.collision.blocked(x + 1, y + 1) && this.collision.blocked(x - 1, y + 1)) {
        type = 'walkway';

        // Ledge facing right
      } else if (this.collision.blocked(x - 1, y + 1)) {
        type = 'ledge-right';

        // Ledge facing left
      } else if (this.collision.blocked(x + 1, y + 1)) {
        type = 'ledge-left';

        // Ledge empty on both sides
      } else {
        type = 'ledge-both';
      }

      // Must be a blank tile
    } else {
      type = 'blocked';
    }

    return type;
  },

  /**
   * Retrieve the data for a specific tile
   * @param x
   * @param y
   * @returns {*}
   */
  getTile: function (x, y) {
    return this.map[y][x];
  },

  setTile: function (x, y, value) {
    this.map[y][x] = value;
    return this;
  },

  blocked: function (x, y) {
    if (this.collision.outOfBounds(x, y) || this.map[y][x].type === 0) {
      return true;
    }

    return false;
  },

  /**
   * Finds the flattened clearance value
   * @param x
   * @param y
   */
  getClearance: function (x, y) {
    return this.getTile(x, y).clearance | 0;
  },

  getCost: function (xC, yC, xT, yT) {
    // Calculate manhattan distance and weight
    return jp.helper.distanceM(xC, yC, xT, yT) + this.getTile(xT, yT).cost;
  },

  /**
   * Figures out the relationship between two tiles and returns the movement type
   * @param xC
   * @param yC
   * @param xT
   * @param yT
   * @returns {number} 1 = move, 2 = jump, 3 = fall
   */
  getType: function (xC, yC, xT, yT) {
    var type;

    // If one x away its a move
    if (Math.abs(xC - xT) === 1 && Math.abs(yC - yT)) {
      type = 1;
      // otherwise fall or jump
    } else if (this.getTile(xT, yT).type === 2) {
      type = 2;
      // Fall
    } else {
      type = 3;
    }

    return type;
  },

  // @TODO Connections must be a jump or fall (2, 3), everything else will always be a walk (1)
  // currently these do not always return this way. So the command list is out of wack for characters
  // to follow
  getNeighbors: function (x, y) {
    var neighbors = [],
      current = this.getTile(x, y);

    // Check sides
    if (!this.blocked(x + 1, y)) neighbors.push(this.getTile(x + 1, y)); // Right
    if (!this.blocked(x - 1, y)) neighbors.push(this.getTile(x - 1, y)); // Left

    // If we have connections return all of them
    if (current.connections) {
      for (var i = 0, len = current.connections.length; i < len; i++) {
        neighbors.push(this.getConnection(current.connections[i]));
      }
    }

    return neighbors;
  }
});
