/**
 * 命运塔 - 战令系统 (Battle Pass System)
 * Tower of Fate - Battle Pass Module
 * 
 * @author 小金蛇 🐍
 * @version 1.0.0
 */

/**
 * 战令配置常量
 */
const BATTLE_PASS_CONFIG = {
  MAX_LEVEL: 100,
  XP_PER_LEVEL: 1000,
  SEASON_DURATION_DAYS: 90,
  
  // 经验值获取配置
  XP_REWARDS: {
    MATCH_COMPLETE: 50,           // 完成对局
    DAILY_TASK_COMPLETE: 100,     // 完成每日任务
    SUMMIT_SUCCESS: 200,          // 登顶成功
    TAUNT_CARD_USED: 30,          // 使用激怒牌
  },
  
  // 快速升级配置
  LEVEL_UP_COST: {
    PER_LEVEL_DIAMONDS: 100,      // 每级所需钻石
  },
  
  // 高级战令价格
  PREMIUM_PRICE: 980,             // 高级战令价格（钻石）
  
  // 本地存储键名
  STORAGE_KEY: 'tof_battle_pass',
};

/**
 * 奖励类型枚举
 */
const RewardType = {
  GOLD: 'gold',                   // 金币
  DIAMOND: 'diamond',             // 钻石
  SKIN: 'skin',                   // 皮肤
  EFFECT: 'effect',               // 特效
  AVATAR_FRAME: 'avatar_frame',   // 头像框
  TITLE: 'title',                 // 称号
  ITEM_CARD: 'item_card',         // 道具卡
};

/**
 * 奖励品质枚举
 */
const RewardRarity = {
  COMMON: 'common',       // 普通
  RARE: 'rare',           // 稀有
  EPIC: 'epic',           // 史诗
  LEGENDARY: 'legendary', // 传说
};

/**
 * 战令等级奖励定义
 * 每个等级包含免费奖励和付费奖励
 */
const LEVEL_REWARDS = generateLevelRewards();

/**
 * 生成1-100级的奖励配置
 * @returns {Array} 等级奖励数组
 */
function generateLevelRewards() {
  const rewards = [];
  
  for (let level = 1; level <= 100; level++) {
    const levelReward = {
      level,
      // 免费奖励轨道
      free: generateFreeReward(level),
      // 付费奖励轨道
      premium: generatePremiumReward(level),
    };
    rewards.push(levelReward);
  }
  
  return rewards;
}

/**
 * 生成免费奖励
 * @param {number} level - 等级
 * @returns {Array} 奖励数组
 */
function generateFreeReward(level) {
  const rewards = [];
  
  // 每5级给金币
  if (level % 5 === 0) {
    rewards.push({
      type: RewardType.GOLD,
      amount: 500 + (level * 10),
      rarity: RewardRarity.COMMON,
    });
  }
  
  // 每10级给钻石
  if (level % 10 === 0) {
    rewards.push({
      type: RewardType.DIAMOND,
      amount: 50 + (level * 2),
      rarity: RewardRarity.RARE,
    });
  }
  
  // 每20级给道具卡
  if (level % 20 === 0) {
    rewards.push({
      type: RewardType.ITEM_CARD,
      itemId: `card_refresh_${level}`,
      name: '刷新卡',
      amount: 3,
      rarity: RewardRarity.RARE,
    });
  }
  
  // 特殊等级奖励
  if (level === 50) {
    rewards.push({
      type: RewardType.AVATAR_FRAME,
      itemId: 'frame_bronze',
      name: '青铜攀登者',
      rarity: RewardRarity.RARE,
    });
  }
  
  if (level === 100) {
    rewards.push({
      type: RewardType.TITLE,
      itemId: 'title_master_climber',
      name: '登峰造极',
      rarity: RewardRarity.LEGENDARY,
    });
  }
  
  return rewards;
}

/**
 * 生成付费奖励
 * @param {number} level - 等级
 * @returns {Array} 奖励数组
 */
function generatePremiumReward(level) {
  const rewards = [];
  
  // 每级都给更多金币
  rewards.push({
    type: RewardType.GOLD,
    amount: 300 + (level * 20),
    rarity: RewardRarity.COMMON,
  });
  
  // 每3级给钻石
  if (level % 3 === 0) {
    rewards.push({
      type: RewardType.DIAMOND,
      amount: 30 + (level * 3),
      rarity: RewardRarity.RARE,
    });
  }
  
  // 每10级给皮肤/特效
  if (level % 10 === 0) {
    if (level <= 50) {
      rewards.push({
        type: RewardType.SKIN,
        itemId: `skin_tower_${level}`,
        name: `塔之装扮 ${level}级`,
        rarity: level >= 50 ? RewardRarity.EPIC : RewardRarity.RARE,
      });
    } else {
      rewards.push({
        type: RewardType.EFFECT,
        itemId: `effect_summit_${level}`,
        name: `登顶特效 ${level}级`,
        rarity: level >= 80 ? RewardRarity.LEGENDARY : RewardRarity.EPIC,
      });
    }
  }
  
  // 特殊等级奖励
  if (level === 25) {
    rewards.push({
      type: RewardType.AVATAR_FRAME,
      itemId: 'frame_silver',
      name: '白银攀登者',
      rarity: RewardRarity.EPIC,
    });
  }
  
  if (level === 50) {
    rewards.push({
      type: RewardType.AVATAR_FRAME,
      itemId: 'frame_gold',
      name: '黄金攀登者',
      rarity: RewardRarity.LEGENDARY,
    });
  }
  
  if (level === 75) {
    rewards.push({
      type: RewardType.TITLE,
      itemId: 'title_diamond_climber',
      name: '钻石攀登者',
      rarity: RewardRarity.LEGENDARY,
    });
  }
  
  if (level === 100) {
    rewards.push({
      type: RewardType.SKIN,
      itemId: 'skin_legendary_phoenix',
      name: '凤凰涅槃',
      rarity: RewardRarity.LEGENDARY,
    });
    rewards.push({
      type: RewardType.EFFECT,
      itemId: 'effect_phoenix_aura',
      name: '凤凰光环',
      rarity: RewardRarity.LEGENDARY,
    });
  }
  
  // 道具卡奖励
  if (level % 5 === 0) {
    rewards.push({
      type: RewardType.ITEM_CARD,
      itemId: `card_taunt_${level}`,
      name: '激怒卡',
      amount: 2 + Math.floor(level / 20),
      rarity: RewardRarity.RARE,
    });
  }
  
  return rewards;
}

/**
 * 战令系统主类
 */
class BattlePassSystem {
  constructor() {
    this.data = this.loadData();
    this.listeners = new Set();
  }
  
  /**
   * 加载战令数据
   * @returns {Object} 战令数据
   */
  loadData() {
    try {
      const saved = localStorage.getItem(BATTLE_PASS_CONFIG.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        // 检查赛季是否过期
        if (this.isSeasonExpired(data.seasonEndTime)) {
          return this.createNewSeasonData();
        }
        return { ...this.getDefaultData(), ...data };
      }
    } catch (error) {
      console.error('加载战令数据失败:', error);
    }
    return this.createNewSeasonData();
  }
  
  /**
   * 获取默认数据结构
   * @returns {Object} 默认数据
   */
  getDefaultData() {
    return {
      currentLevel: 1,
      currentXP: 0,
      seasonId: '',
      seasonStartTime: 0,
      seasonEndTime: 0,
      isPremium: false,
      claimedRewards: {
        free: [],    // 已领取的免费奖励等级
        premium: [], // 已领取的付费奖励等级
      },
      dailyProgress: {
        lastResetDate: '',
        tasksCompleted: 0,
        matchesCompleted: 0,
      },
    };
  }
  
  /**
   * 创建新赛季数据
   * @returns {Object} 新赛季数据
   */
  createNewSeasonData() {
    const now = Date.now();
    const seasonNumber = this.getSeasonNumber();
    
    return {
      ...this.getDefaultData(),
      seasonId: `season_${seasonNumber}_${now}`,
      seasonStartTime: now,
      seasonEndTime: now + (BATTLE_PASS_CONFIG.SEASON_DURATION_DAYS * 24 * 60 * 60 * 1000),
    };
  }
  
  /**
   * 获取当前赛季编号
   * @returns {number} 赛季编号
   */
  getSeasonNumber() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    // 每3个月一个赛季
    return (year - 2024) * 4 + Math.floor(month / 3) + 1;
  }
  
  /**
   * 检查赛季是否过期
   * @param {number} endTime - 赛季结束时间
   * @returns {boolean} 是否过期
   */
  isSeasonExpired(endTime) {
    return Date.now() > endTime;
  }
  
  /**
   * 保存数据到本地存储
   */
  saveData() {
    try {
      localStorage.setItem(
        BATTLE_PASS_CONFIG.STORAGE_KEY,
        JSON.stringify(this.data)
      );
      this.notifyListeners();
    } catch (error) {
      console.error('保存战令数据失败:', error);
    }
  }
  
  /**
   * 添加状态监听器
   * @param {Function} listener - 监听器函数
   */
  addListener(listener) {
    this.listeners.add(listener);
  }
  
  /**
   * 移除状态监听器
   * @param {Function} listener - 监听器函数
   */
  removeListener(listener) {
    this.listeners.delete(listener);
  }
  
  /**
   * 通知所有监听器
   */
  notifyListeners() {
    this.listeners.forEach(listener => {
      try {
        listener(this.getStatus());
      } catch (error) {
        console.error('战令监听器执行失败:', error);
      }
    });
  }
  
  /**
   * 获取战令当前状态
   * @returns {Object} 战令状态
   */
  getStatus() {
    const { currentLevel, currentXP, seasonEndTime, isPremium, claimedRewards } = this.data;
    const xpForNextLevel = this.getXPForNextLevel();
    const progress = xpForNextLevel > 0 ? (currentXP / xpForNextLevel) * 100 : 100;
    
    return {
      currentLevel,
      currentXP,
      xpForNextLevel,
      progress: Math.min(progress, 100),
      isMaxLevel: currentLevel >= BATTLE_PASS_CONFIG.MAX_LEVEL,
      isPremium,
      seasonEndTime,
      timeRemaining: this.getSeasonTimeRemaining(),
      canClaimFree: this.getClaimableRewards('free'),
      canClaimPremium: isPremium ? this.getClaimableRewards('premium') : [],
      totalRewardsCount: this.getTotalRewardsCount(),
    };
  }
  
  /**
   * 获取升到下一级所需经验值
   * @returns {number} 所需经验值
   */
  getXPForNextLevel() {
    if (this.data.currentLevel >= BATTLE_PASS_CONFIG.MAX_LEVEL) {
      return 0;
    }
    return BATTLE_PASS_CONFIG.XP_PER_LEVEL;
  }
  
  /**
   * 获取赛季剩余时间
   * @returns {Object} 剩余时间对象
   */
  getSeasonTimeRemaining() {
    const remaining = Math.max(0, this.data.seasonEndTime - Date.now());
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    
    return {
      total: remaining,
      days,
      hours,
      minutes,
      formatted: `${days}天 ${hours}小时 ${minutes}分钟`,
    };
  }
  
  /**
   * 添加经验值
   * @param {number} amount - 经验值数量
   * @param {string} source - 经验来源
   * @returns {Object} 升级结果
   */
  addXP(amount, source = 'unknown') {
    if (amount <= 0) return { leveledUp: false, levelsGained: 0 };
    
    let levelsGained = 0;
    let { currentLevel, currentXP } = this.data;
    
    currentXP += amount;
    
    // 检查升级
    while (currentLevel < BATTLE_PASS_CONFIG.MAX_LEVEL && 
           currentXP >= BATTLE_PASS_CONFIG.XP_PER_LEVEL) {
      currentXP -= BATTLE_PASS_CONFIG.XP_PER_LEVEL;
      currentLevel++;
      levelsGained++;
    }
    
    // 满级后经验值清零
    if (currentLevel >= BATTLE_PASS_CONFIG.MAX_LEVEL) {
      currentXP = 0;
    }
    
    this.data.currentLevel = currentLevel;
    this.data.currentXP = currentXP;
    
    this.saveData();
    
    return {
      leveledUp: levelsGained > 0,
      levelsGained,
      newLevel: currentLevel,
      xpAdded: amount,
      source,
    };
  }
  
  /**
   * 完成对局 - 添加经验值
   * @returns {Object} 结果
   */
  onMatchComplete() {
    return this.addXP(BATTLE_PASS_CONFIG.XP_REWARDS.MATCH_COMPLETE, 'match_complete');
  }
  
  /**
   * 完成每日任务 - 添加经验值
   * @returns {Object} 结果
   */
  onDailyTaskComplete() {
    return this.addXP(BATTLE_PASS_CONFIG.XP_REWARDS.DAILY_TASK_COMPLETE, 'daily_task');
  }
  
  /**
   * 登顶成功 - 添加经验值
   * @returns {Object} 结果
   */
  onSummitSuccess() {
    return this.addXP(BATTLE_PASS_CONFIG.XP_REWARDS.SUMMIT_SUCCESS, 'summit_success');
  }
  
  /**
   * 使用激怒牌 - 添加经验值
   * @returns {Object} 结果
   */
  onTauntCardUsed() {
    return this.addXP(BATTLE_PASS_CONFIG.XP_REWARDS.TAUNT_CARD_USED, 'taunt_card');
  }
  
  /**
   * 获取指定等级的奖励
   * @param {number} level - 等级
   * @returns {Object} 奖励信息
   */
  getLevelRewards(level) {
    const reward = LEVEL_REWARDS.find(r => r.level === level);
    if (!reward) return null;
    
    return {
      ...reward,
      freeClaimed: this.data.claimedRewards.free.includes(level),
      premiumClaimed: this.data.claimedRewards.premium.includes(level),
      canClaimFree: this.data.currentLevel >= level,
      canClaimPremium: this.data.isPremium && this.data.currentLevel >= level,
    };
  }
  
  /**
   * 领取指定等级的免费奖励
   * @param {number} level - 等级
   * @returns {Object} 领取结果
   */
  claimFreeReward(level) {
    if (this.data.currentLevel < level) {
      return { success: false, error: '等级不足' };
    }
    
    if (this.data.claimedRewards.free.includes(level)) {
      return { success: false, error: '奖励已领取' };
    }
    
    const levelReward = LEVEL_REWARDS.find(r => r.level === level);
    if (!levelReward || levelReward.free.length === 0) {
      return { success: false, error: '该等级无免费奖励' };
    }
    
    this.data.claimedRewards.free.push(level);
    this.saveData();
    
    return {
      success: true,
      level,
      track: 'free',
      rewards: levelReward.free,
    };
  }
  
  /**
   * 领取指定等级的付费奖励
   * @param {number} level - 等级
   * @returns {Object} 领取结果
   */
  claimPremiumReward(level) {
    if (!this.data.isPremium) {
      return { success: false, error: '未购买高级战令' };
    }
    
    if (this.data.currentLevel < level) {
      return { success: false, error: '等级不足' };
    }
    
    if (this.data.claimedRewards.premium.includes(level)) {
      return { success: false, error: '奖励已领取' };
    }
    
    const levelReward = LEVEL_REWARDS.find(r => r.level === level);
    if (!levelReward || levelReward.premium.length === 0) {
      return { success: false, error: '该等级无付费奖励' };
    }
    
    this.data.claimedRewards.premium.push(level);
    this.saveData();
    
    return {
      success: true,
      level,
      track: 'premium',
      rewards: levelReward.premium,
    };
  }
  
  /**
   * 获取可领取的奖励列表
   * @param {string} track - 轨道类型 ('free' | 'premium')
   * @returns {Array} 可领取的等级列表
   */
  getClaimableRewards(track) {
    const claimable = [];
    const claimed = this.data.claimedRewards[track];
    
    for (let level = 1; level <= this.data.currentLevel; level++) {
      if (!claimed.includes(level)) {
        const levelReward = LEVEL_REWARDS.find(r => r.level === level);
        if (levelReward && levelReward[track].length > 0) {
          claimable.push(level);
        }
      }
    }
    
    return claimable;
  }
  
  /**
   * 一键领取所有可领奖励
   * @returns {Object} 领取结果
   */
  claimAllRewards() {
    const results = {
      free: [],
      premium: [],
      totalRewards: [],
    };
    
    // 领取免费奖励
    const freeClaimable = this.getClaimableRewards('free');
    for (const level of freeClaimable) {
      const result = this.claimFreeReward(level);
      if (result.success) {
        results.free.push(result);
        results.totalRewards.push(...result.rewards);
      }
    }
    
    // 领取付费奖励
    if (this.data.isPremium) {
      const premiumClaimable = this.getClaimableRewards('premium');
      for (const level of premiumClaimable) {
        const result = this.claimPremiumReward(level);
        if (result.success) {
          results.premium.push(result);
          results.totalRewards.push(...result.rewards);
        }
      }
    }
    
    return {
      success: true,
      freeCount: results.free.length,
      premiumCount: results.premium.length,
      ...results,
    };
  }
  
  /**
   * 购买高级战令
   * @returns {Object} 购买结果
   */
  purchasePremium() {
    if (this.data.isPremium) {
      return { success: false, error: '已购买高级战令' };
    }
    
    // 这里可以添加实际的支付逻辑
    // 返回需要支付的钻石数量
    return {
      success: true,
      price: BATTLE_PASS_CONFIG.PREMIUM_PRICE,
      message: '请确认支付',
      // 确认支付后调用 confirmPurchasePremium
    };
  }
  
  /**
   * 确认购买高级战令
   * @returns {Object} 结果
   */
  confirmPurchasePremium() {
    if (this.data.isPremium) {
      return { success: false, error: '已购买高级战令' };
    }
    
    this.data.isPremium = true;
    this.saveData();
    
    // 立即领取当前等级及以下的所有付费奖励
    const claimResults = [];
    for (let level = 1; level <= this.data.currentLevel; level++) {
      const levelReward = LEVEL_REWARDS.find(r => r.level === level);
      if (levelReward && levelReward.premium.length > 0 && 
          !this.data.claimedRewards.premium.includes(level)) {
        const result = this.claimPremiumReward(level);
        if (result.success) {
          claimResults.push(result);
        }
      }
    }
    
    return {
      success: true,
      message: '购买成功',
      claimedRewards: claimResults,
    };
  }
  
  /**
   * 计算购买等级所需钻石
   * @param {number} targetLevel - 目标等级
   * @returns {number} 所需钻石
   */
  calculateLevelUpCost(targetLevel) {
    if (targetLevel <= this.data.currentLevel) {
      return 0;
    }
    if (targetLevel > BATTLE_PASS_CONFIG.MAX_LEVEL) {
      targetLevel = BATTLE_PASS_CONFIG.MAX_LEVEL;
    }
    
    const levelsToBuy = targetLevel - this.data.currentLevel;
    return levelsToBuy * BATTLE_PASS_CONFIG.LEVEL_UP_COST.PER_LEVEL_DIAMONDS;
  }
  
  /**
   * 快速升级 - 使用钻石购买等级
   * @param {number} targetLevel - 目标等级
   * @returns {Object} 升级结果
   */
  fastLevelUp(targetLevel) {
    if (targetLevel <= this.data.currentLevel) {
      return { success: false, error: '目标等级必须高于当前等级' };
    }
    if (targetLevel > BATTLE_PASS_CONFIG.MAX_LEVEL) {
      return { success: false, error: `最高等级为${BATTLE_PASS_CONFIG.MAX_LEVEL}级` };
    }
    
    const cost = this.calculateLevelUpCost(targetLevel);
    const oldLevel = this.data.currentLevel;
    
    // 这里可以添加实际的钻石扣除逻辑
    
    this.data.currentLevel = targetLevel;
    this.data.currentXP = 0;
    this.saveData();
    
    return {
      success: true,
      oldLevel,
      newLevel: targetLevel,
      cost,
      message: `成功升至${targetLevel}级`,
    };
  }
  
  /**
   * 获取总奖励统计
   * @returns {Object} 奖励统计
   */
  getTotalRewardsCount() {
    const stats = {
      free: { total: 0, claimed: 0 },
      premium: { total: 0, claimed: 0 },
    };
    
    for (let level = 1; level <= BATTLE_PASS_CONFIG.MAX_LEVEL; level++) {
      const reward = LEVEL_REWARDS.find(r => r.level === level);
      if (reward) {
        if (reward.free.length > 0) {
          stats.free.total++;
          if (this.data.claimedRewards.free.includes(level)) {
            stats.free.claimed++;
          }
        }
        if (reward.premium.length > 0) {
          stats.premium.total++;
          if (this.data.claimedRewards.premium.includes(level)) {
            stats.premium.claimed++;
          }
        }
      }
    }
    
    return stats;
  }
  
  /**
   * 重置战令（新赛季）
   * @returns {Object} 结果
   */
  resetForNewSeason() {
    this.data = this.createNewSeasonData();
    this.saveData();
    
    return {
      success: true,
      message: '新赛季已开始',
      seasonId: this.data.seasonId,
    };
  }
  
  /**
   * 导出数据（用于备份）
   * @returns {string} JSON字符串
   */
  exportData() {
    return JSON.stringify(this.data, null, 2);
  }
  
  /**
   * 导入数据
   * @param {string} jsonData - JSON字符串
   * @returns {Object} 结果
   */
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      // 验证数据结构
      if (this.validateData(data)) {
        this.data = { ...this.getDefaultData(), ...data };
        this.saveData();
        return { success: true, message: '数据导入成功' };
      }
      return { success: false, error: '数据格式无效' };
    } catch (error) {
      return { success: false, error: 'JSON解析失败' };
    }
  }
  
  /**
   * 验证数据结构
   * @param {Object} data - 数据对象
   * @returns {boolean} 是否有效
   */
  validateData(data) {
    const required = ['currentLevel', 'currentXP', 'seasonId', 'claimedRewards'];
    return required.every(key => key in data);
  }
}

/**
 * 战令UI管理器
 * 用于处理界面显示和交互
 */
class BattlePassUIManager {
  constructor(battlePassSystem) {
    this.bps = battlePassSystem;
    this.elements = {};
  }
  
  /**
   * 初始化UI元素引用
   * @param {Object} elements - UI元素对象
   */
  initElements(elements) {
    this.elements = elements;
    this.bindEvents();
    this.updateUI();
  }
  
  /**
   * 绑定事件
   */
  bindEvents() {
    // 监听战令状态变化
    this.bps.addListener(() => this.updateUI());
  }
  
  /**
   * 更新UI显示
   */
  updateUI() {
    const status = this.bps.getStatus();
    
    // 更新等级显示
    if (this.elements.levelDisplay) {
      this.elements.levelDisplay.textContent = `Lv.${status.currentLevel}`;
    }
    
    // 更新经验条
    if (this.elements.xpBar) {
      this.elements.xpBar.style.width = `${status.progress}%`;
    }
    
    if (this.elements.xpText) {
      this.elements.xpText.textContent = `${status.currentXP}/${status.xpForNextLevel} XP`;
    }
    
    // 更新赛季倒计时
    if (this.elements.countdown) {
      this.elements.countdown.textContent = status.timeRemaining.formatted;
    }
    
    // 更新高级战令状态
    if (this.elements.premiumBadge) {
      this.elements.premiumBadge.style.display = status.isPremium ? 'block' : 'none';
    }
    
    // 更新可领取奖励提示
    const totalClaimable = status.canClaimFree.length + status.canClaimPremium.length;
    if (this.elements.claimBadge) {
      this.elements.claimBadge.textContent = totalClaimable;
      this.elements.claimBadge.style.display = totalClaimable > 0 ? 'block' : 'none';
    }
  }
  
  /**
   * 渲染奖励列表
   * @returns {string} HTML字符串
   */
  renderRewardsList() {
    const status = this.bps.getStatus();
    let html = '';
    
    for (let level = 1; level <= Math.min(100, status.currentLevel + 5); level++) {
      const reward = this.bps.getLevelRewards(level);
      if (!reward) continue;
      
      const isCurrent = level === status.currentLevel;
      const isPassed = level < status.currentLevel;
      
      html += `
        <div class="reward-level ${isCurrent ? 'current' : ''} ${isPassed ? 'passed' : ''}">
          <div class="level-header">等级 ${level}</div>
          <div class="reward-tracks">
            <div class="track free">
              <span class="track-label">免费</span>
              ${this.renderRewards(reward.free, reward.freeClaimed, reward.canClaimFree)}
            </div>
            <div class="track premium">
              <span class="track-label">付费</span>
              ${this.renderRewards(reward.premium, reward.premiumClaimed, reward.canClaimPremium)}
            </div>
          </div>
        </div>
      `;
    }
    
    return html;
  }
  
  /**
   * 渲染单个奖励
   * @param {Array} rewards - 奖励数组
   * @param {boolean} claimed - 是否已领取
   * @param {boolean} canClaim - 是否可以领取
   * @returns {string} HTML字符串
   */
  renderRewards(rewards, claimed, canClaim) {
    if (rewards.length === 0) {
      return '<span class="no-reward">-</span>';
    }
    
    return rewards.map(reward => `
      <div class="reward-item ${reward.rarity} ${claimed ? 'claimed' : ''} ${canClaim && !claimed ? 'claimable' : ''}">
        <span class="reward-icon">${this.getRewardIcon(reward.type)}</span>
        <span class="reward-name">${reward.name || reward.type}</span>
        ${reward.amount ? `<span class="reward-amount">×${reward.amount}</span>` : ''}
        ${claimed ? '<span class="claimed-mark">✓</span>' : ''}
      </div>
    `).join('');
  }
  
  /**
   * 获取奖励图标
   * @param {string} type - 奖励类型
   * @returns {string} 图标
   */
  getRewardIcon(type) {
    const icons = {
      [RewardType.GOLD]: '🪙',
      [RewardType.DIAMOND]: '💎',
      [RewardType.SKIN]: '👕',
      [RewardType.EFFECT]: '✨',
      [RewardType.AVATAR_FRAME]: '🖼️',
      [RewardType.TITLE]: '🏆',
      [RewardType.ITEM_CARD]: '🎴',
    };
    return icons[type] || '🎁';
  }
  
  /**
   * 显示购买高级战令弹窗
   */
  showPurchasePremiumModal() {
    const result = this.bps.purchasePremium();
    if (result.success) {
      return {
        title: '购买高级战令',
        content: `花费 ${result.price} 钻石解锁高级战令，立即获得当前等级及以下的所有付费奖励！`,
        price: result.price,
        onConfirm: () => this.bps.confirmPurchasePremium(),
      };
    }
    return { error: result.error };
  }
  
  /**
   * 显示快速升级弹窗
   * @param {number} targetLevel - 目标等级
   */
  showFastLevelUpModal(targetLevel) {
    const cost = this.bps.calculateLevelUpCost(targetLevel);
    const status = this.bps.getStatus();
    
    return {
      title: '快速升级',
      content: `从 Lv.${status.currentLevel} 升至 Lv.${targetLevel}`,
      cost,
      onConfirm: () => this.bps.fastLevelUp(targetLevel),
    };
  }
}

/**
 * 游戏集成API
 * 供游戏主逻辑调用
 */
class BattlePassAPI {
  constructor() {
    this.system = new BattlePassSystem();
    this.ui = new BattlePassUIManager(this.system);
  }
  
  // ===== 经验值获取接口 =====
  
  /** 完成对局 */
  onMatchComplete() {
    return this.system.onMatchComplete();
  }
  
  /** 完成每日任务 */
  onDailyTaskComplete() {
    return this.system.onDailyTaskComplete();
  }
  
  /** 登顶成功 */
  onSummitSuccess() {
    return this.system.onSummitSuccess();
  }
  
  /** 使用激怒牌 */
  onTauntCardUsed() {
    return this.system.onTauntCardUsed();
  }
  
  // ===== 奖励领取接口 =====
  
  /** 领取免费奖励 */
  claimFreeReward(level) {
    return this.system.claimFreeReward(level);
  }
  
  /** 领取付费奖励 */
  claimPremiumReward(level) {
    return this.system.claimPremiumReward(level);
  }
  
  /** 一键领取所有奖励 */
  claimAllRewards() {
    return this.system.claimAllRewards();
  }
  
  // ===== 购买接口 =====
  
  /** 购买高级战令 */
  purchasePremium() {
    return this.system.purchasePremium();
  }
  
  /** 确认购买高级战令 */
  confirmPurchasePremium() {
    return this.system.confirmPurchasePremium();
  }
  
  /** 快速升级 */
  fastLevelUp(targetLevel) {
    return this.system.fastLevelUp(targetLevel);
  }
  
  // ===== 查询接口 =====
  
  /** 获取当前状态 */
  getStatus() {
    return this.system.getStatus();
  }
  
  /** 获取等级奖励 */
  getLevelRewards(level) {
    return this.system.getLevelRewards(level);
  }
  
  /** 获取赛季倒计时 */
  getSeasonTimeRemaining() {
    return this.system.getSeasonTimeRemaining();
  }
  
  // ===== UI接口 =====
  
  /** 初始化UI */
  initUI(elements) {
    return this.ui.initElements(elements);
  }
  
  /** 渲染奖励列表 */
  renderRewardsList() {
    return this.ui.renderRewardsList();
  }
}

// ===== 导出 =====

// ES Module 导出
export {
  BattlePassSystem,
  BattlePassUIManager,
  BattlePassAPI,
  BATTLE_PASS_CONFIG,
  RewardType,
  RewardRarity,
  LEVEL_REWARDS,
};

// 默认导出
export default BattlePassAPI;

// 全局变量（用于浏览器环境）
if (typeof window !== 'undefined') {
  window.BattlePassAPI = BattlePassAPI;
  window.BattlePassSystem = BattlePassSystem;
  window.BattlePassUIManager = BattlePassUIManager;
  window.BATTLE_PASS_CONFIG = BATTLE_PASS_CONFIG;
  window.RewardType = RewardType;
  window.RewardRarity = RewardRarity;
}

/**
 * 使用示例:
 * 
 * ```javascript
 * // 初始化战令系统
 * const battlePass = new BattlePassAPI();
 * 
 * // 游戏事件中调用
 * // 完成对局后
 * battlePass.onMatchComplete();
 * 
 * // 登顶成功后
 * battlePass.onSummitSuccess();
 * 
 * // 获取当前状态
 * const status = battlePass.getStatus();
 * console.log(`当前等级: ${status.currentLevel}`);
 * console.log(`赛季剩余: ${status.timeRemaining.formatted}`);
 * 
 * // 一键领取所有奖励
 * const claimResult = battlePass.claimAllRewards();
 * console.log(`领取了 ${claimResult.freeCount} 个免费奖励`);
 * 
 * // 购买高级战令
 * battlePass.confirmPurchasePremium();
 * 
 * // 快速升级到50级
 * battlePass.fastLevelUp(50);
 * ```
 */