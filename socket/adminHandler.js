/**
 * Admin Socket Handler - 实时资产同步
 * 处理所有管理员相关的WebSocket事件，实现资产实时同步
 */

const { Tower, Postcard, Avatar, Effect } = require('../models');

// 管理员事件定义
const ADMIN_EVENTS = {
  // 塔模型事件
  'tower:created': '新塔创建',
  'tower:updated': '塔配置更新',
  'tower:deleted': '塔删除',
  
  // 明信片事件
  'postcard:created': '新明信片',
  'postcard:updated': '明信片更新',
  'postcard:blessingUpdated': '祝福语录更新',
  
  // 头像事件
  'avatar:created': '新头像',
  'avatar:updated': '头像更新',
  
  // 特效道具事件
  'effect:created': '新特效',
  'effect:updated': '特效更新',
  'effect:priceChanged': '价格变动',
  
  // 锦标赛事件
  'tournament:created': '新锦标赛',
  'tournament:updated': '锦标赛更新',
  'tournament:started': '锦标赛开始',
  'tournament:ended': '锦标赛结束',
  
  // 多语言事件
  'translation:updated': '翻译更新'
};

// 已连接的管理员
const connectedAdmins = new Map();

module.exports = (io) => {
  // 创建管理员命名空间
  const adminNamespace = io.of('/admin');
  
  adminNamespace.on('connection', (socket) => {
    console.log(`[Admin] 管理员连接: ${socket.id}`);
    
    // 管理员认证
    socket.on('authenticate', async (data) => {
      const { userId, token, role } = data;
      
      // 验证管理员权限（简化版，实际应调用JWT验证）
      if (role === 'admin' || userId === 'admin') {
        socket.userId = userId;
        socket.isAdmin = true;
        socket.authenticated = true;
        
        connectedAdmins.set(socket.id, {
          userId,
          socketId: socket.id,
          connectedAt: new Date()
        });
        
        socket.emit('authenticated', { 
          success: true, 
          message: '管理员认证成功',
          permissions: ['tower', 'postcard', 'avatar', 'effect', 'tournament']
        });
        
        console.log(`[Admin] 管理员 ${userId} 已认证`);
      } else {
        socket.emit('authenticated', { 
          success: false, 
          message: '无管理员权限' 
        });
      }
    });
    
    // ==================== 塔模型实时同步 ====================
    
    // 获取所有塔
    socket.on('tower:getAll', async () => {
      if (!socket.authenticated) return;
      
      try {
        const towers = await Tower.getActiveTowers();
        socket.emit('tower:list', {
          success: true,
          data: towers,
          count: towers.length
        });
      } catch (error) {
        socket.emit('tower:list', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 创建新塔
    socket.on('tower:create', async (data) => {
      if (!socket.authenticated) return;
      
      try {
        const tower = new Tower({
          ...data,
          'metadata.createdBy': socket.userId
        });
        await tower.save();
        
        // 广播给所有管理员和客户端
        adminNamespace.emit('tower:created', {
          id: tower.towerId,
          name: tower.name,
          config: tower.config3D,
          timestamp: Date.now()
        });
        
        // 广播到游戏客户端
        io.emit('tower:created', {
          id: tower.towerId,
          name: tower.name,
          config: tower.config3D
        });
        
        socket.emit('tower:createResponse', {
          success: true,
          data: tower
        });
        
        logAdminAction(socket.userId, 'tower:create', tower.towerId);
      } catch (error) {
        socket.emit('tower:createResponse', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 更新塔
    socket.on('tower:update', async (data) => {
      if (!socket.authenticated) return;
      
      try {
        const { id, ...updateData } = data;
        const tower = await Tower.findOneAndUpdate(
          { towerId: id },
          { 
            ...updateData,
            'metadata.updatedBy': socket.userId,
            'metadata.version': { $inc: 1 }
          },
          { new: true }
        );
        
        if (!tower) {
          return socket.emit('tower:updateResponse', {
            success: false,
            message: '塔不存在'
          });
        }
        
        // 实时广播更新
        const updateEvent = {
          id: tower.towerId,
          name: tower.name,
          config: tower.config3D,
          attributes: tower.attributes,
          timestamp: Date.now()
        };
        
        adminNamespace.emit('tower:updated', updateEvent);
        io.emit('tower:updated', updateEvent);
        
        socket.emit('tower:updateResponse', {
          success: true,
          data: tower
        });
        
        logAdminAction(socket.userId, 'tower:update', id);
      } catch (error) {
        socket.emit('tower:updateResponse', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 删除塔
    socket.on('tower:delete', async (data) => {
      if (!socket.authenticated) return;
      
      try {
        const { id } = data;
        await Tower.findOneAndUpdate(
          { towerId: id },
          { isActive: false }
        );
        
        // 广播删除事件
        adminNamespace.emit('tower:deleted', { id, timestamp: Date.now() });
        io.emit('tower:deleted', { id });
        
        socket.emit('tower:deleteResponse', {
          success: true,
          message: '塔已删除'
        });
        
        logAdminAction(socket.userId, 'tower:delete', id);
      } catch (error) {
        socket.emit('tower:deleteResponse', {
          success: false,
          message: error.message
        });
      }
    });
    
    // ==================== 明信片实时同步 ====================
    
    // 获取所有明信片
    socket.on('postcard:getAll', async () => {
      if (!socket.authenticated) return;
      
      try {
        const postcards = await Postcard.getActivePostcards();
        socket.emit('postcard:list', {
          success: true,
          data: postcards,
          count: postcards.length
        });
      } catch (error) {
        socket.emit('postcard:list', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 创建明信片
    socket.on('postcard:create', async (data) => {
      if (!socket.authenticated) return;
      
      try {
        const postcard = new Postcard({
          ...data,
          'metadata.createdBy': socket.userId
        });
        await postcard.save();
        
        adminNamespace.emit('postcard:created', {
          id: postcard.postcardId,
          name: postcard.name,
          imageUrl: postcard.images?.front?.url,
          timestamp: Date.now()
        });
        
        io.emit('postcard:created', {
          id: postcard.postcardId,
          name: postcard.name,
          imageUrl: postcard.images?.front?.url
        });
        
        socket.emit('postcard:createResponse', {
          success: true,
          data: postcard
        });
        
        logAdminAction(socket.userId, 'postcard:create', postcard.postcardId);
      } catch (error) {
        socket.emit('postcard:createResponse', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 更新明信片
    socket.on('postcard:update', async (data) => {
      if (!socket.authenticated) return;
      
      try {
        const { id, ...updateData } = data;
        const postcard = await Postcard.findOneAndUpdate(
          { postcardId: id },
          { 
            ...updateData,
            'metadata.updatedBy': socket.userId
          },
          { new: true }
        );
        
        if (!postcard) {
          return socket.emit('postcard:updateResponse', {
            success: false,
            message: '明信片不存在'
          });
        }
        
        adminNamespace.emit('postcard:updated', {
          id: postcard.postcardId,
          name: postcard.name,
          data: postcard,
          timestamp: Date.now()
        });
        
        io.emit('postcard:updated', {
          id: postcard.postcardId,
          data: postcard
        });
        
        socket.emit('postcard:updateResponse', {
          success: true,
          data: postcard
        });
        
        logAdminAction(socket.userId, 'postcard:update', id);
      } catch (error) {
        socket.emit('postcard:updateResponse', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 更新祝福语录
    socket.on('postcard:updateBlessings', async (data) => {
      if (!socket.authenticated) return;
      
      try {
        const { id, language, blessings } = data;
        const postcard = await Postcard.findOne({ postcardId: id });
        
        if (!postcard) {
          return socket.emit('postcard:updateBlessingsResponse', {
            success: false,
            message: '明信片不存在'
          });
        }
        
        // 更新祝福语录
        const blessingIndex = postcard.blessings.findIndex(
          b => b.language === language
        );
        
        if (blessingIndex >= 0) {
          postcard.blessings[blessingIndex].texts = blessings;
        } else {
          postcard.blessings.push({ language, texts: blessings });
        }
        
        await postcard.save();
        
        // 广播祝福语录更新
        adminNamespace.emit('postcard:blessingUpdated', {
          id: postcard.postcardId,
          language,
          blessings,
          updatedBy: socket.userId,
          timestamp: Date.now()
        });
        
        io.emit('postcard:blessingUpdated', {
          id: postcard.postcardId,
          language,
          blessings
        });
        
        socket.emit('postcard:updateBlessingsResponse', {
          success: true,
          data: postcard
        });
        
        logAdminAction(socket.userId, 'postcard:updateBlessings', id);
      } catch (error) {
        socket.emit('postcard:updateBlessingsResponse', {
          success: false,
          message: error.message
        });
      }
    });
    
    // ==================== 头像实时同步 ====================
    
    // 获取所有头像
    socket.on('avatar:getAll', async () => {
      if (!socket.authenticated) return;
      
      try {
        const avatars = await Avatar.find({ isActive: true });
        socket.emit('avatar:list', {
          success: true,
          data: avatars,
          count: avatars.length
        });
      } catch (error) {
        socket.emit('avatar:list', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 创建头像
    socket.on('avatar:create', async (data) => {
      if (!socket.authenticated) return;
      
      try {
        const avatar = new Avatar({
          ...data,
          'metadata.createdBy': socket.userId
        });
        await avatar.save();
        
        const createEvent = {
          id: avatar.avatarId,
          name: avatar.name,
          config: avatar.config3D,
          icons: avatar.icons,
          pricing: avatar.pricing,
          timestamp: Date.now()
        };
        
        adminNamespace.emit('avatar:created', createEvent);
        io.emit('avatar:created', createEvent);
        
        socket.emit('avatar:createResponse', {
          success: true,
          data: avatar
        });
        
        logAdminAction(socket.userId, 'avatar:create', avatar.avatarId);
      } catch (error) {
        socket.emit('avatar:createResponse', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 更新头像
    socket.on('avatar:update', async (data) => {
      if (!socket.authenticated) return;
      
      try {
        const { id, ...updateData } = data;
        const avatar = await Avatar.findOneAndUpdate(
          { avatarId: id },
          { 
            ...updateData,
            'metadata.updatedBy': socket.userId
          },
          { new: true }
        );
        
        if (!avatar) {
          return socket.emit('avatar:updateResponse', {
            success: false,
            message: '头像不存在'
          });
        }
        
        adminNamespace.emit('avatar:updated', {
          id: avatar.avatarId,
          name: avatar.name,
          data: avatar,
          timestamp: Date.now()
        });
        
        io.emit('avatar:updated', {
          id: avatar.avatarId,
          data: avatar
        });
        
        socket.emit('avatar:updateResponse', {
          success: true,
          data: avatar
        });
        
        logAdminAction(socket.userId, 'avatar:update', id);
      } catch (error) {
        socket.emit('avatar:updateResponse', {
          success: false,
          message: error.message
        });
      }
    });
    
    // ==================== 特效道具实时同步 ====================
    
    // 获取所有特效
    socket.on('effect:getAll', async () => {
      if (!socket.authenticated) return;
      
      try {
        const effects = await Effect.getShopEffects();
        socket.emit('effect:list', {
          success: true,
          data: effects,
          count: effects.length
        });
      } catch (error) {
        socket.emit('effect:list', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 创建特效
    socket.on('effect:create', async (data) => {
      if (!socket.authenticated) return;
      
      try {
        const effect = new Effect({
          ...data,
          'metadata.createdBy': socket.userId
        });
        await effect.save();
        
        const createEvent = {
          id: effect.effectId,
          name: effect.name,
          type: effect.type,
          category: effect.category,
          model3D: effect.model3D,
          pricing: effect.pricing,
          timestamp: Date.now()
        };
        
        adminNamespace.emit('effect:created', createEvent);
        io.emit('effect:created', createEvent);
        
        socket.emit('effect:createResponse', {
          success: true,
          data: effect
        });
        
        logAdminAction(socket.userId, 'effect:create', effect.effectId);
      } catch (error) {
        socket.emit('effect:createResponse', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 更新特效
    socket.on('effect:update', async (data) => {
      if (!socket.authenticated) return;
      
      try {
        const { id, ...updateData } = data;
        const effect = await Effect.findOneAndUpdate(
          { effectId: id },
          { 
            ...updateData,
            'metadata.updatedBy': socket.userId
          },
          { new: true }
        );
        
        if (!effect) {
          return socket.emit('effect:updateResponse', {
            success: false,
            message: '特效不存在'
          });
        }
        
        adminNamespace.emit('effect:updated', {
          id: effect.effectId,
          name: effect.name,
          data: effect,
          timestamp: Date.now()
        });
        
        io.emit('effect:updated', {
          id: effect.effectId,
          data: effect
        });
        
        socket.emit('effect:updateResponse', {
          success: true,
          data: effect
        });
        
        logAdminAction(socket.userId, 'effect:update', id);
      } catch (error) {
        socket.emit('effect:updateResponse', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 更新特效价格
    socket.on('effect:updatePrice', async (data) => {
      if (!socket.authenticated) return;
      
      try {
        const { id, amount, currency } = data;
        const effect = await Effect.findOne({ effectId: id });
        
        if (!effect) {
          return socket.emit('effect:updatePriceResponse', {
            success: false,
            message: '特效不存在'
          });
        }
        
        const oldPrice = effect.pricing.amount;
        effect.pricing.amount = amount;
        if (currency) effect.pricing.currency = currency;
        await effect.save();
        
        // 广播价格变动
        const priceEvent = {
          id: effect.effectId,
          name: effect.name,
          oldPrice,
          newPrice: amount,
          currency: effect.pricing.currency,
          timestamp: Date.now()
        };
        
        adminNamespace.emit('effect:priceChanged', priceEvent);
        io.emit('effect:priceChanged', priceEvent);
        
        socket.emit('effect:updatePriceResponse', {
          success: true,
          data: priceEvent
        });
        
        logAdminAction(socket.userId, 'effect:updatePrice', `${id} ${oldPrice}→${amount}`);
      } catch (error) {
        socket.emit('effect:updatePriceResponse', {
          success: false,
          message: error.message
        });
      }
    });
    
    // ==================== 多语言实时同步 ====================
    
    // 更新翻译
    socket.on('translation:update', async (data) => {
      if (!socket.authenticated) return;
      
      try {
        const { locale, key, value } = data;
        
        // 广播翻译更新
        const translationEvent = {
          locale,
          key,
          value,
          updatedBy: socket.userId,
          timestamp: Date.now()
        };
        
        adminNamespace.emit('translation:updated', translationEvent);
        io.emit('translation:updated', translationEvent);
        
        socket.emit('translation:updateResponse', {
          success: true,
          data: translationEvent
        });
        
        logAdminAction(socket.userId, 'translation:update', `${locale}.${key}`);
      } catch (error) {
        socket.emit('translation:updateResponse', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 获取统计信息
    socket.on('stats:get', async () => {
      if (!socket.authenticated) return;
      
      try {
        const [towerCount, postcardCount, avatarCount, effectCount] = await Promise.all([
          Tower.countDocuments({ isActive: true }),
          Postcard.countDocuments({ isActive: true }),
          Avatar.countDocuments({ isActive: true }),
          Effect.countDocuments({ isActive: true })
        ]);
        
        socket.emit('stats:data', {
          success: true,
          data: {
            towers: towerCount,
            postcards: postcardCount,
            avatars: avatarCount,
            effects: effectCount,
            connectedAdmins: connectedAdmins.size
          }
        });
      } catch (error) {
        socket.emit('stats:data', {
          success: false,
          message: error.message
        });
      }
    });
    
    // 断开连接
    socket.on('disconnect', () => {
      console.log(`[Admin] 管理员断开连接: ${socket.id}`);
      connectedAdmins.delete(socket.id);
    });
  });
  
  return {
    // 对外暴露的广播方法
    broadcastTowerUpdate: (towerData) => {
      adminNamespace.emit('tower:updated', towerData);
      io.emit('tower:updated', towerData);
    },
    
    broadcastPostcardUpdate: (postcardData) => {
      adminNamespace.emit('postcard:updated', postcardData);
      io.emit('postcard:updated', postcardData);
    },
    
    broadcastAvatarUpdate: (avatarData) => {
      adminNamespace.emit('avatar:updated', avatarData);
      io.emit('avatar:updated', avatarData);
    },
    
    broadcastEffectUpdate: (effectData) => {
      adminNamespace.emit('effect:updated', effectData);
      io.emit('effect:updated', effectData);
    },
    
    broadcastPriceChange: (priceData) => {
      adminNamespace.emit('effect:priceChanged', priceData);
      io.emit('effect:priceChanged', priceData);
    }
  };
};

// 记录管理员操作日志
function logAdminAction(userId, action, details) {
  console.log(`[Admin Action] ${new Date().toISOString()} | User: ${userId} | Action: ${action} | Details: ${details}`);
  // 这里可以将日志写入数据库
}

// 导出事件定义供其他模块使用
module.exports.ADMIN_EVENTS = ADMIN_EVENTS;
