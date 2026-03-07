/**
 * 命运塔游戏 - 观战系统与回放系统
 * Tower of Fate - Spectator & Replay System
 * 
 * @version 1.0.0
 * @author 小金蛇
 */

// ============================================
// 事件总线 (Event Bus)
// ============================================
class EventBus {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.events.has(event)) return;
    const callbacks = this.events.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) callbacks.splice(index, 1);
  }

  emit(event, data) {
    if (!this.events.has(event)) return;
    this.events.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event handler error for ${event}:`, error);
      }
    });
  }

  once(event, callback) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    this.on(event, wrapper);
  }
}

// ============================================
// WebSocket连接管理器
// ============================================
class WebSocketManager {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
    this.isConnected = false;
    this.messageQueue = [];
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);
        
        this.ws.onopen = () => {
          console.log('[WebSocket] 连接成功');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.flushMessageQueue();
          this.emit('connected', {});
          resolve();
        };

        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          this.emit(data.type, data.payload);
        };

        this.ws.onclose = () => {
          console.log('[WebSocket] 连接关闭');
          this.isConnected = false;
          this.emit('disconnected', {});
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('[WebSocket] 错误:', error);
          this.emit('error', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  send(type, payload) {
    const message = JSON.stringify({ type, payload });
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message);
    } else {
      this.messageQueue.push(message);
    }
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.ws.send(message);
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`[WebSocket] 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connect(), this.reconnectDelay * this.reconnectAttempts);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) callbacks.splice(index, 1);
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(callback => callback(data));
  }
}

// ============================================
// 弹幕聊天系统
// ============================================
class DanmakuChat {
  constructor(container) {
    this.container = container;
    this.messages = [];
    this.maxMessages = 100;
    this.eventBus = new EventBus();
    this.isEnabled = true;
    this.opacity = 0.8;
    this.speed = 1.0;
    this.filterWords = [];
  }

  addMessage(message) {
    if (!this.isEnabled) return;
    
    // 内容过滤
    if (this.shouldFilter(message.text)) return;

    const msg = {
      id: this.generateId(),
      text: message.text,
      author: message.author,
      color: message.color || '#ffffff',
      timestamp: Date.now(),
      position: Math.random() * 80 + 10 // 随机高度位置 (10% - 90%)
    };

    this.messages.push(msg);
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }

    this.renderDanmaku(msg);
    this.eventBus.emit('message', msg);
  }

  renderDanmaku(message) {
    const danmaku = document.createElement('div');
    danmaku.className = 'danmaku-message';
    danmaku.textContent = `${message.author}: ${message.text}`;
    danmaku.style.cssText = `
      position: absolute;
      top: ${message.position}%;
      right: -100%;
      color: ${message.color};
      font-size: 14px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
      white-space: nowrap;
      pointer-events: none;
      opacity: ${this.opacity};
      animation: danmaku-move ${10 / this.speed}s linear forwards;
      z-index: 1000;
    `;

    // 添加CSS动画
    if (!document.getElementById('danmaku-style')) {
      const style = document.createElement('style');
      style.id = 'danmaku-style';
      style.textContent = `
        @keyframes danmaku-move {
          from { transform: translateX(0); }
          to { transform: translateX(-${this.container.offsetWidth + 500}px); }
        }
      `;
      document.head.appendChild(style);
    }

    this.container.appendChild(danmaku);

    // 动画结束后移除
    setTimeout(() => {
      danmaku.remove();
    }, (10000 / this.speed));
  }

  shouldFilter(text) {
    return this.filterWords.some(word => text.includes(word));
  }

  setFilter(words) {
    this.filterWords = words;
  }

  setOpacity(opacity) {
    this.opacity = Math.max(0, Math.min(1, opacity));
  }

  setSpeed(speed) {
    this.speed = Math.max(0.5, Math.min(3, speed));
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) {
      this.clear();
    }
  }

  clear() {
    this.container.innerHTML = '';
    this.messages = [];
  }

  generateId() {
    return `dm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getRecentMessages(count = 50) {
    return this.messages.slice(-count);
  }
}

// ============================================
// 观战数据统计
// ============================================
class SpectatorStats {
  constructor() {
    this.players = new Map();
    this.matchStats = {
      totalDamage: 0,
      totalHealing: 0,
      totalCardsPlayed: 0,
      matchDuration: 0,
      turnCount: 0
    };
    this.eventBus = new EventBus();
    this.history = [];
    this.maxHistoryLength = 1000;
  }

  addPlayer(playerId, playerData) {
    this.players.set(playerId, {
      id: playerId,
      name: playerData.name,
      health: playerData.health || 100,
      maxHealth: playerData.maxHealth || 100,
      mana: playerData.mana || 0,
      maxMana: playerData.maxMana || 10,
      cardsInHand: playerData.cardsInHand || 0,
      cardsInDeck: playerData.cardsInDeck || 30,
      damageDealt: 0,
      damageTaken: 0,
      healingDone: 0,
      cardsPlayed: 0,
      buffs: [],
      debuffs: []
    });
    this.eventBus.emit('playerAdded', { playerId, data: playerData });
  }

  updatePlayer(playerId, updates) {
    const player = this.players.get(playerId);
    if (!player) return;

    Object.assign(player, updates);
    this.recordHistory('playerUpdate', { playerId, updates, timestamp: Date.now() });
    this.eventBus.emit('playerUpdated', { playerId, data: player });
  }

  processMove(move) {
    const player = this.players.get(move.playerId);
    if (!player) return;

    // 更新统计数据
    this.matchStats.totalCardsPlayed++;
    player.cardsPlayed++;

    if (move.result) {
      if (move.result.damage) {
        this.matchStats.totalDamage += move.result.damage;
        player.damageDealt += move.result.damage;
      }
      if (move.result.healing) {
        this.matchStats.totalHealing += move.result.healing;
        player.healingDone += move.result.healing;
      }
      if (move.result.damageTaken) {
        player.damageTaken += move.result.damageTaken;
      }
    }

    this.recordHistory('move', move);
    this.eventBus.emit('moveProcessed', { move, stats: this.getSnapshot() });
  }

  recordHistory(type, data) {
    this.history.push({ type, data, timestamp: Date.now() });
    if (this.history.length > this.maxHistoryLength) {
      this.history.shift();
    }
  }

  getSnapshot() {
    return {
      players: Array.from(this.players.values()),
      matchStats: { ...this.matchStats },
      timestamp: Date.now()
    };
  }

  getPlayerStats(playerId) {
    return this.players.get(playerId);
  }

  getLeaderboard() {
    return Array.from(this.players.values())
      .sort((a, b) => b.damageDealt - a.damageDealt)
      .map((p, index) => ({
        rank: index + 1,
        name: p.name,
        damageDealt: p.damageDealt,
        healingDone: p.healingDone,
        cardsPlayed: p.cardsPlayed,
        health: p.health
      }));
  }

  reset() {
    this.players.clear();
    this.matchStats = {
      totalDamage: 0,
      totalHealing: 0,
      totalCardsPlayed: 0,
      matchDuration: 0,
      turnCount: 0
    };
    this.history = [];
  }
}

// ============================================
// 回放存储管理器
// ============================================
class ReplayStorage {
  constructor() {
    this.STORAGE_KEY = 'tower_of_fate_replays';
    this.METADATA_KEY = 'tower_of_fate_replay_metadata';
    this.MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB 限制
  }

  saveReplay(replay) {
    try {
      const replays = this.getAllReplays();
      const metadata = this.getMetadata();
      
      // 检查存储空间
      const currentSize = this.getStorageSize();
      const replaySize = JSON.stringify(replay).length;
      
      if (currentSize + replaySize > this.MAX_STORAGE_SIZE) {
        // 删除最旧的回放以腾出空间
        this.cleanupOldReplays(replaySize);
      }

      // 保存回放数据
      localStorage.setItem(`${this.STORAGE_KEY}_${replay.id}`, JSON.stringify(replay));
      
      // 更新元数据
      metadata[replay.id] = {
        id: replay.id,
        matchId: replay.matchId,
        players: replay.players,
        startTime: replay.startTime,
        endTime: replay.endTime,
        winner: replay.winner,
        moveCount: replay.moves?.length || 0,
        size: replaySize,
        tags: replay.tags || [],
        highlights: replay.highlights || []
      };
      
      this.saveMetadata(metadata);
      return true;
    } catch (error) {
      console.error('保存回放失败:', error);
      return false;
    }
  }

  getReplay(replayId) {
    try {
      const data = localStorage.getItem(`${this.STORAGE_KEY}_${replayId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('读取回放失败:', error);
      return null;
    }
  }

  getAllReplays() {
    const metadata = this.getMetadata();
    return Object.values(metadata).sort((a, b) => b.startTime - a.startTime);
  }

  getMetadata() {
    try {
      const data = localStorage.getItem(this.METADATA_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  saveMetadata(metadata) {
    localStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
  }

  deleteReplay(replayId) {
    try {
      localStorage.removeItem(`${this.STORAGE_KEY}_${replayId}`);
      const metadata = this.getMetadata();
      delete metadata[replayId];
      this.saveMetadata(metadata);
      return true;
    } catch (error) {
      console.error('删除回放失败:', error);
      return false;
    }
  }

  cleanupOldReplays(neededSpace) {
    const metadata = this.getMetadata();
    const sorted = Object.values(metadata).sort((a, b) => a.startTime - b.startTime);
    
    let freedSpace = 0;
    for (const item of sorted) {
      if (freedSpace >= neededSpace) break;
      freedSpace += item.size;
      this.deleteReplay(item.id);
    }
  }

  getStorageSize() {
    const metadata = this.getMetadata();
    return Object.values(metadata).reduce((total, item) => total + (item.size || 0), 0);
  }

  filterReplays(options = {}) {
    let replays = this.getAllReplays();

    if (options.startDate) {
      replays = replays.filter(r => r.startTime >= options.startDate);
    }
    if (options.endDate) {
      replays = replays.filter(r => r.startTime <= options.endDate);
    }
    if (options.playerName) {
      replays = replays.filter(r => 
        r.players.some(p => p.name.includes(options.playerName))
      );
    }
    if (options.matchType) {
      replays = replays.filter(r => r.matchType === options.matchType);
    }
    if (options.tags && options.tags.length > 0) {
      replays = replays.filter(r => 
        options.tags.some(tag => r.tags?.includes(tag))
      );
    }

    return replays;
  }

  addTag(replayId, tag) {
    const metadata = this.getMetadata();
    if (metadata[replayId]) {
      if (!metadata[replayId].tags) metadata[replayId].tags = [];
      if (!metadata[replayId].tags.includes(tag)) {
        metadata[replayId].tags.push(tag);
        this.saveMetadata(metadata);
      }
    }
  }

  exportReplay(replayId) {
    const replay = this.getReplay(replayId);
    if (!replay) return null;
    
    return {
      version: '1.0',
      exportedAt: Date.now(),
      data: replay
    };
  }

  importReplay(exportedData) {
    if (exportedData.version !== '1.0') {
      throw new Error('不兼容的回放版本');
    }
    return this.saveReplay(exportedData.data);
  }
}

// ============================================
// 回放播放器
// ============================================
class ReplayPlayer {
  constructor() {
    this.eventBus = new EventBus();
    this.replay = null;
    this.currentMoveIndex = 0;
    this.isPlaying = false;
    this.playbackSpeed = 1;
    this.timer = null;
    this.bookmarks = [];
    this.highlights = [];
    this.baseDelay = 2000; // 基础延迟2秒
  }

  loadReplay(replay) {
    this.replay = replay;
    this.currentMoveIndex = 0;
    this.isPlaying = false;
    this.bookmarks = replay.bookmarks || [];
    this.highlights = replay.highlights || [];
    this.stop();
    this.eventBus.emit('replayLoaded', { replay });
  }

  play() {
    if (!this.replay || this.isPlaying) return;
    
    this.isPlaying = true;
    this.eventBus.emit('playbackStarted', { moveIndex: this.currentMoveIndex });
    this.scheduleNextMove();
  }

  pause() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.eventBus.emit('playbackPaused', { moveIndex: this.currentMoveIndex });
  }

  stop() {
    this.pause();
    this.currentMoveIndex = 0;
    this.eventBus.emit('playbackStopped', {});
  }

  scheduleNextMove() {
    if (!this.isPlaying || !this.replay) return;

    if (this.currentMoveIndex >= this.replay.moves.length) {
      this.onPlaybackComplete();
      return;
    }

    const move = this.replay.moves[this.currentMoveIndex];
    
    // 播放当前移动
    this.playMove(move);
    this.currentMoveIndex++;

    // 计算下一个移动的延迟
    let delay = this.baseDelay / this.playbackSpeed;
    
    // 如果有时间戳，使用实际时间差
    if (this.currentMoveIndex < this.replay.moves.length) {
      const nextMove = this.replay.moves[this.currentMoveIndex];
      const timeDiff = nextMove.timestamp - move.timestamp;
      if (timeDiff > 0 && timeDiff < 30000) { // 最多30秒
        delay = (timeDiff / this.playbackSpeed);
      }
    }

    this.timer = setTimeout(() => this.scheduleNextMove(), delay);
  }

  playMove(move) {
    this.eventBus.emit('movePlayed', { 
      move, 
      index: this.currentMoveIndex,
      total: this.replay.moves.length,
      progress: (this.currentMoveIndex / this.replay.moves.length) * 100
    });

    // 检查是否是精彩时刻
    const highlight = this.highlights.find(h => 
      Math.abs(h.timestamp - move.timestamp) < 1000
    );
    if (highlight) {
      this.eventBus.emit('highlightReached', { highlight, move });
    }
  }

  onPlaybackComplete() {
    this.isPlaying = false;
    this.eventBus.emit('playbackComplete', { 
      replay: this.replay,
      totalMoves: this.replay.moves.length 
    });
  }

  // 跳转控制
  seekToMove(index) {
    if (!this.replay || index < 0 || index >= this.replay.moves.length) return;
    
    const wasPlaying = this.isPlaying;
    this.pause();
    this.currentMoveIndex = index;
    
    // 重新播放从开头到当前位置的所有移动以恢复状态
    this.eventBus.emit('seeked', { moveIndex: index });
    
    if (wasPlaying) {
      this.play();
    }
  }

  seekToTime(timestamp) {
    if (!this.replay) return;
    
    const index = this.replay.moves.findIndex(m => m.timestamp >= timestamp);
    if (index !== -1) {
      this.seekToMove(index);
    }
  }

  // 速度控制
  setSpeed(speed) {
    const validSpeeds = [0.5, 1, 2, 4, 8];
    if (validSpeeds.includes(speed)) {
      this.playbackSpeed = speed;
      this.eventBus.emit('speedChanged', { speed });
      
      // 如果正在播放，重新调度以应用新速度
      if (this.isPlaying) {
        clearTimeout(this.timer);
        this.scheduleNextMove();
      }
    }
  }

  // 书签功能
  addBookmark(timestamp, note = '') {
    const bookmark = {
      id: this.generateId(),
      timestamp,
      note,
      moveIndex: this.getMoveIndexAtTime(timestamp),
      createdAt: Date.now()
    };
    this.bookmarks.push(bookmark);
    this.bookmarks.sort((a, b) => a.timestamp - b.timestamp);
    this.eventBus.emit('bookmarkAdded', { bookmark });
    return bookmark;
  }

  removeBookmark(bookmarkId) {
    const index = this.bookmarks.findIndex(b => b.id === bookmarkId);
    if (index > -1) {
      const bookmark = this.bookmarks.splice(index, 1)[0];
      this.eventBus.emit('bookmarkRemoved', { bookmark });
    }
  }

  jumpToBookmark(bookmarkId) {
    const bookmark = this.bookmarks.find(b => b.id === bookmarkId);
    if (bookmark) {
      this.seekToTime(bookmark.timestamp);
    }
  }

  getBookmarks() {
    return [...this.bookmarks];
  }

  // 精彩时刻检测
  detectHighlights() {
    if (!this.replay || !this.replay.moves) return [];

    const highlights = [];
    
    this.replay.moves.forEach((move, index) => {
      // 检测关键卡牌
      if (this.isCriticalCard(move.card)) {
        highlights.push({
          type: 'critical_card',
          timestamp: move.timestamp,
          moveIndex: index,
          description: `关键卡牌: ${move.card.name}`,
          move
        });
      }
      
      // 检测高伤害
      if (move.result?.damage > 20) {
        highlights.push({
          type: 'high_damage',
          timestamp: move.timestamp,
          moveIndex: index,
          description: `高额伤害: ${move.result.damage}`,
          move
        });
      }
      
      // 检测逆转
      if (this.isComebackMoment(index)) {
        highlights.push({
          type: 'comeback',
          timestamp: move.timestamp,
          moveIndex: index,
          description: '逆转时刻',
          move
        });
      }
    });

    this.highlights = highlights;
    return highlights;
  }

  isCriticalCard(card) {
    const criticalTypes = ['legendary', 'ultimate', 'rare'];
    return criticalTypes.includes(card?.rarity) || card?.isFinisher;
  }

  isComebackMoment(moveIndex) {
    if (moveIndex < 3) return false;
    
    // 检查是否血量劣势后反击
    const prevMoves = this.replay.moves.slice(Math.max(0, moveIndex - 3), moveIndex);
    const currentMove = this.replay.moves[moveIndex];
    
    // 简化逻辑：检测是否有重大伤害输出
    return currentMove.result?.damage > 15;
  }

  getMoveIndexAtTime(timestamp) {
    return this.replay.moves.findIndex(m => m.timestamp >= timestamp);
  }

  getCurrentState() {
    return {
      isPlaying: this.isPlaying,
      currentMoveIndex: this.currentMoveIndex,
      totalMoves: this.replay?.moves?.length || 0,
      progress: this.replay ? (this.currentMoveIndex / this.replay.moves.length) * 100 : 0,
      speed: this.playbackSpeed,
      currentTime: this.replay?.moves[this.currentMoveIndex]?.timestamp || 0
    };
  }

  generateId() {
    return `bm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================
// 分享链接生成器
// ============================================
class ReplayShare {
  constructor(baseUrl = window.location.origin) {
    this.baseUrl = baseUrl;
  }

  generateShareLink(replayId, options = {}) {
    const params = new URLSearchParams();
    params.set('replay', replayId);
    
    if (options.startTime) params.set('t', options.startTime);
    if (options.highlightIndex !== undefined) params.set('hl', options.highlightIndex);
    if (options.viewerMode) params.set('mode', options.viewerMode);
    
    return `${this.baseUrl}/replay?${params.toString()}`;
  }

  parseShareUrl(url) {
    try {
      const urlObj = new URL(url);
      const params = urlObj.searchParams;
      
      return {
        replayId: params.get('replay'),
        startTime: params.get('t') ? parseInt(params.get('t')) : null,
        highlightIndex: params.get('hl') ? parseInt(params.get('hl')) : null,
        viewerMode: params.get('mode') || 'default'
      };
    } catch (error) {
      console.error('解析分享链接失败:', error);
      return null;
    }
  }

  generateEmbedCode(replayId, options = {}) {
    const width = options.width || 800;
    const height = options.height || 600;
    const autoplay = options.autoplay ? '1' : '0';
    
    const url = `${this.baseUrl}/replay/embed?replay=${replayId}&autoplay=${autoplay}`;
    
    return `<iframe 
      src="${url}" 
      width="${width}" 
      height="${height}" 
      frameborder="0" 
      allowfullscreen
      allow="autoplay"
    ></iframe>`;
  }

  async shareToSocial(platform, replayId, message = '') {
    const link = this.generateShareLink(replayId);
    const shareText = message || `来观看这场精彩的命运塔对局！ ${link}`;
    
    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      weibo: `http://service.weibo.com/share/share.php?url=${encodeURIComponent(link)}&title=${encodeURIComponent(shareText)}`,
      qq: `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(link)}&title=${encodeURIComponent('命运塔精彩对局')}&summary=${encodeURIComponent(shareText)}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
      return true;
    }
    return false;
  }

  copyToClipboard(text) {
    if (navigator.clipboard) {
      return navigator.clipboard.writeText(text);
    } else {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return Promise.resolve();
    }
  }
}

// ============================================
// 观战列表管理器
// ============================================
class SpectatorList {
  constructor() {
    this.activeMatches = new Map();
    this.eventBus = new EventBus();
    this.filters = {
      minViewers: 0,
      maxViewers: Infinity,
      matchType: 'all',
      sortBy: 'viewers' // viewers, time, rating
    };
  }

  addMatch(match) {
    this.activeMatches.set(match.id, {
      ...match,
      addedAt: Date.now(),
      peakViewers: match.viewers || 0
    });
    this.eventBus.emit('matchAdded', { match });
  }

  updateMatch(matchId, updates) {
    const match = this.activeMatches.get(matchId);
    if (!match) return;

    Object.assign(match, updates);
    
    // 更新峰值观众数
    if (updates.viewers && updates.viewers > match.peakViewers) {
      match.peakViewers = updates.viewers;
    }

    this.eventBus.emit('matchUpdated', { matchId, match });
  }

  removeMatch(matchId) {
    const match = this.activeMatches.get(matchId);
    if (match) {
      this.activeMatches.delete(matchId);
      this.eventBus.emit('matchRemoved', { matchId, match });
    }
  }

  getMatch(matchId) {
    return this.activeMatches.get(matchId);
  }

  getAllMatches() {
    return Array.from(this.activeMatches.values());
  }

  getFilteredMatches() {
    let matches = this.getAllMatches();

    // 应用过滤器
    if (this.filters.minViewers > 0) {
      matches = matches.filter(m => m.viewers >= this.filters.minViewers);
    }
    if (this.filters.maxViewers < Infinity) {
      matches = matches.filter(m => m.viewers <= this.filters.maxViewers);
    }
    if (this.filters.matchType !== 'all') {
      matches = matches.filter(m => m.type === this.filters.matchType);
    }

    // 排序
    switch (this.filters.sortBy) {
      case 'viewers':
        matches.sort((a, b) => b.viewers - a.viewers);
        break;
      case 'time':
        matches.sort((a, b) => b.addedAt - a.addedAt);
        break;
      case 'rating':
        matches.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        break;
      case 'excitement':
        matches.sort((a, b) => (b.excitementScore || 0) - (a.excitementScore || 0));
        break;
    }

    return matches;
  }

  getFeaturedMatches(count = 5) {
    return this.getFilteredMatches()
      .filter(m => m.excitementScore > 70 || m.peakViewers > 50)
      .slice(0, count);
  }

  setFilter(key, value) {
    if (this.filters.hasOwnProperty(key)) {
      this.filters[key] = value;
      this.eventBus.emit('filterChanged', { key, value, filters: { ...this.filters } });
    }
  }

  calculateExcitementScore(match) {
    // 计算比赛精彩度评分
    let score = 0;
    
    // 观众数量权重
    score += Math.min(match.viewers * 0.5, 30);
    
    // 玩家评分权重
    if (match.players) {
      const avgRating = match.players.reduce((sum, p) => sum + (p.rating || 1000), 0) / match.players.length;
      score += Math.min((avgRating - 1000) / 50, 20);
    }
    
    // 比赛时长权重（适中时长更受欢迎）
    if (match.duration) {
      const optimalDuration = 10 * 60 * 1000; // 10分钟
      const durationScore = 20 - Math.abs(match.duration - optimalDuration) / (60 * 1000);
      score += Math.max(0, durationScore);
    }
    
    // 接近程度权重（比分接近更精彩）
    if (match.scoreDiff !== undefined) {
      score += Math.max(0, 15 - match.scoreDiff * 3);
    }

    return Math.min(100, Math.max(0, score));
  }
}

// ============================================
// 多视角管理器
// ============================================
class PerspectiveManager {
  constructor() {
    this.players = new Map();
    this.currentPerspective = null;
    this.eventBus = new EventBus();
    this.perspectiveHistory = [];
  }

  addPlayer(player) {
    this.players.set(player.id, {
      ...player,
      camera: {
        x: 0,
        y: 0,
        zoom: 1
      },
      handVisible: false,
      deckVisible: false
    });
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
    if (this.currentPerspective === playerId) {
      this.switchToSpectatorView();
    }
  }

  switchPerspective(playerId) {
    if (!this.players.has(playerId) && playerId !== 'spectator') return false;

    // 保存历史
    if (this.currentPerspective) {
      this.perspectiveHistory.push(this.currentPerspective);
      if (this.perspectiveHistory.length > 10) {
        this.perspectiveHistory.shift();
      }
    }

    this.currentPerspective = playerId;
    
    const perspective = playerId === 'spectator' 
      ? { type: 'spectator', name: '上帝视角' }
      : { type: 'player', ...this.players.get(playerId) };

    this.eventBus.emit('perspectiveChanged', { 
      playerId, 
      perspective,
      previousPerspectives: [...this.perspectiveHistory]
    });

    return true;
  }

  switchToSpectatorView() {
    return this.switchPerspective('spectator');
  }

  cyclePerspective() {
    const playerIds = Array.from(this.players.keys());
    if (playerIds.length === 0) return;

    const currentIndex = playerIds.indexOf(this.currentPerspective);
    const nextIndex = (currentIndex + 1) % (playerIds.length + 1);
    
    if (nextIndex === playerIds.length) {
      this.switchToSpectatorView();
    } else {
      this.switchPerspective(playerIds[nextIndex]);
    }
  }

  getCurrentPerspective() {
    if (this.currentPerspective === 'spectator') {
      return { type: 'spectator', name: '上帝视角' };
    }
    return this.players.get(this.currentPerspective);
  }

  getAllPerspectives() {
    return [
      { id: 'spectator', type: 'spectator', name: '上帝视角' },
      ...Array.from(this.players.entries()).map(([id, data]) => ({
        id,
        type: 'player',
        ...data
      }))
    ];
  }

  setPlayerVisibility(playerId, options) {
    const player = this.players.get(playerId);
    if (!player) return;

    if (options.handVisible !== undefined) player.handVisible = options.handVisible;
    if (options.deckVisible !== undefined) player.deckVisible = options.deckVisible;

    this.eventBus.emit('visibilityChanged', { playerId, options });
  }

  getPerspectiveState() {
    const current = this.getCurrentPerspective();
    return {
      current: current?.id || 'spectator',
      type: current?.type || 'spectator',
      canSeeHand: current?.type === 'player' && current?.handVisible,
      canSeeDeck: current?.type === 'player' && current?.deckVisible,
      available: this.getAllPerspectives().map(p => ({
        id: p.id,
        name: p.name,
        type: p.type
      }))
    };
  }
}

// ============================================
// 主控制器 - 观战系统
// ============================================
class SpectatorSystem {
  constructor(config = {}) {
    this.config = {
      wsUrl: config.wsUrl || 'wss://api.toweroffate.game/spectator',
      danmakuContainer: config.danmakuContainer || null,
      ...config
    };

    this.wsManager = new WebSocketManager(this.config.wsUrl);
    this.danmaku = this.config.danmakuContainer 
      ? new DanmakuChat(this.config.danmakuContainer) 
      : null;
    this.stats = new SpectatorStats();
    this.matchList = new SpectatorList();
    this.perspectiveManager = new PerspectiveManager();
    this.eventBus = new EventBus();
    
    this.currentMatchId = null;
    this.isSpectating = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    // WebSocket事件
    this.wsManager.on('matchState', (data) => this.handleMatchState(data));
    this.wsManager.on('playerAction', (data) => this.handlePlayerAction(data));
    this.wsManager.on('chatMessage', (data) => this.handleChatMessage(data));
    this.wsManager.on('matchList', (data) => this.handleMatchList(data));
    this.wsManager.on('matchEnded', (data) => this.handleMatchEnded(data));

    // 统计事件转发
    this.stats.eventBus.on('playerUpdated', (data) => {
      this.eventBus.emit('statsUpdated', data);
    });
  }

  async connect() {
    await this.wsManager.connect();
    console.log('[SpectatorSystem] 已连接到观战服务器');
  }

  disconnect() {
    this.wsManager.disconnect();
    this.stopSpectating();
  }

  // 开始观战
  startSpectating(matchId, options = {}) {
    if (this.currentMatchId === matchId) return;

    this.stopSpectating();
    this.currentMatchId = matchId;
    this.isSpectating = true;

    this.wsManager.send('joinMatch', { 
      matchId, 
      perspective: options.perspective || 'spectator'
    });

    this.eventBus.emit('spectatingStarted', { matchId, options });
  }

  stopSpectating() {
    if (this.currentMatchId) {
      this.wsManager.send('leaveMatch', { matchId: this.currentMatchId });
    }
    
    this.currentMatchId = null;
    this.isSpectating = false;
    this.stats.reset();
    
    if (this.danmaku) {
      this.danmaku.clear();
    }

    this.eventBus.emit('spectatingStopped', {});
  }

  // 发送弹幕
  sendDanmaku(text, options = {}) {
    if (!this.currentMatchId) return false;

    this.wsManager.send('chat', {
      matchId: this.currentMatchId,
      text,
      color: options.color || '#ffffff',
      isDanmaku: true
    });

    return true;
  }

  // 请求比赛列表
  requestMatchList(filters = {}) {
    this.wsManager.send('getMatchList', filters);
  }

  // 切换视角
  switchPerspective(playerId) {
    if (!this.isSpectating) return false;

    const success = this.perspectiveManager.switchPerspective(playerId);
    if (success) {
      this.wsManager.send('switchPerspective', { 
        matchId: this.currentMatchId, 
        playerId 
      });
    }
    return success;
  }

  // 事件处理器
  handleMatchState(data) {
    // 初始化或更新比赛状态
    data.players?.forEach(player => {
      if (!this.stats.players.has(player.id)) {
        this.stats.addPlayer(player.id, player);
        this.perspectiveManager.addPlayer(player);
      } else {
        this.stats.updatePlayer(player.id, player);
      }
    });

    this.eventBus.emit('matchStateUpdated', data);
  }

  handlePlayerAction(data) {
    // 处理玩家行动
    this.stats.processMove(data);
    this.eventBus.emit('playerAction', data);
  }

  handleChatMessage(data) {
    if (this.danmaku && data.isDanmaku) {
      this.danmaku.addMessage({
        text: data.text,
        author: data.author,
        color: data.color
      });
    }
    this.eventBus.emit('chatMessage', data);
  }

  handleMatchList(data) {
    // 更新比赛列表
    this.matchList.activeMatches.clear();
    data.matches?.forEach(match => {
      match.excitementScore = this.matchList.calculateExcitementScore(match);
      this.matchList.addMatch(match);
    });
    this.eventBus.emit('matchListUpdated', this.matchList.getFilteredMatches());
  }

  handleMatchEnded(data) {
    if (data.matchId === this.currentMatchId) {
      this.eventBus.emit('matchEnded', data);
      // 可以选择自动停止观战或继续观看结算
    }
  }

  // 获取统计数据
  getStats() {
    return this.stats.getSnapshot();
  }

  getLeaderboard() {
    return this.stats.getLeaderboard();
  }

  // 获取当前状态
  getState() {
    return {
      isConnected: this.wsManager.isConnected,
      isSpectating: this.isSpectating,
      currentMatchId: this.currentMatchId,
      currentPerspective: this.perspectiveManager.getPerspectiveState(),
      stats: this.getStats()
    };
  }
}

// ============================================
// 主控制器 - 回放系统
// ============================================
class ReplaySystem {
  constructor(config = {}) {
    this.config = {
      autoSave: config.autoSave !== false,
      detectHighlights: config.detectHighlights !== false,
      ...config
    };

    this.storage = new ReplayStorage();
    this.player = new ReplayPlayer();
    this.share = new ReplayShare(config.shareBaseUrl);
    this.eventBus = new EventBus();
    
    this.currentReplay = null;
    this.isRecording = false;
    this.recordingStartTime = null;
    this.recordedMoves = [];
    this.players = [];

    this.setupEventListeners();
  }

  setupEventListeners() {
    // 播放器事件转发
    this.player.eventBus.on('movePlayed', (data) => {
      this.eventBus.emit('replayMovePlayed', data);
    });
    
    this.player.eventBus.on('playbackComplete', (data) => {
      this.eventBus.emit('replayPlaybackComplete', data);
    });

    this.player.eventBus.on('highlightReached', (data) => {
      this.eventBus.emit('replayHighlightReached', data);
    });
  }

  // 开始录制对局
  startRecording(matchId, players) {
    if (this.isRecording) return false;

    this.isRecording = true;
    this.recordingStartTime = Date.now();
    this.recordedMoves = [];
    this.players = players.map(p => ({
      id: p.id,
      name: p.name,
      rating: p.rating || 1000
    }));

    this.eventBus.emit('recordingStarted', { 
      matchId, 
      players: this.players,
      startTime: this.recordingStartTime 
    });

    return true;
  }

  // 记录一个移动
  recordMove(move) {
    if (!this.isRecording) return;

    const recordedMove = {
      timestamp: Date.now(),
      playerId: move.playerId,
      action: move.action,
      card: move.card,
      result: move.result,
      gameState: move.gameState // 可选：保存完整游戏状态
    };

    this.recordedMoves.push(recordedMove);
  }

  // 结束录制并保存
  stopRecording(winner) {
    if (!this.isRecording) return null;

    const endTime = Date.now();
    const replayId = this.generateReplayId();

    const replay = {
      id: replayId,
      matchId: this.generateMatchId(),
      players: this.players,
      startTime: this.recordingStartTime,
      endTime: endTime,
      moves: this.recordedMoves,
      winner: winner,
      duration: endTime - this.recordingStartTime,
      version: '1.0'
    };

    // 自动检测精彩时刻
    if (this.config.detectHighlights) {
      this.player.loadReplay(replay);
      replay.highlights = this.player.detectHighlights();
    }

    // 自动保存
    if (this.config.autoSave) {
      this.storage.saveReplay(replay);
    }

    this.isRecording = false;
    this.currentReplay = replay;

    this.eventBus.emit('recordingStopped', { 
      replay, 
      moveCount: replay.moves.length,
      highlights: replay.highlights 
    });

    return replay;
  }

  // 加载回放
  loadReplay(replayId) {
    const replay = this.storage.getReplay(replayId);
    if (!replay) return false;

    this.currentReplay = replay;
    this.player.loadReplay(replay);
    this.eventBus.emit('replayLoaded', { replay });
    return true;
  }

  // 播放控制
  play() {
    this.player.play();
  }

  pause() {
    this.player.pause();
  }

  stop() {
    this.player.stop();
  }

  seekToMove(index) {
    this.player.seekToMove(index);
  }

  seekToTime(timestamp) {
    this.player.seekToTime(timestamp);
  }

  setSpeed(speed) {
    this.player.setSpeed(speed);
  }

  // 书签功能
  addBookmark(note = '') {
    if (!this.currentReplay) return null;
    
    const currentState = this.player.getCurrentState();
    return this.player.addBookmark(currentState.currentTime, note);
  }

  removeBookmark(bookmarkId) {
    this.player.removeBookmark(bookmarkId);
  }

  getBookmarks() {
    return this.player.getBookmarks();
  }

  // 回放列表管理
  getReplayList(options = {}) {
    return this.storage.getAllReplays();
  }

  filterReplays(options) {
    return this.storage.filterReplays(options);
  }

  deleteReplay(replayId) {
    return this.storage.deleteReplay(replayId);
  }

  // 分享功能
  generateShareLink(options = {}) {
    if (!this.currentReplay) return null;
    return this.share.generateShareLink(this.currentReplay.id, options);
  }

  copyShareLink(options = {}) {
    const link = this.generateShareLink(options);
    if (link) {
      this.share.copyToClipboard(link);
      return true;
    }
    return false;
  }

  shareToSocial(platform, message) {
    if (!this.currentReplay) return false;
    return this.share.shareToSocial(platform, this.currentReplay.id, message);
  }

  generateEmbedCode(options) {
    if (!this.currentReplay) return null;
    return this.share.generateEmbedCode(this.currentReplay.id, options);
  }

  // 导出/导入
  exportReplay(replayId) {
    return this.storage.exportReplay(replayId || this.currentReplay?.id);
  }

  importReplay(data) {
    return this.storage.importReplay(data);
  }

  // 获取精彩时刻
  getHighlights() {
    return this.player.highlights;
  }

  // 跳转到精彩时刻
  jumpToHighlight(highlightIndex) {
    const highlight = this.player.highlights[highlightIndex];
    if (highlight) {
      this.player.seekToTime(highlight.timestamp);
      return true;
    }
    return false;
  }

  // 获取当前状态
  getState() {
    return {
      isRecording: this.isRecording,
      recordingDuration: this.isRecording 
        ? Date.now() - this.recordingStartTime 
        : 0,
      hasReplay: !!this.currentReplay,
      playbackState: this.player.getCurrentState(),
      replayCount: this.storage.getAllReplays().length
    };
  }

  generateReplayId() {
    return `replay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateMatchId() {
    return `match_${Date.now()}`;
  }
}

// ============================================
// 游戏集成接口
// ============================================
class GameIntegration {
  constructor(spectatorSystem, replaySystem) {
    this.spectator = spectatorSystem;
    this.replay = replaySystem;
    this.eventBus = new EventBus();
  }

  // 当游戏开始新对局时调用
  onGameStart(players, matchId) {
    // 开始录制
    this.replay.startRecording(matchId, players);
    
    // 广播观战信息
    this.spectator.wsManager?.send('matchStarted', {
      matchId,
      players,
      startTime: Date.now()
    });
  }

  // 当游戏产生动作时调用
  onGameAction(playerId, action, card, result) {
    const move = {
      playerId,
      action,
      card,
      result,
      timestamp: Date.now()
    };

    // 记录到回放
    this.replay.recordMove(move);

    // 广播给观战者
    this.spectator.wsManager?.send('gameAction', {
      matchId: this.replay.currentReplay?.matchId,
      move
    });
  }

  // 当游戏状态更新时调用
  onGameStateUpdate(gameState) {
    // 更新观战统计
    gameState.players?.forEach(player => {
      this.spectator.stats.updatePlayer(player.id, player);
    });

    // 广播状态
    this.spectator.wsManager?.send('gameState', {
      matchId: this.replay.currentReplay?.matchId,
      state: gameState
    });
  }

  // 当游戏结束时调用
  onGameEnd(winner, finalState) {
    // 停止录制并保存回放
    const replay = this.replay.stopRecording(winner);

    // 广播比赛结束
    this.spectator.wsManager?.send('matchEnded', {
      matchId: this.replay.currentReplay?.matchId,
      winner,
      replayId: replay?.id,
      finalState
    });

    this.eventBus.emit('gameEnded', { winner, replay, finalState });
  }
}

// ============================================
// 导出模块
// ============================================
export {
  // 核心类
  SpectatorSystem,
  ReplaySystem,
  GameIntegration,
  
  // 工具类
  EventBus,
  WebSocketManager,
  DanmakuChat,
  SpectatorStats,
  SpectatorList,
  PerspectiveManager,
  ReplayStorage,
  ReplayPlayer,
  ReplayShare,
  
  // 默认导出
  SpectatorSystem as default
};

// UMD支持 (浏览器直接引用)
if (typeof window !== 'undefined') {
  window.TowerOfFate = {
    SpectatorSystem,
    ReplaySystem,
    GameIntegration,
    EventBus,
    WebSocketManager,
    DanmakuChat,
    SpectatorStats,
    SpectatorList,
    PerspectiveManager,
    ReplayStorage,
    ReplayPlayer,
    ReplayShare
  };
}