/**
 * 命运塔 - 动画增强系统
 * Tower of Fate - Animation Enhancement System
 * 
 * 功能：出牌动画、晋级动画、被攻击动画等
 */

class AnimationSystem {
  constructor() {
    this.isAnimating = false;
    this.animationQueue = [];
    this.initStyles();
  }

  /**
   * 初始化动画样式
   */
  initStyles() {
    if (document.getElementById('animation-styles')) return;

    const style = document.createElement('style');
    style.id = 'animation-styles';
    style.textContent = `
      /* 出牌飞行动画 */
      @keyframes cardFlyToGuard {
        0% {
          transform: translate(0, 0) scale(1) rotate(0deg);
          opacity: 1;
        }
        30% {
          transform: translate(30px, -50px) scale(1.1) rotate(-5deg);
          opacity: 1;
        }
        100% {
          transform: translate(var(--target-x), var(--target-y)) scale(0.6) rotate(0deg);
          opacity: 0;
        }
      }
      
      .card-flying {
        position: fixed !important;
        z-index: 10000 !important;
        pointer-events: none !important;
        animation: cardFlyToGuard 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }

      /* 守卫牌翻转动画 */
      @keyframes guardCardFlip {
        0% {
          transform: rotateY(0deg);
        }
        50% {
          transform: rotateY(90deg);
        }
        100% {
          transform: rotateY(0deg);
        }
      }
      
      .guard-flip-container {
        perspective: 1000px;
      }
      
      .guard-flip-card {
        position: relative;
        width: 100%;
        height: 100%;
        transform-style: preserve-3d;
        animation: guardCardFlip 0.8s ease-in-out;
      }
      
      .guard-card-front, .guard-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border-radius: 10px;
      }
      
      .guard-card-back {
        background: linear-gradient(135deg, #4a0080, #2a0040);
        transform: rotateY(180deg);
      }
      
      .guard-card-front {
        background: linear-gradient(135deg, #2a2a4a, #1a1a3e);
        transform: rotateY(0deg);
      }

      /* 晋级动画 - 头像上升 */
      @keyframes levelUpFloat {
        0% {
          transform: translateX(-50%) scale(1);
          filter: brightness(1);
        }
        50% {
          transform: translateX(-50%) scale(1.3);
          filter: brightness(1.5) drop-shadow(0 0 20px gold);
        }
        100% {
          transform: translateX(-50%) scale(1);
          filter: brightness(1);
        }
      }
      
      .level-up-animation {
        animation: levelUpFloat 0.8s ease-out;
      }
      
      @keyframes levelUpDouble {
        0% {
          transform: translateX(-50%) scale(1);
          filter: brightness(1);
        }
        25% {
          transform: translateX(-50%) scale(1.4) translateY(-20px);
          filter: brightness(1.8) drop-shadow(0 0 30px gold);
        }
        50% {
          transform: translateX(-50%) scale(1.2) translateY(-10px);
          filter: brightness(1.5) drop-shadow(0 0 25px orange);
        }
        75% {
          transform: translateX(-50%) scale(1.3) translateY(-15px);
          filter: brightness(1.6) drop-shadow(0 0 28px gold);
        }
        100% {
          transform: translateX(-50%) scale(1);
          filter: brightness(1);
        }
      }
      
      .level-up-double-animation {
        animation: levelUpDouble 1.2s ease-out;
      }

      /* 层数数字跳动效果 */
      @keyframes numberPop {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.5);
          color: #ffd700;
          text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
        }
        100% {
          transform: scale(1);
        }
      }
      
      .number-pop {
        animation: numberPop 0.4s ease-out;
        display: inline-block;
      }

      /* 被攻击动画 - 警告 */
      @keyframes angerWarning {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(255, 0, 0, 0);
          border-color: #ffd700;
        }
        25% {
          box-shadow: 0 0 30px 10px rgba(255, 0, 0, 0.6);
          border-color: #ff0000;
        }
        50% {
          box-shadow: 0 0 50px 20px rgba(255, 0, 0, 0.8);
          border-color: #ff3333;
        }
        75% {
          box-shadow: 0 0 30px 10px rgba(255, 0, 0, 0.6);
          border-color: #ff0000;
        }
      }
      
      .anger-warning {
        animation: angerWarning 0.8s ease-in-out 3;
      }

      /* 头像下降动画 */
      @keyframes avatarFall {
        0% {
          transform: translateX(-50%) translateY(0);
          filter: brightness(1);
        }
        30% {
          transform: translateX(-50%) translateY(10px);
          filter: brightness(0.5);
        }
        50% {
          transform: translateX(-50%) translateY(5px);
          filter: brightness(0.7);
        }
        70% {
          transform: translateX(-50%) translateY(8px);
          filter: brightness(0.6);
        }
        100% {
          transform: translateX(-50%) translateY(0);
          filter: brightness(1);
        }
      }
      
      .avatar-fall {
        animation: avatarFall 0.6s ease-out;
      }

      /* 红色闪烁警告效果 */
      @keyframes redFlash {
        0%, 100% {
          background-color: transparent;
        }
        50% {
          background-color: rgba(255, 0, 0, 0.3);
        }
      }
      
      .red-flash-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        animation: redFlash 0.3s ease-in-out 4;
      }

      /* 首登者特效 */
      @keyframes firstClimberEffect {
        0% {
          box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.8);
        }
        50% {
          box-shadow: 0 0 50px 25px rgba(255, 215, 0, 0.4);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(255, 215, 0, 0);
        }
      }
      
      .first-climber {
        border: 3px solid #ffd700 !important;
        animation: firstClimberEffect 2s ease-in-out infinite;
      }

      /* 对比弹窗增强 */
      .card-comparison-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.9);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      
      .card-comparison-modal.active {
        opacity: 1;
      }
      
      .comparison-container {
        display: flex;
        align-items: center;
        gap: 40px;
        padding: 40px;
        background: linear-gradient(135deg, #1a1a3e, #0d1b2a);
        border-radius: 20px;
        border: 3px solid #ffd700;
        transform: scale(0.8);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      
      .card-comparison-modal.active .comparison-container {
        transform: scale(1);
      }

      /* 匹配成功特效 */
      @keyframes matchSuccess {
        0% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(0, 255, 0, 0.8);
        }
        50% {
          transform: scale(1.1);
          box-shadow: 0 0 30px 15px rgba(0, 255, 0, 0.5);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 0 0 0 rgba(0, 255, 0, 0);
        }
      }
      
      .match-success {
        animation: matchSuccess 0.6s ease-out;
      }

      /* 匹配失败特效 */
      @keyframes matchFail {
        0%, 100% {
          transform: translateX(0);
        }
        20% {
          transform: translateX(-10px);
        }
        40% {
          transform: translateX(10px);
        }
        60% {
          transform: translateX(-10px);
        }
        80% {
          transform: translateX(10px);
        }
      }
      
      .match-fail {
        animation: matchFail 0.5s ease-in-out;
        border-color: #ff0000 !important;
      }

      /* 粒子效果容器 */
      .particles-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 10002;
      }
      
      .particle {
        position: absolute;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        pointer-events: none;
      }

      /* 游戏结束结算界面 */
      .game-end-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(180deg, rgba(10, 10, 26, 0.98), rgba(26, 26, 62, 0.98));
        z-index: 10003;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.5s ease;
      }
      
      .game-end-modal.active {
        opacity: 1;
      }
      
      .game-end-content {
        text-align: center;
        padding: 40px;
        max-width: 600px;
        width: 90%;
      }
      
      .victory-title {
        font-size: 4em;
        background: linear-gradient(45deg, #ffd700, #ff6b6b, #ffd700);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: float 2s ease-in-out infinite;
        margin-bottom: 20px;
      }
      
      .defeat-title {
        font-size: 4em;
        color: #666;
        margin-bottom: 20px;
      }
      
      .score-display {
        font-size: 3em;
        color: #ffd700;
        margin: 20px 0;
        text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
      }
      
      .rank-display {
        font-size: 1.5em;
        color: #fff;
        margin: 15px 0;
      }
      
      .rewards-container {
        display: flex;
        gap: 20px;
        justify-content: center;
        margin: 30px 0;
        flex-wrap: wrap;
      }
      
      .reward-item {
        padding: 15px 25px;
        background: rgba(255, 215, 0, 0.1);
        border: 2px solid #ffd700;
        border-radius: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 1.2em;
        animation: pulse 2s ease-in-out infinite;
      }

      /* 分享按钮 */
      .share-btn {
        padding: 15px 40px;
        font-size: 1.2em;
        background: linear-gradient(45deg, #1DA1F2, #0d8ecf);
        border: none;
        border-radius: 30px;
        color: white;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        margin: 10px;
      }
      
      .share-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 10px 30px rgba(29, 161, 242, 0.4);
      }

      /* 进度条动画 */
      @keyframes progressFill {
        from {
          width: 0;
        }
      }
      
      .progress-bar-fill {
        animation: progressFill 1s ease-out forwards;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * 出牌飞行动画
   */
  async animateCardPlay(cardElement, targetElement) {
    return new Promise((resolve) => {
      const cardRect = cardElement.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      
      // 创建飞行卡片克隆
      const flyingCard = cardElement.cloneNode(true);
      flyingCard.classList.add('card-flying');
      
      // 计算目标位置
      const targetX = targetRect.left + targetRect.width / 2 - cardRect.left - cardRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2 - cardRect.top - cardRect.height / 2;
      
      flyingCard.style.setProperty('--target-x', `${targetX}px`);
      flyingCard.style.setProperty('--target-y', `${targetY}px`);
      flyingCard.style.left = `${cardRect.left}px`;
      flyingCard.style.top = `${cardRect.top}px`;
      flyingCard.style.width = `${cardRect.width}px`;
      flyingCard.style.height = `${cardRect.height}px`;
      
      document.body.appendChild(flyingCard);
      
      // 动画结束清理
      flyingCard.addEventListener('animationend', () => {
        flyingCard.remove();
        resolve();
      });
    });
  }

  /**
   * 守卫牌翻转动画
   */
  async animateGuardReveal(guardElement, suit, rank) {
    return new Promise((resolve) => {
      guardElement.classList.add('guard-flip-container');
      
      const flipCard = document.createElement('div');
      flipCard.className = 'guard-flip-card';
      flipCard.innerHTML = `
        <div class="guard-card-back">
          <span style="font-size: 40px;">🛡️</span>
        </div>
        <div class="guard-card-front">
          <div style="font-size: 32px; color: ${this.isRed(suit) ? '#d00' : '#000'};">${suit}</div>
          <div style="font-size: 28px; color: ${this.isRed(suit) ? '#d00' : '#000'};">${rank}</div>
        </div>
      `;
      
      guardElement.innerHTML = '';
      guardElement.appendChild(flipCard);
      
      flipCard.addEventListener('animationend', () => {
        guardElement.classList.remove('guard-flip-container');
        guardElement.innerHTML = `
          <div class="guard-suit" style="color: ${this.isRed(suit) ? '#d00' : '#000'}">${suit}</div>
          <div class="guard-rank" style="color: ${this.isRed(suit) ? '#d00' : '#000'}">${rank}</div>
        `;
        guardElement.classList.add('revealed');
        resolve();
      });
    });
  }

  /**
   * 显示对比弹窗
   */
  showComparisonModal(playerCard, guardCard, result, playerName = '你') {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'card-comparison-modal';
      
      const isSuccess = result === 'perfect_match' || result === 'suit_match' || result === 'number_match';
      const resultText = {
        'perfect_match': '🎉 完美匹配！',
        'suit_match': '✅ 花色匹配！',
        'number_match': '✅ 点数匹配！',
        'fail': '❌ 匹配失败'
      }[result] || '❌ 匹配失败';
      
      const resultColor = isSuccess ? '#0f0' : '#f00';
      
      modal.innerHTML = `
        <div class="comparison-container">
          <div class="comparison-side">
            <p style="color: #888; margin-bottom: 10px;">${playerName}</p>
            <div class="comparison-card-large ${isSuccess ? 'match-success' : 'match-fail'}" 
                 style="width: 100px; height: 140px; background: #fff; border-radius: 12px; 
                        display: flex; flex-direction: column; align-items: center; justify-content: center;
                        border: 3px solid ${isSuccess ? '#0f0' : '#f00'};
                        box-shadow: 0 0 30px ${isSuccess ? 'rgba(0,255,0,0.5)' : 'rgba(255,0,0,0.3)'};">
              <div style="font-size: 36px; color: ${this.isRed(playerCard.suit) ? '#d00' : '#000'};">${playerCard.suit}</div>
              <div style="font-size: 32px; color: ${this.isRed(playerCard.suit) ? '#d00' : '#000'};">${playerCard.rank}</div>
            </div>
          </div>
          
          <div style="text-align: center;">
            <div style="font-size: 36px; color: #ffd700; font-weight: bold;">VS</div>
            <div style="margin-top: 20px; font-size: 24px; color: ${resultColor}; font-weight: bold;">
              ${resultText}
            </div>
          </div>
          
          <div class="comparison-side">
            <p style="color: #888; margin-bottom: 10px;">守卫</p>
            <div class="comparison-card-large" 
                 style="width: 100px; height: 140px; background: linear-gradient(135deg, #4a0080, #2a0040); 
                        border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center;
                        border: 3px solid #ffd700; box-shadow: 0 0 20px rgba(255,215,0,0.5);">
              <div style="font-size: 36px; color: ${this.isRed(guardCard.suit) ? '#d00' : '#000'};">${guardCard.suit}</div>
              <div style="font-size: 32px; color: ${this.isRed(guardCard.suit) ? '#d00' : '#000'};">${guardCard.rank}</div>
            </div>
          </div>
        </div>
      `;
      
      document.body.appendChild(modal);
      
      // 触发显示动画
      requestAnimationFrame(() => {
        modal.classList.add('active');
      });
      
      // 自动关闭
      setTimeout(() => {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
          resolve();
        }, 300);
      }, 2000);
      
      // 点击关闭
      modal.addEventListener('click', () => {
        modal.classList.remove('active');
        setTimeout(() => {
          modal.remove();
          resolve();
        }, 300);
      });
    });
  }

  /**
   * 晋级动画
   */
  async animateLevelUp(avatarElement, levels = 1) {
    return new Promise((resolve) => {
      const animationClass = levels >= 2 ? 'level-up-double-animation' : 'level-up-animation';
      avatarElement.classList.add(animationClass);
      
      // 创建粒子效果
      this.createParticles(avatarElement, levels >= 2 ? 'gold' : 'green');
      
      avatarElement.addEventListener('animationend', () => {
        avatarElement.classList.remove(animationClass);
        resolve();
      }, { once: true });
    });
  }

  /**
   * 层数数字跳动效果
   */
  animateNumberChange(element, newValue) {
    element.classList.add('number-pop');
    element.textContent = newValue;
    
    element.addEventListener('animationend', () => {
      element.classList.remove('number-pop');
    }, { once: true });
  }

  /**
   * 激怒牌警告动画
   */
  async animateAngerWarning(avatarElement) {
    return new Promise((resolve) => {
      // 红色闪烁覆盖层
      const flashOverlay = document.createElement('div');
      flashOverlay.className = 'red-flash-overlay';
      document.body.appendChild(flashOverlay);
      
      // 头像警告效果
      avatarElement.classList.add('anger-warning');
      
      setTimeout(() => {
        flashOverlay.remove();
        avatarElement.classList.remove('anger-warning');
        resolve();
      }, 2400);
    });
  }

  /**
   * 头像下降动画
   */
  async animateAvatarFall(avatarElement) {
    return new Promise((resolve) => {
      avatarElement.classList.add('avatar-fall');
      
      avatarElement.addEventListener('animationend', () => {
        avatarElement.classList.remove('avatar-fall');
        resolve();
      }, { once: true });
    });
  }

  /**
   * 创建粒子效果
   */
  createParticles(sourceElement, color = 'gold') {
    const rect = sourceElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const colors = {
      'gold': ['#ffd700', '#ffaa00', '#ffcc00'],
      'green': ['#00ff00', '#00aa00', '#88ff88'],
      'red': ['#ff0000', '#aa0000', '#ff4444']
    }[color] || ['#ffd700'];
    
    const container = document.createElement('div');
    container.className = 'particles-container';
    document.body.appendChild(container);
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      
      const angle = (Math.PI * 2 * i) / 20;
      const velocity = 50 + Math.random() * 100;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      particle.style.setProperty('--tx', `${tx}px`);
      particle.style.setProperty('--ty', `${ty}px`);
      
      particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0)`, opacity: 0 }
      ], {
        duration: 800 + Math.random() * 400,
        easing: 'cubic-bezier(0, .9, .57, 1)',
        fill: 'forwards'
      });
      
      container.appendChild(particle);
    }
    
    setTimeout(() => container.remove(), 1500);
  }

  /**
   * 设置首登者效果
   */
  setFirstClimber(avatarElement) {
    avatarElement.classList.add('first-climber');
    this.createParticles(avatarElement, 'gold');
  }

  /**
   * 显示游戏结束界面
   */
  showGameEndModal(result) {
    const { isVictory, score, rank, rewards, playerName } = result;
    
    const modal = document.createElement('div');
    modal.className = 'game-end-modal';
    modal.id = 'gameEndModal';
    
    const title = isVictory ? 
      '<div class="victory-title">🏆 胜利!</div>' : 
      '<div class="defeat-title">💔 失败</div>';
    
    const rewardsHtml = rewards ? rewards.map(r => `
      <div class="reward-item">
        <span style="font-size: 24px;">${r.icon}</span>
        <span>+${r.amount} ${r.name}</span>
      </div>
    `).join('') : '';
    
    modal.innerHTML = `
      <div class="game-end-content">
        ${title}
        <p style="font-size: 1.2em; color: #888;">${playerName || '玩家'}</p>
        
        <div class="score-display">
          ${score} 分
        </div>
        
        <div class="rank-display">
          排名: 第 ${rank || 1} 名
        </div>
        
        ${rewardsHtml ? `
          <div style="margin: 20px 0;">
            <p style="color: #ffd700; margin-bottom: 15px;">获得奖励</p>
            <div class="rewards-container">
              ${rewardsHtml}
            </div>
          </div>
        ` : ''}
        
        <div style="margin-top: 30px;">
          <button class="btn btn-gold" onclick="animationSystem.playAgain()" style="margin: 10px;">
            🎮 再来一局
          </button>
          <button class="btn btn-secondary" onclick="animationSystem.backToMenu()" style="margin: 10px;">
            📋 返回主菜单
          </button>
        </div>
        
        <button class="share-btn" onclick="animationSystem.shareResult()">
          <span>📤</span>
          <span>分享战绩</span>
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    requestAnimationFrame(() => {
      modal.classList.add('active');
    });
    
    // 胜利时放烟花
    if (isVictory) {
      this.createFireworks();
    }
  }

  /**
   * 创建烟花效果
   */
  createFireworks() {
    const colors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#ffe66d', '#ff9f40'];
    
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const x = 20 + Math.random() * 60;
        const y = 20 + Math.random() * 40;
        this.createFirework(x, y, colors[Math.floor(Math.random() * colors.length)]);
      }, i * 300);
    }
  }

  createFirework(x, y, color) {
    const container = document.createElement('div');
    container.className = 'particles-container';
    document.body.appendChild(container);
    
    const centerX = window.innerWidth * (x / 100);
    const centerY = window.innerHeight * (y / 100);
    
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.backgroundColor = color;
      particle.style.left = `${centerX}px`;
      particle.style.top = `${centerY}px`;
      particle.style.width = '6px';
      particle.style.height = '6px';
      
      const angle = (Math.PI * 2 * i) / 30;
      const velocity = 80 + Math.random() * 60;
      const tx = Math.cos(angle) * velocity;
      const ty = Math.sin(angle) * velocity;
      
      particle.animate([
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        { transform: `translate(${tx}px, ${ty}px) scale(0.5)`, opacity: 0.8, offset: 0.7 },
        { transform: `translate(${tx * 1.2}px, ${ty * 1.2 + 50}px) scale(0)`, opacity: 0 }
      ], {
        duration: 1200,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
      });
      
      container.appendChild(particle);
    }
    
    setTimeout(() => container.remove(), 1500);
  }

  /**
   * 再来一局
   */
  playAgain() {
    const modal = document.getElementById('gameEndModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 500);
    }
    
    // 触发自定义事件
    const event = new CustomEvent('game:playAgain');
    document.dispatchEvent(event);
  }

  /**
   * 返回主菜单
   */
  backToMenu() {
    const modal = document.getElementById('gameEndModal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 500);
    }
    
    const event = new CustomEvent('game:backToMenu');
    document.dispatchEvent(event);
  }

  /**
   * 分享战绩
   */
  shareResult() {
    const text = `我在命运塔游戏中获得了高分！快来挑战我吧！🏰✨`;
    
    if (navigator.share) {
      navigator.share({
        title: '命运塔 - Tower of Fate',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(text + ' ' + window.location.href);
      alert('📋 战绩已复制到剪贴板！');
    }
    
    const event = new CustomEvent('game:share');
    document.dispatchEvent(event);
  }

  /**
   * 辅助函数
   */
  isRed(suit) {
    return suit === '♥' || suit === '♦';
  }
}

// 创建全局实例
window.AnimationSystem = AnimationSystem;
window.animationSystem = new AnimationSystem();
