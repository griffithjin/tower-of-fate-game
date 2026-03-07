//**
 * 批量导入组件
 */
const batchImport = {
    currentModule: null,
    parsedData: [],

    show(module) {
        if (!assetManager.checkPermission('import')) {
            assetManager.showNotification('您没有导入权限', 'error');
            return;
        }

        this.currentModule = module;
        this.parsedData = [];

        const moduleNames = {
            towers: '塔模型',
            avatars: '头像',
            items: '道具',
            shop: '商城商品'
        };

        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'batch-import-modal';
        modal.innerHTML = `
            <div class="modal" style="max-width: 800px;">
                <div class="modal-header">
                    <div class="modal-title">
                        <span>📥</span> 批量导入${moduleNames[module] || '数据'}
                    </div>
                    <button class="modal-close" onclick="batchImport.close()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="batch-import-zone" id="import-drop-zone"
                         ondragover="batchImport.handleDragOver(event)"
                         ondragleave="batchImport.handleDragLeave(event)"
                         ondrop="batchImport.handleDrop(event)"
                         onclick="document.getElementById('import-file-input').click()">
                        <div class="batch-import-icon">📂</div>
                        <div class="batch-import-title">拖拽文件到此处或点击上传</div>
                        <div class="batch-import-hint">支持 JSON、Excel (xlsx) 格式</div>
                        <div class="batch-import-formats">
                            <span class="format-badge">JSON</span>
                            <span class="format-badge">Excel</span>
                        </div>
                    </div>
                    
                    <input type="file" id="import-file-input" accept=".json,.xlsx,.xls,.csv" 
                           style="display:none" onchange="batchImport.handleFileSelect(event)">
                    
                    <div id="import-preview-container" style="display:none;">
                        <div class="import-preview">
                            <div class="import-preview-title">
                                数据预览 (共 <span id="import-count">0</span> 条)
                            </div>
                            <div style="max-height: 300px; overflow: auto;">
                                <table class="import-preview-table" id="import-preview-table">
                                    <thead></thead>
                                    <tbody></tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: rgba(255,215,0,0.05); border-radius: 8px;">
                        <div style="font-weight: bold; color: var(--primary); margin-bottom: 10px;">📋 数据格式说明</div>
                        <pre id="format-example" style="font-size: 12px; color: var(--text-muted); overflow-x: auto;"></pre>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="batchImport.close()">取消</button>
                    <button class="btn btn-info" onclick="batchImport.downloadTemplate()">📄 下载模板</button>
                    <button class="btn btn-primary" id="import-confirm-btn" style="display:none;" 
                            onclick="batchImport.confirmImport()"><span>✅</span> 确认导入</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this.updateFormatExample();
    },

    close() {
        document.getElementById('batch-import-modal')?.remove();
        this.currentModule = null;
        this.parsedData = [];
    },

    updateFormatExample() {
        const examples = {
            towers: `[\n  {\n    "name": "东方明珠",\n    "country": "中国",\n    "continent": "asia",\n    "difficulty": "hard",\n    "image": "towers/oriental-pearl.png"\n  }\n]`,
            avatars: `[\n  {\n    "name": "熊猫",\n    "category": "animal",\n    "rarity": "common",\n    "price": { "gold": 1000, "diamond": 0 }\n  }\n]`,
            items: `[\n  {\n    "name": "双倍金币卡",\n    "description": "下一局获得双倍金币",\n    "type": "boost",\n    "effect": { "type": "gold", "multiplier": 2 }\n  }\n]`,
            shop: `[\n  {\n    "name": "黄金皮肤",\n    "category": "skin",\n    "price": { "gold": 0, "diamond": 188 },\n    "discount": 0.8\n  }\n]`
        };

        const pre = document.getElementById('format-example');
        if (pre) pre.textContent = examples[this.currentModule] || '{}';
    },

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    },

    handleDragLeave(e) {
        e.currentTarget.classList.remove('dragover');
    },

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    },

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) this.processFile(file);
    },

    async processFile(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        
        try {
            if (extension === 'json') {
                const text = await file.text();
                this.parsedData = JSON.parse(text);
            } else if (extension === 'csv') {
                const text = await file.text();
                this.parsedData = this.parseCSV(text);
            } else if (['xlsx', 'xls'].includes(extension)) {
                assetManager.showNotification('Excel解析需要额外库支持，请先转换为JSON格式', 'warning');
                return;
            } else {
                assetManager.showNotification('不支持的文件格式', 'error');
                return;
            }

            if (!Array.isArray(this.parsedData)) {
                assetManager.showNotification('数据格式错误：应为数组', 'error');
                return;
            }

            this.showPreview();
        } catch (err) {
            assetManager.showNotification('文件解析失败: ' + err.message, 'error');
        }
    },

    parseCSV(text) {
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const obj = {};
            headers.forEach((h, idx) => {
                let val = values[idx];
                // 尝试解析数字
                if (!isNaN(val) && val !== '') val = Number(val);
                // 尝试解析JSON
                try { if (val.startsWith('{') || val.startsWith('[')) val = JSON.parse(val); } catch(e) {}
                obj[h] = val;
            });
            data.push(obj);
        }

        return data;
    },

    showPreview() {
        const container = document.getElementById('import-preview-container');
        const table = document.getElementById('import-preview-table');
        const count = document.getElementById('import-count');
        const confirmBtn = document.getElementById('import-confirm-btn');

        if (!container || !table || this.parsedData.length === 0) return;

        count.textContent = this.parsedData.length;
        container.style.display = 'block';
        confirmBtn.style.display = 'inline-flex';

        // 获取所有可能的字段
        const allKeys = new Set();
        this.parsedData.slice(0, 5).forEach(item => {
            Object.keys(item).forEach(k => allKeys.add(k));
        });
        const keys = Array.from(allKeys).slice(0, 6); // 最多显示6列

        // 表头
        table.querySelector('thead').innerHTML = `
            <tr>${keys.map(k => `<th>${k}</th>`).join('')}<tr>
        `;

        // 表体 (显示前5条)
        table.querySelector('tbody').innerHTML = this.parsedData.slice(0, 5).map((item, idx) => {
            const isValid = this.validateItem(item);
            return `
                <tr>
                    ${keys.map(k => {
                        let val = item[k];
                        if (typeof val === 'object') val = JSON.stringify(val).slice(0, 30);
                        return `<td>${val !== undefined ? val : '-'}</td>`
                    }).join('')}
                </tr>
            `;
        }).join('');

        if (this.parsedData.length > 5) {
            table.querySelector('tbody').innerHTML += `
                <tr><td colspan="${keys.length}" style="text-align:center;color:#888;">
                    ... 还有 ${this.parsedData.length - 5} 条数据 ...
                </td></tr>
            `;
        }
    },

    validateItem(item) {
        const required = {
            towers: ['name', 'country', 'continent'],
            avatars: ['name', 'category', 'rarity'],
            items: ['name', 'type', 'description'],
            shop: ['name', 'category']
        };

        const requiredFields = required[this.currentModule] || [];
        return requiredFields.every(f => item[f] !== undefined && item[f] !== '');
    },

    confirmImport() {
        if (this.parsedData.length === 0) return;

        switch(this.currentModule) {
            case 'towers':
                towerManager.importData(this.parsedData);
                break;
            case 'avatars':
                avatarManager.importData(this.parsedData);
                break;
            case 'items':
                itemManager.importData(this.parsedData);
                break;
            case 'shop':
                shopManager.importData(this.parsedData);
                break;
        }

        this.close();
    },

    downloadTemplate() {
        const templates = {
            towers: [
                { name: '东方明珠', country: '中国', continent: 'asia', difficulty: 'hard', image: 'towers/oriental-pearl.png', status: 'active' },
                { name: '埃菲尔铁塔', country: '法国', continent: 'europe', difficulty: 'medium', image: 'towers/eiffel-tower.png', status: 'active' }
            ],
            avatars: [
                { name: '熊猫', category: 'animal', rarity: 'common', price_gold: 1000, price_diamond: 0, status: 'active' },
                { name: '金龙', category: 'animal', rarity: 'legendary', price_gold: 0, price_diamond: 1888, status: 'active' }
            ],
            items: [
                { name: '双倍金币卡', description: '下一局获得双倍金币', type: 'boost', icon: '🪙', price_gold: 0, price_diamond: 10, stackable: true },
                { name: '时间冻结', description: '暂停倒计时10秒', type: 'consumable', icon: '⏱️', price_gold: 0, price_diamond: 20, stackable: true }
            ],
            shop: [
                { name: '黄金皮肤', category: 'skin', price_gold: 0, price_diamond: 188, discount: 0.8, limited: false },
                { name: '新手礼包', category: 'pack', price_gold: 0, price_diamond: 68, discount: 0.5, limited: true, limit_count: 1 }
            ]
        };

        const template = templates[this.currentModule];
        if (template) {
            assetManager.exportJSON(template, `${this.currentModule}_template.json`);
            assetManager.showNotification('模板下载成功', 'success');
        }
    }
};
