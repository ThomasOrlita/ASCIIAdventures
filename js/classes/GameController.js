class GameController {
  resize() {
    if (document.body.clientWidth < 420 || document.body.clientHeight < 320) {
      GAME.canvasScale = 0.2;
    } else if (document.body.clientWidth < 500 || document.body.clientHeight < 400) {
      GAME.canvasScale = 0.6;
    } else if (document.body.clientWidth < 600 || document.body.clientHeight < 500) {
      GAME.canvasScale = 0.65;
    } else if (document.body.clientWidth < 750 || document.body.clientHeight < 600) {
      GAME.canvasScale = 0.75;
    } else if (document.body.clientWidth < 880 || document.body.clientHeight < 875) {
      GAME.canvasScale = 0.85;
    } else if (document.body.clientWidth < 1064 || document.body.clientHeight < 930) {
      GAME.canvasScale = 1;
    } else {
      GAME.canvasScale = 1.5;
    }

    const width = (GAME.worldWidth * GAME.widthSize * GAME.canvasScale) + GAME.bleedSize * 2;
    const height = (GAME.worldHeight * GAME.heightSize * GAME.canvasScale) + GAME.bleedSize * 2;

    this.canvas.width = width * window.devicePixelRatio;
    this.canvas.height = height * window.devicePixelRatio;
    this.canvas.style.width = width + 'px';
    this.canvas.style.height = height + 'px';
    this.backdrop.style.width = width + 'px';
    this.backdrop.style.height = height + 'px';

    GAME.width = width / GAME.canvasScale;
    GAME.height = height / GAME.canvasScale;

  }

  constructor(canvas, backdrop) {
    this.canvas = canvas;
    this.backdrop = backdrop;
    this.resize();

    const canvasContext = canvas.getContext('2d');

    this.game = new Game(canvasContext);
    this.menu = new Menu(canvasContext);
    const menuTopOffset = 100;
    this.menu.buttons =
      [
        new Button(canvasContext, 10, 3, 'Start game', (GAME.height / 2) - 150 + menuTopOffset, 0, () => {
          GAME.selectedView = 'levelSelectScreen';
        }),
        new Button(canvasContext, 10, 3, 'Level editor', (GAME.height / 2) - 75 + menuTopOffset, 0, () => {
          GAME.selectedView = 'levelEditor';
        }),
        new Button(canvasContext, 10, 3, 'Stats', (GAME.height / 2) + 0 + menuTopOffset, 0, () => {
          GAME.selectedView = 'stats';
        }),
        new Button(canvasContext, 10, 3, 'About', (GAME.height / 2) + 75 + menuTopOffset, 0, () => {
          GAME.selectedView = 'aboutScreen';
        }),
      ];
    this.menu.mainMenuImage = new Image();
    this.menu.mainMenuImage.src = 'https://cdn.img.onl/asciiadventures/logo_big.png';


    this.levelSelectScreenMenu = new Menu(canvasContext);
    this.levelSelectScreenMenu.buttons =
      [
        new Button(canvasContext, 7, 3, 'Main menu', (GAME.height / 2) + 125, 0, () => {
          GAME.selectedView = 'mainMenu';
        }),
      ];


    for (const level in GAME.levels) {
      const columns = 3;
      const levelNumber = GAME.levels[level].index + 1;
      const leftMargin = levelNumber % columns === 0 ? 150 : (levelNumber - 1) % columns === 0 ? -150 : 0;


      this.levelSelectScreenMenu.buttons.push(
        new Button(canvasContext, 6, 3, 'Level ' + levelNumber, Math.ceil(levelNumber / columns) * 75 + (GAME.height / 2) - 275, leftMargin, () => {
          gameController.game.setLevel(GAME.levels[level]);
          GAME.selectedView = 'game';
          this.game.lives = GAME.startingLives;
        })
      )
    }

    this.statsMenu = new Menu(canvasContext);
    this.statsMenu.buttons =
      [
        new Button(canvasContext, 7, 3, 'Back', (GAME.height / 2) + 150, -140, () => {
          GAME.selectedView = 'mainMenu';
        }),
        new Button(canvasContext, 7, 3, 'Reset stats', (GAME.height / 2) + 150, 140, () => {
          localStorage.clear();
          this.statsMenu.buttons[1].text = 'Stats cleared';
        }),
      ];

    this.deathScreenMenu = new Menu(canvasContext);
    this.deathScreenMenu.buttons =
      [
        new Button(canvasContext, 7, 3, 'Main menu', (GAME.height / 2) + 25, -100, () => {
          GAME.selectedView = 'mainMenu';
          this.game.lives = GAME.startingLives;
        }),
        new Button(canvasContext, 7, 3, 'Play again', (GAME.height / 2) + 25, 100, () => {
          GAME.selectedView = 'game';
          this.game.lives = GAME.startingLives;
          this.game.level.setPlayerPosition(this.game.level.spawnPosition);
        }),
      ];

    this.finishScreenMenu = new Menu(canvasContext);
    this.finishScreenMenu.buttons =
      [
        new Button(canvasContext, 12, 3, 'Main menu', (GAME.height / 2) + 5, 0, () => {
          GAME.selectedView = 'mainMenu';
          this.game.lives = GAME.startingLives;
        }),
        new Button(canvasContext, 12, 3, 'Create your own level', (GAME.height / 2) + 75, 0, () => {
          GAME.selectedView = 'levelEditor';
        }),
        new Button(canvasContext, 12, 3, 'About ASCII Adventures', (GAME.height / 2) + 75 + 70, 0, () => {
          GAME.selectedView = 'aboutScreen';
        }),
      ];


    this.aboutScreenMenu = new Menu(canvasContext);
    this.aboutScreenMenu.buttons =
      [
        new Button(canvasContext, 7, 3, 'Back', (GAME.height / 2) + 125, -195, () => {
          GAME.selectedView = 'mainMenu';
        }),
        new Button(canvasContext, 7, 3, 'GitHub', (GAME.height / 2) + 125, -15, () => {
          window.open('https://github.com/ThomasOrlita/ASCIIAdventures', '_blank').focus();
        }),
        new Button(canvasContext, 10, 3, 'Author\'s website', (GAME.height / 2) + 125, 190, () => {
          window.open('https://thomasorlita.com', '_blank').focus();
        }),
      ];

    // todo use requestAnimationFrame
    setInterval(() => {
      this.tick();
    }, 25);

    const getCursorPosition = (canvas, e) => {
      const rect = canvas.getBoundingClientRect();
      return {x: e.clientX - rect.left, y: e.clientY - rect.top}
    };

    canvas.addEventListener('mousedown', e => {
      // enable only left click
      if (e.which !== 1) return;
      GAME.mouseClicked = true;
      GAME.mouseClickedPosition = getCursorPosition(canvas, e);
    });

    document.addEventListener('keydown', (event) => {
      GAME.pressedKeys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
      GAME.pressedKeys[event.key] = false;
    });

    const onMouseUpdate = e => {
      const rect = canvas.getBoundingClientRect();
      GAME.mousePosition.x = e.pageX - rect.left;
      GAME.mousePosition.y = e.pageY - rect.top;
    };

    document.addEventListener('mousemove', onMouseUpdate, false);
    document.addEventListener('mouseenter', onMouseUpdate, false);

    const controls = document.querySelectorAll('.control-button');
    controls.forEach(btn => {
      btn.ontouchstart = () => {
        const el = document.documentElement,
          rfs = el.requestFullscreen
            || el.webkitRequestFullScreen
            || el.mozRequestFullScreen
            || el.msRequestFullscreen
        ;

        rfs.call(el);
        if (btn.dataset.key === 'ArrowUpLeft') {
          GAME.pressedKeys.ArrowUp = true;
          GAME.pressedKeys.ArrowLeft = true;
        } else if (btn.dataset.key === 'ArrowUpRight') {
          GAME.pressedKeys.ArrowUp = true;
          GAME.pressedKeys.ArrowRight = true;
        } else {
          GAME.pressedKeys[btn.dataset.key] = true;
        }
      };
      btn.ontouchend = () => {
        setTimeout(() => {
          if (btn.dataset.key === 'ArrowUpLeft') {
            GAME.pressedKeys.ArrowUp = false;
            GAME.pressedKeys.ArrowLeft = false;
          } else if (btn.dataset.key === 'ArrowUpRight') {
            GAME.pressedKeys.ArrowUp = false;
            GAME.pressedKeys.ArrowRight = false;
          } else {
            GAME.pressedKeys[btn.dataset.key] = false;
          }
        }, 30);

      };
    })

  }

  tick() {
    GAME.frame++;

    GAME.width = this.canvas.clientWidth / GAME.canvasScale;
    GAME.height = this.canvas.clientHeight / GAME.canvasScale;

    GAME.widthAfterTranslate = GAME.width;
    GAME.heightAfterTranslate = GAME.height;

    const canvasContext = this.canvas.getContext('2d');

    canvasContext.save();
    canvasContext.scale(window.devicePixelRatio * GAME.canvasScale, window.devicePixelRatio * GAME.canvasScale);

    if (this.game.lives <= 0) {
      GAME.selectedView = 'deathScreen';
    }

    switch (GAME.selectedView) {
      case 'mainMenu':

        window.location.hash = 'Menu';
        this.menu.draw();
        if (this.menu.mainMenuImage) {
          canvasContext.drawImage(this.menu.mainMenuImage, GAME.width / 2 - 300 / 2, 0, 300, 300 * this.menu.mainMenuImage.height / this.menu.mainMenuImage.width);
        }
        break;

      case 'levelSelectScreen':
        window.location.hash = 'LevelSelect';
        this.levelSelectScreenMenu.draw();
        break;

      case 'levelEditor':
        if (!window.location.hash.includes('LevelEditor')) window.location.hash = 'LevelEditor';

        canvasContext.clearRect(0, 0, GAME.width, GAME.height);
        document.getElementById('level_editor').classList.add('show');
        document.getElementById('backdrop').classList.add('full');
        document.getElementById('controls_main').classList.add('hide');
        document.getElementById('controls_extra').classList.add('hide');

        break;

      case 'stats':
        window.location.hash = 'Stats';
        const stats = GAME.stats;

        this.statsMenu.draw();
        canvasContext.fillStyle = GAME.colors.UI;
        canvasContext.textBaseline = 'middle';
        canvasContext.textAlign = 'left';

        let i = 0;
        for (const stat in stats) {
          canvasContext.fillText(stats[stat].text + ': ' + (localStorage.getItem(stats[stat].name) || 0), 150, 50 + i * 20);
          i++;
        }

        break;

      case 'deathScreen':
        window.location.hash = '';
        this.deathScreenMenu.draw();
        canvasContext.fillStyle = GAME.colors.UI;
        const deathTemplateLines = GAME.deathTemplate.split('\n');

        canvasContext.textBaseline = 'middle';
        canvasContext.textAlign = 'left';
        for (let i = 0; i < deathTemplateLines.length; i++) {
          canvasContext.fillText(deathTemplateLines[i], 120, 120 + (i * 20));
          canvasContext.fillText(deathTemplateLines[i], 124, 120 + (i * 20));
        }

        break;

      case 'finishScreen':
        window.location.hash = '';
        this.finishScreenMenu.draw();
        canvasContext.fillStyle = GAME.colors.UI;
        const finishTemplateLines = GAME.finishTemplate.split('\n');

        canvasContext.textBaseline = 'middle';
        canvasContext.textAlign = 'center';

        for (let i = 0; i < finishTemplateLines.length; i++) {
          canvasContext.fillText(finishTemplateLines[i], (GAME.widthAfterTranslate / 2), 120 + (i * 20));
        }

        break;

      case 'aboutScreen':
        window.location.hash = 'About';

        this.aboutScreenMenu.draw();
        canvasContext.fillStyle = GAME.colors.UI;

        canvasContext.textBaseline = 'middle';
        canvasContext.textAlign = 'center';

        const aboutTemplateLines = GAME.aboutTemplate.split('\n');
        for (let i = 0; i < aboutTemplateLines.length; i++) {
          canvasContext.fillText(aboutTemplateLines[i], (GAME.widthAfterTranslate / 2), 120 + (i * 20));
        }

        break;

      case 'game':
        if (!window.location.hash.includes('CustomLevel')) {
          window.location.hash = 'Game';
        }

        if (GAME.frame % 4 === 0 || (this.game.fastSpeed > 0 && GAME.frame % 2 === 0)) {
          this.game.applyGravity();
          this.game.updateRidingBelts();

          if (GAME.pressedKeys.ArrowLeft || GAME.pressedKeys.a || GAME.pressedKeys.A) {
            this.game.playerWalk(GAME.direction.left)
          }

          if (GAME.pressedKeys.ArrowRight || GAME.pressedKeys.d || GAME.pressedKeys.D) {
            this.game.playerWalk(GAME.direction.right)
          }

          if (GAME.pressedKeys.ArrowUp || GAME.pressedKeys.w || GAME.pressedKeys.W || GAME.pressedKeys[' ']) {
            this.game.jump();
          }

          if (GAME.pressedKeys.ArrowDown || GAME.pressedKeys.s || GAME.pressedKeys.S) {
            this.game.goDown();
          }

          if (GAME.frame % 4 === 0) {
            if (GAME.pressedKeys.r || GAME.pressedKeys.R) {
              this.game.shoot();
            }
          }

          this.game.draw(GAME.frame % 4 === 0);

          break;
        }
    }

    if (GAME.selectedView !== 'game') {
      document.getElementById('edit_in_level_editor_button').classList.remove('show');
    } else if (window.location.hash.includes('CustomLevel')) {
      document.getElementById('edit_in_level_editor_button').classList.add('show');
    }

    if (GAME.selectedViewPrevious === 'levelEditor' && GAME.selectedView !== 'levelEditor') {
      document.getElementById('level_editor').classList.remove('show');
      document.getElementById('backdrop').classList.remove('full');
      document.getElementById('controls_main').classList.remove('hide');
      document.getElementById('controls_extra').classList.remove('hide');
    }


    GAME.mouseClicked = false;

    this.canvas.getContext('2d').restore();

    GAME.selectedViewPrevious = GAME.selectedView;
  }
}
