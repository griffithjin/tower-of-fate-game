const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { authenticate } = require('../middleware/auth');
const { validateCreateOrder } = require('../middleware/validator');
const Order = require('../models/Order');
const User = require('../models/User');
const ShopItem = require('../models/ShopItem');

// 模拟支付宝/微信支付配置
// 生产环境应从环境变量读取
const PAYMENT_CONFIG = {
  alipay: {
    appId: process.env.ALIPAY_APP_ID,
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
    notifyUrl: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/payment/alipay-callback`,
    returnUrl: `${process.env.CLIENT_URL || 'http://localhost:8080'}/payment/success`
  },
  wechat: {
    appId: process.env.WECHAT_APP_ID,
    mchId: process.env.WECHAT_MCH_ID,
    notifyUrl: `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/payment/wechat-callback`
  }
};

// @route   POST /api/payment/create
// @desc    创建支付订单
// @access  Private
router.post('/create', authenticate, validateCreateOrder, async (req, res) => {
  try {
    const { itemId, paymentMethod, quantity = 1 } = req.body;
    const userId = req.userId;

    // 查找商品
    const item = await ShopItem.findOne({ itemId });
    
    if (!item || !item.isAvailable) {
      return res.status(404).json({
        success: false,
        message: '商品不存在或已下架'
      });
    }

    // 检查是否可购买
    const user = await User.findById(userId);
    const canPurchase = item.canPurchase(user);
    
    if (!canPurchase.canBuy) {
      return res.status(403).json({
        success: false,
        message: canPurchase.reason
      });
    }

    // 计算总价
    const totalAmount = item.price.amount * quantity;

    // 检查支付方式
    if (!['alipay', 'wechat', 'diamond', 'gold'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: '无效的支付方式'
      });
    }

    // 虚拟货币支付直接处理
    if (paymentMethod === 'diamond' || paymentMethod === 'gold') {
      if (paymentMethod === 'diamond' && user.diamond < totalAmount) {
        return res.status(403).json({
          success: false,
          message: '钻石不足'
        });
      }
      if (paymentMethod === 'gold' && user.gold < totalAmount) {
        return res.status(403).json({
          success: false,
          message: '金币不足'
        });
      }

      // 扣除货币
      if (paymentMethod === 'diamond') {
        user.diamond -= totalAmount;
      } else {
        user.gold -= totalAmount;
      }

      // 添加物品
      await user.addItemToInventory(itemId, quantity * item.quantity);
      await user.save();

      // 创建已支付订单
      const order = new Order({
        orderId: Order.generateOrderId(),
        userId,
        itemId,
        itemName: item.name,
        itemType: item.type,
        amount: totalAmount,
        currency: paymentMethod,
        quantity,
        status: 'paid',
        paymentMethod,
        paidAt: new Date()
      });
      await order.save();

      return res.json({
        success: true,
        message: '购买成功',
        data: {
          orderId: order.orderId,
          status: 'paid',
          item: {
            name: item.name,
            quantity: quantity * item.quantity
          },
          paymentInfo: {
            method: paymentMethod,
            amount: totalAmount
          }
        }
      });
    }

    // 第三方支付创建订单
    const orderId = Order.generateOrderId();
    const order = new Order({
      orderId,
      userId,
      itemId,
      itemName: item.name,
      itemType: item.type,
      amount: totalAmount,
      currency: 'CNY',
      quantity,
      status: 'pending',
      paymentMethod
    });
    await order.save();

    // 生成支付参数
    let paymentData;
    
    if (paymentMethod === 'alipay') {
      paymentData = generateAlipayParams(order, item);
    } else if (paymentMethod === 'wechat') {
      paymentData = generateWechatParams(order, item);
    }

    res.json({
      success: true,
      message: '订单创建成功',
      data: {
        orderId,
        status: 'pending',
        amount: totalAmount,
        currency: 'CNY',
        item: {
          name: item.name,
          quantity: quantity * item.quantity
        },
        paymentData
      }
    });
  } catch (error) {
    console.error('创建订单错误:', error);
    res.status(500).json({
      success: false,
      message: '创建订单失败'
    });
  }
});

// @route   POST /api/payment/alipay-callback
// @desc    支付宝支付回调
// @access  Public
router.post('/alipay-callback', async (req, res) => {
  try {
    const notifyData = req.body;
    
    // 验证签名（生产环境需要实现）
    // const isValid = verifyAlipaySignature(notifyData);
    
    // 查找订单
    const order = await Order.findOne({ orderId: notifyData.out_trade_no });
    
    if (!order) {
      return res.status(404).send('fail');
    }

    if (notifyData.trade_status === 'TRADE_SUCCESS' || 
        notifyData.trade_status === 'TRADE_FINISHED') {
      
      // 更新订单状态
      order.status = 'paid';
      order.paidAt = new Date();
      order.paymentInfo = {
        tradeNo: notifyData.trade_no,
        buyerId: notifyData.buyer_id,
        payTime: new Date(notifyData.gmt_payment)
      };
      await order.save();

      // 发放物品
      const user = await User.findById(order.userId);
      await user.addItemToInventory(order.itemId, order.quantity);
      await user.save();

      // 增加销量
      const item = await ShopItem.findOne({ itemId: order.itemId });
      if (item) {
        await item.increaseSoldCount(order.quantity);
      }
    }

    res.send('success');
  } catch (error) {
    console.error('支付宝回调错误:', error);
    res.status(500).send('fail');
  }
});

// @route   POST /api/payment/wechat-callback
// @desc    微信支付回调
// @access  Public
router.post('/wechat-callback', async (req, res) => {
  try {
    const xmlData = req.body;
    
    // 解析XML（生产环境需要实现）
    // const notifyData = parseXML(xmlData);
    
    // 验证签名（生产环境需要实现）
    // const isValid = verifyWechatSignature(notifyData);

    // 返回成功响应给微信
    res.set('Content-Type', 'application/xml');
    res.send(`
      <xml>
        <return_code><![CDATA[SUCCESS]]></return_code>
        <return_msg><![CDATA[OK]]></return_msg>
      </xml>
    `);
  } catch (error) {
    console.error('微信回调错误:', error);
    res.set('Content-Type', 'application/xml');
    res.send(`
      <xml>
        <return_code><![CDATA[FAIL]]></return_code>
        <return_msg><![CDATA[处理失败]]></return_msg>
      </xml>
    `);
  }
});

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

// ==================== 辅助函数 ====================

// 生成支付宝支付参数
function generateAlipayParams(order, item) {
  // 这里应该调用支付宝 SDK 生成真实的支付参数
  // 以下为模拟数据
  const bizContent = {
    out_trade_no: order.orderId,
    total_amount: order.amount.toFixed(2),
    subject: item.name,
    product_code: 'QUICK_WAP_WAY'
  };

  return {
    method: 'alipay.trade.app.pay',
    app_id: PAYMENT_CONFIG.alipay.appId,
    charset: 'utf-8',
    sign_type: 'RSA2',
    timestamp: new Date().toISOString(),
    version: '1.0',
    notify_url: PAYMENT_CONFIG.alipay.notifyUrl,
    biz_content: JSON.stringify(bizContent)
  };
}

// 生成微信支付参数
function generateWechatParams(order, item) {
  // 这里应该调用微信支付 SDK 生成真实的支付参数
  // 以下为模拟数据
  const nonceStr = crypto.randomBytes(16).toString('hex');
  
  return {
    appid: PAYMENT_CONFIG.wechat.appId,
    mch_id: PAYMENT_CONFIG.wechat.mchId,
    nonce_str: nonceStr,
    body: item.name,
    out_trade_no: order.orderId,
    total_fee: Math.floor(order.amount * 100), // 转换为分
    spbill_create_ip: '127.0.0.1',
    notify_url: PAYMENT_CONFIG.wechat.notifyUrl,
    trade_type: 'APP'
  };
}

module.exports = router;
