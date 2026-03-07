/**
 * Allegro 最强模式 - 界面配置系统
 * 5个创新主题界面配置
 */

const UI_THEMES = {
    // 经典版（默认）
    'classic': {
        id: 'classic',
        name: '经典版',
        nameEn: 'Classic',
        description: '传统左中右三栏布局',
        descriptionEn: 'Traditional three-column layout',
        preview: 'themes/classic-preview.jpg',
        component: 'ClassicGameUI',
        analyticsId: 'theme_classic',
        features: ['简洁直观', '快速操作', '低耗性能'],
        featuresEn: ['Simple', 'Fast', 'Low CPU'],
        difficulty: 'easy',
        isDefault: true,
        colorScheme: {
            primary: '#ffd700',
            secondary: '#ff6b6b',
            background: 'linear-gradient(180deg, #0a0a1a 0%, #1a0a2e 50%, #0d1b2a 100%)'
        }
    },
    
    // 创新界面1: 3D攀登塔楼
    '3d-tower': {
        id: '3d-tower',
        name: '3D攀登塔楼',
        nameEn: '3D Tower Climb',
        description: '沉浸式3D塔楼，360度旋转',
        descriptionEn: 'Immersive 3D tower with 360° rotation',
        preview: 'themes/3d-tower-preview.jpg',
        component: 'Tower3DClimbingUI',
        analyticsId: 'theme_3d_tower',
        features: ['3D视角', '云层环绕', '层数标识', '粒子特效'],
        featuresEn: ['3D View', 'Cloud Layer', 'Level Markers', 'Particles'],
        difficulty: 'medium',
        requires3D: true,
        colorScheme: {
            primary: '#00d4ff',
            secondary: '#7b2cbf',
            background: 'linear-gradient(180deg, #0c0c2e 0%, #1a0a3e 50%, #0d2b4a 100%)'
        },
        threeJSConfig: {
            cameraHeight: 15,
            towerRadius: 5,
            rotationSpeed: 0.005,
            cloudLayers: 5
        }
    },
    
    // 创新界面2: 卡牌对决竞技场
    'card-arena': {
        id: 'card-arena',
        name: '卡牌对决竞技场',
        nameEn: 'Card Arena',
        description: '炉石传说风格卡牌对决',
        descriptionEn: 'Hearthstone-style card battle arena',
        preview: 'themes/card-arena-preview.jpg',
        component: 'CardArenaUI',
        analyticsId: 'theme_card_arena',
        features: ['3D卡牌翻转', 'VS徽章', '碰撞特效', '全屏动画'],
        featuresEn: ['3D Flip', 'VS Badge', 'Impact FX', 'Fullscreen'],
        difficulty: 'medium',
        requires3D: true,
        colorScheme: {
            primary: '#ff6b35',
            secondary: '#f7931e',
            background: 'linear-gradient(180deg, #1a0a0a 0%, #2d1b1b 50%, #1a0d0d 100%)'
        },
        arenaConfig: {
            vsAnimation: true,
            cardFlip3D: true,
            impactShake: true,
            crowdCheer: true
        }
    },
    
    // 创新界面3: 锦标赛大厅Live
    'tournament-hall': {
        id: 'tournament-hall',
        name: '锦标赛大厅',
        nameEn: 'Tournament Hall',
        description: '实时大厅，观战功能',
        descriptionEn: 'Real-time tournament lobby with spectating',
        preview: 'themes/tournament-hall-preview.jpg',
        component: 'TournamentHallUI',
        analyticsId: 'theme_tournament_hall',
        features: ['实时在线人数', '多场比赛', '世界聊天', '观战模式'],
        featuresEn: ['Live Count', 'Multi-match', 'Global Chat', 'Spectate'],
        difficulty: 'high',
        requiresNetwork: true,
        colorScheme: {
            primary: '#00ff88',
            secondary: '#00ccff',
            background: 'linear-gradient(180deg, #0a1a1a 0%, #0a2e1a 50%, #0d1b2a 100%)'
        },
        hallConfig: {
            maxVisibleMatches: 8,
            chatEnabled: true,
            spectatorSlots: 100,
            liveUpdates: true
        }
    },
    
    // 创新界面4: 3D明信片收藏馆
    '3d-museum': {
        id: '3d-museum',
        name: '3D收藏馆',
        nameEn: '3D Museum',
        description: '博物馆式3D明信片展示',
        descriptionEn: 'Museum-style 3D postcard gallery',
        preview: 'themes/3d-museum-preview.jpg',
        component: 'PostcardMuseumUI',
        analyticsId: 'theme_3d_museum',
        features: ['3D翻转', '大洲切换', '收集进度', '光影效果'],
        featuresEn: ['3D Flip', 'Continent Switch', 'Progress', 'Lighting'],
        difficulty: 'medium',
        requires3D: true,
        colorScheme: {
            primary: '#e0c097',
            secondary: '#c9b037',
            background: 'linear-gradient(180deg, #1a1a2e 0%, #2e1a1a 50%, #1a1a1a 100%)'
        },
        museumConfig: {
            ambientLight: 0.6,
            spotlightIntensity: 1.2,
            rotationEnabled: true,
            continentGrouping: true
        }
    },
    
    // 创新界面5: 团队作战指挥室
    'command-room': {
        id: 'command-room',
        name: '指挥室',
        nameEn: 'Command Room',
        description: '团队协作指挥界面',
        descriptionEn: 'Team collaboration command interface',
        preview: 'themes/command-room-preview.jpg',
        component: 'CommandRoomUI',
        analyticsId: 'theme_command_room',
        features: ['队友状态', '实时聊天', '敌方情报', '战术标记'],
        featuresEn: ['Team Status', 'Live Chat', 'Enemy Intel', 'Tactical'],
        difficulty: 'high',
        requiresTeam: true,
        colorScheme: {
            primary: '#ff3333',
            secondary: '#00ff00',
            background: 'linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%)'
        },
        commandConfig: {
            maxTeamSize: 4,
            tacticalMap: true,
            enemyTracking: true,
            voiceChat: false
        }
    }
};

// 主题管理器
class UIThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('allegroPreferredTheme') || 'classic';
        this.themeHistory = JSON.parse(localStorage.getItem('allegroThemeHistory') || '[]');
        this.favorites = JSON.parse(localStorage.getItem('allegroFavoriteThemes') || '[]');
    }

    getTheme(themeId) {
        return UI_THEMES[themeId] || UI_THEMES['classic'];
    }

    getAllThemes() {
        return Object.values(UI_THEMES);
    }

    setTheme(themeId) {
        if (!UI_THEMES[themeId]) {
            console.warn(`[ThemeManager] 未知主题: ${themeId}`);
            return false;
        }
        
        const oldTheme = this.currentTheme;
        this.currentTheme = themeId;
        
        // 保存偏好
        localStorage.setItem('allegroPreferredTheme', themeId);
        
        // 记录历史
        this.themeHistory.push({
            themeId,
            timestamp: Date.now(),
            from: oldTheme
        });
        
        // 只保留最近50条
        if (this.themeHistory.length > 50) {
            this.themeHistory = this.themeHistory.slice(-50);
        }
        localStorage.setItem('allegroThemeHistory', JSON.stringify(this.themeHistory));
        
        // 触发主题变更事件
        window.dispatchEvent(new CustomEvent('themeChanged', {
            detail: { oldTheme, newTheme: themeId, theme: UI_THEMES[themeId] }
        }));
        
        console.log(`[ThemeManager] 主题切换: ${oldTheme} → ${themeId}`);
        return true;
    }

    getCurrentTheme() {
        return this.getTheme(this.currentTheme);
    }

    toggleFavorite(themeId) {
        const index = this.favorites.indexOf(themeId);
        if (index > -1) {
            this.favorites.splice(index, 1);
        } else {
            this.favorites.push(themeId);
        }
        localStorage.setItem('allegroFavoriteThemes', JSON.stringify(this.favorites));
        return index === -1; // 返回是否为添加操作
    }

    isFavorite(themeId) {
        return this.favorites.includes(themeId);
    }

    getRecommendedTheme() {
        // 基于用户历史推荐主题
        const history = this.themeHistory.slice(-10);
        const usageCount = {};
        
        history.forEach(h => {
            usageCount[h.themeId] = (usageCount[h.themeId] || 0) + 1;
        });
        
        // 找出使用最少的主题推荐
        let leastUsed = 'classic';
        let minCount = Infinity;
        
        Object.keys(UI_THEMES).forEach(themeId => {
            const count = usageCount[themeId] || 0;
            if (count < minCount && themeId !== 'classic') {
                minCount = count;
                leastUsed = themeId;
            }
        });
        
        return leastUsed;
    }

    // 检查主题是否可用
    isThemeAvailable(themeId) {
        const theme = UI_THEMES[themeId];
        if (!theme) return false;
        
        if (theme.requires3D && !this.checkWebGLSupport()) {
            return false;
        }
        
        if (theme.requiresNetwork && !navigator.onLine) {
            return false;
        }
        
        return true;
    }

    checkWebGLSupport() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }

    // 获取主题统计数据
    getThemeStats() {
        const stats = {};
        
        Object.keys(UI_THEMES).forEach(themeId => {
            const history = this.themeHistory.filter(h => h.themeId === themeId);
            stats[themeId] = {
                usageCount: history.length,
                lastUsed: history.length > 0 ? history[history.length - 1].timestamp : null,
                isFavorite: this.isFavorite(themeId)
            };
        });
        
        return stats;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UI_THEMES, UIThemeManager };
}

// 浏览器环境
if (typeof window !== 'undefined') {
    window.UI_THEMES = UI_THEMES;
    window.UIThemeManager = UIThemeManager;
    window.uiThemeManager = new UIThemeManager();
}
