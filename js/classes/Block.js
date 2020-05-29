class Block {
  constructor(type = GAME.types.air) {
    this.type = type;
  }

  setType(type) {
    this.type = type;
  }
}
