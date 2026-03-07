const mongoose = require('mongoose');

const avatarSchema = new mongoose.Schema({
  avatarId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  nameEn: String,
  description: String,
  descriptionEn: String,
  // 3D模型配置
  config3D: {
    modelUrl: { type: String, required: true },
    textureUrl: String,
    thumbnailUrl: String,
    previewUrl: String,
    scale: {
      x: { type: Number, default: 1 },
      y: { type: Number, default: 1 },
      z: { type: Number, default: 1 }
    },
    animations: [{
      name: String,
      trigger: { type: String, enum: ['idle', 'walk', 'run', 'jump', 'emote', 'victory'] },
      duration: Number,
      loop: { type: Boolean, default: true }
    }]
  },
  // 2D图标（用于UI）
  icons: {
    small: String,
    medium: String,
    large: String
  },
  // 分类
  category: {
    type: String,
    enum: ['basic', 'cute', 'cool', 'fantasy', 'animal', 'special', 'limited'],
    default: 'basic'
  },
  // 稀有度
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary', 'mythic'],
    default: 'common'
  },
  // 价格（商店用）
  pricing: {
    currency: { type: String, enum: ['coins', 'gems', 'points', 'real'], default: 'coins' },
    amount: { type: Number, default: 0 },
    saleAmount: Number,
    saleEndTime: Date
  },
  // 解锁条件
  unlockCondition: {
    type: { type: String, enum: ['free', 'level', 'purchase', 'event', 'achievement', 'vip'] },
    requirement: mongoose.Schema.Types.Mixed
  },
  // 统计数据
  stats: {
    ownedCount: { type: Number, default: 0 },
    equippedCount: { type: Number, default: 0 }
  },
  // 特效
  effects: {
    equipEffect: String,
    auraEffect: String,
    trailEffect: String
  },
  // 元数据
  metadata: {
    createdBy: String,
    updatedBy: String,
    version: { type: Number, default: 1 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // 限时信息
  limited: {
    isLimited: { type: Boolean, default: false },
    startTime: Date,
    endTime: Date,
    totalSupply: Number,
    remainingSupply: Number
  }
}, {
  timestamps: true,
  collection: 'avatars'
});

// 索引
avatarSchema.index({ category: 1 });
avatarSchema.index({ rarity: 1 });
avatarSchema.index({ isActive: 1 });
avatarSchema.index({ 'pricing.amount': 1 });

// 静态方法 - 获取商店头像
avatarSchema.statics.getShopAvatars = function() {
  return this.find({ 
    isActive: true,
    $or: [
      { 'unlockCondition.type': 'purchase' },
      { 'unlockCondition.type': 'free' }
    ]
  }).sort({ 'pricing.amount': 1 });
};

// 实例方法 - 检查是否可用
avatarSchema.methods.isAvailable = function() {
  if (!this.isActive) return false;
  
  if (this.limited.isLimited) {
    const now = new Date();
    if (this.limited.startTime && now < this.limited.startTime) return false;
    if (this.limited.endTime && now > this.limited.endTime) return false;
    if (this.limited.remainingSupply <= 0) return false;
  }
  
  return true;
};

// 实例方法 - 获取当前价格
avatarSchema.methods.getCurrentPrice = function() {
  if (this.pricing.saleAmount && this.pricing.saleEndTime > new Date()) {
    return {
      amount: this.pricing.saleAmount,
      currency: this.pricing.currency,
      isOnSale: true,
      originalAmount: this.pricing.amount
    };
  }
  return {
    amount: this.pricing.amount,
    currency: this.pricing.currency,
    isOnSale: false
  };
};

module.exports = mongoose.model('Avatar', avatarSchema);
