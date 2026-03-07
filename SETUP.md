# 🔧 Unity场景设置指南

## 快速开始 (5分钟)

### 步骤1: 打开Unity项目
```
打开 Unity Hub → 添加项目 → 选择 tower-of-fate/src 文件夹
```

### 步骤2: 导入TextMeshPro
```
Window → TextMeshPro → Import Essential Resources
```

### 步骤3: 设置主菜单场景
1. 打开 `Assets/Scenes/MainMenu.unity`
2. 在 Hierarchy 右键 → UI → Canvas
3. 添加以下GameObject:

```
Canvas (Screen Space - Overlay)
├── MainPanel (Panel)
│   ├── TitleText (TextMeshPro - 命运之塔)
│   ├── StartGameButton (Button)
│   ├── MultiplayerButton (Button)
│   └── SettingsButton (Button)
├── SettingsPanel (Panel - 默认禁用)
└── ShopPanel (Panel - 默认禁用)
```

4. 创建空物体 `MainMenuController`，附加 `MainMenuController.cs` 脚本
5. 绑定按钮事件

### 步骤4: 设置游戏场景
1. 打开 `Assets/Scenes/Gameplay.unity`
2. 添加 Canvas，结构如下:

```
Canvas
├── GameInfoPanel (Panel)
│   ├── LevelText (TextMeshPro)
│   ├── TimerText (TextMeshPro)
│   └── DeckInfoText (TextMeshPro)
├── GuardCardPanel (Panel - 默认禁用)
│   └── GuardCardText (TextMeshPro)
├── PlayerPanels (4个 Panel)
├── HandContainer (Horizontal Layout Group)
└── ResultPanel (Panel - 默认禁用)
```

3. 创建空物体:
   - `GameManager` → 附加 `GameManager.cs`
   - `AudioManager` → 附加 `AudioManager.cs`
   - `GameplayController` → 附加 `GameplayController.cs`

### 步骤5: 创建卡牌预制体
1. 在 Canvas 下创建 Panel，命名为 `CardPrefab`
2. 添加子物体:
   - `SuitText` (TextMeshPro)
   - `RankText` (TextMeshPro)
3. 添加 `CardUI.cs` 脚本
4. 拖到 Project 窗口创建预制体
5. 删除场景中的实例

### 步骤6: 添加到Build Settings
```
File → Build Settings
- 添加 MainMenu 场景 (index 0)
- 添加 Gameplay 场景 (index 1)
```

### 步骤7: 运行测试
点击 Play 按钮，测试游戏流程！

---

## 🐛 常见问题

### TextMeshPro 报错
- 确保已导入 TMP Essential Resources
- 检查字体资源是否正确

### 场景切换失败
- 确保两个场景都已添加到 Build Settings
- 检查场景名称拼写是否正确

### 卡牌不显示
- 检查 CardPrefab 是否正确绑定
- 确保 HandContainer 有 Horizontal Layout Group

---

## 📦 项目结构

```
tower-of-fate/
├── src/
│   ├── Assets/
│   │   ├── Scripts/
│   │   │   ├── Core/         # 核心系统
│   │   │   ├── UI/           # UI控制器
│   │   │   ├── Network/      # 网络模块
│   │   │   ├── AI/           # AI策略
│   │   │   └── Editor/       # 编辑器工具
│   │   ├── Scenes/
│   │   │   ├── MainMenu.unity
│   │   │   └── Gameplay.unity
│   │   └── Resources/        # 资源文件夹
│   └── Packages/
└── README.md
```

---

_如有问题，联系小金蛇 🐍_
