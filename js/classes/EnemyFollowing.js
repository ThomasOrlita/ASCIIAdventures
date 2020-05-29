class EnemyFollowing extends Enemy {
  constructor(type = GAME.types.enemyFollowing) {
    super(type);
    this.levelPathfinder = new LevelPathfinder();
    this.pathPosition = 0;
    this.isFalling = false;
    this.lives = 5;
  }

  updatePathToPlayer({start, end, level}) {
    this.levelPathfinder.findPath({start, end, level});
    this.pathPosition = 0;
  }
}
