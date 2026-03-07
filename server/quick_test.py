#!/usr/bin/env python3
"""
Tower of Fate - 快速游戏测试
最简单的完整流程测试
"""

import asyncio
import websockets
import json

async def simple_test():
    print("🎮 简化版游戏测试")
    print("=" * 40)
    
    # 连接
    ws = await websockets.connect('ws://localhost:7777')
    print("✅ 已连接")
    
    # 登录
    await ws.send(json.dumps({'type': 'login', 'player_name': '金先生'}))
    resp = json.loads(await ws.recv())
    player_id = resp['player_id']
    print(f"✅ 登录: {player_id}")
    
    # 创建房间
    await ws.send(json.dumps({
        'type': 'create_room',
        'room_name': '测试房间',
        'max_players': 4
    }))
    resp = json.loads(await ws.recv())
    room_code = resp['room']['id']
    print(f"✅ 房间: {room_code}")
    print(f"   玩家: {[p['name'] for p in resp['room']['players']]}")
    
    # 快速匹配 - 添加3个AI
    for i in range(3):
        ai_ws = await websockets.connect('ws://localhost:7777')
        await ai_ws.send(json.dumps({'type': 'login', 'player_name': f'AI{i+1}'}))
        await ai_ws.recv()
        await ai_ws.send(json.dumps({'type': 'join_room', 'room_code': room_code}))
        await ai_ws.recv()  # player_joined
        await ai_ws.recv()  # 房主收到player_joined
        await ai_ws.send(json.dumps({'type': 'ready', 'is_ready': True}))
        print(f"✅ AI{i+1} 加入并准备")
    
    # 房主准备
    await ws.send(json.dumps({'type': 'ready', 'is_ready': True}))
    print("✅ 房主准备")
    
    # 消耗准备消息
    for _ in range(4):
        await ws.recv()
    
    # 开始游戏
    await ws.send(json.dumps({'type': 'start_game'}))
    resp = json.loads(await ws.recv())
    
    if resp['type'] == 'game_started':
        print("\n🎮 游戏开始!")
        gs = resp['game_state']
        print(f"   第{gs['current_level']}层")
        print(f"   守卫牌: {gs['guard_card']['suit']}{gs['guard_card']['rank']}")
        hand = gs['players'][player_id]['hand']
        print(f"   你的手牌: {[c['suit']+c['rank'] for c in hand]}")
        print("\n✅ 游戏核心功能正常!")
    else:
        print(f"❌ 错误: {resp}")
    
    await ws.close()
    print("=" * 40)

asyncio.run(simple_test())
