const mongoose = require('mongoose');

const towerSchema = new mongoose.Schema({
  towerId: {
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
    modelUrl: String,
    textureUrl: String,
    scale: {
      x: { type: Number, default: 1 },
      y: { type: Number, default: 1 },
      z: { type: Number, default: 1 }
    },
    position: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    rotation: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    materials: [{
      name: String,
      color: String,
      roughness: { type: Number, default: 0.5 },
      metalness: { type: Number, default: 0.5 }
    }],
    animations: [{
      name: String,
      duration: Number,
      loop: { type: Boolean, default: false }
    }]
  },
  // 塔属性
  attributes: {
    rarity: {
      type: String,
      enum: ['common', 'rare', 'epic', 'legendary', 'mythic'],
      default: 'common'
    },
    element: {
      type: String,
      enum: ['fire', 'water', 'earth', 'wind', 'light', 'dark', 'none'],
      default: 'none'
    },
    attack: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    health: { type: Number, default: 100 },
    speed: { type: Number, default: 1 }
  },
  // 解锁条件
  unlockCondition: {
    level: { type: Number, default: 1 },
    cost: {
      type: { type: String, enum: ['coins', 'gems', 'points'] },
      amount: { type: Number, default: 0 }
    }
  },
  // 所属地区/国家
  region: {
    country: String,
    countryCode: String,
    city: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
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
  collection: 'towers'
});

// 索引
towerSchema.index({ 'attributes.rarity': 1 });
towerSchema.index({ 'attributes.element': 1 });
towerSchema.index({ 'region.countryCode': 1 });
towerSchema.index({ isActive: 1 });

// 静态方法 - 获取所有激活的塔
towerSchema.statics.getActiveTowers = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// 实例方法 - 获取3D配置
towerSchema.methods.get3DConfig = function() {
  return {
    id: this.towerId,
    name: this.name,
    config: this.config3D,
    attributes: this.attributes
  };
};

module.exports = mongoose.model('Tower', towerSchema);
