# 数据库初始化数据

## 商品数据

```javascript
db.shopitems.insertMany([
  {
    itemId: 'gold_pack_1',
    name: '小型金币包',
    description: '获得1000金币，开启你的命运之旅',
    type: 'gold',
    category: 'currency',
    price: { currency: 'diamond', amount: 10 },
    quantity: 1000,
    icon: 'https://cdn.fatetower.game/items/gold_pack_1.png',
    rarity: 'common',
    isAvailable: true,
    isFeatured: true,
    tags: ['新手推荐']
  },
  {
    itemId: 'gold_pack_2',
    name: '中型金币包',
    description: '获得5000金币，加速成长',
    type: 'gold',
    category: 'currency',
    price: { currency: 'diamond', amount: 45 },
    originalPrice: 50,
    quantity: 5000,
    icon: 'https://cdn.fatetower.game/items/gold_pack_2.png',
    rarity: 'rare',
    isAvailable: true,
    tags: ['优惠']
  },
  {
    itemId: 'diamond_pack_1',
    name: '钻石礼包',
    description: '获得60钻石',
    type: 'diamond',
    category: 'currency',
    price: { currency: 'CNY', amount: 6 },
    quantity: 60,
    icon: 'https://cdn.fatetower.game/items/diamond_pack_1.png',
    rarity: 'rare',
    isAvailable: true,
    isFeatured: true,
    tags: ['首充双倍']
  },
  {
    itemId: 'diamond_pack_2',
    name: '超值钻石包',
    description: '获得648钻石，额外赠送65钻石',
    type: 'diamond',
    category: 'currency',
    price: { currency: 'CNY', amount: 648 },
    quantity: 713,
    icon: 'https://cdn.fatetower.game/items/diamond_pack_2.png',
    rarity: 'legendary',
    isAvailable: true,
    tags: ['超值', '限时']
  },
  {
    itemId: 'exp_boost_1d',
    name: '经验加成卡(1天)',
    description: '1天内获得双倍经验',
    type: 'boost',
    category: 'boost',
    price: { currency: 'diamond', amount: 50 },
    validDays: 1,
    icon: 'https://cdn.fatetower.game/items/exp_boost.png',
    rarity: 'epic',
    isAvailable: true,
    effects: { expMultiplier: 2 },
    tags: ['热门']
  },
  {
    itemId: 'vip_card_7d',
    name: 'VIP周卡',
    description: '7天VIP特权体验',
    type: 'vip',
    category: 'special',
    price: { currency: 'diamond', amount: 300 },
    validDays: 7,
    icon: 'https://cdn.fatetower.game/items/vip_card.png',
    rarity: 'legendary',
    isAvailable: true,
    effects: { goldMultiplier: 1.5, expMultiplier: 1.5 },
    tags: ['VIP', '推荐']
  },
  {
    itemId: 'special_package_1',
    name: '新手大礼包',
    description: '含金币、钻石、经验卡的超值礼包',
    type: 'package',
    category: 'special',
    price: { currency: 'CNY', amount: 1 },
    quantity: 1,
    icon: 'https://cdn.fatetower.game/items/newbie_pack.png',
    rarity: 'epic',
    isAvailable: true,
    isFeatured: true,
    isLimited: true,
    limitedQuantity: 10000,
    tags: ['新手限定', '超值']
  }
])
```

## 锦标赛数据

```javascript
db.tournaments.insertMany([
  {
    name: '每日挑战赛',
    description: '每天举行的入门级比赛',
    type: 'daily',
    status: 'upcoming',
    entryFee: { gold: 100, diamond: 0 },
    prizes: {
      gold: 1000,
      diamond: 50
    },
    maxParticipants: 100,
    minParticipants: 10,
    schedule: {
      registrationStart: new Date(Date.now() + 3600000),
      registrationEnd: new Date(Date.now() + 7200000),
      startTime: new Date(Date.now() + 10800000),
      endTime: new Date(Date.now() + 14400000)
    },
    rules: {
      maxLayers: 50,
      timeLimit: 300,
      maxCards: 20
    },
    featured: true
  },
  {
    name: '周末锦标赛',
    description: '周末举行的大型锦标赛，奖励丰厚',
    type: 'weekly',
    status: 'upcoming',
    entryFee: { gold: 0, diamond: 50 },
    prizes: {
      gold: 10000,
      diamond: 500,
      items: [
        { itemId: 'vip_card_7d', count: 1 }
      ]
    },
    maxParticipants: 500,
    minParticipants: 50,
    schedule: {
      registrationStart: new Date(Date.now() + 86400000),
      registrationEnd: new Date(Date.now() + 172800000),
      startTime: new Date(Date.now() + 259200000),
      endTime: new Date(Date.now() + 345600000)
    },
    rules: {
      maxLayers: 100,
      timeLimit: 600,
      maxCards: 30
    },
    featured: true
  }
])
```

## 索引创建

```javascript
// 用户集合索引
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ 'stats.totalPoints': -1 })
db.users.createIndex({ createdAt: -1 })

// 游戏记录索引
db.gamerecords.createIndex({ userId: 1, playedAt: -1 })
db.gamerecords.createIndex({ mode: 1, playedAt: -1 })
db.gamerecords.createIndex({ result: 1 })

// 订单索引
db.orders.createIndex({ orderId: 1 }, { unique: true })
db.orders.createIndex({ userId: 1, createdAt: -1 })
db.orders.createIndex({ status: 1 })

// 锦标赛索引
db.tournaments.createIndex({ status: 1, type: 1 })
db.tournaments.createIndex({ 'schedule.startTime': 1 })
db.tournaments.createIndex({ featured: 1 })

// 商品索引
db.shopitems.createIndex({ itemId: 1 }, { unique: true })
db.shopitems.createIndex({ type: 1, category: 1 })
db.shopitems.createIndex({ isAvailable: 1, isFeatured: 1 })
```
