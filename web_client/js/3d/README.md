# 🎮 命运塔3D特效道具系统 - 使用文档

## 📋 系统概述

命运塔3D特效道具系统是一套完整的程序化3D特效解决方案，使用 **Three.js** 实现，无需外部模型文件，所有特效均通过代码动态生成。

## ✨ 已实现的特效道具

### 上升特效 (Rise Effects)

| 名称 | 图标 | 稀有度 | 价格 | 3D模型特性 |
|------|------|--------|------|-----------|
| 筋斗云 | ☁️ | 史诗 | 💎188 | 半透明云朵群+金色边框光环，自然飘动动画 |
| 火箭背包 | 🚀 | 传说 | 💎288 | 火箭主体+喷射尾焰粒子+速度感抖动 |

### 下降特效 (Fall Effects)

| 名称 | 图标 | 稀有度 | 价格 | 3D模型特性 |
|------|------|--------|------|-----------|
| 神奇降落伞 | 🪂 | 稀有 | 💎128 | 彩色分段伞面+绳索，旋转摇摆飘落 |
| 天使羽毛 | 🪶 | 史诗 | 💎188 | 真实羽毛建模+圣光发光+闪烁粒子 |

### 守卫激怒特效 (Provoke Effects)

| 名称 | 图标 | 稀有度 | 价格 | 3D模型特性 |
|------|------|--------|------|-----------|
| 激光眼 | 👁️⚡ | 传说限定 | 💎388 | 红色激光束+扫描线+命中爆炸效果 |
| 雷电链 | ⚡ | 史诗 | 💎288 | 多分支闪电+电光闪烁+屏幕震动 |

## 📁 文件结构

```
js/3d/
├── effect-items-3d.js      # 3D特效模型生成器
├── effect-equip.js         # 装备系统
├── effect-trigger.js       # 触发逻辑
└── effect-integration.js   # 系统集成

shop/
└── effect-shop.js          # 特效商城分类
```

## 🚀 快速开始

### 1. 在HTML中引入脚本

```html
<!-- Three.js CDN -->
<script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>

<!-- 3D特效系统 -->
<script src="js/3d/effect-items-3d.js"></script>
<script src="js/3d/effect-equip.js"></script>
<script src="js/3d/effect-trigger.js"></script>
<script src="shop/effect-shop.js"></script>
<script src="js/3d/effect-integration.js"></script>
```

### 2. 初始化系统

```javascript
// 方式1: 使用集成初始化（推荐）
const effectSystem = initEffectSystem({
    container: document.getElementById('game-container'),
    shop: window.towerShop  // 主商城实例
});

// 方式2: 手动初始化
const effectItems3D = new EffectItems3D(scene);
const equipmentManager = new EffectEquipmentManager();
const triggerManager = new EffectTriggerManager(scene, camera, effectItems3D);
```

## 🎮 使用示例

### 装备特效

```javascript
// 获取装备管理器
const equip = window.effectEquipmentManager;

// 购买特效（会自动添加到背包）
equip.acquire('cloud');   // 筋斗云
equip.acquire('rocket');  // 火箭背包

// 装备上升特效
equip.equip('cloud', 'rise');     // 装备筋斗云作为上升特效
equip.equip('feather', 'fall');   // 装备天使羽毛作为下降特效
equip.equip('laser', 'provoke');  // 装备激光眼作为守卫特效

// 查看当前装备
const equipped = equip.getAllEquippedEffects();
console.log(equipped);
// 输出: { rise: {...}, fall: {...}, provoke: {...} }
```

### 触发特效

```javascript
// 获取触发管理器
const trigger = window.effectTriggerManager;

// 触发上升特效（玩家升级）
trigger.triggerRiseEffect(
    'player1',                                    // 玩家ID
    new THREE.Vector3(0, 0, 0),                  // 起始位置
    new THREE.Vector3(0, 5, 0),                  // 目标位置
    2000                                          // 持续时间(ms)
);

// 触发下降特效（玩家降级）
trigger.triggerFallEffect(
    'player1',
    new THREE.Vector3(0, 5, 0),
    new THREE.Vector3(0, 0, 0),
    3000
);

// 触发守卫激怒特效
trigger.triggerProvokeEffect(
    'guard1',                                    // 守卫ID
    'player1',                                   // 目标玩家ID
    new THREE.Vector3(3, 2, 0),                // 守卫位置
    new THREE.Vector3(0, 2, 0)                 // 目标位置
);
```

### 商城购买

```javascript
// 通过商城购买特效
const shop = window.towerShop;
const result = shop.purchase('effect_cloud');

if (result.success) {
    console.log('购买成功！');
    // 特效会自动添加到背包并装备（如果开启了autoEquip）
}
```

## ⚙️ 配置选项

### 装备偏好设置

```javascript
const equip = window.effectEquipmentManager;

// 更新偏好设置
equip.updatePreferences({
    autoEquip: true,           // 购买后自动装备
    showEffects: true,         // 显示特效
    particleDensity: 'high'    // 粒子密度: low, medium, high
});
```

### 3D场景配置

```javascript
const effectSystem = new EffectSystemIntegration();
effectSystem.init({
    scene: existingScene,        // 使用现有场景
    camera: existingCamera,      // 使用现有相机
    renderer: existingRenderer,  // 使用现有渲染器
    shop: towerShopInstance      // 商城实例
});
```

## 🎨 特效预览

```javascript
// 初始化3D预览
const shopManager = window.effectShopManager;
const previewContainer = document.getElementById('preview-3d');

shopManager.init3DPreview(previewContainer);

// 显示特定特效预览
shopManager.showItemPreview('effect_cloud');
```

## 📊 系统API

### EffectItems3D - 3D模型生成

```javascript
const items3D = new EffectItems3D(scene);

// 创建特效模型
const cloud = items3D.createCloud3D();
const rocket = items3D.createRocket3D();
const parachute = items3D.createParachute3D();
const feather = items3D.createFeather3D();
const laser = items3D.createLaserEye3D(from, to);
const thunder = items3D.createThunderChain3D(from, to);

// 通过ID获取特效
const effect = items3D.getEffect('cloud');
```

### EffectEquipmentManager - 装备管理

```javascript
const equip = new EffectEquipmentManager();

equip.getEffectDefinition('cloud');          // 获取特效定义
equip.getAllEffects();                       // 获取所有特效
equip.getEffectsByCategory('rise');          // 按分类获取
equip.equip('cloud', 'rise');                // 装备特效
equip.unequip('rise');                       // 取消装备
equip.acquire('cloud');                      // 获取所有权
equip.isOwned('cloud');                      // 检查是否拥有
equip.getInventoryStats();                   // 获取背包统计
```

### EffectTriggerManager - 触发管理

```javascript
const trigger = new EffectTriggerManager(scene, camera, items3D);

trigger.triggerRiseEffect(playerId, start, end, duration);
trigger.triggerFallEffect(playerId, start, end, duration);
trigger.triggerProvokeEffect(guardId, targetId, guardPos, targetPos);
trigger.triggerPurchaseEffect(position, rarity);
trigger.triggerEquipEffect(position);
trigger.getStats();                          // 获取触发统计
```

## 🔧 事件监听

```javascript
const equip = window.effectEquipmentManager;

// 监听装备事件
equip.addEventListener((eventName, data) => {
    switch(eventName) {
        case 'effectEquipped':
            console.log(`装备了 ${data.effect.name}`);
            break;
        case 'effectUnequipped':
            console.log(`卸下了特效`);
            break;
        case 'effectAcquired':
            console.log(`获得新特效: ${data.effect.name}`);
            break;
    }
});
```

## 🌐 本地存储

系统会自动保存以下数据到 `localStorage`:

```javascript
// 装备背包数据
tower_effect_inventory: {
    effects: {
        rise: 'rocket',      // 当前装备的上升特效
        fall: 'feather',     // 当前装备的下降特效
        provoke: 'laser'     // 当前装备的守卫特效
    },
    ownedEffects: ['cloud', 'rocket', 'parachute', 'feather'],
    preferences: {
        autoEquip: true,
        showEffects: true,
        particleDensity: 'medium'
    }
}
```

## 📱 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

需要支持 WebGL 的设备。

## 📝 更新日志

### v1.0.0 (2024-03-08)
- ✨ 初始版本发布
- ✨ 6个3D特效道具完整实现
- ✨ 装备系统
- ✨ 触发系统
- ✨ 商城集成
- ✨ 粒子系统

## 🤝 集成到游戏

```javascript
// 与现有游戏集成
function integrateWithMyGame(game) {
    // 初始化特效系统
    initEffectSystem({ shop: game.shop });
    
    // 绑定游戏事件
    game.on('playerLevelUp', (data) => {
        EffectTriggers.onPlayerLevelUp(
            data.playerId,
            data.fromLevel,
            data.toLevel,
            data.position
        );
    });
    
    game.on('playerLevelDown', (data) => {
        EffectTriggers.onPlayerLevelDown(
            data.playerId,
            data.fromLevel,
            data.toLevel,
            data.position
        );
    });
    
    game.on('guardAnger', (data) => {
        EffectTriggers.onGuardProvoke(
            data.guardId,
            data.targetId,
            data.guardPosition,
            data.targetPosition
        );
    });
}
```

---

**开发者**: 小金蛇 🐍  
**版本**: v1.0.0  
**最后更新**: 2024-03-08
