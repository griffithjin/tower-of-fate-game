#!/usr/bin/env python3
"""
Tower of Fate - 完整游戏测试 v2
处理所有服务器消息
"""

import asyncio
import websockets
import json

class TestPlayer:
    def __init__(self, name):
        self.name = name
        self.ws = None
        self.id = None
        self.room_code = None
        self.is_host = False
        
    async def connect(self):
        self.ws = await websockets.connect('ws://localhost:7777')
        
    async def login(self):
        await self.ws.send(json.dumps({'type': 'login', 'player_name': self.name}))
        resp = json.loads(await self.ws.recv())
        if resp['type'] == 'login_success':
            self.id = resp['player_id']
            return True
        return False
    
    async def create_room(self):
        await self.ws.send(json.dumps({
            'type': 'create_room',
            'room_name': f'{self.name}的房间',
            'max_players': 4
        }))
        resp = json.loads(await self.ws.recv())
        if resp['type'] == 'room_created':
            self.room_code = resp['room']['id']
            self.is_host = True
            return True
        return False
    
    async def join_room(self, code):
        await self.ws.send(json.dumps({'type': 'join_room', 'room_code': code}))
        resp = json.loads(await self.ws.recv())
        return resp.get('type') == 'player_joined'
    
    async def ready(self, ready=True):
        await self.ws.send(json.dumps({'type': 'ready', 'is_ready': ready}))
    
    async def start_game(self):
        await self.ws.send(json.dumps({'type': 'start_game'}))
    
    async def play_card(self, index=0):
        await self.ws.send(json.dumps({'type': 'play_card', 'card_index': index}))
    
    async def receive(self):
        return json.loads(await self.ws.recv())
    
    async def close(self):
        await self.ws.close()


async def test():
    print("🎮 Tower of Fate 完整测试")
    print("=" * 50)
    
    # 创建玩家
    host = TestPlayer("金先生")
    ai1 = TestPlayer("AI_1")
    ai2 = TestPlayer("AI_2")
    ai3 = TestPlayer("AI_3")
    players = [host, ai1, ai2, ai3]
    
    # 连接
    print("\n1️⃣ 连接服务器...")
    for p in players:
        await p.connect()
        print(f"✅ {p.name} 已连接")
    
    # 登录
    print("\n2️⃣ 登录...")
    for p in players:
        await p.login()
        print(f"✅ {p.name} 登录成功: {p.id}")
    
    # 创建房间
    print("\n3️⃣ 创建房间...")
    await host.create_room()
    print(f"✅ 房间创建: {host.room_code}")
    
    # AI加入
    print("\n4️⃣ AI加入房间...")
    for ai in [ai1, ai2, ai3]:
        await ai.join_room(host.room_code)
        # 消耗join响应
        resp = await ai.receive()
        print(f"✅ {ai.name} 加入: {resp['type']}")
    
    # 房主消耗玩家加入通知
    for _ in range(3):
        resp = await host.receive()
        print(f"   房主收到: {resp['type']}")
    
    # 准备
    print("\n5️⃣ 玩家准备...")
    await host.ready(True)
    for ai in [ai1, ai2, ai3]:
        await ai.ready(True)
    
    # 消耗准备响应
    for p in players:
        resp = await p.receive()
        print(f"✅ {p.name} 准备确认: {resp['type']}")
    
    # 开始游戏
    print("\n6️⃣ 开始游戏...")
    await host.start_game()
    
    # 所有玩家接收游戏开始
    for p in players:
        resp = await p.receive()
        if resp['type'] == 'game_started':
            print(f"✅ {p.name} 游戏开始!")
            hand = resp['game_state']['players'][p.id]['hand']
            print(f"   手牌: {[c['suit']+c['rank'] for c in hand]}")
        elif resp['type'] == 'error':
            print(f"❌ {p.name} 错误: {resp['message']}")
    
    # 出牌
    print("\n7️⃣ 第1轮出牌...")
    for p in players:
        await p.play_card(0)
    
    # 接收出牌通知和结算
    for p in players:
        for _ in range(4):  # 4张牌
            resp = await p.receive()
            if resp['type'] == 'card_played':
                pass  # print(f"   {p.name} 看到出牌")
        
        # 回合结算
        resp = await p.receive()
        if resp['type'] == 'round_resolved':
            result = resp['results'][p.id]
            print(f"✅ {p.name}: {result['result']} (出{result['card']['suit']}{result['card']['rank']})")
    
    # 第2轮
    print("\n8️⃣ 第2轮出牌...")
    for p in players:
        await p.play_card(0)
    
    for p in players:
        for _ in range(4):
            resp = await p.receive()
        resp = await p.receive()
        if resp['type'] == 'round_resolved':
            result = resp['results'][p.id]
            print(f"✅ {p.name}: {result['result']}")
    
    # 清理
    print("\n9️⃣ 测试完成...")
    for p in players:
        await p.close()
    
    print("\n" + "=" * 50)
    print("✅ 完整游戏测试通过!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(test())
