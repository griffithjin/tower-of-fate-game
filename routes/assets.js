/**
 * 资产 REST API 路由
 * 提供CRUD操作的RESTful接口，同时触发WebSocket实时同步
 */

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { Tower, Postcard, Avatar, Effect } = require('../models');

// ==================== 塔模型 API ====================

// @route   GET /api/admin/towers
// @desc    获取所有塔
// @access  Admin
router.get('/towers', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, rarity, element } = req.query;
    
    const query = { isActive: true };
    if (rarity) query['attributes.rarity'] = rarity;
    if (element) query['attributes.element'] = element;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [towers, total] = await Promise.all([
      Tower.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Tower.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: towers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取塔列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取塔列表失败'
    });
  }
});

// @route   POST /api/admin/towers
// @desc    创建新塔
// @access  Admin
router.post('/towers', authenticate, requireAdmin, async (req, res) => {
  try {
    const { towerId, name, nameEn, description, descriptionEn, config3D, attributes, region } = req.body;
    
    // 检查是否已存在
    const existing = await Tower.findOne({ towerId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: '塔ID已存在'
      });
    }
    
    const tower = new Tower({
      towerId,
      name,
      nameEn,
      description,
      descriptionEn,
      config3D,
      attributes,
      region,
      'metadata.createdBy': req.user.username
    });
    
    await tower.save();
    
    // 触发实时同步
    const io = req.app.get('io');
    if (io) {
      io.emit('tower:created', {
        id: tower.towerId,
        name: tower.name,
        config: tower.config3D,
        timestamp: Date.now()
      });
    }
    
    res.json({
      success: true,
      message: '塔创建成功',
      data: tower
    });
  } catch (error) {
    console.error('创建塔错误:', error);
    res.status(500).json({
      success: false,
      message: '创建塔失败: ' + error.message
    });
  }
});

// @route   PUT /api/admin/towers/:id
// @desc    更新塔配置
// @access  Admin
router.put('/towers/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const tower = await Tower.findOneAndUpdate(
      { towerId: id },
      {
        ...updateData,
        'metadata.updatedBy': req.user.username
      },
      { new: true }
    );
    
    if (!tower) {
      return res.status(404).json({
        success: false,
        message: '塔不存在'
      });
    }
    
    // 触发实时同步
    const io = req.app.get('io');
    if (io) {
      io.emit('tower:updated', {
        id: tower.towerId,
        name: tower.name,
        config: tower.config3D,
        attributes: tower.attributes,
        timestamp: Date.now()
      });
    }
    
    res.json({
      success: true,
      message: '塔更新成功',
      data: tower
    });
  } catch (error) {
    console.error('更新塔错误:', error);
    res.status(500).json({
      success: false,
      message: '更新塔失败: ' + error.message
    });
  }
});

// @route   DELETE /api/admin/towers/:id
// @desc    删除塔（软删除）
// @access  Admin
router.delete('/towers/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const tower = await Tower.findOneAndUpdate(
      { towerId: id },
      { isActive: false },
      { new: true }
    );
    
    if (!tower) {
      return res.status(404).json({
        success: false,
        message: '塔不存在'
      });
    }
    
    // 触发实时同步
    const io = req.app.get('io');
    if (io) {
      io.emit('tower:deleted', { id, timestamp: Date.now() });
    }
    
    res.json({
      success: true,
      message: '塔已删除'
    });
  } catch (error) {
    console.error('删除塔错误:', error);
    res.status(500).json({
      success: false,
      message: '删除塔失败'
    });
  }
});

// ==================== 明信片 API ====================

// @route   GET /api/admin/postcards
// @desc    获取所有明信片
// @access  Admin
router.get('/postcards', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, rarity, towerId } = req.query;
    
    const query = { isActive: true };
    if (rarity) query.rarity = rarity;
    if (towerId) query.towerId = towerId;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [postcards, total] = await Promise.all([
      Postcard.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Postcard.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: postcards,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取明信片列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取明信片列表失败'
    });
  }
});

// @route   POST /api/admin/postcards
// @desc    创建明信片
// @access  Admin
router.post('/postcards', authenticate, requireAdmin, async (req, res) => {
  try {
    const { postcardId, name, nameEn, description, images, blessings, towerId, rarity } = req.body;
    
    const existing = await Postcard.findOne({ postcardId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: '明信片ID已存在'
      });
    }
    
    const postcard = new Postcard({
      postcardId,
      name,
      nameEn,
      description,
      images,
      blessings,
      towerId,
      rarity,
      'metadata.createdBy': req.user.username
    });
    
    await postcard.save();
    
    // 触发实时同步
    const io = req.app.get('io');
    if (io) {
      io.emit('postcard:created', {
        id: postcard.postcardId,
        name: postcard.name,
        imageUrl: postcard.images?.front?.url,
        timestamp: Date.now()
      });
    }
    
    res.json({
      success: true,
      message: '明信片创建成功',
      data: postcard
    });
  } catch (error) {
    console.error('创建明信片错误:', error);
    res.status(500).json({
      success: false,
      message: '创建明信片失败'
    });
  }
});

// @route   PUT /api/admin/postcards/:id
// @desc    更新明信片
// @access  Admin
router.put('/postcards/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const postcard = await Postcard.findOneAndUpdate(
      { postcardId: id },
      {
        ...updateData,
        'metadata.updatedBy': req.user.username
      },
      { new: true }
    );
    
    if (!postcard) {
      return res.status(404).json({
        success: false,
        message: '明信片不存在'
      });
    }
    
    // 触发实时同步
    const io = req.app.get('io');
    if (io) {
      io.emit('postcard:updated', {
        id: postcard.postcardId,
        name: postcard.name,
        data: postcard,
        timestamp: Date.now()
      });
    }
    
    res.json({
      success: true,
      message: '明信片更新成功',
      data: postcard
    });
  } catch (error) {
    console.error('更新明信片错误:', error);
    res.status(500).json({
      success: false,
      message: '更新明信片失败'
    });
  }
});

// @route   PUT /api/admin/postcards/:id/blessings
// @desc    更新明信片祝福语录
// @access  Admin
router.put('/postcards/:id/blessings', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { language, texts } = req.body;
    
    const postcard = await Postcard.findOne({ postcardId: id });
    if (!postcard) {
      return res.status(404).json({
        success: false,
        message: '明信片不存在'
      });
    }
    
    // 更新祝福语录
    const blessingIndex = postcard.blessings.findIndex(b => b.language === language);
    if (blessingIndex >= 0) {
      postcard.blessings[blessingIndex].texts = texts;
    } else {
      postcard.blessings.push({ language, texts });
    }
    
    await postcard.save();
    
    // 触发实时同步
    const io = req.app.get('io');
    if (io) {
      io.emit('postcard:blessingUpdated', {
        id: postcard.postcardId,
        language,
        blessings: texts,
        updatedBy: req.user.username,
        timestamp: Date.now()
      });
    }
    
    res.json({
      success: true,
      message: '祝福语录更新成功',
      data: postcard
    });
  } catch (error) {
    console.error('更新祝福语录错误:', error);
    res.status(500).json({
      success: false,
      message: '更新祝福语录失败'
    });
  }
});

// @route   DELETE /api/admin/postcards/:id
// @desc    删除明信片
// @access  Admin
router.delete('/postcards/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const postcard = await Postcard.findOneAndUpdate(
      { postcardId: id },
      { isActive: false },
      { new: true }
    );
    
    if (!postcard) {
      return res.status(404).json({
        success: false,
        message: '明信片不存在'
      });
    }
    
    res.json({
      success: true,
      message: '明信片已删除'
    });
  } catch (error) {
    console.error('删除明信片错误:', error);
    res.status(500).json({
      success: false,
      message: '删除明信片失败'
    });
  }
});

// ==================== 头像 API ====================

// @route   GET /api/admin/avatars
// @desc    获取所有头像
// @access  Admin
router.get('/avatars', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, category, rarity } = req.query;
    
    const query = { isActive: true };
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [avatars, total] = await Promise.all([
      Avatar.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Avatar.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: avatars,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取头像列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取头像列表失败'
    });
  }
});

// @route   POST /api/admin/avatars
// @desc    创建头像
// @access  Admin
router.post('/avatars', authenticate, requireAdmin, async (req, res) => {
  try {
    const { avatarId, name, nameEn, config3D, icons, category, rarity, pricing } = req.body;
    
    const existing = await Avatar.findOne({ avatarId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: '头像ID已存在'
      });
    }
    
    const avatar = new Avatar({
      avatarId,
      name,
      nameEn,
      config3D,
      icons,
      category,
      rarity,
      pricing,
      'metadata.createdBy': req.user.username
    });
    
    await avatar.save();
    
    // 触发实时同步
    const io = req.app.get('io');
    if (io) {
      io.emit('avatar:created', {
        id: avatar.avatarId,
        name: avatar.name,
        config: avatar.config3D,
        icons: avatar.icons,
        pricing: avatar.pricing,
        timestamp: Date.now()
      });
    }
    
    res.json({
      success: true,
      message: '头像创建成功',
      data: avatar
    });
  } catch (error) {
    console.error('创建头像错误:', error);
    res.status(500).json({
      success: false,
      message: '创建头像失败'
    });
  }
});

// @route   PUT /api/admin/avatars/:id
// @desc    更新头像
// @access  Admin
router.put('/avatars/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const avatar = await Avatar.findOneAndUpdate(
      { avatarId: id },
      {
        ...updateData,
        'metadata.updatedBy': req.user.username
      },
      { new: true }
    );
    
    if (!avatar) {
      return res.status(404).json({
        success: false,
        message: '头像不存在'
      });
    }
    
    // 触发实时同步
    const io = req.app.get('io');
    if (io) {
      io.emit('avatar:updated', {
        id: avatar.avatarId,
        name: avatar.name,
        data: avatar,
        timestamp: Date.now()
      });
    }
    
    res.json({
      success: true,
      message: '头像更新成功',
      data: avatar
    });
  } catch (error) {
    console.error('更新头像错误:', error);
    res.status(500).json({
      success: false,
      message: '更新头像失败'
    });
  }
});

// @route   DELETE /api/admin/avatars/:id
// @desc    删除头像
// @access  Admin
router.delete('/avatars/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await Avatar.findOneAndUpdate(
      { avatarId: id },
      { isActive: false }
    );
    
    res.json({
      success: true,
      message: '头像已删除'
    });
  } catch (error) {
    console.error('删除头像错误:', error);
    res.status(500).json({
      success: false,
      message: '删除头像失败'
    });
  }
});

// ==================== 特效道具 API ====================

// @route   GET /api/admin/effects
// @desc    获取所有特效
// @access  Admin
router.get('/effects', authenticate, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, category, type } = req.query;
    
    const query = { isActive: true };
    if (category) query.category = category;
    if (type) query.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [effects, total] = await Promise.all([
      Effect.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Effect.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: effects,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('获取特效列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取特效列表失败'
    });
  }
});

// @route   POST /api/admin/effects
// @desc    创建特效
// @access  Admin
router.post('/effects', authenticate, requireAdmin, async (req, res) => {
  try {
    const { effectId, name, nameEn, type, category, model3D, pricing, rarity } = req.body;
    
    const existing = await Effect.findOne({ effectId });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: '特效ID已存在'
      });
    }
    
    const effect = new Effect({
      effectId,
      name,
      nameEn,
      type,
      category,
      model3D,
      pricing,
      rarity,
      'metadata.createdBy': req.user.username
    });
    
    await effect.save();
    
    // 触发实时同步
    const io = req.app.get('io');
    if (io) {
      io.emit('effect:created', {
        id: effect.effectId,
        name: effect.name,
        type: effect.type,
        category: effect.category,
        model3D: effect.model3D,
        pricing: effect.pricing,
        timestamp: Date.now()
      });
    }
    
    res.json({
      success: true,
      message: '特效创建成功',
      data: effect
    });
  } catch (error) {
    console.error('创建特效错误:', error);
    res.status(500).json({
      success: false,
      message: '创建特效失败'
    });
  }
});

// @route   PUT /api/admin/effects/:id
// @desc    更新特效
// @access  Admin
router.put('/effects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const effect = await Effect.findOneAndUpdate(
      { effectId: id },
      {
        ...updateData,
        'metadata.updatedBy': req.user.username
      },
      { new: true }
    );
    
    if (!effect) {
      return res.status(404).json({
        success: false,
        message: '特效不存在'
      });
    }
    
    // 触发实时同步
    const io = req.app.get('io');
    if (io) {
      io.emit('effect:updated', {
        id: effect.effectId,
        name: effect.name,
        data: effect,
        timestamp: Date.now()
      });
    }
    
    res.json({
      success: true,
      message: '特效更新成功',
      data: effect
    });
  } catch (error) {
    console.error('更新特效错误:', error);
    res.status(500).json({
      success: false,
      message: '更新特效失败'
    });
  }
});

// @route   PUT /api/admin/effects/:id/price
// @desc    更新特效价格
// @access  Admin
router.put('/effects/:id/price', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, currency } = req.body;
    
    const effect = await Effect.findOne({ effectId: id });
    if (!effect) {
      return res.status(404).json({
        success: false,
        message: '特效不存在'
      });
    }
    
    const oldPrice = effect.pricing.amount;
    effect.pricing.amount = amount;
    if (currency) effect.pricing.currency = currency;
    await effect.save();
    
    // 触发实时价格同步
    const io = req.app.get('io');
    if (io) {
      io.emit('effect:priceChanged', {
        id: effect.effectId,
        name: effect.name,
        oldPrice,
        newPrice: amount,
        currency: effect.pricing.currency,
        timestamp: Date.now()
      });
    }
    
    res.json({
      success: true,
      message: '价格更新成功',
      data: {
        id: effect.effectId,
        oldPrice,
        newPrice: amount,
        currency: effect.pricing.currency
      }
    });
  } catch (error) {
    console.error('更新价格错误:', error);
    res.status(500).json({
      success: false,
      message: '更新价格失败'
    });
  }
});

// @route   DELETE /api/admin/effects/:id
// @desc    删除特效
// @access  Admin
router.delete('/effects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await Effect.findOneAndUpdate(
      { effectId: id },
      { isActive: false }
    );
    
    res.json({
      success: true,
      message: '特效已删除'
    });
  } catch (error) {
    console.error('删除特效错误:', error);
    res.status(500).json({
      success: false,
      message: '删除特效失败'
    });
  }
});

// ==================== 资产统计 API ====================

// @route   GET /api/admin/assets/stats
// @desc    获取资产统计
// @access  Admin
router.get('/assets/stats', authenticate, requireAdmin, async (req, res) => {
  try {
    const [towerCount, postcardCount, avatarCount, effectCount] = await Promise.all([
      Tower.countDocuments({ isActive: true }),
      Postcard.countDocuments({ isActive: true }),
      Avatar.countDocuments({ isActive: true }),
      Effect.countDocuments({ isActive: true })
    ]);
    
    // 按稀有度统计
    const [towerByRarity, postcardByRarity, avatarByRarity, effectByRarity] = await Promise.all([
      Tower.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$attributes.rarity', count: { $sum: 1 } } }
      ]),
      Postcard.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$rarity', count: { $sum: 1 } } }
      ]),
      Avatar.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$rarity', count: { $sum: 1 } } }
      ]),
      Effect.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$rarity', count: { $sum: 1 } } }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        total: {
          towers: towerCount,
          postcards: postcardCount,
          avatars: avatarCount,
          effects: effectCount
        },
        byRarity: {
          towers: towerByRarity,
          postcards: postcardByRarity,
          avatars: avatarByRarity,
          effects: effectByRarity
        }
      }
    });
  } catch (error) {
    console.error('获取资产统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取资产统计失败'
    });
  }
});

module.exports = router;
