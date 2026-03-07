/**
 * 命运塔 - 新手引导系统
 * Tower of Fate - Tutorial System
 * 
 * 功能：为首次进入游戏的玩家提供分步骤引导
 * Features: Step-by-step guidance for first-time players
 */

class TutorialSystem {
  constructor(options = {}) {
    // 引导步骤配置
    this.steps = [
      {
        id: 'welcome',
        title: '欢迎来到命运塔',
        content: '命运的齿轮开始转动，你将踏上挑战命运塔的征程。在这里，你将用智慧和勇气击败守卫，登顶巅峰！',
        target: null,
        position: 'center'
      },
      {
        id: 'hand-cards',
        title: '这是你的手牌',
        content: '你拥有一副52张的扑克牌（去掉大小王）。每张牌的点数就是你的战斗力，合理运用它们来击败守卫！',
        target: '.player-hand',
        position: 'bottom'
      },
      {
        id: 'play-card',
        title: '点击出牌与守卫比大小',
        content: '点击你要出的牌，与守卫比拼点数。点数大的一方获胜，胜者将给予对方伤害！',
        target: '.play-area',
        position: 'center'
      },
      {
        id: 'anger-card',
        title: '激怒牌会触发特殊效果',
        content: '当心！某些守卫被特定点数激怒时，会触发强力技能。观察守卫状态，谨慎出牌！',
        target: '.guard-status',
        position: 'left'
      },
      {
        id: 'defeat-guard',
        title: '击败所有守卫登顶',
        content: '每一层都有强大的守卫把守。击败当前层的守卫，你就能向上攀登一层。直到登顶命运塔！',
        target: '.tower-map',
        position: 'right'
      },
      {
        id: 'shop',
        title: '使用商店购买道具',
        content: '战斗间隙，你可以在商店购买强力道具和遗物。它们会成为你登顶路上的得力助手！',
        target: '.shop-button',
        position: 'left'
      },
      {
        id: 'start-battle',
        title: '开始你的第一场对战',
        content: '准备就绪！点击下方按钮开始你的第一场战斗。祝你好运，勇士！',
        target: '.start-battle-btn',
        position: 'top'
      }
    ];

    // 当前步骤索引
    this.currentStep = 0;
    
    // 本地存储键名
    this.storageKey = 'tower_of_fate_tutorial_completed';
    
    // 配置选项
    this.options = {
      overlayOpacity: 0.75,
      highlightPadding: 8,
      animationDuration: 300,
      zIndex: 9999,
      ...options
    };

    // DOM 元素引用
    this.elements = {};
    
    // 状态
    this.isActive = false;
    
    this.init();
  }

  /**
   * 初始化引导系统
   */
  init() {
    // 检查是否已完成引导
    if (this.hasCompletedTutorial()) {
      return;
    }
    
    // 等待 DOM 加载完成
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      // 延迟一点开始，确保游戏界面已渲染
      setTimeout(() => this.start(), 500);
    }
  }

  /**
   * 检查是否已完成引导
   */
  hasCompletedTutorial() {
    try {
      return localStorage.getItem(this.storageKey) === 'true';
    } catch (e) {
      console.warn('Tutorial: localStorage 不可用');
      return false;
    }
  }

  /**
   * 标记引导完成
   */
  markTutorialCompleted() {
    try {
      localStorage.setItem(this.storageKey, 'true');
    } catch (e) {
      console.warn('Tutorial: 无法保存引导状态');
    }
  }

  /**
   * 重置引导状态（用于测试）
   */
  resetTutorial() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {
      console.warn('Tutorial: 无法重置引导状态');
    }
  }

  /**
   * 开始引导
   */
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    this.currentStep = 0;
    this.createOverlay();
    this.createTooltip();
    this.createSkipButton();
    this.showStep(0);
    
    // 发布事件
    this.emit('tutorial:start');
  }

  /**
   * 创建遮罩层
   */
  createOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.innerHTML = `
      <div class="tutorial-mask tutorial-mask-top"></div>
      <div class="tutorial-mask tutorial-mask-right"></div>
      <div class="tutorial-mask tutorial-mask-bottom"></div>
      <div class="tutorial-mask tutorial-mask-left"></div>
      <div class="tutorial-highlight"></div>
    `;
    
    Object.assign(overlay.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: this.options.zIndex.toString(),
      pointerEvents: 'none'
    });

    // 添加遮罩样式
    const masks = overlay.querySelectorAll('.tutorial-mask');
    masks.forEach(mask => {
      Object.assign(mask.style, {
        position: 'absolute',
        backgroundColor: `rgba(0, 0, 0, ${this.options.overlayOpacity})`,
        transition: `all ${this.options.animationDuration}ms ease`
      });
    });

    // 高亮框样式
    const highlight = overlay.querySelector('.tutorial-highlight');
    Object.assign(highlight.style, {
      position: 'absolute',
      border: '3px solid #ffd700',
      borderRadius: '8px',
      boxShadow: '0 0 20px rgba(255, 215, 0, 0.5), inset 0 0 20px rgba(255, 215, 0, 0.1)',
      transition: `all ${this.options.animationDuration}ms ease`,
      pointerEvents: 'none'
    });

    document.body.appendChild(overlay);
    this.elements.overlay = overlay;
    this.elements.masks = masks;
    this.elements.highlight = highlight;
  }

  /**
   * 创建提示框
   */
  createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'tutorial-tooltip';
    tooltip.innerHTML = `
      <div class="tutorial-header">
        <h3 class="tutorial-title"></h3>
        <span class="tutorial-step-counter"></span>
      </div>
      <div class="tutorial-content"></div>
      <div class="tutorial-actions">
        <button class="tutorial-btn tutorial-btn-prev">上一步</button>
        <button class="tutorial-btn tutorial-btn-next">下一步</button>
        <button class="tutorial-btn tutorial-btn-finish" style="display:none">开始游戏</button>
      </div>
    `;

    Object.assign(tooltip.style, {
      position: 'fixed',
      maxWidth: '400px',
      backgroundColor: '#1a1a2e',
      border: '2px solid #ffd700',
      borderRadius: '12px',
      padding: '20px',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.2)',
      zIndex: (this.options.zIndex + 1).toString(),
      transition: `all ${this.options.animationDuration}ms ease`,
      opacity: '0',
      transform: 'translateY(10px)'
    });

    // 添加样式类
    const style = document.createElement('style');
    style.textContent = `
      .tutorial-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        border-bottom: 1px solid rgba(255, 215, 0, 0.3);
        padding-bottom: 10px;
      }
      .tutorial-title {
        margin: 0;
        font-size: 18px;
        color: #ffd700;
        font-weight: 600;
      }
      .tutorial-step-counter {
        font-size: 12px;
        color: #888;
        background: rgba(255, 215, 0, 0.1);
        padding: 2px 8px;
        border-radius: 10px;
      }
      .tutorial-content {
        font-size: 14px;
        line-height: 1.6;
        color: #e0e0e0;
        margin-bottom: 20px;
      }
      .tutorial-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }
      .tutorial-btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      }
      .tutorial-btn-prev {
        background: transparent;
        color: #888;
        border: 1px solid #444;
      }
      .tutorial-btn-prev:hover:not(:disabled) {
        color: #fff;
        border-color: #666;
      }
      .tutorial-btn-prev:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .tutorial-btn-next, .tutorial-btn-finish {
        background: linear-gradient(135deg, #ffd700, #ffaa00);
        color: #1a1a2e;
      }
      .tutorial-btn-next:hover, .tutorial-btn-finish:hover {
        background: linear-gradient(135deg, #ffea00, #ffcc00);
        transform: translateY(-1px);
      }
      .tutorial-btn-finish {
        background: linear-gradient(135deg, #00d4aa, #00a884) !important;
        color: #fff !important;
      }
      .tutorial-skip {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 6px;
        color: #888;
        font-size: 13px;
        cursor: pointer;
        z-index: ${this.options.zIndex + 2};
        transition: all 0.2s ease;
      }
      .tutorial-skip:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
      @keyframes tutorial-pulse {
        0%, 100% { box-shadow: 0 0 20px rgba(255, 215, 0, 0.5); }
        50% { box-shadow: 0 0 40px rgba(255, 215, 0, 0.8); }
      }
      .tutorial-highlight.active {
        animation: tutorial-pulse 2s infinite;
      }
    `;
    document.head.appendChild(style);

    // 绑定按钮事件
    const prevBtn = tooltip.querySelector('.tutorial-btn-prev');
    const nextBtn = tooltip.querySelector('.tutorial-btn-next');
    const finishBtn = tooltip.querySelector('.tutorial-btn-finish');

    prevBtn.addEventListener('click', () => this.prevStep());
    nextBtn.addEventListener('click', () => this.nextStep());
    finishBtn.addEventListener('click', () => this.finish());

    document.body.appendChild(tooltip);
    this.elements.tooltip = tooltip;
    this.elements.title = tooltip.querySelector('.tutorial-title');
    this.elements.content = tooltip.querySelector('.tutorial-content');
    this.elements.counter = tooltip.querySelector('.tutorial-step-counter');
    this.elements.prevBtn = prevBtn;
    this.elements.nextBtn = nextBtn;
    this.elements.finishBtn = finishBtn;
  }

  /**
   * 创建跳过按钮
   */
  createSkipButton() {
    const skipBtn = document.createElement('button');
    skipBtn.className = 'tutorial-skip';
    skipBtn.textContent = '跳过引导';
    skipBtn.addEventListener('click', () => this.skip());
    document.body.appendChild(skipBtn);
    this.elements.skipBtn = skipBtn;
  }

  /**
   * 显示指定步骤
   */
  showStep(index) {
    if (index < 0 || index >= this.steps.length) return;

    this.currentStep = index;
    const step = this.steps[index];

    // 更新内容
    this.elements.title.textContent = step.title;
    this.elements.content.textContent = step.content;
    this.elements.counter.textContent = `${index + 1} / ${this.steps.length}`;

    // 更新按钮状态
    this.elements.prevBtn.disabled = index === 0;
    
    if (index === this.steps.length - 1) {
      this.elements.nextBtn.style.display = 'none';
      this.elements.finishBtn.style.display = 'inline-block';
    } else {
      this.elements.nextBtn.style.display = 'inline-block';
      this.elements.finishBtn.style.display = 'none';
    }

    // 更新高亮和位置
    this.updateHighlight(step);
    this.positionTooltip(step);

    // 显示提示框
    requestAnimationFrame(() => {
      this.elements.tooltip.style.opacity = '1';
      this.elements.tooltip.style.transform = 'translateY(0)';
    });

    // 发布事件
    this.emit('tutorial:step', { step: index, data: step });
  }

  /**
   * 更新高亮区域
   */
  updateHighlight(step) {
    const { overlay, masks, highlight } = this.elements;

    if (!step.target) {
      // 居中模式 - 没有特定目标
      highlight.style.display = 'none';
      masks.forEach(mask => {
        mask.style.opacity = '1';
      });
      // 全屏遮罩
      const [top, right, bottom, left] = masks;
      top.style.top = '0';
      top.style.left = '0';
      top.style.width = '100%';
      top.style.height = '100%';
      right.style.width = '0';
      bottom.style.height = '0';
      left.style.width = '0';
    } else {
      // 高亮特定元素
      const target = document.querySelector(step.target);
      if (target) {
        highlight.style.display = 'block';
        highlight.classList.add('active');

        const rect = target.getBoundingClientRect();
        const padding = this.options.highlightPadding;
        
        const highlightRect = {
          top: rect.top - padding,
          left: rect.left - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2
        };

        // 设置高亮框位置
        highlight.style.top = `${highlightRect.top}px`;
        highlight.style.left = `${highlightRect.left}px`;
        highlight.style.width = `${highlightRect.width}px`;
        highlight.style.height = `${highlightRect.height}px`;

        // 设置遮罩位置（创建镂空效果）
        const [top, right, bottom, left] = masks;
        
        top.style.top = '0';
        top.style.left = '0';
        top.style.width = '100%';
        top.style.height = `${highlightRect.top}px`;
        
        right.style.top = `${highlightRect.top}px`;
        right.style.left = `${highlightRect.left + highlightRect.width}px`;
        right.style.width = `calc(100% - ${highlightRect.left + highlightRect.width}px)`;
        right.style.height = `${highlightRect.height}px`;
        
        bottom.style.top = `${highlightRect.top + highlightRect.height}px`;
        bottom.style.left = '0';
        bottom.style.width = '100%';
        bottom.style.height = `calc(100% - ${highlightRect.top + highlightRect.height}px)`;
        
        left.style.top = `${highlightRect.top}px`;
        left.style.left = '0';
        left.style.width = `${highlightRect.left}px`;
        left.style.height = `${highlightRect.height}px`;
      } else {
        // 目标元素未找到，居中显示
        console.warn(`Tutorial: 目标元素 ${step.target} 未找到`);
        highlight.style.display = 'none';
        masks.forEach(mask => {
          mask.style.opacity = '1';
        });
      }
    }
  }

  /**
   * 定位提示框
   */
  positionTooltip(step) {
    const tooltip = this.elements.tooltip;
    const tooltipRect = tooltip.getBoundingClientRect();
    let position = { x: 0, y: 0 };

    if (!step.target) {
      // 居中
      position.x = (window.innerWidth - tooltipRect.width) / 2;
      position.y = (window.innerHeight - tooltipRect.height) / 2;
    } else {
      const target = document.querySelector(step.target);
      if (target) {
        const rect = target.getBoundingClientRect();
        const spacing = 20;

        switch (step.position) {
          case 'top':
            position.x = rect.left + (rect.width - tooltipRect.width) / 2;
            position.y = rect.top - tooltipRect.height - spacing;
            break;
          case 'bottom':
            position.x = rect.left + (rect.width - tooltipRect.width) / 2;
            position.y = rect.bottom + spacing;
            break;
          case 'left':
            position.x = rect.left - tooltipRect.width - spacing;
            position.y = rect.top + (rect.height - tooltipRect.height) / 2;
            break;
          case 'right':
            position.x = rect.right + spacing;
            position.y = rect.top + (rect.height - tooltipRect.height) / 2;
            break;
          default:
            position.x = rect.right + spacing;
            position.y = rect.top;
        }
      } else {
        // 默认居中
        position.x = (window.innerWidth - tooltipRect.width) / 2;
        position.y = (window.innerHeight - tooltipRect.height) / 2;
      }
    }

    // 边界检查
    position.x = Math.max(20, Math.min(position.x, window.innerWidth - tooltipRect.width - 20));
    position.y = Math.max(20, Math.min(position.y, window.innerHeight - tooltipRect.height - 20));

    tooltip.style.left = `${position.x}px`;
    tooltip.style.top = `${position.y}px`;
  }

  /**
   * 下一步
   */
  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    }
  }

  /**
   * 上一步
   */
  prevStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  /**
   * 跳过引导
   */
  skip() {
    this.emit('tutorial:skip', { step: this.currentStep });
    this.destroy();
  }

  /**
   * 完成引导
   */
  finish() {
    this.markTutorialCompleted();
    this.emit('tutorial:complete');
    this.destroy();
  }

  /**
   * 销毁引导系统
   */
  destroy() {
    this.isActive = false;
    
    // 移除所有元素
    if (this.elements.overlay) {
      this.elements.overlay.remove();
    }
    if (this.elements.tooltip) {
      this.elements.tooltip.remove();
    }
    if (this.elements.skipBtn) {
      this.elements.skipBtn.remove();
    }

    // 移除样式
    const style = document.querySelector('style[data-tutorial]');
    if (style) {
      style.remove();
    }

    // 清理引用
    this.elements = {};
    
    this.emit('tutorial:end');
  }

  /**
   * 事件系统
   */
  emit(eventName, data = {}) {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }

  on(eventName, callback) {
    document.addEventListener(eventName, (e) => callback(e.detail));
  }

  /**
   * 添加自定义步骤（用于扩展）
   */
  addStep(step) {
    this.steps.push(step);
  }

  /**
   * 更新步骤配置
   */
  updateStep(index, updates) {
    if (this.steps[index]) {
      this.steps[index] = { ...this.steps[index], ...updates };
    }
  }

  /**
   * 重新启动引导（用于测试）
   */
  restart() {
    this.resetTutorial();
    this.start();
  }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TutorialSystem;
}

// 浏览器环境全局暴露
if (typeof window !== 'undefined') {
  window.TutorialSystem = TutorialSystem;
  
  // 自动初始化（如果页面中有 data-auto-start 属性）
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[data-tutorial-auto]')) {
      window.tutorial = new TutorialSystem();
    }
  });
}

/**
 * 使用示例 / Usage Example:
 * 
 * // 基础使用
 * const tutorial = new TutorialSystem();
 * 
 * // 自定义配置
 * const tutorial = new TutorialSystem({
 *   overlayOpacity: 0.8,
 *   highlightPadding: 10,
 *   animationDuration: 400
 * });
 * 
 * // 事件监听
 * tutorial.on('tutorial:complete', () => {
 *   console.log('引导完成！');
 * });
 * 
 * tutorial.on('tutorial:skip', ({ step }) => {
 *   console.log(`在第 ${step + 1} 步跳过引导`);
 * });
 * 
 * // 手动控制
 * tutorial.start();      // 开始引导
 * tutorial.skip();       // 跳过引导
 * tutorial.finish();     // 完成引导
 * tutorial.restart();    // 重新开始（测试用）
 * tutorial.resetTutorial(); // 重置完成状态
 */
