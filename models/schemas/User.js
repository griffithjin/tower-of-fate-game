const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 用户Schema - 命运塔游戏核心用户模型
 * 包含：基本信息、认证、游戏数据、VIP、防沉迷、社交、设置
 */
const userSchema = new Schema({
    // ==================== 基本信息 ====================
    username: { 
        type: String, 
        required: [true, '用户名不能为空'],
        unique: true,
        trim: true,
        minlength: [3, '用户名至少3个字符'],
        maxlength: [20, '用户名最多20个字符'],
        match: [/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线和中文']
    },
    email: { 
        type: String, 
        required: [true, '邮箱不能为空'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '请输入有效的邮箱地址']
    },
    phone: { 
        type: String, 
        unique: true,
        sparse: true, // 允许null值但保持唯一性
        match: [/^1[3-9]\d{9}$/, '请输入有效的手机号码']
    },
    
    // ==================== 认证信息 ====================
    passwordHash: { 
        type: String, 
        required: [true, '密码不能为空'],
        minlength: [60, '密码哈希格式不正确']
    },
    salt: { 
        type: String, 
        required: [true, '盐值不能为空']
    },
    
    // ==================== 实名认证 ====================
    realName: { 
        type: String,
        trim: true,
        maxlength: [50, '真实姓名过长']
    },
    idCardNumber: { 
        type: String,
        match: [/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, '身份证号格式不正确']
    },
    verified: { type: Boolean, default: false },
    verifiedAt: Date,
    
    // ==================== 游戏数据 ====================
    profile: {
        nickname: { 
            type: String, 
            trim: true,
            maxlength: [30, '昵称最多30个字符']
        },
        avatar: { type: String, default: '/assets/default-avatar.png' },
        level: { type: Number, default: 1, min: 1, max: 100 },
        exp: { type: Number, default: 0, min: 0 },
        title: { type: String, default: '新手冒险者' },
        bio: { type: String, maxlength: [200, '简介最多200字符'] }
    },
    
    // ==================== 虚拟货币 ====================
    currency: {
        gems: { type: Number, default: 0, min: 0 },
        coins: { type: Number, default: 1000, min: 0 },
        vipPoints: { type: Number, default: 0, min: 0 }
    },
    
    // ==================== VIP信息 ====================
    vip: {
        level: { type: Number, default: 0, min: 0, max: 15 },
        exp: { type: Number, default: 0, min: 0 },
        startDate: Date,
        endDate: Date,
        isActive: { type: Boolean, default: false }
    },
    
    // ==================== 游戏统计 ====================
    stats: {
        totalGames: { type: Number, default: 0, min: 0 },
        wins: { type: Number, default: 0, min: 0 },
        losses: { type: Number, default: 0, min: 0 },
        draws: { type: Number, default: 0, min: 0 },
        highestLayer: { type: Number, default: 0, min: 0, max: 13 },
        totalPlayTime: { type: Number, default: 0, min: 0 }, // 分钟
        favoriteMode: { 
            type: String, 
            enum: ['solo', 'team', 'tournament', 'streak', null],
            default: null 
        }
    },
    
    // ==================== 防沉迷系统 ====================
    antiAddiction: {
        isMinor: { type: Boolean, default: false },
        age: { type: Number, min: 0, max: 120 },
        dailyPlayTime: { type: Number, default: 0, min: 0 }, // 今日游戏时长(分钟)
        lastPlayDate: { type: Date, default: Date.now },
        monthlySpent: { type: Number, default: 0, min: 0 }, // 本月消费(分)
        lastSpentMonth: { type: Number, default: () => new Date().getMonth() }
    },
    
    // ==================== 社交系统 ====================
    social: {
        friends: [{ 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            index: true 
        }],
        guild: { type: Schema.Types.ObjectId, ref: 'Guild' },
        blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }]
    },
    
    // ==================== 用户设置 ====================
    settings: {
        language: { type: String, default: 'zh-CN' },
        soundEnabled: { type: Boolean, default: true },
        musicEnabled: { type: Boolean, default: true },
        notifications: {
            push: { type: Boolean, default: true },
            email: { type: Boolean, default: true },
            sms: { type: Boolean, default: false }
        }
    },
    
    // ==================== 设备信息 ====================
    devices: [{
        deviceId: { type: String, required: true },
        deviceType: { 
            type: String, 
            enum: ['ios', 'android', 'web', 'desktop'],
            required: true 
        },
        lastLogin: { type: Date, default: Date.now },
        pushToken: String,
        _id: false
    }],
    
    // ==================== 账户状态 ====================
    status: { 
        type: String, 
        enum: ['active', 'suspended', 'banned', 'deleted'],
        default: 'active',
        index: true
    },
    
    // ==================== 时间戳 ====================
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastLoginAt: Date
}, {
    timestamps: true,
    collection: 'users'
});

// ==================== 索引定义 ====================
userSchema.index({ 'stats.highestLayer': -1 }); // 排行榜查询
userSchema.index({ 'vip.level': -1 }); // VIP查询
userSchema.index({ 'social.friends': 1 }); // 好友列表查询
userSchema.index({ status: 1, createdAt: -1 }); // 用户管理查询

// ==================== 虚拟字段 ====================
userSchema.virtual('winRate').get(function() {
    if (this.stats.totalGames === 0) return 0;
    return Math.round((this.stats.wins / this.stats.totalGames) * 100);
});

// ==================== 实例方法 ====================
userSchema.methods.canPlay = function() {
    // 防沉迷检查
    if (!this.antiAddiction.isMinor) return true;
    if (this.antiAddiction.age >= 18) return true;
    // 未成年人：周五、六、日和法定节假日 20-21点可玩
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();
    const isWeekend = day === 0 || day === 6 || day === 5;
    const isPlayTime = hour >= 20 && hour < 21;
    const withinDailyLimit = this.antiAddiction.dailyPlayTime < 60; // 每日限1小时
    return isWeekend && isPlayTime && withinDailyLimit;
};

userSchema.methods.addCurrency = async function(type, amount) {
    if (!['gems', 'coins', 'vipPoints'].includes(type)) {
        throw new Error('无效的货币类型');
    }
    this.currency[type] += amount;
    this.currency[type] = Math.max(0, this.currency[type]);
    return this.save();
};

// ==================== 静态方法 ====================
userSchema.statics.findByUsernameOrEmail = function(query) {
    return this.findOne({
        $or: [
            { username: query },
            { email: query }
        ]
    });
};

userSchema.statics.getLeaderboard = function(limit = 100) {
    return this.find({ status: 'active' })
        .sort({ 'stats.highestLayer': -1, 'stats.wins': -1 })
        .limit(limit)
        .select('username profile.nickname profile.avatar stats.highestLayer stats.wins')
        .lean();
};

// ==================== 中间件 ====================
userSchema.pre('save', function(next) {
    // 重置每日游戏时长
    const today = new Date();
    const lastPlay = this.antiAddiction.lastPlayDate;
    if (lastPlay && today.toDateString() !== lastPlay.toDateString()) {
        this.antiAddiction.dailyPlayTime = 0;
        this.antiAddiction.lastPlayDate = today;
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
