const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  itemId: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    enum: ['gold', 'diamond', 'item', 'vip', 'package'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['CNY', 'diamond', 'gold'],
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['alipay', 'wechat', 'diamond', 'gold', 'apple_pay', 'google_pay'],
    required: true
  },
  paymentInfo: {
    // 第三方支付相关信息
    tradeNo: String, // 第三方支付订单号
    buyerId: String,
    payTime: Date,
    receiptData: String // 苹果支付收据
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  paidAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  refundInfo: {
    refundedAt: Date,
    refundAmount: Number,
    refundReason: String
  }
}, {
  timestamps: true
});

// 复合索引
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentMethod: 1, createdAt: -1 });

// 生成订单号
orderSchema.statics.generateOrderId = function() {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `FT${timestamp}${random}`;
};

// 获取用户订单列表
orderSchema.statics.getUserOrders = async function(userId, options = {}) {
  const { status, limit = 20, page = 1 } = options;
  
  const query = { userId };
  if (status) query.status = status;
  
  const skip = (page - 1) * limit;
  
  const [orders, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    this.countDocuments(query)
  ]);
  
  return {
    orders,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// 获取订单统计
orderSchema.statics.getOrderStats = async function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'paid'] },
              '$amount',
              0
            ]
          }
        },
        paidOrders: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Order', orderSchema);
