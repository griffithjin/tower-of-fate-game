const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validatePlayCard } = require('../middleware/validator');
const GameRecord = require('../models/GameRecord');
const User = require('../models/User');
const { v4: uuidv4 } = require('uuid');

// 活跃对局存储（生产环境应使用Redis）
const activeMatches = new Map();

// 命运塔游戏配置
const GAME_CONFIG = {
  MAX_LAYERS: 50,
  MAX_CARDS: 20,
  BASE_DAMAGE: 10,
  COMBO_MULTIPLIER: 1.5,
  CRITICAL_CHANCE: 0.15,
  CRITICAL_MULTIPLIER: 2.0
};

// 卡牌类型定义
const CARD_TYPES = {
  ATTACK: { id: 'attack', name: '攻击', damage: 10, layerCost: 1 },
  HEAVY_ATTACK: { id: 'heavy_attack', name: '重击', damage: 25, layerCost: 2 },
  MAGIC: { id: 'magic', name: '魔法', damage: 15, layerCost: 1, special: true },
  DEFENSE: { id: 'defense', name: '防御', damage: 5, layerCost: 1, block: true },
  BURST: { id: 'burst', name: '爆发', damage: 50, layerCost: 5 },
  HEAL: { id: 'heal', name: '治疗', damage: 0, layerCost: 1, heal: 20 }
};

// @route   POST /api/game/match/start
// @desc    开始新对局
// @access  Private
router.post('/match/start', authenticate, async (req, res) => {
  try {
    const { mode = 'solo', opponentId } = req.body;
    const userId = req.userId;

    // 生成对局ID
    const matchId = uuidv4();

    // 创建对局数据
    const match = {
      matchId,
      mode,
      status: 'playing',
      createdAt: new Date(),
      players: [{
        userId: userId.toString(),
        username: req.user.username,
        avatar: req.user.avatar,
        currentLayer: 1,
        maxLayer: 1,
        cardsUsed: 0,
        totalDamage: 0,
        health: 100,
        combo: 0,
        cards: generateCards()
      }],
      currentTurn: userId.toString(),
      turnStartTime: Date.now(),
      gameLog: []
    };

    // 如果是组队模式，添加对手
    if (mode === 'team' && opponentId) {
      const opponent = await User.findById(opponentId);
      if (opponent) {
        match.players.push({
          userId: opponent._id.toString(),
          username: opponent.username,
          avatar: opponent.avatar,
          currentLayer: 1,
          maxLayer: 1,
          cardsUsed: 0,
          totalDamage: 0,
          health: 100,
          combo: 0,
          cards: generateCards()
        });
      }
    }

    // 存储对局
    activeMatches.set(matchId, match);

    res.json({
      success: true,
      message: '对局开始',
      data: {
        matchId,
        mode,
        players: match.players.map(p => ({
          userId: p.userId,
          username: p.username,
          avatar: p.avatar,
          currentLayer: p.currentLayer,
          health: p.health
        })),
        cards: match.players[0].cards,
        config: GAME_CONFIG
      }
    });
  } catch (error) {
    console.error('开始对局错误:', error);
    res.status(500).json({
      success: false,
      message: '开始对局失败'
    });
  }
});

// @route   POST /api/game/match/play
// @desc    出牌
// @access  Private
router.post('/match/play', authenticate, validatePlayCard, async (req, res) => {
  try {
    const { matchId, cardId, targetLayer } = req.body;
    const userId = req.userId.toString();

    // 查找对局
    const match = activeMatches.get(matchId);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '对局不存在或已结束'
      });
    }

    // 检查是否轮到当前用户
    const player = match.players.find(p => p.userId === userId);
    
    if (!player) {
      return res.status(403).json({
        success: false,
        message: '您不是此对局的参与者'
      });
    }

    // 检查卡牌是否在手牌中
    const cardIndex = player.cards.findIndex(c => c.cardId === cardId);
    
    if (cardIndex === -1) {
      return res.status(400).json({
        success: false,
        message: '无效的卡牌'
      });
    }

    const card = player.cards[cardIndex];
    const cardType = CARD_TYPES[card.type.toUpperCase()];

    // 计算伤害和效果
    let damage = cardType.damage;
    let isCritical = Math.random() < GAME_CONFIG.CRITICAL_CHANCE;
    
    if (isCritical) {
      damage *= GAME_CONFIG.CRITICAL_MULTIPLIER;
    }

    // 连击加成
    player.combo++;
    if (player.combo >= 3) {
      damage *= GAME_CONFIG.COMBO_MULTIPLIER;
    }

    // 更新玩家数据
    player.cardsUsed++;
    player.totalDamage += Math.floor(damage);
    
    // 移除已使用的卡牌，添加新卡牌
    player.cards.splice(cardIndex, 1);
    player.cards.push(generateSingleCard());

    // 计算层数进度
    const layerProgress = Math.floor(damage / GAME_CONFIG.BASE_DAMAGE);
    player.currentLayer += layerProgress;
    
    if (player.currentLayer > player.maxLayer) {
      player.maxLayer = player.currentLayer;
    }

    // 检查是否达到最高层
    let gameEnded = false;
    let result = null;
    
    if (player.currentLayer >= GAME_CONFIG.MAX_LAYERS) {
      gameEnded = true;
      result = 'win';
    } else if (player.cardsUsed >= GAME_CONFIG.MAX_CARDS) {
      gameEnded = true;
      result = player.currentLayer >= 30 ? 'win' : 'lose';
    }

    // 记录游戏日志
    const playRecord = {
      timestamp: new Date(),
      playerId: userId,
      cardId,
      cardType: cardType.name,
      damage: Math.floor(damage),
      isCritical,
      combo: player.combo,
      layerProgress,
      currentLayer: player.currentLayer
    };
    
    match.gameLog.push(playRecord);

    // 如果游戏结束，保存记录
    if (gameEnded) {
      match.status = 'ended';
      match.result = result;
      match.endedAt = new Date();

      // 计算奖励
      const rewards = calculateRewards(player, result);
      
      // 保存游戏记录
      await saveGameRecord(match, player, rewards);
      
      // 更新用户数据
      await updateUserStats(userId, result, rewards);

      // 清理对局
      setTimeout(() => activeMatches.delete(matchId), 300000); // 5分钟后清理
    }

    res.json({
      success: true,
      data: {
        playResult: {
          card: cardType.name,
          damage: Math.floor(damage),
          isCritical,
          combo: player.combo,
          layerProgress,
          currentLayer: player.currentLayer
        },
        playerState: {
          currentLayer: player.currentLayer,
          maxLayer: player.maxLayer,
          cardsUsed: player.cardsUsed,
          totalDamage: player.totalDamage,
          cards: player.cards
        },
        gameStatus: match.status,
        result: gameEnded ? {
          outcome: result,
          rewards
        } : null
      }
    });
  } catch (error) {
    console.error('出牌错误:', error);
    res.status(500).json({
      success: false,
      message: '出牌失败'
    });
  }
});

// @route   GET /api/game/match/state
// @desc    获取对局状态
// @access  Private
router.get('/match/state', authenticate, async (req, res) => {
  try {
    const { matchId } = req.query;
    
    if (!matchId) {
      return res.status(400).json({
        success: false,
        message: '请提供对局ID'
      });
    }

    const match = activeMatches.get(matchId);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '对局不存在或已结束'
      });
    }

    res.json({
      success: true,
      data: {
        matchId: match.matchId,
        mode: match.mode,
        status: match.status,
        players: match.players.map(p => ({
          userId: p.userId,
          username: p.username,
          currentLayer: p.currentLayer,
          maxLayer: p.maxLayer,
          cardsUsed: p.cardsUsed,
          totalDamage: p.totalDamage,
          health: p.health
        })),
        currentTurn: match.currentTurn,
        createdAt: match.createdAt,
        gameLog: match.gameLog.slice(-10) // 只返回最近10条记录
      }
    });
  } catch (error) {
    console.error('获取对局状态错误:', error);
    res.status(500).json({
      success: false,
      message: '获取对局状态失败'
    });
  }
});

// @route   POST /api/game/match/end
// @desc    结束对局（放弃或正常结束）
// @access  Private
router.post('/match/end', authenticate, async (req, res) => {
  try {
    const { matchId, reason = 'completed' } = req.body;
    const userId = req.userId.toString();

    const match = activeMatches.get(matchId);
    
    if (!match) {
      return res.status(404).json({
        success: false,
        message: '对局不存在或已结束'
      });
    }

    const player = match.players.find(p => p.userId === userId);
    
    if (!player) {
      return res.status(403).json({
        success: false,
        message: '您不是此对局的参与者'
      });
    }

    // 设置对局状态
    match.status = 'ended';
    match.result = reason === 'abandoned' ? 'abandoned' : 'completed';
    match.endedAt = new Date();

    // 计算奖励
    const rewards = calculateRewards(player, match.result === 'abandoned' ? 'lose' : 'win');
    
    // 保存游戏记录
    await saveGameRecord(match, player, rewards);
    
    // 更新用户数据
    await updateUserStats(userId, match.result === 'abandoned' ? 'lose' : 'win', rewards);

    // 清理对局
    setTimeout(() => activeMatches.delete(matchId), 300000);

    res.json({
      success: true,
      message: '对局已结束',
      data: {
        matchId,
        result: match.result,
        finalLayer: player.currentLayer,
        maxLayer: player.maxLayer,
        cardsUsed: player.cardsUsed,
        rewards
      }
    });
  } catch (error) {
    console.error('结束对局错误:', error);
    res.status(500).json({
      success: false,
      message: '结束对局失败'
    });
  }
});

// @route   GET /api/game/history
// @desc    获取游戏历史记录
// @access  Private
router.get('/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, mode } = req.query;
    const userId = req.userId;

    const query = { userId };
    if (mode) query.mode = mode;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [records, total] = await Promise.all([
      GameRecord.find(query)
        .sort({ playedAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('opponentId', 'username avatar'),
      GameRecord.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        records: records.map(r => ({
          id: r._id,
          mode: r.mode,
          result: r.result,
          score: r.score,
          goldEarned: r.goldEarned,
          diamondEarned: r.diamondEarned,
          cardsUsed: r.cardsUsed,
          layersClimbed: r.layersClimbed,
          maxLayer: r.maxLayer,
          playedAt: r.playedAt,
          opponent: r.opponentId ? {
            id: r.opponentId._id,
            username: r.opponentId.username,
            avatar: r.opponentId.avatar
          } : null
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
    console.error('获取游戏历史错误:', error);
    res.status(500).json({
      success: false,
      message: '获取游戏历史失败'
    });
  }
});

// @route   GET /api/game/leaderboard
// @desc    获取排行榜
// @access  Public
router.get('/leaderboard', async (req, res) => {
  try {
    const { mode, limit = 50 } = req.query;

    const leaderboard = await GameRecord.getLeaderboard(mode, parseInt(limit));

    res.json({
      success: true,
      data: {
        leaderboard: leaderboard.map((entry, index) => ({
          rank: index + 1,
          userId: entry.userId,
          username: entry.username,
          avatar: entry.avatar,
          highestLayer: entry.highestLayer,
          totalGames: entry.totalGames,
          wins: entry.wins,
          winRate: entry.winRate.toFixed(2)
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

// ==================== 辅助函数 ====================

// 生成初始卡牌
function generateCards() {
  const cards = [];
  const types = Object.keys(CARD_TYPES);
  
  for (let i = 0; i < 5; i++) {
    cards.push(generateSingleCard());
  }
  
  return cards;
}

// 生成单张卡牌
function generateSingleCard() {
  const types = Object.keys(CARD_TYPES);
  const randomType = types[Math.floor(Math.random() * types.length)];
  
  return {
    cardId: uuidv4(),
    type: randomType.toLowerCase(),
    name: CARD_TYPES[randomType].name
  };
}

// 计算奖励
function calculateRewards(player, result) {
  const baseGold = 50;
  const baseDiamond = 5;
  const layerBonus = Math.floor(player.maxLayer / 10) * 10;
  
  let goldReward = baseGold + layerBonus;
  let diamondReward = baseDiamond;
  let scoreChange = 0;

  if (result === 'win') {
    goldReward *= 2;
    diamondReward *= 2;
    scoreChange = 25;
  } else if (result === 'lose') {
    goldReward = Math.floor(goldReward * 0.5);
    diamondReward = 0;
    scoreChange = -15;
  } else {
    // 放弃
    goldReward = 0;
    diamondReward = 0;
    scoreChange = -25;
  }

  return {
    gold: goldReward,
    diamond: diamondReward,
    score: scoreChange,
    layerBonus
  };
}

// 保存游戏记录
async function saveGameRecord(match, player, rewards) {
  const record = new GameRecord({
    userId: player.userId,
    mode: match.mode,
    result: match.result === 'abandoned' ? 'abandoned' : 
            (player.currentLayer >= 30 ? 'win' : 'lose'),
    score: rewards.score,
    goldEarned: rewards.gold,
    diamondEarned: rewards.diamond,
    cardsUsed: player.cardsUsed,
    layersClimbed: player.currentLayer,
    maxLayer: player.maxLayer,
    matchId: match.matchId,
    opponentId: match.players.find(p => p.userId !== player.userId)?.userId || null,
    playedAt: new Date(),
    details: {
      startTime: match.createdAt,
      endTime: new Date(),
      duration: Math.floor((Date.now() - match.createdAt.getTime()) / 1000),
      playerCards: match.gameLog
        .filter(log => log.playerId === player.userId)
        .map(log => ({
          cardId: log.cardId,
          cardName: log.cardType,
          layer: log.currentLayer,
          damage: log.damage,
          timestamp: log.timestamp
        })),
      comboCount: player.combo,
      criticalHits: match.gameLog.filter(log => log.isCritical).length
    }
  });

  await record.save();
  return record;
}

// 更新用户统计
async function updateUserStats(userId, result, rewards) {
  const user = await User.findById(userId);
  
  if (user) {
    user.stats.totalGames++;
    if (result === 'win') {
      user.stats.wins++;
    }
    user.stats.totalPoints += rewards.score;
    
    user.gold += rewards.gold;
    user.diamond += rewards.diamond;
    
    await user.save();
  }
}

module.exports = router;
