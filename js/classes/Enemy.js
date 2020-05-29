class Enemy extends Block {
  constructor(type = GAME.types.enemyHorizontal) {
    super(type);
    this.lives = 3;
  }

  gotHit() {
    GAME.incrementStat('enemiesHit');
    this.lives--;
    if (this.lives <= 0) this.die();
  }

  die() {
    GAME.incrementStat('enemiesKilled');
    this.setType(GAME.types.air);
  }
}
