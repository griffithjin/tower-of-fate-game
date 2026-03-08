const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * 订单Schema - 游戏内购订单管理
 * 包含：订单信息、商品详情、支付信息、状态流转
 */
const orderSchema = new Schema({
    // ==================== 订单基本信息 ====================
    orderId: { 
        type: String, 
        required: true, 
        unique: true,
        index: true
    },
    userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
        index: true
    },
    
    // ==================== 商品信息 ====================
    items: [{
        itemId: { type: String, required: true },
        itemType: { 
            type: String, 
            enum: ['gems', 'coins', 'vip', 'skin', 'effect', 'item', 'bundle'],
            required: true 
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 }, // 单价(分)
        totalPrice: { type: Number, required: true, min: 0 }, // 小计(分)
        metadata: Schema.Types.Mixed, // 扩展信息，如皮肤ID等
        _id: false
    }],
    
    // ==================== 金额信息 ====================
    subtotal: { type: Number, required: true, min: 0 }, // 商品小计
    discount: { type: Number, default: 0, min: 0 }, // 折扣金额
    discountCode: String, // 优惠码
    tax: { type: Number, default: 0, min: 0 }, // 税费
    totalAmount: { type: Number, required: true, min: 0 }, // 实付金额
    currency: { type: String, default: 'CNY' },
    
    // ==================== 支付信息 ====================
    payment: {
        method: { 
            type: String, 
            enum: ['alipay', 'wechat', 'apple', 'google', 'huawei', 'card', 'paypal'],
            required: function() {
                return this.status !== 'pending';
            }
        },
        transactionId: String, // 第三方支付流水号
        prepaid: { type: Boolean, default: false }, // 是否预付费
        paidAt: Date,
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded', 'partial_refunded'],
            default: 'pending'
        },
        failureReason: String,
        refundAmount: { type: Number, default: 0, min: 0 },
        refundedAt: Date,
        refundReason: String
    },
    
    // ==================== 发票信息 ====================
    invoice: {
        required: { type: Boolean, default: false },
        type: { type: String, enum: ['personal', 'company'] },
        title: String,
        taxNumber: String,
        email: String,
        issued: { type: Boolean, default: false },
        issuedAt: Date
    },
    
    // ==================== 订单状态 ====================
    status: {
        type: String,
        enum: ['pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded', 'disputed'],
        default: 'pending',
        index: true
    },
    
    // ==================== 交付信息 ====================
    delivery: {
        status: {
            type: String,
            enum: ['pending', 'delivering', 'delivered', 'failed'],
            default: 'pending'
        },
        deliveredAt: Date,
        items: [{
            itemId: String,
            status: { type: String, enum: ['pending', 'delivered', 'failed'] },
            deliveredAt: Date,
            error: String,
            _id: false
        }]
    },
    
    // ==================== 设备/IP信息 ====================
    clientInfo: {
        ip: String,
        deviceId: String,
        userAgent: String,
        platform: String
    },
    
    // ==================== 时间戳 ====================
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { // 订单过期时间(30分钟)
        type: Date,
        default: () => new Date(Date.now() + 30 * 60 * 1000)
    }
}, {
    timestamps: true,
    collection: 'orders'
});

// ==================== 索引定义 ====================
orderSchema.index({ userId: 1, createdAt: -1 }); // 用户订单查询
orderSchema.index({ status: 1, createdAt: -1 }); // 订单管理查询
orderSchema.index({ 'payment.transactionId': 1 }); // 支付回调查询
orderSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL清理过期未支付订单

// ==================== 虚拟字段 ====================
orderSchema.virtual('isPaid').get(function() {
    return this.payment.status === 'paid';
});

orderSchema.virtual('isDelivered').get(function() {
    return this.delivery.status === 'delivered';
});

// ==================== 实例方法 ====================

// 处理支付回调
orderSchema.methods.processPayment = async function(paymentData) {
    const { method, transactionId, amount, paidAt } = paymentData;
    
    if (amount !== this.totalAmount) {
        throw new Error('支付金额不匹配');
    }
    
    this.payment.method = method;
    this.payment.transactionId = transactionId;
    this.payment.paidAt = paidAt || new Date();
    this.payment.status = 'paid';
    this.status = 'paid';
    
    return this.save();
};

// 完成订单(发货)
orderSchema.methods.complete = async function() {
    if (this.payment.status !== 'paid') {
        throw new Error('订单未支付');
    }
    
    this.status = 'completed';
    this.delivery.status = 'delivered';
    this.delivery.deliveredAt = new Date();
    
    return this.save();
};

// 申请退款
orderSchema.methods.requestRefund = async function(reason, amount = null) {
    if (this.payment.status !== 'paid') {
        throw new Error('只有已支付订单可申请退款');
    }
    
    const refundAmount = amount || this.totalAmount;
    
    if (refundAmount > this.totalAmount - this.payment.refundAmount) {
        throw new Error('退款金额超过可退金额');
    }
    
    this.payment.refundReason = reason;
    this.status = 'disputed';
    
    return this.save();
};

// 处理退款
orderSchema.methods.processRefund = async function(amount) {
    this.payment.refundAmount += amount;
    this.payment.refundedAt = new Date();
    
    if (this.payment.refundAmount >= this.totalAmount) {
        this.payment.status = 'refunded';
        this.status = 'refunded';
    } else {
        this.payment.status = 'partial_refunded';
        this.status = 'refunded';
    }
    
    return this.save();
};

// 取消订单
orderSchema.methods.cancel = async function(reason) {
    if (this.status !== 'pending') {
        throw new Error('只能取消待支付订单');
    }
    
    this.status = 'cancelled';
    return this.save();
};

// ==================== 静态方法 ====================

orderSchema.statics.generateOrderId = function() {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.random().toString(36).substr(2, 8).toUpperCase();
    return `TOF${date}${random}`;
};

orderSchema.statics.findByUser = function(userId, options = {}) {
    const { status, limit = 20, skip = 0 } = options;
    
    const query = { userId };
    if (status) query.status = status;
    
    return this.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

orderSchema.statics.getRevenueStats = async function(startDate, endDate) {
    return this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                'payment.status': { $in: ['paid', 'partial_refunded'] }
            }
        },
        {
            $group: {
                _id: {
                    date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    method: '$payment.method'
                },
                count: { $sum: 1 },
                revenue: { $sum: '$totalAmount' },
                refund: { $sum: '$payment.refundAmount' }
            }
        },
        { $sort: { '_id.date': -1 } }
    ]);
};

orderSchema.statics.getTopSellingItems = async function(days = 30, limit = 10) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    return this.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: 'completed'
            }
        },
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.itemId',
                name: { $first: '$items.name' },
                type: { $first: '$items.itemType' },
                totalQuantity: { $sum: '$items.quantity' },
                totalRevenue: { $sum: '$items.totalPrice' }
            }
        },
        { $sort: { totalRevenue: -1 } },
        { $limit: limit }
    ]);
};

module.exports = mongoose.model('Order', orderSchema);
