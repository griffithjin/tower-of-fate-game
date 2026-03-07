# 🔌 API接口文档

**项目名称：** 首位好运：命运之塔  
**基础URL：** `https://api.toweroffate.game/v1`  
**协议：** HTTPS  
**数据格式：** JSON

---

## 认证

### 登录
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "hashed_password"
}
```

**响应：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "token": "jwt_token_here",
    "userId": "user_123",
    "username": "玩家名称",
    "expiresIn": 86400
  }
}
```

### 注册
```http
POST /auth/register
Content-Type: application/json

{
  "username": "玩家名称",
  "email": "user@example.com",
  "password": "hashed_password"
}
```

---

## 用户接口

### 获取用户信息
```http
GET /user/profile
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "userId": "user_123",
    "username": "玩家名称",
    "avatar": "https://...",
    "stats": {
      "totalScore": 15420,
      "totalGames": 150,
      "wins": 45,
      "perfectMatches": 23
    },
    "rank": {
      "tier": "Gold",
      "level": 3,
      "score": 15420
    },
    "inventory": {
      "skins": ["Oriental", "Cyberpunk"],
      "destinyCards": ["AllRise", "PeekNext"]
    }
  }
}
```

### 更新用户信息
```http
PUT /user/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "新名称",
  "selectedSkin": "Cyberpunk"
}
```

---

## 游戏接口

### 创建房间
```http
POST /game/room/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "roomType": "Solo",
  "maxPlayers": 4
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "roomId": "room_abc123",
    "joinCode": "123456",
    "ownerId": "user_123",
    "players": [
      {
        "userId": "user_123",
        "username": "房主",
        "isReady": true
      }
    ],
    "status": "Waiting"
  }
}
```

### 加入房间
```http
POST /game/room/join
Authorization: Bearer {token}
Content-Type: application/json

{
  "joinCode": "123456"
}
```

### 开始游戏
```http
POST /game/start
Authorization: Bearer {token}
Content-Type: application/json

{
  "roomId": "room_abc123"
}
```

### 提交出牌
```http
POST /game/play
Authorization: Bearer {token}
Content-Type: application/json

{
  "gameId": "game_xyz789",
  "card": {
    "suit": "Hearts",
    "rank": 1
  }
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "result": "SuitMatch",
    "guardCard": {
      "suit": "Hearts",
      "rank": 5
    },
    "newLevel": 8,
    "scoreGained": 20
  }
}
```

### 获取游戏状态
```http
GET /game/status?gameId=game_xyz789
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "gameId": "game_xyz789",
    "currentLevel": 8,
    "guardCardRevealed": true,
    "players": [
      {
        "userId": "user_123",
        "username": "玩家1",
        "currentLevel": 8,
        "isActive": true
      }
    ],
    "status": "Playing"
  }
}
```

---

## 排行榜接口

### 获取全球排行榜
```http
GET /leaderboard/global?page=1&limit=100
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "total": 10000,
    "rankings": [
      {
        "rank": 1,
        "userId": "user_001",
        "username": "排行榜第一",
        "score": 999999,
        "tier": "FirstFortune",
        "avatar": "https://..."
      }
    ],
    "myRank": {
      "rank": 150,
      "score": 15420
    }
  }
}
```

### 获取好友排行榜
```http
GET /leaderboard/friends
Authorization: Bearer {token}
```

---

## 商店接口

### 获取商品列表
```http
GET /shop/products
Authorization: Bearer {token}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "skins": [
      {
        "productId": "skin_cyberpunk",
        "name": "赛博朋克皮肤",
        "description": "霓虹未来风格",
        "price": 6.99,
        "currency": "USD",
        "icon": "https://..."
      }
    ],
    "passes": [
      {
        "productId": "season_pass_1",
        "name": "S1赛季通行证",
        "price": 9.99,
        "currency": "USD"
      }
    ]
  }
}
```

### 创建订单
```http
POST /shop/order/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "skin_cyberpunk",
  "paymentMethod": "alipay"
}
```

**响应：**
```json
{
  "code": 200,
  "data": {
    "orderId": "order_20240303_001",
    "amount": 6.99,
    "currency": "USD",
    "paymentUrl": "https://alipay.com/...",
    "expiresAt": "2024-03-03T02:30:00Z"
  }
}
```

### 查询订单状态
```http
GET /shop/order/status?orderId=order_20240303_001
Authorization: Bearer {token}
```

---

## 好友接口

### 获取好友列表
```http
GET /friends/list
Authorization: Bearer {token}
```

### 添加好友
```http
POST /friends/add
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user_456"
}
```

### 邀请好友游戏
```http
POST /friends/invite
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": "user_456",
  "roomId": "room_abc123"
}
```

---

## 错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权/Token无效 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 409 | 冲突（如重复注册）|
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

### 错误响应示例
```json
{
  "code": 401,
  "message": "Token已过期",
  "data": null
}
```

---

## WebSocket实时通信

### 连接地址
```
wss://api.toweroffate.game/v1/ws?token={jwt_token}
```

### 消息类型

#### 玩家加入
```json
{
  "type": "player_joined",
  "data": {
    "userId": "user_123",
    "username": "玩家名称"
  }
}
```

#### 游戏状态更新
```json
{
  "type": "game_state_update",
  "data": {
    "gameId": "game_xyz789",
    "currentLevel": 8,
    "players": []
  }
}
```

#### 玩家出牌
```json
{
  "type": "player_played",
  "data": {
    "userId": "user_123",
    "card": {"suit": "Hearts", "rank": 1}
  }
}
```

#### 亮牌结果
```json
{
  "type": "cards_revealed",
  "data": {
    "guardCard": {"suit": "Hearts", "rank": 5},
    "results": [
      {
        "userId": "user_123",
        "result": "SuitMatch",
        "newLevel": 8
      }
    ]
  }
}
```

---

_金蛇API设计完成，等待后端实现。_
