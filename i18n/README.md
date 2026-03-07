# 🌐 命运塔多语言国际化系统

Tower of Fate - Internationalization (i18n) System

## 📋 系统概述

命运塔多语言国际化系统支持全球 **15 种主要市场语言**，覆盖亚洲、欧洲、美洲和中东地区的主要游戏市场。

### 支持语言列表

| 优先级 | 语言代码 | 语言 | 国家/地区 | 国旗 |
|--------|----------|------|-----------|------|
| 1 | zh-CN | 简体中文 | 中国 | 🇨🇳 |
| 1 | en-US | English | 美国 | 🇺🇸 |
| 1 | ja-JP | 日本語 | 日本 | 🇯🇵 |
| 2 | ko-KR | 한국어 | 韩国 | 🇰🇷 |
| 2 | de-DE | Deutsch | 德国 | 🇩🇪 |
| 2 | fr-FR | Français | 法国 | 🇫🇷 |
| 2 | es-ES | Español | 西班牙 | 🇪🇸 |
| 2 | pt-BR | Português | 巴西 | 🇧🇷 |
| 3 | ru-RU | Русский | 俄罗斯 | 🇷🇺 |
| 3 | ar-SA | العربية | 沙特阿拉伯 | 🇸🇦 (RTL) |
| 3 | hi-IN | हिन्दी | 印度 | 🇮🇳 |
| 3 | th-TH | ไทย | 泰国 | 🇹🇭 |
| 3 | vi-VN | Tiếng Việt | 越南 | 🇻🇳 |
| 3 | id-ID | Bahasa Indonesia | 印尼 | 🇮🇩 |
| 3 | tr-TR | Türkçe | 土耳其 | 🇹🇷 |

## 📁 文件结构

```
fate-tower-backend/
├── i18n/                          # 翻译文件目录
│   ├── zh-CN.json                 # 简体中文
│   ├── en-US.json                 # 英文
│   ├── ja-JP.json                 # 日文
│   ├── ko-KR.json                 # 韩文
│   ├── de-DE.json                 # 德文
│   ├── fr-FR.json                 # 法文
│   ├── es-ES.json                 # 西班牙文
│   ├── pt-BR.json                 # 葡萄牙文
│   ├── ru-RU.json                 # 俄文
│   ├── ar-SA.json                 # 阿拉伯文 (RTL)
│   ├── hi-IN.json                 # 印地文
│   ├── th-TH.json                 # 泰文
│   ├── vi-VN.json                 # 越南文
│   ├── id-ID.json                 # 印尼文
│   └── tr-TR.json                 # 土耳其文
│
├── web_client/
│   ├── js/
│   │   └── i18n-system.js         # i18n 核心系统
│   └── i18n-demo.html             # 使用示例
│
└── admin/
    ├── i18n-manager.html          # 后台管理界面
    └── js/
        └── i18n-manager.js        # 后台管理逻辑
```

## 🚀 快速开始

### 1. 引入 i18n 系统

```html
<script src="js/i18n-system.js"></script>
```

### 2. HTML 中使用翻译

```html
<!-- 使用 data-i18n 属性 -->
<h1 data-i18n="game.title"></h1>
<p data-i18n="game.subtitle"></p>

<!-- 使用 data-i18n-placeholder 属性 -->
<input data-i18n-placeholder="search.placeholder" placeholder="">

<!-- 使用 data-i18n-title 属性 -->
<button data-i18n-title="tooltip.save" title="">Save</button>
```

### 3. JavaScript 中使用翻译

```javascript
// 简单翻译
const title = i18n.t('game.title');

// 带参数的翻译
const message = i18n.t('game.rise', { layers: 3 });
// 结果: "上升3层" (中文) / "Rise 3 floors" (英文)

// 批量翻译
const texts = i18n.translateBatch(['nav.home', 'nav.play', 'nav.shop']);
```

### 4. 切换语言

```javascript
// 切换到英文
await i18n.setLocale('en-US');

// 切换到日文
await i18n.setLocale('ja-JP');

// 获取当前语言
const currentLocale = i18n.currentLocale;
const localeInfo = i18n.getCurrentLocaleInfo();
```

## 📖 API 文档

### I18nSystem 类

#### 方法

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `t(key, params)` | `string`, `object` | `string` | 获取翻译文本 |
| `setLocale(locale)` | `string` | `Promise<boolean>` | 设置当前语言 |
| `getCurrentLocaleInfo()` | - | `object` | 获取当前语言信息 |
| `getSupportedLocales()` | - | `array` | 获取所有支持的语言 |
| `formatNumber(number, options)` | `number`, `object` | `string` | 格式化数字 |
| `formatCurrency(amount, currency)` | `number`, `string` | `string` | 格式化货币 |
| `formatDate(date, options)` | `Date/string`, `object` | `string` | 格式化日期 |
| `formatRelativeTime(value, unit)` | `number`, `string` | `string` | 格式化相对时间 |
| `onLocaleChange(callback)` | `function` | `function` | 监听语言变化 |

#### 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| `currentLocale` | `string` | 当前语言代码 |
| `translations` | `object` | 加载的翻译数据 |
| `isLoading` | `boolean` | 是否正在加载 |

### 配置

```javascript
const SUPPORTED_LOCALES = {
    'zh-CN': { name: '简体中文', country: '中国', revenuePriority: 1, flag: '🇨🇳' },
    'en-US': { name: 'English', country: '美国', revenuePriority: 1, flag: '🇺🇸' },
    // ... 其他语言
};
```

## 🎨 翻译文件格式

```json
{
    "_meta": {
        "language": "简体中文",
        "locale": "zh-CN",
        "flag": "🇨🇳"
    },
    
    "game.title": "命运塔·首登者",
    "game.subtitle": "征服13层，成为首登者",
    
    "game.play": "出牌",
    "game.pass": "跳过",
    "game.rise": "上升{{layers}}层",
    "game.fall": "下降{{layers}}层",
    
    "tournament.register": "报名",
    "tournament.countdown": "报名剩余 {{time}}",
    "tournament.prize.champion": "冠军奖励: {{amount}}钻石",
    
    "shop.buy": "购买",
    "shop.soldOut": "售罄",
    "shop.discount": "{{percent}}折"
}
```

### 参数替换

使用 `{{parameterName}}` 语法进行参数替换：

```javascript
i18n.t('game.rise', { layers: 5 });        // "上升5层"
i18n.t('shop.discount', { percent: 50 });  // "50折"
i18n.t('postcard.title', { country: '中国' }); // "中国明信片"
```

## 🛠️ 后台管理系统

### 访问方式

打开 `admin/i18n-manager.html` 文件即可访问后台管理系统。

### 功能特性

- 📊 **翻译完成度统计** - 实时查看各语言翻译进度
- 🔍 **搜索和筛选** - 快速查找翻译键
- ✏️ **在线编辑** - 直接修改翻译内容
- 📥 **批量导入** - 支持 JSON/CSV 格式导入
- 📤 **导出功能** - 一键导出所有语言文件
- 👁️ **预览功能** - 实时预览翻译效果

### 使用示例

```javascript
// 编辑翻译
i18nManager.editTranslation('game.newKey', {
    'zh-CN': '新的文本',
    'en-US': 'New text',
    'ja-JP': '新しいテキスト'
});

// 添加新键
i18nManager.addNewKey('game.feature', '默认文本');

// 删除键
i18nManager.deleteKey('game.oldKey');

// 获取报告
const report = i18nManager.getReport();
console.log(report);
```

## 🌍 RTL 支持

阿拉伯语 (ar-SA) 支持从右到左 (RTL) 布局：

```javascript
// 系统会自动检测 RTL 语言并设置 dir="rtl"
document.documentElement.dir = 'rtl';
```

在 CSS 中使用逻辑属性：

```css
/* 使用逻辑属性代替物理属性 */
.element {
    margin-inline-start: 10px;  /* 代替 margin-left */
    margin-inline-end: 10px;    /* 代替 margin-right */
    text-align: start;          /* 代替 text-align: left */
}
```

## 📱 语言切换器组件

```html
<div class="language-selector">
    <button onclick="toggleLangMenu()">
        🌐 <span id="currentLang"></span>
    </button>
    
    <div class="lang-menu" id="langMenu">
        <div class="lang-item" onclick="changeLang('zh-CN')">
            🇨🇳 简体中文
        </div>
        <div class="lang-item" onclick="changeLang('en-US')">
            🇺🇸 English
        </div>
        <!-- 其他语言... -->
    </div>
</div>
```

```javascript
async function changeLang(lang) {
    await i18n.setLocale(lang);
    // 重新加载页面或更新内容
    location.reload();
}
```

## 🔧 开发指南

### 添加新语言

1. 在 `SUPPORTED_LOCALES` 中添加语言配置
2. 创建新的翻译文件 `i18n/xx-XX.json`
3. 更新后台管理界面

### 添加新翻译键

1. 在所有语言文件中添加相同的键
2. 使用后台管理系统批量编辑
3. 在 HTML 中使用 `data-i18n` 属性

### 最佳实践

- 使用命名空间组织键名：`category.subcategory.key`
- 避免硬编码，所有用户可见文本都使用翻译键
- 为复数形式预留参数：`{{count}} items`
- 测试所有语言下的布局适配

## 📄 许可证

MIT License

---

🎮 **命运塔** - 征服13层，成为首登者！
