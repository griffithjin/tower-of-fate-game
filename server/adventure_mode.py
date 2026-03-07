"""
Tower of Fate - 冒险模式 (PvE)
50个关卡，AI难度递增，Roguelike元素
"""
import random
import json
from typing import Dict, List, Optional

class AdventureMode:
    """冒险模式系统"""
    
    # 50个关卡配置
    LEVELS = [
        # 初级关卡 (1-10)
        {'id': 1, 'name': '初入塔楼', 'difficulty': 1, 'ai_count': 3, 'special_rule': None, 'reward': {'coins': 100}},
        {'id': 2, 'name': '第一层挑战', 'difficulty': 1, 'ai_count': 3, 'special_rule': None, 'reward': {'coins': 110}},
        {'id': 3, 'name': '机智对决', 'difficulty': 2, 'ai_count': 3, 'special_rule': 'ai_smart', 'reward': {'coins': 120}},
        {'id': 4, 'name': '幸运考验', 'difficulty': 2, 'ai_count': 3, 'special_rule': 'lucky_draw', 'reward': {'coins': 130}},
        {'id': 5, 'name': '守卫试炼', 'difficulty': 2, 'ai_count': 3, 'special_rule': 'guard_reveal', 'reward': {'coins': 140, 'destiny_card': 1}},
        {'id': 6, 'name': '速战速决', 'difficulty': 3, 'ai_count': 3, 'special_rule': 'fast_timer', 'reward': {'coins': 150}},
        {'id': 7, 'name': '卡牌大师', 'difficulty': 3, 'ai_count': 3, 'special_rule': 'card_master', 'reward': {'coins': 160}},
        {'id': 8, 'name': '心理博弈', 'difficulty': 3, 'ai_count': 3, 'special_rule': 'mind_game', 'reward': {'coins': 170}},
        {'id': 9, 'name': '天命降临', 'difficulty': 3, 'ai_count': 3, 'special_rule': 'destiny_rich', 'reward': {'coins': 180, 'destiny_card': 2}},
        {'id': 10, 'name': '初阶结业', 'difficulty': 4, 'ai_count': 3, 'special_rule': 'boss_fight', 'reward': {'coins': 300, 'skin': 'bronze_frame'}},
        
        # 中级关卡 (11-30)
        {'id': 11, 'name': '中级挑战', 'difficulty': 4, 'ai_count': 3, 'special_rule': None, 'reward': {'coins': 200}},
        {'id': 12, 'name': '双人成行', 'difficulty': 4, 'ai_count': 1, 'special_rule': 'coop_mode', 'reward': {'coins': 210}},
        {'id': 13, 'name': '三人成虎', 'difficulty': 4, 'ai_count': 2, 'special_rule': 'triple_threat', 'reward': {'coins': 220}},
        {'id': 14, 'name': '智斗守卫', 'difficulty': 5, 'ai_count': 3, 'special_rule': 'guard_master', 'reward': {'coins': 230}},
        {'id': 15, 'name': '卡牌风暴', 'difficulty': 5, 'ai_count': 3, 'special_rule': 'card_storm', 'reward': {'coins': 240}},
        {'id': 16, 'name': '时间紧迫', 'difficulty': 5, 'ai_count': 3, 'special_rule': 'time_attack', 'reward': {'coins': 250}},
        {'id': 17, 'name': '积分挑战', 'difficulty': 5, 'ai_count': 3, 'special_rule': 'score_challenge', 'reward': {'coins': 260}},
        {'id': 18, 'name': '完美主义', 'difficulty': 5, 'ai_count': 3, 'special_rule': 'perfect_only', 'reward': {'coins': 270}},
        {'id': 19, 'name': '逆转胜', 'difficulty': 6, 'ai_count': 3, 'special_rule': 'comeback', 'reward': {'coins': 280}},
        {'id': 20, 'name': '中级考核', 'difficulty': 6, 'ai_count': 3, 'special_rule': 'mid_boss', 'reward': {'coins': 400, 'skin': 'silver_frame'}},
        
        # 继续生成更多关卡...
        {'id': 21, 'name': '高手进阶', 'difficulty': 6, 'ai_count': 3, 'special_rule': None, 'reward': {'coins': 300}},
        {'id': 22, 'name': '心理战', 'difficulty': 6, 'ai_count': 3, 'special_rule': 'psych_warfare', 'reward': {'coins': 310}},
        {'id': 23, 'name': '速攻战术', 'difficulty': 7, 'ai_count': 3, 'special_rule': 'blitz', 'reward': {'coins': 320}},
        {'id': 24, 'name': '持久战', 'difficulty': 7, 'ai_count': 3, 'special_rule': 'endurance', 'reward': {'coins': 330}},
        {'id': 25, 'name': '精英守卫', 'difficulty': 7, 'ai_count': 3, 'special_rule': 'elite_guard', 'reward': {'coins': 340, 'destiny_card': 3}},
        {'id': 26, 'name': '卡牌艺术', 'difficulty': 7, 'ai_count': 3, 'special_rule': 'art_of_cards', 'reward': {'coins': 350}},
        {'id': 27, 'name': '极限挑战', 'difficulty': 8, 'ai_count': 3, 'special_rule': 'extreme', 'reward': {'coins': 360}},
        {'id': 28, 'name': '智慧试炼', 'difficulty': 8, 'ai_count': 3, 'special_rule': 'wisdom', 'reward': {'coins': 370}},
        {'id': 29, 'name': '勇气考验', 'difficulty': 8, 'ai_count': 3, 'special_rule': 'courage', 'reward': {'coins': 380}},
        {'id': 30, 'name': '高级结业', 'difficulty': 9, 'ai_count': 3, 'special_rule': 'high_boss', 'reward': {'coins': 500, 'skin': 'gold_frame'}},
        
        # 高级关卡 (31-50)
        {'id': 31, 'name': '大师之路', 'difficulty': 9, 'ai_count': 3, 'special_rule': None, 'reward': {'coins': 400}},
        {'id': 32, 'name': '终极对决', 'difficulty': 9, 'ai_count': 3, 'special_rule': 'ultimate', 'reward': {'coins': 420}},
        {'id': 33, 'name': '天命之子', 'difficulty': 9, 'ai_count': 3, 'special_rule': 'destiny_master', 'reward': {'coins': 440, 'destiny_card': 5}},
        {'id': 34, 'name': '塔楼守护者', 'difficulty': 10, 'ai_count': 3, 'special_rule': 'tower_guardian', 'reward': {'coins': 460}},
        {'id': 35, 'name': '传奇挑战', 'difficulty': 10, 'ai_count': 3, 'special_rule': 'legendary', 'reward': {'coins': 480}},
        {'id': 36, 'name': '王者试炼', 'difficulty': 10, 'ai_count': 3, 'special_rule': 'king_trial', 'reward': {'coins': 500}},
        {'id': 37, 'name': '至尊对决', 'difficulty': 10, 'ai_count': 3, 'special_rule': 'supreme', 'reward': {'coins': 520}},
        {'id': 38, 'name': '巅峰之战', 'difficulty': 11, 'ai_count': 3, 'special_rule': 'peak_battle', 'reward': {'coins': 540}},
        {'id': 39, 'name': '传说挑战', 'difficulty': 11, 'ai_count': 3, 'special_rule': 'mythic', 'reward': {'coins': 560}},
        {'id': 40, 'name': '大师考核', 'difficulty': 11, 'ai_count': 3, 'special_rule': 'master_boss', 'reward': {'coins': 800, 'skin': 'crystal_card'}},
        
        # 终极关卡 (41-50)
        {'id': 41, 'name': '地狱难度', 'difficulty': 12, 'ai_count': 3, 'special_rule': 'hell_mode', 'reward': {'coins': 600}},
        {'id': 42, 'name': '无尽挑战', 'difficulty': 12, 'ai_count': 3, 'special_rule': 'endless', 'reward': {'coins': 620}},
        {'id': 43, 'name': '极限突破', 'difficulty': 12, 'ai_count': 3, 'special_rule': 'breakthrough', 'reward': {'coins': 640}},
        {'id': 44, 'name': '神话降临', 'difficulty': 12, 'ai_count': 3, 'special_rule': 'myth_come', 'reward': {'coins': 660}},
        {'id': 45, 'name': '终极试炼', 'difficulty': 13, 'ai_count': 3, 'special_rule': 'final_trial', 'reward': {'coins': 680}},
        {'id': 46, 'name': '命运之战', 'difficulty': 13, 'ai_count': 3, 'special_rule': 'fate_battle', 'reward': {'coins': 700}},
        {'id': 47, 'name': '王者归来', 'difficulty': 13, 'ai_count': 3, 'special_rule': 'king_return', 'reward': {'coins': 720}},
        {'id': 48, 'name': '传说之战', 'difficulty': 14, 'ai_count': 3, 'special_rule': 'legend_battle', 'reward': {'coins': 740}},
        {'id': 49, 'name': '至尊挑战', 'difficulty': 14, 'ai_count': 3, 'special_rule': 'supreme_challenge', 'reward': {'coins': 760}},
        {'id': 50, 'name': '命运之塔·巅峰', 'difficulty': 15, 'ai_count': 3, 'special_rule': 'final_boss', 'reward': {'coins': 2000, 'skin': 'legendary_dragon', 'title': '塔楼征服者'}},
    ]
    
    def __init__(self):
        self.player_progress = {}  # player_id -> {current_level, completed_levels, stars}
    
    def get_level_list(self, player_id: str) -> List[Dict]:
        """获取关卡列表"""
        progress = self.get_player_progress(player_id)
        levels = []
        
        for level in self.LEVELS:
            level_data = {
                **level,
                'status': self._get_level_status(progress, level['id']),
                'stars': progress.get('stars', {}).get(str(level['id']), 0)
            }
            levels.append(level_data)
        
        return levels
    
    def get_player_progress(self, player_id: str) -> Dict:
        """获取玩家进度"""
        if player_id not in self.player_progress:
            self.player_progress[player_id] = {
                'current_level': 1,
                'completed_levels': [],
                'stars': {}
            }
        return self.player_progress[player_id]
    
    def _get_level_status(self, progress: Dict, level_id: int) -> str:
        """获取关卡状态"""
        if level_id in progress.get('completed_levels', []):
            return 'completed'
        elif level_id == progress.get('current_level', 1):
            return 'current'
        elif level_id < progress.get('current_level', 1):
            return 'unlocked'
        else:
            return 'locked'
    
    def start_level(self, player_id: str, level_id: int) -> Dict:
        """开始关卡"""
        progress = self.get_player_progress(player_id)
        
        # 检查是否可以开始
        if level_id > progress.get('current_level', 1):
            return {'success': False, 'error': '前置关卡未解锁'}
        
        level = next((l for l in self.LEVELS if l['id'] == level_id), None)
        if not level:
            return {'success': False, 'error': '关卡不存在'}
        
        return {
            'success': True,
            'level': level,
            'special_rules': self._get_special_rules(level.get('special_rule'))
        }
    
    def _get_special_rules(self, rule_name: Optional[str]) -> Dict:
        """获取特殊规则说明"""
        rules = {
            'ai_smart': {'name': '聪明AI', 'desc': 'AI会采取更聪明的策略'},
            'lucky_draw': {'name': '幸运抽卡', 'desc': '每回合可以重新抽一次牌'},
            'guard_reveal': {'name': '守卫显形', 'desc': '守卫牌会提前显示'},
            'fast_timer': {'name': '极速模式', 'desc': '出牌时间缩短到15秒'},
            'card_master': {'name': '卡牌大师', 'desc': '初始手牌增加2张'},
            'mind_game': {'name': '心理博弈', 'desc': '可以看到对手的部分信息'},
            'destiny_rich': {'name': '天命富足', 'desc': '初始获得5张天命牌'},
            'boss_fight': {'name': 'BOSS战', 'desc': '面对更强的AI对手'},
            'coop_mode': {'name': '合作模式', 'desc': '与AI队友合作对抗'},
            'perfect_only': {'name': '完美主义', 'desc': '只有完美匹配才能晋级'},
            'hell_mode': {'name': '地狱模式', 'desc': '所有难度最大化'},
            'final_boss': {'name': '终极BOSS', 'desc': '命运之塔的最终挑战'}
        }
        return rules.get(rule_name, {})
    
    def complete_level(self, player_id: str, level_id: int, stars: int = 3) -> Dict:
        """完成关卡"""
        progress = self.get_player_progress(player_id)
        level = next((l for l in self.LEVELS if l['id'] == level_id), None)
        
        if not level:
            return {'success': False, 'error': '关卡不存在'}
        
        # 记录完成
        if level_id not in progress['completed_levels']:
            progress['completed_levels'].append(level_id)
        
        # 记录星级 (取最高)
        current_stars = progress['stars'].get(str(level_id), 0)
        progress['stars'][str(level_id)] = max(current_stars, stars)
        
        # 解锁下一关
        if level_id == progress['current_level']:
            progress['current_level'] = level_id + 1
        
        # 发放奖励
        reward = level.get('reward', {})
        
        print(f"[冒险模式] 玩家 {player_id} 完成关卡 {level_id} ({stars}星)")
        return {
            'success': True,
            'reward': reward,
            'next_level': level_id + 1 if level_id < 50 else None,
            'stars_earned': stars
        }
    
    def get_chapter_rewards(self, player_id: str) -> List[Dict]:
        """获取章节奖励"""
        progress = self.get_player_progress(player_id)
        completed = len(progress.get('completed_levels', []))
        
        chapter_rewards = [
            {'chapter': 1, 'levels': 10, 'reward': {'skin': 'bronze_frame'}, 'claimed': completed >= 10},
            {'chapter': 2, 'levels': 20, 'reward': {'skin': 'silver_frame'}, 'claimed': completed >= 20},
            {'chapter': 3, 'levels': 30, 'reward': {'skin': 'gold_frame'}, 'claimed': completed >= 30},
            {'chapter': 4, 'levels': 40, 'reward': {'skin': 'crystal_frame'}, 'claimed': completed >= 40},
            {'chapter': 5, 'levels': 50, 'reward': {'skin': 'legendary_dragon', 'title': '塔楼征服者'}, 'claimed': completed >= 50},
        ]
        
        return chapter_rewards

# 全局实例
adventure_mode = AdventureMode()
