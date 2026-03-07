"""
Tower of Fate - 团队赛系统
支持 2v2 / 3v3 / 4v4 / 5v5 团队对战
"""
import asyncio
import time
import random
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, field
from enum import Enum

class TeamMode(Enum):
    TEAM_2V2 = "2v2"
    TEAM_3V3 = "3v3"
    TEAM_4V4 = "4v4"
    TEAM_5V5 = "5v5"

@dataclass
class TeamPlayer:
    player_id: str
    nickname: str
    level: int = 1
    rank: str = "青铜"
    is_captain: bool = False
    is_ready: bool = False
    join_time: int = 0
    
@dataclass
class Team:
    team_id: str
    name: str
    captain_id: str
    players: Dict[str, TeamPlayer] = field(default_factory=dict)
    created_time: int = 0
    wins: int = 0
    losses: int = 0
    points: int = 0
    logo: str = "default"
    
@dataclass
class TeamRoom:
    room_id: str
    room_code: str
    mode: TeamMode
    team_a: Team
    team_b: Optional[Team] = None
    status: str = "waiting"  # waiting, ready, playing, ended
    created_time: int = 0
    game_settings: Dict = field(default_factory=dict)

class TeamSystem:
    """团队系统"""
    
    def __init__(self):
        self.teams: Dict[str, Team] = {}  # team_id -> Team
        self.player_team: Dict[str, str] = {}  # player_id -> team_id
        self.rooms: Dict[str, TeamRoom] = {}  # room_id -> TeamRoom
        self.room_codes: Dict[str, str] = {}  # room_code -> room_id
        self.pending_matches: Dict[TeamMode, List[str]] = {  # 匹配队列
            TeamMode.TEAM_2V2: [],
            TeamMode.TEAM_3V3: [],
            TeamMode.TEAM_4V4: [],
            TeamMode.TEAM_5V5: []
        }
    
    # ========== 团队管理 ==========
    
    def create_team(self, captain_id: str, captain_name: str, team_name: str) -> Dict:
        """创建团队"""
        # 检查玩家是否已在团队中
        if captain_id in self.player_team:
            return {'success': False, 'error': '你已经在一个团队中了'}
        
        # 生成团队ID
        team_id = f"team_{int(time.time())}_{random.randint(1000, 9999)}"
        
        # 创建队长
        captain = TeamPlayer(
            player_id=captain_id,
            nickname=captain_name,
            is_captain=True,
            join_time=int(time.time())
        )
        
        # 创建团队
        team = Team(
            team_id=team_id,
            name=team_name,
            captain_id=captain_id,
            players={captain_id: captain},
            created_time=int(time.time())
        )
        
        self.teams[team_id] = team
        self.player_team[captain_id] = team_id
        
        return {
            'success': True,
            'team': self._format_team_info(team),
            'message': '团队创建成功！'
        }
    
    def join_team(self, player_id: str, player_name: str, team_id: str) -> Dict:
        """加入团队"""
        if player_id in self.player_team:
            return {'success': False, 'error': '你已经在一个团队中了'}
        
        if team_id not in self.teams:
            return {'success': False, 'error': '团队不存在'}
        
        team = self.teams[team_id]
        
        # 检查团队人数限制 (最多10人)
        if len(team.players) >= 10:
            return {'success': False, 'error': '团队人数已满'}
        
        # 添加玩家
        player = TeamPlayer(
            player_id=player_id,
            nickname=player_name,
            join_time=int(time.time())
        )
        team.players[player_id] = player
        self.player_team[player_id] = team_id
        
        return {
            'success': True,
            'team': self._format_team_info(team),
            'message': f'成功加入团队 {team.name}'
        }
    
    def leave_team(self, player_id: str) -> Dict:
        """离开团队"""
        if player_id not in self.player_team:
            return {'success': False, 'error': '你不在任何团队中'}
        
        team_id = self.player_team[player_id]
        team = self.teams[team_id]
        
        # 队长离开需要转让或解散
        if team.captain_id == player_id:
            if len(team.players) > 1:
                return {'success': False, 'error': '请先转让队长职位或解散团队'}
            else:
                # 解散团队
                del self.teams[team_id]
                del self.player_team[player_id]
                return {'success': True, 'message': '团队已解散'}
        
        # 普通成员离开
        del team.players[player_id]
        del self.player_team[player_id]
        
        return {
            'success': True,
            'message': f'已离开团队 {team.name}'
        }
    
    def transfer_captain(self, captain_id: str, new_captain_id: str) -> Dict:
        """转让队长"""
        if captain_id not in self.player_team:
            return {'success': False, 'error': '你不是团队成员'}
        
        team_id = self.player_team[captain_id]
        team = self.teams[team_id]
        
        if team.captain_id != captain_id:
            return {'success': False, 'error': '你不是队长'}
        
        if new_captain_id not in team.players:
            return {'success': False, 'error': '该玩家不在团队中'}
        
        # 转让
        team.players[captain_id].is_captain = False
        team.players[new_captain_id].is_captain = True
        team.captain_id = new_captain_id
        
        return {
            'success': True,
            'message': '队长转让成功',
            'new_captain': team.players[new_captain_id].nickname
        }
    
    def get_team_info(self, team_id: str) -> Optional[Dict]:
        """获取团队信息"""
        if team_id not in self.teams:
            return None
        return self._format_team_info(self.teams[team_id])
    
    def get_my_team(self, player_id: str) -> Optional[Dict]:
        """获取玩家所在团队"""
        if player_id not in self.player_team:
            return None
        return self.get_team_info(self.player_team[player_id])
    
    def _format_team_info(self, team: Team) -> Dict:
        """格式化团队信息"""
        return {
            'team_id': team.team_id,
            'name': team.name,
            'captain_id': team.captain_id,
            'captain_name': team.players.get(team.captain_id, {}).nickname if team.captain_id in team.players else "未知",
            'player_count': len(team.players),
            'players': [
                {
                    'player_id': p.player_id,
                    'nickname': p.nickname,
                    'is_captain': p.is_captain,
                    'level': p.level,
                    'rank': p.rank
                }
                for p in team.players.values()
            ],
            'stats': {
                'wins': team.wins,
                'losses': team.losses,
                'points': team.points,
                'win_rate': f"{team.wins/(team.wins+team.losses)*100:.1f}%" if (team.wins+team.losses) > 0 else "0%"
            },
            'created_time': team.created_time
        }
    
    # ========== 房间系统 ==========
    
    def create_room(self, captain_id: str, mode: str) -> Dict:
        """创建房间"""
        if captain_id not in self.player_team:
            return {'success': False, 'error': '你需要先加入一个团队'}
        
        team_id = self.player_team[captain_id]
        team = self.teams[team_id]
        
        if team.captain_id != captain_id:
            return {'success': False, 'error': '只有队长可以创建房间'}
        
        # 解析模式
        try:
            team_mode = TeamMode(mode)
        except:
            return {'success': False, 'error': '无效的游戏模式'}
        
        # 检查人数
        required_players = int(mode[0])
        if len(team.players) < required_players:
            return {'success': False, 'error': f'需要至少{required_players}名队员'}
        
        # 生成房间信息
        room_id = f"room_{int(time.time())}_{random.randint(1000, 9999)}"
        room_code = self._generate_room_code()
        
        room = TeamRoom(
            room_id=room_id,
            room_code=room_code,
            mode=team_mode,
            team_a=team,
            created_time=int(time.time())
        )
        
        self.rooms[room_id] = room
        self.room_codes[room_code] = room_id
        
        return {
            'success': True,
            'room': {
                'room_id': room_id,
                'room_code': room_code,
                'mode': mode,
                'team_a': self._format_team_info(team),
                'status': 'waiting'
            },
            'message': '房间创建成功！分享房间码给对手'
        }
    
    def join_room_by_code(self, captain_id: str, room_code: str) -> Dict:
        """通过房间码加入"""
        if captain_id not in self.player_team:
            return {'success': False, 'error': '你需要先加入一个团队'}
        
        if room_code not in self.room_codes:
            return {'success': False, 'error': '房间码不存在'}
        
        room_id = self.room_codes[room_code]
        room = self.rooms[room_id]
        
        if room.status != 'waiting':
            return {'success': False, 'error': '房间已经开始游戏'}
        
        team_id = self.player_team[captain_id]
        team = self.teams[team_id]
        
        if team.captain_id != captain_id:
            return {'success': False, 'error': '只有队长可以加入房间'}
        
        # 检查人数匹配
        required = int(room.mode.value[0])
        if len(team.players) < required:
            return {'success': False, 'error': f'你的团队需要至少{required}名队员'}
        
        # 不能加入自己的房间
        if room.team_a.team_id == team_id:
            return {'success': False, 'error': '不能加入自己的房间'}
        
        # 加入房间
        room.team_b = team
        room.status = 'ready'
        
        return {
            'success': True,
            'room': {
                'room_id': room.room_id,
                'room_code': room_code,
                'mode': room.mode.value,
                'team_a': self._format_team_info(room.team_a),
                'team_b': self._format_team_info(team),
                'status': 'ready'
            },
            'message': '成功加入房间！'
        }
    
    def get_room_info(self, room_id: str) -> Optional[Dict]:
        """获取房间信息"""
        if room_id not in self.rooms:
            return None
        
        room = self.rooms[room_id]
        result = {
            'room_id': room.room_id,
            'room_code': room.room_code,
            'mode': room.mode.value,
            'team_a': self._format_team_info(room.team_a),
            'status': room.status,
            'created_time': room.created_time
        }
        
        if room.team_b:
            result['team_b'] = self._format_team_info(room.team_b)
        
        return result
    
    def _generate_room_code(self) -> str:
        """生成房间码"""
        chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'  # 排除易混淆字符
        while True:
            code = ''.join(random.choices(chars, k=6))
            if code not in self.room_codes:
                return code
    
    # ========== 匹配系统 ==========
    
    def start_matchmaking(self, captain_id: str, mode: str) -> Dict:
        """开始匹配"""
        if captain_id not in self.player_team:
            return {'success': False, 'error': '你需要先加入一个团队'}
        
        team_id = self.player_team[captain_id]
        team = self.teams[team_id]
        
        if team.captain_id != captain_id:
            return {'success': False, 'error': '只有队长可以开始匹配'}
        
        try:
            team_mode = TeamMode(mode)
        except:
            return {'success': False, 'error': '无效的游戏模式'}
        
        # 检查人数
        required = int(mode[0])
        if len(team.players) < required:
            return {'success': False, 'error': f'需要至少{required}名队员'}
        
        # 加入匹配队列
        if team_id not in self.pending_matches[team_mode]:
            self.pending_matches[team_mode].append(team_id)
        
        return {
            'success': True,
            'message': '开始匹配...',
            'mode': mode,
            'team_size': len(team.players)
        }
    
    def cancel_matchmaking(self, captain_id: str) -> Dict:
        """取消匹配"""
        if captain_id not in self.player_team:
            return {'success': False, 'error': '你没有在匹配中'}
        
        team_id = self.player_team[captain_id]
        
        # 从所有队列中移除
        for mode, queue in self.pending_matches.items():
            if team_id in queue:
                queue.remove(team_id)
        
        return {'success': True, 'message': '已取消匹配'}
    
    def try_match_teams(self) -> List[Tuple[str, str]]:
        """尝试匹配团队"""
        matches = []
        
        for mode, queue in self.pending_matches.items():
            while len(queue) >= 2:
                team_a = queue.pop(0)
                team_b = queue.pop(0)
                matches.append((team_a, team_b))
        
        return matches
    
    # ========== 游戏逻辑 ==========
    
    def start_game(self, room_id: str) -> Dict:
        """开始游戏"""
        if room_id not in self.rooms:
            return {'success': False, 'error': '房间不存在'}
        
        room = self.rooms[room_id]
        
        if not room.team_b:
            return {'success': False, 'error': '对手团队尚未加入'}
        
        room.status = 'playing'
        
        # 初始化游戏状态
        game_state = {
            'room_id': room_id,
            'mode': room.mode.value,
            'team_a': {
                'team_id': room.team_a.team_id,
                'name': room.team_a.name,
                'players': list(room.team_a.players.keys())[:int(room.mode.value[0])]
            },
            'team_b': {
                'team_id': room.team_b.team_id,
                'name': room.team_b.name,
                'players': list(room.team_b.players.keys())[:int(room.mode.value[0])]
            },
            'round': 1,
            'team_a_score': 0,
            'team_b_score': 0,
            'status': 'playing',
            'start_time': int(time.time())
        }
        
        return {
            'success': True,
            'game_state': game_state,
            'message': '游戏开始！'
        }
    
    def end_game(self, room_id: str, winner_team_id: str) -> Dict:
        """结束游戏"""
        if room_id not in self.rooms:
            return {'success': False, 'error': '房间不存在'}
        
        room = self.rooms[room_id]
        room.status = 'ended'
        
        # 更新团队数据
        if winner_team_id == room.team_a.team_id:
            room.team_a.wins += 1
            room.team_a.points += 10
            if room.team_b:
                room.team_b.losses += 1
        elif room.team_b and winner_team_id == room.team_b.team_id:
            room.team_b.wins += 1
            room.team_b.points += 10
            room.team_a.losses += 1
        
        return {
            'success': True,
            'winner': winner_team_id,
            'message': '游戏结束'
        }
    
    # ========== 排行榜 ==========
    
    def get_team_leaderboard(self, limit: int = 100) -> List[Dict]:
        """获取团队排行榜"""
        sorted_teams = sorted(
            self.teams.values(),
            key=lambda t: (t.points, t.wins),
            reverse=True
        )[:limit]
        
        return [
            {
                'rank': i + 1,
                'team_id': t.team_id,
                'name': t.name,
                'points': t.points,
                'wins': t.wins,
                'losses': t.losses,
                'win_rate': f"{t.wins/(t.wins+t.losses)*100:.1f}%" if (t.wins+t.losses) > 0 else "0%",
                'player_count': len(t.players)
            }
            for i, t in enumerate(sorted_teams)
        ]

# 全局实例
team_system = TeamSystem()

# ========== WebSocket 处理器 ==========

async def handle_team_message(websocket, player_id: str, message: Dict):
    """处理团队相关消息"""
    msg_type = message.get('type')
    
    if msg_type == 'create_team':
        result = team_system.create_team(
            player_id,
            message.get('player_name', '未知'),
            message.get('team_name', '未命名团队')
        )
        await websocket.send_json({
            'type': 'team_created',
            'data': result
        })
    
    elif msg_type == 'join_team':
        result = team_system.join_team(
            player_id,
            message.get('player_name', '未知'),
            message.get('team_id')
        )
        await websocket.send_json({
            'type': 'team_joined',
            'data': result
        })
    
    elif msg_type == 'leave_team':
        result = team_system.leave_team(player_id)
        await websocket.send_json({
            'type': 'team_left',
            'data': result
        })
    
    elif msg_type == 'get_my_team':
        team_info = team_system.get_my_team(player_id)
        await websocket.send_json({
            'type': 'team_info',
            'data': team_info or {'has_team': False}
        })
    
    elif msg_type == 'create_team_room':
        result = team_system.create_room(
            player_id,
            message.get('mode', '2v2')
        )
        await websocket.send_json({
            'type': 'team_room_created',
            'data': result
        })
    
    elif msg_type == 'join_team_room':
        result = team_system.join_room_by_code(
            player_id,
            message.get('room_code')
        )
        await websocket.send_json({
            'type': 'team_room_joined',
            'data': result
        })
    
    elif msg_type == 'get_room_info':
        room_info = team_system.get_room_info(message.get('room_id'))
        await websocket.send_json({
            'type': 'team_room_info',
            'data': room_info
        })
    
    elif msg_type == 'start_team_match':
        result = team_system.start_matchmaking(
            player_id,
            message.get('mode', '2v2')
        )
        await websocket.send_json({
            'type': 'team_match_started',
            'data': result
        })
    
    elif msg_type == 'cancel_team_match':
        result = team_system.cancel_matchmaking(player_id)
        await websocket.send_json({
            'type': 'team_match_cancelled',
            'data': result
        })
    
    elif msg_type == 'start_team_game':
        result = team_system.start_game(message.get('room_id'))
        await websocket.send_json({
            'type': 'team_game_started',
            'data': result
        })
    
    elif msg_type == 'get_team_leaderboard':
        leaderboard = team_system.get_team_leaderboard(
            message.get('limit', 100)
        )
        await websocket.send_json({
            'type': 'team_leaderboard',
            'data': leaderboard
        })

# 自动匹配任务
async def matchmaking_task():
    """自动匹配任务"""
    while True:
        await asyncio.sleep(5)  # 每5秒检查一次
        
        matches = team_system.try_match_teams()
        for team_a_id, team_b_id in matches:
            print(f"[匹配成功] {team_a_id} vs {team_b_id}")
            # 这里应该通知双方队长
