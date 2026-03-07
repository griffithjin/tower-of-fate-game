const mongoose = require('mongoose');

const shopItemSchema = new mongoose.Schema({
  itemId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    enum: ['gold', 'diamond', 'card', 'avatar', 'frame', 'effect', 'package', 'vip'],
    required: true
  },
  category: {
    type: String,
    enum: ['currency', 'consumable', 'cosmetic', 'boost', 'special'],
    required: true
  },
  price: {
    currency: {
      type: String,
      enum: ['CNY', 'diamond', 'gold'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  },
  originalPrice: {
    type: Number,
    default: null
  },
  quantity: {
    type: Number,
    default: 1
  },
  icon: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary', 'mythic'],
    default: 'common'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isLimited: {
    type: Boolean,
    default: false
  },
  limitedQuantity: {
    type: Number,
    default: null
  },
  soldCount: {
    type: Number,
    default: 0
  },
  validDays: {
    type: Number,
    default: null // null 表示永久
  },
  effects: {
    // 道具效果
    goldMultiplier: { type: Number, default: 1 },
    expMultiplier: { type: Number, default: 1 },
    extraCards: { type: Number, default: 0 },
    vipExpBonus: { type: Number, default: 0 }
  },
  requirements: {
    minLevel: { type: Number, default: 0 },
    minVipLevel: { type: Number, default: 0 },
    maxPurchase: { type: Number, default: null }
  },
  tags: [String],
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// 索引
shopItemSchema.index({ type: 1, category: 1 });
shopItemSchema.index({ isAvailable: 1, isFeatured: 1 });
shopItemSchema.index({ rarity: 1 });
shopItemSchema.index({ sortOrder: 1 });

// 静态方法：获取可用商品列表
shopItemSchema.statics.getAvailableItems = async function(filters = {}) {
  const { type, category, featured, rarity } = filters;
  
  const query = { isAvailable: true };
  if (type) query.type = type;
  if (category) query.category = category;
  if (featured) query.isFeatured = true;
  if (rarity) query.rarity = rarity;
  
  return this.find(query)
    .sort({ sortOrder: 1, createdAt: -1 });
};

// 静态方法：获取推荐商品
shopItemSchema.statics.getRecommendedItems = async function(userLevel = 1, userVipLevel = 0) {
  return this.find({
    isAvailable: true,
    isFeatured: true,
    'requirements.minLevel': { $lte: userLevel },
    'requirements.minVipLevel': { $lte: userVipLevel }
  })
  .sort({ sortOrder: 1 })
  .limit(10);
};

// 实例方法：检查是否可购买
shopItemSchema.methods.canPurchase = function(user) {
  if (!this.isAvailable) {
    return { canBuy: false, reason: '商品已下架' };
  }
  
  if (this.isLimited && this.soldCount >= this.limitedQuantity) {
    return { canBuy: false, reason: '限量商品已售罄' };
  }
  
  if (user.level < this.requirements.minLevel) {
    return { canBuy: false, reason: `需要等级 ${this.requirements.minLevel}` };
  }
  
  if (user.vip.level < this.requirements.minVipLevel) {
    return { canBuy: false, reason: `需要VIP等级 ${this.requirements.minVipLevel}` };
  }
  
  return { canBuy: true, reason: null };
};

// 实例方法：增加销量
shopItemSchema.methods.increaseSoldCount = async function(quantity = 1) {
  this.soldCount += quantity;
  await this.save();
};

module.exports = mongoose.model('ShopItem', shopItemSchema);
