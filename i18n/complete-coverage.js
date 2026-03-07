/**
 * Tower of Fate - i18n Complete Coverage Checker
 * 命运塔 - 多语言完整覆盖检查器
 * 
 * 功能：
 * - 检查所有 data-i18n 属性的翻译完整性
 * - 验证按钮、输入框、占位符的翻译
 * - 动态内容翻译支持
 * - 缺失翻译自动记录
 */

class I18nCoverageChecker {
    constructor(i18n) {
        this.i18n = i18n;
        this.missingTranslations = [];
        this.warnings = [];
        this.stats = {
            totalElements: 0,
            translatedElements: 0,
            missingElements: 0,
            coverage: 0
        };
    }
    
    /**
     * 完整检查
     */
    checkAll() {
        console.log('[i18n] Starting complete coverage check...');
        
        this.checkDataI18nAttributes();
        this.checkButtons();
        this.checkInputs();
        this.checkPlaceholders();
        this.checkAriaLabels();
        this.checkTitles();
        this.checkDynamicContent();
        this.checkErrorMessages();
        this.checkNotifications();
        
        this.calculateStats();
        this.generateReport();
        
        return {
            stats: this.stats,
            missing: this.missingTranslations,
            warnings: this.warnings
        };
    }
    
    /**
     * 检查所有 data-i18n 属性
     */
    checkDataI18nAttributes() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const params = this.parseParams(el.getAttribute('data-i18n-params'));
            
            this.stats.totalElements++;
            
            const translation = this.i18n.t(key, params);
            
            if (translation === key || !translation) {
                this.stats.missingElements++;
                this.missingTranslations.push({
                    type: 'data-i18n',
                    key: key,
                    element: this.describeElement(el),
                    context: el.outerHTML.substring(0, 100)
                });
                
                // 添加视觉标记
                el.classList.add('i18n-missing');
                el.setAttribute('title', `[Missing: ${key}]`);
            } else {
                this.stats.translatedElements++;
                el.classList.remove('i18n-missing');
            }
        });
    }
    
    /**
     * 检查按钮翻译
     */
    checkButtons() {
        const buttons = document.querySelectorAll('button:not([data-i18n])');
        
        buttons.forEach(btn => {
            const text = btn.textContent.trim();
            
            // 检查按钮是否包含硬编码文本
            if (text && !this.isDynamicContent(text) && !btn.querySelector('[data-i18n]')) {
                this.warnings.push({
                    type: 'button-no-i18n',
                    text: text,
                    element: this.describeElement(btn),
                    suggestion: `Add data-i18n="button.${this.keyify(text)}"`
                });
                
                if (window.i18nDebug) {
                    btn.style.outline = '2px dashed orange';
                }
            }
        });
    }
    
    /**
     * 检查输入框
     */
    checkInputs() {
        const inputs = document.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            // 检查 placeholder
            const placeholder = input.getAttribute('placeholder');
            if (placeholder && !input.hasAttribute('data-i18n-placeholder')) {
                this.warnings.push({
                    type: 'input-placeholder-no-i18n',
                    placeholder: placeholder,
                    element: this.describeElement(input),
                    suggestion: `Add data-i18n-placeholder="placeholder.${this.keyify(placeholder)}"`
                });
            }
            
            // 检查 label 关联
            const id = input.id;
            if (id) {
                const label = document.querySelector(`label[for="${id}"]`);
                if (label && !label.hasAttribute('data-i18n') && label.textContent.trim()) {
                    this.warnings.push({
                        type: 'label-no-i18n',
                        text: label.textContent.trim(),
                        for: id,
                        element: this.describeElement(label),
                        suggestion: `Add data-i18n="form.label.${this.keyify(id)}"`
                    });
                }
            }
        });
    }
    
    /**
     * 检查占位符
     */
    checkPlaceholders() {
        const elementsWithPlaceholder = document.querySelectorAll('[placeholder]:not([data-i18n-placeholder])');
        
        elementsWithPlaceholder.forEach(el => {
            const placeholder = el.getAttribute('placeholder');
            this.warnings.push({
                type: 'placeholder-no-i18n',
                placeholder: placeholder,
                element: this.describeElement(el),
                suggestion: `Add data-i18n-placeholder="${this.keyify(placeholder)}"`
            });
        });
    }
    
    /**
     * 检查 ARIA 标签
     */
    checkAriaLabels() {
        const elements = document.querySelectorAll('[aria-label]:not([data-i18n-aria])');
        
        elements.forEach(el => {
            const label = el.getAttribute('aria-label');
            if (label && !this.isKeyFormat(label)) {
                this.warnings.push({
                    type: 'aria-label-no-i18n',
                    label: label,
                    element: this.describeElement(el),
                    suggestion: `Add data-i18n-aria="aria.${this.keyify(label)}"`
                });
            }
        });
    }
    
    /**
     * 检查 title 属性
     */
    checkTitles() {
        const elements = document.querySelectorAll('[title]:not([data-i18n-title])');
        
        elements.forEach(el => {
            const title = el.getAttribute('title');
            if (title && !this.isKeyFormat(title) && !title.startsWith('http')) {
                this.warnings.push({
                    type: 'title-no-i18n',
                    title: title,
                    element: this.describeElement(el),
                    suggestion: `Add data-i18n-title="title.${this.keyify(title)}"`
                });
            }
        });
    }
    
    /**
     * 检查动态内容
     */
    checkDynamicContent() {
        // 检查模板中的翻译键
        const templates = document.querySelectorAll('template');
        
        templates.forEach(template => {
            const content = template.innerHTML;
            
            // 查找硬编码的文本内容
            const textMatches = content.match(/>[^\u003c]+\u003c/g);
            if (textMatches) {
                textMatches.forEach(match => {
                    const text = match.slice(1, -1).trim();
                    if (text && text.length > 2 && !this.isKeyFormat(text)) {
                        this.warnings.push({
                            type: 'template-hardcoded-text',
                            text: text,
                            template: template.id || 'unnamed',
                            suggestion: `Use {{t('${this.keyify(text)}')}} or data-i18n attribute`
                        });
                    }
                });
            }
        });
    }
    
    /**
     * 检查错误消息
     */
    checkErrorMessages() {
        // 检查常见的错误消息模式
        const errorElements = document.querySelectorAll('.error, .alert, [role="alert"]');
        
        errorElements.forEach(el => {
            if (!el.hasAttribute('data-i18n') && el.textContent.trim()) {
                this.warnings.push({
                    type: 'error-message-no-i18n',
                    text: el.textContent.trim(),
                    element: this.describeElement(el),
                    suggestion: `Add data-i18n="error.${this.keyify(el.textContent.trim())}"`
                });
            }
        });
    }
    
    /**
     * 检查通知消息
     */
    checkNotifications() {
        // 检查通知容器
        const notificationContainers = document.querySelectorAll('.notifications, .toast-container, [data-notifications]');
        
        notificationContainers.forEach(container => {
            // 检查是否有默认消息
            const messages = container.querySelectorAll(':scope > *');
            messages.forEach(msg => {
                if (!msg.hasAttribute('data-i18n') && msg.textContent.trim()) {
                    this.warnings.push({
                        type: 'notification-no-i18n',
                        text: msg.textContent.trim(),
                        element: this.describeElement(msg),
                        suggestion: 'Notifications should use i18n keys'
                    });
                }
            });
        });
    }
    
    /**
     * 解析翻译参数
     */
    parseParams(paramString) {
        if (!paramString) return {};
        
        try {
            return JSON.parse(paramString);
        } catch (e) {
            console.warn('[i18n] Failed to parse params:', paramString);
            return {};
        }
    }
    
    /**
     * 计算覆盖率统计
     */
    calculateStats() {
        if (this.stats.totalElements > 0) {
            this.stats.coverage = Math.round(
                (this.stats.translatedElements / this.stats.totalElements) * 100
            );
        }
    }
    
    /**
     * 生成报告
     */
    generateReport() {
        console.group('[i18n] Coverage Report');
        console.log('Total Elements:', this.stats.totalElements);
        console.log('Translated:', this.stats.translatedElements);
        console.log('Missing:', this.stats.missingElements);
        console.log('Coverage:', this.stats.coverage + '%');
        
        if (this.missingTranslations.length > 0) {
            console.group('Missing Translations:');
            this.missingTranslations.forEach(item => {
                console.warn(`  - ${item.key} (${item.type})`);
            });
            console.groupEnd();
        }
        
        if (this.warnings.length > 0) {
            console.group('Warnings:');
            this.warnings.forEach(warning => {
                console.warn(`  - ${warning.type}: ${warning.text || warning.placeholder || warning.title}`);
            });
            console.groupEnd();
        }
        
        console.groupEnd();
        
        // 导出缺失翻译列表
        this.exportMissingTranslations();
    }
    
    /**
     * 导出缺失的翻译
     */
    exportMissingTranslations() {
        const missingKeys = [...new Set(this.missingTranslations.map(m => m.key))];
        
        if (missingKeys.length > 0 && typeof window !== 'undefined') {
            window.missingTranslations = missingKeys;
            
            // 发送到服务器（可选）
            if (navigator.sendBeacon) {
                navigator.sendBeacon('/api/i18n/missing-translations', JSON.stringify({
                    language: this.i18n.language,
                    missingKeys: missingKeys,
                    timestamp: Date.now(),
                    url: window.location.pathname
                }));
            }
        }
        
        return missingKeys;
    }
    
    /**
     * 描述元素
     */
    describeElement(el) {
        const tag = el.tagName.toLowerCase();
        const id = el.id ? `#${el.id}` : '';
        const classes = el.className ? `.${el.className.split(' ').join('.')}` : '';
        const name = el.getAttribute('name') ? `[name="${el.getAttribute('name')}"]` : '';
        
        return `${tag}${id}${classes}${name}`;
    }
    
    /**
     * 将文本转换为键格式
     */
    keyify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .replace(/\s+/g, '_')
            .substring(0, 50);
    }
    
    /**
     * 检查是否为动态内容
     */
    isDynamicContent(text) {
        // 检查是否为变量、数字或特殊字符
        return /^[\{\$\#\d\s]+$/.test(text) || 
               text.startsWith('{{') || 
               text.startsWith('${');
    }
    
    /**
     * 检查是否为翻译键格式
     */
    isKeyFormat(text) {
        return /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)*$/.test(text);
    }
}

/**
 * 动态内容翻译助手
 */
class DynamicContentTranslator {
    constructor(i18n) {
        this.i18n = i18n;
    }
    
    /**
     * 翻译动态内容
     */
    t(key, params = {}) {
        return this.i18n.t(key, params);
    }
    
    /**
     * 渲染带翻译的卡片
     */
    renderCard(data) {
        return `
            <div class="card" data-i18n="card.title" data-i18n-params='${JSON.stringify({ name: data.name })}'>
                ${this.t('card.title', { name: data.name })}
            </div>
        `;
    }
    
    /**
     * 渲染带翻译的按钮
     */
    renderButton(action, params = {}) {
        const key = `button.${action}`;
        return `
            <button class="btn btn-primary" data-i18n="${key}" data-i18n-params='${JSON.stringify(params)}'>
                ${this.t(key, params)}
            </button>
        `;
    }
    
    /**
     * 渲染带翻译的通知
     */
    renderNotification(type, params = {}) {
        const key = `notification.${type}`;
        return {
            title: this.t(`${key}.title`, params),
            message: this.t(`${key}.message`, params),
            icon: this.t(`${key}.icon`, params)
        };
    }
    
    /**
     * 渲染带翻译的错误消息
     */
    renderError(code, params = {}) {
        const key = `error.${code}`;
        return {
            code: code,
            message: this.t(key, params),
            suggestion: this.t(`${key}.suggestion`, params)
        };
    }
    
    /**
     * 渲染带翻译的表单标签
     */
    renderFormLabel(field, params = {}) {
        const key = `form.label.${field}`;
        return `
            <label for="${field}" data-i18n="${key}">
                ${this.t(key, params)}
            </label>
        `;
    }
    
    /**
     * 渲染带翻译的输入框占位符
     */
    renderPlaceholder(field, params = {}) {
        const key = `placeholder.${field}`;
        return this.t(key, params);
    }
}

/**
 * 实时翻译观察者
 */
class LiveTranslationObserver {
    constructor(i18n) {
        this.i18n = i18n;
        this.observer = null;
        this.translator = new DynamicContentTranslator(i18n);
    }
    
    /**
     * 开始观察 DOM 变化
     */
    observe() {
        this.observer = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.translateElement(node);
                    }
                });
            });
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    /**
     * 翻译元素
     */
    translateElement(el) {
        // 翻译元素本身
        if (el.hasAttribute && el.hasAttribute('data-i18n')) {
            const key = el.getAttribute('data-i18n');
            const params = this.parseParams(el.getAttribute('data-i18n-params'));
            el.textContent = this.i18n.t(key, params);
        }
        
        // 翻译子元素
        if (el.querySelectorAll) {
            el.querySelectorAll('[data-i18n]').forEach(child => {
                const key = child.getAttribute('data-i18n');
                const params = this.parseParams(child.getAttribute('data-i18n-params'));
                child.textContent = this.i18n.t(key, params);
            });
        }
    }
    
    /**
     * 停止观察
     */
    disconnect() {
        if (this.observer) {
            this.observer.disconnect();
        }
    }
    
    parseParams(paramString) {
        if (!paramString) return {};
        try {
            return JSON.parse(paramString);
        } catch (e) {
            return {};
        }
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        I18nCoverageChecker,
        DynamicContentTranslator,
        LiveTranslationObserver
    };
}

// 全局暴露
if (typeof window !== 'undefined') {
    window.I18nCoverageChecker = I18nCoverageChecker;
    window.DynamicContentTranslator = DynamicContentTranslator;
    window.LiveTranslationObserver = LiveTranslationObserver;
}
