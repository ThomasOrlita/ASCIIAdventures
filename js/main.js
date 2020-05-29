const gameHistory = [];
let useConsole = false;

if (window.location.hash.startsWith('#PreviewLevel')) {
  GAME.isPreview = true;
}

const canvas = document.getElementById('canvas');
const backdrop = document.getElementById('backdrop');

const gameController = new GameController(canvas, backdrop);

let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(gameController.resize, 100);
});

gameController.game.setLevel(GAME.levels[0]);

// FOR DEBUGGING
const game = gameController.game;

console.log('*'.repeat(80));
console.log('    Do you want to play the game in the console? Just set `useConsole=true`');
console.log('    Or change lives? `game.lives=20`');
console.log('    Or fly? `game.jumpingDist=1000`');
console.log('*'.repeat(80));
