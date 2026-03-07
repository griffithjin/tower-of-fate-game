/**
 * 明信片管理器
 * 管理明信片收藏、发放、活动配置
 */
const postcardManager = {
    data: [],
    userPostcards: [],
    filteredData: [],
    currentPage: 1,
    pageSize: 10,
    editingId: null,

    init() {
        this.load();
        this.loadUserPostcards();
    },

    load() {
        this.data = JSON.parse(localStorage.getItem('postcards')) || this.getSampleData();
        this.filteredData = [...this.data];
        this.render();
    },

    loadUserPostcards() {
        this.userPostcards = JSON.parse(localStorage.getItem('userPostcards')) || [
            { userId: 'user_001', postcardId: 'pc_china_001', obtainedAt: '2026-03-01' },
            { userId: 'user_001', postcardId: 'pc_france_001', obtainedAt: '2026-03-02' },
            { userId: 'user_002', postcardId: 'pc_china_001', obtainedAt: '2026-03-05' },
            { userId: 'user_003', postcardId: 'pc_japan_001', obtainedAt: '2026-03-03' }
        ];
    },

    getSampleData() {
        return [
            {
                id: 'pc_china_001',
                name: '东方明珠夜景',
                series: 'asia',
                country: 'CN',
                countryName: '中国',
                image: '../web_client/assets/postcards/china_oriental_pearl.png',
                description: '上海标志性建筑，璀璨夺目',
                rarity: 'common',
                collectionCount: 1256,
                obtainMethod: 'climb', // climb, event, gift
                obtainCondition: { towerId: 'tower_001' },
                status: 'active',
                createdAt: '2026-01-01'
            },
            {
                id: 'pc_china_002',
                name: '万里长城',
                series: 'asia',
                country: 'CN',
                countryName: '中国',
                image: '../web_client/assets/postcards/china_great_wall.png',
                description: '世界文化遗产，雄伟壮观',
                rarity: 'rare',
                collectionCount: 892,
                obtainMethod: 'event',
                obtainCondition: { eventId: 'event_national_day' },
                status: 'active',
                createdAt: '2026-01-01'
            },
            {
                id: 'pc_france_001',
                name: '埃菲尔铁塔',
                series: 'europe',
                country: 'FR',
                countryName: '法国',
                image: '../web_client/assets/postcards/france_eiffel.png',
                description: '浪漫之都的象征',
                rarity: 'common',
                collectionCount: 2103,
                obtainMethod: 'climb',
                obtainCondition: { towerId: 'tower_002' },
                status: 'active',
                createdAt: '2026-01-01'
            },
            {
                id: 'pc_japan_001',
                name: '富士山',
                series: 'asia',
                country: 'JP',
                countryName: '日本',
                image: '../web_client/assets/postcards/japan_fuji.png',
                description: '日本圣山，四季皆美',
                rarity: 'rare',
                collectionCount: 756,
                obtainMethod: 'gift',
                obtainCondition: null,
                status: 'active',
                createdAt: '2026-02-01'
            },
            {
                id: 'pc_special_001',
                name: '金蛇贺岁',
                series: 'special',
                country: 'CN',
                countryName: '中国',
                image: '../web_client/assets/postcards/special_snake.png',
                description: '2026蛇年春节限定',
                rarity: 'legendary',
                collectionCount: 128,
                obtainMethod: 'event',
                obtainCondition: { eventId: 'event_spring_festival' },
                limited: true,
                availableUntil: '2026-02-28',
                status: 'active',
                createdAt: '2026-01-25'
            },
            {
                id: 'pc_usa_001',
                name: '自由女神像',
                series: 'americas',
                country: 'US',
                countryName: '美国',
                image: '../web_client/assets/postcards/usa_liberty.png',
                description: '自由与民主的象征',
                rarity: 'common',
                collectionCount: 1876,
                obtainMethod: 'climb',
                obtainCondition: { towerId: 'tower_003' },
                status: 'active',
                createdAt: '2026-01-01'
            }
        ];
    },

    filter() {
        const series = document.getElementById('postcard-series-filter')?.value;
        const rarity = document.getElementById('postcard-rarity-filter')?.value;
        
        this.filteredData = this.data.filter(item => {
            if (series && item.series !== series) return false;
            if (rarity && item.rarity !== rarity) return false;
            return true;
        });

        this.currentPage = 1;
        this.render();
    },

    search() {
        const keyword = document.getElementById('postcard-search')?.value.toLowerCase();
        if (!keyword) {
            this.filter();
            return;
        }

        this.filteredData = this.data.filter(item => 
            item.name.toLowerCase().includes(keyword) ||
            item.countryName.toLowerCase().includes(keyword) ||
            item.description.toLowerCase().includes(keyword)
        );

        this.currentPage = 1;
        this.render();
    },

    render() {
        const pagination = assetManager.paginate(this.filteredData, this.currentPage, this.pageSize);
        const tbody = document.getElementById('postcard-list');
        
        if (!tbody) return;

        if (pagination.data.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="8" class="empty-state">
                    <div class="empty-state-icon">🎑</div>
                    <div class="empty-state-text">暂无明信片数据</div>
                </td></tr>
            `;
        } else {
            tbody.innerHTML = pagination.data.map(item => `
                <tr data-id="${item.id}">
                    <td><img src="${item.image || '../web_client/assets/default-postcard.png'}" 
                             class="table-preview" 
                             onclick="postcardManager.previewImage('${item.image}')"
                             onerror="this.src='../web_client/assets/default-postcard.png'"></td>
                    <td><strong>${item.name}</strong></td>
                    <td><span class="tag tag-${item.series}">${this.getSeriesName(item.series)}</span></td>
                    <td><span class="tag tag-${item.rarity}">${this.getRarityName(item.rarity)}</span></td>
                    <td><button class="btn btn-sm btn-secondary" onclick="postcardManager.viewCollectors('${item.id}')">
                        ${item.collectionCount.toLocaleString()}人</button></td>
                    <td>${this.getObtainMethodName(item.obtainMethod)}</td>
                    <td>${item.limited ? `<span class="tag tag-limited">限时</span>` : '<span class="toggle-switch active" onclick="postcardManager.toggleStatus(\'${item.id}\')"></span>'}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn action-btn-edit" onclick="postcardManager.edit('${item.id}')">编辑</button>
                            <button class="action-btn action-btn-view" onclick="postcardManager.sendToUser('${item.id}')">发放</button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        assetManager.renderPagination('postcard-pagination', pagination, 'postcardManager.goToPage');
    },

    goToPage(page) {
        this.currentPage = page;
        this.render();
    },

    getSeriesName(series) {
        const names = { asia: '亚洲', europe: '欧洲', americas: '美洲', africa: '非洲', oceania: '大洋洲', special: '特别版' };
        return names[series] || series;
    },

    getRarityName(rarity) {
        const names = { common: '普通', rare: '稀有', epic: '史诗', legendary: '传说' };
        return names[rarity] || rarity;
    },

    getObtainMethodName(method) {
        const names = { climb: '攀登获取', event: '活动奖励', gift: '手动发放' };
        return names[method] || method;
    },

    showCreateModal(item = null) {
        this.editingId = item?.id || null;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'postcard-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>🎑</span> ${item ? '编辑明信片' : '新建明信片'}</div>
                    <button class="modal-close" onclick="postcardManager.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="postcard-form">
                        <div class="form-group">
                            <label>明信片名称 <span class="required">*</span></label>
                            <input type="text" id="postcard-name" value="${item?.name || ''}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>系列 <span class="required">*</span></label>
                                <select id="postcard-series" required>
                                    <option value="">请选择</option>
                                    <option value="asia" ${item?.series === 'asia' ? 'selected' : ''}>亚洲系列</option>
                                    <option value="europe" ${item?.series === 'europe' ? 'selected' : ''}>欧洲系列</option>
                                    <option value="americas" ${item?.series === 'americas' ? 'selected' : ''}>美洲系列</option>
                                    <option value="africa" ${item?.series === 'africa' ? 'selected' : ''}>非洲系列</option>
                                    <option value="oceania" ${item?.series === 'oceania' ? 'selected' : ''}>大洋洲系列</option>
                                    <option value="special" ${item?.series === 'special' ? 'selected' : ''}>特别版</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>稀有度 <span class="required">*</span></label>
                                <select id="postcard-rarity" required>
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
                                <label>国家代码</label>
                                <input type="text" id="postcard-country" value="${item?.country || ''}" maxlength="2" placeholder="如：CN">
                            </div>
                            <div class="form-group">
                                <label>国家名称</label>
                                <input type="text" id="postcard-country-name" value="${item?.countryName || ''}" placeholder="如：中国">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>描述</label>
                            <input type="text" id="postcard-description" value="${item?.description || ''}" placeholder="明信片简介...">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>获取方式</label>
                                <select id="postcard-obtain-method">
                                    <option value="climb" ${item?.obtainMethod === 'climb' ? 'selected' : ''}>攀登获取</option>
                                    <option value="event" ${item?.obtainMethod === 'event' ? 'selected' : ''}>活动奖励</option>
                                    <option value="gift" ${item?.obtainMethod === 'gift' ? 'selected' : ''}>手动发放</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>限时明信片</label>
                                <div class="checkbox-wrapper">
                                    <input type="checkbox" id="postcard-limited" ${item?.limited ? 'checked' : ''}
                                           onchange="document.getElementById('postcard-until').disabled = !this.checked">
                                    <label for="postcard-limited">是</label>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>截止日期</label>
                            <input type="date" id="postcard-until" value="${item?.availableUntil || ''}" 
                                   ${item?.limited ? '' : 'disabled'}>
                        </div>
                        
                        <div class="form-group">
                            <label>明信片图片</label>
                            <div class="upload-zone" onclick="document.getElementById('postcard-file-input').click()">
                                <div class="upload-zone-icon">📤</div>
                                <div class="upload-zone-text">点击上传图片</div>
                            </div>
                            <input type="file" id="postcard-file-input" accept="image/*" style="display:none" 
                                   onchange="postcardManager.handleFileSelect(event)">
                            <div class="upload-preview" id="postcard-preview">
                                ${item?.image ? `
                                    <div class="upload-preview-item">
                                        <img src="${item.image}">
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="postcardManager.closeModal()">取消</button>
                    <button class="btn btn-primary" onclick="postcardManager.save()">保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    closeModal() {
        document.getElementById('postcard-modal')?.remove();
        this.editingId = null;
    },

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const preview = document.getElementById('postcard-preview');
            preview.innerHTML = `
                <div class="upload-preview-item">
                    <img src="${event.target.result}">
                </div>
            `;
            preview.dataset.imageData = event.target.result;
        };
        reader.readAsDataURL(file);
    },

    save() {
        const name = document.getElementById('postcard-name')?.value.trim();
        const series = document.getElementById('postcard-series')?.value;
        const rarity = document.getElementById('postcard-rarity')?.value;
        const country = document.getElementById('postcard-country')?.value.trim().toUpperCase();
        const countryName = document.getElementById('postcard-country-name')?.value.trim();
        const description = document.getElementById('postcard-description')?.value.trim();
        const obtainMethod = document.getElementById('postcard-obtain-method')?.value;
        const limited = document.getElementById('postcard-limited')?.checked;
        const availableUntil = document.getElementById('postcard-until')?.value;
        const preview = document.getElementById('postcard-preview');
        const imageData = preview?.dataset.imageData;

        if (!name || !series || !rarity) {
            assetManager.showNotification('请填写所有必填项', 'error');
            return;
        }

        const postcardData = {
            id: this.editingId || assetManager.generateId('pc'),
            name,
            series,
            rarity,
            country: country || 'XX',
            countryName: countryName || '未知',
            description,
            obtainMethod,
            limited,
            availableUntil: limited ? availableUntil : null,
            image: imageData || (this.editingId ? this.data.find(p => p.id === this.editingId)?.image : ''),
            collectionCount: this.editingId ? (this.data.find(p => p.id === this.editingId)?.collectionCount || 0) : 0,
            status: 'active',
            createdAt: this.editingId ? (this.data.find(p => p.id === this.editingId)?.createdAt) : new Date().toISOString()
        };

        if (!this.editingId) {
            this.data.push(postcardData);
        } else {
            const index = this.data.findIndex(p => p.id === this.editingId);
            if (index !== -1) {
                this.data[index] = postcardData;
            }
        }

        this.saveData();
        this.closeModal();
        this.filter();
        assetManager.showNotification(this.editingId ? '明信片已更新' : '明信片已创建', 'success');
    },

    saveData() {
        localStorage.setItem('postcards', JSON.stringify(this.data));
    },

    edit(id) {
        const item = this.data.find(p => p.id === id);
        if (item) this.showCreateModal(item);
    },

    sendToUser(postcardId = null) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'postcard-send-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>📮</span> 发放明信片</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>选择明信片 <span class="required">*</span></label>
                        <select id="send-postcard-id" ${postcardId ? 'disabled' : ''}>
                            <option value="">请选择明信片</option>
                            ${this.data.filter(p => p.status === 'active').map(p => `
                                <option value="${p.id}" ${postcardId === p.id ? 'selected' : ''}>${p.name} (${this.getRarityName(p.rarity)})</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>用户ID <span class="required">*</span></label>
                        <input type="text" id="send-user-id" placeholder="输入用户ID，多个用户用逗号分隔">
                        <div class="hint">支持批量发放，多个用户ID用逗号分隔</div>
                    </div>
                    
                    <div class="form-group">
                        <label>发放原因</label>
                        <input type="text" id="send-reason" placeholder="如：活动奖励、补偿、手动发放...">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">取消</button>
                    <button class="btn btn-primary" onclick="postcardManager.confirmSend()">确认发放</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    confirmSend() {
        const postcardId = document.getElementById('send-postcard-id')?.value;
        const userIdsInput = document.getElementById('send-user-id')?.value.trim();
        const reason = document.getElementById('send-reason')?.value.trim();

        if (!postcardId || !userIdsInput) {
            assetManager.showNotification('请填写完整信息', 'error');
            return;
        }

        const postcard = this.data.find(p => p.id === postcardId);
        if (!postcard) {
            assetManager.showNotification('明信片不存在', 'error');
            return;
        }

        const userIds = userIdsInput.split(',').map(id => id.trim()).filter(id => id);
        let successCount = 0;
        let duplicateCount = 0;

        userIds.forEach(userId => {
            // 检查是否已拥有
            const existing = this.userPostcards.find(up => up.userId === userId && up.postcardId === postcardId);
            if (existing) {
                duplicateCount++;
                return;
            }

            this.userPostcards.push({
                userId,
                postcardId,
                obtainedAt: new Date().toISOString(),
                reason: reason || '手动发放'
            });
            successCount++;
        });

        // 更新收藏数
        postcard.collectionCount += successCount;
        this.saveData();
        localStorage.setItem('userPostcards', JSON.stringify(this.userPostcards));

        document.getElementById('postcard-send-modal')?.remove();
        this.filter();

        let msg = `成功发放 ${successCount} 张明信片`;
        if (duplicateCount > 0) msg += `，${duplicateCount} 位用户已拥有`;
        assetManager.showNotification(msg, 'success');
    },

    viewCollectors(postcardId) {
        const postcard = this.data.find(p => p.id === postcardId);
        if (!postcard) return;

        const collectors = this.userPostcards.filter(up => up.postcardId === postcardId);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <div class="modal-title"><span>👥</span> 收藏者列表 - ${postcard.name}</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom:15px;"><strong>总收藏数:</strong> ${collectors.length}人</p>
                    
                    <table class="data-table">
                        <thead>
                            <tr><th>用户ID</th><th>获取时间</th><th>原因</th></tr>
                        </thead>
                        <tbody>
                            ${collectors.slice(0, 20).map(c => `
                                <tr>
                                    <td>${c.userId}</td>
                                    <td>${assetManager.formatDate(c.obtainedAt)}</td>
                                    <td>${c.reason || '-'}</td>
                                </tr>
                            `).join('') || '<tr><td colspan="3" style="text-align:center;">暂无收藏者</td></tr>'}
                        </tbody>
                    </table>
                    
                    ${collectors.length > 20 ? `<p style="text-align:center;color:#888;margin-top:10px;">... 还有 ${collectors.length - 20} 位收藏者 ...</p>` : ''}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    showActivityModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <div class="modal-title"><span>🎯</span> 明信片活动配置</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background:rgba(255,215,0,0.05);padding:15px;border-radius:8px;margin-bottom:20px;">
                        <h4 style="color:var(--primary);margin-bottom:10px;">📅 当前活动</h4>
                        <div style="display:flex;justify-content:space-between;align-items:center;padding:10px;background:rgba(0,0,0,0.2);border-radius:8px;">
                            <div>
                                <div style="font-weight:bold;">🎊 春节特别活动</div>
                                <div style="font-size:12px;color:#888;">2026-01-25 至 2026-02-28</div>
                            </div>
                            <span class="tag tag-active">进行中</span>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>活动名称</label>
                        <input type="text" placeholder="如：春节特别活动">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>开始时间</label>
                            <input type="datetime-local">
                        </div>
                        <div class="form-group">
                            <label>结束时间</label>
                            <input type="datetime-local">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>活动说明</label>
                        <textarea rows="3" placeholder="活动期间每日登录可获取限定明信片..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">关闭</button>
                    <button class="btn btn-primary" onclick="assetManager.showNotification('活动配置功能开发中', 'info')">保存配置</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    previewImage(url) {
        if (!url) return;
        const modal = document.createElement('div');
        modal.className = 'modal-overlay image-preview-modal show';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>🖼️</span> 明信片预览</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body" style="text-align:center;">
                    <img src="${url}" style="max-width:100%; max-height:60vh; border-radius:8px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    toggleStatus(id) {
        const item = this.data.find(p => p.id === id);
        if (item) {
            item.status = item.status === 'active' ? 'inactive' : 'active';
            this.saveData();
            this.render();
            assetManager.showNotification(`明信片已${item.status === 'active' ? '启用' : '禁用'}`, 'success');
        }
    }
};
