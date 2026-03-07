# Unity 2022.3 LTS 安装指南

## 下载地址
官方下载：https://unity.com/releases/editor/archive

## 快速安装步骤

### 1. 下载 Unity Hub
```bash
curl -L -o UnityHub.dmg "https://public-cdn.cloud.unity3d.com/hub/prod/UnityHubSetup.dmg"
```

### 2. 安装 Unity Hub
```bash
open UnityHub.dmg
drag Unity Hub to Applications
```

### 3. 通过 Hub 安装 Unity 2022.3 LTS
- 打开 Unity Hub
- 点击 Installs → Install Editor
- 选择 Unity 2022.3.20f1 LTS
- 选择模块：Mac Build Support, iOS Build Support, Android Build Support

### 4. 打开项目
```bash
open -a "Unity Hub"
# 添加项目: /Users/moutai/.openclaw/workspace/projects/tower-of-fate/src
```

## 项目配置

### 必装包 (Packages)
- TextMeshPro
- Unity UI
- Photon PUN 2 (从 Asset Store)

### 构建设置
- Platform: PC, Mac & Linux Standalone
- Architecture: x64

## 快捷命令
```bash
# 用命令行打开Unity (安装后)
/Applications/Unity/Unity.app/Contents/MacOS/Unity -projectPath \
  /Users/moutai/.openclaw/workspace/projects/tower-of-fate/src
```

---
_金蛇备注：先完成代码和文档工作，Unity安装可并行进行_
