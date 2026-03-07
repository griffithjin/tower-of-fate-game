const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validateBuyItem } = require('../middleware/validator');
const ShopItem = require('../models/ShopItem');
const User = require('../models/User');
const Order = require('../models/Order');

// 商品分类映射
const CATEGORY_NAMES = {
  currency: '货币',
  consumable: '消耗品',
  cosmetic: '外观',
  boost: '增益',
  special: '特殊'
};

// @route   GET /api/shop/items
// @desc    获取商品列表
// @access  Public
router.get('/items', async (req, res) => {
  try {
    const { type, category, featured, rarity, page = 1, limit = 20 } = req.query;
    
    const filters = {};
    if (type) filters.type = type;
    if (category) filters.category = category;
    if (featured) filters.featured = featured === 'true';
    if (rarity) filters.rarity = rarity;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [items, total] = await Promise.all([
      ShopItem.getAvailableItems(filters)
        .skip(skip)
        .limit(parseInt(limit)),
      ShopItem.countDocuments({ isAvailable: true, ...filters })
    ]);

    res.json({
      success: true,
      data: {
        items: items.map(item => ({
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          type: item.type,
          category: item.category,
          categoryName: CATEGORY_NAMES[item.category],
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          icon: item.icon,
          image: item.image,
          rarity: item.rarity,
          isFeatured: item.isFeatured,
          isLimited: item.isLimited,
          limitedQuantity: item.limitedQuantity,
          soldCount: item.soldCount,
          remaining: item.isLimited ? item.limitedQuantity - item.soldCount : null,
          validDays: item.validDays,
          effects: item.effects,
          requirements: item.requirements,
          tags: item.tags
        })),
        categories: Object.entries(CATEGORY_NAMES).map(([key, name]) => ({
          key,
          name
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('获取商品列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取商品列表失败'
    });
  }
});

// @route   GET /api/shop/items/featured
// @desc    获取推荐商品
// @access  Public
router.get('/items/featured', async (req, res) => {
  try {
    const items = await ShopItem.find({
      isAvailable: true,
      isFeatured: true
    })
    .sort({ sortOrder: 1 })
    .limit(6);

    res.json({
      success: true,
      data: {
        items: items.map(item => ({
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          type: item.type,
          price: item.price,
          originalPrice: item.originalPrice,
          icon: item.icon,
          rarity: item.rarity,
          isLimited: item.isLimited,
          tags: item.tags
        }))
      }
    });
  } catch (error) {
    console.error('获取推荐商品错误:', error);
    res.status(500).json({
      success: false,
      message: '获取推荐商品失败'
    });
  }
});

// @route   GET /api/shop/items/:itemId
// @desc    获取商品详情
// @access  Public
router.get('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = await ShopItem.findOne({ itemId, isAvailable: true });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: '商品不存在或已下架'
      });
    }

    res.json({
      success: true,
      data: {
        item: {
          itemId: item.itemId,
          name: item.name,
          description: item.description,
          type: item.type,
          category: item.category,
          categoryName: CATEGORY_NAMES[item.category],
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          icon: item.icon,
          image: item.image,
          rarity: item.rarity,
          isFeatured: item.isFeatured,
          isLimited: item.isLimited,
          limitedQuantity: item.limitedQuantity,
          soldCount: item.soldCount,
          remaining: item.isLimited ? item.limitedQuantity - item.soldCount : null,
          validDays: item.validDays,
          effects: item.effects,
          requirements: item.requirements,
          tags: item.tags
        }
      }
    });
  } catch (error) {
    console.error('获取商品详情错误:', error);
    res.status(500).json({
      success: false,
      message: '获取商品详情失败'
    });
  }
});

// @route   POST /api/shop/buy
// @desc    购买商品
// @access  Private
router.post('/buy', authenticate, validateBuyItem, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const userId = req.userId;

    // 查找商品
    const item = await ShopItem.findOne({ itemId });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: '商品不存在'
      });
    }

    // 检查是否可购买
    const user = await User.findById(userId);
    const canPurchase = item.canPurchase(user);
    
    if (!canPurchase.canBuy) {
      return res.status(403).json({
        success: false,
        message: canPurchase.reason
      });
    }

    // 计算总价
    const totalPrice = item.price.amount * quantity;

    // 检查余额
    if (item.price.currency === 'gold') {
      if (user.gold < totalPrice) {
        return res.status(403).json({
          success: false,
          message: '金币不足',
          required: totalPrice,
          current: user.gold
        });
      }
      user.gold -= totalPrice;
    } else if (item.price.currency === 'diamond') {
      if (user.diamond < totalPrice) {
        return res.status(403).json({
          success: false,
          message: '钻石不足',
          required: totalPrice,
          current: user.diamond
        });
      }
      user.diamond -= totalPrice;
    } else {
      // CNY 支付需要创建订单
      return res.status(400).json({
        success: false,
        message: '人民币支付请使用 /api/payment/create 接口'
      });
    }

    // 扣除货币并添加物品
    await user.addItemToInventory(itemId, quantity * item.quantity);
    await user.save();

    // 增加销量
    await item.increaseSoldCount(quantity);

    // 创建订单记录
    const order = new Order({
      orderId: Order.generateOrderId(),
      userId,
      itemId,
      itemName: item.name,
      itemType: item.type,
      amount: totalPrice,
      currency: item.price.currency,
      quantity,
      status: 'paid',
      paymentMethod: item.price.currency,
      paidAt: new Date()
    });
    await order.save();

    res.json({
      success: true,
      message: '购买成功',
      data: {
        orderId: order.orderId,
        item: {
          itemId: item.itemId,
          name: item.name,
          quantity: quantity * item.quantity
        },
        cost: {
          currency: item.price.currency,
          amount: totalPrice
        },
        remainingBalance: {
          gold: user.gold,
          diamond: user.diamond
        }
      }
    });
  } catch (error) {
    console.error('购买商品错误:', error);
    res.status(500).json({
      success: false,
      message: '购买失败，请稍后重试'
    });
  }
});

// @route   GET /api/shop/inventory
// @desc    获取背包物品
// @access  Private
router.get('/inventory', authenticate, async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 获取物品详情
    const inventoryWithDetails = await Promise.all(
      user.inventory.map(async (invItem) => {
        const item = await ShopItem.findOne({ itemId: invItem.itemId });
        return {
          itemId: invItem.itemId,
          name: item?.name || '未知物品',
          description: item?.description || '',
          icon: item?.icon || '',
          type: item?.type || 'unknown',
          rarity: item?.rarity || 'common',
          count: invItem.count,
          acquiredAt: invItem.acquiredAt,
          validDays: item?.validDays,
          effects: item?.effects
        };
      })
    );

    res.json({
      success: true,
      data: {
        inventory: inventoryWithDetails,
        totalItems: inventoryWithDetails.reduce((sum, item) => sum + item.count, 0)
      }
    });
  } catch (error) {
    console.error('获取背包错误:', error);
    res.status(500).json({
      success: false,
      message: '获取背包失败'
    });
  }
});

// @route   POST /api/shop/use-item
// @desc    使用物品
// @access  Private
router.post('/use-item', authenticate, async (req, res) => {
  try {
    const { itemId, quantity = 1 } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    const invItem = user.inventory.find(i => i.itemId === itemId);

    if (!invItem || invItem.count < quantity) {
      return res.status(400).json({
        success: false,
        message: '物品数量不足'
      });
    }

    // 获取物品详情
    const item = await ShopItem.findOne({ itemId });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: '物品不存在'
      });
    }

    // 应用物品效果
    const effects = [];
    
    if (item.effects.goldMultiplier > 1) {
      effects.push(`金币加成 ${item.effects.goldMultiplier}x`);
    }
    if (item.effects.expMultiplier > 1) {
      effects.push(`经验加成 ${item.effects.expMultiplier}x`);
    }
    if (item.effects.extraCards > 0) {
      effects.push(`额外卡牌 +${item.effects.extraCards}`);
    }

    // 扣除物品数量
    invItem.count -= quantity;
    if (invItem.count === 0) {
      user.inventory = user.inventory.filter(i => i.itemId !== itemId);
    }
    
    await user.save();

    res.json({
      success: true,
      message: '使用成功',
      data: {
        item: {
          name: item.name,
          quantity: quantity
        },
        effects,
        remaining: invItem.count
      }
    });
  } catch (error) {
    console.error('使用物品错误:', error);
    res.status(500).json({
      success: false,
      message: '使用物品失败'
    });
  }
});

module.exports = router;
