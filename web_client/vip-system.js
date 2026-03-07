/**
 * 命运塔 - VIP/会员系统
 * Tower of Fate - VIP/Membership System
 * 
 * 功能模块：
 * 1. VIP等级系统（1-15级）
 * 2. VIP经验获取与充值转换
 * 3. 每级VIP特权管理
 * 4. VIP专属活动
 * 5. VIP标识显示
 * 6. VIP礼包系统（每周/每月）
 * 7. VIP经验条与下一级预览
 * 8. 本地数据持久化
 */

class VIPSystem {
  constructor() {
    this.storageKey = 'tower_of_fate_vip_data';
    this.init();
  }

  // ==================== 初始化 ====================
  init() {
    this.data = this.loadData();
    if (!this.data) {
      this.data = this.getDefaultData();
      this.saveData();
    }
    this.vipConfig = this.getVIPConfig();
  }

  getDefaultData() {
    return {
      level: 0,           // 当前VIP等级 (0-15)
      experience: 0,      // 当前VIP经验值
      totalRecharged: 0,  // 累计充值金额（元）
      weeklyGiftClaimed: false,  // 本周礼包是否已领取
      monthlyGiftClaimed: false, // 本月礼包是否已领取
      lastWeeklyClaim: null,     // 上次领取周礼包时间
      lastMonthlyClaim: null,    // 上次领取月礼包时间
      unlockedSkins: [],         // 已解锁的VIP专属皮肤
      unlockedFrames: [],        // 已解锁的VIP专属头像框
      dailyRewardsClaimed: false // 今日每日奖励是否已领取
    };
  }

  // ==================== VIP配置 ====================
  getVIPConfig() {
    return {
      // VIP等级配置：等级 -> 所需经验值
      levels: {
        0: { expRequired: 0, title: '普通玩家' },
        1: { expRequired: 100, title: 'VIP 1' },
        2: { expRequired: 300, title: 'VIP 2' },
        3: { expRequired: 600, title: 'VIP 3' },
        4: { expRequired: 1000, title: 'VIP 4' },
        5: { expRequired: 1500, title: 'VIP 5' },
        6: { expRequired: 2200, title: 'VIP 6' },
        7: { expRequired: 3000, title: 'VIP 7' },
        8: { expRequired: 4000, title: 'VIP 8' },
        9: { expRequired: 5500, title: 'VIP 9' },
        10: { expRequired: 7500, title: 'VIP 10' },
        11: { expRequired: 10000, title: 'VIP 11' },
        12: { expRequired: 13000, title: 'VIP 12' },
        13: { expRequired: 16500, title: 'VIP 13' },
        14: { expRequired: 20500, title: 'VIP 14' },
        15: { expRequired: 25000, title: 'VIP 15 - 至尊' }
      },

      // 每级VIP特权配置
      privileges: {
        0: {
          goldBonus: 0,           // 每日金币加成 %
          diamondReward: 0,       // 每日钻石奖励
          skinUnlock: [],         // 专属皮肤
          frameUnlock: [],        // 专属头像框
          battleExpBonus: 0,      // 对战经验加成 %
          shopDiscount: 0,        // 商店折扣 %
          freeRevives: 0,         // 免费复活次数
          prioritySupport: false, // 客服优先
          vipBadge: false         // VIP标识显示
        },
        1: {
          goldBonus: 10,
          diamondReward: 10,
          skinUnlock: [],
          frameUnlock: ['vip1_frame'],
          battleExpBonus: 5,
          shopDiscount: 0,
          freeRevives: 0,
          prioritySupport: false,
          vipBadge: true
        },
        2: {
          goldBonus: 15,
          diamondReward: 15,
          skinUnlock: [],
          frameUnlock: ['vip2_frame'],
          battleExpBonus: 8,
          shopDiscount: 0,
          freeRevives: 0,
          prioritySupport: false,
          vipBadge: true
        },
        3: {
          goldBonus: 18,
          diamondReward: 20,
          skinUnlock: [],
          frameUnlock: ['vip3_frame'],
          battleExpBonus: 10,
          shopDiscount: 0,
          freeRevives: 1,
          prioritySupport: false,
          vipBadge: true
        },
        4: {
          goldBonus: 25,
          diamondReward: 35,
          skinUnlock: [],
          frameUnlock: ['vip4_frame'],
          battleExpBonus: 12,
          shopDiscount: 0,
          freeRevives: 1,
          prioritySupport: false,
          vipBadge: true
        },
        5: {
          goldBonus: 30,
          diamondReward: 50,
          skinUnlock: [],
          frameUnlock: ['vip5_frame'],
          battleExpBonus: 15,
          shopDiscount: 10,      // 9折
          freeRevives: 1,
          prioritySupport: false,
          vipBadge: true
        },
        6: {
          goldBonus: 35,
          diamondReward: 65,
          skinUnlock: [],
          frameUnlock: ['vip6_frame'],
          battleExpBonus: 18,
          shopDiscount: 10,
          freeRevives: 2,
          prioritySupport: false,
          vipBadge: true
        },
        7: {
          goldBonus: 40,
          diamondReward: 80,
          skinUnlock: [],
          frameUnlock: ['vip7_frame'],
          battleExpBonus: 20,
          shopDiscount: 10,
          freeRevives: 2,
          prioritySupport: true,
          vipBadge: true
        },
        8: {
          goldBonus: 45,
          diamondReward: 95,
          skinUnlock: ['vip8_skin'],
          frameUnlock: ['vip8_frame'],
          battleExpBonus: 22,
          shopDiscount: 15,      // 85折
          freeRevives: 2,
          prioritySupport: true,
          vipBadge: true
        },
        9: {
          goldBonus: 55,
          diamondReward: 110,
          skinUnlock: ['vip8_skin'],
          frameUnlock: ['vip9_frame'],
          battleExpBonus: 25,
          shopDiscount: 15,
          freeRevives: 3,
          prioritySupport: true,
          vipBadge: true
        },
        10: {
          goldBonus: 60,
          diamondReward: 120,
          skinUnlock: ['vip10_skin', 'vip8_skin'],
          frameUnlock: ['vip10_frame'],
          battleExpBonus: 30,
          shopDiscount: 20,      // 8折
          freeRevives: 3,
          prioritySupport: true,
          vipBadge: true
        },
        11: {
          goldBonus: 70,
          diamondReward: 150,
          skinUnlock: ['vip10_skin', 'vip8_skin'],
          frameUnlock: ['vip11_frame'],
          battleExpBonus: 32,
          shopDiscount: 20,
          freeRevives: 4,
          prioritySupport: true,
          vipBadge: true
        },
        12: {
          goldBonus: 80,
          diamondReward: 180,
          skinUnlock: ['vip12_skin', 'vip10_skin', 'vip8_skin'],
          frameUnlock: ['vip12_frame'],
          battleExpBonus: 35,
          shopDiscount: 20,
          freeRevives: 4,
          prioritySupport: true,
          vipBadge: true
        },
        13: {
          goldBonus: 85,
          diamondReward: 220,
          skinUnlock: ['vip12_skin', 'vip10_skin', 'vip8_skin'],
          frameUnlock: ['vip13_frame'],
          battleExpBonus: 38,
          shopDiscount: 25,      // 75折
          freeRevives: 5,
          prioritySupport: true,
          vipBadge: true
        },
        14: {
          goldBonus: 90,
          diamondReward: 260,
          skinUnlock: ['vip14_skin', 'vip12_skin', 'vip10_skin', 'vip8_skin'],
          frameUnlock: ['vip14_frame'],
          battleExpBonus: 42,
          shopDiscount: 25,
          freeRevives: 5,
          prioritySupport: true,
          vipBadge: true
        },
        15: {
          goldBonus: 100,
          diamondReward: 300,
          skinUnlock: ['vip15_skin', 'vip14_skin', 'vip12_skin', 'vip10_skin', 'vip8_skin'],
          frameUnlock: ['vip15_frame', 'vip14_frame', 'vip13_frame', 'vip12_frame', 'vip11_frame', 'vip10_frame'],
          battleExpBonus: 50,
          shopDiscount: 30,      // 7折
          freeRevives: 10,
          prioritySupport: true,
          vipBadge: true
        }
      },

      // 充值转换比例：1元 = 10 VIP经验
      rechargeRate: 10,

      // VIP礼包配置
      giftPackages: {
        weekly: {
          gold: 1000,
          diamonds: 100,
          energy: 50,
          cards: 5
        },
        monthly: {
          gold: 5000,
          diamonds: 500,
          energy: 200,
          cards: 20,
          exclusiveItem: 'vip_monthly_box'
        }
      },

      // VIP专属活动
      exclusiveEvents: [
        {
          id: 'vip_weekly_boss',
          name: 'VIP专属BOSS挑战',
          minLevel: 1,
          description: '每周可挑战VIP专属BOSS，掉落稀有装备',
          rewards: { gold: 2000, diamonds: 50, dropRate: 2.0 }
        },
        {
          id: 'vip_double_exp',
          name: 'VIP双倍经验日',
          minLevel: 3,
          description: '每周三、周日全天双倍经验',
          rewards: { expMultiplier: 2.0 }
        },
        {
          id: 'vip_exclusive_shop',
          name: 'VIP专属商店',
          minLevel: 5,
          description: '每日刷新VIP专属商品，价格优惠50%',
          rewards: { discount: 50 }
        },
        {
          id: 'vip_tower_rush',
          name: 'VIP命运塔冲刺',
          minLevel: 7,
          description: '每月一次的VIP专属爬塔活动，奖励翻倍',
          rewards: { gold: 10000, diamonds: 300, cards: 10 }
        },
        {
          id: 'vip_legendary_drop',
          name: 'VIP传说掉落加成',
          minLevel: 10,
          description: '所有战斗传说装备掉落率提升100%',
          rewards: { legendaryDropRate: 2.0 }
        }
      ]
    };
  }

  // ==================== 本地存储 ====================
  loadData() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('VIP数据加载失败:', error);
      return null;
    }
  }

  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      return true;
    } catch (error) {
      console.error('VIP数据保存失败:', error);
      return false;
    }
  }

  // 导出VIP数据（用于云同步）
  exportData() {
    return {
      ...this.data,
      exportTime: Date.now(),
      version: '1.0.0'
    };
  }

  // 导入VIP数据
  importData(importedData) {
    if (importedData && importedData.level !== undefined) {
      this.data = { ...this.getDefaultData(), ...importedData };
      this.saveData();
      return true;
    }
    return false;
  }

  // ==================== VIP等级管理 ====================
  getCurrentLevel() {
    return this.data.level;
  }

  getCurrentExp() {
    return this.data.experience;
  }

  // 获取当前等级所需经验
  getExpRequiredForLevel(level) {
    const config = this.vipConfig.levels[level];
    return config ? config.expRequired : Infinity;
  }

  // 获取升级至下一级所需经验
  getExpToNextLevel() {
    if (this.data.level >= 15) return 0;
    const nextLevel = this.data.level + 1;
    const required = this.getExpRequiredForLevel(nextLevel);
    return required - this.data.experience;
  }

  // 获取当前等级进度百分比
  getLevelProgress() {
    if (this.data.level >= 15) return 100;
    const currentLevelExp = this.getExpRequiredForLevel(this.data.level);
    const nextLevelExp = this.getExpRequiredForLevel(this.data.level + 1);
    const expInLevel = this.data.experience - currentLevelExp;
    const expNeeded = nextLevelExp - currentLevelExp;
    return Math.min(100, Math.max(0, (expInLevel / expNeeded) * 100));
  }

  // 获取经验条显示数据
  getExpBarData() {
    const currentLevel = this.data.level;
    const currentExp = this.data.experience;
    const currentLevelExp = this.getExpRequiredForLevel(currentLevel);
    const nextLevelExp = currentLevel >= 15 
      ? currentExp 
      : this.getExpRequiredForLevel(currentLevel + 1);
    
    return {
      level: currentLevel,
      title: this.vipConfig.levels[currentLevel].title,
      currentExp,
      currentLevelExp,
      nextLevelExp,
      expInLevel: currentExp - currentLevelExp,
      expNeededForNext: nextLevelExp - currentLevelExp,
      expToNext: this.getExpToNextLevel(),
      progressPercent: this.getLevelProgress(),
      isMaxLevel: currentLevel >= 15
    };
  }

  // ==================== 充值与经验 ====================
  // 充值转换：1元 = 10 VIP经验
  recharge(amount) {
    if (amount <= 0) return { success: false, message: '充值金额无效' };
    
    const expGained = Math.floor(amount * this.vipConfig.rechargeRate);
    this.data.totalRecharged += amount;
    
    const result = this.addExperience(expGained);
    
    return {
      success: true,
      amount,
      expGained,
      ...result,
      totalRecharged: this.data.totalRecharged
    };
  }

  // 添加VIP经验
  addExperience(amount) {
    if (amount <= 0) return { leveledUp: false };
    
    const oldLevel = this.data.level;
    this.data.experience += amount;
    
    // 检查升级
    let newLevel = oldLevel;
    for (let lvl = 15; lvl > oldLevel; lvl--) {
      if (this.data.experience >= this.vipConfig.levels[lvl].expRequired) {
        newLevel = lvl;
        break;
      }
    }
    
    const leveledUp = newLevel > oldLevel;
    if (leveledUp) {
      this.data.level = newLevel;
      this.onLevelUp(oldLevel, newLevel);
    }
    
    this.saveData();
    
    return {
      leveledUp,
      oldLevel,
      newLevel: this.data.level,
      totalExp: this.data.experience,
      unlocked: leveledUp ? this.getUnlockedRewards(oldLevel, newLevel) : null
    };
  }

  // 升级回调
  onLevelUp(oldLevel, newLevel) {
    const newPrivileges = this.vipConfig.privileges[newLevel];
    
    // 解锁新皮肤
    if (newPrivileges.skinUnlock.length > 0) {
      this.data.unlockedSkins = [...new Set([...this.data.unlockedSkins, ...newPrivileges.skinUnlock])];
    }
    
    // 解锁新头像框
    if (newPrivileges.frameUnlock.length > 0) {
      this.data.unlockedFrames = [...new Set([...this.data.unlockedFrames, ...newPrivileges.frameUnlock])];
    }
    
    console.log(`🎉 恭喜！VIP等级提升：${oldLevel} → ${newLevel}`);
    
    // 触发升级事件（可扩展）
    this.triggerEvent('vipLevelUp', { oldLevel, newLevel });
  }

  // 获取升级解锁的奖励
  getUnlockedRewards(oldLevel, newLevel) {
    const rewards = {
      skins: [],
      frames: [],
      privileges: []
    };
    
    for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
      const priv = this.vipConfig.privileges[lvl];
      rewards.skins.push(...priv.skinUnlock);
      rewards.frames.push(...priv.frameUnlock);
      rewards.privileges.push({
        level: lvl,
        goldBonus: priv.goldBonus,
        diamondReward: priv.diamondReward,
        shopDiscount: priv.shopDiscount,
        freeRevives: priv.freeRevives
      });
    }
    
    rewards.skins = [...new Set(rewards.skins)];
    rewards.frames = [...new Set(rewards.frames)];
    
    return rewards;
  }

  // ==================== 特权查询 ====================
  getCurrentPrivileges() {
    return this.vipConfig.privileges[this.data.level];
  }

  getPrivilegesAtLevel(level) {
    return this.vipConfig.privileges[level] || this.vipConfig.privileges[0];
  }

  // 下一级特权预览
  getNextLevelPreview() {
    if (this.data.level >= 15) {
      return { hasNext: false, message: '已达到最高VIP等级' };
    }
    
    const nextLevel = this.data.level + 1;
    const currentPriv = this.getCurrentPrivileges();
    const nextPriv = this.getPrivilegesAtLevel(nextLevel);
    
    return {
      hasNext: true,
      currentLevel: this.data.level,
      nextLevel,
      expToNext: this.getExpToNextLevel(),
      nextLevelExp: this.getExpRequiredForLevel(nextLevel),
      current: currentPriv,
      next: nextPriv,
      differences: this.comparePrivileges(currentPriv, nextPriv)
    };
  }

  comparePrivileges(current, next) {
    const diff = {};
    
    if (next.goldBonus > current.goldBonus) {
      diff.goldBonus = { from: current.goldBonus, to: next.goldBonus };
    }
    if (next.diamondReward > current.diamondReward) {
      diff.diamondReward = { from: current.diamondReward, to: next.diamondReward };
    }
    if (next.battleExpBonus > current.battleExpBonus) {
      diff.battleExpBonus = { from: current.battleExpBonus, to: next.battleExpBonus };
    }
    if (next.shopDiscount > current.shopDiscount) {
      diff.shopDiscount = { from: current.shopDiscount, to: next.shopDiscount };
    }
    if (next.freeRevives > current.freeRevives) {
      diff.freeRevives = { from: current.freeRevives, to: next.freeRevives };
    }
    if (next.prioritySupport && !current.prioritySupport) {
      diff.prioritySupport = { from: false, to: true };
    }
    
    // 新解锁的皮肤
    const newSkins = next.skinUnlock.filter(s => !current.skinUnlock.includes(s));
    if (newSkins.length > 0) {
      diff.newSkins = newSkins;
    }
    
    // 新解锁的头像框
    const newFrames = next.frameUnlock.filter(f => !current.frameUnlock.includes(f));
    if (newFrames.length > 0) {
      diff.newFrames = newFrames;
    }
    
    return diff;
  }

  // ==================== VIP标识与显示 ====================
  // 获取VIP显示信息（用于游戏内显示和排行榜）
  getVIPDisplayInfo() {
    const level = this.data.level;
    const config = this.vipConfig.levels[level];
    const privileges = this.getCurrentPrivileges();
    
    return {
      level,
      title: config.title,
      hasBadge: privileges.vipBadge,
      badgeIcon: level > 0 ? `vip_${level}` : null,
      badgeColor: this.getVIPColor(level),
      frameEquipped: this.data.unlockedFrames[this.data.unlockedFrames.length - 1] || null,
      skinEquipped: this.data.unlockedSkins[this.data.unlockedSkins.length - 1] || null,
      showInLeaderboard: level > 0,
      showInGame: level > 0
    };
  }

  // 获取VIP等级颜色
  getVIPColor(level) {
    const colors = {
      0: '#9E9E9E',   // 灰色
      1: '#4CAF50',   // 绿色
      2: '#4CAF50',
      3: '#2196F3',   // 蓝色
      4: '#2196F3',
      5: '#9C27B0',   // 紫色
      6: '#9C27B0',
      7: '#FF9800',   // 橙色
      8: '#FF9800',
      9: '#FF5722',   // 深橙
      10: '#F44336',  // 红色
      11: '#F44336',
      12: '#E91E63',  // 粉红
      13: '#E91E63',
      14: '#00BCD4',  // 青色
      15: '#FFD700'   // 金色
    };
    return colors[level] || colors[0];
  }

  // 获取排行榜显示字符串
  getLeaderboardDisplay(username) {
    const info = this.getVIPDisplayInfo();
    if (!info.hasBadge) return username;
    return `[VIP${info.level}] ${username}`;
  }

  // 获取游戏内VIP标识HTML
  getVIPBadgeHTML() {
    const info = this.getVIPDisplayInfo();
    if (!info.hasBadge) return '';
    
    return `
      <span class="vip-badge" style="color: ${info.badgeColor}; font-weight: bold;">
        <span class="vip-icon">👑</span>
        VIP${info.level}
      </span>
    `;
  }

  // ==================== VIP礼包 ====================
  // 检查周礼包可领取状态
  canClaimWeeklyGift() {
    if (this.data.level < 1) return { canClaim: false, reason: 'VIP1及以上可领取' };
    
    const now = new Date();
    const lastClaim = this.data.lastWeeklyClaim ? new Date(this.data.lastWeeklyClaim) : null;
    
    if (!lastClaim) return { canClaim: true };
    
    // 检查是否已过一周（以周一为起点）
    const currentWeek = this.getWeekNumber(now);
    const lastWeek = this.getWeekNumber(lastClaim);
    
    return {
      canClaim: currentWeek !== lastWeek || now.getFullYear() !== lastClaim.getFullYear(),
      nextClaimTime: this.getNextWeeklyResetTime()
    };
  }

  // 检查月礼包可领取状态
  canClaimMonthlyGift() {
    if (this.data.level < 1) return { canClaim: false, reason: 'VIP1及以上可领取' };
    
    const now = new Date();
    const lastClaim = this.data.lastMonthlyClaim ? new Date(this.data.lastMonthlyClaim) : null;
    
    if (!lastClaim) return { canClaim: true };
    
    return {
      canClaim: now.getMonth() !== lastClaim.getMonth() || now.getFullYear() !== lastClaim.getFullYear(),
      nextClaimTime: this.getNextMonthlyResetTime()
    };
  }

  // 领取周礼包
  claimWeeklyGift() {
    const check = this.canClaimWeeklyGift();
    if (!check.canClaim) {
      return { success: false, message: check.reason || '本周已领取' };
    }
    
    const rewards = this.calculateGiftRewards('weekly');
    this.data.lastWeeklyClaim = new Date().toISOString();
    this.data.weeklyGiftClaimed = true;
    this.saveData();
    
    return {
      success: true,
      type: 'weekly',
      rewards,
      nextClaimTime: this.getNextWeeklyResetTime()
    };
  }

  // 领取月礼包
  claimMonthlyGift() {
    const check = this.canClaimMonthlyGift();
    if (!check.canClaim) {
      return { success: false, message: check.reason || '本月已领取' };
    }
    
    const rewards = this.calculateGiftRewards('monthly');
    this.data.lastMonthlyClaim = new Date().toISOString();
    this.data.monthlyGiftClaimed = true;
    this.saveData();
    
    return {
      success: true,
      type: 'monthly',
      rewards,
      nextClaimTime: this.getNextMonthlyResetTime()
    };
  }

  // 根据VIP等级计算礼包奖励
  calculateGiftRewards(type) {
    const baseRewards = this.vipConfig.giftPackages[type];
    const levelMultiplier = 1 + (this.data.level * 0.1); // 每级增加10%
    
    return {
      gold: Math.floor(baseRewards.gold * levelMultiplier),
      diamonds: Math.floor(baseRewards.diamonds * levelMultiplier),
      energy: Math.floor(baseRewards.energy * levelMultiplier),
      cards: Math.floor(baseRewards.cards * levelMultiplier),
      exclusiveItem: baseRewards.exclusiveItem || null
    };
  }

  // 获取礼包状态
  getGiftStatus() {
    return {
      weekly: {
        ...this.canClaimWeeklyGift(),
        lastClaim: this.data.lastWeeklyClaim,
        rewards: this.calculateGiftRewards('weekly')
      },
      monthly: {
        ...this.canClaimMonthlyGift(),
        lastClaim: this.data.lastMonthlyClaim,
        rewards: this.calculateGiftRewards('monthly')
      }
    };
  }

  // 辅助方法：获取周数
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  // 获取下次周重置时间
  getNextWeeklyResetTime() {
    const now = new Date();
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7));
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday.toISOString();
  }

  // 获取下次月重置时间
  getNextMonthlyResetTime() {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString();
  }

  // ==================== VIP专属活动 ====================
  // 获取可参与的VIP专属活动
  getAvailableEvents() {
    return this.vipConfig.exclusiveEvents
      .filter(event => this.data.level >= event.minLevel)
      .map(event => ({
        ...event,
        canParticipate: true,
        userLevel: this.data.level
      }));
  }

  // 获取即将解锁的活动
  getUpcomingEvents() {
    return this.vipConfig.exclusiveEvents
      .filter(event => this.data.level < event.minLevel)
      .map(event => ({
        ...event,
        canParticipate: false,
        userLevel: this.data.level,
        levelsToUnlock: event.minLevel - this.data.level
      }));
  }

  // 检查特定活动是否可参与
  canJoinEvent(eventId) {
    const event = this.vipConfig.exclusiveEvents.find(e => e.id === eventId);
    if (!event) return { canJoin: false, reason: '活动不存在' };
    
    return {
      canJoin: this.data.level >= event.minLevel,
      reason: this.data.level >= event.minLevel ? null : `需要VIP${event.minLevel}`
    };
  }

  // ==================== 每日奖励 ====================
  // 获取每日VIP奖励
  getDailyRewards() {
    const privileges = this.getCurrentPrivileges();
    
    return {
      goldBonus: privileges.goldBonus,
      diamondReward: privileges.diamondReward,
      battleExpBonus: privileges.battleExpBonus,
      canClaim: !this.data.dailyRewardsClaimed
    };
  }

  // 领取每日奖励
  claimDailyRewards() {
    if (this.data.dailyRewardsClaimed) {
      return { success: false, message: '今日奖励已领取' };
    }
    
    const privileges = this.getCurrentPrivileges();
    this.data.dailyRewardsClaimed = true;
    this.saveData();
    
    return {
      success: true,
      rewards: {
        gold: privileges.goldBonus > 0 ? `+${privileges.goldBonus}%` : '0',
        diamonds: privileges.diamondReward,
        battleExpBonus: privileges.battleExpBonus > 0 ? `+${privileges.battleExpBonus}%` : '0'
      }
    };
  }

  // 重置每日奖励状态（应在每天0点调用）
  resetDailyRewards() {
    this.data.dailyRewardsClaimed = false;
    this.saveData();
  }

  // ==================== 商店折扣 ====================
  // 获取折扣后的价格
  getDiscountedPrice(originalPrice) {
    const privileges = this.getCurrentPrivileges();
    const discount = privileges.shopDiscount;
    
    if (discount <= 0) return originalPrice;
    
    return Math.floor(originalPrice * (100 - discount) / 100);
  }

  // 获取当前折扣信息
  getDiscountInfo() {
    const privileges = this.getCurrentPrivileges();
    return {
      hasDiscount: privileges.shopDiscount > 0,
      discountPercent: privileges.shopDiscount,
      discountText: privileges.shopDiscount > 0 ? `${100 - privileges.shopDiscount}折` : '无折扣'
    };
  }

  // ==================== 复活次数 ====================
  // 获取今日可用复活次数
  getFreeRevives() {
    const privileges = this.getCurrentPrivileges();
    return {
      total: privileges.freeRevives,
      used: this.data.usedRevives || 0,
      remaining: Math.max(0, privileges.freeRevives - (this.data.usedRevives || 0))
    };
  }

  // 使用复活
  useRevive() {
    const revives = this.getFreeRevives();
    if (revives.remaining <= 0) {
      return { success: false, message: '今日免费复活次数已用完' };
    }
    
    this.data.usedRevives = (this.data.usedRevives || 0) + 1;
    this.saveData();
    
    return {
      success: true,
      remaining: revives.total - this.data.usedRevives
    };
  }

  // 重置复活次数（每天0点调用）
  resetRevives() {
    this.data.usedRevives = 0;
    this.saveData();
  }

  // ==================== 客服优先 ====================
  hasPrioritySupport() {
    const privileges = this.getCurrentPrivileges();
    return privileges.prioritySupport;
  }

  // ==================== 完整状态获取 ====================
  getFullStatus() {
    return {
      vip: {
        level: this.data.level,
        ...this.getExpBarData(),
        privileges: this.getCurrentPrivileges(),
        display: this.getVIPDisplayInfo()
      },
      gifts: this.getGiftStatus(),
      events: {
        available: this.getAvailableEvents(),
        upcoming: this.getUpcomingEvents()
      },
      daily: this.getDailyRewards(),
      revives: this.getFreeRevives(),
      discount: this.getDiscountInfo(),
      prioritySupport: this.hasPrioritySupport(),
      unlocked: {
        skins: this.data.unlockedSkins,
        frames: this.data.unlockedFrames
      },
      totalRecharged: this.data.totalRecharged
    };
  }

  // ==================== 事件系统 ====================
  triggerEvent(eventName, data) {
    // 可扩展的事件系统
    const event = new CustomEvent(eventName, { detail: data });
    window.dispatchEvent?.(event);
    
    // 回调函数支持
    if (this.eventListeners && this.eventListeners[eventName]) {
      this.eventListeners[eventName].forEach(callback => callback(data));
    }
  }

  on(eventName, callback) {
    if (!this.eventListeners) this.eventListeners = {};
    if (!this.eventListeners[eventName]) this.eventListeners[eventName] = [];
    this.eventListeners[eventName].push(callback);
  }

  off(eventName, callback) {
    if (this.eventListeners && this.eventListeners[eventName]) {
      this.eventListeners[eventName] = this.eventListeners[eventName]
        .filter(cb => cb !== callback);
    }
  }

  // ==================== 调试/开发工具 ====================
  // 快速设置VIP等级（开发测试用）
  devSetLevel(level) {
    if (level < 0 || level > 15) return { success: false, message: '等级必须在0-15之间' };
    
    const oldLevel = this.data.level;
    this.data.level = level;
    this.data.experience = this.vipConfig.levels[level].expRequired;
    
    // 解锁对应等级的奖励
    const allSkins = [];
    const allFrames = [];
    for (let i = 1; i <= level; i++) {
      allSkins.push(...this.vipConfig.privileges[i].skinUnlock);
      allFrames.push(...this.vipConfig.privileges[i].frameUnlock);
    }
    this.data.unlockedSkins = [...new Set(allSkins)];
    this.data.unlockedFrames = [...new Set(allFrames)];
    
    this.saveData();
    
    return {
      success: true,
      message: `VIP等级已设置为 ${level}`,
      oldLevel,
      newLevel: level,
      unlockedSkins: this.data.unlockedSkins,
      unlockedFrames: this.data.unlockedFrames
    };
  }

  // 重置所有VIP数据（谨慎使用）
  resetAllData() {
    this.data = this.getDefaultData();
    this.saveData();
    return { success: true, message: 'VIP数据已重置' };
  }
}

// ==================== UI 组件类 ====================
class VIPUI {
  constructor(vipSystem) {
    this.vip = vipSystem;
  }

  // 渲染VIP主面板
  renderVIPPanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const status = this.vip.getFullStatus();
    const expBar = status.vip;
    
    container.innerHTML = `
      <div class="vip-panel" style="font-family: Arial, sans-serif; padding: 20px;">
        ${this.renderVIPHeader(expBar)}
        ${this.renderExpBar(expBar)}
        ${this.renderPrivileges(status.vip.privileges)}
        ${this.renderGiftSection(status.gifts)}
        ${this.renderEventSection(status.events)}
        ${status.vip.isMaxLevel ? '' : this.renderNextLevelPreview()}
      </div>
    `;
  }

  renderVIPHeader(expBar) {
    const color = this.vip.getVIPColor(expBar.level);
    return `
      <div class="vip-header" style="text-align: center; margin-bottom: 20px;">
        <div class="vip-badge-large" style="
          display: inline-block;
          background: linear-gradient(135deg, ${color}, ${this.darkenColor(color, 20)});
          color: white;
          padding: 10px 30px;
          border-radius: 25px;
          font-size: 24px;
          font-weight: bold;
          box-shadow: 0 4px 15px ${color}66;
        ">
          ${expBar.level > 0 ? '👑 ' : ''}${expBar.title}
        </div>
        ${expBar.level > 0 ? `<p style="color: ${color}; margin-top: 10px;">尊贵VIP会员</p>` : ''}
      </div>
    `;
  }

  renderExpBar(expBar) {
    if (expBar.isMaxLevel) {
      return `
        <div class="exp-bar-container" style="margin: 20px 0;">
          <div style="text-align: center; color: #FFD700; font-size: 18px;">
            ⭐ 已达最高VIP等级 ⭐
          </div>
        </div>
      `;
    }
    
    return `
      <div class="exp-bar-container" style="margin: 20px 0;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
          <span>VIP ${expBar.level}</span>
          <span>VIP ${expBar.level + 1}</span>
        </div>
        <div class="exp-bar" style="
          height: 20px;
          background: #eee;
          border-radius: 10px;
          overflow: hidden;
        ">
          <div class="exp-fill" style="
            height: 100%;
            width: ${expBar.progressPercent}%; 
            background: linear-gradient(90deg, #FFD700, #FFA500);
            border-radius: 10px;
            transition: width 0.3s ease;
          "></div>
        </div>
        <div style="text-align: center; margin-top: 5px; color: #666; font-size: 12px;">
          ${expBar.expInLevel} / ${expBar.expNeededForNext} 经验
          (还需 ${expBar.expToNext} 经验升级)
        </div>
      </div>
    `;
  }

  renderPrivileges(privileges) {
    return `
      <div class="privileges-section" style="margin: 20px 0;">
        <h3 style="color: #333; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
          当前特权
        </h3>
        <div class="privileges-grid" style="
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 15px;
        ">
          ${this.renderPrivilegeItem('💰', '每日金币加成', privileges.goldBonus > 0 ? `+${privileges.goldBonus}%` : '无')}
          ${this.renderPrivilegeItem('💎', '每日钻石奖励', privileges.diamondReward > 0 ? `${privileges.diamondReward}` : '无')}
          ${this.renderPrivilegeItem('⚔️', '对战经验加成', privileges.battleExpBonus > 0 ? `+${privileges.battleExpBonus}%` : '无')}
          ${this.renderPrivilegeItem('🏷️', '商店折扣', privileges.shopDiscount > 0 ? `${100 - privileges.shopDiscount}折` : '无')}
          ${this.renderPrivilegeItem('❤️', '免费复活次数', privileges.freeRevives > 0 ? `${privileges.freeRevives}次/天` : '无')}
          ${this.renderPrivilegeItem('🎨', '专属皮肤', privileges.skinUnlock.length > 0 ? `${privileges.skinUnlock.length}个` : '无')}
          ${this.renderPrivilegeItem('🖼️', '专属头像框', privileges.frameUnlock.length > 0 ? `${privileges.frameUnlock.length}个` : '无')}
          ${this.renderPrivilegeItem('🎧', '客服优先', privileges.prioritySupport ? '✅ 已开通' : '❌ 未开通')}
        </div>
      </div>
    `;
  }

  renderPrivilegeItem(icon, label, value) {
    return `
      <div class="privilege-item" style="
        background: #f5f5f5;
        padding: 10px;
        border-radius: 8px;
        text-align: center;
      ">
        <div style="font-size: 24px; margin-bottom: 5px;">${icon}</div>
        <div style="font-size: 12px; color: #666;">${label}</div>
        <div style="font-size: 14px; font-weight: bold; color: #333;">${value}</div>
      </div>
    `;
  }

  renderGiftSection(gifts) {
    return `
      <div class="gifts-section" style="margin: 20px 0;">
        <h3 style="color: #333; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
          VIP礼包
        </h3>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 15px;">
          <div class="gift-box" style="
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
          ">
            <div style="font-size: 30px;">📦</div>
            <div style="font-weight: bold;">每周礼包</div>
            <div style="font-size: 12px; margin: 5px 0;">
              ${gifts.weekly.canClaim ? '<span style="color: #90EE90;">可领取</span>' : '<span style="color: #FFB6C1;">已领取</span>'}
            </div>
            <button onclick="vipSystem.claimWeeklyGift()" 
              ${!gifts.weekly.canClaim ? 'disabled' : ''}
              style="
                background: ${gifts.weekly.canClaim ? '#FFD700' : '#999'};
                color: ${gifts.weekly.canClaim ? '#333' : '#666'};
                border: none;
                padding: 8px 20px;
                border-radius: 5px;
                cursor: ${gifts.weekly.canClaim ? 'pointer' : 'not-allowed'};
              ">
              领取
            </button>
          </div>
          <div class="gift-box" style="
            background: linear-gradient(135deg, #f093fb, #f5576c);
            color: white;
            padding: 15px;
            border-radius: 10px;
            text-align: center;
          ">
            <div style="font-size: 30px;">🎁</div>
            <div style="font-weight: bold;">每月礼包</div>
            <div style="font-size: 12px; margin: 5px 0;">
              ${gifts.monthly.canClaim ? '<span style="color: #90EE90;">可领取</span>' : '<span style="color: #FFB6C1;">已领取</span>'}
            </div>
            <button onclick="vipSystem.claimMonthlyGift()"
              ${!gifts.monthly.canClaim ? 'disabled' : ''}
              style="
                background: ${gifts.monthly.canClaim ? '#FFD700' : '#999'};
                color: ${gifts.monthly.canClaim ? '#333' : '#666'};
                border: none;
                padding: 8px 20px;
                border-radius: 5px;
                cursor: ${gifts.monthly.canClaim ? 'pointer' : 'not-allowed'};
              ">
              领取
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderEventSection(events) {
    const availableEvents = events.available;
    if (availableEvents.length === 0) return '';
    
    return `
      <div class="events-section" style="margin: 20px 0;">
        <h3 style="color: #333; border-bottom: 2px solid #FFD700; padding-bottom: 10px;">
          VIP专属活动
        </h3>
        <div style="margin-top: 15px;">
          ${availableEvents.map(event => `
            <div class="event-item" style="
              background: linear-gradient(90deg, #FFD70022, #FFA50022);
              border-left: 4px solid #FFD700;
              padding: 15px;
              margin-bottom: 10px;
              border-radius: 0 8px 8px 0;
            ">
              <div style="font-weight: bold; color: #333;">${event.name}</div>
              <div style="font-size: 12px; color: #666; margin-top: 5px;">${event.description}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderNextLevelPreview() {
    const preview = this.vip.getNextLevelPreview();
    if (!preview.hasNext) return '';
    
    const diff = preview.differences;
    
    return `
      <div class="next-level-preview" style="
        margin: 20px 0;
        background: linear-gradient(135deg, #667eea11, #764ba211);
        padding: 15px;
        border-radius: 10px;
        border: 2px dashed #667eea;
      ">
        <h4 style="color: #667eea; margin: 0 0 10px 0;">
          🔮 VIP${preview.nextLevel} 特权预览
        </h4>
        <div style="font-size: 12px; color: #666; margin-bottom: 10px;">
          还需 ${preview.expToNext} 经验值即可升级
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
          ${diff.goldBonus ? `<span style="background: #4CAF50; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">金币 +${diff.goldBonus.to - diff.goldBonus.from}%</span>` : ''}
          ${diff.diamondReward ? `<span style="background: #2196F3; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">钻石 +${diff.diamondReward.to - diff.diamondReward.from}</span>` : ''}
          ${diff.shopDiscount ? `<span style="background: #FF9800; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">商店 ${100 - diff.shopDiscount.to}折</span>` : ''}
          ${diff.newSkins?.length ? `<span style="background: #9C27B0; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">新皮肤 x${diff.newSkins.length}</span>` : ''}
          ${diff.prioritySupport ? `<span style="background: #F44336; color: white; padding: 3px 8px; border-radius: 10px; font-size: 11px;">客服优先</span>` : ''}
        </div>
      </div>
    `;
  }

  // 辅助方法：颜色变暗
  darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }
}

// ==================== 导出模块 ====================
// 创建全局实例（便于浏览器直接使用）
let vipSystem;
let vipUI;

// 初始化函数
function initVIPSystem() {
  vipSystem = new VIPSystem();
  vipUI = new VIPUI(vipSystem);
  console.log('✨ VIP系统已初始化');
  return vipSystem;
}

// 如果页面已加载，自动初始化
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVIPSystem);
  } else {
    initVIPSystem();
  }
}

// ES6 模块导出
export { VIPSystem, VIPUI, initVIPSystem, vipSystem, vipUI };

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { VIPSystem, VIPUI, initVIPSystem };
}
