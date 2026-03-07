"""
Tower of Fate - 排位赛系统
匹配机制、段位保护、赛季奖励
"""
import random
import time
from enum import Enum

class RankTier(Enum):
    """段位枚举"""
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    DIAMOND = "diamond"
    MASTER = "master"

class RankedMatchSystem:
    """排位赛系统"""
    
    # 段位配置
    TIER_CONFIG = {
        RankTier.BRONZE: {'name': '青铜', 'divisions': 5, 'points_per_win': 20, 'points_per_loss': -10},
        RankTier.SILVER: {'name': '白银', 'divisions': 5, 'points_per_win': 18, 'points_per_loss': -12},
        RankTier.GOLD: {'name': '黄金', 'divisions': 5, 'points_per_win': 16, 'points_per_loss': -14},
        RankTier.PLATINUM: {'name': '铂金', 'divisions': 5, 'points_per_win': 14, 'points_per_loss': -16},
        RankTier.DIAMOND: {'name': '钻石', 'divisions': 5, 'points_per_win': 12, 'points_per_loss': -18},
        RankTier.MASTER: {'name': '王者', 'divisions': 1, 'points_per_win': 10, 'points_per_loss': -20}
    }
    
    def __init__(self):
        self.matchmaking_pool = {}  # player_id -> match_data
        self.active_matches = {}    # match_id -> match_data
        self.player_ranks = {}      # player_id -> rank_data
    
    def get_rank_display(self, player_id):
        """获取段位显示信息"""
        rank = self.player_ranks.get(player_id, {
            'tier': RankTier.BRONZE,
            'division': 5,
            'points': 0,
            'total_games': 0,
            'wins': 0
        })
        
        tier_config = self.TIER_CONFIG[rank['tier']]
        
        return {
            'tier': rank['tier'].value,
            'tier_name': tier_config['name'],
            'division': rank['division'],
            'points': rank['points'],
            'total_games': rank['total_games'],
            'wins': rank['wins'],
            'win_rate': rank['wins'] / rank['total_games'] if rank['total_games'] > 0 else 0,
            'icon': self._get_tier_icon(rank['tier']),
            'color': self._get_tier_color(rank['tier'])
        }
    
    def _get_tier_icon(self, tier):
        """获取段位图标"""
        icons = {
            RankTier.BRONZE: '🥉',
            RankTier.SILVER: '🥈',
            RankTier.GOLD: '🥇',
            RankTier.PLATINUM: '💎',
            RankTier.DIAMOND: '👑',
            RankTier.MASTER: '🏆'
        }
        return icons.get(tier, '🥉')
    
    def _get_tier_color(self, tier):
        """获取段位颜色"""
        colors = {
            RankTier.BRONZE: '#cd7f32',
            RankTier.SILVER: '#c0c0c0',
            RankTier.GOLD: '#ffd700',
            RankTier.PLATINUM: '#00ced1',
            RankTier.DIAMOND: '#b9f2ff',
            RankTier.MASTER: '#ff6b6b'
        }
        return colors.get(tier, '#cd7f32')
    
    def join_matchmaking(self, player_id, preferred_mode='solo'):
        """加入匹配队列"""
        rank = self.get_rank_display(player_id)
        
        self.matchmaking_pool[player_id] = {
            'player_id': player_id,
            'tier': rank['tier'],
            'division': rank['division'],
            'points': rank['points'],
            'join_time': time.time(),
            'mode': preferred_mode
        }
        
        print(f"[排位赛] 玩家 {player_id} 加入匹配队列 ({rank['tier_name']} {rank['division']})")
        
        # 尝试匹配
        return self._try_match(player_id)
    
    def _try_match(self, player_id):
        """尝试匹配"""
        player = self.matchmaking_pool.get(player_id)
        if not player:
            return None
        
        # 寻找合适对手
        candidates = []
        for pid, other in self.matchmaking_pool.items():
            if pid == player_id:
                continue
            
            # 检查段位差距
            if self._can_match(player, other):
                candidates.append(other)
        
        # 需要3个对手
        if len(candidates) >= 3:
            # 选择最接近的对手
            candidates.sort(key=lambda x: abs(x['points'] - player['points']))
            selected = candidates[:3]
            
            # 创建对局
            match_id = f"ranked_{int(time.time())}_{player_id}"
            match = {
                'id': match_id,
                'players': [player_id] + [p['player_id'] for p in selected],
                'mode': 'ranked',
                'start_time': time.time(),
                'status': 'playing'
            }
            
            self.active_matches[match_id] = match
            
            # 从队列移除
            for p in selected:
                self.matchmaking_pool.pop(p['player_id'], None)
            self.matchmaking_pool.pop(player_id, None)
            
            print(f"[排位赛] 对局创建: {match_id}")
            return match
        
        return None
    
    def _can_match(self, player1, player2):
        """检查是否可以匹配"""
        # 段位差距不能超过2个大段
        tier_order = list(RankTier)
        idx1 = tier_order.index(RankTier(player1['tier']))
        idx2 = tier_order.index(RankTier(player2['tier']))
        
        return abs(idx1 - idx2) <= 2
    
    def calculate_rank_change(self, player_id, rank, position, total_players):
        """计算段位变化"""
        tier_config = self.TIER_CONFIG[RankTier(rank['tier'])]
        
        # 根据排名计算积分变化
        if position == 1:
            points = tier_config['points_per_win'] + 5  # 冠军加成
        elif position == 2:
            points = tier_config['points_per_win']
        elif position == 3:
            points = tier_config['points_per_win'] // 2
        else:
            points = tier_config['points_per_loss']
        
        # 连胜加成
        if rank.get('streak', 0) >= 3:
            points += 5
        
        # 段位保护
        if rank['division'] == 5 and points < 0:
            if rank.get('protection', 0) > 0:
                rank['protection'] -= 1
                points = 0  # 触发保护，不掉分
                print(f"[排位赛] 玩家 {player_id} 触发段位保护!")
        
        return points
    
    def update_rank_after_match(self, player_id, match_result):
        """对局结束后更新段位"""
        if player_id not in self.player_ranks:
            self.player_ranks[player_id] = {
                'tier': RankTier.BRONZE,
                'division': 5,
                'points': 0,
                'total_games': 0,
                'wins': 0,
                'streak': 0,
                'protection': 3  # 初始保护次数
            }
        
        rank = self.player_ranks[player_id]
        rank['total_games'] += 1
        
        if match_result['position'] == 1:
            rank['wins'] += 1
            rank['streak'] += 1
        else:
            rank['streak'] = 0
        
        # 计算积分变化
        points_change = self.calculate_rank_change(
            player_id, rank, match_result['position'], match_result['total_players']
        )
        
        old_rank = {
            'tier': rank['tier'].value,
            'division': rank['division'],
            'points': rank['points']
        }
        
        rank['points'] += points_change
        
        # 检查晋级/降级
        promotion = self._check_rank_change(rank)
        
        return {
            'old_rank': old_rank,
            'new_rank': {
                'tier': rank['tier'].value,
                'division': rank['division'],
                'points': rank['points']
            },
            'points_change': points_change,
            'promotion': promotion
        }
    
    def _check_rank_change(self, rank):
        """检查段位变化"""
        tier_config = self.TIER_CONFIG[rank['tier']]
        tier_order = list(RankTier)
        current_idx = tier_order.index(rank['tier'])
        
        promotion = None
        
        if rank['points'] >= 100:
            # 晋级
            if rank['division'] > 1:
                rank['division'] -= 1
                rank['points'] = 0
                rank['protection'] = 3  # 新段位保护
                promotion = 'division_up'
            elif current_idx < len(tier_order) - 1:
                # 大段位晋级
                old_tier = rank['tier']
                rank['tier'] = tier_order[current_idx + 1]
                rank['division'] = 5
                rank['points'] = 0
                rank['protection'] = 3
                promotion = 'tier_up'
                print(f"[排位赛] 大段位晋级! {old_tier.value} -> {rank['tier'].value}")
        
        elif rank['points'] < 0:
            # 降级
            if rank['division'] < 5:
                rank['division'] += 1
                rank['points'] = 80
                promotion = 'division_down'
            elif current_idx > 0:
                old_tier = rank['tier']
                rank['tier'] = tier_order[current_idx - 1]
                rank['division'] = 1
                rank['points'] = 80
                promotion = 'tier_down'
                print(f"[排位赛] 大段位降级! {old_tier.value} -> {rank['tier'].value}")
        
        return promotion
    
    def get_ranked_rewards(self, tier):
        """获取排位赛奖励"""
        rewards = {
            RankTier.BRONZE: {'season_end': {'coins': 500}, 'daily': {'coins': 50}},
            RankTier.SILVER: {'season_end': {'coins': 1000, 'diamonds': 50}, 'daily': {'coins': 100}},
            RankTier.GOLD: {'season_end': {'coins': 2000, 'diamonds': 100}, 'daily': {'coins': 150}},
            RankTier.PLATINUM: {'season_end': {'coins': 5000, 'diamonds': 200}, 'daily': {'coins': 200}},
            RankTier.DIAMOND: {'season_end': {'coins': 10000, 'diamonds': 500}, 'daily': {'coins': 300, 'diamonds': 10}},
            RankTier.MASTER: {'season_end': {'coins': 20000, 'diamonds': 1000}, 'daily': {'coins': 500, 'diamonds': 20}}
        }
        return rewards.get(tier, rewards[RankTier.BRONZE])

# 全局排位赛实例
ranked_system = RankedMatchSystem()
