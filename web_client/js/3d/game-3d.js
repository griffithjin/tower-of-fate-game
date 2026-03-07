/**
 * Game3D - 3D游戏逻辑控制器
 * 整合Tower3D和Effects3D，提供完整的游戏体验
 */

class Game3D {
    constructor(container) {
        this.container = container;
        this.tower = null;
        this.effects = null;
        this.gameState = {
            status: 'waiting', // waiting, playing, ended
            players: [],
            currentPlayer: 0,
            round: 1,
            towerLayers: [],
            deck: [],
            discardPile: []
        };
        
        this.callbacks = {
            onTurnChange: null,
            onCardPlayed: null,
            onPlayerMove: null,
            onGameEnd: null
        };
        
        this.init();
    }
    
    init() {
        // 初始化3D塔楼
        this.tower = new Tower3D(this.container);
        
        // 初始化特效系统
        this.effects = new Effects3D(this.tower.scene);
        
        // 初始化游戏数据
        this.initDeck();
        this.initTowerLayers();
    }
    
    // 初始化牌组
    initDeck() {
        const suits = ['♠', '♥', '♣', '♦'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.gameState.deck = [];
        
        for (const suit of suits) {
            for (const rank of ranks) {
                this.gameState.deck.push({ suit, rank });
            }
        }
        
        // 洗牌
        this.shuffleDeck();
    }
    
    // 洗牌
    shuffleDeck() {
        for (let i = this.gameState.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.gameState.deck[i], this.gameState.deck[j]] = 
            [this.gameState.deck[j], this.gameState.deck[i]];
        }
    }
    
    // 初始化塔楼层
    initTowerLayers() {
        this.gameState.towerLayers = [];
        
        // 13层塔，每层4个守卫位置
        for (let i = 0; i < 13; i++) {
            const layer = {
                index: i,
                level: this.getLayerLevel(i),
                guards: []
            };
            
            // 为每层生成守卫
            for (let j = 0; j < 4; j++) {
                if (Math.random() > 0.3) { // 70%概率有守卫
                    layer.guards.push({
                        index: j,
                        card: this.drawCard(),
                        isRevealed: false,
                        isDefeated: false
                    });
                } else {
                    layer.guards.push(null);
                }
            }
            
            this.gameState.towerLayers.push(layer);
        }
    }
    
    // 获取层等级
    getLayerLevel(index) {
        const levels = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        return levels[index];
    }
    
    // 抽牌
    drawCard() {
        if (this.gameState.deck.length === 0) {
            // 重新洗牌
            this.gameState.deck = [...this.gameState.discardPile];
            this.gameState.discardPile = [];
            this.shuffleDeck();
        }
        return this.gameState.deck.pop();
    }
    
    // 添加玩家
    addPlayer(name, isBot = false) {
        const player = {
            id: this.gameState.players.length,
            name: name,
            isBot: isBot,
            layer: 0,
            hand: [],
            angerTokens: 0,
            score: 0
        };
        
        // 发初始手牌
        for (let i = 0; i < 8; i++) {
            player.hand.push(this.drawCard());
        }
        
        this.gameState.players.push(player);
        
        // 在3D场景中添加玩家令牌
        if (this.tower.playerTokens[player.id]) {
            this.tower.animatePlayerRise(player.id, 0);
        }
        
        return player;
    }
    
    // 开始游戏
    startGame() {
        if (this.gameState.players.length < 2) {
            throw new Error('至少需要2名玩家');
        }
        
        this.gameState.status = 'playing';
        this.gameState.currentPlayer = 0;
        this.gameState.round = 1;
        
        // 触发回合开始
        this.onTurnStart();
    }
    
    // 回合开始
    onTurnStart() {
        const player = this.gameState.players[this.gameState.currentPlayer];
        
        // 高亮当前玩家
        this.tower.highlightLayer(player.layer);
        
        // 回调
        if (this.callbacks.onTurnChange) {
            this.callbacks.onTurnChange(player);
        }
        
        // 如果是AI，自动执行
        if (player.isBot) {
            setTimeout(() => this.executeBotTurn(player), 1500);
        }
    }
    
    // AI执行回合
    executeBotTurn(player) {
        // 简单AI策略
        const playableCards = this.getPlayableCards(player);
        
        if (playableCards.length > 0) {
            // 随机选择一张可出的牌
            const cardIndex = Math.floor(Math.random() * playableCards.length);
            const card = playableCards[cardIndex];
            
            // 选择目标层
            const targetLayer = this.getBestTargetLayer(player, card);
            
            // 执行出牌
            this.playCard(player.id, card, targetLayer);
        } else {
            // 没有可出的牌，跳过
            this.skipTurn(player.id);
        }
    }
    
    // 获取可出的牌
    getPlayableCards(player) {
        return player.hand.filter(card => {
            const cardValue = this.getCardValue(card);
            // 检查是否可以攻击当前层的守卫
            const layer = this.gameState.towerLayers[player.layer];
            if (!layer) return true; // 在顶层，可以出任意牌
            
            // 检查是否有可攻击的守卫
            return layer.guards.some(guard => 
                guard && !guard.isDefeated && cardValue >= this.getCardValue(guard.card)
            );
        });
    }
    
    // 获取最佳目标层
    getBestTargetLayer(player, card) {
        // 优先攻击能击败守卫的层
        for (let i = player.layer; i < 13; i++) {
            const layer = this.gameState.towerLayers[i];
            const hasDefeatableGuard = layer.guards.some(guard =>
                guard && !guard.isDefeated && 
                this.getCardValue(card) >= this.getCardValue(guard.card)
            );
            if (hasDefeatableGuard) return i;
        }
        return player.layer;
    }
    
    // 获取卡牌数值
    getCardValue(card) {
        const values = {
            'A': 14, 'K': 13, 'Q': 12, 'J': 11,
            '10': 10, '9': 9, '8': 8, '7': 7,
            '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
        };
        return values[card.rank] || 0;
    }
    
    // 出牌
    playCard(playerId, card, targetLayerIndex) {
        const player = this.gameState.players[playerId];
        if (!player || playerId !== this.gameState.currentPlayer) {
            return false;
        }
        
        // 从手牌中移除
        const cardIndex = player.hand.findIndex(c => 
            c.suit === card.suit && c.rank === card.rank
        );
        if (cardIndex === -1) return false;
        
        player.hand.splice(cardIndex, 1);
        this.gameState.discardPile.push(card);
        
        // 3D动画：出牌
        const layer = this.gameState.towerLayers[targetLayerIndex];
        const guardIndex = this.findTargetGuard(layer, card);
        
        if (guardIndex !== -1) {
            // 翻牌动画
            this.tower.flipGuardCard(targetLayerIndex, guardIndex, card.suit, card.rank);
            
            // 检查是否击败守卫
            const guard = layer.guards[guardIndex];
            if (this.getCardValue(card) >= this.getCardValue(guard.card)) {
                // 击败守卫
                guard.isDefeated = true;
                
                // 特效
                setTimeout(() => {
                    this.effects.createExplosion(
                        this.tower.guards[targetLayerIndex][guardIndex].mesh.position,
                        0xffd700
                    );
                }, 500);
                
                // 玩家上升
                setTimeout(() => {
                    this.movePlayer(playerId, targetLayerIndex + 1);
                }, 1000);
            } else {
                // 激怒守卫
                player.angerTokens++;
                this.tower.createAngerMark(targetLayerIndex, guardIndex);
                
                // 特效
                setTimeout(() => {
                    this.effects.createLightning(
                        this.tower.playerTokens[playerId].mesh.position,
                        this.tower.guards[targetLayerIndex][guardIndex].mesh.position,
                        0xff0000
                    );
                }, 500);
            }
        }
        
        // 回调
        if (this.callbacks.onCardPlayed) {
            this.callbacks.onCardPlayed(player, card, targetLayerIndex);
        }
        
        // 检查游戏结束
        if (this.checkWinCondition(player)) {
            this.endGame(player);
        } else {
            // 下一回合
            this.nextTurn();
        }
        
        return true;
    }
    
    // 查找目标守卫
    findTargetGuard(layer, card) {
        const cardValue = this.getCardValue(card);
        
        // 优先找可击败的守卫
        for (let i = 0; i < layer.guards.length; i++) {
            const guard = layer.guards[i];
            if (guard && !guard.isDefeated && cardValue >= this.getCardValue(guard.card)) {
                return i;
            }
        }
        
        // 否则找任意守卫
        for (let i = 0; i < layer.guards.length; i++) {
            const guard = layer.guards[i];
            if (guard && !guard.isDefeated) {
                return i;
            }
        }
        
        return -1;
    }
    
    // 移动玩家
    movePlayer(playerId, targetLayer) {
        const player = this.gameState.players[playerId];
        player.layer = Math.min(targetLayer, 12);
        
        // 3D动画
        this.tower.animatePlayerRise(playerId, player.layer);
        
        // 特效
        this.effects.createMagicCircle(this.tower.playerTokens[playerId].mesh.position);
        
        // 回调
        if (this.callbacks.onPlayerMove) {
            this.callbacks.onPlayerMove(player, player.layer);
        }
    }
    
    // 跳过回合
    skipTurn(playerId) {
        if (playerId !== this.gameState.currentPlayer) return false;
        
        this.nextTurn();
        return true;
    }
    
    // 下一回合
    nextTurn() {
        this.gameState.currentPlayer = 
            (this.gameState.currentPlayer + 1) % this.gameState.players.length;
        
        // 检查是否回到第一个玩家
        if (this.gameState.currentPlayer === 0) {
            this.gameState.round++;
        }
        
        this.onTurnStart();
    }
    
    // 检查胜利条件
    checkWinCondition(player) {
        return player.layer >= 12; // 到达第13层（A层）
    }
    
    // 结束游戏
    endGame(winner) {
        this.gameState.status = 'ended';
        
        // 胜利特效
        this.tower.celebrateWin(winner.id);
        this.effects.createConfetti(this.tower.playerTokens[winner.id].mesh.position);
        this.effects.createFloatingText(
            '胜利!',
            this.tower.playerTokens[winner.id].mesh.position,
            '#ffd700'
        );
        
        // 回调
        if (this.callbacks.onGameEnd) {
            this.callbacks.onGameEnd(winner);
        }
    }
    
    // 设置回调
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }
    
    // 获取游戏状态
    getState() {
        return { ...this.gameState };
    }
    
    // 获取当前玩家
    getCurrentPlayer() {
        return this.gameState.players[this.gameState.currentPlayer];
    }
    
    // 获取玩家手牌
    getPlayerHand(playerId) {
        return this.gameState.players[playerId]?.hand || [];
    }
    
    // 销毁
    destroy() {
        if (this.tower) {
            this.tower.destroy();
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Game3D;
}
