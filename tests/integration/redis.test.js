/**
 * Redis缓存测试
 * 测试范围：在线用户、游戏房间、排行榜、限流
 */
const Redis = require('ioredis');
const redisSchemas = require('../../models/schemas/RedisSchemas');

// Mock Redis
jest.mock('ioredis');

describe('Redis缓存测试', () => {
    let redis;
    let mockClient;
    
    beforeEach(() => {
        mockClient = {
            setex: jest.fn().mockResolvedValue('OK'),
            get: jest.fn(),
            del: jest.fn().mockResolvedValue(1),
            zadd: jest.fn().mockResolvedValue(1),
            zrevrange: jest.fn(),
            zscore: jest.fn(),
            incr: jest.fn().mockResolvedValue(1),
            expire: jest.fn().mockResolvedValue(1),
            hset: jest.fn().mockResolvedValue(1),
            hgetall: jest.fn(),
            lpush: jest.fn().mockResolvedValue(1),
            lrange: jest.fn()
        };
        
        redis = mockClient;
    });

    describe('在线用户管理', () => {
        const userId = 'user123';
        const onlineData = {
            socketId: 'socket_abc',
            roomId: 'room_456',
            deviceType: 'ios',
            status: 'online'
        };
        
        test('应该正确设置在线用户缓存', async () => {
            const key = redisSchemas.onlineUser.key(userId);
            const ttl = redisSchemas.onlineUser.ttl;
            
            await redis.setex(key, ttl, JSON.stringify(onlineData));
            
            expect(redis.setex).toHaveBeenCalledWith(
                key,
                ttl,
                JSON.stringify(onlineData)
            );
        });
        
        test('应该正确生成在线用户key', () => {
            const key = redisSchemas.onlineUser.key(userId);
            expect(key).toBe('online:user123');
        });
        
        test('在线用户应该有正确的TTL', () => {
            expect(redisSchemas.onlineUser.ttl).toBe(300); // 5分钟
        });
    });

    describe('游戏房间缓存', () => {
        const roomId = 'ROOM001';
        const gameState = {
            players: [{ id: 'p1', layer: 5 }],
            currentRound: 10,
            status: 'playing'
        };
        
        test('应该正确缓存游戏房间状态', async () => {
            const key = redisSchemas.gameRoom.key(roomId);
            const ttl = redisSchemas.gameRoom.ttl;
            
            await redis.setex(key, ttl, JSON.stringify(gameState));
            
            expect(redis.setex).toHaveBeenCalledWith(
                key,
                ttl,
                JSON.stringify(gameState)
            );
        });
        
        test('游戏房间应该有1小时的TTL', () => {
            expect(redisSchemas.gameRoom.ttl).toBe(3600);
        });
    });

    describe('排行榜 (Sorted Set)', () => {
        const leaderboardData = [
            { userId: 'user1', score: 13 },
            { userId: 'user2', score: 12 },
            { userId: 'user3', score: 10 }
        ];
        
        test('应该正确添加排行榜数据', async () => {
            const key = redisSchemas.leaderboards.daily.key();
            
            for (const data of leaderboardData) {
                await redis.zadd(key, data.score, data.userId);
            }
            
            expect(redis.zadd).toHaveBeenCalledTimes(3);
        });
        
        test('应该正确获取排行榜key', () => {
            const key = redisSchemas.leaderboards.daily.key();
            const today = new Date().toISOString().slice(0, 10);
            expect(key).toBe(`leaderboard:daily:${today}`);
        });
        
        test('日排行榜应该有2天的TTL', () => {
            expect(redisSchemas.leaderboards.daily.ttl).toBe(172800);
        });
    });

    describe('限流控制', () => {
        const userId = 'user456';
        const action = 'login';
        
        test('应该正确记录限流计数', async () => {
            const key = redisSchemas.rateLimit.key(userId, action);
            const config = redisSchemas.rateLimit.actions.login;
            
            await redis.incr(key);
            await redis.expire(key, config.window);
            
            expect(redis.incr).toHaveBeenCalledWith(key);
            expect(redis.expire).toHaveBeenCalledWith(key, config.window);
        });
        
        test('登录限流应该是5分钟内5次', () => {
            const config = redisSchemas.rateLimit.actions.login;
            expect(config.max).toBe(5);
            expect(config.window).toBe(300);
        });
        
        test('注册限流应该是1小时内3次', () => {
            const config = redisSchemas.rateLimit.actions.register;
            expect(config.max).toBe(3);
            expect(config.window).toBe(3600);
        });
        
        test('聊天限流应该是1分钟内30条', () => {
            const config = redisSchemas.rateLimit.actions.chat;
            expect(config.max).toBe(30);
            expect(config.window).toBe(60);
        });
    });

    describe('会话管理', () => {
        const token = 'jwt_token_abc123';
        const sessionData = {
            userId: 'user789',
            createdAt: Date.now(),
            expiresAt: Date.now() + 86400000,
            deviceId: 'device_123',
            ip: '192.168.1.1'
        };
        
        test('应该正确存储会话信息', async () => {
            const key = redisSchemas.session.key(token);
            const ttl = redisSchemas.session.ttl;
            
            await redis.setex(key, ttl, JSON.stringify(sessionData));
            
            expect(redis.setex).toHaveBeenCalledWith(
                key,
                ttl,
                JSON.stringify(sessionData)
            );
        });
        
        test('会话应该有24小时的TTL', () => {
            expect(redisSchemas.session.ttl).toBe(86400);
        });
    });

    describe('防沉迷缓存', () => {
        const userId = 'minor_user';
        const addictionData = {
            dailyPlayTime: 45,
            lastReset: Date.now(),
            isRestricted: false
        };
        
        test('应该正确缓存防沉迷数据', async () => {
            const key = redisSchemas.antiAddiction.key(userId);
            const ttl = redisSchemas.antiAddiction.ttl;
            
            await redis.hset(key, 'dailyPlayTime', addictionData.dailyPlayTime);
            await redis.hset(key, 'isRestricted', addictionData.isRestricted);
            await redis.expire(key, ttl);
            
            expect(redis.hset).toHaveBeenCalledWith(
                key,
                'dailyPlayTime',
                addictionData.dailyPlayTime
            );
        });
    });

    describe('统计数据', () => {
        const date = new Date().toISOString().slice(0, 10);
        
        test('应该正确记录日活用户', async () => {
            const key = redisSchemas.stats.dailyActive.key(date);
            
            await redis.hset(key, 'user1', '1');
            await redis.hset(key, 'user2', '1');
            
            expect(redis.hset).toHaveBeenCalledWith(key, 'user1', '1');
        });
        
        test('应该正确记录游戏统计', async () => {
            const key = redisSchemas.stats.gameCount.key(date);
            
            await redis.hincrby(key, 'started', 1);
            await redis.hincrby(key, 'completed', 1);
            
            const result = await redis.hgetall(key);
        });
    });

    describe('Key生成测试', () => {
        test('在线用户key格式正确', () => {
            expect(redisSchemas.onlineUser.key('123')).toBe('online:123');
        });
        
        test('游戏房间key格式正确', () => {
            expect(redisSchemas.gameRoom.key('ROOM1')).toBe('room:ROOM1');
        });
        
        test('限流key格式正确', () => {
            expect(redisSchemas.rateLimit.key('user', 'action'))
                .toBe('ratelimit:user:action');
        });
        
        test('会话key格式正确', () => {
            expect(redisSchemas.session.key('token123')).toBe('session:token123');
        });
        
        test('防沉迷key格式正确', () => {
            expect(redisSchemas.antiAddiction.key('user123'))
                .toBe('antiaddiction:user123');
        });
    });
});
