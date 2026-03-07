# 📊 数据库设计文档

**项目名称：** 首位好运：命运之塔  
**数据库：** MongoDB  
**版本：** 1.0

---

## 1. 集合（Collections）

### 1.1 Users（用户集合）

```json
{
  "_id": "ObjectId",
  "userId": "string",           // 唯一用户ID
  "username": "string",         // 用户名
  "email": "string",            // 邮箱
  "passwordHash": "string",     // 密码哈希
  "createdAt": "ISODate",       // 注册时间
  "lastLogin": "ISODate",       // 最后登录
  "isActive": "boolean",        // 是否激活
  
  // 游戏数据
  "stats": {
    "totalScore": "number",     // 总积分
    "currentScore": "number",   // 当前赛季积分
    "totalGames": "number",     // 总游戏场次
    "wins": "number",           // 胜利场次
    "perfectMatches": "number", // 完美匹配次数
    "destinyCards": "number"    // 天命卡收集数
  },
  
  // 段位
  "rank": {
    "tier": "string",           // 段位等级
    "level": "number",          // 段位内等级
    "highestTier": "string",    // 历史最高段位
    "highestLevel": "number"
  },
  
  // 拥有的内容
  "inventory": {
    "skins": ["string"],        // 已解锁皮肤
    "destinyCards": ["string"], // 已收集天命卡
    "achievements": ["string"]  // 已解锁成就
  },
  
  // 设置
  "settings": {
    "selectedSkin": "string",
    "bgmVolume": "number",
    "sfxVolume": "number",
    "language": "string"
  },
  
  // 社交
  "friends": ["string"],        // 好友列表
  "friendRequests": ["string"]  // 好友请求
}
```

**索引：**
- `userId`: 唯一索引
- `username`: 唯一索引
- `email`: 唯一索引
- `rank.tier`: 普通索引（排行榜用）

---

### 1.2 Games（对局集合）

```json
{
  "_id": "ObjectId",
  "gameId": "string",           // 对局ID
  "roomType": "string",         // 房间类型: Solo/Team/Private
  "gameMode": "string",         // 游戏模式
  
  // 玩家
  "players": [
    {
      "userId": "string",
      "username": "string",
      "finalLevel": "number",   // 最终层数
      "isWinner": "boolean",    // 是否获胜
      "score": "number",        // 本局积分
      "perfectMatches": "number"
    }
  ],
  
  // 对局数据
  "gameData": {
    "duration": "number",       // 对局时长(秒)
    "totalRounds": "number",    // 总回合数
    "winnerId": "string"        // 获胜者ID
  },
  
  // 时间戳
  "startedAt": "ISODate",
  "endedAt": "ISODate",
  "createdAt": "ISODate"
}
```

**索引：**
- `gameId`: 唯一索引
- `players.userId`: 普通索引
- `startedAt`: 普通索引

---

### 1.3 Leaderboard（排行榜集合）

```json
{
  "_id": "ObjectId",
  "type": "string",             // 排行榜类型: Global/Weekly/Friends
  "season": "string",           // 赛季标识
  
  "rankings": [
    {
      "rank": "number",
      "userId": "string",
      "username": "string",
      "score": "number",
      "tier": "string",
      "avatar": "string"
    }
  ],
  
  "updatedAt": "ISODate"
}
```

---

### 1.4 Purchases（购买记录集合）

```json
{
  "_id": "ObjectId",
  "orderId": "string",          // 订单ID
  "userId": "string",           // 用户ID
  
  // 商品信息
  "productId": "string",        // 商品ID
  "productType": "string",      // 商品类型: Skin/Pass/Gems
  "productName": "string",
  "price": "number",            // 价格
  "currency": "string",         // 货币: CNY/USD
  
  // 支付信息
  "paymentMethod": "string",    // 支付方式
  "paymentStatus": "string",    // 支付状态
  "transactionId": "string",    // 第三方交易ID
  
  // 时间戳
  "createdAt": "ISODate",
  "paidAt": "ISODate"
}
```

**索引：**
- `orderId`: 唯一索引
- `userId`: 普通索引
- `createdAt`: 普通索引

---

### 1.5 DailyStats（每日统计集合）

```json
{
  "_id": "ObjectId",
  "date": "string",             // 日期: YYYY-MM-DD
  
  // 用户数据
  "dau": "number",              // 日活跃用户
  "mau": "number",              // 月活跃用户
  "newUsers": "number",         // 新增用户
  
  // 游戏数据
  "totalGames": "number",       // 总对局数
  "avgGameDuration": "number",  // 平均对局时长
  
  // 收入数据
  "revenue": {
    "total": "number",
    "skins": "number",
    "passes": "number",
    "ads": "number"
  },
  
  // 付费数据
  "payingUsers": "number",
  "arpu": "number",             // 每用户平均收入
  "arppu": "number"             // 每付费用户平均收入
}
```

---

## 2. 数据关系图

```
Users ||--o{ Games : plays
Users ||--o{ Purchases : buys
Users ||--|| Leaderboard : ranks
```

---

## 3. 关键查询示例

### 3.1 获取用户排行榜
```javascript
db.users.find()
  .sort({ "stats.totalScore": -1 })
  .limit(100)
  .project({
    username: 1,
    "stats.totalScore": 1,
    "rank.tier": 1
  })
```

### 3.2 获取用户最近对局
```javascript
db.games.find({
  "players.userId": "user_123"
})
.sort({ startedAt: -1 })
.limit(10)
```

### 3.3 获取每日收入统计
```javascript
db.dailyStats.find({
  date: { $gte: "2026-03-01", $lte: "2026-03-31" }
})
```

---

## 4. 数据备份策略

### 备份频率
- **实时备份：** MongoDB Replica Set
- **每日备份：** 凌晨3点全量备份
- **每月备份：** 保留月度快照

### 备份存储
- 本地：保留7天
- 云端：保留90天
- 冷存储：保留1年

---

_金蛇盘踞，数据架构完成。_
