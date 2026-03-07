# 命运塔游戏智能数据分析系统

🏰 **Fate Tower Game Analytics Dashboard**

一个专为命运塔游戏设计的运营级智能数据分析系统，提供实时数据监控、用户行为分析、转化漏斗追踪和智能运营建议。

## 📋 功能特性

### 1. 核心数据看板
- **实时在线监控** - 实时显示当前在线人数，自动更新
- **核心KPI指标** - DAU、收入、付费率、留存率一目了然
- **24小时热力图** - 在线人数分布趋势
- **收入趋势分析** - 今日vs昨日对比

### 2. 用户分析
- **RFM用户分群** - 自动识别高价值、潜在付费、流失预警、新用户
- **AI付费预测** - 7日付费概率预测模型
- **留存预警系统** - 识别可能流失的用户
- **LTV曲线分析** - 不同VIP等级用户生命周期价值

### 3. 转化漏斗
- **用户旅程漏斗** - 从打开游戏到复购的完整路径
- **流失点分析** - 自动识别关键流失节点
- **转化优化建议** - 基于数据的改进建议

### 4. 游戏平衡分析
- **关卡难度监控** - 各层通关率实时追踪
- **难度曲线优化** - 智能识别过难/过易关卡
- **平衡性建议** - 自动生成的调整方案

### 5. 智能运营日报
- **自动生成报告** - 每日/每周运营数据总结
- **异常检测** - 自动发现数据异常
- **机会识别** - 数据驱动的增长机会
- **A/B测试建议** - 智能推荐测试方案

## 🚀 快速开始

### 1. 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/fate-tower-game.git
cd fate-tower-game/fate-tower-backend/admin

# 或者直接下载文件到本地
```

### 2. 使用方式

#### 方式一：直接打开（演示模式）
```bash
# 使用浏览器直接打开HTML文件
open analytics-dashboard.html

# 或者使用本地服务器
python3 -m http.server 8080
# 然后访问 http://localhost:8080/analytics-dashboard.html
```

#### 方式二：集成到后端
```javascript
// 在Express应用中托管静态文件
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// 访问 http://your-domain/admin/analytics-dashboard.html
```

## 📁 文件结构

```
admin/
├── analytics-dashboard.html      # 主看板页面
├── css/
│   └── analytics.css            # 样式表
├── js/
│   ├── analytics-core.js        # 核心逻辑模块
│   ├── funnel-chart.js          # 漏斗分析模块
│   ├── realtime-chart.js        # 实时图表模块
│   └── insights-engine.js       # 智能建议引擎
└── data/
    └── mock-data.js             # 模拟数据
```

## 🔧 技术栈

- **前端框架**: 原生HTML5 + CSS3 + JavaScript (ES6+)
- **图表库**: [ECharts 5.x](https://echarts.apache.org/)
- **数据模拟**: Mock.js 风格的数据结构
- **UI设计**: 深色主题，游戏风格

## 📊 数据接口

### 实时数据 API
```javascript
GET /api/analytics/realtime
{
  online: 1234,
  dau: 5678,
  revenue: 12580,
  conversion: {
    register: 0.30,
    firstPay: 0.032,
    retention: { d1: 0.45, d7: 0.25, d30: 0.12 }
  }
}
```

### 漏斗分析 API
```javascript
GET /api/analytics/funnel
{
  stages: ['曝光', '注册', '新手', '首对战', '首付费'],
  values: [100, 30, 18, 12, 3.2],
  dropoff: [70, 40, 33, 73],
  insights: ['注册流失高', '新手引导需优化']
}
```

### 智能建议 API
```javascript
GET /api/analytics/insights
{
  alerts: [...],
  opportunities: [...],
  actions: [...]
}
```

## 🔌 接入真实数据

### 1. 修改数据获取逻辑

在 `analytics-core.js` 中，将 `simulateRealtimeUpdate()` 替换为真实API调用：

```javascript
// 替换为真实API
async fetchRealtimeData() {
  const response = await fetch('/api/analytics/realtime');
  const data = await response.json();
  this.data.realtime = data;
  this.updateKPIs();
}
```

### 2. 配置自动刷新

```javascript
// 设置刷新间隔（毫秒）
startRealtimeUpdate() {
  this.updateInterval = setInterval(() => {
    this.fetchRealtimeData();
  }, 30000); // 30秒刷新一次
}
```

## 🎨 自定义配置

### 修改主题颜色

编辑 `css/analytics.css`：

```css
:root {
  --primary-color: #5470c6;    /* 主色调 */
  --success-color: #91cc75;    /* 成功色 */
  --warning-color: #fac858;    /* 警告色 */
  --danger-color: #ee6666;     /* 危险色 */
  --dark-bg: #1a1a2e;          /* 背景色 */
  --card-bg: #16213e;          /* 卡片背景 */
}
```

### 添加新的KPI指标

在 `analytics-core.js` 的 `updateKPIs()` 方法中添加：

```javascript
updateKPIs() {
  // ... 现有代码
  this.updateKPICard('kpi-yourmetric', value, change, '前缀', '后缀');
}
```

### 自定义分析规则

在 `insights-engine.js` 中修改 `initRules()`：

```javascript
initRules() {
  return {
    custom: {
      threshold: 100,
      severity: 'high',
      message: '自定义规则触发'
    }
  };
}
```

## 📱 响应式设计

系统支持多种屏幕尺寸：
- **桌面端** (≥1024px) - 完整功能，侧边栏导航
- **平板端** (768px-1024px) - 自适应布局
- **移动端** (<768px) - 简化视图，卡片堆叠

## 🔒 安全建议

1. **身份验证** - 集成登录系统，保护敏感数据
2. **HTTPS** - 生产环境使用HTTPS加密传输
3. **数据权限** - 根据用户角色控制数据访问
4. **防刷机制** - 接口添加限流和防刷保护

## 📝 更新日志

### v1.0.0 (2026-03-08)
- ✅ 初始版本发布
- ✅ 核心数据看板
- ✅ 用户分群分析
- ✅ 转化漏斗追踪
- ✅ 游戏平衡分析
- ✅ 智能运营日报
- ✅ AI预测模型

## 🤝 贡献指南

欢迎提交Issue和PR！

1. Fork 项目
2. 创建分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👥 团队

- **产品**: 命运塔游戏运营团队
- **开发**: 数据分析团队
- **设计**: UI/UX 设计团队

---

💡 **提示**: 这是演示版本，使用模拟数据。生产环境请接入真实数据源。

📧 **联系**: analytics@fatetower.com

🌐 **官网**: https://fatetower.com
