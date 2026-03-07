# 游戏数据统计模块
import json
import time
from datetime import datetime

class GameStats:
    """游戏统计管理器"""
    
    def __init__(self):
        self.player_stats = {}
    
    def get_player_stats(self, player_id):
        """获取玩家统计"""
        if player_id not in self.player_stats:
            self.player_stats[player_id] = {
                'games_played': 0,
                'games_won': 0,
                'games_lost': 0,
                'total_score': 0,
                'highest_score': 0,
                'perfect_matches': 0,
                'total_levels_climbed': 0,
                'win_streak': 0,
                'best_win_streak': 0,
                'play_time': 0,
                'first_play': None,
                'last_play': None
            }
        return self.player_stats[player_id]
    
    def record_game_start(self, player_id):
        """记录游戏开始"""
        stats = self.get_player_stats(player_id)
        stats['games_played'] += 1
        stats['last_play'] = int(time.time())
        if not stats['first_play']:
            stats['first_play'] = int(time.time())
    
    def record_game_end(self, player_id, is_winner, score, levels_climbed, perfect_matches):
        """记录游戏结束"""
        stats = self.get_player_stats(player_id)
        
        if is_winner:
            stats['games_won'] += 1
            stats['win_streak'] += 1
            if stats['win_streak'] > stats['best_win_streak']:
                stats['best_win_streak'] = stats['win_streak']
        else:
            stats['games_lost'] += 1
            stats['win_streak'] = 0
        
        stats['total_score'] += score
        if score > stats['highest_score']:
            stats['highest_score'] = score
        
        stats['perfect_matches'] += perfect_matches
        stats['total_levels_climbed'] += levels_climbed
    
    def get_leaderboard_data(self, limit=10):
        """获取排行榜数据"""
        leaderboard = []
        for player_id, stats in self.player_stats.items():
            if stats['games_played'] > 0:
                win_rate = (stats['games_won'] / stats['games_played']) * 100
                leaderboard.append({
                    'player_id': player_id,
                    'games_played': stats['games_played'],
                    'games_won': stats['games_won'],
                    'win_rate': round(win_rate, 1),
                    'highest_score': stats['highest_score'],
                    'best_win_streak': stats['best_win_streak']
                })
        
        # 按胜场排序
        leaderboard.sort(key=lambda x: (-x['games_won'], -x['highest_score']))
        return leaderboard[:limit]
    
    def get_achievements(self, player_id):
        """获取玩家可解锁的成就"""
        stats = self.get_player_stats(player_id)
        achievements = []
        
        # 成就列表
        achievement_list = [
            {'id': 'first_win', 'name': '初露锋芒', 'desc': '获得首场胜利', 'condition': lambda s: s['games_won'] >= 1},
            {'id': 'win_10', 'name': '十胜将军', 'desc': '获得10场胜利', 'condition': lambda s: s['games_won'] >= 10},
            {'id': 'win_100', 'name': '百战百胜', 'desc': '获得100场胜利', 'condition': lambda s: s['games_won'] >= 100},
            {'id': 'streak_5', 'name': '五连胜', 'desc': '连续赢得5场', 'condition': lambda s: s['best_win_streak'] >= 5},
            {'id': 'streak_10', 'name': '十连胜', 'desc': '连续赢得10场', 'condition': lambda s: s['best_win_streak'] >= 10},
            {'id': 'high_score', 'name': '高分达人', 'desc': '单场获得500分以上', 'condition': lambda s: s['highest_score'] >= 500},
            {'id': 'veteran', 'name': '老兵', 'desc': '完成50场比赛', 'condition': lambda s: s['games_played'] >= 50},
            {'id': 'perfect_10', 'name': '天命之子', 'desc': '累计获得10次完美匹配', 'condition': lambda s: s['perfect_matches'] >= 10}
        ]
        
        for ach in achievement_list:
            achievements.append({
                **ach,
                'unlocked': ach['condition'](stats)
            })
        
        return achievements

# 全局统计实例
game_stats = GameStats()
