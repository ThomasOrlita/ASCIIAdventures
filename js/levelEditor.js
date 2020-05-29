const textarea = document.getElementById('level_editor_textarea');
const level_editor = document.getElementById('level_editor');
const level_editor_instructions_types = document.getElementById('level_editor_instructions_types');
const level_editor_url = document.getElementById('level_editor_url');
const level_editor_preview_button = document.getElementById('level_editor_preview_button');
const level_editor_preview_iframe = document.getElementById('level_editor_preview_iframe');
const exit_preview_button = document.getElementById('exit_preview_button');
const edit_in_level_editor_button = document.getElementById('edit_in_level_editor_button');
const generate_random_terrain_button = document.getElementById('generate_random_terrain_button');
const toggle_insert_mode_button = document.getElementById('toggle_insert_mode_button');
const load_level_from_template = document.getElementById('load_level_from_template');
const level_editor_title = document.getElementById('level_editor_title');

let insertModeEnabled = false;

const loadTemplate = data => {
  if (!data) return;
  textarea.value = data.template;
  level_editor_title.value = data.title;
};

let defaultTemplate = new Array(GAME.worldHeight).fill(GAME.types.air.repeat(GAME.worldWidth))
defaultTemplate[11] = ('            o                   Q           P').padEnd(GAME.worldWidth, GAME.types.air);
defaultTemplate[12] = ('            _________________________________').padEnd(GAME.worldWidth, GAME.types.air);
defaultTemplate = defaultTemplate.join('\n');
loadTemplate(new Level({
  template: defaultTemplate
}));


textarea.addEventListener('keypress', function (event) {
  if (insertModeEnabled) {
    const s = this.selectionStart;
    this.value = this.value.substr(0, s) + this.value.substr(s + 1);
    this.selectionEnd = s;
  }
}, false);

const getHash = () => new Level({template: textarea.value, title: level_editor_title.value}).toCompressed();
const getShareUrl = () => location.origin + '/#CustomLevel:' + getHash();
const getPreviewUrl = () => location.origin + '/#PreviewLevel:' + getHash();

const updateLevelUrl = () => {
  level_editor_url.value = getShareUrl();
  window.location.hash = 'LevelEditor:' + getHash();
};

textarea.addEventListener('input', updateLevelUrl, false);
level_editor_title.addEventListener('input', updateLevelUrl, false);


const hiddenTypes = ['playerBig', 'air', 'invisible', 'previousLevel', 'bulletLeft', 'bulletRight', 'bulletTop', 'bulletBottom', 'ridingBeltDot', 'time', 'diamond'];

for (const typeName in GAME.types) {
  if (hiddenTypes.includes(typeName)) continue;
  const li = document.createElement('li');
  let color = '#fff';
  if (typeof GAME.colors[typeName] === 'object') {
    const colorsArray = Object.values(GAME.colors[typeName]);
    color = colorsArray[colorsArray.length - 1];
  } else if (typeof GAME.colors[typeName] === 'string') {
    color = GAME.colors[typeName];
  }
  li.style.color = color;
  li.innerText = `${GAME.types[typeName]}: ${typeName}`;
  if (GAME.typesAlt[typeName]) li.innerText += ` (${GAME.typesAlt[typeName]})`;
  level_editor_instructions_types.appendChild(li);
}


const handleLoadLevelFromHash = () => {
  if (window.location.hash) {
    const template = window.location.hash.substring(1);
    if (template.startsWith('CustomLevel:' + GAME.customLevelTemplatePrefix)) {
      gameController.game.setLevel(new Level({template: template.replace('CustomLevel:', '')}))
      GAME.selectedView = 'game';
      gameController.game.lives = GAME.startingLives;
    } else if (template.startsWith('PreviewLevel:' + GAME.customLevelTemplatePrefix)) {
      gameController.game.setLevel(new Level({template: template.replace('PreviewLevel:', '')}))
      GAME.selectedView = 'game';
      GAME.isPreview = true;
      exit_preview_button.classList.add('show');
      gameController.deathScreenMenu.buttons[0] = new Button(gameController.canvas.getContext('2d'), 7, 3, 'Exit preview', (GAME.height / 2) + 25, -100, GAME.exitPreview);

      gameController.game.lives = GAME.startingLives;
    } else if (template.startsWith('LevelEditor')) {
      GAME.selectedView = 'levelEditor';
      if (template.startsWith('LevelEditor:' + GAME.customLevelTemplatePrefix)) {
        loadTemplate(new Level({template: template.replace('LevelEditor:', '')}));
      }
    } else if (template.startsWith('About')) {
      GAME.selectedView = 'aboutScreen';
    } else if (template.startsWith('Menu')) {
      GAME.selectedView = 'mainMenu';
    } else if (template.startsWith('LevelSelect')) {
      GAME.selectedView = 'levelSelectScreen';
    } else if (template.startsWith('Game')) {
      GAME.selectedView = 'game';
    }
  }
}

window.onhashchange = handleLoadLevelFromHash;
handleLoadLevelFromHash();


const updateInsertModeButtonText = () => {
  toggle_insert_mode_button.innerText = (insertModeEnabled ? 'Disable' : 'Enable') + ' INSERT mode';
}
toggle_insert_mode_button.onclick = () => {
  insertModeEnabled = !insertModeEnabled;
  updateInsertModeButtonText();
};
updateInsertModeButtonText();

generate_random_terrain_button.onclick = () => {
  loadTemplate(new Level({
    ...LevelGenerator.generateLevel(undefined, undefined, Math.random())
  }));
  updateLevelUrl();
};

load_level_from_template.onclick = () => {
  const levelId = prompt(`Enter level id (0-${GAME.levels.length - 1})`);
  if (levelId < 0 || levelId > GAME.levels.length - 1 || isNaN(levelId)) {
    alert('Invalid level ID!');
    return;
  }
  loadTemplate(GAME.levels[levelId]);
  updateLevelUrl();
};

level_editor_url.onfocus = () => {
  level_editor_url.select();
};

level_editor_preview_button.onclick = () => {
  level_editor_preview_iframe.classList.add('show');
  level_editor.classList.add('preview');
  level_editor_preview_iframe.src = getPreviewUrl();
};

exit_preview_button.onclick = GAME.exitPreview;
edit_in_level_editor_button.onclick = () => {
  window.location.href = window.location.href.replace('CustomLevel', 'LevelEditor');
};
window.addEventListener('message', e => {
  if (e.data === 'exit') {
    level_editor_preview_iframe.src = '';
    level_editor_preview_iframe.classList.remove('show');
    level_editor.classList.remove('preview');
  }
}, false);


level_editor_url.value = getShareUrl();
