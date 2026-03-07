/**
 * 道具管理器
 */
const itemManager = {
    data: [],
    filteredData: [],
    currentPage: 1,
    pageSize: 10,
    editingId: null,

    init() {
        this.load();
    },

    load() {
        this.data = JSON.parse(localStorage.getItem('items')) || this.getSampleData();
        this.filteredData = [...this.data];
        this.render();
    },

    getSampleData() {
        return [
            {
                id: 'item_double_gold',
                name: '双倍金币卡',
                description: '下一局获得双倍金币',
                icon: '🪙',
                type: 'boost',
                effect: { type: 'gold', multiplier: 2, duration: 1 },
                price: { gold: 0, diamond: 10 },
                stackable: true,
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'item_time_freeze',
                name: '时间冻结',
                description: '暂停倒计时10秒',
                icon: '⏱️',
                type: 'consumable',
                effect: { type: 'time', duration: 10 },
                price: { gold: 0, diamond: 20 },
                stackable: true,
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'item_shield',
                name: '防护盾',
                description: '免受一次错误惩罚',
                icon: '🛡️',
                type: 'consumable',
                effect: { type: 'shield', uses: 1 },
                price: { gold: 500, diamond: 5 },
                stackable: true,
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'item_hint',
                name: '提示卡',
                description: '显示一个字母',
                icon: '💡',
                type: 'consumable',
                effect: { type: 'hint', count: 1 },
                price: { gold: 200, diamond: 0 },
                stackable: true,
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'item_revive',
                name: '复活卡',
                description: '失败后复活继续游戏',
                icon: '❤️',
                type: 'special',
                effect: { type: 'revive', count: 1 },
                price: { gold: 0, diamond: 50 },
                stackable: false,
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            }
        ];
    },

    filter() {
        const type = document.getElementById('item-type-filter')?.value;
        this.filteredData = this.data.filter(item => {
            if (type && item.type !== type) return false;
            return true;
        });
        this.currentPage = 1;
        this.render();
    },

    search() {
        const keyword = document.getElementById('item-search')?.value.toLowerCase();
        if (!keyword) {
            this.filter();
            return;
        }
        this.filteredData = this.data.filter(item => 
            item.name.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword)
        );
        this.currentPage = 1;
        this.render();
    },

    render() {
        const pagination = assetManager.paginate(this.filteredData, this.currentPage, this.pageSize);
        const tbody = document.getElementById('item-list');
        
        if (!tbody) return;

        if (pagination.data.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="8" class="empty-state">
                    <div class="empty-state-icon">🎒</div>
                    <div class="empty-state-text">暂无道具数据</div>
                </td></tr>
            `;
        } else {
            tbody.innerHTML = pagination.data.map(item => `
                <tr data-id="${item.id}">
                    <td><input type="checkbox" value="${item.id}"></td>
                    <td style="font-size:24px;">${item.icon}</td>
                    <td>${item.name}</td>
                    <td>${this.getTypeName(item.type)}</td>
                    <td>${item.description}</td>
                    <td>${this.formatPrice(item.price)}</td>
                    <td>${item.stackable ? '✅' : '❌'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn action-btn-edit" onclick="itemManager.edit('${item.id}')">编辑</button>
                            ${assetManager.hasPermission('delete') ? `
                                <button class="action-btn action-btn-delete" onclick="itemManager.delete('${item.id}')">删除</button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        assetManager.renderPagination('item-pagination', pagination, 'itemManager.goToPage');
    },

    goToPage(page) {
        this.currentPage = page;
        this.render();
    },

    getTypeName(code) {
        const names = { consumable: '消耗品', boost: '增益道具', special: '特殊道具' };
        return names[code] || code;
    },

    formatPrice(price) {
        if (!price) return '-';
        const parts = [];
        if (price.gold > 0) parts.push(`<span class="price-gold">${price.gold.toLocaleString()} 🪙</span>`);
        if (price.diamond > 0) parts.push(`<span class="price-diamond">${price.diamond.toLocaleString()} 💎</span>`);
        return parts.join(' ') || '免费';
    },

    showCreateModal(item = null) {
        this.editingId = item?.id || null;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'item-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>🎒</span> ${item ? '编辑道具' : '新建道具'}</div>
                    <button class="modal-close" onclick="itemManager.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="item-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>道具名称 <span class="required">*</span></label>
                                <input type="text" id="item-name" value="${item?.name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>图标 <span class="required">*</span></label>
                                <input type="text" id="item-icon" value="${item?.icon || ''}" placeholder="🎒" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>描述 <span class="required">*</span></label>
                            <input type="text" id="item-description" value="${item?.description || ''}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>类型 <span class="required">*</span></label>
                                <select id="item-type" required>
                                    <option value="">请选择</option>
                                    <option value="consumable" ${item?.type === 'consumable' ? 'selected' : ''}>消耗品</option>
                                    <option value="boost" ${item?.type === 'boost' ? 'selected' : ''}>增益道具</option>
                                    <option value="special" ${item?.type === 'special' ? 'selected' : ''}>特殊道具</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>效果类型 <span class="required">*</span></label>
                                <select id="item-effect-type" required>
                                    <option value="">请选择</option>
                                    <option value="gold" ${item?.effect?.type === 'gold' ? 'selected' : ''}>金币</option>
                                    <option value="time" ${item?.effect?.type === 'time' ? 'selected' : ''}>时间</option>
                                    <option value="shield" ${item?.effect?.type === 'shield' ? 'selected' : ''}>护盾</option>
                                    <option value="hint" ${item?.effect?.type === 'hint' ? 'selected' : ''}>提示</option>
                                    <option value="revive" ${item?.effect?.type === 'revive' ? 'selected' : ''}>复活</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>金币价格</label>
                                <input type="number" id="item-price-gold" value="${item?.price?.gold || 0}" min="0">
                            </div>
                            <div class="form-group">
                                <label>钻石价格</label>
                                <input type="number" id="item-price-diamond" value="${item?.price?.diamond || 0}" min="0">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <div class="checkbox-wrapper">
                                <input type="checkbox" id="item-stackable" ${item?.stackable !== false ? 'checked' : ''}>
                                <label for="item-stackable">可叠加</label>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="itemManager.closeModal()">取消</button>
                    <button class="btn btn-primary" onclick="itemManager.save()"><span>💾</span> 保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    closeModal() {
        document.getElementById('item-modal')?.remove();
        this.editingId = null;
    },

    save() {
        const name = document.getElementById('item-name')?.value.trim();
        const icon = document.getElementById('item-icon')?.value.trim();
        const description = document.getElementById('item-description')?.value.trim();
        const type = document.getElementById('item-type')?.value;
        const effectType = document.getElementById('item-effect-type')?.value;
        const goldPrice = parseInt(document.getElementById('item-price-gold')?.value) || 0;
        const diamondPrice = parseInt(document.getElementById('item-price-diamond')?.value) || 0;
        const stackable = document.getElementById('item-stackable')?.checked;

        if (!name || !icon || !description || !type || !effectType) {
            assetManager.showNotification('请填写所有必填项', 'error');
            return;
        }

        const itemData = {
            id: this.editingId || assetManager.generateId('item'),
            name,
            icon,
            description,
            type,
            effect: { type: effectType },
            price: { gold: goldPrice, diamond: diamondPrice },
            stackable,
            status: 'active',
            updatedAt: new Date().toISOString()
        };

        if (!this.editingId) {
            itemData.createdAt = new Date().toISOString();
            this.data.push(itemData);
        } else {
            const index = this.data.findIndex(i => i.id === this.editingId);
            if (index !== -1) {
                this.data[index] = { ...this.data[index], ...itemData };
            }
        }

        this.saveData();
        this.closeModal();
        this.filter();
        assetManager.showNotification(this.editingId ? '道具已更新' : '道具已创建', 'success');
    },

    saveData() {
        localStorage.setItem('items', JSON.stringify(this.data));
    },

    edit(id) {
        if (!assetManager.checkPermission('edit')) return;
        const item = this.data.find(i => i.id === id);
        if (item) this.showCreateModal(item);
    },

    delete(id) {
        if (!assetManager.checkPermission('delete')) return;
        
        assetManager.confirm('确定要删除这个道具吗？', () => {
            this.data = this.data.filter(i => i.id !== id);
            this.saveData();
            this.filter();
            assetManager.showNotification('道具已删除', 'success');
        });
    },

    importData(data) {
        if (!Array.isArray(data)) return;
        
        let successCount = 0;
        data.forEach(item => {
            if (item.name && item.type && item.description) {
                item.id = item.id || assetManager.generateId('item');
                item.status = item.status || 'active';
                item.price = item.price || { gold: 0, diamond: 0 };
                
                const existingIndex = this.data.findIndex(i => i.id === item.id);
                if (existingIndex !== -1) {
                    this.data[existingIndex] = { ...this.data[existingIndex], ...item };
                } else {
                    this.data.push(item);
                }
                successCount++;
            }
        });

        this.saveData();
        this.filter();
        assetManager.showNotification(`成功导入 ${successCount} 个道具`, 'success');
    }
};
