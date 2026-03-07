"""
Tower of Fate - 扩展商城系统
30+商品，金币和钻石双货币
"""

# 商城商品配置 (30+ items)
SHOP_ITEMS = {
    # ===== 金币商品 (15个) =====
    'coins': [
        {
            'id': 'card_wood',
            'name': '木质卡牌',
            'icon': '🪵',
            'type': 'card_skin',
            'rarity': 'common',
            'price': 1000,
            'currency': 'coins',
            'desc': '自然质朴的木质卡牌外观'
        },
        {
            'id': 'card_paper',
            'name': '纸质卡牌',
            'icon': '📄',
            'type': 'card_skin',
            'rarity': 'common',
            'price': 800,
            'currency': 'coins',
            'desc': '经典纸质卡牌风格'
        },
        {
            'id': 'card_bronze',
            'name': '青铜卡牌',
            'icon': '🥉',
            'type': 'card_skin',
            'rarity': 'rare',
            'price': 2500,
            'currency': 'coins',
            'desc': '古朴青铜质感卡牌'
        },
        {
            'id': 'card_silver',
            'name': '白银卡牌',
            'icon': '🥈',
            'type': 'card_skin',
            'rarity': 'rare',
            'price': 4000,
            'currency': 'coins',
            'desc': '闪耀白银光泽卡牌'
        },
        {
            'id': 'frame_bronze',
            'name': '青铜头像框',
            'icon': '🖼️',
            'type': 'avatar_frame',
            'rarity': 'common',
            'price': 500,
            'currency': 'coins',
            'desc': '青铜质感头像框'
        },
        {
            'id': 'frame_silver',
            'name': '白银头像框',
            'icon': '✨',
            'type': 'avatar_frame',
            'rarity': 'rare',
            'price': 1500,
            'currency': 'coins',
            'desc': '白银光泽头像框'
        },
        {
            'id': 'frame_gold',
            'name': '黄金头像框',
            'icon': '🌟',
            'type': 'avatar_frame',
            'rarity': 'epic',
            'price': 3000,
            'currency': 'coins',
            'desc': '尊贵黄金头像框'
        },
        {
            'id': 'bubble_cute',
            'name': '可爱气泡',
            'icon': '💕',
            'type': 'chat_bubble',
            'rarity': 'common',
            'price': 600,
            'currency': 'coins',
            'desc': '粉色可爱聊天气泡'
        },
        {
            'id': 'bubble_cool',
            'name': '酷炫气泡',
            'icon': '😎',
            'type': 'chat_bubble',
            'rarity': 'rare',
            'price': 1200,
            'currency': 'coins',
            'desc': '蓝色酷炫聊天气泡'
        },
        {
            'id': 'emoji_pack_basic',
            'name': '基础表情包',
            'icon': '😀',
            'type': 'emoji',
            'rarity': 'common',
            'price': 500,
            'currency': 'coins',
            'desc': '包含10个常用表情'
        },
        {
            'id': 'emoji_pack_funny',
            'name': '搞笑表情包',
            'icon': '🤣',
            'type': 'emoji',
            'rarity': 'rare',
            'price': 1000,
            'currency': 'coins',
            'desc': '包含10个搞笑表情'
        },
        {
            'id': 'effect_sparkle',
            'name': '星光特效',
            'icon': '✨',
            'type': 'effect',
            'rarity': 'rare',
            'price': 2000,
            'currency': 'coins',
            'desc': '出牌时闪烁星光特效'
        },
        {
            'id': 'table_green',
            'name': '绿绒牌桌',
            'icon': '🟢',
            'type': 'table',
            'rarity': 'common',
            'price': 1500,
            'currency': 'coins',
            'desc': '经典赌场绿绒牌桌'
        },
        {
            'id': 'table_wood',
            'name': '木质牌桌',
            'icon': '🪑',
            'type': 'table',
            'rarity': 'common',
            'price': 1200,
            'currency': 'coins',
            'desc': '自然木质牌桌风格'
        },
        {
            'id': 'bgm_classic',
            'name': '古典音乐包',
            'icon': '🎵',
            'type': 'bgm',
            'rarity': 'rare',
            'price': 2000,
            'currency': 'coins',
            'desc': '优雅古典背景音乐'
        }
    ],
    
    # ===== 钻石商品 (15个) =====
    'diamonds': [
        {
            'id': 'card_gold',
            'name': '黄金卡牌',
            'icon': '👑',
            'type': 'card_skin',
            'rarity': 'legendary',
            'price': 980,
            'currency': 'diamonds',
            'desc': '尊贵奢华黄金卡牌'
        },
        {
            'id': 'card_crystal',
            'name': '水晶卡牌',
            'icon': '💎',
            'type': 'card_skin',
            'rarity': 'epic',
            'price': 680,
            'currency': 'diamonds',
            'desc': '晶莹剔透水晶卡牌'
        },
        {
            'id': 'card_dragon',
            'name': '龙纹卡牌',
            'icon': '🐉',
            'type': 'card_skin',
            'rarity': 'legendary',
            'price': 1280,
            'currency': 'diamonds',
            'desc': '霸气龙纹黄金卡牌'
        },
        {
            'id': 'card_phoenix',
            'name': '凤凰卡牌',
            'icon': '🔥',
            'type': 'card_skin',
            'rarity': 'legendary',
            'price': 1280,
            'currency': 'diamonds',
            'desc': '浴火凤凰华丽卡牌'
        },
        {
            'id': 'frame_diamond',
            'name': '钻石头像框',
            'icon': '💎',
            'type': 'avatar_frame',
            'rarity': 'legendary',
            'price': 880,
            'currency': 'diamonds',
            'desc': '闪耀钻石头像框'
        },
        {
            'id': 'frame_crown',
            'name': '皇冠头像框',
            'icon': '👑',
            'type': 'avatar_frame',
            'rarity': 'legendary',
            'price': 1080,
            'currency': 'diamonds',
            'desc': '王者皇冠头像框'
        },
        {
            'id': 'bubble_royal',
            'name': '皇家气泡',
            'icon': '🏰',
            'type': 'chat_bubble',
            'rarity': 'epic',
            'price': 480,
            'currency': 'diamonds',
            'desc': '皇家贵族聊天气泡'
        },
        {
            'id': 'effect_fire',
            'name': '烈焰特效',
            'icon': '🔥',
            'type': 'effect',
            'rarity': 'epic',
            'price': 680,
            'currency': 'diamonds',
            'desc': '出牌时烈焰燃烧特效'
        },
        {
            'id': 'effect_ice',
            'name': '冰霜特效',
            'icon': '❄️',
            'type': 'effect',
            'rarity': 'epic',
            'price': 680,
            'currency': 'diamonds',
            'desc': '出牌时冰霜凝结特效'
        },
        {
            'id': 'effect_lightning',
            'name': '雷霆特效',
            'icon': '⚡',
            'type': 'effect',
            'rarity': 'legendary',
            'price': 980,
            'currency': 'diamonds',
            'desc': '出牌时雷霆万钧特效'
        },
        {
            'id': 'vip_7days',
            'name': 'VIP周卡',
            'icon': '💳',
            'type': 'vip',
            'rarity': 'epic',
            'price': 280,
            'currency': 'diamonds',
            'desc': '7天VIP特权体验'
        },
        {
            'id': 'vip_30days',
            'name': 'VIP月卡',
            'icon': '💎',
            'type': 'vip',
            'rarity': 'legendary',
            'price': 980,
            'currency': 'diamonds',
            'desc': '30天VIP特权(+1天命牌/开局3层)'
        },
        {
            'id': 'destiny_pack',
            'name': '天命牌包',
            'icon': '🎴',
            'type': 'pack',
            'rarity': 'epic',
            'price': 380,
            'currency': 'diamonds',
            'desc': '随机获得3张天命牌'
        },
        {
            'id': 'lottery_ticket_10',
            'name': '抽奖券×10',
            'icon': '🎰',
            'type': 'ticket',
            'rarity': 'rare',
            'price': 880,
            'currency': 'diamonds',
            'desc': '10张转盘抽奖券'
        },
        {
            'id': 'name_change',
            'name': '改名卡',
            'icon': '📝',
            'type': 'consumable',
            'rarity': 'rare',
            'price': 200,
            'currency': 'diamonds',
            'desc': '修改玩家昵称'
        }
    ]
}

# 获取所有商品
def get_all_shop_items():
    """获取所有商城商品"""
    all_items = []
    for category, items in SHOP_ITEMS.items():
        for item in items:
            all_items.append({
                **item,
                'category': category
            })
    return all_items

# 按货币类型获取商品
def get_items_by_currency(currency):
    """按货币类型获取商品"""
    return SHOP_ITEMS.get(currency, [])

# 获取商品详情
def get_item_by_id(item_id):
    """通过ID获取商品"""
    for category, items in SHOP_ITEMS.items():
        for item in items:
            if item['id'] == item_id:
                return item
    return None

# 统计信息
def get_shop_stats():
    """获取商城统计"""
    return {
        'total_items': sum(len(items) for items in SHOP_ITEMS.values()),
        'coins_items': len(SHOP_ITEMS['coins']),
        'diamonds_items': len(SHOP_ITEMS['diamonds']),
        'categories': list(SHOP_ITEMS.keys())
    }

if __name__ == '__main__':
    stats = get_shop_stats()
    print(f"商城统计: {stats}")
    print(f"\n金币商品 ({stats['coins_items']}个):")
    for item in SHOP_ITEMS['coins']:
        print(f"  - {item['name']}: {item['price']}金币")
    print(f"\n钻石商品 ({stats['diamonds_items']}个):")
    for item in SHOP_ITEMS['diamonds']:
        print(f"  - {item['name']}: {item['price']}钻石")
