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
      if (x < 0 || y < 0 || x >= GAME.worldWidth || y >= GAME.worldHeight) return ' ';

      return levelRows[y][x]
    }

    for (let x = offset; x < offset + GAME.worldWidth; x++) {
      // All noise functions return values in the range of -1 to 1.

      let previousValue = noise.simplex2((x - 1) * xStep, lastNoiseY);
      let previousY = lastY;
      let value = noise.simplex2(x * xStep, lastNoiseY);
      let diff = value - previousValue;

      //console.log(diff);
      let nextBlock = '_';

      if (diff < -diffThreshold) {
        // climbing down
        lastY++;
        lastNoiseY += yStep;
        nextBlock = 'l';

        if (getBlock(x - offset - 1, previousY) === '/') {
          levelRows[previousY][x - offset - 1] = '_';
        }
      } else if (diff >= -diffThreshold && diff <= diffThreshold) {
        // going straight
        if (getBlock(x - offset - 1, previousY) === '/') {
          levelRows[previousY][x - offset - 1] = '_';
        }
      } else {
        // climbing up
        lastY--;
        lastNoiseY -= yStep;
        nextBlock = '/';

        if (getBlock(x - offset - 1, previousY) === 'l') {
          levelRows[previousY][x - offset - 1] = ' ';
          levelRows[previousY - 1][x - offset - 1] = '_';
        }
        if (getBlock(x - offset - 1, previousY) === '_') {
          lastY += 1;
        }
      }
      if (lastY >= GAME.worldHeight || lastY < 0) {

      } else {

        levelRows[lastY][x - offset] = nextBlock;
      }

    }

    levelRows[1][1] = 'o';

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
