/**
 * 资产管理器核心
 * 负责模块切换、权限管理、通用功能
 */
const assetManager = {
    currentUser: null,
    currentModule: 'towers',
    permissions: {
        admin: ['view', 'create', 'edit', 'delete', 'export', 'import'],
        operator: ['view', 'create', 'edit', 'export'],
        outsourced: ['view', 'create']
    },

    init() {
        this.loadUser();
        this.bindEvents();
        this.initModules();
    },

    loadUser() {
        // 从localStorage或API获取用户信息
        this.currentUser = JSON.parse(localStorage.getItem('adminUser')) || {
            name: '超级管理员',
            role: 'admin',
            permissions: this.permissions.admin
        };
        this.updateUI();
    },

    updateUI() {
        document.getElementById('admin-name').textContent = this.currentUser.name;
        const roleBadge = document.getElementById('admin-role');
        roleBadge.textContent = this.currentUser.role.toUpperCase();
        roleBadge.className = `permission-badge permission-${this.currentUser.role}`;
    },

    bindEvents() {
        // 导航切换
        document.querySelectorAll('.nav-item[data-module]').forEach(item => {
            item.addEventListener('click', () => {
                const module = item.dataset.module;
                this.switchModule(module);
            });
        });
    },

    switchModule(module) {
        if (module === 'settings') {
            this.showSettings();
            return;
        }

        this.currentModule = module;

        // 更新导航
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.nav-item[data-module="${module}"]`).classList.add('active');

        // 更新内容区
        document.querySelectorAll('.module-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`module-${module}`).classList.add('active');

        // 更新标题
        const titles = {
            towers: { icon: '🗼', text: '塔模型管理' },
            avatars: { icon: '🎭', text: '头像管理' },
            items: { icon: '🎒', text: '道具管理' },
            shop: { icon: '🛒', text: '商城商品管理' },
            tournaments: { icon: '🏆', text: '锦标赛配置管理' }
        };
        const title = titles[module];
        if (title) {
            document.getElementById('page-icon').textContent = title.icon;
            document.getElementById('page-title').textContent = title.text;
        }

        // 加载模块数据
        this.loadModuleData(module);
    },

    loadModuleData(module) {
        switch(module) {
            case 'towers':
                towerManager.load();
                break;
            case 'avatars':
                avatarManager.load();
                break;
            case 'items':
                itemManager.load();
                break;
            case 'shop':
                shopManager.load();
                break;
            case 'tournaments':
                tournamentManager.load();
                break;
        }
    },

    initModules() {
        // 初始化各个管理器
        if (typeof towerManager !== 'undefined') towerManager.init();
        if (typeof avatarManager !== 'undefined') avatarManager.init();
        if (typeof itemManager !== 'undefined') itemManager.init();
        if (typeof shopManager !== 'undefined') shopManager.init();
        if (typeof tournamentManager !== 'undefined') tournamentManager.init();
    },

    hasPermission(action) {
        return this.currentUser && 
               this.currentUser.permissions && 
               this.currentUser.permissions.includes(action);
    },

    checkPermission(action) {
        if (!this.hasPermission(action)) {
            this.showNotification('您没有权限执行此操作', 'error');
            return false;
        }
        return true;
    },

    showNotification(message, type = 'info', duration = 3000) {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        // 触发动画
        setTimeout(() => notification.classList.add('show'), 10);
        
        // 自动关闭
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    showLoading() {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        overlay.id = 'global-loading';
        document.body.appendChild(overlay);
    },

    hideLoading() {
        const overlay = document.getElementById('global-loading');
        if (overlay) overlay.remove();
    },

    confirm(message, onConfirm, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay confirm-modal show';
        modal.innerHTML = `
            <div class="modal" style="max-width: 400px;">
                <div class="modal-body">
                    <div class="confirm-icon">⚠️</div>
                    <div class="confirm-text">${message}</div>
                </div>
                <div class="modal-footer" style="justify-content: center;">
                    <button class="btn btn-secondary" id="confirm-cancel">取消</button>
                    <button class="btn btn-danger" id="confirm-ok">确认</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#confirm-cancel').addEventListener('click', () => {
            modal.remove();
            if (onCancel) onCancel();
        });
        
        modal.querySelector('#confirm-ok').addEventListener('click', () => {
            modal.remove();
            if (onConfirm) onConfirm();
        });
    },

    logout() {
        this.confirm('确定要退出登录吗？', () => {
            localStorage.removeItem('adminUser');
            localStorage.removeItem('adminToken');
            window.location.href = 'index.html';
        });
    },

    showSettings() {
        this.showNotification('系统设置功能开发中...', 'info');
    },

    showLogs() {
        this.showNotification('操作日志功能开发中...', 'info');
    },

    // 分页工具函数
    paginate(data, page, pageSize = 10) {
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        return {
            data: data.slice(start, end),
            total: data.length,
            totalPages: Math.ceil(data.length / pageSize),
            currentPage: page
        };
    },

    renderPagination(containerId, pagination, onPageChange) {
        const container = document.getElementById(containerId);
        if (!container || pagination.totalPages <= 1) {
            if (container) container.innerHTML = '';
            return;
        }

        let html = `
            <button class="pagination-btn" ${pagination.currentPage === 1 ? 'disabled' : ''} 
                    onclick="${onPageChange}(${pagination.currentPage - 1})">◀</button>
        `;

        for (let i = 1; i <= pagination.totalPages; i++) {
            if (i === 1 || i === pagination.totalPages || 
                (i >= pagination.currentPage - 2 && i <= pagination.currentPage + 2)) {
                html += `
                    <button class="pagination-btn ${i === pagination.currentPage ? 'active' : ''}" 
                            onclick="${onPageChange}(${i})">${i}</button>
                `;
            } else if (i === pagination.currentPage - 3 || i === pagination.currentPage + 3) {
                html += '<span>...</span>';
            }
        }

        html += `
            <button class="pagination-btn" ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''} 
                    onclick="${onPageChange}(${pagination.currentPage + 1})">▶</button>
            <span class="pagination-info">共 ${pagination.total} 条</span>
        `;

        container.innerHTML = html;
    },

    // 生成唯一ID
    generateId(prefix) {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // 格式化日期
    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // 导出JSON
    exportJSON(data, filename) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    assetManager.init();
});
