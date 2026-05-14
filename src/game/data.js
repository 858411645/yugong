const GAME = {
    BASE_CLICK: 1,
    STONE_RATE: 0.12,
    FARM_FOOD: 0.55,
    FOOD_CONSUME_POP: 0.015,
    FOOD_CONSUME_WORKER: 0.045,
    POP_GROWTH: 0.018,
    EVENT_INTERVAL: 260,
    SAVE_KEY: 'yugong_save_v4',
    OLD_SAVE_KEYS: ['yugong_save_v3', 'yugong_save_v2', 'yugong_save_v1'],
    OFFLINE_CAP_SECONDS: 3600,
    SAVE_INTERVAL_MS: 2000,
    MOUNTAINS: [
        { id: 'wangwu', name: '王屋山', hp: 1000000, merit: 2, desc: '起点山脉，曲线平稳。', effects: { production: 1, event: 1, click: 1 }, firstReward: { merit: 1 } },
        { id: 'taihang', name: '太行山', hp: 1800000, merit: 3, desc: '石料更密，推进更稳。', effects: { stone: 1.15, event: 1.05 }, firstReward: { merit: 1 } },
        { id: 'kunlun', name: '昆仑余脉', hp: 3200000, merit: 4, desc: '更适合高效构筑。', effects: { production: 1.15, click: 1.1 }, firstReward: { merit: 1 } },
        { id: 'yan', name: '燕山裂谷', hp: 5200000, merit: 5, desc: '事件频率更高，收益更飘忽。', effects: { event: 1.2, food: 0.95 }, firstReward: { merit: 1 } },
        { id: 'zhongnan', name: '终南古道', hp: 7600000, merit: 6, desc: '后期推进更依赖系统联动。', effects: { production: 1.3, moraleCap: 12, click: 1.15 }, firstReward: { merit: 2 } },
    ],
    UPGRADES: [
        { id: 'pickaxe', name: '铁镐', target: 'click', baseCost: 10, costGrowth: 1.5, multiplier: 2, desc: '提升手动点击的效率。' },
        { id: 'strength', name: '强臂', target: 'click', baseCost: 60, costGrowth: 1.85, multiplier: 3, desc: '进一步放大单次点击收益。' },
        { id: 'oxcart', name: '牛车', target: 'production', baseCost: 120, costGrowth: 1.8, multiplier: 2, desc: '提升自动挖掘速度。' },
        { id: 'windlass', name: '绞盘', target: 'production', baseCost: 600, costGrowth: 2.2, multiplier: 5, desc: '在中后期显著提高产量。' },
    ],
    DESCENDANTS: [
        { id: 'child', name: '孩童', baseCost: 15, foodCost: 8, production: 1, costGrowth: 1.15 },
        { id: 'worker', name: '壮丁', baseCost: 100, foodCost: 18, production: 8, costGrowth: 1.18 },
        { id: 'scholar', name: '工匠', baseCost: 1100, foodCost: 45, production: 47, costGrowth: 1.22 },
        { id: 'kuafu', name: '夸父', baseCost: 12000, foodCost: 120, production: 260, costGrowth: 1.25 },
    ],
    TECHS: [
        { id: 'clanRoster', branch: '村庄', name: '族谱册', cost: { dirt: 120, food: 30 }, effects: { production: 1.15, population: 1.2 }, desc: '提高组织效率与人口上限。' },
        { id: 'housecraft', branch: '村庄', name: '筑屋术', requires: ['clanRoster'], cost: { stone: 80, food: 60 }, effects: { housing: 8 }, desc: '让村庄容纳更多劳力。' },
        { id: 'foreman', branch: '村庄', name: '总管制', requires: ['clanRoster'], cost: { dirt: 600, food: 120 }, effects: { production: 1.35 }, desc: '让自动生产更有效率。' },
        { id: 'shrineOath', branch: '功德', name: '山神誓', cost: { stone: 50, food: 50 }, effects: { click: 1.5, moraleCap: 10 }, desc: '提高点击收益与士气上限。' },
        { id: 'mountainPrayer', branch: '功德', name: '祈山文', requires: ['shrineOath'], cost: { stone: 180, food: 120 }, effects: { production: 1.15, stone: 1.5 }, desc: '增强生产与石料产出。' },
        { id: 'kuaePact', branch: '功德', name: '夸父誓约', requires: ['mountainPrayer'], cost: { stone: 650, food: 280 }, effects: { click: 2, production: 1.3 }, desc: '强化点击与生产的联动。' },
        { id: 'lever', branch: '器械', name: '杠杆', cost: { dirt: 220, stone: 80 }, effects: { production: 1.35 }, desc: '机械化起步。' },
        { id: 'pulley', branch: '器械', name: '滑轮', requires: ['lever'], cost: { dirt: 700, stone: 250 }, effects: { production: 1.8 }, desc: '提升大型搬运效率。' },
        { id: 'blasting', branch: '器械', name: '爆破', requires: ['pulley'], cost: { dirt: 2500, stone: 900 }, effects: { click: 3, stone: 2 }, desc: '高风险高收益的推进方式。' },
    ],
    VILLAGE_ACTIONS: [
        { id: 'house', name: '建屋', cost: { dirt: 60, stone: 25 }, effects: { housing: 5 }, desc: '增加 5 点住房容量。' },
        { id: 'field', name: '开垦', cost: { dirt: 90, stone: 15 }, effects: { farms: 1 }, desc: '增加 1 块农田。' },
        { id: 'festival', name: '祭典', cost: { food: 35, stone: 25 }, effects: { morale: 10 }, desc: '提高士气。' },
    ],
    MERIT_PATHS: [
        { id: 'labor', name: '劳作', desc: '每点功德让生产提高 12%，食物提高 5%' },
        { id: 'divine', name: '神力', desc: '每点功德让点击提高 15%，士气上限提高 3' },
        { id: 'machine', name: '机械', desc: '每点功德让石料提高 15%，生产提高 6%' },
    ],
    ROUTE_MASTERIES: [
        { id: 'laborMaster', path: 'labor', threshold: 3, name: '众志成城', desc: '劳作路线 3 点解锁，强化生产和粮食。', effects: { production: 1.18, food: 1.12 } },
        { id: 'divineMaster', path: 'divine', threshold: 3, name: '神意回响', desc: '神力路线 3 点解锁，强化点击和奇遇节奏。', effects: { click: 1.25, event: 1.1 } },
        { id: 'machineMaster', path: 'machine', threshold: 3, name: '机关成阵', desc: '机械路线 3 点解锁，强化石料和自动产量。', effects: { stone: 1.25, production: 1.1 } },
    ],
    CHALLENGES: [
        { id: 'hardRock', name: '重岩试炼', desc: '山体更难撬动，但石料更多，通关额外 +1 功德。', effects: { production: 0.82, stone: 1.35, meritBonus: 1 } },
        { id: 'thinFood', name: '薄粮试炼', desc: '粮食产出下降，适合检验村庄经营，通关额外 +1 功德。', effects: { food: 0.78, moraleCap: -8, meritBonus: 1 } },
        { id: 'wildPath', name: '奇险试炼', desc: '奇遇更频繁但士气更不稳定，通关额外 +2 功德。', effects: { event: 1.55, moraleCap: -12, meritBonus: 2 } },
    ],
    OBJECTIVES: [
        { id: 'click_25', name: '起手成势', desc: '累计点击 25 次', condition: { stat: 'clicks', target: 25 }, reward: { dirt: 120 } },
        { id: 'dirt_800', name: '土石初聚', desc: '累计获得 800 泥土', condition: { stat: 'dirt', target: 800 }, reward: { stone: 60 } },
        { id: 'workers_2', name: '人手成型', desc: '招募 2 名壮丁', condition: { descendant: 'worker', target: 2 }, reward: { food: 40 } },
        { id: 'tech_2', name: '技艺开枝', desc: '研究 2 项科技', condition: { stat: 'techs', target: 2 }, reward: { merit: 1 } },
        { id: 'build_2', name: '村落雏形', desc: '建造 2 个村庄建筑', condition: { stat: 'buildings', target: 2 }, reward: { morale: 8 } },
        { id: 'events_3', name: '风波初识', desc: '触发 3 次事件', condition: { stat: 'events', target: 3 }, reward: { food: 60 } },
        { id: 'mountain_1', name: '首山告捷', desc: '完成 1 座山', condition: { stat: 'mountains', target: 1 }, reward: { merit: 1 } },
        { id: 'merit_3', name: '功德初聚', desc: '累计获得 3 点功德', condition: { stat: 'merit', target: 3 }, reward: { dirt: 200 } },
    ],
    ACHIEVEMENTS: [
        { id: 'click_10', name: '开山见土', desc: '累计点击 10 次', condition: { stat: 'clicks', target: 10 }, reward: { merit: 1 } },
        { id: 'click_100', name: '锤炼有成', desc: '累计点击 100 次', condition: { stat: 'clicks', target: 100 }, reward: { food: 50 } },
        { id: 'desc_5', name: '人手渐足', desc: '累计拥有 5 名子民', condition: { stat: 'descendants', target: 5 }, reward: { merit: 1 } },
        { id: 'desc_15', name: '众力成军', desc: '累计拥有 15 名子民', condition: { stat: 'descendants', target: 15 }, reward: { stone: 180 } },
        { id: 'tech_3', name: '技进一阶', desc: '研究 3 项科技', condition: { stat: 'techs', target: 3 }, reward: { merit: 1 } },
        { id: 'build_3', name: '村落成形', desc: '建造 3 个村庄建筑', condition: { stat: 'buildings', target: 3 }, reward: { morale: 12 } },
        { id: 'event_5', name: '风波见识', desc: '触发 5 次事件', condition: { stat: 'events', target: 5 }, reward: { food: 90 } },
        { id: 'mountain_2', name: '连破两山', desc: '完成 2 座山', condition: { stat: 'mountains', target: 2 }, reward: { merit: 2 } },
        { id: 'merit_5', name: '功德小成', desc: '累计获得 5 点功德', condition: { stat: 'merit', target: 5 }, reward: { dirt: 350 } },
        { id: 'event_10', name: '山路熟稔', desc: '触发 10 次事件', condition: { stat: 'events', target: 10 }, reward: { merit: 2 } },
    ],
    EVENTS: [
        { id: 'collapse', minMountain: 0, name: '山体塌方', text: '前方山体松动，需要决定是稳扎稳打还是加速推进。', choices: [
            { id: 'brace', label: '加固支撑', cost: { stone: 80 }, effects: { morale: 5 }, result: '工地稳定了下来。' },
            { id: 'rush', label: '强行推进', effects: { dirt: 260, progress: 140, morale: -8 }, result: '速度更快，但士气下降。' },
        ] },
        { id: 'treasure', minMountain: 0, name: '山中藏宝', text: '有人在岩层里发现了可疑的暗格。', choices: [
            { id: 'open', label: '打开查看', effects: { stone: 220, food: 80 }, result: '找到了一批稀有物资。' },
            { id: 'donate', label: '献给山神', effects: { merit: 1, morale: 6 }, result: '村里声望提高了。' },
        ] },
        { id: 'traveler', minMountain: 0, name: '过路旅人', text: '一位旅人带来了外界消息。', choices: [
            { id: 'learn', label: '请教经验', cost: { food: 60 }, effects: { population: 1, morale: 4 }, result: '你们学会了更好的分工。' },
            { id: 'trade', label: '交换物资', cost: { stone: 120 }, effects: { dirt: 500 }, result: '换回了大量泥土。' },
        ] },
        { id: 'stele', minMountain: 1, name: '古碑残文', text: '残碑上记载着某种效率法则。', choices: [
            { id: 'decode', label: '翻译碑文', cost: { dirt: 180 }, effects: { stone: 180, dirt: 120 }, result: '你们掌握了旧时代的技巧。' },
            { id: 'memorize', label: '誊抄保存', cost: { food: 40 }, effects: { merit: 1 }, result: '知识被保留下来。' },
        ] },
        { id: 'beast', minMountain: 1, name: '山兽袭扰', text: '山道旁出现了成群山兽。', choices: [
            { id: 'hunt', label: '围猎驱逐', cost: { dirt: 120 }, effects: { food: 100, morale: -3 }, result: '你们保住了粮仓。' },
            { id: 'bait', label: '投喂引开', cost: { food: 70 }, effects: { stone: 120 }, result: '危险被引走了。' },
        ] },
        { id: 'drought', minMountain: 1, name: '山地旱情', text: '天气干燥，农田开始吃紧。', choices: [
            { id: 'ration', label: '节粮限供', effects: { food: -50, morale: 4 }, result: '大家接受了配给。' },
            { id: 'dig', label: '加开蓄水沟', cost: { dirt: 180 }, effects: { food: 120 }, result: '短期粮食压力缓解。' },
        ] },
        { id: 'thunder', minMountain: 1, name: '雷雨夜', text: '雷声轰鸣，机遇与风险并存。', choices: [
            { id: 'pause', label: '暂停避险', effects: { morale: 5 }, result: '工地平安度过雷雨。' },
            { id: 'press', label: '冒雨赶工', effects: { dirt: 180, progress: 100, morale: -5 }, result: '收获更多，但更疲惫。' },
        ] },
        { id: 'shrine', minMountain: 2, name: '山神小庙', text: '一座废弃小庙可以修复。', choices: [
            { id: 'repair', label: '修复供奉', cost: { stone: 160, food: 40 }, effects: { merit: 1, morale: 8 }, result: '士气与功德都提升了。' },
            { id: 'salvage', label: '拆取石料', effects: { stone: 260 }, result: '拆下了不少材料。' },
        ] },
        { id: 'cave', minMountain: 2, name: '岩洞深处', text: '洞里传来奇怪的回声。', choices: [
            { id: 'explore', label: '深入探索', cost: { food: 60 }, effects: { stone: 300, dirt: 120 }, result: '你们带回了一批好东西。' },
            { id: 'seal', label: '封住洞口', cost: { dirt: 120 }, effects: { morale: 6 }, result: '工地更安全了。' },
        ] },
        { id: 'refugees', minMountain: 2, name: '流民来投', text: '一队流民希望加入队伍。', choices: [
            { id: 'accept', label: '接纳他们', cost: { food: 90 }, effects: { population: 2, morale: 4 }, result: '人手增加了。' },
            { id: 'send', label: '赠粮送别', cost: { food: 35 }, effects: { merit: 1 }, result: '你们保住了名声。' },
        ] },
        { id: 'caravan', minMountain: 3, name: '商队过境', text: '商队愿意和你们交换资源。', choices: [
            { id: 'barter', label: '以石换土', cost: { stone: 120 }, effects: { dirt: 520 }, result: '交换很顺利。' },
            { id: 'escort', label: '护送一程', cost: { food: 80 }, effects: { merit: 1, stone: 180 }, result: '得到了一笔回报。' },
        ] },
        { id: 'starguide', minMountain: 4, name: '星火传书', text: '一位老者带来了更远的山外消息。', choices: [
            { id: 'record', label: '记录线索', cost: { dirt: 200, food: 50 }, effects: { merit: 1, stone: 120 }, result: '你们学到了一些新方法。' },
            { id: 'meditate', label: '静心观想', cost: { food: 40 }, effects: { merit: 1, morale: 10 }, result: '心境更稳了。' },
        ] },
    ],
};

function fmt(value) {
    const n = Math.max(0, Number(value) || 0);
    if (n >= 1000000000000) return (n / 1000000000000).toFixed(2) + '万亿';
    if (n >= 100000000) return (n / 100000000).toFixed(2) + '亿';
    if (n >= 10000) return (n / 10000).toFixed(2) + '万';
    return Math.floor(n).toLocaleString('zh-CN');
}

window.GAME = GAME;
window.fmt = fmt;
