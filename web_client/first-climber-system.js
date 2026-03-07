/**
 * 命运塔 - 首登者机制系统
 * Tower of Fate - First Climber System
 * 
 * 功能：
 * 1. 第一个登顶A层的玩家成为首登者
 * 2. 首登者可以控制守卫出牌
 * 3. 首登者可以发动激怒牌干扰其他玩家
 */

class FirstClimberSystem {
  constructor() {
    this.firstClimber = null; // 首登者ID
    this.isFirstClimber = false; // 当前玩家是否为首登者
    this.guardControlEnabled = false; // 守卫控制是否启用
    this.angerCardsAvailable = []; // 可用的激怒牌
    this.interferenceCooldown = 0; // 干扰冷却时间
    this.initUI();
  }

  /**
   * 初始化UI
   */
  initUI() {
    this.addStyles();
  }

  /**
   * 添加样式
   */
  addStyles() {
    if (document.getElementById('first-climber-styles')) return;

    const style = document.createElement('style');
    style.id = 'first-climber-styles';
    style.textContent = `
      /* 首登者标识 */
      .first-climber-badge {
        position: absolute;
        top: -10px;
        right: -10px;
        background: linear-gradient(45deg, #ffd700, #ffaa00);
        color: #000;
        font-size: 10px;
        font-weight: bold;
        padding: 3px 8px;
        border-radius: 10px;
        border: 2px solid #fff;
        box-shadow: 0 0 15px rgba(255, 215, 0, 0.8);
        z-index: 100;
        animation: badgePulse 2s ease-in-out infinite;
      }
      
      @keyframes badgePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      /* 首登者控制面板 */
      .first-climber-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, rgba(26, 26, 62, 0.95), rgba(13, 27, 42, 0.95));
        border: 2px solid #ffd700;
        border-radius: 15px;
        padding: 20px;
        min-width: 250px;
        z-index: 1000;
        box-shadow: 0 10px 40px rgba(255, 215, 0, 0.3);
        transform: translateX(120%);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      .first-climber-panel.active {
        transform: translateX(0);
      }
      
      .first-climber-panel h3 {
        color: #ffd700;
        margin: 0 0 15px 0;
        font-size: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .first-climber-panel .panel-section {
        margin-bottom: 15px;
        padding-bottom: 15px;
        border-bottom: 1px solid rgba(255, 215, 0, 0.2);
      }
      
      .first-climber-panel .panel-section:last-child {
        border-bottom: none;
        margin-bottom: 0;
      }

      /* 守卫控制区域 */
      .guard-control-area {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
        margin-top: 10px;
      }
      
      .guard-card-selector {
        width: 50px;
        height: 70px;
        background: linear-gradient(135deg, #4a0080, #2a0040);
        border: 2px solid rgba(255, 215, 0, 0.3);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 12px;
        color: rgba(255, 255, 255, 0.7);
      }
      
      .guard-card-selector:hover {
        border-color: #ffd700;
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
      }
      
      .guard-card-selector.selected {
        border-color: #ffd700;
        background: linear-gradient(135deg, #6a00a0, #4a0060);
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      }

      /* 激怒牌区域 */
      .anger-cards-area {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 10px;
      }
      
      .anger-card-btn {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px;
        background: rgba(255, 0, 0, 0.1);
        border: 2px solid rgba(255, 0, 0, 0.3);
        border-radius: 10px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #fff;
      }
      
      .anger-card-btn:hover:not(.cooldown) {
        border-color: #ff0000;
        background: rgba(255, 0, 0, 0.2);
        transform: translateX(5px);
      }
      
      .anger-card-btn.cooldown {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .anger-card-btn .anger-icon {
        font-size: 24px;
      }
      
      .anger-card-btn .anger-info {
        flex: 1;
        text-align: left;
      }
      
      .anger-card-btn .anger-name {
        font-weight: bold;
        color: #ff6b6b;
      }
      
      .anger-card-btn .anger-desc {
        font-size: 11px;
        color: #888;
      }
      
      .anger-card-btn .anger-cooldown {
        font-size: 12px;
        color: #ff0000;
      }

      /* 首登者公告 */
      .first-climber-announcement {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        background: linear-gradient(135deg, #1a1a3e, #0d1b2a);
        border: 3px solid #ffd700;
        border-radius: 20px;
        padding: 40px;
        text-align: center;
        z-index: 10001;
        box-shadow: 0 0 100px rgba(255, 215, 0, 0.5);
        transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      .first-climber-announcement.active {
        transform: translate(-50%, -50%) scale(1);
      }
      
      .first-climber-announcement .crown-icon {
        font-size: 60px;
        margin-bottom: 20px;
        animation: crownFloat 2s ease-in-out infinite;
      }
      
      @keyframes crownFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      .first-climber-announcement h2 {
        color: #ffd700;
        font-size: 28px;
        margin-bottom: 10px;
      }
      
      .first-climber-announcement p {
        color: #fff;
        font-size: 18px;
        margin-bottom: 20px;
      }
      
      .first-climber-announcement .powers-list {
        text-align: left;
        background: rgba(255, 215, 0, 0.1);
        border-radius: 10px;
        padding: 15px;
        margin: 20px 0;
      }
      
      .first-climber-announcement .powers-list li {
        color: #ffd700;
        margin: 8px 0;
        font-size: 14px;
      }

      /* 守卫控制模式指示器 */
      .guard-control-indicator {
        position: absolute;
        bottom: -25px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(45deg, #ffd700, #ffaa00);
        color: #000;
        font-size: 10px;
        font-weight: bold;
        padding: 3px 10px;
        border-radius: 10px;
        white-space: nowrap;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .guard-control-indicator.active {
        opacity: 1;
      }

      /* 干扰效果提示 */
      .interference-toast {
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%) translateY(-100px);
        background: linear-gradient(135deg, #ff0000, #aa0000);
        color: #fff;
        padding: 15px 30px;
        border-radius: 10px;
        font-size: 14px;
        z-index: 10002;
        opacity: 0;
        transition: all 0.4s ease;
        box-shadow: 0 5px 20px rgba(255, 0, 0, 0.4);
      }
      
      .interference-toast.active {
        opacity: 1;
        transform: translateX(-50%) translateY(0);
      }

      /* 玩家列表 - 用于选择干扰目标 */
      .target-player-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 10px;
        max-height: 150px;
        overflow-y: auto;
      }
      
      .target-player-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      .target-player-item:hover {
        background: rgba(255, 215, 0, 0.1);
      }
      
      .target-player-item .player-avatar-small {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        border: 2px solid;
      }
      
      .target-player-item .player-info {
        flex: 1;
        text-align: left;
      }
      
      .target-player-item .player-name {
        font-size: 13px;
        color: #fff;
      }
      
      .target-player-item .player-level {
        font-size: 11px;
        color: #888;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 设置首登者
   */
  setFirstClimber(playerId, playerName, isCurrentPlayer = false) {
    this.firstClimber = playerId;
    this.isFirstClimber = isCurrentPlayer;
    
    // 更新玩家头像标识
    const avatar = document.getElementById(`avatar-${playerId}`);
    if (avatar) {
      // 移除旧的首登者标识
      document.querySelectorAll('.first-climber-badge').forEach(badge => badge.remove());
      
      // 添加新的首登者标识
      const badge = document.createElement('div');
      badge.className = 'first-climber-badge';
      badge.textContent = '👑首登';
      avatar.appendChild(badge);
      
      // 添加特效
      if (window.animationSystem) {
        window.animationSystem.setFirstClimber(avatar);
      }
    }
    
    // 显示首登者公告
    this.showAnnouncement(playerName, isCurrentPlayer);
    
    // 如果是当前玩家，显示控制面板
    if (isCurrentPlayer) {
      this.showControlPanel();
      this.initGuardControl();
      this.initAngerCards();
    }
  }

  /**
   * 显示首登者公告
   */
  showAnnouncement(playerName, isCurrentPlayer) {
    const announcement = document.createElement('div');
    announcement.className = 'first-climber-announcement';
    announcement.innerHTML = `
      <div class="crown-icon">👑</div>
      <h2>${isCurrentPlayer ? '恭喜你成为首登者！' : `${playerName} 成为首登者！`}</h2>
      <p>第一个登顶A层的玩家！</p>
      ${isCurrentPlayer ? `
        <ul class="powers-list">
          <li>🎮 可以控制守卫出牌</li>
          <li>⚡ 可以发动激怒牌干扰其他玩家</li>
          <li>🏆 获得首登者专属奖励</li>
        </ul>
      ` : `
        <p style="color: #888; font-size: 14px;">首登者现在可以控制守卫和干扰其他玩家</p>
      `}
    `;
    
    document.body.appendChild(announcement);
    
    requestAnimationFrame(() => {
      announcement.classList.add('active');
    });
    
    setTimeout(() => {
      announcement.classList.remove('active');
      setTimeout(() => announcement.remove(), 500);
    }, 4000);
  }

  /**
   * 显示控制面板
   */
  showControlPanel() {
    // 移除旧面板
    const oldPanel = document.getElementById('firstClimberPanel');
    if (oldPanel) oldPanel.remove();
    
    const panel = document.createElement('div');
    panel.id = 'firstClimberPanel';
    panel.className = 'first-climber-panel';
    panel.innerHTML = `
      <h3>👑 首登者控制台</h3>
      
      <div class="panel-section">
        <div style="color: #888; font-size: 12px; margin-bottom: 8px;">🎮 守卫控制</div>
        <div class="guard-control-area" id="guardControlArea">
          <!-- 动态生成守卫牌选择器 -->
        </div>
        <button class="btn btn-gold" id="confirmGuardCard" style="margin-top: 10px; width: 100%; font-size: 12px; padding: 8px;"
                onclick="firstClimberSystem.confirmGuardCard()">
          确认守卫牌
        </button>
      </div>
      
      <div class="panel-section">
        <div style="color: #888; font-size: 12px; margin-bottom: 8px;">⚡ 激怒牌干扰</div>
        <div class="anger-cards-area" id="angerCardsArea">
          <!-- 动态生成激怒牌 -->
        </div>
      </div>
    `;
    
    document.body.appendChild(panel);
    
    requestAnimationFrame(() => {
      panel.classList.add('active');
    });
  }

  /**
   * 初始化守卫控制
   */
  initGuardControl() {
    const area = document.getElementById('guardControlArea');
    if (!area) return;
    
    const suits = ['♠', '♥', '♣', '♦'];
    const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    
    area.innerHTML = '';
    
    // 生成守卫牌选择器
    suits.forEach(suit => {
      ranks.forEach(rank => {
        const selector = document.createElement('div');
        selector.className = 'guard-card-selector';
        selector.dataset.suit = suit;
        selector.dataset.rank = rank;
        selector.innerHTML = `
          <span style="color: ${this.isRed(suit) ? '#d00' : '#000'}; font-size: 16px;">${suit}</span>
          <span style="color: ${this.isRed(suit) ? '#d00' : '#000'}; font-size: 14px;">${rank}</span>
        `;
        selector.addEventListener('click', () => this.selectGuardCard(selector, suit, rank));
        area.appendChild(selector);
      });
    });
  }

  /**
   * 选择守卫牌
   */
  selectGuardCard(element, suit, rank) {
    // 移除其他选中状态
    document.querySelectorAll('.guard-card-selector').forEach(el => {
      el.classList.remove('selected');
    });
    
    // 添加选中状态
    element.classList.add('selected');
    
    this.selectedGuardCard = { suit, rank };
  }

  /**
   * 确认守卫牌
   */
  confirmGuardCard() {
    if (!this.selectedGuardCard) {
      this.showToast('请先选择一张守卫牌！', 'warning');
      return;
    }
    
    // 发送守卫牌选择到服务器
    const event = new CustomEvent('firstclimber:guardSelected', {
      detail: this.selectedGuardCard
    });
    document.dispatchEvent(event);
    
    this.showToast(`守卫牌已设置为 ${this.selectedGuardCard.suit}${this.selectedGuardCard.rank}`, 'success');
    
    // 在守卫区域显示控制指示器
    const guardAvatar = document.getElementById('guardAvatar');
    if (guardAvatar) {
      let indicator = guardAvatar.querySelector('.guard-control-indicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'guard-control-indicator';
        indicator.textContent = '首登者控制中';
        guardAvatar.appendChild(indicator);
      }
      indicator.classList.add('active');
    }
  }

  /**
   * 初始化激怒牌
   */
  initAngerCards() {
    this.angerCardsAvailable = [
      { id: 'anger_1', name: '激怒·降层', icon: '⬇️', desc: '让目标玩家下降一层', cooldown: 3, currentCooldown: 0 },
      { id: 'anger_2', name: '激怒·换牌', icon: '🔄', desc: '强制目标玩家换牌', cooldown: 2, currentCooldown: 0 },
      { id: 'anger_3', name: '激怒·禁手', icon: '🚫', desc: '目标玩家下轮无法出牌', cooldown: 4, currentCooldown: 0 },
      { id: 'anger_4', name: '激怒·混乱', icon: '🌀', desc: '随机打乱目标手牌', cooldown: 2, currentCooldown: 0 }
    ];
    
    this.updateAngerCardsUI();
  }

  /**
   * 更新激怒牌UI
   */
  updateAngerCardsUI() {
    const area = document.getElementById('angerCardsArea');
    if (!area) return;
    
    area.innerHTML = '';
    
    this.angerCardsAvailable.forEach(card => {
      const btn = document.createElement('div');
      btn.className = `anger-card-btn ${card.currentCooldown > 0 ? 'cooldown' : ''}`;
      btn.innerHTML = `
        <span class="anger-icon">${card.icon}</span>
        <div class="anger-info">
          <div class="anger-name">${card.name}</div>
          <div class="anger-desc">${card.desc}</div>
        </div>
        ${card.currentCooldown > 0 ? `
          <span class="anger-cooldown">${card.currentCooldown}轮</span>
        ` : ''}
      `;
      
      if (card.currentCooldown === 0) {
        btn.addEventListener('click', () => this.useAngerCard(card));
      }
      
      area.appendChild(btn);
    });
  }

  /**
   * 使用激怒牌
   */
  useAngerCard(card) {
    // 显示玩家选择列表
    this.showTargetPlayerSelection(card);
  }

  /**
   * 显示目标玩家选择
   */
  showTargetPlayerSelection(card) {
    const modal = document.createElement('div');
    modal.className = 'card-comparison-modal';
    modal.innerHTML = `
      <div class="comparison-container" style="flex-direction: column; max-width: 300px;">
        <h3 style="color: #ffd700; margin-bottom: 15px;">选择干扰目标</h3>
        <p style="color: #888; font-size: 12px; margin-bottom: 15px;">使用 ${card.name} - ${card.desc}</p>
        <div class="target-player-list" id="targetPlayerList">
          <!-- 动态生成玩家列表 -->
        </div>
        <button class="btn btn-secondary" onclick="this.closest('.card-comparison-modal').remove()" style="margin-top: 15px;">
          取消
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('active'));
    
    // 生成玩家列表
    const list = modal.querySelector('#targetPlayerList');
    
    if (window.gameState && window.gameState.players) {
      Object.entries(window.gameState.players).forEach(([pid, player]) => {
        if (pid === window.playerId) return; // 跳过自己
        
        const item = document.createElement('div');
        item.className = 'target-player-item';
        item.innerHTML = `
          <div class="player-avatar-small" style="border-color: ${this.getPlayerColor(pid)};">${player.avatar || '🤖'}</div>
          <div class="player-info">
            <div class="player-name">${player.name}</div>
            <div class="player-level">层数: ${window.LEVEL_NAMES ? window.LEVEL_NAMES[player.level - 1] : player.level}/A</div>
          </div>
        `;
        item.addEventListener('click', () => {
          this.confirmAngerCardUse(card, pid, player.name);
          modal.remove();
        });
        list.appendChild(item);
      });
    }
  }

  /**
   * 确认使用激怒牌
   */
  confirmAngerCardUse(card, targetId, targetName) {
    // 设置冷却
    card.currentCooldown = card.cooldown;
    this.updateAngerCardsUI();
    
    // 发送事件
    const event = new CustomEvent('firstclimber:angerCardUsed', {
      detail: { card, targetId, targetName }
    });
    document.dispatchEvent(event);
    
    // 显示提示
    this.showToast(`已对 ${targetName} 使用 ${card.name}！`, 'success');
    this.showInterferenceToast(targetName, card.name);
    
    // 减少冷却
    this.startCooldownTimer();
  }

  /**
   * 启动冷却计时器
   */
  startCooldownTimer() {
    if (this.cooldownTimer) return;
    
    this.cooldownTimer = setInterval(() => {
      let hasCooldown = false;
      
      this.angerCardsAvailable.forEach(card => {
        if (card.currentCooldown > 0) {
          card.currentCooldown--;
          hasCooldown = true;
        }
      });
      
      this.updateAngerCardsUI();
      
      if (!hasCooldown) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
      }
    }, 10000); // 每10秒减少一次冷却（模拟一轮）
  }

  /**
   * 显示干扰效果提示
   */
  showInterferenceToast(targetName, cardName) {
    const toast = document.createElement('div');
    toast.className = 'interference-toast';
    toast.textContent = `⚡ ${targetName} 被 ${cardName} 干扰！`;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.classList.add('active');
    });
    
    setTimeout(() => {
      toast.classList.remove('active');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  /**
   * 显示通用提示
   */
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      bottom: 100px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? 'linear-gradient(135deg, #00d4aa, #00a884)' : type === 'warning' ? 'linear-gradient(135deg, #ffaa00, #ff8800)' : 'linear-gradient(135deg, #667eea, #764ba2)'};
      color: #fff;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10003;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  /**
   * 获取玩家颜色
   */
  getPlayerColor(pid) {
    if (pid === window.playerId) return '#0f0';
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d'];
    return colors[Math.abs(pid.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length];
  }

  /**
   * 辅助函数
   */
  isRed(suit) {
    return suit === '♥' || suit === '♦';
  }

  /**
   * 隐藏控制面板
   */
  hideControlPanel() {
    const panel = document.getElementById('firstClimberPanel');
    if (panel) {
      panel.classList.remove('active');
    }
  }

  /**
   * 重置系统
   */
  reset() {
    this.firstClimber = null;
    this.isFirstClimber = false;
    this.selectedGuardCard = null;
    
    if (this.cooldownTimer) {
      clearInterval(this.cooldownTimer);
      this.cooldownTimer = null;
    }
    
    // 移除UI元素
    const panel = document.getElementById('firstClimberPanel');
    if (panel) panel.remove();
    
    document.querySelectorAll('.first-climber-badge').forEach(badge => badge.remove());
  }
}

// 创建全局实例
window.FirstClimberSystem = FirstClimberSystem;
window.firstClimberSystem = new FirstClimberSystem();
