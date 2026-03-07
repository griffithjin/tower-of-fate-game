const { body, validationResult } = require('express-validator');

// 处理验证错误
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: '输入验证失败',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

// 用户注册验证
const validateRegister = [
  body('username')
    .trim()
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/).withMessage('用户名只能包含字母、数字、下划线和中文'),
  body('email')
    .trim()
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码长度至少6个字符')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/).withMessage('密码必须包含字母和数字'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('两次输入的密码不一致');
      }
      return true;
    }),
  handleValidationErrors
];

// 用户登录验证
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('请输入有效的邮箱地址'),
  body('password')
    .notEmpty().withMessage('密码不能为空'),
  handleValidationErrors
];

// 更新用户资料验证
const validateUpdateProfile = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 }).withMessage('用户名长度必须在3-20个字符之间'),
  body('avatar')
    .optional()
    .isURL().withMessage('头像必须是有效的URL'),
  handleValidationErrors
];

// 游戏出牌验证
const validatePlayCard = [
  body('matchId')
    .notEmpty().withMessage('对局ID不能为空'),
  body('cardId')
    .notEmpty().withMessage('卡牌ID不能为空'),
  body('targetLayer')
    .optional()
    .isInt({ min: 1 }).withMessage('目标层数必须为正整数'),
  handleValidationErrors
];

// 购买商品验证
const validateBuyItem = [
  body('itemId')
    .notEmpty().withMessage('商品ID不能为空'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 99 }).withMessage('购买数量必须在1-99之间'),
  handleValidationErrors
];

// 创建订单验证
const validateCreateOrder = [
  body('itemId')
    .notEmpty().withMessage('商品ID不能为空'),
  body('paymentMethod')
    .notEmpty().withMessage('支付方式不能为空')
    .isIn(['alipay', 'wechat', 'diamond', 'gold']).withMessage('无效的支付方式'),
  handleValidationErrors
];

// 锦标赛报名验证
const validateTournamentJoin = [
  body('tournamentId')
    .notEmpty().withMessage('锦标赛ID不能为空')
    .isMongoId().withMessage('无效的锦标赛ID'),
  handleValidationErrors
];

// 积分兑换验证
const validatePointsExchange = [
  body('itemId')
    .notEmpty().withMessage('兑换项目ID不能为空'),
  body('quantity')
    .optional()
    .isInt({ min: 1 }).withMessage('兑换数量必须为正整数'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validatePlayCard,
  validateBuyItem,
  validateCreateOrder,
  validateTournamentJoin,
  validatePointsExchange
};
