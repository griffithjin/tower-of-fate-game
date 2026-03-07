# 🗼 命运塔游戏 API 文档

> **版本**: v1.0  
> **最后更新**: 2026-03-08  
> **基础URL**: `https://api.tower-of-fate.com/v1`

---

## 📋 目录

1. [基础信息](#基础信息)
2. [认证接口](#认证接口)
3. [用户接口](#用户接口)
4. [游戏接口](#游戏接口)
5. [商店接口](#商店接口)
6. [锦标赛接口](#锦标赛接口)
7. [配置接口](#配置接口)
8. [WebSocket实时通信](#websocket实时通信)
9. [错误处理](#错误处理)
10. [限流策略](#限流策略)

---

## 基础信息

### 通信协议
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8
- **时间格式**: ISO 8601 (UTC)

### 认证方式
所有API请求需要在Header中携带Bearer Token：

```http
Authorization: Bearer {your_jwt_token}
```

### 通用请求头

```http
Content-Type: application/json
Accept: application/json
X-Client-Version: 1.0.0
X-Platform: ios|android|web
```

### 通用响应格式

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-08T06:30:00Z",
    "requestId": "req_abc123"
  }
}
```

错误响应：

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "请求参数错误",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2026-03-08T06:30:00Z",
    "requestId": "req_abc123"
  }
}
```

---

## 认证接口

### 用户注册

```http
POST /auth/register
Content-Type: application/json
```

**请求体**：

```json
{
  "username": "string",      // 3-20字符，字母数字下划线
  "password": "string",      // 8-32字符，需包含字母和数字
  "phone": "string",         // 国际格式，如 +86138xxxxxxxx
  "country": "string",       // ISO 3166-1 alpha-2，如 CN, US, JP
  "referralCode": "string"   // 可选，推荐码
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123456",
      "username": "player1",
      "phone": "+86138****1234",
      "country": "CN",
      "createdAt": "2026-03-08T06:30:00Z",
      "status": "active"
    },
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    }
  }
}
```

### 用户登录

```http
POST /auth/login
Content-Type: application/json
```

**请求体**：

```json
{
  "username": "string",  // 或 phone
  "password": "string",
  "deviceId": "string",  // 设备唯一标识
  "deviceInfo": {
    "platform": "ios",
    "model": "iPhone15,2",
    "osVersion": "17.0"
  }
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "token": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": 3600
    },
    "user": {
      "id": "user_123456",
      "username": "player1",
      "nickname": "王牌玩家",
      "avatar": "https://cdn.tower-of-fate.com/avatars/default.png",
      "level": 10,
      "exp": 2500,
      "gems": 1000,
      "coins": 50000,
      "vipLevel": 2,
      "country": "CN"
    }
  }
}
```

### 刷新Token

```http
POST /auth/refresh
Content-Type: application/json
```

**请求体**：

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 退出登录

```http
POST /auth/logout
Authorization: Bearer {token}
```

---

## 用户接口

### 获取当前用户信息

```http
GET /users/me
Authorization: Bearer {token}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "id": "user_123456",
    "username": "player1",
    "nickname": "王牌玩家",
    "avatar": "https://cdn.tower-of-fate.com/avatars/user123.png",
    "level": 10,
    "exp": 2500,
    "expToNext": 3000,
    "gems": 1000,
    "coins": 50000,
    "vipLevel": 2,
    "vipExpiresAt": "2026-06-08T00:00:00Z",
    "country": "CN",
    "language": "zh-CN",
    "stats": {
      "gamesPlayed": 150,
      "gamesWon": 89,
      "winRate": 0.593,
      "highestScore": 12500,
      "totalPlayTime": 36000
    },
    "achievements": [
      {
        "id": "ach_001",
        "name": "初出茅庐",
        "description": "完成第一场比赛",
        "icon": "https://cdn.tower-of-fate.com/achievements/first-game.png",
        "earnedAt": "2026-01-15T08:30:00Z"
      }
    ],
    "createdAt": "2026-01-15T08:30:00Z",
    "lastLoginAt": "2026-03-08T06:30:00Z"
  }
}
```

### 更新用户信息

```http
PUT /users/me
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**：

```json
{
  "nickname": "新昵称",
  "avatar": "https://...",
  "language": "zh-CN"
}
```

### 获取用户战绩

```http
GET /users/me/stats
Authorization: Bearer {token}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "overview": {
      "gamesPlayed": 150,
      "gamesWon": 89,
      "gamesLost": 58,
      "gamesDrawn": 3,
      "winRate": 0.593,
      "highestScore": 12500,
      "totalPlayTime": 36000,
      "currentStreak": 5
    },
    "byMode": {
      "solo": { "played": 80, "won": 48, "winRate": 0.6 },
      "team": { "played": 45, "won": 28, "winRate": 0.622 },
      "tournament": { "played": 25, "won": 13, "winRate": 0.52 }
    },
    "recentGames": [
      {
        "id": "game_789",
        "mode": "solo",
        "result": "win",
        "score": 8500,
        "opponent": { "id": "user_789", "nickname": "对手" },
        "playedAt": "2026-03-08T05:30:00Z"
      }
    ],
    "ranking": {
      "global": 1250,
      "country": 89,
      "season": 456
    }
  }
}
```

### 获取用户背包

```http
GET /users/me/inventory
Authorization: Bearer {token}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "gems": 1000,
    "coins": 50000,
    "items": [
      {
        "id": "item_001",
        "type": "skin",
        "name": "黄金卡牌",
        "icon": "https://...",
        "quantity": 1,
        "isEquipped": true,
        "expiresAt": null
      },
      {
        "id": "item_002",
        "type": "booster",
        "name": "双倍经验卡",
        "icon": "https://...",
        "quantity": 3,
        "expiresAt": "2026-03-15T00:00:00Z"
      }
    ]
  }
}
```

---

## 游戏接口

### 创建游戏房间

```http
POST /game/rooms
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**：

```json
{
  "mode": "solo|team|tournament",
  "maxPlayers": 4,
  "isPrivate": false,
  "password": "string",      // 私有房间密码
  "betAmount": 100,          // 可选，下注金额
  "tournamentId": "tour_123" // 锦标赛模式必需
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "room": {
      "id": "room_abc123",
      "mode": "solo",
      "status": "waiting",
      "hostId": "user_123456",
      "maxPlayers": 4,
      "currentPlayers": 1,
      "isPrivate": false,
      "betAmount": 100,
      "players": [
        {
          "id": "user_123456",
          "nickname": "王牌玩家",
          "avatar": "https://...",
          "isHost": true,
          "isReady": true,
          "team": null
        }
      ],
      "createdAt": "2026-03-08T06:30:00Z",
      "expiresAt": "2026-03-08T06:45:00Z"
    }
  }
}
```

### 获取房间列表

```http
GET /game/rooms
Authorization: Bearer {token}

Query Parameters:
- mode: solo|team|tournament
- status: waiting|playing|closed
- page: number (default: 1)
- limit: number (default: 20, max: 100)
- betMin: number
- betMax: number
```

### 加入游戏房间

```http
POST /game/rooms/{roomId}/join
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**：

```json
{
  "password": "string"  // 私有房间必需
}
```

### 离开游戏房间

```http
POST /game/rooms/{roomId}/leave
Authorization: Bearer {token}
```

### 准备/取消准备

```http
POST /game/rooms/{roomId}/ready
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**：

```json
{
  "isReady": true
}
```

### 获取游戏状态

```http
GET /game/rooms/{roomId}/state
Authorization: Bearer {token}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "roomId": "room_abc123",
    "status": "playing",
    "currentRound": 3,
    "totalRounds": 10,
    "currentPlayer": "user_123456",
    "timeRemaining": 30,
    "players": [
      {
        "id": "user_123456",
        "nickname": "王牌玩家",
        "avatar": "https://...",
        "score": 3500,
        "cardsInHand": 5,
        "isCurrent": true,
        "status": "active"
      }
    ],
    "tableCards": [
      { "id": "card_001", "suit": "hearts", "value": 10 }
    ],
    "deckRemaining": 32,
    "lastAction": {
      "playerId": "user_789",
      "action": "play",
      "card": { "id": "card_002", "suit": "spades", "value": 8 },
      "timestamp": "2026-03-08T06:31:00Z"
    }
  }
}
```

### 出牌

```http
POST /game/rooms/{roomId}/play
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**：

```json
{
  "cardId": "card_123",
  "target": null,           // 目标玩家（某些牌型需要）
  "declaration": "string"   // 声明（如"过"、"叫分"等）
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "playedCard": { "id": "card_123", "suit": "hearts", "value": 10 },
    "newCard": { "id": "card_456", "suit": "diamonds", "value": 5 },
    "scoreChange": 10,
    "newScore": 3510,
    "nextPlayer": "user_789"
  }
}
```

### 跳过回合

```http
POST /game/rooms/{roomId}/pass
Authorization: Bearer {token}
```

### 发送表情/快捷消息

```http
POST /game/rooms/{roomId}/emote
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**：

```json
{
  "emoteId": "emote_thumbs_up",
  "targetPlayerId": "user_789"  // 可选，针对特定玩家
}
```

---

## 商店接口

### 获取商品列表

```http
GET /shop/items
Authorization: Bearer {token}

Query Parameters:
- category: gems|skins|effects|vip|boosters
- page: number
- limit: number
- sort: price_asc|price_desc|newest|popular
```

**响应**：

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item_gems_100",
        "category": "gems",
        "name": "100宝石",
        "description": "购买100颗宝石",
        "icon": "https://...",
        "price": {
          "amount": 6.99,
          "currency": "USD"
        },
        "originalPrice": null,
        "quantity": 100,
        "isPopular": false,
        "isNew": false,
        "tags": ["gems", "popular"]
      },
      {
        "id": "skin_gold_card",
        "category": "skins",
        "name": "黄金卡牌皮肤",
        "description": "让你的卡牌闪闪发光",
        "icon": "https://...",
        "preview": "https://...",
        "price": {
          "amount": 500,
          "currency": "GEMS"
        },
        "isPopular": true,
        "isNew": false
      }
    ],
    "meta": {
      "total": 50,
      "page": 1,
      "limit": 20,
      "totalPages": 3
    }
  }
}
```

### 创建订单

```http
POST /shop/orders
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**：

```json
{
  "itemId": "item_gems_100",
  "quantity": 1,
  "paymentMethod": "alipay|wechat|apple|google|paypal|card"
}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "order": {
      "id": "order_abc123",
      "status": "pending",
      "item": { ... },
      "totalAmount": 6.99,
      "currency": "USD",
      "createdAt": "2026-03-08T06:30:00Z",
      "expiresAt": "2026-03-08T06:45:00Z"
    },
    "payment": {
      "provider": "alipay",
      "orderInfo": "...",     // 支付宝/微信等需要的参数
      "checkoutUrl": "https://..."  // 网页支付跳转链接
    }
  }
}
```

### 验证支付

```http
POST /shop/orders/{orderId}/verify
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**：

```json
{
  "paymentData": {
    // 各平台返回的支付凭证
  }
}
```

### 支付回调 (Server-to-Server)

```http
POST /shop/payments/callback
Content-Type: application/json
X-Webhook-Secret: {webhook_secret}
```

**请求体**：

```json
{
  "orderId": "order_abc123",
  "paymentMethod": "alipay|wechat|apple|google",
  "transactionId": "txn_abc123",
  "status": "success|failed|refunded",
  "amount": 6.99,
  "currency": "USD",
  "paidAt": "2026-03-08T06:31:00Z"
}
```

### 获取VIP信息

```http
GET /shop/vip
Authorization: Bearer {token}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "currentLevel": 2,
    "currentExp": 1500,
    "nextLevelExp": 3000,
    "benefits": [
      "每日签到奖励翻倍",
      "专属头像框",
      "优先匹配"
    ],
    "expiresAt": "2026-06-08T00:00:00Z",
    "levels": [
      {
        "level": 1,
        "name": "VIP 1",
        "price": { "amount": 4.99, "currency": "USD" },
        "benefits": ["..."]
      }
    ]
  }
}
```

---

## 锦标赛接口

### 获取锦标赛列表

```http
GET /tournaments
Authorization: Bearer {token}

Query Parameters:
- status: upcoming|ongoing|completed|registration
- country: string (ISO代码)
- type: daily|weekly|monthly|special
- page: number
- limit: number
```

**响应**：

```json
{
  "success": true,
  "data": {
    "tournaments": [
      {
        "id": "tour_abc123",
        "name": "周末大奖赛",
        "type": "weekly",
        "status": "registration",
        "banner": "https://...",
        "description": "...",
        "prizePool": {
          "gems": 10000,
          "items": ["item_001", "item_002"]
        },
        "entryFee": {
          "gems": 100
        },
        "maxParticipants": 128,
        "currentParticipants": 89,
        "registrationStart": "2026-03-06T00:00:00Z",
        "registrationEnd": "2026-03-08T23:59:59Z",
        "startTime": "2026-03-09T12:00:00Z",
        "endTime": "2026-03-09T18:00:00Z",
        "region": "asia",
        "minLevel": 5
      }
    ],
    "meta": { "total": 10, "page": 1, "limit": 20 }
  }
}
```

### 获取锦标赛详情

```http
GET /tournaments/{tournamentId}
Authorization: Bearer {token}
```

### 报名锦标赛

```http
POST /tournaments/{tournamentId}/register
Authorization: Bearer {token}
Content-Type: application/json
```

**请求体**：

```json
{
  "entryFee": 100
}
```

### 取消报名

```http
DELETE /tournaments/{tournamentId}/register
Authorization: Bearer {token}
```

### 获取锦标赛排行榜

```http
GET /tournaments/{tournamentId}/leaderboard
Authorization: Bearer {token}

Query Parameters:
- page: number
- limit: number (max: 100)
```

**响应**：

```json
{
  "success": true,
  "data": {
    "tournamentId": "tour_abc123",
    "status": "ongoing",
    "totalParticipants": 128,
    "leaderboard": [
      {
        "rank": 1,
        "player": {
          "id": "user_123",
          "nickname": "冠军玩家",
          "avatar": "https://...",
          "country": "CN"
        },
        "score": 25000,
        "gamesPlayed": 10,
        "wins": 8,
        "prize": { "gems": 5000, "title": "周冠军" }
      }
    ],
    "myRank": {
      "rank": 15,
      "score": 18500,
      "isInPrizeZone": true
    }
  }
}
```

### 获取我的锦标赛

```http
GET /tournaments/my
Authorization: Bearer {token}

Query Parameters:
- status: upcoming|ongoing|completed
```

---

## 配置接口

### 获取按钮配置

```http
GET /config/buttons
Authorization: Bearer {token}

Query Parameters:
- category: main-menu|game-controls|shop|social
- language: zh-CN|en-US|ja-JP|ko-KR|th-TH
- platform: ios|android|web
```

**响应**：

```json
{
  "success": true,
  "data": {
    "version": "2026030801",
    "buttons": [
      {
        "id": "btn_001",
        "key": "play_now",
        "category": "main-menu",
        "texts": {
          "zh-CN": "立即开始",
          "en-US": "Play Now"
        },
        "style": {
          "backgroundColor": "#667eea",
          "textColor": "#ffffff",
          "borderRadius": 12,
          "fontSize": 16,
          "padding": 16
        },
        "enabled": true,
        "action": {
          "type": "navigate",
          "target": "/game/lobby"
        }
      }
    ]
  }
}
```

### 更新按钮配置 (管理员)

```http
PUT /config/buttons/{buttonId}
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**请求体**：

```json
{
  "texts": {
    "zh-CN": "新文本",
    "en-US": "New Text"
  },
  "style": {
    "backgroundColor": "#FF0000",
    "textColor": "#FFFFFF",
    "borderRadius": 12
  },
  "enabled": true,
  "action": {
    "type": "navigate",
    "target": "/new-path"
  }
}
```

### 获取链接配置

```http
GET /config/links
Authorization: Bearer {token}

Query Parameters:
- type: support|terms|privacy|social|faq
- language: zh-CN|en-US|...
```

**响应**：

```json
{
  "success": true,
  "data": {
    "links": [
      {
        "id": "link_support",
        "key": "customer_support",
        "type": "support",
        "urls": {
          "default": "https://support.tower-of-fate.com",
          "zh-CN": "https://support.tower-of-fate.com/zh",
          "en-US": "https://support.tower-of-fate.com/en"
        },
        "openInNewTab": true
      }
    ]
  }
}
```

### 更新链接配置 (管理员)

```http
PUT /config/links/{linkId}
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**请求体**：

```json
{
  "urls": {
    "default": "https://example.com",
    "zh-CN": "https://example.com/zh"
  },
  "openInNewTab": true
}
```

### 获取游戏配置

```http
GET /config/game
Authorization: Bearer {token}
```

**响应**：

```json
{
  "success": true,
  "data": {
    "minBet": 10,
    "maxBet": 10000,
    "turnTimeout": 30,
    "maxPlayers": 4,
    "gameModes": ["solo", "team", "tournament"],
    "expConfig": {
      "baseExp": 100,
      "winBonus": 50,
      "vipMultiplier": [1.0, 1.2, 1.5, 2.0]
    },
    "rewards": {
      "dailyLogin": {
        "gems": 10,
        "coins": 500
      }
    }
  }
}
```

---

## WebSocket实时通信

### 连接

```javascript
const ws = new WebSocket('wss://api.tower-of-fate.com/ws');

ws.onopen = () => {
  // 认证
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'Bearer eyJhbGciOiJIUzI1NiIs...'
  }));
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket disconnected');
};
```

### 客户端消息

**加入房间**：
```javascript
ws.send(JSON.stringify({
  type: 'joinRoom',
  roomId: 'room_abc123'
}));
```

**准备游戏**：
```javascript
ws.send(JSON.stringify({
  type: 'ready',
  roomId: 'room_abc123',
  isReady: true
}));
```

**出牌**：
```javascript
ws.send(JSON.stringify({
  type: 'playCard',
  roomId: 'room_abc123',
  cardId: 'card_123',
  timestamp: Date.now()
}));
```

**发送聊天消息**：
```javascript
ws.send(JSON.stringify({
  type: 'chat',
  roomId: 'room_abc123',
  message: 'Good luck!',
  messageType: 'text'  // text, emote, quick
}));
```

**发送表情**：
```javascript
ws.send(JSON.stringify({
  type: 'emote',
  roomId: 'room_abc123',
  emoteId: 'thumbs_up',
  targetPlayerId: 'user_789'  // 可选
}));
```

**心跳**：
```javascript
// 每30秒发送一次
ws.send(JSON.stringify({
  type: 'ping',
  timestamp: Date.now()
}));
```

### 服务器消息

**连接确认**：
```json
{
  "type": "connected",
  "clientId": "ws_client_abc123",
  "serverTime": "2026-03-08T06:30:00Z"
}
```

**房间状态更新**：
```json
{
  "type": "roomUpdate",
  "roomId": "room_abc123",
  "data": {
    "players": [...],
    "status": "waiting"
  }
}
```

**玩家加入**：
```json
{
  "type": "playerJoined",
  "roomId": "room_abc123",
  "player": {
    "id": "user_789",
    "nickname": "新玩家",
    "avatar": "https://..."
  }
}
```

**玩家离开**：
```json
{
  "type": "playerLeft",
  "roomId": "room_abc123",
  "playerId": "user_789",
  "reason": "left|disconnected|kicked"
}
```

**游戏开始**：
```json
{
  "type": "gameStart",
  "roomId": "room_abc123",
  "data": {
    "players": [...],
    "initialCards": [...],
    "firstPlayer": "user_123456",
    "totalRounds": 10
  }
}
```

**游戏状态更新**：
```json
{
  "type": "gameState",
  "roomId": "room_abc123",
  "data": {
    "currentPlayer": "user_789",
    "tableCards": [...],
    "timeRemaining": 25,
    "round": 3
  }
}
```

**玩家出牌**：
```json
{
  "type": "cardPlayed",
  "roomId": "room_abc123",
  "data": {
    "playerId": "user_789",
    "card": { "id": "card_123", "suit": "hearts", "value": 10 },
    "newCard": { "id": "card_456", "suit": "diamonds", "value": 5 },
    "nextPlayer": "user_123456"
  }
}
```

**聊天消息**：
```json
{
  "type": "chat",
  "roomId": "room_abc123",
  "data": {
    "playerId": "user_789",
    "nickname": "玩家名",
    "message": "Good luck!",
    "messageType": "text",
    "timestamp": "2026-03-08T06:31:00Z"
  }
}
```

**表情**：
```json
{
  "type": "emote",
  "roomId": "room_abc123",
  "data": {
    "playerId": "user_789",
    "emoteId": "thumbs_up",
    "targetPlayerId": "user_123456"
  }
}
```

**游戏结束**：
```json
{
  "type": "gameEnd",
  "roomId": "room_abc123",
  "data": {
    "winner": { "id": "user_123456", ... },
    "rankings": [...],
    "rewards": {
      "gems": 100,
      "exp": 50
    }
  }
}
```

**错误**：
```json
{
  "type": "error",
  "code": "INVALID_MOVE",
  "message": "非法出牌",
  "timestamp": "2026-03-08T06:31:00Z"
}
```

**心跳响应**：
```json
{
  "type": "pong",
  "serverTime": "2026-03-08T06:30:30Z"
}
```

---

## 错误处理

### HTTP状态码

| 代码 | 含义 | 说明 |
|-----|------|------|
| 200 | OK | 请求成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未授权，需要登录 |
| 403 | Forbidden | 禁止访问，权限不足 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复注册） |
| 422 | Unprocessable Entity | 请求格式正确但无法处理 |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Server Error | 服务器内部错误 |
| 503 | Service Unavailable | 服务暂时不可用 |

### 错误代码列表

```javascript
{
  // 认证相关
  "INVALID_CREDENTIALS": "用户名或密码错误",
  "TOKEN_EXPIRED": "Token已过期",
  "TOKEN_INVALID": "无效的Token",
  "ACCOUNT_DISABLED": "账户已被禁用",
  "ACCOUNT_LOCKED": "账户已被锁定",
  
  // 请求相关
  "INVALID_REQUEST": "请求参数错误",
  "MISSING_FIELD": "缺少必填字段",
  "INVALID_FORMAT": "数据格式错误",
  "RATE_LIMITED": "请求过于频繁",
  
  // 游戏相关
  "ROOM_NOT_FOUND": "房间不存在",
  "ROOM_FULL": "房间已满",
  "ROOM_CLOSED": "房间已关闭",
  "GAME_ALREADY_STARTED": "游戏已开始",
  "NOT_YOUR_TURN": "不是你的回合",
  "INVALID_MOVE": "非法操作",
  "INSUFFICIENT_FUNDS": "余额不足",
  
  // 商店相关
  "ITEM_NOT_FOUND": "商品不存在",
  "ITEM_UNAVAILABLE": "商品不可用",
  "PAYMENT_FAILED": "支付失败",
  "TRANSACTION_EXISTS": "交易已存在",
  
  // 锦标赛相关
  "TOURNAMENT_NOT_FOUND": "锦标赛不存在",
  "REGISTRATION_CLOSED": "报名已结束",
  "ALREADY_REGISTERED": "已报名",
  "NOT_REGISTERED": "未报名",
  "TOURNAMENT_FULL": "锦标赛已满员",
  "INSUFFICIENT_LEVEL": "等级不足",
  
  // 服务器相关
  "INTERNAL_ERROR": "服务器内部错误",
  "SERVICE_UNAVAILABLE": "服务暂时不可用",
  "MAINTENANCE_MODE": "服务器维护中"
}
```

---

## 限流策略

| 接口类型 | 限制 | 说明 |
|---------|------|------|
| 普通接口 | 100次/分钟 | GET请求 |
| 写入接口 | 30次/分钟 | POST/PUT/DELETE |
| 游戏操作 | 10次/秒 | 出牌、跳过等 |
| 聊天消息 | 5条/10秒 | WebSocket |
| 登录尝试 | 5次/分钟 | 防止暴力破解 |
| 注册 | 3次/小时 | 同一IP |

### 限流响应头

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1709890800
```

### 限流响应

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "请求过于频繁，请稍后再试",
    "retryAfter": 60
  }
}
```

---

## SDK 示例

### JavaScript/TypeScript

```typescript
import { TowerOfFateClient } from '@tower-of-fate/sdk';

const client = new TowerOfFateClient({
  baseURL: 'https://api.tower-of-fate.com/v1',
  token: 'your_jwt_token'
});

// 登录
const { token, user } = await client.auth.login({
  username: 'player1',
  password: 'password123'
});

// 获取用户信息
const userInfo = await client.users.getMe();

// 创建游戏房间
const room = await client.game.createRoom({
  mode: 'solo',
  maxPlayers: 4
});

// WebSocket连接
const ws = client.ws.connect();
ws.on('gameState', (data) => {
  console.log('Game state:', data);
});
```

### Unity C#

```csharp
using TowerOfFate.SDK;

var client = new TowerOfFateClient("https://api.tower-of-fate.com/v1");

// 登录
var result = await client.Auth.LoginAsync(new LoginRequest {
    Username = "player1",
    Password = "password123"
});

client.SetToken(result.Token.AccessToken);

// 获取用户信息
var user = await client.Users.GetMeAsync();

// WebSocket
var ws = client.WebSocket.Connect();
ws.OnGameState += (sender, state) => {
    Debug.Log($"Current player: {state.CurrentPlayer}");
};
```

---

## 附录

### 国家代码

使用 ISO 3166-1 alpha-2 标准：
- `CN` - 中国
- `US` - 美国
- `JP` - 日本
- `KR` - 韩国
- `TH` - 泰国
- `SG` - 新加坡
- `MY` - 马来西亚
- `ID` - 印尼
- `VN` - 越南
- `PH` - 菲律宾

### 语言代码

使用 BCP 47 标准：
- `zh-CN` - 简体中文
- `zh-TW` - 繁体中文
- `en-US` - 英语(美国)
- `ja-JP` - 日语
- `ko-KR` - 韩语
- `th-TH` - 泰语
- `vi-VN` - 越南语
- `id-ID` - 印尼语
- `ms-MY` - 马来语

### 货币代码

使用 ISO 4217 标准：
- `CNY` - 人民币
- `USD` - 美元
- `JPY` - 日元
- `KRW` - 韩元
- `THB` - 泰铢
- `GEMS` - 游戏内宝石
- `COINS` - 游戏内金币

---

*文档版本: 1.0.0 | 最后更新: 2026-03-08*
