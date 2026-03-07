const mongoose = require('mongoose');

const effectSchema = new mongoose.Schema({
  effectId: {
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
  // 特效类型
  type: {
    type: String,
    enum: ['particle', 'shader', 'animation', 'combination'],
    required: true
  },
  // 3D模型/特效配置
  model3D: {
    modelUrl: String,
    particleSystem: {
      particleCount: { type: Number, default: 100 },
      lifetime: Number,
      size: Number,
      color: [String],
      texture: String,
      emissionRate: Number,
      velocity: {
        x: Number,
        y: Number,
        z: Number
      }
    },
    shader: {
      vertexShader: String,
      fragmentShader: String,
      uniforms: mongoose.Schema.Types.Mixed
    },
    animations: [{
      name: String,
      duration: Number,
      easing: String
    }]
  },
  // 预览图
  preview: {
    imageUrl: String,
    gifUrl: String,
    videoUrl: String
  },
  // 分类
  category: {
    type: String,
    enum: ['aura', 'trail', 'impact', 'buff', 'debuff', 'environment', 'ui'],
    required: true
  },
  // 适用场景
  applicableScenes: [{
    type: String,
    enum: ['gameplay', 'victory', 'defeat', 'menu', 'shop', 'social']
  }],
  // 价格
  pricing: {
    currency: { type: String, enum: ['coins', 'gems', 'points', 'real'], default: 'coins' },
    amount: { type: Number, default: 0 },
    saleAmount: Number,
    saleEndTime: Date
  },
  // 稀有度
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary', 'mythic'],
    default: 'common'
  },
  // 解锁条件
  unlockCondition: {
    type: { type: String, enum: ['free', 'purchase', 'event', 'achievement', 'vip'] },
    requirement: mongoose.Schema.Types.Mixed
  },
  // 统计数据
  stats: {
    purchasedCount: { type: Number, default: 0 },
    equippedCount: { type: Number, default: 0 }
  },
  // 配置参数（用于运行时调整）
  config: {
    intensity: { type: Number, default: 1.0 },
    speed: { type: Number, default: 1.0 },
    scale: { type: Number, default: 1.0 },
    opacity: { type: Number, default: 1.0 }
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
  }
}, {
  timestamps: true,
  collection: 'effects'
});

// 索引
effectSchema.index({ type: 1 });
effectSchema.index({ category: 1 });
effectSchema.index({ rarity: 1 });
effectSchema.index({ isActive: 1 });
effectSchema.index({ 'pricing.amount': 1 });

// 静态方法 - 获取商店特效
effectSchema.statics.getShopEffects = function() {
  return this.find({ 
    isActive: true,
    $or: [
      { 'unlockCondition.type': 'purchase' },
      { 'unlockCondition.type': 'free' }
    ]
  }).sort({ 'pricing.amount': 1 });
};

// 静态方法 - 按分类获取
effectSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// 实例方法 - 更新价格
effectSchema.methods.updatePrice = function(amount, currency = 'coins') {
  const oldPrice = this.pricing.amount;
  this.pricing.amount = amount;
  this.pricing.currency = currency;
  return {
    oldPrice,
    newPrice: amount,
    currency,
    effectId: this.effectId
  };
};

// 实例方法 - 获取运行时配置
effectSchema.methods.getRuntimeConfig = function() {
  return {
    id: this.effectId,
    type: this.type,
    config: this.config,
    model3D: this.model3D
  };
};

module.exports = mongoose.model('Effect', effectSchema);
