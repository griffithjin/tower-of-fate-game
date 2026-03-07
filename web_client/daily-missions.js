/**
 * 命运塔 - 每日任务系统
 * Tower of Fate - Daily Missions System
 * 
 * 功能：每日刷新任务、进度追踪、奖励发放、本地存储
 * Features: Daily refresh, progress tracking, rewards, local storage
 */

// 任务类型定义
const MISSION_TYPES = {
    PLAY_MATCHES: 'play_matches',           // 进行X场对战
    REACH_TOP: 'reach_top',                 // 登顶X次
    USE_ENRAGE_CARDS: 'use_enrage_cards',   // 使用激怒牌X次
    WIN_MATCHES: 'win_matches',             // 赢得X场胜利
    CLIMB_FLOORS: 'climb_floors',           // 累计爬升X层
    BUY_SHOP_ITEMS: 'buy_shop_items'        // 购买商店物品
};

// 任务模板配置
const MISSION_TEMPLATES = [
    {
        type: MISSION_TYPES.PLAY_MATCHES,
        name: '勇者试炼',
        description: '进行 {target} 场对战',
        minTarget: 3,
        maxTarget: 10,
        rewards: { gold: 100, exp: 50, battlePass: 10 }
    },
    {
        type: MISSION_TYPES.REACH_TOP,
        name: '巅峰之王',
        description: '登顶 {target} 次',
        minTarget: 1,
        maxTarget: 5,
        rewards: { gold: 200, exp: 100, battlePass: 20 }
    },
    {
        type: MISSION_TYPES.USE_ENRAGE_CARDS,
        name: '怒火中烧',
        description: '使用激怒牌 {target} 次',
        minTarget: 5,
        maxTarget: 20,
        rewards: { gold: 150, exp: 75, battlePass: 15 }
    },
    {
        type: MISSION_TYPES.WIN_MATCHES,
        name: '常胜将军',
        description: '赢得 {target} 场胜利',
        minTarget: 2,
        maxTarget: 8,
        rewards: { gold: 180, exp: 90, battlePass: 18 }
    },
    {
        type: MISSION_TYPES.CLIMB_FLOORS,
        name: '攀登者',
        description: '累计爬升 {target} 层',
        minTarget: 20,
        maxTarget: 100,
        rewards: { gold: 250, exp: 125, battlePass: 25 }
    },
    {
        type: MISSION_TYPES.BUY_SHOP_ITEMS,
        name: '购物狂',
        description: '在商店购买 {target} 个物品',
        minTarget: 1,
        maxTarget: 5,
        rewards: { gold: 120, exp: 60, battlePass: 12 }
    }
];

// 存储键名
const STORAGE_KEY = 'tof_daily_missions';
const LAST_REFRESH_KEY = 'tof_last_refresh';

/**
 * 每日任务管理器类
 */
class DailyMissionManager {
    constructor() {
        this.missions = [];
        this.listeners = new Set();
        this.loadFromStorage();
        this.checkAndRefresh();
    }

    /**
     * 生成随机整数
     */
    static randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * 获取今天的日期字符串 (YYYY-MM-DD)
     */
    static getTodayString() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * 从本地存储加载任务
     */
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                this.missions = JSON.parse(saved);
            }
        } catch (error) {
            console.warn('[DailyMissions] 加载存储失败:', error);
            this.missions = [];
        }
    }

    /**
     * 保存任务到本地存储
     */
    saveToStorage() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.missions));
            localStorage.setItem(LAST_REFRESH_KEY, DailyMissionManager.getTodayString());
        } catch (error) {
            console.error('[DailyMissions] 保存存储失败:', error);
        }
    }

    /**
     * 检查并刷新每日任务
     */
    checkAndRefresh() {
        const lastRefresh = localStorage.getItem(LAST_REFRESH_KEY);
        const today = DailyMissionManager.getTodayString();

        if (lastRefresh !== today || this.missions.length === 0) {
            this.generateDailyMissions();
            return true;
        }
        return false;
    }

    /**
     * 生成5个随机每日任务
     */
    generateDailyMissions() {
        const shuffled = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 5);

        this.missions = selected.map((template, index) => ({
            id: `mission_${Date.now()}_${index}`,
            type: template.type,
            name: template.name,
            description: template.description,
            target: DailyMissionManager.randomInt(template.minTarget, template.maxTarget),
            current: 0,
            completed: false,
            claimed: false,
            rewards: { ...template.rewards },
            createdAt: new Date().toISOString()
        }));

        this.saveToStorage();
        this.notifyListeners('refresh', this.missions);
        console.log('[DailyMissions] 已生成新的每日任务:', this.missions);
    }

    /**
     * 获取所有任务
     */
    getMissions() {
        this.checkAndRefresh();
        return [...this.missions];
    }

    /**
     * 获取进行中的任务
     */
    getActiveMissions() {
        return this.missions.filter(m => !m.completed);
    }

    /**
     * 获取已完成的任务
     */
    getCompletedMissions() {
        return this.missions.filter(m => m.completed && !m.claimed);
    }

    /**
     * 获取可领取奖励的任务
     */
    getClaimableMissions() {
        return this.missions.filter(m => m.completed && !m.claimed);
    }

    /**
     * 更新任务进度
     * @param {string} type - 任务类型
     * @param {number} amount - 增加的数量（默认1）
     */
    updateProgress(type, amount = 1) {
        let hasUpdate = false;
        const completedMissions = [];

        this.missions.forEach(mission => {
            if (mission.type === type && !mission.completed) {
                const oldProgress = mission.current;
                mission.current = Math.min(mission.current + amount, mission.target);
                
                if (mission.current >= mission.target && oldProgress < mission.target) {
                    mission.completed = true;
                    completedMissions.push(mission);
                }
                hasUpdate = true;
            }
        });

        if (hasUpdate) {
            this.saveToStorage();
            this.notifyListeners('progress', this.missions);
            
            // 触发完成通知
            completedMissions.forEach(mission => {
                this.showCompletionNotification(mission);
                this.notifyListeners('complete', mission);
            });
        }

        return completedMissions;
    }

    /**
     * 设置任务进度（直接设置值）
     * @param {string} type - 任务类型
     * @param {number} value - 设置的值
     */
    setProgress(type, value) {
        let hasUpdate = false;
        const completedMissions = [];

        this.missions.forEach(mission => {
            if (mission.type === type && !mission.completed) {
                const oldProgress = mission.current;
                mission.current = Math.min(Math.max(0, value), mission.target);
                
                if (mission.current >= mission.target && oldProgress < mission.target) {
                    mission.completed = true;
                    completedMissions.push(mission);
                }
                hasUpdate = true;
            }
        });

        if (hasUpdate) {
            this.saveToStorage();
            this.notifyListeners('progress', this.missions);
            
            completedMissions.forEach(mission => {
                this.showCompletionNotification(mission);
                this.notifyListeners('complete', mission);
            });
        }

        return completedMissions;
    }

    /**
     * 领取任务奖励
     * @param {string} missionId - 任务ID
     * @returns {Object|null} 奖励对象或null
     */
    claimReward(missionId) {
        const mission = this.missions.find(m => m.id === missionId);
        
        if (!mission) {
            console.warn('[DailyMissions] 任务不存在:', missionId);
            return null;
        }

        if (!mission.completed) {
            console.warn('[DailyMissions] 任务未完成:', mission.name);
            return null;
        }

        if (mission.claimed) {
            console.warn('[DailyMissions] 奖励已领取:', mission.name);
            return null;
        }

        mission.claimed = true;
        this.saveToStorage();
        this.notifyListeners('claim', mission);

        console.log('[DailyMissions] 领取奖励:', mission.name, mission.rewards);
        return mission.rewards;
    }

    /**
     * 一键领取所有已完成任务的奖励
     * @returns {Object} 总奖励和领取的任务列表
     */
    claimAllRewards() {
        const claimable = this.getClaimableMissions();
        const totalRewards = { gold: 0, exp: 0, battlePass: 0 };
        const claimedMissions = [];

        claimable.forEach(mission => {
            const rewards = this.claimReward(mission.id);
            if (rewards) {
                totalRewards.gold += rewards.gold;
                totalRewards.exp += rewards.exp;
                totalRewards.battlePass += rewards.battlePass;
                claimedMissions.push(mission);
            }
        });

        return { totalRewards, claimedMissions };
    }

    /**
     * 显示任务完成通知
     */
    showCompletionNotification(mission) {
        const message = `🎉 任务完成: ${mission.name}\n奖励: ${mission.rewards.gold}金币, ${mission.rewards.exp}经验`;
        
        // 使用浏览器通知API
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('命运塔 - 每日任务', {
                body: message,
                icon: '/assets/icons/mission-complete.png'
            });
        }

        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('missionComplete', {
            detail: { mission, timestamp: Date.now() }
        }));

        console.log('[DailyMissions] 任务完成:', mission.name);
    }

    /**
     * 请求通知权限
     */
    static async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        return false;
    }

    /**
     * 添加事件监听器
     */
    addListener(callback) {
        this.listeners.add(callback);
        return () => this.listeners.delete(callback);
    }

    /**
     * 通知所有监听器
     */
    notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.error('[DailyMissions] 监听器错误:', error);
            }
        });
    }

    /**
     * 获取任务统计信息
     */
    getStats() {
        const total = this.missions.length;
        const completed = this.missions.filter(m => m.completed).length;
        const claimed = this.missions.filter(m => m.claimed).length;
        const claimable = completed - claimed;

        return {
            total,
            completed,
            claimed,
            claimable,
            progress: total > 0 ? (completed / total) * 100 : 0
        };
    }

    /**
     * 手动刷新任务（通常用于测试或付费刷新）
     */
    forceRefresh() {
        this.generateDailyMissions();
    }

    /**
     * 重置所有任务（测试用）
     */
    reset() {
        this.missions = [];
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(LAST_REFRESH_KEY);
        this.generateDailyMissions();
    }
}

/**
 * 快捷操作API
 */
const DailyMissionsAPI = {
    // 全局实例
    manager: null,

    /**
     * 初始化每日任务系统
     */
    init() {
        if (!this.manager) {
            this.manager = new DailyMissionManager();
        }
        return this.manager;
    },

    /**
     * 获取任务管理器实例
     */
    getManager() {
        return this.init();
    },

    /**
     * 记录对战
     */
    recordMatch(isWin = false) {
        const manager = this.getManager();
        manager.updateProgress(MISSION_TYPES.PLAY_MATCHES, 1);
        if (isWin) {
            manager.updateProgress(MISSION_TYPES.WIN_MATCHES, 1);
        }
    },

    /**
     * 记录登顶
     */
    recordTop() {
        this.getManager().updateProgress(MISSION_TYPES.REACH_TOP, 1);
    },

    /**
     * 记录使用激怒牌
     */
    recordEnrageCardUse(count = 1) {
        this.getManager().updateProgress(MISSION_TYPES.USE_ENRAGE_CARDS, count);
    },

    /**
     * 记录爬升楼层
     */
    recordFloorClimb(floors) {
        this.getManager().updateProgress(MISSION_TYPES.CLIMB_FLOORS, floors);
    },

    /**
     * 记录购买物品
     */
    recordShopPurchase(count = 1) {
        this.getManager().updateProgress(MISSION_TYPES.BUY_SHOP_ITEMS, count);
    },

    /**
     * 领取任务奖励
     */
    claim(missionId) {
        return this.getManager().claimReward(missionId);
    },

    /**
     * 一键领取所有奖励
     */
    claimAll() {
        return this.getManager().claimAllRewards();
    },

    /**
     * 获取任务列表
     */
    getMissions() {
        return this.getManager().getMissions();
    },

    /**
     * 获取统计信息
     */
    getStats() {
        return this.getManager().getStats();
    },

    /**
     * 添加监听器
     */
    onProgress(callback) {
        return this.getManager().addListener(callback);
    },

    /**
     * 重置任务（测试用）
     */
    reset() {
        this.getManager().reset();
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DailyMissionManager, DailyMissionsAPI, MISSION_TYPES };
}

// 浏览器环境挂载到全局
if (typeof window !== 'undefined') {
    window.DailyMissionManager = DailyMissionManager;
    window.DailyMissionsAPI = DailyMissionsAPI;
    window.MISSION_TYPES = MISSION_TYPES;
    
    // 自动初始化
    window.DailyMissionsAPI.init();
    console.log('[DailyMissions] 每日任务系统已加载');
}

/**
 * ==========================================
 * 使用示例 / Usage Examples
 * ==========================================
 */

/*
 * // 1. 基础使用 - 记录游戏事件
 * DailyMissionsAPI.recordMatch(true);        // 记录一场胜利
 * DailyMissionsAPI.recordTop();              // 记录登顶
 * DailyMissionsAPI.recordEnrageCardUse(3);   // 记录使用了3张激怒牌
 * DailyMissionsAPI.recordFloorClimb(15);     // 记录爬升15层
 * DailyMissionsAPI.recordShopPurchase(2);    // 记录购买2个物品
 * 
 * // 2. 获取任务信息
 * const missions = DailyMissionsAPI.getMissions();
 * const stats = DailyMissionsAPI.getStats();
 * 
 * // 3. 领取奖励
 * DailyMissionsAPI.claim('mission_xxx');     // 领取单个任务奖励
 * const { totalRewards, claimedMissions } = DailyMissionsAPI.claimAll();
 * 
 * // 4. 监听任务进度
 * const unsubscribe = DailyMissionsAPI.onProgress((event, data) => {
 *     if (event === 'complete') {
 *         console.log('任务完成:', data.name);
 *     } else if (event === 'progress') {
 *         console.log('进度更新:', data);
 *     }
 * });
 * 
 * // 5. Vue/React 中使用
 * import { DailyMissionManager, MISSION_TYPES } from './daily-missions.js';
 * 
 * const manager = new DailyMissionManager();
 * manager.addListener((event, data) => {
 *     // 更新UI
 * });
 */
