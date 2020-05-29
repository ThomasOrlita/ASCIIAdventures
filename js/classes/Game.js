class Game {
  constructor(canvasContext) {
    this.canvasContext = canvasContext;
    this.isJumping = false;
    this.isFalling = false;
    this.isOnLadderPrevious = false;
    this.isOnLadder = false;
    this.lives = GAME.startingLives;
    this.arrows = 10;
    this.arrowsAddSpeed = 1;
    this.maxArrows = 20;
    this.jumpingDist = 0;
    this.fastSpeed = 0;
    this.xDirection = GAME.direction.right;

    this.canvasFontSize = 16;
    this.canvasFont = '\'BPdots Squares Bold\', monospace';
    this.canvasContext.font = this.canvasFontSize + 'px ' + this.canvasFont;
    this.canvasFontWeight = 400;
    this.canvasSmall = false;

  }

  setLevel(level) {
    this.level = level;
    this.level.setPlayerPosition(level.spawnPosition);
  }

  draw(update = true) {
    this.canvasContext.clearRect(0, 0, GAME.width, GAME.height);
    this.canvasContext.fillStyle = GAME.colors.UI;

    if (update) {
      if (this.arrows < this.maxArrows && GAME.frame % Math.min(Math.max(this.maxArrows + 10 - this.arrowsAddSpeed - this.arrows, 5), 60) === 0) {
        this.arrows++;
        if (this.arrowsAddSpeed > 1) {
          this.arrowsAddSpeed--;
        }
      }

      this.level.updateBullets();
      this.level.updateEnemies(GAME.frame);

      if (this.level.playerHit) {
        GAME.incrementStat('gotHit');

        if (!this.playerHitProtection) {
          setTimeout(() => {
            this.playerHitProtection = false;
          }, 1000);
          this.lives--;
        }

        if (this.lives === 0) {
          GAME.incrementStat('died');
        }

        this.level.playerHit = false;

        this.playerHitProtection = true;
      }

      if (this.fastSpeed > 0) {
        this.fastSpeed--;
      }

    }
    let levelRows = '';

    this.canvasContext.textAlign = 'left';

    this.canvasFontSize = 16;
    this.canvasFont = '\'BPdots Squares Bold\', monospace';
    this.canvasContext.font = this.canvasFontSize + 'px ' + this.canvasFont;
    this.canvasFontWeight = 400;

    this.canvasContext.fillStyle = GAME.colors.life;
    this.canvasContext.fillText('LIVES: ' + GAME.typesAlt.life.repeat(this.lives), 45, 30);
    this.canvasContext.fillStyle = GAME.colors.extraBullet;
    this.canvasContext.fillText('ARROWS: ' + GAME.types.bulletRight.repeat(this.arrows), 45, 50);

    this.canvasContext.fillStyle = GAME.colors.UI;

    const getKeyByValue = (object, value) => Object.keys(object).find(key => object[key] === value);

    for (let y = 0; y < this.level.levelData.length; ++y) {
      for (let x = 0; x < this.level.levelData[y].length; ++x) {
        const blockValueOriginal = this.level.getBlockValue(x, y);
        const typeName = getKeyByValue(GAME.types, blockValueOriginal);

        let blockValue = GAME.typesAlt[typeName] ? GAME.typesAlt[typeName] : blockValueOriginal;
        levelRows += blockValue;

        let color = GAME.colors[typeName] || GAME.colors.default;
        let xPx = GAME.bleedSize + (x * GAME.widthSize);
        let yPx = GAME.bleedSize + (y * GAME.heightSize);

        this.canvasContext.font = this.canvasFontWeight + ' ' + this.canvasFontSize + 'px ' + this.canvasFont;

        switch (blockValueOriginal) {
          case GAME.types.player:

            this.canvasContext.fillStyle = GAME.colors.ladder;
            if (this.isOnLadder) {
              this.canvasContext.fillText(GAME.types.ladder, xPx, yPx);
              if ([GAME.types.air, GAME.types.ladder].includes(this.level.getBlockValue(x, y + 1))) {
                this.canvasContext.fillText(GAME.types.ladder, xPx, yPx + 8);
              }
            }
            xPx -= 2;
            yPx += 2;
            if (this.lives === 1) {
              this.canvasFontWeight = 300;
            } else if (this.lives === 2) {
              this.canvasFontWeight = 400;
            } else if (this.lives === 3) {
              this.canvasFontWeight = 600;
            } else if (this.lives > 3) {
              this.canvasFontWeight = 700;
              blockValue = GAME.types.playerBig;
            }

            color = GAME.colors.player[this.lives < 4 ? this.lives : 4];

            const blockBelow = this.level.getBlockValue(x, y + 1);
            if ([GAME.types.wallForward, GAME.types.ridingBeltForward].includes(blockBelow)) {
              xPx -= 6;
            } else if ([GAME.types.wallBackward, GAME.types.ridingBeltBackward].includes(blockBelow)) {
              xPx += 6;
            }
            break;
          case GAME.types.solidTop:
            if (this.level.levelData[y][x].textValue) {
              blockValue = this.level.levelData[y][x].textValue;
            } else {
              yPx -= 10;
              xPx -= 0;
            }
            break;
          case GAME.types.solidBottom:
            yPx += 2;
            xPx -= 0;
            blockValue = GAME.types.solidTop;
            break;
          case GAME.types.ladder:
            this.canvasContext.fillStyle = GAME.colors.ladder;
            this.canvasContext.fillText(GAME.types.ladder, xPx, yPx);
            if ([GAME.types.air, GAME.types.ladder, GAME.types.player].includes(this.level.getBlockValue(x, y + 1))) {
              yPx += 8;
            }
            break;
          case GAME.types.wall:
            xPx -= 0;
            yPx -= 0;
            this.canvasSmall = true;
            break;
          case GAME.types.wallInvisible:
            blockValue = GAME.types.invisible;
            break;
          case GAME.types.wallLeft:
            xPx += 7;
            yPx -= 0;
            this.canvasSmall = true;
            blockValue = GAME.types.wall;
            break;
          case GAME.types.wallRight:
            xPx -= 4;
            yPx += 0;
            this.canvasSmall = true;
            blockValue = GAME.types.wall;
            break;
          case GAME.types.wallForward:
            xPx += 0;
            yPx -= 11;
            break;
          case GAME.types.wallBackward:
            xPx -= 0;
            yPx -= 11;
            break;
          case GAME.types.ridingBeltRight:
            yPx -= 10;
            xPx -= 0;

            color = GAME.colors.ridingBeltRight;
            this.canvasContext.fillStyle = color;
            this.canvasContext.fillText(GAME.types.ridingBeltDot, xPx - 5 + (GAME.frame / 4 % 3) * 4, yPx);
            blockValue = GAME.types.solidTop;
            break;
          case GAME.types.ridingBeltForward:
            xPx += 0;
            yPx -= 11;

            color = GAME.colors.ridingBeltForward;
            this.canvasContext.fillStyle = color;
            this.canvasContext.fillText(GAME.types.ridingBeltDot, xPx + 2 - (GAME.frame / 4 % 3) * 3, yPx - 10 + (GAME.frame / 4 % 3) * 4);

            blockValue = GAME.types.wallForward;
            break;
          case GAME.types.ridingBeltLeft:
            yPx -= 10;
            xPx -= 0;

            color = GAME.colors.ridingBeltLeft;
            this.canvasContext.fillStyle = color;
            this.canvasContext.fillText(GAME.types.ridingBeltDot, xPx + 5 - (GAME.frame / 4 % 3) * 4, yPx);
            blockValue = GAME.types.solidTop;
            break;
          case GAME.types.ridingBeltBackward:
            xPx -= 0;
            yPx -= 11;

            color = GAME.colors.ridingBeltBackward;
            this.canvasContext.fillStyle = color;
            this.canvasContext.fillText(GAME.types.ridingBeltDot, xPx + (GAME.frame / 4 % 3) * 3, yPx - 10 + (GAME.frame / 4 % 3) * 4);

            blockValue = GAME.types.wallBackward;
            break;
          case GAME.types.enemyHorizontal:
            color = GAME.colors.enemyHorizontal[this.level.getBlock(x, y).lives];
            break;
          case GAME.types.enemyVertical:
            color = GAME.colors.enemyVertical[this.level.getBlock(x, y).lives];
            break;
          case GAME.types.enemyFollowing:
            color = GAME.colors.enemyFollowing[this.level.getBlock(x, y).lives];
            break;
          case GAME.types.life:
            this.canvasSmall = true;
            break;
          case GAME.types.balloon:
            this.canvasSmall = true;
            break;
          case GAME.types.diamond:
            this.canvasSmall = true;
            break;
          case GAME.types.time:
            this.canvasSmall = true;
            break;
          case GAME.types.power:
            this.canvasSmall = true;
            break;
          case GAME.types.spring:
            const blockAbove = this.level.getBlockValue(x, y - 1);
            let springTopOffset = 12;
            if (blockAbove === GAME.types.player) {
              springTopOffset -= 1;
            }

            color = GAME.colors.spring;
            this.canvasContext.fillStyle = color;
            this.canvasContext.fillText(GAME.types.solidTop, xPx, yPx - springTopOffset);
            xPx -= 1;
            yPx += 2;
            break;
        }
        // don't update if they haven't changed (performance)
        this.canvasContext.fillStyle = color;
        this.canvasContext.font = this.canvasFontWeight + ' ' + (this.canvasSmall ? this.canvasFontSize / 1.25 : this.canvasFontSize) + 'px ' + this.canvasFont;
        this.canvasContext.fillText(blockValue, xPx, yPx);

        this.canvasFontWeight = 400;
        this.canvasSmall = false;
      }
      levelRows += '\n';
    }

    if (this.level.customText) {
      this.canvasContext.fillStyle = GAME.colors.UI;
      this.canvasContext.textBaseline = 'middle';
      this.canvasContext.textAlign = 'left';

      const customTextLines = this.level.customText.text.split('\n');
      for (let i = 0; i < customTextLines.length; i++) {
        this.canvasContext.fillText(customTextLines[i], this.level.customText.position.x, this.level.customText.position.y + (i * 20));
      }
    }

    const subtitleStyle = () => {
      this.canvasContext.fillStyle = GAME.colors.subtitle;
      this.canvasContext.textBaseline = 'middle';
      this.canvasContext.textAlign = 'left';
      this.canvasContext.font = '0.7em ' + this.canvasFont;
    };

    if (this.level.title) {
      subtitleStyle();
      this.canvasContext.fillText('Level name: ' + this.level.title, 25, GAME.height - 20);
    }
    if (this.jumpingDist > 9) {
      subtitleStyle();
      this.canvasContext.textAlign = 'right';
      this.canvasContext.fillText('Flying: ' + Math.floor(this.jumpingDist / 10) + ' s', GAME.width - 25, GAME.height - 20);
    }

    if (useConsole) {
      console.info('\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n');
      console.info('LIVES: ' + '❤'.repeat(this.lives));
      console.info('ARROWS: ' + '>'.repeat(this.arrows));
      console.info('\n\n\n');
      console.info(levelRows);
    }
    gameHistory.push(levelRows);

  }

  playerWalk(direction = GAME.direction.right, onRidingBelt = false) {
    this.xDirection = direction;
    let playerPosition = this.level.getPlayerPosition();
    const nextPosition = {
      x: playerPosition.x + direction,
      y: playerPosition.y
    };

    if (this.checkBlock(nextPosition)) return;
    if (this.level.isBlockEmpty(nextPosition) || this.level.getBlockValue(nextPosition) === GAME.types.ladder) {
      playerPosition.x += direction;
      if (onRidingBelt) {
        GAME.incrementStat('blocksWalkedOnRidingBelts');
      } else {
        GAME.incrementStat('blocksWalked');
      }
    }
    this.setPlayerPosition(playerPosition);
    this.isOnLadderPrevious = this.isOnLadder;
  }

  playerMove(direction = GAME.direction.down) {
    let playerPosition = this.level.getPlayerPosition();
    playerPosition.y += direction;

    if (this.checkBlock(playerPosition.x, playerPosition.y)) return;
    this.setPlayerPosition(playerPosition);
    this.isOnLadderPrevious = this.isOnLadder;
  }

  jump() {
    if (this.isFalling || this.isJumping) {
      if (this.jumpingDist <= 0)
        return;
    }

    const playerPosition = this.level.getPlayerPosition();

    if (this.isOnSpring && this.jumpingDist > 1) {
      if (!this.level.isBlockWalkable(playerPosition.x, playerPosition.y + 1)) return;
    }

    if (!this.level.isBlockWalkable(playerPosition.x, playerPosition.y - 1)) return;
    if (this.level.getBlockValue(playerPosition.x, playerPosition.y - 1) === GAME.types.ladder) {
      GAME.incrementStat('laddersClimbedUp');
    } else {
      GAME.incrementStat('jumped');
    }
    this.isJumping = true;
    game.playerMove(GAME.direction.up);
    setTimeout(() => {
      this.isJumping = false;
    }, 250);
  }

  goDown() {
    if (this.isFalling) return;

    const playerPosition = this.level.getPlayerPosition();

    if (!this.level.isBlockWalkable(playerPosition.x, playerPosition.y + 1)) return;

    if (this.level.getBlockValue(playerPosition.x, playerPosition.y - 1) === GAME.types.ladder) {
      GAME.incrementStat('laddersClimbedDown');
    }

    game.playerMove(GAME.direction.down);
  }

  applyGravity() {
    if (this.isJumping) return;
    let playerPosition = this.level.getPlayerPosition();
    if (this.level.isBlockEmpty(playerPosition.x, playerPosition.y + 1)) {

      this.isFalling = true;
      GAME.incrementStat('blocksFallen');

      if (this.jumpingDist > 0) {
        this.isFalling = false;
        this.jumpingDist--;
      }

      this.playerMove(GAME.direction.down);
    } else {

      this.jumpingDist--;
      this.isFalling = false;
    }
  }

  updateRidingBelts() {
    let playerPosition = this.level.getPlayerPosition();
    if ([GAME.types.ridingBeltRight, GAME.types.ridingBeltBackward].includes(this.level.getBlockValue(playerPosition.x, playerPosition.y + 1))) {
      this.playerWalk(GAME.direction.right, true);
    } else if ([GAME.types.ridingBeltLeft, GAME.types.ridingBeltForward].includes(this.level.getBlockValue(playerPosition.x, playerPosition.y + 1))) {
      this.playerWalk(GAME.direction.left, true);
    }

  }

  checkBlock(x, y) {
    if (y === undefined) {
      y = x.y;
      x = x.x;
    }

    let playerPosition = this.level.getPlayerPosition();

    let specialBlock = false;

    const block = this.level.getBlockValue(x, y);

    if (y + 1 >= GAME.worldHeight || (this.level.isBlockEmpty(x, y) && this.level.getBlockValue(x, y + 1) === GAME.types.lava)) {
      this.lives--;
      this.setPlayerPosition(this.level.spawnPosition);
      return true;
    }


    switch (block) {
      case GAME.types.life:
        this.level.setBlock(GAME.types.air, {
          x,
          y
        });
        this.lives++;
        GAME.incrementStat('collectedExtraLifes');
        break;
      case GAME.types.extraBullet:
        this.level.setBlock(GAME.types.air, {
          x,
          y
        });
        this.arrowsAddSpeed = 40;
        GAME.incrementStat('collectedExtraBullets');
        break;
      case GAME.types.nextLevel:
        specialBlock = true;
        if (GAME.isPreview) {
          GAME.exitPreview();
        } else {
          if (GAME.levels[this.level.index + 1]) {
            this.setLevel(GAME.levels[this.level.index + 1]);
          } else {
            GAME.selectedView = 'finishScreen';
          }
        }
        break;
      case GAME.types.previousLevel:
        specialBlock = true;
        this.setLevel(GAME.levels[this.level.index - 1]);
        break;
      case GAME.types.ladder:
        this.isOnLadder = true;
        break;
      case GAME.types.power:
        this.level.setBlock(GAME.types.air, {
          x,
          y
        });
        this.fastSpeed += 50;
        GAME.incrementStat('collectedSpeedPowerUps');

        break;
      case GAME.types.balloon:
        this.level.setBlock(GAME.types.air, {
          x,
          y
        });
        this.jumpingDist = 205;

        break;
    }

    if (this.level.getBlockValue(x, y + 1) === GAME.types.spring) {
      if (this.isFalling) {
        this.isFalling = false;
        if (this.jumpingDist < 10) this.jumpingDist = 4;
      }
      this.isOnSpring = true;
      GAME.incrementStat('jumpedOnSprings');
    } else {
      this.isOnSpring = false;
    }
    return specialBlock;
  }

  shoot() {
    if (this.arrows <= 0) return;
    let playerPosition = this.level.getPlayerPosition();
    playerPosition.x += this.xDirection;
    if (this.level.isBlockEmpty(playerPosition.x, playerPosition.y)) {
      GAME.incrementStat('arrowsShot');
      this.arrows--;
      this.level.setBlock(this.xDirection === GAME.direction.left ? GAME.types.bulletLeft : GAME.types.bulletRight, playerPosition);
    }
  }

  updateLadders(position) {
    const playerPosition = this.level.getPlayerPosition();
    if (!this.isOnLadderPrevious) return;
    if (playerPosition.x === position.x && playerPosition.y === position.y) return;
    if (this.isOnLadder) {
      this.level.setBlock(GAME.types.ladder, playerPosition);
    }
    // next block is not a ladder
    if (this.level.getBlockValue(position) !== GAME.types.ladder) {
      this.isOnLadder = false;
    }

  }

  setPlayerPosition(position) {
    this.updateLadders(position);
    this.level.setPlayerPosition(position);
  }
}
