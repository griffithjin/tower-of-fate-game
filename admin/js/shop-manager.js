/**
 * 商城管理器
 */
const shopManager = {
    data: [],
    filteredData: [],
    currentPage: 1,
    pageSize: 10,
    editingId: null,

    init() {
        this.load();
    },

    load() {
        this.data = JSON.parse(localStorage.getItem('shopItems')) || this.getSampleData();
        this.filteredData = [...this.data];
        this.render();
    },

    getSampleData() {
        return [
            {
                id: 'shop_skin_gold',
                name: '黄金皮肤',
                category: 'skin',
                image: '../web_client/assets/skins/gold_skin.png',
                price: { gold: 0, diamond: 188 },
                discount: 0.8,
                limited: false,
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'shop_starter_pack',
                name: '新手礼包',
                category: 'pack',
                image: '../web_client/assets/shop/starter_pack.png',
                price: { gold: 0, diamond: 68 },
                discount: 0.5,
                limited: true,
                limitCount: 1,
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'shop_diamond_100',
                name: '100钻石',
                category: 'currency',
                image: '../web_client/assets/shop/diamond_100.png',
                price: { gold: 1000, diamond: 0 },
                discount: 1,
                limited: false,
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'shop_premium_skin',
                name: '至尊皮肤',
                category: 'skin',
                image: '../web_client/assets/skins/premium_skin.png',
                price: { gold: 0, diamond: 588 },
                discount: 1,
                limited: true,
                limitCount: 100,
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'shop_weekly_pack',
                name: '周礼包',
                category: 'pack',
                image: '../web_client/assets/shop/weekly_pack.png',
                price: { gold: 0, diamond: 128 },
                discount: 0.75,
                limited: true,
                limitCount: 1,
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            }
        ];
    },

    filter() {
        const category = document.getElementById('shop-category-filter')?.value;
        this.filteredData = this.data.filter(item => {
            if (category && item.category !== category) return false;
            return true;
        });
        this.currentPage = 1;
        this.render();
    },

    search() {
        const keyword = document.getElementById('shop-search')?.value.toLowerCase();
        if (!keyword) {
            this.filter();
            return;
        }
        this.filteredData = this.data.filter(item => 
            item.name.toLowerCase().includes(keyword)
        );
        this.currentPage = 1;
        this.render();
    },

    render() {
        const pagination = assetManager.paginate(this.filteredData, this.currentPage, this.pageSize);
        const tbody = document.getElementById('shop-list');
        
        if (!tbody) return;

        if (pagination.data.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="9" class="empty-state">
                    <div class="empty-state-icon">🛒</div>
                    <div class="empty-state-text">暂无商品数据</div>
                </td></tr>
            `;
        } else {
            tbody.innerHTML = pagination.data.map(item => {
                const originalPrice = item.price.diamond > 0 ? item.price.diamond : item.price.gold;
                const currentPrice = Math.floor(originalPrice * item.discount);
                const currency = item.price.diamond > 0 ? '💎' : '🪙';
                
                return `
                <tr data-id="${item.id}">
                    <td><input type="checkbox" value="${item.id}"></td>
                    <td><img src="${item.image || '../web_client/assets/default-shop.png'}" 
                             class="table-preview" 
                             onerror="this.src='../web_client/assets/default-shop.png'"></td>
                    <td>${item.name}</td>
                    <td>${this.getCategoryName(item.category)}</td>
                    <td><span style="text-decoration:${item.discount < 1 ? 'line-through' : 'none'};opacity:0.6;">
                        ${originalPrice.toLocaleString()} ${currency}</span></td>
                    <td>${item.discount < 1 ? `${Math.round(item.discount * 10)}折` : '-'}</td>
                    <td><span class="${item.price.diamond > 0 ? 'price-diamond' : 'price-gold'}">
                        ${currentPrice.toLocaleString()} ${currency}</span></td>
                    <td>${item.limited ? `✅ (${item.limitCount || '限量'})` : '❌'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn action-btn-edit" onclick="shopManager.edit('${item.id}')">编辑</button>
                            ${assetManager.hasPermission('delete') ? `
                                <button class="action-btn action-btn-delete" onclick="shopManager.delete('${item.id}')">删除</button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `}).join('');
        }

        assetManager.renderPagination('shop-pagination', pagination, 'shopManager.goToPage');
    },

    goToPage(page) {
        this.currentPage = page;
        this.render();
    },

    getCategoryName(code) {
        const names = { skin: '皮肤', pack: '礼包', currency: '货币' };
        return names[code] || code;
    },

    showCreateModal(item = null) {
        this.editingId = item?.id || null;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'shop-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>🛒</span> ${item ? '编辑商品' : '新增商品'}</div>
                    <button class="modal-close" onclick="shopManager.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="shop-form">
                        <div class="form-group">
                            <label>商品名称 <span class="required">*</span></label>
                            <input type="text" id="shop-name" value="${item?.name || ''}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>分类 <span class="required">*</span></label>
                                <select id="shop-category" required>
                                    <option value="">请选择</option>
                                    <option value="skin" ${item?.category === 'skin' ? 'selected' : ''}>皮肤</option>
                                    <option value="pack" ${item?.category === 'pack' ? 'selected' : ''}>礼包</option>
                                    <option value="currency" ${item?.category === 'currency' ? 'selected' : ''}>货币</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>折扣 (0-1)</label>
                                <input type="number" id="shop-discount" value="${item?.discount || 1}" 
                                       min="0.1" max="1" step="0.1">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>金币价格</label>
                                <input type="number" id="shop-price-gold" value="${item?.price?.gold || 0}" min="0">
                            </div>
                            <div class="form-group">
                                <label>钻石价格</label>
                                <input type="number" id="shop-price-diamond" value="${item?.price?.diamond || 0}" min="0">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <div class="checkbox-wrapper">
                                    <input type="checkbox" id="shop-limited" ${item?.limited ? 'checked' : ''}
                                    onchange="document.getElementById('shop-limit-count').disabled = !this.checked">
                                    <label for="shop-limited">限时/限量</label>
                                </div>
                            </div>
                            <div class="form-group">
                                <label>限量数量</label>
                                <input type="number" id="shop-limit-count" 
                                       value="${item?.limitCount || ''}" 
                                       min="1" 
                                       ${item?.limited ? '' : 'disabled'}>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>商品图片</label>
                            <div class="upload-zone" id="shop-upload-zone"
                                 ondragover="event.preventDefault(); event.currentTarget.classList.add('dragover')"
                                 ondragleave="event.currentTarget.classList.remove('dragover')"
                                 ondrop="shopManager.handleDrop(event)"
                                 onclick="document.getElementById('shop-file-input').click()">
                                <div class="upload-zone-icon">📤</div>
                                <div class="upload-zone-text">拖拽图片到此处或点击上传</div>
                            </div>
                            <input type="file" id="shop-file-input" accept="image/*" style="display:none" 
                                   onchange="shopManager.handleFileSelect(event)">
                            <div class="upload-preview" id="shop-preview">
                                ${item?.image ? `
                                    <div class="upload-preview-item">
                                        <img src="${item.image}">
                                        <button type="button" class="remove" onclick="shopManager.removePreview()">&times;</button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="shopManager.closeModal()">取消</button>
                    <button class="btn btn-primary" onclick="shopManager.save()"><span>💾</span> 保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    closeModal() {
        document.getElementById('shop-modal')?.remove();
        this.editingId = null;
    },

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) this.processFile(files[0]);
    },

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) this.processFile(file);
    },

    processFile(file) {
        if (!file.type.startsWith('image/')) {
            assetManager.showNotification('请选择图片文件', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('shop-preview');
            preview.innerHTML = `
                <div class="upload-preview-item">
                    <img src="${e.target.result}">
                    <button type="button" class="remove" onclick="shopManager.removePreview()">&times;</button>
                </div>
            `;
            preview.dataset.imageData = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    removePreview() {
        const preview = document.getElementById('shop-preview');
        preview.innerHTML = '';
        delete preview.dataset.imageData;
    },

    save() {
        const name = document.getElementById('shop-name')?.value.trim();
        const category = document.getElementById('shop-category')?.value;
        const discount = parseFloat(document.getElementById('shop-discount')?.value) || 1;
        const goldPrice = parseInt(document.getElementById('shop-price-gold')?.value) || 0;
        const diamondPrice = parseInt(document.getElementById('shop-price-diamond')?.value) || 0;
        const limited = document.getElementById('shop-limited')?.checked;
        const limitCount = limited ? (parseInt(document.getElementById('shop-limit-count')?.value) || 1) : null;
        const preview = document.getElementById('shop-preview');
        const imageData = preview?.dataset.imageData;

        if (!name || !category) {
            assetManager.showNotification('请填写所有必填项', 'error');
            return;
        }

        if (goldPrice === 0 && diamondPrice === 0) {
            assetManager.showNotification('金币价格和钻石价格至少填写一个', 'error');
            return;
        }

        const shopData = {
            id: this.editingId || assetManager.generateId('shop'),
            name,
            category,
            price: { gold: goldPrice, diamond: diamondPrice },
            discount,
            limited,
            limitCount,
            image: imageData || (this.editingId ? this.data.find(s => s.id === this.editingId)?.image : ''),
            status: 'active',
            updatedAt: new Date().toISOString()
        };

        if (!this.editingId) {
            shopData.createdAt = new Date().toISOString();
            this.data.push(shopData);
        } else {
            const index = this.data.findIndex(s => s.id === this.editingId);
            if (index !== -1) {
                this.data[index] = { ...this.data[index], ...shopData };
            }
        }

        this.saveData();
        this.closeModal();
        this.filter();
        assetManager.showNotification(this.editingId ? '商品已更新' : '商品已创建', 'success');
    },

    saveData() {
        localStorage.setItem('shopItems', JSON.stringify(this.data));
    },

    edit(id) {
        if (!assetManager.checkPermission('edit')) return;
        const item = this.data.find(s => s.id === id);
        if (item) this.showCreateModal(item);
    },

    delete(id) {
        if (!assetManager.checkPermission('delete')) return;
        
        assetManager.confirm('确定要删除这个商品吗？', () => {
            this.data = this.data.filter(s => s.id !== id);
            this.saveData();
            this.filter();
            assetManager.showNotification('商品已删除', 'success');
        });
    },

    importData(data) {
        if (!Array.isArray(data)) return;
        
        let successCount = 0;
        data.forEach(item => {
            if (item.name && item.category && (item.price?.gold > 0 || item.price?.diamond > 0)) {
                item.id = item.id || assetManager.generateId('shop');
                item.status = item.status || 'active';
                item.discount = item.discount || 1;
                
                const existingIndex = this.data.findIndex(s => s.id === item.id);
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
        assetManager.showNotification(`成功导入 ${successCount} 个商品`, 'success');
    }
};
