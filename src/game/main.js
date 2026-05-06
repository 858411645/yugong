(function() {
const S = GAME;
let state;

function def() {
    return {
        dirt: 0,
        stone: 0,
        mountainLeft: S.MOUNTAIN_HP,
        descendants: {},
        upgrades: {},
        lastTime: Date.now(),
    };
}

function load() {
    try {
        const raw = localStorage.getItem(S.SAVE_KEY);
        if (!raw) return def();
        const s = JSON.parse(raw);
        s.lastTime = Date.now();
        return s;
    } catch { return def(); }
}

function save() {
    const copy = { ...state };
    copy.lastTime = Date.now();
    localStorage.setItem(S.SAVE_KEY, JSON.stringify(copy));
}

function reset() {
    state = def();
    save();
    render();
}

function applyOffline() {
    const now = Date.now();
    const elapsed = (now - state.lastTime) / 1000;
    if (elapsed > 3600) return; // cap at 1hr
    const dps = totalDPS();
    if (dps > 0) {
        state.dirt += dps * elapsed;
    }
    state.lastTime = now;
}

function totalDPS() {
    let base = 0;
    for (const [id, count] of Object.entries(state.descendants)) {
        const d = S.DESCENDANTS.find(x => x.id === id);
        if (d) base += d.production * count;
    }
    for (const u of S.UPGRADES) {
        if (state.upgrades[u.id]) {
            base = u.effect(base);
        }
    }
    return base;
}

function clickMul() {
    let m = S.BASE_CLICK;
    for (const u of S.UPGRADES) {
        if (state.upgrades[u.id]) {
            m = u.effect(m);
        }
    }
    return m;
}

function upgradeCost(u) {
    const owned = state.upgrades[u.id] || 0;
    return Math.floor(u.baseCost * Math.pow(u.costGrowth, owned));
}

function descendantCost(d) {
    const owned = state.descendants[d.id] || 0;
    return Math.floor(d.baseCost * Math.pow(d.costGrowth, owned));
}

function totalDescendants() {
    return Object.values(state.descendants).reduce((a, b) => a + b, 0);
}

// ---- Actions ----
function clickMountain() {
    const mul = clickMul();
    const gain = mul;
    state.dirt += gain;
    state.mountainLeft = Math.max(0, state.mountainLeft - gain);
    showFloat(gain);
    if (state.mountainLeft <= 0) {
        state.mountainLeft = 0;
    }
    render();
}

function buyUpgrade(id) {
    const u = S.UPGRADES.find(x => x.id === id);
    if (!u) return;
    const cost = upgradeCost(u);
    if (state.dirt < cost) return;
    state.dirt -= cost;
    state.upgrades[u.id] = (state.upgrades[u.id] || 0) + 1;
    render();
}

function buyDescendant(id) {
    const d = S.DESCENDANTS.find(x => x.id === id);
    if (!d) return;
    const cost = descendantCost(d);
    if (state.dirt < cost) return;
    state.dirt -= cost;
    state.descendants[d.id] = (state.descendants[d.id] || 0) + 1;
    render();
}

// ---- UI ----
function showFloat(val) {
    const el = document.getElementById('clickValue');
    el.textContent = '+' + fmt(val);
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
}

function render() {
    const pct = S.MOUNTAIN_HP > 0
        ? ((1 - state.mountainLeft / S.MOUNTAIN_HP) * 100).toFixed(1)
        : 100;
    document.getElementById('dirt').textContent = fmt(state.dirt);
    document.getElementById('stone').textContent = fmt(state.stone);
    document.getElementById('descCount').textContent = totalDescendants();
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressText').textContent = pct + '%';
    document.getElementById('perSec').textContent = fmt(totalDPS());

    if (state.mountainLeft <= 0) {
        document.getElementById('progressText').textContent = '已移平! 🎉';
        document.getElementById('mountain').classList.add('done');
    }

    // Upgrades panel
    const upEl = document.getElementById('upgradesPanel');
    upEl.innerHTML = S.UPGRADES.map(u => {
        const owned = state.upgrades[u.id] || 0;
        const cost = upgradeCost(u);
        const canBuy = state.dirt >= cost;
        return '<div class="card' + (canBuy ? '' : ' locked') + '" data-action="upgrade" data-id="' + u.id + '">'
            + '<div class="card-name">' + u.name + ' <span class="lvl">Lv' + owned + '</span></div>'
            + '<div class="card-desc">' + u.desc + '</div>'
            + '<div class="card-cost">🪙 ' + fmt(cost) + '</div>'
            + '</div>';
    }).join('');

    // Descendants panel
    const dEl = document.getElementById('descendantsPanel');
    dEl.innerHTML = S.DESCENDANTS.map(d => {
        const owned = state.descendants[d.id] || 0;
        const cost = descendantCost(d);
        const canBuy = state.dirt >= cost;
        return '<div class="card' + (canBuy ? '' : ' locked') + '" data-action="descendant" data-id="' + d.id + '">'
            + '<div class="card-name">' + d.name + ' <span class="lvl">x' + owned + '</span></div>'
            + '<div class="card-desc">每秒 +' + fmt(d.production) + ' 泥土</div>'
            + '<div class="card-cost">🪙 ' + fmt(cost) + '</div>'
            + '</div>';
    }).join('');

    save();
}

// ---- Game Loop ----
function tick() {
    const now = Date.now();
    const dt = (now - state.lastTime) / 1000;
    if (dt > 1) {
        state.lastTime = now;
        return;
    }
    state.lastTime = now;
    const dps = totalDPS();
    if (dps > 0) {
        state.dirt += dps * dt;
        state.mountainLeft = Math.max(0, state.mountainLeft - dps * dt);
    }
    document.getElementById('dirt').textContent = fmt(state.dirt);
    document.getElementById('perSec').textContent = fmt(dps);
    const pct = S.MOUNTAIN_HP > 0
        ? ((1 - state.mountainLeft / S.MOUNTAIN_HP) * 100).toFixed(1)
        : 100;
    document.getElementById('progressBar').style.width = pct + '%';
    document.getElementById('progressText').textContent = pct + '%';
    if (state.mountainLeft <= 0) {
        document.getElementById('progressText').textContent = '已移平! 🎉';
        document.getElementById('mountain').classList.add('done');
    }
    save();
}

// ---- Event Delegation ----
document.addEventListener('click', function(e) {
    const card = e.target.closest('[data-action]');
    if (card) {
        if (card.dataset.action === 'upgrade') buyUpgrade(card.dataset.id);
        if (card.dataset.action === 'descendant') buyDescendant(card.dataset.id);
        return;
    }
});

document.getElementById('mountain').addEventListener('click', function(e) {
    e.stopPropagation();
    clickMountain();
});

document.getElementById('saveBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    save();
});

document.getElementById('resetBtn').addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('resetModal').classList.remove('hidden');
});

document.getElementById('cancelReset').addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('resetModal').classList.add('hidden');
});

document.getElementById('confirmReset').addEventListener('click', function(e) {
    e.stopPropagation();
    reset();
    document.getElementById('resetModal').classList.add('hidden');
});

// Tab switching
document.querySelector('.panel-tabs').addEventListener('click', function(e) {
    const tab = e.target.closest('.tab');
    if (!tab) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    document.getElementById('upgradesPanel').classList.toggle('hidden', target !== 'upgrades');
    document.getElementById('descendantsPanel').classList.toggle('hidden', target !== 'descendants');
});

// ---- Init ----
state = load();
applyOffline();
render();
setInterval(tick, 100);
})();
