# 🗼 命运塔后台资产管理系统

专业的游戏资产管理系统，支持塔模型、头像、道具、商城商品、锦标赛配置、积分、称号、用户数据和明信片的全面管理。

## 📁 文件结构

```
admin/
├── asset-manager.html          # 主界面
├── ASSET_MANAGER_README.md     # 使用文档
├── css/
│   ├── asset-manager.css       # 主样式
│   └── components.css          # 组件样式
├── js/
│   ├── asset-manager.js        # 核心逻辑
│   ├── tower-manager.js        # 塔模型管理
│   ├── avatar-manager.js       # 头像管理
│   ├── item-manager.js         # 道具管理
│   ├── shop-manager.js         # 商城管理
│   ├── tournament-manager.js   # 锦标赛管理
│   ├── points-manager.js       # 积分管理 ⭐新增
│   ├── title-manager.js        # 称号管理 ⭐新增
│   ├── user-manager.js         # 用户管理 ⭐新增
│   └── postcard-manager.js     # 明信片管理 ⭐新增
└── components/
    └── batch-import.js         # 批量导入
```

## 🚀 快速开始

### 1. 访问系统
```
打开浏览器访问: admin/asset-manager.html
```

### 2. 权限说明
| 角色 | 权限 |
|------|------|
| 超级管理员 | 查看、创建、编辑、删除、导出、导入 |
| 运营人员 | 查看、创建、编辑、导出 |
| 外包工作室 | 查看、创建(需审核) |

## 📋 功能模块 (9大模块)

### 🗼 塔模型管理
- 上传/编辑/删除塔模型
- 支持拖拽上传图片
- 筛选：大洲、难度、状态
- 批量导入/导出

### 🎭 头像管理
- 上传/编辑/删除头像
- 分类：动物、角色、符号
- 稀有度：普通、稀有、史诗、传说
- 支持金币/钻石定价

### 🎒 道具管理
- 创建/编辑道具
- 类型：消耗品、增益道具、特殊道具
- 效果配置
- 可叠加设置

### 🛒 商城商品管理
- 创建/编辑商品
- 分类：皮肤、礼包、货币
- 折扣设置 (0-1)
- 限时/限量设置

### 🏆 锦标赛配置
- 创建/编辑锦标赛
- 设置时间、人数限制
- 配置冠亚季军奖励
- 实时状态显示

### 📊 积分管理 ⭐
- 查看用户积分排名
- 调整用户积分（增加/减少/设置）
- 积分兑换记录管理
- 赛季积分清零操作
- 积分规则配置

数据结构：
```javascript
{
    userId: 'user_001',
    nickname: '攀登者小明',
    currentPoints: 15800,
    seasonPoints: 8600,
    historyMax: 25000,
    exchangeCount: 12
}
```

### 👑 荣誉称号管理 ⭐
- 创建/编辑称号
- 手动授予/取消称号
- 称号获取条件配置
- 限时/永久称号管理
- 持有者列表查看

数据结构：
```javascript
{
    id: 'title_master',
    name: '塔王',
    icon: '👑',
    type: 'permanent',  // permanent|limited|event
    condition: { type: 'climb_count', value: 100 },
    holderCount: 23
}
```

### 👤 用户数据管理 ⭐
- 查看/调整用户金币/钻石余额
- 背包物品管理（查看/修改/删除）
- 用户游戏记录查询
- 用户封禁/解封操作
- 批量搜索功能

数据结构：
```javascript
{
    userId: 'user_001',
    nickname: '攀登者小明',
    gold: 12500,
    diamond: 288,
    backpack: [
        { itemId: 'item_double_gold', count: 3 }
    ],
    gamesPlayed: 156,
    gamesWon: 89,
    status: 'active'  // active|banned|inactive
}
```

### 🎑 明信片管理 ⭐
- 创建/编辑明信片
- 手动发放明信片（支持批量）
- 收藏者列表查看
- 明信片活动配置
- 系列/稀有度筛选

数据结构：
```javascript
{
    id: 'pc_china_001',
    name: '东方明珠夜景',
    series: 'asia',  // asia|europe|americas|special
    rarity: 'common', // common|rare|epic|legendary
    obtainMethod: 'climb', // climb|event|gift
    collectionCount: 1256
}
```

## 📤 批量导入

### 支持的格式
- **JSON**: 直接上传JSON数组文件
- **CSV**: 逗号分隔值文件

### 使用步骤
1. 点击"批量导入"按钮
2. 拖拽或选择文件
3. 预览数据
4. 确认导入

## 🔌 API 接口

### 积分 API
```
GET    /api/admin/points           # 获取积分列表
POST   /api/admin/points/adjust    # 调整积分
POST   /api/admin/points/reset     # 赛季清零
GET    /api/admin/points/rules     # 获取积分规则
PUT    /api/admin/points/rules     # 更新积分规则
```

### 称号 API
```
GET    /api/admin/titles           # 获取称号列表
POST   /api/admin/titles           # 创建称号
PUT    /api/admin/titles/:id       # 更新称号
POST   /api/admin/titles/grant     # 授予称号
POST   /api/admin/titles/revoke    # 收回称号
```

### 用户 API
```
GET    /api/admin/users            # 获取用户列表
GET    /api/admin/users/:id        # 获取用户详情
PUT    /api/admin/users/:id/balance # 调整余额
POST   /api/admin/users/:id/ban    # 封禁用户
POST   /api/admin/users/:id/unban  # 解封用户
```

### 明信片 API
```
GET    /api/admin/postcards        # 获取明信片列表
POST   /api/admin/postcards        # 创建明信片
PUT    /api/admin/postcards/:id    # 更新明信片
POST   /api/admin/postcards/send   # 发放明信片
```

## 💾 数据存储

系统使用 **localStorage** 作为本地数据存储，数据会自动保存在浏览器中。

数据键名：
- `towers` - 塔模型数据
- `avatars` - 头像数据
- `items` - 道具数据
- `shopItems` - 商城商品数据
- `tournaments` - 锦标赛数据
- `userPoints` - 用户积分数据 ⭐
- `titles` - 称号数据 ⭐
- `userTitles` - 用户称号数据 ⭐
- `adminUsers` - 用户数据 ⭐
- `postcards` - 明信片数据 ⭐
- `userPostcards` - 用户明信片数据 ⭐
- `pointsRules` - 积分规则 ⭐

## 🎨 界面预览

```
┌─────────────────────────────────────────────────────────────┐
│ 🏰 命运塔管理                                                │
│ ───────────────────────────────────────────────────────────  │
│ 📊 资产模块                                                   │
│  🗼 塔模型管理                                                │
│  🎭 头像管理                                                  │
│  🎒 道具管理                                                  │
│  🛒 商城商品                                                  │
│  🏆 锦标赛配置                                                │
│ ───────────────────────────────────────────────────────────  │
│ 👥 用户管理 ⭐                                                │
│  📊 积分管理                                                  │
│  👑 荣誉称号                                                  │
│  👤 用户数据                                                  │
│  🎑 明信片管理                                                │
│ ───────────────────────────────────────────────────────────  │
│ ⚙️ 系统                                                       │
│  📋 操作日志                                                  │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **样式**: CSS Variables + Flexbox/Grid
- **存储**: LocalStorage
- **图标**: Emoji + Unicode

## 📝 版本历史

### v2.0 (2026-03-08)
- ✨ 新增积分管理系统
- ✨ 新增荣誉称号管理
- ✨ 新增用户数据管理
- ✨ 新增明信片管理

### v1.0 (2026-03-08)
- 🗼 塔模型管理
- 🎭 头像管理
- 🎒 道具管理
- 🛒 商城商品管理
- 🏆 锦标赛配置

## 📞 支持

如有问题或建议，请联系开发团队。

---

**命运塔** - 连接世界的攀登之旅 🏰
