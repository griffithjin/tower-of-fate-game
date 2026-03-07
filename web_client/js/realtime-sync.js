/**
 * RealtimeSync - 前端实时同步系统
 * 监听WebSocket事件并更新游戏资产
 */

class RealtimeSync {
  constructor(options = {}) {
    this.socket = null;
    this.adminSocket = null;
    this.isConnected = false;
    this.isAdmin = false;
    this.eventHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    
    // 配置
    this.options = {
      serverUrl: options.serverUrl || window.location.origin,
      autoConnect: options.autoConnect !== false,
      userId: options.userId || null,
      token: options.token || null,
      role: options.role || 'player',
      onConnect: options.onConnect || null,
      onDisconnect: options.onDisconnect || null,
      onError: options.onError || null
    };
    
    // 系统引用（用于回调）
    this.systems = {
      tower3D: null,
      postcardSystem: null,
      avatarSelector: null,
      shopSystem: null,
      effectSystem: null,
      i18n: null
    };
    
    if (this.options.autoConnect) {
      this.connect();
    }
  }
  
  // 连接服务器
  connect() {
    if (typeof io === 'undefined') {
      console.error('[RealtimeSync] Socket.io 未加载');
      return;
    }
    
    // 连接到主命名空间
    this.socket = io(this.options.serverUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    });
    
    this.setupBaseListeners();
    this.setupAssetListeners();
    
    // 如果是管理员，连接到管理命名空间
    if (this.options.role === 'admin') {
      this.connectAdmin();
    }
  }
  
  // 连接管理员命名空间
  connectAdmin() {
    this.adminSocket = io(`${this.options.serverUrl}/admin`, {
      transports: ['websocket', 'polling']
    });
    
    this.adminSocket.on('connect', () => {
      console.log('[RealtimeSync] 管理员连接成功');
      
      // 发送认证信息
      this.adminSocket.emit('authenticate', {
        userId: this.options.userId,
        token: this.options.token,
        role: this.options.role
      });
    });
    
    this.adminSocket.on('authenticated', (response) => {
      if (response.success) {
        this.isAdmin = true;
        console.log('[RealtimeSync] 管理员认证成功');
      } else {
        console.error('[RealtimeSync] 管理员认证失败:', response.message);
      }
    });
    
    this.setupAdminListeners();
  }
  
  // 基础连接监听器
  setupBaseListeners() {
    this.socket.on('connect', () => {
      console.log('[RealtimeSync] 连接成功');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // 认证
      if (this.options.userId) {
        this.socket.emit('authenticate', {
          userId: this.options.userId,
          token: this.options.token
        });
      }
      
      if (this.options.onConnect) {
        this.options.onConnect();
      }
    });
    
    this.socket.on('disconnect', (reason) => {
      console.log('[RealtimeSync] 断开连接:', reason);
      this.isConnected = false;
      
      if (this.options.onDisconnect) {
        this.options.onDisconnect(reason);
      }
    });
    
    this.socket.on('connect_error', (error) => {
      console.error('[RealtimeSync] 连接错误:', error);
      this.reconnectAttempts++;
      
      if (this.options.onError) {
        this.options.onError(error);
      }
    });
    
    this.socket.on('authenticated', (response) => {
      if (response.success) {
        console.log('[RealtimeSync] 认证成功');
      }
    });
  }
  
  // 资产事件监听器
  setupAssetListeners() {
    // ==================== 塔模型事件 ====================
    
    this.socket.on('tower:created', (data) => {
      console.log('[RealtimeSync] 新塔创建:', data);
      
      if (this.systems.tower3D) {
        this.systems.tower3D.addTower(data);
      }
      
      this.showNotification('tower', '新塔模型', data.name);
      this.emit('tower:created', data);
    });
    
    this.socket.on('tower:updated', (data) => {
      console.log('[RealtimeSync] 塔配置更新:', data);
      
      if (this.systems.tower3D) {
        this.systems.tower3D.updateTowerConfig(data.id, data.config);
      }
      
      this.showNotification('tower', '塔模型更新', data.name);
      this.emit('tower:updated', data);
    });
    
    this.socket.on('tower:deleted', (data) => {
      console.log('[RealtimeSync] 塔删除:', data);
      
      if (this.systems.tower3D) {
        this.systems.tower3D.removeTower(data.id);
      }
      
      this.showNotification('tower', '塔模型删除', data.id);
      this.emit('tower:deleted', data);
    });
    
    // ==================== 明信片事件 ====================
    
    this.socket.on('postcard:created', (data) => {
      console.log('[RealtimeSync] 新明信片:', data);
      
      if (this.systems.postcardSystem) {
        this.systems.postcardSystem.addPostcard(data);
      }
      
      this.showNotification('postcard', '新明信片', data.name);
      this.emit('postcard:created', data);
    });
    
    this.socket.on('postcard:updated', (data) => {
      console.log('[RealtimeSync] 明信片更新:', data);
      
      if (this.systems.postcardSystem) {
        this.systems.postcardSystem.updatePostcard(data.id, data.data);
      }
      
      this.showNotification('postcard', '明信片更新', data.name);
      this.emit('postcard:updated', data);
    });
    
    this.socket.on('postcard:blessingUpdated', (data) => {
      console.log('[RealtimeSync] 祝福语录更新:', data);
      
      if (this.systems.postcardSystem) {
        this.systems.postcardSystem.updateBlessings(data.id, data.language, data.blessings);
      }
      
      this.showNotification('postcard', '祝福语录更新', data.id);
      this.emit('postcard:blessingUpdated', data);
    });
    
    // ==================== 头像事件 ====================
    
    this.socket.on('avatar:created', (data) => {
      console.log('[RealtimeSync] 新头像:', data);
      
      if (this.systems.avatarSelector) {
        this.systems.avatarSelector.addAvatarOption(data);
      }
      
      if (this.systems.shopSystem) {
        this.systems.shopSystem.addShopItem('avatar', data);
      }
      
      this.showNotification('avatar', '新头像', data.name);
      this.emit('avatar:created', data);
    });
    
    this.socket.on('avatar:updated', (data) => {
      console.log('[RealtimeSync] 头像更新:', data);
      
      if (this.systems.shopSystem) {
        this.systems.shopSystem.updateShopItem('avatar', data.id, data.data);
      }
      
      this.showNotification('avatar', '头像更新', data.name);
      this.emit('avatar:updated', data);
    });
    
    // ==================== 特效道具事件 ====================
    
    this.socket.on('effect:created', (data) => {
      console.log('[RealtimeSync] 新特效:', data);
      
      if (this.systems.effectSystem) {
        this.systems.effectSystem.registerEffect(data.id, data.model3D);
      }
      
      if (this.systems.shopSystem) {
        this.systems.shopSystem.addShopItem('effect', data);
      }
      
      this.showNotification('effect', '新特效', data.name);
      this.emit('effect:created', data);
    });
    
    this.socket.on('effect:updated', (data) => {
      console.log('[RealtimeSync] 特效更新:', data);
      
      if (this.systems.effectSystem) {
        this.systems.effectSystem.updateEffect(data.id, data.data);
      }
      
      if (this.systems.shopSystem) {
        this.systems.shopSystem.updateShopItem('effect', data.id, data.data);
      }
      
      this.showNotification('effect', '特效更新', data.name);
      this.emit('effect:updated', data);
    });
    
    this.socket.on('effect:priceChanged', (data) => {
      console.log('[RealtimeSync] 价格变动:', data);
      
      if (this.systems.shopSystem) {
        this.systems.shopSystem.updatePrice(data.id, data.newPrice, data.currency);
      }
      
      // 如果用户正在浏览该商品，显示价格变动提示
      if (this.currentViewingItem === data.id) {
        this.showPriceChangeNotification(data);
      }
      
      this.emit('effect:priceChanged', data);
    });
    
    // ==================== 多语言事件 ====================
    
    this.socket.on('translation:updated', (data) => {
      console.log('[RealtimeSync] 翻译更新:', data);
      
      if (this.systems.i18n) {
        this.systems.i18n.updateTranslation(data.locale, data.key, data.value);
      }
      
      this.emit('translation:updated', data);
    });
  }
  
  // 管理员事件监听器
  setupAdminListeners() {
    if (!this.adminSocket) return;
    
    // 塔模型管理事件
    this.adminSocket.on('tower:list', (response) => {
      this.emit('admin:tower:list', response);
    });
    
    this.adminSocket.on('tower:createResponse', (response) => {
      this.emit('admin:tower:create', response);
    });
    
    this.adminSocket.on('tower:updateResponse', (response) => {
      this.emit('admin:tower:update', response);
    });
    
    // 明信片管理事件
    this.adminSocket.on('postcard:list', (response) => {
      this.emit('admin:postcard:list', response);
    });
    
    this.adminSocket.on('postcard:createResponse', (response) => {
      this.emit('admin:postcard:create', response);
    });
    
    // 头像管理事件
    this.adminSocket.on('avatar:list', (response) => {
      this.emit('admin:avatar:list', response);
    });
    
    this.adminSocket.on('avatar:createResponse', (response) => {
      this.emit('admin:avatar:create', response);
    });
    
    // 特效管理事件
    this.adminSocket.on('effect:list', (response) => {
      this.emit('admin:effect:list', response);
    });
    
    this.adminSocket.on('effect:createResponse', (response) => {
      this.emit('admin:effect:create', response);
    });
    
    this.adminSocket.on('effect:updatePriceResponse', (response) => {
      this.emit('admin:effect:updatePrice', response);
    });
    
    // 统计信息
    this.adminSocket.on('stats:data', (response) => {
      this.emit('admin:stats', response);
    });
  }
  
  // ==================== 公共方法 ====================
  
  // 注册系统引用
  registerSystem(name, system) {
    if (this.systems.hasOwnProperty(name)) {
      this.systems[name] = system;
      console.log(`[RealtimeSync] 系统已注册: ${name}`);
    }
  }
  
  // 发送管理员命令
  adminEmit(event, data) {
    if (this.adminSocket && this.isAdmin) {
      this.adminSocket.emit(event, data);
      return true;
    }
    return false;
  }
  
  // 获取统计数据（管理员）
  fetchStats() {
    return this.adminEmit('stats:get');
  }
  
  // 获取资产列表（管理员）
  fetchAssets(type) {
    const eventMap = {
      towers: 'tower:getAll',
      postcards: 'postcard:getAll',
      avatars: 'avatar:getAll',
      effects: 'effect:getAll'
    };
    
    if (eventMap[type]) {
      return this.adminEmit(eventMap[type]);
    }
    return false;
  }
  
  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.adminSocket) {
      this.adminSocket.disconnect();
    }
  }
  
  // ==================== 事件系统 ====================
  
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }
  
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  emit(event, data) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[RealtimeSync] 事件处理错误: ${event}`, error);
        }
      });
    }
  }
  
  // ==================== UI 通知 ====================
  
  showNotification(type, title, message) {
    // 检查通知权限
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: this.getIconForType(type)
      });
    }
    
    // 显示游戏内通知
    this.showInGameNotification(type, title, message);
  }
  
  showInGameNotification(type, title, message) {
    // 创建游戏内通知元素
    const notification = document.createElement('div');
    notification.className = `realtime-update-toast ${type}`;
    notification.innerHTML = `
      <div class="toast-icon">${this.getIconForType(type)}</div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
    `;
    
    // 添加到页面
    let container = document.getElementById('realtime-notifications');
    if (!container) {
      container = document.createElement('div');
      container.id = 'realtime-notifications';
      container.className = 'realtime-notifications-container';
      document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // 3秒后自动消失
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }
  
  showPriceChangeNotification(data) {
    const isIncrease = data.newPrice > data.oldPrice;
    const symbol = isIncrease ? '📈' : '📉';
    
    const notification = document.createElement('div');
    notification.className = 'realtime-update-toast price-change';
    notification.innerHTML = `
      <div class="toast-icon">${symbol}</div>
      <div class="toast-content">
        <div class="toast-title">价格变动</div>
        <div class="toast-message">
          ${data.name}: ${data.oldPrice} → ${data.newPrice} ${data.currency}
        </div>
      </div>
    `;
    
    let container = document.getElementById('realtime-notifications');
    if (container) {
      container.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
      }, 5000);
    }
  }
  
  getIconForType(type) {
    const icons = {
      tower: '🏰',
      postcard: '📮',
      avatar: '👤',
      effect: '✨',
      default: '🔄'
    };
    return icons[type] || icons.default;
  }
  
  // 设置当前浏览的商品（用于价格变动提示）
  setCurrentViewingItem(itemId) {
    this.currentViewingItem = itemId;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RealtimeSync;
}

// 全局暴露
if (typeof window !== 'undefined') {
  window.RealtimeSync = RealtimeSync;
}
