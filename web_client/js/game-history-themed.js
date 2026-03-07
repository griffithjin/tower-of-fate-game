/**
 * 命运塔 - 牌局记录主题配套系统
 * Themed Game History System - Allegro最强模式
 * 
 * 支持主题化的牌局历史记录和视觉化回放
 */

class ThemedGameHistory {
    constructor() {
        this.currentTheme = 'classic';
        this.historyRecords = [];
        this.maxRecords = 100; // 最大保存记录数
        
        // 主题配置
        this.themes = {
            classic: {
                name: '经典主题',
                nameEn: 'Classic Theme',
                primaryColor: '#e74c3c',
                secondaryColor: '#2c3e50',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                fontFamily: '"Playfair Display", serif',
                cardStyle: 'classic'
            },
            neon: {
                name: '霓虹主题',
                nameEn: 'Neon Theme',
                primaryColor: '#ff00ff',
                secondaryColor: '#00ffff',
                background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a3e 100%)',
                fontFamily: '"Orbitron", monospace',
                cardStyle: 'neon'
            },
            gold: {
                name: '黄金主题',
                nameEn: 'Gold Theme',
                primaryColor: '#ffd700',
                secondaryColor: '#b8860b',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                fontFamily: '"Cinzel", serif',
                cardStyle: 'gold'
            },
            nature: {
                name: '自然主题',
                nameEn: 'Nature Theme',
                primaryColor: '#2ecc71',
                secondaryColor: '#27ae60',
                background: 'linear-gradient(135deg, #1a2f1a 0%, #0f2f0f 100%)',
                fontFamily: '"Crimson Text", serif',
                cardStyle: 'nature'
            },
            ocean: {
                name: '海洋主题',
                nameEn: 'Ocean Theme',
                primaryColor: '#3498db',
                secondaryColor: '#2980b9',
                background: 'linear-gradient(135deg, #0a1628 0%, #1a3a52 100%)',
                fontFamily: '"Merriweather", serif',
                cardStyle: 'ocean'
            }
        };
        
        // 牌组表情映射
        this.deckEmojis = {
            classic: { hearts: '❤️', diamonds: '♦️', clubs: '♣️', spades: '♠️' },
            cartoon: { cute: '🥰', cool: '😎', happy: '🤗', silly: '🤪' },
            animals: { land: '🦁', sea: '🐋', sky: '🦅', forest: '🐼' },
            fruits: { berries: '🍓', citrus: '🍊', tropical: '🍍', stone: '🍑' },
            space: { rockets: '🚀', stars: '⭐', planets: '🪐', moons: '🌙' },
            emoji: { love: '😍', cool: '😎', laugh: '😂', party: '🥳' },
            fairy: { fairies: '🧚‍♀️', unicorns: '🦄', wizards: '🧙‍♂️', dragons: '🐉' }
        };
        
        // 结果图标
        this.resultIcons = {
            win: '🏆',
            lose: '😢',
            draw: '🤝',
            surrender: '🏳️'
        };
        
        // 初始化
        this.loadFromStorage();
    }
    
    /**
     * 设置当前主题
     */
    setTheme(themeName) {
        if (this.themes[themeName]) {
            this.currentTheme = themeName;
            return true;
        }
        console.warn(`[GameHistory] 无效的主题: ${themeName}`);
        return false;
    }
    
    /**
     * 记录一局游戏
     */
    recordGame(gameData) {
        const record = {
            id: this.generateId(),
            timestamp: Date.now(),
            theme: this.currentTheme,
            deck: gameData.deckType || 'classic',
            gameMode: gameData.gameMode || 'classic',
            
            // 玩家信息
            players: gameData.players || [],
            winner: gameData.winner || null,
            
            // 视觉化记录
            visualLog: this.generateVisualLog(gameData),
            
            // 详细回合数据
            rounds: gameData.rounds ? gameData.rounds.map((round, index) => ({
                round: index + 1,
                playerId: round.playerId,
                playerCard: {
                    suit: round.playerCard?.suit,
                    rank: round.playerCard?.rank,
                    symbol: this.getCardSymbol(gameData.deckType, round.playerCard?.suit)
                },
                guardCard: {
                    suit: round.guardCard?.suit,
                    rank: round.guardCard?.rank,
                    symbol: this.getCardSymbol(gameData.deckType, round.guardCard?.suit)
                },
                result: round.result,
                layersChanged: round.layersChanged || 0,
                specialEffects: round.specialEffects || [],
                taunts: round.taunts || [],
                timestamp: round.timestamp
            })) : [],
            
            // 最终结果
            result: gameData.result,
            finalLayer: gameData.finalLayer || 0,
            targetLayer: gameData.targetLayer || 100,
            cardsUsed: gameData.cardsUsed || 0,
            duration: gameData.duration || 0,
            
            // 统计数据
            stats: {
                totalMatches: gameData.stats?.totalMatches || 0,
                specialEffectsTriggered: gameData.stats?.specialEffectsTriggered || 0,
                tauntsSent: gameData.stats?.tauntsSent || 0,
                maxCombo: gameData.stats?.maxCombo || 0
            }
        };
        
        this.historyRecords.unshift(record);
        
        // 限制记录数量
        if (this.historyRecords.length > this.maxRecords) {
            this.historyRecords = this.historyRecords.slice(0, this.maxRecords);
        }
        
        // 保存到本地存储
        this.saveToStorage();
        
        return record;
    }
    
    /**
     * 生成视觉化记录
     */
    generateVisualLog(gameData) {
        const deckType = gameData.deckType || 'classic';
        const emojis = this.deckEmojis[deckType] || this.deckEmojis.classic;
        
        if (!gameData.rounds) return [];
        
        return gameData.rounds.map((round, index) => {
            const playerEmoji = emojis[round.playerCard?.suit] || round.playerCard?.suit || '❓';
            const isWin = round.result === 'win';
            const direction = isWin ? '⬆️' : (round.result === 'lose' ? '⬇️' : '➡️');
            const hasSpecial = round.specialEffects && round.specialEffects.length > 0;
            
            return {
                round: index + 1,
                visual: `${playerEmoji}${round.playerCard?.rank || '?'} ${direction} ${Math.abs(round.layersChanged || 0)}层`,
                fullVisual: this.createFullVisual(round, emojis),
                hasSpecialEffect: hasSpecial,
                specialEffects: round.specialEffects || [],
                result: round.result,
                timestamp: round.timestamp
            };
        });
    }
    
    /**
     * 创建完整视觉表示
     */
    createFullVisual(round, emojis) {
        const playerEmoji = emojis[round.playerCard?.suit] || round.playerCard?.suit || '❓';
        const guardEmoji = emojis[round.guardCard?.suit] || round.guardCard?.suit || '❓';
        
        return {
            player: `${playerEmoji} ${round.playerCard?.rank || '?'}`,
            guard: `${guardEmoji} ${round.guardCard?.rank || '?'}`,
            vs: 'VS',
            result: round.result,
            layers: round.layersChanged || 0
        };
    }
    
    /**
     * 获取卡牌符号
     */
    getCardSymbol(deckType, suit) {
        const emojis = this.deckEmojis[deckType] || this.deckEmojis.classic;
        return emojis[suit] || suit;
    }
    
    /**
     * 渲染历史记录列表
     */
    renderHistory(container, options = {}) {
        if (!container) return;
        
        const { limit = 10, filter = null, theme = null } = options;
        let records = this.historyRecords;
        
        // 应用过滤器
        if (filter) {
            records = records.filter(filter);
        }
        
        // 限制数量
        records = records.slice(0, limit);
        
        container.innerHTML = '';
        
        if (records.length === 0) {
            container.innerHTML = `
                <div class="history-empty">
                    <div class="empty-icon">📜</div>
                    <div class="empty-text">暂无游戏记录</div>
                </div>
            `;
            return;
        }
        
        records.forEach(record => {
            const recordEl = this.createRecordElement(record, theme);
            container.appendChild(recordEl);
        });
    }
    
    /**
     * 创建记录元素
     */
    createRecordElement(record, overrideTheme = null) {
        const theme = overrideTheme || record.theme;
        const themeConfig = this.themes[theme] || this.themes.classic;
        const resultIcon = this.resultIcons[record.result] || '❓';
        
        const recordEl = document.createElement('div');
        recordEl.className = `history-record theme-${theme}`;
        recordEl.dataset.recordId = record.id;
        
        const date = new Date(record.timestamp);
        const dateStr = date.toLocaleDateString('zh-CN');
        const timeStr = date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        recordEl.innerHTML = `
            <div class="history-header" style="background: ${themeConfig.background}">
                <div class="history-meta">
                    <span class="history-date">${dateStr} ${timeStr}</span>
                    <span class="history-theme-badge" style="color: ${themeConfig.primaryColor}">
                        ${themeConfig.name}
                    </span>
                </div>
                <div class="history-deck-info">
                    <span class="deck-badge">${this.getDeckDisplayName(record.deck)}</span>
                    <span class="mode-badge">${this.getModeDisplayName(record.gameMode)}</span>
                </div>
            </div>
            
            <div class="history-visual-log">
                ${record.visualLog.slice(0, 5).map(log => `
                    <div class="log-entry ${log.hasSpecialEffect ? 'special' : ''}" 
                         title="第${log.round}回合">
                        <span class="log-round">#${log.round}</span>
                        <span class="log-visual">${log.visual}</span>
                        ${log.hasSpecialEffect ? '<span class="special-badge">✨</span>' : ''}
                    </div>
                `).join('')}
                ${record.visualLog.length > 5 ? `
                    <div class="log-more">+${record.visualLog.length - 5} 更多回合...</div>
                ` : ''}
            </div>
            
            <div class="history-stats">
                <div class="stat-item">
                    <span class="stat-label">回合</span>
                    <span class="stat-value">${record.rounds.length}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">特效</span>
                    <span class="stat-value">${record.stats.specialEffectsTriggered}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">用时</span>
                    <span class="stat-value">${this.formatDuration(record.duration)}</span>
                </div>
            </div>
            
            <div class="history-result" style="border-color: ${themeConfig.primaryColor}">
                <span class="result-icon" style="color: ${themeConfig.primaryColor}">${resultIcon}</span>
                <span class="result-text result-${record.result}">
                    ${record.result === 'win' ? '胜利' : (record.result === 'lose' ? '失败' : '平局')}
                </span>
                <span class="result-details">
                    到达第${record.finalLayer}/${record.targetLayer}层 · 使用${record.cardsUsed}张牌
                </span>
            </div>
            
            <div class="history-actions">
                <button class="action-btn replay-btn" onclick="gameHistory.replayGame('${record.id}')">
                    ▶️ 回放
                </button>
                <button class="action-btn share-btn" onclick="gameHistory.shareRecord('${record.id}')">
                    📤 分享
                </button>
                <button class="action-btn delete-btn" onclick="gameHistory.deleteRecord('${record.id}')">
                    🗑️ 删除
                </button>
            </div>
        `;
        
        return recordEl;
    }
    
    /**
     * 回放游戏
     */
    replayGame(recordId) {
        const record = this.historyRecords.find(r => r.id === recordId);
        if (!record) {
            console.warn(`[GameHistory] 未找到记录: ${recordId}`);
            return;
        }
        
        // 触发放屏事件
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('replayGame', { detail: record }));
        }
        
        console.log(`[GameHistory] 开始回放游戏: ${recordId}`);
        return record;
    }
    
    /**
     * 分享记录
     */
    shareRecord(recordId) {
        const record = this.historyRecords.find(r => r.id === recordId);
        if (!record) return;
        
        const shareData = {
            title: `命运塔战绩 - ${record.result === 'win' ? '胜利' : '失败'}`,
            text: `我在命运塔中${record.result === 'win' ? '成功登顶' : '挑战失败'}，到达了第${record.finalLayer}层！`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            // 复制到剪贴板
            const text = `${shareData.title}\n${shareData.text}`;
            navigator.clipboard.writeText(text).then(() => {
                alert('战绩已复制到剪贴板！');
            });
        }
    }
    
    /**
     * 删除记录
     */
    deleteRecord(recordId) {
        const index = this.historyRecords.findIndex(r => r.id === recordId);
        if (index > -1) {
            this.historyRecords.splice(index, 1);
            this.saveToStorage();
            return true;
        }
        return false;
    }
    
    /**
     * 获取牌组显示名称
     */
    getDeckDisplayName(deckType) {
        const names = {
            classic: '经典扑克',
            cartoon: '卡通世界',
            animals: '动物王国',
            fruits: '水果乐园',
            space: '星际探险',
            emoji: '表情派对',
            fairy: '童话仙境'
        };
        return names[deckType] || deckType;
    }
    
    /**
     * 获取模式显示名称
     */
    getModeDisplayName(mode) {
        const names = {
            classic: '经典模式',
            streak: '连胜模式',
            tournament: '锦标赛',
            team: '团队战'
        };
        return names[mode] || mode;
    }
    
    /**
     * 格式化时长
     */
    formatDuration(seconds) {
        if (seconds < 60) return `${seconds}秒`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}分${secs}秒`;
    }
    
    /**
     * 生成唯一ID
     */
    generateId() {
        return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * 保存到本地存储
     */
    saveToStorage() {
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('fateTowerGameHistory', JSON.stringify({
                    records: this.historyRecords,
                    lastUpdated: Date.now()
                }));
            } catch (e) {
                console.warn('[GameHistory] 保存失败:', e);
            }
        }
    }
    
    /**
     * 从本地存储加载
     */
    loadFromStorage() {
        if (typeof localStorage !== 'undefined') {
            try {
                const data = localStorage.getItem('fateTowerGameHistory');
                if (data) {
                    const parsed = JSON.parse(data);
                    this.historyRecords = parsed.records || [];
                }
            } catch (e) {
                console.warn('[GameHistory] 加载失败:', e);
            }
        }
    }
    
    /**
     * 获取统计数据
     */
    getStatistics() {
        const stats = {
            totalGames: this.historyRecords.length,
            wins: 0,
            losses: 0,
            draws: 0,
            totalLayers: 0,
            totalCardsUsed: 0,
            totalDuration: 0,
            favoriteDeck: null,
            highestLayer: 0,
            winRate: 0
        };
        
        const deckCounts = {};
        
        this.historyRecords.forEach(record => {
            // 胜负统计
            if (record.result === 'win') stats.wins++;
            else if (record.result === 'lose') stats.losses++;
            else stats.draws++;
            
            // 累计数据
            stats.totalLayers += record.finalLayer || 0;
            stats.totalCardsUsed += record.cardsUsed || 0;
            stats.totalDuration += record.duration || 0;
            
            // 最高层数
            stats.highestLayer = Math.max(stats.highestLayer, record.finalLayer || 0);
            
            // 牌组偏好
            deckCounts[record.deck] = (deckCounts[record.deck] || 0) + 1;
        });
        
        // 计算胜率
        if (stats.totalGames > 0) {
            stats.winRate = ((stats.wins / stats.totalGames) * 100).toFixed(1);
        }
        
        // 找出最常使用的牌组
        let maxCount = 0;
        for (const [deck, count] of Object.entries(deckCounts)) {
            if (count > maxCount) {
                maxCount = count;
                stats.favoriteDeck = deck;
            }
        }
        
        // 平均值
        if (stats.totalGames > 0) {
            stats.avgLayers = (stats.totalLayers / stats.totalGames).toFixed(1);
            stats.avgCards = (stats.totalCardsUsed / stats.totalGames).toFixed(1);
            stats.avgDuration = (stats.totalDuration / stats.totalGames).toFixed(0);
        }
        
        return stats;
    }
    
    /**
     * 清空所有记录
     */
    clearAll() {
        this.historyRecords = [];
        this.saveToStorage();
    }
    
    /**
     * 导出记录
     */
    exportRecords() {
        return JSON.stringify({
            version: '1.0',
            exportDate: new Date().toISOString(),
            records: this.historyRecords
        }, null, 2);
    }
    
    /**
     * 导入记录
     */
    importRecords(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (data.records && Array.isArray(data.records)) {
                this.historyRecords = data.records;
                this.saveToStorage();
                return { success: true, count: data.records.length };
            }
            return { success: false, error: '无效的数据格式' };
        } catch (e) {
            return { success: false, error: e.message };
        }
    }
}

// 全局实例
let gameHistory;
if (typeof window !== 'undefined') {
    gameHistory = new ThemedGameHistory();
    window.gameHistory = gameHistory;
    window.ThemedGameHistory = ThemedGameHistory;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemedGameHistory;
}
