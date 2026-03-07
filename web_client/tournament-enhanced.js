/**
 * 命运塔游戏 - 锦标赛系统优化版
 * Tower of Fate - Enhanced Tournament System
 * 
 * 功能模块：
 * 1. 多类型锦标赛管理
 * 2. 报名系统
 * 3. 比赛流程控制
 * 4. 实时排行榜
 * 5. 奖池系统
 * 6. 比赛历史记录
 * 7. 战绩统计
 * 8. 比赛提醒
 * 9. 模拟数据 + API 接口
 * 
 * @author 小金蛇 🐍
 * @version 2.0.0
 */

class TournamentManager {
  constructor(apiConfig = {}) {
    this.apiConfig = {
      baseUrl: apiConfig.baseUrl || 'https://api.toweroffate.com',
      apiKey: apiConfig.apiKey || null,
      timeout: apiConfig.timeout || 10000,
      ...apiConfig
    };
    
    // 存储
    this.tournaments = new Map();
    this.registrations = new Map();
    this.leaderboards = new Map();
    this.matchHistory = new Map();
    this.playerStats = new Map();
    this.reminders = new Map();
    this.prizePools = new Map();
    
    // 状态
    this.isInitialized = false;
    this.currentPlayer = null;
    this.realtimeUpdateInterval = null;
    
    // 事件监听
    this.eventListeners = new Map();
    
    // 初始化
    this.init();
  }

  // ==================== 初始化 ====================
  
  async init() {
    console.log('🐍 命运塔锦标赛系统初始化中...');
    
    // 加载本地数据
    this.loadLocalData();
    
    // 如果没有真实API，使用模拟数据
    if (!this.apiConfig.apiKey) {
      console.log('📦 使用模拟数据模式');
      this.generateMockData();
    } else {
      console.log('🌐 连接到真实API');
      await this.syncWithServer();
    }
    
    // 启动实时更新
    this.startRealtimeUpdates();
    
    this.isInitialized = true;
    this.emit('initialized', { timestamp: Date.now() });
    console.log('✅ 锦标赛系统初始化完成');
  }

  loadLocalData() {
    try {
      const saved = localStorage.getItem('tournament_data');
      if (saved) {
        const data = JSON.parse(saved);
        this.tournaments = new Map(data.tournaments || []);
        this.playerStats = new Map(data.playerStats || []);
        this.matchHistory = new Map(data.matchHistory || []);
      }
    } catch (e) {
      console.warn('本地数据加载失败:', e);
    }
  }

  saveLocalData() {
    try {
      const data = {
        tournaments: Array.from(this.tournaments.entries()),
        playerStats: Array.from(this.playerStats.entries()),
        matchHistory: Array.from(this.matchHistory.entries()),
        lastSave: Date.now()
      };
      localStorage.setItem('tournament_data', JSON.stringify(data));
    } catch (e) {
      console.warn('本地数据保存失败:', e);
    }
  }

  // ==================== 锦标赛类型定义 ====================

  static TournamentTypes = {
    GLOBAL: 'global',        // 全球锦标赛
    FRIENDS: 'friends',      // 好友锦标赛
    COUNTRY: 'country',      // 国家锦标赛
    LIMITED: 'limited'       // 限时锦标赛
  };

  static TournamentStatus = {
    UPCOMING: 'upcoming',    // 即将开始
    REGISTERING: 'registering', // 报名中
    PRELIMINARY: 'preliminary', // 初赛
    SEMI_FINALS: 'semi_finals', // 复赛
    FINALS: 'finals',        // 决赛
    FINISHED: 'finished',    // 已结束
    CANCELLED: 'cancelled'   // 已取消
  };

  static Stages = {
    PRELIMINARY: {
      name: '初赛',
      nameEn: 'Preliminary',
      maxRank: 100000,      // 海选人数上限
      advanceCount: 1000,   // 晋级人数
      duration: 3 * 24 * 60 * 60 * 1000  // 3天
    },
    SEMI_FINALS: {
      name: '复赛',
      nameEn: 'Semi-Finals',
      maxRank: 1000,
      advanceCount: 100,
      duration: 2 * 24 * 60 * 60 * 1000  // 2天
    },
    FINALS: {
      name: '决赛',
      nameEn: 'Finals',
      maxRank: 100,
      advanceCount: 10,
      duration: 24 * 60 * 60 * 1000  // 1天
    }
  };

  // ==================== 锦标赛管理 ====================

  /**
   * 创建锦标赛
   */
  createTournament(config) {
    const tournament = {
      id: this.generateId(),
      name: config.name,
      description: config.description || '',
      type: config.type || TournamentManager.TournamentTypes.GLOBAL,
      status: TournamentManager.TournamentStatus.UPCOMING,
      
      // 时间安排
      registrationStart: config.registrationStart,
      registrationEnd: config.registrationEnd,
      tournamentStart: config.tournamentStart,
      tournamentEnd: config.tournamentEnd,
      
      // 报名费用
      entryFee: {
        gold: config.entryFee?.gold || 0,
        diamond: config.entryFee?.diamond || 0
      },
      
      // 参赛限制
      requirements: {
        minLevel: config.requirements?.minLevel || 1,
        minPower: config.requirements?.minPower || 0,
        maxParticipants: config.requirements?.maxParticipants || 100000,
        countries: config.requirements?.countries || null, // 国家锦标赛用
        friendIds: config.requirements?.friendIds || null  // 好友锦标赛用
      },
      
      // 特殊配置
      limitedTimeConfig: config.limitedTimeConfig || null, // 限时赛配置
      
      // 状态
      currentStage: null,
      participants: [],
      createdAt: Date.now(),
      createdBy: config.createdBy || 'system',
      
      // 元数据
      isOfficial: config.isOfficial !== false,
      tags: config.tags || [],
      region: config.region || 'global'
    };

    this.tournaments.set(tournament.id, tournament);
    
    // 初始化奖池
    this.initPrizePool(tournament.id, config.prizePool);
    
    // 设置自动状态转换
    this.scheduleStatusUpdates(tournament);
    
    this.emit('tournamentCreated', tournament);
    this.saveLocalData();
    
    return tournament;
  }

  /**
   * 生成锦标赛ID
   */
  generateId() {
    return `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取锦标赛列表
   */
  getTournaments(filters = {}) {
    let list = Array.from(this.tournaments.values());
    
    if (filters.type) {
      list = list.filter(t => t.type === filters.type);
    }
    
    if (filters.status) {
      list = list.filter(t => t.status === filters.status);
    }
    
    if (filters.upcoming) {
      const now = Date.now();
      list = list.filter(t => t.tournamentStart > now);
    }
    
    if (filters.active) {
      const now = Date.now();
      list = list.filter(t => 
        t.status !== TournamentManager.TournamentStatus.FINISHED &&
        t.status !== TournamentManager.TournamentStatus.CANCELLED
      );
    }
    
    // 排序
    list.sort((a, b) => a.tournamentStart - b.tournamentStart);
    
    return list;
  }

  /**
   * 获取锦标赛详情
   */
  getTournament(tournamentId) {
    return this.tournaments.get(tournamentId);
  }

  /**
   * 更新锦标赛状态
   */
  updateTournamentStatus(tournamentId, newStatus) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return null;
    
    const oldStatus = tournament.status;
    tournament.status = newStatus;
    
    // 状态转换逻辑
    switch (newStatus) {
      case TournamentManager.TournamentStatus.REGISTERING:
        tournament.registrationOpen = true;
        break;
        
      case TournamentManager.TournamentStatus.PRELIMINARY:
        tournament.registrationOpen = false;
        tournament.currentStage = 'PRELIMINARY';
        this.startStage(tournamentId, 'PRELIMINARY');
        break;
        
      case TournamentManager.TournamentStatus.SEMI_FINALS:
        tournament.currentStage = 'SEMI_FINALS';
        this.advanceStage(tournamentId, 'SEMI_FINALS');
        break;
        
      case TournamentManager.TournamentStatus.FINALS:
        tournament.currentStage = 'FINALS';
        this.advanceStage(tournamentId, 'FINALS');
        break;
        
      case TournamentManager.TournamentStatus.FINISHED:
        this.finalizeTournament(tournamentId);
        break;
    }
    
    this.emit('statusChanged', { tournamentId, oldStatus, newStatus, tournament });
    this.saveLocalData();
    
    return tournament;
  }

  // ==================== 报名系统 ====================

  /**
   * 检查报名资格
   */
  checkEligibility(tournamentId, player) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      return { eligible: false, reason: '锦标赛不存在' };
    }
    
    // 检查状态
    if (tournament.status !== TournamentManager.TournamentStatus.REGISTERING) {
      return { eligible: false, reason: '报名未开始或已结束' };
    }
    
    // 检查时间
    const now = Date.now();
    if (now < tournament.registrationStart || now > tournament.registrationEnd) {
      return { eligible: false, reason: '不在报名时间段内' };
    }
    
    // 检查等级
    if (player.level < tournament.requirements.minLevel) {
      return { eligible: false, reason: `等级不足，需要等级 ${tournament.requirements.minLevel}` };
    }
    
    // 检查战力
    if (player.power < tournament.requirements.minPower) {
      return { eligible: false, reason: `战力不足，需要战力 ${tournament.requirements.minPower}` };
    }
    
    // 检查国家限制
    if (tournament.type === TournamentManager.TournamentTypes.COUNTRY) {
      if (!tournament.requirements.countries.includes(player.country)) {
        return { eligible: false, reason: '不符合国家参赛要求' };
      }
    }
    
    // 检查好友限制
    if (tournament.type === TournamentManager.TournamentTypes.FRIENDS) {
      if (!tournament.requirements.friendIds.includes(player.id)) {
        return { eligible: false, reason: '不在好友邀请列表中' };
      }
    }
    
    // 检查人数上限
    if (tournament.participants.length >= tournament.requirements.maxParticipants) {
      return { eligible: false, reason: '报名人数已满' };
    }
    
    // 检查是否已报名
    const existing = this.registrations.get(`${tournamentId}_${player.id}`);
    if (existing) {
      return { eligible: false, reason: '已经报名此锦标赛' };
    }
    
    // 检查货币
    if (player.gold < tournament.entryFee.gold) {
      return { eligible: false, reason: `金币不足，需要 ${tournament.entryFee.gold} 金币` };
    }
    if (player.diamond < tournament.entryFee.diamond) {
      return { eligible: false, reason: `钻石不足，需要 ${tournament.entryFee.diamond} 钻石` };
    }
    
    return { eligible: true, reason: '' };
  }

  /**
   * 报名参赛
   */
  async register(tournamentId, player) {
    // 检查资格
    const check = this.checkEligibility(tournamentId, player);
    if (!check.eligible) {
      throw new Error(check.reason);
    }
    
    const tournament = this.tournaments.get(tournamentId);
    
    // 扣除费用
    const registration = {
      id: `reg_${Date.now()}_${player.id}`,
      tournamentId,
      playerId: player.id,
      playerName: player.name,
      entryFee: { ...tournament.entryFee },
      registeredAt: Date.now(),
      status: 'confirmed',
      stageResults: {},
      finalRank: null,
      rewards: []
    };
    
    // 添加到报名列表
    this.registrations.set(`${tournamentId}_${player.id}`, registration);
    tournament.participants.push(player.id);
    
    // 更新奖池（动态累积）
    this.addToPrizePool(tournamentId, tournament.entryFee);
    
    // 初始化排行榜数据
    this.initLeaderboardEntry(tournamentId, player);
    
    // 发送提醒设置
    this.setTournamentReminder(tournamentId, player.id);
    
    this.emit('playerRegistered', { tournamentId, player, registration });
    this.saveLocalData();
    
    return registration;
  }

  /**
   * 取消报名
   */
  cancelRegistration(tournamentId, playerId) {
    const key = `${tournamentId}_${playerId}`;
    const registration = this.registrations.get(key);
    
    if (!registration) {
      throw new Error('未找到报名信息');
    }
    
    const tournament = this.tournaments.get(tournamentId);
    if (tournament.status !== TournamentManager.TournamentStatus.REGISTERING) {
      throw new Error('报名已截止，无法取消');
    }
    
    // 退还费用
    // TODO: 调用货币系统退还
    
    // 从奖池扣除
    this.removeFromPrizePool(tournamentId, registration.entryFee);
    
    // 移除报名
    this.registrations.delete(key);
    tournament.participants = tournament.participants.filter(id => id !== playerId);
    
    this.emit('registrationCancelled', { tournamentId, playerId });
    this.saveLocalData();
    
    return { success: true, refunded: registration.entryFee };
  }

  /**
   * 获取报名详情
   */
  getRegistration(tournamentId, playerId) {
    return this.registrations.get(`${tournamentId}_${playerId}`);
  }

  /**
   * 获取锦标赛所有报名者
   */
  getTournamentRegistrations(tournamentId) {
    const regs = [];
    for (const [key, reg] of this.registrations) {
      if (reg.tournamentId === tournamentId) {
        regs.push(reg);
      }
    }
    return regs;
  }

  // ==================== 比赛流程 ====================

  /**
   * 开始阶段
   */
  startStage(tournamentId, stageName) {
    const tournament = this.tournaments.get(tournamentId);
    const stageConfig = TournamentManager.Stages[stageName];
    
    console.log(`🏁 锦标赛 ${tournament.name} 进入${stageConfig.name}`);
    
    // 初始化阶段排行榜
    if (!this.leaderboards.has(tournamentId)) {
      this.leaderboards.set(tournamentId, new Map());
    }
    
    const stageData = {
      stage: stageName,
      startTime: Date.now(),
      endTime: Date.now() + stageConfig.duration,
      participants: stageName === 'PRELIMINARY' 
        ? [...tournament.participants]
        : this.getAdvancingPlayers(tournamentId, stageName)
    };
    
    this.emit('stageStarted', { tournamentId, stage: stageName, stageData });
    
    // 设置阶段结束定时器
    setTimeout(() => {
      this.endStage(tournamentId, stageName);
    }, stageConfig.duration);
  }

  /**
   * 结束阶段
   */
  endStage(tournamentId, stageName) {
    const tournament = this.tournaments.get(tournamentId);
    const stageConfig = TournamentManager.Stages[stageName];
    
    console.log(`🏁 锦标赛 ${tournament.name} ${stageConfig.name} 结束`);
    
    // 计算晋级名单
    const advancing = this.calculateAdvancingPlayers(tournamentId, stageConfig.advanceCount);
    
    // 保存阶段结果
    const stageResults = {
      stage: stageName,
      endTime: Date.now(),
      advancingPlayers: advancing.map(p => p.playerId),
      eliminatedPlayers: [],
      leaderboard: this.getLeaderboard(tournamentId, 1000)
    };
    
    // 更新报名记录
    advancing.forEach(player => {
      const reg = this.registrations.get(`${tournamentId}_${player.playerId}`);
      if (reg) {
        reg.stageResults[stageName] = {
          rank: player.rank,
          score: player.score,
          advanced: true
        };
      }
    });
    
    this.emit('stageEnded', { tournamentId, stage: stageName, results: stageResults });
    
    // 进入下一阶段
    const nextStage = this.getNextStage(stageName);
    if (nextStage && advancing.length > 0) {
      setTimeout(() => {
        this.updateTournamentStatus(tournamentId, 
          stageName === 'PRELIMINARY' ? TournamentManager.TournamentStatus.SEMI_FINALS :
          stageName === 'SEMI_FINALS' ? TournamentManager.TournamentStatus.FINALS :
          TournamentManager.TournamentStatus.FINISHED
        );
      }, 5000);
    }
  }

  /**
   * 获取晋级玩家
   */
  getAdvancingPlayers(tournamentId, toStage) {
    const fromStage = toStage === 'SEMI_FINALS' ? 'PRELIMINARY' :
                      toStage === 'FINALS' ? 'SEMI_FINALS' : null;
    
    if (!fromStage) return [];
    
    const advancing = [];
    for (const [key, reg] of this.registrations) {
      if (reg.tournamentId === tournamentId && reg.stageResults[fromStage]?.advanced) {
        advancing.push(reg.playerId);
      }
    }
    return advancing;
  }

  /**
   * 计算晋级玩家
   */
  calculateAdvancingPlayers(tournamentId, count) {
    const leaderboard = this.getLeaderboard(tournamentId, count);
    return leaderboard.slice(0, count);
  }

  /**
   * 获取下一阶段
   */
  getNextStage(currentStage) {
    const stages = ['PRELIMINARY', 'SEMI_FINALS', 'FINALS'];
    const index = stages.indexOf(currentStage);
    return index < stages.length - 1 ? stages[index + 1] : null;
  }

  /**
   * 结束锦标赛
   */
  finalizeTournament(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    console.log(`🏆 锦标赛 ${tournament.name} 圆满结束！`);
    
    // 计算最终排名
    const finalLeaderboard = this.getLeaderboard(tournamentId, 100);
    
    // 分发奖励
    this.distributePrizes(tournamentId, finalLeaderboard);
    
    // 更新战绩统计
    this.updatePlayerStats(tournamentId, finalLeaderboard);
    
    // 保存比赛历史
    this.saveMatchHistory(tournamentId, finalLeaderboard);
    
    tournament.status = TournamentManager.TournamentStatus.FINISHED;
    tournament.finishedAt = Date.now();
    
    this.emit('tournamentFinished', { tournamentId, leaderboard: finalLeaderboard });
    this.saveLocalData();
  }

  // ==================== 实时排行榜 ====================

  /**
   * 初始化排行榜条目
   */
  initLeaderboardEntry(tournamentId, player) {
    if (!this.leaderboards.has(tournamentId)) {
      this.leaderboards.set(tournamentId, new Map());
    }
    
    const board = this.leaderboards.get(tournamentId);
    board.set(player.id, {
      playerId: player.id,
      playerName: player.name,
      avatar: player.avatar,
      score: 0,
      wins: 0,
      losses: 0,
      matches: 0,
      lastUpdate: Date.now()
    });
  }

  /**
   * 更新玩家分数
   */
  updateScore(tournamentId, playerId, scoreDelta, matchResult) {
    const board = this.leaderboards.get(tournamentId);
    if (!board) return;
    
    const entry = board.get(playerId);
    if (!entry) return;
    
    entry.score += scoreDelta;
    entry.matches++;
    
    if (matchResult === 'win') {
      entry.wins++;
    } else if (matchResult === 'loss') {
      entry.losses++;
    }
    
    entry.lastUpdate = Date.now();
    entry.winRate = ((entry.wins / entry.matches) * 100).toFixed(1);
    
    this.emit('scoreUpdated', { tournamentId, playerId, score: entry.score, delta: scoreDelta });
  }

  /**
   * 获取排行榜
   */
  getLeaderboard(tournamentId, limit = 100) {
    const board = this.leaderboards.get(tournamentId);
    if (!board) return [];
    
    const sorted = Array.from(board.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
    
    // 添加排名
    sorted.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    
    return sorted;
  }

  /**
   * 获取玩家排名
   */
  getPlayerRank(tournamentId, playerId) {
    const leaderboard = this.getLeaderboard(tournamentId, 100000);
    const entry = leaderboard.find(e => e.playerId === playerId);
    return entry ? entry.rank : null;
  }

  /**
   * 启动实时更新
   */
  startRealtimeUpdates() {
    // 每10秒更新一次排行榜
    this.realtimeUpdateInterval = setInterval(() => {
      for (const [tournamentId, tournament] of this.tournaments) {
        if (tournament.status === TournamentManager.TournamentStatus.PRELIMINARY ||
            tournament.status === TournamentManager.TournamentStatus.SEMI_FINALS ||
            tournament.status === TournamentManager.TournamentStatus.FINALS) {
          
          // 模拟实时分数变化（实际项目中这里应该是从服务器获取）
          if (!this.apiConfig.apiKey) {
            this.simulateRealtimeChanges(tournamentId);
          }
          
          this.emit('leaderboardUpdated', {
            tournamentId,
            leaderboard: this.getLeaderboard(tournamentId, 100)
          });
        }
      }
    }, 10000);
  }

  /**
   * 模拟实时变化（仅用于演示）
   */
  simulateRealtimeChanges(tournamentId) {
    const board = this.leaderboards.get(tournamentId);
    if (!board) return;
    
    // 随机给一些玩家加分
    for (const [playerId, entry] of board) {
      if (Math.random() > 0.7) {
        const delta = Math.floor(Math.random() * 50) + 10;
        const result = Math.random() > 0.4 ? 'win' : 'loss';
        this.updateScore(tournamentId, playerId, delta, result);
      }
    }
  }

  /**
   * 停止实时更新
   */
  stopRealtimeUpdates() {
    if (this.realtimeUpdateInterval) {
      clearInterval(this.realtimeUpdateInterval);
      this.realtimeUpdateInterval = null;
    }
  }

  // ==================== 奖池系统 ====================

  /**
   * 初始化奖池
   */
  initPrizePool(tournamentId, config = {}) {
    const prizePool = {
      tournamentId,
      dynamic: {
        gold: 0,
        diamond: 0,
        totalEntries: 0
      },
      fixed: {
        gold: config.fixedGold || 0,
        diamond: config.fixedDiamond || 0,
        items: config.fixedItems || [],
        specialRewards: config.specialRewards || []
      },
      distribution: config.distribution || {
        top10: { percentage: 50, minRank: 1, maxRank: 10 },
        top100: { percentage: 30, minRank: 11, maxRank: 100 },
        participation: { percentage: 20, minRank: 101, maxRank: Infinity }
      },
      totalValue: 0,
      distributed: false
    };
    
    this.prizePools.set(tournamentId, prizePool);
    return prizePool;
  }

  /**
   * 添加报名费到奖池
   */
  addToPrizePool(tournamentId, entryFee) {
    const pool = this.prizePools.get(tournamentId);
    if (!pool) return;
    
    pool.dynamic.gold += entryFee.gold || 0;
    pool.dynamic.diamond += entryFee.diamond || 0;
    pool.dynamic.totalEntries++;
    
    this.calculateTotalPrizeValue(tournamentId);
  }

  /**
   * 从奖池扣除（取消报名）
   */
  removeFromPrizePool(tournamentId, entryFee) {
    const pool = this.prizePools.get(tournamentId);
    if (!pool) return;
    
    pool.dynamic.gold -= entryFee.gold || 0;
    pool.dynamic.diamond -= entryFee.diamond || 0;
    pool.dynamic.totalEntries--;
    
    this.calculateTotalPrizeValue(tournamentId);
  }

  /**
   * 计算奖池总价值
   */
  calculateTotalPrizeValue(tournamentId) {
    const pool = this.prizePools.get(tournamentId);
    if (!pool) return;
    
    // 简化计算，实际项目中可能更复杂
    pool.totalValue = 
      pool.dynamic.gold + pool.fixed.gold +
      (pool.dynamic.diamond + pool.fixed.diamond) * 10; // 假设1钻石=10金币
  }

  /**
   * 分发奖励
   */
  distributePrizes(tournamentId, leaderboard) {
    const pool = this.prizePools.get(tournamentId);
    if (!pool || pool.distributed) return;
    
    const rewards = [];
    
    // 前10名奖励
    const top10Players = leaderboard.slice(0, 10);
    const top10Prize = {
      gold: Math.floor((pool.dynamic.gold + pool.fixed.gold) * 0.5 / 10),
      diamond: Math.floor((pool.dynamic.diamond + pool.fixed.diamond) * 0.5 / 10),
      items: pool.fixed.specialRewards.slice(0, 3)
    };
    
    top10Players.forEach((player, index) => {
      const rank = index + 1;
      const multiplier = 1 - (rank - 1) * 0.05; // 排名越高，奖励倍数越高
      
      rewards.push({
        playerId: player.playerId,
        rank: rank,
        gold: Math.floor(top10Prize.gold * multiplier),
        diamond: Math.floor(top10Prize.diamond * multiplier),
        items: rank <= 3 ? top10Prize.items : []
      });
    });
    
    // 11-100名奖励
    const top100Players = leaderboard.slice(10, 100);
    const top100Prize = {
      gold: Math.floor((pool.dynamic.gold + pool.fixed.gold) * 0.3 / 90),
      diamond: Math.floor((pool.dynamic.diamond + pool.fixed.diamond) * 0.3 / 90)
    };
    
    top100Players.forEach((player, index) => {
      rewards.push({
        playerId: player.playerId,
        rank: player.rank,
        gold: top100Prize.gold,
        diamond: top100Prize.diamond,
        items: []
      });
    });
    
    // 参与奖（简化处理）
    // 实际项目中可能需要更复杂的逻辑
    
    // 保存奖励记录
    pool.rewards = rewards;
    pool.distributed = true;
    
    // 更新报名记录
    rewards.forEach(reward => {
      const reg = this.registrations.get(`${tournamentId}_${reward.playerId}`);
      if (reg) {
        reg.rewards.push(reward);
        reg.finalRank = reward.rank;
      }
    });
    
    this.emit('prizesDistributed', { tournamentId, rewards });
  }

  /**
   * 获取奖池信息
   */
  getPrizePool(tournamentId) {
    return this.prizePools.get(tournamentId);
  }

  // ==================== 比赛历史记录 ====================

  /**
   * 保存比赛历史
   */
  saveMatchHistory(tournamentId, finalLeaderboard) {
    const tournament = this.tournaments.get(tournamentId);
    
    const history = {
      tournamentId,
      name: tournament.name,
      type: tournament.type,
      startTime: tournament.tournamentStart,
      endTime: tournament.finishedAt,
      participants: tournament.participants.length,
      prizePool: this.prizePools.get(tournamentId),
      top10: finalLeaderboard.slice(0, 10).map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        score: p.score,
        rank: p.rank
      })),
      savedAt: Date.now()
    };
    
    this.matchHistory.set(tournamentId, history);
    
    // 同时保存到每个玩家的历史
    finalLeaderboard.forEach(player => {
      if (!this.playerStats.has(player.playerId)) {
        this.playerStats.set(player.playerId, this.createDefaultPlayerStats(player.playerId, player.playerName));
      }
      
      const stats = this.playerStats.get(player.playerId);
      stats.matchHistory.push({
        tournamentId,
        tournamentName: tournament.name,
        type: tournament.type,
        rank: player.rank,
        score: player.score,
        date: tournament.finishedAt
      });
    });
    
    this.emit('historySaved', { tournamentId, history });
  }

  /**
   * 获取比赛历史
   */
  getMatchHistory(filters = {}) {
    let history = Array.from(this.matchHistory.values());
    
    if (filters.type) {
      history = history.filter(h => h.type === filters.type);
    }
    
    if (filters.playerId) {
      const playerStats = this.playerStats.get(filters.playerId);
      if (playerStats) {
        return playerStats.matchHistory;
      }
      return [];
    }
    
    // 按时间倒序
    history.sort((a, b) => b.endTime - a.endTime);
    
    return history;
  }

  // ==================== 战绩统计 ====================

  /**
   * 创建默认玩家统计
   */
  createDefaultPlayerStats(playerId, playerName) {
    return {
      playerId,
      playerName,
      totalTournaments: 0,
      totalWins: 0,           // 冠军次数
      totalPodiums: 0,        // 前三名次数
      totalTop10: 0,          // 前十次数
      totalTop100: 0,         // 前百次数
      bestRank: null,
      bestRankTournament: null,
      totalMatches: 0,
      totalScore: 0,
      winRate: 0,
      matchHistory: [],
      favoriteType: null,
      statsByType: {},
      updatedAt: Date.now()
    };
  }

  /**
   * 更新玩家战绩
   */
  updatePlayerStats(tournamentId, finalLeaderboard) {
    const tournament = this.tournaments.get(tournamentId);
    
    finalLeaderboard.forEach(player => {
      if (!this.playerStats.has(player.playerId)) {
        this.playerStats.set(player.playerId, this.createDefaultPlayerStats(player.playerId, player.playerName));
      }
      
      const stats = this.playerStats.get(player.playerId);
      stats.totalTournaments++;
      stats.totalMatches += player.matches;
      stats.totalScore += player.score;
      
      if (player.rank === 1) stats.totalWins++;
      if (player.rank <= 3) stats.totalPodiums++;
      if (player.rank <= 10) stats.totalTop10++;
      if (player.rank <= 100) stats.totalTop100++;
      
      if (!stats.bestRank || player.rank < stats.bestRank) {
        stats.bestRank = player.rank;
        stats.bestRankTournament = tournament.name;
      }
      
      // 按类型统计
      if (!stats.statsByType[tournament.type]) {
        stats.statsByType[tournament.type] = {
          count: 0,
          wins: 0,
          top10: 0,
          bestRank: null
        };
      }
      
      const typeStats = stats.statsByType[tournament.type];
      typeStats.count++;
      if (player.rank === 1) typeStats.wins++;
      if (player.rank <= 10) typeStats.top10++;
      if (!typeStats.bestRank || player.rank < typeStats.bestRank) {
        typeStats.bestRank = player.rank;
      }
      
      // 计算胜率
      stats.winRate = ((stats.totalWins / stats.totalTournaments) * 100).toFixed(2);
      
      stats.updatedAt = Date.now();
    });
    
    this.emit('statsUpdated', { tournamentId, playerCount: finalLeaderboard.length });
    this.saveLocalData();
  }

  /**
   * 获取玩家战绩
   */
  getPlayerStats(playerId) {
    return this.playerStats.get(playerId) || this.createDefaultPlayerStats(playerId, 'Unknown');
  }

  /**
   * 获取战绩排行
   */
  getStatsLeaderboard(limit = 100) {
    const allStats = Array.from(this.playerStats.values());
    
    // 按冠军次数、前十次数排序
    allStats.sort((a, b) => {
      if (b.totalWins !== a.totalWins) return b.totalWins - a.totalWins;
      if (b.totalTop10 !== a.totalTop10) return b.totalTop10 - a.totalTop10;
      return a.bestRank - b.bestRank;
    });
    
    return allStats.slice(0, limit).map((stats, index) => ({
      ...stats,
      overallRank: index + 1
    }));
  }

  // ==================== 比赛提醒 ====================

  /**
   * 设置比赛提醒
   */
  setTournamentReminder(tournamentId, playerId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return;
    
    const reminders = [];
    
    // 比赛开始前提醒
    const startReminder = {
      id: `rem_start_${tournamentId}_${playerId}`,
      tournamentId,
      playerId,
      type: 'tournament_start',
      triggerTime: tournament.tournamentStart - 30 * 60 * 1000, // 开始前30分钟
      message: `🏆 ${tournament.name} 将在30分钟后开始！`,
      sent: false
    };
    
    // 报名截止提醒
    const regReminder = {
      id: `rem_reg_${tournamentId}_${playerId}`,
      tournamentId,
      playerId,
      type: 'registration_end',
      triggerTime: tournament.registrationEnd - 2 * 60 * 60 * 1000, // 截止前2小时
      message: `⏰ ${tournament.name} 报名将在2小时后截止！`,
      sent: false
    };
    
    reminders.push(startReminder, regReminder);
    
    // 保存提醒
    if (!this.reminders.has(playerId)) {
      this.reminders.set(playerId, []);
    }
    this.reminders.get(playerId).push(...reminders);
    
    // 启动提醒检查
    this.startReminderCheck();
    
    return reminders;
  }

  /**
   * 启动提醒检查
   */
  startReminderCheck() {
    if (this.reminderInterval) return;
    
    this.reminderInterval = setInterval(() => {
      const now = Date.now();
      
      for (const [playerId, reminders] of this.reminders) {
        reminders.forEach(reminder => {
          if (!reminder.sent && reminder.triggerTime <= now) {
            this.sendReminder(reminder);
            reminder.sent = true;
          }
        });
        
        // 清理已发送的提醒
        const activeReminders = reminders.filter(r => !r.sent);
        this.reminders.set(playerId, activeReminders);
      }
    }, 60000); // 每分钟检查一次
  }

  /**
   * 发送提醒
   */
  sendReminder(reminder) {
    console.log(`📢 提醒 [${reminder.playerId}]: ${reminder.message}`);
    
    this.emit('reminder', reminder);
    
    // 实际项目中这里应该调用推送服务
    if (typeof window !== 'undefined' && window.Notification && Notification.permission === 'granted') {
      new Notification('命运塔锦标赛', {
        body: reminder.message,
        icon: '/assets/tournament-icon.png'
      });
    }
  }

  /**
   * 请求通知权限
   */
  async requestNotificationPermission() {
    if (typeof window !== 'undefined' && window.Notification) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // ==================== API 接口 ====================

  /**
   * 同步服务器数据
   */
  async syncWithServer() {
    try {
      // 获取锦标赛列表
      const tournaments = await this.apiRequest('/tournaments');
      tournaments.forEach(t => this.tournaments.set(t.id, t));
      
      // 获取排行榜
      for (const tournament of tournaments) {
        if (tournament.status !== TournamentManager.TournamentStatus.FINISHED) {
          const leaderboard = await this.apiRequest(`/tournaments/${tournament.id}/leaderboard`);
          this.leaderboards.set(tournament.id, new Map(leaderboard.map(e => [e.playerId, e])));
        }
      }
      
      console.log('🌐 服务器数据同步完成');
    } catch (error) {
      console.error('服务器同步失败:', error);
      // 失败时使用本地数据
      this.generateMockData();
    }
  }

  /**
   * API请求封装
   */
  async apiRequest(endpoint, options = {}) {
    const url = `${this.apiConfig.baseUrl}${endpoint}`;
    const config = {
      headers: {
        'Authorization': `Bearer ${this.apiConfig.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    return response.json();
  }

  /**
   * 提交比赛结果
   */
  async submitMatchResult(tournamentId, playerId, result) {
    if (this.apiConfig.apiKey) {
      return this.apiRequest(`/tournaments/${tournamentId}/matches`, {
        method: 'POST',
        body: JSON.stringify({ playerId, ...result })
      });
    } else {
      // 本地模式
      this.updateScore(tournamentId, playerId, result.score, result.outcome);
      return { success: true };
    }
  }

  // ==================== 模拟数据生成 ====================

  /**
   * 生成模拟数据
   */
  generateMockData() {
    const now = Date.now();
    
    // 生成全球锦标赛
    this.createTournament({
      name: '命运塔全球争霸赛',
      description: '与全球玩家一决高下，争夺至高荣耀！',
      type: TournamentManager.TournamentTypes.GLOBAL,
      registrationStart: now - 2 * 24 * 60 * 60 * 1000,
      registrationEnd: now + 1 * 24 * 60 * 60 * 1000,
      tournamentStart: now + 1 * 24 * 60 * 60 * 1000 + 3600000,
      tournamentEnd: now + 7 * 24 * 60 * 60 * 1000,
      entryFee: { gold: 10000, diamond: 0 },
      requirements: { minLevel: 30, minPower: 50000 },
      prizePool: {
        fixedGold: 10000000,
        fixedDiamond: 50000,
        specialRewards: [
          { itemId: 'legendary_weapon_001', name: '命运之剑', rarity: 'legendary' },
          { itemId: 'epic_armor_001', name: '星辰铠甲', rarity: 'epic' },
          { itemId: 'rare_pet_001', name: '凤凰幼崽', rarity: 'rare' }
        ]
      }
    });
    
    // 生成好友锦标赛
    this.createTournament({
      name: '好友私密挑战赛',
      description: '仅限好友参与，友谊第一，比赛第二！',
      type: TournamentManager.TournamentTypes.FRIENDS,
      registrationStart: now - 1 * 24 * 60 * 60 * 1000,
      registrationEnd: now + 2 * 24 * 60 * 60 * 1000,
      tournamentStart: now + 2 * 24 * 60 * 60 * 1000 + 3600000,
      tournamentEnd: now + 4 * 24 * 60 * 60 * 1000,
      entryFee: { gold: 1000, diamond: 0 },
      requirements: { 
        minLevel: 10, 
        minPower: 10000,
        friendIds: ['player_001', 'player_002', 'player_003', 'player_004', 'player_005']
      },
      prizePool: {
        fixedGold: 100000,
        fixedDiamond: 1000,
        specialRewards: [
          { itemId: 'friendship_badge', name: '友谊徽章', rarity: 'rare' }
        ]
      }
    });
    
    // 生成国家锦标赛
    this.createTournament({
      name: '中国区冠军赛',
      description: '中国区顶尖玩家对决，为国争光！',
      type: TournamentManager.TournamentTypes.COUNTRY,
      registrationStart: now - 3 * 24 * 60 * 60 * 1000,
      registrationEnd: now + 2 * 24 * 60 * 60 * 1000,
      tournamentStart: now + 2 * 24 * 60 * 60 * 1000 + 7200000,
      tournamentEnd: now + 6 * 24 * 60 * 60 * 1000,
      entryFee: { gold: 5000, diamond: 10 },
      requirements: { 
        minLevel: 25, 
        minPower: 30000,
        countries: ['CN']
      },
      prizePool: {
        fixedGold: 5000000,
        fixedDiamond: 20000,
        specialRewards: [
          { itemId: 'cn_exclusive_title', name: '华夏战神', rarity: 'legendary' }
        ]
      }
    });
    
    // 生成限时锦标赛
    this.createTournament({
      name: '周末极速挑战赛',
      description: '24小时限时挑战，快节奏对决！',
      type: TournamentManager.TournamentTypes.LIMITED,
      registrationStart: now - 12 * 60 * 60 * 1000,
      registrationEnd: now + 12 * 60 * 60 * 1000,
      tournamentStart: now + 12 * 60 * 60 * 1000,
      tournamentEnd: now + 36 * 60 * 60 * 1000,
      entryFee: { gold: 0, diamond: 50 },
      requirements: { minLevel: 20, minPower: 20000 },
      limitedTimeConfig: {
        duration: 24 * 60 * 60 * 1000, // 24小时
        speedMultiplier: 2, // 双倍积分
        specialRules: ['快速匹配', '双倍积分', '连胜加成']
      },
      prizePool: {
        fixedGold: 0,
        fixedDiamond: 10000,
        specialRewards: [
          { itemId: 'weekend_warrior_title', name: '周末战士', rarity: 'epic' }
        ]
      }
    });
    
    // 生成历史锦标赛数据
    this.generateMockHistory();
    
    // 生成模拟玩家数据
    this.generateMockPlayers();
    
    console.log('📦 模拟数据生成完成');
  }

  /**
   * 生成模拟历史数据
   */
  generateMockHistory() {
    const now = Date.now();
    
    for (let i = 1; i <= 5; i++) {
      const historyId = `hist_${i}`;
      const history = {
        tournamentId: historyId,
        name: `第${i}届命运塔争霸赛`,
        type: TournamentManager.TournamentTypes.GLOBAL,
        startTime: now - i * 30 * 24 * 60 * 60 * 1000,
        endTime: now - i * 30 * 24 * 60 * 60 * 1000 + 7 * 24 * 60 * 60 * 1000,
        participants: 50000 + Math.floor(Math.random() * 50000),
        prizePool: {
          totalValue: 10000000 * i,
          rewards: []
        },
        top10: Array.from({ length: 10 }, (_, j) => ({
          playerId: `player_${j + 1}`,
          playerName: `玩家${j + 1}`,
          score: 100000 - j * 5000,
          rank: j + 1
        })),
        savedAt: now - i * 30 * 24 * 60 * 60 * 1000
      };
      
      this.matchHistory.set(historyId, history);
    }
  }

  /**
   * 生成模拟玩家数据
   */
  generateMockPlayers() {
    const playerIds = ['player_001', 'player_002', 'player_003', 'player_004', 'player_005'];
    
    playerIds.forEach((id, index) => {
      const stats = {
        playerId: id,
        playerName: `玩家${index + 1}`,
        totalTournaments: 20 + Math.floor(Math.random() * 30),
        totalWins: Math.floor(Math.random() * 5),
        totalPodiums: Math.floor(Math.random() * 10),
        totalTop10: 15 + Math.floor(Math.random() * 20),
        totalTop100: 30 + Math.floor(Math.random() * 20),
        bestRank: Math.floor(Math.random() * 10) + 1,
        bestRankTournament: '第1届命运塔争霸赛',
        totalMatches: 500 + Math.floor(Math.random() * 500),
        totalScore: 1000000 + Math.floor(Math.random() * 500000),
        winRate: (40 + Math.random() * 20).toFixed(2),
        matchHistory: [],
        favoriteType: TournamentManager.TournamentTypes.GLOBAL,
        statsByType: {
          [TournamentManager.TournamentTypes.GLOBAL]: {
            count: 30,
            wins: Math.floor(Math.random() * 5),
            top10: 15,
            bestRank: 1
          },
          [TournamentManager.TournamentTypes.FRIENDS]: {
            count: 10,
            wins: 2,
            top10: 8,
            bestRank: 1
          }
        },
        updatedAt: Date.now()
      };
      
      this.playerStats.set(id, stats);
    });
  }

  // ==================== 事件系统 ====================

  /**
   * 添加事件监听
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * 移除事件监听
   */
  off(event, callback) {
    if (!this.eventListeners.has(event)) return;
    const listeners = this.eventListeners.get(event);
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (!this.eventListeners.has(event)) return;
    this.eventListeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (e) {
        console.error('事件处理错误:', e);
      }
    });
  }

  // ==================== 定时任务 ====================

  /**
   * 设置状态自动更新
   */
  scheduleStatusUpdates(tournament) {
    const now = Date.now();
    
    // 报名开始
    if (tournament.registrationStart > now) {
      setTimeout(() => {
        this.updateTournamentStatus(tournament.id, TournamentManager.TournamentStatus.REGISTERING);
      }, tournament.registrationStart - now);
    }
    
    // 比赛开始
    if (tournament.tournamentStart > now) {
      setTimeout(() => {
        this.updateTournamentStatus(tournament.id, TournamentManager.TournamentStatus.PRELIMINARY);
      }, tournament.tournamentStart - now);
    }
  }

  // ==================== 工具方法 ====================

  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    return new Date(timestamp).toLocaleString('zh-CN');
  }

  /**
   * 格式化时长
   */
  formatDuration(ms) {
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) return `${days}天${hours}小时`;
    if (hours > 0) return `${hours}小时${minutes}分钟`;
    return `${minutes}分钟`;
  }

  /**
   * 销毁
   */
  destroy() {
    this.stopRealtimeUpdates();
    if (this.reminderInterval) {
      clearInterval(this.reminderInterval);
    }
    this.saveLocalData();
    this.eventListeners.clear();
    console.log('🐍 锦标赛系统已销毁');
  }
}

// ==================== 导出 ====================

// ES6 模块导出
export default TournamentManager;
export { TournamentManager };

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TournamentManager };
}

// 浏览器全局变量
if (typeof window !== 'undefined') {
  window.TournamentManager = TournamentManager;
}

// ==================== 使用示例 ====================

/*
// 初始化锦标赛管理器
const tournamentManager = new TournamentManager({
  baseUrl: 'https://api.toweroffate.com',
  apiKey: 'your-api-key-here'  // 如果有API密钥，使用真实服务器；否则使用模拟数据
});

// 等待初始化完成
tournamentManager.on('initialized', () => {
  console.log('锦标赛系统已就绪');
  
  // 获取锦标赛列表
  const tournaments = tournamentManager.getTournaments({ active: true });
  console.log('当前锦标赛:', tournaments);
  
  // 报名参赛
  const player = {
    id: 'player_001',
    name: '金先生',
    level: 50,
    power: 100000,
    gold: 50000,
    diamond: 1000,
    country: 'CN'
  };
  
  const tournament = tournaments[0];
  const eligibility = tournamentManager.checkEligibility(tournament.id, player);
  
  if (eligibility.eligible) {
    tournamentManager.register(tournament.id, player)
      .then(registration => {
        console.log('报名成功:', registration);
      })
      .catch(error => {
        console.error('报名失败:', error);
      });
  }
  
  // 监听排行榜更新
  tournamentManager.on('leaderboardUpdated', ({ tournamentId, leaderboard }) => {
    console.log('排行榜更新:', leaderboard.slice(0, 10));
  });
  
  // 获取玩家战绩
  const stats = tournamentManager.getPlayerStats(player.id);
  console.log('我的战绩:', stats);
  
  // 获取比赛历史
  const history = tournamentManager.getMatchHistory({ playerId: player.id });
  console.log('我的比赛历史:', history);
});

// 请求通知权限
tournamentManager.requestNotificationPermission().then(granted => {
  if (granted) {
    console.log('通知权限已获取');
  }
});
*/
