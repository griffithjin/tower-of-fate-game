/**
 * 支付路由 - Payment Routes
 * 集成支付宝和微信支付SDK
 */

const express = require('express');
const router = express.Router();
const paymentService = require('../services/paymentService');
const alipayService = require('../services/alipayService');
const wechatService = require('../services/wechatService');
const { authenticate } = require('../middleware/auth');
const { validateCreateOrder } = require('../middleware/validator');
const Order = require('../models/Order');
const User = require('../models/User');
const ShopItem = require('../models/ShopItem');

// ==================== 支付创建 ====================

// @route   POST /api/payment/create
// @desc    创建支付订单
// @access  Private
router.post('/create', authenticate, validateCreateOrder, async (req, res) => {
  try {
    const { 
      itemId, 
      paymentMethod, 
      quantity = 1, 
      platform = 'app',
      openId = null 
    } = req.body;

    const result = await paymentService.createPayment({
      userId: req.userId,
      itemId,
      paymentMethod,
      quantity,
      platform,
      openId,
      clientIp: req.ip
    });

    res.json({
      success: true,
      message: '订单创建成功',
      data: result
    });
  } catch (error) {
    console.error('创建支付订单错误:', error);
    res.status(400).json({
      success: false,
      message: error.message || '创建订单失败'
    });
  }
});

// @route   POST /api/payment/create-alipay
// @desc    创建支付宝订单（快捷接口）
// @access  Private
router.post('/create-alipay', authenticate, async (req, res) => {
  try {
    const { itemId, quantity = 1, platform = 'app' } = req.body;

    const result = await paymentService.createPayment({
      userId: req.userId,
      itemId,
      paymentMethod: 'alipay',
      quantity,
      platform
    });

    res.json({
      success: true,
      message: '支付宝订单创建成功',
      data: result
    });
  } catch (error) {
    console.error('创建支付宝订单错误:', error);
    res.status(400).json({
      success: false,
      message: error.message || '创建订单失败'
    });
  }
});

// @route   POST /api/payment/create-wechat
// @desc    创建微信支付订单（快捷接口）
// @access  Private
router.post('/create-wechat', authenticate, async (req, res) => {
  try {
    const { itemId, quantity = 1, platform = 'app', openId } = req.body;

    const result = await paymentService.createPayment({
      userId: req.userId,
      itemId,
      paymentMethod: 'wechat',
      quantity,
      platform,
      openId
    });

    res.json({
      success: true,
      message: '微信支付订单创建成功',
      data: result
    });
  } catch (error) {
    console.error('创建微信支付订单错误:', error);
    res.status(400).json({
      success: false,
      message: error.message || '创建订单失败'
    });
  }
});

// ==================== 支付回调 ====================

// @route   POST /api/payment/alipay-callback
// @desc    支付宝支付回调
// @access  Public
router.post('/alipay-callback', async (req, res) => {
  try {
    console.log('📨 收到支付宝回调:', req.body);
    
    await paymentService.handleNotify('alipay', req.body);
    
    // 支付宝要求返回 success
    res.send('success');
  } catch (error) {
    console.error('支付宝回调处理错误:', error);
    // 处理失败时返回 fail，支付宝会重试
    res.send('fail');
  }
});

// @route   POST /api/payment/wechat-callback
// @desc    微信支付回调
// @access  Public
router.post('/wechat-callback', express.raw({ type: 'application/xml' }), async (req, res) => {
  try {
    const xmlData = req.body.toString();
    console.log('📨 收到微信支付回调:', xmlData);
    
    await paymentService.handleNotify('wechat', xmlData);
    
    // 返回微信要求的XML格式
    res.set('Content-Type', 'application/xml');
    res.send(wechatService.getSuccessResponse());
  } catch (error) {
    console.error('微信支付回调处理错误:', error);
    res.set('Content-Type', 'application/xml');
    res.send(wechatService.getFailResponse(error.message));
  }
});

// ==================== 虚拟货币支付 ====================

// @route   POST /api/payment/diamond
// @desc    使用钻石支付
// @access  Private
router.post('/diamond', authenticate, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const userId = req.userId;

    const item = await ShopItem.findOne({ itemId });
    if (!item || !item.isAvailable) {
      return res.status(404).json({
        success: false,
        message: '商品不存在或已下架'
      });
    }

    const user = await User.findById(userId);
    const totalPrice = item.price.amount * quantity;

    if (user.diamond < totalPrice) {
      return res.status(403).json({
        success: false,
        message: '钻石不足',
        required: totalPrice,
        current: user.diamond
      });
    }

    // 创建订单
    const order = new Order({
      orderId: Order.generateOrderId(),
      userId,
      itemId,
      itemName: item.name,
      itemType: item.type,
      amount: totalPrice,
      currency: 'diamond',
      quantity,
      status: 'paid',
      paymentMethod: 'diamond',
      paidAt: new Date()
    });
    await order.save();

    // 扣除钻石并发放物品
    user.diamond -= totalPrice;
    await user.addItemToInventory(itemId, quantity * item.quantity);
    await user.save();
    await item.increaseSoldCount(quantity);

    res.json({
      success: true,
      message: '支付成功',
      data: {
        orderId: order.orderId,
        item: {
          name: item.name,
          quantity: quantity * item.quantity
        },
        cost: {
          currency: 'diamond',
          amount: totalPrice
        },
        remainingBalance: {
          diamond: user.diamond,
          gold: user.gold
        }
      }
    });
  } catch (error) {
    console.error('钻石支付错误:', error);
    res.status(500).json({
      success: false,
      message: '支付失败'
    });
  }
});

// @route   POST /api/payment/gold
// @desc    使用金币支付
// @access  Private
router.post('/gold', authenticate, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const userId = req.userId;

    const item = await ShopItem.findOne({ itemId });
    if (!item || !item.isAvailable) {
      return res.status(404).json({
        success: false,
        message: '商品不存在或已下架'
      });
    }

    // 检查是否支持金币支付
    if (item.price.currency !== 'gold') {
      return res.status(400).json({
        success: false,
        message: '该商品不支持金币支付'
      });
    }

    const user = await User.findById(userId);
    const totalPrice = item.price.amount * quantity;

    if (user.gold < totalPrice) {
      return res.status(403).json({
        success: false,
        message: '金币不足',
        required: totalPrice,
        current: user.gold
      });
    }

    // 创建订单
    const order = new Order({
      orderId: Order.generateOrderId(),
      userId,
      itemId,
      itemName: item.name,
      itemType: item.type,
      amount: totalPrice,
      currency: 'gold',
      quantity,
      status: 'paid',
      paymentMethod: 'gold',
      paidAt: new Date()
    });
    await order.save();

    // 扣除金币并发放物品
    user.gold -= totalPrice;
    await user.addItemToInventory(itemId, quantity * item.quantity);
    await user.save();
    await item.increaseSoldCount(quantity);

    res.json({
      success: true,
      message: '支付成功',
      data: {
        orderId: order.orderId,
        item: {
          name: item.name,
          quantity: quantity * item.quantity
        },
        cost: {
          currency: 'gold',
          amount: totalPrice
        },
        remainingBalance: {
          gold: user.gold,
          diamond: user.diamond
        }
      }
    });
  } catch (error) {
    console.error('金币支付错误:', error);
    res.status(500).json({
      success: false,
      message: '支付失败'
    });
  }
});

// ==================== 订单管理 ====================

// @route   GET /api/payment/orders
// @desc    获取订单列表
// @access  Private
router.get('/orders', authenticate, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userId = req.userId;

    const result = await Order.getUserOrders(userId, {
      status,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        orders: result.orders.map(o => ({
          orderId: o.orderId,
          itemId: o.itemId,
          itemName: o.itemName,
          itemType: o.itemType,
          amount: o.amount,
          currency: o.currency,
          quantity: o.quantity,
          status: o.status,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt,
          paidAt: o.paidAt
        })),
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取订单列表失败'
    });
  }
});

// @route   GET /api/payment/orders/:orderId
// @desc    获取订单详情
// @access  Private
router.get('/orders/:orderId', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.userId;

    const order = await Order.findOne({ orderId, userId });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: '订单不存在'
      });
    }

    res.json({
      success: true,
      data: {
        order: {
          orderId: order.orderId,
          itemId: order.itemId,
          itemName: order.itemName,
          itemType: order.itemType,
          amount: order.amount,
          currency: order.currency,
          quantity: order.quantity,
          status: order.status,
          paymentMethod: order.paymentMethod,
          paymentInfo: order.paymentInfo,
          createdAt: order.createdAt,
          paidAt: order.paidAt,
          refundInfo: order.refundInfo
        }
      }
    });
  } catch (error) {
    console.error('获取订单详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取订单详情失败'
    });
  }
});

// @route   GET /api/payment/orders/:orderId/status
// @desc    查询订单支付状态
// @access  Private
router.get('/orders/:orderId/status', authenticate, async (req, res) => {
  try {
    const { orderId } = req.params;

    const status = await paymentService.queryOrderStatus(orderId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('查询订单状态错误:', error);
    res.status(400).json({
      success: false,
      message: error.message || '查询订单状态失败'
    });
  }
});

// ==================== 退款管理 ====================

// @route   POST /api/payment/refund
// @desc    申请退款
// @access  Private
router.post('/refund', authenticate, async (req, res) => {
  try {
    const { orderId, refundAmount, reason = '用户申请退款' } = req.body;

    const result = await paymentService.createRefund(orderId, refundAmount, reason);

    res.json({
      success: true,
      message: '退款申请已提交',
      data: result
    });
  } catch (error) {
    console.error('退款错误:', error);
    res.status(400).json({
      success: false,
      message: error.message || '退款失败'
    });
  }
});

// @route   POST /api/payment/close
// @desc    关闭未支付订单
// @access  Private
router.post('/close', authenticate, async (req, res) => {
  try {
    const { orderId } = req.body;

    await paymentService.closePayment(orderId);

    res.json({
      success: true,
      message: '订单已关闭'
    });
  } catch (error) {
    console.error('关闭订单错误:', error);
    res.status(400).json({
      success: false,
      message: error.message || '关闭订单失败'
    });
  }
});

// ==================== 统计 ====================

// @route   GET /api/payment/stats
// @desc    获取支付统计
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.userId;

    const stats = await Order.getOrderStats(userId);

    res.json({
      success: true,
      data: {
        stats: stats[0] || {
          totalOrders: 0,
          totalSpent: 0,
          paidOrders: 0
        }
      }
    });
  } catch (error) {
    console.error('获取支付统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取支付统计失败'
    });
  }
});

// ==================== 测试接口（仅开发环境） ====================

// @route   POST /api/payment/mock/alipay
// @desc    模拟支付宝支付完成（测试用）
// @access  Private
router.post('/mock/alipay', authenticate, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: '生产环境不可用'
    });
  }

  try {
    const { orderId } = req.body;

    const mockData = alipayService.mockPaymentComplete(orderId);
    await paymentService.handleNotify('alipay', mockData);

    res.json({
      success: true,
      message: '模拟支付完成',
      data: mockData
    });
  } catch (error) {
    console.error('模拟支付错误:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/payment/mock/wechat
// @desc    模拟微信支付完成（测试用）
// @access  Private
router.post('/mock/wechat', authenticate, async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      success: false,
      message: '生产环境不可用'
    });
  }

  try {
    const { orderId } = req.body;

    const mockXml = wechatService.mockPaymentComplete(orderId);
    await paymentService.handleNotify('wechat', mockXml);

    res.json({
      success: true,
      message: '模拟支付完成',
      data: { orderId }
    });
  } catch (error) {
    console.error('模拟支付错误:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
