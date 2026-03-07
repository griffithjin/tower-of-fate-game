"""
Tower of Fate - 角色职业系统
战士/法师/盗贼/牧师，各职业专属技能
"""
from typing import Dict, List, Optional

class CharacterClass:
    """角色职业系统"""
    
    CLASSES = {
        'warrior': {
            'id': 'warrior',
            'name': '战士',
            'icon': '⚔️',
            'desc': '勇猛无畏的战士，擅长正面交锋',
            'color': '#ff6b6b',
            'base_hp': 120,
            'base_gold': 100,
            'passive': {
                'name': '坚韧不拔',
                'desc': '受到的伤害减少15%'
            },
            'skills': [
                {
                    'id': 'warrior_skill_1',
                    'name': '狂暴打击',
                    'desc': '本回合攻击+50%，但下回合不能出牌',
                    'cooldown': 3,
                    'cost': 0
                },
                {
                    'id': 'warrior_skill_2',
                    'name': '铁壁防御',
                    'desc': '本回合免疫所有伤害',
                    'cooldown': 5,
                    'cost': 0
                },
                {
                    'id': 'warrior_skill_3',
                    'name': '战吼',
                    'desc': '强制所有对手本回合出最小牌',
                    'cooldown': 4,
                    'cost': 0
                }
            ]
        },
        'mage': {
            'id': 'mage',
            'name': '法师',
            'icon': '🔮',
            'desc': '掌控魔法的智者，擅长策略与预判',
            'color': '#4ecdc4',
            'base_hp': 80,
            'base_gold': 150,
            'passive': {
                'name': '智慧之眼',
                'desc': '每回合可以偷看1张守卫牌'
            },
            'skills': [
                {
                    'id': 'mage_skill_1',
                    'name': '预知未来',
                    'desc': '查看接下来3轮的守卫牌',
                    'cooldown': 4,
                    'cost': 0
                },
                {
                    'id': 'mage_skill_2',
                    'name': '魔法置换',
                    'desc': '将手牌全部替换为新牌',
                    'cooldown': 3,
                    'cost': 0
                },
                {
                    'id': 'mage_skill_3',
                    'name': '时间停止',
                    'desc': '额外获得10秒出牌时间',
                    'cooldown': 3,
                    'cost': 0
                }
            ]
        },
        'rogue': {
            'id': 'rogue',
            'name': '盗贼',
            'icon': '🗡️',
            'desc': '神出鬼没的盗贼，擅长偷袭与偷窃',
            'color': '#ffe66d',
            'base_hp': 90,
            'base_gold': 200,
            'passive': {
                'name': '顺手牵羊',
                'desc': '胜利时额外获得50%金币'
            },
            'skills': [
                {
                    'id': 'rogue_skill_1',
                    'name': '偷窃',
                    'desc': '随机偷取对手1张手牌',
                    'cooldown': 3,
                    'cost': 0
                },
                {
                    'id': 'rogue_skill_2',
                    'name': '潜行',
                    'desc': '本回合对手无法看到你的出牌',
                    'cooldown': 4,
                    'cost': 0
                },
                {
                    'id': 'rogue_skill_3',
                    'name': '背刺',
                    'desc': '如果本回合晋级，额外上升1层',
                    'cooldown': 5,
                    'cost': 0
                }
            ]
        },
        'priest': {
            'id': 'priest',
            'name': '牧师',
            'icon': '✨',
            'desc': '仁慈的治愈者，擅长辅助与恢复',
            'color': '#a8e6cf',
            'base_hp': 100,
            'base_gold': 100,
            'passive': {
                'name': '神圣庇护',
                'desc': '失败时损失减半'
            },
            'skills': [
                {
                    'id': 'priest_skill_1',
                    'name': '治愈术',
                    'desc': '恢复30点HP',
                    'cooldown': 3,
                    'cost': 0
                },
                {
                    'id': 'priest_skill_2',
                    'name': '神圣祝福',
                    'desc': '本回合如果晋级，获得2倍积分',
                    'cooldown': 4,
                    'cost': 0
                },
                {
                    'id': 'priest_skill_3',
                    'name': '复活术',
                    'desc': 'HP归零时复活并恢复50%HP(每场1次)',
                    'cooldown': 999,
                    'cost': 0
                }
            ]
        }
    }
    
    def __init__(self):
        self.player_classes = {}  # player_id -> {class_id, level, exp}
    
    def get_all_classes(self) -> List[Dict]:
        """获取所有职业"""
        return list(self.CLASSES.values())
    
    def get_class_info(self, class_id: str) -> Optional[Dict]:
        """获取职业信息"""
        return self.CLASSES.get(class_id)
    
    def select_class(self, player_id: str, class_id: str) -> Dict:
        """选择职业"""
        if class_id not in self.CLASSES:
            return {'success': False, 'error': '职业不存在'}
        
        if player_id in self.player_classes:
            return {'success': False, 'error': '已选择职业，无法更改'}
        
        self.player_classes[player_id] = {
            'class_id': class_id,
            'level': 1,
            'exp': 0,
            'skill_cooldowns': {},
            'used_revive': False  # 牧师的复活术标记
        }
        
        class_info = self.CLASSES[class_id]
        print(f"[职业系统] 玩家 {player_id} 选择职业: {class_info['name']}")
        
        return {
            'success': True,
            'class': class_info,
            'stats': {
                'hp': class_info['base_hp'],
                'gold': class_info['base_gold']
            }
        }
    
    def get_player_class(self, player_id: str) -> Optional[Dict]:
        """获取玩家当前职业"""
        if player_id not in self.player_classes:
            return None
        
        data = self.player_classes[player_id]
        class_info = self.CLASSES[data['class_id']]
        
        return {
            **class_info,
            'level': data['level'],
            'exp': data['exp'],
            'next_level_exp': self._get_next_level_exp(data['level']),
            'skill_cooldowns': data['skill_cooldowns']
        }
    
    def _get_next_level_exp(self, level: int) -> int:
        """获取下一级所需经验"""
        return level * 100
    
    def gain_exp(self, player_id: str, exp: int) -> Dict:
        """获得经验"""
        if player_id not in self.player_classes:
            return {'success': False, 'error': '未选择职业'}
        
        data = self.player_classes[player_id]
        data['exp'] += exp
        
        # 检查升级
        level_up = False
        while data['exp'] >= self._get_next_level_exp(data['level']):
            data['exp'] -= self._get_next_level_exp(data['level'])
            data['level'] += 1
            level_up = True
            print(f"[职业系统] 玩家 {player_id} 职业升级至 Lv.{data['level']}")
        
        return {
            'success': True,
            'exp_gained': exp,
            'level_up': level_up,
            'new_level': data['level'] if level_up else None
        }
    
    def use_skill(self, player_id: str, skill_id: str) -> Dict:
        """使用技能"""
        if player_id not in self.player_classes:
            return {'success': False, 'error': '未选择职业'}
        
        data = self.player_classes[player_id]
        class_info = self.CLASSES[data['class_id']]
        
        # 找到技能
        skill = next((s for s in class_info['skills'] if s['id'] == skill_id), None)
        if not skill:
            return {'success': False, 'error': '技能不存在'}
        
        # 检查冷却
        if skill_id in data['skill_cooldowns'] and data['skill_cooldowns'][skill_id] > 0:
            return {'success': False, 'error': f'技能冷却中，还剩{data["skill_cooldowns"][skill_id]}回合'}
        
        # 设置冷却
        data['skill_cooldowns'][skill_id] = skill['cooldown']
        
        # 特殊处理牧师复活术
        if skill_id == 'priest_skill_3':
            if data['used_revive']:
                return {'success': False, 'error': '本局已使用过复活术'}
            data['used_revive'] = True
        
        print(f"[职业系统] 玩家 {player_id} 使用技能: {skill['name']}")
        return {
            'success': True,
            'skill': skill,
            'effect': skill['desc']
        }
    
    def reduce_cooldowns(self, player_id: str):
        """减少技能冷却"""
        if player_id not in self.player_classes:
            return
        
        data = self.player_classes[player_id]
        for skill_id in list(data['skill_cooldowns'].keys()):
            data['skill_cooldowns'][skill_id] -= 1
            if data['skill_cooldowns'][skill_id] <= 0:
                del data['skill_cooldowns'][skill_id]
    
    def reset_for_new_game(self, player_id: str):
        """新游戏重置"""
        if player_id in self.player_classes:
            self.player_classes[player_id]['skill_cooldowns'] = {}
            self.player_classes[player_id]['used_revive'] = False
    
    def get_class_stats(self, class_id: str) -> Dict:
        """获取职业统计"""
        # 统计各职业选择率
        total = len(self.player_classes)
        if total == 0:
            return {}
        
        class_count = {}
        for data in self.player_classes.values():
            cid = data['class_id']
            class_count[cid] = class_count.get(cid, 0) + 1
        
        return {
            'total_players': total,
            'class_distribution': {
                cid: {'count': count, 'percentage': count / total * 100}
                for cid, count in class_count.items()
            }
        }

# 全局实例
character_class = CharacterClass()
