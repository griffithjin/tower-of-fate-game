# 🏰 命运塔 (Tower of Fate)

> 一款融合卡牌策略与塔楼建造的全球多人竞技游戏

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/fate-tower)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-18+-brightgreen.svg)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/mongodb-5.0+-green.svg)](https://mongodb.com)

---

## 🎮 游戏简介

**命运塔**是一款创新的卡牌策略游戏，玩家通过收集卡牌、建造塔楼、参与对战来攀登命运的巅峰。游戏融合了：

- 🃏 **卡牌策略** - 52张标准牌 + 16张特殊技能牌
- 🏗️ **塔楼建造** - 全球100+座精美塔楼
- 🌍 **全球竞技** - 与世界各地玩家实时对战
- 💎 **丰富经济** - 金币、钻石、积分多货币系统
- 🏆 **锦标赛** - 定期举办高额奖金比赛

---

## ✨ 核心特性

### 🎯 游戏特色
| 特性 | 描述 |
|------|------|
| 🃏 **创新卡牌系统** | 标准卡牌 + 特殊技能牌，策略深度无限 |
| 🏰 **3D塔楼** | 基于Three.js的精美3D塔楼模型 |
| 🌐 **全球同服** | Socket.io实现全球实时对战 |
| 💰 **多元经济** | 金币、钻石、积分三货币体系 |
| 🎨 **精美画面** | 现代化UI设计，支持暗黑模式 |
| 📱 **多端支持** | Web、移动端完美适配 |

### 🔧 技术亮点
| 技术 | 实现 |
|------|------|
| ⚡ **实时通信** | Socket.io 实现低延迟对战 |
| 🔐 **安全认证** | JWT + bcrypt 双重保护 |
| 💳 **支付集成** | 支付宝、微信支付原生支持 |
| 📊 **数据分析** | ECharts 实时数据可视化 |
| 🐳 **容器部署** | Docker + Docker Compose |
| 🌍 **国际化** | 支持中英日等多语言 |

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm >= 9.0 或 yarn >= 1.22

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/fate-tower.git
cd fate-tower

# 2. 安装依赖
npm install

# 3. 配置环境
cp .env.example .env
# 编辑 .env 文件，填入你的配置

# 4. 启动开发服务器
npm run dev

# 5. 访问游戏
open http://localhost:3000
```

### Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 📁 项目结构

```
fate-tower/
├── 📁 admin/                    # 后台管理系统
│   ├── dashboard.html           # 数据仪表盘
│   ├── index.html               # 主控制台
│   ├── ad-manager-pro.html      # 广告管理
│   ├── analytics-dashboard.html # 数据分析
│   ├── asset-manager.html       # 资源管理
│   ├── tournament-enhanced.html # 锦标赛管理
│   └── ...
│
├── 📁 web_client/               # Web游戏客户端
│   ├── index.html               # 游戏主入口
│   ├── css/                     # 样式文件
│   ├── js/                      # 游戏脚本
│   └── assets/                  # 游戏资源
│
├── 📁 server/                   # 服务端核心
│   ├── server.js                # 主入口
│   ├── socket/                  # Socket.io处理器
│   ├── game/                    # 游戏逻辑
│   └── config/                  # 配置文件
│
├── 📁 routes/                   # API路由
│   ├── users.js                 # 用户相关
│   ├── game.js                  # 游戏相关
│   ├── shop.js                  # 商城相关
│   ├── payment.js               # 支付相关
│   └── tournament.js            # 锦标赛相关
│
├── 📁 models/                   # 数据模型 (Mongoose)
│   ├── User.js                  # 用户模型
│   ├── GameRecord.js            # 游戏记录
│   ├── Order.js                 # 订单模型
│   └── Tournament.js            # 锦标赛模型
│
├── 📁 middleware/               # Express中间件
│   ├── auth.js                  # JWT认证
│   └── validator.js             # 参数校验
│
├── 📁 services/                 # 业务服务层
├── 📁 utils/                    # 工具函数
├── 📁 i18n/                     # 国际化文件
├── 📁 docs/                     # 项目文档
├── 📁 scripts/                  # 工具脚本
└── 📄 README.md                 # 本文件
```

---

## 🛠️ 技术栈

### 后端
| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行环境 |
| Express | 4.18 | Web框架 |
| MongoDB | 5.0+ | 数据库 |
| Mongoose | 7.x | ODM |
| Socket.io | 4.7 | 实时通信 |
| JWT | 9.x | 身份认证 |
| bcryptjs | 2.4 | 密码加密 |

### 前端
| 技术 | 版本 | 用途 |
|------|------|------|
| HTML5 | - | 页面结构 |
| CSS3 | - | 样式设计 |
| JavaScript | ES6+ | 交互逻辑 |
| ECharts | 5.4 | 数据图表 |
| Three.js | - | 3D渲染 |

---

## 📡 API 概览

### 用户系统
```
POST   /api/users/register          # 用户注册
POST   /api/users/login             # 用户登录
GET    /api/users/profile           # 获取信息
PUT    /api/users/profile           # 更新信息
GET    /api/users/balance           # 获取余额
```

### 游戏系统
```
POST   /api/game/match/start        # 开始对局
POST   /api/game/match/play         # 出牌
GET    /api/game/match/state        # 对局状态
GET    /api/game/history            # 历史记录
GET    /api/game/leaderboard        # 排行榜
```

### 商城系统
```
GET    /api/shop/items              # 商品列表
GET    /api/shop/items/:id          # 商品详情
POST   /api/shop/buy                # 购买商品
GET    /api/shop/inventory          # 我的背包
```

### 支付系统
```
POST   /api/payment/create          # 创建订单
POST   /api/payment/alipay-callback # 支付宝回调
POST   /api/payment/wechat-callback # 微信回调
GET    /api/payment/orders          # 订单列表
```

---

## 🎮 游戏玩法

### 基础规则
1. **匹配对手** - 系统自动匹配实力相近的玩家
2. **出牌阶段** - 轮流出牌，策略博弈
3. **技能释放** - 使用特殊卡牌改变战局
4. **胜负判定** - 达成胜利条件即可获胜
5. **奖励结算** - 根据表现获得金币和经验

### 游戏模式
| 模式 | 描述 |
|------|------|
| 🎯 **排位赛** | 争夺段位，冲击王者 |
| 🎲 **休闲模式** | 轻松对战，练习技巧 |
| 🏆 **锦标赛** | 高额奖金，巅峰对决 |
| 👥 **好友对战** | 邀请好友，切磋技艺 |

---

## 🔐 安全说明

- ✅ **JWT认证** - 无状态身份验证
- ✅ **密码加密** - bcrypt强哈希算法
- ✅ **HTTPS传输** - 全站SSL加密
- ✅ **请求限流** - 防止恶意攻击
- ✅ **输入验证** - 严格参数校验
- ✅ **XSS防护** - 内容安全策略

---

## 📈 性能指标

| 指标 | 数值 |
|------|------|
| API响应时间 | < 200ms |
| Socket延迟 | < 50ms |
| 并发支持 | 10,000+ |
| 数据库查询 | < 100ms |
| 页面加载 | < 3s |

---

## 📚 文档

- [API文档](docs/API.md)
- [部署指南](docs/DEPLOYMENT.md)
- [开发手册](docs/DEVELOPMENT.md)
- [后台管理](admin/README.md)
- [代码统计](docs/SOURCE_CODE_STATS.md)

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

```bash
# Fork 项目
# 创建分支
git checkout -b feature/amazing-feature

# 提交更改
git commit -m 'Add amazing feature'

# 推送分支
git push origin feature/amazing-feature

# 创建 Pull Request
```

---

## 📄 许可证

[MIT](LICENSE) © 2026 命运塔开发团队

---

## 🙏 致谢

- [Node.js](https://nodejs.org)
- [Express](https://expressjs.com)
- [MongoDB](https://mongodb.com)
- [Socket.io](https://socket.io)
- [ECharts](https://echarts.apache.org)

---

## 📮 联系我们

- 🌐 官网: https://fatetower.game
- 📧 邮箱: support@fatetower.game
- 💬 社区: https://discord.gg/fatetower
- 🐦 Twitter: [@FateTowerGame](https://twitter.com/FateTowerGame)

---

<div align="center">

**🏰 攀登命运的巅峰，成为塔楼之王！**

[🎮 立即开始游戏](https://fatetower.game) · [📖 查看文档](docs/) · [🐛 报告问题](../../issues)

</div>
