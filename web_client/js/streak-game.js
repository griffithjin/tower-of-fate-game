/**
 * 命运之塔 - 连胜赛游戏逻辑
 * Streak Mode Game Logic
 * 
 * 核心规则：
 * - 连胜目标：连续赢13局
 * - 牌组：2副牌104张
 * - 13层塔 × 每层4张守卫牌 = 52张守卫牌
 * - 玩家52张手牌
 * - 每局独立，连胜计数
 * - 失败即结束，重置连胜
 */

class StreakGame {
    constructor() {
        // 游戏配置
        this.config = {
            maxStreak: 13,
            levels: 13,
            cardsPerLevel: 4,
            totalGuardCards: 52,
            totalPlayerCards: 52,
            suits: ['♠', '♥', '♣', '♦'],
            ranks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
            levelNames: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']
        };
        
        // 游戏状态
        this.state = {
            isPlaying: false,
            currentStreak: 0,
            currentLevel: 0, // 0-based index
            guardCards: [],
            playerHand: [],
            history: [],
            selectedCardIndex: -1,
            rewards: []
        };
        
        // 玩家数据（从本地存储加载）
        this.playerData = this.loadPlayerData();
        
        // 奖励配置
        this.rewards = {
            3: { type: 'coins', amount: 500, name: '金币', icon: '🪙', desc: '500金币' },
            5: { type: 'diamonds', amount: 50, name: '钻石', icon: '💎', desc: '50钻石' },
            7: { type: 'skin', amount: 1, name: '稀有皮肤', icon: '👕', desc: '火焰卡牌皮肤' },
            10: { type: 'title', amount: 1, name: '限定称号', icon: '👑', desc: '"连胜王者"称号' },
            13: { type: 'legendary', amount: 1, name: '传说奖励', icon: '🔱', desc: '传说皮肤 + 200钻石', bonus: { diamonds: 200, skin: 'legendary' } }
        };
        
        // 排行榜数据
        this.leaderboards = {
            global: this.generateMockLeaderboard(20),
            friends: this.generateMockLeaderboard(10),
            weekly: this.generateMockLeaderboard(15)
        };
        
        // 当前显示的排行榜
        this.currentLeaderboard = 'global';
    }
    
    /**
     * 初始化游戏
     */
    init() {
        this.renderStreakProgress();
        this.renderRewardPreview();
        this.renderLeaderboard();
        this.updateStats();
        this.generateMilestones();
        console.log('🔥 连胜赛模式已初始化');
    }
    
    /**
     * 生成里程碑标记
     */
    generateMilestones() {
        const container = document.getElementById('streakMilestones');
        if (!container) return;
        
        container.innerHTML = '';
        for (let i = 1; i <= this.config.maxStreak; i++) {
            const milestone = document.createElement('div');
            milestone.className = 'milestone';
            milestone.id = `milestone-${i}`;
            milestone.textContent = i;
            container.appendChild(milestone);
        }
    }
    
    /**
     * 加载玩家数据
     */
    loadPlayerData() {
        const saved = localStorage.getItem('streakGameData');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            bestStreak: 0,
            totalRuns: 0,
            perfectRuns: 0,
            totalWins: 0,
            totalLosses: 0,
            coins: 1000,
            diamonds: 0,
            unlockedSkins: [],
            titles: [],
            history: []
        };
    }
    
    /**
     * 保存玩家数据
     */
    savePlayerData() {
        localStorage.setItem('streakGameData', JSON.stringify(this.playerData));
    }
    
    /**
     * 生成2副扑克牌
     */
    generateDeck() {
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
                        deck: d
                    });
                }
            }
        }
        return this.shuffleArray(deck);
    }
    
    /**
     * 洗牌
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    /**
     * 开始新一轮挑战
     */
    startNewRun() {
        // 生成牌组
        const deck = this.generateDeck();
        
        // 分配守卫牌（52张，每层4张）
        this.state.guardCards = [];
        for (let level = 0; level < this.config.levels; level++) {
            const levelCards = deck.splice(0, this.config.cardsPerLevel);
            this.state.guardCards.push(levelCards);
        }
        
        // 分配玩家手牌（剩余的52张）
        this.state.playerHand = deck;
        
        // 重置游戏状态
        this.state.currentStreak = 0;
        this.state.currentLevel = 0;
        this.state.history = [];
        this.state.selectedCardIndex = -1;
        this.state.isPlaying = true;
        
        // 更新UI
        this.updateUI();
        this.renderHand();
        this.updateGuardDisplay();
        this.clearHistory();
        this.renderStreakProgress();
        this.updateRewardPreview();
        
        // 更新按钮状态
        document.getElementById('startBtn').disabled = true;
        document.getElementById('playBtn').disabled = false;
        document.getElementById('quitBtn').disabled = false;
        
        // 增加总挑战次数
        this.playerData.totalRuns++;
        this.savePlayerData();
        this.updateStats();
        
        console.log('🔥 新的挑战开始！');
        this.showToast('🔥 连胜挑战开始！祝你好运！');
    }
    
    /**
     * 渲染手牌
     */
    renderHand() {
        const container = document.getElementById('handContainer');
        if (!container) return;
        
        container.innerHTML = '';
        this.state.playerHand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card-item';
            if (index === this.state.selectedCardIndex) {
                cardEl.classList.add('selected');
            }
            cardEl.innerHTML = `
                <div class="card-suit" style="color: ${card.isRed ? '#d00' : '#000'}">${card.suit}</div>
                <div class="card-rank">${card.rank}</div>
            `;
            cardEl.addEventListener('click', () => this.selectCard(index));
            container.appendChild(cardEl);
        });
    }
    
    /**
     * 选择手牌
     */
    selectCard(index) {
        if (!this.state.isPlaying) return;
        
        this.state.selectedCardIndex = index;
        this.renderHand();
        
        // 播放音效（如果支持）
        this.playSound('select');
    }
    
    /**
     * 进行一轮游戏
     */
    playRound() {
        if (!this.state.isPlaying) return;
        if (this.state.selectedCardIndex === -1) {
            this.showToast('请先选择一张手牌！');
            return;
        }
        
        // 获取当前层级的守卫牌
        const currentLevelGuards = this.state.guardCards[this.state.currentLevel];
        const guardIndex = Math.floor(Math.random() * currentLevelGuards.length);
        const guardCard = currentLevelGuards[guardIndex];
        
        // 获取玩家选择的牌
        const playerCard = this.state.playerHand[this.state.selectedCardIndex];
        
        // 判定胜负
        const result = this.compareCards(playerCard, guardCard);
        
        // 记录历史
        const historyEntry = {
            level: this.state.currentLevel,
            playerCard,
            guardCard,
            result,
            timestamp: new Date().toISOString()
        };
        this.state.history.push(historyEntry);
        
        // 显示结果
        this.showRoundResult(result, playerCard, guardCard);
        
        if (result.win) {
            // 胜利处理
            this.handleWin(guardIndex);
        } else {
            // 失败处理
            this.handleLoss();
        }
    }
    
    /**
     * 比较牌大小
     * 返回: { win: boolean, type: string }
     * type: 'perfect' (同花色且大), 'suit' (同花色), 'rank' (同点数), 'fail' (输)
     */
    compareCards(playerCard, guardCard) {
        // 同花色同点数 - 完美匹配
        if (playerCard.suit === guardCard.suit && playerCard.rank === guardCard.rank) {
            return { win: true, type: 'perfect' };
        }
        
        // 同花色 - 赢
        if (playerCard.suit === guardCard.suit) {
            return { win: true, type: 'suit' };
        }
        
        // 同点数 - 赢
        if (playerCard.rank === guardCard.rank) {
            return { win: true, type: 'rank' };
        }
        
        // 失败
        return { win: false, type: 'fail' };
    }
    
    /**
     * 处理胜利
     */
    handleWin(guardIndex) {
        // 移除已击败的守卫
        this.state.guardCards[this.state.currentLevel].splice(guardIndex, 1);
        
        // 移除使用的手牌
        this.state.playerHand.splice(this.state.selectedCardIndex, 1);
        this.state.selectedCardIndex = -1;
        
        // 增加连胜
        this.state.currentStreak++;
        
        // 检查是否完成当前层
        if (this.state.guardCards[this.state.currentLevel].length === 0) {
            this.state.currentLevel++;
            this.showToast(`🎉 通过${this.getLevelName(this.state.currentLevel - 1)}层！`);
        }
        
        // 检查是否完成13连胜
        if (this.state.currentStreak >= this.config.maxStreak) {
            this.handlePerfectRun();
            return;
        }
        
        // 播放胜利音效
        this.playSound('win');
        
        // 更新UI
        this.updateUI();
        this.renderHand();
        this.updateGuardDisplay();
        this.renderStreakProgress();
        this.updateRewardPreview();
        this.addHistoryEntry(true);
        
        // 检查里程碑奖励
        this.checkMilestoneRewards();
    }
    
    /**
     * 处理失败
     */
    handleLoss() {
        // 播放失败音效
        this.playSound('lose');
        
        // 震动效果
        document.body.classList.add('shake');
        setTimeout(() => document.body.classList.remove('shake'), 500);
        
        // 记录数据
        this.playerData.totalLosses++;
        this.savePlayerData();
        
        // 结束游戏
        this.endRun(false);
    }
    
    /**
     * 处理完美通关（13连胜）
     */
    handlePerfectRun() {
        this.playerData.perfectRuns++;
        this.endRun(true);
    }
    
    /**
     * 结束本轮挑战
     */
    endRun(isPerfect) {
        this.state.isPlaying = false;
        
        // 更新最高连胜
        if (this.state.currentStreak > this.playerData.bestStreak) {
            this.playerData.bestStreak = this.state.currentStreak;
        }
        
        // 计算奖励
        const rewards = this.calculateRewards();
        this.playerData.rewards = rewards;
        
        // 应用奖励
        this.applyRewards(rewards);
        
        // 保存数据
        this.savePlayerData();
        this.updateStats();
        
        // 显示结束弹窗
        this.showGameOverModal(isPerfect, rewards);
        
        // 更新按钮状态
        document.getElementById('startBtn').disabled = false;
        document.getElementById('playBtn').disabled = true;
        document.getElementById('quitBtn').disabled = true;
    }
    
    /**
     * 放弃挑战
     */
    quitRun() {
        if (!confirm('确定要放弃当前连胜挑战吗？')) return;
        this.endRun(false);
    }
    
    /**
     * 计算奖励
     */
    calculateRewards() {
        const rewards = [];
        const streak = this.state.currentStreak;
        
        // 检查每个里程碑
        for (let i = streak; i >= 1; i--) {
            if (this.rewards[i]) {
                rewards.push({ streak: i, ...this.rewards[i] });
            }
        }
        
        return rewards;
    }
    
    /**
     * 应用奖励
     */
    applyRewards(rewards) {
        rewards.forEach(reward => {
            switch (reward.type) {
                case 'coins':
                    this.playerData.coins += reward.amount;
                    break;
                case 'diamonds':
                    this.playerData.diamonds += reward.amount;
                    break;
                case 'skin':
                    this.playerData.unlockedSkins.push(reward.name);
                    break;
                case 'title':
                    this.playerData.titles.push(reward.name);
                    break;
                case 'legendary':
                    this.playerData.diamonds += reward.bonus.diamonds;
                    this.playerData.unlockedSkins.push(reward.bonus.skin);
                    break;
            }
        });
    }
    
    /**
     * 检查里程碑奖励
     */
    checkMilestoneRewards() {
        const streak = this.state.currentStreak;
        if (this.rewards[streak]) {
            this.showMilestoneCelebration(streak);
        }
    }
    
    /**
     * 显示里程碑庆祝
     */
    showMilestoneCelebration(streak) {
        const reward = this.rewards[streak];
        
        // 创建庆祝弹窗
        const popup = document.createElement('div');
        popup.className = 'streak-popup';
        popup.innerHTML = `
            <div style="font-size: 60px;">${reward.icon}</div>
            <div style="font-size: 36px; margin-top: 10px;">${streak}连胜！</div>
            <div style="font-size: 24px; color: #ffd700;">获得: ${reward.desc}</div>
        `;
        document.body.appendChild(popup);
        
        // 添加彩带特效
        this.createConfetti();
        
        // 播放庆祝音效
        this.playSound('celebrate');
        
        // 3秒后移除
        setTimeout(() => {
            popup.remove();
        }, 3000);
    }
    
    /**
     * 显示游戏结束弹窗
     */
    showGameOverModal(isPerfect, rewards) {
        const overlay = document.getElementById('gameOverOverlay');
        const icon = document.getElementById('gameOverIcon');
        const title = document.getElementById('gameOverTitle');
        const text = document.getElementById('gameOverText');
        const rewardsContainer = document.getElementById('gameOverRewards');
        
        if (isPerfect) {
            icon.textContent = '👑';
            title.textContent = '🎉 完美通关！';
            text.textContent = `恭喜你完成13连胜！成为命运之塔的传说！`;
            this.createFireworks();
        } else {
            icon.textContent = '🔥';
            title.textContent = '连胜结束';
            text.textContent = `你达到了 ${this.state.currentStreak} 连胜！`;
        }
        
        // 显示奖励
        rewardsContainer.innerHTML = '';
        if (rewards.length > 0) {
            rewards.forEach(reward => {
                const rewardEl = document.createElement('div');
                rewardEl.className = 'overlay-reward';
                rewardEl.innerHTML = `
                    <div class="overlay-reward-icon">${reward.icon}</div>
                    <div class="overlay-reward-value">${reward.desc}</div>
                `;
                rewardsContainer.appendChild(rewardEl);
            });
        } else {
            rewardsContainer.innerHTML = '<p style="color: #888;">本次挑战未获得奖励</p>';
        }
        
        overlay.classList.add('active');
    }
    
    /**
     * 显示单轮结果
     */
    showRoundResult(result, playerCard, guardCard) {
        const container = document.getElementById('resultContainer');
        
        const resultEmojis = {
            perfect: '✨',
            suit: '✅',
            rank: '✅',
            fail: '❌'
        };
        
        const resultTexts = {
            perfect: '完美匹配！',
            suit: '花色匹配！',
            rank: '点数匹配！',
            fail: '未能匹配'
        };
        
        container.innerHTML = `
            <div style="text-align: center;">
                <div style="font-size: 36px; margin-bottom: 10px;">${resultEmojis[result.type]}</div>
                <div style="font-size: 16px; color: ${result.win ? '#0f0' : '#f00'}; margin-bottom: 15px;">
                    ${resultTexts[result.type]}
                </div>
                <div style="display: flex; justify-content: center; gap: 20px;">
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #888; margin-bottom: 5px;">你的牌</div>
                        <div class="card-item" style="width: 50px; height: 70px; cursor: default;">
                            <div class="card-suit" style="color: ${playerCard.isRed ? '#d00' : '#000'}">${playerCard.suit}</div>
                            <div class="card-rank">${playerCard.rank}</div>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        <div style="font-size: 12px; color: #888; margin-bottom: 5px;">守卫牌</div>
                        <div class="guard-revealed" style="width: 50px; height: 70px; font-size: 24px;">
                            <div style="color: ${guardCard.isRed ? '#d00' : '#000'}">${guardCard.suit}</div>
                            <div style="font-size: 16px;">${guardCard.rank}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 添加历史记录
     */
    addHistoryEntry(isWin) {
        const list = document.getElementById('historyList');
        const entry = this.state.history[this.state.history.length - 1];
        
        const item = document.createElement('div');
        item.className = `history-item ${isWin ? 'history-win' : 'history-lose'}`;
        item.innerHTML = `
            <span>${this.getLevelName(entry.level)}层</span>
            <span style="color: ${entry.playerCard.isRed ? '#d00' : '#fff'}">${entry.playerCard.suit}${entry.playerCard.rank}</span>
            <span>vs</span>
            <span style="color: ${entry.guardCard.isRed ? '#d00' : '#fff'}">${entry.guardCard.suit}${entry.guardCard.rank}</span>
            <span style="color: ${isWin ? '#0f0' : '#f00'}">${isWin ? '✓' : '✗'}</span>
        `;
        
        list.insertBefore(item, list.firstChild);
        
        // 移除占位文本
        if (list.querySelector('p')) {
            list.querySelector('p').remove();
        }
    }
    
    /**
     * 清空历史
     */
    clearHistory() {
        const list = document.getElementById('historyList');
        list.innerHTML = '<p style="color: #666; font-size: 12px; text-align: center;">暂无记录</p>';
    }
    
    /**
     * 渲染连胜进度
     */
    renderStreakProgress() {
        const streakCount = document.getElementById('streakCount');
        const progressBar = document.getElementById('streakProgressBar');
        const progressText = document.getElementById('streakProgressText');
        
        if (streakCount) streakCount.textContent = this.state.currentStreak;
        if (progressText) progressText.textContent = `${this.state.currentStreak}/${this.config.maxStreak}`;
        if (progressBar) {
            const percentage = (this.state.currentStreak / this.config.maxStreak) * 100;
            progressBar.style.width = `${percentage}%`;
        }
        
        // 更新里程碑状态
        for (let i = 1; i <= this.config.maxStreak; i++) {
            const milestone = document.getElementById(`milestone-${i}`);
            if (milestone) {
                milestone.classList.remove('reached', 'current');
                if (i < this.state.currentStreak) {
                    milestone.classList.add('reached');
                } else if (i === this.state.currentStreak) {
                    milestone.classList.add('current');
                }
            }
        }
    }
    
    /**
     * 渲染奖励预览
     */
    renderRewardPreview() {
        const container = document.getElementById('rewardPreview');
        if (!container) return;
        
        container.innerHTML = '';
        
        const milestones = [3, 5, 7, 10, 13];
        milestones.forEach(streak => {
            const reward = this.rewards[streak];
            const item = document.createElement('div');
            item.className = 'reward-item';
            item.id = `reward-${streak}`;
            
            if (this.state.currentStreak >= streak) {
                item.classList.add('active');
            } else if (this.state.currentStreak < streak) {
                item.classList.add('locked');
            }
            
            item.innerHTML = `
                <div class="reward-icon ${reward.type}">${reward.icon}</div>
                <div class="reward-info">
                    <div class="reward-name">${reward.name}</div>
                    <div class="reward-desc">${reward.desc}</div>
                </div>
                <div class="reward-streak">${streak}连胜</div>
            `;
            
            container.appendChild(item);
        });
    }
    
    /**
     * 更新奖励预览
     */
    updateRewardPreview() {
        this.renderRewardPreview();
    }
    
    /**
     * 更新守卫显示
     */
    updateGuardDisplay() {
        const stack = document.getElementById('guardStack');
        const count = document.getElementById('guardCount');
        const guardsRemaining = document.getElementById('guardsRemaining');
        
        if (!stack || this.state.currentLevel >= this.config.levels) return;
        
        const currentGuards = this.state.guardCards[this.state.currentLevel];
        const guardCount = currentGuards ? currentGuards.length : 0;
        
        // 更新堆叠卡片显示
        const backs = stack.querySelectorAll('.guard-card-back');
        backs.forEach((back, index) => {
            back.style.display = index < guardCount ? 'flex' : 'none';
        });
        
        // 更新计数
        if (count) count.textContent = guardCount;
        if (guardsRemaining) guardsRemaining.textContent = guardCount;
    }
    
    /**
     * 生成模拟排行榜数据
     */
    generateMockLeaderboard(count) {
        const names = ['王者玩家', '卡牌大师', '塔之勇者', '连胜狂人', '命运之子', 
                       '火焰骑士', '冰霜法师', '雷电战士', '暗影刺客', '圣光使者'];
        const data = [];
        
        for (let i = 0; i < count; i++) {
            const streak = Math.floor(Math.random() * 13) + 1;
            data.push({
                rank: i + 1,
                name: names[Math.floor(Math.random() * names.length)] + (i + 1),
                streak: streak,
                avatar: ['👤', '🎭', '🎪', '🎯', '🎨', '🎬', '🎤', '🎧', '🎮', '🎲'][i % 10]
            });
        }
        
        // 按连胜排序
        return data.sort((a, b) => b.streak - a.streak).map((item, index) => ({
            ...item,
            rank: index + 1
        }));
    }
    
    /**
     * 渲染排行榜
     */
    renderLeaderboard() {
        const container = document.getElementById('leaderboardList');
        if (!container) return;
        
        const data = this.leaderboards[this.currentLeaderboard];
        container.innerHTML = '';
        
        data.slice(0, 10).forEach(player => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            
            const rankClass = player.rank <= 3 ? `rank-${player.rank}` : 'rank-other';
            
            item.innerHTML = `
                <div class="leaderboard-rank ${rankClass}">${player.rank}</div>
                <div class="leaderboard-avatar">${player.avatar}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${player.name}</div>
                    <div class="leaderboard-streak">${player.streak}连胜</div>
                </div>
                <div class="leaderboard-fire">${'🔥'.repeat(Math.min(player.streak, 5))}</div>
            `;
            
            container.appendChild(item);
        });
    }
    
    /**
     * 切换排行榜
     */
    switchLeaderboard(type) {
        this.currentLeaderboard = type;
        
        // 更新标签状态
        document.querySelectorAll('.leaderboard-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.renderLeaderboard();
    }
    
    /**
     * 更新统计
     */
    updateStats() {
        const bestStreak = document.getElementById('statBestStreak');
        const totalRuns = document.getElementById('statTotalRuns');
        const perfectRuns = document.getElementById('statPerfectRuns');
        const winRate = document.getElementById('statWinRate');
        
        if (bestStreak) bestStreak.textContent = this.playerData.bestStreak;
        if (totalRuns) totalRuns.textContent = this.playerData.totalRuns;
        if (perfectRuns) perfectRuns.textContent = this.playerData.perfectRuns;
        
        if (winRate) {
            const total = this.playerData.totalWins + this.playerData.totalLosses;
            const rate = total > 0 ? Math.round((this.playerData.totalWins / total) * 100) : 0;
            winRate.textContent = `${rate}%`;
        }
    }
    
    /**
     * 更新UI
     */
    updateUI() {
        const currentLevel = document.getElementById('currentLevel');
        const cardsRemaining = document.getElementById('cardsRemaining');
        
        if (currentLevel) {
            currentLevel.textContent = this.getLevelName(this.state.currentLevel) + '/A';
        }
        
        if (cardsRemaining) {
            cardsRemaining.textContent = this.state.playerHand.length;
        }
    }
    
    /**
     * 获取层名称
     */
    getLevelName(levelIndex) {
        if (levelIndex < 0 || levelIndex >= this.config.levelNames.length) {
            return 'A';
        }
        return this.config.levelNames[levelIndex];
    }
    
    /**
     * 创建彩带特效
     */
    createConfetti() {
        const container = document.getElementById('celebration');
        container.classList.add('active');
        container.innerHTML = '';
        
        const colors = ['#ff6b00', '#ff9500', '#ffd700', '#0f0', '#0ff', '#f0f'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 2 + 's';
            confetti.style.animationDuration = (2 + Math.random() * 2) + 's';
            container.appendChild(confetti);
        }
        
        setTimeout(() => {
            container.classList.remove('active');
        }, 4000);
    }
    
    /**
     * 创建烟花特效
     */
    createFireworks() {
        const container = document.getElementById('celebration');
        container.classList.add('active');
        container.innerHTML = '';
        
        const colors = ['#ff6b00', '#ff9500', '#ffd700', '#0f0', '#0ff', '#f0f', '#f00'];
        
        // 创建多次烟花爆炸
        for (let burst = 0; burst < 5; burst++) {
            setTimeout(() => {
                const centerX = 20 + Math.random() * 60;
                const centerY = 20 + Math.random() * 40;
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                for (let i = 0; i < 30; i++) {
                    const firework = document.createElement('div');
                    firework.className = 'firework';
                    firework.style.left = centerX + '%';
                    firework.style.top = centerY + '%';
                    firework.style.background = color;
                    
                    const angle = (i / 30) * Math.PI * 2;
                    const distance = 100 + Math.random() * 100;
                    const duration = 0.5 + Math.random() * 0.5;
                    
                    firework.style.animation = `firework-explode ${duration}s ease-out forwards`;
                    firework.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
                    
                    container.appendChild(firework);
                }
            }, burst * 600);
        }
        
        setTimeout(() => {
            container.classList.remove('active');
        }, 5000);
    }
    
    /**
     * 播放音效
     */
    playSound(type) {
        // 这里可以集成Web Audio API或其他音效库
        // 简化实现，实际项目中可以添加真实音效
        const sounds = {
            select: 440,
            win: 523.25,
            lose: 261.63,
            celebrate: 659.25
        };
        
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = sounds[type] || 440;
            oscillator.type = type === 'celebrate' ? 'square' : 'sine';
            
            gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch (e) {
            // 忽略音频错误
        }
    }
    
    /**
     * 显示提示
     */
    showToast(message) {
        // 创建提示元素
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.9);
            color: #ffd700;
            padding: 15px 30px;
            border-radius: 10px;
            border: 2px solid #ffd700;
            z-index: 9999;
            font-size: 16px;
            animation: fade-in-out 3s ease forwards;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }
    
    /**
     * 关闭弹窗
     */
    closeOverlay() {
        document.getElementById('gameOverOverlay').classList.remove('active');
    }
    
    /**
     * 显示规则
     */
    showRules() {
        document.getElementById('rulesOverlay').classList.add('active');
    }
    
    /**
     * 关闭规则
     */
    closeRules() {
        document.getElementById('rulesOverlay').classList.remove('active');
    }
    
    /**
     * 返回主菜单
     */
    backToMenu() {
        if (this.state.isPlaying) {
            if (!confirm('正在游戏中，确定要返回吗？')) return;
        }
        window.location.href = 'index.html';
    }
}

// 创建全局实例
const streakGame = new StreakGame();

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-in-out {
        0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        10% { opacity: 1; transform: translateX(-50%) translateY(0); }
        90% { opacity: 1; transform: translateX(-50%) translateY(0); }
        100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(style);

// 导出模块（如果支持）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StreakGame;
}
