const jwt = require('../config/jwt');
const User = require('../models/User');

// JWT 认证中间件
const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌，请重新登录'
      });
    }

    const token = authHeader.substring(7);
    
    // 验证 token
    const decoded = jwt.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '认证令牌无效或已过期，请重新登录'
      });
    }

    // 查找用户
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
    }

    // 将用户信息附加到请求对象
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(500).json({
      success: false,
      message: '认证过程发生错误'
    });
  }
};

// 可选认证中间件（用于部分需要用户信息但不强制登录的接口）
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verifyToken(token);
      
      if (decoded) {
        const user = await User.findById(decoded.userId);
        if (user && user.isActive) {
          req.user = user;
          req.userId = user._id;
        }
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

// 管理员权限中间件
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

// VIP 等级检查中间件
const requireVIPLevel = (minLevel) => {
  return (req, res, next) => {
    if (!req.user || req.user.vip.level < minLevel) {
      return res.status(403).json({
        success: false,
        message: `需要VIP等级 ${minLevel} 或以上`
      });
    }
    next();
  };
};

// 金币检查中间件
const requireGold = (amount) => {
  return (req, res, next) => {
    if (!req.user || req.user.gold < amount) {
      return res.status(403).json({
        success: false,
        message: '金币不足',
        required: amount,
        current: req.user?.gold || 0
      });
    }
    next();
  };
};

// 钻石检查中间件
const requireDiamond = (amount) => {
  return (req, res, next) => {
    if (!req.user || req.user.diamond < amount) {
      return res.status(403).json({
        success: false,
        message: '钻石不足',
        required: amount,
        current: req.user?.diamond || 0
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  optionalAuth,
  requireAdmin,
  requireVIPLevel,
  requireGold,
  requireDiamond
};
