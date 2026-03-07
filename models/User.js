const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名不能为空'],
    unique: true,
    trim: true,
    minlength: [3, '用户名至少3个字符'],
    maxlength: [20, '用户名最多20个字符']
  },
  email: {
    type: String,
    required: [true, '邮箱不能为空'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, '请输入有效的邮箱地址']
  },
  password: {
    type: String,
    required: [true, '密码不能为空'],
    minlength: [6, '密码至少6个字符'],
    select: false // 默认不返回密码字段
  },
  avatar: {
    type: String,
    default: 'https://cdn.example.com/default-avatar.png'
  },
  gold: {
    type: Number,
    default: 1000,
    min: 0
  },
  diamond: {
    type: Number,
    default: 100,
    min: 0
  },
  vip: {
    level: {
      type: Number,
      default: 0,
      min: 0,
      max: 10
    },
    exp: {
      type: Number,
      default: 0
    },
    expireAt: {
      type: Date,
      default: null
    }
  },
  inventory: [{
    itemId: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      default: 1,
      min: 0
    },
    acquiredAt: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    totalGames: {
      type: Number,
      default: 0
    },
    wins: {
      type: Number,
      default: 0
    },
    totalPoints: {
      type: Number,
      default: 0
    },
    highestStreak: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

// 索引优化查询
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'stats.totalPoints': -1 }); // 排行榜用

// 保存前加密密码
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 比较密码方法
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// 更新胜率
userSchema.methods.updateWinRate = function() {
  if (this.stats.totalGames > 0) {
    return (this.stats.wins / this.stats.totalGames * 100).toFixed(2);
  }
  return 0;
};

// 添加金币
userSchema.methods.addGold = async function(amount) {
  this.gold += amount;
  await this.save();
};

// 添加钻石
userSchema.methods.addDiamond = async function(amount) {
  this.diamond += amount;
  await this.save();
};

// 添加物品到背包
userSchema.methods.addItemToInventory = async function(itemId, count = 1) {
  const existingItem = this.inventory.find(item => item.itemId === itemId);
  
  if (existingItem) {
    existingItem.count += count;
  } else {
    this.inventory.push({
      itemId,
      count,
      acquiredAt: new Date()
    });
  }
  
  await this.save();
};

// 计算VIP经验
userSchema.methods.addVIPExp = async function(exp) {
  this.vip.exp += exp;
  
  // VIP等级计算逻辑
  const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500];
  let newLevel = 0;
  
  for (let i = 0; i < levels.length; i++) {
    if (this.vip.exp >= levels[i]) {
      newLevel = i;
    }
  }
  
  if (newLevel > this.vip.level) {
    this.vip.level = newLevel;
  }
  
  await this.save();
};

module.exports = mongoose.model('User', userSchema);
