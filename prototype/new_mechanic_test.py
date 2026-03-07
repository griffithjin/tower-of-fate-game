#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
《首位好运：命运之塔》新机制验证
4人共同面对1个守卫 + 手牌系统
"""

import random
from collections import defaultdict
from enum import Enum
from typing import List, Dict, Tuple, Optional

class Suit(Enum):
    """花色"""
    HEARTS = "♥"      # 红桃
    DIAMONDS = "♦"    # 方块
    CLUBS = "♣"       # 梅花
    SPADES = "♠"      # 黑桃

class Card:
    """卡牌"""
    def __init__(self, suit: Suit, rank: int):
        self.suit = suit
        self.rank = rank  # 1-13 (A=1, J=11, Q=12, K=13)
    
    def __repr__(self):
        rank_str = {1: 'A', 11: 'J', 12: 'Q', 13: 'K'}.get(self.rank, str(self.rank))
        return f"{self.suit.value}{rank_str}"
    
    def matches_suit(self, other: 'Card') -> bool:
        """花色匹配（上升条件）"""
        return self.suit == other.suit
    
    def perfect_match(self, other: 'Card') -> bool:
        """完美匹配（抽卡条件）"""
        return self.suit == other.suit and self.rank == other.rank

class Deck:
    """52张牌库"""
    def __init__(self):
        self.cards: List[Card] = []
        self.discarded: List[Card] = []
        self._init_deck()
    
    def _init_deck(self):
        """初始化52张牌（无副本）"""
        for suit in Suit:
            for rank in range(1, 14):
                self.cards.append(Card(suit, rank))
        random.shuffle(self.cards)
    
    def draw_for_guard(self) -> Card:
        """为守卫抽牌"""
        return self.cards.pop()
    
    def draw_hand(self, count: int = 5) -> List[Card]:
        """抽取手牌"""
        hand = []
        for _ in range(min(count, len(self.cards))):
            hand.append(self.cards.pop())
        return hand
    
    def get_remaining_count(self) -> int:
        return len(self.cards)

class DestinyCard(Enum):
    """天命卡（11种）"""
    ALL_RISE = "全部可以上"
    ALL_STAY = "全部不能上"
    BRING_ONE = "允许带一位上"
    KICK_ONE = "允许踢一位下"
    BRING_TWO = "允许带两位上"
    KICK_TWO = "允许踢两位下"
    BRING_THREE = "允许带三位上"
    KICK_THREE = "允许踢三位下"
    PEEK_NEXT = "查看下一层守卫出牌"
    PEEK_DECK = "查看剩余牌库"
    FORCE_SWAP = "强制换牌"

class Player:
    """玩家"""
    def __init__(self, name: str, is_ai: bool = True):
        self.name = name
        self.is_ai = is_ai
        self.level = 1
        self.hand: List[Card] = []
        self.destiny_cards: List[DestinyCard] = []
        self.is_alive = True
        self.stats = {
            'rises': 0,
            'perfect_matches': 0,
            'destiny_cards_received': 0,
            'games_won': 0
        }
    
    def __repr__(self):
        return f"{self.name}[L{self.level}]"
    
    def ai_select_card(self, strategy: str = "smart") -> Optional[Card]:
        """AI选择出牌"""
        if not self.hand:
            return None
        
        if strategy == "random":
            return random.choice(self.hand)
        
        # 智能策略：随机选一张（因为不知道守卫牌）
        # 实际游戏中，AI应该基于概率和记忆选择
        return random.choice(self.hand)

class TowerGameNew:
    """新机制游戏核心"""
    
    def __init__(self, num_players: int = 4):
        self.num_players = num_players
        self.players: List[Player] = []
        self.deck: Deck = None
        self.current_level = 1
        self.guard_card: Card = None
        self.winner: Optional[Player] = None
        
        self._init_players()
    
    def _init_players(self):
        for i in range(self.num_players):
            self.players.append(Player(f"玩家{i+1}", is_ai=True))
    
    def reset(self):
        self.deck = Deck()
        self.current_level = 1
        self.guard_card = None
        self.winner = None
        for player in self.players:
            player.level = 1
            player.hand = []
            player.destiny_cards = []
            player.is_alive = True
    
    def deal_hands(self):
        """发手牌（每人5张）"""
        for player in self.players:
            player.hand = self.deck.draw_hand(5)
    
    def start_level(self):
        """开始新的一层"""
        # 补充手牌至5张
        for player in self.players:
            needed = 5 - len(player.hand)
            if needed > 0 and self.deck.get_remaining_count() >= needed:
                player.hand.extend(self.deck.draw_hand(needed))
        
        # 守卫抽牌
        if self.deck.get_remaining_count() > 0:
            self.guard_card = self.deck.draw_for_guard()
        else:
            return False
        
        return True
    
    def play_round(self, verbose: bool = True):
        """进行一轮"""
        if verbose:
            print(f"\n{'='*50}")
            print(f"🏰 第 {self.current_level} 层")
            print(f"守卫牌: {self.guard_card}")
            print(f"剩余牌库: {self.deck.get_remaining_count()} 张")
        
        # 记录结果
        results = []
        
        # 玩家出牌（同时出）
        plays = {}
        for player in self.players:
            if player.hand:
                card = player.ai_select_card()
                plays[player] = card
                player.hand.remove(card)
            else:
                plays[player] = None
        
        # 判定
        for player, card in plays.items():
            if card is None:
                result = "无牌"
            elif card.perfect_match(self.guard_card):
                result = "完美匹配"
                player.level += 1
                player.stats['rises'] += 1
                player.stats['perfect_matches'] += 1
                # 获得天命卡
                destiny = random.choice(list(DestinyCard))
                player.destiny_cards.append(destiny)
                player.stats['destiny_cards_received'] += 1
            elif card.matches_suit(self.guard_card):
                result = "花色匹配"
                player.level += 1
                player.stats['rises'] += 1
            else:
                result = "失败"
            
            results.append((player, card, result))
            
            if verbose:
                card_str = str(card) if card else "无牌"
                status = ""
                if result == "完美匹配":
                    status = f"✨ 完美匹配！+天命卡"
                elif result == "花色匹配":
                    status = f"✅ 上升！"
                elif result == "失败":
                    status = f"❌"
                print(f"  {player.name}: 出{card_str} vs 守卫{self.guard_card} → {status}")
        
        # 检查通关
        for player in self.players:
            if player.level > 13:
                self.winner = player
                player.stats['games_won'] += 1
                if verbose:
                    print(f"\n🎉 {player.name} 通关13层！")
                return True
        
        return False
    
    def run_game(self, verbose: bool = True) -> Dict:
        """运行完整游戏"""
        self.reset()
        self.deal_hands()
        
        if verbose:
            print("\n🎮 命运之塔游戏开始！")
            print("新机制：4人共同面对1个守卫，手牌5张")
            for p in self.players:
                print(f"  {p.name} 手牌: {p.hand}")
        
        for level in range(1, 14):
            self.current_level = level
            
            if not self.start_level():
                break
            
            if self.play_round(verbose):
                break
        
        if not self.winner and verbose:
            max_level = max(p.level for p in self.players)
            leaders = [p for p in self.players if p.level == max_level]
            print(f"\n🏁 游戏结束")
            print(f"最高层数: {max_level}, 领先者: {', '.join(p.name for p in leaders)}")
        
        return self._get_game_stats()
    
    def _get_game_stats(self) -> Dict:
        return {
            'winner': self.winner.name if self.winner else None,
            'total_levels': self.current_level,
            'player_stats': [
                {
                    'name': p.name,
                    'final_level': p.level,
                    'rises': p.stats['rises'],
                    'perfect_matches': p.stats['perfect_matches'],
                    'destiny_cards': p.stats['destiny_cards_received']
                }
                for p in self.players
            ]
        }

def run_simulation(num_games: int = 1000):
    """运行模拟测试"""
    print(f"\n{'='*60}")
    print(f"🧮 新机制模拟测试 - {num_games} 场")
    print(f"{'='*60}")
    
    wins = 0
    total_perfect = 0
    total_destiny = 0
    
    for i in range(num_games):
        game = TowerGameNew(num_players=4)
        stats = game.run_game(verbose=False)
        
        if stats['winner']:
            wins += 1
        
        for p in stats['player_stats']:
            total_perfect += p['perfect_matches']
            total_destiny += p['destiny_cards']
        
        if (i + 1) % 200 == 0:
            print(f"  已完成 {i+1}/{num_games} 场...")
    
    print(f"\n{'='*60}")
    print("📊 新机制模拟结果")
    print(f"{'='*60}")
    print(f"总场次: {num_games}")
    print(f"通关场次: {wins}")
    print(f"通关率: {wins/num_games*100:.2f}%")
    print(f"平均每场完美匹配: {total_perfect/num_games:.4f}")
    print(f"平均每场天命卡: {total_destiny/num_games:.4f}")
    
    # 理论值
    print(f"\n📐 理论值")
    print(f"花色匹配概率: 1/4 = 25%")
    print(f"完美匹配概率: 1/52 ≈ 1.92%")
    print(f"期望通关所需层数: 13层")

if __name__ == "__main__":
    # 演示一局
    print("\n" + "="*60)
    print("🎮 《首位好运：命运之塔》新机制演示")
    print("="*60)
    
    game = TowerGameNew(num_players=4)
    game.run_game(verbose=True)
    
    # 大规模模拟
    print("\n")
    run_simulation(num_games=1000)
