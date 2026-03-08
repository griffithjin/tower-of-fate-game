const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 公会/联盟Schema - 社交系统核心
 * 包含：公会信息、成员管理、公会升级、公会战
 */
const guildSchema = new Schema({
    // ==================== 基本信息 ====================
    name: {
        type: String,
        required: [true, '公会名称不能为空'],
        unique: true,
        trim: true,
        minlength: [2, '公会名称至少2个字符'],
        maxlength: [30, '公会名称最多30个字符']
    },
    tag: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        match: [/^\[?[A-Z0-9]{2,6}\]?$/, '公会标签应为2-6位大写字母或数字'],
        set: function(v) {
            return v.replace(/[\[\]]/g, ''); // 自动去除方括号
        }
    },
    description: {
        type: String,
        maxlength: [500, '公会描述最多500字符']
    },
    announcement: {
        type: String,
        maxlength: [1000, '公告最多1000字符']
    },
    
    // ==================== 标识 ====================
    emblem: {
        type: String,
        default: '/assets/guild/default-emblem.png'
    },
    banner: String,
    
    // ==================== 等级与经验 ====================
    level: {
        type: Number,
        default: 1,
        min: 1,
        max: 50
    },
    exp: {
        type: Number,
        default: 0,
        min: 0
    },
    
    // ==================== 成员管理 ====================
    members: [{
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['leader', 'officer', 'elder', 'member', 'recruit'],
            default: 'member'
        },
        joinedAt: { type: Date, default: Date.now },
        contribution: { type: Number, default: 0 }, // 贡献值
        weeklyContribution: { type: Number, default: 0 },
        lastActiveAt: { type: Date, default: Date.now },
        _id: false
    }],
    
    // ==================== 配置 ====================
    config: {
        maxMembers: { type: Number, default: 30 },
        joinType: {
            type: String,
            enum: ['open', 'request', 'invite', 'closed'],
            default: 'request'
        },
        requiredLevel: { type: Number, default: 1 },
        autoAcceptLevel: { type: Number, default: 0 } // 自动接受高于该等级的申请
    },
    
    // ==================== 资源 ====================
    resources: {
        gems: { type: Number, default: 0 },
        coins: { type: Number, default: 0 },
        materials: {
            wood: { type: Number, default: 0 },
            stone: { type: Number, default: 0 },
            iron: { type: Number, default: 0 }
        }
    },
    
    // ==================== 统计数据 ====================
    stats: {
        totalContributions: { type: Number, default: 0 },
        warsWon: { type: Number, default: 0 },
        warsLost: { type: Number, default: 0 },
        tournamentsWon: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now }
    },
    
    // ==================== 状态 ====================
    status: {
        type: String,
        enum: ['active', 'inactive', 'disbanded'],
        default: 'active'
    },
    
    // ==================== 时间戳 ====================
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true,
    collection: 'guilds'
});

// ==================== 索引定义 ====================
guildSchema.index({ name: 'text', description: 'text' }); // 全文搜索
guildSchema.index({ level: -1 }); // 排行榜
guildSchema.index({ 'members.userId': 1 }); // 用户所属公会查询

// ==================== 虚拟字段 ====================
guildSchema.virtual('memberCount').get(function() {
    return this.members.length;
});

guildSchema.virtual('isFull').get(function() {
    return this.members.length >= this.config.maxMembers;
});

guildSchema.virtual('leader').get(function() {
    return this.members.find(m => m.role === 'leader');
});

// ==================== 实例方法 ====================

// 添加成员
guildSchema.methods.addMember = function(userId, role = 'member') {
    if (this.isFull) {
        throw new Error('公会已满');
    }
    
    const existing = this.members.find(m => 
        m.userId.toString() === userId.toString()
    );
    if (existing) {
        throw new Error('该用户已在公会中');
    }
    
    this.members.push({
        userId,
        role,
        joinedAt: new Date()
    });
    
    return this.save();
};

// 移除成员
guildSchema.methods.removeMember = function(userId) {
    const index = this.members.findIndex(m => 
        m.userId.toString() === userId.toString()
    );
    
    if (index === -1) {
        throw new Error('该用户不在公会中');
    }
    
    if (this.members[index].role === 'leader') {
        throw new Error('无法移除会长，请先转让会长职位');
    }
    
    this.members.splice(index, 1);
    return this.save();
};

// 转让会长
guildSchema.methods.transferLeadership = function(newLeaderId) {
    const newLeader = this.members.find(m => 
        m.userId.toString() === newLeaderId.toString()
    );
    
    if (!newLeader) {
        throw new Error('该用户不在公会中');
    }
    
    const oldLeader = this.members.find(m => m.role === 'leader');
    if (oldLeader) {
        oldLeader.role = 'officer';
    }
    
    newLeader.role = 'leader';
    return this.save();
};

// 更新成员角色
guildSchema.methods.updateRole = function(userId, newRole) {
    const member = this.members.find(m => 
        m.userId.toString() === userId.toString()
    );
    
    if (!member) {
        throw new Error('该用户不在公会中');
    }
    
    member.role = newRole;
    return this.save();
};

// 增加贡献
guildSchema.methods.addContribution = function(userId, amount) {
    const member = this.members.find(m => 
        m.userId.toString() === userId.toString()
    );
    
    if (!member) {
        throw new Error('该用户不在公会中');
    }
    
    member.contribution += amount;
    member.weeklyContribution += amount;
    this.stats.totalContributions += amount;
    
    // 增加公会经验
    this.exp += Math.floor(amount / 10);
    
    // 检查升级
    this.checkLevelUp();
    
    return this.save();
};

// 检查升级
guildSchema.methods.checkLevelUp = function() {
    const expNeeded = this.level * 1000;
    
    if (this.exp >= expNeeded && this.level < 50) {
        this.level += 1;
        this.exp -= expNeeded;
        this.config.maxMembers = Math.min(100, 30 + (this.level - 1) * 2);
    }
};

// ==================== 静态方法 ====================

guildSchema.statics.findByMember = function(userId) {
    return this.findOne({
        'members.userId': userId,
        status: 'active'
    });
};

guildSchema.statics.search = function(query, options = {}) {
    const { limit = 20, skip = 0 } = options;
    
    return this.find(
        { $text: { $search: query }, status: 'active' },
        { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(limit);
};

guildSchema.statics.getLeaderboard = function(limit = 100) {
    return this.find({ status: 'active' })
        .sort({ level: -1, 'stats.totalContributions': -1 })
        .limit(limit)
        .select('name tag level emblem memberCount stats');
};

module.exports = mongoose.model('Guild', guildSchema);
