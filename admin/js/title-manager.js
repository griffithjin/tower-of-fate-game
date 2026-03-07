/**
 * 荣誉称号管理器
 * 管理用户称号的授予、取消、获取条件配置
 */
const titleManager = {
    data: [],
    userTitles: [],
    filteredData: [],
    currentPage: 1,
    pageSize: 10,
    editingId: null,

    init() {
        this.load();
        this.loadUserTitles();
    },

    load() {
        this.data = JSON.parse(localStorage.getItem('titles')) || this.getSampleData();
        this.filteredData = [...this.data];
        this.render();
    },

    loadUserTitles() {
        this.userTitles = JSON.parse(localStorage.getItem('userTitles')) || [
            { userId: 'user_001', titleId: 'title_first_climb', grantedAt: '2026-03-01', expiresAt: null },
            { userId: 'user_002', titleId: 'title_master', grantedAt: '2026-03-05', expiresAt: null },
            { userId: 'user_001', titleId: 'title_weekly_champion', grantedAt: '2026-03-01', expiresAt: '2026-03-08' }
        ];
    },

    getSampleData() {
        return [
            {
                id: 'title_first_climb',
                name: '首登者',
                icon: '🏔️',
                description: '首次成功登顶的玩家',
                type: 'permanent',
                condition: { type: 'first_climb', value: 1 },
                holderCount: 156,
                createdAt: '2026-01-01',
                status: 'active'
            },
            {
                id: 'title_master',
                name: '塔王',
                icon: '👑',
                description: '累计登顶100座塔',
                type: 'permanent',
                condition: { type: 'climb_count', value: 100 },
                holderCount: 23,
                createdAt: '2026-01-01',
                status: 'active'
            },
            {
                id: 'title_weekly_champion',
                name: '周冠军',
                icon: '🏆',
                description: '本周积分排名第一',
                type: 'limited',
                duration: 7,
                condition: { type: 'weekly_rank', value: 1 },
                holderCount: 8,
                createdAt: '2026-03-01',
                status: 'active'
            },
            {
                id: 'title_speed_runner',
                name: '极速攀登者',
                icon: '⚡',
                description: '单局用时少于30秒',
                type: 'event',
                condition: { type: 'speed_run', value: 30 },
                holderCount: 45,
                createdAt: '2026-02-15',
                status: 'active'
            },
            {
                id: 'title_collector',
                name: '收藏大师',
                icon: '📚',
                description: '收集50张不同明信片',
                type: 'permanent',
                condition: { type: 'collect_postcards', value: 50 },
                holderCount: 12,
                createdAt: '2026-02-01',
                status: 'active'
            },
            {
                id: 'title_beta_tester',
                name: '内测元老',
                icon: '🧪',
                description: '参与游戏内测的玩家专属',
                type: 'limited',
                duration: 365,
                condition: { type: 'manual_grant' },
                holderCount: 500,
                createdAt: '2026-01-01',
                status: 'active'
            }
        ];
    },

    filter() {
        const type = document.getElementById('title-type-filter')?.value;
        
        this.filteredData = this.data.filter(item => {
            if (type && item.type !== type) return false;
            return true;
        });

        this.currentPage = 1;
        this.render();
    },

    search() {
        const keyword = document.getElementById('title-search')?.value.toLowerCase();
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
        const tbody = document.getElementById('title-list');
        
        if (!tbody) return;

        if (pagination.data.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="8" class="empty-state">
                    <div class="empty-state-icon">👑</div>
                    <div class="empty-state-text">暂无称号数据</div>
                </td></tr>
            `;
        } else {
            tbody.innerHTML = pagination.data.map(item => {
                const conditionText = this.getConditionText(item.condition);
                const durationText = item.type === 'limited' ? `${item.duration}天` : 
                                     item.type === 'event' ? '活动期间' : '永久';
                
                return `
                <tr data-id="${item.id}">
                    <td style="font-size:28px;text-align:center;">${item.icon}</td>
                    <td><strong>${item.name}</strong></td>
                    <td><span class="tag tag-${item.type}">${this.getTypeName(item.type)}</span></td>
                    <td><button class="btn btn-sm btn-secondary" onclick="titleManager.viewHolders('${item.id}')">
                        ${item.holderCount}人</button></td>
                    <td>${conditionText}</td>
                    <td>${durationText}</td>
                    <td><span class="toggle-switch ${item.status === 'active' ? 'active' : ''}" 
                              onclick="titleManager.toggleStatus('${item.id}')"></span></td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn action-btn-edit" onclick="titleManager.edit('${item.id}')">编辑</button>
                            <button class="action-btn action-btn-view" onclick="titleManager.grantToUser('${item.id}')">授予</button>
                        </div>
                    </td>
                </tr>
            `}).join('');
        }

        assetManager.renderPagination('title-pagination', pagination, 'titleManager.goToPage');
    },

    goToPage(page) {
        this.currentPage = page;
        this.render();
    },

    getTypeName(type) {
        const names = { permanent: '永久', limited: '限时', event: '活动' };
        return names[type] || type;
    },

    getConditionText(condition) {
        const typeTexts = {
            first_climb: '首登',
            climb_count: '攀登次数',
            weekly_rank: '周排名',
            speed_run: '极速通关',
            collect_postcards: '收集明信片',
            manual_grant: '手动授予'
        };
        return typeTexts[condition.type] || condition.type;
    },

    showCreateModal(item = null) {
        this.editingId = item?.id || null;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'title-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>👑</span> ${item ? '编辑称号' : '新建称号'}</div>
                    <button class="modal-close" onclick="titleManager.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="title-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>称号名称 <span class="required">*</span></label>
                                <input type="text" id="title-name" value="${item?.name || ''}" required>
                            </div>
                            <div class="form-group">
                                <label>图标 <span class="required">*</span></label>
                                <input type="text" id="title-icon" value="${item?.icon || ''}" placeholder="👑" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>描述 <span class="required">*</span></label>
                            <input type="text" id="title-description" value="${item?.description || ''}" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>类型 <span class="required">*</span></label>
                                <select id="title-type" required onchange="titleManager.onTypeChange()">
                                    <option value="">请选择</option>
                                    <option value="permanent" ${item?.type === 'permanent' ? 'selected' : ''}>永久称号</option>
                                    <option value="limited" ${item?.type === 'limited' ? 'selected' : ''}>限时称号</option>
                                    <option value="event" ${item?.type === 'event' ? 'selected' : ''}>活动称号</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>有效期(天)</label>
                                <input type="number" id="title-duration" value="${item?.duration || ''}" 
                                       min="1" ${item?.type === 'limited' ? '' : 'disabled'}>
                            </div>
                        </div>
                        
                        <div style="background:rgba(255,215,0,0.05);padding:15px;border-radius:8px;margin-bottom:15px;">
                            <h4 style="color:var(--primary);margin-bottom:10px;">⚙️ 获取条件</h4>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>条件类型</label>
                                    <select id="title-condition-type">
                                        <option value="manual_grant" ${item?.condition?.type === 'manual_grant' ? 'selected' : ''}>手动授予</option>
                                        <option value="first_climb" ${item?.condition?.type === 'first_climb' ? 'selected' : ''}>首登</option>
                                        <option value="climb_count" ${item?.condition?.type === 'climb_count' ? 'selected' : ''}>攀登次数</option>
                                        <option value="weekly_rank" ${item?.condition?.type === 'weekly_rank' ? 'selected' : ''}>周排名</option>
                                        <option value="speed_run" ${item?.condition?.type === 'speed_run' ? 'selected' : ''}>极速通关</option>
                                        <option value="collect_postcards" ${item?.condition?.type === 'collect_postcards' ? 'selected' : ''}>收集明信片</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>条件数值</label>
                                    <input type="number" id="title-condition-value" 
                                           value="${item?.condition?.value || ''}" min="1"
                                           placeholder="如：100">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="titleManager.closeModal()">取消</button>
                    <button class="btn btn-primary" onclick="titleManager.save()">保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    onTypeChange() {
        const type = document.getElementById('title-type')?.value;
        const durationInput = document.getElementById('title-duration');
        if (durationInput) {
            durationInput.disabled = type !== 'limited';
        }
    },

    closeModal() {
        document.getElementById('title-modal')?.remove();
        this.editingId = null;
    },

    save() {
        const name = document.getElementById('title-name')?.value.trim();
        const icon = document.getElementById('title-icon')?.value.trim();
        const description = document.getElementById('title-description')?.value.trim();
        const type = document.getElementById('title-type')?.value;
        const duration = parseInt(document.getElementById('title-duration')?.value) || null;
        const conditionType = document.getElementById('title-condition-type')?.value;
        const conditionValue = parseInt(document.getElementById('title-condition-value')?.value) || null;

        if (!name || !icon || !description || !type) {
            assetManager.showNotification('请填写所有必填项', 'error');
            return;
        }

        const titleData = {
            id: this.editingId || assetManager.generateId('title'),
            name,
            icon,
            description,
            type,
            duration: type === 'limited' ? duration : null,
            condition: { type: conditionType, value: conditionValue },
            holderCount: this.editingId ? (this.data.find(t => t.id === this.editingId)?.holderCount || 0) : 0,
            status: 'active',
            createdAt: this.editingId ? (this.data.find(t => t.id === this.editingId)?.createdAt) : new Date().toISOString()
        };

        if (!this.editingId) {
            this.data.push(titleData);
        } else {
            const index = this.data.findIndex(t => t.id === this.editingId);
            if (index !== -1) {
                this.data[index] = titleData;
            }
        }

        this.saveData();
        this.closeModal();
        this.filter();
        assetManager.showNotification(this.editingId ? '称号已更新' : '称号已创建', 'success');
    },

    saveData() {
        localStorage.setItem('titles', JSON.stringify(this.data));
    },

    edit(id) {
        const item = this.data.find(t => t.id === id);
        if (item) this.showCreateModal(item);
    },

    showGrantModal() {
        this.grantToUser();
    },

    grantToUser(titleId = null) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'title-grant-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>🎁</span> 授予称号</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>选择称号 <span class="required">*</span></label>
                        <select id="grant-title-id" ${titleId ? 'disabled' : ''}>
                            <option value="">请选择称号</option>
                            ${this.data.filter(t => t.status === 'active').map(t => `
                                <option value="${t.id}" ${titleId === t.id ? 'selected' : ''}>${t.icon} ${t.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>用户ID <span class="required">*</span></label>
                        <input type="text" id="grant-user-id" placeholder="输入用户ID">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>有效期类型</label>
                            <select id="grant-expire-type" onchange="titleManager.onExpireTypeChange()">
                                <option value="default">使用默认</option>
                                <option value="custom">自定义</option>
                                <option value="permanent">永久</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>到期日期</label>
                            <input type="date" id="grant-expire-date" disabled>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">取消</button>
                    <button class="btn btn-primary" onclick="titleManager.confirmGrant()">确认授予</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    onExpireTypeChange() {
        const type = document.getElementById('grant-expire-type')?.value;
        const dateInput = document.getElementById('grant-expire-date');
        if (dateInput) {
            dateInput.disabled = type !== 'custom';
        }
    },

    confirmGrant() {
        const titleId = document.getElementById('grant-title-id')?.value;
        const userId = document.getElementById('grant-user-id')?.value.trim();
        const expireType = document.getElementById('grant-expire-type')?.value;
        const expireDate = document.getElementById('grant-expire-date')?.value;

        if (!titleId || !userId) {
            assetManager.showNotification('请填写完整信息', 'error');
            return;
        }

        const title = this.data.find(t => t.id === titleId);
        if (!title) {
            assetManager.showNotification('称号不存在', 'error');
            return;
        }

        let expiresAt = null;
        if (expireType === 'custom' && expireDate) {
            expiresAt = new Date(expireDate).toISOString();
        } else if (expireType === 'default' && title.duration) {
            const date = new Date();
            date.setDate(date.getDate() + title.duration);
            expiresAt = date.toISOString();
        }

        // 检查是否已拥有
        const existing = this.userTitles.find(ut => ut.userId === userId && ut.titleId === titleId);
        if (existing) {
            assetManager.showNotification('该用户已拥有此称号', 'warning');
            return;
        }

        this.userTitles.push({
            userId,
            titleId,
            grantedAt: new Date().toISOString(),
            expiresAt
        });

        // 更新持有者数量
        title.holderCount++;
        this.saveData();
        localStorage.setItem('userTitles', JSON.stringify(this.userTitles));
        
        document.getElementById('title-grant-modal')?.remove();
        this.filter();
        assetManager.showNotification(`称号 ${title.name} 已授予用户 ${userId}`, 'success');
    },

    viewHolders(titleId) {
        const title = this.data.find(t => t.id === titleId);
        if (!title) return;

        const holders = this.userTitles.filter(ut => ut.titleId === titleId);

        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <div class="modal-title"><span>👥</span> ${title.icon} ${title.name} - 持有者列表</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <p style="margin-bottom:15px;"><strong>总持有者:</strong> ${holders.length}人</p>
                    
                    <table class="data-table">
                        <thead>
                            <tr><th>用户ID</th><th>授予时间</th><th>到期时间</th><th>操作</th></tr>
                        </thead>
                        <tbody>
                            ${holders.map(h => `
                                <tr>
                                    <td>${h.userId}</td>
                                    <td>${assetManager.formatDate(h.grantedAt)}</td>
                                    <td>${h.expiresAt ? assetManager.formatDate(h.expiresAt) : '永久'}</td>
                                    <td><button class="action-btn action-btn-delete" 
                                            onclick="titleManager.revoke('${h.userId}', '${titleId}')">收回</button></td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" style="text-align:center;">暂无持有者</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    revoke(userId, titleId) {
        assetManager.confirm('确定要收回该用户的称号吗？', () => {
            this.userTitles = this.userTitles.filter(ut => !(ut.userId === userId && ut.titleId === titleId));
            
            const title = this.data.find(t => t.id === titleId);
            if (title) title.holderCount = Math.max(0, title.holderCount - 1);
            
            this.saveData();
            localStorage.setItem('userTitles', JSON.stringify(this.userTitles));
            
            document.querySelector('.modal-overlay.show')?.remove();
            this.filter();
            assetManager.showNotification('称号已收回', 'success');
        });
    },

    toggleStatus(id) {
        const item = this.data.find(t => t.id === id);
        if (item) {
            item.status = item.status === 'active' ? 'inactive' : 'active';
            this.saveData();
            this.render();
            assetManager.showNotification(`称号已${item.status === 'active' ? '启用' : '禁用'}`, 'success');
        }
    },

    showConditionsModal() {
        assetManager.showNotification('获取条件配置可在编辑称号时设置', 'info');
    }
};
