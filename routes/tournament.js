const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateTournamentJoin } = require('../middleware/validator');
const Tournament = require('../models/Tournament');
const User = require('../models/User');

// @route   GET /api/tournament/list
// @desc    获取锦标赛列表
// @access  Public
router.get('/list', async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tournaments, total] = await Promise.all([
      Tournament.find(query)
        .sort({ 'schedule.startTime': -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Tournament.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        tournaments: tournaments.map(t => ({
          id: t._id,
          name: t.name,
          description: t.description,
          type: t.type,
          status: t.status,
          entryFee: t.entryFee,
          prizes: t.prizes,
          maxParticipants: t.maxParticipants,
          currentParticipants: t.participants.length,
          schedule: t.schedule,
          rules: t.rules,
          image: t.image,
          featured: t.featured
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取锦标赛列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取锦标赛列表失败'
    });
  }
});

// @route   GET /api/tournament/active
// @desc    获取活跃锦标赛
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const tournaments = await Tournament.getActiveTournaments();

    res.json({
      success: true,
      data: {
        tournaments: tournaments.map(t => ({
          id: t._id,
          name: t.name,
          description: t.description,
          type: t.type,
          status: t.status,
          entryFee: t.entryFee,
          prizes: t.prizes,
          maxParticipants: t.maxParticipants,
          currentParticipants: t.participants.length,
          schedule: t.schedule,
          image: t.image
        }))
      }
    });
  } catch (error) {
    console.error('获取活跃锦标赛错误:', error);
    res.status(500).json({
      success: false,
      message: '获取活跃锦标赛失败'
    });
  }
});

// @route   GET /api/tournament/upcoming
// @desc    获取即将开始的锦标赛
// @access  Public
router.get('/upcoming', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const tournaments = await Tournament.getUpcomingTournaments(limit);

    res.json({
      success: true,
      data: {
        tournaments: tournaments.map(t => ({
          id: t._id,
          name: t.name,
          description: t.description,
          type: t.type,
          entryFee: t.entryFee,
          prizes: t.prizes,
          maxParticipants: t.maxParticipants,
          schedule: t.schedule,
          image: t.image
        }))
      }
    });
  } catch (error) {
    console.error('获取即将开始锦标赛错误:', error);
    res.status(500).json({
      success: false,
      message: '获取即将开始锦标赛失败'
    });
  }
});

// @route   GET /api/tournament/:tournamentId
// @desc    获取锦标赛详情
// @access  Public
router.get('/:tournamentId', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    const tournament = await Tournament.findById(tournamentId)
      .populate('participants.userId', 'username avatar');
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: '锦标赛不存在'
      });
    }

    res.json({
      success: true,
      data: {
        tournament: {
          id: tournament._id,
          name: tournament.name,
          description: tournament.description,
          type: tournament.type,
          status: tournament.status,
          entryFee: tournament.entryFee,
          prizes: tournament.prizes,
          maxParticipants: tournament.maxParticipants,
          minParticipants: tournament.minParticipants,
          currentParticipants: tournament.participants.length,
          participants: tournament.participants.map(p => ({
            userId: p.userId._id,
            username: p.userId.username,
            avatar: p.userId.avatar,
            registeredAt: p.registeredAt,
            score: p.score,
            rank: p.rank,
            highestLayer: p.highestLayer,
            isEliminated: p.isEliminated
          })),
          schedule: tournament.schedule,
          rules: tournament.rules,
          rounds: tournament.rounds,
          rankings: tournament.rankings,
          image: tournament.image,
          featured: tournament.featured
        }
      }
    });
  } catch (error) {
    console.error('获取锦标赛详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取锦标赛详情失败'
    });
  }
});

// @route   POST /api/tournament/join
// @desc    报名参加锦标赛
// @access  Private
router.post('/join', authenticate, validateTournamentJoin, async (req, res) => {
  try {
    const { tournamentId } = req.body;
    const userId = req.userId;

    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: '锦标赛不存在'
      });
    }

    // 检查报名费用
    const user = await User.findById(userId);
    
    if (tournament.entryFee.gold > 0) {
      if (user.gold < tournament.entryFee.gold) {
        return res.status(403).json({
          success: false,
          message: '金币不足，无法报名参加'
        });
      }
    }
    
    if (tournament.entryFee.diamond > 0) {
      if (user.diamond < tournament.entryFee.diamond) {
        return res.status(403).json({
          success: false,
          message: '钻石不足，无法报名参加'
        });
      }
    }

    // 扣除报名费用
    if (tournament.entryFee.gold > 0) {
      user.gold -= tournament.entryFee.gold;
    }
    if (tournament.entryFee.diamond > 0) {
      user.diamond -= tournament.entryFee.diamond;
    }

    // 报名
    await tournament.register(userId);
    await user.save();

    res.json({
      success: true,
      message: '报名成功',
      data: {
        tournamentId: tournament._id,
        name: tournament.name,
        entryFee: tournament.entryFee,
        remainingBalance: {
          gold: user.gold,
          diamond: user.diamond
        }
      }
    });
  } catch (error) {
    console.error('报名锦标赛错误:', error);
    res.status(400).json({
      success: false,
      message: error.message || '报名失败'
    });
  }
});

// @route   GET /api/tournament/:tournamentId/state
// @desc    获取锦标赛状态
// @access  Private
router.get('/:tournamentId/state', authenticate, async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const userId = req.userId;

    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: '锦标赛不存在'
      });
    }

    // 检查用户是否参加
    const participant = tournament.participants.find(
      p => p.userId.toString() === userId.toString()
    );

    if (!participant) {
      return res.status(403).json({
        success: false,
        message: '您未参加此锦标赛'
      });
    }

    // 获取当前轮次
    const currentRound = tournament.rounds.find(r => r.status === 'ongoing') ||
                        tournament.rounds[tournament.rounds.length - 1];

    res.json({
      success: true,
      data: {
        tournament: {
          id: tournament._id,
          name: tournament.name,
          status: tournament.status,
          currentRound: currentRound ? {
            roundNumber: currentRound.roundNumber,
            name: currentRound.name,
            startTime: currentRound.startTime,
            endTime: currentRound.endTime,
            status: currentRound.status
          } : null
        },
        participant: {
          rank: participant.rank,
          score: participant.score,
          highestLayer: participant.highestLayer,
          isEliminated: participant.isEliminated
        }
      }
    });
  } catch (error) {
    console.error('获取锦标赛状态错误:', error);
    res.status(500).json({
      success: false,
      message: '获取锦标赛状态失败'
    });
  }
});

// @route   POST /api/tournament/play
// @desc    锦标赛出牌
// @access  Private
router.post('/play', authenticate, async (req, res) => {
  try {
    const { tournamentId, score, layer } = req.body;
    const userId = req.userId;

    const tournament = await Tournament.findById(tournamentId);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: '锦标赛不存在'
      });
    }

    // 检查锦标赛状态
    if (tournament.status !== 'ongoing') {
      return res.status(400).json({
        success: false,
        message: '锦标赛不在进行中'
      });
    }

    // 更新成绩
    await tournament.updatePlayerScore(userId, score, layer);

    res.json({
      success: true,
      message: '成绩已记录',
      data: {
        score,
        layer
      }
    });
  } catch (error) {
    console.error('锦标赛出牌错误:', error);
    res.status(400).json({
      success: false,
      message: error.message || '记录成绩失败'
    });
  }
});

// @route   GET /api/tournament/:tournamentId/leaderboard
// @desc    获取锦标赛排行榜
// @access  Public
router.get('/:tournamentId/leaderboard', async (req, res) => {
  try {
    const { tournamentId } = req.params;
    
    const tournament = await Tournament.findById(tournamentId)
      .populate('rankings.userId', 'username avatar');
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        message: '锦标赛不存在'
      });
    }

    // 如果没有最终排名，生成临时排名
    let rankings = tournament.rankings;
    
    if (rankings.length === 0 && tournament.participants.length > 0) {
      const sortedParticipants = [...tournament.participants].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.highestLayer - a.highestLayer;
      });
      
      rankings = sortedParticipants.map((p, index) => ({
        userId: p.userId,
        username: p.username || 'Unknown',
        score: p.score,
        highestLayer: p.highestLayer,
        rank: index + 1
      }));
    }

    res.json({
      success: true,
      data: {
        tournament: {
          id: tournament._id,
          name: tournament.name,
          status: tournament.status
        },
        leaderboard: rankings.map(r => ({
          rank: r.rank,
          userId: r.userId,
          username: r.username,
          avatar: r.userId?.avatar,
          score: r.score,
          highestLayer: r.highestLayer,
          prize: r.prize
        }))
      }
    });
  } catch (error) {
    console.error('获取锦标赛排行榜错误:', error);
    res.status(500).json({
      success: false,
      message: '获取排行榜失败'
    });
  }
});

// @route   GET /api/tournament/my-tournaments
// @desc    获取我参加的锦标赛
// @access  Private
router.get('/my-tournaments', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    const query = { 'participants.userId': userId };
    if (status) query.status = status;

    const tournaments = await Tournament.find(query)
      .sort({ 'schedule.startTime': -1 });

    res.json({
      success: true,
      data: {
        tournaments: tournaments.map(t => {
          const myParticipation = t.participants.find(
            p => p.userId.toString() === userId.toString()
          );
          
          return {
            id: t._id,
            name: t.name,
            type: t.type,
            status: t.status,
            myRank: myParticipation?.rank || 0,
            myScore: myParticipation?.score || 0,
            myHighestLayer: myParticipation?.highestLayer || 0,
            isEliminated: myParticipation?.isEliminated || false,
            schedule: t.schedule
          };
        })
      }
    });
  } catch (error) {
    console.error('获取我的锦标赛错误:', error);
    res.status(500).json({
      success: false,
      message: '获取我的锦标赛失败'
    });
  }
});

module.exports = router;
