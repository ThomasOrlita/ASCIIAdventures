class Button extends Menu {
  constructor(canvasContext, width = 10, height = 3, text = '', topMargin = GAME.height / 2, leftMargin = 0, callback) {
    super(canvasContext);

    this.width = width;
    this.height = height;
    this.text = text;
    this.topMargin = topMargin;
    this.leftMargin = leftMargin;
    this.callback = callback;
    this.color = GAME.colors.button;
  }

  draw() {
    this.canvasContext.textBaseline = 'middle';
    this.canvasContext.textAlign = 'center';

    this.canvasContext.font = this.canvasFontWeight + ' ' + (this.canvasSmall ? this.canvasFontSize / 1.55 : this.canvasFontSize) + 'px ' + this.canvasFont;
    this.canvasContext.fillStyle = this.color;

    // top and bottom lines
    for (let x = -this.width; x <= this.width; ++x) {
      let xPx = (GAME.widthAfterTranslate / 2 + x * GAME.widthSize) + this.leftMargin;
      let yPx = this.topMargin;
      let yPx2 = yPx + this.height * GAME.heightSize;

      this.canvasContext.fillText('-', xPx, yPx);
      this.canvasContext.fillText('-', xPx, yPx2);
    }
    this.canvasContext.fillText(this.text, (GAME.widthAfterTranslate / 2) + this.leftMargin, this.topMargin + (this.height * GAME.heightSize) / 2);
    // top and bottom lines
    for (let y = 1; y <= this.height - 1; ++y) {
      let yPx = this.topMargin + y * GAME.heightSize;
      let xPx = (GAME.widthAfterTranslate / 2 + -this.width * GAME.widthSize) + this.leftMargin;
      let xPx2 = (GAME.widthAfterTranslate / 2 + this.width * GAME.widthSize) + this.leftMargin;

      this.canvasContext.fillText('|', xPx, yPx);
      this.canvasContext.fillText('|', xPx2, yPx);
    }
  }

  isMouseInside(x, y) {
    const x1 = (GAME.widthAfterTranslate / 2 + -this.width * GAME.widthSize) + this.leftMargin;
    const y1 = this.topMargin;
    const x2 = (GAME.widthAfterTranslate / 2 + this.width * GAME.widthSize) + this.leftMargin;
    const y2 = this.topMargin + (this.height) * 1.5 * GAME.heightSize;

    return (
      (x1 <= x) &&
      (x <= x2) &&
      (y1 <= y) &&
      (y <= y2)
    )
  }

  checkHovered(x, y) {
    if (this.isMouseInside(x, y)) {
      this.color = GAME.colors.buttonHovered;
    } else {
      this.color = GAME.colors.button;
    }
  }

  checkClicked(x, y) {
    if (this.isMouseInside(x, y)) {
      this.callback();
    }
  }
}
