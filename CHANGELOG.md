# 更新日志

## [1.2.0] - 2024-01-20

### 🔧 管理后台系统
- ✅ 支付配置可视化面板
- ✅ 支付宝配置管理 (APP_ID/密钥/网关/回调)
- ✅ 微信支付配置管理 (MCH_ID/API_KEY/证书)
- ✅ 沙箱/生产环境切换
- ✅ 支付开关控制
- ✅ 连接测试功能
- ✅ 测试订单管理
- ✅ 支付统计面板
- ✅ 模拟回调功能

### 管理后台API
- `GET /api/admin/payment/config` - 获取支付配置
- `POST /api/admin/payment/config` - 保存支付配置
- `POST /api/admin/payment/config/alipay/test` - 测试支付宝
- `POST /api/admin/payment/config/wechat/test` - 测试微信
- `POST /api/admin/payment/test-order` - 创建测试订单
- `POST /api/admin/payment/simulate-callback` - 模拟回调

## [1.1.0] - 2024-01-15

### 💳 支付系统升级
- ✅ 支付宝官方SDK集成 (alipay-sdk)
- ✅ 微信支付官方SDK集成 (tenpay)
- ✅ 统一支付服务层设计
- ✅ 支持APP/H5/JSAPI多平台支付
- ✅ 完整回调签名验证
- ✅ 订单查询/退款/关闭功能
- ✅ 模拟支付接口(测试环境)
- ✅ 虚拟货币支付(金币/钻石)

### API新增
- `POST /api/payment/create-alipay` - 支付宝快捷支付
- `POST /api/payment/create-wechat` - 微信快捷支付
- `POST /api/payment/diamond` - 钻石支付
- `POST /api/payment/gold` - 金币支付
- `GET /api/payment/orders/:id/status` - 查询支付状态
- `POST /api/payment/mock/alipay` - 模拟支付宝(测试)
- `POST /api/payment/mock/wechat` - 模拟微信(测试)

## [1.0.0] - 2024-01-08

### 🎮 初始版本发布
- ✅ 用户系统 (注册/登录/JWT认证)
- ✅ 游戏系统 (开始对局/出牌/游戏状态)
- ✅ 商城系统 (商品列表/购买/背包)
- ✅ 锦标赛系统 (报名/比赛/排行榜)
- ✅ 支付系统 (基础框架)
- ✅ 积分系统 (排行榜/兑换)
- ✅ Socket.io 实时对战
- ✅ MongoDB 数据库设计
- ✅ Docker 部署配置
- ✅ 完整API文档
