/**
 * 命运塔 - 3D特效装备系统
 * Tower of Fate - 3D Effect Equipment System
 * 管理玩家装备的特效道具
 */

// ============================================
// 用户特效背包数据结构
// ============================================

const DEFAULT_USER_INVENTORY = {
    // 当前装备的特效
    effects: {
        rise: null,      // 上升特效 (cloud, rocket)
        fall: null,      // 下降特效 (parachute, feather)
        provoke: null    // 守卫激怒特效 (laser, thunder)
    },
    // 已拥有的特效列表
    ownedEffects: [],
    // 特效偏好设置
    preferences: {
        autoEquip: true,
        showEffects: true,
        particleDensity: 'medium' // low, medium, high
    }
};

// ============================================
// 特效装备管理器
// ============================================

class EffectEquipmentManager {
    constructor() {
        this.inventory = this.loadInventory();
        this.effectDefinitions = this.initializeEffectDefinitions();
        this.equippedEffects = new Map(); // 当前已加载的3D效果
        this.listeners = [];
    }

    // ============================================
    // 本地存储
    // ============================================

    loadInventory() {
        try {
            const saved = localStorage.getItem('tower_effect_inventory');
            if (saved) {
                return { ...DEFAULT_USER_INVENTORY, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('加载特效背包失败:', e);
        }
        return { ...DEFAULT_USER_INVENTORY };
    }

    saveInventory() {
        try {
            localStorage.setItem('tower_effect_inventory', JSON.stringify(this.inventory));
        } catch (e) {
            console.warn('保存特效背包失败:', e);
        }
    }

    // ============================================
    // 特效定义初始化
    // ============================================

    initializeEffectDefinitions() {
        return {
            // 上升特效
            cloud: {
                id: 'cloud',
                name: '筋斗云',
                description: '乘坐筋斗云上升，仙气飘飘',
                category: 'effect',
                subCategory: 'rise',
                rarity: 'epic',
                price: { diamond: 188 },
                icon: '☁️',
                preview: 'effects/preview-cloud.gif',
                available: true,
                stats: {
                    popularity: 95,
                    satisfaction: 4.8
                }
            },
            rocket: {
                id: 'rocket',
                name: '火箭背包',
                description: '喷射火焰，快速上升',
                category: 'effect',
                subCategory: 'rise',
                rarity: 'legendary',
                price: { diamond: 288 },
                icon: '🚀',
                preview: 'effects/preview-rocket.gif',
                available: true,
                stats: {
                    popularity: 92,
                    satisfaction: 4.9
                }
            },
            // 下降特效
            parachute: {
                id: 'parachute',
                name: '神奇降落伞',
                description: '缓慢飘落，旋转下降',
                category: 'effect',
                subCategory: 'fall',
                rarity: 'rare',
                price: { diamond: 128 },
                icon: '🪂',
                preview: 'effects/preview-parachute.gif',
                available: true,
                stats: {
                    popularity: 78,
                    satisfaction: 4.5
                }
            },
            feather: {
                id: 'feather',
                name: '天使羽毛',
                description: '轻盈飘落，闪烁光芒',
                category: 'effect',
                subCategory: 'fall',
                rarity: 'epic',
                price: { diamond: 188 },
                icon: '🪶',
                preview: 'effects/preview-feather.gif',
                available: true,
                stats: {
                    popularity: 88,
                    satisfaction: 4.7
                }
            },
            // 守卫激怒特效
            laser: {
                id: 'laser',
                name: '激光眼',
                description: '从眼睛射出红色激光，命中爆炸',
                category: 'effect',
                subCategory: 'provoke',
                rarity: 'legendary',
                price: { diamond: 388 },
                icon: '👁️⚡',
                preview: 'effects/preview-laser.gif',
                limited: true,
                available: true,
                stats: {
                    popularity: 97,
                    satisfaction: 4.9
                }
            },
            thunder: {
                id: 'thunder',
                name: '雷电链',
                description: '闪电劈向玩家，电光闪烁',
                category: 'effect',
                subCategory: 'provoke',
                rarity: 'epic',
                price: { diamond: 288 },
                icon: '⚡',
                preview: 'effects/preview-thunder.gif',
                available: true,
                stats: {
                    popularity: 89,
                    satisfaction: 4.6
                }
            }
        };
    }

    // ============================================
    // 特效获取
    // ============================================

    getEffectDefinition(effectId) {
        return this.effectDefinitions[effectId] || null;
    }

    getAllEffects() {
        return Object.values(this.effectDefinitions);
    }

    getEffectsByCategory(category) {
        return Object.values(this.effectDefinitions).filter(
            effect => effect.subCategory === category
        );
    }

    getEffectsByRarity(rarity) {
        return Object.values(this.effectDefinitions).filter(
            effect => effect.rarity === rarity
        );
    }

    // ============================================
    // 装备管理
    // ============================================

    /**
     * 装备特效
     * @param {string} effectId - 特效ID
     * @param {string} type - 特效类型 (rise, fall, provoke)
     * @returns {object} - 操作结果
     */
    equip(effectId, type) {
        const effect = this.effectDefinitions[effectId];
        
        if (!effect) {
            return { success: false, error: '特效不存在' };
        }
        
        if (!this.isOwned(effectId)) {
            return { success: false, error: '未拥有该特效' };
        }
        
        if (effect.subCategory !== type) {
            return { success: false, error: '特效类型不匹配' };
        }
        
        // 取消之前的装备
        const previousEffect = this.inventory.effects[type];
        
        // 装备新特效
        this.inventory.effects[type] = effectId;
        this.saveInventory();
        
        // 触发事件
        this.triggerEvent('effectEquipped', {
            type,
            effectId,
            previousEffect,
            effect
        });
        
        return {
            success: true,
            message: `已装备 ${effect.name}`,
            effect,
            previousEffect
        };
    }

    /**
     * 取消装备特效
     * @param {string} type - 特效类型
     * @returns {object} - 操作结果
     */
    unequip(type) {
        const previousEffect = this.inventory.effects[type];
        
        if (!previousEffect) {
            return { success: false, error: '该类型没有装备特效' };
        }
        
        this.inventory.effects[type] = null;
        this.saveInventory();
        
        this.triggerEvent('effectUnequipped', {
            type,
            previousEffect
        });
        
        return {
            success: true,
            message: '已取消装备',
            previousEffect
        };
    }

    /**
     * 获取当前装备的特效
     * @param {string} type - 特效类型
     * @returns {object|null}
     */
    getEquippedEffect(type) {
        const effectId = this.inventory.effects[type];
        if (!effectId) return null;
        return this.effectDefinitions[effectId];
    }

    /**
     * 获取所有装备的特效
     * @returns {object}
     */
    getAllEquippedEffects() {
        const result = {};
        for (const [type, effectId] of Object.entries(this.inventory.effects)) {
            result[type] = effectId ? this.effectDefinitions[effectId] : null;
        }
        return result;
    }

    // ============================================
    // 所有权管理
    // ============================================

    /**
     * 购买/添加特效到背包
     * @param {string} effectId - 特效ID
     * @returns {object} - 操作结果
     */
    acquire(effectId) {
        const effect = this.effectDefinitions[effectId];
        
        if (!effect) {
            return { success: false, error: '特效不存在' };
        }
        
        if (this.isOwned(effectId)) {
            return { success: false, error: '已拥有该特效' };
        }
        
        this.inventory.ownedEffects.push(effectId);
        this.saveInventory();
        
        // 如果开启了自动装备且该类型没有装备，则自动装备
        if (this.inventory.preferences.autoEquip && 
            !this.inventory.effects[effect.subCategory]) {
            this.equip(effectId, effect.subCategory);
        }
        
        this.triggerEvent('effectAcquired', { effectId, effect });
        
        return {
            success: true,
            message: `获得 ${effect.name}`,
            effect,
            autoEquipped: this.inventory.preferences.autoEquip && 
                         !this.inventory.effects[effect.subCategory]
        };
    }

    /**
     * 检查是否拥有特效
     * @param {string} effectId - 特效ID
     * @returns {boolean}
     */
    isOwned(effectId) {
        return this.inventory.ownedEffects.includes(effectId);
    }

    /**
     * 获取已拥有的特效列表
     * @returns {Array}
     */
    getOwnedEffects() {
        return this.inventory.ownedEffects.map(id => this.effectDefinitions[id]);
    }

    /**
     * 获取未拥有的特效列表
     * @returns {Array}
     */
    getUnownedEffects() {
        return Object.values(this.effectDefinitions).filter(
            effect => !this.isOwned(effect.id)
        );
    }

    // ============================================
    // 偏好设置
    // ============================================

    updatePreferences(newPreferences) {
        this.inventory.preferences = {
            ...this.inventory.preferences,
            ...newPreferences
        };
        this.saveInventory();
        
        this.triggerEvent('preferencesUpdated', this.inventory.preferences);
        
        return { success: true, preferences: this.inventory.preferences };
    }

    getPreferences() {
        return this.inventory.preferences;
    }

    // ============================================
    // 事件系统
    // ============================================

    addEventListener(callback) {
        this.listeners.push(callback);
    }

    removeEventListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    triggerEvent(eventName, data) {
        this.listeners.forEach(callback => {
            try {
                callback(eventName, data);
            } catch (e) {
                console.error('特效事件监听错误:', e);
            }
        });
    }

    // ============================================
    // 数据统计
    // ============================================

    getInventoryStats() {
        const allEffects = Object.values(this.effectDefinitions);
        const ownedEffects = this.getOwnedEffects();
        
        return {
            total: allEffects.length,
            owned: ownedEffects.length,
            completionRate: (ownedEffects.length / allEffects.length * 100).toFixed(1),
            byCategory: {
                rise: {
                    total: this.getEffectsByCategory('rise').length,
                    owned: this.getEffectsByCategory('rise').filter(e => this.isOwned(e.id)).length
                },
                fall: {
                    total: this.getEffectsByCategory('fall').length,
                    owned: this.getEffectsByCategory('fall').filter(e => this.isOwned(e.id)).length
                },
                provoke: {
                    total: this.getEffectsByCategory('provoke').length,
                    owned: this.getEffectsByCategory('provoke').filter(e => this.isOwned(e.id)).length
                }
            },
            byRarity: {
                rare: ownedEffects.filter(e => e.rarity === 'rare').length,
                epic: ownedEffects.filter(e => e.rarity === 'epic').length,
                legendary: ownedEffects.filter(e => e.rarity === 'legendary').length
            },
            equipped: {
                rise: this.inventory.effects.rise,
                fall: this.inventory.effects.fall,
                provoke: this.inventory.effects.provoke
            }
        };
    }

    // ============================================
    // 导入/导出
    // ============================================

    exportInventory() {
        return {
            ...this.inventory,
            exportTime: Date.now(),
            version: '1.0'
        };
    }

    importInventory(data) {
        if (data.effects) {
            this.inventory.effects = { ...DEFAULT_USER_INVENTORY.effects, ...data.effects };
        }
        if (data.ownedEffects) {
            this.inventory.ownedEffects = [...data.ownedEffects];
        }
        if (data.preferences) {
            this.inventory.preferences = { ...DEFAULT_USER_INVENTORY.preferences, ...data.preferences };
        }
        this.saveInventory();
        
        return { success: true, message: '背包数据已导入' };
    }

    // ============================================
    // 重置
    // ============================================

    resetInventory() {
        this.inventory = { ...DEFAULT_USER_INVENTORY };
        this.saveInventory();
        this.triggerEvent('inventoryReset', {});
        return { success: true, message: '背包已重置' };
    }
}

// ============================================
// 特效装备UI管理器
// ============================================

class EffectEquipmentUI {
    constructor(equipmentManager) {
        this.manager = equipmentManager;
        this.selectedEffect = null;
        this.previewScene = null;
        this.previewRenderer = null;
    }

    /**
     * 渲染特效装备界面
     */
    renderEquipmentPanel() {
        const stats = this.manager.getInventoryStats();
        const equipped = this.manager.getAllEquippedEffects();
        
        return `
            <div class="effect-equipment-panel">
                <div class="equip-header">
                    <h2>🎭 3D特效装备</h2>
                    <div class="equip-stats">
                        <span class="completion-rate">收集进度: ${stats.completionRate}%</span>
                        <span class="owned-count">${stats.owned}/${stats.total}</span>
                    </div>
                </div>
                
                <div class="equipped-section">
                    <h3>当前装备</h3>
                    <div class="equipped-slots">
                        ${this.renderEquipSlot('rise', equipped.rise, '上升特效', '⬆️')}
                        ${this.renderEquipSlot('fall', equipped.fall, '下降特效', '⬇️')}
                        ${this.renderEquipSlot('provoke', equipped.provoke, '激怒特效', '👁️')}
                    </div>
                </div>
                
                <div class="effects-collection">
                    <h3>我的收藏</h3>
                    <div class="category-tabs">
                        <button class="tab-btn active" data-category="rise">上升特效</button>
                        <button class="tab-btn" data-category="fall">下降特效</button>
                        <button class="tab-btn" data-category="provoke">守卫特效</button>
                    </div>
                    <div class="effects-grid">
                        ${this.renderEffectsGrid('rise')}
                    </div>
                </div>
            </div>
        `;
    }

    renderEquipSlot(type, effect, label, icon) {
        const rarityColors = {
            common: '#888',
            rare: '#4a9eff',
            epic: '#a855f7',
            legendary: '#fbbf24'
        };
        
        return `
            <div class="equip-slot ${type}" data-type="${type}">
                <div class="slot-label">${icon} ${label}</div>
                ${effect ? `
                    <div class="slot-content equipped" style="border-color: ${rarityColors[effect.rarity]}">
                        <span class="slot-icon">${effect.icon}</span>
                        <span class="slot-name">${effect.name}</span>
                        <span class="slot-rarity" style="color: ${rarityColors[effect.rarity]}">
                            ${this.getRarityName(effect.rarity)}
                        </span>
                        <button class="btn-unequip" data-type="${type}">卸下</button>
                    </div>
                ` : `
                    <div class="slot-content empty">
                        <span class="empty-text">未装备</span>
                        <button class="btn-select" data-type="${type}">选择特效</button>
                    </div>
                `}
            </div>
        `;
    }

    renderEffectsGrid(category) {
        const effects = this.manager.getEffectsByCategory(category);
        
        return effects.map(effect => {
            const owned = this.manager.isOwned(effect.id);
            const equipped = this.manager.getEquippedEffect(category)?.id === effect.id;
            
            return `
                <div class="effect-card ${effect.rarity} ${owned ? 'owned' : 'locked'} ${equipped ? 'equipped' : ''}"
                     data-id="${effect.id}" data-category="${category}">
                    <div class="effect-icon">${effect.icon}</div>
                    <div class="effect-info">
                        <span class="effect-name">${effect.name}</span>
                        <span class="effect-rarity ${effect.rarity}">${this.getRarityName(effect.rarity)}</span>
                    </div>
                    ${owned ? `
                        ${equipped ? 
                            '<span class="equipped-badge">已装备</span>' :
                            `<button class="btn-equip" data-id="${effect.id}" data-type="${category}">装备</button>`
                        }
                    ` : `
                        <div class="effect-price">
                            <span class="price-icon">💎</span>
                            <span class="price-value">${effect.price.diamond}</span>
                        </div>
                    `}
                </div>
            `;
        }).join('');
    }

    getRarityName(rarity) {
        const names = {
            common: '普通',
            rare: '稀有',
            epic: '史诗',
            legendary: '传说'
        };
        return names[rarity] || rarity;
    }
}

// ============================================
// 全局实例
// ============================================

let effectEquipmentManager = null;

function initEffectEquipment() {
    effectEquipmentManager = new EffectEquipmentManager();
    window.effectEquipmentManager = effectEquipmentManager;
    console.log('🎭 3D特效装备系统已初始化');
    return effectEquipmentManager;
}

// ============================================
// 导出模块
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EffectEquipmentManager,
        EffectEquipmentUI,
        DEFAULT_USER_INVENTORY,
        initEffectEquipment
    };
}

export {
    EffectEquipmentManager,
    EffectEquipmentUI,
    DEFAULT_USER_INVENTORY,
    initEffectEquipment
};
