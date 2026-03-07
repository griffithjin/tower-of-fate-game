#!/usr/bin/env python3
"""
Tower of Fate - 游戏服务器
本地测试服务器，支持WebSocket联机
"""

import asyncio
import websockets
import json
import random
import string
import time
from datetime import datetime
from typing import Dict, Set

# 导入统计模块
from stats import game_stats

# 导入商城模块
from shop import shop_manager

# 导入锦标赛模块
from tournament import tournament_manager

# 导入玩家数据管理模块
from player_data import player_data

# 存储房间和玩家
rooms: Dict[str, dict] = {}
players: Dict[str, websockets.WebSocketServerProtocol] = {}
player_rooms: Dict[str, str] = {}  # player_id -> room_id

# 快速匹配队列
quick_match_queue: list = []

# 玩家货币数据
player_currencies: Dict[str, dict] = {}  # player_id -> {coins, diamonds}


class GameServer:
    def __init__(self):
        self.rooms = {}
        self.players = {}
        
    def generate_room_code(self):
        """生成6位房间码"""
        chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        return ''.join(random.choices(chars, k=6))
    
    def generate_player_id(self):
        """生成玩家ID"""
        return f"player_{random.randint(10000, 99999)}"


server = GameServer()


async def handle_message(websocket, message):
    """处理客户端消息"""
    try:
        data = json.loads(message)
        msg_type = data.get('type')
        
        if msg_type == 'login':
            await handle_login(websocket, data)
        elif msg_type == 'create_room':
            await handle_create_room(websocket, data)
        elif msg_type == 'join_room':
            await handle_join_room(websocket, data)
        elif msg_type == 'leave_room':
            await handle_leave_room(websocket)
        elif msg_type == 'start_game':
            await handle_start_game(websocket)
        elif msg_type == 'play_card':
            await handle_play_card(websocket, data)
        elif msg_type == 'chat':
            await handle_chat(websocket, data)
        elif msg_type == 'ready':
            await handle_ready(websocket, data)
        elif msg_type == 'quick_match':
            await handle_quick_match(websocket)
        elif msg_type == 'single_player':
            await handle_single_player(websocket)
        elif msg_type == 'use_destiny':
            await handle_use_destiny(websocket, data)
        elif msg_type == 'get_stats':
            await handle_get_stats(websocket)
        elif msg_type == 'get_achievements':
            await handle_get_achievements(websocket)
        elif msg_type == 'get_shop':
            await handle_get_shop(websocket)
        elif msg_type == 'purchase_item':
            await handle_purchase_item(websocket, data)
        elif msg_type == 'get_inventory':
            await handle_get_inventory(websocket)
        elif msg_type == 'get_tournaments':
            await handle_get_tournaments(websocket)
        elif msg_type == 'register_tournament':
            await handle_register_tournament(websocket, data)
        elif msg_type == 'get_daily_reward':
            await handle_get_daily_reward(websocket)
        elif msg_type == 'claim_daily_reward':
            await handle_claim_daily_reward(websocket)
            
    except json.JSONDecodeError:
        await send_error(websocket, "Invalid JSON")
    except Exception as e:
        print(f"Error: {e}")
        await send_error(websocket, str(e))


async def handle_login(websocket, data):
    """处理登录"""
    player_name = data.get('player_name', '游客')
    player_id = server.generate_player_id()
    
    players[player_id] = websocket
    websocket.player_id = player_id
    websocket.player_name = player_name
    websocket.is_ready = False
    
    await send_message(websocket, {
        'type': 'login_success',
        'player_id': player_id,
        'player_name': player_name,
        'message': f'欢迎, {player_name}!'
    })
    print(f"[登录] {player_name} ({player_id})")


async def handle_create_room(websocket, data):
    """创建房间"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        await send_error(websocket, "请先登录")
        return
    
    room_code = server.generate_room_code()
    room = {
        'id': room_code,
        'name': data.get('room_name', f'房间-{room_code}'),
        'host_id': player_id,
        'host_name': websocket.player_name,
        'players': [{
            'id': player_id,
            'name': websocket.player_name,
            'is_host': True,
            'is_ready': False
        }],
        'max_players': data.get('max_players', 4),
        'status': 'waiting',  # waiting, playing, ended
        'game_state': None
    }
    
    rooms[room_code] = room
    player_rooms[player_id] = room_code
    
    await send_message(websocket, {
        'type': 'room_created',
        'room': room
    })
    print(f"[创建房间] {room_code} by {websocket.player_name}")


async def handle_join_room(websocket, data):
    """加入房间"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        await send_error(websocket, "请先登录")
        return
    
    room_code = data.get('room_code', '').upper()
    if room_code not in rooms:
        await send_error(websocket, "房间不存在")
        return
    
    room = rooms[room_code]
    if len(room['players']) >= room['max_players']:
        await send_error(websocket, "房间已满")
        return
    
    if room['status'] != 'waiting':
        await send_error(websocket, "游戏已开始")
        return
    
    # 添加玩家到房间
    room['players'].append({
        'id': player_id,
        'name': websocket.player_name,
        'is_host': False,
        'is_ready': False
    })
    player_rooms[player_id] = room_code
    
    # 通知房间所有玩家
    await broadcast_to_room(room_code, {
        'type': 'player_joined',
        'player': {
            'id': player_id,
            'name': websocket.player_name
        },
        'room': room
    })
    print(f"[加入房间] {websocket.player_name} -> {room_code}")


async def handle_leave_room(websocket):
    """离开房间"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id or player_id not in player_rooms:
        return
    
    room_code = player_rooms[player_id]
    if room_code in rooms:
        room = rooms[room_code]
        room['players'] = [p for p in room['players'] if p['id'] != player_id]
        
        # 如果房间空了，删除房间
        if len(room['players']) == 0:
            del rooms[room_code]
            print(f"[房间关闭] {room_code}")
        else:
            # 转让房主
            if room['host_id'] == player_id and len(room['players']) > 0:
                room['host_id'] = room['players'][0]['id']
                room['host_name'] = room['players'][0]['name']
                room['players'][0]['is_host'] = True
            
            await broadcast_to_room(room_code, {
                'type': 'player_left',
                'player_id': player_id,
                'player_name': websocket.player_name,
                'room': room
            })
    
    del player_rooms[player_id]
    print(f"[离开房间] {websocket.player_name} -> {room_code}")


async def handle_ready(websocket, data):
    """准备/取消准备"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id or player_id not in player_rooms:
        return
    
    room_code = player_rooms[player_id]
    room = rooms.get(room_code)
    if not room:
        return
    
    is_ready = data.get('is_ready', False)
    
    for player in room['players']:
        if player['id'] == player_id:
            player['is_ready'] = is_ready
            break
    
    await broadcast_to_room(room_code, {
        'type': 'player_ready',
        'player_id': player_id,
        'is_ready': is_ready,
        'room': room
    })


async def handle_quick_match(websocket):
    """快速匹配"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        return
    
    # 检查是否已在房间
    if player_id in player_rooms:
        await send_error(websocket, "已在房间中")
        return
    
    # 查找可加入的房间
    for room_code, room in rooms.items():
        if room['status'] == 'waiting' and len(room['players']) < room['max_players']:
            # 加入房间
            room['players'].append({
                'id': player_id,
                'name': websocket.player_name,
                'is_host': False,
                'is_ready': False
            })
            player_rooms[player_id] = room_code
            
            await broadcast_to_room(room_code, {
                'type': 'player_joined',
                'player': {'id': player_id, 'name': websocket.player_name},
                'room': room
            })
            print(f"[快速匹配] {websocket.player_name} 加入房间 {room_code}")
            return
    
    # 没有可用房间，创建新房间
    await handle_create_room(websocket, {'room_name': '快速匹配', 'max_players': 4})
    print(f"[快速匹配] {websocket.player_name} 创建新房间")


async def handle_single_player(websocket):
    """单人游戏 - 与3个AI对战"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        return
    
    # 创建房间
    room_code = server.generate_room_code()
    room = {
        'id': room_code,
        'name': '单人游戏',
        'host_id': player_id,
        'host_name': websocket.player_name,
        'players': [{
            'id': player_id,
            'name': websocket.player_name,
            'is_host': True,
            'is_ready': True
        }],
        'max_players': 4,
        'status': 'waiting',
        'game_state': None
    }
    
    # 添加3个AI
    for i in range(3):
        ai_id = f"ai_{room_code}_{i}"
        room['players'].append({
            'id': ai_id,
            'name': f'AI{i+1}',
            'is_host': False,
            'is_ready': True
        })
    
    rooms[room_code] = room
    player_rooms[player_id] = room_code
    
    await send_message(websocket, {
        'type': 'room_created',
        'room': room
    })
    
    # 自动开始游戏
    await asyncio.sleep(0.5)
    room['status'] = 'playing'
    room['game_state'] = initialize_game_state(room['players'])
    
    # 发送隐藏守卫牌的游戏状态
    hidden_state = get_hidden_game_state(room['game_state'])
    
    await send_message(websocket, {
        'type': 'game_started',
        'room': room,
        'game_state': hidden_state
    })
    print(f"[单人游戏] {websocket.player_name} 开始游戏")


async def handle_use_destiny(websocket, data):
    """使用天命牌"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id or player_id not in player_rooms:
        return
    
    room_code = player_rooms[player_id]
    room = rooms.get(room_code)
    if not room or room['status'] != 'playing':
        return
    
    game_state = room['game_state']
    player = game_state['players'].get(player_id)
    
    if not player:
        return
    
    # 检查是否可以使用天命牌
    if not player.get('can_use_destiny', False):
        await send_error(websocket, "当前层数还不能使用天命牌")
        return
    
    destiny_index = data.get('destiny_index', 0)
    if destiny_index >= len(player['destiny_cards']):
        await send_error(websocket, "无效的天命牌")
        return
    
    target_id = data.get('target_id', player_id)  # 默认对自己使用
    
    destiny_card = player['destiny_cards'].pop(destiny_index)
    player['destiny_used'].append(destiny_card)
    player['can_use_destiny'] = False
    
    # 处理天命牌效果
    effect_result = await apply_destiny_effect(game_state, player_id, target_id, destiny_card)
    
    await broadcast_to_room(room_code, {
        'type': 'destiny_used',
        'player_id': player_id,
        'player_name': websocket.player_name,
        'target_id': target_id,
        'destiny_card': destiny_card,
        'effect': effect_result,
        'game_state': game_state
    })
    
    print(f"[天命牌] {websocket.player_name} 使用 {destiny_card} 对 {target_id}")


async def apply_destiny_effect(game_state, player_id, target_id, destiny_card):
    """应用天命牌效果"""
    player = game_state['players'][player_id]
    target = game_state['players'].get(target_id)
    
    if destiny_card == '全军突击':
        # 所有人都可以上升一层
        for pid, p in game_state['players'].items():
            if p['level'] < 13:
                p['level'] += 1
        return {'type': 'all_rise', 'message': '全军突击！所有人上升一层！'}
    
    elif destiny_card == '换牌':
        # 重新发5张牌
        suits = ['♥', '♦', '♣', '♠']
        ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
        deck = [{'suit': s, 'rank': r} for s in suits for r in ranks]
        random.shuffle(deck)
        player['hand'] = [deck.pop() for _ in range(5)]
        return {'type': 'redraw', 'message': '换牌成功！获得新手牌！'}
    
    elif destiny_card == '看牌':
        # 查看守卫牌
        guard = game_state['guard_card']
        return {'type': 'peek', 'message': f'守卫牌是 {guard["suit"]}{guard["rank"]}！', 'guard': guard}
    
    elif destiny_card == '带人':
        # 带一个人上升一层
        if target and target_id != player_id:
            target['level'] += 1
            return {'type': 'bring', 'message': f'带{target["name"]}上升一层！'}
        return {'type': 'bring', 'message': '带人失败'}
    
    elif destiny_card == '踢人':
        # 踢一个人下降一层
        if target and target_id != player_id and target['level'] > 1:
            target['level'] -= 1
            return {'type': 'kick', 'message': f'踢{target["name"]}下降一层！'}
        return {'type': 'kick', 'message': '踢人失败'}
    
    return {'type': 'unknown', 'message': '未知效果'}


async def handle_start_game(websocket):
    """开始游戏"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id or player_id not in player_rooms:
        return
    
    room_code = player_rooms[player_id]
    room = rooms.get(room_code)
    if not room:
        return
    
    if room['host_id'] != player_id:
        await send_error(websocket, "只有房主可以开始游戏")
        return
    
    if len(room['players']) < 2:
        await send_error(websocket, "至少需要2人")
        return
    
    # 检查是否都准备
    not_ready = [p for p in room['players'] if not p['is_ready'] and not p['is_host']]
    if not_ready:
        await send_error(websocket, f"还有 {len(not_ready)} 位玩家未准备")
        return
    
    room['status'] = 'playing'
    room['game_state'] = initialize_game_state(room['players'])
    
    # 发送隐藏守卫牌的游戏状态给所有玩家
    hidden_state = get_hidden_game_state(room['game_state'])
    
    await broadcast_to_room(room_code, {
        'type': 'game_started',
        'room': room,
        'game_state': hidden_state
    })
    print(f"[游戏开始] {room_code}, {len(room['players'])} 位玩家")


def get_hidden_game_state(game_state):
    """获取隐藏守卫牌的游戏状态"""
    import copy
    hidden = copy.deepcopy(game_state)
    # 隐藏守卫牌，只显示问号
    hidden['guard_card'] = {'suit': '?', 'rank': '?'}
    hidden['phase'] = 'playing'
    return hidden


def initialize_game_state(players):
    """初始化游戏状态 - 每人3张天命牌"""
    suits = ['♥', '♦', '♣', '♠']
    ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    
    # 生成52张牌
    deck = [{'suit': s, 'rank': r} for s in suits for r in ranks]
    random.shuffle(deck)
    
    # 天命牌类型
    destiny_types = ['全军突击', '换牌', '看牌', '带人', '踢人']
    
    # 给每个玩家发5张手牌 + 3张天命牌
    player_states = {}
    for player in players:
        hand = [deck.pop() for _ in range(5)]
        # 随机分配3张天命牌
        destiny = [random.choice(destiny_types) for _ in range(3)]
        
        player_states[player['id']] = {
            'name': player['name'],
            'hand': hand,
            'level': 1,
            'score': 0,
            'destiny_cards': destiny,  # 3张隐藏天命牌
            'destiny_used': [],  # 已使用的天命牌
            'can_use_destiny': False  # 当前是否可用
        }
    
    # 守卫抽牌
    guard_card = deck.pop()
    
    return {
        'current_level': 1,
        'guard_card': guard_card,
        'players': player_states,
        'deck_count': len(deck),
        'phase': 'playing',
        'played_cards': {}
    }


async def handle_play_card(websocket, data):
    """出牌 - 包含AI自动出牌"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id or player_id not in player_rooms:
        return
    
    room_code = player_rooms[player_id]
    room = rooms.get(room_code)
    if not room or room['status'] != 'playing':
        return
    
    game_state = room['game_state']
    card_index = data.get('card_index', 0)
    
    player_state = game_state['players'].get(player_id)
    if not player_state or card_index >= len(player_state['hand']):
        return
    
    # 玩家出牌
    card = player_state['hand'].pop(card_index)
    game_state['played_cards'][player_id] = card
    
    print(f"[出牌] 玩家 {websocket.player_name} 出 {card['suit']}{card['rank']}")
    
    # 发送隐藏守卫牌的状态
    hidden_state = get_hidden_game_state(game_state)
    
    await broadcast_to_room(room_code, {
        'type': 'card_played',
        'player_id': player_id,
        'player_name': websocket.player_name,
        'card': card,
        'game_state': hidden_state
    })
    
    # AI自动出牌 (延迟模拟思考)
    await process_ai_turns(room_code, game_state)
    
    # 检查是否都出牌了
    if len(game_state['played_cards']) >= len(game_state['players']):
        await resolve_round(room_code)


async def process_ai_turns(room_code, game_state):
    """处理AI出牌 - 优化策略"""
    guard = game_state['guard_card']
    
    for player_id, player_data in game_state['players'].items():
        # 跳过已出牌的玩家
        if player_id in game_state['played_cards']:
            continue
        
        # AI玩家 (id以ai_开头)
        if player_id.startswith('ai_'):
            await asyncio.sleep(0.5)  # 模拟AI思考时间
            
            hand = player_data['hand']
            if not hand:
                continue
            
            # AI策略优化：
            # 1. 优先出小牌保留大牌
            # 2. 如果有完美匹配的牌，有一定概率出（模拟AI也会赌运气）
            
            card_index = 0
            
            # 检查是否有完美匹配的牌
            perfect_match_indices = []
            suit_match_indices = []
            
            for i, card in enumerate(hand):
                if card['suit'] == guard['suit'] and card['rank'] == guard['rank']:
                    perfect_match_indices.append(i)
                elif card['suit'] == guard['suit']:
                    suit_match_indices.append(i)
            
            # AI决策：
            # - 30%概率如果有完美匹配就出
            # - 40%概率如果有花色匹配就出
            # - 否则出最小的牌
            
            import random
            rand = random.random()
            
            if perfect_match_indices and rand < 0.3:
                # 出完美匹配牌
                card_index = perfect_match_indices[0]
                print(f"[AI策略] {player_data['name']} 决定出完美匹配牌！")
            elif suit_match_indices and rand < 0.7:
                # 出花色匹配牌
                card_index = suit_match_indices[0]
                print(f"[AI策略] {player_data['name']} 决定出花色匹配牌")
            else:
                # 出最小的牌（按点数排序）
                rank_values = {'2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14}
                min_value = float('inf')
                for i, card in enumerate(hand):
                    value = rank_values.get(card['rank'], 7)
                    if value < min_value:
                        min_value = value
                        card_index = i
            
            card = hand.pop(card_index)
            game_state['played_cards'][player_id] = card
            
            print(f"[AI出牌] {player_data['name']} 出 {card['suit']}{card['rank']}")
            
            # 广播AI出牌
            hidden_state = get_hidden_game_state(game_state)
            await broadcast_to_room(room_code, {
                'type': 'card_played',
                'player_id': player_id,
                'player_name': player_data['name'],
                'card': card,
                'game_state': hidden_state
            })


# 扑克层名映射
LEVEL_NAMES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A']

async def resolve_round(room_code):
    """结算一轮 - 修复游戏结束逻辑"""
    room = rooms.get(room_code)
    if not room:
        return
    
    game_state = room['game_state']
    guard = game_state['guard_card']
    
    results = {}
    winner_id = None
    winner_name = None
    
    for player_id, card in game_state['played_cards'].items():
        # 判断结果 - 修改：数字或花色匹配都可以晋级
        if card['suit'] == guard['suit'] and card['rank'] == guard['rank']:
            result = 'perfect_match'  # 完美匹配：花色+数字都相同
        elif card['suit'] == guard['suit']:
            result = 'suit_match'  # 花色匹配
        elif card['rank'] == guard['rank']:
            result = 'number_match'  # 数字匹配（新增）
        else:
            result = 'fail'
        
        results[player_id] = {
            'card': card,
            'result': result
        }
        
        # 更新玩家状态
        player = game_state['players'][player_id]
        old_level = player['level']
        
        if result == 'perfect_match':
            player['level'] += 1
            player['score'] += 100
            player['destiny_cards'].append(random.choice(['全军突击', '换牌', '看牌', '带人', '踢人']))
        elif result == 'suit_match' or result == 'number_match':
            player['level'] += 1
            player['score'] += 20
        
        # 检查是否刚到达13层
        if old_level < 13 and player['level'] >= 13:
            winner_id = player_id
            winner_name = player['name']
    
    # 发送对比展示
    await broadcast_to_room(room_code, {
        'type': 'show_comparison',
        'guard_card': guard,
        'played_cards': game_state['played_cards'],
        'results': results,
        'countdown': 3,
        'level_names': LEVEL_NAMES
    })
    
    await asyncio.sleep(3)
    
    # 发送回合结算
    await broadcast_to_room(room_code, {
        'type': 'round_resolved',
        'guard_card': guard,
        'results': results,
        'game_state': game_state,
        'level_names': LEVEL_NAMES
    })
    
    # 检查是否有胜者
    if winner_id:
        print(f"[游戏结束] 胜者: {winner_name} ({winner_id})")
        
        # 记录所有玩家的游戏统计
        for pid, pdata in game_state['players'].items():
            is_winner = (pid == winner_id)
            game_stats.record_game_end(
                pid, 
                is_winner, 
                pdata['score'], 
                pdata['level'], 
                len([r for r in results.values() if r['result'] == 'perfect_match'])
            )
        
        # 生成荣誉数据
        honor_data = generate_honor_data(game_state, winner_id)
        
        await broadcast_to_room(room_code, {
            'type': 'game_over',
            'winner_id': winner_id,
            'winner_name': winner_name,
            'final_state': game_state,
            'honor': honor_data,
            'level_names': LEVEL_NAMES
        })
        room['status'] = 'ended'
        return
    
    # 继续下一层
    game_state['played_cards'] = {}
    game_state['current_level'] += 1
    
    suits = ['♥', '♦', '♣', '♠']
    ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']
    deck = [{'suit': s, 'rank': r} for s in suits for r in ranks]
    random.shuffle(deck)
    
    for player_id in game_state['players']:
        game_state['players'][player_id]['hand'] = [deck.pop() for _ in range(5)]
        player = game_state['players'][player_id]
        level = player['level']
        used_count = len(player.get('destiny_used', []))
        should_have_used = (level - 1) // 4
        player['can_use_destiny'] = (used_count < should_have_used and len(player['destiny_cards']) > 0)
    
    game_state['guard_card'] = deck.pop()
    
    hidden_state = get_hidden_game_state(game_state)
    hidden_state['level_names'] = LEVEL_NAMES
    
    await broadcast_to_room(room_code, {
        'type': 'new_round',
        'game_state': hidden_state
    })


def generate_honor_data(game_state, winner_id):
    """生成荣誉系统数据"""
    winner = game_state['players'][winner_id]
    
    honors = []
    
    # 登顶荣誉
    honors.append({
        'title': '塔顶之主',
        'desc': '成功登顶13层！',
        'icon': '👑',
        'rarity': 'legendary'
    })
    
    # 根据表现添加其他荣誉
    if winner['score'] >= 500:
        honors.append({
            'title': '积分达人',
            'desc': f'单局获得{winner["score"]}积分',
            'icon': '💎',
            'rarity': 'epic'
        })
    
    destiny_count = len(winner.get('destiny_cards', []))
    if destiny_count >= 5:
        honors.append({
            'title': '天命之子',
            'desc': f'获得{destiny_count}张天命牌',
            'icon': '✨',
            'rarity': 'rare'
        })
    
    return {
        'player_name': winner['name'],
        'total_score': winner['score'],
        'honors': honors,
        'timestamp': int(time.time())
    }


async def handle_chat(websocket, data):
    """聊天"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id or player_id not in player_rooms:
        return
    
    room_code = player_rooms[player_id]
    message = data.get('message', '')
    
    await broadcast_to_room(room_code, {
        'type': 'chat',
        'player_id': player_id,
        'player_name': websocket.player_name,
        'message': message
    })


async def broadcast_to_room(room_code, message):
    """广播消息到房间所有玩家"""
    room = rooms.get(room_code)
    if not room:
        return
    
    for player in room['players']:
        player_id = player['id']
        if player_id in players:
            try:
                await send_message(players[player_id], message)
            except:
                pass


async def handle_get_stats(websocket):
    """获取玩家统计"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        await send_error(websocket, "请先登录")
        return
    
    stats = game_stats.get_player_stats(player_id)
    leaderboard = game_stats.get_leaderboard_data(10)
    
    await send_message(websocket, {
        'type': 'stats_data',
        'stats': stats,
        'leaderboard': leaderboard
    })


async def handle_get_achievements(websocket):
    """获取玩家成就"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        await send_error(websocket, "请先登录")
        return
    
    achievements = game_stats.get_achievements(player_id)
    
    await send_message(websocket, {
        'type': 'achievements_data',
        'achievements': achievements
    })


# ==================== 商城系统 API ====================

async def handle_get_shop(websocket):
    """获取商城商品列表"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        await send_error(websocket, "请先登录")
        return
    
    items = shop_manager.get_shop_items(player_id)
    player = player_data.get_player_data(player_id)
    
    await send_message(websocket, {
        'type': 'shop_data',
        'items': items,
        'coins': player['coins'],
        'diamonds': player['diamonds']
    })


async def handle_purchase_item(websocket, data):
    """购买商品"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        await send_error(websocket, "请先登录")
        return
    
    item_id = data.get('item_id')
    if not item_id:
        await send_error(websocket, "请选择要购买的商品")
        return
    
    player = player_data.get_player_data(player_id)
    result = shop_manager.purchase_item(
        player_id, 
        item_id, 
        player['coins'], 
        player['diamonds']
    )
    
    if result['success']:
        # 扣除货币
        item = next((i for i in shop_manager.items if i.item_id == item_id), None)
        if item:
            if item.currency == 'coins':
                player['coins'] -= item.price
            else:
                player['diamonds'] -= item.price
            player['inventory'].append(item_id)
            player_data.save_data()
    
    await send_message(websocket, {
        'type': 'purchase_result',
        'success': result['success'],
        'message': result['message'],
        'item': result.get('item'),
        'coins': player['coins'],
        'diamonds': player['diamonds']
    })


async def handle_get_inventory(websocket):
    """获取玩家库存"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        await send_error(websocket, "请先登录")
        return
    
    items = shop_manager.get_player_inventory(player_id)
    player = player_data.get_player_data(player_id)
    
    await send_message(websocket, {
        'type': 'inventory_data',
        'items': items,
        'equipped': player['equipped']
    })


# ==================== 锦标赛系统 API ====================

async def handle_get_tournaments(websocket):
    """获取锦标赛列表"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        await send_error(websocket, "请先登录")
        return
    
    tournaments = tournament_manager.get_tournament_list()
    record = tournament_manager.get_player_record(player_id)
    player = player_data.get_player_data(player_id)
    
    await send_message(websocket, {
        'type': 'tournaments_data',
        'tournaments': tournaments,
        'record': record,
        'coins': player['coins']
    })


async def handle_register_tournament(websocket, data):
    """报名参加锦标赛"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        await send_error(websocket, "请先登录")
        return
    
    tournament_id = data.get('tournament_id')
    if not tournament_id:
        await send_error(websocket, "请选择要报名的锦标赛")
        return
    
    player = player_data.get_player_data(player_id)
    result = tournament_manager.register_tournament(
        player_id,
        tournament_id,
        player['coins']
    )
    
    if result['success']:
        # 扣除报名费
        tournament = next((t for t in tournament_manager.tournaments if t.tournament_id == tournament_id), None)
        if tournament:
            player['coins'] -= tournament.entry_fee
            player_data.save_data()
    
    await send_message(websocket, {
        'type': 'register_result',
        'success': result['success'],
        'message': result['message'],
        'tournament': result.get('tournament'),
        'coins': player['coins']
    })


# ==================== 每日奖励 API ====================

async def handle_get_daily_reward(websocket):
    """获取每日奖励状态"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        await send_error(websocket, "请先登录")
        return
    
    status = player_data.get_daily_reward_status(player_id)
    
    await send_message(websocket, {
        'type': 'daily_reward_status',
        **status
    })


async def handle_claim_daily_reward(websocket):
    """领取每日奖励"""
    player_id = getattr(websocket, 'player_id', None)
    if not player_id:
        await send_error(websocket, "请先登录")
        return
    
    result = player_data.claim_daily_reward(player_id)
    
    await send_message(websocket, {
        'type': 'daily_reward_result',
        **result
    })


async def send_message(websocket, message):
    """发送消息"""
    await websocket.send(json.dumps(message))


async def send_error(websocket, error_message):
    """发送错误"""
    await send_message(websocket, {
        'type': 'error',
        'message': error_message
    })


async def connection_handler(websocket):
    """连接处理器"""
    try:
        async for message in websocket:
            await handle_message(websocket, message)
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        # 清理连接
        player_id = getattr(websocket, 'player_id', None)
        if player_id:
            await handle_leave_room(websocket)
            if player_id in players:
                del players[player_id]
            print(f"[断开连接] {getattr(websocket, 'player_name', 'Unknown')}")


async def main():
    """启动服务器"""
    import os
    port = int(os.environ.get('GAME_PORT', 7777))
    print("=" * 50)
    print("🎮 Tower of Fate 游戏服务器")
    print("=" * 50)
    print(f"WebSocket 端口: {port}")
    print("等待玩家连接...")
    print("=" * 50)
    
    async with websockets.serve(connection_handler, "127.0.0.1", port):
        await asyncio.Future()  # 永久运行


if __name__ == "__main__":
    asyncio.run(main())
