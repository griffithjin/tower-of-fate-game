/**
 * 命运塔广告系统 - Fate Tower Advertising System
 * 包含17个非侵入式广告点位，支持多种广告格式
 * @version 1.0.0
 */

// ==========================================
// 1. 17个广告点位配置
// ==========================================
const AD_PLACEMENTS = {
    // 1. 主菜单底部横幅（轻度）
    'main-menu-banner': {
        id: 'main-menu-banner',
        name: '主菜单底部横幅',
        position: 'main-menu-bottom',
        size: '728x90',
        type: ['banner', 'image'],
        frequency: 'always',
        priority: 1,
        enabled: true,
        maxPerSession: 999,
        description: '主菜单页面底部展示的标准横幅广告'
    },
    
    // 2. 游戏加载页面（用户等待时）
    'loading-screen': {
        id: 'loading-screen',
        name: '游戏加载页',
        position: 'loading-overlay',
        size: 'fullscreen',
        type: ['video', 'image'],
        frequency: 'every-load',
        maxDuration: 5000, // 5秒
        skippable: true,
        priority: 2,
        enabled: true,
        maxPerSession: 10,
        description: '游戏加载时展示的全屏广告，用户等待时自然展示'
    },
    
    // 3. 回合结束间隙（自然过渡点）
    'round-end': {
        id: 'round-end',
        name: '回合结束间隙',
        position: 'between-rounds',
        size: '300x250',
        type: ['banner', 'text'],
        frequency: 'every-3-rounds',
        priority: 3,
        enabled: true,
        maxPerSession: 20,
        description: '每个回合结束后的自然过渡间隙'
    },
    
    // 4. 游戏暂停菜单
    'pause-menu': {
        id: 'pause-menu',
        name: '暂停菜单',
        position: 'pause-overlay',
        size: '300x250',
        type: ['banner'],
        frequency: 'on-pause',
        priority: 4,
        enabled: true,
        maxPerSession: 50,
        description: '用户暂停游戏时展示'
    },
    
    // 5. 胜利结算页（用户心情愉悦时）
    'victory-screen': {
        id: 'victory-screen',
        name: '胜利结算页',
        position: 'victory-overlay',
        size: 'full-width',
        type: ['banner', 'reward-video'],
        frequency: 'on-victory',
        priority: 5,
        enabled: true,
        maxPerSession: 30,
        description: '玩家胜利时展示，用户心情愉悦时效果更佳'
    },
    
    // 6. 失败结算页
    'defeat-screen': {
        id: 'defeat-screen',
        name: '失败结算页',
        position: 'defeat-overlay',
        size: '300x250',
        type: ['banner', 'text'],
        frequency: 'on-defeat',
        priority: 6,
        enabled: true,
        maxPerSession: 30,
        description: '玩家失败时展示，建议显示鼓励性内容'
    },
    
    // 7. 锦标赛报名确认页
    'tournament-register': {
        id: 'tournament-register',
        name: '锦标赛报名页',
        position: 'tournament-form',
        size: '728x90',
        type: ['banner', 'text'],
        frequency: 'on-register',
        priority: 7,
        enabled: true,
        maxPerSession: 10,
        description: '锦标赛报名确认页面'
    },
    
    // 8. 商店侧边栏（不影响购买）
    'shop-sidebar': {
        id: 'shop-sidebar',
        name: '商店侧边栏',
        position: 'shop-side',
        size: '160x600',
        type: ['skyscraper', 'text'],
        frequency: 'always',
        priority: 8,
        enabled: true,
        maxPerSession: 999,
        description: '商店页面侧边栏，不影响主要购买功能'
    },
    
    // 9. 用户中心底部
    'profile-footer': {
        id: 'profile-footer',
        name: '用户中心底部',
        position: 'profile-bottom',
        size: '728x90',
        type: ['banner'],
        frequency: 'always',
        priority: 9,
        enabled: true,
        maxPerSession: 999,
        description: '用户个人资料页面底部'
    },
    
    // 10. 排行榜页面
    'leaderboard-page': {
        id: 'leaderboard-page',
        name: '排行榜页面',
        position: 'leaderboard-top',
        size: '728x90',
        type: ['banner'],
        frequency: 'always',
        priority: 10,
        enabled: true,
        maxPerSession: 999,
        description: '全球/好友排行榜页面'
    },
    
    // 11. 明信片收藏册间隙
    'postcard-gallery': {
        id: 'postcard-gallery',
        name: '明信片收藏册',
        position: 'gallery-between',
        size: '300x250',
        type: ['banner', 'native'],
        frequency: 'every-12-cards',
        priority: 11,
        enabled: true,
        maxPerSession: 50,
        description: '明信片收藏册滚动时间隙插入'
    },
    
    // 12. 连胜模式选择界面
    'streak-selector': {
        id: 'streak-selector',
        name: '连胜模式选择',
        position: 'streak-theme-selector',
        size: '300x250',
        type: ['banner'],
        frequency: 'always',
        priority: 12,
        enabled: true,
        maxPerSession: 999,
        description: '连胜挑战模式主题选择界面'
    },
    
    // 13. 观战模式侧边栏
    'spectator-sidebar': {
        id: 'spectator-sidebar',
        name: '观战模式侧边栏',
        position: 'spectator-side',
        size: '300x600',
        type: ['skyscraper'],
        frequency: 'always',
        priority: 13,
        enabled: true,
        maxPerSession: 999,
        description: '观战其他玩家对战时的侧边栏'
    },
    
    // 14. 等待对手匹配时
    'matchmaking-wait': {
        id: 'matchmaking-wait',
        name: '匹配等待',
        position: 'matchmaking-overlay',
        size: 'full-screen',
        type: ['video', 'image'],
        frequency: 'on-wait',
        maxDuration: 10000,
        skippable: false,
        priority: 14,
        enabled: true,
        maxPerSession: 20,
        description: '匹配对手等待期间展示'
    },
    
    // 15. 每日任务列表间隙
    'daily-missions': {
        id: 'daily-missions',
        name: '每日任务间隙',
        position: 'missions-between',
        size: '300x250',
        type: ['banner', 'native'],
        frequency: 'every-3-missions',
        priority: 15,
        enabled: true,
        maxPerSession: 30,
        description: '每日任务列表中间隙插入'
    },
    
    // 16. 通知消息内嵌（轻度）
    'notification-inline': {
        id: 'notification-inline',
        name: '通知消息内嵌',
        position: 'notification-list',
        size: 'text-link',
        type: ['text', 'native'],
        frequency: 'every-5-messages',
        priority: 16,
        enabled: true,
        maxPerSession: 50,
        description: '通知中心消息列表中轻度嵌入'
    },
    
    // 17. 设置页面底部
    'settings-footer': {
        id: 'settings-footer',
        name: '设置页面底部',
        position: 'settings-bottom',
        size: '728x90',
        type: ['banner'],
        frequency: 'always',
        priority: 17,
        enabled: true,
        maxPerSession: 999,
        description: '游戏设置页面底部'
    }
};

// 广告类型定义
const AD_TYPES = {
    banner: {
        name: '横幅广告',
        icon: '📰',
        supportedSizes: ['728x90', '468x60', '320x50', '300x250', '160x600'],
        description: '标准图片横幅广告'
    },
    image: {
        name: '图片广告',
        icon: '🖼️',
        supportedSizes: ['all'],
        description: '静态或动态图片广告'
    },
    video: {
        name: '视频广告',
        icon: '🎬',
        supportedSizes: ['fullscreen', 'full-width'],
        description: '可跳过或强制观看的视频广告'
    },
    text: {
        name: '文字广告',
        icon: '📝',
        supportedSizes: ['text-link'],
        description: '纯文字链式广告'
    },
    native: {
        name: '原生广告',
        icon: '🌿',
        supportedSizes: ['300x250', 'native'],
        description: '与应用风格融合的原生内容'
    },
    skyscraper: {
        name: '摩天楼广告',
        icon: '🏢',
        supportedSizes: ['160x600', '300x600'],
        description: '竖长型侧边栏广告'
    },
    'reward-video': {
        name: '激励视频',
        icon: '🎁',
        supportedSizes: ['fullscreen'],
        description: '观看后获得奖励的视频广告'
    }
};

// ==========================================
// 2. 广告系统核心类
// ==========================================
class AdSystem {
    constructor() {
        this.adPlacements = AD_PLACEMENTS;
        this.activeAds = new Map();
        this.userAdPreferences = this.loadUserPreferences();
        this.sessionStats = this.initSessionStats();
        this.revenueTracker = new AdRevenueTracker();
        this.campaigns = this.loadCampaigns();
        
        // 初始化频率计数器
        this.frequencyCounters = {
            rounds: 0,
            messages: 0,
            postcards: 0,
            missions: 0
        };
        
        console.log('🎯 广告系统已初始化');
    }
    
    // 加载用户广告偏好设置
    loadUserPreferences() {
        const defaults = {
            personalizedAds: true,
            interestCategories: [],
            frequencyCap: 10, // 每小时最大广告数
            disabledPlacements: [],
            dataConsent: true
        };
        
        try {
            const saved = localStorage.getItem('ad_preferences');
            return saved ? { ...defaults, ...JSON.parse(saved) } : defaults;
        } catch (e) {
            return defaults;
        }
    }
    
    // 保存用户偏好
    saveUserPreferences() {
        localStorage.setItem('ad_preferences', JSON.stringify(this.userAdPreferences));
    }
    
    // 初始化会话统计
    initSessionStats() {
        return {
            sessionId: Date.now().toString(36),
            startTime: Date.now(),
            impressions: {},
            clicks: {},
            rewards: []
        };
    }
    
    // 加载广告活动
    loadCampaigns() {
        // 从服务器或本地存储加载
        try {
            const saved = localStorage.getItem('ad_campaigns');
            return saved ? JSON.parse(saved) : this.getDefaultCampaigns();
        } catch (e) {
            return this.getDefaultCampaigns();
        }
    }
    
    // 默认广告活动（示例数据）
    getDefaultCampaigns() {
        return [
            {
                id: 'camp_001',
                name: '新手引导推广',
                type: 'banner',
                placements: ['main-menu-banner', 'victory-screen'],
                content: {
                    image: '/ads/banners/welcome-banner.jpg',
                    link: '/tutorial',
                    title: '新手教程',
                    cta: '开始学习'
                },
                schedule: {
                    start: Date.now(),
                    end: Date.now() + 30 * 24 * 60 * 60 * 1000
                },
                targeting: {
                    minLevel: 1,
                    maxLevel: 5
                },
                budget: {
                    daily: 1000,
                    cpm: 5,
                    cpc: 0.5
                },
                status: 'active'
            },
            {
                id: 'camp_002',
                name: 'VIP会员推广',
                type: 'video',
                placements: ['loading-screen', 'matchmaking-wait'],
                content: {
                    video: '/ads/videos/vip-promo.mp4',
                    link: '/vip',
                    title: '成为VIP会员',
                    cta: '立即升级'
                },
                schedule: {
                    start: Date.now(),
                    end: Date.now() + 14 * 24 * 60 * 60 * 1000
                },
                targeting: {
                    isVIP: false
                },
                budget: {
                    daily: 2000,
                    cpm: 10,
                    cpc: 1.0
                },
                status: 'active'
            }
        ];
    }
    
    // ==========================================
    // 核心广告展示逻辑
    // ==========================================
    
    // 根据场景显示广告
    showAd(placementId, options = {}) {
        const placement = this.adPlacements[placementId];
        
        if (!placement) {
            console.warn(`❌ 未知广告点位: ${placementId}`);
            return false;
        }
        
        if (!placement.enabled) {
            console.log(`⏸️ 广告点位已禁用: ${placement.name}`);
            return false;
        }
        
        // 检查用户是否禁用此点位
        if (this.userAdPreferences.disabledPlacements.includes(placementId)) {
            return false;
        }
        
        // 检查会话频次限制
        if (this.isSessionLimitReached(placementId)) {
            console.log(`⏸️ 会话频次限制: ${placement.name}`);
            return false;
        }
        
        // 检查频率限制
        if (!this.checkFrequency(placement)) {
            console.log(`⏸️ 频率限制跳过: ${placement.name}`);
            return false;
        }
        
        // 获取可用广告
        const ad = this.getAvailableAd(placement, options);
        if (!ad) {
            console.log(`⏸️ 无可用广告: ${placement.name}`);
            return false;
        }
        
        // 渲染广告
        const rendered = this.renderAd(placement, ad, options);
        if (!rendered) {
            return false;
        }
        
        // 更新会话统计
        this.updateSessionStats(placementId, 'impression');
        
        // 记录展示
        this.trackImpression(placementId, ad.id);
        
        // 更新最后展示时间
        localStorage.setItem(`ad_last_${placement.id}`, Date.now().toString());
        
        console.log(`✅ 广告展示成功: ${placement.name}`);
        return true;
    }
    
    // 检查会话频次限制
    isSessionLimitReached(placementId) {
        const count = this.sessionStats.impressions[placementId] || 0;
        const limit = this.adPlacements[placementId].maxPerSession;
        return count >= limit;
    }
    
    // 检查频率限制
    checkFrequency(placement) {
        const lastShown = localStorage.getItem(`ad_last_${placement.id}`);
        const now = Date.now();
        const counters = this.frequencyCounters;
        
        switch(placement.frequency) {
            case 'always':
                return true;
                
            case 'every-load':
                return true;
                
            case 'on-pause':
            case 'on-victory':
            case 'on-defeat':
            case 'on-register':
            case 'on-wait':
                // 事件触发，检查冷却时间
                const cooldown = 60000; // 1分钟冷却
                return !lastShown || (now - parseInt(lastShown)) > cooldown;
                
            case 'every-3-rounds':
                counters.rounds++;
                return counters.rounds % 3 === 0;
                
            case 'every-5-messages':
                counters.messages++;
                return counters.messages % 5 === 0;
                
            case 'every-12-cards':
                counters.postcards++;
                return counters.postcards % 12 === 0;
                
            case 'every-3-missions':
                counters.missions++;
                return counters.missions % 3 === 0;
                
            default:
                return true;
        }
    }
    
    // 获取可用广告
    getAvailableAd(placement, options = {}) {
        // 从活跃活动中筛选
        const now = Date.now();
        const availableCampaigns = this.campaigns.filter(camp => {
            // 检查状态
            if (camp.status !== 'active') return false;
            
            // 检查时间
            if (camp.schedule.start > now || camp.schedule.end < now) return false;
            
            // 检查点位匹配
            if (!camp.placements.includes(placement.id)) return false;
            
            // 检查定向
            if (camp.targeting && !this.checkTargeting(camp.targeting)) return false;
            
            return true;
        });
        
        if (availableCampaigns.length === 0) {
            // 返回默认广告
            return this.getDefaultAd(placement);
        }
        
        // 按优先级排序
        availableCampaigns.sort((a, b) => (b.priority || 0) - (a.priority || 0));
        
        // 返回最高优先级的活动
        return availableCampaigns[0];
    }
    
    // 检查定向条件
    checkTargeting(targeting) {
        const user = window.gameUser || {}; // 假设有全局用户对象
        
        if (targeting.minLevel !== undefined && user.level < targeting.minLevel) return false;
        if (targeting.maxLevel !== undefined && user.level > targeting.maxLevel) return false;
        if (targeting.isVIP !== undefined && user.isVIP !== targeting.isVIP) return false;
        if (targeting.regions && !targeting.regions.includes(user.region)) return false;
        
        return true;
    }
    
    // 获取默认广告
    getDefaultAd(placement) {
        // 返回占位广告或默认推广
        return {
            id: 'default_' + placement.id,
            name: '默认广告',
            type: placement.type[0],
            content: {
                image: `/ads/defaults/${placement.size}.jpg`,
                title: '命运塔',
                link: '/'
            },
            isDefault: true
        };
    }
    
    // ==========================================
    // 广告渲染
    // ==========================================
    
    renderAd(placement, ad, options = {}) {
        let container;
        
        // 查找或创建容器
        if (options.container) {
            container = options.container;
        } else {
            container = document.querySelector(`[data-ad-placement="${placement.id}"]`);
        }
        
        if (!container) {
            // 动态创建容器
            container = this.createAdContainer(placement);
            if (!container) {
                console.warn(`❌ 无法创建广告容器: ${placement.id}`);
                return false;
            }
        }
        
        // 生成广告HTML
        const adHTML = this.generateAdHTML(placement, ad);
        if (!adHTML) {
            return false;
        }
        
        // 设置内容
        container.innerHTML = adHTML;
        container.classList.add('ad-container', `ad-${placement.id}`);
        container.style.display = 'block';
        
        // 绑定事件
        this.bindAdEvents(container, placement, ad);
        
        // 保存活跃广告引用
        this.activeAds.set(placement.id, {
            placement,
            ad,
            container,
            shownAt: Date.now()
        });
        
        return true;
    }
    
    // 创建广告容器
    createAdContainer(placement) {
        const container = document.createElement('div');
        container.setAttribute('data-ad-placement', placement.id);
        container.className = `ad-container ad-${placement.id}`;
        
        // 根据位置插入
        const insertPositions = {
            'main-menu-bottom': () => document.querySelector('.main-menu')?.appendChild(container),
            'loading-overlay': () => document.body.appendChild(container),
            'pause-overlay': () => document.querySelector('.pause-screen')?.appendChild(container),
            'victory-overlay': () => document.querySelector('.victory-screen')?.appendChild(container),
            'defeat-overlay': () => document.querySelector('.defeat-screen')?.appendChild(container),
            'shop-side': () => document.querySelector('.shop-container')?.appendChild(container),
            'profile-bottom': () => document.querySelector('.profile-page')?.appendChild(container),
            'leaderboard-top': () => document.querySelector('.leaderboard-container')?.appendChild(container)
        };
        
        const inserter = insertPositions[placement.position];
        if (inserter) {
            inserter();
            return container;
        }
        
        return null;
    }
    
    // 生成广告HTML
    generateAdHTML(placement, ad) {
        const type = ad.type || placement.type[0];
        const content = ad.content || ad;
        
        let html = '';
        
        switch(type) {
            case 'banner':
            case 'image':
                html = `
                    <div class="ad-wrapper ad-banner" data-ad-id="${ad.id}" data-placement="${placement.id}">
                        <a href="${content.link || '#'}" target="_blank" class="ad-link" data-track="click">
                            <img src="${content.image}" alt="${content.title || '广告'}" class="ad-image" 
                                 style="max-width: 100%; height: auto; display: block;">
                        </a>
                        <span class="ad-label">${window.i18n?.t?.('ad.label') || '广告'}</span>
                        ${content.cta ? `<a href="${content.link}" class="ad-cta">${content.cta}</a>` : ''}
                    </div>
                `;
                break;
                
            case 'text':
                html = `
                    <div class="ad-wrapper ad-text" data-ad-id="${ad.id}" data-placement="${placement.id}">
                        <a href="${content.link || '#'}" class="ad-text-link" data-track="click">
                            <span class="ad-text-content">${content.title}</span>
                        </a>
                        <span class="ad-label">${window.i18n?.t?.('ad.label') || '广告'}</span>
                    </div>
                `;
                break;
                
            case 'video':
                const isSkippable = placement.skippable !== false;
                html = `
                    <div class="ad-wrapper ad-video" data-ad-id="${ad.id}" data-placement="${placement.id}">
                        <video class="ad-video-player" autoplay muted playsinline
                               ${isSkippable ? '' : 'controls="false"'}
                               style="width: 100%; height: 100%; object-fit: cover;">
                            <source src="${content.video}" type="video/mp4">
                        </video>
                        ${isSkippable ? `
                            <button class="skip-ad-btn" style="display: none;">
                                ${window.i18n?.t?.('ad.skip') || '跳过广告'} <span class="skip-timer">5</span>s
                            </button>
                        ` : ''}
                        <div class="ad-video-cta" style="display: none;">
                            <a href="${content.link}" class="ad-cta-btn">${content.cta || '了解更多'}</a>
                        </div>
                    </div>
                `;
                break;
                
            case 'native':
                html = `
                    <div class="ad-wrapper ad-native" data-ad-id="${ad.id}" data-placement="${placement.id}">
                        <div class="native-ad-content">
                            ${content.icon ? `<img src="${content.icon}" class="native-ad-icon" alt="">` : ''}
                            <div class="native-ad-text">
                                <div class="native-ad-title">${content.title}</div>
                                <div class="native-ad-desc">${content.description || ''}</div>
                            </div>
                        </div>
                        <a href="${content.link}" class="native-ad-cta" data-track="click">${content.cta || '查看'}</a>
                        <span class="ad-label">${window.i18n?.t?.('ad.label') || '广告'}</span>
                    </div>
                `;
                break;
                
            case 'skyscraper':
                html = `
                    <div class="ad-wrapper ad-skyscraper" data-ad-id="${ad.id}" data-placement="${placement.id}">
                        <a href="${content.link || '#'}" target="_blank" class="ad-link" data-track="click">
                            <img src="${content.image}" alt="${content.title || '广告'}" class="ad-image">
                        </a>
                        <span class="ad-label">${window.i18n?.t?.('ad.label') || '广告'}</span>
                    </div>
                `;
                break;
                
            case 'reward-video':
                html = `
                    <div class="ad-wrapper ad-reward-video" data-ad-id="${ad.id}" data-placement="${placement.id}">
                        <div class="reward-video-header">
                            <span class="reward-badge">🎁 ${window.i18n?.t?.('ad.reward') || '观看获得奖励'}</span>
                        </div>
                        <video class="ad-video-player" autoplay muted playsinline style="width: 100%;">
                            <source src="${content.video}" type="video/mp4">
                        </video>
                        <div class="reward-video-footer">
                            <div class="reward-info">
                                <span class="reward-icon">${content.rewardIcon || '🎁'}</span>
                                <span class="reward-text">${content.rewardText || '获得奖励'}</span>
                            </div>
                            <button class="claim-reward-btn" disabled>${window.i18n?.t?.('ad.claim') || '领取奖励'}</button>
                        </div>
                    </div>
                `;
                break;
                
            default:
                console.warn(`❌ 未知广告类型: ${type}`);
                return null;
        }
        
        return html;
    }
    
    // 绑定广告事件
    bindAdEvents(container, placement, ad) {
        // 点击事件
        const clickables = container.querySelectorAll('[data-track="click"]');
        clickables.forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAdClick(placement, ad, el.href);
            });
        });
        
        // 视频特殊事件
        const video = container.querySelector('video');
        if (video) {
            this.bindVideoEvents(video, container, placement, ad);
        }
        
        // 关闭按钮（如有）
        const closeBtn = container.querySelector('.ad-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideAd(placement.id);
            });
        }
    }
    
    // 绑定视频事件
    bindVideoEvents(video, container, placement, ad) {
        const skipBtn = container.querySelector('.skip-ad-btn');
        const ctaPanel = container.querySelector('.ad-video-cta');
        const claimBtn = container.querySelector('.claim-reward-btn');
        
        // 跳过按钮逻辑
        if (skipBtn) {
            let skipTimer = placement.maxDuration ? Math.min(5, placement.maxDuration / 1000) : 5;
            const skipTimerSpan = skipBtn.querySelector('.skip-timer');
            
            const updateSkipTimer = () => {
                skipTimer--;
                if (skipTimerSpan) skipTimerSpan.textContent = skipTimer;
                
                if (skipTimer <= 0) {
                    skipBtn.textContent = window.i18n?.t?.('ad.skip_now') || '跳过';
                    skipBtn.disabled = false;
                    skipBtn.style.cursor = 'pointer';
                } else {
                    setTimeout(updateSkipTimer, 1000);
                }
            };
            
            setTimeout(updateSkipTimer, 1000);
            
            skipBtn.addEventListener('click', () => {
                if (skipTimer <= 0) {
                    this.hideAd(placement.id);
                }
            });
        }
        
        // 视频结束事件
        video.addEventListener('ended', () => {
            if (ctaPanel) ctaPanel.style.display = 'flex';
            if (claimBtn) {
                claimBtn.disabled = false;
                claimBtn.addEventListener('click', () => {
                    this.claimReward(ad);
                    this.hideAd(placement.id);
                });
            }
            
            // 激励视频完成追踪
            if (ad.type === 'reward-video') {
                this.trackRewardComplete(ad);
            }
        });
        
        // 进度追踪
        video.addEventListener('timeupdate', () => {
            const progress = (video.currentTime / video.duration) * 100;
            if (progress >= 25 && !ad.quartiles?.q1) this.trackQuartile(ad, 25);
            if (progress >= 50 && !ad.quartiles?.q2) this.trackQuartile(ad, 50);
            if (progress >= 75 && !ad.quartiles?.q3) this.trackQuartile(ad, 75);
        });
    }
    
    // 处理广告点击
    handleAdClick(placement, ad, url) {
        // 追踪点击
        this.trackClick(placement.id, ad.id);
        
        // 更新会话统计
        this.updateSessionStats(placement.id, 'click');
        
        // 游戏内跳转或外部链接
        if (url && url.startsWith('/')) {
            // 游戏内路由
            if (window.gameRouter) {
                window.gameRouter.navigate(url);
            }
        } else if (url) {
            // 外部链接
            window.open(url, '_blank');
        }
        
        console.log(`🖱️ 广告点击: ${ad.name || ad.id}`);
    }
    
    // 领取奖励
    claimReward(ad) {
        const reward = ad.content?.reward || { type: 'coins', amount: 100 };
        
        // 派发奖励
        if (window.gameAPI) {
            window.gameAPI.grantReward(reward);
        }
        
        // 记录
        this.sessionStats.rewards.push({
            adId: ad.id,
            reward,
            claimedAt: Date.now()
        });
        
        // 显示奖励提示
        this.showRewardNotification(reward);
        
        console.log(`🎁 广告奖励领取: ${reward.amount} ${reward.type}`);
    }
    
    // 显示奖励通知
    showRewardNotification(reward) {
        const notification = document.createElement('div');
        notification.className = 'ad-reward-notification';
        notification.innerHTML = `
            <div class="reward-popup">
                <span class="reward-icon">${reward.icon || '🎁'}</span>
                <span class="reward-text">+${reward.amount} ${reward.name || reward.type}</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 2000);
        }, 100);
    }
    
    // 隐藏广告
    hideAd(placementId) {
        const activeAd = this.activeAds.get(placementId);
        if (activeAd) {
            activeAd.container.style.display = 'none';
            this.activeAds.delete(placementId);
        }
    }
    
    // 关闭所有广告
    hideAllAds() {
        this.activeAds.forEach((ad, placementId) => {
            this.hideAd(placementId);
        });
    }
    
    // ==========================================
    // 统计与追踪
    // ==========================================
    
    updateSessionStats(placementId, type) {
        if (!this.sessionStats[type + 's']) {
            this.sessionStats[type + 's'] = {};
        }
        this.sessionStats[type + 's'][placementId] = 
            (this.sessionStats[type + 's'][placementId] || 0) + 1;
    }
    
    trackImpression(placementId, adId) {
        this.revenueTracker.trackImpression(placementId, adId);
    }
    
    trackClick(placementId, adId) {
        this.revenueTracker.trackClick(placementId, adId);
    }
    
    trackQuartile(ad, quartile) {
        if (!ad.quartiles) ad.quartiles = {};
        ad.quartiles[`q${quartile / 25}`] = true;
        
        console.log(`📊 视频进度: ${quartile}%`);
        
        // 发送分析事件
        if (window.analytics) {
            window.analytics.track('ad_video_quartile', {
                adId: ad.id,
                quartile,
                timestamp: Date.now()
            });
        }
    }
    
    trackRewardComplete(ad) {
        console.log(`🎬 激励视频完成: ${ad.id}`);
        
        if (window.analytics) {
            window.analytics.track('ad_reward_complete', {
                adId: ad.id,
                timestamp: Date.now()
            });
        }
    }
    
    // ==========================================
    // 管理接口
    // ==========================================
    
    // 启用/禁用广告点位
    togglePlacement(placementId, enabled) {
        if (this.adPlacements[placementId]) {
            this.adPlacements[placementId].enabled = enabled;
            console.log(`${enabled ? '✅' : '⏸️'} 广告点位 ${this.adPlacements[placementId].name} 已${enabled ? '启用' : '禁用'}`);
        }
    }
    
    // 添加广告活动
    addCampaign(campaign) {
        campaign.id = campaign.id || 'camp_' + Date.now();
        campaign.status = campaign.status || 'active';
        this.campaigns.push(campaign);
        this.saveCampaigns();
        return campaign;
    }
    
    // 更新广告活动
    updateCampaign(campaignId, updates) {
        const index = this.campaigns.findIndex(c => c.id === campaignId);
        if (index !== -1) {
            this.campaigns[index] = { ...this.campaigns[index], ...updates };
            this.saveCampaigns();
            return this.campaigns[index];
        }
        return null;
    }
    
    // 删除广告活动
    deleteCampaign(campaignId) {
        this.campaigns = this.campaigns.filter(c => c.id !== campaignId);
        this.saveCampaigns();
    }
    
    // 保存活动
    saveCampaigns() {
        localStorage.setItem('ad_campaigns', JSON.stringify(this.campaigns));
    }
    
    // 获取统计数据
    getStats() {
        return {
            placements: Object.keys(this.adPlacements).length,
            activeCampaigns: this.campaigns.filter(c => c.status === 'active').length,
            sessionImpressions: Object.values(this.sessionStats.impressions).reduce((a, b) => a + b, 0),
            sessionClicks: Object.values(this.sessionStats.clicks).reduce((a, b) => a + b, 0),
            sessionRewards: this.sessionStats.rewards.length,
            revenue: this.revenueTracker.getDailyRevenue()
        };
    }
}

// ==========================================
// 3. 收入追踪器
// ==========================================
class AdRevenueTracker {
    constructor() {
        this.today = new Date().toISOString().split('T')[0];
        this.stats = this.loadStats();
        this.avgCPM = 5; // 默认CPM
        this.avgCPC = 0.5; // 默认CPC
    }
    
    loadStats() {
        try {
            const saved = localStorage.getItem('ad_revenue_stats');
            const stats = saved ? JSON.parse(saved) : {};
            
            // 检查日期
            if (stats.date !== this.today) {
                return {
                    date: this.today,
                    impressions: {},
                    clicks: {},
                    videoCompletes: {},
                    revenue: 0
                };
            }
            return stats;
        } catch (e) {
            return {
                date: this.today,
                impressions: {},
                clicks: {},
                videoCompletes: {},
                revenue: 0
            };
        }
    }
    
    saveStats() {
        localStorage.setItem('ad_revenue_stats', JSON.stringify(this.stats));
    }
    
    trackImpression(placementId, adId) {
        if (!this.stats.impressions[placementId]) {
            this.stats.impressions[placementId] = 0;
        }
        this.stats.impressions[placementId]++;
        this.calculateRevenue();
        this.saveStats();
        
        // 发送分析事件
        if (window.analytics) {
            window.analytics.track('ad_impression', {
                placement: placementId,
                ad: adId,
                timestamp: Date.now(),
                cpm: this.getAdCPM(adId)
            });
        }
    }
    
    trackClick(placementId, adId) {
        if (!this.stats.clicks[placementId]) {
            this.stats.clicks[placementId] = 0;
        }
        this.stats.clicks[placementId]++;
        this.calculateRevenue();
        this.saveStats();
        
        if (window.analytics) {
            window.analytics.track('ad_click', {
                placement: placementId,
                ad: adId,
                timestamp: Date.now(),
                cpc: this.getAdCPC(adId)
            });
        }
    }
    
    trackVideoComplete(placementId, adId) {
        if (!this.stats.videoCompletes[placementId]) {
            this.stats.videoCompletes[placementId] = 0;
        }
        this.stats.videoCompletes[placementId]++;
        this.saveStats();
    }
    
    getAdCPM(adId) {
        // 从广告活动获取CPM
        const campaign = window.adSystem?.campaigns?.find(c => c.id === adId);
        return campaign?.budget?.cpm || this.avgCPM;
    }
    
    getAdCPC(adId) {
        const campaign = window.adSystem?.campaigns?.find(c => c.id === adId);
        return campaign?.budget?.cpc || this.avgCPC;
    }
    
    calculateRevenue() {
        const totalImpressions = Object.values(this.stats.impressions).reduce((a, b) => a + b, 0);
        const totalClicks = Object.values(this.stats.clicks).reduce((a, b) => a + b, 0);
        
        this.stats.revenue = (totalImpressions / 1000 * this.avgCPM) + (totalClicks * this.avgCPC);
    }
    
    getDailyRevenue() {
        return this.stats.revenue.toFixed(2);
    }
    
    getTodayImpressions() {
        return Object.values(this.stats.impressions).reduce((a, b) => a + b, 0);
    }
    
    getTodayClicks() {
        return Object.values(this.stats.clicks).reduce((a, b) => a + b, 0);
    }
    
    getCTR() {
        const impressions = this.getTodayImpressions();
        const clicks = this.getTodayClicks();
        return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0;
    }
    
    getPlacementStats(placementId) {
        return {
            impressions: this.stats.impressions[placementId] || 0,
            clicks: this.stats.clicks[placementId] || 0,
            ctr: this.getPlacementCTR(placementId)
        };
    }
    
    getPlacementCTR(placementId) {
        const impressions = this.stats.impressions[placementId] || 0;
        const clicks = this.stats.clicks[placementId] || 0;
        return impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : 0;
    }
}

// ==========================================
// 4. 初始化
// ==========================================
let adSystem = null;

function initAdSystem() {
    adSystem = new AdSystem();
    window.adSystem = adSystem;
    console.log('🎯 广告系统全局实例已创建: window.adSystem');
    return adSystem;
}

// DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdSystem);
} else {
    initAdSystem();
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AdSystem, AdRevenueTracker, AD_PLACEMENTS, AD_TYPES };
}
