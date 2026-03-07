// Socket.io 实时游戏处理器
const { v4: uuidv4 } = require('uuid');

// 活跃房间存储
const activeRooms = new Map();
const waitingPlayers = [];

// 游戏配置
const GAME_CONFIG = {
  MAX_PLAYERS: 2,
  TURN_TIMEOUT: 30000, // 30秒出牌超时
  MATCH_TIMEOUT: 60000, // 匹配超时60秒
  MAX_LAYERS: 50
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`玩家连接: ${socket.id}`);

    // 用户认证
    socket.on('authenticate', (data) => {
      const { userId, token } = data;
      
      // 验证 token（简化版，实际应调用 JWT 验证）
      if (userId) {
        socket.userId = userId;
        socket.authenticated = true;
        socket.emit('authenticated', { success: true });
        console.log(`用户 ${userId} 已认证`);
      } else {
        socket.emit('authenticated', { 
          success: false, 
          message: '认证失败' 
        });
      }
    });

    // 开始匹配
    socket.on('start-matchmaking', (data = {}) => {
      if (!socket.authenticated) {
        socket.emit('error', { message: '请先登录' });
        return;
      }

      const { mode = 'ranked' } = data;
      
      // 检查是否已经在匹配中
      const existingIndex = waitingPlayers.findIndex(
        p => p.userId === socket.userId
      );
      
      if (existingIndex !== -1) {
        socket.emit('matchmaking-status', {
          status: 'already-queuing',
          message: '您已经在匹配队列中'
        });
        return;
      }

      // 检查是否已经在房间中
      for (const [roomId, room] of activeRooms) {
        const player = room.players.find(p => p.userId === socket.userId);
        if (player) {
          socket.emit('matchmaking-status', {
            status: 'in-game',
            message: '您正在对局中',
            roomId
          });
          return;
        }
      }

      // 加入匹配队列
      const playerInfo = {
        socketId: socket.id,
        userId: socket.userId,
        mode,
        joinedAt: Date.now()
      };
      
      waitingPlayers.push(playerInfo);
      
      socket.emit('matchmaking-status', {
        status: 'queuing',
        message: '正在寻找对手...',
        queuePosition: waitingPlayers.length
      });

      // 尝试匹配
      tryMatchPlayers();
      
      // 设置匹配超时
      setTimeout(() => {
        const index = waitingPlayers.findIndex(
          p => p.socketId === socket.id
        );
        if (index !== -1) {
          waitingPlayers.splice(index, 1);
          socket.emit('matchmaking-timeout', {
            message: '匹配超时，请重试'
          });
        }
      }, GAME_CONFIG.MATCH_TIMEOUT);
    });

    // 取消匹配
    socket.on('cancel-matchmaking', () => {
      const index = waitingPlayers.findIndex(
        p => p.socketId === socket.id
      );
      
      if (index !== -1) {
        waitingPlayers.splice(index, 1);
        socket.emit('matchmaking-cancelled', {
          message: '已取消匹配'
        });
      }
    });

    // 加入房间
    socket.on('join-room', (data) => {
      const { roomId } = data;
      const room = activeRooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: '房间不存在' });
        return;
      }

      const player = room.players.find(p => p.userId === socket.userId);
      
      if (!player) {
        socket.emit('error', { message: '您不是此房间的参与者' });
        return;
      }

      // 加入 Socket.io 房间
      socket.join(roomId);
      player.socketId = socket.id;
      player.online = true;

      socket.emit('room-joined', {
        roomId,
        gameState: getGameState(room)
      });

      // 通知其他玩家
      socket.to(roomId).emit('player-joined', {
        userId: socket.userId
      });
    });

    // 出牌
    socket.on('play-card', (data) => {
      const { roomId, cardId } = data;
      const room = activeRooms.get(roomId);
      
      if (!room || room.status !== 'playing') {
        socket.emit('error', { message: '对局不存在或已结束' });
        return;
      }

      // 检查是否轮到当前玩家
      if (room.currentPlayer !== socket.userId) {
        socket.emit('error', { message: '还没轮到您出牌' });
        return;
      }

      // 处理出牌逻辑
      const result = processCardPlay(room, socket.userId, cardId);
      
      // 广播游戏状态
      io.to(roomId).emit('game-update', {
        type: 'card-played',
        playerId: socket.userId,
        result,
        gameState: getGameState(room)
      });

      // 检查游戏是否结束
      if (result.gameEnded) {
        endGame(room);
      } else {
        // 切换回合
        switchTurn(room);
      }
    });

    // 玩家离开
    socket.on('leave-room', (data) => {
      const { roomId } = data;
      handlePlayerLeave(socket, roomId);
    });

    // 断开连接
    socket.on('disconnect', () => {
      console.log(`玩家断开连接: ${socket.id}`);
      
      // 从匹配队列移除
      const queueIndex = waitingPlayers.findIndex(
        p => p.socketId === socket.id
      );
      if (queueIndex !== -1) {
        waitingPlayers.splice(queueIndex, 1);
      }

      // 标记离线状态
      for (const [roomId, room] of activeRooms) {
        const player = room.players.find(p => p.socketId === socket.id);
        if (player) {
          player.online = false;
          player.lastOnline = Date.now();
          
          // 通知其他玩家
          io.to(roomId).emit('player-disconnected', {
            userId: player.userId
          });
          
          // 如果游戏进行中，设置超时处理
          if (room.status === 'playing') {
            setTimeout(() => {
              if (!player.online) {
                handlePlayerLeave({ userId: player.userId }, roomId);
              }
            }, 60000); // 1分钟后仍离线则判负
          }
        }
      }
    });
  });

  // 尝试匹配玩家
  function tryMatchPlayers() {
    while (waitingPlayers.length >= GAME_CONFIG.MAX_PLAYERS) {
      // 按模式分组匹配
      const modeGroups = {};
      
      waitingPlayers.forEach(player => {
        if (!modeGroups[player.mode]) {
          modeGroups[player.mode] = [];
        }
        modeGroups[player.mode].push(player);
      });

      // 为每个模式创建房间
      for (const mode in modeGroups) {
        const group = modeGroups[mode];
        
        while (group.length >= GAME_CONFIG.MAX_PLAYERS) {
          const players = group.splice(0, GAME_CONFIG.MAX_PLAYERS);
          
          // 从等待队列移除
          players.forEach(p => {
            const index = waitingPlayers.findIndex(
              wp => wp.socketId === p.socketId
            );
            if (index !== -1) {
              waitingPlayers.splice(index, 1);
            }
          });

          // 创建房间
          createRoom(players, mode);
        }
      }
    }
  }

  // 创建房间
  function createRoom(players, mode) {
    const roomId = uuidv4();
    const room = {
      roomId,
      mode,
      status: 'waiting', // waiting, playing, ended
      createdAt: Date.now(),
      players: players.map((p, index) => ({
        userId: p.userId,
        socketId: p.socketId,
        playerIndex: index,
        online: true,
        health: 100,
        currentLayer: 1,
        maxLayer: 1,
        cards: generateInitialCards(),
        ready: false
      })),
      currentPlayer: players[0].userId,
      turnStartTime: Date.now(),
      gameLog: [],
      winner: null
    };

    activeRooms.set(roomId, room);

    // 通知玩家匹配成功
    players.forEach(p => {
      const socket = io.sockets.sockets.get(p.socketId);
      if (socket) {
        socket.emit('match-found', {
          roomId,
          opponent: players.find(op => op.userId !== p.userId)
        });
      }
    });

    console.log(`房间 ${roomId} 创建成功，玩家: ${players.map(p => p.userId).join(', ')}`);
  }

  // 生成初始卡牌
  function generateInitialCards() {
    const cardTypes = ['attack', 'defense', 'magic', 'heal'];
    const cards = [];
    
    for (let i = 0; i < 5; i++) {
      cards.push({
        cardId: uuidv4(),
        type: cardTypes[Math.floor(Math.random() * cardTypes.length)]
      });
    }
    
    return cards;
  }

  // 处理出牌
  function processCardPlay(room, userId, cardId) {
    const player = room.players.find(p => p.userId === userId);
    const cardIndex = player.cards.findIndex(c => c.cardId === cardId);
    
    if (cardIndex === -1) {
      return { error: '无效的卡牌' };
    }

    const card = player.cards[cardIndex];
    
    // 移除已使用的卡牌
    player.cards.splice(cardIndex, 1);
    
    // 添加新卡牌
    const cardTypes = ['attack', 'defense', 'magic', 'heal'];
    player.cards.push({
      cardId: uuidv4(),
      type: cardTypes[Math.floor(Math.random() * cardTypes.length)]
    });

    // 计算效果
    let damage = 0;
    let heal = 0;
    let layerProgress = 0;
    
    switch (card.type) {
      case 'attack':
        damage = 10;
        layerProgress = 1;
        break;
      case 'defense':
        // 防御逻辑
        break;
      case 'magic':
        damage = 15;
        layerProgress = 2;
        break;
      case 'heal':
        heal = 20;
        break;
    }

    // 更新玩家状态
    player.currentLayer += layerProgress;
    if (player.currentLayer > player.maxLayer) {
      player.maxLayer = player.currentLayer;
    }
    
    if (heal > 0) {
      player.health = Math.min(100, player.health + heal);
    }

    // 检查游戏结束条件
    const gameEnded = player.maxLayer >= GAME_CONFIG.MAX_LAYERS || 
                      player.currentLayer >= GAME_CONFIG.MAX_LAYERS;

    // 记录日志
    room.gameLog.push({
      timestamp: Date.now(),
      playerId: userId,
      cardType: card.type,
      damage,
      heal,
      layerProgress,
      currentLayer: player.currentLayer
    });

    return {
      card,
      damage,
      heal,
      layerProgress,
      currentLayer: player.currentLayer,
      gameEnded
    };
  }

  // 切换回合
  function switchTurn(room) {
    const currentIndex = room.players.findIndex(
      p => p.userId === room.currentPlayer
    );
    const nextIndex = (currentIndex + 1) % room.players.length;
    
    room.currentPlayer = room.players[nextIndex].userId;
    room.turnStartTime = Date.now();

    // 设置回合超时
    setTimeout(() => {
      if (room.status === 'playing' && 
          room.currentPlayer === room.players[nextIndex].userId) {
        // 超时未出牌，自动出牌
        const player = room.players[nextIndex];
        if (player.cards.length > 0) {
          processCardPlay(room, player.userId, player.cards[0].cardId);
          io.to(room.roomId).emit('game-update', {
            type: 'turn-timeout',
            playerId: player.userId,
            gameState: getGameState(room)
          });
          switchTurn(room);
        }
      }
    }, GAME_CONFIG.TURN_TIMEOUT);

    io.to(room.roomId).emit('turn-changed', {
      currentPlayer: room.currentPlayer
    });
  }

  // 结束游戏
  function endGame(room) {
    room.status = 'ended';
    room.endedAt = Date.now();

    // 确定胜者（达到最高层的玩家）
    const winner = room.players.reduce((prev, current) => 
      prev.maxLayer > current.maxLayer ? prev : current
    );
    
    room.winner = winner.userId;

    // 广播游戏结束
    io.to(room.roomId).emit('game-ended', {
      winner: winner.userId,
      finalState: getGameState(room)
    });

    // 清理房间（延迟）
    setTimeout(() => {
      activeRooms.delete(room.roomId);
    }, 300000); // 5分钟后清理
  }

  // 处理玩家离开
  function handlePlayerLeave(socket, roomId) {
    const room = activeRooms.get(roomId);
    
    if (!room) return;

    const player = room.players.find(p => p.userId === socket.userId);
    
    if (!player) return;

    socket.leave(roomId);

    // 如果游戏进行中，判负
    if (room.status === 'playing') {
      room.status = 'ended';
      const winner = room.players.find(p => p.userId !== socket.userId);
      room.winner = winner?.userId;

      io.to(roomId).emit('game-ended', {
        winner: winner?.userId,
        reason: 'opponent-left',
        message: '对手已离开游戏'
      });

      activeRooms.delete(roomId);
    }
  }

  // 获取游戏状态
  function getGameState(room) {
    return {
      roomId: room.roomId,
      status: room.status,
      mode: room.mode,
      currentPlayer: room.currentPlayer,
      turnStartTime: room.turnStartTime,
      players: room.players.map(p => ({
        userId: p.userId,
        playerIndex: p.playerIndex,
        health: p.health,
        currentLayer: p.currentLayer,
        maxLayer: p.maxLayer,
        cards: p.cards, // 实际应只返回当前玩家的卡牌
        online: p.online
      })),
      gameLog: room.gameLog.slice(-10),
      winner: room.winner
    };
  }
};
