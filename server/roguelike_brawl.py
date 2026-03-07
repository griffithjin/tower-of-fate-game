"""
Tower of Fate - Roguelike爬塔模式 + 每周乱斗
永久死亡、随机卡牌、每周特殊规则
"""
import random
import time
from typing import Dict, List, Optional

class RoguelikeMode:
    """Roguelike爬塔模式"""
    
    # 塔层配置
    TOWER_FLOORS = 50
    
    # 随机事件
    EVENTS = [
        {'id': 'rest', 'name': ' campfire', 'desc': '恢复所有生命值', 'type': 'heal'},
        {'id': 'shop', 'name': '神秘商店', 'desc': '购买特殊道具', 'type': 'shop'},
        {'id': 'elite', 'name': '精英战斗', 'desc': '高难度战斗，高奖励', 'type': 'combat'},
        {'id': 'treasure', 'name': '宝藏房间', 'desc': '获得随机奖励', 'type': 'treasure'},
        {'id': 'shrine', 'name': '神秘祭坛', 'desc': '付出代价获得力量', 'type': 'shrine'},
        {'id': 'gamble', 'name': '赌博', 'desc': '赌一把运气', 'type': 'gamble'},
    ]
    
    # 遗物效果
    RELICS = [
        {'id': 'relic_1', 'name': '幸运硬币', 'effect': '抽卡时有20%概率额外抽一张', 'rarity': 'common'},
        {'id': 'relic_2', 'name': '守护护符', 'effect': '减少受到的伤害25%', 'rarity': 'common'},
        {'id': 'relic_3', 'name': '时光沙漏', 'effect': '每回合额外5秒思考时间', 'rarity': 'uncommon'},
        {'id': 'relic_4', 'name': '贪婪之手', 'effect': '胜利时获得50%额外金币', 'rarity': 'uncommon'},
        {'id': 'relic_5', 'name': '命运之轮', 'effect': '可以重新roll一次守卫牌', 'rarity': 'rare'},
        {'id': 'relic_6', 'name': '王者之证', 'effect': '初始层数+1', 'rarity': 'rare'},
        {'id': 'relic_7', 'name': '永恒之心', 'effect': '死亡时复活一次，保留50%积分', 'rarity': 'legendary'},
        {'id': 'relic_8', 'name': '神之手', 'effect': '每3回合可以偷看守卫牌', 'rarity': 'legendary'},
    ]
    
    def __init__(self):
        self.active_runs = {}  # player_id -> run_data
        self.leaderboard = []  # 爬塔排行榜
    
    def start_run(self, player_id: str, difficulty: str = 'normal') -> Dict:
        """开始一次爬塔"""
        run = {
            'player_id': player_id,
            'start_time': int(time.time()),
            'floor': 1,
            'max_floor': 0,
            'hp': 100,
            'max_hp': 100,
            'gold': 100,
            'relics': [],
            'deck': self._generate_starting_deck(),
            'destiny_cards': ['全军突击', '换牌', '看牌'],
            'difficulty': difficulty,
            'status': 'active',
            'events_completed': []
        }
        
        self.active_runs[player_id] = run
        
        print(f"[Roguelike] 玩家 {player_id} 开始爬塔，难度: {difficulty}")
        return {
            'success': True,
            'run': run,
            'first_floor': self._generate_floor(1, difficulty)
        }
    
    def _generate_starting_deck(self) -> List[Dict]:
        """生成初始卡组"""
        suits = ['♥', '♦', '♣', '♠']
        ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
        deck = [{'suit': s, 'rank': r} for s in suits for r in ranks]
        random.shuffle(deck)
        return deck[:20]  # 初始20张牌
    
    def _generate_floor(self, floor_num: int, difficulty: str) -> Dict:
        """生成楼层"""
        # 每10层一个BOSS
        is_boss = floor_num % 10 == 0
        
        # 随机事件 (30%概率)
        has_event = random.random() < 0.3 and not is_boss
        event = random.choice(self.EVENTS) if has_event else None
        
        floor = {
            'number': floor_num,
            'type': 'boss' if is_boss else 'normal',
            'event': event,
            'guard_card': self._generate_guard_card(difficulty),
            'enemies': self._generate_enemies(floor_num, difficulty, is_boss),
            'rewards': self._calculate_rewards(floor_num, is_boss)
        }
        
        return floor
    
    def _generate_guard_card(self, difficulty: str) -> Dict:
        """生成守卫牌"""
        suits = ['♥', '♦', '♣', '♠']
        ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
        return {
            'suit': random.choice(suits),
            'rank': random.choice(ranks)
        }
    
    def _generate_enemies(self, floor: int, difficulty: str, is_boss: bool) -> List[Dict]:
        """生成敌人"""
        if is_boss:
            return [{'name': f'第{floor}层守护者', 'hp': 200 + floor * 10, 'difficulty': difficulty}]
        
        enemy_count = min(3, 1 + floor // 15)
        enemies = []
        for i in range(enemy_count):
            enemies.append({
                'name': f'敌人{i+1}',
                'hp': 50 + floor * 5,
                'difficulty': difficulty
            })
        return enemies
    
    def _calculate_rewards(self, floor: int, is_boss: bool) -> Dict:
        """计算奖励"""
        base_gold = 20 + floor * 5
        if is_boss:
            base_gold *= 3
            return {
                'gold': base_gold,
                'relic_choice': 3,  # 选择1个遗物
                'heal': 30
            }
        return {
            'gold': base_gold,
            'card_choice': 3,  # 选择1张卡加入卡组
            'heal': 10
        }
    
    def climb_floor(self, player_id: str, result: str) -> Dict:
        """爬升楼层"""
        if player_id not in self.active_runs:
            return {'success': False, 'error': '没有进行中的爬塔'}
        
        run = self.active_runs[player_id]
        
        if result == 'win':
            # 胜利，获得奖励
            rewards = self._calculate_rewards(run['floor'], run['floor'] % 10 == 0)
            run['gold'] += rewards['gold']
            run['max_floor'] = max(run['max_floor'], run['floor'])
            run['hp'] = min(run['max_hp'], run['hp'] + rewards.get('heal', 0))
            
            # 检查是否通关
            if run['floor'] >= self.TOWER_FLOORS:
                return self._complete_run(player_id, True)
            
            run['floor'] += 1
            next_floor = self._generate_floor(run['floor'], run['difficulty'])
            
            return {
                'success': True,
                'result': 'win',
                'rewards': rewards,
                'next_floor': next_floor,
                'run': run
            }
        
        elif result == 'lose':
            # 失败，扣除HP
            damage = 20
            run['hp'] -= damage
            
            if run['hp'] <= 0:
                # 死亡，爬塔结束
                return self._complete_run(player_id, False)
            
            return {
                'success': True,
                'result': 'lose',
                'damage': damage,
                'hp': run['hp'],
                'max_hp': run['max_hp'],
                'retry': True
            }
    
    def choose_relic(self, player_id: str, relic_id: str) -> Dict:
        """选择遗物"""
        if player_id not in self.active_runs:
            return {'success': False, 'error': '没有进行中的爬塔'}
        
        run = self.active_runs[player_id]
        relic = next((r for r in self.RELICS if r['id'] == relic_id), None)
        
        if relic:
            run['relics'].append(relic)
            return {'success': True, 'relic': relic}
        
        return {'success': False, 'error': '遗物不存在'}
    
    def _complete_run(self, player_id: str, success: bool) -> Dict:
        """完成爬塔"""
        run = self.active_runs[player_id]
        run['status'] = 'completed'
        run['end_time'] = int(time.time())
        
        # 计算最终奖励
        final_reward = {
            'gold': run['gold'],
            'max_floor': run['max_floor'],
            'success': success
        }
        
        # 添加到排行榜
        self._update_leaderboard(player_id, run)
        
        # 清理进行中的数据
        del self.active_runs[player_id]
        
        print(f"[Roguelike] 玩家 {player_id} 完成爬塔，最高: {run['max_floor']}层")
        return {
            'success': True,
            'completed': True,
            'victory': success,
            'reward': final_reward,
            'stats': run
        }
    
    def _update_leaderboard(self, player_id: str, run: Dict):
        """更新排行榜"""
        entry = {
            'player_id': player_id,
            'max_floor': run['max_floor'],
            'difficulty': run['difficulty'],
            'timestamp': run['end_time'],
            'relics_count': len(run['relics'])
        }
        
        self.leaderboard.append(entry)
        self.leaderboard.sort(key=lambda x: (-x['max_floor'], x['timestamp']))
        self.leaderboard = self.leaderboard[:100]  # 只保留前100


class BrawlMode:
    """每周乱斗模式"""
    
    # 乱斗规则库
    BRAWL_RULES = [
        {
            'id': 'red_only',
            'name': '红色狂潮',
            'desc': '只能出红色牌(♥♦)，其他颜色无法出牌',
            'modifier': 'color_restrict',
            'params': {'allowed_colors': ['♥', '♦']},
            'reward_bonus': 1.5
        },
        {
            'id': 'double_points',
            'name': '双倍积分',
            'desc': '所有积分获取翻倍',
            'modifier': 'double_score',
            'params': {'multiplier': 2},
            'reward_bonus': 2.0
        },
        {
            'id': 'fast_mode',
            'name': '极速模式',
            'desc': '每回合只有10秒出牌时间',
            'modifier': 'fast_timer',
            'params': {'timer': 10},
            'reward_bonus': 1.8
        },
        {
            'id': 'destiny_rain',
            'name': '天命降临',
            'desc': '每回合获得1张天命牌',
            'modifier': 'destiny_rich',
            'params': {'destiny_per_round': 1},
            'reward_bonus': 1.5
        },
        {
            'id': 'perfect_challenge',
            'name': '完美挑战',
            'desc': '只有完美匹配才能晋级',
            'modifier': 'perfect_only',
            'params': {},
            'reward_bonus': 2.5
        },
        {
            'id': 'reverse_tower',
            'name': '倒塔挑战',
            'desc': '从13层开始，下降到1层获胜',
            'modifier': 'reverse',
            'params': {'start_level': 13, 'goal': 'down'},
            'reward_bonus': 2.0
        },
        {
            'id': 'hand_limit',
            'name': '手牌限制',
            'desc': '只能保留3张手牌',
            'modifier': 'hand_limit',
            'params': {'max_hand': 3},
            'reward_bonus': 1.8
        },
        {
            'id': 'random_guard',
            'name': '随机守卫',
            'desc': '守卫牌每回合随机变化',
            'modifier': 'random_guard',
            'params': {},
            'reward_bonus': 2.0
        },
        {
            'id': 'team_brawl',
            'name': '团队乱斗',
            'desc': '2v2团队对抗，队友共享层数',
            'modifier': 'team_mode',
            'params': {'team_size': 2},
            'reward_bonus': 1.5
        },
        {
            'id': 'boss_rush',
            'name': 'BOSS连战',
            'desc': '连续挑战3个强力AI BOSS',
            'modifier': 'boss_rush',
            'params': {'boss_count': 3},
            'reward_bonus': 3.0
        },
        {
            'id': 'no_destiny',
            'name': '无天命挑战',
            'desc': '无法使用天命牌，纯靠技术',
            'modifier': 'no_destiny',
            'params': {},
            'reward_bonus': 2.0
        },
        {
            'id': 'all_in',
            'name': 'All in',
            'desc': '每回合必须出完所有手牌',
            'modifier': 'all_in',
            'params': {},
            'reward_bonus': 2.2
        }
    ]
    
    def __init__(self):
        self.current_brawl = None
        self.brawl_history = []
        self.player_rewards = {}  # player_id -> {week, claimed}
        self._generate_weekly_brawl()
    
    def _generate_weekly_brawl(self):
        """生成本周乱斗"""
        # 每周一更新
        brawl = random.choice(self.BRAWL_RULES)
        self.current_brawl = {
            **brawl,
            'week': self._get_current_week(),
            'start_time': int(time.time()),
            'end_time': int(time.time()) + 7 * 86400,  # 7天
            'participants': 0
        }
        print(f"[乱斗模式] 本周乱斗: {brawl['name']}")
    
    def _get_current_week(self) -> int:
        """获取当前周数"""
        return int(time.time()) // (7 * 86400)
    
    def get_current_brawl(self) -> Optional[Dict]:
        """获取当前乱斗"""
        # 检查是否需要更新
        if self.current_brawl and self.current_brawl['week'] != self._get_current_week():
            self._generate_weekly_brawl()
        return self.current_brawl
    
    def join_brawl(self, player_id: str) -> Dict:
        """参加乱斗"""
        brawl = self.get_current_brawl()
        if not brawl:
            return {'success': False, 'error': '当前没有乱斗活动'}
        
        self.current_brawl['participants'] += 1
        
        return {
            'success': True,
            'brawl': brawl,
            'rules': self._get_brawl_rules(brawl['modifier'])
        }
    
    def _get_brawl_rules(self, modifier: str) -> str:
        """获取乱斗规则说明"""
        rules = {
            'color_restrict': '只能出指定颜色的牌',
            'double_score': '积分翻倍',
            'fast_timer': '时间限制缩短',
            'destiny_rich': '天命牌 abundance',
            'perfect_only': '只有完美匹配有效',
            'reverse': '逆向爬塔',
            'hand_limit': '手牌数量限制',
            'random_guard': '守卫牌随机变化',
            'team_mode': '团队模式',
            'boss_rush': 'BOSS连战',
            'no_destiny': '禁用天命牌',
            'all_in': '必须出完手牌'
        }
        return rules.get(modifier, '标准规则')
    
    def complete_brawl(self, player_id: str, result: str, rank: int = 1) -> Dict:
        """完成乱斗"""
        brawl = self.get_current_brawl()
        
        # 计算奖励
        base_reward = 100
        reward = base_reward * brawl['reward_bonus']
        
        if result == 'win':
            reward *= 2
        elif rank <= 3:
            reward *= 1.5
        
        # 检查本周是否已领取
        week_key = f"{player_id}_{brawl['week']}"
        first_clear = week_key not in self.player_rewards
        
        if first_clear:
            self.player_rewards[week_key] = {
                'claimed': True,
                'timestamp': int(time.time()),
                'rank': rank
            }
            # 首通额外奖励
            reward += 200
        
        return {
            'success': True,
            'result': result,
            'rank': rank,
            'reward': {'coins': int(reward)},
            'first_clear': first_clear
        }

# 全局实例
roguelike_mode = RoguelikeMode()
brawl_mode = BrawlMode()
