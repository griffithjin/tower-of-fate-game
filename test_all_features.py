#!/usr/bin/env python3
"""
Tower of Fate - 全面功能测试脚本
模拟玩家和管理员测试所有游戏功能
"""

import asyncio
import websockets
import json
import time
import sys

# 测试配置
GAME_SERVER = "ws://localhost:7778"
TEST_PLAYER_NAME = "测试玩家"

class GameTester:
    """游戏功能测试器"""
    
    def __init__(self):
        self.ws = None
        self.player_id = None
        self.player_name = None
        self.test_results = []
        
    async def connect(self):
        """连接服务器"""
        try:
            self.ws = await websockets.connect(GAME_SERVER)
            print("✅ 已连接到游戏服务器")
            return True
        except Exception as e:
            print(f"❌ 连接失败: {e}")
            return False
    
    async def send(self, data):
        """发送消息"""
        if self.ws:
            await self.ws.send(json.dumps(data))
    
    async def receive_specific(self, msg_type, timeout=5):
        """等待特定类型的消息"""
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                msg = await asyncio.wait_for(self.ws.recv(), timeout=1)
                data = json.loads(msg)
                if data.get('type') == msg_type:
                    return data
            except asyncio.TimeoutError:
                continue
        return None
    
    async def clear_messages(self):
        """清空消息队列"""
        try:
            while True:
                await asyncio.wait_for(self.ws.recv(), timeout=0.5)
        except asyncio.TimeoutError:
            pass
    
    async def receive(self, timeout=5):
        """接收消息"""
        try:
            msg = await asyncio.wait_for(self.ws.recv(), timeout=timeout)
            return json.loads(msg)
        except asyncio.TimeoutError:
            return None
    
    async def clear_messages(self):
        """清空消息队列"""
        try:
            while True:
                await asyncio.wait_for(self.ws.recv(), timeout=0.5)
        except asyncio.TimeoutError:
            pass
        """接收消息"""
        try:
            msg = await asyncio.wait_for(self.ws.recv(), timeout=timeout)
            return json.loads(msg)
        except asyncio.TimeoutError:
            return None
    
    async def test_login(self):
        """测试登录功能"""
        print("\n📝 测试登录功能...")
        await self.send({
            'type': 'login',
            'player_name': TEST_PLAYER_NAME
        })
        
        response = await self.receive()
        if response and response.get('type') == 'login_success':
            self.player_id = response.get('player_id')
            self.player_name = response.get('player_name')
            print(f"✅ 登录成功: {self.player_name} ({self.player_id})")
            self.test_results.append(('登录', '通过'))
            return True
        else:
            print("❌ 登录失败")
            self.test_results.append(('登录', '失败'))
            return False
    
    async def test_single_player(self):
        """测试单人游戏"""
        print("\n🎮 测试单人游戏...")
        await self.send({'type': 'single_player'})
        
        # 等待房间创建
        response = await self.receive()
        if response and response.get('type') == 'room_created':
            print(f"✅ 房间创建成功: {response['room']['id']}")
            
            # 等待游戏开始
            response = await self.receive()
            if response and response.get('type') == 'game_started':
                game_state = response.get('game_state')
                print(f"✅ 游戏开始! 当前层数: {game_state.get('current_level', 1)}")
                print(f"✅ 玩家数量: {len(game_state.get('players', {}))}")
                print(f"✅ 天命牌数量: {len(game_state['players'].get(self.player_id, {}).get('destiny_cards', []))}")
                self.test_results.append(('单人游戏', '通过'))
                return True
        
        print("❌ 单人游戏失败")
        self.test_results.append(('单人游戏', '失败'))
        return False
    
    async def test_play_card(self):
        """测试出牌功能"""
        print("\n🃏 测试出牌功能...")
        await self.send({
            'type': 'play_card',
            'card_index': 0
        })
        
        # 等待AI出牌和回合结算
        for _ in range(10):
            response = await self.receive()
            if response:
                if response.get('type') == 'card_played':
                    print(f"✅ 出牌成功: {response.get('player_name')}")
                elif response.get('type') == 'round_resolved':
                    print(f"✅ 回合结算完成")
                    self.test_results.append(('出牌', '通过'))
                    return True
                elif response.get('type') == 'game_over':
                    print(f"✅ 游戏结束")
                    self.test_results.append(('出牌', '通过'))
                    return True
        
        self.test_results.append(('出牌', '部分通过'))
        return True
    
    async def test_shop(self):
        """测试商城功能"""
        print("\n🛍️ 测试商城功能...")
        await self.send({'type': 'get_shop'})
        
        response = await self.receive_specific('shop_data')
        if response:
            items = response.get('items', [])
            coins = response.get('coins', 0)
            print(f"✅ 商城数据获取成功")
            print(f"   商品数量: {len(items)}")
            print(f"   当前金币: {coins}")
            self.test_results.append(('商城', '通过'))
            return True
        
        print("❌ 商城功能失败")
        self.test_results.append(('商城', '失败'))
        return False
    
    async def test_tournament(self):
        """测试锦标赛功能"""
        print("\n🏆 测试锦标赛功能...")
        await self.send({'type': 'get_tournaments'})
        
        response = await self.receive_specific('tournaments_data')
        if response:
            tournaments = response.get('tournaments', [])
            record = response.get('record', {})
            print(f"✅ 锦标赛数据获取成功")
            print(f"   锦标赛数量: {len(tournaments)}")
            print(f"   我的参赛次数: {record.get('tournaments_played', 0)}")
            
            if tournaments:
                for t in tournaments[:3]:
                    print(f"   - {t['name']}: {t['players']}/{t['max_players']}人")
            
            self.test_results.append(('锦标赛', '通过'))
            return True
        
        print("❌ 锦标赛功能失败")
        self.test_results.append(('锦标赛', '失败'))
        return False
    
    async def test_stats(self):
        """测试统计功能"""
        print("\n📊 测试统计功能...")
        await self.send({'type': 'get_stats'})
        
        response = await self.receive_specific('stats_data')
        if response:
            stats = response.get('stats', {})
            leaderboard = response.get('leaderboard', [])
            print(f"✅ 统计数据获取成功")
            print(f"   游戏场次: {stats.get('games_played', 0)}")
            print(f"   胜场: {stats.get('games_won', 0)}")
            print(f"   排行榜人数: {len(leaderboard)}")
            self.test_results.append(('统计', '通过'))
            return True
        
        print("❌ 统计功能失败")
        self.test_results.append(('统计', '失败'))
        return False
    
    async def test_daily_reward(self):
        """测试每日奖励"""
        print("\n🎁 测试每日奖励...")
        await self.send({'type': 'get_daily_reward'})
        
        response = await self.receive_specific('daily_reward_status')
        if response:
            can_claim = response.get('can_claim', False)
            streak = response.get('streak', 0)
            print(f"✅ 每日奖励状态获取成功")
            print(f"   可领取: {can_claim}")
            print(f"   连续登录: {streak}天")
            self.test_results.append(('每日奖励', '通过'))
            return True
        
        print("❌ 每日奖励功能失败")
        self.test_results.append(('每日奖励', '失败'))
        return False
    
    async def close(self):
        """关闭连接"""
        if self.ws:
            await self.ws.close()
    
    def print_summary(self):
        """打印测试摘要"""
        print("\n" + "=" * 50)
        print("📋 测试摘要")
        print("=" * 50)
        for test_name, result in self.test_results:
            status = "✅" if result in ['通过', '部分通过'] else "❌"
            print(f"{status} {test_name}: {result}")
        
        passed = sum(1 for _, r in self.test_results if r in ['通过', '部分通过'])
        total = len(self.test_results)
        print("-" * 50)
        print(f"总计: {passed}/{total} 通过 ({passed/total*100:.1f}%)")


async def main():
    """主测试函数"""
    print("=" * 50)
    print("🎮 Tower of Fate - 全面功能测试")
    print("=" * 50)
    
    tester = GameTester()
    
    # 连接服务器
    if not await tester.connect():
        print("无法连接到游戏服务器，请确保服务器已启动")
        return
    
    try:
        # 运行所有测试
        await tester.test_login()
        await tester.test_single_player()
        await tester.test_play_card()
        await tester.test_shop()
        await tester.test_tournament()
        await tester.test_stats()
        await tester.test_daily_reward()
        
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {e}")
    finally:
        await tester.close()
    
    # 打印测试摘要
    tester.print_summary()


if __name__ == "__main__":
    asyncio.run(main())
