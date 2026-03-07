const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validatePointsExchange } = require('../middleware/validator');
const GameRecord = require('../models/GameRecord');
const User = require('../models/User');
const Order = require('../models/Order');

// 积分兑换项目
const EXCHANGE_ITEMS = [
  { id: 'gold_100', name: '100金币', type: 'gold', amount: 100, cost: 50 },
  { id: 'gold_500', name: '500金币', type: 'gold', amount: 500, cost: 200 },
  { id: 'gold_1000', name: '1000金币', type: 'gold', amount: 1000, cost: 350 },
  { id: 'diamond_10', name: '10钻石', type: 'diamond', amount: 10, cost: 100 },
  { id: 'diamond_50', name: '50钻石', type: 'diamond', amount: 50, cost: 450 },
  { id: 'diamond_100', name: '100钻石', type: 'diamond', amount: 100, cost: 800 },
  { id: 'vip_1d', name: 'VIP体验卡(1天)', type: 'vip', duration: 1, cost: 500 },
  { id: 'vip_7d', name: 'VIP周卡(7天)', type: 'vip', duration: 7, cost: 3000 },
  { id: 'vip_30d', name: 'VIP月卡(30天)', type: 'vip', duration: 30, cost: 10000 }
];

// @route   GET /api/points/rank
// @desc    获取积分排行榜
// @access  Public
router.get('/rank', async (req, res) => {
  try {
    const { type = 'total', limit = 100 } = req.query;
    
    let leaderboard;
    
    if (type === 'weekly') {
      // 获取本周排行榜
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      leaderboard = await GameRecord.aggregate([
        {
          $match: {
            playedAt: { $gte: startOfWeek }
          }
        },
        {
          $group: {
            _id: '$userId',
            weeklyPoints: { $sum: '$score' },
            gamesPlayed: { $sum: 1 },
            wins: {
              $sum: { $cond: [{ $eq: ['$result', 'win'] }, 1, 0] }
            }
          }
        },
        { $sort: { weeklyPoints: -1 } },
        { $limit: parseInt(limit) },
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
            rank: { $add: [{ $indexOfArray: ['$user._id', '$_id'] }, 1] },
            userId: '$_id',
            username: '$user.username',
            avatar: '$user.avatar',
            weeklyPoints: 1,
            gamesPlayed: 1,
            wins: 1,
            winRate: {
              $multiply: [
                { $divide: ['$wins', { $max: ['$gamesPlayed', 1] }] },
                100
              ]
            }
          }
        }
      ]);
    } else {
      // 获取总排行榜
      leaderboard = await User.aggregate([
        {
          $sort: { 'stats.totalPoints': -1 }
        },
        { $limit: parseInt(limit) },
        {
          $project: {
            rank: { $add: [{ $indexOfArray: [['$stats.totalPoints'], '$stats.totalPoints'] }, 1] },
            userId: '$_id',
            username: 1,
            avatar: 1,
            totalPoints: '$stats.totalPoints',
            totalGames: '$stats.totalGames',
            wins: '$stats.wins',
            winRate: {
              $multiply: [
                { $divide: ['$stats.wins', { $max: ['$stats.totalGames', 1] }] },
                100
              ]
            }
          }
        }
      ]);
    }

    // 添加排名
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    res.json({
      success: true,
      data: {
        type,
        leaderboard: leaderboard.map(entry => ({
          rank: entry.rank,
          userId: entry.userId,
          username: entry.username,
          avatar: entry.avatar,
          points: entry.weeklyPoints || entry.totalPoints || 0,
          gamesPlayed: entry.gamesPlayed || entry.totalGames || 0,
          wins: entry.wins || 0,
          winRate: (entry.winRate || 0).toFixed(2)
        }))
      }
    });
  } catch (error) {
    console.error('获取排行榜错误:', error);
    res.status(500).json({
      success: false,
      message: '获取排行榜失败'
    });
  }
});

// @route   GET /api/points/history
// @desc    获取积分历史
// @access  Private
router.get('/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      GameRecord.find({ userId })
        .sort({ playedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('mode result score goldEarned diamondEarned layersClimbed playedAt'),
      GameRecord.countDocuments({ userId })
    ]);

    // 计算积分变化趋势
    const recentScores = records.slice(0, 7).map(r => r.score);
    const trend = recentScores.reduce((a, b) => a + b, 0);

    res.json({
      success: true,
      data: {
        history: records.map(r => ({
          id: r._id,
          mode: r.mode,
          result: r.result,
          score: r.score,
          goldEarned: r.goldEarned,
          diamondEarned: r.diamondEarned,
          layersClimbed: r.layersClimbed,
          playedAt: r.playedAt
        })),
        summary: {
          totalGames: total,
          recentTrend: trend
        },
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取积分历史错误:', error);
    res.status(500).json({
      success: false,
      message: '获取积分历史失败'
    });
  }
});

// @route   GET /api/points/exchange-items
// @desc    获取可兑换物品列表
// @access  Public
router.get('/exchange-items', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        items: EXCHANGE_ITEMS.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          amount: item.amount,
          duration: item.duration,
          cost: item.cost
        }))
      }
    });
  } catch (error) {
    console.error('获取兑换物品错误:', error);
    res.status(500).json({
      success: false,
      message: '获取兑换物品失败'
    });
  }
});

// @route   POST /api/points/exchange
// @desc    积分兑换
// @access  Private
router.post('/exchange', authenticate, validatePointsExchange, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const userId = req.userId;

    // 查找兑换项目
    const item = EXCHANGE_ITEMS.find(i => i.id === itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: '兑换项目不存在'
      });
    }

    // 计算总花费
    const totalCost = item.cost * quantity;

    // 获取用户积分（从用户统计数据）
    const user = await User.findById(userId);
    const userPoints = user.stats.totalPoints;

    if (userPoints < totalCost) {
      return res.status(403).json({
        success: false,
        message: '积分不足',
        required: totalCost,
        current: userPoints
      });
    }

    // 执行兑换
    switch (item.type) {
      case 'gold':
        user.gold += item.amount * quantity;
        break;
      case 'diamond':
        user.diamond += item.amount * quantity;
        break;
      case 'vip':
        // 延长VIP有效期
        const now = new Date();
        const currentExpire = user.vip.expireAt && user.vip.expireAt > now 
          ? user.vip.expireAt 
          : now;
        
        user.vip.expireAt = new Date(currentExpire.getTime() + item.duration * 24 * 60 * 60 * 1000);
        
        // 增加VIP经验
        await user.addVIPExp(100 * quantity);
        break;
    }

    // 扣除积分（通过减少总积分的方式）
    user.stats.totalPoints -= totalCost;
    await user.save();

    // 记录兑换
    const exchangeRecord = {
      userId,
      itemId,
      itemName: item.name,
      quantity,
      cost: totalCost,
      exchangedAt: new Date()
    };

    res.json({
      success: true,
      message: '兑换成功',
      data: {
        exchange: {
          item: {
            name: item.name,
            type: item.type,
            quantity: item.amount * quantity
          },
          cost: totalCost,
          remainingPoints: user.stats.totalPoints
        },
        user: {
          gold: user.gold,
          diamond: user.diamond,
          vip: user.vip
        }
      }
    });
  } catch (error) {
    console.error('积分兑换错误:', error);
    res.status(500).json({
      success: false,
      message: '兑换失败'
    });
  }
});

// @route   GET /api/points/my-rank
// @desc    获取我的排名
// @access  Private
router.get('/my-rank', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    // 计算排名
    const higherRanked = await User.countDocuments({
      'stats.totalPoints': { $gt: user.stats.totalPoints }
    });

    const myRank = higherRanked + 1;

    // 获取附近排名
    const nearbyUsers = await User.find({
      $or: [
        { 'stats.totalPoints': { $gte: user.stats.totalPoints - 100, $lt: user.stats.totalPoints } },
        { 'stats.totalPoints': { $gte: user.stats.totalPoints, $lte: user.stats.totalPoints + 100 } }
      ]
    })
    .sort({ 'stats.totalPoints': -1 })
    .limit(20)
    .select('username avatar stats.totalPoints stats.totalGames stats.wins');

    res.json({
      success: true,
      data: {
        myRank: {
          rank: myRank,
          userId: user._id,
          username: user.username,
          avatar: user.avatar,
          totalPoints: user.stats.totalPoints,
          totalGames: user.stats.totalGames,
          wins: user.stats.wins,
          winRate: user.stats.totalGames > 0 
            ? ((user.stats.wins / user.stats.totalGames) * 100).toFixed(2)
            : 0
        },
        nearby: nearbyUsers.map((u, index) => ({
          rank: higherRanked - nearbyUsers.filter(nu => nu.stats.totalPoints > u.stats.totalPoints).length + index + 1,
          userId: u._id,
          username: u.username,
          avatar: u.avatar,
          totalPoints: u.stats.totalPoints,
          isMe: u._id.toString() === userId.toString()
        }))
      }
    });
  } catch (error) {
    console.error('获取我的排名错误:', error);
    res.status(500).json({
      success: false,
      message: '获取排名失败'
    });
  }
});

module.exports = router;
