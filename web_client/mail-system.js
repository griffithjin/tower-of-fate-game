/**
 * 命运塔 - 邮件/公告系统模块
 * @author 小金蛇 🐍
 * @description 游戏核心功能模块，管理邮件和公告
 */

// ==================== 常量定义 ====================

const MailType = Object.freeze({
  SYSTEM: 'system',      // 系统邮件（维护通知、更新公告）
  REWARD: 'reward',      // 奖励邮件（活动奖励、补偿奖励）
  FRIEND: 'friend',      // 好友邮件（好友邀请、礼物）
  MATCH: 'match'         // 比赛邮件（比赛结果、排名奖励）
});

const MailStatus = Object.freeze({
  UNREAD: 'unread',      // 未读
  READ: 'read',          // 已读
  CLAIMED: 'claimed'     // 已领取
});

const AttachmentType = Object.freeze({
  GOLD: 'gold',          // 金币
  DIAMOND: 'diamond',    // 钻石
  ITEM: 'item'           // 道具
});

const STORAGE_KEY = 'tower_of_fate_mail_system';

// ==================== 邮件数据模型 ====================

/**
 * 邮件类
 */
class Mail {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.type = data.type || MailType.SYSTEM;
    this.title = data.title || '';
    this.content = data.content || '';
    this.attachments = data.attachments || []; // [{ type, id, quantity, name, icon }]
    this.isRead = data.isRead ?? false;
    this.isClaimed = data.isClaimed ?? false;
    this.createTime = data.createTime || Date.now();
    this.expireTime = data.expireTime || this.getDefaultExpireTime();
    this.sender = data.sender || this.getDefaultSender();
    this.priority = data.priority || 0; // 优先级，用于排序
  }

  generateId() {
    return `mail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getDefaultExpireTime() {
    // 默认30天过期
    return Date.now() + 30 * 24 * 60 * 60 * 1000;
  }

  getDefaultSender() {
    const senderMap = {
      [MailType.SYSTEM]: '系统管理员',
      [MailType.REWARD]: '奖励中心',
      [MailType.FRIEND]: '好友系统',
      [MailType.MATCH]: '比赛系统'
    };
    return senderMap[this.type] || '命运塔';
  }

  /**
   * 获取邮件状态
   */
  getStatus() {
    if (this.isClaimed) return MailStatus.CLAIMED;
    if (this.isRead) return MailStatus.READ;
    return MailStatus.UNREAD;
  }

  /**
   * 是否有附件
   */
  hasAttachments() {
    return this.attachments && this.attachments.length > 0;
  }

  /**
   * 是否已过期
   */
  isExpired() {
    return Date.now() > this.expireTime;
  }

  /**
   * 获取剩余时间（毫秒）
   */
  getRemainingTime() {
    return Math.max(0, this.expireTime - Date.now());
  }

  /**
   * 获取剩余时间文本
   */
  getRemainingTimeText() {
    const remaining = this.getRemainingTime();
    if (remaining <= 0) return '已过期';
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    if (days > 0) return `${days}天后过期`;
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    if (hours > 0) return `${hours}小时后过期`;
    
    const minutes = Math.floor(remaining / (60 * 1000));
    return `${minutes}分钟后过期`;
  }

  /**
   * 标记为已读
   */
  markAsRead() {
    this.isRead = true;
  }

  /**
   * 标记为已领取
   */
  markAsClaimed() {
    this.isClaimed = true;
    this.isRead = true;
  }

  /**
   * 序列化
   */
  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      content: this.content,
      attachments: this.attachments,
      isRead: this.isRead,
      isClaimed: this.isClaimed,
      createTime: this.createTime,
      expireTime: this.expireTime,
      sender: this.sender,
      priority: this.priority
    };
  }

  /**
   * 从JSON创建
   */
  static fromJSON(json) {
    return new Mail(json);
  }
}

/**
 * 公告类
 */
class Announcement {
  constructor(data = {}) {
    this.id = data.id || this.generateId();
    this.title = data.title || '';
    this.content = data.content || '';
    this.type = data.type || 'normal'; // normal, urgent, update, event
    this.priority = data.priority || 0;
    this.startTime = data.startTime || Date.now();
    this.endTime = data.endTime || null;
    this.imageUrl = data.imageUrl || null;
    this.link = data.link || null;
    this.createTime = data.createTime || Date.now();
  }

  generateId() {
    return `announce_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 是否有效（在展示时间内）
   */
  isActive() {
    const now = Date.now();
    if (now < this.startTime) return false;
    if (this.endTime && now > this.endTime) return false;
    return true;
  }

  /**
   * 序列化
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      type: this.type,
      priority: this.priority,
      startTime: this.startTime,
      endTime: this.endTime,
      imageUrl: this.imageUrl,
      link: this.link,
      createTime: this.createTime
    };
  }

  static fromJSON(json) {
    return new Announcement(json);
  }
}

// ==================== 邮件系统核心类 ====================

/**
 * 邮件系统管理器
 */
class MailSystem {
  constructor() {
    this.mails = new Map(); // Map<id, Mail>
    this.announcements = new Map(); // Map<id, Announcement>
    this.listeners = new Set(); // 事件监听器
    this.autoCleanInterval = null;
    
    // 从本地存储加载数据
    this.loadFromStorage();
    
    // 启动自动清理
    this.startAutoClean();
  }

  // ==================== 事件系统 ====================

  /**
   * 添加事件监听器
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * 移除事件监听器
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    this.listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (e) {
        console.error('邮件系统事件监听器错误:', e);
      }
    });
  }

  // ==================== 邮件管理 ====================

  /**
   * 添加新邮件
   * @param {Object} mailData 邮件数据
   * @returns {Mail} 创建的邮件
   */
  addMail(mailData) {
    const mail = new Mail(mailData);
    this.mails.set(mail.id, mail);
    this.saveToStorage();
    this.emit('mail:new', mail);
    return mail;
  }

  /**
   * 获取邮件
   */
  getMail(id) {
    return this.mails.get(id);
  }

  /**
   * 获取所有邮件（按创建时间倒序）
   */
  getAllMails() {
    return Array.from(this.mails.values())
      .sort((a, b) => b.createTime - a.createTime);
  }

  /**
   * 按类型获取邮件
   */
  getMailsByType(type) {
    return this.getAllMails().filter(mail => mail.type === type);
  }

  /**
   * 获取未读邮件
   */
  getUnreadMails() {
    return this.getAllMails().filter(mail => !mail.isRead && !mail.isExpired());
  }

  /**
   * 获取有附件未领取的邮件
   */
  getUnclaimedMails() {
    return this.getAllMails().filter(mail => 
      mail.hasAttachments() && !mail.isClaimed && !mail.isExpired()
    );
  }

  /**
   * 获取邮件统计
   */
  getStats() {
    const all = this.getAllMails().filter(m => !m.isExpired());
    return {
      total: all.length,
      unread: all.filter(m => !m.isRead).length,
      unclaimed: all.filter(m => m.hasAttachments() && !m.isClaimed).length,
      expired: this.getAllMails().filter(m => m.isExpired()).length
    };
  }

  /**
   * 标记邮件为已读
   */
  markAsRead(id) {
    const mail = this.mails.get(id);
    if (!mail) return false;
    
    if (!mail.isRead) {
      mail.markAsRead();
      this.saveToStorage();
      this.emit('mail:read', mail);
    }
    return true;
  }

  /**
   * 领取邮件附件
   * @returns {Object} 领取结果 { success, attachments, mail }
   */
  claimAttachments(id) {
    const mail = this.mails.get(id);
    if (!mail) {
      return { success: false, error: '邮件不存在' };
    }
    
    if (mail.isExpired()) {
      return { success: false, error: '邮件已过期' };
    }
    
    if (!mail.hasAttachments()) {
      return { success: false, error: '没有附件' };
    }
    
    if (mail.isClaimed) {
      return { success: false, error: '附件已领取' };
    }

    // 执行领取操作
    const attachments = mail.attachments;
    
    // 这里可以调用游戏资源管理器来实际发放奖励
    this.emit('mail:claiming', { mail, attachments });
    
    // 标记为已领取
    mail.markAsClaimed();
    this.saveToStorage();
    
    this.emit('mail:claimed', { mail, attachments });
    
    return { 
      success: true, 
      attachments: attachments,
      mail: mail 
    };
  }

  /**
   * 一键领取所有附件
   * @returns {Object} 领取结果 { success, totalAttachments, claimed, failed, details }
   */
  claimAllAttachments() {
    const unclaimed = this.getUnclaimedMails();
    const result = {
      success: true,
      totalAttachments: 0,
      claimed: 0,
      failed: 0,
      details: [],
      rewards: {} // 按类型汇总 { gold: 100, diamond: 50, items: [...] }
    };

    for (const mail of unclaimed) {
      const claimResult = this.claimAttachments(mail.id);
      if (claimResult.success) {
        result.claimed++;
        result.totalAttachments += claimResult.attachments.length;
        
        // 汇总奖励
        for (const att of claimResult.attachments) {
          if (att.type === AttachmentType.GOLD) {
            result.rewards.gold = (result.rewards.gold || 0) + (att.quantity || 0);
          } else if (att.type === AttachmentType.DIAMOND) {
            result.rewards.diamond = (result.rewards.diamond || 0) + (att.quantity || 0);
          } else {
            if (!result.rewards.items) result.rewards.items = [];
            result.rewards.items.push(att);
          }
        }
        
        result.details.push({ mailId: mail.id, success: true });
      } else {
        result.failed++;
        result.details.push({ 
          mailId: mail.id, 
          success: false, 
          error: claimResult.error 
        });
      }
    }

    this.emit('mail:claimAll', result);
    return result;
  }

  /**
   * 删除邮件
   */
  deleteMail(id) {
    const mail = this.mails.get(id);
    if (!mail) return false;
    
    this.mails.delete(id);
    this.saveToStorage();
    this.emit('mail:deleted', mail);
    return true;
  }

  /**
   * 批量删除邮件
   */
  deleteMails(ids) {
    const result = { success: [], failed: [] };
    for (const id of ids) {
      if (this.deleteMail(id)) {
        result.success.push(id);
      } else {
        result.failed.push(id);
      }
    }
    this.emit('mail:batchDeleted', result);
    return result;
  }

  /**
   * 删除所有已读且已领取/无附件的邮件
   */
  deleteAllReadMails() {
    const toDelete = this.getAllMails().filter(mail => {
      if (!mail.isRead) return false;
      if (mail.hasAttachments() && !mail.isClaimed) return false;
      return true;
    });
    
    return this.deleteMails(toDelete.map(m => m.id));
  }

  /**
   * 清理过期邮件
   */
  cleanExpiredMails() {
    const expired = this.getAllMails().filter(mail => mail.isExpired());
    const result = this.deleteMails(expired.map(m => m.id));
    
    if (result.success.length > 0) {
      this.emit('mail:expiredCleaned', result.success.length);
    }
    
    return result;
  }

  // ==================== 公告管理 ====================

  /**
   * 添加公告
   */
  addAnnouncement(data) {
    const announcement = new Announcement(data);
    this.announcements.set(announcement.id, announcement);
    this.saveToStorage();
    this.emit('announcement:new', announcement);
    return announcement;
  }

  /**
   * 获取所有公告（按优先级和时间排序）
   */
  getAllAnnouncements() {
    return Array.from(this.announcements.values())
      .sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority;
        return b.createTime - a.createTime;
      });
  }

  /**
   * 获取当前有效的公告
   */
  getActiveAnnouncements() {
    return this.getAllAnnouncements().filter(a => a.isActive());
  }

  /**
   * 获取轮播公告（登录页顶部使用）
   */
  getCarouselAnnouncements(limit = 5) {
    return this.getActiveAnnouncements()
      .filter(a => a.priority >= 0)
      .slice(0, limit);
  }

  /**
   * 获取公告详情
   */
  getAnnouncement(id) {
    return this.announcements.get(id);
  }

  /**
   * 删除公告
   */
  deleteAnnouncement(id) {
    const ann = this.announcements.get(id);
    if (!ann) return false;
    
    this.announcements.delete(id);
    this.saveToStorage();
    this.emit('announcement:deleted', ann);
    return true;
  }

  /**
   * 清理过期公告
   */
  cleanExpiredAnnouncements() {
    const expired = Array.from(this.announcements.values())
      .filter(a => !a.isActive());
    
    for (const ann of expired) {
      this.announcements.delete(ann.id);
    }
    
    if (expired.length > 0) {
      this.saveToStorage();
      this.emit('announcement:expiredCleaned', expired.length);
    }
    
    return expired.length;
  }

  // ==================== 数据持久化 ====================

  /**
   * 保存到本地存储
   */
  saveToStorage() {
    try {
      const data = {
        mails: Array.from(this.mails.values()).map(m => m.toJSON()),
        announcements: Array.from(this.announcements.values()).map(a => a.toJSON()),
        lastSaveTime: Date.now()
      };
      
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.error('保存邮件数据失败:', e);
    }
  }

  /**
   * 从本地存储加载
   */
  loadFromStorage() {
    try {
      if (typeof localStorage === 'undefined') return;
      
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return;
      
      const parsed = JSON.parse(data);
      
      // 加载邮件
      if (parsed.mails) {
        for (const mailData of parsed.mails) {
          const mail = Mail.fromJSON(mailData);
          this.mails.set(mail.id, mail);
        }
      }
      
      // 加载公告
      if (parsed.announcements) {
        for (const annData of parsed.announcements) {
          const ann = Announcement.fromJSON(annData);
          this.announcements.set(ann.id, ann);
        }
      }
      
      this.emit('system:loaded', { 
        mailCount: this.mails.size, 
        announcementCount: this.announcements.size 
      });
    } catch (e) {
      console.error('加载邮件数据失败:', e);
    }
  }

  /**
   * 清空所有数据
   */
  clearAll() {
    this.mails.clear();
    this.announcements.clear();
    this.saveToStorage();
    this.emit('system:cleared');
  }

  // ==================== 自动清理 ====================

  /**
   * 启动自动清理（每10分钟检查一次）
   */
  startAutoClean(interval = 10 * 60 * 1000) {
    this.stopAutoClean();
    this.autoCleanInterval = setInterval(() => {
      this.cleanExpiredMails();
      this.cleanExpiredAnnouncements();
    }, interval);
  }

  /**
   * 停止自动清理
   */
  stopAutoClean() {
    if (this.autoCleanInterval) {
      clearInterval(this.autoCleanInterval);
      this.autoCleanInterval = null;
    }
  }

  // ==================== 测试数据 ====================

  /**
   * 生成测试数据
   */
  generateTestData() {
    // 系统邮件
    this.addMail({
      type: MailType.SYSTEM,
      title: '🎮 命运塔维护公告',
      content: '亲爱的冒险者，命运塔将于今晚24:00-次日02:00进行例行维护。维护期间将无法登录游戏，请提前做好准备。维护完成后将发放维护补偿，感谢您的理解与支持！',
      sender: '系统管理员',
      priority: 10
    });

    // 奖励邮件
    this.addMail({
      type: MailType.REWARD,
      title: '🎁 每日登录奖励',
      content: '恭喜您完成今日登录！这是您的登录奖励，请及时领取。连续登录可获得更多奖励哦！',
      attachments: [
        { type: AttachmentType.GOLD, id: 'gold', quantity: 500, name: '金币', icon: '💰' },
        { type: AttachmentType.DIAMOND, id: 'diamond', quantity: 50, name: '钻石', icon: '💎' }
      ],
      sender: '奖励中心',
      priority: 5
    });

    // 好友邮件
    this.addMail({
      type: MailType.FRIEND,
      title: '🤝 好友邀请',
      content: '玩家【勇者小明】邀请您成为好友！接受邀请后可互相赠送体力，组队挑战副本！',
      sender: '勇者小明',
      priority: 3
    });

    // 比赛邮件
    this.addMail({
      type: MailType.MATCH,
      title: '🏆 赛季排名奖励',
      content: '恭喜您在第3赛季中获得第5名的优异成绩！这是您的赛季排名奖励，感谢您一路以来的精彩表现！',
      attachments: [
        { type: AttachmentType.DIAMOND, id: 'diamond', quantity: 500, name: '钻石', icon: '💎' },
        { type: AttachmentType.ITEM, id: 'legendary_chest', quantity: 1, name: '传说宝箱', icon: '🎁' }
      ],
      sender: '比赛系统',
      priority: 8
    });

    // 补偿奖励
    this.addMail({
      type: MailType.REWARD,
      title: '🙏 服务器异常补偿',
      content: '由于昨日服务器出现异常，部分玩家游戏受到影响。为此我们深表歉意，并准备了补偿礼包，请查收。',
      attachments: [
        { type: AttachmentType.GOLD, id: 'gold', quantity: 2000, name: '金币', icon: '💰' },
        { type: AttachmentType.DIAMOND, id: 'diamond', quantity: 200, name: '钻石', icon: '💎' },
        { type: AttachmentType.ITEM, id: 'energy_potion', quantity: 5, name: '体力药水', icon: '🧪' }
      ],
      sender: '运营团队',
      priority: 10
    });

    // 公告
    this.addAnnouncement({
      title: '🎉 命运塔新版本上线！',
      content: '全新版本「命运之轮」正式上线！新增10层挑战塔、3个新英雄、赛季通行证系统。快来体验吧！',
      type: 'update',
      priority: 100,
      link: '/news/version-update'
    });

    this.addAnnouncement({
      title: '⚔️ 本周限时活动：屠龙之战',
      content: '参与屠龙之战活动，击败世界BOSS获得限定称号和传说装备！活动时间：本周五至周日。',
      type: 'event',
      priority: 80,
      link: '/events/dragon-slayer'
    });

    this.addAnnouncement({
      title: '💎 充值返利活动开启',
      content: '充值即享双倍返利，更有机会获得限定皮肤！活动时间有限，不要错过！',
      type: 'normal',
      priority: 60
    });

    return this.getStats();
  }
}

// ==================== UI 渲染类 ====================

/**
 * 邮件系统UI渲染器
 */
class MailSystemRenderer {
  constructor(mailSystem, containerId) {
    this.mailSystem = mailSystem;
    this.container = document.getElementById(containerId);
    this.currentFilter = 'all'; // all, system, reward, friend, match
    this.onClaimCallback = null;
    this.onDeleteCallback = null;
    
    this.init();
  }

  init() {
    if (!this.container) {
      console.error('邮件系统容器不存在:', this.container);
      return;
    }
    
    this.render();
    this.bindEvents();
  }

  /**
   * 设置附件领取回调
   */
  onClaim(callback) {
    this.onClaimCallback = callback;
  }

  /**
   * 设置删除回调
   */
  onDelete(callback) {
    this.onDeleteCallback = callback;
  }

  /**
   * 渲染整个邮件系统界面
   */
  render() {
    if (!this.container) return;
    
    this.container.innerHTML = `
      <div class="mail-system">
        ${this.renderHeader()}
        ${this.renderTabs()}
        ${this.renderMailList()}
        ${this.renderFooter()}
      </div>
    `;
    
    this.bindEvents();
  }

  /**
   * 渲染头部统计
   */
  renderHeader() {
    const stats = this.mailSystem.getStats();
    return `
      <div class="mail-header">
        <div class="mail-title">
          <span class="mail-icon">📧</span>
          <span>邮件中心</span>
          ${stats.unread > 0 ? `<span class="mail-badge">${stats.unread}</span>` : ''}
        </div>
        <div class="mail-stats">
          <span>总计: ${stats.total}</span>
          ${stats.unread > 0 ? `<span class="stat-unread">未读: ${stats.unread}</span>` : ''}
          ${stats.unclaimed > 0 ? `<span class="stat-unclaimed">未领: ${stats.unclaimed}</span>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * 渲染标签页
   */
  renderTabs() {
    const tabs = [
      { key: 'all', label: '全部' },
      { key: 'unread', label: '未读' },
      { key: 'system', label: '系统' },
      { key: 'reward', label: '奖励' },
      { key: 'friend', label: '好友' },
      { key: 'match', label: '比赛' }
    ];
    
    return `
      <div class="mail-tabs">
        ${tabs.map(tab => `
          <button class="mail-tab ${this.currentFilter === tab.key ? 'active' : ''}" 
                  data-filter="${tab.key}">
            ${tab.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  /**
   * 渲染邮件列表
   */
  renderMailList() {
    let mails = this.getFilteredMails();
    
    if (mails.length === 0) {
      return `
        <div class="mail-list empty">
          <div class="empty-icon">📭</div>
          <div class="empty-text">暂无邮件</div>
        </div>
      `;
    }
    
    return `
      <div class="mail-list">
        ${mails.map(mail => this.renderMailItem(mail)).join('')}
      </div>
    `;
  }

  /**
   * 渲染单个邮件项
   */
  renderMailItem(mail) {
    const typeIcons = {
      [MailType.SYSTEM]: '⚙️',
      [MailType.REWARD]: '🎁',
      [MailType.FRIEND]: '🤝',
      [MailType.MATCH]: '🏆'
    };
    
    const typeLabels = {
      [MailType.SYSTEM]: '系统',
      [MailType.REWARD]: '奖励',
      [MailType.FRIEND]: '好友',
      [MailType.MATCH]: '比赛'
    };
    
    const hasAttachments = mail.hasAttachments();
    const showClaimBtn = hasAttachments && !mail.isClaimed && !mail.isExpired();
    const showAttachmentIcon = hasAttachments && !mail.isClaimed;
    
    return `
      <div class="mail-item ${mail.isRead ? 'read' : 'unread'} ${mail.isExpired() ? 'expired' : ''}" 
           data-id="${mail.id}">
        <div class="mail-item-icon">${typeIcons[mail.type] || '📧'}</div>
        <div class="mail-item-content">
          <div class="mail-item-header">
            <span class="mail-type-badge">${typeLabels[mail.type]}</span>
            <span class="mail-item-title">${mail.title}</span>
            ${!mail.isRead ? '<span class="unread-dot"></span>' : ''}
            ${showAttachmentIcon ? '<span class="attachment-icon">📎</span>' : ''}
          </div>
          <div class="mail-item-preview">${mail.content.substring(0, 50)}...</div>
          <div class="mail-item-meta">
            <span class="mail-sender">${mail.sender}</span>
            <span class="mail-time">${this.formatTime(mail.createTime)}</span>
            <span class="mail-expire">${mail.getRemainingTimeText()}</span>
          </div>
        </div>
        <div class="mail-item-actions">
          ${showClaimBtn ? `<button class="btn-claim" data-action="claim" data-id="${mail.id}">领取</button>` : ''}
          <button class="btn-delete" data-action="delete" data-id="${mail.id}">删除</button>
        </div>
      </div>
    `;
  }

  /**
   * 渲染底部操作栏
   */
  renderFooter() {
    const hasUnclaimed = this.mailSystem.getUnclaimedMails().length > 0;
    
    return `
      <div class="mail-footer">
        ${hasUnclaimed ? `<button class="btn-claim-all" data-action="claim-all">一键领取全部</button>` : ''}
        <button class="btn-delete-read" data-action="delete-read">删除已读</button>
        <button class="btn-close" data-action="close">关闭</button>
      </div>
    `;
  }

  /**
   * 获取过滤后的邮件
   */
  getFilteredMails() {
    switch (this.currentFilter) {
      case 'unread':
        return this.mailSystem.getUnreadMails();
      case 'system':
      case 'reward':
      case 'friend':
      case 'match':
        return this.mailSystem.getMailsByType(this.currentFilter);
      default:
        return this.mailSystem.getAllMails();
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    if (!this.container) return;
    
    // 标签切换
    this.container.querySelectorAll('.mail-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.currentFilter = e.target.dataset.filter;
        this.render();
      });
    });
    
    // 邮件项点击
    this.container.querySelectorAll('.mail-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.mail-item-actions')) return;
        const id = item.dataset.id;
        this.showMailDetail(id);
      });
    });
    
    // 按钮事件
    this.container.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.target.dataset.action;
        const id = e.target.dataset.id;
        
        switch (action) {
          case 'claim':
            this.handleClaim(id);
            break;
          case 'claim-all':
            this.handleClaimAll();
            break;
          case 'delete':
            this.handleDelete(id);
            break;
          case 'delete-read':
            this.handleDeleteRead();
            break;
          case 'close':
            this.close();
            break;
        }
      });
    });
  }

  /**
   * 显示邮件详情
   */
  showMailDetail(id) {
    const mail = this.mailSystem.getMail(id);
    if (!mail) return;
    
    // 标记为已读
    this.mailSystem.markAsRead(id);
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.className = 'mail-modal';
    modal.innerHTML = `
      <div class="mail-modal-overlay"></div>
      <div class="mail-modal-content">
        <div class="mail-modal-header">
          <h3>${mail.title}</h3>
          <button class="btn-close-modal">&times;</button>
        </div>
        <div class="mail-modal-body">
          <div class="mail-meta">
            <span>发送者: ${mail.sender}</span>
            <span>时间: ${this.formatTime(mail.createTime)}</span>
          </div>
          <div class="mail-content">${mail.content}</div>
          ${this.renderAttachments(mail)}
        </div>
        <div class="mail-modal-footer">
          ${mail.hasAttachments() && !mail.isClaimed && !mail.isExpired() 
            ? `<button class="btn-claim-modal" data-id="${mail.id}">领取附件</button>` 
            : ''}
          <button class="btn-close-modal-text">关闭</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // 绑定关闭事件
    modal.querySelectorAll('.btn-close-modal, .btn-close-modal-text, .mail-modal-overlay').forEach(el => {
      el.addEventListener('click', () => {
        modal.remove();
        this.render(); // 刷新列表
      });
    });
    
    // 绑定领取事件
    const claimBtn = modal.querySelector('.btn-claim-modal');
    if (claimBtn) {
      claimBtn.addEventListener('click', () => {
        this.handleClaim(id);
        modal.remove();
        this.render();
      });
    }
    
    this.render();
  }

  /**
   * 渲染附件
   */
  renderAttachments(mail) {
    if (!mail.hasAttachments()) return '';
    
    const claimedClass = mail.isClaimed ? 'claimed' : '';
    
    return `
      <div class="mail-attachments ${claimedClass}">
        <h4>附件 ${mail.isClaimed ? '(已领取)' : ''}</h4>
        <div class="attachment-list">
          ${mail.attachments.map(att => `
            <div class="attachment-item ${att.type}">
              <span class="attachment-icon">${att.icon || '📦'}</span>
              <span class="attachment-name">${att.name}</span>
              ${att.quantity > 1 ? `<span class="attachment-quantity">x${att.quantity}</span>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 处理领取
   */
  handleClaim(id) {
    const result = this.mailSystem.claimAttachments(id);
    if (result.success) {
      if (this.onClaimCallback) {
        this.onClaimCallback(result);
      }
      this.showToast('领取成功！');
    } else {
      this.showToast(result.error || '领取失败', 'error');
    }
    this.render();
  }

  /**
   * 处理一键领取
   */
  handleClaimAll() {
    const result = this.mailSystem.claimAllAttachments();
    if (result.claimed > 0) {
      if (this.onClaimCallback) {
        this.onClaimCallback(result);
      }
      
      let rewardText = '';
      if (result.rewards.gold) rewardText += `${result.rewards.gold}金币 `;
      if (result.rewards.diamond) rewardText += `${result.rewards.diamond}钻石 `;
      
      this.showToast(`成功领取 ${result.claimed} 封邮件！${rewardText}`);
    } else {
      this.showToast('没有可领取的附件');
    }
    this.render();
  }

  /**
   * 处理删除
   */
  handleDelete(id) {
    if (confirm('确定要删除这封邮件吗？')) {
      const mail = this.mailSystem.getMail(id);
      this.mailSystem.deleteMail(id);
      if (this.onDeleteCallback) {
        this.onDeleteCallback(mail);
      }
      this.showToast('已删除');
      this.render();
    }
  }

  /**
   * 处理删除已读
   */
  handleDeleteRead() {
    const result = this.mailSystem.deleteAllReadMails();
    if (result.success.length > 0) {
      this.showToast(`已删除 ${result.success.length} 封已读邮件`);
      this.render();
    } else {
      this.showToast('没有可删除的已读邮件');
    }
  }

  /**
   * 显示公告轮播（用于登录页顶部）
   */
  renderAnnouncementCarousel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const announcements = this.mailSystem.getCarouselAnnouncements();
    if (announcements.length === 0) {
      container.style.display = 'none';
      return;
    }
    
    let currentIndex = 0;
    
    const renderCurrent = () => {
      const ann = announcements[currentIndex];
      container.innerHTML = `
        <div class="announcement-carousel">
          <span class="announcement-icon">📢</span>
          <span class="announcement-title">${ann.title}</span>
          ${ann.link ? `<a href="${ann.link}" class="announcement-link">查看详情</a>` : ''}
          <span class="announcement-more" data-action="show-all-announcements">更多</span>
        </div>
      `;
      
      // 点击查看所有公告
      container.querySelector('[data-action="show-all-announcements"]')?.addEventListener('click', () => {
        this.showAllAnnouncements();
      });
    };
    
    renderCurrent();
    
    // 自动轮播
    setInterval(() => {
      currentIndex = (currentIndex + 1) % announcements.length;
      renderCurrent();
    }, 5000);
  }

  /**
   * 显示所有公告弹窗
   */
  showAllAnnouncements() {
    const announcements = this.mailSystem.getActiveAnnouncements();
    
    const modal = document.createElement('div');
    modal.className = 'announcement-modal';
    modal.innerHTML = `
      <div class="announcement-modal-overlay"></div>
      <div class="announcement-modal-content">
        <div class="announcement-modal-header">
          <h3>📢 系统公告</h3>
          <button class="btn-close-modal">&times;</button>
        </div>
        <div class="announcement-list">
          ${announcements.map(ann => `
            <div class="announcement-item ${ann.type}">
              <div class="announcement-item-title">${ann.title}</div>
              <div class="announcement-item-content">${ann.content}</div>
              ${ann.link ? `<a href="${ann.link}" class="announcement-item-link">查看详情 →</a>` : ''}
              <div class="announcement-item-time">${this.formatTime(ann.createTime)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelectorAll('.btn-close-modal, .announcement-modal-overlay').forEach(el => {
      el.addEventListener('click', () => modal.remove());
    });
  }

  /**
   * 显示提示
   */
  showToast(message, type = 'success') {
    // 简单的toast实现，实际项目中可以使用更复杂的UI库
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 小于1分钟
    if (diff < 60 * 1000) return '刚刚';
    
    // 小于1小时
    if (diff < 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 1000))}分钟前`;
    }
    
    // 小于24小时
    if (diff < 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (60 * 60 * 1000))}小时前`;
    }
    
    // 小于7天
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`;
    }
    
    // 超过7天显示具体日期
    return date.toLocaleDateString('zh-CN');
  }

  /**
   * 关闭邮件系统
   */
  close() {
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * 打开邮件系统
   */
  open() {
    if (this.container) {
      this.container.style.display = 'block';
      this.render();
    }
  }
}

// ==================== CSS 样式 ====================

const mailSystemStyles = `
/* 邮件系统基础样式 */
.mail-system {
  background: #1a1a2e;
  border-radius: 12px;
  overflow: hidden;
  color: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
}

/* 头部 */
.mail-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mail-title {
  font-size: 18px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
}

.mail-icon {
  font-size: 24px;
}

.mail-badge {
  background: #ff4757;
  color: white;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
}

.mail-stats {
  display: flex;
  gap: 12px;
  font-size: 12px;
}

.stat-unread {
  color: #ff6b6b;
}

.stat-unclaimed {
  color: #feca57;
}

/* 标签页 */
.mail-tabs {
  display: flex;
  background: #16213e;
  border-bottom: 1px solid #0f3460;
  overflow-x: auto;
}

.mail-tab {
  flex: 1;
  padding: 12px 8px;
  background: none;
  border: none;
  color: #a0a0a0;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.mail-tab:hover {
  color: #fff;
  background: rgba(255,255,255,0.05);
}

.mail-tab.active {
  color: #fff;
  border-bottom: 2px solid #667eea;
  background: rgba(102, 126, 234, 0.1);
}

/* 邮件列表 */
.mail-list {
  max-height: 400px;
  overflow-y: auto;
}

.mail-list.empty {
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  color: #888;
}

.mail-item {
  display: flex;
  padding: 12px 16px;
  border-bottom: 1px solid #0f3460;
  cursor: pointer;
  transition: background 0.2s;
  align-items: flex-start;
}

.mail-item:hover {
  background: rgba(255,255,255,0.05);
}

.mail-item.unread {
  background: rgba(102, 126, 234, 0.05);
}

.mail-item.expired {
  opacity: 0.6;
}

.mail-item-icon {
  font-size: 24px;
  margin-right: 12px;
  flex-shrink: 0;
}

.mail-item-content {
  flex: 1;
  min-width: 0;
}

.mail-item-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.mail-type-badge {
  background: #667eea;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.mail-item-title {
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #ff4757;
  border-radius: 50%;
  flex-shrink: 0;
}

.attachment-icon {
  font-size: 14px;
}

.mail-item-preview {
  color: #888;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}

.mail-item-meta {
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #666;
}

.mail-expire {
  color: #ff6b6b;
}

.mail-item-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-left: 8px;
}

.btn-claim {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-claim:hover {
  transform: scale(1.05);
}

.btn-delete {
  background: transparent;
  border: 1px solid #666;
  color: #888;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 11px;
  cursor: pointer;
}

.btn-delete:hover {
  border-color: #ff4757;
  color: #ff4757;
}

/* 底部 */
.mail-footer {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #16213e;
  border-top: 1px solid #0f3460;
}

.btn-claim-all {
  flex: 1;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: transform 0.2s;
}

.btn-claim-all:hover {
  transform: scale(1.02);
}

.btn-delete-read,
.btn-close {
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #666;
  background: transparent;
  color: #888;
}

.btn-delete-read:hover,
.btn-close:hover {
  border-color: #fff;
  color: #fff;
}

/* 邮件详情弹窗 */
.mail-modal,
.announcement-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mail-modal-overlay,
.announcement-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
}

.mail-modal-content,
.announcement-modal-content {
  position: relative;
  background: #1a1a2e;
  border-radius: 16px;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  z-index: 1;
  width: 90%;
}

.mail-modal-header,
.announcement-modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mail-modal-header h3,
.announcement-modal-header h3 {
  margin: 0;
  font-size: 16px;
}

.btn-close-modal {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
}

.mail-modal-body {
  padding: 20px;
  max-height: 50vh;
  overflow-y: auto;
}

.mail-meta {
  display: flex;
  gap: 16px;
  color: #888;
  font-size: 12px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #0f3460;
}

.mail-content {
  line-height: 1.8;
  color: #e0e0e0;
  white-space: pre-wrap;
}

.mail-attachments {
  margin-top: 20px;
  padding: 16px;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  border: 1px solid #667eea;
}

.mail-attachments.claimed {
  opacity: 0.5;
  border-color: #666;
}

.mail-attachments h4 {
  margin: 0 0 12px 0;
  color: #667eea;
  font-size: 14px;
}

.attachment-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #16213e;
  border-radius: 8px;
  font-size: 13px;
}

.attachment-item.gold {
  border: 1px solid #feca57;
}

.attachment-item.diamond {
  border: 1px solid #54a0ff;
}

.attachment-item.item {
  border: 1px solid #5f27cd;
}

.attachment-quantity {
  background: #ff4757;
  color: white;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 10px;
}

.mail-modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  background: #16213e;
  border-top: 1px solid #0f3460;
}

.btn-claim-modal {
  flex: 1;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.btn-close-modal-text {
  padding: 12px 24px;
  border: 1px solid #666;
  background: transparent;
  color: #888;
  border-radius: 8px;
  cursor: pointer;
}

/* 公告 */
.announcement-carousel {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(90deg, #16213e 0%, #0f3460 100%);
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 13px;
}

.announcement-icon {
  font-size: 16px;
}

.announcement-title {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
}

.announcement-link,
.announcement-more {
  color: #667eea;
  text-decoration: none;
  font-size: 12px;
  cursor: pointer;
}

.announcement-list {
  max-height: 60vh;
  overflow-y: auto;
  padding: 16px;
}

.announcement-item {
  padding: 16px;
  background: #16213e;
  border-radius: 12px;
  margin-bottom: 12px;
  border-left: 4px solid #667eea;
}

.announcement-item.urgent {
  border-left-color: #ff4757;
}

.announcement-item.event {
  border-left-color: #feca57;
}

.announcement-item.update {
  border-left-color: #54a0ff;
}

.announcement-item-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.announcement-item-content {
  color: #aaa;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.announcement-item-link {
  color: #667eea;
  text-decoration: none;
  font-size: 12px;
}

.announcement-item-time {
  color: #666;
  font-size: 11px;
  margin-top: 8px;
}

/* 滚动条 */
.mail-list::-webkit-scrollbar,
.mail-modal-body::-webkit-scrollbar,
.announcement-list::-webkit-scrollbar {
  width: 6px;
}

.mail-list::-webkit-scrollbar-track,
.mail-modal-body::-webkit-scrollbar-track,
.announcement-list::-webkit-scrollbar-track {
  background: #16213e;
}

.mail-list::-webkit-scrollbar-thumb,
.mail-modal-body::-webkit-scrollbar-thumb,
.announcement-list::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 3px;
}
`;

// ==================== 注入样式 ====================

function injectMailSystemStyles() {
  if (typeof document === 'undefined') return;
  
  if (!document.getElementById('mail-system-styles')) {
    const styleEl = document.createElement('style');
    styleEl.id = 'mail-system-styles';
    styleEl.textContent = mailSystemStyles;
    document.head.appendChild(styleEl);
  }
}

// ==================== 导出 ====================

// ES6 模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    Mail,
    Announcement,
    MailSystem,
    MailSystemRenderer,
    MailType,
    MailStatus,
    AttachmentType,
    injectMailSystemStyles,
    STORAGE_KEY
  };
}

// 浏览器全局变量
if (typeof window !== 'undefined') {
  window.TowerOfFate = window.TowerOfFate || {};
  window.TowerOfFate.Mail = {
    Mail,
    Announcement,
    MailSystem,
    MailSystemRenderer,
    MailType,
    MailStatus,
    AttachmentType,
    injectMailSystemStyles,
    STORAGE_KEY
  };
}

// ==================== 使用示例 ====================

/**
 * 使用示例：
 * 
 * // 1. 初始化邮件系统
 * const mailSystem = new MailSystem();
 * 
 * // 2. 生成测试数据
 * mailSystem.generateTestData();
 * 
 * // 3. 创建渲染器
 * const renderer = new MailSystemRenderer(mailSystem, 'mail-container');
 * 
 * // 4. 注入样式
 * injectMailSystemStyles();
 * 
 * // 5. 设置回调
 * renderer.onClaim((result) => {
 *   console.log('领取了:', result.attachments);
 *   // 这里可以调用游戏资源管理器来发放奖励
 * });
 * 
 * // 6. 渲染公告轮播
 * renderer.renderAnnouncementCarousel('announcement-container');
 * 
 * // 7. 监听事件
 * mailSystem.addListener((event, data) => {
 *   console.log('邮件事件:', event, data);
 * });
 * 
 * // 8. 手动添加邮件
 * mailSystem.addMail({
 *   type: MailType.REWARD,
 *   title: '测试奖励',
 *   content: '这是一封测试邮件',
 *   attachments: [
 *     { type: AttachmentType.GOLD, id: 'gold', quantity: 1000, name: '金币', icon: '💰' }
 *   ]
 * });
 * 
 * // 9. 手动添加公告
 * mailSystem.addAnnouncement({
 *   title: '新公告',
 *   content: '公告内容',
 *   type: 'event',
 *   priority: 50
 * });
 */

console.log('🐍 命运塔邮件系统模块已加载');
