const TowerOfFateGame = require('../../models/schemas/Game');
const mongoose = require('mongoose');

/**
 * 游戏核心逻辑单元测试
 * 测试范围：初始化、卡牌比较、首登者机制、游戏流程
 */
describe('游戏核心逻辑测试', () => {
    let game;
    
    beforeEach(() => {
        game = new TowerOfFateGame({
            roomId: 'TEST123',
            mode: 'solo',
            maxPlayers: 4
        });
    });
    
    afterAll(async () => {
        await mongoose.connection.close();
    });

    // ==================== 初始化测试 ====================
    describe('游戏初始化', () => {
        test('应该正确创建游戏房间', () => {
            expect(game.roomId).toBe('TEST123');
            expect(game.mode).toBe('solo');
            expect(game.status).toBe('waiting');
        });
        
        test('应该正确初始化4副牌共208张', () => {
            expect(game.deck).toHaveLength(208);
            
            // 验证牌组构成
            const suits = ['♥️', '♦️', '♣️', '♠️'];
            const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
            
            suits.forEach(suit => {
                ranks.forEach(rank => {
                    const count = game.deck.filter(c => 
                        c.suit === suit && c.rank === rank
                    ).length;
                    expect(count).toBe(4); // 4副牌，每种牌4张
                });
            });
        });
        
        test('应该正确设置13个守卫', () => {
            expect(game.guards).toHaveLength(13);
            
            // 验证每个守卫的层数
            game.guards.forEach((guard, index) => {
                expect(guard.layer).toBe(index + 1);
                expect(guard.cards).toHaveLength(13);
                expect(guard.angerCards).toHaveLength(3);
                expect(guard.hp).toBe(100);
                expect(guard.maxHp).toBe(100);
            });
        });
        
        test('每个守卫的激怒牌应该在总牌组中', () => {
            game.guards.forEach(guard => {
                guard.angerCards.forEach(angerCard => {
                    const exists = game.deck.some(c => 
                        c.suit === angerCard.suit && 
                        c.rank === angerCard.rank
                    );
                    expect(exists).toBe(true);
                });
            });
        });
    });

    // ==================== 玩家加入测试 ====================
    describe('玩家加入游戏', () => {
        const mockUserId = new mongoose.Types.ObjectId();
        
        test('应该允许玩家加入等待中的游戏', async () => {
            await game.addPlayer(mockUserId);
            
            expect(game.players).toHaveLength(1);
            expect(game.players[0].userId.toString()).toBe(mockUserId.toString());
            expect(game.players[0].position).toBe(0);
            expect(game.players[0].status).toBe('waiting');
        });
        
        test('应该为每个玩家分配正确位置', async () => {
            for (let i = 0; i < 4; i++) {
                await game.addPlayer(new mongoose.Types.ObjectId());
            }
            
            game.players.forEach((player, index) => {
                expect(player.position).toBe(index);
            });
        });
        
        test('不应该允许超过最大玩家数', async () => {
            game.maxPlayers = 2;
            
            await game.addPlayer(new mongoose.Types.ObjectId());
            await game.addPlayer(new mongoose.Types.ObjectId());
            
            await expect(
                game.addPlayer(new mongoose.Types.ObjectId())
            ).rejects.toThrow('房间已满');
        });
        
        test('不应该允许重复加入', async () => {
            const userId = new mongoose.Types.ObjectId();
            await game.addPlayer(userId);
            
            await expect(game.addPlayer(userId)).rejects.toThrow();
        });
        
        test('游戏开始后不应该允许加入', async () => {
            await game.addPlayer(new mongoose.Types.ObjectId());
            await game.addPlayer(new mongoose.Types.ObjectId());
            
            game.status = 'playing';
            
            await expect(
                game.addPlayer(new mongoose.Types.ObjectId())
            ).rejects.toThrow('游戏已开始');
        });
    });

    // ==================== 卡牌比较测试 ====================
    describe('卡牌比较逻辑', () => {
        test('点数和花色都匹配应该+2层 (完美匹配)', () => {
            const result = game.compareCards(
                { suit: '♥️', rank: 'A', deck: 1 },
                { suit: '♥️', rank: 'A', deck: 2 }
            );
            
            expect(result.type).toBe('full');
            expect(result.bonus).toBe(2);
            expect(result.message).toContain('完美匹配');
        });
        
        test('只有点数匹配应该+1层 (部分匹配)', () => {
            const result = game.compareCards(
                { suit: '♥️', rank: 'A', deck: 1 },
                { suit: '♠️', rank: 'A', deck: 2 }
            );
            
            expect(result.type).toBe('partial');
            expect(result.bonus).toBe(1);
            expect(result.message).toContain('点数匹配');
        });
        
        test('只有花色匹配不应该加分', () => {
            const result = game.compareCards(
                { suit: '♥️', rank: 'A', deck: 1 },
                { suit: '♥️', rank: 'K', deck: 2 }
            );
            
            expect(result.type).toBe('none');
            expect(result.bonus).toBe(0);
        });
        
        test('完全不匹配应该+0层', () => {
            const result = game.compareCards(
                { suit: '♥️', rank: 'A', deck: 1 },
                { suit: '♠️', rank: 'K', deck: 2 }
            );
            
            expect(result.type).toBe('none');
            expect(result.bonus).toBe(0);
            expect(result.message).toContain('不匹配');
        });
        
        test('不同数字牌比较', () => {
            const result = game.compareCards(
                { suit: '♣️', rank: '7', deck: 1 },
                { suit: '♣️', rank: '7', deck: 3 }
            );
            
            expect(result.type).toBe('full');
            expect(result.bonus).toBe(2);
        });
    });

    // ==================== 首登者机制测试 ====================
    describe('首登者机制', () => {
        const playerIds = [
            new mongoose.Types.ObjectId(),
            new mongoose.Types.ObjectId()
        ];
        
        beforeEach(async () => {
            for (const id of playerIds) {
                await game.addPlayer(id);
            }
            await game.start();
        });
        
        test('首位到达13层应该成为首登者', () => {
            const player = game.players[0];
            player.currentLayer = 13;
            
            game.checkWinCondition();
            
            expect(game.firstAscender?.toString()).toBe(player.userId.toString());
            expect(player.isFirstAscender).toBe(true);
        });
        
        test('首登者应该自动成为守卫', () => {
            const player = game.players[0];
            player.currentLayer = 13;
            
            game.checkWinCondition();
            
            expect(player.isGuard).toBe(true);
        });
        
        test('只有首位到达13层的人才是首登者', () => {
            // 第一个玩家到达13层
            game.players[0].currentLayer = 13;
            game.checkWinCondition();
            
            const firstAscender = game.firstAscender;
            
            // 第二个玩家也到达13层
            game.players[1].currentLayer = 13;
            game.checkWinCondition();
            
            // 首登者不应改变
            expect(game.firstAscender.toString()).toBe(firstAscender.toString());
            expect(game.players[1].isFirstAscender).toBe(false);
        });
        
        test('到达13层应该触发胜利条件', () => {
            game.players[0].currentLayer = 13;
            const hasWinner = game.checkWinCondition();
            
            expect(hasWinner).toBe(true);
            expect(game.winner?.toString()).toBe(game.players[0].userId.toString());
        });
    });

    // ==================== 爬升机制测试 ====================
    describe('玩家爬升机制', () => {
        beforeEach(async () => {
            await game.addPlayer(new mongoose.Types.ObjectId());
            await game.addPlayer(new mongoose.Types.ObjectId());
            await game.start();
        });
        
        test('爬升应该增加当前层数', () => {
            const player = game.players[0];
            const initialLayer = player.currentLayer;
            
            game.ascendLayer(player.userId, 1);
            
            expect(player.currentLayer).toBe(initialLayer + 1);
        });
        
        test('完美匹配应该+2层', () => {
            const player = game.players[0];
            const initialLayer = player.currentLayer;
            
            game.ascendLayer(player.userId, 2);
            
            expect(player.currentLayer).toBe(initialLayer + 2);
        });
        
        test('层数不应该超过13层', () => {
            const player = game.players[0];
            player.currentLayer = 12;
            
            game.ascendLayer(player.userId, 5); // 尝试+5层
            
            expect(player.currentLayer).toBe(13); // 被限制在13
        });
        
        test('爬升应该记录事件日志', () => {
            const initialEvents = game.events.length;
            
            game.ascendLayer(game.players[0].userId, 1);
            
            expect(game.events.length).toBe(initialEvents + 1);
            expect(game.events[game.events.length - 1].type).toBe('layer_up');
        });
    });

    // ==================== 回合机制测试 ====================
    describe('回合流转', () => {
        beforeEach(async () => {
            for (let i = 0; i < 4; i++) {
                await game.addPlayer(new mongoose.Types.ObjectId());
            }
            await game.start();
        });
        
        test('游戏开始时应该从第一个玩家开始', () => {
            expect(game.currentPlayerIndex).toBe(0);
            expect(game.currentPlayer.userId.toString())
                .toBe(game.players[0].userId.toString());
        });
        
        test('应该能正确获取当前玩家', () => {
            const current = game.currentPlayer;
            expect(current).toBeDefined();
            expect(current.position).toBe(game.currentPlayerIndex);
        });
    });

    // ==================== 游戏结束测试 ====================
    describe('游戏结束', () => {
        beforeEach(async () => {
            for (let i = 0; i < 3; i++) {
                await game.addPlayer(new mongoose.Types.ObjectId());
            }
            await game.start();
        });
        
        test('结束游戏应该设置正确状态', async () => {
            // 设置不同的层数
            game.players[0].currentLayer = 10;
            game.players[1].currentLayer = 13;
            game.players[1].isFirstAscender = true;
            game.players[2].currentLayer = 8;
            
            await game.endGame();
            
            expect(game.status).toBe('finished');
            expect(game.endedAt).toBeDefined();
        });
        
        test('应该正确计算排名', async () => {
            game.players[0].currentLayer = 10;
            game.players[1].currentLayer = 13;
            game.players[1].isFirstAscender = true;
            game.players[2].currentLayer = 8;
            
            await game.endGame();
            
            expect(game.rankings[0].userId.toString())
                .toBe(game.players[1].userId.toString()); // 首登者第一
            expect(game.rankings[0].rank).toBe(1);
            
            expect(game.rankings[1].rank).toBe(2);
            expect(game.rankings[2].rank).toBe(3);
        });
        
        test('逃跑的玩家应该在排名中标记', async () => {
            game.players[2].status = 'escaped';
            
            await game.endGame();
            
            const escapedRanking = game.rankings.find(r => 
                r.userId.toString() === game.players[2].userId.toString()
            );
            expect(escapedRanking.escaped).toBe(true);
        });
    });

    // ==================== 边缘情况测试 ====================
    describe('边缘情况处理', () => {
        test('单人模式应该至少1个玩家', async () => {
            await game.addPlayer(new mongoose.Types.ObjectId());
            await game.start();
            
            expect(game.status).toBe('playing');
        });
        
        test('多人模式应该至少2个玩家', async () => {
            game.mode = 'team';
            await game.addPlayer(new mongoose.Types.ObjectId());
            
            await expect(game.start()).rejects.toThrow('玩家不足');
        });
        
        test('弃牌堆应该记录出牌历史', () => {
            const userId = new mongoose.Types.ObjectId();
            const card = { suit: '♥️', rank: 'A', deck: 1 };
            
            game.players.push({
                userId,
                cards: [card]
            });
            
            game.playCard(userId, 0);
            
            expect(game.discardPile).toHaveLength(1);
            expect(game.discardPile[0].playedBy.toString()).toBe(userId.toString());
        });
    });
});
