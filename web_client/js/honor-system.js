/**
 * 命运塔 - 荣誉系统
 * Honor System for Tower of Fate
 * 
 * 功能：
 * 1. 称号系统管理
 * 2. 荣誉获取与展示
 * 3. 称号装备
 * 4. 荣誉墙展示
 * 5. 成就进度追踪
 */

// ==================== 称号数据 ====================
const TITLES = {
    // 等级称号
    'NOVICE': { 
        name: '新手攀登者', 
        condition: '完成1场比赛',
        description: '踏上命运塔的征程',
        icon: '🌱',
        category: 'level',
        requirement: { type: 'gamesPlayed', value: 1 }
    },
    'CLIMBER': { 
        name: '熟练攀登者', 
        condition: '完成10场比赛',
        description: '逐渐掌握攀登技巧',
        icon: '🌿',
        category: 'level',
        requirement: { type: 'gamesPlayed', value: 10 }
    },
    'MASTER': { 
        name: '攀登大师', 
        condition: '完成100场比赛',
        description: '攀登技艺炉火纯青',
        icon: '🌳',
        category: 'level',
        requirement: { type: 'gamesPlayed', value: 100 }
    },
    'LEGEND': { 
        name: '传说攀登者', 
        condition: '完成1000场比赛',
        description: '成为命运塔的传说',
        icon: '👑',
        category: 'level',
        requirement: { type: 'gamesPlayed', value: 1000 }
    },
    
    // 冠军称号
    'FIRST_ASCENDER': { 
        name: '首登者', 
        condition: '首次登顶',
        description: '第一次成功登上塔顶',
        icon: '🏔️',
        category: 'champion',
        requirement: { type: 'firstWin', value: 1 }
    },
    'SPEED_DEMON': { 
        name: '速度恶魔', 
        condition: '10回合内登顶',
        description: '以最快速度完成攀登',
        icon: '⚡',
        category: 'champion',
        requirement: { type: 'fastWin', value: 10 }
    },
    'CONQUEROR': { 
        name: '全球征服者', 
        condition: '在所有国家获胜',
        description: '征服世界各地的锦标赛',
        icon: '🌍',
        category: 'champion',
        requirement: { type: 'winAllCountries', value: 196 }
    },
    'STREAK_MASTER': { 
        name: '连胜大师', 
        condition: '连胜赛13胜',
        description: '在连胜挑战中达到13连胜',
        icon: '🔥',
        category: 'champion',
        requirement: { type: 'streakWin', value: 13 }
    },
    'PERFECT_CLIMBER': {
        name: '完美攀登者',
        condition: '单局游戏完美匹配10次',
        description: '展现完美的牌技',
        icon: '💎',
        category: 'champion',
        requirement: { type: 'perfectMatches', value: 10 }
    },
    'HIGH_SCORER': {
        name: '高分猎人',
        condition: '单局获得5000分以上',
        description: '创造惊人的高分纪录',
        icon: '🎯',
        category: 'champion',
        requirement: { type: 'highScore', value: 5000 }
    },
    
    // 团队称号
    'TEAM_LEADER': { 
        name: '团队领袖', 
        condition: '带领团队胜利10次',
        description: '作为队长带领团队获胜',
        icon: '🐼',
        category: 'team',
        requirement: { type: 'teamWinsAsLeader', value: 10 }
    },
    'SUPPORTER': { 
        name: '最佳助攻', 
        condition: '赠牌帮助队友登顶20次',
        description: '无私助攻帮助队友',
        icon: '🤝',
        category: 'team',
        requirement: { type: 'assistTeammate', value: 20 }
    },
    'TEAM_PLAYER': {
        name: '团队之星',
        condition: '参与团队赛50场',
        description: '热衷于团队协作',
        icon: '⭐',
        category: 'team',
        requirement: { type: 'teamGames', value: 50 }
    },
    'LIFESAVER': {
        name: '救命稻草',
        condition: '帮助队友解除绝境10次',
        description: '关键时刻挺身而出',
        icon: '🚁',
        category: 'team',
        requirement: { type: 'saveTeammate', value: 10 }
    },
    
    // 收集称号
    'COLLECTOR': {
        name: '收藏家',
        condition: '收集10张明信片',
        description: '开始收集世界各地的回忆',
        icon: '📮',
        category: 'collection',
        requirement: { type: 'postcards', value: 10 }
    },
    'GLOBETROTTER': {
        name: '环球旅行者',
        condition: '收集50张明信片',
        description: '足迹遍布世界各地',
        icon: '✈️',
        category: 'collection',
        requirement: { type: 'postcards', value: 50 }
    },
    'WORLD_EXPLORER': {
        name: '世界探险家',
        condition: '收集100张明信片',
        description: '探索世界的每一个角落',
        icon: '🗺️',
        category: 'collection',
        requirement: { type: 'postcards', value: 100 }
    },
    'MASTER_COLLECTOR': {
        name: '收藏大师',
        condition: '收集所有196张明信片',
        description: '完成最伟大的收藏成就',
        icon: '🏆',
        category: 'collection',
        requirement: { type: 'postcards', value: 196 }
    },
    
    // 特殊称号
    'EARLY_BIRD': {
        name: '早鸟先锋',
        condition: '连续7天登录',
        description: '早起攀登命运塔',
        icon: '🐦',
        category: 'special',
        requirement: { type: 'loginStreak', value: 7 }
    },
    'NIGHT_OWL': {
        name: '夜猫子',
        condition: '在凌晨进行10场比赛',
        description: '深夜依然坚持攀登',
        icon: '🦉',
        category: 'special',
        requirement: { type: 'nightGames', value: 10 }
    },
    'SOCIALITE': {
        name: '社交达人',
        condition: '添加50位好友',
        description: '在命运塔结识众多好友',
        icon: '👥',
        category: 'special',
        requirement: { type: 'friends', value: 50 }
    },
    'SPENDER': {
        name: '挥金如土',
        condition: '累计消费10000金币',
        description: '金币如水般流淌',
        icon: '💸',
        category: 'special',
        requirement: { type: 'totalSpent', value: 10000 }
    },
    'RICH': {
        name: '富可敌国',
        condition: '同时拥有50000金币',
        description: '积累巨额财富',
        icon: '💰',
        category: 'special',
        requirement: { type: 'coins', value: 50000 }
    },
    'LUCKY': {
        name: '幸运儿',
        condition: '连续3局获得好牌',
        description: '命运女神的眷顾',
        icon: '🍀',
        category: 'special',
        requirement: { type: 'luckyStreak', value: 3 }
    },
    'COMEBACK': {
        name: '绝地反击',
        condition: '最后一名逆袭夺冠',
        description: '永不放弃的精神',
        icon: '🚀',
        category: 'special',
        requirement: { type: 'comebackWin', value: 1 }
    },
    'HAT_TRICK': {
        name: '帽子戏法',
        condition: '连续3场获得冠军',
        description: '三连冠的荣耀',
        icon: '🎩',
        category: 'special',
        requirement: { type: 'winStreak', value: 3 }
    }
};

// 称号分类
const TITLE_CATEGORIES = {
    level: { name: '等级称号', icon: '📈', color: '#4caf50' },
    champion: { name: '冠军称号', icon: '🏆', color: '#ffd700' },
    team: { name: '团队称号', icon: '👥', color: '#2196f3' },
    collection: { name: '收集称号', icon: '📮', color: '#9c27b0' },
    special: { name: '特殊称号', icon: '✨', color: '#ff5722' }
};

// ==================== 用户荣誉管理 ====================
class HonorSystem {
    constructor() {
        this.userTitles = this.loadUserTitles();
        this.equippedTitle = localStorage.getItem('towerOfFate_equippedTitle') || null;
        this.userStats = this.loadUserStats();
        this.onUnlockCallbacks = [];
        this.onEquipCallbacks = [];
    }

    // 从本地存储加载
    loadUserTitles() {
        const saved = localStorage.getItem('towerOfFate_titles');
        return saved ? JSON.parse(saved) : {};
    }

    // 加载用户统计
    loadUserStats() {
        const saved = localStorage.getItem('towerOfFate_userStats');
        return saved ? JSON.parse(saved) : {
            gamesPlayed: 0,
            gamesWon: 0,
            firstWin: false,
            fastestWin: Infinity,
            countriesWon: [],
            streakWins: 0,
            maxStreak: 0,
            perfectMatches: 0,
            maxPerfectMatches: 0,
            highScore: 0,
            teamWinsAsLeader: 0,
            assists: 0,
            teamGames: 0,
            saves: 0,
            postcards: 0,
            loginStreak: 0,
            nightGames: 0,
            friends: 0,
            totalSpent: 0,
            maxCoins: 0,
            luckyStreak: 0,
            comebackWins: 0,
            currentWinStreak: 0
        };
    }

    // 保存用户称号
    saveUserTitles() {
        localStorage.setItem('towerOfFate_titles', JSON.stringify(this.userTitles));
    }

    // 保存用户统计
    saveUserStats() {
        localStorage.setItem('towerOfFate_userStats', JSON.stringify(this.userStats));
    }

    // 更新统计
    updateStats(statUpdates) {
        Object.assign(this.userStats, statUpdates);
        this.saveUserStats();
        
        // 检查新称号
        this.checkNewTitles();
    }

    // 检查并解锁新称号
    checkNewTitles() {
        const newUnlocks = [];
        
        for (const [code, title] of Object.entries(TITLES)) {
            if (!this.userTitles[code] && this.checkRequirement(title.requirement)) {
                this.unlockTitle(code);
                newUnlocks.push({ code, ...title });
            }
        }
        
        if (newUnlocks.length > 0) {
            this.notifyUnlock(newUnlocks);
        }
        
        return newUnlocks;
    }

    // 检查条件
    checkRequirement(requirement) {
        const { type, value } = requirement;
        const stats = this.userStats;
        
        switch (type) {
            case 'gamesPlayed':
                return stats.gamesPlayed >= value;
            case 'firstWin':
                return stats.firstWin;
            case 'fastWin':
                return stats.fastestWin <= value;
            case 'winAllCountries':
                return stats.countriesWon.length >= value;
            case 'streakWin':
                return stats.maxStreak >= value;
            case 'perfectMatches':
                return stats.maxPerfectMatches >= value;
            case 'highScore':
                return stats.highScore >= value;
            case 'teamWinsAsLeader':
                return stats.teamWinsAsLeader >= value;
            case 'assistTeammate':
                return stats.assists >= value;
            case 'teamGames':
                return stats.teamGames >= value;
            case 'saveTeammate':
                return stats.saves >= value;
            case 'postcards':
                return stats.postcards >= value;
            case 'loginStreak':
                return stats.loginStreak >= value;
            case 'nightGames':
                return stats.nightGames >= value;
            case 'friends':
                return stats.friends >= value;
            case 'totalSpent':
                return stats.totalSpent >= value;
            case 'coins':
                return stats.maxCoins >= value;
            case 'luckyStreak':
                return stats.luckyStreak >= value;
            case 'comebackWin':
                return stats.comebackWins >= value;
            case 'winStreak':
                return stats.currentWinStreak >= value;
            default:
                return false;
        }
    }

    // 解锁称号
    unlockTitle(code) {
        this.userTitles[code] = {
            code,
            unlockedAt: new Date().toISOString(),
            isNew: true
        };
        this.saveUserTitles();
    }

    // 装备称号
    equipTitle(code) {
        if (this.userTitles[code]) {
            this.equippedTitle = code;
            localStorage.setItem('towerOfFate_equippedTitle', code);
            this.notifyEquip(code);
            return true;
        }
        return false;
    }

    // 卸下称号
    unequipTitle() {
        this.equippedTitle = null;
        localStorage.removeItem('towerOfFate_equippedTitle');
        this.notifyEquip(null);
    }

    // 获取当前装备的称号
    getEquippedTitle() {
        if (this.equippedTitle && TITLES[this.equippedTitle]) {
            return {
                code: this.equippedTitle,
                ...TITLES[this.equippedTitle],
                userData: this.userTitles[this.equippedTitle]
            };
        }
        return null;
    }

    // 获取装备的称号显示文本
    getEquippedTitleDisplay() {
        const title = this.getEquippedTitle();
        if (title) {
            return `[${title.icon} ${title.name}]`;
        }
        return '';
    }

    // 获取所有称号
    getAllTitles() {
        return Object.entries(TITLES).map(([code, data]) => ({
            code,
            ...data,
            isUnlocked: !!this.userTitles[code],
            isEquipped: this.equippedTitle === code,
            userData: this.userTitles[code] || null,
            progress: this.getProgress(data.requirement)
        }));
    }

    // 按分类获取称号
    getTitlesByCategory(category) {
        return this.getAllTitles().filter(t => t.category === category);
    }

    // 获取进度
    getProgress(requirement) {
        const { type, value } = requirement;
        const stats = this.userStats;
        let current = 0;
        
        switch (type) {
            case 'gamesPlayed':
                current = stats.gamesPlayed;
                break;
            case 'winAllCountries':
                current = stats.countriesWon.length;
                break;
            case 'streakWin':
                current = stats.maxStreak;
                break;
            case 'perfectMatches':
                current = stats.maxPerfectMatches;
                break;
            case 'highScore':
                current = stats.highScore;
                break;
            case 'teamWinsAsLeader':
                current = stats.teamWinsAsLeader;
                break;
            case 'assistTeammate':
                current = stats.assists;
                break;
            case 'teamGames':
                current = stats.teamGames;
                break;
            case 'saveTeammate':
                current = stats.saves;
                break;
            case 'postcards':
                current = stats.postcards;
                break;
            case 'loginStreak':
                current = stats.loginStreak;
                break;
            case 'nightGames':
                current = stats.nightGames;
                break;
            case 'friends':
                current = stats.friends;
                break;
            case 'totalSpent':
                current = stats.totalSpent;
                break;
            case 'coins':
                current = stats.maxCoins;
                break;
            case 'luckyStreak':
                current = stats.luckyStreak;
                break;
            case 'comebackWin':
                current = stats.comebackWins;
                break;
            case 'winStreak':
                current = stats.currentWinStreak;
                break;
            default:
                current = 0;
        }
        
        return {
            current,
            target: value,
            percentage: Math.min((current / value) * 100, 100)
        };
    }

    // 获取统计摘要
    getStatsSummary() {
        const total = Object.keys(TITLES).length;
        const unlocked = Object.keys(this.userTitles).length;
        
        return {
            total,
            unlocked,
            percentage: Math.round((unlocked / total) * 100),
            byCategory: Object.keys(TITLE_CATEGORIES).map(cat => ({
                category: cat,
                ...TITLE_CATEGORIES[cat],
                unlocked: this.getTitlesByCategory(cat).filter(t => t.isUnlocked).length,
                total: this.getTitlesByCategory(cat).length
            }))
        };
    }

    // 标记为已查看
    markAsViewed(code) {
        if (this.userTitles[code]) {
            this.userTitles[code].isNew = false;
            this.saveUserTitles();
        }
    }

    // 记录比赛结果
    recordGameResult(result) {
        const updates = {};
        
        updates.gamesPlayed = this.userStats.gamesPlayed + 1;
        
        if (result.won) {
            updates.gamesWon = this.userStats.gamesWon + 1;
            updates.firstWin = true;
            updates.currentWinStreak = this.userStats.currentWinStreak + 1;
            updates.maxStreak = Math.max(this.userStats.maxStreak, updates.currentWinStreak);
            
            if (result.rounds && result.rounds < this.userStats.fastestWin) {
                updates.fastestWin = result.rounds;
            }
            
            if (result.countryCode && !this.userStats.countriesWon.includes(result.countryCode)) {
                updates.countriesWon = [...this.userStats.countriesWon, result.countryCode];
            }
            
            if (result.perfectMatches) {
                updates.maxPerfectMatches = Math.max(this.userStats.maxPerfectMatches, result.perfectMatches);
            }
            
            if (result.score && result.score > this.userStats.highScore) {
                updates.highScore = result.score;
            }
            
            if (result.isComeback) {
                updates.comebackWins = this.userStats.comebackWins + 1;
            }
        } else {
            updates.currentWinStreak = 0;
        }
        
        this.updateStats(updates);
    }

    // 注册解锁回调
    onUnlock(callback) {
        this.onUnlockCallbacks.push(callback);
    }

    // 注册装备回调
    onEquip(callback) {
        this.onEquipCallbacks.push(callback);
    }

    // 通知解锁
    notifyUnlock(newUnlocks) {
        this.onUnlockCallbacks.forEach(callback => callback(newUnlocks));
    }

    // 通知装备
    notifyEquip(code) {
        this.onEquipCallbacks.forEach(callback => callback(code));
    }
}

// ==================== 荣誉墙展示 ====================
class HonorWall {
    constructor(containerId, honorSystem) {
        this.container = document.getElementById(containerId);
        this.honorSystem = honorSystem;
        this.currentCategory = 'all';
        this.showProgress = true;
    }

    // 初始化
    init() {
        this.render();
        this.honorSystem.onUnlock(() => this.render());
        this.honorSystem.onEquip(() => this.render());
    }

    // 渲染荣誉墙
    render() {
        if (!this.container) return;

        const summary = this.honorSystem.getStatsSummary();
        const titles = this.getFilteredTitles();

        this.container.innerHTML = `
            <div class="honor-header">
                <h2>🏆 荣誉墙 (${summary.unlocked}/${summary.total})</h2>
                <div class="honor-progress">
                    <div class="progress-ring">
                        <svg viewBox="0 0 36 36">
                            <path class="progress-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                            <path class="progress-fill" stroke-dasharray="${summary.percentage}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                        </svg>
                        <div class="progress-text">${summary.percentage}%</div>
                    </div>
                </div>
            </div>
            
            <div class="category-tabs">
                <button class="tab-btn ${this.currentCategory === 'all' ? 'active' : ''}" 
                        onclick="honorWall.setCategory('all')">
                    全部
                </button>
                ${summary.byCategory.map(cat => `
                    <button class="tab-btn ${this.currentCategory === cat.category ? 'active' : ''}" 
                            onclick="honorWall.setCategory('${cat.category}')"
                            style="--category-color: ${cat.color}">
                        ${cat.icon} ${cat.name}
                        <span class="tab-count">${cat.unlocked}/${cat.total}</span>
                    </button>
                `).join('')}
            </div>
            
            <div class="titles-grid">
                ${titles.map(title => this.createTitleCard(title)).join('')}
            </div>
        `;

        this.attachEventListeners();
    }

    // 创建称号卡片
    createTitleCard(title) {
        const category = TITLE_CATEGORIES[title.category];
        const isEquipped = title.isEquipped;
        
        return `
            <div class="title-card ${title.isUnlocked ? 'unlocked' : 'locked'} ${isEquipped ? 'equipped' : ''} ${title.userData?.isNew ? 'new' : ''}"
                 style="--category-color: ${category.color}">
                <div class="title-icon">${title.icon}</div>
                <div class="title-info">
                    <div class="title-name">${title.name}</div>
                    <div class="title-description">${title.description}</div>
                    ${title.isUnlocked ? `
                        <div class="title-condition">✓ ${title.condition}</div>
                        ${title.userData ? `<div class="unlock-date">${new Date(title.userData.unlockedAt).toLocaleDateString()}</div>` : ''}
                    ` : `
                        <div class="title-condition">🔒 ${title.condition}</div>
                        ${this.showProgress ? `
                            <div class="title-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${title.progress.percentage}%"></div>
                                </div>
                                <span class="progress-text">${title.progress.current}/${title.progress.target}</span>
                            </div>
                        ` : ''}
                    `}
                </div>
                ${title.isUnlocked ? `
                    <button class="equip-btn ${isEquipped ? 'equipped' : ''}" 
                            onclick="honorWall.toggleEquip('${title.code}', event)">
                        ${isEquipped ? '已装备' : '装备'}
                    </button>
                ` : ''}
                ${title.userData?.isNew ? '<div class="new-badge">NEW</div>' : ''}
            </div>
        `;
    }

    // 设置分类
    setCategory(category) {
        this.currentCategory = category;
        this.render();
    }

    // 获取筛选后的称号
    getFilteredTitles() {
        if (this.currentCategory === 'all') {
            return this.honorSystem.getAllTitles();
        }
        return this.honorSystem.getTitlesByCategory(this.currentCategory);
    }

    // 切换装备
    toggleEquip(code, event) {
        event.stopPropagation();
        
        if (this.honorSystem.equippedTitle === code) {
            this.honorSystem.unequipTitle();
        } else {
            this.honorSystem.equipTitle(code);
            this.honorSystem.markAsViewed(code);
        }
        this.render();
    }

    // 附加事件监听
    attachEventListeners() {
        const cards = this.container.querySelectorAll('.title-card.unlocked');
        cards.forEach(card => {
            card.addEventListener('click', () => {
                const code = card.querySelector('.equip-btn')?.getAttribute('onclick')?.match(/'([^']+)'/)?.[1];
                if (code) {
                    this.honorSystem.markAsViewed(code);
                    card.classList.remove('new');
                }
            });
        });
    }
}

// ==================== 称号显示组件 ====================
class TitleDisplay {
    constructor(elementId, honorSystem) {
        this.element = document.getElementById(elementId);
        this.honorSystem = honorSystem;
    }

    // 初始化
    init() {
        this.render();
        this.honorSystem.onEquip(() => this.render());
    }

    // 渲染
    render() {
        if (!this.element) return;

        const title = this.honorSystem.getEquippedTitle();
        if (title) {
            const category = TITLE_CATEGORIES[title.category];
            this.element.innerHTML = `
                <span class="player-title" style="color: ${category.color}">
                    ${title.icon} ${title.name}
                </span>
            `;
        } else {
            this.element.innerHTML = '';
        }
    }
}

// ==================== 初始化 ====================
let honorSystem;
let honorWall;
let titleDisplay;

function initHonorSystem() {
    honorSystem = new HonorSystem();
    
    // 初始化荣誉墙
    const wallContainer = document.getElementById('honorWall');
    if (wallContainer) {
        honorWall = new HonorWall('honorWall', honorSystem);
        honorWall.init();
    }
    
    // 初始化称号显示
    const displayElement = document.getElementById('playerTitle');
    if (displayElement) {
        titleDisplay = new TitleDisplay('playerTitle', honorSystem);
        titleDisplay.init();
    }
    
    // 检查新称号
    honorSystem.checkNewTitles();
    
    return honorSystem;
}

// 导出
window.HonorSystem = HonorSystem;
window.HonorWall = HonorWall;
window.TitleDisplay = TitleDisplay;
window.honorSystem = honorSystem;
window.honorWall = honorWall;
window.titleDisplay = titleDisplay;
window.initHonorSystem = initHonorSystem;
window.TITLES = TITLES;
window.TITLE_CATEGORIES = TITLE_CATEGORIES;
