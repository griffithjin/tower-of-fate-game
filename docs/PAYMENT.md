# 支付系统配置指南

## 概述

命运塔游戏后端支持以下支付方式：

1. **支付宝** - 官方SDK集成
2. **微信支付** - 官方SDK集成
3. **虚拟货币** - 金币/钻石支付

## 快速配置

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置以下参数：

## 支付宝配置

### 沙箱环境（开发测试）

1. 访问 [支付宝开放平台](https://open.alipay.com/)
2. 创建应用，获取 **APP_ID**
3. 生成应用公钥/私钥（RSA2）
4. 配置沙箱环境

```bash
# 沙箱配置
ALIPAY_APP_ID=2024XXXXXX
ALIPAY_PRIVATE_KEY_PATH=./certs/alipay-sandbox-private.pem
ALIPAY_PUBLIC_KEY_PATH=./certs/alipay-sandbox-public.pem
ALIPAY_GATEWAY=https://openapi.alipaydev.com/gateway.do
```

### 生产环境

```bash
ALIPAY_APP_ID=your-production-app-id
ALIPAY_PRIVATE_KEY_PATH=./certs/alipay-private.pem
ALIPAY_PUBLIC_KEY_PATH=./certs/alipay-public.pem
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
```

### 密钥生成

```bash
# 生成私钥
openssl genrsa -out alipay-private.pem 2048

# 生成公钥
openssl rsa -in alipay-private.pem -pubout -out alipay-public.pem
```

## 微信支付配置

### 1. 申请商户号

- 访问 [微信支付商户平台](https://pay.weixin.qq.com/)
- 申请成为商户，获取 **MCH_ID**

### 2. 配置API密钥

```bash
WECHAT_APP_ID=wxXXXXXXXXXXXXXXXX
WECHAT_MCH_ID=1234567890
WECHAT_API_KEY=Your32CharacterAPIKeyHere
```

### 3. 配置API证书

下载证书文件并配置路径：

```bash
WECHAT_PFX_PATH=./certs/apiclient_cert.p12
```

证书文件包括：
- `apiclient_cert.p12` - API证书
- `apiclient_cert.pem` - 证书文件
- `apiclient_key.pem` - 证书密钥

## 支付流程

### 1. 创建订单

```javascript
// 支付宝APP支付
POST /api/payment/create-alipay
{
  "itemId": "diamond_pack_1",
  "quantity": 1,
  "platform": "app"
}

// 微信支付APP支付
POST /api/payment/create-wechat
{
  "itemId": "diamond_pack_1",
  "quantity": 1,
  "platform": "app"
}

// 微信小程序支付
POST /api/payment/create-wechat
{
  "itemId": "diamond_pack_1",
  "quantity": 1,
  "platform": "mini",
  "openId": "用户的openid"
}

// H5支付
POST /api/payment/create-wechat
{
  "itemId": "diamond_pack_1",
  "quantity": 1,
  "platform": "h5"
}
```

### 2. 调用SDK支付

#### 支付宝APP支付

```javascript
// 返回参数
{
  "success": true,
  "data": {
    "orderId": "FT123456789",
    "paymentData": {
      "orderString": "alipay_sdk_string_here",
      "payMethod": "alipay"
    }
  }
}

// APP端调用
AlipaySDK.pay(paymentData.orderString);
```

#### 微信支付APP支付

```javascript
// 返回参数
{
  "success": true,
  "data": {
    "orderId": "FT123456789",
    "paymentData": {
      "appId": "wxXXXXXXXX",
      "partnerId": "1234567890",
      "prepayId": "wx201410272009395522657a690399285100",
      "nonceStr": "5K8264ILTKCH16CQ2502SI8ZNMTM67VS",
      "timeStamp": "1414411784",
      "package": "Sign=WXPay",
      "sign": "C380BEC2BFD727A4B6845133519F3AD6"
    }
  }
}

// APP端调用
WeChatPay.pay({
  appId: paymentData.appId,
  partnerId: paymentData.partnerId,
  prepayId: paymentData.prepayId,
  nonceStr: paymentData.nonceStr,
  timeStamp: paymentData.timeStamp,
  package: paymentData.package,
  sign: paymentData.sign
});
```

### 3. 查询支付结果

```javascript
GET /api/payment/orders/FT123456789/status

// 返回
{
  "success": true,
  "data": {
    "orderId": "FT123456789",
    "status": "paid",
    "amount": 6.00,
    "currency": "CNY",
    "paidAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. 接收支付回调

服务器会自动处理支付宝/微信的支付回调，无需客户端处理。

回调地址：
- 支付宝: `https://your-domain.com/api/payment/alipay-callback`
- 微信: `https://your-domain.com/api/payment/wechat-callback`

## 退款流程

```javascript
POST /api/payment/refund
{
  "orderId": "FT123456789",
  "refundAmount": 6.00,
  "reason": "用户申请退款"
}
```

## 测试支付

### 模拟支付（开发环境）

```bash
# 模拟支付宝支付完成
POST /api/payment/mock/alipay
{
  "orderId": "FT123456789"
}

# 模拟微信支付完成
POST /api/payment/mock/wechat
{
  "orderId": "FT123456789"
}
```

> ⚠️ 模拟接口仅用于开发测试，生产环境不可用！

## 虚拟货币支付

### 钻石支付

```javascript
POST /api/payment/diamond
{
  "itemId": "gold_pack_1",
  "quantity": 1
}
```

### 金币支付

```javascript
POST /api/payment/gold
{
  "itemId": "exp_boost_1d",
  "quantity": 1
}
```

## 常见问题

### 1. 签名验证失败

- 检查密钥是否正确
- 确保密钥文件格式正确（PEM格式）
- 支付宝公钥是支付宝提供的，不是应用公钥

### 2. 回调不生效

- 确保服务器公网可访问
- 检查防火墙设置
- 使用HTTPS协议

### 3. 微信支付证书错误

- 确保证书文件正确下载
- 检查证书密码（默认为商户号）
- 证书需要定期更新

### 4. 沙箱测试

支付宝沙箱环境：
- 沙箱账号：在开放平台查看
- 支付密码：111111
- 支付金额：0.01元

## 安全建议

1. **密钥管理**
   - 私钥文件不要提交到Git
   - 生产环境使用环境变量或密钥管理服务
   - 定期更换密钥

2. **回调验证**
   - 务必验证回调签名
   - 处理幂等性，防止重复处理
   - 记录回调日志

3. **HTTPS**
   - 生产环境必须使用HTTPS
   - 配置正确的SSL证书

4. **IP白名单**
   - 配置支付平台的IP白名单
   - 防火墙限制访问

## API文档

### 支付相关接口

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/payment/create | 通用创建订单 |
| POST | /api/payment/create-alipay | 支付宝订单 |
| POST | /api/payment/create-wechat | 微信订单 |
| POST | /api/payment/diamond | 钻石支付 |
| POST | /api/payment/gold | 金币支付 |
| POST | /api/payment/alipay-callback | 支付宝回调 |
| POST | /api/payment/wechat-callback | 微信回调 |
| POST | /api/payment/refund | 申请退款 |
| POST | /api/payment/close | 关闭订单 |
| GET | /api/payment/orders | 订单列表 |
| GET | /api/payment/orders/:id | 订单详情 |
| GET | /api/payment/orders/:id/status | 订单状态 |
| GET | /api/payment/stats | 支付统计 |

## 技术支持

- 支付宝文档: https://opendocs.alipay.com/
- 微信支付文档: https://pay.weixin.qq.com/wiki/
