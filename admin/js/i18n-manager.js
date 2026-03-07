/**
 * 命运塔多语言管理系统
 * Tower of Fate i18n Management System
 */

class I18nManager {
    constructor() {
        this.locales = [
            'zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'de-DE', 'fr-FR', 
            'es-ES', 'pt-BR', 'ru-RU', 'ar-SA', 'hi-IN', 'th-TH', 
            'vi-VN', 'id-ID', 'tr-TR'
        ];
        this.translations = {};
        this.currentEditing = 'zh-CN';
        this.pendingChanges = new Map();
        
        // Initialize
        this.init();
    }
    
    async init() {
        await this.loadAllTranslations();
        this.renderStats();
        this.renderCompletionBars();
        this.renderTranslationTable();
        this.setupEventListeners();
        console.log('[i18nManager] Initialized');
    }
    
    // 加载所有翻译文件
    async loadAllTranslations() {
        const loadPromises = this.locales.map(async (locale) => {
            try {
                const response = await fetch(`../i18n/${locale}.json`);
                if (response.ok) {
                    this.translations[locale] = await response.json();
                } else {
                    this.translations[locale] = {};
                }
            } catch (error) {
                console.warn(`Failed to load ${locale}:`, error);
                this.translations[locale] = {};
            }
        });
        
        await Promise.all(loadPromises);
    }
    
    // 渲染统计数据
    renderStats() {
        // 总语言数
        document.getElementById('totalLanguages').textContent = this.locales.length;
        
        // 翻译键总数 (基于中文)
        const zhKeys = Object.keys(this.translations['zh-CN'] || {}).filter(k => !k.startsWith('_'));
        document.getElementById('totalKeys').textContent = zhKeys.length;
        
        // 平均完成度
        let totalCompletion = 0;
        this.locales.forEach(locale => {
            totalCompletion += this.calculateCompletion(locale);
        });
        const avgCompletion = (totalCompletion / this.locales.length).toFixed(1);
        document.getElementById('avgCompletion').textContent = avgCompletion + '%';
        
        // 最后更新时间
        document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString('zh-CN');
    }
    
    // 计算完成度
    calculateCompletion(locale) {
        const baseKeys = Object.keys(this.translations['zh-CN'] || {}).filter(k => !k.startsWith('_'));
        const localeKeys = Object.keys(this.translations[locale] || {}).filter(k => !k.startsWith('_'));
        
        if (baseKeys.length === 0) return 100;
        
        // 计算有多少键被翻译了
        let translated = 0;
        baseKeys.forEach(key => {
            if (this.translations[locale]?.[key] && this.translations[locale][key].trim() !== '') {
                translated++;
            }
        });
        
        return (translated / baseKeys.length * 100);
    }
    
    // 渲染完成度进度条
    renderCompletionBars() {
        const container = document.getElementById('completionBars');
        const localeNames = {
            'zh-CN': '🇨🇳 简体中文',
            'en-US': '🇺🇸 English',
            'ja-JP': '🇯🇵 日本語',
            'ko-KR': '🇰🇷 한국어',
            'de-DE': '🇩🇪 Deutsch',
            'fr-FR': '🇫🇷 Français',
            'es-ES': '🇪🇸 Español',
            'pt-BR': '🇧🇷 Português',
            'ru-RU': '🇷🇺 Русский',
            'ar-SA': '🇸🇦 العربية',
            'hi-IN': '🇮🇳 हिन्दी',
            'th-TH': '🇹🇭 ไทย',
            'vi-VN': '🇻🇳 Tiếng Việt',
            'id-ID': '🇮🇩 Bahasa Indonesia',
            'tr-TR': '🇹🇷 Türkçe'
        };
        
        container.innerHTML = this.locales.map(locale => {
            const completion = this.calculateCompletion(locale);
            const isComplete = completion >= 100;
            
            return `
                <div class="progress-item">
                    <div class="progress-header">
                        <span>${localeNames[locale]}</span>
                        <span>${completion.toFixed(1)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill ${isComplete ? 'complete' : ''}" style="width: ${completion}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 渲染翻译表格
    renderTranslationTable(searchTerm = '') {
        const tbody = document.getElementById('translationTableBody');
        const baseKeys = Object.keys(this.translations['zh-CN'] || {})
            .filter(k => !k.startsWith('_'))
            .filter(k => !searchTerm || k.toLowerCase().includes(searchTerm.toLowerCase()));
        
        tbody.innerHTML = baseKeys.slice(0, 50).map(key => {
            const zhValue = this.translations['zh-CN']?.[key] || '';
            const enValue = this.translations['en-US']?.[key] || '';
            const jaValue = this.translations['ja-JP']?.[key] || '';
            
            return `
                <tr data-key="${key}">
                    <td class="key-cell">${key}</td>
                    <td><input type="text" value="${this.escapeHtml(zhValue)}" data-locale="zh-CN" data-key="${key}"></td>
                    <td><input type="text" value="${this.escapeHtml(enValue)}" data-locale="en-US" data-key="${key}"></td>
                    <td><input type="text" value="${this.escapeHtml(jaValue)}" data-locale="ja-JP" data-key="${key}"></td>
                    <td>
                        <button class="btn btn-secondary" onclick="i18nManager.saveKey('${key}')" style="padding: 6px 12px; font-size: 0.8rem;">
                            保存
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    
    // HTML转义
    escapeHtml(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
    
    // 设置事件监听
    setupEventListeners() {
        // 搜索
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.renderTranslationTable(e.target.value);
        });
        
        // 输入框变化监听
        document.getElementById('translationTableBody')?.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') {
                const locale = e.target.dataset.locale;
                const key = e.target.dataset.key;
                const value = e.target.value;
                
                this.pendingChanges.set(`${locale}.${key}`, { locale, key, value });
            }
        });
    }
    
    // 保存单个键
    async saveKey(key) {
        const row = document.querySelector(`tr[data-key="${key}"]`);
        if (!row) return;
        
        const inputs = row.querySelectorAll('input');
        const updates = [];
        
        inputs.forEach(input => {
            const locale = input.dataset.locale;
            const value = input.value;
            
            if (this.translations[locale]) {
                this.translations[locale][key] = value;
                updates.push({ locale, key, value });
            }
        });
        
        // 这里可以添加API调用来保存到服务器
        console.log('Saving:', updates);
        
        this.showToast('保存成功！');
        this.renderCompletionBars();
    }
    
    // 保存所有更改
    async saveAll() {
        if (this.pendingChanges.size === 0) {
            this.showToast('没有待保存的更改');
            return;
        }
        
        // 应用所有更改
        this.pendingChanges.forEach(({ locale, key, value }) => {
            if (this.translations[locale]) {
                this.translations[locale][key] = value;
            }
        });
        
        // 导出所有文件
        this.locales.forEach(locale => {
            this.downloadJSON(this.translations[locale], `translations-${locale}.json`);
        });
        
        this.pendingChanges.clear();
        this.showToast('所有更改已保存并导出！');
        this.renderCompletionBars();
    }
    
    // 批量导入
    batchImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json,.csv';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                
                // 合并数据
                Object.keys(data).forEach(key => {
                    if (typeof data[key] === 'object') {
                        // 多语言格式: { 'zh-CN': '...', 'en-US': '...' }
                        Object.keys(data[key]).forEach(locale => {
                            if (this.translations[locale]) {
                                this.translations[locale][key] = data[key][locale];
                            }
                        });
                    } else {
                        // 单语言格式
                        this.translations[this.currentEditing][key] = data[key];
                    }
                });
                
                this.renderTranslationTable();
                this.renderCompletionBars();
                this.showToast('导入成功！');
            } catch (error) {
                console.error('Import error:', error);
                this.showToast('导入失败：格式错误', true);
            }
        };
        input.click();
    }
    
    // 导出全部
    exportAll() {
        this.locales.forEach(locale => {
            this.downloadJSON(this.translations[locale], `translations-${locale}.json`);
        });
        
        this.showToast('所有翻译文件已导出！');
    }
    
    // 导出单个语言
    exportTranslations(locale) {
        const data = this.translations[locale];
        this.downloadJSON(data, `translations-${locale}.json`);
    }
    
    // 下载JSON文件
    downloadJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // 预览语言
    previewLang() {
        // 打开预览窗口
        const previewWindow = window.open('', '_blank', 'width=800,height=600');
        if (previewWindow) {
            previewWindow.document.write(`
                <html>
                <head><title>语言预览 | Language Preview</title></head>
                <body style="font-family: sans-serif; padding: 20px;">
                    <h1>🌐 语言预览 | Language Preview</h1>
                    <hr>
                    ${this.locales.map(locale => `
                        <h2>${locale}</h2>
                        <pre>${JSON.stringify(this.translations[locale], null, 2)}</pre>
                        <hr>
                    `).join('')}
                </body>
                </html>
            `);
        }
    }
    
    // 获取翻译
    getTranslation(locale, key) {
        return this.translations[locale]?.[key] || key;
    }
    
    // 编辑翻译
    editTranslation(key, translations) {
        // translations = { 'zh-CN': '中文', 'en-US': 'English', ... }
        Object.keys(translations).forEach(locale => {
            if (this.translations[locale]) {
                this.translations[locale][key] = translations[locale];
            }
        });
        
        this.renderCompletionBars();
    }
    
    // 添加新键
    addNewKey(key, defaultValue = '') {
        this.locales.forEach(locale => {
            if (!this.translations[locale]) {
                this.translations[locale] = {};
            }
            this.translations[locale][key] = defaultValue;
        });
        
        this.renderTranslationTable();
        this.renderStats();
    }
    
    // 删除键
    deleteKey(key) {
        this.locales.forEach(locale => {
            if (this.translations[locale]) {
                delete this.translations[locale][key];
            }
        });
        
        this.renderTranslationTable();
        this.renderStats();
        this.renderCompletionBars();
    }
    
    // 显示Toast通知
    showToast(message, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = 'toast' + (isError ? ' error' : '');
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    // 获取统计报告
    getReport() {
        const report = {
            totalLanguages: this.locales.length,
            totalKeys: Object.keys(this.translations['zh-CN'] || {}).filter(k => !k.startsWith('_')).length,
            completion: {}
        };
        
        this.locales.forEach(locale => {
            report.completion[locale] = this.calculateCompletion(locale).toFixed(2);
        });
        
        return report;
    }
}

// 全局实例
const i18nManager = new I18nManager();

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { I18nManager };
}
