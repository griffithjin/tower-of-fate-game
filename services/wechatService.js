/**
 * 微信支付服务
 * WeChat Pay Service
 */

const Tenpay = require('tenpay');
const crypto = require('crypto');

// 微信支付配置
let wechatConfig = null;
let wechatApi = null;

function initWechatPay() {
  if (wechatApi) return wechatApi;

  const appId = process.env.WECHAT_APP_ID;
  const mchId = process.env.WECHAT_MCH_ID;
  const key = process.env.WECHAT_API_KEY;
  const pfx = process.env.WECHAT_PFX_PATH ? 
    require('fs').readFileSync(process.env.WECHAT_PFX_PATH) : null;

  if (!appId || !mchId || !key) {
    console.warn('⚠️ 微信支付配置不完整，支付功能将使用模拟模式');
    return null;
  }

  wechatConfig = {
    appid: appId,
    mchid: mchId,
    partnerKey: key,
    pfx: pfx,
    notify_url: process.env.WECHAT_NOTIFY_URL || 'http://localhost:3000/api/payment/wechat-callback',
    spbill_create_ip: process.env.SERVER_IP || '127.0.0.1'
  };

  wechatApi = new Tenpay(wechatConfig);
  return wechatApi;
}

/**
 * 统一下单 - APP支付
 * @param {Object} orderData - 订单数据
 * @returns {Promise<Object>} - 支付参数
 */
async function createAppOrder(orderData) {
  const api = initWechatPay();
  
  if (!api) {
    return createMockOrder(orderData, 'app');
  }

  const {
    orderId,
    amount,
    subject,
    attach = '',
    openId = null
  } = orderData;

  try {
    const result = await api.getAppParams({
      out_trade_no: orderId,
      body: subject,
      attach: attach,
      total_fee: Math.round(amount * 100), // 转换为分
      spbill_create_ip: wechatConfig.spbill_create_ip,
      openid: openId
    });

    return {
      success: true,
      orderId,
      payMethod: 'wechat',
      appId: result.appid,
      partnerId: result.partnerid,
      prepayId: result.prepayid,
      nonceStr: result.noncestr,
      timeStamp: result.timestamp,
      package: result.package,
      sign: result.sign
    };
  } catch (error) {
    console.error('微信支付统一下单失败:', error);
    throw new Error('创建微信支付订单失败: ' + error.message);
  }
}

/**
 * 统一下单 - 小程序/JSAPI支付
 * @param {Object} orderData - 订单数据
 * @returns {Promise<Object>} - 支付参数
 */
async function createJSAPIOrder(orderData) {
  const api = initWechatPay();
  
  if (!api) {
    return createMockOrder(orderData, 'jsapi');
  }

  const {
    orderId,
    amount,
    subject,
    openId,
    attach = ''
  } = orderData;

  if (!openId) {
    throw new Error('JSAPI支付需要openid');
  }

  try {
    const result = await api.getPayParams({
      out_trade_no: orderId,
      body: subject,
      attach: attach,
      total_fee: Math.round(amount * 100),
      openid: openId
    });

    return {
      success: true,
      orderId,
      payMethod: 'wechat',
      appId: result.appId,
      timeStamp: result.timeStamp,
      nonceStr: result.nonceStr,
      package: result.package,
      signType: result.signType,
      paySign: result.paySign
    };
  } catch (error) {
    console.error('微信支付JSAPI下单失败:', error);
    throw new Error('创建微信支付订单失败: ' + error.message);
  }
}

/**
 * 统一下单 - H5支付
 * @param {Object} orderData - 订单数据
 * @returns {Promise<Object>} - 支付参数
 */
async function createH5Order(orderData) {
  const api = initWechatPay();
  
  if (!api) {
    return createMockOrder(orderData, 'h5');
  }

  const {
    orderId,
    amount,
    subject,
    attach = '',
    sceneInfo = {}
  } = orderData;

  try {
    const result = await api.unifiedOrder({
      out_trade_no: orderId,
      body: subject,
      attach: attach,
      total_fee: Math.round(amount * 100),
      trade_type: 'MWEB',
      scene_info: JSON.stringify({
        h5_info: {
          type: 'Wap',
          wap_url: sceneInfo.wapUrl || 'https://fatetower.game',
          wap_name: sceneInfo.wapName || '命运塔游戏'
        }
      })
    });

    return {
      success: true,
      orderId,
      payMethod: 'wechat',
      mwebUrl: result.mweb_url,
      prepayId: result.prepay_id
    };
  } catch (error) {
    console.error('微信支付H5下单失败:', error);
    throw new Error('创建微信支付订单失败: ' + error.message);
  }
}

/**
 * 查询订单
 * @param {string} orderId - 商户订单号
 * @returns {Promise<Object>}
 */
async function queryOrder(orderId) {
  const api = initWechatPay();
  
  if (!api) {
    return { success: false, message: '模拟模式不支持查询' };
  }

  try {
    const result = await api.orderQuery({
      out_trade_no: orderId
    });

    const statusMap = {
      SUCCESS: '支付成功',
      REFUND: '已退款',
      NOTPAY: '未支付',
      CLOSED: '已关闭',
      REVOKED: '已撤销',
      USERPAYING: '用户支付中',
      PAYERROR: '支付失败'
    };

    return {
      success: true,
      orderId,
      tradeState: result.trade_state,
      tradeStateDesc: statusMap[result.trade_state] || result.trade_state,
      transactionId: result.transaction_id,
      totalFee: result.total_fee / 100, // 转换为元
      timeEnd: result.time_end,
      openId: result.openid
    };
  } catch (error) {
    console.error('微信支付查询订单失败:', error);
    throw new Error('查询订单失败: ' + error.message);
  }
}

/**
 * 关闭订单
 * @param {string} orderId - 商户订单号
 * @returns {Promise<Object>}
 */
async function closeOrder(orderId) {
  const api = initWechatPay();
  
  if (!api) {
    return { success: true, message: '模拟模式: 订单已关闭' };
  }

  try {
    await api.closeOrder({
      out_trade_no: orderId
    });

    return {
      success: true,
      orderId,
      message: '订单已关闭'
    };
  } catch (error) {
    console.error('微信支付关闭订单失败:', error);
    throw new Error('关闭订单失败: ' + error.message);
  }
}

/**
 * 申请退款
 * @param {Object} refundData - 退款数据
 * @returns {Promise<Object>}
 */
async function refund(refundData) {
  const api = initWechatPay();
  
  if (!api) {
    return { success: true, message: '模拟模式: 退款已处理' };
  }

  const { 
    orderId, 
    refundId,
    totalFee, 
    refundFee, 
    refundDesc = '用户申请退款' 
  } = refundData;

  try {
    const result = await api.refund({
      out_trade_no: orderId,
      out_refund_no: refundId,
      total_fee: Math.round(totalFee * 100),
      refund_fee: Math.round(refundFee * 100),
      refund_desc: refundDesc
    });

    return {
      success: true,
      orderId,
      refundId: result.out_refund_no,
      refundFee: result.refund_fee / 100,
      transactionId: result.transaction_id,
      refundTime: result.refund_success_time
    };
  } catch (error) {
    console.error('微信支付退款失败:', error);
    throw new Error('退款失败: ' + error.message);
  }
}

/**
 * 查询退款
 * @param {string} refundId - 退款单号
 * @returns {Promise<Object>}
 */
async function queryRefund(refundId) {
  const api = initWechatPay();
  
  if (!api) {
    return { success: false, message: '模拟模式不支持查询' };
  }

  try {
    const result = await api.refundQuery({
      out_refund_no: refundId
    });

    return {
      success: true,
      refundId,
      refundStatus: result.refund_status_0,
      refundFee: result.refund_fee_0 / 100,
      refundRecvAccout: result.refund_recv_accout_0
    };
  } catch (error) {
    console.error('微信支付查询退款失败:', error);
    throw new Error('查询退款失败: ' + error.message);
  }
}

/**
 * 解析回调通知
 * @param {string} xmlData - XML数据
 * @returns {Promise<Object>}
 */
async function parseNotify(xmlData) {
  const api = initWechatPay();
  
  if (!api) {
    // 模拟模式解析简单XML
    return parseMockNotify(xmlData);
  }

  try {
    const result = await api.middlewareForExpress()(xmlData);
    return {
      success: true,
      orderId: result.out_trade_no,
      transactionId: result.transaction_id,
      totalFee: result.total_fee / 100,
      timeEnd: result.time_end,
      openId: result.openid,
      raw: result
    };
  } catch (error) {
    console.error('微信支付回调解析失败:', error);
    throw new Error('回调解析失败: ' + error.message);
  }
}

/**
 * 生成回调成功响应
 * @returns {string} - XML响应
 */
function getSuccessResponse() {
  return `<xml>
<return_code><![CDATA[SUCCESS]]></return_code>
<return_msg><![CDATA[OK]]></return_msg>
</xml>`;
}

/**
 * 生成回调失败响应
 * @param {string} message - 错误信息
 * @returns {string} - XML响应
 */
function getFailResponse(message = '处理失败') {
  return `<xml>
<return_code><![CDATA[FAIL]]></return_code>
<return_msg><![CDATA[${message}]]></return_msg>
</xml>`;
}

/**
 * 创建模拟订单
 */
function createMockOrder(orderData, type = 'app') {
  const { orderId, amount, subject } = orderData;
  
  console.log('🧪 使用模拟微信支付订单:', orderId, '类型:', type);
  
  const mockParams = {
    success: true,
    orderId,
    mockMode: true,
    payMethod: 'wechat_mock',
    message: '模拟支付模式 - 请在30秒内调用模拟支付完成接口'
  };

  if (type === 'app') {
    mockParams.appId = 'MOCK_APP_ID';
    mockParams.partnerId = 'MOCK_MCH_ID';
    mockParams.prepayId = `MOCK_${orderId}`;
    mockParams.nonceStr = Math.random().toString(36).substring(2, 15);
    mockParams.timeStamp = Math.floor(Date.now() / 1000).toString();
    mockParams.package = 'Sign=WXPay';
    mockParams.sign = 'MOCK_SIGN';
  } else if (type === 'jsapi') {
    mockParams.appId = 'MOCK_APP_ID';
    mockParams.timeStamp = Math.floor(Date.now() / 1000).toString();
    mockParams.nonceStr = Math.random().toString(36).substring(2, 15);
    mockParams.package = `prepay_id=MOCK_${orderId}`;
    mockParams.signType = 'RSA';
    mockParams.paySign = 'MOCK_PAY_SIGN';
  } else if (type === 'h5') {
    mockParams.mwebUrl = `https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=MOCK_${orderId}`;
  }

  return mockParams;
}

/**
 * 解析模拟回调
 */
function parseMockNotify(xmlData) {
  // 简单解析 XML
  const getValue = (key) => {
    const match = xmlData.match(new RegExp(`<${key}>.*?<!\[CDATA\[(.*?)\]\]>.*?</${key}>`, 'i')) ||
                  xmlData.match(new RegExp(`<${key}>(.*?)</${key}>`, 'i'));
    return match ? match[1] : '';
  };

  return {
    success: true,
    orderId: getValue('out_trade_no'),
    transactionId: getValue('transaction_id') || `MOCK${Date.now()}`,
    totalFee: parseInt(getValue('total_fee')) / 100 || 0.01,
    timeEnd: getValue('time_end') || new Date().toISOString(),
    openId: getValue('openid') || 'MOCK_OPENID',
    resultCode: getValue('result_code') || 'SUCCESS',
    returnCode: getValue('return_code') || 'SUCCESS'
  };
}

/**
 * 模拟支付完成
 */
function mockPaymentComplete(orderId) {
  const timeEnd = new Date();
  const timeEndStr = timeEnd.toISOString().replace(/[-:T]/g, '').substring(0, 14);

  return `<xml>
<appid><![CDATA[MOCK_APP_ID]]></appid>
<bank_type><![CDATA[CFT]]></bank_type>
<cash_fee><![CDATA[1]]></cash_fee>
<fee_type><![CDATA[CNY]]></fee_type>
<is_subscribe><![CDATA[N]]></is_subscribe>
<mch_id><![CDATA[MOCK_MCH_ID]]></mch_id>
<nonce_str><![CDATA[${Math.random().toString(36).substring(2, 15)}]]></nonce_str>
<openid><![CDATA[MOCK_OPENID]]></openid>
<out_trade_no><![CDATA[${orderId}]]></out_trade_no>
<result_code><![CDATA[SUCCESS]]></result_code>
<return_code><![CDATA[SUCCESS]]></return_code>
<sign><![CDATA[MOCK_SIGN]]></sign>
<time_end><![CDATA[${timeEndStr}]]></time_end>
<total_fee>1</total_fee>
<trade_type><![CDATA[APP]]></trade_type>
<transaction_id><![CDATA[MOCK${Date.now()}]]></transaction_id>
</xml>`;
}

module.exports = {
  initWechatPay,
  createAppOrder,
  createJSAPIOrder,
  createH5Order,
  queryOrder,
  closeOrder,
  refund,
  queryRefund,
  parseNotify,
  getSuccessResponse,
  getFailResponse,
  mockPaymentComplete
};
