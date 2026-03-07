/**
 * 命运塔 - 积分系统
 * Tower of Fate - Points System
 * 
 * 功能：
 * - 游戏积分计算（胜利+200基础分，按贡献分配800分）
 * - 排行榜积分实时更新
 * - 赛季积分清零与奖励发放
 * - 积分兑换商城
 */

class PointsSystem {
    constructor() {
        // 积分配置
        this.config = {
            baseWinPoints: 200,        // 胜利基础分
            contributionPoints: 800,   // 按贡献分配的总分
            lossPoints: 50,            // 参与分
            dailyMaxPoints: 5000,      // 每日上限
            seasonDuration: 30,        // 赛季天数
        };
        
        // 赛季信息
        this.season = this.loadSeasonData();
        
        // 积分数据
        this.data = this.loadPointsData();
        
        // 排行榜
        this.leaderboards = {
            daily: [],
            weekly: [],
            season: [],
            allTime: []
        };
        
        // 初始化
        this.init();
    }
    
    init() {
        this.checkSeasonReset();
        this.updateLeaderboards();
        console.log('🏆 积分系统已初始化');
    }
    
    // ==================== 数据存储 ====================
    
    loadPointsData() {
        try {
            const saved = localStorage.getItem('tower_points_data');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('加载积分数据失败:', e);
        }
        
        return {
            totalPoints: 0,
            seasonPoints: 0,
            todayPoints: 0,
            lastUpdate: Date.now(),
            history: [],
            exchangeHistory: [],
            achievements: []
        };
    }
    
    savePointsData() {
        try {
            localStorage.setItem('tower_points_data', JSON.stringify(this.data));
        } catch (e) {
            console.warn('保存积分数据失败:', e);
        }
    }
    
    loadSeasonData() {
        try {
            const saved = localStorage.getItem('tower_season_data');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('加载赛季数据失败:', e);
        }
        
        return {
            seasonId: 1,
            seasonName: '第一赛季',
            startDate: Date.now(),
            endDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
            rewardsDistributed: false
        };
    }
    
    saveSeasonData() {
        try {
            localStorage.setItem('tower_season_data', JSON.stringify(this.season));
        } catch (e) {
            console.warn('保存赛季数据失败:', e);
        }
    }
    
    // ==================== 积分计算 ====================
    
    /**
     * 计算对局积分
     * @param {Object} matchData - 对局数据
     * @param {string} playerId - 玩家ID
     * @returns {Object} 积分结果
     */
    calculateMatchPoints(matchData, playerId) {
        const { result, position, stats, isWin, contributions } = matchData;
        
        let points = 0;
        let details = [];
        
        // 基础分
        if (isWin) {
            points += this.config.baseWinPoints;
            details.push({ type: '基础胜利分', points: this.config.baseWinPoints });
        } else {
            points += this.config.lossPoints;
            details.push({ type: '参与鼓励分', points: this.config.lossPoints });
        }
        
        // 按贡献分配（仅胜利者）
        if (isWin && contributions) {
            const contributionPercent = contributions[playerId] || 0.25;
            const contributionPoints = Math.floor(this.config.contributionPoints * contributionPercent);
            points += contributionPoints;
            details.push({ type: '贡献分', points: contributionPoints, percent: Math.floor(contributionPercent * 100) });
        }
        
        // 排名加成
        if (position === 1) {
            points += 100;
            details.push({ type: '冠军加成', points: 100 });
        } else if (position === 2) {
            points += 50;
            details.push({ type: '亚军加成', points: 50 });
        } else if (position === 3) {
            points += 25;
            details.push({ type: '季军加成', points: 25 });
        }
        
        // 特殊成就
        if (stats) {
            // 无伤胜利
            if (stats.noDamage) {
                points += 50;
                details.push({ type: '完美胜利', points: 50 });
            }
            
            // 快速胜利
            if (stats.fastWin) {
                points += 30;
                details.push({ type: '速胜奖励', points: 30 });
            }
            
            // 激怒牌使用
            if (stats.rageCardsUsed >= 5) {
                points += 20;
                details.push({ type: '激怒大师', points: 20 });
            }
            
            // 连续胜利
            if (stats.streak >= 3) {
                const streakBonus = stats.streak * 10;
                points += streakBonus;
                details.push({ type: '连胜奖励', points: streakBonus, streak: stats.streak });
            }
        }
        
        // 检查每日上限
        const today = new Date().toDateString();
        const lastUpdate = new Date(this.data.lastUpdate).toDateString();
        
        if (today !== lastUpdate) {
            this.data.todayPoints = 0;
            this.data.lastUpdate = Date.now();
        }
        
        const remainingDaily = this.config.dailyMaxPoints - this.data.todayPoints;
        const actualPoints = Math.min(points, remainingDaily);
        
        if (actualPoints < points) {
            details.push({ type: '每日上限', points: -(points - actualPoints), note: '已达今日上限' });
        }
        
        return {
            total: actualPoints,
            details: details,
            remainingDaily: this.config.dailyMaxPoints - this.data.todayPoints - actualPoints
        };
    }
    
    /**
     * 添加积分
     */
    addPoints(points, source, details = {}) {
        this.data.totalPoints += points;
        this.data.seasonPoints += points;
        this.data.todayPoints += points;
        
        // 记录历史
        this.data.history.unshift({
            points: points,
            source: source,
            details: details,
            timestamp: Date.now()
        });
        
        // 只保留最近100条
        if (this.data.history.length > 100) {
            this.data.history.pop();
        }
        
        this.savePointsData();
        this.checkAchievements();
        
        return {
            total: this.data.totalPoints,
            season: this.data.seasonPoints,
            today: this.data.todayPoints,
            added: points
        };
    }
    
    /**
     * 记录对局积分
     */
    recordMatchPoints(matchData, playerId) {
        const calculation = this.calculateMatchPoints(matchData, playerId);
        
        if (calculation.total > 0) {
            const result = this.addPoints(calculation.total, 'match', {
                matchId: matchData.matchId,
                position: matchData.position,
                details: calculation.details
            });
            
            // 埋点
            if (window.track) {
                window.track('points_earned', {
                    amount: calculation.total,
                    source: 'match',
                    season_points: result.season
                });
            }
            
            return { ...calculation, newBalance: result };
        }
        
        return calculation;
    }
    
    // ==================== 赛季管理 ====================
    
    /**
     * 检查赛季重置
     */
    checkSeasonReset() {
        const now = Date.now();
        
        if (now >= this.season.endDate) {
            this.endSeason();
        }
    }
    
    /**
     * 结束赛季
     */
    endSeason() {
        if (this.season.rewardsDistributed) {
            return;
        }
        
        console.log(`[积分系统] 赛季 ${this.season.seasonName} 结束，发放奖励...`);
        
        // 计算排名
        const rank = this.getSeasonRank();
        
        // 发放奖励
        const rewards = this.calculateSeasonRewards(rank);
        this.distributeRewards(rewards);
        
        // 记录赛季历史
        this.recordSeasonHistory();
        
        // 重置数据
        this.data.seasonPoints = 0;
        this.data.history = [];
        this.savePointsData();
        
        // 开始新赛季
        this.startNewSeason();
        
        this.season.rewardsDistributed = true;
        this.saveSeasonData();
        
        // 埋点
        if (window.track) {
            window.track('season_end', {
                season_id: this.season.seasonId,
                season_name: this.season.seasonName,
                final_rank: rank,
                rewards: rewards
            });
        }
    }
    
    /**
     * 开始新赛季
     */
    startNewSeason() {
        const newSeasonId = this.season.seasonId + 1;
        
        this.season = {
            seasonId: newSeasonId,
            seasonName: `第${this.numberToChinese(newSeasonId)}赛季`,
            startDate: Date.now(),
            endDate: Date.now() + (this.config.seasonDuration * 24 * 60 * 60 * 1000),
            rewardsDistributed: false
        };
        
        this.saveSeasonData();
        
        console.log(`[积分系统] 新赛季开始: ${this.season.seasonName}`);
        
        // 埋点
        if (window.track) {
            window.track('season_start', {
                season_id: this.season.seasonId,
                season_name: this.season.seasonName,
                end_date: this.season.endDate
            });
        }
    }
    
    /**
     * 计算赛季奖励
     */
    calculateSeasonRewards(rank) {
        const rewards = {
            coins: 0,
            gems: 0,
            items: [],
            title: null,
            skin: null
        };
        
        if (rank === 1) {
            rewards.coins = 50000;
            rewards.gems = 1000;
            rewards.title = '赛季之王';
            rewards.skin = 'season_king_skin';
            rewards.items = ['item_steal', 'item_bomb', 'item_freeze'];
        } else if (rank <= 10) {
            rewards.coins = 30000;
            rewards.gems = 500;
            rewards.title = '赛季前十';
            rewards.items = ['item_steal', 'item_bomb'];
        } else if (rank <= 100) {
            rewards.coins = 15000;
            rewards.gems = 200;
            rewards.title = '赛季百强';
            rewards.items = ['item_steal'];
        } else if (rank <= 1000) {
            rewards.coins = 5000;
            rewards.gems = 50;
        } else if (this.data.seasonPoints >= 1000) {
            rewards.coins = 1000;
        }
        
        return rewards;
    }
    
    /**
     * 发放奖励
     */
    distributeRewards(rewards) {
        // 这里应该调用游戏内奖励系统
        console.log('[积分系统] 发放赛季奖励:', rewards);
        
        // 记录成就
        if (rewards.title) {
            this.data.achievements.push({
                type: 'season_title',
                title: rewards.title,
                season: this.season.seasonName,
                timestamp: Date.now()
            });
        }
        
        this.savePointsData();
    }
    
    /**
     * 获取赛季排名
     */
    getSeasonRank() {
        // 从排行榜获取排名
        const seasonLeaderboard = this.leaderboards.season;
        const myEntry = seasonLeaderboard.find(e => e.playerId === this.getPlayerId());
        return myEntry ? myEntry.rank : seasonLeaderboard.length + 1;
    }
    
    /**
     * 记录赛季历史
     */
    recordSeasonHistory() {
        const history = JSON.parse(localStorage.getItem('tower_season_history') || '[]');
        history.push({
            seasonId: this.season.seasonId,
            seasonName: this.season.seasonName,
            finalPoints: this.data.seasonPoints,
            rank: this.getSeasonRank(),
            timestamp: Date.now()
        });
        localStorage.setItem('tower_season_history', JSON.stringify(history.slice(-10)));
    }
    
    // ==================== 排行榜 ====================
    
    /**
     * 更新排行榜
     */
    updateLeaderboards() {
        // 从服务器或本地获取数据
        this.leaderboards = {
            daily: this.generateMockLeaderboard('daily', 20),
            weekly: this.generateMockLeaderboard('weekly', 50),
            season: this.generateMockLeaderboard('season', 100),
            allTime: this.generateMockLeaderboard('allTime', 100)
        };
        
        // 插入自己
        this.insertPlayerToLeaderboards();
    }
    
    /**
     * 生成模拟排行榜数据
     */
    generateMockLeaderboard(type, count) {
        const names = ['王者', '大师', '传说', '精英', '勇士', '骑士', '卫士', '学徒'];
        const data = [];
        
        for (let i = 1; i <= count; i++) {
            const basePoints = type === 'daily' ? 500 : type === 'weekly' ? 3000 : type === 'season' ? 15000 : 50000;
            data.push({
                rank: i,
                playerId: `player_${i}`,
                name: `${names[Math.floor(Math.random() * names.length)]}_${i}`,
                avatar: ['👤', '🎭', '🎪', '🎯', '🎨'][i % 5],
                points: Math.floor(basePoints * (1 - i / count) + Math.random() * basePoints * 0.2),
                level: Math.floor(Math.random() * 50) + 1
            });
        }
        
        return data;
    }
    
    /**
     * 插入玩家到排行榜
     */
    insertPlayerToLeaderboards() {
        const playerId = this.getPlayerId();
        const playerName = this.getPlayerName();
        
        // 赛季排行榜
        const seasonEntry = {
            rank: 0,
            playerId: playerId,
            name: playerName,
            avatar: '👑',
            points: this.data.seasonPoints,
            level: 30,
            isMe: true
        };
        
        // 找到正确位置插入
        let inserted = false;
        for (let i = 0; i < this.leaderboards.season.length; i++) {
            if (this.leaderboards.season[i].points < this.data.seasonPoints) {
                seasonEntry.rank = i + 1;
                this.leaderboards.season.splice(i, 0, seasonEntry);
                inserted = true;
                break;
            }
        }
        
        if (!inserted) {
            seasonEntry.rank = this.leaderboards.season.length + 1;
            this.leaderboards.season.push(seasonEntry);
        }
        
        // 更新后续排名
        for (let i = seasonEntry.rank; i < this.leaderboards.season.length; i++) {
            this.leaderboards.season[i].rank = i + 1;
        }
    }
    
    /**
     * 获取排行榜
     */
    getLeaderboard(type = 'season', limit = 50) {
        return this.leaderboards[type]?.slice(0, limit) || [];
    }
    
    // ==================== 积分兑换 ====================
    
    /**
     * 获取兑换商品
     */
    getExchangeItems() {
        return [
            { id: 'exchange_coins_1000', name: '1000金币', icon: '🪙', price: 100, type: 'coins', amount: 1000 },
            { id: 'exchange_coins_5000', name: '5000金币', icon: '🪙', price: 450, type: 'coins', amount: 5000 },
            { id: 'exchange_coins_10000', name: '10000金币', icon: '🪙', price: 800, type: 'coins', amount: 10000 },
            { id: 'exchange_gems_50', name: '50钻石', icon: '💎', price: 500, type: 'gems', amount: 50 },
            { id: 'exchange_gems_100', name: '100钻石', icon: '💎', price: 900, type: 'gems', amount: 100 },
            { id: 'exchange_xray_3', name: '透视卡×3', icon: '👁️', price: 300, type: 'item', itemId: 'item_xray', count: 3 },
            { id: 'exchange_shield_3', name: '护盾卡×3', icon: '🛡️', price: 250, type: 'item', itemId: 'item_shield', count: 3 },
            { id: 'exchange_speed_5', name: '加速卡×5', icon: '⚡', price: 200, type: 'item', itemId: 'item_speed', count: 5 },
            { id: 'exchange_skin_box', name: '随机皮肤箱', icon: '🎁', price: 1000, type: 'random_skin' },
            { id: 'exchange_cardback_box', name: '随机卡背箱', icon: '🃏', price: 600, type: 'random_cardback' },
            { id: 'exchange_title_points', name: '积分达人称号', icon: '👑', price: 2000, type: 'title', titleId: 'title_points_master' },
            { id: 'exchange_title_veteran', name: '资深玩家称号', icon: '🎖️', price: 5000, type: 'title', titleId: 'title_veteran' }
        ];
    }
    
    /**
     * 兑换商品
     */
    exchangeItem(itemId) {
        const items = this.getExchangeItems();
        const item = items.find(i => i.id === itemId);
        
        if (!item) {
            return { success: false, error: '商品不存在' };
        }
        
        if (this.data.totalPoints < item.price) {
            return { success: false, error: '积分不足' };
        }
        
        // 扣除积分
        this.data.totalPoints -= item.price;
        
        // 记录兑换历史
        this.data.exchangeHistory.unshift({
            itemId: item.id,
            itemName: item.name,
            price: item.price,
            timestamp: Date.now()
        });
        
        this.savePointsData();
        
        // 埋点
        if (window.track) {
            window.track('points_exchange', {
                item_id: item.id,
                item_name: item.name,
                price: item.price,
                remaining_points: this.data.totalPoints
            });
        }
        
        return {
            success: true,
            item: item,
            remainingPoints: this.data.totalPoints
        };
    }
    
    // ==================== 成就检查 ====================
    
    checkAchievements() {
        const newAchievements = [];
        
        // 首次获得积分
        if (this.data.totalPoints >= 100 && !this.hasAchievement('first_points')) {
            newAchievements.push({ id: 'first_points', name: '初出茅庐', desc: '累计获得100积分' });
        }
        
        // 积分 milestones
        const milestones = [1000, 5000, 10000, 50000, 100000];
        milestones.forEach(m => {
            if (this.data.totalPoints >= m && !this.hasAchievement(`points_${m}`)) {
                newAchievements.push({ id: `points_${m}`, name: `积分达人 ${m}`, desc: `累计获得${m}积分` });
            }
        });
        
        // 赛季积分
        if (this.data.seasonPoints >= 5000 && !this.hasAchievement('season_5000')) {
            newAchievements.push({ id: 'season_5000', name: '赛季先锋', desc: '单赛季获得5000积分' });
        }
        
        // 添加新成就
        newAchievements.forEach(ach => {
            this.data.achievements.push({
                ...ach,
                timestamp: Date.now()
            });
        });
        
        if (newAchievements.length > 0) {
            this.savePointsData();
        }
        
        return newAchievements;
    }
    
    hasAchievement(id) {
        return this.data.achievements.some(a => a.id === id);
    }
    
    // ==================== 辅助方法 ====================
    
    getPlayerId() {
        return localStorage.getItem('tower_player_id') || 'player_guest';
    }
    
    getPlayerName() {
        return localStorage.getItem('tower_player_name') || '玩家';
    }
    
    numberToChinese(num) {
        const chinese = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
        if (num <= 10) return chinese[num];
        if (num < 20) return '十' + chinese[num - 10];
        return num.toString();
    }
    
    // ==================== 获取统计 ====================
    
    getStats() {
        const seasonHistory = JSON.parse(localStorage.getItem('tower_season_history') || '[]');
        
        return {
            totalPoints: this.data.totalPoints,
            seasonPoints: this.data.seasonPoints,
            todayPoints: this.data.todayPoints,
            dailyMax: this.config.dailyMaxPoints,
            season: {
                id: this.season.seasonId,
                name: this.season.seasonName,
                endDate: this.season.endDate,
                daysRemaining: Math.ceil((this.season.endDate - Date.now()) / (24 * 60 * 60 * 1000))
            },
            rank: this.getSeasonRank(),
            history: this.data.history.slice(0, 10),
            achievements: this.data.achievements,
            seasonHistory: seasonHistory
        };
    }
}

// ==================== 全局实例 ====================
let pointsSystem = null;

function initPointsSystem() {
    pointsSystem = new PointsSystem();
    return pointsSystem;
}

function getPointsSystem() {
    if (!pointsSystem) {
        pointsSystem = new PointsSystem();
    }
    return pointsSystem;
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PointsSystem, initPointsSystem, getPointsSystem };
}

if (typeof window !== 'undefined') {
    window.PointsSystem = PointsSystem;
    window.initPointsSystem = initPointsSystem;
    window.getPointsSystem = getPointsSystem;
}
