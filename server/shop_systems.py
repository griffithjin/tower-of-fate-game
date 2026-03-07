"""
Tower of Fate - 抽奖系统 + 排行榜 + 皮肤系统
商业化功能：转盘抽奖、排行榜、皮肤商店
"""
import random
import time
from typing import Dict, List

class LotterySystem:
    """抽奖系统"""
    
    # 奖品配置
    PRIZES = [
        {'id': 'coins_small', 'name': '100金币', 'type': 'coins', 'value': 100, 'weight': 40},
        {'id': 'coins_medium', 'name': '500金币', 'type': 'coins', 'value': 500, 'weight': 25},
        {'id': 'coins_large', 'name': '2000金币', 'type': 'coins', 'value': 2000, 'weight': 10},
        {'id': 'diamonds_small', 'name': '10钻石', 'type': 'diamonds', 'value': 10, 'weight': 15},
        {'id': 'diamonds_medium', 'name': '50钻石', 'type': 'diamonds', 'value': 50, 'weight': 5},
        {'id': 'skin_random', 'name': '随机皮肤', 'type': 'skin', 'value': 1, 'weight': 3},
        {'id': 'destiny_pack', 'name': '天命牌包', 'type': 'destiny', 'value': 3, 'weight': 2}
    ]
    
    # 宝箱配置
    CHESTS = {
        'bronze': {'name': '青铜宝箱', 'cost': 100, 'rewards': [
            {'item': 'coins', 'min': 50, 'max': 200, 'weight': 70},
            {'item': 'destiny_card', 'weight': 25},
            {'item': 'skin_common', 'weight': 5}
        ]},
        'silver': {'name': '白银宝箱', 'cost': 500, 'rewards': [
            {'item': 'coins', 'min': 300, 'max': 800, 'weight': 60},
            {'item': 'diamonds', 'min': 10, 'max': 30, 'weight': 25},
            {'item': 'skin_rare', 'weight': 15}
        ]},
        'gold': {'name': '黄金宝箱', 'cost': 2000, 'rewards': [
            {'item': 'coins', 'min': 1500, 'max': 3000, 'weight': 50},
            {'item': 'diamonds', 'min': 50, 'max': 150, 'weight': 30},
            {'item': 'skin_epic', 'weight': 20}
        ]},
        'diamond': {'name': '钻石宝箱', 'cost': 10000, 'rewards': [
            {'item': 'diamonds', 'min': 200, 'max': 500, 'weight': 50},
            {'item': 'skin_legendary', 'weight': 30},
            {'item': 'vip_pass', 'weight': 20}
        ]}
    }
    
    def __init__(self):
        self.player_lottery_history = {}
    
    def spin_wheel(self, player_id: str, cost_coins: int = 100) -> Dict:
        """转盘抽奖"""
        # 使用加权随机选择
        weights = [p['weight'] for p in self.PRIZES]
        prize = random.choices(self.PRIZES, weights=weights, k=1)[0]
        
        result = {
            'success': True,
            'prize': prize,
            'cost': cost_coins,
            'timestamp': int(time.time())
        }
        
        # 记录历史
        if player_id not in self.player_lottery_history:
            self.player_lottery_history[player_id] = []
        self.player_lottery_history[player_id].append(result)
        
        print(f"[抽奖系统] 玩家 {player_id} 抽到: {prize['name']}")
        return result
    
    def open_chest(self, player_id: str, chest_type: str) -> Dict:
        """开启宝箱"""
        if chest_type not in self.CHESTS:
            return {'success': False, 'error': '宝箱类型不存在'}
        
        chest = self.CHESTS[chest_type]
        
        # 使用加权随机选择奖励
        rewards_config = chest['rewards']
        weights = [r['weight'] for r in rewards_config]
        reward_config = random.choices(rewards_config, weights=weights, k=1)[0]
        
        # 生成具体奖励
        if reward_config['item'] == 'coins':
            amount = random.randint(reward_config['min'], reward_config['max'])
            reward = {'type': 'coins', 'amount': amount}
        elif reward_config['item'] == 'diamonds':
            amount = random.randint(reward_config['min'], reward_config['max'])
            reward = {'type': 'diamonds', 'amount': amount}
        elif reward_config['item'] == 'destiny_card':
            cards = ['全军突击', '换牌', '看牌', '带人', '踢人']
            reward = {'type': 'destiny_card', 'card': random.choice(cards)}
        elif reward_config['item'].startswith('skin_'):
            rarity = reward_config['item'].replace('skin_', '')
            reward = {'type': 'skin', 'rarity': rarity}
        elif reward_config['item'] == 'vip_pass':
            reward = {'type': 'vip_pass', 'days': 7}
        else:
            reward = {'type': 'coins', 'amount': 100}
        
        print(f"[抽奖系统] 玩家 {player_id} 开启 {chest['name']} 获得: {reward}")
        return {
            'success': True,
            'chest': chest_type,
            'cost': chest['cost'],
            'reward': reward
        }
    
    def get_lucky_draw_history(self, player_id: str, limit: int = 10) -> List[Dict]:
        """获取抽奖历史"""
        history = self.player_lottery_history.get(player_id, [])
        return history[-limit:]


class LeaderboardSystem:
    """排行榜系统"""
    
    def __init__(self):
        self.rankings = {
            'global': {},      # player_id -> score
            'friends': {},     # player_id -> {friend_id: score}
            'season': {}       # player_id -> season_score
        }
    
    def update_score(self, player_id: str, score_type: str, score: int):
        """更新分数"""
        if score_type == 'global':
            current = self.rankings['global'].get(player_id, 0)
            self.rankings['global'][player_id] = max(current, score)
        elif score_type == 'season':
            current = self.rankings['season'].get(player_id, 0)
            self.rankings['season'][player_id] = current + score
    
    def get_leaderboard(self, board_type: str, limit: int = 100) -> List[Dict]:
        """获取排行榜"""
        if board_type not in self.rankings:
            return []
        
        board = self.rankings[board_type]
        
        # 排序
        sorted_players = sorted(board.items(), key=lambda x: -x[1])
        
        result = []
        for rank, (player_id, score) in enumerate(sorted_players[:limit], 1):
            result.append({
                'rank': rank,
                'player_id': player_id,
                'score': score
            })
        
        return result
    
    def get_player_rank(self, player_id: str, board_type: str) -> Dict:
        """获取玩家排名"""
        if board_type not in self.rankings:
            return {'rank': -1, 'score': 0}
        
        board = self.rankings[board_type]
        
        if player_id not in board:
            return {'rank': -1, 'score': 0}
        
        # 计算排名
        score = board[player_id]
        rank = sum(1 for s in board.values() if s > score) + 1
        
        return {'rank': rank, 'score': score}
    
    def reset_season_leaderboard(self):
        """重置赛季排行榜"""
        self.rankings['season'] = {}
        print("[排行榜] 赛季排行榜已重置")


class SkinSystem:
    """皮肤系统"""
    
    # 皮肤配置
    SKINS = {
        # 卡牌皮肤
        'card_classic': {'name': '经典卡牌', 'type': 'card', 'rarity': 'common', 'price': 0},
        'card_gold': {'name': '黄金卡牌', 'type': 'card', 'rarity': 'legendary', 'price': 5000},
        'card_crystal': {'name': '水晶卡牌', 'type': 'card', 'rarity': 'epic', 'price': 3000},
        'card_wood': {'name': '木质卡牌', 'type': 'card', 'rarity': 'common', 'price': 1000},
        'card_fire': {'name': '火焰卡牌', 'type': 'card', 'rarity': 'epic', 'price': 3500},
        
        # 头像框
        'frame_bronze': {'name': '青铜边框', 'type': 'frame', 'rarity': 'common', 'price': 500},
        'frame_silver': {'name': '白银边框', 'type': 'frame', 'rarity': 'rare', 'price': 1500},
        'frame_gold': {'name': '黄金边框', 'type': 'frame', 'rarity': 'epic', 'price': 3000},
        'frame_diamond': {'name': '钻石边框', 'type': 'frame', 'rarity': 'legendary', 'price': 5000},
        'frame_king': {'name': '王者边框', 'type': 'frame', 'rarity': 'legendary', 'price': 5000},
        
        # 聊天气泡
        'bubble_default': {'name': '默认气泡', 'type': 'bubble', 'rarity': 'common', 'price': 0},
        'bubble_cute': {'name': '可爱气泡', 'type': 'bubble', 'rarity': 'rare', 'price': 800},
        'bubble_cool': {'name': '酷炫气泡', 'type': 'bubble', 'rarity': 'epic', 'price': 1500},
        
        # 特效
        'effect_fire': {'name': '火焰特效', 'type': 'effect', 'rarity': 'epic', 'price': 2000},
        'effect_ice': {'name': '冰霜特效', 'type': 'effect', 'rarity': 'epic', 'price': 2000},
        'effect_lightning': {'name': '闪电特效', 'type': 'effect', 'rarity': 'legendary', 'price': 3500},
        'effect_rainbow': {'name': '彩虹特效', 'type': 'effect', 'rarity': 'legendary', 'price': 5000}
    }
    
    RARITY_COLORS = {
        'common': '#888',
        'rare': '#0f0',
        'epic': '#f0f',
        'legendary': '#ffd700'
    }
    
    def __init__(self):
        self.player_skins = {}  # player_id -> {owned_skins, equipped}
    
    def get_shop_skins(self) -> List[Dict]:
        """获取商店皮肤列表"""
        skins = []
        for skin_id, skin in self.SKINS.items():
            if skin['price'] > 0:  # 只显示付费皮肤
                skins.append({
                    'id': skin_id,
                    **skin,
                    'color': self.RARITY_COLORS[skin['rarity']]
                })
        
        # 按稀有度排序
        rarity_order = {'legendary': 0, 'epic': 1, 'rare': 2, 'common': 3}
        skins.sort(key=lambda x: rarity_order[x['rarity']])
        
        return skins
    
    def get_player_skins(self, player_id: str) -> Dict:
        """获取玩家皮肤"""
        if player_id not in self.player_skins:
            self.player_skins[player_id] = {
                'owned': ['card_classic', 'frame_bronze', 'bubble_default'],
                'equipped': {
                    'card': 'card_classic',
                    'frame': 'frame_bronze',
                    'bubble': 'bubble_default',
                    'effect': None
                }
            }
        
        return self.player_skins[player_id]
    
    def buy_skin(self, player_id: str, skin_id: str, player_coins: int) -> Dict:
        """购买皮肤"""
        if skin_id not in self.SKINS:
            return {'success': False, 'error': '皮肤不存在'}
        
        skin = self.SKINS[skin_id]
        
        if player_coins < skin['price']:
            return {'success': False, 'error': '金币不足'}
        
        # 添加到已拥有
        player_data = self.get_player_skins(player_id)
        if skin_id in player_data['owned']:
            return {'success': False, 'error': '已拥有该皮肤'}
        
        player_data['owned'].append(skin_id)
        
        print(f"[皮肤系统] 玩家 {player_id} 购买皮肤: {skin['name']}")
        return {
            'success': True,
            'skin': skin,
            'cost': skin['price']
        }
    
    def equip_skin(self, player_id: str, skin_id: str) -> Dict:
        """装备皮肤"""
        if skin_id not in self.SKINS:
            return {'success': False, 'error': '皮肤不存在'}
        
        player_data = self.get_player_skins(player_id)
        
        if skin_id not in player_data['owned']:
            return {'success': False, 'error': '未拥有该皮肤'}
        
        skin = self.SKINS[skin_id]
        player_data['equipped'][skin['type']] = skin_id
        
        return {'success': True, 'equipped': skin_id}
    
    def get_equipped_skins(self, player_id: str) -> Dict:
        """获取当前装备的皮肤"""
        player_data = self.get_player_skins(player_id)
        equipped = player_data['equipped']
        
        result = {}
        for slot, skin_id in equipped.items():
            if skin_id and skin_id in self.SKINS:
                result[slot] = self.SKINS[skin_id]
        
        return result


class EventSystem:
    """限时活动系统"""
    
    def __init__(self):
        self.active_events = {}
        self.event_history = {}
    
    def create_event(self, event_id: str, event_data: Dict):
        """创建活动"""
        self.active_events[event_id] = {
            'id': event_id,
            'name': event_data.get('name', '活动'),
            'type': event_data.get('type', 'normal'),  # double_coins, discount, special
            'start_time': event_data.get('start_time', int(time.time())),
            'end_time': event_data.get('end_time', int(time.time()) + 86400),
            'description': event_data.get('description', ''),
            'rewards': event_data.get('rewards', {}),
            'status': 'active'
        }
        
        print(f"[活动系统] 活动创建: {event_data.get('name')}")
    
    def get_active_events(self) -> List[Dict]:
        """获取进行中的活动"""
        now = int(time.time())
        active = []
        
        for event_id, event in self.active_events.items():
            if event['start_time'] <= now <= event['end_time'] and event['status'] == 'active':
                # 计算剩余时间
                remaining = event['end_time'] - now
                hours = remaining // 3600
                minutes = (remaining % 3600) // 60
                
                active.append({
                    **event,
                    'time_left': f'{hours}小时{minutes}分'
                })
        
        return active
    
    def get_event_bonus(self, player_id: str, event_type: str) -> Dict:
        """获取活动加成"""
        bonuses = {
            'coins_multiplier': 1.0,
            'exp_multiplier': 1.0,
            'discount': 0
        }
        
        for event in self.active_events.values():
            if event['type'] == event_type and event['status'] == 'active':
                if event_type == 'double_coins':
                    bonuses['coins_multiplier'] = 2.0
                elif event_type == 'discount':
                    bonuses['discount'] = event.get('discount_percent', 0)
        
        return bonuses
    
    def end_event(self, event_id: str):
        """结束活动"""
        if event_id in self.active_events:
            self.active_events[event_id]['status'] = 'ended'
            print(f"[活动系统] 活动结束: {event_id}")


# 全局实例
lottery_system = LotterySystem()
leaderboard_system = LeaderboardSystem()
skin_system = SkinSystem()
event_system = EventSystem()
