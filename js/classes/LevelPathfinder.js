class LevelPathfinder {
  constructor() {
    this.maxSteps = 250;
    this.path = [];
  }

  findPath({
             start,
             end,
             level
           }) {
    let mapMatrix = level.toMatrixDiagonals(start.x, start.y);
    this.mapCollision = new MapCollision(mapMatrix);

    const width = this.mapCollision.getWidthInTiles(),
      height = this.mapCollision.getHeightInTiles();
    this.clearance = new MapClearance(width, height, this.mapCollision);

    // move-clearance, max-jump-size
    this.movement = new MapMovement(width, height, 1, 8, this.mapCollision, this.clearance);
    this.mapCollision.setClearance(this.clearance).setMovement(this.movement);
    this.pathfinder = new Pathfinder(this.mapCollision, this.movement, true);
    this.pathfinder.playerSize = 1;

    this.levelIndex = level.index;

    this.path = this.pathfinder.findPath(start.x, start.y, end.x, end.y, this.maxSteps);
    this.path.pop();
    return this;

  }
}
