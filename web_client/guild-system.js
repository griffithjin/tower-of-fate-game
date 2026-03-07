/**
 * 命运塔 - 公会/战队系统
 * Tower of Fate - Guild System
 * 
 * 功能模块：
 * 1. 公会创建/加入/退出
 * 2. 公会等级系统（1-20级）
 * 3. 公会成员管理（会长/副会长/精英/普通）
 * 4. 公会战（每周公会vs公会）
 * 5. 公会贡献系统
 * 6. 公会商店（专属商品）
 * 7. 公会聊天频道
 * 8. 公会任务（团队任务）
 * 9. 公会排行榜
 * 10. 公会基地（虚拟空间）
 * 
 * @author 小金蛇 🐍
 * @version 1.0.0
 */

// ============================================
// 常量定义
// ============================================

const GUILD_ROLES = {
  LEADER: 'leader',      // 会长
  VICE_LEADER: 'vice',   // 副会长
  ELITE: 'elite',        // 精英
  MEMBER: 'member'       // 普通成员
};

const ROLE_HIERARCHY = {
  [GUILD_ROLES.LEADER]: 4,
  [GUILD_ROLES.VICE_LEADER]: 3,
  [GUILD_ROLES.ELITE]: 2,
  [GUILD_ROLES.MEMBER]: 1
};

const GUILD_LEVEL_CONFIG = {
  MAX_LEVEL: 20,
  MEMBERS_PER_LEVEL: [10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 50],
  EXP_REQUIRED: [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500, 12000, 13600, 15300, 17100, 19000]
};

const GUILD_BATTLE_CONFIG = {
  TEAM_SIZE: 10,
  MATCH_DAY: 6, // 周六
  BATTLE_DURATION_HOURS: 24,
  WIN_POINTS: 100,
  LOSE_POINTS: 30,
  DRAW_POINTS: 50
};

const GUILD_TASK_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  SPECIAL: 'special'
};

// ============================================
// 工具函数
// ============================================

const generateId = () => `guild_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateMemberId = () => `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateTaskId = () => `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateBattleId = () => `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const getCurrentTimestamp = () => Date.now();
const getCurrentWeek = () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const pastDays = (now - startOfYear) / 86400000;
  return Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
};

const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

// ============================================
// 公会类定义
// ============================================

class Guild {
  constructor(data = {}) {
    this.id = data.id || generateId();
    this.name = data.name || '未命名公会';
    this.level = data.level || 1;
    this.exp = data.exp || 0;
    this.members = new Map(); // Map<userId, GuildMember>
    this.maxMembers = data.maxMembers || GUILD_LEVEL_CONFIG.MEMBERS_PER_LEVEL[0];
    this.createdAt = data.createdAt || getCurrentTimestamp();
    this.leaderId = data.leaderId || null;
    this.description = data.description || '';
    this.badge = data.badge || '🏰';
    this.announcement = data.announcement || '';
    this.totalContribution = data.totalContribution || 0;
    this.weeklyContribution = data.weeklyContribution || 0;
    this.battleWins = data.battleWins || 0;
    this.battleLosses = data.battleLosses || 0;
    this.battleDraws = data.battleDraws || 0;
    this.battlePoints = data.battlePoints || 0;
    
    // 公会基地
    this.base = data.base || {
      level: 1,
      buildings: {
        hall: { level: 1, name: '公会大厅' },
        shop: { level: 1, name: '公会商店' },
        training: { level: 1, name: '训练场' },
        warehouse: { level: 1, name: '公会仓库' },
        shrine: { level: 1, name: '命运神殿' }
      },
      decorations: []
    };
    
    // 初始化成员
    if (data.members) {
      Object.entries(data.members).forEach(([userId, memberData]) => {
        this.members.set(userId, new GuildMember(memberData));
      });
    }
  }

  // 获取成员数量
  get memberCount() {
    return this.members.size;
  }

  // 检查是否满员
  get isFull() {
    return this.memberCount >= this.maxMembers;
  }

  // 获取会长
  get leader() {
    return this.members.get(this.leaderId);
  }

  // 获取在线成员
  get onlineMembers() {
    return Array.from(this.members.values()).filter(m => m.isOnline);
  }

  // 升级所需经验
  get expToNextLevel() {
    if (this.level >= GUILD_LEVEL_CONFIG.MAX_LEVEL) return 0;
    return GUILD_LEVEL_CONFIG.EXP_REQUIRED[this.level] - this.exp;
  }

  // 添加经验
  addExp(amount) {
    if (this.level >= GUILD_LEVEL_CONFIG.MAX_LEVEL) return false;
    
    this.exp += amount;
    let leveledUp = false;
    
    while (this.level < GUILD_LEVEL_CONFIG.MAX_LEVEL && 
           this.exp >= GUILD_LEVEL_CONFIG.EXP_REQUIRED[this.level]) {
      this.levelUp();
      leveledUp = true;
    }
    
    return leveledUp;
  }

  // 升级
  levelUp() {
    if (this.level >= GUILD_LEVEL_CONFIG.MAX_LEVEL) return false;
    
    this.level++;
    this.maxMembers = GUILD_LEVEL_CONFIG.MEMBERS_PER_LEVEL[this.level - 1];
    
    // 升级建筑等级上限
    Object.keys(this.base.buildings).forEach(buildingKey => {
      this.base.buildings[buildingKey].maxLevel = Math.min(20, this.level + 2);
    });
    
    return true;
  }

  // 添加成员
  addMember(userId, role = GUILD_ROLES.MEMBER) {
    if (this.isFull) return { success: false, error: '公会已满员' };
    if (this.members.has(userId)) return { success: false, error: '已经是公会成员' };
    
    const member = new GuildMember({
      userId,
      role,
      joinedAt: getCurrentTimestamp()
    });
    
    this.members.set(userId, member);
    
    // 如果是第一个成员，设为会长
    if (this.memberCount === 1) {
      this.leaderId = userId;
      member.role = GUILD_ROLES.LEADER;
    }
    
    return { success: true, member };
  }

  // 移除成员
  removeMember(userId) {
    const member = this.members.get(userId);
    if (!member) return { success: false, error: '成员不存在' };
    if (member.role === GUILD_ROLES.LEADER) return { success: false, error: '会长不能直接退出，请先转让会长职位' };
    
    this.members.delete(userId);
    return { success: true, member };
  }

  // 转让会长
  transferLeadership(fromUserId, toUserId) {
    const fromMember = this.members.get(fromUserId);
    const toMember = this.members.get(toUserId);
    
    if (!fromMember || fromMember.role !== GUILD_ROLES.LEADER) {
      return { success: false, error: '只有会长可以转让职位' };
    }
    if (!toMember) {
      return { success: false, error: '目标成员不存在' };
    }
    
    fromMember.role = GUILD_ROLES.MEMBER;
    toMember.role = GUILD_ROLES.LEADER;
    this.leaderId = toUserId;
    
    return { success: true };
  }

  // 设置成员职位
  setMemberRole(operatorId, targetUserId, newRole) {
    const operator = this.members.get(operatorId);
    const target = this.members.get(targetUserId);
    
    if (!operator || !target) {
      return { success: false, error: '成员不存在' };
    }
    
    // 权限检查
    const operatorPower = ROLE_HIERARCHY[operator.role];
    const targetPower = ROLE_HIERARCHY[target.role];
    const newRolePower = ROLE_HIERARCHY[newRole];
    
    if (operatorPower <= targetPower) {
      return { success: false, error: '无法操作职位等于或高于自己的成员' };
    }
    if (operatorPower <= newRolePower && newRole !== GUILD_ROLES.MEMBER) {
      return { success: false, error: '无法任命此职位' };
    }
    if (newRole === GUILD_ROLES.LEADER) {
      return { success: false, error: '请使用转让会长功能' };
    }
    
    target.role = newRole;
    return { success: true };
  }

  // 踢出成员
  kickMember(operatorId, targetUserId) {
    const operator = this.members.get(operatorId);
    const target = this.members.get(targetUserId);
    
    if (!operator || !target) {
      return { success: false, error: '成员不存在' };
    }
    
    if (ROLE_HIERARCHY[operator.role] <= ROLE_HIERARCHY[target.role]) {
      return { success: false, error: '权限不足' };
    }
    
    return this.removeMember(targetUserId);
  }

  // 获取成员列表（按职位排序）
  getSortedMembers() {
    return Array.from(this.members.values())
      .sort((a, b) => ROLE_HIERARCHY[b.role] - ROLE_HIERARCHY[a.role]);
  }

  // 序列化
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      level: this.level,
      exp: this.exp,
      members: Object.fromEntries(
        Array.from(this.members.entries()).map(([k, v]) => [k, v.toJSON()])
      ),
      maxMembers: this.maxMembers,
      createdAt: this.createdAt,
      leaderId: this.leaderId,
      description: this.description,
      badge: this.badge,
      announcement: this.announcement,
      totalContribution: this.totalContribution,
      weeklyContribution: this.weeklyContribution,
      battleWins: this.battleWins,
      battleLosses: this.battleLosses,
      battleDraws: this.battleDraws,
      battlePoints: this.battlePoints,
      base: this.base
    };
  }
}

// ============================================
// 公会成员类
// ============================================

class GuildMember {
  constructor(data = {}) {
    this.userId = data.userId || null;
    this.role = data.role || GUILD_ROLES.MEMBER;
    this.contribution = data.contribution || 0;
    this.joinedAt = data.joinedAt || getCurrentTimestamp();
    this.weeklyContribution = data.weeklyContribution || 0;
    this.lastActiveAt = data.lastActiveAt || getCurrentTimestamp();
    this.isOnline = data.isOnline || false;
    this.dailyContribution = data.dailyContribution || 0;
    this.battleCount = data.battleCount || 0;
    this.battleWins = data.battleWins || 0;
    this.title = data.title || ''; // 自定义称号
    this.permissions = data.permissions || [];
  }

  // 添加贡献
  addContribution(amount) {
    this.contribution += amount;
    this.weeklyContribution += amount;
    this.dailyContribution += amount;
    this.lastActiveAt = getCurrentTimestamp();
  }

  // 重置周贡献
  resetWeeklyContribution() {
    this.weeklyContribution = 0;
  }

  // 重置日贡献
  resetDailyContribution() {
    this.dailyContribution = 0;
  }

  // 记录战斗
  recordBattle(won) {
    this.battleCount++;
    if (won) this.battleWins++;
  }

  // 设置在线状态
  setOnline(online) {
    this.isOnline = online;
    if (online) {
      this.lastActiveAt = getCurrentTimestamp();
    }
  }

  // 获取职位名称
  getRoleName() {
    const roleNames = {
      [GUILD_ROLES.LEADER]: '会长',
      [GUILD_ROLES.VICE_LEADER]: '副会长',
      [GUILD_ROLES.ELITE]: '精英',
      [GUILD_ROLES.MEMBER]: '成员'
    };
    return roleNames[this.role] || '成员';
  }

  // 序列化
  toJSON() {
    return {
      userId: this.userId,
      role: this.role,
      contribution: this.contribution,
      joinedAt: this.joinedAt,
      weeklyContribution: this.weeklyContribution,
      lastActiveAt: this.lastActiveAt,
      isOnline: this.isOnline,
      dailyContribution: this.dailyContribution,
      battleCount: this.battleCount,
      battleWins: this.battleWins,
      title: this.title,
      permissions: this.permissions
    };
  }
}

// ============================================
// 公会商店类
// ============================================

class GuildShop {
  constructor() {
    this.items = new Map();
    this.refreshTime = getCurrentTimestamp();
    this.initializeItems();
  }

  // 初始化商品
  initializeItems() {
    const defaultItems = [
      { id: 'shop_001', name: '公会经验药水', type: 'consumable', price: 100, currency: 'contribution', effect: { exp: 100 }, limit: 10, reqGuildLevel: 1 },
      { id: 'shop_002', name: '强化石礼包', type: 'material', price: 200, currency: 'contribution', quantity: 5, limit: 5, reqGuildLevel: 2 },
      { id: 'shop_003', name: '稀有装备箱', type: 'equipment', price: 500, currency: 'contribution', rarity: 'rare', limit: 2, reqGuildLevel: 3 },
      { id: 'shop_004', name: '公会专属称号', type: 'title', price: 1000, currency: 'contribution', limit: 1, reqGuildLevel: 5 },
      { id: 'shop_005', name: '史诗装备箱', type: 'equipment', price: 1500, currency: 'contribution', rarity: 'epic', limit: 1, reqGuildLevel: 8 },
      { id: 'shop_006', name: '传说装备箱', type: 'equipment', price: 5000, currency: 'contribution', rarity: 'legendary', limit: 1, reqGuildLevel: 12 },
      { id: 'shop_007', name: '公会战复活币', type: 'consumable', price: 50, currency: 'contribution', limit: 20, reqGuildLevel: 1 },
      { id: 'shop_008', name: '技能书礼包', type: 'skill', price: 800, currency: 'contribution', limit: 3, reqGuildLevel: 6 },
      { id: 'shop_009', name: '坐骑进阶石', type: 'mount', price: 1200, currency: 'contribution', limit: 5, reqGuildLevel: 7 },
      { id: 'shop_010', name: '宠物蛋', type: 'pet', price: 2000, currency: 'contribution', limit: 2, reqGuildLevel: 10 }
    ];

    defaultItems.forEach(item => {
      this.items.set(item.id, { ...item, sold: 0, remaining: item.limit });
    });
  }

  // 刷新商店
  refresh() {
    this.items.forEach(item => {
      item.sold = 0;
      item.remaining = item.limit;
    });
    this.refreshTime = getCurrentTimestamp();
  }

  // 购买商品
  buyItem(itemId, buyerContribution, guildLevel) {
    const item = this.items.get(itemId);
    if (!item) return { success: false, error: '商品不存在' };
    if (item.remaining <= 0) return { success: false, error: '商品已售罄' };
    if (guildLevel < item.reqGuildLevel) return { success: false, error: '公会等级不足' };
    if (buyerContribution < item.price) return { success: false, error: '贡献值不足' };

    item.sold++;
    item.remaining--;

    return { 
      success: true, 
      item: deepClone(item),
      cost: item.price
    };
  }

  // 获取可购买商品列表
  getAvailableItems(guildLevel) {
    return Array.from(this.items.values())
      .filter(item => item.reqGuildLevel <= guildLevel)
      .map(item => deepClone(item));
  }
}

// ============================================
// 公会任务类
// ============================================

class GuildTask {
  constructor(data = {}) {
    this.id = data.id || generateTaskId();
    this.name = data.name || '未命名任务';
    this.description = data.description || '';
    this.type = data.type || GUILD_TASK_TYPES.DAILY;
    this.requirements = data.requirements || {};
    this.rewards = data.rewards || {};
    this.progress = new Map(); // Map<userId, progress>
    this.completedBy = new Set();
    this.createdAt = data.createdAt || getCurrentTimestamp();
    this.expiresAt = data.expiresAt || null;
    this.totalProgress = data.totalProgress || 0; // 团队总进度
    this.targetProgress = data.targetProgress || 100;
    this.isTeamTask = data.isTeamTask || false;
  }

  // 更新个人进度
  updateProgress(userId, amount) {
    if (this.completedBy.has(userId)) return { success: false, error: '已完成该任务' };
    
    const currentProgress = this.progress.get(userId) || 0;
    const newProgress = Math.min(currentProgress + amount, this.targetProgress);
    this.progress.set(userId, newProgress);

    // 更新团队进度
    if (this.isTeamTask) {
      this.totalProgress = Array.from(this.progress.values()).reduce((a, b) => a + b, 0);
    }

    // 检查是否完成
    if (newProgress >= this.targetProgress) {
      this.completedBy.add(userId);
      return { success: true, completed: true, progress: newProgress };
    }

    return { success: true, completed: false, progress: newProgress };
  }

  // 获取个人进度
  getProgress(userId) {
    return this.progress.get(userId) || 0;
  }

  // 检查任务是否完成
  isCompleted(userId) {
    return this.completedBy.has(userId);
  }

  // 获取完成人数
  get completionCount() {
    return this.completedBy.size;
  }

  // 序列化
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      type: this.type,
      requirements: this.requirements,
      rewards: this.rewards,
      progress: Object.fromEntries(this.progress),
      completedBy: Array.from(this.completedBy),
      createdAt: this.createdAt,
      expiresAt: this.expiresAt,
      totalProgress: this.totalProgress,
      targetProgress: this.targetProgress,
      isTeamTask: this.isTeamTask
    };
  }
}

// ============================================
// 公会战类
// ============================================

class GuildBattle {
  constructor(guildA, guildB, data = {}) {
    this.id = data.id || generateBattleId();
    this.guildAId = guildA.id;
    this.guildBId = guildB.id;
    this.guildAName = guildA.name;
    this.guildBName = guildB.name;
    this.status = data.status || 'preparing'; // preparing, ongoing, finished
    this.startTime = data.startTime || getCurrentTimestamp();
    this.endTime = data.endTime || null;
    this.teamA = []; // 公会A参战成员
    this.teamB = []; // 公会B参战成员
    this.scoreA = 0;
    this.scoreB = 0;
    this.rounds = [];
    this.winnerId = null;
    this.rewards = data.rewards || {
      winner: { contribution: 500, exp: 200, items: ['guild_winner_chest'] },
      loser: { contribution: 150, exp: 50, items: ['guild_participant_chest'] }
    };
    this.battleLog = [];
  }

  // 报名参战
  registerMember(guildId, userId, memberData) {
    const isGuildA = guildId === this.guildAId;
    const team = isGuildA ? this.teamA : this.teamB;
    
    if (team.length >= GUILD_BATTLE_CONFIG.TEAM_SIZE) {
      return { success: false, error: '队伍已满' };
    }
    if (team.some(m => m.userId === userId)) {
      return { success: false, error: '已报名' };
    }

    team.push({
      userId,
      name: memberData.name || userId,
      power: memberData.power || 1000,
      isAlive: true,
      kills: 0,
      score: 0
    });

    return { success: true, position: team.length };
  }

  // 开始战斗
  start() {
    if (this.status !== 'preparing') return false;
    if (this.teamA.length === 0 || this.teamB.length === 0) return false;
    
    this.status = 'ongoing';
    this.simulateBattle();
    return true;
  }

  // 模拟战斗过程
  simulateBattle() {
    const rounds = Math.min(10, Math.max(3, Math.floor(Math.random() * 5) + 3));
    
    for (let i = 0; i < rounds; i++) {
      const roundResult = this.simulateRound(i + 1);
      this.rounds.push(roundResult);
      
      this.scoreA += roundResult.scoreA;
      this.scoreB += roundResult.scoreB;
      
      // 记录战斗日志
      this.battleLog.push({
        round: i + 1,
        events: roundResult.events,
        scoreA: this.scoreA,
        scoreB: this.scoreB
      });
    }

    this.endBattle();
  }

  // 模拟单轮战斗
  simulateRound(roundNum) {
    const events = [];
    let roundScoreA = 0;
    let roundScoreB = 0;

    // 随机生成战斗事件
    const aliveA = this.teamA.filter(m => m.isAlive);
    const aliveB = this.teamB.filter(m => m.isAlive);

    if (aliveA.length === 0 || aliveB.length === 0) {
      return { round: roundNum, scoreA: roundScoreA, scoreB: roundScoreB, events };
    }

    // 模拟对决
    const matchups = Math.min(aliveA.length, aliveB.length);
    for (let i = 0; i < matchups; i++) {
      const fighterA = aliveA[i];
      const fighterB = aliveB[i];
      
      const powerA = fighterA.power * (0.8 + Math.random() * 0.4);
      const powerB = fighterB.power * (0.8 + Math.random() * 0.4);
      
      if (powerA > powerB) {
        const score = Math.floor(powerA / 10);
        roundScoreA += score;
        fighterA.score += score;
        fighterA.kills++;
        fighterB.isAlive = false;
        events.push({
          type: 'kill',
          winner: { userId: fighterA.userId, name: fighterA.name, guild: 'A' },
          loser: { userId: fighterB.userId, name: fighterB.name, guild: 'B' },
          score
        });
      } else {
        const score = Math.floor(powerB / 10);
        roundScoreB += score;
        fighterB.score += score;
        fighterB.kills++;
        fighterA.isAlive = false;
        events.push({
          type: 'kill',
          winner: { userId: fighterB.userId, name: fighterB.name, guild: 'B' },
          loser: { userId: fighterA.userId, name: fighterA.name, guild: 'A' },
          score
        });
      }
    }

    // 额外积分事件
    if (Math.random() > 0.7) {
      const bonusTeam = Math.random() > 0.5 ? 'A' : 'B';
      const bonusScore = Math.floor(Math.random() * 50) + 20;
      if (bonusTeam === 'A') {
        roundScoreA += bonusScore;
      } else {
        roundScoreB += bonusScore;
      }
      events.push({
        type: 'bonus',
        team: bonusTeam,
        score: bonusScore,
        reason: '战术配合奖励'
      });
    }

    return {
      round: roundNum,
      scoreA: roundScoreA,
      scoreB: roundScoreB,
      events
    };
  }

  // 结束战斗
  endBattle() {
    this.status = 'finished';
    this.endTime = getCurrentTimestamp();
    
    if (this.scoreA > this.scoreB) {
      this.winnerId = this.guildAId;
    } else if (this.scoreB > this.scoreA) {
      this.winnerId = this.guildBId;
    } else {
      this.winnerId = 'draw';
    }

    return this.getResult();
  }

  // 获取战斗结果
  getResult() {
    const isDraw = this.winnerId === 'draw';
    const guildAWon = this.winnerId === this.guildAId;
    
    return {
      id: this.id,
      status: this.status,
      winnerId: this.winnerId,
      isDraw,
      scoreA: this.scoreA,
      scoreB: this.scoreB,
      guildA: {
        id: this.guildAId,
        name: this.guildAName,
        score: this.scoreA,
        won: guildAWon,
        participants: this.teamA.length,
        survivors: this.teamA.filter(m => m.isAlive).length
      },
      guildB: {
        id: this.guildBId,
        name: this.guildBName,
        score: this.scoreB,
        won: !guildAWon && !isDraw,
        participants: this.teamB.length,
        survivors: this.teamB.filter(m => m.isAlive).length
      },
      rounds: this.rounds.length,
      battleLog: this.battleLog
    };
  }

  // 序列化
  toJSON() {
    return {
      id: this.id,
      guildAId: this.guildAId,
      guildBId: this.guildBId,
      guildAName: this.guildAName,
      guildBName: this.guildBName,
      status: this.status,
      startTime: this.startTime,
      endTime: this.endTime,
      teamA: this.teamA,
      teamB: this.teamB,
      scoreA: this.scoreA,
      scoreB: this.scoreB,
      rounds: this.rounds,
      winnerId: this.winnerId,
      rewards: this.rewards,
      battleLog: this.battleLog
    };
  }
}

// ============================================
// 公会聊天系统
// ============================================

class GuildChat {
  constructor(guildId) {
    this.guildId = guildId;
    this.messages = []; // 消息历史
    this.maxHistory = 100;
    this.channels = {
      general: { name: '综合频道', messages: [] },
      battle: { name: '战斗频道', messages: [] },
      strategy: { name: '战略频道', messages: [] },
      recruit: { name: '招募频道', messages: [] }
    };
    this.mutedUsers = new Set();
  }

  // 发送消息
  sendMessage(userId, userName, content, channel = 'general', type = 'text') {
    if (this.mutedUsers.has(userId)) {
      return { success: false, error: '你已被禁言' };
    }

    const message = {
      id: generateMessageId(),
      userId,
      userName,
      content,
      channel,
      type,
      timestamp: getCurrentTimestamp()
    };

    this.channels[channel].messages.push(message);
    this.messages.push(message);

    // 限制历史记录
    if (this.messages.length > this.maxHistory) {
      this.messages.shift();
    }
    if (this.channels[channel].messages.length > this.maxHistory) {
      this.channels[channel].messages.shift();
    }

    return { success: true, message };
  }

  // 获取频道消息
  getChannelMessages(channel = 'general', limit = 50) {
    const channelData = this.channels[channel];
    if (!channelData) return [];
    
    return channelData.messages.slice(-limit);
  }

  // 禁言用户
  muteUser(userId, operatorId, operatorRole) {
    if (ROLE_HIERARCHY[operatorRole] < ROLE_HIERARCHY[GUILD_ROLES.VICE_LEADER]) {
      return { success: false, error: '权限不足' };
    }
    
    this.mutedUsers.add(userId);
    return { success: true };
  }

  // 解除禁言
  unmuteUser(userId, operatorId, operatorRole) {
    if (ROLE_HIERARCHY[operatorRole] < ROLE_HIERARCHY[GUILD_ROLES.VICE_LEADER]) {
      return { success: false, error: '权限不足' };
    }
    
    this.mutedUsers.delete(userId);
    return { success: true };
  }

  // 系统消息
  sendSystemMessage(content, channel = 'general') {
    return this.sendMessage('system', '系统', content, channel, 'system');
  }

  // 序列化
  toJSON() {
    return {
      guildId: this.guildId,
      messages: this.messages,
      channels: this.channels,
      mutedUsers: Array.from(this.mutedUsers)
    };
  }
}

// ============================================
// 公会基地类
// ============================================

class GuildBase {
  constructor(guildId, data = {}) {
    this.guildId = guildId;
    this.level = data.level || 1;
    this.buildings = data.buildings || {
      hall: { level: 1, name: '公会大厅', benefits: { maxMembersBonus: 0 } },
      shop: { level: 1, name: '公会商店', benefits: { discount: 0, extraItems: [] } },
      training: { level: 1, name: '训练场', benefits: { expBonus: 0, statBonus: {} } },
      warehouse: { level: 1, name: '公会仓库', benefits: { storageBonus: 0 } },
      shrine: { level: 1, name: '命运神殿', benefits: { blessingBonus: 0 } }
    };
    this.decorations = data.decorations || [];
    this.resources = data.resources || { gold: 0, materials: 0 };
  }

  // 升级建筑
  upgradeBuilding(buildingKey, guildLevel, contribution) {
    const building = this.buildings[buildingKey];
    if (!building) return { success: false, error: '建筑不存在' };
    
    const maxLevel = Math.min(20, guildLevel + 2);
    if (building.level >= maxLevel) {
      return { success: false, error: '已达到当前最大等级' };
    }

    const upgradeCost = this.getUpgradeCost(buildingKey, building.level);
    if (contribution < upgradeCost) {
      return { success: false, error: '贡献值不足' };
    }

    building.level++;
    this.updateBuildingBenefits(buildingKey);

    return { 
      success: true, 
      building,
      cost: upgradeCost
    };
  }

  // 获取升级费用
  getUpgradeCost(buildingKey, currentLevel) {
    const baseCosts = {
      hall: 500,
      shop: 300,
      training: 400,
      warehouse: 200,
      shrine: 600
    };
    return Math.floor(baseCosts[buildingKey] * Math.pow(1.5, currentLevel - 1));
  }

  // 更新建筑效果
  updateBuildingBenefits(buildingKey) {
    const building = this.buildings[buildingKey];
    const level = building.level;

    switch (buildingKey) {
      case 'hall':
        building.benefits.maxMembersBonus = level * 2;
        break;
      case 'shop':
        building.benefits.discount = Math.min(20, level * 2);
        break;
      case 'training':
        building.benefits.expBonus = level * 5;
        break;
      case 'warehouse':
        building.benefits.storageBonus = level * 50;
        break;
      case 'shrine':
        building.benefits.blessingBonus = level * 3;
        break;
    }
  }

  // 添加装饰
  addDecoration(decoration) {
    this.decorations.push({
      id: `decor_${Date.now()}`,
      ...decoration,
      placedAt: getCurrentTimestamp()
    });
    return { success: true };
  }

  // 移除装饰
  removeDecoration(decorationId) {
    const index = this.decorations.findIndex(d => d.id === decorationId);
    if (index >= 0) {
      this.decorations.splice(index, 1);
      return { success: true };
    }
    return { success: false, error: '装饰不存在' };
  }

  // 序列化
  toJSON() {
    return {
      guildId: this.guildId,
      level: this.level,
      buildings: this.buildings,
      decorations: this.decorations,
      resources: this.resources
    };
  }
}

// ============================================
// 公会管理器（主类）
// ============================================

class GuildManager {
  constructor() {
    this.guilds = new Map(); // Map<guildId, Guild>
    this.userGuildMap = new Map(); // Map<userId, guildId>
    this.shop = new GuildShop();
    this.tasks = new Map(); // Map<taskId, GuildTask>
    this.battles = new Map(); // Map<battleId, GuildBattle>
    this.chats = new Map(); // Map<guildId, GuildChat>
    this.bases = new Map(); // Map<guildId, GuildBase>
    this.leaderboard = []; // 公会排行榜
    this.pendingApplications = new Map(); // Map<guildId, Set<userId>>
    this.weeklyResetDay = 1; // 周一重置
    this.lastResetTime = getCurrentTimestamp();
  }

  // ========== 公会基础操作 ==========

  // 创建公会
  createGuild(creatorId, guildData) {
    // 检查是否已有公会
    if (this.userGuildMap.has(creatorId)) {
      return { success: false, error: '你已经加入了一个公会' };
    }

    // 检查公会名是否已存在
    const nameExists = Array.from(this.guilds.values()).some(g => g.name === guildData.name);
    if (nameExists) {
      return { success: false, error: '公会名称已存在' };
    }

    const guild = new Guild({
      ...guildData,
      leaderId: creatorId
    });

    // 添加创建者为会长
    guild.addMember(creatorId, GUILD_ROLES.LEADER);
    
    // 保存公会
    this.guilds.set(guild.id, guild);
    this.userGuildMap.set(creatorId, guild.id);
    
    // 初始化聊天和基地
    this.chats.set(guild.id, new GuildChat(guild.id));
    this.bases.set(guild.id, new GuildBase(guild.id));
    this.pendingApplications.set(guild.id, new Set());

    return { success: true, guild: guild.toJSON() };
  }

  // 申请加入公会
  applyToJoin(userId, guildId) {
    if (this.userGuildMap.has(userId)) {
      return { success: false, error: '你已经加入了一个公会' };
    }

    const guild = this.guilds.get(guildId);
    if (!guild) return { success: false, error: '公会不存在' };
    if (guild.isFull) return { success: false, error: '公会已满' };

    const applications = this.pendingApplications.get(guildId);
    if (applications.has(userId)) {
      return { success: false, error: '已经申请过了' };
    }

    applications.add(userId);
    return { success: true, message: '申请已发送' };
  }

  // 处理入会申请
  handleApplication(guildId, operatorId, applicantId, approve) {
    const guild = this.guilds.get(guildId);
    if (!guild) return { success: false, error: '公会不存在' };

    const operator = guild.members.get(operatorId);
    if (!operator || ROLE_HIERARCHY[operator.role] < ROLE_HIERARCHY[GUILD_ROLES.VICE_LEADER]) {
      return { success: false, error: '权限不足' };
    }

    const applications = this.pendingApplications.get(guildId);
    if (!applications.has(applicantId)) {
      return { success: false, error: '申请不存在' };
    }

    applications.delete(applicantId);

    if (approve) {
      if (guild.isFull) {
        return { success: false, error: '公会已满' };
      }
      
      const result = guild.addMember(applicantId);
      if (result.success) {
        this.userGuildMap.set(applicantId, guildId);
        return { success: true, message: '已批准加入' };
      }
      return result;
    }

    return { success: true, message: '已拒绝申请' };
  }

  // 退出公会
  leaveGuild(userId) {
    const guildId = this.userGuildMap.get(userId);
    if (!guildId) return { success: false, error: '你没有加入任何公会' };

    const guild = this.guilds.get(guildId);
    const member = guild.members.get(userId);
    
    if (member.role === GUILD_ROLES.LEADER) {
      return { success: false, error: '会长不能直接退出，请先转让职位或解散公会' };
    }

    const result = guild.removeMember(userId);
    if (result.success) {
      this.userGuildMap.delete(userId);
      
      // 发送系统消息
      const chat = this.chats.get(guildId);
      chat.sendSystemMessage(`${member.getRoleName()} ${userId} 离开了公会`);
    }
    
    return result;
  }

  // 解散公会
  disbandGuild(leaderId) {
    const guildId = this.userGuildMap.get(leaderId);
    if (!guildId) return { success: false, error: '你没有加入任何公会' };

    const guild = this.guilds.get(guildId);
    if (guild.leaderId !== leaderId) {
      return { success: false, error: '只有会长可以解散公会' };
    }

    // 移除所有成员的公会关联
    guild.members.forEach((_, userId) => {
      this.userGuildMap.delete(userId);
    });

    // 清理数据
    this.guilds.delete(guildId);
    this.chats.delete(guildId);
    this.bases.delete(guildId);
    this.pendingApplications.delete(guildId);

    return { success: true, message: '公会已解散' };
  }

  // 获取用户所在公会
  getUserGuild(userId) {
    const guildId = this.userGuildMap.get(userId);
    if (!guildId) return null;
    return this.guilds.get(guildId);
  }

  // 获取公会信息
  getGuildInfo(guildId) {
    const guild = this.guilds.get(guildId);
    if (!guild) return null;
    
    return {
      ...guild.toJSON(),
      onlineCount: guild.onlineMembers.length,
      chatChannels: Object.keys(this.chats.get(guildId)?.channels || {}),
      base: this.bases.get(guildId)?.toJSON()
    };
  }

  // ========== 成员管理 ==========

  // 转让会长
  transferLeadership(leaderId, targetUserId) {
    const guild = this.getUserGuild(leaderId);
    if (!guild) return { success: false, error: '公会不存在' };

    return guild.transferLeadership(leaderId, targetUserId);
  }

  // 设置成员职位
  setMemberRole(operatorId, targetUserId, newRole) {
    const guild = this.getUserGuild(operatorId);
    if (!guild) return { success: false, error: '公会不存在' };

    return guild.setMemberRole(operatorId, targetUserId, newRole);
  }

  // 踢出成员
  kickMember(operatorId, targetUserId) {
    const guild = this.getUserGuild(operatorId);
    if (!guild) return { success: false, error: '公会不存在' };

    const result = guild.kickMember(operatorId, targetUserId);
    if (result.success) {
      this.userGuildMap.delete(targetUserId);
    }
    return result;
  }

  // ========== 贡献系统 ==========

  // 添加贡献
  addContribution(userId, amount, type = 'general') {
    const guild = this.getUserGuild(userId);
    if (!guild) return { success: false, error: '你没有加入公会' };

    const member = guild.members.get(userId);
    member.addContribution(amount);
    
    guild.totalContribution += amount;
    guild.weeklyContribution += amount;

    // 检查公会升级
    const leveledUp = guild.addExp(Math.floor(amount / 10));

    return { 
      success: true, 
      added: amount,
      total: member.contribution,
      guildLeveledUp: leveledUp,
      currentGuildLevel: guild.level
    };
  }

  // 获取贡献排行
  getContributionRanking(guildId, type = 'total') {
    const guild = this.guilds.get(guildId);
    if (!guild) return [];

    const members = Array.from(guild.members.values());
    
    switch (type) {
      case 'weekly':
        return members.sort((a, b) => b.weeklyContribution - a.weeklyContribution);
      case 'daily':
        return members.sort((a, b) => b.dailyContribution - a.dailyContribution);
      default:
        return members.sort((a, b) => b.contribution - a.contribution);
    }
  }

  // ========== 公会商店 ==========

  // 获取商店商品
  getShopItems(userId) {
    const guild = this.getUserGuild(userId);
    if (!guild) return { success: false, error: '你没有加入公会' };

    const items = this.shop.getAvailableItems(guild.level);
    const member = guild.members.get(userId);
    
    return {
      success: true,
      items,
      userContribution: member.contribution,
      refreshTime: this.shop.refreshTime
    };
  }

  // 购买商品
  buyShopItem(userId, itemId) {
    const guild = this.getUserGuild(userId);
    if (!guild) return { success: false, error: '你没有加入公会' };

    const member = guild.members.get(userId);
    const result = this.shop.buyItem(itemId, member.contribution, guild.level);
    
    if (result.success) {
      member.contribution -= result.cost;
    }
    
    return result;
  }

  // ========== 公会聊天 ==========

  // 发送聊天消息
  sendChatMessage(userId, content, channel = 'general') {
    const guild = this.getUserGuild(userId);
    if (!guild) return { success: false, error: '你没有加入公会' };

    const member = guild.members.get(userId);
    const chat = this.chats.get(guild.id);
    
    return chat.sendMessage(userId, member.getRoleName(), content, channel);
  }

  // 获取聊天历史
  getChatHistory(userId, channel = 'general', limit = 50) {
    const guild = this.getUserGuild(userId);
    if (!guild) return { success: false, error: '你没有加入公会' };

    const chat = this.chats.get(guild.id);
    return {
      success: true,
      messages: chat.getChannelMessages(channel, limit)
    };
  }

  // ========== 公会任务 ==========

  // 创建任务
  createTask(guildId, taskData) {
    const guild = this.guilds.get(guildId);
    if (!guild) return { success: false, error: '公会不存在' };

    const task = new GuildTask(taskData);
    this.tasks.set(task.id, task);

    // 添加到公会任务列表
    if (!guild.activeTasks) guild.activeTasks = [];
    guild.activeTasks.push(task.id);

    return { success: true, task: task.toJSON() };
  }

  // 获取公会任务列表
  getGuildTasks(guildId) {
    const guild = this.guilds.get(guildId);
    if (!guild) return [];

    const taskIds = guild.activeTasks || [];
    return taskIds
      .map(id => this.tasks.get(id))
      .filter(Boolean)
      .map(t => t.toJSON());
  }

  // 更新任务进度
  updateTaskProgress(userId, taskId, progress) {
    const guild = this.getUserGuild(userId);
    if (!guild) return { success: false, error: '你没有加入公会' };

    const task = this.tasks.get(taskId);
    if (!task) return { success: false, error: '任务不存在' };

    const result = task.updateProgress(userId, progress);
    
    // 如果完成任务，给予奖励
    if (result.completed) {
      this.addContribution(userId, task.rewards.contribution || 50);
    }

    return result;
  }

  // ========== 公会战 ==========

  // 创建公会战
  createGuildBattle(guildAId, guildBId) {
    const guildA = this.guilds.get(guildAId);
    const guildB = this.guilds.get(guildBId);
    
    if (!guildA || !guildB) {
      return { success: false, error: '公会不存在' };
    }

    const battle = new GuildBattle(guildA, guildB);
    this.battles.set(battle.id, battle);
    
    // 通知双方公会
    [guildAId, guildBId].forEach(guildId => {
      const chat = this.chats.get(guildId);
      chat.sendSystemMessage(
        `🏆 公会战匹配成功！对手：${guildId === guildAId ? guildB.name : guildA.name}，请尽快报名参加！`,
        'battle'
      );
    });

    return { success: true, battle: battle.toJSON() };
  }

  // 报名参加公会战
  registerForBattle(userId, battleId, memberData) {
    const guild = this.getUserGuild(userId);
    if (!guild) return { success: false, error: '你没有加入公会' };

    const battle = this.battles.get(battleId);
    if (!battle) return { success: false, error: '战斗不存在' };

    const result = battle.registerMember(guild.id, userId, memberData);
    return result;
  }

  // 开始公会战
  startBattle(battleId) {
    const battle = this.battles.get(battleId);
    if (!battle) return { success: false, error: '战斗不存在' };

    const success = battle.start();
    if (success) {
      // 更新公会战绩
      const guildA = this.guilds.get(battle.guildAId);
      const guildB = this.guilds.get(battle.guildBId);
      
      const result = battle.getResult();
      
      if (result.winnerId === battle.guildAId) {
        guildA.battleWins++;
        guildA.battlePoints += GUILD_BATTLE_CONFIG.WIN_POINTS;
        guildB.battleLosses++;
        guildB.battlePoints += GUILD_BATTLE_CONFIG.LOSE_POINTS;
      } else if (result.winnerId === battle.guildBId) {
        guildB.battleWins++;
        guildB.battlePoints += GUILD_BATTLE_CONFIG.WIN_POINTS;
        guildA.battleLosses++;
        guildA.battlePoints += GUILD_BATTLE_CONFIG.LOSE_POINTS;
      } else {
        guildA.battleDraws++;
        guildB.battleDraws++;
        guildA.battlePoints += GUILD_BATTLE_CONFIG.DRAW_POINTS;
        guildB.battlePoints += GUILD_BATTLE_CONFIG.DRAW_POINTS;
      }

      // 发送结果通知
      [battle.guildAId, battle.guildBId].forEach(guildId => {
        const chat = this.chats.get(guildId);
        const isWinner = result.winnerId === guildId;
        const message = isWinner 
          ? `🎉 恭喜！公会战获得胜利！积分 +${GUILD_BATTLE_CONFIG.WIN_POINTS}`
          : result.isDraw
            ? `🤝 公会战平局。积分 +${GUILD_BATTLE_CONFIG.DRAW_POINTS}`
            : `💔 公会战失败。积分 +${GUILD_BATTLE_CONFIG.LOSE_POINTS}`;
        chat.sendSystemMessage(message, 'battle');
      });
    }

    return { success, result: battle.getResult() };
  }

  // 获取战斗详情
  getBattleDetails(battleId) {
    const battle = this.battles.get(battleId);
    if (!battle) return null;
    return battle.getResult();
  }

  // ========== 排行榜 ==========

  // 更新排行榜
  updateLeaderboard() {
    const allGuilds = Array.from(this.guilds.values());
    
    this.leaderboard = allGuilds
      .map(guild => ({
        id: guild.id,
        name: guild.name,
        level: guild.level,
        memberCount: guild.memberCount,
        totalContribution: guild.totalContribution,
        battlePoints: guild.battlePoints,
        battleWins: guild.battleWins,
        battleLosses: guild.battleLosses,
        badge: guild.badge,
        score: guild.level * 1000 + guild.battlePoints + guild.totalContribution / 100
      }))
      .sort((a, b) => b.score - a.score)
      .map((guild, index) => ({ ...guild, rank: index + 1 }));

    return this.leaderboard;
  }

  // 获取排行榜
  getLeaderboard(limit = 100) {
    return this.leaderboard.slice(0, limit);
  }

  // ========== 公会基地 ==========

  // 升级基地建筑
  upgradeBaseBuilding(userId, buildingKey) {
    const guild = this.getUserGuild(userId);
    if (!guild) return { success: false, error: '你没有加入公会' };

    const member = guild.members.get(userId);
    if (ROLE_HIERARCHY[member.role] < ROLE_HIERARCHY[GUILD_ROLES.VICE_LEADER]) {
      return { success: false, error: '权限不足' };
    }

    const base = this.bases.get(guild.id);
    return base.upgradeBuilding(buildingKey, guild.level, member.contribution);
  }

  // 获取基地信息
  getBaseInfo(userId) {
    const guild = this.getUserGuild(userId);
    if (!guild) return { success: false, error: '你没有加入公会' };

    const base = this.bases.get(guild.id);
    return {
      success: true,
      base: base.toJSON()
    };
  }

  // ========== 系统操作 ==========

  // 重置周数据
  weeklyReset() {
    this.guilds.forEach(guild => {
      guild.weeklyContribution = 0;
      guild.members.forEach(member => {
        member.resetWeeklyContribution();
      });
    });

    // 刷新商店
    this.shop.refresh();

    this.lastResetTime = getCurrentTimestamp();
    return { success: true, message: '周数据已重置' };
  }

  // 重置日数据
  dailyReset() {
    this.guilds.forEach(guild => {
      guild.members.forEach(member => {
        member.resetDailyContribution();
      });
    });
    return { success: true, message: '日数据已重置' };
  }

  // 获取所有公会列表
  getGuildList(filter = {}) {
    let guilds = Array.from(this.guilds.values());
    
    if (filter.minLevel) {
      guilds = guilds.filter(g => g.level >= filter.minLevel);
    }
    if (filter.maxLevel) {
      guilds = guilds.filter(g => g.level <= filter.maxLevel);
    }
    if (filter.search) {
      const search = filter.search.toLowerCase();
      guilds = guilds.filter(g => g.name.toLowerCase().includes(search));
    }
    
    return guilds.map(g => ({
      id: g.id,
      name: g.name,
      level: g.level,
      memberCount: g.memberCount,
      maxMembers: g.maxMembers,
      badge: g.badge,
      description: g.description,
      leaderName: g.leader?.userId || '未知',
      isFull: g.isFull
    }));
  }

  // 搜索公会
  searchGuilds(keyword) {
    return this.getGuildList({ search: keyword });
  }

  // 序列化所有数据
  toJSON() {
    return {
      guilds: Object.fromEntries(
        Array.from(this.guilds.entries()).map(([k, v]) => [k, v.toJSON()])
      ),
      userGuildMap: Object.fromEntries(this.userGuildMap),
      battles: Object.fromEntries(
        Array.from(this.battles.entries()).map(([k, v]) => [k, v.toJSON()])
      ),
      tasks: Object.fromEntries(
        Array.from(this.tasks.entries()).map(([k, v]) => [k, v.toJSON()])
      ),
      leaderboard: this.leaderboard,
      lastResetTime: this.lastResetTime
    };
  }

  // 从JSON加载数据
  fromJSON(data) {
    // 加载公会
    if (data.guilds) {
      Object.entries(data.guilds).forEach(([id, guildData]) => {
        const guild = new Guild(guildData);
        this.guilds.set(id, guild);
        
        // 重建用户映射
        guild.members.forEach((_, userId) => {
          this.userGuildMap.set(userId, id);
        });
      });
    }

    // 加载战斗
    if (data.battles) {
      Object.entries(data.battles).forEach(([id, battleData]) => {
        const guildA = this.guilds.get(battleData.guildAId);
        const guildB = this.guilds.get(battleData.guildBId);
        if (guildA && guildB) {
          const battle = new GuildBattle(guildA, guildB, battleData);
          this.battles.set(id, battle);
        }
      });
    }

    // 加载任务
    if (data.tasks) {
      Object.entries(data.tasks).forEach(([id, taskData]) => {
        const task = new GuildTask(taskData);
        this.tasks.set(id, task);
      });
    }

    // 加载排行榜
    if (data.leaderboard) {
      this.leaderboard = data.leaderboard;
    }

    this.lastResetTime = data.lastResetTime || getCurrentTimestamp();
  }
}

// ============================================
// 导出模块
// ============================================

// ES6 模块导出
export {
  Guild,
  GuildMember,
  GuildShop,
  GuildTask,
  GuildBattle,
  GuildChat,
  GuildBase,
  GuildManager,
  GUILD_ROLES,
  ROLE_HIERARCHY,
  GUILD_LEVEL_CONFIG,
  GUILD_BATTLE_CONFIG,
  GUILD_TASK_TYPES
};

// 默认导出主管理器类
export default GuildManager;

// CommonJS 兼容（如果在非模块环境使用）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Guild,
    GuildMember,
    GuildShop,
    GuildTask,
    GuildBattle,
    GuildChat,
    GuildBase,
    GuildManager,
    GUILD_ROLES,
    ROLE_HIERARCHY,
    GUILD_LEVEL_CONFIG,
    GUILD_BATTLE_CONFIG,
    GUILD_TASK_TYPES
  };
}
