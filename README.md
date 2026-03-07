# 命运塔游戏后端 API 🏰

基于 Node.js + Express + MongoDB 的命运塔卡牌游戏后端服务。

## 技术栈

- **后端框架**: Node.js + Express
- **数据库**: MongoDB + Mongoose
- **实时通信**: Socket.io
- **认证**: JWT (JSON Web Tokens)
- **支付**: 支付宝 / 微信支付
- **部署**: Docker + Docker Compose

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/fate-tower-backend.git
cd fate-tower-backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的配置

# 启动开发服务器
npm run dev
```

### 环境变量配置

```env
# 服务配置
PORT=3000
NODE_ENV=development

# MongoDB 配置
MONGODB_URI=mongodb://localhost:27017/fate_tower

# JWT 配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRE=30d

# 支付宝配置
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key
ALIPAY_PUBLIC_KEY=your-alipay-public-key

# 微信支付配置
WECHAT_APP_ID=your-wechat-app-id
WECHAT_MCH_ID=your-wechat-merchant-id
WECHAT_API_KEY=your-wechat-api-key

# CORS 配置
CORS_ORIGIN=http://localhost:8080,https://your-domain.com
```

## API 文档

### 用户系统

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/users/register | 用户注册 |
| POST | /api/users/login | 用户登录 |
| POST | /api/users/refresh | 刷新令牌 |
| GET | /api/users/profile | 获取用户信息 |
| PUT | /api/users/profile | 更新用户信息 |
| GET | /api/users/balance | 获取金币/钻石余额 |
| GET | /api/users/stats | 获取用户统计 |

### 游戏系统

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/game/match/start | 开始对局 |
| POST | /api/game/match/play | 出牌 |
| GET | /api/game/match/state | 获取对局状态 |
| POST | /api/game/match/end | 结束对局 |
| GET | /api/game/history | 游戏历史记录 |
| GET | /api/game/leaderboard | 排行榜 |

### 商城系统

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/shop/items | 获取商品列表 |
| GET | /api/shop/items/featured | 推荐商品 |
| GET | /api/shop/items/:itemId | 商品详情 |
| POST | /api/shop/buy | 购买商品 |
| GET | /api/shop/inventory | 背包物品 |
| POST | /api/shop/use-item | 使用物品 |

### 锦标赛系统

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/tournament/list | 锦标赛列表 |
| GET | /api/tournament/active | 活跃锦标赛 |
| GET | /api/tournament/upcoming | 即将开始 |
| POST | /api/tournament/join | 报名参加 |
| GET | /api/tournament/:id/state | 比赛状态 |
| POST | /api/tournament/play | 锦标赛出牌 |

### 支付系统

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/payment/create | 创建订单 |
| POST | /api/payment/alipay-callback | 支付宝回调 |
| POST | /api/payment/wechat-callback | 微信回调 |
| GET | /api/payment/orders | 订单列表 |

### 积分系统

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/points/rank | 排行榜 |
| GET | /api/points/history | 积分历史 |
| GET | /api/points/exchange-items | 兑换列表 |
| POST | /api/points/exchange | 积分兑换 |
| GET | /api/points/my-rank | 我的排名 |

## 实时通信 (Socket.io)

### 事件列表

**客户端 -> 服务器**

| 事件 | 数据 | 描述 |
|------|------|------|
| authenticate | { userId, token } | 用户认证 |
| start-matchmaking | { mode } | 开始匹配 |
| cancel-matchmaking | - | 取消匹配 |
| join-room | { roomId } | 加入房间 |
| play-card | { roomId, cardId } | 出牌 |
| leave-room | { roomId } | 离开房间 |

**服务器 -> 客户端**

| 事件 | 数据 | 描述 |
|------|------|------|
| authenticated | { success } | 认证结果 |
| matchmaking-status | { status } | 匹配状态 |
| match-found | { roomId } | 匹配成功 |
| room-joined | { gameState } | 加入房间 |
| game-update | { gameState } | 游戏更新 |
| game-ended | { winner } | 游戏结束 |
| player-disconnected | { userId } | 玩家断线 |

## 部署

### Docker 部署

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 生产环境部署

1. **服务器准备**
```bash
# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装 MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
```

2. **部署应用**
```bash
# 克隆代码
git clone https://github.com/yourusername/fate-tower-backend.git
cd fate-tower-backend

# 安装依赖
npm install --production

# 配置环境变量
vim .env

# 使用 PM2 启动
npm install -g pm2
pm2 start server.js --name fate-tower-api
pm2 save
pm2 startup
```

3. **Nginx 配置**
```nginx
server {
    listen 80;
    server_name api.fatetower.game;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 数据库 Schema

### User 集合
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String,
  avatar: String,
  gold: Number,
  diamond: Number,
  vip: {
    level: Number,
    exp: Number,
    expireAt: Date
  },
  inventory: [{
    itemId: String,
    count: Number,
    acquiredAt: Date
  }],
  stats: {
    totalGames: Number,
    wins: Number,
    totalPoints: Number,
    highestStreak: Number
  }
}
```

### GameRecord 集合
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  mode: String,
  result: String,
  score: Number,
  goldEarned: Number,
  layersClimbed: Number,
  playedAt: Date,
  details: Object
}
```

## 监控与日志

### 日志位置
```
logs/
├── access.log    # 访问日志
├── error.log     # 错误日志
└── game.log      # 游戏日志
```

### 监控指标
- CPU 使用率
- 内存使用率
- 数据库连接数
- API 响应时间
- 在线玩家数
- Socket.io 连接数

## 开发指南

### 目录结构
```
backend/
├── config/          # 配置文件
├── models/          # 数据模型
├── routes/          # API 路由
├── middleware/      # 中间件
├── socket/          # Socket.io 处理器
├── utils/           # 工具函数
├── server.js        # 主入口
└── package.json
```

### 添加新 API

1. 在 `routes/` 下创建路由文件
2. 在 `server.js` 中注册路由
3. 添加相应的控制器逻辑
4. 更新 API 文档

## 许可证

MIT License

## 联系方式

- 项目主页: https://github.com/yourusername/fate-tower-backend
- 问题反馈: https://github.com/yourusername/fate-tower-backend/issues
- 邮箱: support@fatetower.game

---

🏰 命运塔游戏 - 攀登命运的巅峰！
