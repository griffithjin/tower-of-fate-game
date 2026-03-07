/**
 * Allegro 最强模式 - 增强版连胜模式
 * 集成5个创新主题UI + AB测试
 */

class EnhancedStreakMode {
    constructor() {
        this.theme = localStorage.getItem('allegroPreferredTheme') || 'classic';
        this.abTest = typeof ABTestSystem !== 'undefined' ? new ABTestSystem() : null;
        this.ui = null;
        this.sessionId = null;
        this.isInitialized = false;
        
        // 游戏状态
        this.gameState = {
            isPlaying: false,
            currentStreak: 0,
            currentLevel: 0,
            guardCards: [],
            playerHand: [],
            selectedCardIndex: -1
        };
        
        // 配置
        this.config = {
            maxStreak: 13,
            levels: 13,
            cardsPerLevel: 4,
            suits: ['♠', '♥', '♣', '♦'],
            ranks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        };
    }
    
    async init() {
        console.log('[EnhancedStreakMode] 初始化增强版连胜模式');
        
        // 创建游戏容器
        this.createContainer();
        
        // 显示主题选择器
        this.showThemeSelector();
        
        this.isInitialized = true;
        return this;
    }
    
    createContainer() {
        // 检查是否已存在容器
        let container = document.getElementById('allegroStreakContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'allegroStreakContainer';
            container.className = 'allegro-streak-container';
            document.body.appendChild(container);
        }
        this.container = container;
    }
    
    // 显示主题选择器
    showThemeSelector() {
        const themes = UI_THEMES ? Object.values(UI_THEMES) : [
            { id: 'classic', name: '经典版', description: '传统左中右三栏布局', preview: 'themes/classic-preview.jpg', features: ['简洁直观', '快速操作'] },
            { id: '3d-tower', name: '3D攀登塔楼', description: '沉浸式3D塔楼，360度旋转', preview: 'themes/3d-tower-preview.jpg', features: ['3D视角', '云层环绕'] },
            { id: 'card-arena', name: '卡牌对决竞技场', description: '炉石传说风格卡牌对决', preview: 'themes/card-arena-preview.jpg', features: ['3D卡牌翻转', 'VS徽章'] },
            { id: 'tournament-hall', name: '锦标赛大厅', description: '实时大厅，观战功能', preview: 'themes/tournament-hall-preview.jpg', features: ['实时在线人数', '多场比赛'] },
            { id: '3d-museum', name: '3D收藏馆', description: '博物馆式3D明信片展示', preview: 'themes/3d-museum-preview.jpg', features: ['3D翻转', '大洲切换'] },
            { id: 'command-room', name: '指挥室', description: '团队协作指挥界面', preview: 'themes/command-room-preview.jpg', features: ['队友状态', '实时聊天'] }
        ];
        
        this.container.innerHTML = `
            <div class="theme-selector-overlay">
                <div class="theme-selector-container">
                    <div class="selector-header">
                        <h2>🎨 选择连胜模式界面</h2>
                        <p>选择你喜欢的主题开始挑战！</p>
                    </div>
                    
                    <div class="theme-grid">
                        ${themes.map(theme => `
                            <div class="theme-card ${theme.id === this.theme ? 'active' : ''}" 
                                 data-theme="${theme.id}"
                                 onclick="enhancedStreakMode.selectTheme('${theme.id}')"
                                 onmouseenter="enhancedStreakMode.previewTheme('${theme.id}')">
                                <div class="theme-preview">
                                    <div class="preview-placeholder">
                                        ${this.getThemeIcon(theme.id)}
                                    </div>
                                    <div class="theme-overlay">
                                        <button class="preview-btn">👁️ 预览</button>
                                    </div>
                                </div>
                                <div class="theme-info">
                                    <div class="theme-name">${theme.name}</div>
                                    <div class="theme-desc">${theme.description}</div>
                                    <div class="theme-features">
                                        ${(theme.features || []).slice(0, 3).map(f => `
                                            <span class="feature-tag">${f}</span>
                                        `).join('')}
                                    </div>
                                </div>
                                
                                ${theme.id === this.theme ? `
                                    <div class="selected-badge">
                                        ✓ 当前使用
                                    </div>
                                ` : ''}
                                
                                ${theme.id === 'card-arena' ? '<div class="hot-badge">🔥 HOT</div>' : ''}
                                ${theme.requires3D ? '<div class="webgl-badge">🎮 3D</div>' : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="selector-footer">
                        <div class="recommendation">
                            💡 推荐尝试: <span class="rec-theme">卡牌对决竞技场</span> - 表现最佳!
                        </div>
                        
                        <button class="start-streak-btn" onclick="enhancedStreakMode.startStreakMode()">
                            <span class="btn-icon">🚀</span>
                            <span class="btn-text">开始连胜挑战</span>
                            <span class="btn-arrow">→</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.applySelectorStyles();
    }
    
    getThemeIcon(themeId) {
        const icons = {
            'classic': '🎴',
            '3d-tower': '🗼',
            'card-arena': '⚔️',
            'tournament-hall': '🏆',
            '3d-museum': '🏛️',
            'command-room': '🎖️'
        };
        return icons[themeId] || '🎮';
    }
    
    applySelectorStyles() {
        const styles = `
            .allegro-streak-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 9999;
            }
            
            .theme-selector-overlay {
                width: 100%;
                height: 100%;
                background: linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0d1b2a 100%);
                overflow-y: auto;
            }
            
            .theme-selector-container {
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px 20px;
            }
            
            .selector-header {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .selector-header h2 {
                font-size: 36px;
                color: #ffd700;
                margin-bottom: 10px;
                text-shadow: 0 0 30px rgba(255,215,0,0.3);
            }
            
            .selector-header p {
                color: rgba(255,255,255,0.6);
                font-size: 16px;
            }
            
            .theme-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 25px;
                margin-bottom: 40px;
            }
            
            .theme-card {
                background: rgba(255,255,255,0.05);
                border-radius: 20px;
                overflow: hidden;
                border: 2px solid rgba(255,255,255,0.1);
                cursor: pointer;
                transition: all 0.3s ease;
                position: relative;
            }
            
            .theme-card:hover {
                transform: translateY(-5px);
                border-color: rgba(255,215,0,0.5);
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }
            
            .theme-card.active {
                border-color: #ffd700;
                box-shadow: 0 0 30px rgba(255,215,0,0.3);
            }
            
            .theme-preview {
                height: 180px;
                background: linear-gradient(135deg, rgba(255,215,0,0.1), rgba(102,126,234,0.1));
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            }
            
            .preview-placeholder {
                font-size: 80px;
                opacity: 0.8;
            }
            
            .theme-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .theme-card:hover .theme-overlay {
                opacity: 1;
            }
            
            .preview-btn {
                padding: 10px 25px;
                border: 2px solid #ffd700;
                border-radius: 25px;
                background: transparent;
                color: #ffd700;
                font-size: 14px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .preview-btn:hover {
                background: #ffd700;
                color: #000;
            }
            
            .theme-info {
                padding: 20px;
            }
            
            .theme-name {
                font-size: 20px;
                font-weight: bold;
                color: #fff;
                margin-bottom: 8px;
            }
            
            .theme-desc {
                font-size: 14px;
                color: rgba(255,255,255,0.6);
                margin-bottom: 15px;
                line-height: 1.5;
            }
            
            .theme-features {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
            }
            
            .feature-tag {
                padding: 4px 10px;
                background: rgba(255,215,0,0.1);
                border: 1px solid rgba(255,215,0,0.3);
                border-radius: 15px;
                font-size: 11px;
                color: #ffd700;
            }
            
            .selected-badge {
                position: absolute;
                top: 15px;
                right: 15px;
                padding: 5px 12px;
                background: linear-gradient(45deg, #ffd700, #ffaa00);
                color: #000;
                border-radius: 15px;
                font-size: 12px;
                font-weight: bold;
            }
            
            .hot-badge, .webgl-badge {
                position: absolute;
                top: 15px;
                left: 15px;
                padding: 3px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: bold;
            }
            
            .hot-badge {
                background: linear-gradient(45deg, #ff6b35, #f7931e);
                color: #fff;
            }
            
            .webgl-badge {
                background: linear-gradient(45deg, #667eea, #764ba2);
                color: #fff;
            }
            
            .selector-footer {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
            }
            
            .recommendation {
                color: rgba(255,255,255,0.6);
                font-size: 14px;
            }
            
            .rec-theme {
                color: #00ff88;
                font-weight: bold;
            }
            
            .start-streak-btn {
                padding: 20px 60px;
                border: none;
                border-radius: 50px;
                background: linear-gradient(45deg, #ffd700, #ff6b35);
                color: #000;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 15px;
                transition: all 0.3s;
                box-shadow: 0 10px 30px rgba(255,215,0,0.3);
            }
            
            .start-streak-btn:hover {
                transform: translateY(-3px) scale(1.02);
                box-shadow: 0 15px 40px rgba(255,215,0,0.5);
            }
            
            .btn-icon {
                font-size: 24px;
            }
            
            .btn-arrow {
                transition: transform 0.3s;
            }
            
            .start-streak-btn:hover .btn-arrow {
                transform: translateX(5px);
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // 选择主题
    selectTheme(themeId) {
        if (!UI_THEMES || !UI_THEMES[themeId]) {
            console.warn(`[EnhancedStreakMode] 未知主题: ${themeId}`);
            return;
        }
        
        const oldTheme = this.theme;
        this.theme = themeId;
        
        // 保存用户偏好
        localStorage.setItem('allegroPreferredTheme', themeId);
        
        // AB测试追踪
        if (this.abTest) {
            this.abTest.track('theme_selected', {
                theme_id: themeId,
                theme_name: UI_THEMES[themeId].name,
                previous_theme: oldTheme,
                context: 'streak_mode_selector'
            });
        }
        
        // 更新UI
        document.querySelectorAll('.theme-card').forEach(card => {
            card.classList.remove('active');
            const badge = card.querySelector('.selected-badge');
            if (badge) badge.remove();
            
            if (card.dataset.theme === themeId) {
                card.classList.add('active');
                card.insertAdjacentHTML('beforeend', `
                    <div class="selected-badge">✓ 当前使用</div>
                `);
            }
        });
        
        console.log(`[EnhancedStreakMode] 主题选择: ${oldTheme} → ${themeId}`);
    }
    
    // 预览主题
    previewTheme(themeId) {
        // 可以在这里添加主题预览效果
        console.log(`[EnhancedStreakMode] 预览主题: ${themeId}`);
    }
    
    // 开始连胜模式
    async startStreakMode() {
        console.log(`[EnhancedStreakMode] 启动连胜模式，主题: ${this.theme}`);
        
        // AB测试 - 开始会话
        if (this.abTest) {
            this.sessionId = this.abTest.startSession(this.theme);
            this.abTest.setCurrentSessionId(this.sessionId);
        }
        
        // 清空容器
        this.container.innerHTML = '';
        
        // 创建游戏容器
        const gameContainer = document.createElement('div');
        gameContainer.id = 'gameContainer';
        this.container.appendChild(gameContainer);
        
        // 加载主题组件
        await this.loadThemeComponent(this.theme, gameContainer);
        
        // 初始化游戏
        this.startGame();
        
        // AB测试 - 游戏开始
        if (this.abTest) {
            this.abTest.onGameStart(this.theme, this.sessionId);
        }
    }
    
    // 加载主题组件
    async loadThemeComponent(themeId, container) {
        const componentMap = {
            'classic': ClassicGameUI,
            '3d-tower': Tower3DClimbingUI,
            'card-arena': CardArenaUI,
            'tournament-hall': TournamentHallUI,
            '3d-museum': PostcardMuseumUI,
            'command-room': CommandRoomUI
        };
        
        const ComponentClass = componentMap[themeId] || ClassicGameUI;
        
        try {
            this.ui = new ComponentClass(container);
            await this.ui.init();
            
            // 记录加载时间
            const loadTime = performance.now();
            if (this.abTest) {
                this.abTest.onUILoad(themeId, loadTime);
            }
            
            console.log(`[EnhancedStreakMode] 主题组件加载完成: ${themeId}`);
        } catch (error) {
            console.error(`[EnhancedStreakMode] 加载主题失败: ${themeId}`, error);
            // 回退到经典版
            this.ui = new ClassicGameUI(container);
            await this.ui.init();
        }
    }
    
    // 开始游戏
    startGame() {
        this.gameState.isPlaying = true;
        this.gameState.currentStreak = 0;
        this.gameState.currentLevel = 0;
        
        // 生成牌组
        this.generateDecks();
        
        // 更新UI
        this.updateUI();
        
        console.log('[EnhancedStreakMode] 游戏开始');
    }
    
    // 生成牌组
    generateDecks() {
        const deck = [];
        
        // 2副牌
        for (let d = 0; d < 2; d++) {
            for (const suit of this.config.suits) {
                for (const rank of this.config.ranks) {
                    deck.push({
                        suit,
                        rank,
                        value: this.config.ranks.indexOf(rank),
                        isRed: suit === '♥' || suit === '♦',
                        deck: d,
                        id: `${suit}${rank}_${d}`
                    });
                }
            }
        }
        
        // 洗牌
        this.shuffleArray(deck);
        
        // 分配守卫牌（每层4张）
        this.gameState.guardCards = [];
        for (let level = 0; level < this.config.levels; level++) {
            const levelCards = deck.splice(0, this.config.cardsPerLevel);
            this.gameState.guardCards.push(levelCards);
        }
        
        // 分配玩家手牌
        this.gameState.playerHand = deck;
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    
    // 更新UI
    updateUI() {
        if (this.ui && this.ui.update) {
            this.ui.update({
                streak: this.gameState.currentStreak,
                level: `${this.config.ranks[this.gameState.currentLevel] || 'A'}/${this.config.ranks[this.gameState.currentLevel] || 'A'}`,
                cardsRemaining: this.gameState.playerHand.length,
                guards: this.gameState.guardCards[this.gameState.currentLevel]?.length || 0
            });
        }
        
        // 渲染手牌
        this.renderHand();
    }
    
    // 渲染手牌
    renderHand() {
        const handContainer = document.getElementById('handContainer');
        if (!handContainer) return;
        
        handContainer.innerHTML = this.gameState.playerHand.slice(0, 10).map((card, index) => `
            <div class="game-card ${card.isRed ? 'red' : 'black'} ${this.gameState.selectedCardIndex === index ? 'selected' : ''}"
                 onclick="enhancedStreakMode.selectCard(${index})">
                <span class="card-suit">${card.suit}</span>
                <span class="card-rank">${card.rank}</span>
            </div>
        `).join('');
        
        // 添加样式
        this.applyCardStyles();
    }
    
    applyCardStyles() {
        if (document.getElementById('gameCardStyles')) return;
        
        const styles = `
            .game-card {
                width: 50px;
                height: 70px;
                background: linear-gradient(135deg, #fff, #f0f0f0);
                border-radius: 6px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                border: 2px solid transparent;
                user-select: none;
            }
            
            .game-card.red { color: #ff0000; }
            .game-card.black { color: #000; }
            
            .game-card:hover {
                transform: translateY(-5px);
                border-color: #ffd700;
                box-shadow: 0 5px 15px rgba(255,215,0,0.3);
            }
            
            .game-card.selected {
                border-color: #00ff00;
                transform: translateY(-10px);
                box-shadow: 0 5px 20px rgba(0,255,0,0.5);
            }
            
            .card-suit { font-size: 18px; }
            .card-rank { font-size: 14px; font-weight: bold; }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.id = 'gameCardStyles';
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    // 选择卡牌
    selectCard(index) {
        this.gameState.selectedCardIndex = index;
        this.renderHand();
    }
    
    // 出牌
    playRound() {
        if (this.gameState.selectedCardIndex === -1) {
            alert('请先选择一张卡牌！');
            return;
        }
        
        const playerCard = this.gameState.playerHand[this.gameState.selectedCardIndex];
        const currentLevelCards = this.gameState.guardCards[this.gameState.currentLevel];
        
        if (!currentLevelCards || currentLevelCards.length === 0) {
            // 本层完成，进入下一层
            this.advanceLevel();
            return;
        }
        
        // 抽取守卫牌
        const guardCard = currentLevelCards.shift();
        
        // 比较
        const win = playerCard.value > guardCard.value;
        
        // 移除已使用的手牌
        this.gameState.playerHand.splice(this.gameState.selectedCardIndex, 1);
        this.gameState.selectedCardIndex = -1;
        
        if (win) {
            this.handleWin();
        } else {
            this.handleLoss();
        }
        
        this.updateUI();
    }
    
    // 处理胜利
    handleWin() {
        this.gameState.currentStreak++;
        
        // 检查是否完成当前层
        if (this.gameState.guardCards[this.gameState.currentLevel].length === 0) {
            this.gameState.currentLevel++;
            
            // 检查是否完成所有层
            if (this.gameState.currentLevel >= this.config.levels) {
                this.handlePerfectRun();
                return;
            }
        }
        
        // AB测试追踪
        if (this.abTest) {
            this.abTest.onGameEnd(this.theme, {
                win: true,
                layers: this.gameState.currentLevel,
                cardsUsed: 1,
                duration: 0,
                newStreak: this.gameState.currentStreak,
                oldStreak: this.gameState.currentStreak - 1
            }, this.sessionId);
        }
    }
    
    // 处理失败
    handleLoss() {
        const oldStreak = this.gameState.currentStreak;
        this.gameState.currentStreak = 0;
        
        // AB测试追踪
        if (this.abTest) {
            this.abTest.onGameEnd(this.theme, {
                win: false,
                layers: this.gameState.currentLevel,
                cardsUsed: 1,
                duration: 0,
                newStreak: 0,
                oldStreak: oldStreak
            }, this.sessionId);
        }
        
        // 结束游戏
        this.endGame(false);
    }
    
    // 完美通关
    handlePerfectRun() {
        // AB测试追踪
        if (this.abTest) {
            this.abTest.onGameEnd(this.theme, {
                win: true,
                layers: this.config.levels,
                cardsUsed: 52,
                duration: 0,
                newStreak: this.config.maxStreak,
                oldStreak: this.config.maxStreak - 1,
                perfect: true
            }, this.sessionId);
        }
        
        this.endGame(true);
    }
    
    // 结束游戏
    endGame(perfect) {
        this.gameState.isPlaying = false;
        
        // 结束AB测试会话
        if (this.abTest && this.sessionId) {
            this.abTest.endSession(this.sessionId, perfect ? 'perfect' : 'defeat');
        }
        
        // 显示结果
        setTimeout(() => {
            alert(perfect ? '🎉 完美通关！13连胜！' : `💔 连胜结束！最高: ${this.gameState.currentStreak}`);
            this.showThemeSelector();
        }, 500);
    }
    
    // 放弃
    quitRun() {
        if (confirm('确定要放弃当前挑战吗？连胜将被重置！')) {
            this.endGame(false);
        }
    }
    
    // 返回菜单
    backToMenu() {
        this.endGame(false);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EnhancedStreakMode };
}

// 浏览器环境 - 创建全局实例
if (typeof window !== 'undefined') {
    window.EnhancedStreakMode = EnhancedStreakMode;
    window.enhancedStreakMode = new EnhancedStreakMode();
}
