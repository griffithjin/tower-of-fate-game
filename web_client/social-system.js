/**
 * 命运塔游戏 - 社交/好友系统核心模块
 * Tower of Fate - Social/Friend System Core Module
 * 
 * @author 小金蛇 🐍
 * @version 1.0.0
 */

// ==================== 数据模型 ====================

/**
 * 好友数据结构
 * @typedef {Object} Friend
 * @property {string} id - 好友唯一ID
 * @property {string} nickname - 昵称
 * @property {string} avatar - 头像URL
 * @property {number} level - 等级
 * @property {boolean} isOnline - 在线状态
 * @property {number} lastLogin - 最后登录时间戳
 * @property {number} intimacy - 亲密度 (0-1000)
 * @property {string} [signature] - 个性签名
 * @property {number} [vipLevel] - VIP等级
 */

/**
 * 对战邀请数据结构
 * @typedef {Object} BattleInvite
 * @property {string} id - 邀请ID
 * @property {string} fromId - 发送者ID
 * @property {string} toId - 接收者ID
 * @property {string} mode - 对战模式
 * @property {number} timestamp - 发送时间
 * @property {string} status - 状态: pending/accepted/rejected/expired
 * @property {number} expireTime - 过期时间
 */

/**
 * 礼物数据结构
 * @typedef {Object} Gift
 * @property {string} id - 礼物ID
 * @property {string} type - 礼物类型: coin/prop/energy
 * @property {number} amount - 数量
 * @property {string} name - 礼物名称
 * @property {string} icon - 图标
 */

/**
 * 礼物记录数据结构
 * @typedef {Object} GiftRecord
 * @property {string} id - 记录ID
 * @property {string} fromId - 发送者ID
 * @property {string} toId - 接收者ID
 * @property {Gift} gift - 礼物信息
 * @property {number} timestamp - 发送时间
 * @property {boolean} isRead - 是否已读
 */

/**
 * 聊天记录数据结构
 * @typedef {Object} ChatMessage
 * @property {string} id - 消息ID
 * @property {string} senderId - 发送者ID
 * @property {string} receiverId - 接收者ID
 * @property {string} content - 消息内容
 * @property {number} timestamp - 发送时间
 * @property {string} type - 消息类型: text/system/battle/gift
 * @property {boolean} isRead - 是否已读
 */

/**
 * 排行榜数据
 * @typedef {Object} RankData
 * @property {string} userId - 用户ID
 * @property {string} nickname - 昵称
 * @property {string} avatar - 头像
 * @property {number} score - 分数
 * @property {number} rank - 排名
 */

// ==================== 事件系统 ====================

/**
 * 简单的事件发射器
 */
class EventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.events.has(event)) return;
    const callbacks = this.events.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.events.has(event)) return;
    this.events.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event handler error for ${event}:`, error);
      }
    });
  }
}

// ==================== 社交系统主类 ====================

class SocialSystem extends EventEmitter {
  static STORAGE_KEY = 'tower_of_fate_social';
  static ONLINE_CHECK_INTERVAL = 30000; // 30秒检查一次在线状态
  static INVITE_EXPIRE_TIME = 60000; // 邀请60秒过期
  static MAX_FRIENDS = 100; // 最大好友数
  static MAX_CHAT_HISTORY = 100; // 每个好友最大聊天记录数
  static MAX_RECENT_BATTLES = 20; // 最近对战记录数

  constructor() {
    super();
    this.friends = new Map(); // 好友列表
    this.friendRequests = new Map(); // 好友请求
    this.battleInvites = new Map(); // 对战邀请
    this.giftRecords = []; // 礼物记录
    this.chatHistory = new Map(); // 聊天记录 Map<friendId, ChatMessage[]>
    this.recentBattles = []; // 最近对战记录
    this.rankings = {
      weekly: [],
      monthly: [],
      total: []
    };
    this.currentUser = null;
    this.onlineCheckTimer = null;
    this.simulationMode = true; // 模拟模式
  }

  // ==================== 初始化与存储 ====================

  /**
   * 初始化社交系统
   * @param {Object} currentUser - 当前用户信息
   */
  init(currentUser) {
    this.currentUser = currentUser;
    this.loadFromStorage();
    this.startOnlineSimulation();
    this.emit('initialized', { userId: currentUser?.id });
    console.log('🐍 社交系统已初始化');
  }

  /**
   * 从本地存储加载数据
   */
  loadFromStorage() {
    try {
      const data = localStorage.getItem(SocialSystem.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.friends = new Map(parsed.friends || []);
        this.friendRequests = new Map(parsed.friendRequests || []);
        this.giftRecords = parsed.giftRecords || [];
        this.chatHistory = new Map(parsed.chatHistory || []);
        this.recentBattles = parsed.recentBattles || [];
        this.rankings = parsed.rankings || { weekly: [], monthly: [], total: [] };
        
        // 恢复后更新所有好友为离线状态（需要重新检测）
        this.friends.forEach(friend => {
          friend.isOnline = false;
        });
      }
    } catch (error) {
      console.error('加载社交数据失败:', error);
    }
  }

  /**
   * 保存到本地存储
   */
  saveToStorage() {
    try {
      const data = {
        friends: Array.from(this.friends.entries()),
        friendRequests: Array.from(this.friendRequests.entries()),
        giftRecords: this.giftRecords,
        chatHistory: Array.from(this.chatHistory.entries()),
        recentBattles: this.recentBattles,
        rankings: this.rankings,
        lastSave: Date.now()
      };
      localStorage.setItem(SocialSystem.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('保存社交数据失败:', error);
    }
  }

  /**
   * 销毁实例，清理定时器
   */
  destroy() {
    this.stopOnlineSimulation();
    this.saveToStorage();
    this.events.clear();
  }

  // ==================== 好友列表管理 ====================

  /**
   * 添加好友
   * @param {Friend} friend - 好友信息
   * @returns {Object} 结果 { success: boolean, message: string }
   */
  addFriend(friend) {
    if (!friend.id || !friend.nickname) {
      return { success: false, message: '好友信息不完整' };
    }

    if (friend.id === this.currentUser?.id) {
      return { success: false, message: '不能添加自己为好友' };
    }

    if (this.friends.has(friend.id)) {
      return { success: false, message: '该玩家已经是你的好友' };
    }

    if (this.friends.size >= SocialSystem.MAX_FRIENDS) {
      return { success: false, message: `好友数量已达上限(${SocialSystem.MAX_FRIENDS})` };
    }

    // 设置默认值
    const newFriend = {
      id: friend.id,
      nickname: friend.nickname,
      avatar: friend.avatar || this.getDefaultAvatar(),
      level: friend.level || 1,
      isOnline: false,
      lastLogin: friend.lastLogin || Date.now(),
      intimacy: friend.intimacy || 0,
      signature: friend.signature || '',
      vipLevel: friend.vipLevel || 0,
      addedAt: Date.now()
    };

    this.friends.set(friend.id, newFriend);
    this.saveToStorage();
    
    this.emit('friendAdded', { friend: newFriend });
    this.emit('friendListUpdated', { count: this.friends.size });
    
    return { success: true, message: '添加好友成功', friend: newFriend };
  }

  /**
   * 删除好友
   * @param {string} friendId - 好友ID
   * @returns {Object} 结果
   */
  removeFriend(friendId) {
    if (!this.friends.has(friendId)) {
      return { success: false, message: '该玩家不在好友列表中' };
    }

    const friend = this.friends.get(friendId);
    this.friends.delete(friendId);
    
    // 清理相关数据
    this.chatHistory.delete(friendId);
    
    this.saveToStorage();
    
    this.emit('friendRemoved', { friendId, friend });
    this.emit('friendListUpdated', { count: this.friends.size });
    
    return { success: true, message: '删除好友成功' };
  }

  /**
   * 搜索好友
   * @param {string} keyword - 搜索关键词
   * @param {Object} filters - 过滤条件 { onlineOnly: boolean, minLevel: number, maxLevel: number }
   * @returns {Friend[]} 好友列表
   */
  searchFriends(keyword = '', filters = {}) {
    let results = Array.from(this.friends.values());

    // 关键词搜索
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      results = results.filter(f => 
        f.nickname.toLowerCase().includes(lowerKeyword) ||
        f.id.toLowerCase().includes(lowerKeyword)
      );
    }

    // 在线状态过滤
    if (filters.onlineOnly) {
      results = results.filter(f => f.isOnline);
    }

    // 等级范围过滤
    if (filters.minLevel !== undefined) {
      results = results.filter(f => f.level >= filters.minLevel);
    }
    if (filters.maxLevel !== undefined) {
      results = results.filter(f => f.level <= filters.maxLevel);
    }

    // 排序：在线优先，然后按亲密度降序
    results.sort((a, b) => {
      if (a.isOnline !== b.isOnline) {
        return b.isOnline ? 1 : -1;
      }
      return b.intimacy - a.intimacy;
    });

    return results;
  }

  /**
   * 获取好友详情
   * @param {string} friendId - 好友ID
   * @returns {Friend|null}
   */
  getFriend(friendId) {
    return this.friends.get(friendId) || null;
  }

  /**
   * 获取所有好友
   * @returns {Friend[]}
   */
  getAllFriends() {
    return this.searchFriends();
  }

  /**
   * 获取好友数量统计
   * @returns {Object} { total, online, offline }
   */
  getFriendStats() {
    const friends = Array.from(this.friends.values());
    return {
      total: friends.length,
      online: friends.filter(f => f.isOnline).length,
      offline: friends.filter(f => !f.isOnline).length
    };
  }

  // ==================== 好友请求处理 ====================

  /**
   * 发送好友请求
   * @param {string} targetId - 目标用户ID
   * @param {string} message - 附言
   * @returns {Object} 结果
   */
  sendFriendRequest(targetId, message = '') {
    if (this.friends.has(targetId)) {
      return { success: false, message: '该玩家已经是你的好友' };
    }

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const request = {
      id: requestId,
      fromId: this.currentUser?.id,
      fromName: this.currentUser?.nickname,
      fromAvatar: this.currentUser?.avatar,
      toId: targetId,
      message: message,
      timestamp: Date.now(),
      status: 'pending'
    };

    this.friendRequests.set(requestId, request);
    this.saveToStorage();
    
    this.emit('friendRequestSent', { request });
    
    return { success: true, message: '好友请求已发送', requestId };
  }

  /**
   * 接受好友请求
   * @param {string} requestId - 请求ID
   * @returns {Object} 结果
   */
  acceptFriendRequest(requestId) {
    const request = this.friendRequests.get(requestId);
    if (!request) {
      return { success: false, message: '请求不存在' };
    }

    if (request.status !== 'pending') {
      return { success: false, message: '该请求已处理' };
    }

    request.status = 'accepted';
    this.friendRequests.set(requestId, request);

    // 添加为好友（双向）
    const friend = {
      id: request.fromId,
      nickname: request.fromName,
      avatar: request.fromAvatar,
      level: 1,
      isOnline: false,
      lastLogin: Date.now(),
      intimacy: 10 // 初始亲密度
    };

    this.addFriend(friend);
    this.saveToStorage();
    
    this.emit('friendRequestAccepted', { request, friend });
    
    return { success: true, message: '已接受好友请求', friend };
  }

  /**
   * 拒绝好友请求
   * @param {string} requestId - 请求ID
   * @returns {Object} 结果
   */
  rejectFriendRequest(requestId) {
    const request = this.friendRequests.get(requestId);
    if (!request) {
      return { success: false, message: '请求不存在' };
    }

    request.status = 'rejected';
    this.friendRequests.set(requestId, request);
    this.saveToStorage();
    
    this.emit('friendRequestRejected', { request });
    
    return { success: true, message: '已拒绝好友请求' };
  }

  /**
   * 获取待处理的好友请求
   * @returns {Array} 请求列表
   */
  getPendingRequests() {
    return Array.from(this.friendRequests.values())
      .filter(req => req.status === 'pending' && req.toId === this.currentUser?.id);
  }

  // ==================== 在线状态管理 ====================

  /**
   * 开始在线状态模拟
   */
  startOnlineSimulation() {
    this.stopOnlineSimulation();
    
    // 立即执行一次
    this.simulateOnlineStatus();
    
    // 定时更新
    this.onlineCheckTimer = setInterval(() => {
      this.simulateOnlineStatus();
    }, SocialSystem.ONLINE_CHECK_INTERVAL);
  }

  /**
   * 停止在线状态模拟
   */
  stopOnlineSimulation() {
    if (this.onlineCheckTimer) {
      clearInterval(this.onlineCheckTimer);
      this.onlineCheckTimer = null;
    }
  }

  /**
   * 模拟好友在线状态
   * 实际项目中应该通过WebSocket或长轮询获取真实状态
   */
  simulateOnlineStatus() {
    const friends = Array.from(this.friends.values());
    let changed = false;

    friends.forEach(friend => {
      const wasOnline = friend.isOnline;
      
      // 模拟在线状态变化
      // 基于亲密度的好友更可能在线
      const onlineProbability = 0.3 + (friend.intimacy / 1000) * 0.4;
      const shouldBeOnline = Math.random() < onlineProbability;
      
      // 添加一些随机性，避免频繁切换
      if (wasOnline !== shouldBeOnline) {
        if (Math.random() < 0.3) { // 30% 概率状态改变
          friend.isOnline = shouldBeOnline;
          friend.lastLogin = shouldBeOnline ? Date.now() : friend.lastLogin;
          changed = true;
          
          this.emit('friendStatusChanged', {
            friendId: friend.id,
            isOnline: friend.isOnline,
            friend
          });
        }
      }
    });

    if (changed) {
      this.emit('onlineStatusUpdated', { stats: this.getFriendStats() });
      this.saveToStorage();
    }
  }

  /**
   * 设置好友在线状态（实际项目中使用）
   * @param {string} friendId - 好友ID
   * @param {boolean} isOnline - 是否在线
   */
  setFriendOnlineStatus(friendId, isOnline) {
    const friend = this.friends.get(friendId);
    if (friend && friend.isOnline !== isOnline) {
      friend.isOnline = isOnline;
      if (!isOnline) {
        friend.lastLogin = Date.now();
      }
      this.saveToStorage();
      
      this.emit('friendStatusChanged', { friendId, isOnline, friend });
    }
  }

  /**
   * 获取好友在线状态
   * @param {string} friendId - 好友ID
   * @returns {boolean}
   */
  isFriendOnline(friendId) {
    const friend = this.friends.get(friendId);
    return friend?.isOnline || false;
  }

  // ==================== 对战邀请系统 ====================

  /**
   * 发送对战邀请
   * @param {string} friendId - 好友ID
   * @param {Object} options - 对战选项 { mode: string, mapId: string, bet: number }
   * @returns {Object} 结果
   */
  sendBattleInvite(friendId, options = {}) {
    const friend = this.friends.get(friendId);
    if (!friend) {
      return { success: false, message: '该玩家不在好友列表中' };
    }

    if (!friend.isOnline) {
      return { success: false, message: '该玩家当前不在线' };
    }

    // 检查是否有待处理的邀请
    const existingInvite = Array.from(this.battleInvites.values())
      .find(inv => inv.fromId === this.currentUser?.id && 
                  inv.toId === friendId && 
                  inv.status === 'pending');
    
    if (existingInvite) {
      return { success: false, message: '已发送过对战邀请，请等待响应' };
    }

    const inviteId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const invite = {
      id: inviteId,
      fromId: this.currentUser?.id,
      fromName: this.currentUser?.nickname,
      fromAvatar: this.currentUser?.avatar,
      toId: friendId,
      toName: friend.nickname,
      mode: options.mode || '1v1',
      mapId: options.mapId || 'random',
      bet: options.bet || 0,
      timestamp: Date.now(),
      expireTime: Date.now() + SocialSystem.INVITE_EXPIRE_TIME,
      status: 'pending'
    };

    this.battleInvites.set(inviteId, invite);
    
    // 设置过期处理
    setTimeout(() => {
      this.expireBattleInvite(inviteId);
    }, SocialSystem.INVITE_EXPIRE_TIME);

    this.emit('battleInviteSent', { invite });
    
    return { success: true, message: '对战邀请已发送', invite };
  }

  /**
   * 接受对战邀请
   * @param {string} inviteId - 邀请ID
   * @returns {Object} 结果
   */
  acceptBattleInvite(inviteId) {
    const invite = this.battleInvites.get(inviteId);
    if (!invite) {
      return { success: false, message: '邀请不存在或已过期' };
    }

    if (invite.status !== 'pending') {
      return { success: false, message: '该邀请已处理' };
    }

    if (Date.now() > invite.expireTime) {
      invite.status = 'expired';
      this.battleInvites.set(inviteId, invite);
      return { success: false, message: '邀请已过期' };
    }

    invite.status = 'accepted';
    this.battleInvites.set(inviteId, invite);

    // 添加到最近对战记录
    this.addRecentBattle({
      opponentId: invite.fromId,
      opponentName: invite.fromName,
      opponentAvatar: invite.fromAvatar,
      mode: invite.mode,
      result: 'pending',
      timestamp: Date.now()
    });

    this.emit('battleInviteAccepted', { invite });
    
    return { success: true, message: '已接受对战邀请', invite };
  }

  /**
   * 拒绝对战邀请
   * @param {string} inviteId - 邀请ID
   * @returns {Object} 结果
   */
  rejectBattleInvite(inviteId) {
    const invite = this.battleInvites.get(inviteId);
    if (!invite || invite.status !== 'pending') {
      return { success: false, message: '邀请不存在或已过期' };
    }

    invite.status = 'rejected';
    this.battleInvites.set(inviteId, invite);
    
    this.emit('battleInviteRejected', { invite });
    
    return { success: true, message: '已拒绝对战邀请' };
  }

  /**
   * 取消对战邀请
   * @param {string} inviteId - 邀请ID
   * @returns {Object} 结果
   */
  cancelBattleInvite(inviteId) {
    const invite = this.battleInvites.get(inviteId);
    if (!invite || invite.fromId !== this.currentUser?.id) {
      return { success: false, message: '邀请不存在' };
    }

    if (invite.status !== 'pending') {
      return { success: false, message: '该邀请已无法取消' };
    }

    invite.status = 'cancelled';
    this.battleInvites.set(inviteId, invite);
    
    this.emit('battleInviteCancelled', { invite });
    
    return { success: true, message: '已取消对战邀请' };
  }

  /**
   * 处理邀请过期
   * @param {string} inviteId - 邀请ID
   */
  expireBattleInvite(inviteId) {
    const invite = this.battleInvites.get(inviteId);
    if (invite && invite.status === 'pending') {
      invite.status = 'expired';
      this.battleInvites.set(inviteId, invite);
      this.emit('battleInviteExpired', { invite });
    }
  }

  /**
   * 获取待处理的对战邀请
   * @returns {BattleInvite[]}
   */
  getPendingBattleInvites() {
    return Array.from(this.battleInvites.values())
      .filter(inv => inv.status === 'pending' && inv.toId === this.currentUser?.id);
  }

  /**
   * 获取发送的对战邀请
   * @returns {BattleInvite[]}
   */
  getSentBattleInvites() {
    return Array.from(this.battleInvites.values())
      .filter(inv => inv.fromId === this.currentUser?.id && inv.status === 'pending');
  }

  // ==================== 礼物系统 ====================

  /**
   * 礼物类型定义
   */
  static GIFT_TYPES = {
    COIN: {
      type: 'coin',
      name: '金币',
      icon: '💰',
      amounts: [100, 500, 1000, 5000]
    },
    ENERGY: {
      type: 'energy',
      name: '体力',
      icon: '⚡',
      amounts: [10, 20, 50, 100]
    },
    PROP: {
      type: 'prop',
      name: '道具',
      icon: '🎁',
      items: [
        { id: 'exp_card', name: '经验卡', icon: '📜' },
        { id: 'shield', name: '护盾', icon: '🛡️' },
        { id: 'boost', name: '加速卡', icon: '⚡' }
      ]
    }
  };

  /**
   * 发送礼物
   * @param {string} friendId - 好友ID
   * @param {Object} giftData - 礼物数据 { type: string, amount: number, itemId: string }
   * @returns {Object} 结果
   */
  sendGift(friendId, giftData) {
    const friend = this.friends.get(friendId);
    if (!friend) {
      return { success: false, message: '该玩家不在好友列表中' };
    }

    if (!giftData.type) {
      return { success: false, message: '请选择礼物类型' };
    }

    // 验证礼物数据
    const giftType = SocialSystem.GIFT_TYPES[giftData.type.toUpperCase()];
    if (!giftType) {
      return { success: false, message: '不支持的礼物类型' };
    }

    // 构建礼物信息
    let gift = {
      id: `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: giftData.type,
      amount: giftData.amount || 0,
      name: giftType.name,
      icon: giftType.icon
    };

    if (giftData.type === 'prop' && giftData.itemId) {
      const item = giftType.items.find(i => i.id === giftData.itemId);
      if (item) {
        gift.name = item.name;
        gift.icon = item.icon;
        gift.itemId = item.id;
      }
    }

    const record = {
      id: `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromId: this.currentUser?.id,
      toId: friendId,
      gift: gift,
      timestamp: Date.now(),
      isRead: false
    };

    this.giftRecords.push(record);

    // 增加亲密度
    const intimacyIncrease = giftData.type === 'coin' ? Math.floor(gift.amount / 100) : 
                            giftData.type === 'energy' ? Math.floor(gift.amount / 10) : 5;
    this.increaseIntimacy(friendId, intimacyIncrease);

    this.saveToStorage();
    
    this.emit('giftSent', { record, friend });
    
    // 发送系统消息
    this.sendSystemMessage(friendId, `[礼物] 我送了你 ${gift.icon} ${gift.amount > 0 ? gift.amount : ''}${gift.name}`);
    
    return { success: true, message: '礼物发送成功', record };
  }

  /**
   * 接收礼物（标记为已读）
   * @param {string} recordId - 礼物记录ID
   * @returns {Object} 结果
   */
  receiveGift(recordId) {
    const record = this.giftRecords.find(r => r.id === recordId);
    if (!record) {
      return { success: false, message: '礼物记录不存在' };
    }

    if (record.isRead) {
      return { success: false, message: '该礼物已领取' };
    }

    record.isRead = true;
    this.saveToStorage();
    
    this.emit('giftReceived', { record });
    
    return { success: true, message: '礼物领取成功', gift: record.gift };
  }

  /**
   * 获取未领取的礼物
   * @returns {GiftRecord[]}
   */
  getUnreadGifts() {
    return this.giftRecords.filter(r => r.toId === this.currentUser?.id && !r.isRead);
  }

  /**
   * 获取礼物历史
   * @param {string} [friendId] - 特定好友ID，不传则返回所有
   * @returns {GiftRecord[]}
   */
  getGiftHistory(friendId = null) {
    let records = this.giftRecords;
    if (friendId) {
      records = records.filter(r => r.fromId === friendId || r.toId === friendId);
    }
    return records.sort((a, b) => b.timestamp - a.timestamp);
  }

  // ==================== 亲密度系统 ====================

  /**
   * 增加亲密度
   * @param {string} friendId - 好友ID
   * @param {number} amount - 增加数量
   */
  increaseIntimacy(friendId, amount) {
    const friend = this.friends.get(friendId);
    if (friend) {
      const oldIntimacy = friend.intimacy;
      friend.intimacy = Math.min(1000, friend.intimacy + amount);
      
      if (oldIntimacy !== friend.intimacy) {
        this.saveToStorage();
        this.emit('intimacyChanged', { 
          friendId, 
          oldValue: oldIntimacy, 
          newValue: friend.intimacy,
          change: amount 
        });
      }
    }
  }

  /**
   * 获取亲密度等级
   * @param {number} intimacy - 亲密度值
   * @returns {Object} { level: number, name: string, max: number, min: number }
   */
  getIntimacyLevel(intimacy) {
    const levels = [
      { level: 0, name: '陌生人', min: 0, max: 10 },
      { level: 1, name: '初识', min: 10, max: 50 },
      { level: 2, name: '熟人', min: 50, max: 100 },
      { level: 3, name: '朋友', min: 100, max: 200 },
      { level: 4, name: '好友', min: 200, max: 500 },
      { level: 5, name: '挚友', min: 500, max: 1000 }
    ];
    
    return levels.find(l => intimacy >= l.min && intimacy < l.max) || 
           levels[levels.length - 1];
  }

  // ==================== 排行榜系统 ====================

  /**
   * 生成模拟排行榜数据
   * @param {string} type - 排行榜类型: weekly/monthly/total
   * @param {number} count - 数量
   */
  generateMockRankings(type = 'total', count = 100) {
    const rankings = [];
    const friends = Array.from(this.friends.values());
    
    // 包含好友和随机玩家
    for (let i = 0; i < count; i++) {
      let player;
      if (i < friends.length) {
        player = friends[i];
      } else {
        player = this.generateMockPlayer(i);
      }
      
      // 根据类型生成不同的分数
      let baseScore = Math.floor(Math.random() * 10000) + 1000;
      if (type === 'weekly') baseScore *= 0.3;
      if (type === 'monthly') baseScore *= 0.7;
      
      rankings.push({
        userId: player.id,
        nickname: player.nickname,
        avatar: player.avatar,
        level: player.level,
        score: Math.floor(baseScore),
        rank: i + 1,
        isFriend: i < friends.length
      });
    }

    // 按分数排序
    rankings.sort((a, b) => b.score - a.score);
    rankings.forEach((r, i) => r.rank = i + 1);

    this.rankings[type] = rankings;
    return rankings;
  }

  /**
   * 获取排行榜
   * @param {string} type - 排行榜类型: weekly/monthly/total
   * @param {number} page - 页码
   * @param {number} pageSize - 每页数量
   * @returns {Object} { rankings: RankData[], total: number, myRank: Object }
   */
  getRankings(type = 'total', page = 1, pageSize = 20) {
    let rankings = this.rankings[type];
    
    // 如果没有数据，生成模拟数据
    if (!rankings || rankings.length === 0) {
      rankings = this.generateMockRankings(type, 100);
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageData = rankings.slice(start, end);

    // 查找我的排名
    const myRank = rankings.find(r => r.userId === this.currentUser?.id) || {
      userId: this.currentUser?.id,
      nickname: this.currentUser?.nickname,
      avatar: this.currentUser?.avatar,
      score: 0,
      rank: rankings.length + 1,
      isFriend: false
    };

    return {
      rankings: pageData,
      total: rankings.length,
      page,
      pageSize,
      myRank
    };
  }

  /**
   * 获取好友排行榜（仅好友间排名）
   * @param {string} type - 排行榜类型
   * @returns {RankData[]}
   */
  getFriendRankings(type = 'total') {
    const friends = Array.from(this.friends.values());
    const rankings = friends.map((f, i) => ({
      userId: f.id,
      nickname: f.nickname,
      avatar: f.avatar,
      level: f.level,
      score: Math.floor(f.intimacy * 10 + Math.random() * 1000),
      rank: 0,
      isFriend: true,
      isOnline: f.isOnline
    }));

    rankings.sort((a, b) => b.score - a.score);
    rankings.forEach((r, i) => r.rank = i + 1);

    return rankings;
  }

  // ==================== 最近对战记录 ====================

  /**
   * 添加最近对战记录
   * @param {Object} battle - 对战记录 { opponentId, opponentName, opponentAvatar, mode, result, score, timestamp }
   */
  addRecentBattle(battle) {
    const record = {
      id: `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...battle,
      timestamp: battle.timestamp || Date.now()
    };

    this.recentBattles.unshift(record);
    
    // 限制数量
    if (this.recentBattles.length > SocialSystem.MAX_RECENT_BATTLES) {
      this.recentBattles = this.recentBattles.slice(0, SocialSystem.MAX_RECENT_BATTLES);
    }

    this.saveToStorage();
    this.emit('recentBattleAdded', { record });
  }

  /**
   * 获取最近对战记录
   * @param {number} limit - 数量限制
   * @returns {Array}
   */
  getRecentBattles(limit = 10) {
    return this.recentBattles.slice(0, limit);
  }

  /**
   * 更新对战结果
   * @param {string} recordId - 记录ID
   * @param {string} result - 结果: win/lose/draw
   * @param {Object} details - 详情
   */
  updateBattleResult(recordId, result, details = {}) {
    const record = this.recentBattles.find(r => r.id === recordId);
    if (record) {
      record.result = result;
      record.details = details;
      this.saveToStorage();
      
      this.emit('battleResultUpdated', { record });
    }
  }

  /**
   * 获取与特定玩家的对战历史
   * @param {string} opponentId - 对手ID
   * @returns {Array}
   */
  getBattleHistoryWith(opponentId) {
    return this.recentBattles.filter(r => r.opponentId === opponentId);
  }

  // ==================== 聊天系统 ====================

  /**
   * 发送消息
   * @param {string} friendId - 好友ID
   * @param {string} content - 消息内容
   * @param {string} type - 消息类型: text/system/battle/gift
   * @returns {Object} 结果
   */
  sendMessage(friendId, content, type = 'text') {
    const friend = this.friends.get(friendId);
    if (!friend) {
      return { success: false, message: '该玩家不在好友列表中' };
    }

    if (!content.trim()) {
      return { success: false, message: '消息内容不能为空' };
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: this.currentUser?.id,
      receiverId: friendId,
      content: content.trim(),
      timestamp: Date.now(),
      type,
      isRead: false
    };

    // 添加到聊天记录
    if (!this.chatHistory.has(friendId)) {
      this.chatHistory.set(friendId, []);
    }
    
    const history = this.chatHistory.get(friendId);
    history.push(message);
    
    // 限制聊天记录数量
    if (history.length > SocialSystem.MAX_CHAT_HISTORY) {
      history.shift();
    }

    this.saveToStorage();
    
    this.emit('messageSent', { message, friendId });
    
    return { success: true, message: '发送成功', data: message };
  }

  /**
   * 发送系统消息
   * @param {string} friendId - 好友ID
   * @param {string} content - 消息内容
   */
  sendSystemMessage(friendId, content) {
    return this.sendMessage(friendId, content, 'system');
  }

  /**
   * 接收消息
   * @param {Object} message - 消息对象
   */
  receiveMessage(message) {
    const friendId = message.senderId;
    
    if (!this.chatHistory.has(friendId)) {
      this.chatHistory.set(friendId, []);
    }
    
    const history = this.chatHistory.get(friendId);
    history.push(message);
    
    if (history.length > SocialSystem.MAX_CHAT_HISTORY) {
      history.shift();
    }

    this.saveToStorage();
    this.emit('messageReceived', { message, friendId });
  }

  /**
   * 标记消息已读
   * @param {string} friendId - 好友ID
   * @param {string} [messageId] - 特定消息ID，不传则标记该好友所有消息
   */
  markMessagesAsRead(friendId, messageId = null) {
    const history = this.chatHistory.get(friendId);
    if (!history) return;

    if (messageId) {
      const message = history.find(m => m.id === messageId);
      if (message) message.isRead = true;
    } else {
      history.forEach(m => {
        if (m.receiverId === this.currentUser?.id) {
          m.isRead = true;
        }
      });
    }

    this.saveToStorage();
    this.emit('messagesRead', { friendId, messageId });
  }

  /**
   * 获取聊天记录
   * @param {string} friendId - 好友ID
   * @param {number} limit - 数量限制
   * @returns {ChatMessage[]}
   */
  getChatHistory(friendId, limit = 50) {
    const history = this.chatHistory.get(friendId) || [];
    return history.slice(-limit);
  }

  /**
   * 获取未读消息数
   * @param {string} [friendId] - 特定好友ID，不传则返回总数
   * @returns {number}
   */
  getUnreadCount(friendId = null) {
    if (friendId) {
      const history = this.chatHistory.get(friendId) || [];
      return history.filter(m => m.receiverId === this.currentUser?.id && !m.isRead).length;
    }

    let total = 0;
    this.chatHistory.forEach((history, fid) => {
      total += history.filter(m => m.receiverId === this.currentUser?.id && !m.isRead).length;
    });
    return total;
  }

  /**
   * 获取最近聊天列表
   * @returns {Array} { friendId, friend, lastMessage, unreadCount }
   */
  getRecentChats() {
    const result = [];
    
    this.chatHistory.forEach((history, friendId) => {
      const friend = this.friends.get(friendId);
      if (friend && history.length > 0) {
        const lastMessage = history[history.length - 1];
        const unreadCount = history.filter(m => 
          m.receiverId === this.currentUser?.id && !m.isRead
        ).length;
        
        result.push({
          friendId,
          friend,
          lastMessage,
          unreadCount,
          lastTime: lastMessage.timestamp
        });
      }
    });

    // 按最后消息时间排序
    result.sort((a, b) => b.lastTime - a.lastTime);
    return result;
  }

  // ==================== 工具方法 ====================

  /**
   * 获取默认头像
   * @returns {string}
   */
  getDefaultAvatar() {
    const defaults = [
      'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=3'
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }

  /**
   * 生成模拟玩家
   * @param {number} index - 索引
   * @returns {Friend}
   */
  generateMockPlayer(index) {
    const names = ['冒险者', '法师', '战士', '射手', '刺客', '牧师', '骑士', '术士'];
    const name = `${names[index % names.length]}${Math.floor(Math.random() * 999) + 1}`;
    
    return {
      id: `mock_${index}`,
      nickname: name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
      level: Math.floor(Math.random() * 50) + 1,
      isOnline: Math.random() > 0.5,
      lastLogin: Date.now() - Math.floor(Math.random() * 86400000),
      intimacy: 0
    };
  }

  /**
   * 格式化时间
   * @param {number} timestamp - 时间戳
   * @returns {string}
   */
  formatTime(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`;
    
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  /**
   * 格式化在线状态
   * @param {boolean} isOnline - 是否在线
   * @param {number} lastLogin - 最后登录时间
   * @returns {string}
   */
  formatOnlineStatus(isOnline, lastLogin) {
    if (isOnline) return '在线';
    return `离线 · ${this.formatTime(lastLogin)}`;
  }

  /**
   * 获取完整状态
   * @returns {Object}
   */
  getStatus() {
    return {
      friends: this.getFriendStats(),
      unreadMessages: this.getUnreadCount(),
      unreadGifts: this.getUnreadGifts().length,
      pendingRequests: this.getPendingRequests().length,
      pendingBattles: this.getPendingBattleInvites().length
    };
  }

  // ==================== 数据导入/导出 ====================

  /**
   * 导出所有社交数据
   * @returns {Object}
   */
  exportData() {
    return {
      friends: Array.from(this.friends.entries()),
      chatHistory: Array.from(this.chatHistory.entries()),
      giftRecords: this.giftRecords,
      recentBattles: this.recentBattles,
      exportedAt: Date.now()
    };
  }

  /**
   * 导入社交数据
   * @param {Object} data - 导出的数据
   * @returns {boolean}
   */
  importData(data) {
    try {
      if (data.friends) {
        this.friends = new Map(data.friends);
      }
      if (data.chatHistory) {
        this.chatHistory = new Map(data.chatHistory);
      }
      if (data.giftRecords) {
        this.giftRecords = data.giftRecords;
      }
      if (data.recentBattles) {
        this.recentBattles = data.recentBattles;
      }
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }

  /**
   * 清空所有数据
   */
  clearAllData() {
    this.friends.clear();
    this.friendRequests.clear();
    this.battleInvites.clear();
    this.giftRecords = [];
    this.chatHistory.clear();
    this.recentBattles = [];
    this.rankings = { weekly: [], monthly: [], total: [] };
    this.saveToStorage();
    this.emit('dataCleared', {});
  }
}

// ==================== 导出 ====================

// ES6 模块导出
export { SocialSystem };

// CommonJS 兼容
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SocialSystem };
}

// 浏览器全局变量
if (typeof window !== 'undefined') {
  window.SocialSystem = SocialSystem;
}

// ==================== 使用示例 ====================

/*
// 初始化社交系统
const social = new SocialSystem();
social.init({
  id: 'user_001',
  nickname: '金蛇玩家',
  avatar: 'https://example.com/avatar.png'
});

// 添加好友
social.addFriend({
  id: 'friend_001',
  nickname: '命运勇者',
  avatar: 'https://example.com/friend1.png',
  level: 25
});

// 搜索好友
const onlineFriends = social.searchFriends('', { onlineOnly: true });

// 发送对战邀请
social.sendBattleInvite('friend_001', { mode: '1v1', mapId: 'tower_01' });

// 发送礼物
social.sendGift('friend_001', { type: 'coin', amount: 500 });

// 发送消息
social.sendMessage('friend_001', '来一局对战吗？');

// 获取排行榜
const rankings = social.getRankings('total', 1, 20);

// 监听事件
social.on('friendStatusChanged', ({ friendId, isOnline }) => {
  console.log(`好友 ${friendId} ${isOnline ? '上线' : '下线'}了`);
});

social.on('messageReceived', ({ message }) => {
  console.log(`收到消息: ${message.content}`);
});

social.on('battleInviteReceived', ({ invite }) => {
  console.log(`收到对战邀请来自: ${invite.fromName}`);
});
*/

console.log('🐍 命运塔社交系统模块已加载 - Tower of Fate Social System v1.0.0');
