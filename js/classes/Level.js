class Level {

  constructor({
                index,
                template,
                lastY,
                allAsSolids,
                customText,
                title
              }) {
    this.index = index;
    if (!title) title = '';
    this.title = title.substring(0, 64);
    this.lastY = lastY;
    const templateParts = template.split(';');
    if (templateParts[0] === GAME.customLevelTemplatePrefix) {
      this.title = decodeURIComponent(templateParts[2]).substring(0, 64);
      template = this.uncompress(decodeURIComponent(templateParts[4]));
    }

    template = template.replace(/x/g, '_');
    this.template = template;
    // let levelRows = template.split('\n').slice(1, -1);
    let levelRows = template.split('\n');

    levelRows = levelRows.map(row => row.padEnd(GAME.worldWidth, GAME.types.air));

    this.levelData = [];

    for (let y = levelRows.length; y < GAME.worldHeight; ++y) {
      levelRows[y] = ''.padEnd(GAME.worldWidth, GAME.types.air);
    }

    this.levelData = levelRows.map(row => row.split(''));

    for (let y = 0; y < this.levelData.length; ++y) {
      for (let x = 0; x < this.levelData[y].length; ++x) {
        const type = this.levelData[y][x];

        if (Object.values(GAME.types).find(t => t === type) !== undefined) {
          switch (type) {
            case GAME.types.enemyFollowing:
              this.levelData[y][x] = new EnemyFollowing();
              break;
            case GAME.types.enemyHorizontal:
              this.levelData[y][x] = new Enemy(type);
              break;
            case GAME.types.enemyVertical:
              this.levelData[y][x] = new Enemy(type);
              break;

            default:
              this.levelData[y][x] = new Block(type);
          }
        } else {
          this.levelData[y][x] = new Block(GAME.types.air);
        }


        if (allAsSolids) {
          if (this.levelData[y][x].type !== GAME.types.air) {
            let originalValue = this.levelData[y][x];
            if (originalValue.type) {
              originalValue = originalValue.type;
            }
            this.levelData[y][x] = new Block(GAME.types.solidTop);
            this.levelData[y][x].textValue = originalValue;

          }
        }
      }
    }
    if (allAsSolids) {
      this.levelData[3][5] = new Block(GAME.types.player);
      this.spawnPosition = {x: 5, y: 3};
    } else {
      this.spawnPosition = this.getPlayerPosition();
    }

    if (!this.spawnPosition && GAME.isPreview) {
      alert('Please set the player position using \'o\'');
      GAME.exitPreview();
    }
    if (!this.findBlockLocation(GAME.types.nextLevel) && GAME.isPreview) {
      alert('Please set the next level flag using \'P\'');
      GAME.exitPreview();
    }
    this.playerHit = false;

    this.customText = customText;
  }

  toMatrix() {
    // 1 - empty
    // 0 - solid
    const matrix = Array.from(Array(GAME.worldHeight), () => (new Array(GAME.worldWidth)).fill(1));
    for (let y = 0; y < this.levelData.length; ++y) {
      for (let x = 0; x < this.levelData[y].length; ++x) {
        const block = this.getBlockValue(x, y);
        if (block !== GAME.types.air && block !== GAME.types.bulletBottom && block !== GAME.types.bulletTop && block !== GAME.types.bulletLeft && block !== GAME.types.bulletRight && block !== GAME.types.player && block != null) {
          matrix[y][x] = 0;
        }
      }
    }

    return matrix;
  }


  toMatrixDiagonals(startX, startY) {
    const matrix = this.toMatrix();
    matrix[startY][startX] = 1;
    for (let y = 0; y < matrix.length; ++y) {
      for (let x = 0; x < matrix[y].length; ++x) {
        if (matrix[y]?.[x] !== 1) continue;
        if (matrix[y]?.[x - 1] === 0 && matrix[y + 1]?.[x] === 0) {
          matrix[y + 1][x - 1] = 0;
        }
        if (matrix[y]?.[x + 1] === 0 && matrix[y + 1]?.[x] === 0) {
          matrix[y + 1][x + 1] = 0;
        }
      }
    }

    return matrix;
  }


  uncompress(template) {
    function* isNextCharNumber(str, index) {
      let offset = 1;
      while (true) {
        if (!isNaN(str[index + offset])) {
          yield offset + index;
          offset++;
        } else {
          return
        }
      }
    }

    const getNextNumberIndex = (str, index) => {
      let nextIndex = index;
      for (let i of isNextCharNumber(str, index)) {
        nextIndex = i;
      }
      return nextIndex;
    };

    let templateNew = '';

    for (let index = 0, char = ''; char = template.charAt(index); index++) {
      if (isNaN(char)) {
        const nextIndex = getNextNumberIndex(template, index);
        if (nextIndex !== index) {
          templateNew += char.repeat(template.substring(index + 1, nextIndex + 1))
        } else {
          templateNew += char;
        }
      }

      templateNew = templateNew.replace(/n/g, '\n');
      templateNew = templateNew.replace(/s/g, ' ');
    }

    return templateNew;
  }

  toCompressed() {
    let template = this.template.split('\n').map(row => row.split(''));

    let str = '';
    let lastChar = '';
    let sameCharCount = 1;
    for (let y = 0; y < template.length; ++y) {
      template[y].push('n');
      for (let x = 0; x < template[y].length; ++x) {
        if (template[y][x] === ' ') {
          template[y][x] = 's';
        }
        if (template[y][x] === lastChar) {
          sameCharCount++;
        } else if (sameCharCount > 1) {
          str += lastChar + sameCharCount;

          sameCharCount = 1;
        } else {
          str += lastChar;
        }

        lastChar = template[y][x];
      }
    }
    return GAME.customLevelTemplatePrefix + ';;' + encodeURIComponent(this.title) + ';;' + str;
  }

  replaceBlocks(blockToReplace, newBlock) {
    for (let y = 0; y < this.levelData.length; ++y) {
      for (let x = 0; x < this.levelData[y].length; ++x) {
        if (blockToReplace === this.levelData[y][x].type) {
          this.levelData[y][x] = new Block(newBlock);
        }
      }
    }
  }

  findBlockLocation(type) {
    for (let y = 0; y < this.levelData.length; ++y) {
      for (let x = 0; x < this.levelData[y].length; ++x) {
        if (type === (this.levelData[y][x].type)) {
          return {
            x,
            y
          };
        }
      }
    }
  }

  getPlayerPosition() {
    return this.findBlockLocation(GAME.types.player);
  }

  setPlayerPosition({
                      x,
                      y
                    }) {
    this.replaceBlocks(GAME.types.player, GAME.types.air);
    return this.setBlock(GAME.types.player, {
      x,
      y
    })
  }

  moveBlock(from, to) {
    if (!(from.x < 0 || from.y < 0 || from.x >= GAME.worldWidth || from.y >= GAME.worldHeight || to.x < 0 || to.y < 0 || to.x >= GAME.worldWidth || to.y >= GAME.worldHeight)) {

      if (!this.isBlockEmpty(to)) return false;

      this.levelData[to.y][to.x] = this.getBlock({
        x: from.x,
        y: from.y
      });
      this.levelData[from.y][from.x] = new Block();
    }

    return {
      x: to.x,
      y: to.y
    };
  }

  setBlock(block, {
    x,
    y
  }) {

    if (!(x < 0 || y < 0 || x >= GAME.worldWidth || y >= GAME.worldHeight)) {
      this.levelData[y][x].setType(block);
    }

    return {
      x,
      y
    };
  }

  getBlock(x, y) {
    if (y === undefined) {
      y = x.y;
      x = x.x;
    }
    if (x < 0 || y < 0 || x >= GAME.worldWidth || y >= GAME.worldHeight) return {
      type: GAME.types.air
    };
    return this.levelData[y][x];
  }

  getBlockValue(x, y) {
    if (y === undefined) {
      y = x.y;
      x = x.x;
    }
    return this.getBlock(x, y).type;
  }

  isBlockEmpty(x, y) {
    if (y === undefined) {
      y = x.y;
      x = x.x;
    }
    if (x < 0 || y < 0) return false;
    if (x >= GAME.worldWidth || y >= GAME.worldHeight) return false;
    const block = this.getBlockValue(x, y);
    return [GAME.types.air, null].includes(block);
  }

  isBlockWalkable(x, y) {
    if (y === undefined) {
      y = x.y;
      x = x.x;
    }
    if (x < 0 || y < 0) return false;
    if (x >= GAME.worldWidth || y >= GAME.worldHeight) return false;
    const block = this.getBlockValue(x, y);
    return [GAME.types.air, GAME.types.life, GAME.types.extraBullet, GAME.types.ladder, null].includes(block);
  }

  updateBullets() {
    const bulletPositions = [];

    for (let y = 0; y < this.levelData.length; ++y) {
      for (let x = 0; x < this.levelData[y].length; ++x) {
        switch (this.levelData[y][x].type) {
          case GAME.types.bulletLeft:
            bulletPositions.push({
              location: {
                x,
                y
              },
              direction: GAME.direction.left,
              axis: 'x'
            });
            break;
          case GAME.types.bulletRight:
            bulletPositions.push({
              location: {
                x,
                y
              },
              direction: GAME.direction.right,
              axis: 'x'
            });
            break;
          case GAME.types.bulletTop:
            bulletPositions.push({
              location: {
                x,
                y
              },
              direction: GAME.direction.up,
              axis: 'y'
            });
            break;
          case GAME.types.bulletBottom:
            bulletPositions.push({
              location: {
                x,
                y
              },
              direction: GAME.direction.down,
              axis: 'y'
            });
            break;
        }
      }
    }


    // check bullets collisions
    for (let i = 0; i < bulletPositions.length; ++i) {
      if (bulletPositions[i].direction === GAME.direction.right) continue;

      const axis = bulletPositions[i].axis;
      const secondaryAxis = axis === 'x' ? 'y' : 'x';

      let bulletRightLocations;

      if (axis === 'y') {
        bulletRightLocations = [{
          x: bulletPositions[i].location.x,
          y: bulletPositions[i].location.y - 2
        },
          {
            x: bulletPositions[i].location.x,
            y: bulletPositions[i].location.y - 1
          },
        ];
      } else {
        bulletRightLocations = [{
          x: bulletPositions[i].location.x - 2,
          y: bulletPositions[i].location.y
        },
          {
            x: bulletPositions[i].location.x - 1,
            y: bulletPositions[i].location.y
          },
        ];
      }
      for (let j = 0; j < bulletRightLocations.length; ++j) {
        if (!bulletPositions[i]) continue;
        if ([GAME.types.bulletRight, GAME.types.bulletBottom].includes(this.getBlockValue(bulletRightLocations[j]))) {
          this.setBlock(GAME.types.air, bulletPositions[i].location);
          this.setBlock(GAME.types.air, bulletRightLocations[j]);

          bulletPositions.splice(i, 1);
          bulletPositions.splice(bulletPositions.findIndex(pos =>
            pos.location.x === bulletRightLocations[j].x && pos.location.y === bulletRightLocations[j].y
          ), 1);
        }
      }

    }
    // replace all bullets blocks
    for (let i = 0; i < bulletPositions.length; ++i) {
      this.setBlock(GAME.types.air, bulletPositions[i].location);
    }
    // update bullets positions
    for (let i = 0; i < bulletPositions.length; ++i) {

      const axis = bulletPositions[i].axis;
      const secondaryAxis = axis === 'x' ? 'y' : 'x';

      bulletPositions[i].location[axis] += bulletPositions[i].direction;

      if (bulletPositions[i].location[axis] < 0) continue;
      if (bulletPositions[i].location[axis] >= GAME.worldWidth) continue;

      if (this.getBlockValue(bulletPositions[i].location) === GAME.types.player) {
        this.playerHit = true;
        continue;
      }
      if ([GAME.types.enemyFollowing, GAME.types.enemyHorizontal, GAME.types.enemyVertical].includes(this.getBlockValue(bulletPositions[i].location))) {
        this.getBlock(bulletPositions[i].location).gotHit();
        continue;
      }


      if (!this.isBlockEmpty(bulletPositions[i].location)) continue;

      if (axis === 'x') {
        this.setBlock(bulletPositions[i].direction === GAME.direction.left ? GAME.types.bulletLeft : GAME.types.bulletRight, bulletPositions[i].location);
      } else if (axis === 'y') {
        this.setBlock(bulletPositions[i].direction === GAME.direction.up ? GAME.types.bulletTop : GAME.types.bulletBottom, bulletPositions[i].location);
      }

    }
  }

  updateEnemies(frame) {
    const enemiesPositions = [];

    for (let y = 0; y < this.levelData.length; ++y) {
      for (let x = 0; x < this.levelData[y].length; ++x) {
        if ([GAME.types.enemyHorizontal, GAME.types.enemyVertical, GAME.types.enemyFollowing].includes(this.levelData[y][x].type)) {
          enemiesPositions.push({
            location: {
              x,
              y
            },
            type: this.levelData[y][x].type,
            axis: this.levelData[y][x].type === GAME.types.enemyVertical ? 'y' : 'x'
          });
        }
      }
    }


    let playerPosition = this.getPlayerPosition();


    for (let i = 0; i < enemiesPositions.length; ++i) {
      const axis = enemiesPositions[i].axis;
      const secondaryAxis = axis === 'x' ? 'y' : 'x';

      if (enemiesPositions[i].type === GAME.types.enemyFollowing) {
        const blockPosition = enemiesPositions[i].location;
        const block = this.getBlock(blockPosition);

        // only once 30 frames
        if (frame % 30 === 0) {
          // check gravity
          const blockUnderLocation = {
            x: enemiesPositions[i].location.x,
            y: enemiesPositions[i].location.y + 1
          };

          if (this.isBlockEmpty(blockUnderLocation)) {
            block.isFalling = true;
            this.moveBlock(enemiesPositions[i].location, blockUnderLocation);
          } else {
            if (blockUnderLocation.y >= GAME.worldHeight) {
              block.die();
              this.setBlock(GAME.types.air, blockPosition);
              continue;
            }
            block.isFalling = false;
          }

        }


        // update if path doesn't exist or every 600 frames
        if (((block.levelPathfinder.path.length === 0 && frame % (50 + i) === 0) || (block.levelPathfinder.path.length > 0 && frame % (10 + i) === 0)) && !block.isFalling) {
          const playerPositionOnGround = {...playerPosition};
          if (this.isBlockEmpty(playerPosition.x, playerPosition.y + 1)) {
            playerPositionOnGround.y += 1;
          }
          block.updatePathToPlayer({
            start: blockPosition,
            end: playerPositionOnGround,
            level: this
          });
        }

        if (frame % 3 === 0 && block.levelPathfinder.path?.length) {
          // move closer to the player
          block.pathPosition++;
          const nextPosition = block.levelPathfinder.path[block.levelPathfinder.path.length - block.pathPosition];
          if (nextPosition) {
            this.moveBlock(blockPosition, nextPosition);
          }
        }
      }

      if (playerPosition[secondaryAxis] === enemiesPositions[i].location[secondaryAxis] && (
        playerPosition[axis] - GAME.enemyViewDistance <= enemiesPositions[i].location[axis] &&
        playerPosition[axis] + GAME.enemyViewDistance >= enemiesPositions[i].location[axis]
      )) {
        // player is in enemie's view
        const startPos = Math.min(playerPosition[axis], enemiesPositions[i].location[axis]);
        const endPos = Math.max(playerPosition[axis], enemiesPositions[i].location[axis]);
        let blocksEmpty = true;
        for (let axisI = startPos; axisI <= endPos; ++axisI) {
          if (axisI === enemiesPositions[i].location[axis]) continue;
          if (axisI === playerPosition[axis]) continue;
          if (!this.isBlockEmpty({
            [axis]: axisI,
            [secondaryAxis]: enemiesPositions[i].location[secondaryAxis]
          })) {
            blocksEmpty = false;
            break;
          }
        }
        if (blocksEmpty) {
          const direction = (playerPosition[axis] < enemiesPositions[i].location[axis]) ? GAME.direction.left : GAME.direction.right;
          enemiesPositions[i].location[axis] += direction;
          if (this.isBlockEmpty({
            [axis]: enemiesPositions[i].location[axis],
            [secondaryAxis]: enemiesPositions[i].location[secondaryAxis]
          })) {
            if (axis === 'x') {
              this.setBlock(direction === GAME.direction.left ? GAME.types.bulletLeft : GAME.types.bulletRight, enemiesPositions[i].location);
            } else if (axis === 'y') {
              this.setBlock(direction === GAME.direction.up ? GAME.types.bulletTop : GAME.types.bulletBottom, enemiesPositions[i].location);
            }
          }

        }
      }
    }
  }
}
