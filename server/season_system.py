"""
Tower of Fate - 赛季系统
管理赛季周期、段位、奖励
"""
import json
import time
from datetime import datetime, timedelta

class SeasonSystem:
    """赛季管理器"""
    
    def __init__(self):
        self.current_season = None
        self.seasons = {}
        self.player_ranks = {}  # player_id -> rank_data
        self.load_season_data()
    
    def load_season_data(self):
        """加载赛季数据"""
        try:
            with open('data/seasons.json', 'r') as f:
                data = json.load(f)
                self.seasons = data.get('seasons', {})
                self.current_season = data.get('current_season')
        except FileNotFoundError:
            self.create_new_season()
    
    def save_season_data(self):
        """保存赛季数据"""
        with open('data/seasons.json', 'w') as f:
            json.dump({
                'seasons': self.seasons,
                'current_season': self.current_season
            }, f, indent=2)
    
    def create_new_season(self):
        """创建新赛季"""
        season_id = f"season_{datetime.now().strftime('%Y%m')}"
        start_time = int(time.time())
        end_time = start_time + 30 * 24 * 3600  # 30天
        
        self.current_season = {
            'id': season_id,
            'name': f'第{len(self.seasons) + 1}赛季',
            'start_time': start_time,
            'end_time': end_time,
            'status': 'active'
        }
        
        self.seasons[season_id] = self.current_season
        self.save_season_data()
        
        print(f"[赛季系统] 新赛季创建: {season_id}")
        return self.current_season
    
    def get_season_info(self, player_id):
        """获取玩家赛季信息"""
        rank_data = self.player_ranks.get(player_id, {
            'tier': 'bronze',  # bronze, silver, gold, platinum, diamond, master
            'division': 5,  # 5-1
            'points': 0,
            'wins': 0,
            'losses': 0,
            'streak': 0
        })
        
        return {
            'season': self.current_season,
            'rank': rank_data,
            'tiers': self.TIER_NAMES,
            'rewards': self.get_season_rewards(rank_data['tier'])
        }
    
    TIER_NAMES = {
        'bronze': {'name': '青铜', 'color': '#cd7f32'},
        'silver': {'name': '白银', 'color': '#c0c0c0'},
        'gold': {'name': '黄金', 'color': '#ffd700'},
        'platinum': {'name': '铂金', 'color': '#00ced1'},
        'diamond': {'name': '钻石', 'color': '#b9f2ff'},
        'master': {'name': '王者', 'color': '#ff6b6b'}
    }
    
    def update_rank(self, player_id, is_winner):
        """更新段位"""
        if player_id not in self.player_ranks:
            self.player_ranks[player_id] = {
                'tier': 'bronze',
                'division': 5,
                'points': 0,
                'wins': 0,
                'losses': 0,
                'streak': 0
            }
        
        rank = self.player_ranks[player_id]
        
        # 计算积分变化
        if is_winner:
            base_points = 20
            streak_bonus = min(rank['streak'] * 2, 10)  # 连胜奖励
            points_change = base_points + streak_bonus
            rank['wins'] += 1
            rank['streak'] += 1
        else:
            points_change = -15
            rank['losses'] += 1
            rank['streak'] = 0
        
        rank['points'] += points_change
        
        # 检查晋级/降级
        self._check_promotion(player_id)
        
        return {
            'old_rank': rank.copy(),
            'points_change': points_change,
            'new_rank': rank,
            'is_promotion': rank['points'] >= 100 and rank['division'] > 1
        }
    
    def _check_promotion(self, player_id):
        """检查晋级"""
        rank = self.player_ranks[player_id]
        tier_order = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master']
        
        if rank['points'] >= 100:
            if rank['division'] > 1:
                rank['division'] -= 1
                rank['points'] = 0
            else:
                # 晋级到下一个大段位
                current_index = tier_order.index(rank['tier'])
                if current_index < len(tier_order) - 1:
                    rank['tier'] = tier_order[current_index + 1]
                    rank['division'] = 5
                    rank['points'] = 0
                    print(f"[赛季系统] 玩家 {player_id} 晋级到 {rank['tier']}!")
        
        elif rank['points'] < 0:
            if rank['division'] < 5:
                rank['division'] += 1
                rank['points'] = 80
            else:
                # 降级
                current_index = tier_order.index(rank['tier'])
                if current_index > 0:
                    rank['tier'] = tier_order[current_index - 1]
                    rank['division'] = 1
                    rank['points'] = 80
    
    def get_season_rewards(self, tier):
        """获取赛季奖励"""
        rewards = {
            'bronze': {'coins': 500, 'diamonds': 0, 'skin': None},
            'silver': {'coins': 1000, 'diamonds': 50, 'skin': 'silver_frame'},
            'gold': {'coins': 2000, 'diamonds': 100, 'skin': 'gold_frame'},
            'platinum': {'coins': 5000, 'diamonds': 200, 'skin': 'platinum_frame'},
            'diamond': {'coins': 10000, 'diamonds': 500, 'skin': 'diamond_frame'},
            'master': {'coins': 20000, 'diamonds': 1000, 'skin': 'master_frame'}
        }
        return rewards.get(tier, rewards['bronze'])
    
    def end_season(self):
        """结束当前赛季，发放奖励"""
        if not self.current_season:
            return
        
        print(f"[赛季系统] 赛季 {self.current_season['id']} 结束")
        
        # 发放奖励
        for player_id, rank in self.player_ranks.items():
            rewards = self.get_season_rewards(rank['tier'])
            print(f"[赛季系统] 玩家 {player_id} 获得奖励: {rewards}")
        
        # 重置段位
        self.player_ranks = {}
        
        # 创建新赛季
        self.create_new_season()
    
    def get_leaderboard(self, tier=None, limit=100):
        """获取排行榜"""
        players = []
        for player_id, rank in self.player_ranks.items():
            if tier and rank['tier'] != tier:
                continue
            
            # 计算天梯点数
            tier_order = ['bronze', 'silver', 'gold', 'platinum', 'diamond', 'master']
            tier_points = tier_order.index(rank['tier']) * 500
            division_points = (5 - rank['division']) * 100
            total_points = tier_points + division_points + rank['points']
            
            players.append({
                'player_id': player_id,
                'tier': rank['tier'],
                'division': rank['division'],
                'points': rank['points'],
                'total_points': total_points,
                'wins': rank['wins'],
                'win_rate': rank['wins'] / (rank['wins'] + rank['losses']) if (rank['wins'] + rank['losses']) > 0 else 0
            })
        
        # 排序
        players.sort(key=lambda x: (-x['total_points'], -x['win_rate']))
        return players[:limit]

# 全局赛季实例
season_system = SeasonSystem()
