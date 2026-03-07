const mongoose = require('mongoose');

const postcardSchema = new mongoose.Schema({
  postcardId: {
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
  // 明信片图片
  images: {
    front: {
      url: { type: String, required: true },
      thumbnail: String,
      highRes: String
    },
    back: {
      url: String,
      template: { type: String, default: 'default' }
    }
  },
  // 祝福语录（多语言）
  blessings: [{
    language: { type: String, default: 'zh' },
    texts: [String]
  }],
  // 所属塔
  towerId: {
    type: String,
    index: true
  },
  towerName: String,
  // 所属地区
  region: {
    country: String,
    countryCode: String,
    city: String,
    landmark: String
  },
  // 稀有度
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary', 'limited'],
    default: 'common'
  },
  // 系列信息
  series: {
    name: String,
    seriesId: String,
    order: { type: Number, default: 0 }
  },
  // 收集统计
  stats: {
    collectedCount: { type: Number, default: 0 },
    sharedCount: { type: Number, default: 0 },
    favoriteCount: { type: Number, default: 0 }
  },
  // 解锁条件
  unlockCondition: {
    type: { type: String, enum: ['free', 'drop', 'purchase', 'event', 'achievement'] },
    requirement: String
  },
  // 元数据
  metadata: {
    createdBy: String,
    updatedBy: String,
    illustrator: String,
    photographer: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  collection: 'postcards'
});

// 索引
postcardSchema.index({ towerId: 1 });
postcardSchema.index({ rarity: 1 });
postcardSchema.index({ 'series.seriesId': 1 });
postcardSchema.index({ 'region.countryCode': 1 });
postcardSchema.index({ isActive: 1 });

// 静态方法 - 获取所有激活的明信片
postcardSchema.statics.getActivePostcards = function() {
  return this.find({ isActive: true }).sort({ createdAt: -1 });
};

// 实例方法 - 添加祝福语录
postcardSchema.methods.addBlessing = function(language, text) {
  const blessingSet = this.blessings.find(b => b.language === language);
  if (blessingSet) {
    if (!blessingSet.texts.includes(text)) {
      blessingSet.texts.push(text);
    }
  } else {
    this.blessings.push({ language, texts: [text] });
  }
  return this.save();
};

module.exports = mongoose.model('Postcard', postcardSchema);
