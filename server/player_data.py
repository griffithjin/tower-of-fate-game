# 玩家数据管理系统
import time
import json
import os

DATA_FILE = 'player_data.json'

class PlayerDataManager:
    """玩家数据管理 - 持久化存储"""
    
    def __init__(self):
        self.players = {}
        self.load_data()
    
    def load_data(self):
        """从文件加载数据"""
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, 'r') as f:
                    self.players = json.load(f)
            except:
                self.players = {}
    
    def save_data(self):
        """保存数据到文件"""
        with open(DATA_FILE, 'w') as f:
            json.dump(self.players, f)
    
    def get_player_data(self, player_id):
        """获取玩家数据"""
        if player_id not in self.players:
            self.players[player_id] = {
                'coins': 1000,  # 初始金币
                'diamonds': 0,
                'total_games': 0,
                'wins': 0,
                'daily_reward': {
                    'last_claim': 0,
                    'streak': 0,
                    'today_claimed': False
                },
                'inventory': [],  # 拥有的道具
                'equipped': {  # 当前装备
                    'card_skin': 'default',
                    'avatar_frame': None,
                    'play_effect': None
                },
                'stats': {
                    'total_score': 0,
                    'highest_level': 0,
                    'perfect_matches': 0
                }
            }
            self.save_data()
        return self.players[player_id]
    
    def claim_daily_reward(self, player_id):
        """领取每日奖励"""
        player = self.get_player_data(player_id)
        now = int(time.time())
        last_claim = player['daily_reward']['last_claim']
        
        # 检查是否已经领取过（同一天）
        if self.is_same_day(now, last_claim):
            return {
                'success': False,
                'message': '今日已领取，请明天再来！',
                'next_claim': self.get_next_day_timestamp()
            }
        
        # 检查是否断签
        if not self.is_consecutive_day(now, last_claim):
            player['daily_reward']['streak'] = 0
        
        # 计算奖励
        streak = player['daily_reward']['streak']
        rewards = [100, 150, 200, 250, 300, 400, 500]
        reward = rewards[min(streak, 6)]
        
        # 发放奖励
        player['coins'] += reward
        player['daily_reward']['streak'] += 1
        player['daily_reward']['last_claim'] = now
        player['daily_reward']['today_claimed'] = True
        
        self.save_data()
        
        return {
            'success': True,
            'reward': reward,
            'streak': player['daily_reward']['streak'],
            'total_coins': player['coins'],
            'message': f'连续登录{player["daily_reward"]["streak"]}天，获得{reward}金币！'
        }
    
    def get_daily_reward_status(self, player_id):
        """获取每日奖励状态"""
        player = self.get_player_data(player_id)
        now = int(time.time())
        last_claim = player['daily_reward']['last_claim']
        
        can_claim = not self.is_same_day(now, last_claim)
        streak = player['daily_reward']['streak']
        
        rewards = [100, 150, 200, 250, 300, 400, 500]
        next_reward = rewards[min(streak, 6)]
        
        return {
            'can_claim': can_claim,
            'streak': streak,
            'next_reward': next_reward,
            'total_coins': player['coins'],
            'total_diamonds': player['diamonds']
        }
    
    def is_same_day(self, ts1, ts2):
        """检查两个时间戳是否是同一天"""
        if ts2 == 0:
            return False
        return time.strftime('%Y-%m-%d', time.localtime(ts1)) == \
               time.strftime('%Y-%m-%d', time.localtime(ts2))
    
    def is_consecutive_day(self, now, last):
        """检查是否是连续的一天"""
        if last == 0:
            return False
        # 检查是否小于48小时
        return (now - last) < 172800
    
    def get_next_day_timestamp(self):
        """获取明天0点的时间戳"""
        now = time.localtime()
        tomorrow = time.struct_time((now.tm_year, now.tm_mon, now.tm_mday + 1, 0, 0, 0, 0, 0, 0))
        return int(time.mktime(tomorrow))
    
    def update_after_game(self, player_id, is_winner, score, level, perfect_matches):
        """游戏结束后更新数据"""
        player = self.get_player_data(player_id)
        
        player['total_games'] += 1
        if is_winner:
            player['wins'] += 1
        
        player['stats']['total_score'] += score
        player['stats']['highest_level'] = max(player['stats']['highest_level'], level)
        player['stats']['perfect_matches'] += perfect_matches
        
        # 发放游戏奖励
        reward = 50 if is_winner else 10
        player['coins'] += reward
        
        self.save_data()
        
        return {
            'coins_earned': reward,
            'total_coins': player['coins'],
            'message': f'游戏结束！获得{reward}金币！'
        }
    
    def purchase_item(self, player_id, item_id, price, currency='coins'):
        """购买道具"""
        player = self.get_player_data(player_id)
        
        if currency == 'coins':
            if player['coins'] < price:
                return {'success': False, 'message': '金币不足'}
            player['coins'] -= price
        else:
            if player['diamonds'] < price:
                return {'success': False, 'message': '钻石不足'}
            player['diamonds'] -= price
        
        if item_id not in player['inventory']:
            player['inventory'].append(item_id)
        
        self.save_data()
        
        return {
            'success': True,
            'message': '购买成功！',
            'remaining_coins': player['coins'],
            'remaining_diamonds': player['diamonds']
        }
    
    def equip_item(self, player_id, item_type, item_id):
        """装备道具"""
        player = self.get_player_data(player_id)
        
        if item_id not in player['inventory'] and item_id != 'default':
            return {'success': False, 'message': '未拥有该道具'}
        
        player['equipped'][item_type] = item_id
        self.save_data()
        
        return {'success': True, 'message': '装备成功！'}

# 全局数据管理器
player_data = PlayerDataManager()
