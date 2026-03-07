# 道具商城系统

class ShopItem:
    """商城道具"""
    def __init__(self, item_id, name, description, price, item_type, icon, rarity='common'):
        self.item_id = item_id
        self.name = name
        self.description = description
        self.price = price  # 金币或钻石
        self.currency = 'coins'  # coins 或 diamonds
        self.item_type = item_type  # skin, effect, card_back, avatar
        self.icon = icon
        self.rarity = rarity  # common, rare, epic, legendary
        self.purchased_count = 0

class ShopManager:
    """商城管理器"""
    
    def __init__(self):
        self.items = []
        self.player_inventory = {}  # player_id -> [item_ids]
        self.init_default_items()
    
    def init_default_items(self):
        """初始化默认商品"""
        # 卡牌皮肤
        self.items.append(ShopItem(
            'skin_gold', '黄金卡牌', '尊贵黄金卡牌外观', 5000, 'skin', '🟨', 'legendary'
        ))
        self.items.append(ShopItem(
            'skin_crystal', '水晶卡牌', '晶莹剔透的水晶卡牌', 3000, 'skin', '💎', 'epic'
        ))
        self.items.append(ShopItem(
            'skin_wood', '木质卡牌', '复古木质卡牌风格', 1000, 'skin', '🟫', 'common'
        ))
        
        # 出牌特效
        self.items.append(ShopItem(
            'effect_fire', '火焰特效', '出牌时伴随火焰特效', 2000, 'effect', '🔥', 'epic'
        ))
        self.items.append(ShopItem(
            'effect_ice', '冰霜特效', '出牌时伴随冰霜特效', 2000, 'effect', '❄️', 'epic'
        ))
        self.items.append(ShopItem(
            'effect_lightning', '闪电特效', '出牌时伴随闪电特效', 3500, 'effect', '⚡', 'legendary'
        ))
        
        # 卡背
        self.items.append(ShopItem(
            'back_dragon', '龙纹卡背', '霸气龙纹卡牌背面', 2500, 'card_back', '🐉', 'epic'
        ))
        self.items.append(ShopItem(
            'back_phoenix', '凤凰卡背', '华丽凤凰卡牌背面', 2500, 'card_back', '🦅', 'epic'
        ))
        
        # 头像框
        self.items.append(ShopItem(
            'frame_king', '王者边框', '尊贵王者头像框', 5000, 'avatar', '👑', 'legendary'
        ))
        self.items.append(ShopItem(
            'frame_star', '星辰边框', '闪耀星辰头像框', 1500, 'avatar', '⭐', 'rare'
        ))
        
        # 表情包
        self.items.append(ShopItem(
            'emote_laugh', '大笑表情', '嘲讽必备大笑表情', 500, 'emote', '😂', 'common'
        ))
        self.items.append(ShopItem(
            'emote_cry', '哭泣表情', '假装可怜的哭泣表情', 500, 'emote', '😭', 'common'
        ))
        self.items.append(ShopItem(
            'emote_angry', '愤怒表情', '表达不满的愤怒表情', 500, 'emote', '😡', 'common'
        ))
    
    def get_shop_items(self, player_id):
        """获取商城商品列表（标记已购买）"""
        owned = self.player_inventory.get(player_id, [])
        result = []
        for item in self.items:
            item_dict = {
                'id': item.item_id,
                'name': item.name,
                'description': item.description,
                'price': item.price,
                'currency': item.currency,
                'type': item.item_type,
                'icon': item.icon,
                'rarity': item.rarity,
                'owned': item.item_id in owned
            }
            result.append(item_dict)
        return result
    
    def purchase_item(self, player_id, item_id, player_coins, player_diamonds):
        """购买商品"""
        item = next((i for i in self.items if i.item_id == item_id), None)
        if not item:
            return {'success': False, 'message': '商品不存在'}
        
        owned = self.player_inventory.get(player_id, [])
        if item_id in owned:
            return {'success': False, 'message': '已拥有该商品'}
        
        # 检查货币
        if item.currency == 'coins':
            if player_coins < item.price:
                return {'success': False, 'message': '金币不足'}
        else:
            if player_diamonds < item.price:
                return {'success': False, 'message': '钻石不足'}
        
        # 添加到库存
        if player_id not in self.player_inventory:
            self.player_inventory[player_id] = []
        self.player_inventory[player_id].append(item_id)
        item.purchased_count += 1
        
        return {
            'success': True,
            'message': f'成功购买 {item.name}！',
            'item': {
                'id': item.item_id,
                'name': item.name,
                'icon': item.icon
            }
        }
    
    def get_player_inventory(self, player_id):
        """获取玩家库存"""
        owned_ids = self.player_inventory.get(player_id, [])
        owned_items = [i for i in self.items if i.item_id in owned_ids]
        return [{
            'id': i.item_id,
            'name': i.name,
            'type': i.item_type,
            'icon': i.icon,
            'rarity': i.rarity
        } for i in owned_items]

# 全局商城实例
shop_manager = ShopManager()
