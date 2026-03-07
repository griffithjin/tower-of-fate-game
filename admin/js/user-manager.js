/**
 * 用户数据管理器
 * 管理用户金币/钻石、背包物品、游戏记录、封禁操作
 */
const userManager = {
    data: [],
    filteredData: [],
    currentPage: 1,
    pageSize: 10,
    viewingUserId: null,

    init() {
        this.load();
    },

    load() {
        this.data = JSON.parse(localStorage.getItem('adminUsers')) || this.getSampleData();
        this.filteredData = [...this.data];
        this.render();
    },

    getSampleData() {
        return [
            {
                userId: 'user_001',
                nickname: '攀登者小明',
                avatar: '🧗',
                phone: '138****8888',
                email: 'xiaoming@example.com',
                gold: 12500,
                diamond: 288,
                backpack: [
                    { itemId: 'item_double_gold', count: 3 },
                    { itemId: 'item_time_freeze', count: 5 },
                    { itemId: 'item_shield', count: 2 }
                ],
                gamesPlayed: 156,
                gamesWon: 89,
                totalClimbs: 342,
                lastLogin: '2026-03-08T10:30:00',
                registerDate: '2026-01-15',
                status: 'active',
                vipLevel: 3
            },
            {
                userId: 'user_002',
                nickname: '塔王',
                avatar: '👑',
                phone: '139****6666',
                email: 'towerking@example.com',
                gold: 50000,
                diamond: 1888,
                backpack: [
                    { itemId: 'item_double_gold', count: 10 },
                    { itemId: 'item_revive', count: 3 }
                ],
                gamesPlayed: 523,
                gamesWon: 412,
                totalClimbs: 1205,
                lastLogin: '2026-03-08T09:15:00',
                registerDate: '2026-01-10',
                status: 'active',
                vipLevel: 5
            },
            {
                userId: 'user_003',
                nickname: '环球旅行家',
                avatar: '🌍',
                phone: '137****9999',
                email: 'traveler@example.com',
                gold: 5600,
                diamond: 68,
                backpack: [
                    { itemId: 'item_hint', count: 8 }
                ],
                gamesPlayed: 78,
                gamesWon: 35,
                totalClimbs: 156,
                lastLogin: '2026-03-07T22:00:00',
                registerDate: '2026-02-01',
                status: 'active',
                vipLevel: 1
            },
            {
                userId: 'user_004',
                nickname: '作弊玩家',
                avatar: '🤖',
                phone: '136****1111',
                email: 'cheater@example.com',
                gold: 999999,
                diamond: 99999,
                backpack: [],
                gamesPlayed: 10,
                gamesWon: 10,
                totalClimbs: 500,
                lastLogin: '2026-03-06T14:00:00',
                registerDate: '2026-03-01',
                status: 'banned',
                banReason: '使用外挂',
                banUntil: '2026-06-01',
                vipLevel: 0
            },
            {
                userId: 'user_005',
                nickname: '新手小白',
                avatar: '🌱',
                phone: '135****2222',
                email: 'newbie@example.com',
                gold: 500,
                diamond: 10,
                backpack: [],
                gamesPlayed: 5,
                gamesWon: 1,
                totalClimbs: 8,
                lastLogin: '2026-03-08T08:00:00',
                registerDate: '2026-03-07',
                status: 'active',
                vipLevel: 0
            }
        ];
    },

    filter() {
        const status = document.getElementById('user-status-filter')?.value;
        const timeFilter = document.getElementById('user-time-filter')?.value;
        
        this.filteredData = this.data.filter(item => {
            if (status && item.status !== status) return false;
            
            if (timeFilter) {
                const registerDate = new Date(item.registerDate);
                const now = new Date();
                switch(timeFilter) {
                    case 'today':
                        if (registerDate.toDateString() !== now.toDateString()) return false;
                        break;
                    case 'week':
                        const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
                        if (registerDate < weekAgo) return false;
                        break;
                    case 'month':
                        if (registerDate.getMonth() !== now.getMonth() || 
                            registerDate.getFullYear() !== now.getFullYear()) return false;
                        break;
                }
            }
            
            return true;
        });

        this.currentPage = 1;
        this.render();
    },

    search() {
        const keyword = document.getElementById('user-search')?.value.toLowerCase();
        if (!keyword) {
            this.filter();
            return;
        }

        this.filteredData = this.data.filter(item => 
            item.userId.toLowerCase().includes(keyword) ||
            item.nickname.toLowerCase().includes(keyword) ||
            item.phone.includes(keyword)
        );

        this.currentPage = 1;
        this.render();
    },

    render() {
        const pagination = assetManager.paginate(this.filteredData, this.currentPage, this.pageSize);
        const tbody = document.getElementById('user-list');
        
        if (!tbody) return;

        if (pagination.data.length === 0) {
            tbody.innerHTML = `
                <tr><td colspan="9" class="empty-state">
                    <div class="empty-state-icon">👤</div>
                    <div class="empty-state-text">暂无用户数据</div>
                </td></tr>
            `;
        } else {
            tbody.innerHTML = pagination.data.map(item => `
                <tr data-id="${item.userId}" class="${item.status === 'banned' ? 'banned-row' : ''}">
                    <td><input type="checkbox" value="${item.userId}"></td>
                    <td>${item.userId}</td>
                    <td><span style="font-size:20px;">${item.avatar}</span> ${item.nickname}</td>
                    <td><span class="price-gold">${item.gold.toLocaleString()} 🪙</span></td>
                    <td><span class="price-diamond">${item.diamond.toLocaleString()} 💎</span></td>
                    <td><button class="btn btn-sm btn-secondary" onclick="userManager.viewBackpack('${item.userId}')">
                        查看 (${item.backpack.length})</button></td>
                    <td>${item.gamesPlayed}场 (${Math.round(item.gamesWon/item.gamesPlayed*100)}%胜率)</td>
                    <td>${this.getStatusBadge(item)}</td>
                    <td>
                        <div class="action-btns">
                            <button class="action-btn action-btn-edit" onclick="userManager.editBalance('${item.userId}')">余额</button>
                            <button class="action-btn action-btn-view" onclick="userManager.viewDetail('${item.userId}')">详情</button>
                            ${item.status === 'banned' ? 
                                `<button class="action-btn action-btn-edit" onclick="userManager.unban('${item.userId}')">解封</button>` :
                                `<button class="action-btn action-btn-delete" onclick="userManager.ban('${item.userId}')">封禁</button>`
                            }
                        </div>
                    </td>
                </tr>
            `).join('');
        }

        assetManager.renderPagination('user-pagination', pagination, 'userManager.goToPage');
    },

    goToPage(page) {
        this.currentPage = page;
        this.render();
    },

    getStatusBadge(item) {
        if (item.status === 'banned') {
            return `<span class="tag tag-inactive">已封禁${item.banUntil ? '至' + item.banUntil.slice(0,10) : ''}</span>`;
        } else if (item.status === 'inactive') {
            return '<span class="tag" style="background:#888;">未激活</span>';
        }
        return '<span class="tag tag-active">正常</span>';
    },

    showSearchModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <div class="modal-title"><span>🔍</span> 查找用户</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>用户ID/昵称/手机号</label>
                        <input type="text" id="search-user-input" placeholder="输入关键词搜索..."
                               onkeyup="if(event.key==='Enter') userManager.doSearch()">
                    </div>
                    
                    <div id="search-results" style="max-height:300px;overflow:auto;"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="userManager.doSearch()">搜索</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    doSearch() {
        const keyword = document.getElementById('search-user-input')?.value.toLowerCase();
        if (!keyword) return;

        const results = this.data.filter(u => 
            u.userId.toLowerCase().includes(keyword) ||
            u.nickname.toLowerCase().includes(keyword) ||
            u.phone.includes(keyword)
        );

        const container = document.getElementById('search-results');
        container.innerHTML = results.map(u => `
            <div style="padding:10px;border-bottom:1px solid rgba(255,215,0,0.1);cursor:pointer;"
                 onclick="userManager.viewDetail('${u.userId}');document.querySelector('#search-results').closest('.modal-overlay').remove();">
                <div><span style="font-size:20px;">${u.avatar}</span> <strong>${u.nickname}</strong></div>
                <div style="font-size:12px;color:#888;">${u.userId} | ${u.phone}</div>
            </div>
        `).join('') || '<div style="text-align:center;color:#888;padding:20px;">未找到匹配用户</div>';
    },

    viewBackpack(userId) {
        const user = this.data.find(u => u.userId === userId);
        if (!user) return;

        const itemNames = {
            'item_double_gold': '双倍金币卡',
            'item_time_freeze': '时间冻结',
            'item_shield': '防护盾',
            'item_hint': '提示卡',
            'item_revive': '复活卡'
        };

        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <div class="modal-title"><span>🎒</span> ${user.nickname} 的背包</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${user.backpack.length > 0 ? `
                        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
                            ${user.backpack.map(item => `
                                <div style="background:rgba(255,215,0,0.05);padding:15px;border-radius:8px;">
                                    <div style="font-weight:bold;">${itemNames[item.itemId] || item.itemId}</div>
                                    <div style="color:#888;">数量: ${item.count}</div>
                                    <div style="margin-top:10px;">
                                        <button class="btn btn-sm" onclick="userManager.editItemCount('${userId}', '${item.itemId}', ${item.count})">修改</button>
                                        <button class="btn btn-sm btn-danger" onclick="userManager.removeItem('${userId}', '${item.itemId}')">删除</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        
                        <div style="margin-top:20px;text-align:center;">
                            <button class="btn btn-primary" onclick="userManager.addItem('${userId}')">➕ 添加物品</button>
                        </div>
                    ` : `
                        <div class="empty-state">
                            <div class="empty-state-icon">🎒</div>
                            <div class="empty-state-text">背包为空</div>
                            <button class="btn btn-primary" style="margin-top:15px;" onclick="userManager.addItem('${userId}')">添加物品</button>
                        </div>
                    `}
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    editBalance(userId) {
        const user = this.data.find(u => u.userId === userId);
        if (!user) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'balance-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>💰</span> 调整余额 - ${user.nickname}</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px;">
                        <div style="background:rgba(255,215,0,0.1);padding:20px;border-radius:8px;text-align:center;">
                            <div style="font-size:12px;color:#888;">当前金币</div>
                            <div style="font-size:28px;font-weight:bold;color:#ffd700;">${user.gold.toLocaleString()}</div>
                        </div>
                        <div style="background:rgba(0,212,255,0.1);padding:20px;border-radius:8px;text-align:center;">
                            <div style="font-size:12px;color:#888;">当前钻石</div>
                            <div style="font-size:28px;font-weight:bold;color:#00d4ff;">${user.diamond.toLocaleString()}</div>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label>金币调整</label>
                            <input type="number" id="adjust-gold" placeholder="+1000 或 -500">
                        </div>
                        <div class="form-group">
                            <label>钻石调整</label>
                            <input type="number" id="adjust-diamond" placeholder="+100 或 -50">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label>调整原因</label>
                        <input type="text" id="adjust-reason" placeholder="如：充值、活动奖励、补偿...">
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">取消</button>
                    <button class="btn btn-primary" onclick="userManager.confirmBalanceAdjust('${userId}')">确认调整</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    confirmBalanceAdjust(userId) {
        const goldAdjust = parseInt(document.getElementById('adjust-gold')?.value) || 0;
        const diamondAdjust = parseInt(document.getElementById('adjust-diamond')?.value) || 0;
        const reason = document.getElementById('adjust-reason')?.value.trim();

        if (goldAdjust === 0 && diamondAdjust === 0) {
            assetManager.showNotification('请输入调整数值', 'error');
            return;
        }

        const user = this.data.find(u => u.userId === userId);
        if (!user) return;

        const oldGold = user.gold;
        const oldDiamond = user.diamond;

        user.gold = Math.max(0, user.gold + goldAdjust);
        user.diamond = Math.max(0, user.diamond + diamondAdjust);

        this.saveData();
        this.filter();
        document.getElementById('balance-modal')?.remove();

        assetManager.showNotification(
            `余额调整成功！金币: ${oldGold}→${user.gold}, 钻石: ${oldDiamond}→${user.diamond}`,
            'success'
        );
    },

    ban(userId) {
        const user = this.data.find(u => u.userId === userId);
        if (!user) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.id = 'ban-modal';
        modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <div class="modal-title"><span>🚫</span> 封禁用户 - ${user.nickname}</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>封禁原因 <span class="required">*</span></label>
                        <select id="ban-reason">
                            <option value="">请选择</option>
                            <option value="使用外挂">使用外挂</option>
                            <option value="恶意刷分">恶意刷分</option>
                            <option value="辱骂他人">辱骂他人</option>
                            <option value="发布违规内容">发布违规内容</option>
                            <option value="其他">其他</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>封禁时长</label>
                        <select id="ban-duration">
                            <option value="1">1天</option>
                            <option value="3">3天</option>
                            <option value="7">7天</option>
                            <option value="30">30天</option>
                            <option value="90">90天</option>
                            <option value="permanent">永久</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label>备注说明</label>
                        <textarea id="ban-note" rows="3" placeholder="详细说明封禁原因..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">取消</button>
                    <button class="btn btn-danger" onclick="userManager.confirmBan('${userId}')">确认封禁</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    confirmBan(userId) {
        const reason = document.getElementById('ban-reason')?.value;
        const duration = document.getElementById('ban-duration')?.value;
        const note = document.getElementById('ban-note')?.value.trim();

        if (!reason) {
            assetManager.showNotification('请选择封禁原因', 'error');
            return;
        }

        const user = this.data.find(u => u.userId === userId);
        if (!user) return;

        user.status = 'banned';
        user.banReason = reason;
        user.banNote = note;
        
        if (duration !== 'permanent') {
            const date = new Date();
            date.setDate(date.getDate() + parseInt(duration));
            user.banUntil = date.toISOString();
        } else {
            user.banUntil = null;
        }

        this.saveData();
        this.filter();
        document.getElementById('ban-modal')?.remove();

        assetManager.showNotification(`用户 ${user.nickname} 已被封禁`, 'success');
    },

    unban(userId) {
        const user = this.data.find(u => u.userId === userId);
        if (!user) return;

        assetManager.confirm(`确定要解封用户 ${user.nickname} 吗？`, () => {
            user.status = 'active';
            delete user.banReason;
            delete user.banUntil;
            delete user.banNote;
            
            this.saveData();
            this.filter();
            assetManager.showNotification(`用户 ${user.nickname} 已解封`, 'success');
        });
    },

    viewDetail(userId) {
        const user = this.data.find(u => u.userId === userId);
        if (!user) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay show';
        modal.innerHTML = `
            <div class="modal" style="max-width: 600px;">
                <div class="modal-header">
                    <div class="modal-title"><span>👤</span> 用户详情</div>
                    <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div style="text-align:center;margin-bottom:20px;">
                        <div style="font-size:64px;">${user.avatar}</div>
                        <h2>${user.nickname}</h2>
                        <p style="color:#888;">${user.userId}</p>
                        ${user.vipLevel > 0 ? `<span style="background:linear-gradient(90deg,#ffd700,#ffaa00);color:#000;padding:4px 12px;border-radius:12px;font-size:12px;font-weight:bold;">VIP${user.vipLevel}</span>` : ''}
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:20px;">
                        <div style="background:rgba(255,215,0,0.1);padding:15px;border-radius:8px;text-align:center;">
                            <div style="font-size:12px;color:#888;">金币</div>
                            <div style="font-size:20px;font-weight:bold;color:#ffd700;">${user.gold.toLocaleString()}</div>
                        </div>
                        <div style="background:rgba(0,212,255,0.1);padding:15px;border-radius:8px;text-align:center;">
                            <div style="font-size:12px;color:#888;">钻石</div>
                            <div style="font-size:20px;font-weight:bold;color:#00d4ff;">${user.diamond.toLocaleString()}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;text-align:center;">
                            <div style="font-size:12px;color:#888;">游戏场次</div>
                            <div style="font-size:20px;font-weight:bold;">${user.gamesPlayed}</div>
                        </div>
                        <div style="background:rgba(255,255,255,0.05);padding:15px;border-radius:8px;text-align:center;">
                            <div style="font-size:12px;color:#888;">胜率</div>
                            <div style="font-size:20px;font-weight:bold;">${Math.round(user.gamesWon/user.gamesPlayed*100)}%</div>
                        </div>
                    </div>
                    
                    <div style="background:rgba(0,0,0,0.2);padding:15px;border-radius:8px;">
                        <p><strong>手机:</strong> ${user.phone}</p>
                        <p><strong>邮箱:</strong> ${user.email}</p>
                        <p><strong>注册时间:</strong> ${user.registerDate}</p>
                        <p><strong>最后登录:</strong> ${assetManager.formatDate(user.lastLogin)}</p>
                        ${user.status === 'banned' ? `
                            <p style="color:#ff4444;"><strong>封禁原因:</strong> ${user.banReason}</p>
                            ${user.banUntil ? `<p style="color:#ff4444;"><strong>解封时间:</strong> ${user.banUntil.slice(0,10)}</p>` : ''}
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    },

    saveData() {
        localStorage.setItem('adminUsers', JSON.stringify(this.data));
    }
};
