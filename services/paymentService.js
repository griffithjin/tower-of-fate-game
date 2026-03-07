/**
 * 支付服务统一入口
 * Payment Service Gateway
 */

const alipayService = require('./alipayService');
const wechatService = require('./wechatService');
const Order = require('../models/Order');
const User = require('../models/User');
const ShopItem = require('../models/ShopItem');

/**
 * 创建支付订单
 * @param {Object} params - 支付参数
 * @returns {Promise<Object>}
 */
async function createPayment(params) {
  const {
    userId,
    itemId,
    paymentMethod,
    quantity = 1,
    platform = 'app', // app, h5, mini
    openId = null,    // 微信小程序需要
    clientIp = '127.0.0.1'
  } = params;

  // 获取商品信息
  const item = await ShopItem.findOne({ itemId });
  if (!item || !item.isAvailable) {
    throw new Error('商品不存在或已下架');
  }

  const user = await User.findById(userId);
  const canPurchase = item.canPurchase(user);
  if (!canPurchase.canBuy) {
    throw new Error(canPurchase.reason);
  }

  const totalAmount = item.price.amount * quantity;

  // 创建订单记录
  const order = new Order({
    orderId: Order.generateOrderId(),
    userId,
    itemId,
    itemName: item.name,
    itemType: item.type,
    amount: totalAmount,
    currency: item.price.currency === 'CNY' ? 'CNY' : item.price.currency,
    quantity,
    status: 'pending',
    paymentMethod
  });

  await order.save();

  // 调用相应支付渠道
  let paymentResult;
  const orderData = {
    orderId: order.orderId,
    amount: totalAmount,
    subject: item.name,
    body: `${item.name} x${quantity}`,
    attach: JSON.stringify({ userId: userId.toString(), itemId }),
    openId,
    sceneInfo: {
      wapUrl: process.env.CLIENT_URL || 'https://fatetower.game',
      wapName: '命运塔游戏'
    }
  };

  switch (paymentMethod) {
    case 'alipay':
      if (platform === 'app') {
        paymentResult = await alipayService.createAppOrder(orderData);
      } else {
        paymentResult = await alipayService.createOrder({
          ...orderData,
          returnUrl: `${process.env.CLIENT_URL}/payment/success`,
          notifyUrl: `${process.env.API_BASE_URL}/api/payment/alipay-callback`
        });
      }
      break;

    case 'wechat':
      if (platform === 'app') {
        paymentResult = await wechatService.createAppOrder(orderData);
      } else if (platform === 'jsapi' || platform === 'mini') {
        if (!openId) {
          throw new Error('JSAPI支付需要提供openid');
        }
        paymentResult = await wechatService.createJSAPIOrder(orderData);
      } else if (platform === 'h5') {
        paymentResult = await wechatService.createH5Order(orderData);
      }
      break;

    default:
      throw new Error('不支持的支付方式');
  }

  return {
    orderId: order.orderId,
    status: 'pending',
    amount: totalAmount,
    currency: 'CNY',
    paymentData: paymentResult,
    expireTime: Date.now() + 30 * 60 * 1000 // 30分钟过期
  };
}

/**
 * 处理支付回调
 * @param {string} paymentMethod - 支付方式
 * @param {Object} notifyData - 回调数据
 * @returns {Promise<Object>}
 */
async function handleNotify(paymentMethod, notifyData) {
  let result;

  switch (paymentMethod) {
    case 'alipay':
      result = await handleAlipayNotify(notifyData);
      break;
    case 'wechat':
      result = await handleWechatNotify(notifyData);
      break;
    default:
      throw new Error('不支持的支付方式');
  }

  return result;
}

/**
 * 处理支付宝回调
 */
async function handleAlipayNotify(notifyData) {
  // 验证签名
  const isValid = alipayService.verifyNotify(notifyData);
  if (!isValid) {
    throw new Error('签名验证失败');
  }

  const orderId = notifyData.out_trade_no;
  const tradeStatus = notifyData.trade_status;

  const order = await Order.findOne({ orderId });
  if (!order) {
    throw new Error('订单不存在');
  }

  if (order.status === 'paid') {
    return { success: true, message: '订单已处理' };
  }

  // 支付成功
  if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
    await processPaymentSuccess(order, {
      tradeNo: notifyData.trade_no,
      buyerId: notifyData.buyer_id,
      payTime: new Date(notifyData.gmt_payment)
    });
  }

  return { success: true };
}

/**
 * 处理微信回调
 */
async function handleWechatNotify(xmlData) {
  const notifyResult = await wechatService.parseNotify(xmlData);
  
  if (!notifyResult.success) {
    throw new Error('回调解析失败');
  }

  const order = await Order.findOne({ orderId: notifyResult.orderId });
  if (!order) {
    throw new Error('订单不存在');
  }

  if (order.status === 'paid') {
    return { success: true, message: '订单已处理' };
  }

  await processPaymentSuccess(order, {
    tradeNo: notifyResult.transactionId,
    buyerId: notifyResult.openId,
    payTime: new Date()
  });

  return { success: true };
}

/**
 * 处理支付成功
 */
async function processPaymentSuccess(order, paymentInfo) {
  // 更新订单状态
  order.status = 'paid';
  order.paidAt = new Date();
  order.paymentInfo = paymentInfo;
  await order.save();

  // 发放物品
  const user = await User.findById(order.userId);
  const item = await ShopItem.findOne({ itemId: order.itemId });

  if (user && item) {
    await user.addItemToInventory(order.itemId, order.quantity * item.quantity);
    
    // VIP道具特殊处理
    if (item.type === 'vip') {
      const now = new Date();
      const currentExpire = user.vip.expireAt && user.vip.expireAt > now 
        ? user.vip.expireAt 
        : now;
      user.vip.expireAt = new Date(currentExpire.getTime() + item.validDays * 24 * 60 * 60 * 1000);
    }
    
    await user.save();

    // 增加销量
    await item.increaseSoldCount(order.quantity);
  }

  return { success: true };
}

/**
 * 查询订单状态
 */
async function queryOrderStatus(orderId) {
  const order = await Order.findOne({ orderId });
  if (!order) {
    throw new Error('订单不存在');
  }

  // 如果是第三方支付，查询渠道状态
  if (order.status === 'pending' && ['alipay', 'wechat'].includes(order.paymentMethod)) {
    try {
      let channelResult;
      
      if (order.paymentMethod === 'alipay') {
        channelResult = await alipayService.queryOrder(orderId);
      } else if (order.paymentMethod === 'wechat') {
        channelResult = await wechatService.queryOrder(orderId);
      }

      // 如果渠道显示已支付但本地未更新，同步状态
      if (channelResult.success && 
          (channelResult.tradeStatus === 'TRADE_SUCCESS' || 
           channelResult.tradeState === 'SUCCESS')) {
        await processPaymentSuccess(order, {
          tradeNo: channelResult.tradeNo || channelResult.transactionId,
          buyerId: channelResult.buyerId || channelResult.openId,
          payTime: new Date()
        });
        
        order.status = 'paid';
      }
    } catch (error) {
      console.error('查询支付渠道状态失败:', error);
    }
  }

  return {
    orderId: order.orderId,
    status: order.status,
    amount: order.amount,
    currency: order.currency,
    paidAt: order.paidAt,
    itemName: order.itemName
  };
}

/**
 * 申请退款
 */
async function createRefund(orderId, refundAmount, reason = '用户申请退款') {
  const order = await Order.findOne({ orderId });
  if (!order) {
    throw new Error('订单不存在');
  }

  if (order.status !== 'paid') {
    throw new Error('订单未支付，无法退款');
  }

  const refundId = `REF${Date.now()}${Math.random().toString(36).substr(2, 4)}`;
  let refundResult;

  if (order.paymentMethod === 'alipay') {
    refundResult = await alipayService.refund({
      orderId,
      refundId,
      refundAmount,
      refundReason: reason
    });
  } else if (order.paymentMethod === 'wechat') {
    refundResult = await wechatService.refund({
      orderId,
      refundId,
      totalFee: order.amount,
      refundFee: refundAmount,
      refundDesc: reason
    });
  } else {
    throw new Error('该支付方式不支持退款');
  }

  // 更新订单退款信息
  order.refundInfo = {
    refundedAt: new Date(),
    refundAmount,
    refundReason: reason
  };
  order.status = 'refunded';
  await order.save();

  // 扣除用户物品（可选）
  // ...

  return refundResult;
}

/**
 * 关闭订单
 */
async function closePayment(orderId) {
  const order = await Order.findOne({ orderId });
  if (!order) {
    throw new Error('订单不存在');
  }

  if (order.status !== 'pending') {
    throw new Error('订单状态不允许关闭');
  }

  // 调用渠道关闭
  if (order.paymentMethod === 'alipay') {
    await alipayService.closeOrder(orderId);
  } else if (order.paymentMethod === 'wechat') {
    await wechatService.closeOrder(orderId);
  }

  order.status = 'cancelled';
  order.cancelledAt = new Date();
  await order.save();

  return { success: true };
}

module.exports = {
  createPayment,
  handleNotify,
  queryOrderStatus,
  createRefund,
  closePayment,
  processPaymentSuccess
};
