# 命运塔游戏智能数据分析系统 - 快速上手指南

## 🎯 系统概述

这是一个**运营级别**的数据分析系统，为命运塔游戏提供全面的数据监控、用户分析、转化追踪和智能运营建议。

## 📊 核心功能

### 1. 数据概览 (Overview)
- ✅ 实时在线人数监控（30秒自动刷新）
- ✅ 核心KPI：DAU、收入、付费率、留存率
- ✅ 24小时在线热力图
- ✅ 收入趋势对比（今日vs昨日）
- ✅ 用户来源渠道分析
- ✅ 付费用户LTV曲线

### 2. 用户分析 (Users)
- ✅ RFM用户分群（4大群体）
- ✅ AI付费预测模型
- ✅ 留存预警系统
- ✅ 用户行为路径分析

### 3. 收入分析 (Revenue)
- ✅ 实时收入监控
- ✅ 用户地理分布
- ✅ 关键指标仪表盘

### 4. 转化漏斗 (Funnel)
- ✅ 完整转化路径追踪
- ✅ 流失点自动识别
- ✅ 优化建议生成

### 5. 游戏平衡 (Balance)
- ✅ 关卡难度分析
- ✅ 通关率监控
- ✅ 平衡性优化建议

### 6. 运营日报 (Report)
- ✅ 自动生成运营报告
- ✅ 智能发现（异常/机会/亮点）
- ✅ 自动触达任务
- ✅ A/B测试建议

## 🚀 快速启动

### 方式1：直接浏览器打开
```bash
# Mac
open admin/analytics-dashboard.html

# Windows
start admin/analytics-dashboard.html

# Linux
xdg-open admin/analytics-dashboard.html
```

### 方式2：使用本地服务器
```bash
cd fate-tower-backend/admin

# Python 3
python -m http.server 8080

# Node.js
npx serve -p 8080

# PHP
php -S localhost:8080
```
然后访问 `http://localhost:8080/analytics-dashboard.html`

### 方式3：集成到Express后端
```javascript
const express = require('express');
const path = require('path');
const app = express();

// 托管静态文件
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// 访问 http://your-domain/admin/analytics-dashboard.html
```

## 📁 文件说明

| 文件 | 说明 | 大小 |
|------|------|------|
| `analytics-dashboard.html` | 主看板页面 | 31KB |
| `css/analytics.css` | 样式表 | 13KB |
| `js/analytics-core.js` | 核心逻辑模块 | 16KB |
| `js/funnel-chart.js` | 漏斗分析模块 | 9KB |
| `js/realtime-chart.js` | 实时图表模块 | 12KB |
| `js/insights-engine.js` | 智能建议引擎 | 15KB |
| `data/mock-data.js` | 模拟数据 | 7.6KB |
| `README.md` | 使用文档 | 4KB |

## 🔌 接入真实数据

### 步骤1：创建数据API
```javascript
// server.js
app.get('/api/analytics/realtime', async (req, res) => {
  const data = await fetchRealtimeData();
  res.json(data);
});

app.get('/api/analytics/funnel', async (req, res) => {
  const data = await fetchFunnelData();
  res.json(data);
});
```

### 步骤2：修改前端数据获取
```javascript
// 在 analytics-core.js 中
async fetchRealtimeData() {
  try {
    const response = await fetch('/api/analytics/realtime');
    const data = await response.json();
    this.data.realtime = data;
    this.updateKPIs();
  } catch (error) {
    console.error('获取数据失败:', error);
  }
}
```

### 步骤3：配置自动刷新
```javascript
// 修改刷新频率
startRealtimeUpdate() {
  this.updateInterval = setInterval(() => {
    this.fetchRealtimeData();
  }, 30000); // 30秒
}
```

## 🎨 自定义配置

### 修改主题颜色
编辑 `css/analytics.css`：
```css
:root {
  --primary-color: #5470c6;  /* 蓝色主色调 */
  --success-color: #91cc75;  /* 绿色 */
  --warning-color: #fac858;  /* 黄色 */
  --danger-color: #ee6666;   /* 红色 */
  --dark-bg: #1a1a2e;        /* 深色背景 */
  --card-bg: #16213e;        /* 卡片背景 */
}
```

### 添加新的KPI卡片
在 `analytics-core.js` 中：
```javascript
updateKPIs() {
  // ... 现有代码
  
  // 添加新的KPI
  this.updateKPICard('kpi-custom', 1234, 5.6, '前缀', '后缀');
}
```

### 修改分析规则
在 `insights-engine.js` 中：
```javascript
initRules() {
  return {
    custom: {
      threshold: 100,
      severity: 'high',
      message: '自定义告警'
    }
  };
}
```

## 📱 响应式支持

| 设备 | 布局 |
|------|------|
| 桌面 (≥1024px) | 侧边栏 + 主内容区 |
| 平板 (768-1024px) | 自适应布局 |
| 手机 (<768px) | 单列堆叠布局 |

## 🔒 安全建议

1. **添加身份验证**
```javascript
app.use('/admin', authMiddleware, express.static('admin'));
```

2. **使用HTTPS**
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('ssl/key.pem'),
  cert: fs.readFileSync('ssl/cert.pem')
};

https.createServer(options, app).listen(443);
```

3. **数据权限控制**
```javascript
app.get('/api/analytics/*', requireAuth, checkPermission('analytics'), handler);
```

## 🐛 故障排除

### 图表不显示
- 检查ECharts CDN是否可访问
- 检查浏览器控制台错误
- 确认容器元素ID正确

### 数据不更新
- 检查网络连接
- 查看控制台错误信息
- 确认API端点正确

### 样式错乱
- 清除浏览器缓存
- 检查CSS文件是否加载
- 确认浏览器支持CSS变量

## 📞 技术支持

- 📧 邮箱: analytics@fatetower.com
- 🐛 Issue: 提交到GitHub Issues
- 💬 讨论: GitHub Discussions

## 📄 许可证

MIT License

---

**版本**: v1.0.0  
**更新日期**: 2026-03-08  
**作者**: 命运塔数据分析团队
