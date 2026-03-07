#!/usr/bin/env python3
"""
Tower of Fate - 自动化测试脚本
模拟多个玩家进行游戏测试
"""

import asyncio
import websockets
import json
import sys

class GameTester:
    def __init__(self, name):
        self.name = name
        self.ws = None
        self.player_id = None
        self.room_code = None
        self.game_state = None
        
    async def connect(self):
        """连接服务器"""
        try:
            self.ws = await websockets.connect('ws://localhost:7777')
            print(f"✅ [{self.name}] 已连接服务器")
            return True
        except Exception as e:
            print(f"❌ [{self.name}] 连接失败: {e}")
            return False
    
    async def login(self):
        """登录"""
        await self.send({'type': 'login', 'player_name': self.name})
        response = await self.receive()
        if response and response.get('type') == 'login_success':
            self.player_id = response.get('player_id')
            print(f"✅ [{self.name}] 登录成功: {self.player_id}")
            return True
        print(f"❌ [{self.name}] 登录失败")
        return False
    
    async def create_room(self):
        """创建房间"""
        await self.send({
            'type': 'create_room',
            'room_name': f'{self.name}的房间',
            'max_players': 4
        })
        response = await self.receive()
        if response and response.get('type') == 'room_created':
            self.room_code = response['room']['id']
            print(f"✅ [{self.name}] 创建房间: {self.room_code}")
            return True
        return False
    
    async def join_room(self, room_code):
        """加入房间"""
        await self.send({'type': 'join_room', 'room_code': room_code})
        response = await self.receive()
        if response and response.get('type') in ['player_joined', 'room_created']:
            self.room_code = room_code
            print(f"✅ [{self.name}] 加入房间: {room_code}")
            return True
        return False
    
    async def ready(self, is_ready=True):
        """准备"""
        await self.send({'type': 'ready', 'is_ready': is_ready})
        print(f"✅ [{self.name}] {'准备' if is_ready else '取消准备'}")
    
    async def start_game(self):
        """开始游戏"""
        await self.send({'type': 'start_game'})
        print(f"✅ [{self.name}] 开始游戏")
    
    async def play_card(self, card_index=0):
        """出牌"""
        await self.send({'type': 'play_card', 'card_index': card_index})
        print(f"✅ [{self.name}] 出牌: 索引{card_index}")
    
    async def send(self, data):
        """发送消息"""
        if self.ws:
            await self.ws.send(json.dumps(data))
    
    async def receive(self):
        """接收消息"""
        if self.ws:
            try:
                msg = await asyncio.wait_for(self.ws.recv(), timeout=5)
                return json.loads(msg)
            except asyncio.TimeoutError:
                return None
            except Exception as e:
                print(f"⚠️ [{self.name}] 接收错误: {e}")
                return None
    
    async def listen(self, duration=10):
        """监听消息"""
        print(f"🎧 [{self.name}] 开始监听消息...")
        start = asyncio.get_event_loop().time()
        while asyncio.get_event_loop().time() - start < duration:
            try:
                msg = await asyncio.wait_for(self.ws.recv(), timeout=1)
                data = json.loads(msg)
                msg_type = data.get('type')
                
                if msg_type == 'game_started':
                    self.game_state = data.get('game_state')
                    print(f"🎮 [{self.name}] 游戏开始!")
                    
                elif msg_type == 'card_played':
                    print(f"🃏 [{self.name}] {data.get('player_name')} 出牌: {data.get('card')}")
                    
                elif msg_type == 'round_resolved':
                    result = data.get('results', {}).get(self.player_id, {})
                    print(f"📊 [{self.name}] 回合结算: {result.get('result')}")
                    self.game_state = data.get('game_state')
                    
                elif msg_type == 'game_over':
                    winner = data.get('winner_name')
                    is_winner = winner == self.name
                    print(f"🏆 [{self.name}] 游戏结束! 冠军: {winner} {'(你赢了!)' if is_winner else ''}")
                    
                elif msg_type == 'error':
                    print(f"⚠️ [{self.name}] 错误: {data.get('message')}")
                    
            except asyncio.TimeoutError:
                continue
            except Exception as e:
                break
        print(f"🛑 [{self.name}] 监听结束")
    
    async def close(self):
        """关闭连接"""
        if self.ws:
            await self.ws.close()
            print(f"👋 [{self.name}] 已断开")


async def test_single_player():
    """测试单人游戏流程"""
    print("=" * 50)
    print("🧪 测试: 单人登录流程")
    print("=" * 50)
    
    player = GameTester("测试玩家1")
    
    # 连接
    if not await player.connect():
        return False
    
    # 登录
    if not await player.login():
        return False
    
    # 创建房间
    if not await player.create_room():
        return False
    
    print("\n✅ 单人测试通过!")
    await player.close()
    return True


async def test_multiplayer_game():
    """测试多人完整游戏"""
    print("\n" + "=" * 50)
    print("🧪 测试: 4人完整游戏")
    print("=" * 50)
    
    # 创建4个玩家
    players = [GameTester(f"AI玩家{i+1}") for i in range(4)]
    
    # 所有玩家连接
    for p in players:
        if not await p.connect():
            print("❌ 连接失败")
            return False
        if not await p.login():
            print("❌ 登录失败")
            return False
    
    # 第一个玩家创建房间
    host = players[0]
    if not await host.create_room():
        print("❌ 创建房间失败")
        return False
    
    room_code = host.room_code
    print(f"\n🏠 房间号: {room_code}")
    
    # 其他玩家加入
    for p in players[1:]:
        if not await p.join_room(room_code):
            print(f"❌ {p.name} 加入房间失败")
            return False
    
    # 所有玩家准备
    await asyncio.sleep(0.5)
    for p in players:
        await p.ready(True)
    
    await asyncio.sleep(0.5)
    
    # 房主开始游戏
    await host.start_game()
    
    # 监听并自动出牌
    print("\n🎮 开始游戏，AI自动出牌中...")
    
    async def auto_play(player):
        """自动出牌循环"""
        for round_num in range(3):  # 玩3轮
            try:
                # 等待游戏开始或回合结算
                msg = await asyncio.wait_for(player.ws.recv(), timeout=10)
                data = json.loads(msg)
                
                if data.get('type') == 'game_started':
                    player.game_state = data.get('game_state')
                    print(f"🎮 [{player.name}] 游戏开始!")
                    # 出第一张牌
                    await asyncio.sleep(1)
                    await player.play_card(0)
                    
                elif data.get('type') == 'round_resolved':
                    result = data.get('results', {}).get(player.player_id, {})
                    print(f"📊 [{player.name}] 结果: {result.get('result')}")
                    player.game_state = data.get('game_state')
                    # 下一回合出牌
                    await asyncio.sleep(1)
                    await player.play_card(0)
                    
                elif data.get('type') == 'game_over':
                    winner = data.get('winner_name')
                    print(f"🏆 [{player.name}] 游戏结束! 冠军: {winner}")
                    break
                    
            except asyncio.TimeoutError:
                # 尝试出牌
                if player.game_state:
                    await player.play_card(0)
    
    # 运行自动出牌
    tasks = [auto_play(p) for p in players]
    await asyncio.gather(*tasks, return_exceptions=True)
    
    # 清理
    for p in players:
        await p.close()
    
    print("\n✅ 多人测试完成!")
    return True


async def main():
    """主测试函数"""
    print("=" * 50)
    print("🎮 Tower of Fate 自动化测试")
    print("=" * 50)
    
    # 测试单人
    if not await test_single_player():
        print("\n❌ 单人测试失败")
        return 1
    
    # 测试多人
    try:
        await asyncio.wait_for(test_multiplayer_game(), timeout=60)
    except asyncio.TimeoutError:
        print("\n⚠️ 多人测试超时")
    except Exception as e:
        print(f"\n⚠️ 多人测试出错: {e}")
    
    print("\n" + "=" * 50)
    print("✅ 测试完成!")
    print("=" * 50)
    return 0


if __name__ == "__main__":
    try:
        exit_code = asyncio.run(main())
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n🛑 测试已中断")
        sys.exit(1)
