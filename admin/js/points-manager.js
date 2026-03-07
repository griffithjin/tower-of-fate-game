/**
 * 积分管理器
 * 管理用户积分排名、调整、兑换记录和赛季清零
 */
const pointsManager = {
    data: [],
    filteredData: [],
    currentPage: 1,
    pageSize: 10,
    rules: null,

    init() {
        this.load();
        this.loadRules();
    },

    load() {
        this.data = JSON.parse(localStorage.getItem('userPoints')) || this.getSampleData();
        this.filteredData = [...this.data];
        this.render();
    },

    getSampleData() {
        return [
            {
                userId: 'user_001',
                nickname: '攀登者小明',
                avatar: '🧗',
                currentPoints: 15800,
                seasonPoints: 8600,
                historyMax: 25000,
                exchangeCount: 12,
                exchangeHistory: [
                    { date: '2026-03-01', item: '金币x1000', points: 500 },
                    { date: '2026-03-05', item: '道具卡', points: 800 }
                ],
                lastActive: '2026-03-08T10:30:00'
            },
            {
                userId: 'user_002',
                nickname: '塔王',
                avatar: '👑',
                currentPoints: 22500,
                seasonPoints: 12000,
                historyMax: 28000,
                exchangeCount: 25,
                exchangeHistory: [],
                lastActive: '2026-03-08T09:15:00'
            },
            {
                userId: 'user_003',
                nickname: '环球旅行家',
                avatar: '🌍',
                currentPoints: 8900,
                seasonPoints: 3200,
                historyMax: 15000,
                exchangeCount: 8,
                exchangeHistory: [],
                lastActive: '2026-03-07T22:00:00'
            },
            {
                userId: 'user_004',
                nickname: '建筑大师',
                avatar: '🏗️',
                currentPoints: 18200,
                seasonPoints: 7500,
                historyMax: 20000,
                exchangeCount: 15,
                exchangeHistory: [],
                lastActive: '2026-03-08T08:45:00'
            },
            {
                userId: 'user_005',
                nickname: '挑战者',
                avatar: '⚡',
                currentPoints: 5600,
                seasonPoints: 2100,
                historyMax: 8000,
                exchangeCount: 5,
                exchangeHistory: [],
                lastActive: '2026-03-06T19:30:00'
            }
        ];
    },

    loadRules() {
        this.rules = JSON.parse(localStorage.getItem('pointsRules')) || {
            loginDaily: 10,
            completeGame: 50,
            winGame: 100,
            consecutiveWin: 200,
            climbNewTower: 500,
            shareGame: 30,
            inviteFriend: 100,
            exchangeRate: 100 // 100积分 = 1钻石
        };
    },

    filter() {
        const sort = document.getElementById('points-sort')?.value;
        
        this.filteredData = [...this.data];
        
        // 排序
        switch(sort) {
            case 'points_desc':
                this.filteredData.sort((a, b) => b.currentPoints - a.currentPoints);
                break;
            case 'points_asc':
                this.filteredData.sort((a, b) => a.currentPoints - b.currentPoints);
                break;
            case 'rank':
            default:
                this.filteredData.sort((a, b) => b.currentPoints - a.currentPoints);
                break;
        }
        
        this.currentPage = 1;
        this.render();
    },

    search() {
        const keyword = document.getElementById('points-search')?.value.toLowerCase();
        if (!keyword) {
            this.filter();
            return;
        }

        this.filteredData = this.data.filter(item => 
            item.userId.toLowerCase().includes(keyword) ||
            item.nickname.toLowerCase().includes(keyword)
        );

        this.currentPage = 1;
        this.render();
    },

    render() {
        const pagination = assetManager.paginate(this.filteredData, this.currentPage, this.pageSize);
        const tbody = document.getElementById('points-list');
        
        if (!tbody) return;

        if (pagination.data.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="8" class="empty-state">
                    <div class="empty-state-icon">📊</div>
                    <div class="empty-state-text">暂无积分数据</div>
                </td></tr>
            `;
        } else {
            const startRank = (this.currentPage - 1) * this.pageSize + 1;
            
            tbody.innerHTML = pagination.data.map((item, idx) => {
                const rank = startRank + idx;
                const rankBadge = rank <= 3 ? `<span style="font-size:20px;">${['🥇','🥈','🥉'][rank-1]}</span>` : rank;
                
                return `
                <tr data-id="${item.userId}">
                    <td style="text-align:center;font-weight:bold;">${rankBadge}</td>
                    <td>${item.userId}</td>
                    <td><span style="font-size:20px;">${item.avatar}</span> ${item.nickname}</td>
                    <td><strong style="color:#ffd700;">${item.currentPoints.toLocaleString()}</strong></td>
                    <td>${item.seasonPoints.toLocaleString()}</td>
                    <td>${item.historyMax.toLocaleString()}</td>
                    <td><button class="btn btn-sm btn-secondary" onclick="pointsManager.viewHistory('${item.userId}')">
                        查看 (${item.exchangeCount})</button></td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn action-btn-edit" onclick="pointsManager.showAdjustModal('${item.userId}')">调整</button>
                            <button class="action-btn action-btn-view" onclick="pointsManager.viewDetail('${item.userId}')">详情</button>
                        </div>
                    </td>
                </tr>
            `}).join('');
        }

        assetManager.renderPagination('points-pagination', pagination, 'pointsManager.goToPage');
    },

    goToPage(page) {
        this.currentPage = page;
        this.render();
    },

    showAdjustModal(userId = null) {
        const user = userId ? this.data.find(u => u.userId === userId) : null;
        
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'points-adjust-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>⚡</span> 调整积分</div>
                    <button class="modal-close" onclick="pointsManager.closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    ${user ? `
                        <div style="background:rgba(255,215,0,0.1);padding:15px;border-radius:8px;margin-bottom:20px;">
                            <p><strong>用户:</strong> ${user.avatar} ${user.nickname} (${user.userId})</p>
                            <p><strong>当前积分:</strong> <span style="color:#ffd700;font-size:18px;">${user.currentPoints.toLocaleString()}</span></p>
                        </div>
                    ` : `
                        <div class="form-group">
                            <label>用户ID <span class="required">*</span></label>
                            <input type="text" id="adjust-user-id" placeholder="输入用户ID">
                        </div>
                    `}
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>操作类型 <span class="required">*</span></label>
                            <select id="adjust-type" required>
                                <option value="add">增加积分</option>
                                <option value="subtract">减少积分</option>
                                <option value="set">设置为</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>积分数量 <span class="required">*</span></label>
                            <input type="number" id="adjust-amount" min="0" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>调整原因</label>
                        <input type="text" id="adjust-reason" placeholder="如：活动奖励、补偿、违规扣除...">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="pointsManager.closeModal()">取消</button>
                    <button class="btn btn-primary" onclick="pointsManager.confirmAdjust('${userId || ''}')">确认调整</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    closeModal() {
        document.getElementById('points-adjust-modal')?.remove();
    },

    confirmAdjust(userId) {
        const targetUserId = userId || document.getElementById('adjust-user-id')?.value.trim();
        const type = document.getElementById('adjust-type')?.value;
        const amount = parseInt(document.getElementById('adjust-amount')?.value) || 0;
        const reason = document.getElementById('adjust-reason')?.value.trim() || '管理员调整';

        if (!targetUserId || amount <= 0) {
            assetManager.showNotification('请填写完整信息', 'error');
            return;
        }

        const user = this.data.find(u => u.userId === targetUserId);
        if (!user) {
            assetManager.showNotification('用户不存在', 'error');
            return;
        }

        let oldPoints = user.currentPoints;
        switch(type) {
            case 'add':
                user.currentPoints += amount;
                user.seasonPoints += amount;
                break;
            case 'subtract':
                user.currentPoints = Math.max(0, user.currentPoints - amount);
                break;
            case 'set':
                user.currentPoints = amount;
                break;
        }

        // 更新历史最高
        if (user.currentPoints > user.historyMax) {
            user.historyMax = user.currentPoints;
        }

        user.lastActive = new Date().toISOString();
        this.saveData();
        this.filter();
        this.closeModal();
        
        assetManager.showNotification(
            `积分已调整: ${user.nickname} (${oldPoints} → ${user.currentPoints})`, 
            'success'
        );
    },

    showRulesModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'points-rules-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>📋</span> 积分规则配置</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background:rgba(255,215,0,0.05);padding:15px;border-radius:8px;margin-bottom:20px;">
                        <p style="color:#888;">配置用户获取积分的各项规则，修改后立即生效</p>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>每日登录</label>
                            <input type="number" id="rule-login" value="${this.rules.loginDaily}" min="0">
                        </div>
                        <div class="form-group">
                            <label>完成游戏</label>
                            <input type="number" id="rule-complete" value="${this.rules.completeGame}" min="0">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>获胜奖励</label>
                            <input type="number" id="rule-win" value="${this.rules.winGame}" min="0">
                        </div>
                        <div class="form-group">
                            <label>连胜奖励</label>
                            <input type="number" id="rule-streak" value="${this.rules.consecutiveWin}" min="0">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>攀登新塔</label>
                            <input type="number" id="rule-tower" value="${this.rules.climbNewTower}" min="0">
                        </div>
                        <div class="form-group">
                            <label>分享游戏</label>
                            <input type="number" id="rule-share" value="${this.rules.shareGame}" min="0">
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>邀请好友</label>
                            <input type="number" id="rule-invite" value="${this.rules.inviteFriend}" min="0">
                        </div>
                        <div class="form-group">
                            <label>兑换比例 (积分:钻石)</label>
                            <input type="number" id="rule-rate" value="${this.rules.exchangeRate}" min="1">
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">取消</button>
                    <button class="btn btn-primary" onclick="pointsManager.saveRules()">保存规则</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    },

    saveRules() {
        this.rules = {
            loginDaily: parseInt(document.getElementById('rule-login')?.value) || 10,
            completeGame: parseInt(document.getElementById('rule-complete')?.value) || 50,
            winGame: parseInt(document.getElementById('rule-win')?.value) || 100,
            consecutiveWin: parseInt(document.getElementById('rule-streak')?.value) || 200,
            climbNewTower: parseInt(document.getElementById('rule-tower')?.value) || 500,
            shareGame: parseInt(document.getElementById('rule-share')?.value) || 30,
            inviteFriend: parseInt(document.getElementById('rule-invite')?.value) || 100,
            exchangeRate: parseInt(document.getElementById('rule-rate')?.value) || 100
        };
        
        localStorage.setItem('pointsRules', JSON.stringify(this.rules));
        document.getElementById('points-rules-modal')?.remove();
        assetManager.showNotification('积分规则已保存', 'success');
    },

    showResetModal() {
        assetManager.confirm(
            '⚠️ 确定要进行赛季清零操作吗？\n\n这将清空所有用户的赛季积分，但保留历史最高记录。此操作不可恢复！',
            () => {
                this.data.forEach(user => {
                    user.seasonPoints = 0;
                });
                this.saveData();
                this.filter();
                assetManager.showNotification('赛季积分已清零', 'success');
            }
        );
    },

    viewHistory(userId) {
        const user = this.data.find(u => u.userId === userId);
        if (!user) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <div class="modal-title"><span>📜</span> 兑换记录 - ${user.nickname}</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="background:rgba(255,215,0,0.05);padding:15px;border-radius:8px;margin-bottom:15px;">
                        <p><strong>总兑换次数:</strong> ${user.exchangeCount}</p>
                        <p><strong>剩余积分:</strong> <span style="color:#ffd700;">${user.currentPoints.toLocaleString()}</span></p>
                    </div>
                    
                    <table class="data-table">
                        <thead>
                            <tr><th>日期</th><th>兑换物品</th><th>消耗积分</th></tr>
                        </thead>
                        <tbody>
                            ${user.exchangeHistory.length > 0 ? 
                                user.exchangeHistory.map(h => `
                                    <tr>
                                        <td>${h.date}</td>
                                        <td>${h.item}</td>
                                        <td><span style="color:#ff6b6b;">-${h.points}</span></td>
                                    </tr>
                                `).join('') : 
                                '<tr><td colspan="3" style="text-align:center;color:#888;">暂无兑换记录</td></tr>'
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    viewDetail(userId) {
        const user = this.data.find(u => u.userId === userId);
        if (!user) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <div class="modal-title"><span>👤</span> 用户详情</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="font-size:48px;">${user.avatar}</div>
                        <h3>${user.nickname}</h3>
                        <p style="color:#888;">${user.userId}</p>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                        <div style="background:rgba(255,215,0,0.1);padding:15px;border-radius:8px;text-align:center;">
                            <div style="font-size:12px;color:#888;">当前积分</div>
                            <div style="font-size:24px;font-weight:bold;color:#ffd700;">${user.currentPoints.toLocaleString()}</div>
                        </div>
                        <div style="background:rgba(0,212,255,0.1);padding:15px;border-radius:8px;text-align:center;">
                            <div style="font-size:12px;color:#888;">赛季积分</div>
                            <div style="font-size:24px;font-weight:bold;color:#00d4ff;">${user.seasonPoints.toLocaleString()}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;text-align:center;">
                            <div style="font-size:12px;color:#888;">历史最高</div>
                            <div style="font-size:20px;font-weight:bold;">${user.historyMax.toLocaleString()}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;text-align:center;">
                            <div style="font-size:12px;color:#888;">兑换次数</div>
                            <div style="font-size:20px;font-weight:bold;">${user.exchangeCount}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    saveData() {
        localStorage.setItem('userPoints', JSON.stringify(this.data));
    }
};
