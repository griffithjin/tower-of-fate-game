/**
 * 命运塔多语言国际化系统 (i18n)
 * Tower of Fate - Internationalization System
 * 支持15种全球主要市场语言
 */

// 支持的主要市场语言
const SUPPORTED_LOCALES = {
    // 主要营收市场 - 第一优先级
    'zh-CN': { name: '简体中文', country: '中国', countryCode: 'CN', revenuePriority: 1, flag: '🇨🇳' },
    'en-US': { name: 'English (US)', country: '美国', countryCode: 'US', revenuePriority: 1, flag: '🇺🇸' },
    'ja-JP': { name: '日本語', country: '日本', countryCode: 'JP', revenuePriority: 1, flag: '🇯🇵' },
    
    // 第二优先级市场
    'ko-KR': { name: '한국어', country: '韩国', countryCode: 'KR', revenuePriority: 2, flag: '🇰🇷' },
    'de-DE': { name: 'Deutsch', country: '德国', countryCode: 'DE', revenuePriority: 2, flag: '🇩🇪' },
    'fr-FR': { name: 'Français', country: '法国', countryCode: 'FR', revenuePriority: 2, flag: '🇫🇷' },
    'es-ES': { name: 'Español', country: '西班牙', countryCode: 'ES', revenuePriority: 2, flag: '🇪🇸' },
    'pt-BR': { name: 'Português', country: '巴西', countryCode: 'BR', revenuePriority: 2, flag: '🇧🇷' },
    
    // 第三优先级市场
    'ru-RU': { name: 'Русский', country: '俄罗斯', countryCode: 'RU', revenuePriority: 3, flag: '🇷🇺' },
    'ar-SA': { name: 'العربية', country: '沙特阿拉伯', countryCode: 'SA', revenuePriority: 3, flag: '🇸🇦', rtl: true },
    'hi-IN': { name: 'हिन्दी', country: '印度', countryCode: 'IN', revenuePriority: 3, flag: '🇮🇳' },
    'th-TH': { name: 'ไทย', country: '泰国', countryCode: 'TH', revenuePriority: 3, flag: '🇹🇭' },
    'vi-VN': { name: 'Tiếng Việt', country: '越南', countryCode: 'VN', revenuePriority: 3, flag: '🇻🇳' },
    'id-ID': { name: 'Bahasa Indonesia', country: '印尼', countryCode: 'ID', revenuePriority: 3, flag: '🇮🇩' },
    'tr-TR': { name: 'Türkçe', country: '土耳其', countryCode: 'TR', revenuePriority: 3, flag: '🇹🇷' }
};

// i18n核心系统
class I18nSystem {
    constructor() {
        this.currentLocale = this.detectLocale();
        this.translations = {};
        this.localeChangeCallbacks = [];
        this.isLoading = false;
        
        // 初始化
        this.init();
    }
    
    // 初始化系统
    async init() {
        // 加载当前语言
        await this.loadTranslations(this.currentLocale);
        
        // 应用初始语言
        this.updatePageLanguage();
        
        // 监听系统语言变化
        this.watchSystemLanguage();
        
        console.log(`[i18n] Initialized with locale: ${this.currentLocale}`);
    }
    
    // 检测用户语言
    detectLocale() {
        // 1. 检查本地存储
        const savedLocale = localStorage.getItem('userLocale');
        if (savedLocale && SUPPORTED_LOCALES[savedLocale]) {
            return savedLocale;
        }
        
        // 2. 检查浏览器语言
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang) {
            // 尝试精确匹配
            if (SUPPORTED_LOCALES[browserLang]) {
                return browserLang;
            }
            
            // 尝试模糊匹配 (e.g., 'en' matches 'en-US')
            const langPrefix = browserLang.split('-')[0];
            const matchedLocale = Object.keys(SUPPORTED_LOCALES).find(
                locale => locale.startsWith(langPrefix)
            );
            if (matchedLocale) {
                return matchedLocale;
            }
        }
        
        // 3. 默认使用英文
        return 'en-US';
    }
    
    // 加载翻译文件
    async loadTranslations(locale) {
        if (this.translations[locale]) {
            return; // 已加载
        }
        
        this.isLoading = true;
        
        try {
            const response = await fetch(`i18n/${locale}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load translations for ${locale}`);
            }
            this.translations[locale] = await response.json();
            console.log(`[i18n] Loaded translations for ${locale}`);
        } catch (error) {
            console.error(`[i18n] Error loading translations:`, error);
            // 如果加载失败，使用空对象避免崩溃
            this.translations[locale] = {};
        } finally {
            this.isLoading = false;
        }
    }
    
    // 翻译函数
    t(key, params = {}) {
        let text = this.translations[this.currentLocale]?.[key];
        
        // 如果当前语言没有翻译，尝试使用英文
        if (!text && this.currentLocale !== 'en-US') {
            text = this.translations['en-US']?.[key];
        }
        
        // 如果还没有，返回key本身
        if (!text) {
            return key;
        }
        
        // 参数替换
        Object.keys(params).forEach(param => {
            text = text.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
        });
        
        return text;
    }
    
    // 批量翻译
    translateBatch(keys) {
        const result = {};
        keys.forEach(key => {
            result[key] = this.t(key);
        });
        return result;
    }
    
    // 设置语言
    async setLocale(locale) {
        if (!SUPPORTED_LOCALES[locale]) {
            console.error(`[i18n] Unsupported locale: ${locale}`);
            return false;
        }
        
        if (locale === this.currentLocale) {
            return true;
        }
        
        // 加载新语言的翻译
        await this.loadTranslations(locale);
        
        // 更新当前语言
        this.currentLocale = locale;
        localStorage.setItem('userLocale', locale);
        
        // 更新页面
        this.updatePageLanguage();
        
        // 触发回调
        this.localeChangeCallbacks.forEach(callback => callback(locale));
        
        console.log(`[i18n] Locale changed to: ${locale}`);
        return true;
    }
    
    // 更新页面语言
    updatePageLanguage() {
        const localeConfig = SUPPORTED_LOCALES[this.currentLocale];
        
        // 设置HTML lang属性
        document.documentElement.lang = this.currentLocale;
        
        // 设置RTL方向
        if (localeConfig.rtl) {
            document.documentElement.dir = 'rtl';
        } else {
            document.documentElement.dir = 'ltr';
        }
        
        // 更新所有带data-i18n属性的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        
        // 更新带data-i18n-html的元素 (支持HTML内容)
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            const key = el.getAttribute('data-i18n-html');
            el.innerHTML = this.t(key);
        });
        
        // 更新placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
        
        // 更新title属性
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
        
        // 更新alt属性
        document.querySelectorAll('[data-i18n-alt]').forEach(el => {
            const key = el.getAttribute('data-i18n-alt');
            el.alt = this.t(key);
        });
        
        // 更新文档标题
        const titleKey = document.body.getAttribute('data-i18n-title');
        if (titleKey) {
            document.title = this.t(titleKey);
        }
    }
    
    // 监听语言变化
    onLocaleChange(callback) {
        this.localeChangeCallbacks.push(callback);
        return () => {
            const index = this.localeChangeCallbacks.indexOf(callback);
            if (index > -1) {
                this.localeChangeCallbacks.splice(index, 1);
            }
        };
    }
    
    // 监听系统语言变化
    watchSystemLanguage() {
        // 使用 MutationObserver 监听 data-i18n 属性的动态添加
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // 检查新添加的元素是否需要翻译
                            if (node.hasAttribute && node.hasAttribute('data-i18n')) {
                                const key = node.getAttribute('data-i18n');
                                node.textContent = this.t(key);
                            }
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 获取当前语言信息
    getCurrentLocaleInfo() {
        return {
            code: this.currentLocale,
            ...SUPPORTED_LOCALES[this.currentLocale]
        };
    }
    
    // 获取所有支持的语言
    getSupportedLocales() {
        return Object.entries(SUPPORTED_LOCALES).map(([code, info]) => ({
            code,
            ...info
        }));
    }
    
    // 格式化数字
    formatNumber(number, options = {}) {
        return new Intl.NumberFormat(this.currentLocale, options).format(number);
    }
    
    // 格式化货币
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat(this.currentLocale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
    
    // 格式化日期
    formatDate(date, options = {}) {
        const d = typeof date === 'string' ? new Date(date) : date;
        return new Intl.DateTimeFormat(this.currentLocale, options).format(d);
    }
    
    // 格式化相对时间
    formatRelativeTime(value, unit) {
        return new Intl.RelativeTimeFormat(this.currentLocale, { numeric: 'auto' }).format(value, unit);
    }
}

// 全局实例
const i18n = new I18nSystem();

// Vue/React 集成辅助函数
const i18nMixin = {
    // 通用混入方法
    t(key, params) {
        return i18n.t(key, params);
    },
    
    setLocale(locale) {
        return i18n.setLocale(locale);
    },
    
    getCurrentLocale() {
        return i18n.currentLocale;
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18nSystem, SUPPORTED_LOCALES, i18n, i18nMixin };
}
