"""
Tower of Fate - 好友系统
添加好友、私聊、在线状态、好友推荐
"""
import json
import time
from typing import Dict, List, Optional

class FriendSystem:
    """好友系统"""
    
    def __init__(self):
        self.friendships = {}  # player_id -> {friend_id: friendship_data}
        self.friend_requests = {}  # player_id -> [request_data]
        self.player_status = {}  # player_id -> {status, last_online}
        self.block_list = {}  # player_id -> [blocked_ids]
        self.recommendations = {}  # 好友推荐缓存
    
    # ==================== 好友管理 ====================
    
    def send_friend_request(self, from_id: str, to_id: str, message: str = ""):
        """发送好友请求"""
        if from_id == to_id:
            return {'success': False, 'error': '不能添加自己为好友'}
        
        # 检查是否已是好友
        if self._are_friends(from_id, to_id):
            return {'success': False, 'error': '对方已是你的好友'}
        
        # 检查是否被拉黑
        if self._is_blocked(to_id, from_id):
            return {'success': False, 'error': '对方拒绝了你的请求'}
        
        # 检查是否已有待处理请求
        if to_id in self.friend_requests:
            for req in self.friend_requests[to_id]:
                if req['from'] == from_id and req['status'] == 'pending':
                    return {'success': False, 'error': '已有待处理请求'}
        
        # 创建请求
        request = {
            'id': f"req_{int(time.time())}_{from_id}",
            'from': from_id,
            'to': to_id,
            'message': message or '请求添加你为好友',
            'timestamp': int(time.time()),
            'status': 'pending'
        }
        
        if to_id not in self.friend_requests:
            self.friend_requests[to_id] = []
        self.friend_requests[to_id].append(request)
        
        print(f"[好友系统] {from_id} 向 {to_id} 发送好友请求")
        return {'success': True, 'request': request}
    
    def respond_friend_request(self, player_id: str, request_id: str, accept: bool):
        """响应好友请求"""
        requests = self.friend_requests.get(player_id, [])
        
        for req in requests:
            if req['id'] == request_id and req['status'] == 'pending':
                if accept:
                    req['status'] = 'accepted'
                    # 建立双向好友关系
                    self._add_friendship(req['from'], player_id)
                    print(f"[好友系统] {player_id} 接受了 {req['from']} 的好友请求")
                    return {'success': True, 'accepted': True, 'friend_id': req['from']}
                else:
                    req['status'] = 'rejected'
                    print(f"[好友系统] {player_id} 拒绝了 {req['from']} 的好友请求")
                    return {'success': True, 'accepted': False}
        
        return {'success': False, 'error': '请求不存在或已处理'}
    
    def _add_friendship(self, id1: str, id2: str):
        """建立好友关系"""
        timestamp = int(time.time())
        
        if id1 not in self.friendships:
            self.friendships[id1] = {}
        if id2 not in self.friendships:
            self.friendships[id2] = {}
        
        self.friendships[id1][id2] = {
            'since': timestamp,
            'intimacy': 0,  # 亲密度
            'chat_count': 0,
            'play_count': 0
        }
        
        self.friendships[id2][id1] = {
            'since': timestamp,
            'intimacy': 0,
            'chat_count': 0,
            'play_count': 0
        }
    
    def remove_friend(self, player_id: str, friend_id: str):
        """删除好友"""
        if player_id in self.friendships:
            self.friendships[player_id].pop(friend_id, None)
        if friend_id in self.friendships:
            self.friendships[friend_id].pop(player_id, None)
        
        print(f"[好友系统] {player_id} 删除了好友 {friend_id}")
        return {'success': True}
    
    def get_friends(self, player_id: str) -> List[Dict]:
        """获取好友列表"""
        friends = []
        friend_dict = self.friendships.get(player_id, {})
        
        for friend_id, data in friend_dict.items():
            status = self.get_player_status(friend_id)
            friends.append({
                'id': friend_id,
                'status': status['status'],
                'last_online': status['last_online'],
                'intimacy': data['intimacy'],
                'since': data['since']
            })
        
        # 按在线状态排序
        friends.sort(key=lambda x: (x['status'] != 'online', -x['intimacy']))
        return friends
    
    def get_friend_requests(self, player_id: str) -> List[Dict]:
        """获取好友请求列表"""
        requests = self.friend_requests.get(player_id, [])
        return [r for r in requests if r['status'] == 'pending']
    
    # ==================== 在线状态 ====================
    
    def set_player_status(self, player_id: str, status: str):
        """设置玩家在线状态"""
        self.player_status[player_id] = {
            'status': status,  # online, offline, playing
            'last_online': int(time.time()) if status != 'offline' else self.player_status.get(player_id, {}).get('last_online', 0)
        }
    
    def get_player_status(self, player_id: str) -> Dict:
        """获取玩家状态"""
        status = self.player_status.get(player_id, {
            'status': 'offline',
            'last_online': 0
        })
        
        # 检查是否长时间未更新
        if status['status'] == 'online':
            if int(time.time()) - status['last_online'] > 300:  # 5分钟无心跳视为离线
                status['status'] = 'offline'
        
        return status
    
    # ==================== 私聊系统 ====================
    
    def send_private_message(self, from_id: str, to_id: str, message: str) -> Dict:
        """发送私聊消息"""
        # 检查是否是好友
        if not self._are_friends(from_id, to_id):
            return {'success': False, 'error': '不是好友，无法私聊'}
        
        # 检查是否被拉黑
        if self._is_blocked(to_id, from_id):
            return {'success': False, 'error': '消息发送失败'}
        
        msg = {
            'id': f"msg_{int(time.time())}_{from_id}",
            'from': from_id,
            'to': to_id,
            'content': message,
            'timestamp': int(time.time()),
            'read': False
        }
        
        # 更新亲密度
        self._update_intimacy(from_id, to_id, 1)
        
        # 更新聊天计数
        if from_id in self.friendships and to_id in self.friendships[from_id]:
            self.friendships[from_id][to_id]['chat_count'] += 1
            self.friendships[to_id][from_id]['chat_count'] += 1
        
        print(f"[好友系统] {from_id} 私信 {to_id}: {message[:20]}...")
        return {'success': True, 'message': msg}
    
    # ==================== 好友推荐 ====================
    
    def get_recommendations(self, player_id: str, limit: int = 5) -> List[Dict]:
        """获取好友推荐"""
        # 简单推荐策略：推荐有共同好友的玩家
        my_friends = set(self.friendships.get(player_id, {}).keys())
        candidates = {}
        
        for friend_id in my_friends:
            friend_friends = set(self.friendships.get(friend_id, {}).keys())
            for candidate in friend_friends:
                if candidate != player_id and candidate not in my_friends:
                    if candidate not in candidates:
                        candidates[candidate] = 0
                    candidates[candidate] += 1  # 共同好友数
        
        # 按共同好友数排序
        sorted_candidates = sorted(candidates.items(), key=lambda x: -x[1])
        
        recommendations = []
        for candidate_id, common_count in sorted_candidates[:limit]:
            status = self.get_player_status(candidate_id)
            recommendations.append({
                'id': candidate_id,
                'common_friends': common_count,
                'status': status['status']
            })
        
        return recommendations
    
    # ==================== 黑名单 ====================
    
    def block_player(self, player_id: str, blocked_id: str):
        """拉黑玩家"""
        if player_id not in self.block_list:
            self.block_list[player_id] = []
        
        if blocked_id not in self.block_list[player_id]:
            self.block_list[player_id].append(blocked_id)
            
            # 删除好友关系
            self.remove_friend(player_id, blocked_id)
        
        return {'success': True}
    
    def unblock_player(self, player_id: str, blocked_id: str):
        """解除拉黑"""
        if player_id in self.block_list:
            if blocked_id in self.block_list[player_id]:
                self.block_list[player_id].remove(blocked_id)
        
        return {'success': True}
    
    # ==================== 辅助方法 ====================
    
    def _are_friends(self, id1: str, id2: str) -> bool:
        """检查是否是好友"""
        return id2 in self.friendships.get(id1, {})
    
    def _is_blocked(self, player_id: str, check_id: str) -> bool:
        """检查是否被拉黑"""
        return check_id in self.block_list.get(player_id, [])
    
    def _update_intimacy(self, id1: str, id2: str, points: int):
        """更新亲密度"""
        if id1 in self.friendships and id2 in self.friendships[id1]:
            self.friendships[id1][id2]['intimacy'] += points
            self.friendships[id2][id1]['intimacy'] += points
    
    def update_play_together(self, player_ids: List[str]):
        """更新一起游戏的亲密度"""
        for i, id1 in enumerate(player_ids):
            for id2 in player_ids[i+1:]:
                if self._are_friends(id1, id2):
                    self._update_intimacy(id1, id2, 5)
                    self.friendships[id1][id2]['play_count'] += 1
                    self.friendships[id2][id1]['play_count'] += 1

# 全局好友系统实例
friend_system = FriendSystem()
