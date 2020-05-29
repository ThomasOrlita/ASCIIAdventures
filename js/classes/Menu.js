class Menu {
  constructor(canvasContext) {
    this.canvasContext = canvasContext;

    this.canvasFontSize = 16;
    this.canvasFont = '\'BPdots Squares Bold\', monospace';
    this.canvasContext.font = this.canvasFontSize + 'px ' + this.canvasFont;
    this.canvasFontWeight = 400;
    this.canvasSmall = false;
    this.buttons = [];
  }

  draw() {
    this.canvasContext.clearRect(0, 0, GAME.width, GAME.height);

    for (const button of this.buttons) {
      button.draw();

      button.checkHovered(GAME.mousePosition.x / GAME.canvasScale, GAME.mousePosition.y / GAME.canvasScale);
      if (GAME.mouseClicked) {
        button.checkClicked(GAME.mousePosition.x / GAME.canvasScale, GAME.mousePosition.y / GAME.canvasScale);
      }
    }
  }
}