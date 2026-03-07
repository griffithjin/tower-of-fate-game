"""
Tower of Fate - 社交系统全功能
师徒、结婚/结拜、世界BOSS、公会战、跨服匹配、好友约战
"""
import time
from typing import Dict, List, Optional

class MentorSystem:
    """师徒系统"""
    
    def __init__(self):
        self.mentors = {}  # player_id -> mentor_data
        self.students = {}  # player_id -> [student_ids]
    
    def apply_mentor(self, student_id: str, mentor_id: str) -> Dict:
        """申请拜师"""
        if student_id in self.mentors:
            return {'success': False, 'error': '你已有师父'}
        
        # 检查师父条件
        if mentor_id in self.students and len(self.students[mentor_id]) >= 3:
            return {'success': False, 'error': '该师父徒弟已满'}
        
        # 建立师徒关系
        if mentor_id not in self.students:
            self.students[mentor_id] = []
        
        self.students[mentor_id].append({
            'id': student_id,
            'status': 'pending',
            'apply_time': int(time.time())
        })
        
        return {'success': True, 'message': '申请已发送，等待师父确认'}
    
    def accept_student(self, mentor_id: str, student_id: str) -> Dict:
        """收徒"""
        if mentor_id not in self.students:
            return {'success': False, 'error': '没有待处理申请'}
        
        for student in self.students[mentor_id]:
            if student['id'] == student_id and student['status'] == 'pending':
                student['status'] = 'accepted'
                student['accept_time'] = int(time.time())
                
                self.mentors[student_id] = {
                    'mentor_id': mentor_id,
                    'since': int(time.time()),
                    'tasks_completed': 0,
                    'graduated': False
                }
                
                return {'success': True, 'message': '收徒成功！'}
        
        return {'success': False, 'error': '申请不存在'}
    
    def graduate(self, student_id: str) -> Dict:
        """出师"""
        if student_id not in self.mentors:
            return {'success': False, 'error': '你没有师父'}
        
        data = self.mentors[student_id]
        data['graduated'] = True
        data['graduate_time'] = int(time.time())
        
        # 发放出师奖励
        mentor_id = data['mentor_id']
        
        return {
            'success': True,
            'reward': {'coins': 1000, 'title': '出师弟子'},
            'mentor_reward': {'coins': 500}
        }
    
    def get_mentor_tasks(self) -> List[Dict]:
        """获取师徒任务"""
        return [
            {'id': 1, 'name': '初次见面', 'desc': '和师父/徒弟完成1局游戏', 'reward': {'coins': 100}},
            {'id': 2, 'name': '共同进步', 'desc': '一起完成3局游戏', 'reward': {'coins': 200}},
            {'id': 3, 'name': '师父教导', 'desc': '师父击败徒弟3次(教学)', 'reward': {'coins': 150}},
            {'id': 4, 'name': '徒弟成长', 'desc': '徒弟达到白银段位', 'reward': {'coins': 300}},
            {'id': 5, 'name': '师徒同心', 'desc': '组队获得1次胜利', 'reward': {'coins': 250}},
        ]


class RelationshipSystem:
    """关系系统 (结婚/结拜)"""
    
    RELATIONSHIP_TYPES = {
        'marriage': {'name': '夫妻', 'icon': '💑', 'max': 1},
        'sworn': {'name': '结拜', 'icon': '🤝', 'max': 8}
    }
    
    def __init__(self):
        self.relationships = {}  # player_id -> {type, partner_ids}
        self.proposals = {}  # player_id -> [proposals]
    
    def propose(self, from_id: str, to_id: str, rel_type: str, message: str = "") -> Dict:
        """发起关系申请"""
        if rel_type not in self.RELATIONSHIP_TYPES:
            return {'success': False, 'error': '关系类型不存在'}
        
        rel_info = self.RELATIONSHIP_TYPES[rel_type]
        
        # 检查是否已有该类型关系
        if from_id in self.relationships:
            existing = self.relationships[from_id]
            if existing['type'] == rel_type:
                if len(existing['partners']) >= rel_info['max']:
                    return {'success': False, 'error': f'{rel_info["name"]}关系数量已达上限'}
        
        # 发送申请
        if to_id not in self.proposals:
            self.proposals[to_id] = []
        
        self.proposals[to_id].append({
            'from': from_id,
            'type': rel_type,
            'message': message,
            'time': int(time.time()),
            'status': 'pending'
        })
        
        return {'success': True, 'message': f'{rel_info["name"]}申请已发送'}
    
    def accept_proposal(self, player_id: str, from_id: str) -> Dict:
        """接受关系申请"""
        if player_id not in self.proposals:
            return {'success': False, 'error': '没有申请'}
        
        for proposal in self.proposals[player_id]:
            if proposal['from'] == from_id and proposal['status'] == 'pending':
                proposal['status'] = 'accepted'
                rel_type = proposal['type']
                
                # 建立双向关系
                for pid in [player_id, from_id]:
                    if pid not in self.relationships:
                        self.relationships[pid] = {'type': rel_type, 'partners': []}
                    
                    other_id = from_id if pid == player_id else player_id
                    if other_id not in self.relationships[pid]['partners']:
                        self.relationships[pid]['partners'].append(other_id)
                
                return {'success': True, 'message': f'成为{self.RELATIONSHIP_TYPES[rel_type]["name"]}！'}
        
        return {'success': False, 'error': '申请不存在'}
    
    def get_partner_bonus(self, player_id: str) -> Dict:
        """获取关系加成"""
        if player_id not in self.relationships:
            return {}
        
        rel = self.relationships[player_id]
        bonus = {
            'coins_bonus': 0.1,  # 10%金币加成
            'exp_bonus': 0.1     # 10%经验加成
        }
        
        return bonus


class WorldBossSystem:
    """世界BOSS系统"""
    
    BOSSES = [
        {'id': 'boss_1', 'name': '塔楼守护者', 'hp': 1000000, 'reward': {'coins': 500, 'diamonds': 50}},
        {'id': 'boss_2', 'name': '命运巨龙', 'hp': 2000000, 'reward': {'coins': 1000, 'diamonds': 100}},
        {'id': 'boss_3', 'name': '混沌魔王', 'hp': 5000000, 'reward': {'coins': 2000, 'diamonds': 200}},
    ]
    
    def __init__(self):
        self.current_boss = None
        self.boss_hp = 0
        self.damage_ranking = []  # player_id -> damage
        self.participants = set()
    
    def spawn_boss(self, boss_id: str = None):
        """生成BOSS"""
        if boss_id is None:
            boss = random.choice(self.BOSSES)
        else:
            boss = next((b for b in self.BOSSES if b['id'] == boss_id), None)
        
        if boss:
            self.current_boss = boss
            self.boss_hp = boss['hp']
            self.damage_ranking = []
            self.participants = set()
            print(f"[世界BOSS] {boss['name']} 出现！HP: {boss['hp']}")
    
    def attack_boss(self, player_id: str, damage: int) -> Dict:
        """攻击BOSS"""
        if not self.current_boss or self.boss_hp <= 0:
            return {'success': False, 'error': '当前没有BOSS'}
        
        self.boss_hp -= damage
        self.participants.add(player_id)
        
        # 更新伤害排行
        existing = next((r for r in self.damage_ranking if r['player_id'] == player_id), None)
        if existing:
            existing['damage'] += damage
        else:
            self.damage_ranking.append({'player_id': player_id, 'damage': damage})
        
        # 排序
        self.damage_ranking.sort(key=lambda x: -x['damage'])
        
        # 检查BOSS死亡
        if self.boss_hp <= 0:
            return self._boss_defeated()
        
        return {
            'success': True,
            'damage': damage,
            'boss_hp': self.boss_hp,
            'boss_max_hp': self.current_boss['hp'],
            'rank': next((i+1 for i, r in enumerate(self.damage_ranking) if r['player_id'] == player_id), 0)
        }
    
    def _boss_defeated(self) -> Dict:
        """BOSS被击败"""
        rewards = []
        
        # 前10名获得奖励
        for i, rank in enumerate(self.damage_ranking[:10]):
            multiplier = max(0.1, 1 - i * 0.1)  # 第1名100%，第10名10%
            reward = {
                'player_id': rank['player_id'],
                'rank': i + 1,
                'damage': rank['damage'],
                'coins': int(self.current_boss['reward']['coins'] * multiplier),
                'diamonds': int(self.current_boss['reward']['diamonds'] * multiplier)
            }
            rewards.append(reward)
        
        result = {
            'success': True,
            'defeated': True,
            'boss': self.current_boss,
            'rewards': rewards,
            'total_participants': len(self.participants)
        }
        
        self.current_boss = None
        return result


class GuildWarSystem:
    """公会战系统"""
    
    def __init__(self):
        self.war_season = None
        self.guild_rankings = []
        self.war_history = []
    
    def start_war_season(self, season_name: str):
        """开始公会战赛季"""
        self.war_season = {
            'name': season_name,
            'start_time': int(time.time()),
            'end_time': int(time.time()) + 30 * 86400,  # 30天
            'status': 'active'
        }
        self.guild_rankings = []
        print(f"[公会战] 新赛季开始: {season_name}")
    
    def register_guild(self, guild_id: str, guild_name: str):
        """注册参加公会战"""
        if not any(r['guild_id'] == guild_id for r in self.guild_rankings):
            self.guild_rankings.append({
                'guild_id': guild_id,
                'guild_name': guild_name,
                'points': 0,
                'wins': 0,
                'losses': 0,
                'members_participated': 0
            })
    
    def record_war_result(self, guild_id: str, result: str, points: int):
        """记录公会战结果"""
        guild_rank = next((r for r in self.guild_rankings if r['guild_id'] == guild_id), None)
        if guild_rank:
            guild_rank['points'] += points
            if result == 'win':
                guild_rank['wins'] += 1
            else:
                guild_rank['losses'] += 1
        
        # 重新排序
        self.guild_rankings.sort(key=lambda x: -x['points'])
    
    def get_season_rewards(self, guild_rank: int) -> Dict:
        """获取赛季奖励"""
        rewards = {
            1: {'coins': 50000, 'diamonds': 5000, 'title': '公会战冠军'},
            2: {'coins': 30000, 'diamonds': 3000, 'title': '公会战亚军'},
            3: {'coins': 20000, 'diamonds': 2000, 'title': '公会战季军'},
        }
        
        if guild_rank <= 10:
            return rewards.get(guild_rank, {'coins': 5000, 'diamonds': 500})
        
        return {'coins': 1000, 'diamonds': 100}


class CrossServerSystem:
    """跨服匹配系统"""
    
    def __init__(self):
        self.servers = {}  # server_id -> server_data
        self.cross_server_pool = []  # 跨服匹配池
    
    def register_server(self, server_id: str, server_name: str, region: str):
        """注册服务器"""
        self.servers[server_id] = {
            'id': server_id,
            'name': server_name,
            'region': region,
            'status': 'active'
        }
    
    def join_cross_server_match(self, player_id: str, player_data: Dict, server_id: str):
        """加入跨服匹配"""
        entry = {
            'player_id': player_id,
            'server_id': server_id,
            'rank': player_data.get('rank', 'bronze'),
            'join_time': int(time.time()),
            'data': player_data
        }
        
        self.cross_server_pool.append(entry)
        
        # 尝试匹配
        return self._try_cross_server_match(player_id)
    
    def _try_cross_server_match(self, player_id: str) -> Dict:
        """尝试跨服匹配"""
        player = next((p for p in self.cross_server_pool if p['player_id'] == player_id), None)
        if not player:
            return {'success': False, 'error': '不在匹配池中'}
        
        # 寻找同段位玩家
        candidates = [p for p in self.cross_server_pool 
                     if p['player_id'] != player_id and p['rank'] == player['rank']]
        
        if len(candidates) >= 3:
            # 选择3个对手
            selected = candidates[:3]
            
            # 创建对局
            match = {
                'match_id': f"cross_{int(time.time())}",
                'players': [player] + selected,
                'servers': list(set([p['server_id'] for p in [player] + selected])),
                'type': 'cross_server'
            }
            
            # 从池中移除
            for p in [player] + selected:
                self.cross_server_pool.remove(p)
            
            return {'success': True, 'match': match}
        
        return {'success': False, 'message': '匹配中...', 'queue_position': len(self.cross_server_pool)}
    
    def get_cross_server_leaderboard(self, limit: int = 100) -> List[Dict]:
        """获取跨服排行榜"""
        # 这里应该从数据库获取
        return []


class FriendlyMatchSystem:
    """好友约战系统"""
    
    def __init__(self):
        self.pending_matches = {}  # match_id -> match_data
    
    def invite_friend(self, from_id: str, to_id: str, settings: Dict = None) -> str:
        """邀请好友对战"""
        match_id = f"friendly_{int(time.time())}_{from_id}"
        
        self.pending_matches[match_id] = {
            'id': match_id,
            'from': from_id,
            'to': to_id,
            'settings': settings or {},
            'status': 'pending',
            'create_time': int(time.time())
        }
        
        return match_id
    
    def accept_invite(self, match_id: str, player_id: str) -> Dict:
        """接受邀请"""
        if match_id not in self.pending_matches:
            return {'success': False, 'error': '邀请不存在或已过期'}
        
        match = self.pending_matches[match_id]
        
        if match['to'] != player_id:
            return {'success': False, 'error': '无权接受'}
        
        match['status'] = 'accepted'
        match['start_time'] = int(time.time())
        
        return {
            'success': True,
            'match': match,
            'room_id': f"room_{match_id}"
        }
    
    def reject_invite(self, match_id: str, player_id: str) -> Dict:
        """拒绝邀请"""
        if match_id in self.pending_matches:
            match = self.pending_matches[match_id]
            if match['to'] == player_id:
                match['status'] = 'rejected'
                return {'success': True}
        
        return {'success': False, 'error': '邀请不存在'}

# 全局实例
mentor_system = MentorSystem()
relationship_system = RelationshipSystem()
world_boss_system = WorldBossSystem()
guild_war_system = GuildWarSystem()
cross_server_system = CrossServerSystem()
friendly_match_system = FriendlyMatchSystem()
