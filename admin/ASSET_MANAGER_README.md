# 🗼 命运塔后台资产管理系统

专业的游戏资产管理系统，支持塔模型、头像、道具、商城商品和锦标赛配置的全面管理。

## 📁 文件结构

```
admin/
├── asset-manager.html          # 主界面
├── css/
│   ├── asset-manager.css       # 主样式
│   └── components.css          # 组件样式
├── js/
│   ├── asset-manager.js        # 核心逻辑
│   ├── tower-manager.js        # 塔模型管理
│   ├── avatar-manager.js       # 头像管理
│   ├── item-manager.js         # 道具管理
│   ├── shop-manager.js         # 商城管理
│   └── tournament-manager.js   # 锦标赛管理
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

## 📋 功能模块

### 🗼 塔模型管理
- 上传/编辑/删除塔模型
- 支持拖拽上传图片
- 筛选：大洲、难度、状态
- 批量导入/导出

数据结构：
```javascript
{
    id: 'tower_001',
    name: '东方明珠',
    country: '中国',
    continent: 'asia',     // asia|europe|americas|africa|oceania
    image: 'towers/oriental-pearl.png',
    difficulty: 'hard',    // easy|medium|hard
    status: 'active'
}
```

### 🎭 头像管理
- 上传/编辑/删除头像
- 分类：动物、角色、符号
- 稀有度：普通、稀有、史诗、传说
- 支持金币/钻石定价

数据结构：
```javascript
{
    id: 'avatar_001',
    name: '熊猫',
    category: 'animal',    // animal|character|symbol
    image: 'avatars/panda.png',
    rarity: 'common',      // common|rare|epic|legendary
    price: { gold: 1000, diamond: 0 }
}
```

### 🎒 道具管理
- 创建/编辑道具
- 类型：消耗品、增益道具、特殊道具
- 效果配置
- 可叠加设置

数据结构：
```javascript
{
    id: 'item_double_gold',
    name: '双倍金币卡',
    description: '下一局获得双倍金币',
    effect: { type: 'gold', multiplier: 2, duration: 1 },
    price: { gold: 0, diamond: 10 },
    stackable: true
}
```

### 🛒 商城商品管理
- 创建/编辑商品
- 分类：皮肤、礼包、货币
- 折扣设置 (0-1)
- 限时/限量设置

数据结构：
```javascript
{
    id: 'shop_skin_gold',
    name: '黄金皮肤',
    category: 'skin',      // skin|pack|currency
    image: 'skins/gold.png',
    price: { gold: 0, diamond: 188 },
    discount: 0.8,         // 8折
    limited: false
}
```

### 🏆 锦标赛配置
- 创建/编辑锦标赛
- 设置时间、人数限制
- 配置冠亚季军奖励
- 实时状态显示

数据结构：
```javascript
{
    id: 'tournament_001',
    name: '全球锦标赛·上海站',
    country: 'CN',
    startTime: '2026-03-08T10:00:00',
    endTime: '2026-03-08T12:00:00',
    maxPlayers: 10,
    prize: {
        champion: { diamonds: 5000, title: '首登者' },
        runnerUp: { diamonds: 3000 },
        thirdPlace: { diamonds: 1500 }
    }
}
```

## 📤 批量导入

### 支持的格式
- **JSON**: 直接上传JSON数组文件
- **CSV**: 逗号分隔值文件
- **Excel**: xlsx/xls (需要额外库支持)

### 使用步骤
1. 点击"批量导入"按钮
2. 拖拽或选择文件
3. 预览数据
4. 确认导入

### 下载模板
每个模块都提供了模板下载功能，点击"下载模板"即可获取示例文件。

## 🔌 API 接口

### 塔模型 API
```
GET    /api/admin/towers           # 获取列表
POST   /api/admin/towers           # 创建
PUT    /api/admin/towers/:id       # 更新
DELETE /api/admin/towers/:id       # 删除
POST   /api/admin/towers/upload    # 上传图片
```

### 头像 API
```
GET    /api/admin/avatars
POST   /api/admin/avatars
PUT    /api/admin/avatars/:id
DELETE /api/admin/avatars/:id
```

### 道具 API
```
GET    /api/admin/items
POST   /api/admin/items
PUT    /api/admin/items/:id
```

### 商城 API
```
GET    /api/admin/shop-items
POST   /api/admin/shop-items
PUT    /api/admin/shop-items/:id
```

### 锦标赛 API
```
GET    /api/admin/tournaments
POST   /api/admin/tournaments
PUT    /api/admin/tournaments/:id
```

## 💾 数据存储

系统使用 **localStorage** 作为本地数据存储，数据会自动保存在浏览器中。

数据键名：
- `towers` - 塔模型数据
- `avatars` - 头像数据
- `items` - 道具数据
- `shopItems` - 商城商品数据
- `tournaments` - 锦标赛数据
- `adminUser` - 当前登录用户信息

## 🎨 界面预览

```
┌─────────────────────────────────────────────────────────┐
│ 🗼 塔模型管理                                            │
├─────────────────────────────────────────────────────────┤
│ [+ 上传新塔] [批量导入] [导出数据]                      │
│                                                          │
│ 筛选: [全部大洲▼] [难度▼] [状态▼]  搜索: [________]     │
│                                                          │
│ ┌────────┬────────┬────────┬────────┬────────┐        │
│ │ 预览   │ 名称   │ 国家   │ 大洲   │ 操作   │        │
│ ├────────┼────────┼────────┼────────┼────────┤        │
│ │ [图]   │东方明珠│ 中国   │ 亚洲   │编辑删除│        │
│ │ [图]   │埃菲尔  │ 法国   │ 欧洲   │编辑删除│        │
│ └────────┴────────┴────────┴────────┴────────┘        │
│                                                          │
│ 分页: [< 1 2 3 4 5 >]  共196条                          │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ 技术栈

- **前端**: HTML5 + CSS3 + Vanilla JavaScript
- **样式**: CSS Variables + Flexbox/Grid
- **存储**: LocalStorage
- **图标**: Emoji + Unicode

## 📝 开发计划

- [x] 塔模型管理
- [x] 头像管理
- [x] 道具管理
- [x] 商城商品管理
- [x] 锦标赛配置管理
- [x] 拖拽上传
- [x] 批量导入/导出
- [x] 权限管理
- [ ] 数据可视化
- [ ] 操作日志
- [ ] 数据同步API

## 📞 支持

如有问题或建议，请联系开发团队。

---

**命运塔** - 连接世界的攀登之旅 🏰
