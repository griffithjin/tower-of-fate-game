/**
 * 命运塔游戏 - 数据分析看板系统
 * Tower of Fate - Analytics Dashboard System
 * 
 * @author 小金蛇
 * @version 1.0.0
 * @description 实时数据看板，集成ECharts图表，接入analytics.js埋点数据
 */

// ============================================
// 命运塔数据分析看板 - 主类
// ============================================

class TowerDashboard {
  constructor(config = {}) {
    this.config = {
      containerId: config.containerId || 'dashboard-container',
      refreshInterval: config.refreshInterval || 30000, // 30秒刷新
      analyticsEndpoint: config.analyticsEndpoint || '/api/analytics',
      wsEndpoint: config.wsEndpoint || 'wss://analytics.tower-of-fate.com/ws',
      timezone: config.timezone || 'Asia/Shanghai',
      currency: config.currency || 'USD',
      locale: config.locale || 'zh-CN',
      ...config
    };

    // 状态管理
    this.state = {
      isLoading: false,
      isConnected: false,
      currentView: 'overview',
      dateRange: '7d',
      charts: new Map(),
      websocket: null,
      realtimeData: null,
      lastUpdate: null
    };

    // 缓存数据
    this.cache = {
      userStats: null,
      revenueStats: null,
      gameStats: null,
      retentionData: null
    };

    // 初始化
    this._init();
  }

  // ==================== 初始化 ====================

  _init() {
    this._initContainer();
    this._initWebSocket();
    this._initEventListeners();
    this._loadInitialData();
    this._startAutoRefresh();
    
    console.log('[TowerDashboard] Dashboard initialized');
  }

  _initContainer() {
    const container = document.getElementById(this.config.containerId);
    if (!container) {
      console.error(`[TowerDashboard] Container #${this.config.containerId} not found`);
      return;
    }
    
    this.container = container;
    this._renderLayout();
  }

  _renderLayout() {
    this.container.innerHTML = `
      <div class="tower-dashboard">
        <!-- 头部 -->
        <header class="dashboard-header">
          <div class="header-left">
            <h1>🏰 命运塔数据分析看板</h1>
            <span class="status-indicator ${this.state.isConnected ? 'connected' : 'disconnected'}">
              ${this.state.isConnected ? '● 实时连接' : '○ 离线'}
            </span>
          </div>
          <div class="header-right">
            <div class="date-range-selector">
              <button data-range="24h" class="${this.state.dateRange === '24h' ? 'active' : ''}">24小时</button>
              <button data-range="7d" class="${this.state.dateRange === '7d' ? 'active' : ''}">7天</button>
              <button data-range="30d" class="${this.state.dateRange === '30d' ? 'active' : ''}">30天</button>
              <button data-range="90d" class="${this.state.dateRange === '90d' ? 'active' : ''}">90天</button>
            </div>
            <button class="refresh-btn" id="manual-refresh">🔄</button>
            <span class="last-update">最后更新: ${this._formatTime(new Date())}</span>
          </div>
        </header>

        <!-- 导航标签 -->
        <nav class="dashboard-nav">
          <button data-view="overview" class="nav-item active">📊 实时概览</button>
          <button data-view="users" class="nav-item">👥 用户分析</button>
          <button data-view="revenue" class="nav-item">💰 收入分析</button>
          <button data-view="game" class="nav-item">🎮 游戏数据</button>
        </nav>

        <!-- 主内容区 -->
        <main class="dashboard-content">
          <!-- 实时概览视图 -->
          <div class="view-section ${this.state.currentView === 'overview' ? 'active' : ''}" id="view-overview">
            <div class="kpi-cards">
              <div class="kpi-card" id="kpi-online">
                <div class="kpi-icon">👥</div>
                <div class="kpi-content">
                  <span class="kpi-label">在线人数</span>
                  <span class="kpi-value" id="online-count">--</span>
                  <span class="kpi-change" id="online-trend">--</span>
                </div>
              </div>
              <div class="kpi-card" id="kpi-matches">
                <div class="kpi-icon">⚔️</div>
                <div class="kpi-content">
                  <span class="kpi-label">当前对局数</span>
                  <span class="kpi-value" id="match-count">--</span>
                  <span class="kpi-change" id="match-trend">--</span>
                </div>
              </div>
              <div class="kpi-card" id="kpi-newusers">
                <div class="kpi-icon">🆕</div>
                <div class="kpi-content">
                  <span class="kpi-label">今日新增用户</span>
                  <span class="kpi-value" id="new-users">--</span>
                  <span class="kpi-change" id="newusers-trend">--</span>
                </div>
              </div>
              <div class="kpi-card" id="kpi-revenue">
                <div class="kpi-icon">💵</div>
                <div class="kpi-content">
                  <span class="kpi-label">今日收入 (USD)</span>
                  <span class="kpi-value" id="today-revenue">--</span>
                  <span class="kpi-change" id="revenue-trend">--</span>
                </div>
              </div>
              <div class="kpi-card" id="kpi-retention">
                <div class="kpi-icon">📈</div>
                <div class="kpi-content">
                  <span class="kpi-label">7日留存率</span>
                  <span class="kpi-value" id="retention-7d">--</span>
                  <span class="kpi-change" id="retention-trend">--</span>
                </div>
              </div>
              <div class="kpi-card" id="kpi-conversion">
                <div class="kpi-icon">🎯</div>
                <div class="kpi-content">
                  <span class="kpi-label">付费转化率</span>
                  <span class="kpi-value" id="conversion-rate">--</span>
                  <span class="kpi-change" id="conversion-trend">--</span>
                </div>
              </div>
            </div>

            <div class="charts-grid">
              <div class="chart-card large">
                <h3>实时在线趋势 (24小时)</h3>
                <div class="chart-container" id="chart-realtime-trend"></div>
              </div>
              <div class="chart-card">
                <h3>收入构成</h3>
                <div class="chart-container" id="chart-revenue-composition"></div>
              </div>
              <div class="chart-card">
                <h3>用户活跃度热力图</h3>
                <div class="chart-container" id="chart-activity-heatmap"></div>
              </div>
            </div>
          </div>

          <!-- 用户分析视图 -->
          <div class="view-section ${this.state.currentView === 'users' ? 'active' : ''}" id="view-users">
            <div class="charts-grid">
              <div class="chart-card large">
                <h3>DAU/MAU 趋势</h3>
                <div class="chart-container" id="chart-dau-mau"></div>
              </div>
              <div class="chart-card">
                <h3>用户来源分析</h3>
                <div class="chart-container" id="chart-user-sources"></div>
              </div>
              <div class="chart-card">
                <h3>设备分布</h3>
                <div class="chart-container" id="chart-device-distribution"></div>
              </div>
              <div class="chart-card">
                <h3>地域分布 TOP10</h3>
                <div class="chart-container" id="chart-geo-distribution"></div>
              </div>
              <div class="chart-card">
                <h3>用户等级分布</h3>
                <div class="chart-container" id="chart-level-distribution"></div>
              </div>
              <div class="chart-card">
                <h3>留存率趋势</h3>
                <div class="chart-container" id="chart-retention-trend"></div>
              </div>
            </div>
          </div>

          <!-- 收入分析视图 -->
          <div class="view-section ${this.state.currentView === 'revenue' ? 'active' : ''}" id="view-revenue">
            <div class="charts-grid">
              <div class="chart-card large">
                <h3>日收入趋势</h3>
                <div class="chart-container" id="chart-daily-revenue"></div>
              </div>
              <div class="chart-card">
                <h3>ARPU / ARPPU 趋势</h3>
                <div class="chart-container" id="chart-arpu-arppu"></div>
              </div>
              <div class="chart-card">
                <h3>付费用户 LTV</h3>
                <div class="chart-container" id="chart-ltv"></div>
              </div>
              <div class="chart-card">
                <h3>商品销售排行 TOP10</h3>
                <div class="chart-container" id="chart-product-ranking"></div>
              </div>
              <div class="chart-card large">
                <h3>收入预测模型</h3>
                <div class="chart-container" id="chart-revenue-forecast"></div>
              </div>
            </div>
          </div>

          <!-- 游戏数据视图 -->
          <div class="view-section ${this.state.currentView === 'game' ? 'active' : ''}" id="view-game">
            <div class="charts-grid">
              <div class="chart-card">
                <h3>对局时长分布</h3>
                <div class="chart-container" id="chart-match-duration"></div>
              </div>
              <div class="chart-card">
                <h3>登顶成功率</h3>
                <div class="chart-container" id="chart-summit-success"></div>
              </div>
              <div class="chart-card">
                <h3>激怒牌使用频率 TOP10</h3>
                <div class="chart-container" id="chart-rage-cards"></div>
              </div>
              <div class="chart-card">
                <h3>各塔使用热度</h3>
                <div class="chart-container" id="chart-tower-popularity"></div>
              </div>
              <div class="chart-card large">
                <h3>Bug/异常报告趋势</h3>
                <div class="chart-container" id="chart-bug-reports"></div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>
        :root {
          --primary-color: #6366f1;
          --secondary-color: #8b5cf6;
          --success-color: #10b981;
          --warning-color: #f59e0b;
          --danger-color: #ef4444;
          --bg-dark: #0f172a;
          --bg-card: #1e293b;
          --bg-hover: #334155;
          --text-primary: #f1f5f9;
          --text-secondary: #94a3b8;
          --border-color: #334155;
        }

        .tower-dashboard {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: var(--bg-dark);
          color: var(--text-primary);
          min-height: 100vh;
          padding: 20px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: var(--bg-card);
          border-radius: 12px;
          margin-bottom: 20px;
          border: 1px solid var(--border-color);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .header-left h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .status-indicator {
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: 20px;
          background: var(--bg-dark);
        }

        .status-indicator.connected {
          color: var(--success-color);
        }

        .status-indicator.disconnected {
          color: var(--danger-color);
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .date-range-selector {
          display: flex;
          gap: 4px;
          background: var(--bg-dark);
          padding: 4px;
          border-radius: 8px;
        }

        .date-range-selector button {
          padding: 6px 12px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .date-range-selector button:hover {
          color: var(--text-primary);
        }

        .date-range-selector button.active {
          background: var(--primary-color);
          color: white;
        }

        .refresh-btn {
          padding: 8px 12px;
          border: 1px solid var(--border-color);
          background: var(--bg-dark);
          color: var(--text-secondary);
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .last-update {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .dashboard-nav {
          display: flex;
          gap: 8px;
          margin-bottom: 20px;
          padding: 4px;
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .nav-item {
          flex: 1;
          padding: 12px 24px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-item:hover {
          color: var(--text-primary);
          background: var(--bg-hover);
        }

        .nav-item.active {
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
        }

        .dashboard-content {
          min-height: calc(100vh - 200px);
        }

        .view-section {
          display: none;
          animation: fadeIn 0.3s ease-in-out;
        }

        .view-section.active {
          display: block;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .kpi-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .kpi-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          transition: all 0.2s;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
          border-color: var(--primary-color);
        }

        .kpi-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          border-radius: 12px;
        }

        .kpi-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .kpi-label {
          font-size: 12px;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .kpi-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
        }

        .kpi-change {
          font-size: 12px;
          font-weight: 600;
        }

        .kpi-change.positive {
          color: var(--success-color);
        }

        .kpi-change.negative {
          color: var(--danger-color);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 20px;
        }

        .chart-card {
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border-color);
          padding: 20px;
        }

        .chart-card.large {
          grid-column: span 2;
        }

        @media (max-width: 768px) {
          .chart-card.large {
            grid-column: span 1;
          }
          
          .charts-grid {
            grid-template-columns: 1fr;
          }
          
          .kpi-cards {
            grid-template-columns: 1fr;
          }
        }

        .chart-card h3 {
          margin: 0 0 16px 0;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chart-container {
          width: 100%;
          height: 300px;
        }

        .chart-card.large .chart-container {
          height: 350px;
        }

        .loading-overlay {
          position: absolute;
          inset: 0;
          background: var(--bg-card);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          z-index: 10;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top-color: var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  // ==================== WebSocket 实时连接 ====================

  _initWebSocket() {
    if (!window.WebSocket) {
      console.warn('[TowerDashboard] WebSocket not supported');
      return;
    }

    try {
      this.state.websocket = new WebSocket(this.config.wsEndpoint);
      
      this.state.websocket.onopen = () => {
        this.state.isConnected = true;
        this._updateConnectionStatus();
        console.log('[TowerDashboard] WebSocket connected');
      };

      this.state.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this._handleRealtimeData(data);
      };

      this.state.websocket.onclose = () => {
        this.state.isConnected = false;
        this._updateConnectionStatus();
        // 5秒后重连
        setTimeout(() => this._initWebSocket(), 5000);
      };

      this.state.websocket.onerror = (error) => {
        console.error('[TowerDashboard] WebSocket error:', error);
      };
    } catch (error) {
      console.error('[TowerDashboard] WebSocket init error:', error);
    }
  }

  _handleRealtimeData(data) {
    if (data.type === 'realtime_metrics') {
      this.state.realtimeData = data.payload;
      this._updateKPICards(data.payload);
    }
  }

  _updateConnectionStatus() {
    const indicator = this.container.querySelector('.status-indicator');
    if (indicator) {
      indicator.className = `status-indicator ${this.state.isConnected ? 'connected' : 'disconnected'}`;
      indicator.textContent = this.state.isConnected ? '● 实时连接' : '○ 离线';
    }
  }

  // ==================== 事件监听 ====================

  _initEventListeners() {
    // 导航切换
    this.container.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this._switchView(view);
      });
    });

    // 日期范围切换
    this.container.querySelectorAll('.date-range-selector button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const range = e.target.dataset.range;
        this._changeDateRange(range);
      });
    });

    // 手动刷新
    const refreshBtn = this.container.querySelector('#manual-refresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this._refreshData());
    }
  }

  _switchView(view) {
    this.state.currentView = view;
    
    // 更新导航按钮状态
    this.container.querySelectorAll('.nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // 切换视图显示
    this.container.querySelectorAll('.view-section').forEach(section => {
      section.classList.toggle('active', section.id === `view-${view}`);
    });

    // 延迟初始化图表，确保容器可见
    setTimeout(() => this._initChartsForView(view), 100);
  }

  _changeDateRange(range) {
    this.state.dateRange = range;
    
    this.container.querySelectorAll('.date-range-selector button').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.range === range);
    });

    this._refreshData();
  }

  // ==================== 数据加载 ====================

  async _loadInitialData() {
    await this._fetchDashboardData();
    this._initChartsForView('overview');
  }

  async _fetchDashboardData() {
    try {
      this.state.isLoading = true;

      // 从analytics.js获取数据
      const analytics = window.getAnalytics ? window.getAnalytics() : null;
      
      // 模拟API调用（实际项目中应替换为真实API）
      const mockData = this._generateMockData();
      
      this.cache = {
        userStats: mockData.userStats,
        revenueStats: mockData.revenueStats,
        gameStats: mockData.gameStats,
        retentionData: mockData.retentionData,
        realtimeMetrics: mockData.realtimeMetrics
      };

      this._updateKPICards(mockData.realtimeMetrics);
      this.state.lastUpdate = new Date();
      
      this._updateLastUpdateTime();
    } catch (error) {
      console.error('[TowerDashboard] Data fetch error:', error);
    } finally {
      this.state.isLoading = false;
    }
  }

  _generateMockData() {
    const now = new Date();
    const days = this.state.dateRange === '24h' ? 1 : 
                 this.state.dateRange === '7d' ? 7 : 
                 this.state.dateRange === '30d' ? 30 : 90;

    return {
      realtimeMetrics: {
        onlineUsers: Math.floor(Math.random() * 2000) + 3000,
        activeMatches: Math.floor(Math.random() * 500) + 800,
        newUsersToday: Math.floor(Math.random() * 200) + 150,
        revenueToday: Math.floor(Math.random() * 3000) + 2000,
        retention7d: (Math.random() * 15 + 25).toFixed(1),
        conversionRate: (Math.random() * 3 + 4).toFixed(1)
      },
      userStats: this._generateUserStats(days),
      revenueStats: this._generateRevenueStats(days),
      gameStats: this._generateGameStats(days),
      retentionData: this._generateRetentionData()
    };
  }

  _generateUserStats(days) {
    const dates = [];
    const dau = [];
    const mau = [];
    const newUsers = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
      
      dau.push(Math.floor(Math.random() * 2000) + 3000);
      mau.push(Math.floor(Math.random() * 5000) + 15000);
      newUsers.push(Math.floor(Math.random() * 200) + 100);
    }

    return {
      dates,
      dau,
      mau,
      newUsers,
      sources: [
        { name: '自然搜索', value: 35 },
        { name: '社交媒体', value: 25 },
        { name: '广告投放', value: 20 },
        { name: '推荐链接', value: 12 },
        { name: '其他', value: 8 }
      ],
      devices: [
        { name: 'iOS', value: 45 },
        { name: 'Android', value: 38 },
        { name: 'Web', value: 12 },
        { name: 'PC', value: 5 }
      ],
      geo: [
        { name: '中国', value: 4500 },
        { name: '美国', value: 2800 },
        { name: '日本', value: 1200 },
        { name: '韩国', value: 900 },
        { name: '德国', value: 600 },
        { name: '英国', value: 500 },
        { name: '法国', value: 450 },
        { name: '加拿大', value: 400 },
        { name: '澳大利亚', value: 350 },
        { name: '其他', value: 800 }
      ],
      levels: [
        { name: '1-10级', value: 2500 },
        { name: '11-20级', value: 1800 },
        { name: '21-30级', value: 1200 },
        { name: '31-40级', value: 800 },
        { name: '41-50级', value: 500 },
        { name: '50级以上', value: 300 }
      ]
    };
  }

  _generateRevenueStats(days) {
    const dates = [];
    const revenue = [];
    const arpu = [];
    const arppu = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
      
      revenue.push(Math.floor(Math.random() * 2000) + 3000);
      arpu.push((Math.random() * 0.5 + 0.8).toFixed(2));
      arppu.push((Math.random() * 5 + 15).toFixed(2));
    }

    return {
      dates,
      revenue,
      arpu,
      arppu,
      ltv: {
        days: ['Day 1', 'Day 7', 'Day 14', 'Day 30', 'Day 60', 'Day 90'],
        values: [0.5, 2.1, 4.5, 8.2, 12.5, 18.3]
      },
      products: [
        { name: '月卡', sales: 850, revenue: 8500 },
        { name: '周卡', sales: 620, revenue: 3100 },
        { name: '钻石礼包(大)', sales: 380, revenue: 7600 },
        { name: '钻石礼包(中)', sales: 520, revenue: 5200 },
        { name: '钻石礼包(小)', sales: 780, revenue: 3900 },
        { name: '新手礼包', sales: 450, revenue: 2250 },
        { name: '限定皮肤', sales: 320, revenue: 6400 },
        { name: '复活币', sales: 1200, revenue: 2400 },
        { name: '体力药水', sales: 980, revenue: 1960 },
        { name: '宝箱钥匙', sales: 650, revenue: 1950 }
      ],
      composition: [
        { name: '订阅', value: 35 },
        { name: '钻石', value: 28 },
        { name: '道具', value: 22 },
        { name: '皮肤', value: 15 }
      ]
    };
  }

  _generateGameStats(days) {
    const matchDurations = [
      { range: '0-5分钟', count: 450 },
      { range: '5-10分钟', count: 1200 },
      { range: '10-15分钟', count: 1800 },
      { range: '15-20分钟', count: 1500 },
      { range: '20-30分钟', count: 800 },
      { range: '30分钟以上', count: 250 }
    ];

    const rageCards = [
      { name: '狂怒一击', usage: 8500 },
      { name: '暴走冲锋', usage: 7200 },
      { name: '愤怒咆哮', usage: 6800 },
      { name: '毁灭风暴', usage: 5500 },
      { name: '狂暴之刃', usage: 4800 },
      { name: '怒火中烧', usage: 4200 },
      { name: '战意沸腾', usage: 3800 },
      { name: '暴虐打击', usage: 3200 },
      { name: '狂战士之血', usage: 2800 },
      { name: '怒气爆发', usage: 2400 }
    ];

    const towers = [
      { name: '烈焰塔', popularity: 95 },
      { name: '冰霜塔', popularity: 88 },
      { name: '雷电塔', popularity: 82 },
      { name: '暗影塔', popularity: 76 },
      { name: '圣光塔', popularity: 71 },
      { name: '自然塔', popularity: 65 },
      { name: '机械塔', popularity: 58 },
      { name: '虚空塔', popularity: 52 }
    ];

    return {
      matchDurations,
      rageCards,
      towers,
      summitSuccess: {
        success: 65,
        failure: 35
      }
    };
  }

  _generateRetentionData() {
    return {
      cohorts: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06'],
      d1: [45, 48, 46, 50, 47, 49],
      d7: [28, 30, 29, 32, 31, 33],
      d30: [15, 16, 15, 18, 17, 19]
    };
  }

  _refreshData() {
    this._fetchDashboardData().then(() => {
      this._updateCharts();
    });
  }

  _startAutoRefresh() {
    setInterval(() => {
      this._refreshData();
    }, this.config.refreshInterval);
  }

  // ==================== KPI 卡片更新 ====================

  _updateKPICards(data) {
    if (!data) return;

    const elements = {
      'online-count': data.onlineUsers?.toLocaleString(),
      'match-count': data.activeMatches?.toLocaleString(),
      'new-users': data.newUsersToday?.toLocaleString(),
      'today-revenue': `$${data.revenueToday?.toLocaleString()}`,
      'retention-7d': `${data.retention7d}%`,
      'conversion-rate': `${data.conversionRate}%`
    };

    Object.entries(elements).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el && value) {
        el.textContent = value;
      }
    });

    // 更新趋势（模拟）
    const trends = ['online-trend', 'match-trend', 'newusers-trend', 'revenue-trend', 'retention-trend', 'conversion-trend'];
    trends.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const isPositive = Math.random() > 0.4;
        const change = (Math.random() * 10 + 1).toFixed(1);
        el.textContent = `${isPositive ? '↑' : '↓'} ${change}%`;
        el.className = `kpi-change ${isPositive ? 'positive' : 'negative'}`;
      }
    });
  }

  _updateLastUpdateTime() {
    const el = this.container.querySelector('.last-update');
    if (el && this.state.lastUpdate) {
      el.textContent = `最后更新: ${this._formatTime(this.state.lastUpdate)}`;
    }
  }

  _formatTime(date) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  // ==================== 图表初始化 ====================

  _initChartsForView(view) {
    if (!window.echarts) {
      console.error('[TowerDashboard] ECharts not loaded');
      return;
    }

    switch (view) {
      case 'overview':
        this._initOverviewCharts();
        break;
      case 'users':
        this._initUserCharts();
        break;
      case 'revenue':
        this._initRevenueCharts();
        break;
      case 'game':
        this._initGameCharts();
        break;
    }
  }

  _initOverviewCharts() {
    this._renderRealtimeTrendChart();
    this._renderRevenueCompositionChart();
    this._renderActivityHeatmap();
  }

  _initUserCharts() {
    this._renderDAUMAUChart();
    this._renderUserSourcesChart();
    this._renderDeviceChart();
    this._renderGeoChart();
    this._renderLevelChart();
    this._renderRetentionTrendChart();
  }

  _initRevenueCharts() {
    this._renderDailyRevenueChart();
    this._renderARPUARPPUChart();
    this._renderLTVChart();
    this._renderProductRankingChart();
    this._renderRevenueForecastChart();
  }

  _initGameCharts() {
    this._renderMatchDurationChart();
    this._renderSummitSuccessChart();
    this._renderRageCardsChart();
    this._renderTowerPopularityChart();
    this._renderBugReportsChart();
  }

  // ==================== 图表渲染 - 实时概览 ====================

  _renderRealtimeTrendChart() {
    const container = document.getElementById('chart-realtime-trend');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('realtime-trend', chart);

    // 生成24小时数据
    const hours = [];
    const onlineData = [];
    const matchData = [];

    for (let i = 0; i < 24; i++) {
      hours.push(`${i}:00`);
      onlineData.push(Math.floor(Math.random() * 1000) + 2500);
      matchData.push(Math.floor(Math.random() * 300) + 600);
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        data: ['在线人数', '对局数'],
        textStyle: { color: '#94a3b8' },
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: hours,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      yAxis: [
        {
          type: 'value',
          name: '在线人数',
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8' },
          splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
        },
        {
          type: 'value',
          name: '对局数',
          axisLine: { lineStyle: { color: '#334155' } },
          axisLabel: { color: '#94a3b8' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '在线人数',
          type: 'line',
          smooth: true,
          data: onlineData,
          itemStyle: { color: '#6366f1' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
            ])
          }
        },
        {
          name: '对局数',
          type: 'line',
          smooth: true,
          yAxisIndex: 1,
          data: matchData,
          itemStyle: { color: '#10b981' }
        }
      ]
    };

    chart.setOption(option);
  }

  _renderRevenueCompositionChart() {
    const container = document.getElementById('chart-revenue-composition');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('revenue-composition', chart);

    const data = this.cache.revenueStats?.composition || [
      { name: '订阅', value: 35 },
      { name: '钻石', value: 28 },
      { name: '道具', value: 22 },
      { name: '皮肤', value: 15 }
    ];

    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' },
        formatter: '{b}: {c}% ({d}%)'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#94a3b8' }
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#1e293b',
            borderWidth: 2
          },
          label: { show: false },
          data: data.map((item, index) => ({
            ...item,
            itemStyle: {
              color: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'][index]
            }
          }))
        }
      ]
    };

    chart.setOption(option);
  }

  _renderActivityHeatmap() {
    const container = document.getElementById('chart-activity-heatmap');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('activity-heatmap', chart);

    // 生成7天 x 24小时的热力图数据
    const hours = Array.from({ length: 24 }, (_, i) => `${i}时`);
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
    const data = [];

    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 24; j++) {
        const value = Math.floor(Math.random() * 100);
        data.push([j, i, value]);
      }
    }

    const option = {
      tooltip: {
        position: 'top',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' },
        formatter: (params) => {
          return `${days[params.value[1]]} ${hours[params.value[0]]}<br/>活跃度: ${params.value[2]}`;
        }
      },
      grid: {
        top: '10%',
        bottom: '15%'
      },
      xAxis: {
        type: 'category',
        data: hours,
        splitArea: { show: true },
        axisLabel: { color: '#94a3b8', fontSize: 10 }
      },
      yAxis: {
        type: 'category',
        data: days,
        splitArea: { show: true },
        axisLabel: { color: '#94a3b8' }
      },
      visualMap: {
        min: 0,
        max: 100,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '0%',
        inRange: {
          color: ['#1e293b', '#6366f1', '#8b5cf6', '#f59e0b']
        },
        textStyle: { color: '#94a3b8' }
      },
      series: [{
        type: 'heatmap',
        data: data,
        label: { show: false },
        itemStyle: {
          borderColor: '#0f172a',
          borderWidth: 1
        }
      }]
    };

    chart.setOption(option);
  }

  // ==================== 图表渲染 - 用户分析 ====================

  _renderDAUMAUChart() {
    const container = document.getElementById('chart-dau-mau');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('dau-mau', chart);

    const userStats = this.cache.userStats;
    if (!userStats) return;

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        data: ['DAU', 'MAU'],
        textStyle: { color: '#94a3b8' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: userStats.dates,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      series: [
        {
          name: 'DAU',
          type: 'line',
          smooth: true,
          data: userStats.dau,
          itemStyle: { color: '#6366f1' }
        },
        {
          name: 'MAU',
          type: 'line',
          smooth: true,
          data: userStats.mau,
          itemStyle: { color: '#8b5cf6' }
        }
      ]
    };

    chart.setOption(option);
  }

  _renderUserSourcesChart() {
    const container = document.getElementById('chart-user-sources');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('user-sources', chart);

    const data = this.cache.userStats?.sources || [];

    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      series: [{
        type: 'pie',
        radius: '70%',
        data: data.map((item, index) => ({
          ...item,
          itemStyle: {
            color: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index]
          }
        })),
        label: { color: '#94a3b8' }
      }]
    };

    chart.setOption(option);
  }

  _renderDeviceChart() {
    const container = document.getElementById('chart-device-distribution');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('device-distribution', chart);

    const data = this.cache.userStats?.devices || [];

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: data.map(d => d.name),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      series: [{
        type: 'bar',
        data: data.map((d, i) => ({
          value: d.value,
          itemStyle: {
            color: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b'][i]
          }
        })),
        barWidth: '60%'
      }]
    };

    chart.setOption(option);
  }

  _renderGeoChart() {
    const container = document.getElementById('chart-geo-distribution');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('geo-distribution', chart);

    const data = this.cache.userStats?.geo?.slice(0, 10) || [];

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: data.map(d => d.name).reverse(),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      series: [{
        type: 'bar',
        data: data.map(d => d.value).reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#6366f1' },
            { offset: 1, color: '#8b5cf6' }
          ])
        },
        barWidth: '60%'
      }]
    };

    chart.setOption(option);
  }

  _renderLevelChart() {
    const container = document.getElementById('chart-level-distribution');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('level-distribution', chart);

    const data = this.cache.userStats?.levels || [];

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.name),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', rotate: 30 }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      series: [{
        type: 'bar',
        data: data.map((d, i) => ({
          value: d.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][i] },
              { offset: 1, color: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][i] + '80' }
            ])
          }
        })),
        barWidth: '60%'
      }]
    };

    chart.setOption(option);
  }

  _renderRetentionTrendChart() {
    const container = document.getElementById('chart-retention-trend');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('retention-trend', chart);

    const data = this.cache.retentionData;
    if (!data) return;

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        data: ['次日留存', '7日留存', '30日留存'],
        textStyle: { color: '#94a3b8' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.cohorts,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: '{value}%', color: '#94a3b8' },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      series: [
        {
          name: '次日留存',
          type: 'line',
          data: data.d1,
          itemStyle: { color: '#6366f1' }
        },
        {
          name: '7日留存',
          type: 'line',
          data: data.d7,
          itemStyle: { color: '#8b5cf6' }
        },
        {
          name: '30日留存',
          type: 'line',
          data: data.d30,
          itemStyle: { color: '#10b981' }
        }
      ]
    };

    chart.setOption(option);
  }

  // ==================== 图表渲染 - 收入分析 ====================

  _renderDailyRevenueChart() {
    const container = document.getElementById('chart-daily-revenue');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('daily-revenue', chart);

    const revenueStats = this.cache.revenueStats;
    if (!revenueStats) return;

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' },
        formatter: (params) => {
          return `${params[0].name}<br/>收入: $${params[0].value.toLocaleString()}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: revenueStats.dates,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { 
          formatter: (value) => `$${value}`,
          color: '#94a3b8'
        },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      series: [{
        type: 'bar',
        data: revenueStats.revenue,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#10b981' },
            { offset: 1, color: '#10b98150' }
          ])
        },
        barWidth: '60%'
      }]
    };

    chart.setOption(option);
  }

  _renderARPUARPPUChart() {
    const container = document.getElementById('chart-arpu-arppu');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('arpu-arppu', chart);

    const revenueStats = this.cache.revenueStats;
    if (!revenueStats) return;

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        data: ['ARPU', 'ARPPU'],
        textStyle: { color: '#94a3b8' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: revenueStats.dates,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { 
          formatter: '${value}',
          color: '#94a3b8'
        },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      series: [
        {
          name: 'ARPU',
          type: 'line',
          smooth: true,
          data: revenueStats.arpu,
          itemStyle: { color: '#6366f1' }
        },
        {
          name: 'ARPPU',
          type: 'line',
          smooth: true,
          data: revenueStats.arppu,
          itemStyle: { color: '#f59e0b' }
        }
      ]
    };

    chart.setOption(option);
  }

  _renderLTVChart() {
    const container = document.getElementById('chart-ltv');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('ltv', chart);

    const ltvData = this.cache.revenueStats?.ltv;
    if (!ltvData) return;

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' },
        formatter: (params) => {
          return `${params[0].name}<br/>LTV: $${params[0].value}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ltvData.days,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { 
          formatter: '${value}',
          color: '#94a3b8'
        },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      series: [{
        type: 'line',
        smooth: true,
        data: ltvData.values,
        itemStyle: { color: '#8b5cf6' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
          ])
        }
      }]
    };

    chart.setOption(option);
  }

  _renderProductRankingChart() {
    const container = document.getElementById('chart-product-ranking');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('product-ranking', chart);

    const products = this.cache.revenueStats?.products || [];

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' },
        formatter: (params) => {
          const data = products[products.length - 1 - params[0].dataIndex];
          return `${data.name}<br/>销量: ${data.sales}<br/>收入: $${data.revenue}`;
        }
      },
      grid: {
        left: '3%',
        right: '15%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: products.map(p => p.name).reverse(),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      series: [{
        type: 'bar',
        data: products.map(p => p.revenue).reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#6366f1' },
            { offset: 1, color: '#8b5cf6' }
          ])
        },
        barWidth: '60%'
      }]
    };

    chart.setOption(option);
  }

  _renderRevenueForecastChart() {
    const container = document.getElementById('chart-revenue-forecast');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('revenue-forecast', chart);

    const revenueStats = this.cache.revenueStats;
    if (!revenueStats) return;

    // 历史数据 + 预测数据
    const historical = revenueStats.revenue.slice(-14);
    const historicalDates = revenueStats.dates.slice(-14);
    
    // 生成预测数据（基于简单线性回归）
    const forecast = [];
    const forecastDates = [];
    const lastValue = historical[historical.length - 1];
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecastDates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
      forecast.push(Math.floor(lastValue * (1 + (Math.random() * 0.1 - 0.03))));
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        data: ['历史收入', '预测收入'],
        textStyle: { color: '#94a3b8' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: [...historicalDates, ...forecastDates],
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      yAxis: {
        type: 'value',
        axisLabel: { 
          formatter: (value) => `$${value}`,
          color: '#94a3b8'
        },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      series: [
        {
          name: '历史收入',
          type: 'line',
          data: [...historical, ...Array(7).fill(null)],
          itemStyle: { color: '#6366f1' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.05)' }
            ])
          }
        },
        {
          name: '预测收入',
          type: 'line',
          smooth: true,
          data: [...Array(historical.length - 1).fill(null), historical[historical.length - 1], ...forecast],
          lineStyle: { type: 'dashed' },
          itemStyle: { color: '#10b981' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(16, 185, 129, 0.3)' },
              { offset: 1, color: 'rgba(16, 185, 129, 0.05)' }
            ])
          }
        }
      ]
    };

    chart.setOption(option);
  }

  // ==================== 图表渲染 - 游戏数据 ====================

  _renderMatchDurationChart() {
    const container = document.getElementById('chart-match-duration');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('match-duration', chart);

    const data = this.cache.gameStats?.matchDurations || [];

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.range),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8', rotate: 30 }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      series: [{
        type: 'bar',
        data: data.map((d, i) => ({
          value: d.count,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][i] },
              { offset: 1, color: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899'][i] + '60' }
            ])
          }
        })),
        barWidth: '60%'
      }]
    };

    chart.setOption(option);
  }

  _renderSummitSuccessChart() {
    const container = document.getElementById('chart-summit-success');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('summit-success', chart);

    const data = this.cache.gameStats?.summitSuccess || { success: 65, failure: 35 };

    const option = {
      tooltip: {
        trigger: 'item',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#94a3b8' }
      },
      series: [{
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['40%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: 'center',
          formatter: () => `成功率\n${data.success}%`,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#10b981'
        },
        data: [
          { 
            value: data.success, 
            name: '成功',
            itemStyle: { color: '#10b981' }
          },
          { 
            value: data.failure, 
            name: '失败',
            itemStyle: { color: '#ef4444' }
          }
        ]
      }]
    };

    chart.setOption(option);
  }

  _renderRageCardsChart() {
    const container = document.getElementById('chart-rage-cards');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('rage-cards', chart);

    const data = this.cache.gameStats?.rageCards || [];

    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      yAxis: {
        type: 'category',
        data: data.map(d => d.name).reverse(),
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      series: [{
        type: 'bar',
        data: data.map(d => d.usage).reverse(),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: '#ef4444' },
            { offset: 1, color: '#f59e0b' }
          ])
        },
        barWidth: '60%'
      }]
    };

    chart.setOption(option);
  }

  _renderTowerPopularityChart() {
    const container = document.getElementById('chart-tower-popularity');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('tower-popularity', chart);

    const data = this.cache.gameStats?.towers || [];

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' },
        formatter: (params) => {
          return `${params[0].name}<br/>热度: ${params[0].value}%`;
        }
      },
      radar: {
        indicator: data.map(d => ({ name: d.name, max: 100 })),
        axisName: { color: '#94a3b8' },
        splitArea: {
          areaStyle: {
            color: ['#1e293b', '#0f172a', '#1e293b', '#0f172a']
          }
        },
        axisLine: { lineStyle: { color: '#334155' } },
        splitLine: { lineStyle: { color: '#334155' } }
      },
      series: [{
        type: 'radar',
        data: [{
          value: data.map(d => d.popularity),
          name: '塔使用热度',
          areaStyle: {
            color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
              { offset: 0, color: 'rgba(99, 102, 241, 0.3)' },
              { offset: 1, color: 'rgba(99, 102, 241, 0.1)' }
            ])
          },
          lineStyle: { color: '#6366f1' },
          itemStyle: { color: '#6366f1' }
        }]
      }]
    };

    chart.setOption(option);
  }

  _renderBugReportsChart() {
    const container = document.getElementById('chart-bug-reports');
    if (!container) return;

    const chart = echarts.init(container);
    this.state.charts.set('bug-reports', chart);

    // 生成30天Bug报告数据
    const dates = [];
    const bugs = [];
    const crashes = [];
    const anomalies = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
      bugs.push(Math.floor(Math.random() * 20) + 5);
      crashes.push(Math.floor(Math.random() * 8) + 1);
      anomalies.push(Math.floor(Math.random() * 15) + 3);
    }

    const option = {
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1e293b',
        borderColor: '#334155',
        textStyle: { color: '#f1f5f9' }
      },
      legend: {
        data: ['Bug报告', '崩溃', '异常'],
        textStyle: { color: '#94a3b8' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      series: [
        {
          name: 'Bug报告',
          type: 'line',
          smooth: true,
          data: bugs,
          itemStyle: { color: '#f59e0b' }
        },
        {
          name: '崩溃',
          type: 'line',
          smooth: true,
          data: crashes,
          itemStyle: { color: '#ef4444' }
        },
        {
          name: '异常',
          type: 'line',
          smooth: true,
          data: anomalies,
          itemStyle: { color: '#8b5cf6' }
        }
      ]
    };

    chart.setOption(option);
  }

  // ==================== 图表更新 ====================

  _updateCharts() {
    this.state.charts.forEach((chart, key) => {
      chart.resize();
    });
  }

  // ==================== 公共 API ====================

  /**
   * 切换到指定视图
   * @param {string} view - 视图名称: 'overview', 'users', 'revenue', 'game'
   */
  switchView(view) {
    this._switchView(view);
  }

  /**
   * 手动刷新数据
   */
  refresh() {
    this._refreshData();
  }

  /**
   * 设置日期范围
   * @param {string} range - 范围: '24h', '7d', '30d', '90d'
   */
  setDateRange(range) {
    this._changeDateRange(range);
  }

  /**
   * 获取当前数据
   * @returns {Object} 当前缓存的数据
   */
  getData() {
    return this.cache;
  }

  /**
   * 销毁看板实例
   */
  destroy() {
    // 清理图表
    this.state.charts.forEach(chart => chart.dispose());
    this.state.charts.clear();

    // 关闭WebSocket
    if (this.state.websocket) {
      this.state.websocket.close();
    }

    // 清理容器
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// ============================================
// 便捷使用方式
// ============================================

let globalDashboard = null;

/**
 * 初始化数据分析看板
 * @param {string|Object} config - 容器ID或配置对象
 * @returns {TowerDashboard} 看板实例
 */
function initDashboard(config = {}) {
  if (typeof config === 'string') {
    config = { containerId: config };
  }
  
  globalDashboard = new TowerDashboard(config);
  return globalDashboard;
}

/**
 * 获取看板实例
 * @returns {TowerDashboard} 看板实例
 */
function getDashboard() {
  if (!globalDashboard) {
    throw new Error('Dashboard not initialized. Call initDashboard() first.');
  }
  return globalDashboard;
}

// ============================================
// 导出
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TowerDashboard, initDashboard, getDashboard };
}

if (typeof window !== 'undefined') {
  window.TowerDashboard = TowerDashboard;
  window.initDashboard = initDashboard;
  window.getDashboard = getDashboard;
}
