const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/schemas/User');
const Game = require('../../models/schemas/Game');

/**
 * API集成测试
 * 测试范围：用户API、游戏API、排行榜API
 */
describe('API集成测试', () => {
    let mongoServer;
    let app;
    let authToken;
    let testUser;
    
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        
        process.env.MONGODB_URI = mongoUri;
        process.env.JWT_SECRET = 'test-secret';
        
        app = require('../../server');
        await mongoose.connect(mongoUri);
    });
    
    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });
    
    beforeEach(async () => {
        // 创建测试用户
        testUser = new User({
            username: 'apitest',
            email: 'api@test.com',
            passwordHash: 'hashedpassword',
            salt: 'salt',
            profile: {
                nickname: 'API测试用户',
                level: 5
            }
        });
        await testUser.save();
        
        // 获取认证token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                username: 'apitest',
                password: 'password123'
            });
        
        authToken = loginRes.body.token;
    });
    
    afterEach(async () => {
        await User.deleteMany({});
        await Game.deleteMany({});
    });

    describe('用户API', () => {
        test('GET /api/users/profile - 应该返回用户信息', async () => {
            const res = await request(app)
                .get('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.username).toBe('apitest');
            expect(res.body.profile.nickname).toBe('API测试用户');
        });
        
        test('GET /api/users/profile - 未认证应该返回401', async () => {
            const res = await request(app)
                .get('/api/users/profile');
            
            expect(res.status).toBe(401);
        });
        
        test('PUT /api/users/profile - 应该更新用户信息', async () => {
            const res = await request(app)
                .put('/api/users/profile')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    nickname: '新昵称',
                    bio: '这是我的简介'
                });
            
            expect(res.status).toBe(200);
            expect(res.body.profile.nickname).toBe('新昵称');
            expect(res.body.profile.bio).toBe('这是我的简介');
        });
        
        test('PUT /api/users/settings - 应该更新用户设置', async () => {
            const res = await request(app)
                .put('/api/users/settings')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    soundEnabled: false,
                    language: 'en-US'
                });
            
            expect(res.status).toBe(200);
            expect(res.body.settings.soundEnabled).toBe(false);
            expect(res.body.settings.language).toBe('en-US');
        });
    });

    describe('游戏API', () => {
        let gameRoom;
        
        beforeEach(async () => {
            gameRoom = new Game({
                roomId: 'TESTROOM',
                mode: 'solo',
                maxPlayers: 4,
                status: 'waiting'
            });
            await gameRoom.save();
        });
        
        test('POST /api/games - 应该创建新游戏房间', async () => {
            const res = await request(app)
                .post('/api/games')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    mode: 'solo',
                    maxPlayers: 4
                });
            
            expect(res.status).toBe(201);
            expect(res.body.roomId).toBeDefined();
            expect(res.body.mode).toBe('solo');
        });
        
        test('GET /api/games/:roomId - 应该返回游戏信息', async () => {
            const res = await request(app)
                .get(`/api/games/${gameRoom.roomId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.roomId).toBe('TESTROOM');
            expect(res.body.status).toBe('waiting');
        });
        
        test('POST /api/games/:roomId/join - 应该允许加入游戏', async () => {
            const res = await request(app)
                .post(`/api/games/${gameRoom.roomId}/join`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.players).toHaveLength(1);
        });
        
        test('GET /api/games/available - 应该返回可加入的房间', async () => {
            const res = await request(app)
                .get('/api/games/available?mode=solo')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('排行榜API', () => {
        beforeEach(async () => {
            // 创建测试用户数据
            const users = [];
            for (let i = 1; i <= 5; i++) {
                users.push({
                    username: `rankuser${i}`,
                    email: `rank${i}@test.com`,
                    passwordHash: 'hash',
                    salt: 'salt',
                    status: 'active',
                    stats: {
                        highestLayer: 14 - i, // 递减，用于排名
                        wins: i * 10
                    },
                    profile: {
                        nickname: `排名用户${i}`,
                        avatar: `/avatar${i}.png`
                    }
                });
            }
            await User.insertMany(users);
        });
        
        test('GET /api/leaderboard - 应该返回排行榜', async () => {
            const res = await request(app)
                .get('/api/leaderboard?limit=10')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
        });
        
        test('GET /api/leaderboard - 应该按最高层数排序', async () => {
            const res = await request(app)
                .get('/api/leaderboard')
                .set('Authorization', `Bearer ${authToken}`);
            
            // 验证排序
            for (let i = 0; i < res.body.length - 1; i++) {
                expect(res.body[i].highestLayer)
                    .toBeGreaterThanOrEqual(res.body[i + 1].highestLayer);
            }
        });
    });

    describe('防沉迷API', () => {
        test('GET /api/users/anti-addiction - 应该返回防沉迷状态', async () => {
            const res = await request(app)
                .get('/api/users/anti-addiction')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('isMinor');
            expect(res.body).toHaveProperty('dailyPlayTime');
            expect(res.body).toHaveProperty('canPlay');
        });
        
        test('POST /api/users/anti-addiction/verify - 应该验证实名信息', async () => {
            const res = await request(app)
                .post('/api/users/anti-addiction/verify')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    realName: '张三',
                    idCardNumber: '110101199001011234'
                });
            
            expect(res.status).toBe(200);
            expect(res.body.verified).toBe(true);
        });
    });
});
