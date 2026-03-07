const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('../config/jwt');
const User = require('../models/User');
const GameRecord = require('../models/GameRecord');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { validateRegister, validateLogin, validateUpdateProfile } = require('../middleware/validator');

// @route   POST /api/users/register
// @desc    用户注册
// @access  Public
router.post('/register', validateRegister, async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: '该用户名已被使用'
      });
    }

    // 创建新用户
    const user = new User({
      username,
      email,
      password,
      gold: 1000,      // 新手金币
      diamond: 100     // 新手钻石
    });

    await user.save();

    // 生成 token
    const token = jwt.generateToken({ userId: user._id });
    const refreshToken = jwt.generateRefreshToken({ userId: user._id });

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          gold: user.gold,
          diamond: user.diamond,
          vip: user.vip,
          createdAt: user.createdAt
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '注册失败，请稍后重试'
    });
  }
});

// @route   POST /api/users/login
// @desc    用户登录
// @access  Public
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户（包含密码字段）
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 检查用户状态
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: '账号已被禁用，请联系客服'
      });
    }

    // 更新最后登录时间
    user.lastLogin = new Date();
    await user.save();

    // 生成 token
    const token = jwt.generateToken({ userId: user._id });
    const refreshToken = jwt.generateRefreshToken({ userId: user._id });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          gold: user.gold,
          diamond: user.diamond,
          vip: user.vip,
          stats: user.stats,
          lastLogin: user.lastLogin
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

// @route   POST /api/users/refresh
// @desc    刷新访问令牌
// @access  Public
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: '未提供刷新令牌'
      });
    }

    const decoded = jwt.verifyRefreshToken(refreshToken);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '刷新令牌无效或已过期'
      });
    }

    // 验证用户是否存在
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    // 生成新的访问令牌
    const newToken = jwt.generateToken({ userId: user._id });

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('刷新令牌错误:', error);
    res.status(500).json({
      success: false,
      message: '刷新令牌失败'
    });
  }
});

// @route   GET /api/users/profile
// @desc    获取用户信息
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
  try {
    const user = req.user;

    // 获取用户统计
    const gameStats = await GameRecord.getUserStats(user._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          gold: user.gold,
          diamond: user.diamond,
          vip: user.vip,
          inventory: user.inventory,
          stats: {
            ...user.stats,
            ...gameStats
          },
          createdAt: user.createdAt,
          lastLogin: user.lastLogin
        }
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    更新用户信息
// @access  Private
router.put('/profile', authenticate, validateUpdateProfile, async (req, res) => {
  try {
    const { username, avatar } = req.body;
    const user = req.user;

    // 如果更新用户名，检查是否已被使用
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          message: '该用户名已被使用'
        });
      }
      user.username = username;
    }

    // 更新头像
    if (avatar) {
      user.avatar = avatar;
    }

    await user.save();

    res.json({
      success: true,
      message: '用户信息更新成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar
        }
      }
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败'
    });
  }
});

// @route   GET /api/users/balance
// @desc    获取用户金币/钻石余额
// @access  Private
router.get('/balance', authenticate, async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        gold: user.gold,
        diamond: user.diamond,
        vip: user.vip
      }
    });
  } catch (error) {
    console.error('获取余额错误:', error);
    res.status(500).json({
      success: false,
      message: '获取余额失败'
    });
  }
});

// @route   GET /api/users/stats
// @desc    获取用户详细统计
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    // 获取详细统计
    const [gameStats, recentGames] = await Promise.all([
      GameRecord.getUserStats(userId),
      GameRecord.getRecentGames(userId, 5)
    ]);

    res.json({
      success: true,
      data: {
        stats: gameStats,
        recentGames,
        winRate: gameStats.totalGames > 0 
          ? ((gameStats.wins / gameStats.totalGames) * 100).toFixed(2)
          : 0
      }
    });
  } catch (error) {
    console.error('获取用户统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取用户统计失败'
    });
  }
});

// @route   POST /api/users/change-password
// @desc    修改密码
// @access  Private
router.post('/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: '当前密码和新密码不能为空'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '新密码长度至少6个字符'
      });
    }

    const user = await User.findById(req.userId).select('+password');
    
    // 验证当前密码
    const isMatch = await user.comparePassword(currentPassword);
    
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({
      success: false,
      message: '修改密码失败'
    });
  }
});

module.exports = router;
