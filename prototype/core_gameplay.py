#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
《首位好运：命运之塔》核心玩法原型
用于验证牌库系统、概率计算、游戏流程
"""

import random
from collections import defaultdict
from enum import Enum
from typing import List, Dict, Tuple, Optional
import json

class Suit(Enum):
    """花色"""
    HEARTS = "♥"      # 红桃
    DIAMONDS = "♦"    # 方块
    CLUBS = "♣"       # 梅花
    SPADES = "♠"      # 黑桃

class Card:
    """卡牌"""
    def __init__(self, suit: Suit, rank: int, copy_id: int):
        self.suit = suit
        self.rank = rank  # 1-13 (A=1, J=11, Q=12, K=13)
        self.copy_id = copy_id  # 1-4 (四副本)
    
    def __repr__(self):
        rank_str = {1: 'A', 11: 'J', 12: 'Q', 13: 'K'}.get(self.rank, str(self.rank))
        return f"{self.suit.value}{rank_str}#{self.copy_id}"
    
    def __eq__(self, other):
        return (self.suit == other.suit and 
                self.rank == other.rank and 
                self.copy_id == other.copy_id)
    
    def matches_rank(self, other: 'Card') -> bool:
        """点数匹配（上升条件）"""
        return self.rank == other.rank
    
    def perfect_match(self, other: 'Card') -> bool:
        """完美匹配（抽卡条件）"""
        return self.suit == other.suit and self.rank == other.rank

class Deck:
    """牌库系统"""
    def __init__(self):
        self.cards: List[Card] = []
        self.discarded: List[Card] = []  # 已消耗的牌
        self.revealed: List[Card] = []   # 守卫已展示的牌
        self._init_deck()
    
    def _init_deck(self):
        """初始化208张牌"""
        for suit in Suit:
            for rank in range(1, 14):
                for copy_id in range(1, 5):
                    self.cards.append(Card(suit, rank, copy_id))
        random.shuffle(self.cards)
    
    def draw_for_guard(self) -> Card:
        """为守卫抽牌（展示后移除）"""
        card = self.cards.pop()
        self.revealed.append(card)
        return card
    
    def discard_player_card(self, card: Card):
        """玩家出牌（永久移除）"""
        self.discarded.append(card)
    
    def get_remaining_count(self) -> int:
        """剩余牌数"""
        return len(self.cards)
    
    def get_rank_distribution(self) -> Dict[int, int]:
        """获取剩余牌库中各点数的分布"""
        dist = defaultdict(int)
        for card in self.cards:
            dist[card.rank] += 1
        return dict(dist)
    
    def get_suit_rank_distribution(self) -> Dict[Tuple[Suit, int], int]:
        """获取剩余牌库中各花色点数的分布"""
        dist = defaultdict(int)
        for card in self.cards:
            dist[(card.suit, card.rank)] += 1
        return dict(dist)
    
    def get_best_rank_choice(self) -> int:
        """获取剩余最多的点数（最优策略）"""
        dist = self.get_rank_distribution()
        if not dist:
            return random.randint(1, 13)
        return max(dist, key=dist.get)

class DestinyCard(Enum):
    """天命卡（11种）"""
    ALL_RISE = "全部可以上"           # 本层所有存活玩家均可上升
    ALL_STAY = "全部不能上"           # 本层所有存活玩家均不能上升
    BRING_ONE = "允许带一位上"        # 指定一名玩家直接上升
    KICK_ONE = "允许踢一位下"         # 指定一名已上升玩家退回
    BRING_TWO = "允许带两位上"        # 指定两名玩家直接上升
    KICK_TWO = "允许踢两位下"         # 指定两名上升玩家退回
    BRING_THREE = "允许带三位上"      # 指定三名玩家直接上升
    KICK_THREE = "允许踢三位下"       # 指定三名上升玩家退回
    PEEK_NEXT = "查看下一层守卫出牌"  # 预知下一层所有守卫的牌
    PEEK_DECK = "查看剩余牌库"        # 查看当前剩余牌库
    FORCE_SWAP = "强制换牌"           # 强制指定玩家与守卫交换手牌

class Player:
    """玩家"""
    def __init__(self, name: str, is_ai: bool = True):
        self.name = name
        self.is_ai = is_ai
        self.level = 1  # 当前层数
        self.destiny_cards: List[DestinyCard] = []
        self.is_alive = True
        self.stats = {
            'rises': 0,           # 上升次数
            'perfect_matches': 0,  # 完美匹配次数
            'destiny_cards_used': 0,
            'games_won': 0
        }
    
    def __repr__(self):
        return f"{self.name}[L{self.level}]{'💀' if not self.is_alive else ''}"

class TowerGame:
    """命运之塔游戏核心"""
    
    def __init__(self, num_players: int = 4):
        self.num_players = num_players
        self.players: List[Player] = []
        self.deck: Deck = None
        self.current_level = 1
        self.guard_cards: List[Card] = []  # 当前层守卫的牌
        self.history: List[Dict] = []  # 游戏历史
        self.winner: Optional[Player] = None
        
        self._init_players()
    
    def _init_players(self):
        """初始化玩家"""
        for i in range(self.num_players):
            self.players.append(Player(f"玩家{i+1}", is_ai=True))
    
    def reset(self):
        """重置游戏"""
        self.deck = Deck()
        self.current_level = 1
        self.guard_cards = []
        self.history = []
        self.winner = None
        for player in self.players:
            player.level = 1
            player.destiny_cards = []
            player.is_alive = True
    
    def start_level(self):
        """开始新的一层"""
        print(f"\n{'='*50}")
        print(f"🏰 第 {self.current_level} 层")
        print(f"剩余牌库: {self.deck.get_remaining_count()} 张")
        print(f"{'='*50}")
        
        # 为4位守卫抽牌
        self.guard_cards = []
        for i in range(4):
            if self.deck.get_remaining_count() > 0:
                card = self.deck.draw_for_guard()
                self.guard_cards.append(card)
                print(f"  守卫{i+1}: {card}")
        
        # AI选择出牌
        self._ai_play()
    
    def _ai_play(self):
        """AI玩家出牌"""
        level_result = {
            'level': self.current_level,
            'guard_cards': [str(c) for c in self.guard_cards],
            'plays': []
        }
        
        # 获取剩余牌分布
        rank_dist = self.deck.get_rank_distribution()
        best_rank = self.deck.get_best_rank_choice()
        
        for i, player in enumerate(self.players):
            if not player.is_alive:
                continue
            
            guard_card = self.guard_cards[i]
            
            # AI策略：选择剩余最多的点数（最优策略）
            # 或者随机选择
            if random.random() < 0.7:  # 70%概率使用最优策略
                chosen_rank = best_rank
            else:
                chosen_rank = random.randint(1, 13)
            
            # 随机选择花色
            chosen_suit = random.choice(list(Suit))
            # 随机选择副本（实际游戏中玩家手牌有限）
            chosen_copy = random.randint(1, 4)
            
            player_card = Card(chosen_suit, chosen_rank, chosen_copy)
            
            # 检查是否上升
            rises = player_card.matches_rank(guard_card)
            perfect = player_card.perfect_match(guard_card)
            
            # 消耗玩家牌
            self.deck.discard_player_card(player_card)
            
            play_info = {
                'player': player.name,
                'card': str(player_card),
                'guard_card': str(guard_card),
                'rises': rises,
                'perfect_match': perfect
            }
            
            if rises:
                player.level += 1
                player.stats['rises'] += 1
                print(f"  ✅ {player.name}: 出{player_card} vs 守卫{guard_card} → 上升！")
                
                # 检查胜利
                if player.level > 13:
                    self.winner = player
                    player.stats['games_won'] += 1
                    print(f"\n🎉 {player.name} 通关13层，获得首位好运！")
            else:
                print(f"  ❌ {player.name}: 出{player_card} vs 守卫{guard_card} → 失败")
            
            if perfect:
                # 完美匹配获得天命卡
                destiny = random.choice(list(DestinyCard))
                player.destiny_cards.append(destiny)
                player.stats['perfect_matches'] += 1
                play_info['destiny_card'] = destiny.value
                print(f"     ✨ 完美匹配！获得天命卡：{destiny.value}")
            
            level_result['plays'].append(play_info)
        
        self.history.append(level_result)
    
    def run_game(self, verbose: bool = True) -> Dict:
        """运行完整游戏"""
        self.reset()
        
        if verbose:
            print("\n🎮 命运之塔游戏开始！")
            print(f"初始牌库: {self.deck.get_remaining_count()} 张")
        
        max_rounds = 13
        for level in range(1, max_rounds + 1):
            self.current_level = level
            self.start_level()
            
            if self.winner:
                break
            
            if self.deck.get_remaining_count() < 8:
                if verbose:
                    print(f"\n⚠️ 牌库耗尽，游戏结束")
                break
        
        if not self.winner and verbose:
            # 找出最高层玩家
            max_level = max(p.level for p in self.players)
            leaders = [p for p in self.players if p.level == max_level]
            print(f"\n🏁 游戏结束，无人通关")
            print(f"最高层数: {max_level}, 领先者: {', '.join(p.name for p in leaders)}")
        
        return self._get_game_stats()
    
    def _get_game_stats(self) -> Dict:
        """获取游戏统计"""
        return {
            'winner': self.winner.name if self.winner else None,
            'total_levels': self.current_level,
            'remaining_cards': self.deck.get_remaining_count(),
            'player_stats': [
                {
                    'name': p.name,
                    'final_level': p.level,
                    'rises': p.stats['rises'],
                    'perfect_matches': p.stats['perfect_matches'],
                    'destiny_cards': len(p.destiny_cards)
                }
                for p in self.players
            ]
        }

def run_simulation(num_games: int = 1000):
    """运行模拟测试"""
    print(f"\n{'='*60}")
    print(f"🧮 运行 {num_games} 场模拟测试")
    print(f"{'='*60}")
    
    wins = 0
    total_levels = 0
    total_perfect_matches = 0
    total_destiny_cards = 0
    
    for i in range(num_games):
        game = TowerGame(num_players=4)
        stats = game.run_game(verbose=False)
        
        if stats['winner']:
            wins += 1
        
        total_levels += stats['total_levels']
        for p in stats['player_stats']:
            total_perfect_matches += p['perfect_matches']
            total_destiny_cards += p['destiny_cards']
        
        if (i + 1) % 100 == 0:
            print(f"  已完成 {i+1}/{num_games} 场...")
    
    print(f"\n{'='*60}")
    print("📊 模拟结果统计")
    print(f"{'='*60}")
    print(f"总场次: {num_games}")
    print(f"通关场次: {wins}")
    print(f"通关率: {wins/num_games*100:.4f}%")
    print(f"平均完成层数: {total_levels/num_games:.2f}")
    print(f"平均每场完美匹配: {total_perfect_matches/num_games:.4f}")
    print(f"平均每场天命卡: {total_destiny_cards/num_games:.4f}")
    
    # 理论值对比
    print(f"\n📐 理论值对比")
    print(f"理论完美匹配率（每层）: 1/52 ≈ {1/52*100:.4f}%")
    print(f"理论期望完美匹配（每场）: 13 × 1/52 = {13/52:.4f}")
    print(f"实际观察完美匹配（每场）: {total_perfect_matches/num_games:.4f}")

if __name__ == "__main__":
    # 运行一场详细演示
    print("\n" + "="*60)
    print("🎮 《首位好运：命运之塔》核心玩法演示")
    print("="*60)
    
    game = TowerGame(num_players=4)
    game.run_game(verbose=True)
    
    # 运行大规模模拟
    print("\n")
    run_simulation(num_games=1000)
