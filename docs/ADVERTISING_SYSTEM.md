# 命运塔广告系统 📢

一套完整的游戏内广告系统，包含17个非侵入式广告点位、后台可视化管理和收入追踪功能。

## 功能特性

### 🎯 17个广告点位

| 序号 | 点位名称 | 位置 | 类型 | 频率 |
|------|----------|------|------|------|
| 1 | 主菜单底部横幅 | main-menu-bottom | banner, image | always |
| 2 | 游戏加载页面 | loading-overlay | video, image | every-load |
| 3 | 回合结束间隙 | between-rounds | banner, text | every-3-rounds |
| 4 | 游戏暂停菜单 | pause-overlay | banner | on-pause |
| 5 | 胜利结算页 | victory-overlay | banner, reward-video | on-victory |
| 6 | 失败结算页 | defeat-overlay | banner, text | on-defeat |
| 7 | 锦标赛报名页 | tournament-form | banner, text | on-register |
| 8 | 商店侧边栏 | shop-side | skyscraper, text | always |
| 9 | 用户中心底部 | profile-bottom | banner | always |
| 10 | 排行榜页面 | leaderboard-top | banner | always |
| 11 | 明信片收藏册 | gallery-between | banner, native | every-12-cards |
| 12 | 连胜模式选择 | streak-theme-selector | banner | always |
| 13 | 观战模式侧边栏 | spectator-side | skyscraper | always |
| 14 | 匹配等待 | matchmaking-overlay | video, image | on-wait |
| 15 | 每日任务间隙 | missions-between | banner, native | every-3-missions |
| 16 | 通知消息内嵌 | notification-list | text, native | every-5-messages |
| 17 | 设置页面底部 | settings-bottom | banner | always |

### 📊 后台管理功能

- **总览面板**: 实时数据、今日收入、CTR统计
- **点位管理**: 启用/禁用、单独配置
- **活动管理**: 创建、编辑、删除广告活动
- **数据分析**: 展示量、点击量、收入统计
- **系统设置**: CPM/CPC配置、频次控制

## 文件结构

```
fate-tower-backend/
├── web_client/
│   ├── js/
│   │   └── advertising-system.js      # 广告系统核心
│   ├── css/
│   │   └── advertising-system.css     # 广告样式
│   └── index.html                      # 集成示例
└── admin/
    └── ad-manager.html                 # 后台管理界面
```

## 快速开始

### 1. 引入广告系统

```html
<!-- 在HTML中引入 -->
<link rel="stylesheet" href="css/advertising-system.css">
<script src="js/advertising-system.js"></script>
```

### 2. 添加广告容器

```html
<!-- 在需要展示广告的位置添加容器 -->
<div data-ad-placement="main-menu-banner"></div>
<div data-ad-placement="victory-screen"></div>
```

### 3. 触发广告展示

```javascript
// 方式1: 直接调用
window.adSystem.showAd('victory-screen');

// 方式2: 监听游戏事件
document.addEventListener('game:victory', function() {
    window.adSystem.showAd('victory-screen');
});
```

## API 文档

### AdSystem 类

#### 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `showAd(placementId, options)` | placementId: string, options?: object | boolean | 展示广告 |
| `hideAd(placementId)` | placementId: string | void | 隐藏指定广告 |
| `hideAllAds()` | - | void | 隐藏所有广告 |
| `togglePlacement(id, enabled)` | id: string, enabled: boolean | void | 启用/禁用点位 |
| `addCampaign(campaign)` | campaign: object | Campaign | 添加广告活动 |
| `getStats()` | - | Stats | 获取统计数据 |

#### 配置示例

```javascript
// 添加自定义广告活动
const campaign = {
    id: 'camp_001',
    name: '新手引导推广',
    type: 'banner',
    placements: ['main-menu-banner', 'victory-screen'],
    content: {
        image: '/ads/banners/welcome.jpg',
        link: '/tutorial',
        title: '新手教程',
        cta: '开始学习'
    },
    schedule: {
        start: Date.now(),
        end: Date.now() + 30 * 24 * 60 * 60 * 1000
    },
    targeting: {
        minLevel: 1,
        maxLevel: 5
    },
    budget: {
        daily: 1000,
        cpm: 5,
        cpc: 0.5
    }
};

window.adSystem.addCampaign(campaign);
```

## 后台管理

访问 `admin/ad-manager.html` 进入广告管理后台：

- 查看实时统计数据
- 管理17个广告点位
- 创建和编辑广告活动
- 查看收入报表

## 广告类型

支持以下广告格式：

- **Banner** - 标准横幅图片广告
- **Image** - 图片广告
- **Video** - 视频广告（可跳过/强制）
- **Text** - 文字链广告
- **Native** - 原生内容广告
- **Skyscraper** - 竖长型侧边栏广告
- **Reward Video** - 激励视频广告（观看获得奖励）

## 收入追踪

自动追踪以下指标：

- 展示次数 (Impressions)
- 点击次数 (Clicks)
- 点击率 (CTR)
- 收入计算 (CPM + CPC)
- 视频完成率

## 非侵入式设计原则

1. **自然过渡** - 在回合结束、加载等待等自然间隙展示
2. **用户心情** - 胜利后展示效果最佳
3. **频次控制** - 防止过度打扰用户
4. **可跳过** - 视频广告支持跳过
5. **激励选择** - 奖励视频让用户主动选择

## 浏览器支持

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 版本历史

### v1.0.0 (2025-03-08)
- 初始版本发布
- 17个广告点位
- 后台管理系统
- 收入追踪功能

---

Made with ❤️ for 命运塔 Tower of Fate
