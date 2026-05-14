const assert = require('assert');
const fs = require('fs');
const vm = require('vm');

function makeElement() {
  return {
    textContent: '',
    innerHTML: '',
    style: {},
    dataset: {},
    offsetWidth: 0,
    value: '',
    files: [],
    classList: { add() {}, remove() {}, toggle() {} },
    addEventListener() {},
    click() {},
    closest() { return null; }
  };
}

const ids = [
  'clickValue', 'mountainName', 'mountainTrait', 'guideBox', 'dirt', 'stone', 'food',
  'population', 'merit', 'morale', 'progressBar', 'progressText', 'perSec', 'mountain',
  'prestigeBtn', 'upgradesPanel', 'descendantsPanel', 'techPanel', 'villagePanel',
  'cyclePanel', 'resetModal', 'confirmReset', 'cancelReset', 'saveBtn', 'exportBtn',
  'importBtn', 'importFile', 'resetBtn'
];
const elements = new Map(ids.map(id => [id, makeElement()]));
const tabs = ['upgrades', 'descendants', 'tech', 'village', 'cycle'].map(tab => ({ ...makeElement(), dataset: { tab } }));

global.window = global;
global.location = { protocol: 'file:' };
global.navigator = {};
global.setInterval = () => 0;
global.localStorage = {
  store: new Map(),
  getItem(key) { return this.store.has(key) ? this.store.get(key) : null; },
  setItem(key, value) { this.store.set(key, String(value)); },
  removeItem(key) { this.store.delete(key); }
};
global.document = {
  body: makeElement(),
  addEventListener() {},
  createElement() { return makeElement(); },
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeElement()); return elements.get(id); },
  querySelector(selector) { return selector === '.panel-tabs' ? makeElement() : makeElement(); },
  querySelectorAll(selector) { return selector === '.tab' ? tabs : []; }
};

for (const file of ['src/game/data.js', 'src/game/main.js']) {
  vm.runInThisContext(fs.readFileSync(file, 'utf8'), { filename: file });
}

assert.ok(window.GAME.MOUNTAINS.length >= 5, 'M4 mountain atlas count');
assert.ok(window.GAME.EVENTS.length >= 12, 'M4 event count');
assert.ok(window.GAME.OBJECTIVES.length >= 8, 'M4 objective count');
assert.ok(window.GAME.ACHIEVEMENTS.length >= 10, 'M4 achievement count');
assert.ok(window.GAME.CHALLENGES.length >= 3, 'M6 challenge count');
assert.ok(window.GAME.ROUTE_MASTERIES.length >= 3, 'M6 route mastery count');
assert.ok(localStorage.getItem(window.GAME.SAVE_KEY), 'save was written');
assert.match(elements.get('mountainTrait').textContent, /王屋|平衡|试炼/);
assert.match(elements.get('guideBox').textContent, /点击|招募|科技|转生|入门/);
assert.match(elements.get('cyclePanel').innerHTML, /山脉档案/);
assert.match(elements.get('cyclePanel').innerHTML, /阶段目标/);
assert.match(elements.get('cyclePanel').innerHTML, /成就/);
assert.match(elements.get('cyclePanel').innerHTML, /试炼/);
assert.match(elements.get('cyclePanel').innerHTML, /路线构筑/);

console.log('smoke-ok');
