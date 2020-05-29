class LevelGenerator {
  static generateLevel(lastY = Math.round(GAME.worldHeight / 2), offset = 1, seed = 0 /*Math.random()*/) {
    noise.seed(seed);
    offset *= GAME.worldWidth;
    let levelRows = Array.from(Array(GAME.worldHeight), () => (new Array(GAME.worldWidth)).fill(' '));
    let lastNoiseY = lastY;

    let diffThreshold = 0.05; // between 0-0.5, smaller=make height changes more often
    let yStep = 0.5; // smaller=sharper hills
    let xStep = 0.1; // smaller=smoother from left to right

    function getBlock(x, y) {
      if (x < 0 || y < 0 || x >= GAME.worldWidth || y >= GAME.worldHeight) return GAME.types.air;

      return levelRows[y][x]
    }

    for (let x = offset; x < offset + GAME.worldWidth; x++) {
      // All noise functions return values in the range of -1 to 1.

      let previousValue = noise.simplex2((x - 1) * xStep, lastNoiseY);
      let previousY = lastY;
      let value = noise.simplex2(x * xStep, lastNoiseY);
      let diff = value - previousValue;

      let nextBlock = GAME.types.solidTop;

      if (diff < -diffThreshold) {
        // climbing down
        lastY++;
        lastNoiseY += yStep;
        nextBlock = GAME.types.wallBackward;

        if (getBlock(x - offset - 1, previousY) === GAME.types.wallForward) {
          levelRows[previousY][x - offset - 1] = GAME.types.solidTop;
        }
      } else if (diff >= -diffThreshold && diff <= diffThreshold) {
        // going straight
        if (getBlock(x - offset - 1, previousY) === GAME.types.wallForward) {
          levelRows[previousY][x - offset - 1] = GAME.types.solidTop;
        }
      } else {
        // climbing up
        lastY--;
        lastNoiseY -= yStep;
        nextBlock = GAME.types.wallForward;

        if (getBlock(x - offset - 1, previousY) === GAME.types.wallBackward) {
          levelRows[previousY][x - offset - 1] = ' ';
          levelRows[previousY - 1][x - offset - 1] = GAME.types.solidTop;
        }
        if (getBlock(x - offset - 1, previousY) === GAME.types.solidTop) {
          lastY += 1;
        }
      }
      if (lastY >= GAME.worldHeight || lastY < 0) {

      } else {

        levelRows[lastY][x - offset] = nextBlock;
      }

    }

    levelRows[1][1] = GAME.types.player;

    let levelString = '';
    for (let y = 0; y < levelRows.length; ++y) {
      levelString += levelRows[y].join('') + '\n';
    }

    return {
      template: levelString,
      lastY
    };
  }

}
