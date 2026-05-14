(function() {
const S = window.GAME, PANELS = ['upgrades', 'descendants', 'tech', 'village', 'cycle'];
let state, lastSavedAt = 0;

function mountain(index = state.mountainIndex) { return S.MOUNTAINS[index % S.MOUNTAINS.length]; }
function mountainHp(index) {
    const round = Math.floor(index / S.MOUNTAINS.length);
    return Math.floor(S.MOUNTAINS[index % S.MOUNTAINS.length].hp * Math.pow(1.65, round));
}
function activeChallenge() { return S.CHALLENGES.find(item => item.id === state.challenge); }
function mountainEffect(key, fallback = 1) {
    const challenge = activeChallenge();
    const mountainValue = mountain().effects && mountain().effects[key];
    const challengeValue = challenge && challenge.effects[key];
    if (key === 'moraleCap') return (mountainValue || 0) + (challengeValue || 0);
    return (mountainValue == null ? fallback : mountainValue) * (challengeValue == null ? 1 : challengeValue);
}
function routeEffect(key) {
    return S.ROUTE_MASTERIES.reduce((total, mastery) => {
        return state.spent[mastery.path] >= mastery.threshold && mastery.effects[key] ? total * mastery.effects[key] : total;
    }, 1);
}
function defaultState(index = 0) {
    return {
        dirt: 0, stone: 0, food: 45, population: 5, housing: 8, farms: 1, morale: 100,
        mountainIndex: index, mountainLeft: mountainHp(index), merit: 0, spent: { labor: 0, divine: 0, machine: 0 },
        completedMountains: 0, eventMeter: 0, activeEvent: null, eventLog: '准备开始开山',
        descendants: {}, upgrades: {}, techs: {}, achievements: {}, objectives: {}, firstRewards: {},
        settings: { guide: true, largeText: false, reducedMotion: false }, challenge: null,
        stats: { clicks: 0, dirt: 0, stone: 0, events: 0, techs: 0, buildings: 0, merit: 0, prestiges: 0 },
        lastTime: Date.now()
    };
}
function normalizeState(saved) {
    const base = defaultState(Number(saved.mountainIndex || 0));
    return {
        ...base, ...saved,
        food: Number(saved.food ?? 45), population: Number(saved.population ?? 5),
        housing: Number(saved.housing ?? 8), farms: Number(saved.farms ?? 1), morale: Number(saved.morale ?? 100),
        spent: { ...base.spent, ...(saved.spent || {}) }, descendants: { ...(saved.descendants || {}) },
        upgrades: { ...(saved.upgrades || {}) }, techs: { ...(saved.techs || {}) },
        achievements: { ...(saved.achievements || {}) }, objectives: { ...(saved.objectives || {}) },
        firstRewards: { ...(saved.firstRewards || {}) }, settings: { ...base.settings, ...(saved.settings || {}) },
        challenge: saved.challenge || null, stats: { ...base.stats, ...(saved.stats || {}) },
        lastTime: Number(saved.lastTime) || Date.now()
    };
}
function load() {
    try {
        const keys = [S.SAVE_KEY, ...S.OLD_SAVE_KEYS];
        const key = keys.find(item => localStorage.getItem(item));
        return key ? normalizeState(JSON.parse(localStorage.getItem(key))) : defaultState();
    } catch {
        return defaultState();
    }
}
function save() {
    localStorage.setItem(S.SAVE_KEY, JSON.stringify({ ...state, lastTime: Date.now() }));
    lastSavedAt = Date.now();
}
function saveSoon() { if (Date.now() - lastSavedAt >= S.SAVE_INTERVAL_MS) save(); }
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function totalDescendants() { return Object.values(state.descendants).reduce((sum, count) => sum + count, 0); }
function techMult(key) { return S.TECHS.reduce((total, tech) => state.techs[tech.id] && tech.effects[key] ? total * tech.effects[key] : total, 1); }
function techAdd(key) { return S.TECHS.reduce((total, tech) => total + (state.techs[tech.id] ? tech.effects[key] || 0 : 0), 0); }
function meritMult(key) {
    if (key === 'production') return (1 + state.spent.labor * 0.12) * (1 + state.spent.machine * 0.06);
    if (key === 'click') return 1 + state.spent.divine * 0.15;
    if (key === 'stone') return 1 + state.spent.machine * 0.15;
    if (key === 'food') return 1 + state.spent.labor * 0.05;
    return 1;
}
function housingLimit() { return state.housing + techAdd('housing'); }
function moraleCap() { return 120 + techAdd('moraleCap') + state.spent.divine * 3 + mountainEffect('moraleCap', 0); }
function moraleMult() { return clamp(state.morale / 100, 0.45, 1.35); }
function upgradeMultiplier(target) {
    return S.UPGRADES.filter(item => item.target === target).reduce((total, upgrade) => total * Math.pow(upgrade.multiplier, state.upgrades[upgrade.id] || 0), 1);
}
function totalDPS() {
    const base = Object.entries(state.descendants).reduce((sum, [id, count]) => {
        const item = S.DESCENDANTS.find(descendant => descendant.id === id);
        return sum + (item ? item.production * count : 0);
    }, 0);
    return base * upgradeMultiplier('production') * techMult('production') * meritMult('production') * routeEffect('production') * moraleMult() * mountainEffect('production');
}
function clickPower() { return S.BASE_CLICK * upgradeMultiplier('click') * techMult('click') * meritMult('click') * routeEffect('click') * moraleMult() * mountainEffect('click'); }
function resourceName(key) { return { dirt: '泥土', stone: '石料', food: '粮食', merit: '功德' }[key] || key; }
function fmtMult(value) { return (Number(value) || 1).toFixed(2).replace(/\.00$/, '').replace(/0$/, '') + 'x'; }
function effectText(effect = {}) {
    const labels = { production: '产量', click: '点击', stone: '石料', food: '粮食', event: '事件', moraleCap: '士气上限' };
    const items = [];
    Object.entries(effect).forEach(([key, value]) => {
        if (value === 1) return;
        if (key === 'moraleCap') items.push(labels[key] + ' ' + (value >= 0 ? '+' : '') + value);
        else if (key === 'meritBonus') items.push('额外功德 +' + value);
        else items.push((labels[key] || resourceName(key)) + ' ' + fmtMult(value));
    });
    return items.join(' / ') || '平衡型';
}
function costText(cost) {
    return Object.entries(cost || {}).map(([key, value]) => resourceName(key) + ' ' + fmt(value)).join(' / ') || '免费';
}
function canPay(cost) { return Object.entries(cost || {}).every(([key, value]) => state[key] >= value); }
function pay(cost) { Object.entries(cost || {}).forEach(([key, value]) => { state[key] -= value; }); }
function gainResources(amount, skipEvent) {
    if (amount <= 0 || state.mountainLeft <= 0) return;
    const actual = Math.min(amount, state.mountainLeft);
    const stoneGain = actual * S.STONE_RATE * techMult('stone') * meritMult('stone') * routeEffect('stone') * mountainEffect('stone');
    state.dirt += actual; state.stone += stoneGain;
    state.stats.dirt += actual; state.stats.stone += stoneGain;
    state.mountainLeft = Math.max(0, state.mountainLeft - actual);
    if (!skipEvent) advanceEventMeter(actual * routeEffect('event') * mountainEffect('event'));
}
function advanceEventMeter(amount) {
    if (state.activeEvent || state.mountainLeft <= 0) return;
    state.eventMeter += amount;
    if (state.eventMeter >= S.EVENT_INTERVAL) triggerEvent();
}
function availableEvents() { return S.EVENTS.filter(item => state.mountainIndex >= (item.minMountain || 0)); }
function triggerEvent() {
    const pool = availableEvents();
    if (!pool.length) return;
    state.eventMeter = 0;
    const seed = (state.completedMountains + totalDescendants() + Math.floor(state.dirt)) % pool.length;
    state.activeEvent = pool[seed].id;
    state.stats.events += 1;
}
function runProduction(dt) {
    gainResources(totalDPS() * dt);
    runVillage(dt);
}
function runVillage(dt) {
    const workers = totalDescendants();
    const produced = state.farms * S.FARM_FOOD * techMult('food') * meritMult('food') * routeEffect('food') * moraleMult() * mountainEffect('food');
    const consumed = state.population * S.FOOD_CONSUME_POP + workers * S.FOOD_CONSUME_WORKER;
    state.food = Math.max(0, state.food + (produced - consumed) * dt);
    if (state.food > state.population * 2 && state.population < housingLimit()) {
        state.population = Math.min(housingLimit(), state.population + S.POP_GROWTH * techMult('population') * dt);
    }
    const target = clamp(62 + state.food / Math.max(20, state.population * 3) * 22 + (housingLimit() - state.population) * 2, 35, moraleCap());
    state.morale += (target - state.morale) * Math.min(1, dt * 0.05);
    state.morale = clamp(state.morale, 0, moraleCap());
}
function resetRun(index) {
    const keep = {
        merit: state.merit, spent: state.spent, completedMountains: state.completedMountains,
        achievements: state.achievements, objectives: state.objectives, firstRewards: state.firstRewards, stats: state.stats,
        settings: state.settings
    };
    state = { ...defaultState(index), ...keep };
}
function reset() { state = defaultState(); save(); render(); }
function guideText() {
    if (!state.settings.guide) return '';
    if (state.stats.clicks < 3) return '先点击山体积累泥土，打开“升级”和“子民”页会更顺手。';
    if (totalDescendants() < 1) return '招募第一名子民，让自动产出开始运转。';
    if (Object.keys(state.techs).length < 1) return '研究一项科技，打开村庄与功德的联动。';
    if (state.completedMountains < 1) return '将当前山脉打到 100%，然后转生拿功德。';
    return '你已经过了入门阶段，可以继续推进山脉档案、目标和试炼。';
}
function applySettings() {
    document.body.classList.toggle('large-text', !!state.settings.largeText);
    document.body.classList.toggle('reduced-motion', !!state.settings.reducedMotion);
}
function toggleSetting(id) {
    if (!(id in state.settings)) return;
    state.settings[id] = !state.settings[id];
    applySettings();
    commit();
}
function toggleChallenge(id) {
    const fresh = state.mountainLeft === mountainHp(state.mountainIndex);
    if (!fresh) { state.eventLog = '试炼只能在新山开局前切换'; render(); return; }
    state.challenge = state.challenge === id ? null : id;
    commit();
}
function exportSave() {
    const payload = JSON.stringify({ version: S.SAVE_KEY, exportedAt: Date.now(), state: { ...state, lastTime: Date.now() } }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yugong-save-v4.json';
    a.click();
    URL.revokeObjectURL(url);
    state.eventLog = '存档已导出';
    render();
}
function importSave(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const parsed = JSON.parse(reader.result);
            state = normalizeState(parsed.state || parsed);
            save();
            state.eventLog = '存档导入成功';
            render();
        } catch {
            state.eventLog = '存档导入失败';
            render();
        }
    };
    reader.readAsText(file);
}
function registerServiceWorker() {
    if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    if (typeof location !== 'undefined' && location.protocol === 'file:') return;
    navigator.serviceWorker.register('service-worker.js').catch(() => {});
}
function upgradeCost(upgrade) { return { dirt: Math.floor(upgrade.baseCost * Math.pow(upgrade.costGrowth, state.upgrades[upgrade.id] || 0)) }; }
function descendantCost(descendant) {
    const growth = Math.pow(descendant.costGrowth, state.descendants[descendant.id] || 0);
    return { dirt: Math.floor(descendant.baseCost * growth), food: Math.floor(descendant.foodCost * growth) };
}
function conditionValue(rule) {
    const cond = rule.condition || {};
    if (cond.descendant) return state.descendants[cond.descendant] || 0;
    switch (cond.stat) {
        case 'clicks': return state.stats.clicks;
        case 'dirt': return state.stats.dirt;
        case 'stone': return state.stats.stone;
        case 'events': return state.stats.events;
        case 'techs': return Object.keys(state.techs).length;
        case 'buildings': return state.stats.buildings;
        case 'mountains': return state.completedMountains;
        case 'merit': return state.stats.merit;
        default: return 0;
    }
}
function progressText(rule) {
    const cond = rule.condition || {};
    return conditionValue(rule) + '/' + cond.target;
}
function met(rule) { return conditionValue(rule) >= (rule.condition && rule.condition.target || 0); }
function grant(effect) {
    if (!effect) return;
    if (effect.dirt) { state.dirt += effect.dirt; state.stats.dirt += effect.dirt; }
    if (effect.stone) { state.stone += effect.stone; state.stats.stone += effect.stone; }
    if (effect.food) state.food = Math.max(0, state.food + effect.food);
    if (effect.merit) { state.merit += effect.merit; state.stats.merit += effect.merit; }
    if (effect.morale) state.morale += effect.morale;
    if (effect.population) state.population = clamp(state.population + effect.population, 1, housingLimit());
    state.morale = clamp(state.morale, 0, moraleCap());
    state.population = Math.min(state.population, housingLimit());
}
function applyEffects(effect) {
    if (effect && effect.progress) gainResources(effect.progress, true);
    grant(effect);
}
function syncMilestones() {
    let changed = false, note = '';
    do {
        changed = false;
        S.OBJECTIVES.forEach(rule => {
            if (!state.objectives[rule.id] && met(rule)) {
                state.objectives[rule.id] = true;
                applyEffects(rule.reward);
                note = '阶段目标达成：' + rule.name;
                changed = true;
            }
        });
        S.ACHIEVEMENTS.forEach(rule => {
            if (!state.achievements[rule.id] && met(rule)) {
                state.achievements[rule.id] = true;
                applyEffects(rule.reward);
                note = '成就解锁：' + rule.name;
                changed = true;
            }
        });
    } while (changed);
    if (note) state.eventLog = note;
    return !!note;
}
function commit() { syncMilestones(); render(); }
function clickMountain() {
    const gain = Math.min(clickPower(), state.mountainLeft);
    state.stats.clicks += 1;
    gainResources(gain);
    showFloat(gain);
    commit();
}
function buyUpgrade(id) {
    const item = S.UPGRADES.find(upgrade => upgrade.id === id);
    if (!item || !canPay(upgradeCost(item))) return;
    pay(upgradeCost(item));
    state.upgrades[id] = (state.upgrades[id] || 0) + 1;
    commit();
}
function buyDescendant(id) {
    const item = S.DESCENDANTS.find(descendant => descendant.id === id);
    const cost = item ? descendantCost(item) : null;
    if (!item || totalDescendants() >= Math.floor(state.population) || !canPay(cost)) return;
    pay(cost);
    state.descendants[id] = (state.descendants[id] || 0) + 1;
    commit();
}
function techReady(tech) { return (tech.requires || []).every(id => state.techs[id]); }
function researchTech(id) {
    const tech = S.TECHS.find(item => item.id === id);
    if (!tech || state.techs[id] || !techReady(tech) || !canPay(tech.cost)) return;
    pay(tech.cost);
    state.techs[id] = true;
    state.stats.techs += 1;
    commit();
}
function buildVillage(id) {
    const action = S.VILLAGE_ACTIONS.find(item => item.id === id);
    if (!action || !canPay(action.cost)) return;
    pay(action.cost);
    state.housing += action.effects.housing || 0;
    state.farms += action.effects.farms || 0;
    state.morale = Math.min(moraleCap(), state.morale + (action.effects.morale || 0));
    state.stats.buildings += 1;
    commit();
}
function chooseEvent(choiceId) {
    const event = S.EVENTS.find(item => item.id === state.activeEvent);
    const choice = event && event.choices.find(item => item.id === choiceId);
    if (!choice || !canPay(choice.cost)) return;
    pay(choice.cost);
    applyEffects(choice.effects || {});
    state.eventLog = event.name + ' · ' + choice.result;
    state.activeEvent = null;
    commit();
}
function allocateMerit(id) {
    if (!(id in state.spent) || state.merit < 1) return;
    state.merit -= 1;
    state.spent[id] += 1;
    commit();
}
function reincarnate() {
    if (state.mountainLeft > 0) return;
    const current = mountain();
    if (!state.firstRewards[current.id]) {
        grant(current.firstReward);
        state.firstRewards[current.id] = true;
    }
    const challenge = activeChallenge();
    const gain = current.merit + Math.floor(state.mountainIndex / S.MOUNTAINS.length) + ((challenge && challenge.effects.meritBonus) || 0);
    state.merit += gain;
    state.stats.merit += gain;
    state.completedMountains += 1;
    state.stats.prestiges += 1;
    resetRun(state.mountainIndex + 1);
    state.eventLog = '征服 ' + current.name + '，获得 ' + gain + ' 点功德';
    commit();
}
function showFloat(value) {
    const el = document.getElementById('clickValue');
    el.textContent = '+' + fmt(value);
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
}
function renderGuide() {
    const text = guideText();
    const el = document.getElementById('guideBox');
    el.textContent = text;
    el.classList.toggle('hidden', !text);
}
function renderVitals() {
    const hp = mountainHp(state.mountainIndex);
    const progress = ((1 - state.mountainLeft / hp) * 100).toFixed(1);
    const challenge = activeChallenge();
    document.getElementById('mountainName').textContent = mountain().name + ' · 第 ' + (state.completedMountains + 1) + ' 座';
    document.getElementById('mountainTrait').textContent = mountain().desc + ' ｜ ' + effectText(mountain().effects) + (challenge ? ' ｜ 试炼：' + challenge.name : '');
    document.getElementById('dirt').textContent = fmt(state.dirt);
    document.getElementById('stone').textContent = fmt(state.stone);
    document.getElementById('food').textContent = fmt(state.food);
    document.getElementById('population').textContent = fmt(state.population) + '/' + fmt(housingLimit());
    document.getElementById('merit').textContent = fmt(state.merit);
    document.getElementById('morale').textContent = Math.floor(state.morale) + '%';
    document.getElementById('progressBar').style.width = progress + '%';
    document.getElementById('progressText').textContent = state.mountainLeft <= 0 ? '已征服' : progress + '%';
    document.getElementById('perSec').textContent = fmt(totalDPS());
    document.getElementById('mountain').classList.toggle('done', state.mountainLeft <= 0);
    document.getElementById('prestigeBtn').classList.toggle('hidden', state.mountainLeft > 0);
}
function card(action, id, title, desc, cost, locked) {
    return '<div class="card' + (locked ? ' locked' : '') + '" data-action="' + action + '" data-id="' + id + '">' +
        '<div class="card-name">' + title + '</div><div class="card-desc">' + desc + '</div><div class="card-cost">' + costText(cost) + '</div></div>';
}
function infoCard(title, desc, meta, done) {
    return '<div class="card meta-card' + (done ? ' done' : '') + '">' +
        '<div class="card-name">' + title + '</div><div class="card-desc">' + desc + '</div><div class="card-cost">' + (meta || '') + '</div></div>';
}
function renderUpgrades() {
    document.getElementById('upgradesPanel').innerHTML = S.UPGRADES.map(item => {
        const cost = upgradeCost(item);
        return card('upgrade', item.id, item.name + ' Lv' + (state.upgrades[item.id] || 0), item.desc, cost, !canPay(cost));
    }).join('');
}
function renderDescendants() {
    const full = totalDescendants() >= Math.floor(state.population);
    document.getElementById('descendantsPanel').innerHTML = '<div class="panel-note">人口 ' + totalDescendants() + '/' + fmt(state.population) + '</div>' +
        S.DESCENDANTS.map(item => card('descendant', item.id, item.name, '产出 +' + fmt(item.production) + '，消耗食物 ' + fmt(item.foodCost) + ' x' + (state.descendants[item.id] || 0), descendantCost(item), full || !canPay(descendantCost(item)))).join('');
}
function renderTech() {
    const branches = [...new Set(S.TECHS.map(tech => tech.branch))];
    document.getElementById('techPanel').innerHTML = branches.map(branch => '<div class="branch-title">' + branch + '</div>' +
        S.TECHS.filter(tech => tech.branch === branch).map(tech => card('tech', tech.id, tech.name + (state.techs[tech.id] ? ' 已研究' : ''), tech.desc, tech.cost, state.techs[tech.id] || !techReady(tech) || !canPay(tech.cost))).join('')).join('');
}
function renderVillage() {
    const foodNet = state.farms * S.FARM_FOOD * techMult('food') * meritMult('food') * routeEffect('food') * moraleMult() * mountainEffect('food') - state.population * S.FOOD_CONSUME_POP - totalDescendants() * S.FOOD_CONSUME_WORKER;
    document.getElementById('villagePanel').innerHTML = '<div class="panel-note">农田 ' + fmt(state.farms) + ' ｜ 净粮 ' + fmt(foodNet) + '/秒 ｜ 住房 ' + fmt(housingLimit()) + '</div>' +
        S.VILLAGE_ACTIONS.map(action => card('village', action.id, action.name, action.desc, action.cost, !canPay(action.cost))).join('');
}
function renderCycle() {
    const event = S.EVENTS.find(item => item.id === state.activeEvent);
    const eventHtml = event ? '<div class="branch-title">事件</div><div class="panel-note">' + event.text + '</div>' +
        event.choices.map(choice => card('event', choice.id, choice.label, choice.result, choice.cost || {}, !canPay(choice.cost))).join('')
        : card('event', 'seek', '探查事件', state.eventLog, { food: 20 }, state.food < 20);
    const unlockedMasteries = S.ROUTE_MASTERIES.filter(item => state.spent[item.path] >= item.threshold).length;
    const summary = infoCard('运行摘要', '点击 ' + fmt(state.stats.clicks) + ' ｜ 事件 ' + fmt(state.stats.events) + ' ｜ 科技 ' + fmt(Object.keys(state.techs).length), '建设 ' + fmt(state.stats.buildings) + ' ｜ 转生 ' + fmt(state.stats.prestiges) + ' ｜ 专精 ' + unlockedMasteries);
    const settings = card('setting', 'guide', '引导提示 ' + (state.settings.guide ? '开' : '关'), '显示当前阶段下一步建议。', {}, false) +
        card('setting', 'largeText', '大字模式 ' + (state.settings.largeText ? '开' : '关'), '放大界面文字，方便小屏阅读。', {}, false) +
        card('setting', 'reducedMotion', '减少动画 ' + (state.settings.reducedMotion ? '开' : '关'), '降低点击反馈和过渡动画。', {}, false);
    const fresh = state.mountainLeft === mountainHp(state.mountainIndex);
    const challenges = S.CHALLENGES.map(item => card('challenge', item.id, item.name + (state.challenge === item.id ? ' 已启用' : ''), item.desc + ' ｜ ' + effectText(item.effects), {}, !fresh)).join('');
    const masteries = S.ROUTE_MASTERIES.map(item => infoCard(
        item.name,
        item.desc,
        state.spent[item.path] + '/' + item.threshold + ' ｜ ' + effectText(item.effects),
        state.spent[item.path] >= item.threshold
    )).join('');
    const atlas = S.MOUNTAINS.map((item, index) => infoCard(
        item.name,
        item.desc,
        '血量 ' + fmt(mountainHp(index)) + ' ｜ ' + effectText(item.effects) + ' ｜ 首通 +' + fmt(item.firstReward.merit || 0) + ' 功德',
        index === state.mountainIndex
    )).join('');
    const objectives = S.OBJECTIVES.map(rule => infoCard(rule.name, rule.desc, progressText(rule) + (state.objectives[rule.id] ? ' ｜ 已完成' : ''), state.objectives[rule.id])).join('');
    const achievements = S.ACHIEVEMENTS.map(rule => infoCard(rule.name, rule.desc, progressText(rule) + (state.achievements[rule.id] ? ' ｜ 已解锁' : ''), state.achievements[rule.id])).join('');
    document.getElementById('cyclePanel').innerHTML = '<div class="panel-note">已完成 ' + state.completedMountains + ' 座山 ｜ 总功德 ' + fmt(state.stats.merit) + '</div>' +
        card('prestige', 'next', '下一座山', '清空当前山脉后可进入下一轮，并继承功德与加点。', {}, state.mountainLeft > 0) +
        S.MERIT_PATHS.map(path => card('merit', path.id, path.name + ' +' + state.spent[path.id], path.desc, { merit: 1 }, state.merit < 1)).join('') +
        '<div class="branch-title">设置</div>' + settings +
        '<div class="branch-title">试炼</div>' + challenges +
        '<div class="branch-title">路线构筑</div>' + masteries +
        '<div class="branch-title">运行摘要</div>' + summary +
        '<div class="branch-title">山脉档案</div>' + atlas +
        '<div class="branch-title">阶段目标</div>' + objectives +
        '<div class="branch-title">成就</div>' + achievements +
        eventHtml;
}
function render() {
    applySettings();
    renderVitals();
    renderGuide();
    renderUpgrades();
    renderDescendants();
    renderTech();
    renderVillage();
    renderCycle();
    save();
}
function tick() {
    const now = Date.now();
    const dt = (now - state.lastTime) / 1000;
    state.lastTime = now;
    if (dt > 1) return;
    runProduction(dt);
    if (syncMilestones()) render();
    else { renderVitals(); saveSoon(); }
}
document.addEventListener('click', function(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const id = el.dataset.id;
    if (el.dataset.action === 'upgrade') buyUpgrade(id);
    if (el.dataset.action === 'descendant') buyDescendant(id);
    if (el.dataset.action === 'tech') researchTech(id);
    if (el.dataset.action === 'village') buildVillage(id);
    if (el.dataset.action === 'event') id === 'seek' ? (canPay({ food: 20 }) && (pay({ food: 20 }), triggerEvent(), render())) : chooseEvent(id);
    if (el.dataset.action === 'merit') allocateMerit(id);
    if (el.dataset.action === 'prestige') reincarnate();
    if (el.dataset.action === 'setting') toggleSetting(id);
    if (el.dataset.action === 'challenge') toggleChallenge(id);
});
document.getElementById('mountain').addEventListener('click', e => { e.stopPropagation(); clickMountain(); });
document.getElementById('prestigeBtn').addEventListener('click', e => { e.stopPropagation(); reincarnate(); });
document.getElementById('saveBtn').addEventListener('click', e => { e.stopPropagation(); save(); });
document.getElementById('exportBtn').addEventListener('click', e => { e.stopPropagation(); exportSave(); });
document.getElementById('importBtn').addEventListener('click', e => { e.stopPropagation(); document.getElementById('importFile').click(); });
document.getElementById('importFile').addEventListener('change', e => { importSave(e.target.files && e.target.files[0]); e.target.value = ''; });
document.getElementById('resetBtn').addEventListener('click', e => { e.stopPropagation(); document.getElementById('resetModal').classList.remove('hidden'); });
document.getElementById('cancelReset').addEventListener('click', e => { e.stopPropagation(); document.getElementById('resetModal').classList.add('hidden'); });
document.getElementById('confirmReset').addEventListener('click', e => { e.stopPropagation(); reset(); document.getElementById('resetModal').classList.add('hidden'); });
document.querySelector('.panel-tabs').addEventListener('click', function(e) {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    document.querySelectorAll('.tab').forEach(item => item.classList.remove('active'));
    tab.classList.add('active');
    PANELS.forEach(name => document.getElementById(name + 'Panel').classList.toggle('hidden', tab.dataset.tab !== name));
});
state = load();
runProduction(Math.min((Date.now() - state.lastTime) / 1000, S.OFFLINE_CAP_SECONDS));
state.lastTime = Date.now();
syncMilestones();
render();
registerServiceWorker();
setInterval(tick, 100);
})();
