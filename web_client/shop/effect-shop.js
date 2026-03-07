/**
 * 命运塔 - 特效商城分类
 * Tower of Fate - Effect Shop Category
 * 3D特效道具商城集成
 */

// ============================================
// 特效商城数据
// ============================================

const EFFECT_SHOP_ITEMS = [
    // 上升特效
    {
        id: 'effect_cloud',
        name: '筋斗云',
        category: 'effect',
        subCategory: 'rise',
        price: { diamond: 188 },
        rarity: 'epic',
        description: '乘坐筋斗云上升，仙气飘飘，金色边框环绕',
        detailedDescription: '传说中孙悟空的座驾，现在你也可以拥有！半透明云朵跟随玩家上升，金色边框闪耀，让你在游戏中如仙人般飘逸。',
        icon: '☁️',
        preview: 'effects/preview-cloud.gif',
        preview3d: true,
        stats: {
            popularity: 95,
            satisfaction: 4.8,
            sales: 15234
        },
        features: [
            '半透明云朵材质',
            '金色边框光效',
            '自然飘动动画',
            '仙气粒子效果'
        ],
        animationType: 'float',
        available: true,
        releaseDate: '2024-01-15'
    },
    {
        id: 'effect_rocket',
        name: '火箭背包',
        category: 'effect',
        subCategory: 'rise',
        price: { diamond: 288 },
        rarity: 'legendary',
        description: '喷射火焰，快速上升，科技感十足',
        detailedDescription: '高科技火箭背包，喷射橙色火焰，让你以极速冲向塔顶！尾焰粒子效果炫酷，是追求速度与激情的玩家首选。',
        icon: '🚀',
        preview: 'effects/preview-rocket.gif',
        preview3d: true,
        stats: {
            popularity: 92,
            satisfaction: 4.9,
            sales: 8932
        },
        features: [
            '3D火箭模型',
            '喷射尾焰粒子',
            '速度感抖动',
            '动态光晕效果'
        ],
        animationType: 'rocket',
        available: true,
        releaseDate: '2024-01-15'
    },
    
    // 下降特效
    {
        id: 'effect_parachute',
        name: '神奇降落伞',
        category: 'effect',
        subCategory: 'fall',
        price: { diamond: 128 },
        rarity: 'rare',
        description: '彩色伞面+绳索，缓慢飘落旋转',
        detailedDescription: '彩色分段伞面，四根绳索连接，让你安全优雅地降落。旋转飘落动画流畅，是性价比最高的下降特效。',
        icon: '🪂',
        preview: 'effects/preview-parachute.gif',
        preview3d: true,
        stats: {
            popularity: 78,
            satisfaction: 4.5,
            sales: 25678
        },
        features: [
            '彩色分段伞面',
            '逼真绳索物理',
            '旋转飘落动画',
            '摇摆下降效果'
        ],
        animationType: 'parachute',
        available: true,
        releaseDate: '2024-01-20'
    },
    {
        id: 'effect_feather',
        name: '天使羽毛',
        category: 'effect',
        subCategory: 'fall',
        price: { diamond: 188 },
        rarity: 'epic',
        description: '白色羽毛，发光闪烁，轻盈飘落',
        detailedDescription: '洁白的天使羽毛，自带圣光效果。轻盈飘落的姿态如梦似幻，闪烁粒子环绕，让你如同天使降临。',
        icon: '🪶',
        preview: 'effects/preview-feather.gif',
        preview3d: true,
        stats: {
            popularity: 88,
            satisfaction: 4.7,
            sales: 12456
        },
        features: [
            '真实羽毛建模',
            '圣光发光效果',
            '闪烁粒子环绕',
            '自然飘动翻转'
        ],
        animationType: 'feather',
        available: true,
        releaseDate: '2024-01-20'
    },
    
    // 守卫激怒特效
    {
        id: 'effect_laser',
        name: '激光眼',
        category: 'effect',
        subCategory: 'provoke',
        price: { diamond: 388 },
        rarity: 'legendary',
        limited: true,
        description: '从守卫眼睛射出红色激光，命中爆炸',
        detailedDescription: '传说限定特效！守卫双眼射出炽热红色激光，命中目标时产生爆炸效果。极致的威慑力，让对手闻风丧胆。',
        icon: '👁️⚡',
        preview: 'effects/preview-laser.gif',
        preview3d: true,
        stats: {
            popularity: 97,
            satisfaction: 4.9,
            sales: 5623
        },
        features: [
            '红色激光束',
            '发射点光晕',
            '命中爆炸效果',
            '扫描线动画'
        ],
        animationType: 'laser',
        available: true,
        releaseDate: '2024-02-01',
        limitedTime: '2024-12-31'
    },
    {
        id: 'effect_thunder',
        name: '雷电链',
        category: 'effect',
        subCategory: 'provoke',
        price: { diamond: 288 },
        rarity: 'epic',
        description: '闪电从守卫劈向玩家，电光闪烁震动',
        detailedDescription: '召唤天雷之力！多分支闪电从守卫劈向目标，电光闪烁伴随屏幕震动，给对手带来视觉震撼。',
        icon: '⚡',
        preview: 'effects/preview-thunder.gif',
        preview3d: true,
        stats: {
            popularity: 89,
            satisfaction: 4.6,
            sales: 9876
        },
        features: [
            '多分支闪电',
            '电光闪烁效果',
            '屏幕震动反馈',
            '火花粒子飞溅'
        ],
        animationType: 'thunder',
        available: true,
        releaseDate: '2024-02-01'
    }
];

// ============================================
// 特效商城管理器
// ============================================

class EffectShopManager {
    constructor(mainShop) {
        this.mainShop = mainShop;
        this.items = EFFECT_SHOP_ITEMS;
        this.currentFilter = 'all';
        this.previewScene = null;
        this.previewRenderer = null;
        this.previewCamera = null;
        this.previewMesh = null;
    }

    // ============================================
    // 获取特效商品
    // ============================================

    getAllItems() {
        return this.items;
    }

    getItemsByCategory(category) {
        return this.items.filter(item => item.subCategory === category);
    }

    getItemById(id) {
        return this.items.find(item => item.id === id);
    }

    // ============================================
    // 购买处理
    // ============================================

    purchase(itemId) {
        const item = this.getItemById(itemId);
        if (!item) {
            return { success: false, error: '商品不存在' };
        }

        // 调用主商城的购买逻辑
        if (this.mainShop) {
            const result = this.mainShop.purchase(itemId);
            
            if (result.success) {
                // 触发购买成功特效
                this.triggerPurchaseEffect(item);
                
                // 自动添加到特效背包
                if (window.effectEquipmentManager) {
                    const effectId = itemId.replace('effect_', '');
                    window.effectEquipmentManager.acquire(effectId);
                }
            }
            
            return result;
        }

        return { success: false, error: '商城系统未初始化' };
    }

    triggerPurchaseEffect(item) {
        // 触发购买特效
        if (window.effectTriggerManager) {
            const position = new THREE.Vector3(0, 0, 0);
            window.effectTriggerManager.triggerPurchaseEffect(position, item.rarity);
        }
    }

    // ============================================
    // 3D预览功能
    // ============================================

    init3DPreview(container) {
        if (!container) return;

        // 创建Three.js场景
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1a1a3e);

        // 相机
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.set(0, 0, 3);

        // 渲染器
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // 灯光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xffd700, 0.5, 10);
        pointLight.position.set(-2, 2, 2);
        scene.add(pointLight);

        this.previewScene = scene;
        this.previewCamera = camera;
        this.previewRenderer = renderer;

        // 开始渲染循环
        this.startPreviewLoop();

        return { scene, camera, renderer };
    }

    startPreviewLoop() {
        const animate = () => {
            if (!this.previewRenderer) return;

            requestAnimationFrame(animate);

            // 更新特效动画
            if (this.previewMesh && window.effectItems3D) {
                window.effectItems3D.updateEffect(
                    this.previewMesh, 
                    16, 
                    Date.now()
                );
            }

            // 旋转展示
            if (this.previewMesh) {
                this.previewMesh.rotation.y += 0.01;
            }

            this.previewRenderer.render(this.previewScene, this.previewCamera);
        };

        animate();
    }

    showItemPreview(itemId) {
        if (!this.previewScene) return;

        const item = this.getItemById(itemId);
        if (!item) return;

        // 清除之前的预览
        if (this.previewMesh) {
            this.previewScene.remove(this.previewMesh);
            this.previewMesh = null;
        }

        // 创建新的3D预览
        const effectId = itemId.replace('effect_', '');
        
        if (window.effectItems3D) {
            this.previewMesh = window.effectItems3D.getEffect(effectId);
            if (this.previewMesh) {
                this.previewScene.add(this.previewMesh);
            }
        }
    }

    destroy3DPreview() {
        if (this.previewRenderer) {
            this.previewRenderer.dispose();
            this.previewRenderer = null;
        }
        this.previewScene = null;
        this.previewCamera = null;
        this.previewMesh = null;
    }

    // ============================================
    // 渲染商城界面
    // ============================================

    renderEffectShop() {
        return `
            <div class="effect-shop-section">
                ${this.renderSectionHeader()}
                ${this.renderCategoryTabs()}
                ${this.renderEffectGrid()}
            </div>
        `;
    }

    renderSectionHeader() {
        return `
            <div class="effect-shop-header">
                <div class="header-title">
                    <span class="header-icon">✨</span>
                    <h2>3D特效道具</h2>
                    <span class="header-badge">NEW</span>
                </div>
                <p class="header-desc">炫酷3D特效，让你的游戏与众不同！</p>
            </div>
        `;
    }

    renderCategoryTabs() {
        const categories = [
            { id: 'all', name: '全部', icon: '✨' },
            { id: 'rise', name: '上升特效', icon: '⬆️' },
            { id: 'fall', name: '下降特效', icon: '⬇️' },
            { id: 'provoke', name: '守卫特效', icon: '👁️' }
        ];

        return `
            <div class="effect-category-tabs">
                ${categories.map(cat => `
                    <button class="tab-btn ${this.currentFilter === cat.id ? 'active' : ''}" 
                            data-category="${cat.id}">
                        <span class="tab-icon">${cat.icon}</span>
                        <span class="tab-name">${cat.name}</span>
                    </button>
                `).join('')}
            </div>
        `;
    }

    renderEffectGrid() {
        const items = this.currentFilter === 'all' 
            ? this.items 
            : this.getItemsByCategory(this.currentFilter);

        return `
            <div class="effect-grid">
                ${items.map(item => this.renderEffectCard(item)).join('')}
            </div>
        `;
    }

    renderEffectCard(item) {
        const rarityColors = {
            rare: '#4a9eff',
            epic: '#a855f7',
            legendary: '#fbbf24'
        };

        const rarityNames = {
            rare: '稀有',
            epic: '史诗',
            legendary: '传说'
        };

        const isOwned = window.effectEquipmentManager?.isOwned(item.id.replace('effect_', ''));
        const isEquipped = window.effectEquipmentManager?.getEquippedEffect(item.subCategory)?.id === item.id.replace('effect_', '');

        return `
            <div class="effect-card ${item.rarity} ${item.limited ? 'limited' : ''}" data-id="${item.id}">
                ${item.limited ? '<div class="limited-badge">🏆 传说限定</div>' : ''}
                
                <div class="effect-preview">
                    <div class="preview-3d" data-preview="${item.id}"></div>
                    <div class="effect-icon-large">${item.icon}</div>
                </div>
                
                <div class="effect-info">
                    <div class="effect-header">
                        <h3 class="effect-name">${item.name}</h3>
                        <span class="rarity-badge" style="background: ${rarityColors[item.rarity]}">
                            ${rarityNames[item.rarity]}
                        </span>
                    </div>
                    
                    <p class="effect-desc">${item.description}</p>
                    
                    <div class="effect-features">
                        ${item.features.slice(0, 2).map(f => `
                            <span class="feature-tag">${f}</span>
                        `).join('')}
                    </div>
                    
                    <div class="effect-stats">
                        <span class="stat" title="满意度">⭐ ${item.stats.satisfaction}</span>
                        <span class="stat" title="热度">🔥 ${item.stats.popularity}%</span>
                    </div>
                </div>
                
                <div class="effect-footer">
                    ${isOwned ? `
                        ${isEquipped ? `
                            <button class="btn-equipped" disabled>✓ 已装备</button>
                        ` : `
                            <button class="btn-equip" data-id="${item.id}">装备</button>
                        `}
                    ` : `
                        <div class="price-section">
                            <span class="price-icon">💎</span>
                            <span class="price-value">${item.price.diamond}</span>
                        </div>
                        <button class="btn-buy" data-id="${item.id}">购买</button>
                    `}
                </div>
            </div>
        `;
    }

    // ============================================
    // 集成到主商城
    // ============================================

    integrateWithMainShop() {
        if (!this.mainShop) return;

        // 将特效商品添加到主商城
        this.items.forEach(item => {
            // 转换为商城格式
            const shopItem = {
                id: item.id,
                name: item.name,
                description: item.description,
                category: item.category,
                subCategory: item.subCategory,
                price: item.price.diamond,
                currency: 'gem',
                icon: item.icon,
                rarity: item.rarity,
                preview: item.preview,
                limited: item.limited
            };

            // 检查是否已存在
            const exists = this.mainShop.items.find(i => i.id === item.id);
            if (!exists) {
                this.mainShop.items.push(shopItem);
            }
        });

        console.log('✨ 特效商城已集成到主商城');
    }
}

// ============================================
// CSS样式
// ============================================

const effectShopStyles = `
<style>
/* 特效商城区域 */
.effect-shop-section {
    margin: 30px 0;
}

.effect-shop-header {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(251, 191, 36, 0.2));
    border-radius: 15px;
    padding: 25px;
    margin-bottom: 20px;
    border: 1px solid rgba(168, 85, 247, 0.3);
}

.header-title {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 10px;
}

.header-icon {
    font-size: 2.5em;
}

.header-title h2 {
    margin: 0;
    font-size: 1.8em;
    background: linear-gradient(45deg, #a855f7, #fbbf24);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.header-badge {
    background: linear-gradient(45deg, #ff6b6b, #ffd700);
    color: #000;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.75em;
    font-weight: bold;
}

.header-desc {
    color: rgba(255, 255, 255, 0.7);
    margin: 0;
}

/* 分类标签 */
.effect-category-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

.effect-category-tabs .tab-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 25px;
    color: #fff;
    cursor: pointer;
    transition: all 0.3s;
}

.effect-category-tabs .tab-btn:hover,
.effect-category-tabs .tab-btn.active {
    background: linear-gradient(45deg, #a855f7, #764ba2);
    border-color: #a855f7;
    transform: translateY(-2px);
}

.tab-icon {
    font-size: 1.2em;
}

/* 特效网格 */
.effect-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
}

/* 特效卡片 */
.effect-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 15px;
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s;
    position: relative;
}

.effect-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
}

.effect-card.rare {
    border-color: rgba(74, 158, 255, 0.3);
}

.effect-card.epic {
    border-color: rgba(168, 85, 247, 0.3);
}

.effect-card.legendary {
    border-color: rgba(251, 191, 36, 0.5);
    box-shadow: 0 0 30px rgba(251, 191, 36, 0.1);
}

.effect-card.limited::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 40%, rgba(251, 191, 36, 0.1) 50%, transparent 60%);
    animation: shimmer 3s infinite;
    pointer-events: none;
}

@keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}

.limited-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    background: linear-gradient(45deg, #fbbf24, #f59e0b);
    color: #000;
    padding: 5px 12px;
    border-radius: 20px;
    font-size: 0.75em;
    font-weight: bold;
    z-index: 2;
}

/* 预览区域 */
.effect-preview {
    height: 150px;
    background: linear-gradient(180deg, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5));
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}

.preview-3d {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
}

.effect-icon-large {
    font-size: 4em;
    filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
    z-index: 1;
}

/* 特效信息 */
.effect-info {
    padding: 15px;
}

.effect-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.effect-name {
    margin: 0;
    font-size: 1.2em;
    color: #fff;
}

.rarity-badge {
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 0.7em;
    color: #fff;
    font-weight: bold;
}

.effect-desc {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9em;
    margin: 0 0 10px 0;
    line-height: 1.4;
}

.effect-features {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-bottom: 10px;
}

.feature-tag {
    background: rgba(255, 255, 255, 0.1);
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 0.75em;
    color: rgba(255, 255, 255, 0.8);
}

.effect-stats {
    display: flex;
    gap: 15px;
    font-size: 0.85em;
    color: rgba(255, 255, 255, 0.6);
}

/* 底部操作区 */
.effect-footer {
    padding: 15px;
    background: rgba(0, 0, 0, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.price-section {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 1.2em;
    font-weight: bold;
}

.price-icon {
    color: #a855f7;
}

.price-value {
    color: #fff;
}

.btn-buy, .btn-equip, .btn-equipped {
    padding: 8px 20px;
    border: none;
    border-radius: 20px;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
}

.btn-buy {
    background: linear-gradient(45deg, #ffd700, #ffaa00);
    color: #000;
}

.btn-buy:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
}

.btn-equip {
    background: linear-gradient(45deg, #a855f7, #764ba2);
    color: #fff;
}

.btn-equipped {
    background: rgba(100, 255, 100, 0.2);
    color: #6f6;
    cursor: default;
}

/* 响应式 */
@media (max-width: 768px) {
    .effect-grid {
        grid-template-columns: 1fr;
    }
    
    .effect-category-tabs {
        overflow-x: auto;
        flex-wrap: nowrap;
        padding-bottom: 5px;
    }
    
    .effect-category-tabs .tab-btn {
        white-space: nowrap;
    }
}
</style>
`;

// ============================================
// 初始化函数
// ============================================

function initEffectShop(mainShop) {
    const manager = new EffectShopManager(mainShop);
    window.effectShopManager = manager;
    
    // 集成到主商城
    manager.integrateWithMainShop();
    
    console.log('🛒 特效商城已初始化');
    return manager;
}

// ============================================
// 导出模块
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EffectShopManager,
        EFFECT_SHOP_ITEMS,
        effectShopStyles,
        initEffectShop
    };
}

export {
    EffectShopManager,
    EFFECT_SHOP_ITEMS,
    effectShopStyles,
    initEffectShop
};
