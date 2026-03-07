/**
 * Allegro 最强模式 - AB测试埋点系统
 * UI主题性能AB测试
 */

class ABTestSystem {
    constructor() {
        this.tests = {
            'ui_theme_performance': {
                id: 'ui_theme_performance',
                name: '连胜模式界面AB测试',
                nameEn: 'Streak Mode UI AB Test',
                description: '比较5个不同主题界面的用户表现',
                startDate: '2026-03-08',
                endDate: null, // 持续进行直到手动停止
                status: 'running',
                variants: Object.keys(UI_THEMES || {}),
                metrics: [
                    'session_duration',      // 平均游戏时长
                    'completion_rate',       // 连胜完成率
                    'retention_d1',          // 次日留存
                    'retention_d7',          // 7日留存
                    'purchase_conversion',   // 付费转化率
                    'share_rate',           // 分享率
                    'ui_load_time',         // 界面加载时间
                    'error_rate',           // 错误率
                    'user_satisfaction'     // 用户满意度评分
                ],
                sampleSize: 10000, // 目标样本量
                confidenceLevel: 0.95
            }
        };
        
        this.sessionData = {};
        this.eventQueue = [];
        this.flushInterval = null;
        
        // 初始化
        this.init();
    }
    
    init() {
        // 启动定时刷新
        this.flushInterval = setInterval(() => this.flushEvents(), 30000); // 30秒刷新一次
        
        // 页面卸载时刷新
        window.addEventListener('beforeunload', () => this.flushEvents());
        
        console.log('[ABTest] AB测试系统已初始化');
    }
    
    // 生成会话ID
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // 获取用户ID
    getUserId() {
        let userId = localStorage.getItem('allegroUserId');
        if (!userId) {
            userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('allegroUserId', userId);
        }
        return userId;
    }
    
    // 开始新会话
    startSession(themeId) {
        const sessionId = this.generateSessionId();
        const userId = this.getUserId();
        
        this.sessionData[sessionId] = {
            sessionId,
            userId,
            themeId,
            startTime: Date.now(),
            events: [],
            metrics: {
                gamesPlayed: 0,
                gamesWon: 0,
                maxStreak: 0,
                totalDuration: 0,
                cardsUsed: 0,
                layersClimbed: 0,
                purchases: [],
                shares: 0,
                errors: []
            }
        };
        
        // 记录会话开始
        this.track('session_start', {
            sessionId,
            userId,
            themeId,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            screenResolution: `${screen.width}x${screen.height}`,
            language: navigator.language,
            platform: navigator.platform
        });
        
        return sessionId;
    }
    
    // 结束会话
    endSession(sessionId, reason = 'normal') {
        const session = this.sessionData[sessionId];
        if (!session) return;
        
        const duration = Date.now() - session.startTime;
        session.metrics.totalDuration = duration;
        
        this.track('session_end', {
            sessionId,
            userId: session.userId,
            themeId: session.themeId,
            duration,
            reason,
            metrics: session.metrics
        });
        
        // 清理会话数据
        delete this.sessionData[sessionId];
        
        // 立即刷新
        this.flushEvents();
    }
    
    // 记录主题使用数据
    trackThemeUsage(themeId, event, data = {}, sessionId = null) {
        const eventData = {
            type: `theme_${themeId}_${event}`,
            themeId,
            event,
            timestamp: Date.now(),
            sessionId: sessionId || this.getCurrentSessionId(),
            userId: this.getUserId(),
            ...data
        };
        
        this.track(eventData.type, eventData);
        
        // 更新会话数据
        if (sessionId && this.sessionData[sessionId]) {
            this.sessionData[sessionId].events.push(eventData);
        }
    }
    
    // 获取当前会话ID
    getCurrentSessionId() {
        // 从URL参数或sessionStorage获取
        return sessionStorage.getItem('allegroCurrentSessionId') || null;
    }
    
    // 设置当前会话ID
    setCurrentSessionId(sessionId) {
        sessionStorage.setItem('allegroCurrentSessionId', sessionId);
    }
    
    // 通用追踪方法
    track(eventName, data = {}) {
        const event = {
            event: eventName,
            timestamp: Date.now(),
            userId: this.getUserId(),
            ...data
        };
        
        this.eventQueue.push(event);
        
        // 如果队列过大，立即刷新
        if (this.eventQueue.length >= 50) {
            this.flushEvents();
        }
        
        console.log(`[ABTest] Track: ${eventName}`, data);
    }
    
    // 游戏开始
    onGameStart(themeId, sessionId = null) {
        const sid = sessionId || this.getCurrentSessionId();
        
        this.trackThemeUsage(themeId, 'game_start', {
            streak_count: this.getCurrentStreak(),
            hand_cards: 52,
            session_id: sid
        }, sid);
        
        if (sid && this.sessionData[sid]) {
            this.sessionData[sid].metrics.gamesPlayed++;
        }
    }
    
    // 游戏结束
    onGameEnd(themeId, result, sessionId = null) {
        const sid = sessionId || this.getCurrentSessionId();
        
        this.trackThemeUsage(themeId, 'game_end', {
            result: result.win ? 'win' : 'lose',
            layers_climbed: result.layers,
            cards_used: result.cardsUsed,
            duration: result.duration,
            current_streak: result.newStreak,
            previous_streak: result.oldStreak,
            session_id: sid
        }, sid);
        
        if (sid && this.sessionData[sid]) {
            const metrics = this.sessionData[sid].metrics;
            if (result.win) {
                metrics.gamesWon++;
            }
            metrics.maxStreak = Math.max(metrics.maxStreak, result.newStreak);
            metrics.cardsUsed += result.cardsUsed || 0;
            metrics.layersClimbed += result.layers || 0;
        }
    }
    
    // 界面加载时间
    onUILoad(themeId, loadTime) {
        this.trackThemeUsage(themeId, 'ui_load', {
            load_time_ms: loadTime,
            load_time_category: this.categorizeLoadTime(loadTime)
        });
    }
    
    categorizeLoadTime(ms) {
        if (ms < 1000) return 'fast';
        if (ms < 3000) return 'normal';
        if (ms < 5000) return 'slow';
        return 'very_slow';
    }
    
    // 用户满意度评分
    onSatisfactionRating(themeId, rating, feedback = '') {
        this.trackThemeUsage(themeId, 'satisfaction_rating', {
            rating, // 1-5
            feedback,
            rating_category: rating >= 4 ? 'positive' : rating >= 3 ? 'neutral' : 'negative'
        });
    }
    
    // 分享行为
    onShare(themeId, platform, sessionId = null) {
        const sid = sessionId || this.getCurrentSessionId();
        
        this.trackThemeUsage(themeId, 'share', {
            platform, // wechat, weibo, qq, etc.
            timestamp: Date.now()
        }, sid);
        
        if (sid && this.sessionData[sid]) {
            this.sessionData[sid].metrics.shares++;
        }
    }
    
    // 付费转化
    onPurchase(themeId, item, amount, currency = 'CNY', sessionId = null) {
        const sid = sessionId || this.getCurrentSessionId();
        
        this.trackThemeUsage(themeId, 'purchase', {
            item_id: item.id,
            item_name: item.name,
            amount,
            currency,
            timestamp: Date.now()
        }, sid);
        
        if (sid && this.sessionData[sid]) {
            this.sessionData[sid].metrics.purchases.push({
                item,
                amount,
                currency,
                timestamp: Date.now()
            });
        }
    }
    
    // 错误记录
    onError(themeId, error, sessionId = null) {
        const sid = sessionId || this.getCurrentSessionId();
        
        this.trackThemeUsage(themeId, 'error', {
            error_message: error.message,
            error_stack: error.stack,
            error_type: error.name,
            timestamp: Date.now()
        }, sid);
        
        if (sid && this.sessionData[sid]) {
            this.sessionData[sid].metrics.errors.push({
                message: error.message,
                timestamp: Date.now()
            });
        }
    }
    
    // 刷新事件队列
    async flushEvents() {
        if (this.eventQueue.length === 0) return;
        
        const events = [...this.eventQueue];
        this.eventQueue = [];
        
        try {
            // 尝试发送到服务器
            if (typeof allegroAPI !== 'undefined') {
                await allegroAPI.trackEvents(events);
            } else {
                // 本地存储作为备用
                this.storeEventsLocally(events);
            }
        } catch (error) {
            console.error('[ABTest] 发送事件失败:', error);
            // 重新加入队列
            this.eventQueue.unshift(...events);
        }
    }
    
    // 本地存储事件
    storeEventsLocally(events) {
        const stored = JSON.parse(localStorage.getItem('allegroABTestEvents') || '[]');
        stored.push(...events);
        
        // 只保留最近1000条
        if (stored.length > 1000) {
            stored.splice(0, stored.length - 1000);
        }
        
        localStorage.setItem('allegroABTestEvents', JSON.stringify(stored));
    }
    
    // 生成AB测试报告
    generateReport(period = 'last_7_days') {
        const report = {
            period,
            generatedAt: Date.now(),
            testId: 'ui_theme_performance',
            themes: {}
        };
        
        const themes = UI_THEMES ? Object.keys(UI_THEMES) : 
            ['classic', '3d-tower', 'card-arena', 'tournament-hall', '3d-museum', 'command-room'];
        
        themes.forEach(themeId => {
            report.themes[themeId] = {
                usage_count: this.getEventCount(`theme_${themeId}_game_start`, period),
                game_completions: this.getEventCount(`theme_${themeId}_game_end`, period),
                win_count: this.getWinCount(themeId, period),
                avg_session_duration: this.getAvgDuration(themeId, period),
                avg_load_time: this.getAvgLoadTime(themeId, period),
                satisfaction_score: this.getSatisfactionScore(themeId, period),
                share_count: this.getEventCount(`theme_${themeId}_share`, period),
                purchase_count: this.getEventCount(`theme_${themeId}_purchase`, period),
                error_count: this.getEventCount(`theme_${themeId}_error`, period)
            };
            
            // 计算胜率
            const completions = report.themes[themeId].game_completions;
            const wins = report.themes[themeId].win_count;
            report.themes[themeId].win_rate = completions > 0 ? (wins / completions * 100).toFixed(2) + '%' : '0%';
        });
        
        return report;
    }
    
    // 辅助方法：获取事件数量
    getEventCount(eventType, period) {
        // 从本地存储计算
        const events = this.getStoredEvents();
        const cutoff = this.getPeriodCutoff(period);
        
        return events.filter(e => 
            e.event === eventType && 
            e.timestamp >= cutoff
        ).length;
    }
    
    // 获取获胜次数
    getWinCount(themeId, period) {
        const events = this.getStoredEvents();
        const cutoff = this.getPeriodCutoff(period);
        
        return events.filter(e => 
            e.event === `theme_${themeId}_game_end` &&
            e.result === 'win' &&
            e.timestamp >= cutoff
        ).length;
    }
    
    // 获取平均时长
    getAvgDuration(themeId, period) {
        const events = this.getStoredEvents();
        const cutoff = this.getPeriodCutoff(period);
        
        const durations = events
            .filter(e => 
                e.event === `theme_${themeId}_game_end` &&
                e.duration &&
                e.timestamp >= cutoff
            )
            .map(e => e.duration);
        
        if (durations.length === 0) return 0;
        return durations.reduce((a, b) => a + b, 0) / durations.length;
    }
    
    // 获取平均加载时间
    getAvgLoadTime(themeId, period) {
        const events = this.getStoredEvents();
        const cutoff = this.getPeriodCutoff(period);
        
        const loadTimes = events
            .filter(e => 
                e.event === `theme_${themeId}_ui_load` &&
                e.load_time_ms &&
                e.timestamp >= cutoff
            )
            .map(e => e.load_time_ms);
        
        if (loadTimes.length === 0) return 0;
        return loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
    }
    
    // 获取满意度分数
    getSatisfactionScore(themeId, period) {
        const events = this.getStoredEvents();
        const cutoff = this.getPeriodCutoff(period);
        
        const ratings = events
            .filter(e => 
                e.event === `theme_${themeId}_satisfaction_rating` &&
                e.rating &&
                e.timestamp >= cutoff
            )
            .map(e => e.rating);
        
        if (ratings.length === 0) return 0;
        return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2);
    }
    
    // 获取存储的事件
    getStoredEvents() {
        return JSON.parse(localStorage.getItem('allegroABTestEvents') || '[]');
    }
    
    // 获取时间段截止点
    getPeriodCutoff(period) {
        const now = Date.now();
        const days = {
            'last_24h': 1,
            'last_7_days': 7,
            'last_30_days': 30
        };
        return now - (days[period] || 7) * 24 * 60 * 60 * 1000;
    }
    
    // 获取当前连胜数
    getCurrentStreak() {
        return parseInt(sessionStorage.getItem('allegroCurrentStreak') || '0');
    }
    
    // 销毁
    destroy() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        this.flushEvents();
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ABTestSystem };
}

// 浏览器环境
if (typeof window !== 'undefined') {
    window.ABTestSystem = ABTestSystem;
    window.abTest = new ABTestSystem();
}
