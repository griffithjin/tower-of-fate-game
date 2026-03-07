# 锦标赛系统
import time
import random
from datetime import datetime, timedelta

class Tournament:
    """锦标赛"""
    def __init__(self, tournament_id, name, entry_fee, prize_pool, start_time, max_players=64):
        self.tournament_id = tournament_id
        self.name = name
        self.entry_fee = entry_fee  # 报名费
        self.prize_pool = prize_pool  # 奖金池
        self.start_time = start_time
        self.max_players = max_players
        self.players = []  # 报名的玩家
        self.status = 'registering'  # registering, ongoing, finished
        self.rounds = []
        self.current_round = 0
        self.winner = None
        
        # 预设奖金分配
        self.prize_distribution = {
            1: 0.5,   # 冠军 50%
            2: 0.25,  # 亚军 25%
            3: 0.15,  # 季军 15%
            4: 0.05,  # 第四名 5%
            5: 0.025, # 第五名 2.5%
            6: 0.025  # 第六名 2.5%
        }

class TournamentManager:
    """锦标赛管理器"""
    
    def __init__(self):
        self.tournaments = []
        self.player_records = {}  # player_id -> {wins, losses, earnings}
        self.init_default_tournaments()
    
    def init_default_tournaments(self):
        """初始化默认锦标赛"""
        now = int(time.time())
        
        # 每日锦标赛
        self.tournaments.append(Tournament(
            'daily_1',
            '🏆 每日争霸赛',
            100,  # 报名费100金币
            10000,  # 奖金池10000金币
            now + 3600,  # 1小时后开始
            32
        ))
        
        # 周末大奖赛
        self.tournaments.append(Tournament(
            'weekend_1',
            '💎 周末大奖赛',
            500,
            50000,
            now + 86400,  # 24小时后
            64
        ))
        
        # 月度锦标赛
        self.tournaments.append(Tournament(
            'monthly_1',
            '👑 月度王者赛',
            1000,
            200000,
            now + 172800,  # 48小时后
            128
        ))
    
    def get_tournament_list(self):
        """获取锦标赛列表"""
        result = []
        now = int(time.time())
        
        for t in self.tournaments:
            time_left = t.start_time - now
            status_text = {
                'registering': '报名中',
                'ongoing': '进行中',
                'finished': '已结束'
            }.get(t.status, '未知')
            
            result.append({
                'id': t.tournament_id,
                'name': t.name,
                'entry_fee': t.entry_fee,
                'prize_pool': t.prize_pool,
                'players': len(t.players),
                'max_players': t.max_players,
                'time_left': max(0, time_left),
                'status': t.status,
                'status_text': status_text
            })
        
        return result
    
    def register_tournament(self, player_id, tournament_id, player_coins):
        """报名参加锦标赛"""
        tournament = next((t for t in self.tournaments if t.tournament_id == tournament_id), None)
        if not tournament:
            return {'success': False, 'message': '锦标赛不存在'}
        
        if tournament.status != 'registering':
            return {'success': False, 'message': '报名已截止'}
        
        if player_id in tournament.players:
            return {'success': False, 'message': '已报名'}
        
        if len(tournament.players) >= tournament.max_players:
            return {'success': False, 'message': '名额已满'}
        
        if player_coins < tournament.entry_fee:
            return {'success': False, 'message': '金币不足'}
        
        tournament.players.append(player_id)
        
        return {
            'success': True,
            'message': f'成功报名 {tournament.name}！',
            'tournament': {
                'id': tournament.tournament_id,
                'name': tournament.name,
                'start_time': tournament.start_time
            }
        }
    
    def get_player_record(self, player_id):
        """获取玩家锦标赛记录"""
        if player_id not in self.player_records:
            self.player_records[player_id] = {
                'tournaments_played': 0,
                'tournaments_won': 0,
                'total_earnings': 0,
                'best_rank': 999
            }
        return self.player_records[player_id]
    
    def simulate_tournament_match(self, player1_id, player2_id):
        """模拟锦标赛对局（简化版）"""
        # 随机决定胜负（实际应该调用游戏逻辑）
        return player1_id if random.random() > 0.5 else player2_id
    
    def start_tournament(self, tournament_id):
        """开始锦标赛"""
        tournament = next((t for t in self.tournaments if t.tournament_id == tournament_id), None)
        if not tournament:
            return
        
        tournament.status = 'ongoing'
        players = tournament.players.copy()
        
        # 单败淘汰制
        while len(players) > 1:
            tournament.current_round += 1
            round_matches = []
            next_round_players = []
            
            # 配对
            random.shuffle(players)
            for i in range(0, len(players), 2):
                if i + 1 < len(players):
                    winner = self.simulate_tournament_match(players[i], players[i+1])
                    next_round_players.append(winner)
                    round_matches.append({
                        'player1': players[i],
                        'player2': players[i+1],
                        'winner': winner
                    })
                else:
                    # 轮空
                    next_round_players.append(players[i])
            
            tournament.rounds.append({
                'round': tournament.current_round,
                'matches': round_matches
            })
            players = next_round_players
        
        # 冠军
        tournament.winner = players[0]
        tournament.status = 'finished'
        
        # 发放奖励
        self.distribute_prizes(tournament)
    
    def distribute_prizes(self, tournament):
        """发放奖金"""
        # 简化版：只给冠军发奖
        if tournament.winner:
            winner_prize = int(tournament.prize_pool * 0.5)
            if tournament.winner not in self.player_records:
                self.player_records[tournament.winner] = {
                    'tournaments_played': 0,
                    'tournaments_won': 0,
                    'total_earnings': 0,
                    'best_rank': 999
                }
            
            record = self.player_records[tournament.winner]
            record['tournaments_won'] += 1
            record['total_earnings'] += winner_prize
            record['best_rank'] = min(record['best_rank'], 1)

# 全局锦标赛实例
tournament_manager = TournamentManager()
