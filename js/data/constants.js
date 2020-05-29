const GAME = {
  types: {
    player: 'o',
    playerBig: 'O',
    enemyHorizontal: 'Q',
    enemyVertical: 'K',
    enemyFollowing: 'S',
    air: ' ',
    invisible: '',
    solidBottom: '-',
    solidTop: '_',
    wall: '|',
    wallInvisible: 'I',
    wallLeft: ']',
    wallRight: '[',
    wallForward: '/',
    wallBackward: '\\',
    previousLevel: 'J',
    bulletLeft: '<',
    bulletRight: '>',
    bulletTop: '∧',
    bulletBottom: '∨',
    ridingBeltRight: ')',
    ridingBeltLeft: '(',
    ridingBeltForward: '{',
    ridingBeltBackward: '}',
    ridingBeltDot: '.',
    lava: 'W',
    ladder: 'H',
    spring: 'Z',
    extraBullet: '*',
    nextLevel: 'P',
    time: 't',
    power: 'z',
    balloon: 'q',
    diamond: 'v',
    life: '+',
  },
  typesAlt: {
    extraBullet: '➷',
    nextLevel: '🏁',
    time: '⌛',
    power: '⚡',
    balloon: '🎈',
    diamond: '💎',
    life: '❤'
  },
  direction: {
    left: -1,
    right: 1,
    up: -1,
    down: 1
  },
  colors: {
    default: '#fff',
    UI: '#fff',
    subtitle: '#ccc',
    player: {
      6: '#00acef',
      5: '#00acef',
      4: '#00b8ff',
      3: '#00b8ff',
      2: '#009ddb',
      1: '#0095ce',
    },
    bulletLeft: '#b76801',
    bulletRight: '#b76801',
    bulletTop: '#b76801',
    bulletBottom: '#b76801',
    nextLevel: '#caac00',
    ridingBeltRight: '#fff',
    ridingBeltBackward: '#fff',
    ridingBeltLeft: '#fff',
    ridingBeltForward: '#fff',
    ladder: '#795548',
    spring: '#018e01',
    life: '#ff0942',
    extraBullet: '#ffb300',
    lava: '#900606',
    power: '#f9c700',
    balloon: '#2196f3',
    diamond: '#00bcd4',
    time: '#cddc39',
    enemyHorizontal: {
      5: '#b71c1c',
      4: '#d32f2f',
      3: '#f44336',
      2: '#ef5350',
      1: '#e57373',
    },
    enemyVertical: {
      5: '#311b92',
      4: '#512da8',
      3: '#673ab7',
      2: '#7e57c2',
      1: '#9575cd',
    },
    enemyFollowing: {
      5: '#ff6f00',
      4: '#ff8f00',
      3: '#ffa000',
      2: '#ffb300',
      1: '#ffc107',
    },
    button: '#fff',
    buttonHovered: '#caac00'
  },
  pressedKeys: {},
  mouseClicked: false,
  mouseClickedPosition: {},
  mousePosition: {},
  stats: [
    {
      text: 'Blocks walked',
      name: 'blocksWalked'
    },
    {
      text: 'Block fallen',
      name: 'blocksFallen'
    },
    {
      text: 'Blocks walked on riding belts',
      name: 'blocksWalkedOnRidingBelts'
    },
    {
      text: 'Blocks jumped',
      name: 'jumped'
    },
    {
      text: 'Ladders climbed up',
      name: 'laddersClimbedUp'
    },
    {
      text: 'Ladders climbed down',
      name: 'laddersClimbedDown'
    },
    {
      text: 'Jumped on springs',
      name: 'jumpedOnSprings'
    },
    {
      text: 'Collected extra lifes',
      name: 'collectedExtraLifes'
    },
    {
      text: 'Collected extra bullets',
      name: 'collectedExtraBullets'
    },
    {
      text: 'Collected speed power-ups',
      name: 'collectedSpeedPowerUps'
    },
    {
      text: 'Arrows shot',
      name: 'arrowsShot'
    },
    {
      text: 'Enemies hit',
      name: 'enemiesHit'
    },
    {
      text: 'Got hit',
      name: 'gotHit'
    },
    {
      text: 'Died',
      name: 'died'
    },
  ],
  selectedView: 'mainMenu',
  selectedViewPrevious: null,
  width: 1920,
  height: 1080,
  enemyViewDistance: 20,
  worldWidth: 64,
  worldHeight: 32,
  bleedSize: 64,
  canvasScale: 1.5,
  widthSize: 10,
  heightSize: 15,
  startingLives: 5,
  currentLevel: 0,
  frame: 0,
  customLevelTemplatePrefix: 'ASCIIAdventures1.0',
  isPreview: false,
  deathTemplate: ' __     __               _ _          _         __\r\n \\ \\   \/ \/              | (_)        | |   _   \/ \/\r\n  \\ \\_\/ \/__  _   _    __| |_  ___  __| |  (_) | | \r\n   \\   \/ _ \\| | | |  \/ _\` | |\/ _ \\\/ _\` |      | | \r\n    | | (_) | |_| | | (_| | |  __\/ (_| |   _  | | \r\n    |_|\\___\/ \\__,_|  \\__,_|_|\\___|\\__,_|  (_) | | \r\n                                               \\_\\\r\n',
  finishTemplate: `
Congratulations!

You finished
the last level.
  `,
  aboutTemplate: `
  ----------------
  ASCII Adventures
  ----------------
  
  Beta version
  Made by Thomas Orlita
  2019–2020
  `
};
GAME.incrementStat = name =>
  localStorage.setItem(name, (parseInt(localStorage.getItem(name)) || 0) + 1);
GAME.exitPreview = () => window.parent.postMessage('exit', '*');
