/**
 * 锦标赛管理器
 */
const tournamentManager = {
    data: [],
    filteredData: [],
    currentPage: 1,
    pageSize: 10,
    editingId: null,

    init() {
        this.load();
    },

    load() {
        this.data = JSON.parse(localStorage.getItem('tournaments')) || this.getSampleData();
        this.filteredData = [...this.data];
        this.render();
    },

    getSampleData() {
        const now = new Date();
        return [
            {
                id: 'tournament_001',
                name: '全球锦标赛·上海站',
                country: 'CN',
                countryName: '中国',
                startTime: '2026-03-08T10:00:00',
                endTime: '2026-03-08T12:00:00',
                maxPlayers: 10,
                prize: {
                    champion: { diamonds: 5000, title: '首登者' },
                    runnerUp: { diamonds: 3000 },
                    thirdPlace: { diamonds: 1500 }
                },
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'tournament_002',
                name: '欧洲锦标赛·巴黎站',
                country: 'FR',
                countryName: '法国',
                startTime: '2026-03-15T14:00:00',
                endTime: '2026-03-15T16:00:00',
                maxPlayers: 20,
                prize: {
                    champion: { diamonds: 3000, title: '征服者' },
                    runnerUp: { diamonds: 1800 },
                    thirdPlace: { diamonds: 900 }
                },
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            },
            {
                id: 'tournament_003',
                name: '美洲锦标赛·纽约站',
                country: 'US',
                countryName: '美国',
                startTime: '2026-03-22T20:00:00',
                endTime: '2026-03-22T22:00:00',
                maxPlayers: 15,
                prize: {
                    champion: { diamonds: 4000, title: '王者' },
                    runnerUp: { diamonds: 2400 },
                    thirdPlace: { diamonds: 1200 }
                },
                status: 'active',
                createdAt: '2026-03-08T10:00:00'
            }
        ];
    },

    filter() {
        const status = document.getElementById('tournament-status-filter')?.value;
        const now = new Date().toISOString();

        this.filteredData = this.data.filter(item => {
            if (status) {
                const itemStatus = this.getTournamentStatus(item, now);
                if (itemStatus !== status) return false;
            }
            return true;
        });

        this.currentPage = 1;
        this.render();
    },

    search() {
        const keyword = document.getElementById('tournament-search')?.value.toLowerCase();
        if (!keyword) {
            this.filter();
            return;
        }

        this.filteredData = this.data.filter(item => 
            item.name.toLowerCase().includes(keyword) ||
            item.countryName.toLowerCase().includes(keyword)
        );

        this.currentPage = 1;
        this.render();
    },

    getTournamentStatus(item, now) {
        if (now < item.startTime) return 'upcoming';
        if (now > item.endTime) return 'ended';
        return 'ongoing';
    },

    render() {
        const pagination = assetManager.paginate(this.filteredData, this.currentPage, this.pageSize);
        const tbody = document.getElementById('tournament-list');
        const now = new Date().toISOString();
        
        if (!tbody) return;

        if (pagination.data.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="8" class="empty-state">
                    <div class="empty-state-icon">🏆</div>
                    <div class="empty-state-text">暂无锦标赛数据</div>
                </td></tr>
            `;
        } else {
            tbody.innerHTML = pagination.data.map(item => {
                const status = this.getTournamentStatus(item, now);
                return `
                <tr data-id="${item.id}">
                    <td>${item.name}</td>
                    <td>🇨🇳 ${item.countryName} (${item.country})</td>
                    <td>${assetManager.formatDate(item.startTime)}</td>
                    <td>${assetManager.formatDate(item.endTime)}</td>
                    <td>${item.maxPlayers}人</td>
                    <td><span class="price-diamond">${item.prize.champion.diamonds.toLocaleString()} 💎</span> + ${item.prize.champion.title}</td>
                    <td><span class="tag tag-${status}">${this.getStatusName(status)}</span></td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn action-btn-edit" onclick="tournamentManager.edit('${item.id}')">编辑</button>
                            <button class="action-btn action-btn-view" onclick="tournamentManager.view('${item.id}')">查看</button>
                            ${assetManager.hasPermission('delete') ? `
                                <button class="action-btn action-btn-delete" onclick="tournamentManager.delete('${item.id}')">删除</button>
                            ` : ''}
                        </div>
                    </td>
                </tr>
            `}).join('');
        }

        assetManager.renderPagination('tournament-pagination', pagination, 'tournamentManager.goToPage');
    },

    goToPage(page) {
        this.currentPage = page;
        this.render();
    },

    getStatusName(status) {
        const names = { upcoming: '即将开始', ongoing: '进行中', ended: '已结束' };
        return names[status] || status;
    },

    showCreateModal(item = null) {
        this.editingId = item?.id || null;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'tournament-modal';
        modal.innerHTML = `
            <div class="modal" style="max-width: 700px;">
                <div class="modal-header">
                    <div class="modal-title"><span>🏆</span> ${item ? '编辑锦标赛' : '新建锦标赛'}</div>
                    <button class="modal-close" onclick="tournamentManager.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="tournament-form">
                        <div class="form-group">
                            <label>锦标赛名称 <span class="required">*</span></label>
                            <input type="text" id="tournament-name" value="${item?.name || ''}" 
                                   placeholder="如：全球锦标赛·上海站" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>国家代码 <span class="required">*</span></label>
                                <input type="text" id="tournament-country" value="${item?.country || ''}" 
                                       placeholder="如：CN" maxlength="2" required>
                            </div>
                            <div class="form-group">
                                <label>国家名称 <span class="required">*</span></label>
                                <input type="text" id="tournament-country-name" value="${item?.countryName || ''}" 
                                       placeholder="如：中国" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label>开始时间 <span class="required">*</span></label>
                                <input type="datetime-local" id="tournament-start" 
                                       value="${item?.startTime ? item.startTime.slice(0, 16) : ''}" required>
                            </div>
                            <div class="form-group">
                                <label>结束时间 <span class="required">*</span></label>
                                <input type="datetime-local" id="tournament-end" 
                                       value="${item?.endTime ? item.endTime.slice(0, 16) : ''}" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label>人数限制 <span class="required">*</span></label>
                            <input type="number" id="tournament-max-players" 
                                   value="${item?.maxPlayers || 10}" min="2" max="100" required>
                        </div>
                        
                        <div style="background: rgba(255,215,0,0.05); padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <h4 style="color: var(--primary); margin-bottom: 15px;">🏆 奖励设置</h4>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>冠军钻石</label>
                                    <input type="number" id="prize-champion-diamonds" 
                                           value="${item?.prize?.champion?.diamonds || 5000}" min="0">
                                </div>
                                <div class="form-group">
                                    <label>冠军称号</label>
                                    <input type="text" id="prize-champion-title" 
                                           value="${item?.prize?.champion?.title || '首登者'}">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label>亚军钻石</label>
                                    <input type="number" id="prize-runnerup-diamonds" 
                                           value="${item?.prize?.runnerUp?.diamonds || 3000}" min="0">
                                </div>
                                <div class="form-group">
                                    <label>季军钻石</label>
                                    <input type="number" id="prize-third-diamonds" 
                                           value="${item?.prize?.thirdPlace?.diamonds || 1500}" min="0">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="tournamentManager.closeModal()">取消</button>
                    <button class="btn btn-primary" onclick="tournamentManager.save()"><span>💾</span> 保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    closeModal() {
        document.getElementById('tournament-modal')?.remove();
        this.editingId = null;
    },

    save() {
        const name = document.getElementById('tournament-name')?.value.trim();
        const country = document.getElementById('tournament-country')?.value.trim().toUpperCase();
        const countryName = document.getElementById('tournament-country-name')?.value.trim();
        const startTime = document.getElementById('tournament-start')?.value;
        const endTime = document.getElementById('tournament-end')?.value;
        const maxPlayers = parseInt(document.getElementById('tournament-max-players')?.value);
        
        const championDiamonds = parseInt(document.getElementById('prize-champion-diamonds')?.value) || 0;
        const championTitle = document.getElementById('prize-champion-title')?.value.trim() || '首登者';
        const runnerUpDiamonds = parseInt(document.getElementById('prize-runnerup-diamonds')?.value) || 0;
        const thirdPlaceDiamonds = parseInt(document.getElementById('prize-third-diamonds')?.value) || 0;

        if (!name || !country || !countryName || !startTime || !endTime) {
            assetManager.showNotification('请填写所有必填项', 'error');
            return;
        }

        if (new Date(startTime) >= new Date(endTime)) {
            assetManager.showNotification('结束时间必须晚于开始时间', 'error');
            return;
        }

        const tournamentData = {
            id: this.editingId || assetManager.generateId('tournament'),
            name,
            country,
            countryName,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            maxPlayers,
            prize: {
                champion: { diamonds: championDiamonds, title: championTitle },
                runnerUp: { diamonds: runnerUpDiamonds },
                thirdPlace: { diamonds: thirdPlaceDiamonds }
            },
            status: 'active',
            updatedAt: new Date().toISOString()
        };

        if (!this.editingId) {
            tournamentData.createdAt = new Date().toISOString();
            this.data.push(tournamentData);
        } else {
            const index = this.data.findIndex(t => t.id === this.editingId);
            if (index !== -1) {
                this.data[index] = { ...this.data[index], ...tournamentData };
            }
        }

        this.saveData();
        this.closeModal();
        this.filter();
        assetManager.showNotification(this.editingId ? '锦标赛已更新' : '锦标赛已创建', 'success');
    },

    saveData() {
        localStorage.setItem('tournaments', JSON.stringify(this.data));
    },

    edit(id) {
        if (!assetManager.checkPermission('edit')) return;
        const item = this.data.find(t => t.id === id);
        if (item) this.showCreateModal(item);
    },

    delete(id) {
        if (!assetManager.checkPermission('delete')) return;
        
        assetManager.confirm('确定要删除这个锦标赛吗？', () => {
            this.data = this.data.filter(t => t.id !== id);
            this.saveData();
            this.filter();
            assetManager.showNotification('锦标赛已删除', 'success');
        });
    },

    view(id) {
        const item = this.data.find(t => t.id === id);
        if (!item) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <div class="modal-title"><span>🏆</span> 锦标赛详情</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: var(--primary);">${item.name}</h2>
                        <p>🇨🇳 ${item.countryName} (${item.country})</p>
                    </div>
                    
                    <div style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 8px;">
                        <p><strong>开始时间:</strong> ${assetManager.formatDate(item.startTime)}</p>
                        <p><strong>结束时间:</strong> ${assetManager.formatDate(item.endTime)}</p>
                        <p><strong>人数限制:</strong> ${item.maxPlayers}人</p>
                    </div>
                    
                    <h4 style="color: var(--primary); margin: 20px 0 15px;">🏆 奖励</h4>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                        <div style="background: linear-gradient(135deg, #ffd700, #ffaa00); padding: 15px; border-radius: 8px; color: #000; text-align: center;">
                            <div style="font-size: 24px;">🥇</div>
                            <div>冠军</div>
                            <div style="font-weight: bold;">${item.prize.champion.diamonds} 💎</div>
                            <div style="font-size: 12px;">${item.prize.champion.title}</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #c0c0c0, #808080); padding: 15px; border-radius: 8px; color: #000; text-align: center;">
                            <div style="font-size: 24px;">🥈</div>
                            <div>亚军</div>
                            <div style="font-weight: bold;">${item.prize.runnerUp.diamonds} 💎</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #cd7f32, #8b4513); padding: 15px; border-radius: 8px; color: #fff; text-align: center;">
                            <div style="font-size: 24px;">🥉</div>
                            <div>季军</div>
                            <div style="font-weight: bold;">${item.prize.thirdPlace.diamonds} 💎</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
};
