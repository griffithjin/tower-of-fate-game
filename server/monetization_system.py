"""
Tower of Fate - 付费深度系统 + 运营活动系统
月卡/基金/礼包/皮肤合成/称号系统/双倍活动/邀请返利/直播系统
"""
import time
from typing import Dict, List, Optional

class SubscriptionSystem:
    """订阅系统 (月卡/季卡/年卡)"""
    
    SUBSCRIPTIONS = {
        'monthly': {
            'id': 'monthly',
            'name': '月卡',
            'price': 30,  # 元
            'duration': 30,  # 天
            'daily_reward': {'coins': 100, 'diamonds': 10},
            'instant_reward': {'diamonds': 300},
            'privileges': ['每日额外任务', '专属头像框', '聊天标识']
        },
        'quarterly': {
            'id': 'quarterly',
            'name': '季卡',
            'price': 78,  # 元
            'duration': 90,
            'daily_reward': {'coins': 150, 'diamonds': 15},
            'instant_reward': {'diamonds': 900},
            'privileges': ['月卡所有特权', '专属皮肤', '经验加成20%']
        },
        'yearly': {
            'id': 'yearly',
            'name': '年卡',
            'price': 248,  # 元
            'duration': 365,
            'daily_reward': {'coins': 200, 'diamonds': 25},
            'instant_reward': {'diamonds': 3000},
            'privileges': ['季卡所有特权', '限定称号', '专属客服', '经验加成50%']
        }
    }
    
    def __init__(self):
        self.player_subscriptions = {}  # player_id -> {type, expire_time, last_claim}
    
    def purchase(self, player_id: str, sub_type: str) -> Dict:
        """购买订阅"""
        if sub_type not in self.SUBSCRIPTIONS:
            return {'success': False, 'error': '订阅类型不存在'}
        
        sub = self.SUBSCRIPTIONS[sub_type]
        
        # 计算过期时间
        expire_time = int(time.time()) + sub['duration'] * 86400
        
        self.player_subscriptions[player_id] = {
            'type': sub_type,
            'purchase_time': int(time.time()),
            'expire_time': expire_time,
            'last_claim': 0
        }
        
        return {
            'success': True,
            'subscription': sub,
            'instant_reward': sub['instant_reward'],
            'expire_date': expire_time
        }
    
    def claim_daily(self, player_id: str) -> Dict:
        """领取每日奖励"""
        if player_id not in self.player_subscriptions:
            return {'success': False, 'error': '没有有效订阅'}
        
        sub_data = self.player_subscriptions[player_id]
        
        # 检查是否过期
        if sub_data['expire_time'] < int(time.time()):
            return {'success': False, 'error': '订阅已过期'}
        
        # 检查今日是否已领取
        today = int(time.time()) // 86400
        if sub_data['last_claim'] // 86400 == today:
            return {'success': False, 'error': '今日已领取'}
        
        sub = self.SUBSCRIPTIONS[sub_data['type']]
        sub_data['last_claim'] = int(time.time())
        
        return {
            'success': True,
            'reward': sub['daily_reward']
        }
    
    def get_subscription_status(self, player_id: str) -> Optional[Dict]:
        """获取订阅状态"""
        if player_id not in self.player_subscriptions:
            return None
        
        sub_data = self.player_subscriptions[player_id]
        sub = self.SUBSCRIPTIONS[sub_data['type']]
        
        remaining_days = (sub_data['expire_time'] - int(time.time())) // 86400
        
        return {
            'type': sub_data['type'],
            'name': sub['name'],
            'expire_time': sub_data['expire_time'],
            'remaining_days': max(0, remaining_days),
            'privileges': sub['privileges'],
            'can_claim_daily': sub_data['last_claim'] // 86400 != int(time.time()) // 86400
        }


class FundSystem:
    """基金系统"""
    
    FUNDS = {
        'growth': {
            'id': 'growth',
            'name': '成长基金',
            'price': 98,
            'total_return': 980,  # 10倍返利
            'milestones': [
                {'level': 5, 'reward': {'diamonds': 100}},
                {'level': 10, 'reward': {'diamonds': 150}},
                {'level': 15, 'reward': {'diamonds': 200}},
                {'level': 20, 'reward': {'diamonds': 250}},
                {'level': 25, 'reward': {'diamonds': 280}},
            ]
        }
    }
    
    def __init__(self):
        self.player_funds = {}  # player_id -> {fund_id, purchased, claimed_milestones}
    
    def purchase_fund(self, player_id: str, fund_id: str) -> Dict:
        """购买基金"""
        if fund_id not in self.FUNDS:
            return {'success': False, 'error': '基金不存在'}
        
        if player_id in self.player_funds and self.player_funds[player_id].get('purchased'):
            return {'success': False, 'error': '已购买该基金'}
        
        fund = self.FUNDS[fund_id]
        
        self.player_funds[player_id] = {
            'fund_id': fund_id,
            'purchased': True,
            'purchase_time': int(time.time()),
            'claimed_milestones': []
        }
        
        return {
            'success': True,
            'fund': fund,
            'total_return': fund['total_return'],
            'roi': f"{fund['total_return'] / fund['price']:.1f}倍"
        }
    
    def claim_milestone(self, player_id: str, player_level: int) -> List[Dict]:
        """领取达标奖励"""
        if player_id not in self.player_funds:
            return []
        
        fund_data = self.player_funds[player_id]
        fund = self.FUNDS[fund_data['fund_id']]
        
        rewards = []
        for milestone in fund['milestones']:
            if (player_level >= milestone['level'] and 
                milestone['level'] not in fund_data['claimed_milestones']):
                
                fund_data['claimed_milestones'].append(milestone['level'])
                rewards.append({
                    'level': milestone['level'],
                    'reward': milestone['reward']
                })
        
        return rewards


class GiftPackSystem:
    """限时礼包系统"""
    
    GIFT_PACKS = {
        'first_purchase': {
            'id': 'first_purchase',
            'name': '首充礼包',
            'price': 6,
            'contents': {'diamonds': 60, 'coins': 600, 'skin': 'first_purchase_frame'},
            'limit': 1,
            'tag': '超值'
        },
        'daily_special': {
            'id': 'daily_special',
            'name': '每日特惠',
            'price': 12,
            'contents': {'diamonds': 120, 'coins': 1200},
            'limit': 1,
            'refresh': 'daily',
            'tag': '每日'
        },
        'weekly_deal': {
            'id': 'weekly_deal',
            'name': '周末狂欢',
            'price': 68,
            'contents': {'diamonds': 680, 'coins': 6800, 'destiny_cards': 5},
            'limit': 1,
            'refresh': 'weekly',
            'tag': '周末'
        },
        'returning': {
            'id': 'returning',
            'name': '回归礼包',
            'price': 30,
            'contents': {'diamonds': 300, 'coins': 3000, 'vip_days': 7},
            'condition': 'offline_7_days',
            'tag': '回归'
        },
        'holiday': {
            'id': 'holiday',
            'name': '节日礼包',
            'price': 128,
            'contents': {'diamonds': 1280, 'coins': 12800, 'exclusive_skin': 'holiday_special'},
            'limit': 1,
            'available': 'holiday_only',
            'tag': '限定'
        }
    }
    
    def __init__(self):
        self.player_purchases = {}  # player_id -> {pack_id: count}
    
    def get_available_packs(self, player_id: str, player_data: Dict = None) -> List[Dict]:
        """获取可用礼包"""
        available = []
        purchases = self.player_purchases.get(player_id, {})
        
        for pack_id, pack in self.GIFT_PACKS.items():
            # 检查购买限制
            if purchases.get(pack_id, 0) >= pack.get('limit', 999):
                continue
            
            # 检查特殊条件
            if pack.get('condition') == 'offline_7_days':
                if not player_data or player_data.get('offline_days', 0) < 7:
                    continue
            
            available.append(pack)
        
        return available
    
    def purchase_pack(self, player_id: str, pack_id: str) -> Dict:
        """购买礼包"""
        if pack_id not in self.GIFT_PACKS:
            return {'success': False, 'error': '礼包不存在'}
        
        pack = self.GIFT_PACKS[pack_id]
        
        if player_id not in self.player_purchases:
            self.player_purchases[player_id] = {}
        
        current_count = self.player_purchases[player_id].get(pack_id, 0)
        if current_count >= pack.get('limit', 999):
            return {'success': False, 'error': '购买次数已达上限'}
        
        self.player_purchases[player_id][pack_id] = current_count + 1
        
        return {
            'success': True,
            'pack': pack,
            'contents': pack['contents']
        }


class TitleSystem:
    """称号系统"""
    
    TITLES = {
        # 成就称号
        'first_win': {'id': 'first_win', 'name': '初露锋芒', 'desc': '获得首场胜利', 'condition': 'win_1', 'effect': None},
        'win_100': {'id': 'win_100', 'name': '百战百胜', 'desc': '累计100场胜利', 'condition': 'win_100', 'effect': {'coins_bonus': 0.05}},
        'perfect_master': {'id': 'perfect_master', 'name': '天命之子', 'desc': '累计50次完美匹配', 'condition': 'perfect_50', 'effect': {'destiny_chance': 0.1}},
        'tower_conqueror': {'id': 'tower_conqueror', 'name': '塔楼征服者', 'desc': '成功登顶A层100次', 'condition': 'top_100', 'effect': {'exp_bonus': 0.1}},
        'rich_player': {'id': 'rich_player', 'name': '富豪', 'desc': '累计获得100万金币', 'condition': 'coins_1000000', 'effect': {'shop_discount': 0.05}},
        
        # 活动称号
        'brawl_champion': {'id': 'brawl_champion', 'name': '乱斗之王', 'desc': '获得乱斗冠军10次', 'condition': 'brawl_win_10', 'effect': None},
        'guild_leader': {'id': 'guild_leader', 'name': '公会领袖', 'desc': '创建公会并发展到满级', 'condition': 'guild_max', 'effect': {'guild_bonus': 0.1}},
        
        # 限定称号
        'beta_player': {'id': 'beta_player', 'name': '先驱者', 'desc': '参与内测的玩家', 'condition': 'beta', 'effect': None, 'rarity': 'legendary'},
        'first_season_champion': {'id': 'first_season_champion', 'name': '第一赛季王者', 'desc': '第一赛季达到王者段位', 'condition': 'season1_master', 'effect': None, 'rarity': 'legendary'},
    }
    
    def __init__(self):
        self.player_titles = {}  # player_id -> {owned: [], equipped: None}
    
    def check_title_unlock(self, player_id: str, stats: Dict) -> List[Dict]:
        """检查称号解锁"""
        unlocked = []
        
        for title_id, title in self.TITLES.items():
            if self._check_condition(title['condition'], stats):
                if player_id not in self.player_titles:
                    self.player_titles[player_id] = {'owned': [], 'equipped': None}
                
                if title_id not in self.player_titles[player_id]['owned']:
                    self.player_titles[player_id]['owned'].append(title_id)
                    unlocked.append(title)
        
        return unlocked
    
    def _check_condition(self, condition: str, stats: Dict) -> bool:
        """检查解锁条件"""
        conditions = {
            'win_1': lambda s: s.get('wins', 0) >= 1,
            'win_100': lambda s: s.get('wins', 0) >= 100,
            'perfect_50': lambda s: s.get('perfect_matches', 0) >= 50,
            'top_100': lambda s: s.get('top_reaches', 0) >= 100,
            'coins_1000000': lambda s: s.get('total_coins', 0) >= 1000000,
        }
        
        checker = conditions.get(condition)
        return checker(stats) if checker else False
    
    def equip_title(self, player_id: str, title_id: str) -> Dict:
        """装备称号"""
        if player_id not in self.player_titles:
            return {'success': False, 'error': '未获得该称号'}
        
        if title_id not in self.player_titles[player_id]['owned']:
            return {'success': False, 'error': '未获得该称号'}
        
        self.player_titles[player_id]['equipped'] = title_id
        title = self.TITLES[title_id]
        
        return {
            'success': True,
            'title': title,
            'effect': title.get('effect')
        }


class EventSystem:
    """运营活动系统"""
    
    def __init__(self):
        self.active_events = {}
    
    def create_double_event(self, event_type: str, multiplier: float, duration_hours: int):
        """创建双倍活动"""
        event_id = f"double_{event_type}_{int(time.time())}"
        self.active_events[event_id] = {
            'id': event_id,
            'type': 'double',
            'target': event_type,  # 'coins', 'exp', 'drop'
            'multiplier': multiplier,
            'start_time': int(time.time()),
            'end_time': int(time.time()) + duration_hours * 3600
        }
    
    def create_login_event(self, days: int, rewards: List[Dict]):
        """创建登录活动"""
        self.active_events['login_bonus'] = {
            'id': 'login_bonus',
            'type': 'login',
            'days': days,
            'rewards': rewards,
            'start_time': int(time.time()),
            'end_time': int(time.time()) + days * 86400
        }
    
    def get_active_events(self) -> List[Dict]:
        """获取进行中的活动"""
        now = int(time.time())
        active = []
        
        for event_id, event in self.active_events.items():
            if event['start_time'] <= now <= event['end_time']:
                remaining = event['end_time'] - now
                active.append({
                    **event,
                    'time_left_hours': remaining // 3600
                })
        
        return active


class ReferralSystem:
    """邀请返利系统"""
    
    def __init__(self):
        self.referrals = {}  # inviter_id -> [invited_ids]
        self.referral_rewards = {}
    
    def generate_referral_code(self, player_id: str) -> str:
        """生成邀请码"""
        return f"REF{player_id[:6].upper()}"
    
    def use_referral_code(self, new_player_id: str, code: str) -> Dict:
        """使用邀请码"""
        inviter_id = code[3:].lower()
        
        if inviter_id == new_player_id:
            return {'success': False, 'error': '不能使用自己的邀请码'}
        
        if inviter_id not in self.referrals:
            self.referrals[inviter_id] = []
        
        self.referrals[inviter_id].append({
            'player_id': new_player_id,
            'invite_time': int(time.time()),
            'total_spent': 0,
            'rewards_claimed': 0
        })
        
        # 新手奖励
        return {
            'success': True,
            'new_player_reward': {'coins': 500, 'diamonds': 50},
            'inviter': inviter_id
        }
    
    def on_referred_purchase(self, player_id: str, amount: float):
        """被邀请人消费时"""
        for inviter_id, referrals in self.referrals.items():
            for referral in referrals:
                if referral['player_id'] == player_id:
                    referral['total_spent'] += amount
                    
                    # 返利给邀请人
                    rebate = amount * 0.1  # 10%返利
                    print(f"[邀请返利] 邀请人 {inviter_id} 获得返利: {rebate}元")


class LiveStreamSystem:
    """直播系统"""
    
    def __init__(self):
        self.streamers = {}  # player_id -> streamer_data
        self.active_streams = {}  # stream_id -> stream_data
    
    def apply_streamer(self, player_id: str, info: Dict) -> Dict:
        """申请成为主播"""
        self.streamers[player_id] = {
            'id': player_id,
            'name': info.get('name'),
            'status': 'pending',  # pending, approved, rejected
            'apply_time': int(time.time()),
            'followers': 0,
            'total_streams': 0
        }
        
        return {'success': True, 'message': '申请已提交，等待审核'}
    
    def approve_streamer(self, player_id: str):
        """批准主播申请"""
        if player_id in self.streamers:
            self.streamers[player_id]['status'] = 'approved'
    
    def start_stream(self, player_id: str, title: str) -> str:
        """开始直播"""
        if player_id not in self.streamers or self.streamers[player_id]['status'] != 'approved':
            return {'success': False, 'error': '不是认证主播'}
        
        stream_id = f"stream_{player_id}_{int(time.time())}"
        
        self.active_streams[stream_id] = {
            'id': stream_id,
            'streamer_id': player_id,
            'title': title,
            'start_time': int(time.time()),
            'viewers': 0,
            'gifts': 0
        }
        
        self.streamers[player_id]['total_streams'] += 1
        
        return {'success': True, 'stream_id': stream_id}
    
    def send_gift(self, stream_id: str, from_id: str, gift_type: str, amount: int):
        """送礼物"""
        if stream_id not in self.active_streams:
            return {'success': False, 'error': '直播不存在'}
        
        stream = self.active_streams[stream_id]
        stream['gifts'] += amount
        
        # 主播分成
        streamer_id = stream['streamer_id']
        revenue = amount * 0.5  # 50%分成
        
        print(f"[直播] {from_id} 给 {streamer_id} 送礼物 {gift_type} x{amount}")
        
        return {'success': True}

# 全局实例
subscription_system = SubscriptionSystem()
fund_system = FundSystem()
gift_pack_system = GiftPackSystem()
title_system = TitleSystem()
event_system = EventSystem()
referral_system = ReferralSystem()
live_stream_system = LiveStreamSystem()
