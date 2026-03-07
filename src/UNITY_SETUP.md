# 🎮 Unity项目快速开始指南

## 项目信息
- **引擎版本：** Unity 2022.3 LTS
- **项目类型：** 2D/3D混合
- **目标平台：** PC/Mac, iOS, Android

## 快速设置

### 1. 安装依赖
```
Window → Package Manager
- 安装 TextMeshPro
- 安装 Unity UI
- 安装 Photon PUN 2 (从Asset Store)
```

### 2. 场景设置
- 打开 `Assets/Scenes/MainMenu.unity` - 主菜单
- 打开 `Assets/Scenes/Gameplay.unity` - 游戏场景

### 3. 构建设置
```
File → Build Settings
- PC, Mac & Linux Standalone (默认)
- iOS
- Android
```

## 项目结构

```
Assets/
├── Scripts/          # C#脚本
├── Resources/        # 资源文件
├── Scenes/          # 场景文件
├── Prefabs/         # 预制体
└── Plugins/         # 插件
```

## 核心功能

### 已实现系统
1. ✅ 卡牌系统 (Card.cs)
2. ✅ 牌库管理 (DeckManager.cs)
3. ✅ 玩家系统 (Player.cs)
4. ✅ 游戏核心 (GameManager.cs)
5. ✅ 段位系统 (RankSystem.cs)
6. ✅ 音效管理 (AudioManager.cs)
7. ✅ 存档系统 (SaveManager.cs)
8. ✅ 成就系统 (AchievementManager.cs)
9. ✅ 网络系统 (NetworkManager.cs)
10. ✅ UI系统 (UIManager.cs)

### 待完成
- [ ] 美术资源导入
- [ ] UI布局设计
- [ ] 动画制作
- [ ] 音效导入
- [ ] Photon配置
- [ ] 支付SDK集成

## 开发规范

### 命名规范
- 类名：PascalCase (GameManager)
- 方法名：PascalCase (StartGame)
- 变量名：camelCase (playerScore)
- 常量名：UPPER_SNAKE_CASE (MAX_PLAYERS)

### 代码风格
- 使用4空格缩进
- 大括号换行
- 中文注释说明逻辑

## 测试指南

### 单机测试
1. 打开 Gameplay 场景
2. 点击 Play
3. 观察4个AI玩家对战

### 联网测试
1. 配置 Photon App ID
2. 创建房间
3. 邀请其他玩家

## 发布流程

### 1. PC/Steam
- Build Settings → PC, Mac & Linux
- 平台：Windows x64
- 压缩格式：LZ4HC

### 2. 移动端
- iOS: 需要Xcode和Apple开发者账号
- Android: 需要Keystore

## 联系方式

**项目负责人：** 小金蛇 🐍  
**创意总监：** 金先生

---

_金蛇盘踞，Unity项目准备就绪。_
