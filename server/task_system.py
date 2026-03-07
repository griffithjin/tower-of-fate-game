"""
Tower of Fate - 任务系统 + 签到系统
每日任务、周任务、成就任务、连续签到
"""
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List

class TaskSystem:
    """任务系统"""
    
    def __init__(self):
        self.daily_tasks = self._generate_daily_tasks()
        self.weekly_tasks = self._generate_weekly_tasks()
        self.achievements = self._generate_achievements()
        self.player_progress = {}  # player_id -> task_progress
    
    # ==================== 每日任务 ====================
    
    def _generate_daily_tasks(self) -> Dict:
        """生成每日任务"""
        return {
            'play_3_games': {
                'id': 'play_3_games',
                'name': '今日对战',
                'desc': '完成3场对局',
                'target': 3,
                'reward': {'coins': 100},
                'type': 'daily'
            },
            'win_1_game': {
                'id': 'win_1_game',
                'name': '首胜奖励',
                'desc': '赢得1场对局',
                'target': 1,
                'reward': {'coins': 200},
                'type': 'daily'
            },
            'use_destiny': {
                'id': 'use_destiny',
                'name': '天命之子',
                'desc': '使用1次天命牌',
                'target': 1,
                'reward': {'coins': 50},
                'type': 'daily'
            },
            'reach_level_6': {
                'id': 'reach_level_6',
                'name': '登高望远',
                'desc': '单局达到第6层',
                'target': 1,
                'reward': {'coins': 150},
                'type': 'daily'
            },
            'play_ranked': {
                'id': 'play_ranked',
                'name': '排位挑战',
                'desc': '进行1场排位赛',
                'target': 1,
                'reward': {'coins': 100, 'diamonds': 10},
                'type': 'daily'
            }
        }
    
    def _generate_weekly_tasks(self) -> Dict:
        """生成周任务"""
        return {
            'win_10_games': {
                'id': 'win_10_games',
                'name': '十连胜',
                'desc': '本周赢得10场对局',
                'target': 10,
                'reward': {'coins': 1000, 'diamonds': 50},
                'type': 'weekly'
            },
            'play_20_games': {
                'id': 'play_20_games',
                'name': '活跃玩家',
                'desc': '本周完成20场对局',
                'target': 20,
                'reward': {'coins': 800},
                'type': 'weekly'
            },
            'reach_master': {
                'id': 'reach_master',
                'name': '王者之路',
                'desc': '本周达到王者段位',
                'target': 1,
                'reward': {'coins': 5000, 'diamonds': 200},
                'type': 'weekly'
            }
        }
    
    def _generate_achievements(self) -> Dict:
        """生成成就任务"""
        return {
            'first_win': {
                'id': 'first_win',
                'name': '初露锋芒',
                'desc': '获得首场胜利',
                'target': 1,
                'reward': {'coins': 500},
                'icon': '🏆'
            },
            'win_10': {
                'id': 'win_10',
                'name': '十胜将军',
                'desc': '累计赢得10场对局',
                'target': 10,
                'reward': {'coins': 1000},
                'icon': '🥇'
            },
            'win_100': {
                'id': 'win_100',
                'name': '百战百胜',
                'desc': '累计赢得100场对局',
                'target': 100,
                'reward': {'coins': 5000},
                'icon': '👑'
            },
            'perfect_10': {
                'id': 'perfect_10',
                'name': '天命之子',
                'desc': '累计获得10次完美匹配',
                'target': 10,
                'reward': {'coins': 2000},
                'icon': '✨'
            },
            'reach_top': {
                'id': 'reach_top',
                'name': '登顶者',
                'desc': '成功登顶A层',
                'target': 1,
                'reward': {'coins': 500, 'diamonds': 50},
                'icon': '🏔️'
            },
            'collect_skins': {
                'id': 'collect_skins',
                'name': '收藏家',
                'desc': '拥有10件皮肤',
                'target': 10,
                'reward': {'coins': 2000, 'diamonds': 100},
                'icon': '👔'
            },
            'make_friends': {
                'id': 'make_friends',
                'name': '社交达人',
                'desc': '添加10位好友',
                'target': 10,
                'reward': {'coins': 1000},
                'icon': '👥'
            }
        }
    
    def get_daily_tasks(self, player_id: str) -> List[Dict]:
        """获取玩家每日任务"""
        if player_id not in self.player_progress:
            self._init_player_progress(player_id)
        
        progress = self.player_progress[player_id]
        tasks = []
        
        for task_id, task in self.daily_tasks.items():
            task_progress = progress['daily'].get(task_id, {'current': 0, 'completed': False})
            tasks.append({
                **task,
                'current': task_progress['current'],
                'completed': task_progress['completed']
            })
        
        return tasks
    
    def get_weekly_tasks(self, player_id: str) -> List[Dict]:
        """获取玩家周任务"""
        if player_id not in self.player_progress:
            self._init_player_progress(player_id)
        
        progress = self.player_progress[player_id]
        tasks = []
        
        for task_id, task in self.weekly_tasks.items():
            task_progress = progress['weekly'].get(task_id, {'current': 0, 'completed': False})
            tasks.append({
                **task,
                'current': task_progress['current'],
                'completed': task_progress['completed']
            })
        
        return tasks
    
    def get_achievements(self, player_id: str) -> List[Dict]:
        """获取玩家成就"""
        if player_id not in self.player_progress:
            self._init_player_progress(player_id)
        
        progress = self.player_progress[player_id]
        achievements = []
        
        for ach_id, ach in self.achievements.items():
            ach_progress = progress['achievements'].get(ach_id, {'current': 0, 'completed': False})
            achievements.append({
                **ach,
                'current': ach_progress['current'],
                'completed': ach_progress['completed']
            })
        
        return achievements
    
    def update_task_progress(self, player_id: str, task_type: str, task_id: str, increment: int = 1):
        """更新任务进度"""
        if player_id not in self.player_progress:
            self._init_player_progress(player_id)
        
        progress = self.player_progress[player_id]
        
        if task_type == 'daily':
            if task_id in self.daily_tasks:
                if task_id not in progress['daily']:
                    progress['daily'][task_id] = {'current': 0, 'completed': False}
                
                task_progress = progress['daily'][task_id]
                task_progress['current'] += increment
                
                if task_progress['current'] >= self.daily_tasks[task_id]['target']:
                    task_progress['completed'] = True
        
        elif task_type == 'weekly':
            if task_id in self.weekly_tasks:
                if task_id not in progress['weekly']:
                    progress['weekly'][task_id] = {'current': 0, 'completed': False}
                
                task_progress = progress['weekly'][task_id]
                task_progress['current'] += increment
                
                if task_progress['current'] >= self.weekly_tasks[task_id]['target']:
                    task_progress['completed'] = True
        
        elif task_type == 'achievement':
            if task_id in self.achievements:
                if task_id not in progress['achievements']:
                    progress['achievements'][task_id] = {'current': 0, 'completed': False}
                
                ach_progress = progress['achievements'][task_id]
                ach_progress['current'] += increment
                
                if ach_progress['current'] >= self.achievements[task_id]['target']:
                    ach_progress['completed'] = True
    
    def claim_task_reward(self, player_id: str, task_type: str, task_id: str):
        """领取任务奖励"""
        if player_id not in self.player_progress:
            return {'success': False, 'error': '任务不存在'}
        
        progress = self.player_progress[player_id]
        
        if task_type == 'daily' and task_id in progress['daily']:
            task_progress = progress['daily'][task_id]
            if task_progress['completed'] and not task_progress.get('claimed', False):
                task_progress['claimed'] = True
                reward = self.daily_tasks[task_id]['reward']
                return {'success': True, 'reward': reward}
        
        elif task_type == 'weekly' and task_id in progress['weekly']:
            task_progress = progress['weekly'][task_id]
            if task_progress['completed'] and not task_progress.get('claimed', False):
                task_progress['claimed'] = True
                reward = self.weekly_tasks[task_id]['reward']
                return {'success': True, 'reward': reward}
        
        elif task_type == 'achievement' and task_id in progress['achievements']:
            ach_progress = progress['achievements'][task_id]
            if ach_progress['completed'] and not ach_progress.get('claimed', False):
                ach_progress['claimed'] = True
                reward = self.achievements[task_id]['reward']
                return {'success': True, 'reward': reward}
        
        return {'success': False, 'error': '奖励不可领取'}
    
    def _init_player_progress(self, player_id: str):
        """初始化玩家进度"""
        self.player_progress[player_id] = {
            'daily': {},
            'weekly': {},
            'achievements': {}
        }
    
    def reset_daily_tasks(self):
        """重置每日任务"""
        for player_id in self.player_progress:
            self.player_progress[player_id]['daily'] = {}
        print("[任务系统] 每日任务已重置")
    
    def reset_weekly_tasks(self):
        """重置周任务"""
        for player_id in self.player_progress:
            self.player_progress[player_id]['weekly'] = {}
        print("[任务系统] 周任务已重置")


class CheckInSystem:
    """签到系统"""
    
    # 签到奖励配置
    DAILY_REWARDS = [
        {'day': 1, 'coins': 100},
        {'day': 2, 'coins': 150},
        {'day': 3, 'coins': 200},
        {'day': 4, 'coins': 250},
        {'day': 5, 'coins': 300},
        {'day': 6, 'coins': 400},
        {'day': 7, 'coins': 500, 'diamonds': 10, 'bonus': '神秘宝箱'}
    ]
    
    def __init__(self):
        self.check_in_data = {}  # player_id -> check_in_info
    
    def get_check_in_status(self, player_id: str) -> Dict:
        """获取签到状态"""
        if player_id not in self.check_in_data:
            self._init_check_in(player_id)
        
        data = self.check_in_data[player_id]
        today = datetime.now().date()
        last_check_in = datetime.fromtimestamp(data['last_check_in']).date() if data['last_check_in'] else None
        
        # 检查是否断签
        if last_check_in and (today - last_check_in).days > 1:
            data['streak'] = 0  # 断签重置
        
        can_check_in = last_check_in != today
        
        return {
            'streak': data['streak'],
            'can_check_in': can_check_in,
            'today_reward': self._get_reward_for_day(data['streak'] + 1),
            'total_days': data['total_days']
        }
    
    def check_in(self, player_id: str) -> Dict:
        """执行签到"""
        if player_id not in self.check_in_data:
            self._init_check_in(player_id)
        
        data = self.check_in_data[player_id]
        today = datetime.now().date()
        last_check_in = datetime.fromtimestamp(data['last_check_in']).date() if data['last_check_in'] else None
        
        if last_check_in == today:
            return {'success': False, 'error': '今日已签到'}
        
        # 检查是否连续签到
        if last_check_in and (today - last_check_in).days == 1:
            data['streak'] += 1
        else:
            data['streak'] = 1  # 断签后重新开始
        
        # 7天一个周期
        if data['streak'] > 7:
            data['streak'] = 1
        
        data['last_check_in'] = int(time.time())
        data['total_days'] += 1
        
        reward = self._get_reward_for_day(data['streak'])
        
        print(f"[签到系统] 玩家 {player_id} 签到成功，连续{data['streak']}天")
        return {
            'success': True,
            'streak': data['streak'],
            'reward': reward
        }
    
    def _get_reward_for_day(self, day: int) -> Dict:
        """获取第N天的奖励"""
        day = min(day, 7)
        for reward in self.DAILY_REWARDS:
            if reward['day'] == day:
                return reward
        return self.DAILY_REWARDS[0]
    
    def _init_check_in(self, player_id: str):
        """初始化签到数据"""
        self.check_in_data[player_id] = {
            'streak': 0,
            'total_days': 0,
            'last_check_in': 0
        }

# 全局实例
task_system = TaskSystem()
check_in_system = CheckInSystem()
