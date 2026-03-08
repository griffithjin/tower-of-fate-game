const prometheus = require('prom-client');
const logger = require('../utils/logger');

// 创建默认注册表
const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({ register });

/**
 * 游戏核心指标
 */
const gameMetrics = {
    // 活跃游戏数
    activeGames: new prometheus.Gauge({
        name: 'toweroffate_active_games',
        help: '当前活跃游戏数',
        labelNames: ['mode'],
        registers: [register]
    }),
    
    // 在线玩家数
    onlinePlayers: new prometheus.Gauge({
        name: 'toweroffate_online_players',
        help: '当前在线玩家数',
        registers: [register]
    }),
    
    // 游戏对局时长
    gameDuration: new prometheus.Histogram({
        name: 'toweroffate_game_duration_seconds',
        help: '游戏对局时长分布',
        labelNames: ['mode'],
        buckets: [60, 180, 300, 600, 900, 1800, 3600],
        registers: [register]
    }),
    
    // 游戏场次计数
    gamesTotal: new prometheus.Counter({
        name: 'toweroffate_games_total',
        help: '游戏场次总计',
        labelNames: ['mode', 'status'],
        registers: [register]
    }),
    
    // 玩家爬升层数
    playerAscension: new prometheus.Histogram({
        name: 'toweroffate_player_ascension_layers',
        help: '玩家到达的层数分布',
        buckets: [1, 2, 3, 5, 7, 9, 11, 13],
        registers: [register]
    }),
    
    // 玩家首登率
    firstAscensionRate: new prometheus.Gauge({
        name: 'toweroffate_first_ascension_rate',
        help: '首登者成功率',
        registers: [register]
    })
};

/**
 * API性能指标
 */
const apiMetrics = {
    // API请求总数
    apiRequests: new prometheus.Counter({
        name: 'toweroffate_api_requests_total',
        help: 'API请求总数',
        labelNames: ['method', 'route', 'status'],
        registers: [register]
    }),
    
    // API请求延迟
    apiLatency: new prometheus.Histogram({
        name: 'toweroffate_api_latency_seconds',
        help: 'API请求延迟',
        labelNames: ['method', 'route'],
        buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
        registers: [register]
    }),
    
    // WebSocket连接数
    wsConnections: new prometheus.Gauge({
        name: 'toweroffate_websocket_connections',
        help: 'WebSocket连接数',
        registers: [register]
    }),
    
    // WebSocket消息数
    wsMessages: new prometheus.Counter({
        name: 'toweroffate_websocket_messages_total',
        help: 'WebSocket消息总数',
        labelNames: ['type'],
        registers: [register]
    })
};

/**
 * 业务指标
 */
const businessMetrics = {
    // 支付金额
    paymentAmount: new prometheus.Counter({
        name: 'toweroffate_payment_amount_total',
        help: '支付金额总计',
        labelNames: ['currency', 'method', 'status'],
        registers: [register]
    }),
    
    // 支付次数
    paymentCount: new prometheus.Counter({
        name: 'toweroffate_payment_count_total',
        help: '支付次数总计',
        labelNames: ['method'],
        registers: [register]
    }),
    
    // 新用户注册
    userRegistration: new prometheus.Counter({
        name: 'toweroffate_user_registrations_total',
        help: '新用户注册数',
        labelNames: ['channel'],
        registers: [register]
    }),
    
    // 活跃用户
    activeUsers: new prometheus.Gauge({
        name: 'toweroffate_active_users',
        help: '活跃用户数',
        labelNames: ['period'],
        registers: [register]
    }),
    
    // 锦标赛参与
    tournamentParticipation: new prometheus.Counter({
        name: 'toweroffate_tournament_participation_total',
        help: '锦标赛参与次数',
        labelNames: ['country'],
        registers: [register]
    })
};

/**
 * 错误指标
 */
const errorMetrics = {
    // 错误总数
    errorCount: new prometheus.Counter({
        name: 'toweroffate_errors_total',
        help: '错误总数',
        labelNames: ['type', 'code', 'route'],
        registers: [register]
    }),
    
    // 数据库错误
    databaseErrors: new prometheus.Counter({
        name: 'toweroffate_database_errors_total',
        help: '数据库错误数',
        labelNames: ['operation'],
        registers: [register]
    }),
    
    // 限流触发
    rateLimitHits: new prometheus.Counter({
        name: 'toweroffate_rate_limit_hits_total',
        help: '限流触发次数',
        labelNames: ['action'],
        registers: [register]
    }),
    
    // 登录失败
    loginFailures: new prometheus.Counter({
        name: 'toweroffate_login_failures_total',
        help: '登录失败次数',
        labelNames: ['reason'],
        registers: [register]
    })
};

/**
 * 系统资源指标
 */
const systemMetrics = {
    // MongoDB连接状态
    mongodbStatus: new prometheus.Gauge({
        name: 'toweroffate_mongodb_connected',
        help: 'MongoDB连接状态 (1=connected, 0=disconnected)',
        registers: [register]
    }),
    
    // Redis连接状态
    redisStatus: new prometheus.Gauge({
        name: 'toweroffate_redis_connected',
        help: 'Redis连接状态 (1=connected, 0=disconnected)',
        registers: [register]
    }),
    
    // 内存使用
    memoryUsage: new prometheus.Gauge({
        name: 'toweroffate_memory_usage_bytes',
        help: '内存使用量',
        labelNames: ['type'],
        registers: [register]
    }),
    
    // 队列长度
    queueLength: new prometheus.Gauge({
        name: 'toweroffate_queue_length',
        help: '队列长度',
        labelNames: ['queue'],
        registers: [register]
    })
};

/**
 * 告警规则配置
 */
const alertRules = [
    {
        alert: 'HighErrorRate',
        expr: 'rate(toweroffate_errors_total[5m]) > 10',
        for: '2m',
        labels: {
            severity: 'critical'
        },
        annotations: {
            summary: '错误率过高',
            description: '过去5分钟错误率超过10次/秒，请立即检查'
        }
    },
    {
        alert: 'HighLatency',
        expr: 'histogram_quantile(0.95, rate(toweroffate_api_latency_seconds_bucket[5m])) > 2',
        for: '3m',
        labels: {
            severity: 'warning'
        },
        annotations: {
            summary: 'API延迟过高',
            description: 'P95延迟超过2秒'
        }
    },
    {
        alert: 'LowActiveGames',
        expr: 'toweroffate_active_games < 5',
        for: '5m',
        labels: {
            severity: 'warning'
        },
        annotations: {
            summary: '活跃游戏数过低',
            description: '当前活跃游戏数少于5个'
        }
    },
    {
        alert: 'DatabaseConnectionError',
        expr: 'toweroffate_mongodb_connected == 0',
        for: '1m',
        labels: {
            severity: 'critical'
        },
        annotations: {
            summary: '数据库连接异常',
            description: 'MongoDB连接断开，服务可能不可用'
        }
    },
    {
        alert: 'RedisConnectionError',
        expr: 'toweroffate_redis_connected == 0',
        for: '1m',
        labels: {
            severity: 'critical'
        },
        annotations: {
            summary: 'Redis连接异常',
            description: 'Redis连接断开，缓存服务可能不可用'
        }
    },
    {
        alert: 'HighMemoryUsage',
        expr: 'toweroffate_memory_usage_bytes{type="heapUsed"} > 1073741824',
        for: '5m',
        labels: {
            severity: 'warning'
        },
        annotations: {
            summary: '内存使用过高',
            description: '堆内存使用超过1GB'
        }
    },
    {
        alert: 'PaymentFailureRate',
        expr: 'rate(toweroffate_payment_count_total{status="failed"}[10m]) / rate(toweroffate_payment_count_total[10m]) > 0.1',
        for: '2m',
        labels: {
            severity: 'critical'
        },
        annotations: {
            summary: '支付失败率过高',
            description: '支付失败率超过10%，请检查支付渠道'
        }
    },
    {
        alert: 'LowOnlinePlayers',
        expr: 'toweroffate_online_players < 10',
        for: '10m',
        labels: {
            severity: 'info'
        },
        annotations: {
            summary: '在线玩家数偏低',
            description: '当前在线玩家少于10人'
        }
    }
];

/**
 * 指标收集工具函数
 */
const metricsUtils = {
    // 记录API请求
    recordApiRequest: (method, route, status, duration) => {
        apiMetrics.apiRequests.inc({ method, route, status });
        apiMetrics.apiLatency.observe({ method, route }, duration);
    },
    
    // 记录游戏开始
    recordGameStart: (mode) => {
        gameMetrics.activeGames.inc({ mode });
        gameMetrics.gamesTotal.inc({ mode, status: 'started' });
    },
    
    // 记录游戏结束
    recordGameEnd: (mode, duration, layers) => {
        gameMetrics.activeGames.dec({ mode });
        gameMetrics.gamesTotal.inc({ mode, status: 'completed' });
        gameMetrics.gameDuration.observe({ mode }, duration);
        
        if (layers) {
            layers.forEach(layer => {
                gameMetrics.playerAscension.observe(layer);
            });
        }
    },
    
    // 记录支付
    recordPayment: (amount, currency, method, status) => {
        businessMetrics.paymentAmount.inc({ currency, method, status }, amount);
        businessMetrics.paymentCount.inc({ method });
    },
    
    // 记录错误
    recordError: (type, code, route = 'unknown') => {
        errorMetrics.errorCount.inc({ type, code, route });
    },
    
    // 设置在线玩家数
    setOnlinePlayers: (count) => {
        gameMetrics.onlinePlayers.set(count);
    },
    
    // 设置活跃游戏数
    setActiveGames: (count, mode) => {
        gameMetrics.activeGames.set({ mode }, count);
    },
    
    // 设置数据库状态
    setDatabaseStatus: (connected) => {
        systemMetrics.mongodbStatus.set(connected ? 1 : 0);
    },
    
    // 设置Redis状态
    setRedisStatus: (connected) => {
        systemMetrics.redisStatus.set(connected ? 1 : 0);
    }
};

/**
 * 中间件：API监控
 */
const apiMonitoringMiddleware = (req, res, next) => {
    const start = process.hrtime.bigint();
    
    res.on('finish', () => {
        const duration = Number(process.hrtime.bigint() - start) / 1e9;
        const route = req.route ? req.route.path : req.path;
        
        metricsUtils.recordApiRequest(
            req.method,
            route,
            res.statusCode.toString(),
            duration
        );
        
        // 记录4xx/5xx错误
        if (res.statusCode >= 400) {
            const errorType = res.statusCode >= 500 ? 'server' : 'client';
            metricsUtils.recordError(errorType, res.statusCode.toString(), route);
        }
    });
    
    next();
};

/**
 * 健康检查
 */
const healthCheck = async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {}
    };
    
    try {
        // 检查MongoDB
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState === 1) {
            health.services.mongodb = 'connected';
            metricsUtils.setDatabaseStatus(true);
        } else {
            health.services.mongodb = 'disconnected';
            health.status = 'unhealthy';
            metricsUtils.setDatabaseStatus(false);
        }
        
        // 检查Redis
        const redis = require('../config/redis');
        await redis.ping();
        health.services.redis = 'connected';
        metricsUtils.setRedisStatus(true);
    } catch (error) {
        health.services.redis = 'disconnected';
        health.status = 'unhealthy';
        metricsUtils.setRedisStatus(false);
    }
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
};

module.exports = {
    register,
    gameMetrics,
    apiMetrics,
    businessMetrics,
    errorMetrics,
    systemMetrics,
    alertRules,
    metricsUtils,
    apiMonitoringMiddleware,
    healthCheck
};
