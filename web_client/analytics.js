/**
 * 命运塔游戏 - 数据埋点分析系统
 * Tower of Fate - Analytics System
 * 
 * @author 小金蛇
 * @version 1.0.0
 */

class TowerAnalytics {
  constructor(config = {}) {
    // 配置项
    this.config = {
      appId: config.appId || 'tower-of-fate-001',
      version: config.version || '1.0.0',
      environment: config.environment || 'production',
      serverUrl: config.serverUrl || 'https://analytics.tower-of-fate.com/api/v1',
      batchSize: config.batchSize || 50,
      flushInterval: config.flushInterval || 30000, // 30秒
      maxRetries: config.maxRetries || 3,
      debug: config.debug || false,
      samplingRate: config.samplingRate || 1.0,
      ...config
    };

    // 内部状态
    this.sessionId = this._generateSessionId();
    this.userId = this._getOrCreateUserId();
    this.eventQueue = [];
    this.isOnline = navigator.onLine;
    this.flushTimer = null;
    this.retryCount = 0;

    // 初始化
    this._init();
  }

  // ==================== 初始化 ====================

  _init() {
    this._migrateLegacyData();
    this._setupEventListeners();
    this._startFlushTimer();
    this._recordSessionStart();
    
    // 页面性能指标收集
    this._collectPerformanceMetrics();
    
    this._log('Analytics initialized', { userId: this.userId, sessionId: this.sessionId });
  }

  _migrateLegacyData() {
    // 数据迁移逻辑，确保版本兼容性
    const version = localStorage.getItem('tof_analytics_version');
    if (version !== this.config.version) {
      // 执行必要的迁移
      localStorage.setItem('tof_analytics_version', this.config.version);
    }
  }

  _setupEventListeners() {
    // 网络状态监听
    window.addEventListener('online', () => {
      this.isOnline = true;
      this._flush();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this._recordEvent('page_hidden', { timestamp: Date.now() });
        this._flush(true); // 强制刷新
      } else {
        this._recordEvent('page_visible', { timestamp: Date.now() });
      }
    });

    // 页面卸载前
    window.addEventListener('beforeunload', () => {
      this._recordSessionEnd();
      this._flush(true);
    });
  }

  _startFlushTimer() {
    this.flushTimer = setInterval(() => {
      this._flush();
    }, this.config.flushInterval);
  }

  // ==================== 核心事件记录 ====================

  /**
   * 记录事件
   * @param {string} eventType - 事件类型
   * @param {Object} properties - 事件属性
   * @param {Object} options - 可选配置
   */
  track(eventType, properties = {}, options = {}) {
    // 采样率控制
    if (Math.random() > this.config.samplingRate) {
      return;
    }

    const event = this._createEvent(eventType, properties, options);
    this._enqueueEvent(event);
  }

  _createEvent(eventType, properties, options) {
    const timestamp = Date.now();
    return {
      eventId: this._generateEventId(),
      eventType,
      timestamp,
      sessionId: this.sessionId,
      userId: this.userId,
      properties: this._sanitizeProperties(properties),
      context: this._getEventContext(),
      ...options
    };
  }

  _enqueueEvent(event) {
    this.eventQueue.push(event);
    
    // 达到批量大小时立即刷新
    if (this.eventQueue.length >= this.config.batchSize) {
      this._flush();
    }
  }

  // ==================== 用户行为追踪 ====================

  /**
   * 追踪页面访问
   * @param {string} pageName - 页面名称
   * @param {Object} extraProps - 额外属性
   */
  trackPageView(pageName, extraProps = {}) {
    const pageData = {
      page: pageName,
      url: window.location.href,
      referrer: document.referrer,
      title: document.title,
      ...extraProps
    };

    // 记录页面访问路径
    this._recordPagePath(pageName);
    this.track('page_view', pageData);
  }

  /**
   * 追踪按钮点击
   * @param {string} buttonId - 按钮标识
   * @param {string} buttonName - 按钮名称
   * @param {Object} extraProps - 额外属性
   */
  trackButtonClick(buttonId, buttonName, extraProps = {}) {
    this.track('button_click', {
      button_id: buttonId,
      button_name: buttonName,
      page: this._getCurrentPage(),
      ...extraProps
    });

    // 更新按钮点击统计
    this._updateButtonStats(buttonId, buttonName);
  }

  /**
   * 追踪功能使用
   * @param {string} featureName - 功能名称
   * @param {Object} extraProps - 额外属性
   */
  trackFeatureUsage(featureName, extraProps = {}) {
    this.track('feature_usage', {
      feature_name: featureName,
      page: this._getCurrentPage(),
      ...extraProps
    });

    this._updateFeatureStats(featureName);
  }

  // ==================== 游戏事件埋点 ====================

  /**
   * 对局开始
   * @param {Object} matchData - 对局数据
   */
  trackMatchStart(matchData) {
    const matchId = this._generateMatchId();
    this.currentMatchId = matchId;
    
    this.track('match_start', {
      match_id: matchId,
      game_mode: matchData.gameMode || 'classic',
      difficulty: matchData.difficulty || 'normal',
      deck_type: matchData.deckType,
      opponent_type: matchData.opponentType || 'ai',
      start_time: Date.now(),
      ...matchData
    });

    this._updateMatchStats('started');
  }

  /**
   * 对局结束
   * @param {Object} resultData - 对局结果
   */
  trackMatchEnd(resultData) {
    const duration = resultData.endTime - resultData.startTime;
    
    this.track('match_end', {
      match_id: this.currentMatchId,
      result: resultData.result, // 'win', 'loss', 'draw', 'abandon'
      duration: duration,
      floors_climbed: resultData.floorsClimbed,
      final_floor: resultData.finalFloor,
      cards_played: resultData.cardsPlayed,
      rage_cards_used: resultData.rageCardsUsed,
      ...resultData
    });

    this._updateMatchStats('ended', resultData.result);
    this.currentMatchId = null;
  }

  /**
   * 出牌行为
   * @param {Object} playData - 出牌数据
   */
  trackCardPlay(playData) {
    this.track('card_play', {
      match_id: this.currentMatchId,
      card_id: playData.cardId,
      card_name: playData.cardName,
      card_type: playData.cardType,
      card_rarity: playData.rarity,
      target: playData.target,
      turn_number: playData.turnNumber,
      floor_number: playData.floorNumber,
      hand_position: playData.handPosition,
      ...playData
    });
  }

  /**
   * 激怒牌使用
   * @param {Object} rageData - 激怒牌数据
   */
  trackRageCardUsage(rageData) {
    this.track('rage_card_used', {
      match_id: this.currentMatchId,
      rage_card_id: rageData.cardId,
      rage_card_name: rageData.cardName,
      trigger_condition: rageData.triggerCondition,
      effect_type: rageData.effectType,
      floor_number: rageData.floorNumber,
      ...rageData
    });

    this._updateRageCardStats(rageData.cardId, rageData.cardName);
  }

  /**
   * 登顶成功/失败
   * @param {Object} summitData - 登顶数据
   */
  trackSummitAttempt(summitData) {
    this.track('summit_attempt', {
      match_id: this.currentMatchId,
      success: summitData.success,
      tower_height: summitData.towerHeight,
      attempts_count: summitData.attemptsCount,
      final_hp: summitData.finalHp,
      deck_summary: summitData.deckSummary,
      ...summitData
    });

    if (summitData.success) {
      this._recordAchievement('summit_success', summitData);
    }
  }

  /**
   * 商店浏览
   * @param {Object} browseData - 浏览数据
   */
  trackShopBrowse(browseData) {
    this.track('shop_browse', {
      shop_type: browseData.shopType,
      items_viewed: browseData.itemsViewed,
      time_spent: browseData.timeSpent,
      ...browseData
    });
  }

  /**
   * 商店购买
   * @param {Object} purchaseData - 购买数据
   */
  trackShopPurchase(purchaseData) {
    this.track('shop_purchase', {
      item_id: purchaseData.itemId,
      item_name: purchaseData.itemName,
      item_type: purchaseData.itemType,
      currency_type: purchaseData.currencyType,
      price: purchaseData.price,
      quantity: purchaseData.quantity,
      ...purchaseData
    });

    this._updatePurchaseStats(purchaseData);
  }

  /**
   * 广告观看
   * @param {Object} adData - 广告数据
   */
  trackAdWatch(adData) {
    this.track('ad_watch', {
      ad_type: adData.adType,
      ad_provider: adData.adProvider,
      placement: adData.placement,
      duration: adData.duration,
      completed: adData.completed,
      reward_received: adData.rewardReceived,
      ...adData
    });

    this._updateAdStats(adData);
  }

  // ==================== 用户留存分析 ====================

  /**
   * 记录用户活跃
   */
  recordUserActivity() {
    const today = new Date().toDateString();
    const activityKey = 'tof_user_activity';
    
    let activity = this._getStorageData(activityKey, {
      firstVisit: today,
      lastVisit: today,
      visitDays: [],
      totalSessions: 0
    });

    // 更新访问记录
    if (!activity.visitDays.includes(today)) {
      activity.visitDays.push(today);
      // 只保留最近90天的记录
      if (activity.visitDays.length > 90) {
        activity.visitDays.shift();
      }
    }

    activity.lastVisit = today;
    activity.totalSessions++;

    this._setStorageData(activityKey, activity);

    // 检查留存并上报
    this._checkRetention();
  }

  /**
   * 获取留存数据
   * @returns {Object} 留存分析数据
   */
  getRetentionData() {
    const activity = this._getStorageData('tof_user_activity', {
      firstVisit: new Date().toDateString(),
      visitDays: [],
      totalSessions: 0
    });

    const firstVisit = new Date(activity.firstVisit);
    const now = new Date();
    const daysSinceFirstVisit = Math.floor((now - firstVisit) / (1000 * 60 * 60 * 24));

    // 计算留存率
    const retention = {
      d1: this._calculateRetention(activity.visitDays, 1),
      d7: this._calculateRetention(activity.visitDays, 7),
      d30: this._calculateRetention(activity.visitDays, 30),
      totalDays: activity.visitDays.length,
      daysSinceFirstVisit,
      avgSessionsPerDay: activity.totalSessions / Math.max(daysSinceFirstVisit, 1)
    };

    return retention;
  }

  _calculateRetention(visitDays, days) {
    if (visitDays.length < 2) return 0;
    
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    const targetDateStr = targetDate.toDateString();
    
    // 检查目标日期是否访问过
    return visitDays.includes(targetDateStr) ? 1 : 0;
  }

  _checkRetention() {
    const retention = this.getRetentionData();
    
    // 上报留存事件
    this.track('retention_check', {
      d1_retention: retention.d1,
      d7_retention: retention.d7,
      d30_retention: retention.d30,
      total_active_days: retention.totalDays
    });
  }

  // ==================== 付费分析 ====================

  /**
   * 追踪付费转化
   * @param {Object} paymentData - 支付数据
   */
  trackPayment(paymentData) {
    const paymentEvent = {
      order_id: paymentData.orderId,
      product_id: paymentData.productId,
      product_name: paymentData.productName,
      amount: paymentData.amount,
      currency: paymentData.currency || 'CNY',
      payment_method: paymentData.paymentMethod,
      status: paymentData.status, // 'success', 'failed', 'pending'
      ...paymentData
    };

    this.track('payment', paymentEvent);

    if (paymentData.status === 'success') {
      this._recordSuccessfulPayment(paymentEvent);
    }
  }

  _recordSuccessfulPayment(paymentData) {
    const paymentKey = 'tof_payment_history';
    let history = this._getStorageData(paymentKey, {
      payments: [],
      totalSpent: 0,
      firstPaymentDate: null,
      lastPaymentDate: null,
      paymentCount: 0
    });

    history.payments.push({
      ...paymentData,
      timestamp: Date.now()
    });

    history.totalSpent += paymentData.amount;
    history.paymentCount++;
    history.lastPaymentDate = new Date().toISOString();
    
    if (!history.firstPaymentDate) {
      history.firstPaymentDate = new Date().toISOString();
    }

    this._setStorageData(paymentKey, history);

    // 计算并上报付费指标
    this._calculatePaymentMetrics(history);
  }

  _calculatePaymentMetrics(history) {
    const metrics = {
      total_revenue: history.totalSpent,
      total_payments: history.paymentCount,
      arpu: history.totalSpent / Math.max(history.paymentCount, 1),
      first_payment_date: history.firstPaymentDate,
      last_payment_date: history.lastPaymentDate,
      days_since_first_payment: history.firstPaymentDate ? 
        Math.floor((Date.now() - new Date(history.firstPaymentDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
    };

    this.track('payment_metrics', metrics);
  }

  /**
   * 获取付费分析数据
   * @returns {Object} 付费分析数据
   */
  getPaymentAnalytics() {
    const history = this._getStorageData('tof_payment_history', {
      payments: [],
      totalSpent: 0,
      paymentCount: 0
    });

    const activity = this._getStorageData('tof_user_activity', { totalSessions: 0 });

    // 计算转化率
    const conversionRate = activity.totalSessions > 0 ? 
      (history.paymentCount / activity.totalSessions) * 100 : 0;

    return {
      totalRevenue: history.totalSpent,
      totalPayments: history.paymentCount,
      arpu: history.totalSpent / Math.max(history.paymentCount, 1),
      conversionRate: conversionRate.toFixed(2),
      averageOrderValue: history.totalSpent / Math.max(history.paymentCount, 1),
      paymentHistory: history.payments
    };
  }

  // ==================== 实时数据看板 ====================

  /**
   * 获取实时看板数据
   * @returns {Object} 看板数据
   */
  getDashboardData() {
    const today = new Date().toDateString();
    const dashboardKey = `tof_dashboard_${today}`;
    
    return {
      // 今日概况
      today: this._getStorageData(dashboardKey, {
        sessions: 0,
        matches: 0,
        payments: 0,
        revenue: 0
      }),
      
      // 留存数据
      retention: this.getRetentionData(),
      
      // 付费数据
      payment: this.getPaymentAnalytics(),
      
      // 游戏统计
      gameStats: this._getGameStats(),
      
      // 用户行为
      userBehavior: this._getUserBehaviorStats(),
      
      // 生成时间
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * 渲染简单图表到控制台
   */
  renderDashboardCharts() {
    const data = this.getDashboardData();
    
    console.group('📊 命运塔游戏 - 实时数据看板');
    console.log(`生成时间: ${data.generatedAt}`);
    
    // 留存率柱状图
    console.group('📈 留存率');
    this._renderBarChart('次日留存', data.retention.d1 * 100, '%');
    this._renderBarChart('7日留存', data.retention.d7 * 100, '%');
    this._renderBarChart('30日留存', data.retention.d30 * 100, '%');
    console.groupEnd();
    
    // 付费指标
    console.group('💰 付费指标');
    console.log(`总收入: ¥${data.payment.totalRevenue.toFixed(2)}`);
    console.log(`ARPU: ¥${data.payment.arpu.toFixed(2)}`);
    console.log(`转化率: ${data.payment.conversionRate}%`);
    console.groupEnd();
    
    // 游戏统计
    console.group('🎮 游戏统计');
    console.log(`总对局数: ${data.gameStats.totalMatches}`);
    console.log(`胜率: ${data.gameStats.winRate}%`);
    console.log(`平均登顶层数: ${data.gameStats.avgFloorsClimbed}`);
    console.groupEnd();
    
    console.groupEnd();
  }

  _renderBarChart(label, value, unit = '') {
    const maxBars = 20;
    const bars = Math.round((value / 100) * maxBars);
    const barString = '█'.repeat(bars) + '░'.repeat(maxBars - bars);
    console.log(`${label.padEnd(10)} ${barString} ${value.toFixed(1)}${unit}`);
  }

  // ==================== 数据导出 ====================

  /**
   * 导出所有分析数据
   * @param {string} format - 导出格式: 'json', 'csv'
   * @returns {string|Object} 导出的数据
   */
  exportData(format = 'json') {
    const exportData = {
      metadata: {
        exportTime: new Date().toISOString(),
        appId: this.config.appId,
        version: this.config.version,
        userId: this.userId
      },
      userActivity: this._getStorageData('tof_user_activity', {}),
      paymentHistory: this._getStorageData('tof_payment_history', {}),
      gameStats: this._getGameStats(),
      userBehavior: this._getUserBehaviorStats(),
      retention: this.getRetentionData(),
      paymentAnalytics: this.getPaymentAnalytics()
    };

    if (format === 'csv') {
      return this._convertToCSV(exportData);
    }

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * 下载导出文件
   * @param {string} format - 导出格式
   */
  downloadExport(format = 'json') {
    const data = this.exportData(format);
    const blob = new Blob([data], { 
      type: format === 'csv' ? 'text/csv;charset=utf-8' : 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `tower-of-fate-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  _convertToCSV(data) {
    // 简化版CSV转换，主要转换关键指标
    let csv = 'Metric,Value\n';
    
    csv += `Total Revenue,${data.paymentAnalytics.totalRevenue}\n`;
    csv += `Total Payments,${data.paymentAnalytics.totalPayments}\n`;
    csv += `ARPU,${data.paymentAnalytics.arpu}\n`;
    csv += `Conversion Rate,${data.paymentAnalytics.conversionRate}\n`;
    csv += `D1 Retention,${data.retention.d1}\n`;
    csv += `D7 Retention,${data.retention.d7}\n`;
    csv += `D30 Retention,${data.retention.d30}\n`;
    csv += `Total Matches,${data.gameStats.totalMatches}\n`;
    csv += `Win Rate,${data.gameStats.winRate}\n`;
    
    return csv;
  }

  // ==================== 数据上报 ====================

  async _flush(force = false) {
    if (this.eventQueue.length === 0) return;
    if (!this.isOnline && !force) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // 数据压缩
      const compressed = this._compressData(eventsToSend);
      
      // 模拟服务器上报
      const success = await this._sendToServer(compressed);
      
      if (success) {
        this.retryCount = 0;
        this._log('Events flushed successfully', { count: eventsToSend.length });
      } else {
        throw new Error('Server rejected events');
      }
    } catch (error) {
      this._log('Failed to flush events', error);
      
      // 失败时重新入队
      this.eventQueue.unshift(...eventsToSend);
      
      // 重试逻辑
      if (this.retryCount < this.config.maxRetries) {
        this.retryCount++;
        setTimeout(() => this._flush(), 5000 * this.retryCount);
      } else {
        // 存储到本地，稍后重试
        this._storeFailedEvents(eventsToSend);
      }
    }
  }

  async _sendToServer(data) {
    // 实际环境中应该使用真实的API
    // 这里模拟上报过程
    if (this.config.debug) {
      console.log('[Analytics] Would send to server:', data);
      return true;
    }

    try {
      const response = await fetch(this.config.serverUrl + '/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-App-ID': this.config.appId,
          'X-User-ID': this.userId
        },
        body: JSON.stringify({
          batch: data,
          timestamp: Date.now(),
          sessionId: this.sessionId
        })
      });

      return response.ok;
    } catch (error) {
      // 网络错误时模拟成功（离线模式）
      this._log('Network error, storing locally', error);
      return false;
    }
  }

  _compressData(events) {
    // 简单的数据压缩：移除undefined值，缩短键名
    return events.map(event => ({
      e: event.eventType,      // event
      t: event.timestamp,      // timestamp
      p: event.properties,     // properties
      c: event.context         // context
    }));
  }

  _storeFailedEvents(events) {
    const key = 'tof_failed_events';
    const existing = this._getStorageData(key, []);
    const combined = [...existing, ...events];
    
    // 限制存储数量
    if (combined.length > 1000) {
      combined.splice(0, combined.length - 1000);
    }
    
    this._setStorageData(key, combined);
  }

  // ==================== 辅助方法 ====================

  _getOrCreateUserId() {
    let userId = localStorage.getItem('tof_user_id');
    if (!userId) {
      userId = this._generateUserId();
      localStorage.setItem('tof_user_id', userId);
    }
    return userId;
  }

  _generateUserId() {
    return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  _generateSessionId() {
    return 's_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  _generateEventId() {
    return 'e_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  _generateMatchId() {
    return 'm_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 9);
  }

  _getEventContext() {
    return {
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      language: navigator.language,
      platform: navigator.platform
    };
  }

  _getCurrentPage() {
    return window.location.pathname;
  }

  _recordPagePath(pageName) {
    const key = 'tof_page_paths';
    const paths = this._getStorageData(key, []);
    paths.push({
      page: pageName,
      timestamp: Date.now()
    });
    
    // 只保留最近100条
    if (paths.length > 100) {
      paths.shift();
    }
    
    this._setStorageData(key, paths);
  }

  _recordSessionStart() {
    this.recordUserActivity();
    this.track('session_start', {
      session_id: this.sessionId,
      start_time: Date.now()
    });
  }

  _recordSessionEnd() {
    const sessionData = {
      session_id: this.sessionId,
      end_time: Date.now()
    };
    
    // 存储会话数据
    const sessions = this._getStorageData('tof_sessions', []);
    sessions.push(sessionData);
    this._setStorageData('tof_sessions', sessions);
    
    this.track('session_end', sessionData);
  }

  _recordAchievement(type, data) {
    const achievements = this._getStorageData('tof_achievements', []);
    achievements.push({
      type,
      data,
      timestamp: Date.now()
    });
    this._setStorageData('tof_achievements', achievements);
  }

  _updateButtonStats(buttonId, buttonName) {
    const key = 'tof_button_stats';
    const stats = this._getStorageData(key, {});
    
    if (!stats[buttonId]) {
      stats[buttonId] = { name: buttonName, count: 0 };
    }
    stats[buttonId].count++;
    stats[buttonId].lastClicked = Date.now();
    
    this._setStorageData(key, stats);
  }

  _updateFeatureStats(featureName) {
    const key = 'tof_feature_stats';
    const stats = this._getStorageData(key, {});
    
    if (!stats[featureName]) {
      stats[featureName] = { count: 0, lastUsed: null };
    }
    stats[featureName].count++;
    stats[featureName].lastUsed = Date.now();
    
    this._setStorageData(key, stats);
  }

  _updateMatchStats(action, result = null) {
    const key = 'tof_match_stats';
    const stats = this._getStorageData(key, {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      totalFloorsClimbed: 0
    });

    if (action === 'started') {
      stats.totalMatches++;
    } else if (action === 'ended' && result) {
      stats[result + 's']++;
    }

    this._setStorageData(key, stats);
  }

  _updateRageCardStats(cardId, cardName) {
    const key = 'tof_rage_card_stats';
    const stats = this._getStorageData(key, {});
    
    if (!stats[cardId]) {
      stats[cardId] = { name: cardName, usageCount: 0 };
    }
    stats[cardId].usageCount++;
    
    this._setStorageData(key, stats);
  }

  _updatePurchaseStats(purchaseData) {
    const key = 'tof_purchase_stats';
    const stats = this._getStorageData(key, {
      totalItems: 0,
      itemsByType: {}
    });

    stats.totalItems += purchaseData.quantity || 1;
    
    const type = purchaseData.itemType || 'unknown';
    if (!stats.itemsByType[type]) {
      stats.itemsByType[type] = 0;
    }
    stats.itemsByType[type] += purchaseData.quantity || 1;

    this._setStorageData(key, stats);
  }

  _updateAdStats(adData) {
    const key = 'tof_ad_stats';
    const stats = this._getStorageData(key, {
      totalAds: 0,
      completedAds: 0,
      adsByType: {}
    });

    stats.totalAds++;
    if (adData.completed) {
      stats.completedAds++;
    }

    const type = adData.adType || 'unknown';
    if (!stats.adsByType[type]) {
      stats.adsByType[type] = { total: 0, completed: 0 };
    }
    stats.adsByType[type].total++;
    if (adData.completed) {
      stats.adsByType[type].completed++;
    }

    this._setStorageData(key, stats);
  }

  _getGameStats() {
    return this._getStorageData('tof_match_stats', {
      totalMatches: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
      avgFloorsClimbed: 0
    });
  }

  _getUserBehaviorStats() {
    return {
      buttonStats: this._getStorageData('tof_button_stats', {}),
      featureStats: this._getStorageData('tof_feature_stats', {}),
      rageCardStats: this._getStorageData('tof_rage_card_stats', {}),
      pagePaths: this._getStorageData('tof_page_paths', [])
    };
  }

  _collectPerformanceMetrics() {
    if (window.performance) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const perfData = window.performance.timing;
          const metrics = {
            dnsLookup: perfData.domainLookupEnd - perfData.domainLookupStart,
            tcpConnection: perfData.connectEnd - perfData.connectStart,
            serverResponse: perfData.responseEnd - perfData.requestStart,
            domProcessing: perfData.domComplete - perfData.domLoading,
            pageLoad: perfData.loadEventEnd - perfData.navigationStart
          };

          this.track('performance_metrics', metrics);
        }, 0);
      });
    }
  }

  _sanitizeProperties(properties) {
    // 移除敏感信息
    const sensitiveKeys = ['password', 'token', 'secret', 'credit_card', 'ssn', 'email', 'phone'];
    const sanitized = { ...properties };

    for (const key of Object.keys(sanitized)) {
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  _getStorageData(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  _setStorageData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      this._log('Storage error', e);
    }
  }

  _log(message, data = null) {
    if (this.config.debug) {
      console.log(`[TowerAnalytics] ${message}`, data || '');
    }
  }

  // ==================== 公共API ====================

  /**
   * 设置用户属性
   * @param {Object} properties - 用户属性
   */
  setUserProperties(properties) {
    const userProps = this._getStorageData('tof_user_properties', {});
    this._setStorageData('tof_user_properties', { ...userProps, ...properties });
    this.track('user_properties_updated', properties);
  }

  /**
   * 获取用户属性
   * @returns {Object} 用户属性
   */
  getUserProperties() {
    return this._getStorageData('tof_user_properties', {});
  }

  /**
   * 清除所有本地数据
   */
  clearAllData() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('tof_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    this.track('data_cleared', { timestamp: Date.now() });
  }

  /**
   * 销毁实例
   */
  destroy() {
    this._flush(true);
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
  }
}

// ==================== 便捷使用方式 ====================

// 全局实例
let globalAnalytics = null;

/**
 * 初始化分析系统
 * @param {Object} config - 配置对象
 * @returns {TowerAnalytics} 分析实例
 */
function initAnalytics(config = {}) {
  globalAnalytics = new TowerAnalytics(config);
  return globalAnalytics;
}

/**
 * 获取分析实例
 * @returns {TowerAnalytics} 分析实例
 */
function getAnalytics() {
  if (!globalAnalytics) {
    throw new Error('Analytics not initialized. Call initAnalytics() first.');
  }
  return globalAnalytics;
}

/**
 * 追踪事件（快捷方式）
 * @param {string} eventType - 事件类型
 * @param {Object} properties - 事件属性
 */
function track(eventType, properties = {}) {
  if (globalAnalytics) {
    globalAnalytics.track(eventType, properties);
  }
}

// ==================== 导出 ====================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TowerAnalytics, initAnalytics, getAnalytics, track };
}

if (typeof window !== 'undefined') {
  window.TowerAnalytics = TowerAnalytics;
  window.initAnalytics = initAnalytics;
  window.getAnalytics = getAnalytics;
  window.track = track;
}
