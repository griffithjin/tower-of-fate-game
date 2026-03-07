#!/usr/bin/env python3
"""
Tower of Fate - 完整游戏测试
逐步测试每个功能点
"""

import asyncio
import websockets
import json

async def test_game():
    """完整游戏测试"""
    
    print("🎮 Tower of Fate 完整游戏测试")
    print("=" * 50)
    
    # 测试1: 单人登录
    print("\n1️⃣ 测试单人登录...")
    ws1 = await websockets.connect('ws://localhost:7777')
    await ws1.send(json.dumps({'type': 'login', 'player_name': '金先生'}))
    resp1 = json.loads(await ws1.recv())
    assert resp1['type'] == 'login_success', "登录失败"
    player1_id = resp1['player_id']
    print(f"✅ 登录成功: {player1_id}")
    
    # 测试2: 创建房间
    print("\n2️⃣ 测试创建房间...")
    await ws1.send(json.dumps({
        'type': 'create_room',
        'room_name': '金先生的房间',
        'max_players': 4
    }))
    resp2 = json.loads(await ws1.recv())
    assert resp2['type'] == 'room_created', "创建房间失败"
    room_code = resp2['room']['id']
    print(f"✅ 房间创建成功: {room_code}")
    
    # 测试3: 3个AI加入
    print("\n3️⃣ 测试AI玩家加入...")
    ai_players = []
    for i in range(3):
        ws = await websockets.connect('ws://localhost:7777')
        await ws.send(json.dumps({'type': 'login', 'player_name': f'AI玩家{i+1}'}))
        resp = json.loads(await ws.recv())
        ai_players.append({'ws': ws, 'id': resp['player_id'], 'name': f'AI玩家{i+1}'})
        
        await ws.send(json.dumps({'type': 'join_room', 'room_code': room_code}))
        resp = json.loads(await ws.recv())
        assert resp['type'] == 'player_joined', f"AI{i+1}加入失败"
        print(f"✅ {ai_players[-1]['name']} 加入成功")
    
    # 测试4: 所有玩家准备 (包括房主)
    print("\n4️⃣ 测试准备功能...")
    await ws1.send(json.dumps({'type': 'ready', 'is_ready': True}))  # 房主准备
    for ai in ai_players:
        await ai['ws'].send(json.dumps({'type': 'ready', 'is_ready': True}))
    print("✅ 所有玩家已准备")
    
    # 等待准备确认
    resp = json.loads(await ws1.recv())
    print(f"   收到: {resp['type']}")
    
    # 测试5: 开始游戏
    print("\n5️⃣ 测试开始游戏...")
    await ws1.send(json.dumps({'type': 'start_game'}))
    resp = json.loads(await ws1.recv())
    assert resp['type'] == 'game_started', "游戏开始失败"
    game_state = resp['game_state']
    print(f"✅ 游戏开始! 第{game_state['current_level']}层")
    print(f"✅ 守卫牌: {game_state['guard_card']['suit']}{game_state['guard_card']['rank']}")
    
    # 获取玩家手牌
    player_hand = game_state['players'][player1_id]['hand']
    print(f"✅ 手牌: {[c['suit']+c['rank'] for c in player_hand]}")
    
    # 测试6: 出牌
    print("\n6️⃣ 测试出牌...")
    await ws1.send(json.dumps({'type': 'play_card', 'card_index': 0}))
    resp = json.loads(await ws1.recv())
    assert resp['type'] == 'card_played', "出牌失败"
    print(f"✅ 出牌成功: {resp['card']['suit']}{resp['card']['rank']}")
    
    # AI出牌
    for ai in ai_players:
        await ai['ws'].send(json.dumps({'type': 'play_card', 'card_index': 0}))
    
    # 测试7: 等待回合结算
    print("\n7️⃣ 等待回合结算...")
    resp = json.loads(await ws1.recv())
    assert resp['type'] == 'round_resolved', "回合结算失败"
    result = resp['results'][player1_id]
    print(f"✅ 回合结算: {result['result']}")
    print(f"✅ 你的牌: {result['card']['suit']}{result['card']['rank']} vs 守卫: {resp['guard_card']['suit']}{resp['guard_card']['rank']}")
    
    # 测试8: 新回合
    new_state = resp['game_state']
    print(f"\n8️⃣ 进入第{new_state['current_level']}层")
    new_hand = new_state['players'][player1_id]['hand']
    print(f"✅ 新手牌: {[c['suit']+c['rank'] for c in new_hand]}")
    
    # 再出一轮
    await ws1.send(json.dumps({'type': 'play_card', 'card_index': 0}))
    for ai in ai_players:
        await ai['ws'].send(json.dumps({'type': 'play_card', 'card_index': 0}))
    
    resp = json.loads(await ws1.recv())
    if resp['type'] == 'round_resolved':
        print(f"✅ 第2轮结算: {resp['results'][player1_id]['result']}")
    elif resp['type'] == 'game_over':
        print(f"🏆 游戏结束! 冠军: {resp['winner_name']}")
    
    # 清理
    print("\n9️⃣ 测试完成，清理连接...")
    await ws1.close()
    for ai in ai_players:
        await ai['ws'].close()
    
    print("\n" + "=" * 50)
    print("✅ 所有测试通过! 游戏核心功能正常!")
    print("=" * 50)
    
    return True


if __name__ == "__main__":
    try:
        asyncio.run(test_game())
    except AssertionError as e:
        print(f"\n❌ 测试失败: {e}")
    except Exception as e:
        print(f"\n❌ 测试出错: {e}")
        import traceback
        traceback.print_exc()
