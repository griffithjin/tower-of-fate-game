/**
 * 支付宝支付服务
 * Alipay Payment Service
 */

const AlipaySdk = require('alipay-sdk').default;
const fs = require('fs');
const path = require('path');

// 初始化支付宝 SDK
let alipaySdk = null;

function initAlipaySdk() {
  if (alipaySdk) return alipaySdk;

  const appId = process.env.ALIPAY_APP_ID;
  const privateKey = process.env.ALIPAY_PRIVATE_KEY || 
    (process.env.ALIPAY_PRIVATE_KEY_PATH ? 
      fs.readFileSync(process.env.ALIPAY_PRIVATE_KEY_PATH, 'ascii') : null);
  const alipayPublicKey = process.env.ALIPAY_PUBLIC_KEY ||
    (process.env.ALIPAY_PUBLIC_KEY_PATH ?
      fs.readFileSync(process.env.ALIPAY_PUBLIC_KEY_PATH, 'ascii') : null);

  if (!appId || !privateKey) {
    console.warn('⚠️ 支付宝配置不完整，支付功能将使用模拟模式');
    return null;
  }

  alipaySdk = new AlipaySdk({
    appId,
    privateKey,
    alipayPublicKey,
    gateway: process.env.ALIPAY_GATEWAY || 'https://openapi.alipay.com/gateway.do',
    signType: 'RSA2',
    charset: 'utf-8',
    timeout: 10000
  });

  return alipaySdk;
}

/**
 * 创建支付宝订单
 * @param {Object} orderData - 订单数据
 * @returns {Promise<Object>} - 支付参数
 */
async function createOrder(orderData) {
  const sdk = initAlipaySdk();
  
  // 如果 SDK 未初始化，返回模拟数据
  if (!sdk) {
    return createMockOrder(orderData);
  }

  const {
    orderId,
    amount,
    subject,
    body = '',
    timeout = '30m',
    returnUrl,
    notifyUrl
  } = orderData;

  try {
    // 手机网站支付
    const result = await sdk.exec('alipay.trade.wap.pay', {
      notify_url: notifyUrl,
      return_url: returnUrl,
      bizContent: {
        out_trade_no: orderId,
        total_amount: amount.toFixed(2),
        subject: subject,
        body: body,
        product_code: 'QUICK_WAP_WAY',
        timeout_express: timeout
      }
    }, { validateSign: true });

    return {
      success: true,
      orderId,
      paymentUrl: result,
      payMethod: 'alipay'
    };
  } catch (error) {
    console.error('支付宝创建订单失败:', error);
    throw new Error('创建支付宝订单失败: ' + error.message);
  }
}

/**
 * 创建APP支付订单
 * @param {Object} orderData - 订单数据
 * @returns {Promise<Object>} - 支付参数
 */
async function createAppOrder(orderData) {
  const sdk = initAlipaySdk();
  
  if (!sdk) {
    return createMockOrder(orderData);
  }

  const {
    orderId,
    amount,
    subject,
    body = '',
    timeout = '30m',
    notifyUrl
  } = orderData;

  try {
    const result = await sdk.exec('alipay.trade.app.pay', {
      notify_url: notifyUrl,
      bizContent: {
        out_trade_no: orderId,
        total_amount: amount.toFixed(2),
        subject: subject,
        body: body,
        product_code: 'QUICK_MSECURITY_PAY',
        timeout_express: timeout
      }
    });

    return {
      success: true,
      orderId,
      orderString: result,
      payMethod: 'alipay'
    };
  } catch (error) {
    console.error('支付宝APP支付创建订单失败:', error);
    throw new Error('创建支付宝订单失败: ' + error.message);
  }
}

/**
 * 查询订单状态
 * @param {string} orderId - 商户订单号
 * @returns {Promise<Object>} - 订单状态
 */
async function queryOrder(orderId) {
  const sdk = initAlipaySdk();
  
  if (!sdk) {
    return { success: false, message: '模拟模式不支持查询' };
  }

  try {
    const result = await sdk.exec('alipay.trade.query', {
      bizContent: {
        out_trade_no: orderId
      }
    });

    return {
      success: true,
      orderId,
      tradeStatus: result.trade_status,
      tradeNo: result.trade_no,
      buyerId: result.buyer_user_id,
      totalAmount: result.total_amount,
      payTime: result.send_pay_date
    };
  } catch (error) {
    console.error('支付宝查询订单失败:', error);
    throw new Error('查询订单失败: ' + error.message);
  }
}

/**
 * 验证回调签名
 * @param {Object} notifyData - 回调数据
 * @returns {boolean} - 签名是否有效
 */
function verifyNotify(notifyData) {
  const sdk = initAlipaySdk();
  
  if (!sdk) {
    console.log('模拟模式: 跳过签名验证');
    return true;
  }

  return sdk.checkNotifySign(notifyData);
}

/**
 * 关闭订单
 * @param {string} orderId - 商户订单号
 * @returns {Promise<Object>}
 */
async function closeOrder(orderId) {
  const sdk = initAlipaySdk();
  
  if (!sdk) {
    return { success: true, message: '模拟模式: 订单已关闭' };
  }

  try {
    const result = await sdk.exec('alipay.trade.close', {
      bizContent: {
        out_trade_no: orderId
      }
    });

    return {
      success: true,
      orderId,
      message: '订单已关闭'
    };
  } catch (error) {
    console.error('支付宝关闭订单失败:', error);
    throw new Error('关闭订单失败: ' + error.message);
  }
}

/**
 * 申请退款
 * @param {Object} refundData - 退款数据
 * @returns {Promise<Object>}
 */
async function refund(refundData) {
  const sdk = initAlipaySdk();
  
  if (!sdk) {
    return { success: true, message: '模拟模式: 退款已处理' };
  }

  const { orderId, refundAmount, refundReason = '用户申请退款', refundId } = refundData;

  try {
    const result = await sdk.exec('alipay.trade.refund', {
      bizContent: {
        out_trade_no: orderId,
        refund_amount: refundAmount.toFixed(2),
        refund_reason: refundReason,
        out_request_no: refundId || `REF${Date.now()}`
      }
    });

    return {
      success: true,
      orderId,
      refundId: result.out_request_no,
      refundAmount: result.refund_fee,
      tradeNo: result.trade_no
    };
  } catch (error) {
    console.error('支付宝退款失败:', error);
    throw new Error('退款失败: ' + error.message);
  }
}

/**
 * 创建模拟订单（用于测试）
 * @param {Object} orderData - 订单数据
 * @returns {Object} - 模拟支付参数
 */
function createMockOrder(orderData) {
  const { orderId, amount, subject } = orderData;
  
  console.log('🧪 使用模拟支付宝订单:', orderId);
  
  return {
    success: true,
    orderId,
    mockMode: true,
    paymentUrl: `https://mapi.alipay.com/gateway.do?_input_charset=utf-8&out_trade_no=${orderId}`,
    payMethod: 'alipay_mock',
    message: '模拟支付模式 - 请在30秒内调用模拟支付完成接口'
  };
}

/**
 * 模拟支付完成（仅用于测试）
 * @param {string} orderId - 订单号
 * @returns {Object} - 模拟回调数据
 */
function mockPaymentComplete(orderId) {
  return {
    out_trade_no: orderId,
    trade_no: `MOCK${Date.now()}`,
    trade_status: 'TRADE_SUCCESS',
    total_amount: '0.01',
    buyer_id: 'MOCK_BUYER_001',
    gmt_payment: new Date().toISOString(),
    notify_id: `MOCK_${Date.now()}`,
    notify_time: new Date().toISOString(),
    notify_type: 'trade_status_sync',
    sign: 'MOCK_SIGN',
    sign_type: 'RSA2'
  };
}

module.exports = {
  initAlipaySdk,
  createOrder,
  createAppOrder,
  queryOrder,
  verifyNotify,
  closeOrder,
  refund,
  mockPaymentComplete
};
