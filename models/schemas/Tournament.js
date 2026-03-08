const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 锦标赛Schema - 周期性赛事管理
 * 包含：基本信息、赛程安排、参赛者、奖励池
 */
const tournamentSchema = new Schema({
    // ==================== 基本信息 ====================
    name: { 
        type: String, 
        required: [true, '锦标赛名称不能为空'],
        trim: true,
        maxlength: [100, '名称最多100字符']
    },
    nameLocalized: {
        type: Map,
        of: String,
        default: {}
    },
    description: {
        type: String,
        maxlength: [500, '描述最多500字符']
    },
    
    // ==================== 地区配置 ====================
    country: { 
        type: String, 
        required: true 
    },
    countryCode: { 
        type: String, 
        uppercase: true,
        match: [/^[A-Z]{2}$/, '国家代码应为2位大写字母']
    },
    regions: [{ type: String }], // 可选：特定地区
    
    // ==================== 时间配置 ====================
    registrationStart: { 
        type: Date, 
        required: true,
        index: true 
    },
    registrationEnd: { 
        type: Date, 
        required: true 
    },
    startTime: { 
        type: Date, 
        required: true 
    },
    endTime: { 
        type: Date, 
        required: true 
    },
    
    // ==================== 参赛配置 ====================
    config: {
        maxPlayers: { type: Number, default: 64, min: 2, max: 10000 },
        minPlayers: { type: Number, default: 4, min: 2 },
        entryFee: { type: Number, default: 0, min: 0 }, // 报名费
        maxEntriesPerUser: { type: Number, default: 1, min: 1 }, // 每人最多报名次数
        requiredLevel: { type: Number, default: 1, min: 1 },
        requiredVipLevel: { type: Number, default: 0, min: 0 },
        isTeamBased: { type: Boolean, default: false },
        teamSize: { type: Number, default: 1, min: 1, max: 5 },
        eliminationType: { 
            type: String, 
            enum: ['single', 'double', 'round_robin', 'swiss'],
            default: 'single'
        }
    },
    
    // ==================== 奖励池 ====================
    prizePool: {
        gems: { type: Number, default: 0, min: 0 },
        coins: { type: Number, default: 0, min: 0 },
        items: [{
            itemId: String,
            itemType: String,
            name: String,
            quantity: { type: Number, min: 1 },
            _id: false
        }],
        distribution: [{ // 奖励分配规则
            rankFrom: { type: Number, required: true },
            rankTo: { type: Number, required: true },
            gems: { type: Number, default: 0 },
            coins: { type: Number, default: 0 },
            items: [String],
            title: String,
            _id: false
        }]
    },
    
    // ==================== 参赛者 ====================
    participants: [{
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: true 
        },
        teamId: Schema.Types.ObjectId, // 团队赛使用
        registeredAt: { type: Date, default: Date.now },
        status: { 
            type: String, 
            enum: ['registered', 'qualified', 'playing', 'eliminated', 'winner'],
            default: 'registered'
        },
        finalRank: { type: Number, min: 1 },
        matchesWon: { type: Number, default: 0 },
        matchesLost: { type: Number, default: 0 },
        score: { type: Number, default: 0 }, // 积分
        prize: {
            gems: { type: Number, default: 0 },
            coins: { type: Number, default: 0 },
            items: [String],
            title: String,
            delivered: { type: Boolean, default: false }
        },
        _id: false
    }],
    
    // ==================== 比赛赛程 ====================
    brackets: [{
        round: { type: Number, required: true },
        matches: [{
            matchId: { type: String, required: true },
            gameId: { type: Schema.Types.ObjectId, ref: 'Game' },
            participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            winners: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            status: { 
                type: String, 
                enum: ['pending', 'playing', 'completed', 'cancelled'],
                default: 'pending'
            },
            scheduledAt: Date,
            startedAt: Date,
            completedAt: Date,
            _id: false
        }],
        _id: false
    }],
    
    // ==================== 当前状态 ====================
    status: {
        type: String,
        enum: ['draft', 'upcoming', 'registration', 'ongoing', 'completed', 'cancelled'],
        default: 'draft',
        index: true
    },
    currentRound: { type: Number, default: 0 },
    
    // ==================== 统计信息 ====================
    stats: {
        totalRegistrations: { type: Number, default: 0 },
        peakConcurrent: { type: Number, default: 0 },
        totalMatches: { type: Number, default: 0 },
        completedMatches: { type: Number, default: 0 }
    },
    
    // ==================== 元数据 ====================
    banner: String, // 横幅图片
    rules: String, // 比赛规则文档
    organizers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // 组织者
    sponsors: [{
        name: String,
        logo: String,
        url: String,
        _id: false
    }],
    
    // ==================== 时间戳 ====================
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    collection: 'tournaments'
});

// ==================== 索引定义 ====================
tournamentSchema.index({ status: 1, registrationStart: 1 }); // 可报名赛事查询
tournamentSchema.index({ country: 1, status: 1 }); // 地区赛事查询
tournamentSchema.index({ 'participants.userId': 1 }); // 用户参赛查询
tournamentSchema.index({ startTime: 1 }); // 即将开始赛事

// ==================== 虚拟字段 ====================
tournamentSchema.virtual('isRegistrationOpen').get(function() {
    const now = new Date();
    return this.status === 'registration' && 
           now >= this.registrationStart && 
           now <= this.registrationEnd;
});

tournamentSchema.virtual('registrationCount').get(function() {
    return this.participants.length;
});

tournamentSchema.virtual('isFull').get(function() {
    return this.participants.length >= this.config.maxPlayers;
});

// ==================== 实例方法 ====================

// 注册用户
tournamentSchema.methods.register = function(userId) {
    if (this.status !== 'registration') {
        throw new Error('当前不在报名阶段');
    }
    
    const now = new Date();
    if (now < this.registrationStart || now > this.registrationEnd) {
        throw new Error('不在报名时间内');
    }
    
    if (this.participants.length >= this.config.maxPlayers) {
        throw new Error('报名人数已满');
    }
    
    const existing = this.participants.find(p => 
        p.userId.toString() === userId.toString()
    );
    if (existing) {
        throw new Error('您已报名该赛事');
    }
    
    this.participants.push({
        userId,
        registeredAt: new Date(),
        status: 'registered'
    });
    
    this.stats.totalRegistrations = this.participants.length;
    
    return this.save();
};

// 取消报名
tournamentSchema.methods.unregister = function(userId) {
    const participantIndex = this.participants.findIndex(p => 
        p.userId.toString() === userId.toString()
    );
    
    if (participantIndex === -1) {
        throw new Error('您未报名该赛事');
    }
    
    if (this.status !== 'registration') {
        throw new Error('比赛已开始，无法取消报名');
    }
    
    this.participants.splice(participantIndex, 1);
    this.stats.totalRegistrations = this.participants.length;
    
    return this.save();
};

// 开始锦标赛
tournamentSchema.methods.start = function() {
    if (this.participants.length < this.config.minPlayers) {
        throw new Error('参赛人数不足');
    }
    
    this.status = 'ongoing';
    this.currentRound = 1;
    
    // 初始化所有参赛者为playing状态
    this.participants.forEach(p => {
        p.status = 'playing';
    });
    
    return this.save();
};

// 记录比赛结果
tournamentSchema.methods.recordMatch = function(matchId, winners, gameId) {
    const round = this.brackets.find(r => 
        r.matches.some(m => m.matchId === matchId)
    );
    
    if (!round) throw new Error('比赛不存在');
    
    const match = round.matches.find(m => m.matchId === matchId);
    match.gameId = gameId;
    match.winners = winners;
    match.status = 'completed';
    match.completedAt = new Date();
    
    // 更新参赛者状态
    winners.forEach(winnerId => {
        const participant = this.participants.find(p => 
            p.userId.toString() === winnerId.toString()
        );
        if (participant) {
            participant.matchesWon += 1;
            participant.score += 3;
        }
    });
    
    match.participants.forEach(participantId => {
        if (!winners.some(w => w.toString() === participantId.toString())) {
            const participant = this.participants.find(p => 
                p.userId.toString() === participantId.toString()
            );
            if (participant) {
                participant.matchesLost += 1;
                participant.status = 'eliminated';
            }
        }
    });
    
    this.stats.completedMatches += 1;
    
    return this.save();
};

// 结束锦标赛
tournamentSchema.methods.end = async function() {
    this.status = 'completed';
    this.endTime = new Date();
    
    // 计算最终排名
    const rankedParticipants = [...this.participants]
        .sort((a, b) => {
            if (a.score !== b.score) return b.score - a.score;
            if (a.matchesWon !== b.matchesWon) return b.matchesWon - a.matchesWon;
            return a.matchesLost - b.matchesLost;
        });
    
    // 分配排名和奖励
    rankedParticipants.forEach((p, index) => {
        p.finalRank = index + 1;
        
        // 查找对应的奖励配置
        const prizeConfig = this.prizePool.distribution.find(d => 
            p.finalRank >= d.rankFrom && p.finalRank <= d.rankTo
        );
        
        if (prizeConfig) {
            p.status = p.finalRank === 1 ? 'winner' : 'eliminated';
            p.prize = {
                gems: prizeConfig.gems || 0,
                coins: prizeConfig.coins || 0,
                items: prizeConfig.items || [],
                title: prizeConfig.title,
                delivered: false
            };
        } else {
            p.status = 'eliminated';
        }
    });
    
    return this.save();
};

// ==================== 静态方法 ====================

tournamentSchema.statics.findUpcoming = function(country = null, limit = 10) {
    const query = {
        status: { $in: ['upcoming', 'registration'] },
        registrationEnd: { $gte: new Date() }
    };
    if (country) query.country = country;
    
    return this.find(query)
        .sort({ registrationStart: 1 })
        .limit(limit);
};

tournamentSchema.statics.findOngoing = function(limit = 10) {
    return this.find({ status: 'ongoing' })
        .sort({ startTime: -1 })
        .limit(limit);
};

tournamentSchema.statics.findByParticipant = function(userId) {
    return this.find({ 'participants.userId': userId })
        .sort({ createdAt: -1 });
};

tournamentSchema.statics.generateBracket = function(participants, type = 'single') {
    const count = participants.length;
    const rounds = Math.ceil(Math.log2(count));
    const bracketSize = Math.pow(2, rounds);
    
    const brackets = [];
    
    for (let i = 0; i < rounds; i++) {
        const matchCount = Math.pow(2, rounds - i - 1);
        const matches = [];
        
        for (let j = 0; j < matchCount; j++) {
            matches.push({
                matchId: `R${i+1}-M${j+1}`,
                status: 'pending'
            });
        }
        
        brackets.push({
            round: i + 1,
            matches
        });
    }
    
    return brackets;
};

module.exports = mongoose.model('Tournament', tournamentSchema);
