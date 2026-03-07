/**
 * 命运塔 - 玩家成就系统
 * Tower of Fate - Player Achievement System
 * 
 * @author 小金蛇
 * @version 1.0.0
 */

// ==================== 成就分类定义 ====================
const AchievementCategory = {
  BEGINNER: 'beginner',   // 新手
  ADVANCED: 'advanced',   // 进阶
  EXPERT: 'expert',       // 专家
  MASTER: 'master'        // 大师
};

// 分类显示名称
const CategoryNames = {
  [AchievementCategory.BEGINNER]: '新手成就',
  [AchievementCategory.ADVANCED]: '进阶成就',
  [AchievementCategory.EXPERT]: '专家成就',
  [AchievementCategory.MASTER]: '大师成就'
};

// ==================== 奖励类型定义 ====================
const RewardType = {
  GOLD: 'gold',           // 金币
  DIAMOND: 'diamond',     // 钻石
  AVATAR: 'avatar',       // 头像框
  TITLE: 'title'          // 称号
};

// ==================== 成就数据结构 ====================
const AchievementsData = [
  // ===== 新手成就 (5个) =====
  {
    id: 'first_login',
    name: '初来乍到',
    description: '首次登录命运塔',
    category: AchievementCategory.BEGINNER,
    icon: '🎮',
    condition: { type: 'login', count: 1 },
    rewards: [
      { type: RewardType.GOLD, amount: 100 },
      { type: RewardType.DIAMOND, amount: 10 }
    ],
    hidden: false
  },
  {
    id: 'first_game',
    name: '初次尝试',
    description: '完成第一局游戏',
    category: AchievementCategory.BEGINNER,
    icon: '🎯',
    condition: { type: 'games_played', count: 1 },
    rewards: [
      { type: RewardType.GOLD, amount: 200 },
      { type: RewardType.DIAMOND, amount: 20 }
    ],
    hidden: false
  },
  {
    id: 'first_win',
    name: '开门红',
    description: '赢得第一局胜利',
    category: AchievementCategory.BEGINNER,
    icon: '🏆',
    condition: { type: 'wins', count: 1 },
    rewards: [
      { type: RewardType.GOLD, amount: 300 },
      { type: RewardType.DIAMOND, amount: 30 }
    ],
    hidden: false
  },
  {
    id: 'card_collector',
    name: '卡牌入门',
    description: '收集5张不同的卡牌',
    category: AchievementCategory.BEGINNER,
    icon: '🃏',
    condition: { type: 'cards_collected', count: 5 },
    rewards: [
      { type: RewardType.GOLD, amount: 500 },
      { type: RewardType.AVATAR, item: 'card_master' }
    ],
    hidden: false
  },
  {
    id: 'tower_climber',
    name: '登塔新手',
    description: '累计攀登10层',
    category: AchievementCategory.BEGINNER,
    icon: '🧗',
    condition: { type: 'floors_climbed', count: 10 },
    rewards: [
      { type: RewardType.GOLD, amount: 400 },
      { type: RewardType.DIAMOND, amount: 40 }
    ],
    hidden: false
  },

  // ===== 进阶成就 (6个) =====
  {
    id: 'first_summit',
    name: '首登者',
    description: '首次登顶命运塔',
    category: AchievementCategory.ADVANCED,
    icon: '👑',
    condition: { type: 'summit_reached', count: 1 },
    rewards: [
      { type: RewardType.GOLD, amount: 1000 },
      { type: RewardType.DIAMOND, amount: 100 },
      { type: RewardType.AVATAR, item: 'summit_pioneer' },
      { type: RewardType.TITLE, item: '首登者' }
    ],
    hidden: false
  },
  {
    id: 'win_streak_5',
    name: '连胜王',
    description: '连续赢得5局游戏',
    category: AchievementCategory.ADVANCED,
    icon: '🔥',
    condition: { type: 'win_streak', count: 5 },
    rewards: [
      { type: RewardType.GOLD, amount: 1500 },
      { type: RewardType.DIAMOND, amount: 150 },
      { type: RewardType.AVATAR, item: 'flame_warrior' }
    ],
    hidden: false
  },
  {
    id: 'provoke_master',
    name: '激怒大师',
    description: '使用激怒牌让对手退3层',
    category: AchievementCategory.ADVANCED,
    icon: '😡',
    condition: { type: 'provoke_floors', count: 3 },
    rewards: [
      { type: RewardType.GOLD, amount: 800 },
      { type: RewardType.DIAMOND, amount: 80 },
      { type: RewardType.TITLE, item: '激怒大师' }
    ],
    hidden: false
  },
  {
    id: 'speed_king',
    name: '速度之王',
    description: '10回合内登顶命运塔',
    category: AchievementCategory.ADVANCED,
    icon: '⚡',
    condition: { type: 'summit_rounds', max: 10 },
    rewards: [
      { type: RewardType.GOLD, amount: 2000 },
      { type: RewardType.DIAMOND, amount: 200 },
      { type: RewardType.AVATAR, item: 'lightning_speed' },
      { type: RewardType.TITLE, item: '速度之王' }
    ],
    hidden: false
  },
  {
    id: 'collector_10',
    name: '收藏家',
    description: '收集10个皮肤',
    category: AchievementCategory.ADVANCED,
    icon: '💎',
    condition: { type: 'skins_collected', count: 10 },
    rewards: [
      { type: RewardType.GOLD, amount: 3000 },
      { type: RewardType.DIAMOND, amount: 300 },
      { type: RewardType.AVATAR, item: 'diamond_collector' }
    ],
    hidden: false
  },
  {
    id: 'card_master',
    name: '卡牌大师',
    description: '使用卡牌100次',
    category: AchievementCategory.ADVANCED,
    icon: '🎴',
    condition: { type: 'cards_used', count: 100 },
    rewards: [
      { type: RewardType.GOLD, amount: 1200 },
      { type: RewardType.DIAMOND, amount: 120 },
      { type: RewardType.AVATAR, item: 'card_sage' }
    ],
    hidden: false
  },

  // ===== 专家成就 (5个) =====
  {
    id: 'summit_master',
    name: '登顶专家',
    description: '累计登顶10次',
    category: AchievementCategory.EXPERT,
    icon: '🏔️',
    condition: { type: 'summit_count', count: 10 },
    rewards: [
      { type: RewardType.GOLD, amount: 5000 },
      { type: RewardType.DIAMOND, amount: 500 },
      { type: RewardType.AVATAR, item: 'mountain_conqueror' },
      { type: RewardType.TITLE, item: '登山专家' }
    ],
    hidden: false
  },
  {
    id: 'win_streak_10',
    name: '不败神话',
    description: '连续赢得10局游戏',
    category: AchievementCategory.EXPERT,
    icon: '🌟',
    condition: { type: 'win_streak', count: 10 },
    rewards: [
      { type: RewardType.GOLD, amount: 8000 },
      { type: RewardType.DIAMOND, amount: 800 },
      { type: RewardType.AVATAR, item: 'legend_streak' },
      { type: RewardType.TITLE, item: '不败神话' }
    ],
    hidden: false
  },
  {
    id: 'trap_master',
    name: '陷阱大师',
    description: '使用陷阱牌让对手掉落5层',
    category: AchievementCategory.EXPERT,
    icon: '🕸️',
    condition: { type: 'trap_floors', count: 5 },
    rewards: [
      { type: RewardType.GOLD, amount: 3000 },
      { type: RewardType.DIAMOND, amount: 300 },
      { type: RewardType.TITLE, item: '陷阱大师' }
    ],
    hidden: false
  },
  {
    id: 'perfect_game',
    name: '完美游戏',
    description: '在不受到任何伤害的情况下登顶',
    category: AchievementCategory.EXPERT,
    icon: '✨',
    condition: { type: 'perfect_summit', count: 1 },
    rewards: [
      { type: RewardType.GOLD, amount: 6000 },
      { type: RewardType.DIAMOND, amount: 600 },
      { type: RewardType.AVATAR, item: 'perfect_being' },
      { type: RewardType.TITLE, item: '完美主义者' }
    ],
    hidden: false
  },
  {
    id: 'comeback_king',
    name: '逆袭之王',
    description: '在落后对手5层的情况下反败为胜',
    category: AchievementCategory.EXPERT,
    icon: '🔄',
    condition: { type: 'comeback_win', floors_behind: 5 },
    rewards: [
      { type: RewardType.GOLD, amount: 4000 },
      { type: RewardType.DIAMOND, amount: 400 },
      { type: RewardType.AVATAR, item: 'comeback_champion' },
      { type: RewardType.TITLE, item: '逆袭之王' }
    ],
    hidden: false
  },

  // ===== 大师成就 (5个) =====
  {
    id: 'tower_legend',
    name: '命运塔传说',
    description: '累计登顶50次',
    category: AchievementCategory.MASTER,
    icon: '🗿',
    condition: { type: 'summit_count', count: 50 },
    rewards: [
      { type: RewardType.GOLD, amount: 50000 },
      { type: RewardType.DIAMOND, amount: 5000 },
      { type: RewardType.AVATAR, item: 'tower_legend' },
      { type: RewardType.TITLE, item: '命运塔传说' }
    ],
    hidden: false
  },
  {
    id: 'speed_demon',
    name: '极速恶魔',
    description: '5回合内登顶命运塔',
    category: AchievementCategory.MASTER,
    icon: '🚀',
    condition: { type: 'summit_rounds', max: 5 },
    rewards: [
      { type: RewardType.GOLD, amount: 30000 },
      { type: RewardType.DIAMOND, amount: 3000 },
      { type: RewardType.AVATAR, item: 'speed_demon' },
      { type: RewardType.TITLE, item: '极速恶魔' }
    ],
    hidden: false
  },
  {
    id: 'unstoppable',
    name: '势不可挡',
    description: '连续赢得20局游戏',
    category: AchievementCategory.MASTER,
    icon: '👑',
    condition: { type: 'win_streak', count: 20 },
    rewards: [
      { type: RewardType.GOLD, amount: 50000 },
      { type: RewardType.DIAMOND, amount: 5000 },
      { type: RewardType.AVATAR, item: 'unstoppable_force' },
      { type: RewardType.TITLE, item: '势不可挡' }
    ],
    hidden: false
  },
  {
    id: 'grand_collector',
    name: '大收藏家',
    description: '收集所有皮肤和卡牌',
    category: AchievementCategory.MASTER,
    icon: '💍',
    condition: { type: 'complete_collection', count: 1 },
    rewards: [
      { type: RewardType.GOLD, amount: 100000 },
      { type: RewardType.DIAMOND, amount: 10000 },
      { type: RewardType.AVATAR, item: 'grand_collector' },
      { type: RewardType.TITLE, item: '大收藏家' }
    ],
    hidden: false
  },
  {
    id: 'fate_master',
    name: '命运主宰',
    description: '完成所有成就',
    category: AchievementCategory.MASTER,
    icon: '🔮',
    condition: { type: 'all_achievements', count: 21 },
    rewards: [
      { type: RewardType.GOLD, amount: 200000 },
      { type: RewardType.DIAMOND, amount: 20000 },
      { type: RewardType.AVATAR, item: 'fate_master' },
      { type: RewardType.TITLE, item: '命运主宰' }
    ],
    hidden: false
  }
];

// ==================== 成就系统类 ====================
class AchievementSystem {
  constructor(storageKey = 'tower_of_fate_achievements') {
    this.storageKey = storageKey;
    this.achievements = new Map();
    this.playerStats = {};
    this.callbacks = {
      onUnlock: [],
      onProgress: [],
      onReward: []
    };
    
    this.init();
  }

  /**
   * 初始化成就系统
   */
  init() {
    this.loadAchievements();
    this.loadPlayerStats();
    
    // 初始化所有成就状态
    AchievementsData.forEach(achievement => {
      if (!this.achievements.has(achievement.id)) {
        this.achievements.set(achievement.id, {
          ...achievement,
          unlocked: false,
          unlockedAt: null,
          progress: 0,
          claimed: false
        });
      }
    });
    
    this.saveAchievements();
  }

  /**
   * 从本地存储加载成就数据
   */
  loadAchievements() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.achievements = new Map(Object.entries(parsed.achievements || {}));
      }
    } catch (error) {
      console.error('加载成就数据失败:', error);
      this.achievements = new Map();
    }
  }

  /**
   * 加载玩家统计数据
   */
  loadPlayerStats() {
    try {
      const data = localStorage.getItem(`${this.storageKey}_stats`);
      this.playerStats = data ? JSON.parse(data) : this.getDefaultStats();
    } catch (error) {
      console.error('加载玩家统计数据失败:', error);
      this.playerStats = this.getDefaultStats();
    }
  }

  /**
   * 获取默认统计数据
   */
  getDefaultStats() {
    return {
      gamesPlayed: 0,
      wins: 0,
      currentWinStreak: 0,
      maxWinStreak: 0,
      floorsClimbed: 0,
      summitReached: 0,
      cardsCollected: [],
      cardsUsed: 0,
      skinsCollected: [],
      bestSummitRounds: Infinity,
      provokeFloors: 0,
      trapFloors: 0,
      perfectGames: 0,
      comebackWins: 0,
      totalProvokeUsed: 0,
      totalTrapUsed: 0,
      damageTaken: 0,
      maxFloorsBehind: 0
    };
  }

  /**
   * 保存成就数据到本地存储
   */
  saveAchievements() {
    try {
      const data = {
        achievements: Object.fromEntries(this.achievements),
        lastSaved: Date.now()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('保存成就数据失败:', error);
    }
  }

  /**
   * 保存玩家统计数据
   */
  savePlayerStats() {
    try {
      localStorage.setItem(`${this.storageKey}_stats`, JSON.stringify(this.playerStats));
    } catch (error) {
      console.error('保存玩家统计数据失败:', error);
    }
  }

  /**
   * 注册回调函数
   */
  on(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event].push(callback);
    }
  }

  /**
   * 触发回调
   */
  trigger(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`回调执行失败 (${event}):`, error);
        }
      });
    }
  }

  /**
   * 更新玩家统计数据
   */
  updateStats(stats) {
    Object.assign(this.playerStats, stats);
    this.savePlayerStats();
    this.checkAchievements();
  }

  /**
   * 检查所有成就解锁条件
   */
  checkAchievements() {
    const stats = this.playerStats;
    const newlyUnlocked = [];

    this.achievements.forEach((achievement, id) => {
      if (achievement.unlocked) return;

      const condition = achievement.condition;
      let unlocked = false;
      let progress = 0;

      switch (condition.type) {
        case 'login':
          progress = 1;
          unlocked = true;
          break;
          
        case 'games_played':
          progress = stats.gamesPlayed;
          unlocked = progress >= condition.count;
          break;
          
        case 'wins':
          progress = stats.wins;
          unlocked = progress >= condition.count;
          break;
          
        case 'win_streak':
          progress = stats.currentWinStreak;
          unlocked = progress >= condition.count;
          break;
          
        case 'summit_reached':
          progress = stats.summitReached > 0 ? 1 : 0;
          unlocked = progress >= condition.count;
          break;
          
        case 'summit_count':
          progress = stats.summitReached;
          unlocked = progress >= condition.count;
          break;
          
        case 'floors_climbed':
          progress = stats.floorsClimbed;
          unlocked = progress >= condition.count;
          break;
          
        case 'cards_collected':
          progress = stats.cardsCollected.length;
          unlocked = progress >= condition.count;
          break;
          
        case 'cards_used':
          progress = stats.cardsUsed;
          unlocked = progress >= condition.count;
          break;
          
        case 'skins_collected':
          progress = stats.skinsCollected.length;
          unlocked = progress >= condition.count;
          break;
          
        case 'summit_rounds':
          progress = stats.bestSummitRounds === Infinity ? 0 : stats.bestSummitRounds;
          unlocked = progress > 0 && progress <= condition.max;
          break;
          
        case 'provoke_floors':
          progress = stats.provokeFloors;
          unlocked = progress >= condition.count;
          break;
          
        case 'trap_floors':
          progress = stats.trapFloors;
          unlocked = progress >= condition.count;
          break;
          
        case 'perfect_summit':
          progress = stats.perfectGames;
          unlocked = progress >= condition.count;
          break;
          
        case 'comeback_win':
          progress = stats.comebackWins;
          unlocked = progress >= condition.count;
          break;
          
        case 'complete_collection':
          const totalCards = 50; // 假设总共有50张卡牌
          const totalSkins = 30; // 假设总共有30个皮肤
          const hasAllCards = stats.cardsCollected.length >= totalCards;
          const hasAllSkins = stats.skinsCollected.length >= totalSkins;
          progress = hasAllCards && hasAllSkins ? 1 : 0;
          unlocked = progress >= condition.count;
          break;
          
        case 'all_achievements':
          const totalAchievements = AchievementsData.length - 1; // 排除自身
          const unlockedCount = Array.from(this.achievements.values())
            .filter(a => a.unlocked && a.id !== 'fate_master').length;
          progress = unlockedCount;
          unlocked = progress >= totalAchievements;
          break;
      }

      // 更新进度
      achievement.progress = progress;

      // 解锁成就
      if (unlocked) {
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        newlyUnlocked.push(achievement);
        this.trigger('onUnlock', achievement);
      } else {
        this.trigger('onProgress', { achievement, progress });
      }
    });

    if (newlyUnlocked.length > 0) {
      this.saveAchievements();
    }

    return newlyUnlocked;
  }

  /**
   * 领取成就奖励
   */
  claimRewards(achievementId) {
    const achievement = this.achievements.get(achievementId);
    if (!achievement || !achievement.unlocked || achievement.claimed) {
      return null;
    }

    achievement.claimed = true;
    this.saveAchievements();

    const rewards = achievement.rewards.map(reward => ({ ...reward }));
    this.trigger('onReward', { achievement, rewards });

    return rewards;
  }

  /**
   * 获取所有成就
   */
  getAllAchievements() {
    return Array.from(this.achievements.values());
  }

  /**
   * 按分类获取成就
   */
  getAchievementsByCategory(category) {
    return this.getAllAchievements().filter(a => a.category === category);
  }

  /**
   * 获取已解锁的成就
   */
  getUnlockedAchievements() {
    return this.getAllAchievements().filter(a => a.unlocked);
  }

  /**
   * 获取未解锁的成就
   */
  getLockedAchievements() {
    return this.getAllAchievements().filter(a => !a.unlocked);
  }

  /**
   * 获取可领取奖励的成就
   */
  getClaimableAchievements() {
    return this.getAllAchievements().filter(a => a.unlocked && !a.claimed);
  }

  /**
   * 获取成就统计信息
   */
  getStatistics() {
    const all = this.getAllAchievements();
    const unlocked = all.filter(a => a.unlocked);
    
    return {
      total: all.length,
      unlocked: unlocked.length,
      locked: all.length - unlocked.length,
      progress: Math.round((unlocked.length / all.length) * 100),
      byCategory: {
        [AchievementCategory.BEGINNER]: {
          total: all.filter(a => a.category === AchievementCategory.BEGINNER).length,
          unlocked: unlocked.filter(a => a.category === AchievementCategory.BEGINNER).length
        },
        [AchievementCategory.ADVANCED]: {
          total: all.filter(a => a.category === AchievementCategory.ADVANCED).length,
          unlocked: unlocked.filter(a => a.category === AchievementCategory.ADVANCED).length
        },
        [AchievementCategory.EXPERT]: {
          total: all.filter(a => a.category === AchievementCategory.EXPERT).length,
          unlocked: unlocked.filter(a => a.category === AchievementCategory.EXPERT).length
        },
        [AchievementCategory.MASTER]: {
          total: all.filter(a => a.category === AchievementCategory.MASTER).length,
          unlocked: unlocked.filter(a => a.category === AchievementCategory.MASTER).length
        }
      }
    };
  }

  /**
   * 重置所有成就（调试用）
   */
  reset() {
    this.achievements.clear();
    this.playerStats = this.getDefaultStats();
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(`${this.storageKey}_stats`);
    this.init();
  }
}

// ==================== 成就展示UI类 ====================
class AchievementUI {
  constructor(achievementSystem, containerId = 'achievements-container') {
    this.system = achievementSystem;
    this.containerId = containerId;
    this.container = null;
    this.currentFilter = 'all';
    this.currentCategory = null;
  }

  /**
   * 初始化UI
   */
  init() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
      console.error(`找不到容器元素: ${this.containerId}`);
      return;
    }

    this.render();
    this.bindEvents();
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 监听成就解锁事件
    this.system.on('onUnlock', (achievement) => {
      this.showUnlockNotification(achievement);
      this.render();
    });

    // 监听奖励领取事件
    this.system.on('onReward', ({ achievement }) => {
      this.showRewardNotification(achievement);
      this.render();
    });
  }

  /**
   * 渲染成就面板
   */
  render() {
    if (!this.container) return;

    const stats = this.system.getStatistics();
    
    this.container.innerHTML = `
      <div class="achievements-panel">
        ${this.renderHeader(stats)}
        ${this.renderCategoryTabs(stats)}
        ${this.renderAchievementsList()}
      </div>
    `;

    this.bindUIEvents();
  }

  /**
   * 渲染头部统计
   */
  renderHeader(stats) {
    return `
      <div class="achievements-header">
        <div class="achievements-title">
          <h2>🏆 成就系统</h2>
          <span class="achievement-subtitle">解锁成就，获得丰厚奖励</span>
        </div>
        <div class="achievements-progress">
          <div class="progress-ring">
            <svg viewBox="0 0 100 100">
              <circle class="progress-bg" cx="50" cy="50" r="45"/>
              <circle class="progress-bar" cx="50" cy="50" r="45"
                style="stroke-dasharray: ${283 * stats.progress / 100} 283"/>
            </svg>
            <div class="progress-text">
              <span class="progress-percent">${stats.progress}%</span>
              <span class="progress-count">${stats.unlocked}/${stats.total}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染分类标签
   */
  renderCategoryTabs(stats) {
    const categories = [
      { id: 'all', name: '全部', icon: '📋' },
      { id: AchievementCategory.BEGINNER, name: CategoryNames[AchievementCategory.BEGINNER], icon: '🌱' },
      { id: AchievementCategory.ADVANCED, name: CategoryNames[AchievementCategory.ADVANCED], icon: '🌿' },
      { id: AchievementCategory.EXPERT, name: CategoryNames[AchievementCategory.EXPERT], icon: '🌳' },
      { id: AchievementCategory.MASTER, name: CategoryNames[AchievementCategory.MASTER], icon: '👑' }
    ];

    return `
      <div class="achievements-tabs">
        ${categories.map(cat => {
          const isActive = this.currentCategory === cat.id || (cat.id === 'all' && !this.currentCategory);
          const catStats = cat.id === 'all' ? stats : stats.byCategory[cat.id];
          return `
            <button class="tab-btn ${isActive ? 'active' : ''}" data-category="${cat.id}">
              <span class="tab-icon">${cat.icon}</span>
              <span class="tab-name">${cat.name}</span>
              ${catStats ? `<span class="tab-count">${catStats.unlocked}/${catStats.total}</span>` : ''}
            </button>
          `;
        }).join('')}
      </div>
    `;
  }

  /**
   * 渲染成就列表
   */
  renderAchievementsList() {
    let achievements;
    if (this.currentCategory && this.currentCategory !== 'all') {
      achievements = this.system.getAchievementsByCategory(this.currentCategory);
    } else {
      achievements = this.system.getAllAchievements();
    }

    // 排序：未解锁在前，按分类排序
    achievements.sort((a, b) => {
      if (a.unlocked !== b.unlocked) return b.unlocked ? 1 : -1;
      return a.category.localeCompare(b.category);
    });

    if (achievements.length === 0) {
      return '<div class="achievements-empty">暂无成就</div>';
    }

    return `
      <div class="achievements-list">
        ${achievements.map(achievement => this.renderAchievementCard(achievement)).join('')}
      </div>
    `;
  }

  /**
   * 渲染单个成就卡片
   */
  renderAchievementCard(achievement) {
    const isUnlocked = achievement.unlocked;
    const isClaimed = achievement.claimed;
    const categoryColor = this.getCategoryColor(achievement.category);
    
    // 计算进度
    let progressPercent = 0;
    if (achievement.condition.count) {
      progressPercent = Math.min(100, (achievement.progress / achievement.condition.count) * 100);
    } else if (achievement.condition.max) {
      progressPercent = isUnlocked ? 100 : 0;
    }

    return `
      <div class="achievement-card ${isUnlocked ? 'unlocked' : 'locked'} ${isClaimed ? 'claimed' : ''}" 
           data-id="${achievement.id}">
        <div class="achievement-icon" style="background: ${categoryColor}">
          <span>${achievement.icon}</span>
          ${isUnlocked ? '<div class="unlocked-badge">✓</div>' : ''}
        </div>
        <div class="achievement-info">
          <div class="achievement-header">
            <h3 class="achievement-name">${achievement.name}</h3>
            <span class="achievement-category">${CategoryNames[achievement.category]}</span>
          </div>
          <p class="achievement-desc">${achievement.description}</p>
          ${!isUnlocked && achievement.condition.count ? `
            <div class="achievement-progress-bar">
              <div class="progress-fill" style="width: ${progressPercent}%"></div>
              <span class="progress-text">${achievement.progress}/${achievement.condition.count}</span>
            </div>
          ` : ''}
        </div>
        <div class="achievement-rewards">
          ${achievement.rewards.map(reward => this.renderReward(reward)).join('')}
        </div>
        ${isUnlocked && !isClaimed ? `
          <button class="claim-btn" data-id="${achievement.id}">
            领取奖励
          </button>
        ` : isClaimed ? `
          <div class="claimed-badge">已领取</div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 渲染奖励
   */
  renderReward(reward) {
    const icons = {
      [RewardType.GOLD]: '🪙',
      [RewardType.DIAMOND]: '💎',
      [RewardType.AVATAR]: '🖼️',
      [RewardType.TITLE]: '🏷️'
    };

    let text = '';
    switch (reward.type) {
      case RewardType.GOLD:
        text = `${reward.amount} 金币`;
        break;
      case RewardType.DIAMOND:
        text = `${reward.amount} 钻石`;
        break;
      case RewardType.AVATAR:
        text = '头像框';
        break;
      case RewardType.TITLE:
        text = `称号: ${reward.item}`;
        break;
    }

    return `
      <div class="reward-item ${reward.type}">
        <span class="reward-icon">${icons[reward.type]}</span>
        <span class="reward-text">${text}</span>
      </div>
    `;
  }

  /**
   * 获取分类颜色
   */
  getCategoryColor(category) {
    const colors = {
      [AchievementCategory.BEGINNER]: 'linear-gradient(135deg, #4CAF50, #8BC34A)',
      [AchievementCategory.ADVANCED]: 'linear-gradient(135deg, #2196F3, #03A9F4)',
      [AchievementCategory.EXPERT]: 'linear-gradient(135deg, #9C27B0, #E91E63)',
      [AchievementCategory.MASTER]: 'linear-gradient(135deg, #FF9800, #FFC107)'
    };
    return colors[category] || colors[AchievementCategory.BEGINNER];
  }

  /**
   * 绑定UI事件
   */
  bindUIEvents() {
    // 分类标签切换
    this.container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const category = e.currentTarget.dataset.category;
        this.currentCategory = category === 'all' ? null : category;
        this.render();
      });
    });

    // 领取奖励按钮
    this.container.querySelectorAll('.claim-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const rewards = this.system.claimRewards(id);
        if (rewards) {
          this.render();
        }
      });
    });
  }

  /**
   * 显示成就解锁通知
   */
  showUnlockNotification(achievement) {
    this.showNotification({
      title: '🎉 成就解锁!',
      message: `恭喜获得成就: ${achievement.name}`,
      icon: achievement.icon,
      type: 'success',
      duration: 5000
    });
  }

  /**
   * 显示奖励领取通知
   */
  showRewardNotification(achievement) {
    this.showNotification({
      title: '🎁 奖励领取!',
      message: `已领取 ${achievement.name} 的奖励`,
      icon: '🎁',
      type: 'reward',
      duration: 3000
    });
  }

  /**
   * 显示通知
   */
  showNotification({ title, message, icon, type = 'info', duration = 3000 }) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `achievement-notification ${type}`;
    notification.innerHTML = `
      <div class="notification-icon">${icon}</div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
    `;

    // 添加到页面
    let container = document.getElementById('achievement-notifications');
    if (!container) {
      container = document.createElement('div');
      container.id = 'achievement-notifications';
      container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
      `;
      document.body.appendChild(container);
    }

    container.appendChild(notification);

    // 动画进入
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
      notification.style.opacity = '1';
    });

    // 自动移除
    setTimeout(() => {
      notification.style.transform = 'translateX(120%)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }
}

// ==================== 游戏事件追踪器 ====================
class GameEventTracker {
  constructor(achievementSystem) {
    this.system = achievementSystem;
    this.gameState = {
      startTime: null,
      rounds: 0,
      damageTaken: 0,
      maxFloorsBehind: 0,
      provokeUsed: 0,
      trapUsed: 0
    };
  }

  /**
   * 开始新游戏
   */
  startGame() {
    this.gameState = {
      startTime: Date.now(),
      rounds: 0,
      damageTaken: 0,
      maxFloorsBehind: 0,
      provokeUsed: 0,
      trapUsed: 0
    };
  }

  /**
   * 记录回合
   */
  recordRound() {
    this.gameState.rounds++;
  }

  /**
   * 记录受到伤害
   */
  recordDamage(amount) {
    this.gameState.damageTaken += amount;
  }

  /**
   * 记录楼层差距
   */
  recordFloorGap(opponentFloors, myFloors) {
    const gap = opponentFloors - myFloors;
    if (gap > this.gameState.maxFloorsBehind) {
      this.gameState.maxFloorsBehind = gap;
    }
  }

  /**
   * 记录使用激怒牌
   */
  recordProvoke(floorsDropped) {
    this.gameState.provokeUsed++;
    this.system.updateStats({
      totalProvokeUsed: this.system.playerStats.totalProvokeUsed + 1,
      provokeFloors: this.system.playerStats.provokeFloors + floorsDropped
    });
  }

  /**
   * 记录使用陷阱牌
   */
  recordTrap(floorsDropped) {
    this.gameState.trapUsed++;
    this.system.updateStats({
      totalTrapUsed: this.system.playerStats.totalTrapUsed + 1,
      trapFloors: this.system.playerStats.trapFloors + floorsDropped
    });
  }

  /**
   * 游戏结束
   */
  endGame(result) {
    const stats = this.system.playerStats;
    const newStats = {
      gamesPlayed: stats.gamesPlayed + 1
    };

    if (result.win) {
      newStats.wins = stats.wins + 1;
      newStats.currentWinStreak = stats.currentWinStreak + 1;
      newStats.maxWinStreak = Math.max(stats.maxWinStreak, newStats.currentWinStreak);

      // 逆袭判定
      if (this.gameState.maxFloorsBehind >= 5) {
        newStats.comebackWins = stats.comebackWins + 1;
      }

      // 完美游戏判定
      if (this.gameState.damageTaken === 0 && result.reachedSummit) {
        newStats.perfectGames = stats.perfectGames + 1;
      }
    } else {
      newStats.currentWinStreak = 0;
    }

    this.system.updateStats(newStats);
  }

  /**
   * 登顶命运塔
   */
  reachSummit(floor = 100) {
    const stats = this.system.playerStats;
    const newStats = {
      summitReached: stats.summitReached + 1,
      floorsClimbed: stats.floorsClimbed + floor
    };

    // 记录最快登顶回合
    if (this.gameState.rounds < stats.bestSummitRounds) {
      newStats.bestSummitRounds = this.gameState.rounds;
    }

    this.system.updateStats(newStats);
  }

  /**
   * 收集卡牌
   */
  collectCard(cardId) {
    const stats = this.system.playerStats;
    if (!stats.cardsCollected.includes(cardId)) {
      this.system.updateStats({
        cardsCollected: [...stats.cardsCollected, cardId]
      });
    }
  }

  /**
   * 使用卡牌
   */
  useCard() {
    const stats = this.system.playerStats;
    this.system.updateStats({
      cardsUsed: stats.cardsUsed + 1
    });
  }

  /**
   * 收集皮肤
   */
  collectSkin(skinId) {
    const stats = this.system.playerStats;
    if (!stats.skinsCollected.includes(skinId)) {
      this.system.updateStats({
        skinsCollected: [...stats.skinsCollected, skinId]
      });
    }
  }
}

// ==================== CSS样式 ====================
const AchievementStyles = `
/* 成就系统样式 */
.achievements-panel {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 24px;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 900px;
  margin: 0 auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

/* 头部 */
.achievements-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.achievements-title h2 {
  margin: 0 0 8px 0;
  font-size: 28px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.achievement-subtitle {
  color: rgba(255,255,255,0.6);
  font-size: 14px;
}

/* 进度环 */
.achievements-progress {
  position: relative;
}

.progress-ring {
  width: 100px;
  height: 100px;
  position: relative;
}

.progress-ring svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring circle {
  fill: none;
  stroke-width: 8;
}

.progress-bg {
  stroke: rgba(255,255,255,0.1);
}

.progress-bar {
  stroke: url(#progressGradient);
  stroke-linecap: round;
  transition: stroke-dasharray 0.5s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-percent {
  display: block;
  font-size: 24px;
  font-weight: bold;
  color: #FFD700;
}

.progress-count {
  display: block;
  font-size: 12px;
  color: rgba(255,255,255,0.6);
}

/* 分类标签 */
.achievements-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  background: rgba(255,255,255,0.1);
}

.tab-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.tab-icon {
  font-size: 18px;
}

.tab-count {
  background: rgba(255,255,255,0.2);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

/* 成就列表 */
.achievements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 600px;
  overflow-y: auto;
}

/* 成就卡片 */
.achievement-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.05);
  transition: all 0.3s ease;
  position: relative;
}

.achievement-card:hover {
  background: rgba(255,255,255,0.06);
  transform: translateX(4px);
}

.achievement-card.unlocked {
  border-color: rgba(255,215,0,0.3);
  background: linear-gradient(135deg, rgba(255,215,0,0.05) 0%, rgba(255,255,255,0.03) 100%);
}

.achievement-card.locked {
  opacity: 0.7;
}

.achievement-card.locked .achievement-icon {
  filter: grayscale(1);
}

/* 成就图标 */
.achievement-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  position: relative;
  flex-shrink: 0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.unlocked-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 22px;
  height: 22px;
  background: #4CAF50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid #1a1a2e;
}

/* 成就信息 */
.achievement-info {
  flex: 1;
  min-width: 0;
}

.achievement-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.achievement-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.achievement-category {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.7);
}

.achievement-desc {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  line-height: 1.4;
}

/* 进度条 */
.achievement-progress-bar {
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.achievement-progress-bar .progress-text {
  position: absolute;
  right: 0;
  top: -18px;
  font-size: 11px;
  color: rgba(255,255,255,0.5);
}

/* 奖励 */
.achievement-rewards {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 120px;
}

.reward-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(255,255,255,0.05);
}

.reward-icon {
  font-size: 14px;
}

.reward-text {
  color: rgba(255,255,255,0.8);
}

.reward-item.gold { color: #FFD700; }
.reward-item.diamond { color: #00BCD4; }
.reward-item.avatar { color: #E91E63; }
.reward-item.title { color: #9C27B0; }

/* 领取按钮 */
.claim-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1a1a2e;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.claim-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(255,215,0,0.4);
}

.claimed-badge {
  padding: 8px 16px;
  background: rgba(76,175,80,0.2);
  color: #4CAF50;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* 通知 */
.achievement-notification {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;
  box-shadow: 0 10px 40px rgba(0,0,0,0.3);
  transform: translateX(120%);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  min-width: 280px;
}

.achievement-notification.success {
  background: linear-gradient(135deg, #4CAF50, #8BC34A);
}

.achievement-notification.reward {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #1a1a2e;
}

.notification-icon {
  font-size: 32px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.notification-message {
  font-size: 13px;
  opacity: 0.9;
}

/* 空状态 */
.achievements-empty {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255,255,255,0.5);
}

/* 滚动条 */
.achievements-list::-webkit-scrollbar {
  width: 6px;
}

.achievements-list::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.05);
  border-radius: 3px;
}

.achievements-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.2);
  border-radius: 3px;
}

.achievements-list::-webkit-scrollbar-thumb:hover {
  background: rgba(255,255,255,0.3);
}

/* SVG渐变定义 */
.achievements-panel::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
}
`;

// ==================== 初始化函数 ====================
function initAchievementSystem() {
  // 添加样式
  if (!document.getElementById('achievement-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'achievement-styles';
    styleEl.textContent = AchievementStyles;
    document.head.appendChild(styleEl);
  }

  // 添加SVG渐变
  if (!document.getElementById('achievement-svg-gradients')) {
    const svgEl = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEl.id = 'achievement-svg-gradients';
    svgEl.style.position = 'absolute';
    svgEl.style.width = '0';
    svgEl.style.height = '0';
    svgEl.innerHTML = `
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#FFD700"/>
          <stop offset="100%" style="stop-color:#FFA500"/>
        </linearGradient>
      </defs>
    `;
    document.body.appendChild(svgEl);
  }

  // 创建成就系统实例
  const achievementSystem = new AchievementSystem();
  
  // 创建UI实例
  const achievementUI = new AchievementUI(achievementSystem);
  
  // 创建事件追踪器
  const eventTracker = new GameEventTracker(achievementSystem);

  // 全局暴露
  window.AchievementSystem = achievementSystem;
  window.AchievementUI = achievementUI;
  window.GameEventTracker = eventTracker;

  return {
    system: achievementSystem,
    ui: achievementUI,
    tracker: eventTracker
  };
}

// ==================== 导出 ====================
export {
  AchievementSystem,
  AchievementUI,
  GameEventTracker,
  AchievementCategory,
  CategoryNames,
  RewardType,
  AchievementsData,
  AchievementStyles,
  initAchievementSystem
};

// 默认导出
export default {
  AchievementSystem,
  AchievementUI,
  GameEventTracker,
  initAchievementSystem
};
