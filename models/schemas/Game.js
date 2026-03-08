const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 游戏房间Schema - 实时对战游戏状态管理
 * 包含：房间信息、玩家状态、守卫配置、游戏进程
 */
const gameSchema = new Schema({
    // ==================== 房间基本信息 ====================
    roomId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    mode: { 
        type: String, 
        enum: {
            values: ['solo', 'team', 'tournament', 'streak'],
            message: '不支持的游戏模式: {VALUE}'
        },
        required: true 
    },
    maxPlayers: { type: Number, default: 4, min: 1, max: 8 },
    
    // ==================== 玩家信息 ====================
    players: [{
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: true 
        },
        position: { type: Number, required: true, min: 0, max: 7 },
        cards: [{
            suit: { 
                type: String, 
                enum: ['♥️', '♦️', '♣️', '♠️'],
                required: true 
            },
            rank: { 
                type: String, 
                enum: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
                required: true 
            },
            deck: { type: Number, required: true, min: 1, max: 4 },
            _id: false
        }],
        currentLayer: { type: Number, default: 2, min: 1, max: 13 },
        isFirstAscender: { type: Boolean, default: false },
        isGuard: { type: Boolean, default: false }, // 是否成为守卫
        status: { 
            type: String, 
            enum: ['waiting', 'playing', 'finished', 'disconnected', 'escaped'],
            default: 'waiting'
        },
        joinedAt: { type: Date, default: Date.now },
        finishedAt: Date,
        finalRank: { type: Number, min: 1 },
        _id: false
    }],
    
    // ==================== 守卫配置 ====================
    guards: [{
        layer: { type: Number, required: true, min: 1, max: 13 },
        name: { type: String, required: true },
        hp: { type: Number, default: 100 },
        maxHp: { type: Number, default: 100 },
        cards: [{
            suit: String,
            rank: String,
            deck: Number,
            _id: false
        }],
        angerCards: [{
            suit: String,
            rank: String,
            deck: Number,
            _id: false
        }],
        revealedCard: {
            suit: String,
            rank: String,
            deck: Number
        },
        defeatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        defeatedAt: Date,
        _id: false
    }],
    
    // ==================== 游戏状态 ====================
    status: {
        type: String,
        enum: ['waiting', 'playing', 'paused', 'finished', 'abandoned'],
        default: 'waiting',
        index: true
    },
    
    // ==================== 游戏进程 ====================
    currentRound: { type: Number, default: 0, min: 0 },
    currentPlayerIndex: { type: Number, default: 0, min: 0 },
    turnStartTime: { type: Date }, // 当前回合开始时间
    turnDuration: { type: Number, default: 30 }, // 每回合限时(秒)
    
    // ==================== 游戏牌组 ====================
    deck: [{
        suit: String,
        rank: String,
        deck: Number,
        drawn: { type: Boolean, default: false },
        _id: false
    }],
    discardPile: [{
        suit: String,
        rank: String,
        deck: Number,
        playedBy: Schema.Types.ObjectId,
        playedAt: Date,
        _id: false
    }],
    
    // ==================== 胜负信息 ====================
    winner: { type: Schema.Types.ObjectId, ref: 'User' },
    firstAscender: { type: Schema.Types.ObjectId, ref: 'User' },
    rankings: [{ // 最终排名
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        rank: Number,
        layer: Number,
        escaped: Boolean,
        _id: false
    }],
    
    // ==================== 锦标赛关联 ====================
    tournamentId: { type: Schema.Types.ObjectId, ref: 'Tournament' },
    matchId: String, // 锦标赛内的比赛ID
    roundInTournament: { type: Number, default: 0 },
    
    // ==================== 游戏设置 ====================
    settings: {
        timeLimit: { type: Number, default: 30 }, // 出牌时间限制
        allowEscape: { type: Boolean, default: true },
        isRanked: { type: Boolean, default: true }, // 是否排位赛
        deckCount: { type: Number, default: 4, min: 1, max: 8 }, // 使用几副牌
        guardMode: { 
            type: String, 
            enum: ['standard', 'hardcore'],
            default: 'standard'
        }
    },
    
    // ==================== 游戏记录 ====================
    events: [{ // 游戏事件日志
        type: { 
            type: String, 
            enum: ['join', 'leave', 'draw', 'play', 'battle', 'layer_up', 'escape', 'win', 'guard_defeated']
        },
        userId: Schema.Types.ObjectId,
        data: Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now },
        _id: false
    }],
    
    // ==================== 时间戳 ====================
    createdAt: { type: Date, default: Date.now },
    startedAt: Date,
    endedAt: Date,
    expiresAt: { // 自动清理过期房间
        type: Date, 
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24小时后过期
    }
}, {
    timestamps: { createdAt: true, updatedAt: true },
    collection: 'games'
});

// ==================== 索引定义 ====================
gameSchema.index({ status: 1, mode: 1 }); // 查找可加入房间
gameSchema.index({ 'players.userId': 1 }); // 查找用户参与的游戏
gameSchema.index({ tournamentId: 1 }); // 锦标赛查询
gameSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL索引自动清理

// ==================== 虚拟字段 ====================
gameSchema.virtual('currentPlayer').get(function() {
    if (!this.players || this.players.length === 0) return null;
    return this.players[this.currentPlayerIndex % this.players.length];
});

gameSchema.virtual('activePlayers').get(function() {
    return this.players.filter(p => 
        p.status === 'playing' || p.status === 'waiting'
    );
});

// ==================== 实例方法 ====================

// 加入游戏
gameSchema.methods.addPlayer = function(userId) {
    if (this.players.length >= this.maxPlayers) {
        throw new Error('房间已满');
    }
    if (this.status !== 'waiting') {
        throw new Error('游戏已开始');
    }
    
    const position = this.players.length;
    this.players.push({
        userId,
        position,
        status: 'waiting',
        joinedAt: new Date()
    });
    
    this.events.push({
        type: 'join',
        userId,
        timestamp: new Date()
    });
    
    return this.save();
};

// 开始游戏
gameSchema.methods.start = function() {
    if (this.players.length < 2 && this.mode !== 'solo') {
        throw new Error('玩家不足，无法开始');
    }
    
    this.status = 'playing';
    this.startedAt = new Date();
    this.currentRound = 1;
    this.turnStartTime = new Date();
    
    // 初始化玩家状态
    this.players.forEach(p => {
        if (p.status === 'waiting') {
            p.status = 'playing';
        }
    });
    
    return this.save();
};

// 玩家出牌
gameSchema.methods.playCard = function(userId, cardIndex) {
    const player = this.players.find(p => p.userId.toString() === userId.toString());
    if (!player) throw new Error('玩家不在游戏中');
    
    const card = player.cards[cardIndex];
    if (!card) throw new Error('无效的卡牌');
    
    // 移动到弃牌堆
    player.cards.splice(cardIndex, 1);
    this.discardPile.push({
        ...card,
        playedBy: userId,
        playedAt: new Date()
    });
    
    this.events.push({
        type: 'play',
        userId,
        data: { card, cardIndex },
        timestamp: new Date()
    });
    
    return card;
};

// 比较卡牌 (核心游戏逻辑)
gameSchema.methods.compareCards = function(playerCard, guardCard) {
    const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const playerRank = rankOrder.indexOf(playerCard.rank);
    const guardRank = rankOrder.indexOf(guardCard.rank);
    
    const suitMatch = playerCard.suit === guardCard.suit;
    const rankMatch = playerRank === guardRank;
    
    let result = { type: 'none', bonus: 0, message: '不匹配' };
    
    if (suitMatch && rankMatch) {
        // 点数和花色都匹配 = 完美匹配
        result = { type: 'full', bonus: 2, message: '完美匹配！+2层' };
    } else if (rankMatch) {
        // 只有点数匹配
        result = { type: 'partial', bonus: 1, message: '点数匹配！+1层' };
    }
    
    return result;
};

// 玩家爬升
gameSchema.methods.ascendLayer = function(userId, bonus = 1) {
    const player = this.players.find(p => p.userId.toString() === userId.toString());
    if (!player) throw new Error('玩家不存在');
    
    const oldLayer = player.currentLayer;
    player.currentLayer = Math.min(13, player.currentLayer + bonus);
    
    // 检查首登者
    if (player.currentLayer === 13 && !this.firstAscender) {
        player.isFirstAscender = true;
        this.firstAscender = userId;
    }
    
    this.events.push({
        type: 'layer_up',
        userId,
        data: { from: oldLayer, to: player.currentLayer, bonus },
        timestamp: new Date()
    });
    
    return player.currentLayer;
};

// 检查胜利条件
gameSchema.methods.checkWinCondition = function() {
    // 到达13层且为首登者
    const ascenders = this.players.filter(p => p.currentLayer === 13);
    
    if (ascenders.length > 0 && this.firstAscender) {
        const winner = this.players.find(p => 
            p.userId.toString() === this.firstAscender.toString()
        );
        if (winner) {
            winner.isGuard = true;
            this.winner = this.firstAscender;
            return true;
        }
    }
    
    return false;
};

// 结束游戏
gameSchema.methods.endGame = function() {
    this.status = 'finished';
    this.endedAt = new Date();
    
    // 计算排名
    const sortedPlayers = [...this.players]
        .sort((a, b) => {
            if (a.currentLayer !== b.currentLayer) {
                return b.currentLayer - a.currentLayer; // 层数高者排名靠前
            }
            if (a.isFirstAscender) return -1;
            if (b.isFirstAscender) return 1;
            return 0;
        });
    
    this.rankings = sortedPlayers.map((p, index) => ({
        userId: p.userId,
        rank: index + 1,
        layer: p.currentLayer,
        escaped: p.status === 'escaped'
    }));
    
    // 更新玩家最终排名
    sortedPlayers.forEach((p, index) => {
        p.finalRank = index + 1;
        p.status = 'finished';
    });
    
    return this.save();
};

// ==================== 静态方法 ====================

gameSchema.statics.findAvailableRooms = function(mode, limit = 10) {
    return this.find({
        status: 'waiting',
        mode,
        $expr: { $lt: [{ $size: '$players' }, '$maxPlayers'] }
    })
    .limit(limit)
    .sort({ createdAt: -1 });
};

gameSchema.statics.findActiveByUser = function(userId) {
    return this.findOne({
        'players.userId': userId,
        status: { $in: ['waiting', 'playing', 'paused'] }
    });
};

gameSchema.statics.getGameStats = async function() {
    return this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                avgDuration: {
                    $avg: {
                        $cond: [
                            { $and: ['$startedAt', '$endedAt'] },
                            { $subtract: ['$endedAt', '$startedAt'] },
                            null
                        ]
                    }
                }
            }
        }
    ]);
};

module.exports = mongoose.model('Game', gameSchema);
