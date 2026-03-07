/**
 * 命运塔 - 3D特效系统集成
 * Tower of Fate - 3D Effect System Integration
 * 将3D特效系统与游戏主逻辑集成
 */

// ============================================
// 3D特效系统主集成模块
// ============================================

class EffectSystemIntegration {
    constructor() {
        this.initialized = false;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.effectItems3D = null;
        this.equipmentManager = null;
        this.triggerManager = null;
        this.shopManager = null;
    }

    /**
     * 初始化完整的3D特效系统
     * @param {object} options - 配置选项
     */
    init(options = {}) {
        if (this.initialized) {
            console.log('3D特效系统已初始化');
            return this;
        }

        console.log('🎮 初始化3D特效系统...');

        // 1. 检查Three.js是否可用
        if (typeof THREE === 'undefined') {
            console.warn('Three.js未加载，3D特效系统将以降级模式运行');
            this.initWithout3D();
            return this;
        }

        // 2. 初始化3D场景（如果需要）
        if (options.scene) {
            this.scene = options.scene;
            this.camera = options.camera;
            this.renderer = options.renderer;
        } else if (options.container) {
            this.init3DScene(options.container);
        }

        // 3. 初始化特效模型系统
        this.initEffectItems3D();

        // 4. 初始化装备系统
        this.initEquipmentManager();

        // 5. 初始化触发系统
        if (this.scene && this.camera) {
            this.initTriggerManager();
        }

        // 6. 初始化商城系统
        if (options.shop) {
            this.initShopManager(options.shop);
        }

        // 7. 绑定游戏事件
        this.bindGameEvents();

        this.initialized = true;
        console.log('✅ 3D特效系统初始化完成！');
        
        return this;
    }

    /**
     * 初始化3D场景
     */
    init3DScene(container) {
        // 场景
        this.scene = new THREE.Scene();
        this.scene.background = null; // 透明背景

        // 相机
        this.camera = new THREE.PerspectiveCamera(
            75, 
            container.clientWidth / container.clientHeight, 
            0.1, 
            1000
        );
        this.camera.position.z = 5;

        // 渲染器
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(this.renderer.domElement);

        // 灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        this.scene.add(directionalLight);

        console.log('🎨 3D场景已创建');
    }

    /**
     * 初始化特效模型系统
     */
    initEffectItems3D() {
        if (typeof EffectItems3D === 'undefined') {
            console.warn('EffectItems3D未加载');
            return;
        }

        this.effectItems3D = new EffectItems3D(this.scene);
        window.effectItems3D = this.effectItems3D;
        console.log('🔧 特效模型系统已初始化');
    }

    /**
     * 初始化装备系统
     */
    initEquipmentManager() {
        if (typeof EffectEquipmentManager === 'undefined') {
            console.warn('EffectEquipmentManager未加载');
            return;
        }

        this.equipmentManager = new EffectEquipmentManager();
        window.effectEquipmentManager = this.equipmentManager;
        console.log('🎒 装备系统已初始化');
    }

    /**
     * 初始化触发系统
     */
    initTriggerManager() {
        if (typeof EffectTriggerManager === 'undefined') {
            console.warn('EffectTriggerManager未加载');
            return;
        }

        this.triggerManager = new EffectTriggerManager(
            this.scene,
            this.camera,
            this.effectItems3D
        );
        window.effectTriggerManager = this.triggerManager;
        console.log('⚡ 触发系统已初始化');
    }

    /**
     * 初始化商城系统
     */
    initShopManager(mainShop) {
        if (typeof EffectShopManager === 'undefined') {
            console.warn('EffectShopManager未加载');
            return;
        }

        this.shopManager = new EffectShopManager(mainShop);
        this.shopManager.integrateWithMainShop();
        window.effectShopManager = this.shopManager;
        console.log('🛒 商城系统已初始化');
    }

    /**
     * 无3D模式初始化
     */
    initWithout3D() {
        // 只初始化装备系统用于数据管理
        if (typeof EffectEquipmentManager !== 'undefined') {
            this.equipmentManager = new EffectEquipmentManager();
            window.effectEquipmentManager = this.equipmentManager;
        }
        
        console.log('⚠️ 3D特效系统以降级模式运行');
    }

    // ============================================
    // 游戏事件绑定
    // ============================================

    bindGameEvents() {
        // 监听游戏事件并触发相应特效
        
        // 玩家上升事件
        this.on('player:rise', (data) => {
            if (this.triggerManager && data.position) {
                const { playerId, from, to, duration } = data;
                const startPos = new THREE.Vector3(from.x, from.y, from.z);
                const endPos = new THREE.Vector3(to.x, to.y, to.z);
                this.triggerManager.triggerRiseEffect(playerId, startPos, endPos, duration);
            }
        });

        // 玩家下降事件
        this.on('player:fall', (data) => {
            if (this.triggerManager && data.position) {
                const { playerId, from, to, duration } = data;
                const startPos = new THREE.Vector3(from.x, from.y, from.z);
                const endPos = new THREE.Vector3(to.x, to.y, to.z);
                this.triggerManager.triggerFallEffect(playerId, startPos, endPos, duration);
            }
        });

        // 守卫激怒事件
        this.on('guard:provoke', (data) => {
            if (this.triggerManager) {
                const { guardId, targetId, guardPos, targetPos } = data;
                const guardPosition = new THREE.Vector3(guardPos.x, guardPos.y, guardPos.z);
                const targetPosition = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
                this.triggerManager.triggerProvokeEffect(guardId, targetId, guardPosition, targetPosition);
            }
        });

        // 购买成功事件
        this.on('shop:purchase', (data) => {
            if (this.triggerManager) {
                const position = data.position 
                    ? new THREE.Vector3(data.position.x, data.position.y, data.position.z)
                    : new THREE.Vector3(0, 0, 0);
                this.triggerManager.triggerPurchaseEffect(position, data.rarity);
            }
            
            // 自动添加到背包
            if (this.equipmentManager && data.effectId) {
                this.equipmentManager.acquire(data.effectId);
            }
        });

        // 装备切换事件
        this.on('effect:equip', (data) => {
            if (this.equipmentManager) {
                this.equipmentManager.equip(data.effectId, data.type);
            }
        });
    }

    // 简单的事件系统
    on(event, callback) {
        if (!this._events) this._events = {};
        if (!this._events[event]) this._events[event] = [];
        this._events[event].push(callback);
    }

    emit(event, data) {
        if (this._events && this._events[event]) {
            this._events[event].forEach(cb => cb(data));
        }
    }

    // ============================================
    // API方法
    // ============================================

    /**
     * 手动触发上升特效
     */
    triggerRise(playerId, startPos, endPos, duration) {
        if (this.triggerManager) {
            const start = new THREE.Vector3(startPos.x, startPos.y, startPos.z);
            const end = new THREE.Vector3(endPos.x, endPos.y, endPos.z);
            return this.triggerManager.triggerRiseEffect(playerId, start, end, duration);
        }
        return null;
    }

    /**
     * 手动触发下降特效
     */
    triggerFall(playerId, startPos, endPos, duration) {
        if (this.triggerManager) {
            const start = new THREE.Vector3(startPos.x, startPos.y, startPos.z);
            const end = new THREE.Vector3(endPos.x, endPos.y, endPos.z);
            return this.triggerManager.triggerFallEffect(playerId, start, end, duration);
        }
        return null;
    }

    /**
     * 手动触发激怒特效
     */
    triggerProvoke(guardId, targetId, guardPos, targetPos) {
        if (this.triggerManager) {
            const guard = new THREE.Vector3(guardPos.x, guardPos.y, guardPos.z);
            const target = new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z);
            return this.triggerManager.triggerProvokeEffect(guardId, targetId, guard, target);
        }
        return null;
    }

    /**
     * 获取玩家当前装备的特效
     */
    getEquippedEffect(playerId, type) {
        if (this.equipmentManager) {
            return this.equipmentManager.getEquippedEffect(type);
        }
        return null;
    }

    /**
     * 装备特效
     */
    equipEffect(effectId, type) {
        if (this.equipmentManager) {
            return this.equipmentManager.equip(effectId, type);
        }
        return { success: false, error: '系统未初始化' };
    }

    /**
     * 购买并装备特效
     */
    purchaseAndEquip(itemId) {
        if (this.shopManager) {
            const result = this.shopManager.purchase(itemId);
            if (result.success) {
                const effectId = itemId.replace('effect_', '');
                const item = this.shopManager.getItemById(itemId);
                if (item) {
                    this.equipEffect(effectId, item.subCategory);
                }
            }
            return result;
        }
        return { success: false, error: '商城系统未初始化' };
    }

    // ============================================
    // 清理
    // ============================================

    dispose() {
        if (this.triggerManager) {
            this.triggerManager.dispose();
        }
        if (this.effectItems3D) {
            this.effectItems3D.disposeAll();
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
        this.initialized = false;
    }
}

// ============================================
// HTML集成帮助
// ============================================

const EffectSystemHTML = {
    /**
     * 生成特效系统需要的script标签
     */
    getScriptTags() {
        return `
            <!-- Three.js -->
            <script src="https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js"></script>
            
            <!-- 3D特效系统 -->
            <script src="js/3d/effect-items-3d.js"></script>
            <script src="js/3d/effect-equip.js"></script>
            <script src="js/3d/effect-trigger.js"></script>
            <script src="shop/effect-shop.js"></script>
            <script src="js/3d/effect-integration.js"></script>
        `;
    },

    /**
     * 生成特效装备面板HTML
     */
    getEquipmentPanel() {
        return `
            <div id="effect-equipment-container"></div>
            <script>
                // 初始化时渲染装备面板
                document.addEventListener('DOMContentLoaded', function() {
                    if (window.effectEquipmentManager) {
                        const ui = new EffectEquipmentUI(window.effectEquipmentManager);
                        const container = document.getElementById('effect-equipment-container');
                        if (container) {
                            container.innerHTML = ui.renderEquipmentPanel();
                        }
                    }
                });
            </script>
        `;
    },

    /**
     * 生成特效预览容器HTML
     */
    getPreviewContainer() {
        return `
            <div id="effect-preview-3d" style="width: 300px; height: 200px;"></div>
        `;
    }
};

// ============================================
// 快速初始化函数
// ============================================

/**
 * 快速初始化完整的3D特效系统
 * @param {object} options - 配置选项
 * @returns {EffectSystemIntegration}
 */
function initEffectSystem(options = {}) {
    const system = new EffectSystemIntegration();
    system.init(options);
    window.effectSystem = system;
    return system;
}

/**
 * 与现有游戏集成
 * @param {object} gameInstance - 游戏实例
 */
function integrateWithGame(gameInstance) {
    if (!window.effectSystem) {
        console.warn('特效系统未初始化');
        return;
    }

    // 绑定游戏回调
    if (gameInstance.on) {
        // 玩家升级
        gameInstance.on('levelUp', (data) => {
            window.effectSystem.emit('player:rise', {
                playerId: data.playerId || 'local',
                from: data.fromPosition,
                to: data.toPosition,
                duration: 2000
            });
        });

        // 玩家降级
        gameInstance.on('levelDown', (data) => {
            window.effectSystem.emit('player:fall', {
                playerId: data.playerId || 'local',
                from: data.fromPosition,
                to: data.toPosition,
                duration: 3000
            });
        });

        // 守卫激怒
        gameInstance.on('guardAnger', (data) => {
            window.effectSystem.emit('guard:provoke', {
                guardId: data.guardId,
                targetId: data.targetId,
                guardPos: data.guardPosition,
                targetPos: data.targetPosition
            });
        });
    }

    console.log('🎮 特效系统已与游戏集成');
}

// ============================================
// 导出模块
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EffectSystemIntegration,
        EffectSystemHTML,
        initEffectSystem,
        integrateWithGame
    };
}

export {
    EffectSystemIntegration,
    EffectSystemHTML,
    initEffectSystem,
    integrateWithGame
};
