/**
 * 塔模型管理器
 */
const towerManager = {
    data: [],
    filteredData: [],
    currentPage: 1,
    pageSize: 10,
    editingId: null,

    init() {
        this.load();
        this.bindEvents();
    },

    bindEvents() {
        // 全选
        document.getElementById('tower-select-all')?.addEventListener('change', (e) => {
            document.querySelectorAll('#tower-list input[type="checkbox"]').forEach(cb => {
                cb.checked = e.target.checked;
            });
        });
    },

    load() {
        // 从localStorage加载或使用示例数据
        this.data = JSON.parse(localStorage.getItem('towers')) || this.getSampleData();
        this.filteredData = [...this.data];
        this.render();
    },

    getSampleData() {
        return [
            {
                id: 'tower_001',
                name: '东方明珠',
                country: '中国',
                continent: 'asia',
                image: '../web_client/assets/towers/oriental_pearl.png',
                difficulty: 'hard',
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'tower_002',
                name: '埃菲尔铁塔',
                country: '法国',
                continent: 'europe',
                image: '../web_client/assets/towers/eiffel_tower.png',
                difficulty: 'medium',
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'tower_003',
                name: '帝国大厦',
                country: '美国',
                continent: 'americas',
                image: '../web_client/assets/towers/empire_state.png',
                difficulty: 'medium',
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'tower_004',
                name: '东京塔',
                country: '日本',
                continent: 'asia',
                image: '../web_client/assets/towers/tokyo_tower.png',
                difficulty: 'easy',
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'tower_005',
                name: '哈利法塔',
                country: '阿联酋',
                continent: 'asia',
                image: '../web_client/assets/towers/burj_khalifa.png',
                difficulty: 'hard',
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            }
        ];
    },

    filter() {
        const continent = document.getElementById('tower-continent-filter')?.value;
        const difficulty = document.getElementById('tower-difficulty-filter')?.value;
        const status = document.getElementById('tower-status-filter')?.value;

        this.filteredData = this.data.filter(item => {
            if (continent && item.continent !== continent) return false;
            if (difficulty && item.difficulty !== difficulty) return false;
            if (status && item.status !== status) return false;
            return true;
        });

        this.currentPage = 1;
        this.render();
    },

    search() {
        const keyword = document.getElementById('tower-search')?.value.toLowerCase();
        if (!keyword) {
            this.filter();
            return;
        }

        this.filteredData = this.data.filter(item => 
            item.name.toLowerCase().includes(keyword) ||
            item.country.toLowerCase().includes(keyword)
        );

        this.currentPage = 1;
        this.render();
    },

    render() {
        const pagination = assetManager.paginate(this.filteredData, this.currentPage, this.pageSize);
        const tbody = document.getElementById('tower-list');
        
        if (!tbody) return;

        if (pagination.data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <div class="empty-state-icon">🗼</div>
                        <div class="empty-state-text">暂无塔模型数据</div>
                    </td>
                </tr>
            `;
        } else {
            tbody.innerHTML = pagination.data.map(item => `
                <tr data-id="${item.id}">
                    <td><input type="checkbox" value="${item.id}"></td>
                    <td>
                        <img src="${item.image || '../web_client/assets/default-tower.png'}" 
                             class="table-preview" 
                             onclick="towerManager.previewImage('${item.image}')"
                             onerror="this.src='../web_client/assets/default-tower.png'">
                    </td>
                    <td>${item.name}</td>
                    <td>${item.country}</td>
                    <td><span class="tag tag-${item.continent}">${this.getContinentName(item.continent)}</span></td>
                    <td><span class="tag tag-${item.difficulty}">${this.getDifficultyName(item.difficulty)}</span></td>
                    <td>
                        <span class="toggle-switch ${item.status === 'active' ? 'active' : ''}" 
                              onclick="towerManager.toggleStatus('${item.id}')"></span>
                    </td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn action-btn-edit" onclick="towerManager.edit('${item.id}')">编辑</button>
                            ${assetManager.hasPermission('delete') ? `
                                <button class="action-btn action-btn-delete" onclick="towerManager.delete('${item.id}')">删除</button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        assetManager.renderPagination('tower-pagination', pagination, 'towerManager.goToPage');
    },

    goToPage(page) {
        this.currentPage = page;
        this.render();
    },

    getContinentName(code) {
        const names = {
            asia: '亚洲',
            europe: '欧洲',
            americas: '美洲',
            africa: '非洲',
            oceania: '大洋洲'
        };
        return names[code] || code;
    },

    getDifficultyName(code) {
        const names = {
            easy: '简单',
            medium: '中等',
            hard: '困难'
        };
        return names[code] || code;
    },

    showUploadModal(item = null) {
        this.editingId = item?.id || null;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'tower-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title">
                        <span>🗼</span>
                        ${item ? '编辑塔模型' : '上传新塔'}
                    </div>
                    <button class="modal-close" onclick="towerManager.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="tower-form">
                        <div class="form-group">
                            <label>塔名称 <span class="required">*</span></label>
                            <input type="text" id="tower-name" value="${item?.name || ''}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>国家 <span class="required">*</span></label>
                                <input type="text" id="tower-country" value="${item?.country || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>大洲 <span class="required">*</span></label>
                                <select id="tower-continent" required>
                                    <option value="">请选择</option>
                                    <option value="asia" ${item?.continent === 'asia' ? 'selected' : ''}>亚洲</option>
                                    <option value="europe" ${item?.continent === 'europe' ? 'selected' : ''}>欧洲</option>
                                    <option value="americas" ${item?.continent === 'americas' ? 'selected' : ''}>美洲</option>
                                    <option value="africa" ${item?.continent === 'africa' ? 'selected' : ''}>非洲</option>
                                    <option value="oceania" ${item?.continent === 'oceania' ? 'selected' : ''}>大洋洲</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>难度 <span class="required">*</span></label>
                                <select id="tower-difficulty" required>
                                    <option value="">请选择</option>
                                    <option value="easy" ${item?.difficulty === 'easy' ? 'selected' : ''}>简单</option>
                                    <option value="medium" ${item?.difficulty === 'medium' ? 'selected' : ''}>中等</option>
                                    <option value="hard" ${item?.difficulty === 'hard' ? 'selected' : ''}>困难</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>状态</label>
                                <select id="tower-status">
                                    <option value="active" ${item?.status !== 'inactive' ? 'selected' : ''}>启用</option>
                                    <option value="inactive" ${item?.status === 'inactive' ? 'selected' : ''}>禁用</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>塔图片</label>
                            <div class="upload-zone" id="tower-upload-zone"
                                 ondragover="towerManager.handleDragOver(event)"
                                 ondragleave="towerManager.handleDragLeave(event)"
                                 ondrop="towerManager.handleDrop(event)"
                                 onclick="document.getElementById('tower-file-input').click()">
                                <div class="upload-zone-icon">📤</div>
                                <div class="upload-zone-text">拖拽图片到此处或点击上传</div>
                                <div class="upload-zone-hint">支持 PNG, JPG, WebP 格式</div>
                            </div>
                            <input type="file" id="tower-file-input" accept="image/*" style="display:none" onchange="towerManager.handleFileSelect(event)">
                            
                            <div class="upload-preview" id="tower-preview">
                                ${item?.image ? `
                                    <div class="upload-preview-item">
                                        <img src="${item.image}">
                                        <button type="button" class="remove" onclick="towerManager.removePreview()">&times;</button>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="towerManager.closeModal()">取消</button>
                    <button class="btn btn-primary" onclick="towerManager.save()"><span>💾</span> 保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    closeModal() {
        document.getElementById('tower-modal')?.remove();
        this.editingId = null;
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

    processFile(file) {
        if (!file.type.startsWith('image/')) {
            assetManager.showNotification('请选择图片文件', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('tower-preview');
            preview.innerHTML = `
                <div class="upload-preview-item">
                    <img src="${e.target.result}">
                    <button type="button" class="remove" onclick="towerManager.removePreview()">&times;</button>
                </div>
            `;
            preview.dataset.imageData = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    removePreview() {
        const preview = document.getElementById('tower-preview');
        preview.innerHTML = '';
        delete preview.dataset.imageData;
    },

    save() {
        const name = document.getElementById('tower-name')?.value.trim();
        const country = document.getElementById('tower-country')?.value.trim();
        const continent = document.getElementById('tower-continent')?.value;
        const difficulty = document.getElementById('tower-difficulty')?.value;
        const status = document.getElementById('tower-status')?.value;
        const preview = document.getElementById('tower-preview');
        const imageData = preview?.dataset.imageData;

        if (!name || !country || !continent || !difficulty) {
            assetManager.showNotification('请填写所有必填项', 'error');
            return;
        }

        const towerData = {
            id: this.editingId || assetManager.generateId('tower'),
            name,
            country,
            continent,
            difficulty,
            status: status || 'active',
            image: imageData || (this.editingId ? this.data.find(t => t.id === this.editingId)?.image : ''),
            updatedAt: new Date().toISOString()
        };

        if (!this.editingId) {
            towerData.createdAt = new Date().toISOString();
            this.data.push(towerData);
        } else {
            const index = this.data.findIndex(t => t.id === this.editingId);
            if (index !== -1) {
                this.data[index] = { ...this.data[index], ...towerData };
            }
        }

        this.saveData();
        this.closeModal();
        this.filter();
        assetManager.showNotification(this.editingId ? '塔模型已更新' : '塔模型已创建', 'success');
    },

    saveData() {
        localStorage.setItem('towers', JSON.stringify(this.data));
    },

    edit(id) {
        if (!assetManager.checkPermission('edit')) return;
        const item = this.data.find(t => t.id === id);
        if (item) this.showUploadModal(item);
    },

    delete(id) {
        if (!assetManager.checkPermission('delete')) return;
        
        assetManager.confirm('确定要删除这个塔模型吗？此操作不可恢复。', () => {
            this.data = this.data.filter(t => t.id !== id);
            this.saveData();
            this.filter();
            assetManager.showNotification('塔模型已删除', 'success');
        });
    },

    toggleStatus(id) {
        if (!assetManager.checkPermission('edit')) return;
        
        const item = this.data.find(t => t.id === id);
        if (item) {
            item.status = item.status === 'active' ? 'inactive' : 'active';
            item.updatedAt = new Date().toISOString();
            this.saveData();
            this.render();
            assetManager.showNotification(`塔模型已${item.status === 'active' ? '启用' : '禁用'}`, 'success');
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

    exportData() {
        if (!assetManager.checkPermission('export')) return;
        assetManager.exportJSON(this.data, `towers_${new Date().toISOString().split('T')[0]}.json`);
        assetManager.showNotification('数据导出成功', 'success');
    },

    importData(data) {
        if (!Array.isArray(data)) {
            assetManager.showNotification('数据格式错误', 'error');
            return;
        }

        let successCount = 0;
        data.forEach(item => {
            if (item.name && item.country && item.continent) {
                item.id = item.id || assetManager.generateId('tower');
                item.status = item.status || 'active';
                item.createdAt = item.createdAt || new Date().toISOString();
                
                const existingIndex = this.data.findIndex(t => t.id === item.id);
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
        assetManager.showNotification(`成功导入 ${successCount} 个塔模型`, 'success');
    }
};
