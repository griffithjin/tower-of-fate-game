# 🗼 命运塔 (Tower of Fate) Logo设计

## 📁 文件结构

```
logo/
├── tower-of-fate-logo.svg      # 完整版Logo (带文字)
├── tower-of-fate-icon.svg      # 纯图标版 (推荐用于App图标)
├── generate-logo-pngs.sh       # PNG生成脚本
├── README.md                   # 本文档
└── [生成的PNG文件]
    ├── logo-16x16.png          # Favicon
    ├── logo-32x32.png          # 浏览器标签
    ├── logo-64x64.png          # 桌面图标
    ├── logo-128x128.png        # 应用商店
    ├── logo-256x256.png        # 高分辨率
    ├── logo-512x512.png        # App Store
    ├── logo-1024x1024.png      # Play Store
    ├── icon-16x16.png          # 图标版16x16
    ├── icon-32x32.png          # 图标版32x32
    ├── icon-64x64.png          # 图标版64x64
    ├── favicon.ico             # 网站favicon
    ├── ios-app-icon.png        # iOS App Store
    └── android-play-store.png  # Android Play Store
```

## 🎨 设计元素

### 塔身结构
- **13层塔身**：象征命运的层级和挑战
- **金色渐变顶部**：代表巅峰和成就
- **A字母标志**：Ace/顶尖的象征

### 卡牌元素
- **四张花色卡牌环绕塔身**：
  - ♥ 红桃 (红色) - 爱情/情感
  - ♠ 黑桃 (深蓝) - 力量/权威
  - ♦ 方块 (黄色) - 财富/物质
  - ♣ 梅花 (绿色) - 成长/运气

### 色彩方案
- **金色** (#FFD700, #FFA500) - 胜利、成就
- **深褐色** (#8B4513, #CD853F) - 塔身、稳定
- **深蓝背景** (#1A1A2E) - 神秘、高端

## 🛠 生成PNG

### 前提条件
```bash
# macOS
brew install imagemagick

# Linux
sudo apt-get install imagemagick
```

### 生成所有尺寸
```bash
cd logo
chmod +x generate-logo-pngs.sh
./generate-logo-pngs.sh
```

## 📱 使用指南

### Web应用
```html
<!-- Favicon -->
<link rel="icon" type="image/x-icon" href="/logo/favicon.ico">
<link rel="icon" type="image/png" sizes="32x32" href="/logo/logo-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/logo/logo-16x16.png">

<!-- Apple Touch Icon -->
<link rel="apple-touch-icon" sizes="180x180" href="/logo/logo-180x180.png">
```

### PWA配置
```json
{
  "icons": [
    { "src": "/logo/logo-72x72.png", "sizes": "72x72", "type": "image/png" },
    { "src": "/logo/logo-96x96.png", "sizes": "96x96", "type": "image/png" },
    { "src": "/logo/logo-128x128.png", "sizes": "128x128", "type": "image/png" },
    { "src": "/logo/logo-144x144.png", "sizes": "144x144", "type": "image/png" },
    { "src": "/logo/logo-152x152.png", "sizes": "152x152", "type": "image/png" },
    { "src": "/logo/logo-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/logo/logo-384x384.png", "sizes": "384x384", "type": "image/png" },
    { "src": "/logo/logo-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### React Native
```javascript
import { Image } from 'react-native';

// 使用不同尺寸的Logo
<Image source={require('./assets/logo/logo-64x64.png')} />
```

### Unity
```csharp
// 将PNG文件放入 Assets/Sprites/Logo/ 目录
// 在Sprite Renderer或UI Image中使用
```

## 📐 推荐尺寸使用场景

| 尺寸 | 使用场景 |
|-----|----------|
| 16×16 | 浏览器Favicon |
| 32×32 | 浏览器标签、Windows任务栏 |
| 64×64 | 桌面快捷方式、小型头像 |
| 128×128 | 应用商店列表、网站展示 |
| 256×256 | 高DPI显示、打印 |
| 512×512 | App Store提交 |
| 1024×1024 | Play Store提交、营销素材 |

## 🔧 修改Logo

如需修改Logo设计，直接编辑SVG文件：
- `tower-of-fate-logo.svg` - 完整版
- `tower-of-fate-icon.svg` - 图标版

然后重新运行 `./generate-logo-pngs.sh` 生成所有PNG。

## 📄 许可

© 2026 命运塔 (Tower of Fate). All rights reserved.
