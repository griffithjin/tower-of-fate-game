"""
Tower of Fate - 观战系统 + 回放系统 + 战队系统
游戏体验优化：观战、回放、战队
"""
import json
import time
from typing import Dict, List, Optional

class SpectatorSystem:
    """观战系统"""
    
    def __init__(self):
        self.spectatable_games = {}  # game_id -> game_info
        self.spectators = {}  # game_id -> [spectator_ids]
    
    def register_game_for_spectate(self, game_id: str, game_info: Dict):
        """注册游戏可供观战"""
        self.spectatable_games[game_id] = {
            'game_id': game_id,
            'players': game_info.get('players', []),
            'start_time': int(time.time()),
            'spectator_count': 0,
            'status': 'playing'
        }
        print(f"[观战系统] 游戏 {game_id} 开放观战")
    
    def get_spectatable_games(self, limit: int = 10) -> List[Dict]:
        """获取可观战的游戏列表"""
        games = []
        for game_id, game in self.spectatable_games.items():
            if game['status'] == 'playing':
                games.append(game)
        
        # 按观战人数排序
        games.sort(key=lambda x: -x['spectator_count'])
        return games[:limit]
    
    def join_spectate(self, spectator_id: str, game_id: str) -> Dict:
        """加入观战"""
        if game_id not in self.spectatable_games:
            return {'success': False, 'error': '游戏不存在或已结束'}
        
        game = self.spectatable_games[game_id]
        
        if game_id not in self.spectators:
            self.spectators[game_id] = []
        
        if spectator_id not in self.spectators[game_id]:
            self.spectators[game_id].append(spectator_id)
            game['spectator_count'] += 1
        
        print(f"[观战系统] {spectator_id} 开始观战 {game_id}")
        return {
            'success': True,
            'game_id': game_id,
            'spectator_count': game['spectator_count']
        }
    
    def leave_spectate(self, spectator_id: str, game_id: str):
        """离开观战"""
        if game_id in self.spectators:
            if spectator_id in self.spectators[game_id]:
                self.spectators[game_id].remove(spectator_id)
                
                if game_id in self.spectatable_games:
                    self.spectatable_games[game_id]['spectator_count'] -= 1
    
    def end_game(self, game_id: str):
        """结束游戏观战"""
        if game_id in self.spectatable_games:
            self.spectatable_games[game_id]['status'] = 'ended'
            print(f"[观战系统] 游戏 {game_id} 结束，观战关闭")


class ReplaySystem:
    """回放系统"""
    
    def __init__(self):
        self.replays = {}  # replay_id -> replay_data
        self.player_replays = {}  # player_id -> [replay_ids]
    
    def save_replay(self, game_id: str, game_data: Dict) -> str:
        """保存回放"""
        replay_id = f"replay_{game_id}_{int(time.time())}"
        
        # 提取关键信息
        replay = {
            'id': replay_id,
            'game_id': game_id,
            'timestamp': int(time.time()),
            'players': game_data.get('players', {}),
            'winner': game_data.get('winner'),
            'rounds': game_data.get('rounds', []),
            'highlights': self._extract_highlights(game_data),
            'views': 0,
            'likes': 0
        }
        
        self.replays[replay_id] = replay
        
        # 关联到玩家
        for player_id in game_data.get('players', {}).keys():
            if player_id not in self.player_replays:
                self.player_replays[player_id] = []
            self.player_replays[player_id].append(replay_id)
        
        print(f"[回放系统] 回放保存: {replay_id}")
        return replay_id
    
    def _extract_highlights(self, game_data: Dict) -> List[Dict]:
        """提取精彩时刻"""
        highlights = []
        
        for round_data in game_data.get('rounds', []):
            # 完美匹配
            for player_id, result in round_data.get('results', {}).items():
                if result == 'perfect_match':
                    highlights.append({
                        'type': 'perfect_match',
                        'round': round_data['round'],
                        'player': player_id,
                        'timestamp': round_data['timestamp']
                    })
        
        return highlights
    
    def get_player_replays(self, player_id: str, limit: int = 10) -> List[Dict]:
        """获取玩家回放列表"""
        replay_ids = self.player_replays.get(player_id, [])
        replays = []
        
        for replay_id in replay_ids[-limit:]:
            if replay_id in self.replays:
                replays.append(self.replays[replay_id])
        
        return replays
    
    def get_replay(self, replay_id: str) -> Optional[Dict]:
        """获取回放详情"""
        if replay_id in self.replays:
            replay = self.replays[replay_id]
            replay['views'] += 1
            return replay
        return None
    
    def like_replay(self, replay_id: str) -> bool:
        """点赞回放"""
        if replay_id in self.replays:
            self.replays[replay_id]['likes'] += 1
            return True
        return False
    
    def share_replay(self, replay_id: str, platform: str) -> Dict:
        """分享回放"""
        if replay_id not in self.replays:
            return {'success': False, 'error': '回放不存在'}
        
        share_url = f"http://tower-of-fate.com/replay/{replay_id}"
        
        print(f"[回放系统] 回放 {replay_id} 分享到 {platform}")
        return {
            'success': True,
            'url': share_url,
            'title': f'来看我在《命运之塔》的精彩对局！',
            'thumbnail': '/assets/share_thumbnail.png'
        }


class GuildSystem:
    """战队系统"""
    
    def __init__(self):
        self.guilds = {}  # guild_id -> guild_data
        self.player_guild = {}  # player_id -> guild_id
    
    def create_guild(self, creator_id: str, guild_name: str, guild_tag: str) -> Dict:
        """创建战队"""
        # 检查是否已有战队
        if creator_id in self.player_guild:
            return {'success': False, 'error': '你已加入战队'}
        
        # 检查战队名
        if len(guild_name) < 2 or len(guild_name) > 20:
            return {'success': False, 'error': '战队名长度需在2-20字符'}
        
        guild_id = f"guild_{int(time.time())}_{creator_id}"
        
        guild = {
            'id': guild_id,
            'name': guild_name,
            'tag': guild_tag.upper()[:4],
            'creator': creator_id,
            'leader': creator_id,
            'members': {creator_id: {'role': 'leader', 'joined': int(time.time())}},
            'level': 1,
            'exp': 0,
            'max_members': 20,
            'created_at': int(time.time()),
            'description': '',
            'announcement': ''
        }
        
        self.guilds[guild_id] = guild
        self.player_guild[creator_id] = guild_id
        
        print(f"[战队系统] 战队创建: {guild_name} ({guild_id})")
        return {'success': True, 'guild': guild}
    
    def join_guild(self, player_id: str, guild_id: str) -> Dict:
        """加入战队"""
        if player_id in self.player_guild:
            return {'success': False, 'error': '你已加入战队'}
        
        if guild_id not in self.guilds:
            return {'success': False, 'error': '战队不存在'}
        
        guild = self.guilds[guild_id]
        
        if len(guild['members']) >= guild['max_members']:
            return {'success': False, 'error': '战队已满'}
        
        guild['members'][player_id] = {'role': 'member', 'joined': int(time.time())}
        self.player_guild[player_id] = guild_id
        
        print(f"[战队系统] 玩家 {player_id} 加入战队 {guild['name']}")
        return {'success': True, 'guild': guild}
    
    def leave_guild(self, player_id: str) -> Dict:
        """离开战队"""
        if player_id not in self.player_guild:
            return {'success': False, 'error': '你未加入战队'}
        
        guild_id = self.player_guild[player_id]
        guild = self.guilds.get(guild_id)
        
        if guild:
            # 如果是队长，需要转让或解散
            if guild['leader'] == player_id:
                other_members = [m for m in guild['members'].keys() if m != player_id]
                if other_members:
                    # 转让给最早加入的成员
                    new_leader = min(other_members, key=lambda m: guild['members'][m]['joined'])
                    guild['leader'] = new_leader
                    guild['members'][new_leader]['role'] = 'leader'
                else:
                    # 解散战队
                    del self.guilds[guild_id]
                    print(f"[战队系统] 战队 {guild['name']} 解散")
            
            guild['members'].pop(player_id, None)
        
        del self.player_guild[player_id]
        
        return {'success': True}
    
    def get_guild_info(self, guild_id: str) -> Optional[Dict]:
        """获取战队信息"""
        return self.guilds.get(guild_id)
    
    def get_player_guild(self, player_id: str) -> Optional[Dict]:
        """获取玩家战队"""
        if player_id in self.player_guild:
            guild_id = self.player_guild[player_id]
            return self.guilds.get(guild_id)
        return None
    
    def update_guild_exp(self, guild_id: str, exp: int):
        """更新战队经验"""
        if guild_id not in self.guilds:
            return
        
        guild = self.guilds[guild_id]
        guild['exp'] += exp
        
        # 检查升级
        exp_needed = guild['level'] * 1000
        while guild['exp'] >= exp_needed:
            guild['exp'] -= exp_needed
            guild['level'] += 1
            guild['max_members'] += 5
            exp_needed = guild['level'] * 1000
            print(f"[战队系统] 战队 {guild['name']} 升级到 Lv.{guild['level']}")


class EmojiSystem:
    """表情包系统"""
    
    DEFAULT_EMOJIS = [
        {'id': 'emoji_hello', 'emoji': '👋', 'name': '打招呼'},
        {'id': 'emoji_laugh', 'emoji': '😂', 'name': '大笑'},
        {'id': 'emoji_cry', 'emoji': '😭', 'name': '哭泣'},
        {'id': 'emoji_angry', 'emoji': '😡', 'name': '生气'},
        {'id': 'emoji_love', 'emoji': '❤️', 'name': '爱心'},
        {'id': 'emoji_fire', 'emoji': '🔥', 'name': '火力全开'}
    ]
    
    PREMIUM_EMOJIS = [
        {'id': 'emoji_troll', 'emoji': '🤡', 'name': '小丑', 'price': 500},
        {'id': 'emoji_ghost', 'emoji': '👻', 'name': '幽灵', 'price': 500},
        {'id': 'emoji_king', 'emoji': '👑', 'name': '王者', 'price': 1000},
        {'id': 'emoji_money', 'emoji': '💰', 'name': '发财', 'price': 800}
    ]
    
    def __init__(self):
        self.player_emojis = {}  # player_id -> {owned, equipped}
    
    def get_player_emojis(self, player_id: str) -> Dict:
        """获取玩家表情包"""
        if player_id not in self.player_emojis:
            # 默认拥有基础表情
            self.player_emojis[player_id] = {
                'owned': ['emoji_hello', 'emoji_laugh', 'emoji_cry', 'emoji_angry', 'emoji_love', 'emoji_fire'],
                'favorites': ['emoji_hello', 'emoji_laugh']
            }
        
        return self.player_emojis[player_id]
    
    def get_shop_emojis(self) -> List[Dict]:
        """获取商店表情包"""
        return self.PREMIUM_EMOJIS
    
    def buy_emoji(self, player_id: str, emoji_id: str, player_coins: int) -> Dict:
        """购买表情包"""
        emoji = next((e for e in self.PREMIUM_EMOJIS if e['id'] == emoji_id), None)
        
        if not emoji:
            return {'success': False, 'error': '表情包不存在'}
        
        if player_coins < emoji['price']:
            return {'success': False, 'error': '金币不足'}
        
        player_data = self.get_player_emojis(player_id)
        
        if emoji_id in player_data['owned']:
            return {'success': False, 'error': '已拥有'}
        
        player_data['owned'].append(emoji_id)
        
        return {'success': True, 'emoji': emoji, 'cost': emoji['price']}
    
    def send_emoji(self, player_id: str, emoji_id: str) -> Dict:
        """发送表情包"""
        player_data = self.get_player_emojis(player_id)
        
        if emoji_id not in player_data['owned']:
            return {'success': False, 'error': '未拥有该表情包'}
        
        # 找到表情包
        all_emojis = self.DEFAULT_EMOJIS + self.PREMIUM_EMOJIS
        emoji = next((e for e in all_emojis if e['id'] == emoji_id), None)
        
        if emoji:
            return {'success': True, 'emoji': emoji}
        
        return {'success': False, 'error': '表情包不存在'}


class TutorialSystem:
    """新手引导系统"""
    
    TUTORIAL_STEPS = [
        {
            'id': 'welcome',
            'title': '欢迎来到命运之塔',
            'content': '这是一款4人卡牌对战游戏，目标是第一个登顶第13层！',
            'highlight': None,
            'reward': {'coins': 100}
        },
        {
            'id': 'hand',
            'title': '你的手牌',
            'content': '这是你当前的手牌，点击选择一张出牌。',
            'highlight': 'handContainer',
            'reward': {'coins': 50}
        },
        {
            'id': 'guard',
            'title': '守卫牌',
            'content': '守卫牌会随机出现，如果你的牌花色或数字与守卫牌匹配，就能晋级！',
            'highlight': 'guardAvatar',
            'reward': {'coins': 50}
        },
        {
            'id': 'destiny',
            'title': '天命牌',
            'content': '到达第4、8、12层时可以使用天命牌，获得特殊能力！',
            'highlight': 'destinyCards',
            'reward': {'coins': 100}
        },
        {
            'id': 'complete',
            'title': '开始游戏',
            'content': '现在你已经掌握了基本规则，去赢得胜利吧！',
            'highlight': None,
            'reward': {'coins': 200, 'diamonds': 10}
        }
    ]
    
    def __init__(self):
        self.player_progress = {}  # player_id -> {completed_steps, current_step}
    
    def get_tutorial_progress(self, player_id: str) -> Dict:
        """获取引导进度"""
        if player_id not in self.player_progress:
            self.player_progress[player_id] = {
                'completed': [],
                'current': 0,
                'finished': False
            }
        
        return self.player_progress[player_id]
    
    def get_current_step(self, player_id: str) -> Optional[Dict]:
        """获取当前引导步骤"""
        progress = self.get_tutorial_progress(player_id)
        
        if progress['finished']:
            return None
        
        if progress['current'] < len(self.TUTORIAL_STEPS):
            return self.TUTORIAL_STEPS[progress['current']]
        
        return None
    
    def complete_step(self, player_id: str, step_id: str) -> Dict:
        """完成引导步骤"""
        progress = self.get_tutorial_progress(player_id)
        
        if step_id in progress['completed']:
            return {'success': False, 'error': '步骤已完成'}
        
        # 找到步骤
        step = next((s for s in self.TUTORIAL_STEPS if s['id'] == step_id), None)
        
        if not step:
            return {'success': False, 'error': '步骤不存在'}
        
        progress['completed'].append(step_id)
        progress['current'] += 1
        
        # 检查是否完成所有步骤
        if progress['current'] >= len(self.TUTORIAL_STEPS):
            progress['finished'] = True
        
        print(f"[新手引导] 玩家 {player_id} 完成步骤: {step_id}")
        return {
            'success': True,
            'completed': step_id,
            'reward': step.get('reward', {}),
            'next_step': self.get_current_step(player_id)
        }
    
    def skip_tutorial(self, player_id: str):
        """跳过引导"""
        progress = self.get_tutorial_progress(player_id)
        progress['finished'] = True
        return {'success': True}


# 全局实例
spectator_system = SpectatorSystem()
replay_system = ReplaySystem()
guild_system = GuildSystem()
emoji_system = EmojiSystem()
tutorial_system = TutorialSystem()
