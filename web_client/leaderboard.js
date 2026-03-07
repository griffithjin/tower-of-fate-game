/**
 * 命运塔游戏 - 排行榜系统
 * Tower of Fate - Leaderboard System
 * 
 * 功能模块：
 * 1. 多维度排行榜（全球/好友/地区/周期榜）
 * 2. 多类型排行（财富/登顶/连胜/对战）
 * 3. 实时刷新机制
 * 4. 奖励系统
 * 5. 社交分享
 * 
 * @author 小金蛇 🐍
 * @version 1.0.0
 */

class TowerLeaderboard {
  constructor(options = {}) {
    // 配置选项
    this.config = {
      apiBaseUrl: options.apiBaseUrl || '/api/leaderboard',
      refreshInterval: options.refreshInterval || 30000, // 30秒自动刷新
      pageSize: options.pageSize || 50,
      enableMock: options.enableMock !== false, // 默认启用模拟数据
      currentPlayerId: options.currentPlayerId || null,
      region: options.region || 'CN',
      language: options.language || 'zh-CN',
      ...options
    };

    // 状态管理
    this.state = {
      currentTab: 'global',        // global | friends | region | weekly | monthly | seasonal
      currentType: 'wealth',       // wealth | summit | streak | battle
      currentData: [],
      myRank: null,
      lastRefresh: null,
      isLoading: false,
      error: null,
      rewardClaimed: new Set(),    // 已领取的奖励
      rankingsCache: new Map()     // 缓存
    };

    // 事件监听器
    this.eventListeners = new Map();

    // 定时器
    this.refreshTimer = null;

    // 初始化
    this.init();
  }

  /**
   * 初始化排行榜系统
   */
  init() {
    this.startAutoRefresh();
    this.loadInitialData();
    console.log('🏆 [TowerLeaderboard] 排行榜系统初始化完成');
  }

  /**
   * ==================== 数据获取 ====================
   */

  /**
   * 加载初始数据
   */
  async loadInitialData() {
    await this.fetchLeaderboard(this.state.currentTab, this.state.currentType);
  }

  /**
   * 获取排行榜数据
   * @param {string} tab - 榜单类型
   * @param {string} type - 排行维度
   * @param {number} page - 页码
   */
  async fetchLeaderboard(tab = 'global', type = 'wealth', page = 1) {
    const cacheKey = `${tab}:${type}:${page}`;
    
    // 检查缓存
    const cached = this.state.rankingsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 60000) {
      this.state.currentData = cached.data;
      this.emit('dataLoaded', { data: cached.data, fromCache: true });
      return cached.data;
    }

    this.state.isLoading = true;
    this.emit('loading', { tab, type, page });

    try {
      let data;
      
      if (this.config.enableMock) {
        data = await this.fetchMockData(tab, type, page);
      } else {
        data = await this.fetchRealData(tab, type, page);
      }

      // 处理数据
      const processedData = this.processRankingData(data, tab, type);
      
      // 更新缓存
      this.state.rankingsCache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      });

      this.state.currentData = processedData;
      this.state.lastRefresh = Date.now();
      this.state.error = null;

      // 获取我的排名
      await this.fetchMyRank(tab, type);

      this.emit('dataLoaded', { data: processedData, fromCache: false });
      
      return processedData;
    } catch (error) {
      this.state.error = error.message;
      this.emit('error', { error: error.message, tab, type });
      throw error;
    } finally {
      this.state.isLoading = false;
      this.emit('loaded');
    }
  }

  /**
   * 获取真实API数据
   */
  async fetchRealData(tab, type, page) {
    const params = new URLSearchParams({
      tab,
      type,
      page: page.toString(),
      pageSize: this.config.pageSize.toString(),
      region: this.config.region,
      playerId: this.config.currentPlayerId || ''
    });

    const response = await fetch(`${this.config.apiBaseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * 获取模拟数据
   */
  async fetchMockData(tab, type, page) {
    // 模拟网络延迟
    await this.delay(300 + Math.random() * 500);

    const mockData = this.generateMockData(tab, type, page);
    
    return {
      success: true,
      data: mockData,
      total: 1000,
      page,
      pageSize: this.config.pageSize
    };
  }

  /**
   * 生成模拟排行榜数据
   */
  generateMockData(tab, type, page) {
    const data = [];
    const startRank = (page - 1) * this.config.pageSize + 1;
    
    // 根据榜单类型生成不同特征的数据
    const baseValues = this.getBaseValuesByType(type);
    
    for (let i = 0; i < this.config.pageSize; i++) {
      const rank = startRank + i;
      const isTop3 = rank <= 3;
      
      // 生成递减的数值（前高后低）
      const decayFactor = Math.pow(0.995, rank - 1);
      const baseValue = Math.floor(baseValues.base * decayFactor + Math.random() * baseValues.variance);
      
      const player = {
        rank,
        playerId: `player_${100000 + rank}`,
        nickname: this.generateNickname(rank),
        avatar: this.getAvatarUrl(rank),
        level: Math.max(1, 100 - Math.floor(rank / 10)),
        value: baseValue,
        valueFormatted: this.formatValue(baseValue, type),
        region: this.getRandomRegion(),
        trend: this.generateTrend(rank),
        isVip: rank <= 10 || Math.random() > 0.7,
        isFriend: tab === 'friends' || (tab === 'global' && Math.random() > 0.8),
        guild: this.generateGuildName(),
        lastActive: this.generateLastActive(),
        change: this.generateRankChange(rank),
        rewards: isTop3 ? this.getTopRewards(rank) : null
      };

      // 模拟当前玩家
      if (rank === 42 || (this.config.currentPlayerId && rank === 15)) {
        player.isMe = true;
        player.playerId = this.config.currentPlayerId || 'me_001';
        player.nickname = '金蛇主人'; // 当前玩家昵称
      }

      data.push(player);
    }

    return data;
  }

  /**
   * 获取不同类型的基础数值
   */
  getBaseValuesByType(type) {
    const values = {
      wealth: { base: 10000000, variance: 500000 },      // 金币/钻石
      summit: { base: 500, variance: 50 },               // 登顶次数
      streak: { base: 100, variance: 10 },               // 连胜
      battle: { base: 10000, variance: 500 }             // 对战次数
    };
    return values[type] || values.wealth;
  }

  /**
   * 格式化数值显示
   */
  formatValue(value, type) {
    switch (type) {
      case 'wealth':
        return value >= 100000000 
          ? `${(value / 100000000).toFixed(2)}亿` 
          : value >= 10000 
            ? `${(value / 10000).toFixed(1)}万` 
            : value.toLocaleString();
      case 'summit':
        return `${value}次`;
      case 'streak':
        return `${value}连胜`;
      case 'battle':
        return `${value}场`;
      default:
        return value.toLocaleString();
    }
  }

  /**
   * 生成昵称
   */
  generateNickname(rank) {
    const prefixes = ['王者', '传说', '至尊', '无敌', '霸气', '神秘', '冷酷', '热血'];
    const suffixes = ['战神', '法师', '剑客', '刺客', '猎人', '骑士', '龙', '虎', '狼', '影'];
    
    if (rank === 1) return '🏆 命运之王';
    if (rank === 2) return '🥈 塔之守护者';
    if (rank === 3) return '🥉 攀登者';
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${prefix}${suffix}${Math.floor(Math.random() * 999)}`;
  }

  /**
   * 获取头像URL
   */
  getAvatarUrl(rank) {
    const avatarIds = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    const id = avatarIds[rank % avatarIds.length];
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${rank}&backgroundColor=b6e3f4`;
  }

  /**
   * 获取随机地区
   */
  getRandomRegion() {
    const regions = [
      { code: 'CN', name: '中国' },
      { code: 'US', name: '美国' },
      { code: 'JP', name: '日本' },
      { code: 'KR', name: '韩国' },
      { code: 'EU', name: '欧洲' }
    ];
    return regions[Math.floor(Math.random() * regions.length)];
  }

  /**
   * 生成趋势
   */
  generateTrend(rank) {
    if (rank <= 3) return 'stable';
    const rand = Math.random();
    if (rand > 0.7) return 'up';
    if (rand > 0.4) return 'down';
    return 'stable';
  }

  /**
   * 生成公会名
   */
  generateGuildName() {
    const guilds = ['命运之巅', '无尽之塔', '王者联盟', '攀登者', '云端之上', null, null];
    return guilds[Math.floor(Math.random() * guilds.length)];
  }

  /**
   * 生成最后活跃时间
   */
  generateLastActive() {
    const minutes = Math.floor(Math.random() * 1440);
    if (minutes < 5) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前`;
    return '1天前';
  }

  /**
   * 生成排名变化
   */
  generateRankChange(rank) {
    const change = Math.floor(Math.random() * 20) - 10;
    return {
      value: change,
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable'
    };
  }

  /**
   * 获取前三名奖励
   */
  getTopRewards(rank) {
    const rewards = {
      1: { gold: 10000, diamond: 500, title: '命运之王', avatar: 'crown_gold' },
      2: { gold: 5000, diamond: 300, title: '塔之守护者', avatar: 'crown_silver' },
      3: { gold: 3000, diamond: 200, title: '攀登者', avatar: 'crown_bronze' }
    };
    return rewards[rank];
  }

  /**
   * 处理排行榜数据
   */
  processRankingData(response, tab, type) {
    if (!response || !response.data) return [];
    
    const data = response.data.map((item, index) => ({
      ...item,
      rank: item.rank || (response.page - 1) * response.pageSize + index + 1,
      isTop3: (item.rank || index + 1) <= 3,
      valueFormatted: item.valueFormatted || this.formatValue(item.value, type)
    }));

    return data;
  }

  /**
   * 获取我的排名
   */
  async fetchMyRank(tab, type) {
    if (!this.config.currentPlayerId) return null;

    try {
      // 在模拟数据中查找
      const myEntry = this.state.currentData.find(p => p.isMe);
      
      if (myEntry) {
        this.state.myRank = {
          ...myEntry,
          nextRankPlayer: this.state.currentData.find(p => p.rank === myEntry.rank - 1),
          prevRankPlayer: this.state.currentData.find(p => p.rank === myEntry.rank + 1)
        };
      } else {
        // 生成一个模拟的我的排名
        this.state.myRank = this.generateMyMockRank(tab, type);
      }

      this.emit('myRankLoaded', this.state.myRank);
      return this.state.myRank;
    } catch (error) {
      console.error('获取我的排名失败:', error);
      return null;
    }
  }

  /**
   * 生成我的模拟排名
   */
  generateMyMockRank(tab, type) {
    const baseValues = this.getBaseValuesByType(type);
    const myValue = Math.floor(baseValues.base * 0.3);
    
    return {
      rank: 42,
      playerId: this.config.currentPlayerId || 'me_001',
      nickname: '金蛇主人',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=me&backgroundColor=ffdfbf',
      level: 88,
      value: myValue,
      valueFormatted: this.formatValue(myValue, type),
      region: { code: this.config.region, name: '中国' },
      trend: 'up',
      isMe: true,
      isVip: true,
      change: { value: 5, direction: 'up' }
    };
  }

  /**
   * ==================== 奖励系统 ====================
   */

  /**
   * 检查是否有可领取的奖励
   */
  checkAvailableRewards() {
    if (!this.state.myRank || this.state.myRank.rank > 100) {
      return null;
    }

    const rank = this.state.myRank.rank;
    const rewardKey = `${this.state.currentTab}:${this.state.currentType}:${rank}`;
    
    if (this.state.rewardClaimed.has(rewardKey)) {
      return null;
    }

    const rewards = this.calculateRewards(rank);
    return {
      rank,
      rewards,
      canClaim: true,
      rewardKey
    };
  }

  /**
   * 计算奖励
   */
  calculateRewards(rank) {
    if (rank === 1) {
      return { gold: 10000, diamond: 500, items: [{ id: 'crown_gold', name: '金冠' }] };
    } else if (rank <= 3) {
      return { gold: 5000, diamond: 300, items: [{ id: 'crown_silver', name: '银冠' }] };
    } else if (rank <= 10) {
      return { gold: 2000, diamond: 150 };
    } else if (rank <= 50) {
      return { gold: 1000, diamond: 80 };
    } else if (rank <= 100) {
      return { gold: 500, diamond: 40 };
    }
    return null;
  }

  /**
   * 领取奖励
   */
  async claimReward(rewardKey) {
    try {
      // 模拟API调用
      await this.delay(500);
      
      this.state.rewardClaimed.add(rewardKey);
      
      // 保存到本地存储
      this.saveRewardClaimed();
      
      this.emit('rewardClaimed', { rewardKey, success: true });
      
      return { success: true, message: '奖励领取成功！' };
    } catch (error) {
      this.emit('rewardClaimed', { rewardKey, success: false, error });
      throw error;
    }
  }

  /**
   * 保存已领取奖励
   */
  saveRewardClaimed() {
    try {
      localStorage.setItem('tower_leaderboard_rewards', 
        JSON.stringify([...this.state.rewardClaimed]));
    } catch (e) {
      console.warn('保存奖励状态失败:', e);
    }
  }

  /**
   * 加载已领取奖励
   */
  loadRewardClaimed() {
    try {
      const saved = localStorage.getItem('tower_leaderboard_rewards');
      if (saved) {
        const rewards = JSON.parse(saved);
        this.state.rewardClaimed = new Set(rewards);
      }
    } catch (e) {
      console.warn('加载奖励状态失败:', e);
    }
  }

  /**
   * ==================== 分享功能 ====================
   */

  /**
   * 生成分享内容
   */
  generateShareContent(options = {}) {
    const { type = 'image', platform = 'wechat' } = options;
    const myRank = this.state.myRank;
    
    if (!myRank) {
      return { success: false, message: '暂无排名数据' };
    }

    const rankText = this.getRankText(myRank.rank);
    const typeText = this.getLeaderboardTypeText(this.state.currentType);
    
    const shareData = {
      title: `我在命运塔${typeText}排名第${myRank.rank}！`,
      description: `${rankText}快来挑战我吧！`,
      imageUrl: this.generateShareImage(myRank),
      link: `${window.location.origin}/leaderboard?tab=${this.state.currentTab}&type=${this.state.currentType}`,
      rank: myRank.rank,
      type: this.state.currentType,
      value: myRank.valueFormatted
    };

    return { success: true, data: shareData };
  }

  /**
   * 获取排名文本
   */
  getRankText(rank) {
    if (rank === 1) return '👑 我是命运塔之王！';
    if (rank <= 3) return '🏆 跻身三甲，实力非凡！';
    if (rank <= 10) return '🔥 前十高手，傲视群雄！';
    if (rank <= 100) return '⚡ 百强之列，不容小觑！';
    return '💪 我正在攀登命运之巅！';
  }

  /**
   * 获取榜单类型文本
   */
  getLeaderboardTypeText(type) {
    const texts = {
      wealth: '财富榜',
      summit: '登顶榜',
      streak: '连胜榜',
      battle: '对战榜'
    };
    return texts[type] || '排行榜';
  }

  /**
   * 生成分享图片（数据URL）
   */
  generateShareImage(myRank) {
    // 返回一个占位图片URL，实际项目中使用Canvas生成
    return `https://api.dicebear.com/7.x/identicon/svg?seed=rank_${myRank.rank}&backgroundColor=${this.getRankColor(myRank.rank)}`;
  }

  /**
   * 获取排名对应颜色
   */
  getRankColor(rank) {
    if (rank === 1) return 'ffd700';
    if (rank === 2) return 'c0c0c0';
    if (rank === 3) return 'cd7f32';
    return 'b6e3f4';
  }

  /**
   * 分享到平台
   */
  async shareToPlatform(platform, shareData) {
    const platforms = {
      wechat: () => this.shareToWechat(shareData),
      qq: () => this.shareToQQ(shareData),
      weibo: () => this.shareToWeibo(shareData),
      copy: () => this.copyToClipboard(shareData)
    };

    const shareFn = platforms[platform];
    if (!shareFn) {
      throw new Error(`不支持的平台: ${platform}`);
    }

    return await shareFn();
  }

  /**
   * 分享到微信
   */
  async shareToWechat(shareData) {
    // 调用微信SDK
    if (window.wx && window.wx.ready) {
      return new Promise((resolve, reject) => {
        window.wx.shareTimeline({
          title: shareData.title,
          link: shareData.link,
          imgUrl: shareData.imageUrl,
          success: () => resolve({ success: true, platform: 'wechat' }),
          fail: (err) => reject(err)
        });
      });
    }
    
    // 降级：显示分享二维码
    return { 
      success: true, 
      platform: 'wechat', 
      method: 'qrcode',
      qrcodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareData.link)}`
    };
  }

  /**
   * 复制到剪贴板
   */
  async copyToClipboard(shareData) {
    const text = `${shareData.title}\n${shareData.description}\n${shareData.link}`;
    
    try {
      await navigator.clipboard.writeText(text);
      return { success: true, platform: 'clipboard', message: '已复制到剪贴板' };
    } catch (err) {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return { success: true, platform: 'clipboard', message: '已复制到剪贴板' };
    }
  }

  /**
   * ==================== 刷新机制 ====================
   */

  /**
   * 手动刷新
   */
  async refresh() {
    // 清除当前缓存
    const cacheKey = `${this.state.currentTab}:${this.state.currentType}:1`;
    this.state.rankingsCache.delete(cacheKey);
    
    await this.fetchLeaderboard(this.state.currentTab, this.state.currentType);
    this.emit('manualRefresh');
  }

  /**
   * 启动自动刷新
   */
  startAutoRefresh() {
    this.stopAutoRefresh();
    
    this.refreshTimer = setInterval(() => {
      if (!this.state.isLoading) {
        this.fetchLeaderboard(this.state.currentTab, this.state.currentType);
      }
    }, this.config.refreshInterval);
  }

  /**
   * 停止自动刷新
   */
  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * ==================== UI渲染 ====================
   */

  /**
   * 渲染排行榜HTML
   */
  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`容器 #${containerId} 不存在`);
      return;
    }

    container.innerHTML = this.generateLeaderboardHTML();
    this.bindEvents(container);
  }

  /**
   * 生成排行榜HTML
   */
  generateLeaderboardHTML() {
    return `
      <div class="tower-leaderboard">
        ${this.renderHeader()}
        ${this.renderTabs()}
        ${this.renderTypeSelector()}
        ${this.renderTop3()}
        ${this.renderList()}
        ${this.renderMyRank()}
        ${this.renderActions()}
      </div>
    `;
  }

  /**
   * 渲染头部
   */
  renderHeader() {
    const lastUpdate = this.state.lastRefresh 
      ? new Date(this.state.lastRefresh).toLocaleTimeString()
      : '--:--:--';
      
    return `
      <div class="leaderboard-header">
        <h2 class="leaderboard-title">🏆 命运塔排行榜</h2>
        <div class="leaderboard-meta">
          <span class="last-update">更新于 ${lastUpdate}</span>
          <button class="refresh-btn" onclick="leaderboard.refresh()">
            <span class="refresh-icon">🔄</span>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 渲染标签页
   */
  renderTabs() {
    const tabs = [
      { id: 'global', label: '🔥 全球榜', icon: '🌍' },
      { id: 'friends', label: '👥 好友榜', icon: '👥' },
      { id: 'region', label: '📍 地区榜', icon: '📍' },
      { id: 'weekly', label: '📅 周榜', icon: '📅' },
      { id: 'monthly', label: '📆 月榜', icon: '📆' },
      { id: 'seasonal', label: '🏁 赛季榜', icon: '🏁' }
    ];

    return `
      <div class="leaderboard-tabs">
        ${tabs.map(tab => `
          <button 
            class="tab-btn ${this.state.currentTab === tab.id ? 'active' : ''}"
            data-tab="${tab.id}"
          >
            ${tab.icon} ${tab.label}
          </button>
        `).join('')}
      </div>
    `;
  }

  /**
   * 渲染类型选择器
   */
  renderTypeSelector() {
    const types = [
      { id: 'wealth', label: '💰 财富榜', desc: '金币/钻石' },
      { id: 'summit', label: '🏔️ 登顶榜', desc: '登顶次数' },
      { id: 'streak', label: '🔥 连胜榜', desc: '最高连胜' },
      { id: 'battle', label: '⚔️ 对战榜', desc: '对战次数' }
    ];

    return `
      <div class="type-selector">
        ${types.map(type => `
          <button 
            class="type-btn ${this.state.currentType === type.id ? 'active' : ''}"
            data-type="${type.id}"
          >
            <span class="type-label">${type.label}</span>
            <span class="type-desc">${type.desc}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  /**
   * 渲染前三名
   */
  renderTop3() {
    const top3 = this.state.currentData.slice(0, 3);
    if (top3.length < 3) return '';

    const [first, second, third] = [top3[0], top3[1], top3[2]];

    return `
      <div class="top3-container">
        <div class="top3-podium">
          <div class="podium-item second">
            <div class="podium-rank">2</div>
            <div class="podium-avatar">
              <img src="${second.avatar}" alt="${second.nickname}">
              <div class="rank-badge silver">🥈</div>
            </div>
            <div class="podium-info">
              <div class="podium-name">${second.nickname}</div>
              <div class="podium-value">${second.valueFormatted}</div>
              ${this.renderTrend(second.trend, second.change)}
            </div>
          </div>
          
          <div class="podium-item first">
            <div class="crown">👑</div>
            <div class="podium-rank">1</div>
            <div class="podium-avatar">
              <img src="${first.avatar}" alt="${first.nickname}">
              <div class="rank-badge gold">🥇</div>
            </div>
            <div class="podium-info">
              <div class="podium-name">${first.nickname}</div>
              <div class="podium-value">${first.valueFormatted}</div>
              ${this.renderTrend(first.trend, first.change)}
            </div>
            ${first.rewards ? `
              <div class="top-reward">
                <span class="reward-icon">🏆</span>
                <span class="reward-title">${first.rewards.title}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="podium-item third">
            <div class="podium-rank">3</div>
            <div class="podium-avatar">
              <img src="${third.avatar}" alt="${third.nickname}">
              <div class="rank-badge bronze">🥉</div>
            </div>
            <div class="podium-info">
              <div class="podium-name">${third.nickname}</div>
              <div class="podium-value">${third.valueFormatted}</div>
              ${this.renderTrend(third.trend, third.change)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染趋势
   */
  renderTrend(trend, change) {
    const trendIcons = {
      up: '↑',
      down: '↓',
      stable: '→'
    };
    
    const trendClass = change?.direction || trend;
    const changeValue = change?.value ? Math.abs(change.value) : '';
    
    return `
      <div class="rank-trend ${trendClass}">
        <span class="trend-icon">${trendIcons[trendClass]}</span>
        ${changeValue ? `<span class="trend-value">${changeValue}</span>` : ''}
      </div>
    `;
  }

  /**
   * 渲染列表
   */
  renderList() {
    const listData = this.state.currentData.slice(3);
    
    if (this.state.isLoading && listData.length === 0) {
      return `<div class="loading-state">⏳ 加载中...</div>`;
    }

    return `
      <div class="leaderboard-list">
        ${listData.map(player => this.renderPlayerRow(player)).join('')}
      </div>
    `;
  }

  /**
   * 渲染玩家行
   */
  renderPlayerRow(player) {
    const isMe = player.isMe ? 'is-me' : '';
    const vipBadge = player.isVip ? '<span class="vip-badge">VIP</span>' : '';
    const friendBadge = player.isFriend ? '<span class="friend-badge">好友</span>' : '';

    return `
      <div class="player-row ${isMe}" data-player-id="${player.playerId}">
        <div class="player-rank">${player.rank}</div>
        <div class="player-avatar">
          <img src="${player.avatar}" alt="${player.nickname}">
          ${player.rank <= 10 ? `<div class="rank-glow rank-${player.rank}"></div>` : ''}
        </div>
        <div class="player-info">
          <div class="player-name">
            ${player.nickname}
            ${vipBadge}
            ${friendBadge}
          </div>
          <div class="player-meta">
            <span class="player-level">Lv.${player.level}</span>
            ${player.guild ? `<span class="player-guild">[${player.guild}]</span>` : ''}
            <span class="player-region">${player.region.name}</span>
          </div>
        </div>
        <div class="player-stats">
          <div class="player-value">${player.valueFormatted}</div>
          ${this.renderTrend(player.trend, player.change)}
        </div>
      </div>
    `;
  }

  /**
   * 渲染我的排名
   */
  renderMyRank() {
    if (!this.state.myRank) return '';

    const myRank = this.state.myRank;
    const rewardInfo = this.checkAvailableRewards();

    return `
      <div class="my-rank-section">
        <div class="my-rank-card">
          <div class="my-rank-header">我的排名</div>
          <div class="my-rank-content">
            <div class="my-rank-number">${myRank.rank}</div>
            <div class="my-rank-avatar">
              <img src="${myRank.avatar}" alt="我">
            </div>
            <div class="my-rank-info">
              <div class="my-rank-name">${myRank.nickname}</div>
              <div class="my-rank-value">${myRank.valueFormatted}</div>
            </div>
            ${rewardInfo ? `
              <button class="claim-reward-btn" onclick="leaderboard.claimReward('${rewardInfo.rewardKey}')">
                🎁 领取奖励
              </button>
            ` : ''}
          </div>
          ${myRank.nextRankPlayer ? `
            <div class="rank-gap">
              <span>距上一名还差 ${this.formatGap(myRank, myRank.nextRankPlayer)}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * 格式化差距
   */
  formatGap(current, target) {
    const gap = target.value - current.value;
    return this.formatValue(gap, this.state.currentType);
  }

  /**
   * 渲染操作按钮
   */
  renderActions() {
    return `
      <div class="leaderboard-actions">
        <button class="action-btn share-btn" onclick="leaderboard.showShareModal()">
          <span class="btn-icon">📤</span>
          <span class="btn-text">分享战绩</span>
        </button>
        <button class="action-btn rules-btn" onclick="leaderboard.showRules()">
          <span class="btn-icon">📋</span>
          <span class="btn-text">榜单规则</span>
        </button>
      </div>
    `;
  }

  /**
   * 绑定事件
   */
  bindEvents(container) {
    // 标签切换
    container.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.currentTarget.dataset.tab;
        this.switchTab(tab);
      });
    });

    // 类型切换
    container.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.currentTarget.dataset.type;
        this.switchType(type);
      });
    });
  }

  /**
   * ==================== 交互方法 ====================
   */

  /**
   * 切换标签
   */
  async switchTab(tab) {
    if (tab === this.state.currentTab) return;
    
    this.state.currentTab = tab;
    this.emit('tabChanged', { tab });
    
    await this.fetchLeaderboard(tab, this.state.currentType);
  }

  /**
   * 切换类型
   */
  async switchType(type) {
    if (type === this.state.currentType) return;
    
    this.state.currentType = type;
    this.emit('typeChanged', { type });
    
    await this.fetchLeaderboard(this.state.currentTab, type);
  }

  /**
   * 显示分享弹窗
   */
  showShareModal() {
    const shareContent = this.generateShareContent();
    
    if (!shareContent.success) {
      alert(shareContent.message);
      return;
    }

    // 创建分享弹窗
    const modal = document.createElement('div');
    modal.className = 'share-modal';
    modal.innerHTML = `
      <div class="share-overlay" onclick="this.parentElement.remove()"></div>
      <div class="share-content">
        <h3>分享你的战绩</h3>
        <div class="share-preview">
          <div class="share-card">
            <div class="share-rank">第 ${shareContent.data.rank} 名</div>
            <div class="share-type">${this.getLeaderboardTypeText(shareContent.data.type)}</div>
            <div class="share-value">${shareContent.data.value}</div>
          </div>
        </div>
        <div class="share-platforms">
          <button onclick="leaderboard.shareToPlatform('wechat')">微信</button>
          <button onclick="leaderboard.shareToPlatform('qq')">QQ</button>
          <button onclick="leaderboard.shareToPlatform('weibo')">微博</button>
          <button onclick="leaderboard.shareToPlatform('copy')">复制链接</button>
        </div>
        <button class="close-btn" onclick="this.closest('.share-modal').remove()">关闭</button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  /**
   * 显示规则
   */
  showRules() {
    const rules = `
📋 排行榜规则

【榜单类型】
• 全球榜：所有玩家的综合排名
• 好友榜：仅限好友间的排名
• 地区榜：同地区玩家的排名
• 周榜/月榜/赛季榜：周期内排名

【排行维度】
• 财富榜：金币和钻石总数
• 登顶榜：成功登顶命运塔次数
• 连胜榜：最高连胜纪录
• 对战榜：总对战场次

【奖励说明】
• 每周结算时，前100名可获得奖励
• 第1名：10000金币 + 500钻石 + 金冠称号
• 第2-3名：5000金币 + 300钻石 + 银冠称号
• 第4-10名：2000金币 + 150钻石
• 第11-50名：1000金币 + 80钻石
• 第51-100名：500金币 + 40钻石

【刷新机制】
• 榜单每30秒自动刷新
• 手动刷新无冷却时间
• 数据可能存在延迟
    `;
    
    alert(rules);
  }

  /**
   * ==================== 事件系统 ====================
   */

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
    
    const callbacks = this.eventListeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
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
      } catch (error) {
        console.error(`事件处理器错误: ${event}`, error);
      }
    });
  }

  /**
   * ==================== 工具方法 ====================
   */

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.stopAutoRefresh();
    this.eventListeners.clear();
    this.state.rankingsCache.clear();
    console.log('🏆 [TowerLeaderboard] 排行榜系统已销毁');
  }

  /**
   * 获取当前状态
   */
  getState() {
    return {
      currentTab: this.state.currentTab,
      currentType: this.state.currentType,
      myRank: this.state.myRank,
      lastRefresh: this.state.lastRefresh,
      isLoading: this.state.isLoading,
      playerCount: this.state.currentData.length
    };
  }
}

/**
 * ==================== CSS样式 ====================
 * 将以下样式添加到您的CSS文件中
 */
const LEADERBOARD_STYLES = `
/* 命运塔排行榜样式 */
.tower-leaderboard {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 800px;
  margin: 0 auto;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  padding: 20px;
  color: #fff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* 头部 */
.leaderboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.leaderboard-title {
  margin: 0;
  font-size: 24px;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.leaderboard-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  color: #888;
}

.refresh-btn {
  background: rgba(255, 215, 0, 0.2);
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover {
  background: rgba(255, 215, 0, 0.4);
  transform: rotate(180deg);
}

/* 标签页 */
.leaderboard-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.tab-btn {
  flex-shrink: 0;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
}

.tab-btn.active,
.tab-btn:hover {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-color: transparent;
}

/* 类型选择器 */
.type-selector {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.type-btn {
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #aaa;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.type-btn .type-label {
  display: block;
  font-weight: 600;
  margin-bottom: 4px;
}

.type-btn .type-desc {
  display: block;
  font-size: 11px;
  opacity: 0.7;
}

.type-btn.active,
.type-btn:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-color: transparent;
  transform: translateY(-2px);
}

/* 前三名 */
.top3-container {
  margin-bottom: 20px;
}

.top3-podium {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 15px;
  padding: 20px 0;
}

.podium-item {
  text-align: center;
  position: relative;
}

.podium-item.first {
  transform: scale(1.2);
  z-index: 3;
}

.podium-item.second {
  transform: translateY(20px);
}

.podium-item.third {
  transform: translateY(30px);
}

.podium-rank {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.podium-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 10px;
}

.podium-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid;
}

.podium-item.first .podium-avatar img {
  border-color: #ffd700;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.podium-item.second .podium-avatar img {
  border-color: #c0c0c0;
}

.podium-item.third .podium-avatar img {
  border-color: #cd7f32;
}

.rank-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  font-size: 24px;
}

.crown {
  font-size: 36px;
  position: absolute;
  top: -40px;
  left: 50%;
  transform: translateX(-50%);
  animation: float 2s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-5px); }
}

.podium-name {
  font-weight: 600;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.podium-value {
  color: #ffd700;
  font-size: 14px;
  font-weight: 600;
}

.top-reward {
  margin-top: 8px;
  padding: 4px 8px;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  border-radius: 12px;
  font-size: 11px;
  color: #333;
  font-weight: 600;
}

/* 排名趋势 */
.rank-trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 10px;
}

.rank-trend.up {
  color: #4ade80;
  background: rgba(74, 222, 128, 0.2);
}

.rank-trend.down {
  color: #f87171;
  background: rgba(248, 113, 113, 0.2);
}

.rank-trend.stable {
  color: #9ca3af;
  background: rgba(156, 163, 175, 0.2);
}

/* 列表 */
.leaderboard-list {
  max-height: 400px;
  overflow-y: auto;
}

.player-row {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.player-row:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(5px);
}

.player-row.is-me {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  border: 1px solid rgba(102, 126, 234, 0.5);
}

.player-rank {
  width: 40px;
  font-size: 18px;
  font-weight: bold;
  color: #888;
  text-align: center;
}

.player-avatar {
  position: relative;
  width: 48px;
  height: 48px;
  margin: 0 12px;
}

.player-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.rank-glow {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  opacity: 0.5;
  filter: blur(8px);
}

.rank-glow.rank-4 { background: #ff6b6b; }
.rank-glow.rank-5 { background: #4ecdc4; }
.rank-glow.rank-6 { background: #45b7d1; }
.rank-glow.rank-7 { background: #96ceb4; }
.rank-glow.rank-8 { background: #ffeaa7; }
.rank-glow.rank-9 { background: #dfe6e9; }
.rank-glow.rank-10 { background: #fd79a8; }

.player-info {
  flex: 1;
  min-width: 0;
}

.player-name {
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.vip-badge {
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  color: #333;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.friend-badge {
  background: #667eea;
  color: #fff;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
}

.player-meta {
  font-size: 12px;
  color: #888;
  display: flex;
  gap: 8px;
}

.player-stats {
  text-align: right;
}

.player-value {
  font-size: 16px;
  font-weight: 600;
  color: #ffd700;
  margin-bottom: 4px;
}

/* 我的排名 */
.my-rank-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.my-rank-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(102, 126, 234, 0.3);
}

.my-rank-header {
  font-size: 14px;
  color: #888;
  margin-bottom: 12px;
}

.my-rank-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.my-rank-number {
  font-size: 36px;
  font-weight: bold;
  color: #ffd700;
  min-width: 60px;
  text-align: center;
}

.my-rank-avatar {
  width: 56px;
  height: 56px;
}

.my-rank-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #667eea;
}

.my-rank-info {
  flex: 1;
}

.my-rank-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.my-rank-value {
  color: #ffd700;
  font-size: 14px;
}

.claim-reward-btn {
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  border: none;
  border-radius: 20px;
  padding: 10px 20px;
  font-weight: 600;
  color: #333;
  cursor: pointer;
  transition: all 0.3s;
}

.claim-reward-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(255, 215, 0, 0.4);
}

.rank-gap {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  color: #888;
  text-align: center;
}

/* 操作按钮 */
.leaderboard-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.action-btn {
  flex: 1;
  padding: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.share-btn {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.share-btn:hover {
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
}

/* 分享弹窗 */
.share-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
}

.share-content {
  position: relative;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.share-preview {
  margin: 20px 0;
}

.share-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 30px;
}

.share-rank {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
}

.share-type {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.share-value {
  font-size: 24px;
  font-weight: 600;
  color: #ffd700;
}

.share-platforms {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.share-platforms button {
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.share-platforms button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.close-btn {
  width: 100%;
  padding: 14px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 10px;
  color: #fff;
  cursor: pointer;
}

/* 加载状态 */
.loading-state {
  text-align: center;
  padding: 40px;
  color: #888;
}

/* 滚动条样式 */
.leaderboard-list::-webkit-scrollbar {
  width: 6px;
}

.leaderboard-list::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.leaderboard-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* 响应式 */
@media (max-width: 600px) {
  .type-selector {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .top3-podium {
    gap: 10px;
  }
  
  .podium-avatar {
    width: 60px;
    height: 60px;
  }
  
  .podium-item.first {
    transform: scale(1.1);
  }
}
`;

/**
 * ==================== 使用示例 ====================
 * 
 * // 1. 基础使用
 * const leaderboard = new TowerLeaderboard({
 *   currentPlayerId: 'player_001',
 *   region: 'CN',
 *   enableMock: true  // 开发时使用模拟数据
 * });
 * 
 * // 2. 渲染到页面
 * leaderboard.render('leaderboard-container');
 * 
 * // 3. 监听事件
 * leaderboard.on('dataLoaded', ({ data, fromCache }) => {
 *   console.log('数据已加载:', data.length, '条');
 * });
 * 
 * leaderboard.on('myRankLoaded', (myRank) => {
 *   console.log('我的排名:', myRank.rank);
 * });
 * 
 * // 4. 切换榜单
 * leaderboard.switchTab('friends');  // 切换到好友榜
 * leaderboard.switchType('streak');  // 切换到连胜榜
 * 
 * // 5. 手动刷新
 * leaderboard.refresh();
 * 
 * // 6. 生成分享内容
 * const share = leaderboard.generateShareContent();
 * console.log(share.data);
 * 
 * // 7. 销毁实例
 * leaderboard.destroy();
 */

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TowerLeaderboard, LEADERBOARD_STYLES };
}

// 浏览器环境
if (typeof window !== 'undefined') {
  window.TowerLeaderboard = TowerLeaderboard;
  window.LEADERBOARD_STYLES = LEADERBOARD_STYLES;
}
