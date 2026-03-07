/**
 * 头像管理器
 */
const avatarManager = {
    data: [],
    filteredData: [],
    currentPage: 1,
    pageSize: 10,
    editingId: null,

    init() {
        this.load();
    },

    load() {
        this.data = JSON.parse(localStorage.getItem('avatars')) || this.getSampleData();
        this.filteredData = [...this.data];
        this.render();
    },

    getSampleData() {
        return [
            {
                id: 'avatar_001',
                name: '熊猫',
                category: 'animal',
                image: '../web_client/assets/avatars/panda.png',
                rarity: 'common',
                price: { gold: 1000, diamond: 0 },
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'avatar_002',
                name: '金龙',
                category: 'animal',
                image: '../web_client/assets/avatars/dragon.png',
                rarity: 'legendary',
                price: { gold: 0, diamond: 1888 },
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'avatar_003',
                name: '忍者',
                category: 'character',
                image: '../web_client/assets/avatars/ninja.png',
                rarity: 'epic',
                price: { gold: 0, diamond: 588 },
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'avatar_004',
                name: '凤凰',
                category: 'animal',
                image: '../web_client/assets/avatars/phoenix.png',
                rarity: 'epic',
                price: { gold: 0, diamond: 888 },
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'avatar_005',
                name: '骑士',
                category: 'character',
                image: '../web_client/assets/avatars/knight.png',
                rarity: 'rare',
                price: { gold: 5000, diamond: 0 },
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            }
        ];
    },

    filter() {
        const category = document.getElementById('avatar-category-filter')?.value;
        const rarity = document.getElementById('avatar-rarity-filter')?.value;

        this.filteredData = this.data.filter(item => {
            if (category && item.category !== category) return false;
            if (rarity && item.rarity !== rarity) return false;
            return true;
        });

        this.currentPage = 1;
        this.render();
    },

    search() {
        const keyword = document.getElementById('avatar-search')?.value.toLowerCase();
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
        const tbody = document.getElementById('avatar-list');
        
        if (!tbody) return;

        if (pagination.data.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="8" class="empty-state">
                    <div class="empty-state-icon">🎭</div>
                    <div class="empty-state-text">暂无头像数据</div>
                </td></tr>
            `;
        } else {
            tbody.innerHTML = pagination.data.map(item => `
                <tr data-id="${item.id}">
                    <td><input type="checkbox" value="${item.id}"></td>
                    <td><img src="${item.image || '../web_client/assets/default-avatar.png'}" 
                             class="table-preview" 
                             onclick="avatarManager.previewImage('${item.image}')"
                             onerror="this.src='../web_client/assets/default-avatar.png'"></td>
                    <td>${item.name}</td>
                    <td>${this.getCategoryName(item.category)}</td>
                    <td><span class="tag tag-${item.rarity}">${this.getRarityName(item.rarity)}</span></td>
                    <td>${this.formatPrice(item.price)}</td>
                    <td><span class="toggle-switch ${item.status === 'active' ? 'active' : ''}" 
                              onclick="avatarManager.toggleStatus('${item.id}')"></span></td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn action-btn-edit" onclick="avatarManager.edit('${item.id}')">编辑</button>
                            ${assetManager.hasPermission('delete') ? `
                                <button class="action-btn action-btn-delete" onclick="avatarManager.delete('${item.id}')">删除</button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        assetManager.renderPagination('avatar-pagination', pagination, 'avatarManager.goToPage');
    },

    goToPage(page) {
        this.currentPage = page;
        this.render();
    },

    getCategoryName(code) {
        const names = { animal: '动物', character: '角色', symbol: '符号' };
        return names[code] || code;
    },

    getRarityName(code) {
        const names = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' };
        return names[code] || code;
    },

    formatPrice(price) {
        if (!price) return '-';
        const parts = [];
        if (price.gold > 0) parts.push(`<span class="price-gold">${price.gold.toLocaleString()} 🪙</span>`);
        if (price.diamond > 0) parts.push(`<span class="price-diamond">${price.diamond.toLocaleString()} 💎</span>`);
        return parts.join(' ') || '免费';
    },

    showUploadModal(item = null) {
        this.editingId = item?.id || null;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'avatar-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>🎭</span> ${item ? '编辑头像' : '上传头像'}</div>
                    <button class="modal-close" onclick="avatarManager.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="avatar-form">
                        <div class="form-group">
                            <label>头像名称 <span class="required">*</span></label>
                            <input type="text" id="avatar-name" value="${item?.name || ''}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>分类 <span class="required">*</span></label>
                                <select id="avatar-category" required>
                                    <option value="">请选择</option>
                                    <option value="animal" ${item?.category === 'animal' ? 'selected' : ''}>动物</option>
                                    <option value="character" ${item?.category === 'character' ? 'selected' : ''}>角色</option>
                                    <option value="symbol" ${item?.category === 'symbol' ? 'selected' : ''}>符号</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>稀有度 <span class="required">*</span></label>
                                <select id="avatar-rarity" required>
                                    <option value="">请选择</option>
                                    <option value="common" ${item?.rarity === 'common' ? 'selected' : ''}>普通</option>
                                    <option value="rare" ${item?.rarity === 'rare' ? 'selected' : ''}>稀有</option>
                                    <option value="epic" ${item?.rarity === 'epic' ? 'selected' : ''}>史诗</option>
                                    <option value="legendary" ${item?.rarity === 'legendary' ? 'selected' : ''}>传说</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>金币价格</label>
                                <input type="number" id="avatar-price-gold" value="${item?.price?.gold || 0}" min="0">
                            </div>
                            <div class="form-group">
                                <label>钻石价格</label>
                                <input type="number" id="avatar-price-diamond" value="${item?.price?.diamond || 0}" min="0">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>头像图片</label>
                            <div class="upload-zone" id="avatar-upload-zone"
                                 ondragover="event.preventDefault(); event.currentTarget.classList.add('dragover')"
                                 ondragleave="event.currentTarget.classList.remove('dragover')"
                                 ondrop="avatarManager.handleDrop(event)"
                                 onclick="document.getElementById('avatar-file-input').click()">
                                <div class="upload-zone-icon">📤</div>
                                <div class="upload-zone-text">拖拽图片到此处或点击上传</div>
                            </div>
                            <input type="file" id="avatar-file-input" accept="image/*" style="display:none" 
                                   onchange="avatarManager.handleFileSelect(event)">
                            <div class="upload-preview" id="avatar-preview">
                                ${item?.image ? `
                                    <div class="upload-preview-item">
                                        <img src="${item.image}">
                                        <button type="button" class="remove" onclick="avatarManager.removePreview()">&times;</button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="avatarManager.closeModal()">取消</button>
                    <button class="btn btn-primary" onclick="avatarManager.save()"><span>💾</span> 保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    closeModal() {
        document.getElementById('avatar-modal')?.remove();
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
            const preview = document.getElementById('avatar-preview');
            preview.innerHTML = `
                <div class="upload-preview-item">
                    <img src="${e.target.result}">
                    <button type="button" class="remove" onclick="avatarManager.removePreview()">&times;</button>
                </div>
            `;
            preview.dataset.imageData = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    removePreview() {
        const preview = document.getElementById('avatar-preview');
        preview.innerHTML = '';
        delete preview.dataset.imageData;
    },

    save() {
        const name = document.getElementById('avatar-name')?.value.trim();
        const category = document.getElementById('avatar-category')?.value;
        const rarity = document.getElementById('avatar-rarity')?.value;
        const goldPrice = parseInt(document.getElementById('avatar-price-gold')?.value) || 0;
        const diamondPrice = parseInt(document.getElementById('avatar-price-diamond')?.value) || 0;
        const preview = document.getElementById('avatar-preview');
        const imageData = preview?.dataset.imageData;

        if (!name || !category || !rarity) {
            assetManager.showNotification('请填写所有必填项', 'error');
            return;
        }

        const avatarData = {
            id: this.editingId || assetManager.generateId('avatar'),
            name,
            category,
            rarity,
            price: { gold: goldPrice, diamond: diamondPrice },
            image: imageData || (this.editingId ? this.data.find(a => a.id === this.editingId)?.image : ''),
            status: 'active',
            updatedAt: new Date().toISOString()
        };

        if (!this.editingId) {
            avatarData.createdAt = new Date().toISOString();
            this.data.push(avatarData);
        } else {
            const index = this.data.findIndex(a => a.id === this.editingId);
            if (index !== -1) {
                this.data[index] = { ...this.data[index], ...avatarData };
            }
        }

        this.saveData();
        this.closeModal();
        this.filter();
        assetManager.showNotification(this.editingId ? '头像已更新' : '头像已创建', 'success');
    },

    saveData() {
        localStorage.setItem('avatars', JSON.stringify(this.data));
    },

    edit(id) {
        if (!assetManager.checkPermission('edit')) return;
        const item = this.data.find(a => a.id === id);
        if (item) this.showUploadModal(item);
    },

    delete(id) {
        if (!assetManager.checkPermission('delete')) return;
        
        assetManager.confirm('确定要删除这个头像吗？', () => {
            this.data = this.data.filter(a => a.id !== id);
            this.saveData();
            this.filter();
            assetManager.showNotification('头像已删除', 'success');
        });
    },

    toggleStatus(id) {
        if (!assetManager.checkPermission('edit')) return;
        
        const item = this.data.find(a => a.id === id);
        if (item) {
            item.status = item.status === 'active' ? 'inactive' : 'active';
            item.updatedAt = new Date().toISOString();
            this.saveData();
            this.render();
            assetManager.showNotification(`头像已${item.status === 'active' ? '启用' : '禁用'}`, 'success');
        }
    },

    previewImage(url) {
        if (!url) return;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay image-preview-modal show';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>🖼️</span> 图片预览</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body" style="text-align:center;">
                    <img src="${url}" style="max-width:100%; max-height:70vh; border-radius:8px;">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    importData(data) {
        if (!Array.isArray(data)) return;
        
        let successCount = 0;
        data.forEach(item => {
            if (item.name && item.category && item.rarity) {
                item.id = item.id || assetManager.generateId('avatar');
                item.status = item.status || 'active';
                item.price = item.price || { gold: 0, diamond: 0 };
                
                const existingIndex = this.data.findIndex(a => a.id === item.id);
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
        assetManager.showNotification(`成功导入 ${successCount} 个头像`, 'success');
    }
};
