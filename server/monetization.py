#!/usr/bin/env python3
"""
Tower of Fate - 盈利系统
包含：每日奖励、成就、排行榜、赛季通行证
"""

import json
import time
from datetime import datetime, timedelta
from typing import Dict, List

class MonetizationSystem:
    """盈利系统"""
    
    def __init__(self):
        self.player_data = {}
        self.leaderboard = []
        self.season_end = datetime.now() + timedelta(days=30)
        
    # ========== 每日奖励系统 ==========
    
    def get_daily_reward_status(self, player_id: str) -> dict:
        """获取每日奖励状态"""
        data = self.player_data.get(player_id, {})
        last_claim = data.get('last_daily_claim', 0)
        streak = data.get('daily_streak', 0)
        
        now = int(time.time())
        can_claim = now - last_claim > 86400  # 24小时
        
        # 连续登录奖励递增
        rewards = [100, 150, 200, 250, 300, 400, 500]
        today_reward = rewards[min(streak, 6)]
        
        return {
            'can_claim': can_claim,
            'streak': streak,
            'today_reward': today_reward,
            'next_reward': rewards[min(streak + 1, 6)] if can_claim else today_reward
        }
    
    def claim_daily_reward(self, player_id: str) -> dict:
        """领取每日奖励"""
        status = self.get_daily_reward_status(player_id)
        if not status['can_claim']:
            return {'success': False, 'message': '今日已领取'}
        
        if player_id not in self.player_data:
            self.player_data[player_id] = {}
        
        data = self.player_data[player_id]
        last_claim = data.get('last_daily_claim', 0)
        streak = data.get('daily_streak', 0)
        
        now = int(time.time())
        
        # 检查是否断签
        if now - last_claim > 172800:  # 超过48小时
            streak = 0
        else:
            streak = min(streak + 1, 7)
        
        data['last_daily_claim'] = now
        data['daily_streak'] = streak
        
        rewards = [100, 150, 200, 250, 300, 400, 500]
        reward = rewards[min(streak - 1, 6)]
        
        return {
            'success': True,
            'reward': reward,
            'streak': streak,
            'message': f'连续登录{streak}天！获得{reward}金币！'
        }
    
    # ========== 成就系统 ==========
    
    ACHIEVEMENTS = {
        'first_win': {'name': '初露锋芒', 'desc': '获得第1场胜利', 'reward': 500},
        'win_streak_3': {'name': '三连胜', 'desc': '连续赢得3场比赛', 'reward': 1000},
        'win_streak_5': {'name': '势不可挡', 'desc': '连续赢得5场比赛', 'reward': 2000},
        'perfect_master': {'name': '天命之子', 'desc': '累计获得10次完美匹配', 'reward': 3000},
        'tower_climber': {'name': '攀登者', 'desc': '累计上升100层', 'reward': 2000},
        'rich_man': {'name': '富豪', 'desc': '累计获得10000金币', 'reward': 5000},
        'first_blood': {'name': '首战告捷', 'desc': '完成第1场比赛', 'reward': 200},
        'veteran': {'name': '老兵', 'desc': '完成100场比赛', 'reward': 5000},
        'share_master': {'name': '传播者', 'desc': '邀请3位好友', 'reward': 1000},
        'daily_player': {'name': '忠实玩家', 'desc': '连续7天登录', 'reward': 2000}
    }
    
    def check_achievement(self, player_id: str, event: str, count: int = 1) -> List[dict]:
        """检查成就"""
        if player_id not in self.player_data:
            self.player_data[player_id] = {}
        
        data = self.player_data[player_id]
        unlocked = data.get('achievements', [])
        new_unlocks = []
        
        stats = data.get('stats', {})
        stats[event] = stats.get(event, 0) + count
        data['stats'] = stats
        
        # 检查成就
        for key, ach in self.ACHIEVEMENTS.items():
            if key in unlocked:
                continue
            
            unlocked_this = False
            if event == key:
                unlocked_this = True
            elif key == 'win_streak_3' and stats.get('win_streak', 0) >= 3:
                unlocked_this = True
            elif key == 'win_streak_5' and stats.get('win_streak', 0) >= 5:
                unlocked_this = True
            elif key == 'perfect_master' and stats.get('perfect_match', 0) >= 10:
                unlocked_this = True
            elif key == 'tower_climber' and stats.get('total_levels', 0) >= 100:
                unlocked_this = True
            elif key == 'rich_man' and stats.get('total_coins', 0) >= 10000:
                unlocked_this = True
            elif key == 'veteran' and stats.get('games_played', 0) >= 100:
                unlocked_this = True
            elif key == 'daily_player' and data.get('daily_streak', 0) >= 7:
                unlocked_this = True
            
            if unlocked_this:
                unlocked.append(key)
                new_unlocks.append({
                    'key': key,
                    'name': ach['name'],
                    'reward': ach['reward'],
                    'message': f"🏆 解锁成就: {ach['name']}！奖励{ach['reward']}金币！"
                })
        
        data['achievements'] = unlocked
        return new_unlocks
    
    def get_achievements(self, player_id: str) -> dict:
        """获取成就列表"""
        data = self.player_data.get(player_id, {})
        unlocked = data.get('achievements', [])
        
        all_achievements = []
        for key, ach in self.ACHIEVEMENTS.items():
            all_achievements.append({
                **ach,
                'key': key,
                'unlocked': key in unlocked
            })
        
        return {
            'achievements': all_achievements,
            'unlocked_count': len(unlocked),
            'total_count': len(self.ACHIEVEMENTS)
        }
    
    # ========== 排行榜系统 ==========
    
    def update_leaderboard(self, player_id: str, player_name: str, score: int):
        """更新排行榜"""
        # 移除旧记录
        self.leaderboard = [p for p in self.leaderboard if p['id'] != player_id]
        
        # 添加新记录
        self.leaderboard.append({
            'id': player_id,
            'name': player_name,
            'score': score,
            'time': int(time.time())
        })
        
        # 排序并保留前100
        self.leaderboard.sort(key=lambda x: (-x['score'], x['time']))
        self.leaderboard = self.leaderboard[:100]
    
    def get_leaderboard(self, player_id: str, top_n: int = 10) -> dict:
        """获取排行榜"""
        top_players = self.leaderboard[:top_n]
        
        # 找到玩家排名
        player_rank = None
        for i, p in enumerate(self.leaderboard):
            if p['id'] == player_id:
                player_rank = i + 1
                break
        
        return {
            'top': top_players,
            'my_rank': player_rank,
            'total_players': len(self.leaderboard)
        }
    
    # ========== 赛季通行证系统 ==========
    
    def get_season_pass(self, player_id: str) -> dict:
        """获取赛季通行证状态"""
        data = self.player_data.get(player_id, {})
        
        return {
            'season_end': self.season_end.isoformat(),
            'level': data.get('pass_level', 1),
            'exp': data.get('pass_exp', 0),
            'is_premium': data.get('premium_pass', False),
            'days_left': (self.season_end - datetime.now()).days
        }
    
    def add_pass_exp(self, player_id: str, exp: int) -> dict:
        """增加通行证经验"""
        if player_id not in self.player_data:
            self.player_data[player_id] = {}
        
        data = self.player_data[player_id]
        current_exp = data.get('pass_exp', 0)
        current_level = data.get('pass_level', 1)
        
        current_exp += exp
        
        # 升级计算
        leveled_up = False
        while current_exp >= current_level * 100:
            current_exp -= current_level * 100
            current_level += 1
            leveled_up = True
        
        data['pass_exp'] = current_exp
        data['pass_level'] = current_level
        
        return {
            'leveled_up': leveled_up,
            'new_level': current_level,
            'exp': current_exp,
            'next_level_exp': current_level * 100
        }
    
    def buy_premium_pass(self, player_id: str) -> bool:
        """购买高级通行证"""
        # TODO: 支付验证
        if player_id not in self.player_data:
            self.player_data[player_id] = {}
        
        self.player_data[player_id]['premium_pass'] = True
        return True
    
    # ========== 任务系统 ==========
    
    DAILY_TASKS = [
        {'id': 'play_3_games', 'name': '玩3场比赛', 'reward': 200, 'target': 3},
        {'id': 'win_1_game', 'name': '赢得1场比赛', 'reward': 300, 'target': 1},
        {'id': 'get_perfect', 'name': '获得1次完美匹配', 'reward': 500, 'target': 1},
        {'id': 'climb_10_levels', 'name': '累计上升10层', 'reward': 200, 'target': 10}
    ]
    
    def get_daily_tasks(self, player_id: str) -> List[dict]:
        """获取每日任务"""
        data = self.player_data.get(player_id, {})
        tasks = data.get('daily_tasks', [])
        
        # 如果没有任务或任务已过期，生成新任务
        if not tasks:
            tasks = [{**t, 'progress': 0, 'completed': False} for t in self.DAILY_TASKS]
            data['daily_tasks'] = tasks
        
        return tasks
    
    def update_task_progress(self, player_id: str, task_id: str, progress: int = 1):
        """更新任务进度"""
        tasks = self.get_daily_tasks(player_id)
        
        for task in tasks:
            if task['id'] == task_id and not task['completed']:
                task['progress'] += progress
                if task['progress'] >= task['target']:
                    task['completed'] = True
                    return {
                        'completed': True,
                        'reward': task['reward'],
                        'message': f"✅ 完成任务: {task['name']}！奖励{task['reward']}金币！"
                    }
        
        return {'completed': False}
    
    # ========== 邀请系统 ==========
    
    def invite_friend(self, player_id: str, friend_code: str) -> dict:
        """邀请好友"""
        data = self.player_data.get(player_id, {})
        invited = data.get('invited_friends', [])
        
        if friend_code in invited:
            return {'success': False, 'message': '已邀请过该好友'}
        
        invited.append(friend_code)
        data['invited_friends'] = invited
        
        # 检查成就
        ach = self.check_achievement(player_id, 'share_master')
        
        return {
            'success': True,
            'reward': 100,
            'message': '邀请成功！奖励100金币！',
            'achievements': ach
        }


# 全局实例
monetization = MonetizationSystem()


if __name__ == '__main__':
    # 测试
    player_id = 'test_player'
    
    # 测试每日奖励
    print(monetization.get_daily_reward_status(player_id))
    print(monetization.claim_daily_reward(player_id))
    
    # 测试成就
    print(monetization.check_achievement(player_id, 'first_win'))
    print(monetization.get_achievements(player_id))
