const mongoose = require('mongoose');

const gameRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  mode: {
    type: String,
    required: true,
    enum: ['solo', 'team', 'tournament', 'streak', 'practice'],
    index: true
  },
  result: {
    type: String,
    required: true,
    enum: ['win', 'lose', 'draw', 'abandoned']
  },
  score: {
    type: Number,
    default: 0,
    // 积分变化：胜利+积分，失败-积分
  },
  goldEarned: {
    type: Number,
    default: 0
  },
  diamondEarned: {
    type: Number,
    default: 0
  },
  cardsUsed: {
    type: Number,
    default: 0
  },
  layersClimbed: {
    type: Number,
    default: 0,
    min: 0
  },
  maxLayer: {
    type: Number,
    default: 0
  },
  matchId: {
    type: String,
    index: true
  },
  opponentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    default: null
  },
  details: {
    // 详细对局数据
    startTime: Date,
    endTime: Date,
    duration: Number, // 秒
    playerCards: [{
      cardId: String,
      cardName: String,
      layer: Number,
      damage: Number,
      timestamp: Date
    }],
    opponentCards: [{
      cardId: String,
      cardName: String,
      layer: Number,
      damage: Number,
      timestamp: Date
    }],
    specialEvents: [{
      type: String,
      description: String,
      timestamp: Date
    }],
    comboCount: {
      type: Number,
      default: 0
    },
    criticalHits: {
      type: Number,
      default: 0
    }
  },
  playedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// 复合索引优化查询
gameRecordSchema.index({ userId: 1, playedAt: -1 });
gameRecordSchema.index({ userId: 1, mode: 1, playedAt: -1 });
gameRecordSchema.index({ mode: 1, playedAt: -1 });

// 静态方法：获取用户最近的游戏记录
gameRecordSchema.statics.getRecentGames = async function(userId, limit = 10) {
  return this.find({ userId })
    .sort({ playedAt: -1 })
    .limit(limit)
    .populate('opponentId', 'username avatar');
};

// 静态方法：获取用户统计数据
gameRecordSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalGames: { $sum: 1 },
        wins: {
          $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] }
        },
        totalGoldEarned: { $sum: '$goldEarned' },
        totalDiamondEarned: { $sum: '$diamondEarned' },
        avgLayers: { $avg: '$layersClimbed' },
        maxLayers: { $max: '$layersClimbed' }
      }
    }
  ]);
  
  return stats[0] || {
    totalGames: 0,
    wins: 0,
    totalGoldEarned: 0,
    totalDiamondEarned: 0,
    avgLayers: 0,
    maxLayers: 0
  };
};

// 静态方法：获取排行榜（按层数）
gameRecordSchema.statics.getLeaderboard = async function(mode = null, limit = 100) {
  const matchStage = mode ? { mode } : {};
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$userId',
        highestLayer: { $max: '$layersClimbed' },
        totalGames: { $sum: 1 },
        wins: {
          $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] }
        }
      }
    },
    { $sort: { highestLayer: -1, wins: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $project: {
        userId: '$_id',
        username: '$user.username',
        avatar: '$user.avatar',
        highestLayer: 1,
        totalGames: 1,
        wins: 1,
        winRate: {
          $multiply: [
            { $divide: ['$wins', { $max: ['$totalGames', 1] }] },
            100
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('GameRecord', gameRecordSchema);
