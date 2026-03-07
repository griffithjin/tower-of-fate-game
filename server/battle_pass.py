"""
Tower of Fate - 战令/通行证系统
赛季通行证，免费+付费双轨奖励
"""
import time
from typing import Dict, List, Optional
from dataclasses import dataclass, field

@dataclass
class BattlePassReward:
    level: int
    free_reward: Dict  # 免费奖励
    premium_reward: Dict  # 付费奖励
    special_effect: Optional[str] = None  # 特殊效果（如特效、称号）

class BattlePassSystem:
    """战令系统"""
    
    # 赛季配置
    SEASON_DURATION = 30  # 天
    MAX_LEVEL = 50  # 最高等级
    
    # 奖励配置
    REWARDS = {
        1: {'free': {'coins': 100}, 'premium': {'diamonds': 50, 'skin': 'bp_frame_1'}},
        5: {'free': {'coins': 200}, 'premium': {'diamonds': 100, 'destiny_cards': 1}},
        10: {'free': {'coins': 300}, 'premium': {'diamonds': 150, 'skin': 'bp_card_back'}},
        15: {'free': {'coins': 400}, 'premium': {'diamonds': 200, 'title': '战令先锋'}},
        20: {'free': {'coins': 500}, 'premium': {'diamonds': 250, 'effect': 'levelup_gold'}},
        25: {'free': {'coins': 600}, 'premium': {'diamonds': 300, 'avatar': 'bp_avatar'}},
        30: {'free': {'coins': 700}, 'premium': {'diamonds': 350, 'skin': 'bp_guard_skin'}},
        35: {'free': {'coins': 800}, 'premium': {'diamonds': 400, 'title': '战令精英'}},
        40: {'free': {'coins': 900}, 'premium': {'diamonds': 450, 'effect': 'win_special'}},
        45: {'free': {'coins': 1000}, 'premium': {'diamonds': 500, 'skin': 'bp_exclusive'}},
        50: {'free': {'coins': 2000, 'title': '战令达人'}, 
             'premium': {'diamonds': 1000, 'skin': 'bp_legendary', 'effect': 'perfect_special'}},
    }
    
    # 升级所需经验
    XP_PER_LEVEL = 1000
    
    def __init__(self):
        self.player_bp: Dict[str, Dict] = {}  # player_id -> bp_data
        self.season_start = int(time.time())
        
    def get_bp_status(self, player_id: str) -> Dict:
        """获取玩家战令状态"""
        if player_id not in self.player_bp:
            self.player_bp[player_id] = {
                'level': 1,
                'xp': 0,
                'is_premium': False,
                'claimed_rewards': [],  # 已领取的奖励等级
                'purchase_time': None
            }
        
        bp = self.player_bp[player_id]
        
        # 计算赛季剩余时间
        season_end = self.season_start + self.SEASON_DURATION * 86400
        remaining_days = max(0, (season_end - int(time.time())) // 86400)
        
        return {
            'level': bp['level'],
            'xp': bp['xp'],
            'xp_to_next': self.XP_PER_LEVEL - (bp['xp'] % self.XP_PER_LEVEL),
            'is_premium': bp['is_premium'],
            'claimed_rewards': bp['claimed_rewards'],
            'season_remaining_days': remaining_days,
            'max_level': self.MAX_LEVEL,
            'can_claim': self._get_claimable_rewards(player_id)
        }
    
    def _get_claimable_rewards(self, player_id: str) -> List[int]:
        """获取可领取的奖励等级"""
        if player_id not in self.player_bp:
            return []
        
        bp = self.player_bp[player_id]
        claimable = []
        
        for level in range(1, bp['level'] + 1):
            if level not in bp['claimed_rewards']:
                claimable.append(level)
        
        return claimable
    
    def purchase_premium(self, player_id: str) -> Dict:
        """购买付费战令"""
        if player_id not in self.player_bp:
            self.get_bp_status(player_id)  # 初始化
        
        bp = self.player_bp[player_id]
        
        if bp['is_premium']:
            return {'success': False, 'error': '已购买付费战令'}
        
        bp['is_premium'] = True
        bp['purchase_time'] = int(time.time())
        
        return {
            'success': True,
            'message': '成功购买付费战令！',
            'price': 680,  # 钻石价格
            'refund_xp': True  # 追溯之前等级的付费奖励
        }
    
    def add_xp(self, player_id: str, xp: int, reason: str = '') -> Dict:
        """增加战令经验"""
        if player_id not in self.player_bp:
            self.get_bp_status(player_id)
        
        bp = self.player_bp[player_id]
        
        old_level = bp['level']
        bp['xp'] += xp
        
        # 计算新等级
        new_level = min(self.MAX_LEVEL, 1 + bp['xp'] // self.XP_PER_LEVEL)
        
        level_up = False
        if new_level > old_level:
            bp['level'] = new_level
            level_up = True
        
        return {
            'success': True,
            'xp_added': xp,
            'reason': reason,
            'old_level': old_level,
            'new_level': new_level,
            'level_up': level_up,
            'total_xp': bp['xp']
        }
    
    def claim_reward(self, player_id: str, level: int) -> Dict:
        """领取奖励"""
        if player_id not in self.player_bp:
            return {'success': False, 'error': '战令未激活'}
        
        bp = self.player_bp[player_id]
        
        if level > bp['level']:
            return {'success': False, 'error': '等级不足'}
        
        if level in bp['claimed_rewards']:
            return {'success': False, 'error': '已领取该奖励'}
        
        bp['claimed_rewards'].append(level)
        
        # 获取奖励内容
        reward_config = self.REWARDS.get(level, {
            'free': {'coins': 100 + level * 10},
            'premium': {'diamonds': 10 + level * 5}
        })
        
        rewards = {
            'free': reward_config['free']
        }
        
        if bp['is_premium']:
            rewards['premium'] = reward_config['premium']
        
        return {
            'success': True,
            'level': level,
            'rewards': rewards
        }
    
    def claim_all_rewards(self, player_id: str) -> Dict:
        """一键领取所有可领取奖励"""
        claimable = self._get_claimable_rewards(player_id)
        
        if not claimable:
            return {'success': False, 'error': '没有可领取的奖励'}
        
        results = []
        for level in claimable:
            result = self.claim_reward(player_id, level)
            if result['success']:
                results.append(level)
        
        return {
            'success': True,
            'claimed_levels': results,
            'count': len(results)
        }
    
    def get_all_rewards_preview(self) -> List[Dict]:
        """获取所有奖励预览"""
        preview = []
        
        for level in range(1, self.MAX_LEVEL + 1):
            config = self.REWARDS.get(level, {
                'free': {'coins': 100 + level * 10},
                'premium': {'diamonds': 10 + level * 5}
            })
            
            preview.append({
                'level': level,
                'free_reward': config['free'],
                'premium_reward': config['premium']
            })
        
        return preview
    
    # ========== 经验获取途径 ==========
    
    def on_game_complete(self, player_id: str, is_winner: bool, game_mode: str = 'classic'):
        """游戏完成时增加经验"""
        base_xp = 100
        
        # 胜利加成
        if is_winner:
            base_xp += 50
        
        # 模式加成
        mode_bonus = {
            'classic': 1.0,
            'ranked': 1.2,
            'adventure': 1.0,
            'roguelike': 1.5,
            'brawl': 1.3
        }
        
        bonus = mode_bonus.get(game_mode, 1.0)
        total_xp = int(base_xp * bonus)
        
        return self.add_xp(player_id, total_xp, f'{game_mode}_game_complete')
    
    def on_task_complete(self, player_id: str, task_type: str):
        """完成任务时增加经验"""
        xp_map = {
            'daily': 50,
            'weekly': 150,
            'achievement': 200
        }
        
        xp = xp_map.get(task_type, 30)
        return self.add_xp(player_id, xp, f'{task_type}_task_complete')
    
    def on_login(self, player_id: str):
        """每日登录增加经验"""
        return self.add_xp(player_id, 20, 'daily_login')

# 全局实例
battle_pass_system = BattlePassSystem()
