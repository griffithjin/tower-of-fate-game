const mongoose = require('mongoose');

const tournamentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'special', 'season'],
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'registering', 'ongoing', 'ended', 'cancelled'],
    default: 'upcoming',
    index: true
  },
  entryFee: {
    gold: { type: Number, default: 0 },
    diamond: { type: Number, default: 0 }
  },
  prizes: {
    gold: { type: Number, default: 0 },
    diamond: { type: Number, default: 0 },
    items: [{
      itemId: String,
      itemName: String,
      count: Number
    }]
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  minParticipants: {
    type: Number,
    default: 10
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    score: {
      type: Number,
      default: 0
    },
    rank: {
      type: Number,
      default: 0
    },
    highestLayer: {
      type: Number,
      default: 0
    },
    isEliminated: {
      type: Boolean,
      default: false
    }
  }],
  rounds: [{
    roundNumber: Number,
    name: String,
    startTime: Date,
    endTime: Date,
    status: {
      type: String,
      enum: ['pending', 'ongoing', 'completed']
    },
    participants: [{
      userId: mongoose.Schema.Types.ObjectId,
      score: Number,
      layer: Number
    }],
    winners: [mongoose.Schema.Types.ObjectId]
  }],
  schedule: {
    registrationStart: Date,
    registrationEnd: Date,
    startTime: Date,
    endTime: Date
  },
  rules: {
    maxLayers: { type: Number, default: 50 },
    timeLimit: { type: Number, default: 300 }, // 每轮秒数
    maxCards: { type: Number, default: 20 },
    allowItems: { type: Boolean, default: true }
  },
  rankings: [{
    userId: mongoose.Schema.Types.ObjectId,
    username: String,
    score: Number,
    highestLayer: Number,
    rank: Number,
    prize: {
      gold: Number,
      diamond: Number,
      items: [{
        itemId: String,
        count: Number
      }]
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  image: {
    type: String,
    default: ''
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// 索引
tournamentSchema.index({ status: 1, type: 1 });
tournamentSchema.index({ 'schedule.startTime': 1 });
tournamentSchema.index({ featured: 1 });

// 静态方法：获取活跃的锦标赛
tournamentSchema.statics.getActiveTournaments = async function() {
  const now = new Date();
  
  return this.find({
    status: { $in: ['registering', 'ongoing'] },
    'schedule.endTime': { $gt: now }
  }).sort({ 'schedule.startTime': 1 });
};

// 静态方法：获取即将开始的锦标赛
tournamentSchema.statics.getUpcomingTournaments = async function(limit = 5) {
  const now = new Date();
  
  return this.find({
    status: 'upcoming',
    'schedule.registrationStart': { $gt: now }
  })
  .sort({ 'schedule.registrationStart': 1 })
  .limit(limit);
};

// 实例方法：用户报名
tournamentSchema.methods.register = async function(userId) {
  // 检查是否已报名
  const existing = this.participants.find(p => 
    p.userId.toString() === userId.toString()
  );
  
  if (existing) {
    throw new Error('您已经报名参加了此锦标赛');
  }
  
  // 检查是否已满
  if (this.participants.length >= this.maxParticipants) {
    throw new Error('锦标赛报名人数已满');
  }
  
  // 检查报名时间
  const now = new Date();
  if (now < this.schedule.registrationStart || now > this.schedule.registrationEnd) {
    throw new Error('不在报名时间内');
  }
  
  this.participants.push({
    userId,
    registeredAt: new Date()
  });
  
  await this.save();
  return this;
};

// 实例方法：更新用户成绩
tournamentSchema.methods.updatePlayerScore = async function(userId, score, layer) {
  const participant = this.participants.find(p => 
    p.userId.toString() === userId.toString()
  );
  
  if (!participant) {
    throw new Error('用户未参加此锦标赛');
  }
  
  participant.score += score;
  if (layer > participant.highestLayer) {
    participant.highestLayer = layer;
  }
  
  await this.save();
  return participant;
};

// 实例方法：结束锦标赛并计算排名
tournamentSchema.methods.finalize = async function() {
  // 按分数和最高层数排序
  this.participants.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.highestLayer - a.highestLayer;
  });
  
  // 分配排名
  this.participants.forEach((p, index) => {
    p.rank = index + 1;
  });
  
  this.status = 'ended';
  await this.save();
};

module.exports = mongoose.model('Tournament', tournamentSchema);
