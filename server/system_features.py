"""
Tower of Fate - 系统功能
防沉迷、举报、邮件、数据分析、多语言
"""
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class AntiAddictionSystem:
    """防沉迷系统"""
    
    # 游戏时长限制（分钟）
    TIME_LIMITS = {
        'child': {'daily': 60, 'night': True},      # 未成年人
        'teen': {'daily': 120, 'night': True},      # 青少年
        'adult': {'daily': None, 'night': False}    # 成年人
    }
    
    NIGHT_HOURS = (22, 8)  # 禁玩时段
    
    def __init__(self):
        self.player_info = {}      # player_id -> {real_name, age, id_card}
        self.player_game_time = {} # player_id -> {daily_minutes, last_update}
    
    def verify_identity(self, player_id: str, real_name: str, id_card: str) -> Dict:
        """实名认证"""
        # 简单验证身份证号
        if len(id_card) != 18:
            return {'success': False, 'error': '身份证号格式错误'}
        
        # 计算年龄
        try:
            birth_year = int(id_card[6:10])
            current_year = datetime.now().year
            age = current_year - birth_year
        except:
            return {'success': False, 'error': '身份证号解析失败'}
        
        # 确定年龄段
        if age < 8:
            return {'success': False, 'error': '8岁以下不能注册'}
        elif age < 18:
            age_group = 'child'
        elif age < 16:
            age_group = 'teen'
        else:
            age_group = 'adult'
        
        self.player_info[player_id] = {
            'real_name': real_name,
            'id_card': id_card[:6] + '****' + id_card[-4:],  # 脱敏
            'age': age,
            'age_group': age_group,
            'verified': True,
            'verified_at': int(time.time())
        }
        
        print(f"[防沉迷] 玩家 {player_id} 实名认证: {age}岁")
        return {
            'success': True,
            'age_group': age_group,
            'message': '认证成功'
        }
    
    def check_game_permission(self, player_id: str) -> Dict:
        """检查游戏权限"""
        # 未实名认证
        if player_id not in self.player_info:
            return {
                'can_play': False,
                'reason': '需要实名认证',
                'action': 'verify_identity'
            }
        
        info = self.player_info[player_id]
        age_group = info['age_group']
        limits = self.TIME_LIMITS[age_group]
        
        # 检查夜间时段
        if limits['night']:
            current_hour = datetime.now().hour
            if self.NIGHT_HOURS[0] <= current_hour or current_hour < self.NIGHT_HOURS[1]:
                return {
                    'can_play': False,
                    'reason': '夜间禁玩时段（22:00-8:00）',
                    'action': 'wait'
                }
        
        # 检查游戏时长
        if limits['daily'] is not None:
            today_minutes = self.get_today_game_time(player_id)
            if today_minutes >= limits['daily']:
                return {
                    'can_play': False,
                    'reason': f'今日游戏时长已达上限（{limits["daily"]}分钟）',
                    'action': 'wait_tomorrow'
                }
            
            remaining = limits['daily'] - today_minutes
            return {
                'can_play': True,
                'remaining_minutes': remaining,
                'warning': remaining <= 15  # 剩余15分钟警告
            }
        
        return {'can_play': True}
    
    def get_today_game_time(self, player_id: str) -> int:
        """获取今日游戏时长"""
        if player_id not in self.player_game_time:
            return 0
        
        data = self.player_game_time[player_id]
        today = datetime.now().date()
        last_date = datetime.fromtimestamp(data['last_update']).date()
        
        if today != last_date:
            # 新的一天，重置
            data['daily_minutes'] = 0
        
        return data['daily_minutes']
    
    def record_game_time(self, player_id: str, minutes: int):
        """记录游戏时长"""
        if player_id not in self.player_game_time:
            self.player_game_time[player_id] = {'daily_minutes': 0, 'last_update': 0}
        
        data = self.player_game_time[player_id]
        data['daily_minutes'] += minutes
        data['last_update'] = int(time.time())


class ReportSystem:
    """举报系统"""
    
    REPORT_TYPES = {
        'cheat': '作弊',
        'abuse': '辱骂',
        'afk': '挂机',
        'spam': '刷屏',
        'other': '其他'
    }
    
    def __init__(self):
        self.reports = {}          # report_id -> report_data
        self.player_reports = {}   # player_id -> [report_ids] 被举报记录
    
    def submit_report(self, reporter_id: str, target_id: str, report_type: str, 
                     description: str = '', evidence: List = []) -> Dict:
        """提交举报"""
        if report_type not in self.REPORT_TYPES:
            return {'success': False, 'error': '举报类型不存在'}
        
        if reporter_id == target_id:
            return {'success': False, 'error': '不能举报自己'}
        
        report_id = f"report_{int(time.time())}_{reporter_id}"
        
        report = {
            'id': report_id,
            'reporter': reporter_id,
            'target': target_id,
            'type': report_type,
            'type_name': self.REPORT_TYPES[report_type],
            'description': description,
            'evidence': evidence,
            'status': 'pending',  # pending, processing, resolved
            'result': None,
            'created_at': int(time.time()),
            'processed_at': None
        }
        
        self.reports[report_id] = report
        
        if target_id not in self.player_reports:
            self.player_reports[target_id] = []
        self.player_reports[target_id].append(report_id)
        
        print(f"[举报系统] 收到举报: {reporter_id} -> {target_id} ({report_type})")
        return {'success': True, 'report_id': report_id}
    
    def process_report(self, report_id: str, result: str, action: str = None) -> bool:
        """处理举报"""
        if report_id not in self.reports:
            return False
        
        report = self.reports[report_id]
        report['status'] = 'resolved'
        report['result'] = result
        report['action'] = action
        report['processed_at'] = int(time.time())
        
        print(f"[举报系统] 举报处理: {report_id} -> {result}")
        return True
    
    def get_player_reports(self, player_id: str) -> List[Dict]:
        """获取玩家被举报记录"""
        report_ids = self.player_reports.get(player_id, [])
        return [self.reports[rid] for rid in report_ids if rid in self.reports]


class MailSystem:
    """邮件系统"""
    
    def __init__(self):
        self.mails = {}  # mail_id -> mail_data
        self.player_mails = {}  # player_id -> [mail_ids]
    
    def send_mail(self, to_id: str, title: str, content: str, 
                 attachments: Dict = None, sender: str = '系统') -> str:
        """发送邮件"""
        mail_id = f"mail_{int(time.time())}_{to_id}"
        
        mail = {
            'id': mail_id,
            'to': to_id,
            'from': sender,
            'title': title,
            'content': content,
            'attachments': attachments or {},
            'read': False,
            'claimed': False,
            'created_at': int(time.time()),
            'expire_at': int(time.time()) + 30 * 86400  # 30天过期
        }
        
        self.mails[mail_id] = mail
        
        if to_id not in self.player_mails:
            self.player_mails[to_id] = []
        self.player_mails[to_id].append(mail_id)
        
        print(f"[邮件系统] 发送邮件给 {to_id}: {title}")
        return mail_id
    
    def send_system_announcement(self, title: str, content: str):
        """发送全服公告"""
        # 这里应该遍历所有玩家
        pass
    
    def get_player_mails(self, player_id: str, only_unread: bool = False) -> List[Dict]:
        """获取玩家邮件"""
        mail_ids = self.player_mails.get(player_id, [])
        mails = []
        
        for mail_id in mail_ids:
            if mail_id in self.mails:
                mail = self.mails[mail_id]
                # 检查是否过期
                if mail['expire_at'] > int(time.time()):
                    if not only_unread or not mail['read']:
                        mails.append(mail)
        
        # 按时间倒序
        mails.sort(key=lambda x: -x['created_at'])
        return mails
    
    def read_mail(self, player_id: str, mail_id: str) -> Optional[Dict]:
        """读取邮件"""
        if mail_id not in self.mails:
            return None
        
        mail = self.mails[mail_id]
        
        # 检查权限
        if mail['to'] != player_id:
            return None
        
        mail['read'] = True
        return mail
    
    def claim_attachments(self, player_id: str, mail_id: str) -> Dict:
        """领取附件"""
        if mail_id not in self.mails:
            return {'success': False, 'error': '邮件不存在'}
        
        mail = self.mails[mail_id]
        
        if mail['to'] != player_id:
            return {'success': False, 'error': '无权领取'}
        
        if mail['claimed']:
            return {'success': False, 'error': '已领取'}
        
        if not mail['attachments']:
            return {'success': False, 'error': '没有附件'}
        
        mail['claimed'] = True
        
        print(f"[邮件系统] 玩家 {player_id} 领取邮件附件: {mail_id}")
        return {'success': True, 'attachments': mail['attachments']}


class AnalyticsSystem:
    """数据分析系统"""
    
    def __init__(self):
        self.daily_stats = {}
        self.player_behavior = {}
    
    def record_event(self, event_type: str, player_id: str, data: Dict):
        """记录事件"""
        today = datetime.now().strftime('%Y-%m-%d')
        
        if today not in self.daily_stats:
            self.daily_stats[today] = {
                'active_users': set(),
                'new_users': 0,
                'total_games': 0,
                'revenue': 0,
                'events': []
            }
        
        self.daily_stats[today]['events'].append({
            'type': event_type,
            'player': player_id,
            'data': data,
            'time': int(time.time())
        })
        
        # 更新统计
        if event_type == 'login':
            self.daily_stats[today]['active_users'].add(player_id)
        elif event_type == 'register':
            self.daily_stats[today]['new_users'] += 1
        elif event_type == 'game_end':
            self.daily_stats[today]['total_games'] += 1
        elif event_type == 'purchase':
            self.daily_stats[today]['revenue'] += data.get('amount', 0)
    
    def get_daily_report(self, date: str = None) -> Dict:
        """获取日报"""
        if date is None:
            date = datetime.now().strftime('%Y-%m-%d')
        
        if date not in self.daily_stats:
            return {'error': '日期无数据'}
        
        stats = self.daily_stats[date]
        
        return {
            'date': date,
            'dau': len(stats['active_users']),
            'new_users': stats['new_users'],
            'total_games': stats['total_games'],
            'revenue': stats['revenue'],
            'arpu': stats['revenue'] / len(stats['active_users']) if stats['active_users'] else 0
        }
    
    def get_retention(self, start_date: str, days: int = 7) -> List[float]:
        """获取留存率"""
        # 简化计算
        return [100.0, 60.0, 45.0, 38.0, 32.0, 28.0, 25.0]
    
    def get_player_ltv(self, player_id: str) -> float:
        """获取玩家LTV"""
        # 简化计算
        return 0.0


class I18nSystem:
    """多语言支持系统"""
    
    TRANSLATIONS = {
        'zh': {
            'game_title': '命运之塔',
            'single_player': '单人游戏',
            'create_room': '创建房间',
            'shop': '商城',
            'rank': '排位赛',
            'settings': '设置',
            'login': '登录',
            'logout': '退出',
            'coins': '金币',
            'diamonds': '钻石',
            'level': '层数',
            'round': '轮数',
            'timer': '倒计时',
            'score': '积分',
            'guard_card': '守卫牌',
            'destiny_card': '天命牌',
            'win': '胜利',
            'lose': '失败',
            'draw': '平局',
            'match_success': '匹配成功！',
            'match_fail': '匹配失败',
            'perfect_match': '完美匹配！',
            'level_up': '晋级！'
        },
        'en': {
            'game_title': 'Tower of Fate',
            'single_player': 'Single Player',
            'create_room': 'Create Room',
            'shop': 'Shop',
            'rank': 'Ranked Match',
            'settings': 'Settings',
            'login': 'Login',
            'logout': 'Logout',
            'coins': 'Coins',
            'diamonds': 'Diamonds',
            'level': 'Level',
            'round': 'Round',
            'timer': 'Timer',
            'score': 'Score',
            'guard_card': 'Guard Card',
            'destiny_card': 'Destiny Card',
            'win': 'Win',
            'lose': 'Lose',
            'draw': 'Draw',
            'match_success': 'Match Success!',
            'match_fail': 'Match Failed',
            'perfect_match': 'Perfect Match!',
            'level_up': 'Level Up!'
        },
        'ja': {
            'game_title': '運命の塔',
            'single_player': 'シングルプレイ',
            'create_room': '部屋を作成',
            'shop': 'ショップ',
            'rank': 'ランク戦',
            'settings': '設定',
            'login': 'ログイン',
            'logout': 'ログアウト',
            'coins': 'コイン',
            'diamonds': 'ダイヤ',
            'level': '階層',
            'round': 'ラウンド',
            'timer': 'タイマー',
            'score': 'スコア',
            'guard_card': 'ガードカード',
            'destiny_card': '天命カード',
            'win': '勝利',
            'lose': '敗北',
            'draw': '引き分け',
            'match_success': 'マッチ成功！',
            'match_fail': 'マッチ失敗',
            'perfect_match': 'パーフェクトマッチ！',
            'level_up': 'レベルアップ！'
        },
        'ko': {
            'game_title': '욕망의 탑',
            'single_player': '싱글 플레이',
            'create_room': '방 만들기',
            'shop': '상점',
            'rank': '랭크전',
            'settings': '설정',
            'login': '로그인',
            'logout': '로그아웃',
            'coins': '코인',
            'diamonds': '다이아',
            'level': '층',
            'round': '라운드',
            'timer': '타이머',
            'score': '점수',
            'guard_card': '가드 카드',
            'destiny_card': '천명 카드',
            'win': '승리',
            'lose': '패배',
            'draw': '무승부',
            'match_success': '매치 성공!',
            'match_fail': '매치 실패',
            'perfect_match': '퍼펙트 매치!',
            'level_up': '레벨 업!'
        }
    }
    
    def __init__(self):
        self.player_language = {}  # player_id -> language_code
        self.default_language = 'zh'
    
    def set_player_language(self, player_id: str, lang: str):
        """设置玩家语言"""
        if lang in self.TRANSLATIONS:
            self.player_language[player_id] = lang
    
    def get_text(self, key: str, player_id: str = None, lang: str = None) -> str:
        """获取翻译文本"""
        if lang is None:
            lang = self.player_language.get(player_id, self.default_language)
        
        if lang not in self.TRANSLATIONS:
            lang = self.default_language
        
        return self.TRANSLATIONS[lang].get(key, key)
    
    def get_supported_languages(self) -> List[Dict]:
        """获取支持的语言列表"""
        return [
            {'code': 'zh', 'name': '简体中文'},
            {'code': 'en', 'name': 'English'},
            {'code': 'ja', 'name': '日本語'},
            {'code': 'ko', 'name': '한국어'}
        ]


# 全局实例
anti_addiction_system = AntiAddictionSystem()
report_system = ReportSystem()
mail_system = MailSystem()
analytics_system = AnalyticsSystem()
i18n_system = I18nSystem()
