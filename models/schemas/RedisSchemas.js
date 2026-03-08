/**
 * Redis数据结构定义
 * 用于高速缓存、实时数据、排行榜等
 */

module.exports = {
    // ==================== 在线用户管理 ====================
    onlineUser: {
        key: (userId) => `online:${userId}`,
        ttl: 300, // 5分钟过期
        fields: {
            socketId: 'string',      // Socket连接ID
            roomId: 'string',        // 当前所在房间
            lastPing: 'timestamp',   // 最后心跳时间
            deviceType: 'string',    // 设备类型
            status: 'string'         // 在线状态: online/playing/away
        }
    },
    
    // ==================== 游戏房间缓存 ====================
    gameRoom: {
        key: (roomId) => `room:${roomId}`,
        ttl: 3600, // 1小时过期
        fields: {
            gameState: 'json',       // 完整游戏状态
            players: 'json',         // 玩家列表
            lastAction: 'timestamp', // 最后操作时间
            turnExpiry: 'timestamp'  // 当前回合截止时间
        }
    },
    
    // ==================== 会话管理 ====================
    session: {
        key: (token) => `session:${token}`,
        ttl: 86400, // 24小时
        fields: {
            userId: 'string',
            createdAt: 'timestamp',
            expiresAt: 'timestamp',
            deviceId: 'string',
            ip: 'string'
        }
    },
    
    // ==================== 排行榜 (Sorted Set) ====================
    leaderboards: {
        daily: {
            key: () => `leaderboard:daily:${new Date().toISOString().slice(0, 10)}`,
            ttl: 172800, // 2天
            type: 'zset', // score: 层数, member: userId
            description: '每日最高层数排行'
        },
        weekly: {
            key: (week) => `leaderboard:weekly:${week || getWeekNumber()}`,
            ttl: 1209600, // 14天
            type: 'zset',
            description: '每周最高层数排行'
        },
        monthly: {
            key: () => `leaderboard:monthly:${new Date().toISOString().slice(0, 7)}`,
            ttl: 5184000, // 60天
            type: 'zset',
            description: '每月最高层数排行'
        },
        allTime: {
            key: 'leaderboard:alltime',
            type: 'zset',
            description: '历史最高层数排行'
        }
    },
    
    // ==================== 限流控制 ====================
    rateLimit: {
        key: (userId, action) => `ratelimit:${userId}:${action}`,
        ttl: 60, // 默认1分钟窗口
        actions: {
            login: { max: 5, window: 300 },      // 5分钟5次登录尝试
            register: { max: 3, window: 3600 },  // 1小时3次注册
            createRoom: { max: 10, window: 60 }, // 1分钟10个房间
            chat: { max: 30, window: 60 },       // 1分钟30条消息
            purchase: { max: 10, window: 60 }    // 1分钟10次购买
        }
    },
    
    // ==================== 匹配队列 ====================
    matchmaking: {
        solo: {
            key: 'queue:solo',
            type: 'list',
            description: '单人模式匹配队列'
        },
        team: {
            key: 'queue:team',
            type: 'list',
            description: '组队模式匹配队列'
        },
        tournament: {
            key: (tournamentId) => `queue:tournament:${tournamentId}`,
            type: 'list',
            description: '锦标赛匹配队列'
        }
    },
    
    // ==================== 统计数据 (Counter) ====================
    stats: {
        dailyActive: {
            key: (date) => `stats:dau:${date}`,
            type: 'set',
            description: '日活跃用户集合'
        },
        hourlyActive: {
            key: (hour) => `stats:hau:${hour}`,
            type: 'set',
            ttl: 86400
        },
        gameCount: {
            key: (date) => `stats:games:${date}`,
            type: 'hash',
            fields: ['started', 'completed', 'abandoned']
        },
        revenue: {
            key: (date) => `stats:revenue:${date}`,
            type: 'hash',
            fields: ['gems', 'coins', 'total']
        }
    },
    
    // ==================== 防沉迷缓存 ====================
    antiAddiction: {
        key: (userId) => `antiaddiction:${userId}`,
        ttl: 86400,
        fields: {
            dailyPlayTime: 'number',    // 今日游戏时长(分钟)
            lastReset: 'timestamp',     // 上次重置时间
            isRestricted: 'boolean'     // 是否已被限制
        }
    },
    
    // ==================== 邮件/通知队列 ====================
    notifications: {
        queue: 'queue:notifications',
        type: 'list',
        description: '待发送通知队列'
    },
    
    // ==================== 验证码缓存 ====================
    verificationCode: {
        key: (type, target) => `verify:${type}:${target}`,
        ttl: 300, // 5分钟
        fields: {
            code: 'string',
            attempts: 'number',
            createdAt: 'timestamp'
        }
    },
    
    // ==================== 支付状态缓存 ====================
    payment: {
        key: (orderId) => `payment:${orderId}`,
        ttl: 1800, // 30分钟
        fields: {
            status: 'string',
            createdAt: 'timestamp',
            expiresAt: 'timestamp'
        }
    },
    
    // ==================== 分布式锁 ====================
    lock: {
        key: (resource) => `lock:${resource}`,
        ttl: 30, // 30秒
        description: '防止并发操作的分布式锁'
    },
    
    // ==================== 热更新配置 ====================
    config: {
        key: (name) => `config:${name}`,
        type: 'hash',
        description: '运行时热更新配置'
    }
};

// 辅助函数：获取当前周数
function getWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now - start + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    return Math.ceil(day / 7);
}
