/**
 * Allegro Realtime Sync - 初始化脚本
 * 将所有资产与后台管理系统实时绑定
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔄 [Allegro Realtime] 初始化实时同步系统...');
  
  // 检查依赖
  if (typeof RealtimeSync === 'undefined') {
    console.error('❌ [Allegro Realtime] RealtimeSync 未加载');
    return;
  }
  
  // 初始化实时同步实例
  const realtimeSync = new RealtimeSync({
    serverUrl: window.location.origin,
    userId: window.currentUser?.id || 'guest',
    token: window.currentUser?.token || null,
    role: window.currentUser?.role || 'player',
    autoConnect: true,
    onConnect: () => {
      console.log('✅ [Allegro Realtime] 已连接到实时服务器');
    },
    onDisconnect: (reason) => {
      console.log('⚠️ [Allegro Realtime] 连接断开:', reason);
    },
    onError: (error) => {
      console.error('❌ [Allegro Realtime] 连接错误:', error);
    }
  });
  
  // 注册系统引用
  if (typeof window.tower3DSystem !== 'undefined') {
    realtimeSync.registerSystem('tower3D', window.tower3DSystem);
  }
  
  if (typeof window.postcardSystem !== 'undefined') {
    realtimeSync.registerSystem('postcardSystem', window.postcardSystem);
  }
  
  if (typeof window.avatarSelector !== 'undefined') {
    realtimeSync.registerSystem('avatarSelector', window.avatarSelector);
  }
  
  if (typeof window.shopSystem !== 'undefined') {
    realtimeSync.registerSystem('shopSystem', window.shopSystem);
  }
  
  if (typeof window.effectSystem !== 'undefined') {
    realtimeSync.registerSystem('effectSystem', window.effectSystem);
  }
  
  if (typeof window.i18n !== 'undefined') {
    realtimeSync.registerSystem('i18n', window.i18n);
  }
  
  // 全局暴露
  window.realtimeSync = realtimeSync;
  
  // 请求通知权限
  if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
    Notification.requestPermission();
  }
  
  console.log('✅ [Allegro Realtime] 实时同步系统初始化完成');
});

/**
 * 初始化 Tower3DSystem
 * 在游戏3D场景加载完成后调用
 */
function initTower3DSystem(scene, loader) {
  if (typeof Tower3DSystem === 'undefined') {
    console.error('❌ Tower3DSystem 未加载');
    return;
  }
  
  const tower3DSystem = new Tower3DSystem({
    scene: scene,
    loader: loader,
    onUpdate: (tower) => {
      console.log('[Tower3D] 塔更新:', tower.name || tower.id);
      // 触发UI更新
      if (window.onTowerUpdated) {
        window.onTowerUpdated(tower);
      }
    },
    onAdd: (tower) => {
      console.log('[Tower3D] 新塔添加:', tower.name || tower.id);
      if (window.onTowerAdded) {
        window.onTowerAdded(tower);
      }
    },
    onRemove: (tower) => {
      console.log('[Tower3D] 塔移除:', tower.name || tower.id);
      if (window.onTowerRemoved) {
        window.onTowerRemoved(tower);
      }
    }
  });
  
  window.tower3DSystem = tower3DSystem;
  
  // 如果realtimeSync已存在，注册系统
  if (window.realtimeSync) {
    window.realtimeSync.registerSystem('tower3D', tower3DSystem);
  }
  
  return tower3DSystem;
}

/**
 * 初始化 PostcardSystem
 */
function initPostcardSystem() {
  const postcardSystem = {
    postcards: new Map(),
    
    addPostcard(data) {
      this.postcards.set(data.id, data);
      this.onAdd?.(data);
    },
    
    updatePostcard(id, data) {
      const postcard = this.postcards.get(id);
      if (postcard) {
        Object.assign(postcard, data);
        this.onUpdate?.(postcard);
      }
    },
    
    updateBlessings(id, language, texts) {
      const postcard = this.postcards.get(id);
      if (postcard) {
        postcard.blessings = postcard.blessings || {};
        postcard.blessings[language] = texts;
        this.onBlessingsUpdate?.(id, language, texts);
      }
    },
    
    getPostcard(id) {
      return this.postcards.get(id);
    },
    
    getAllPostcards() {
      return [...this.postcards.values()];
    }
  };
  
  window.postcardSystem = postcardSystem;
  
  if (window.realtimeSync) {
    window.realtimeSync.registerSystem('postcardSystem', postcardSystem);
  }
  
  return postcardSystem;
}

/**
 * 初始化 ShopSystem
 */
function initShopSystem() {
  const shopSystem = {
    items: {
      avatar: new Map(),
      effect: new Map()
    },
    
    addShopItem(type, data) {
      if (this.items[type]) {
        this.items[type].set(data.id, data);
        this.onItemAdd?.(type, data);
      }
    },
    
    updateShopItem(type, id, data) {
      if (this.items[type]) {
        const item = this.items[type].get(id);
        if (item) {
          Object.assign(item, data);
          this.onItemUpdate?.(type, item);
        }
      }
    },
    
    updatePrice(id, price, currency) {
      for (const type of Object.keys(this.items)) {
        const item = this.items[type].get(id);
        if (item) {
          const oldPrice = item.pricing?.amount;
          item.pricing = item.pricing || {};
          item.pricing.amount = price;
          if (currency) item.pricing.currency = currency;
          
          this.onPriceChange?.(id, oldPrice, price, currency);
          break;
        }
      }
    },
    
    getItem(type, id) {
      return this.items[type]?.get(id);
    },
    
    getAllItems(type) {
      return this.items[type] ? [...this.items[type].values()] : [];
    }
  };
  
  window.shopSystem = shopSystem;
  
  if (window.realtimeSync) {
    window.realtimeSync.registerSystem('shopSystem', shopSystem);
  }
  
  return shopSystem;
}

/**
 * 初始化 AvatarSelector
 */
function initAvatarSelector() {
  const avatarSelector = {
    avatars: new Map(),
    currentAvatar: null,
    
    addAvatarOption(data) {
      this.avatars.set(data.id, data);
      this.onAvatarAdd?.(data);
    },
    
    selectAvatar(id) {
      const avatar = this.avatars.get(id);
      if (avatar) {
        this.currentAvatar = avatar;
        this.onSelect?.(avatar);
      }
    },
    
    getAvatar(id) {
      return this.avatars.get(id);
    },
    
    getAllAvatars() {
      return [...this.avatars.values()];
    }
  };
  
  window.avatarSelector = avatarSelector;
  
  if (window.realtimeSync) {
    window.realtimeSync.registerSystem('avatarSelector', avatarSelector);
  }
  
  return avatarSelector;
}

/**
 * 初始化 EffectSystem
 */
function initEffectSystem() {
  const effectSystem = {
    effects: new Map(),
    activeEffects: new Set(),
    
    registerEffect(id, model3D) {
      this.effects.set(id, { id, model3D });
      this.onRegister?.(id, model3D);
    },
    
    updateEffect(id, data) {
      const effect = this.effects.get(id);
      if (effect) {
        Object.assign(effect, data);
        this.onUpdate?.(effect);
      }
    },
    
    activateEffect(id) {
      if (this.effects.has(id)) {
        this.activeEffects.add(id);
        this.onActivate?.(id);
      }
    },
    
    deactivateEffect(id) {
      this.activeEffects.delete(id);
      this.onDeactivate?.(id);
    },
    
    getEffect(id) {
      return this.effects.get(id);
    },
    
    getAllEffects() {
      return [...this.effects.values()];
    }
  };
  
  window.effectSystem = effectSystem;
  
  if (window.realtimeSync) {
    window.realtimeSync.registerSystem('effectSystem', effectSystem);
  }
  
  return effectSystem;
}

/**
 * 初始化 I18n 系统
 */
function initI18nSystem(defaultLocale = 'zh') {
  const i18n = {
    locale: defaultLocale,
    translations: {},
    
    setLocale(locale) {
      this.locale = locale;
      this.updatePageLanguage();
      this.onLocaleChange?.(locale);
    },
    
    updateTranslation(locale, key, value) {
      if (!this.translations[locale]) {
        this.translations[locale] = {};
      }
      this.translations[locale][key] = value;
      
      // 如果当前语言被更新，刷新页面
      if (locale === this.locale) {
        this.updatePageLanguage();
      }
      
      this.onTranslationUpdate?.(locale, key, value);
    },
    
    t(key, fallback = '') {
      return this.translations[this.locale]?.[key] || fallback || key;
    },
    
    updatePageLanguage() {
      // 更新所有带有 data-i18n 属性的元素
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const translation = this.t(key);
        if (translation !== key) {
          el.textContent = translation;
        }
      });
      
      this.onPageUpdate?.(this.locale);
    }
  };
  
  window.i18n = i18n;
  
  if (window.realtimeSync) {
    window.realtimeSync.registerSystem('i18n', i18n);
  }
  
  return i18n;
}

// 暴露初始化函数
window.initTower3DSystem = initTower3DSystem;
window.initPostcardSystem = initPostcardSystem;
window.initShopSystem = initShopSystem;
window.initAvatarSelector = initAvatarSelector;
window.initEffectSystem = initEffectSystem;
window.initI18nSystem = initI18nSystem;

console.log('📦 [Allegro Realtime] 初始化脚本已加载');
