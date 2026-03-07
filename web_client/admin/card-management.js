/**
 * 命运塔 - 后台卡牌管理系统
 * Card Management System - Allegro最强模式
 * 
 * 支持7套卡牌的管理、配置和实时同步
 */

class CardManagementSystem {
    constructor() {
        this.decks = ['classic', 'cartoon', 'animals', 'fruits', 'space', 'emoji', 'fairy'];
        this.currentDeck = 'classic';
        
        // 默认配置
        this.defaultConfigs = {
            classic: {
                name: '经典扑克',
                nameEn: 'Classic Poker',
                description: '传统扑克牌，经典永不过时',
                suits: [
                    { key: 'hearts', symbol: '❤️', name: '红心', color: '#e74c3c', locked: false },
                    { key: 'diamonds', symbol: '♦️', name: '方块', color: '#e74c3c', locked: false },
                    { key: 'clubs', symbol: '♣️', name: '梅花', color: '#2c3e50', locked: false },
                    { key: 'spades', symbol: '♠️', name: '黑桃', color: '#2c3e50', locked: false }
                ],
                specialEffects: { enabled: true, triggerRate: 20 },
                unlocked: true
            },
            cartoon: {
                name: '卡通世界',
                nameEn: 'Cartoon World',
                description: '可爱卡通风格，充满童趣',
                suits: [
                    { key: 'cute', symbol: '🥰', name: '可爱', color: '#ff6b9d', locked: false },
                    { key: 'cool', symbol: '😎', name: '酷酷', color: '#4ecdc4', locked: false },
                    { key: 'happy', symbol: '🤗', name: '开心', color: '#ffe66d', locked: false },
                    { key: 'silly', symbol: '🤪', name: '搞笑', color: '#a8e6cf', locked: false }
                ],
                specialEffects: { enabled: true, triggerRate: 25 },
                unlocked: true
            },
            animals: {
                name: '动物王国',
                nameEn: 'Animal Kingdom',
                description: '各种可爱动物，体验自然魅力',
                suits: [
                    { key: 'land', symbol: '🦁', name: '陆地', color: '#d4a373', locked: false },
                    { key: 'sea', symbol: '🐋', name: '海洋', color: '#48cae4', locked: false },
                    { key: 'sky', symbol: '🦅', name: '天空', color: '#90e0ef', locked: false },
                    { key: 'forest', symbol: '🐼', name: '森林', color: '#76c893', locked: false }
                ],
                specialEffects: { enabled: true, triggerRate: 25 },
                unlocked: true
            },
            fruits: {
                name: '水果乐园',
                nameEn: 'Fruit Paradise',
                description: '新鲜水果，清爽可口',
                suits: [
                    { key: 'berries', symbol: '🍓', name: '浆果', color: '#ff6b6b', locked: false },
                    { key: 'citrus', symbol: '🍊', name: '柑橘', color: '#ffa502', locked: false },
                    { key: 'tropical', symbol: '🍍', name: '热带', color: '#ffeaa7', locked: false },
                    { key: 'stone', symbol: '🍑', name: '核果', color: '#fab1a0', locked: false }
                ],
                specialEffects: { enabled: true, triggerRate: 25 },
                unlocked: true
            },
            space: {
                name: '星际探险',
                nameEn: 'Space Adventure',
                description: '探索宇宙奥秘，星际穿越',
                suits: [
                    { key: 'rockets', symbol: '🚀', name: '火箭', color: '#ff6b6b', locked: false },
                    { key: 'stars', symbol: '⭐', name: '星星', color: '#ffd93d', locked: false },
                    { key: 'planets', symbol: '🪐', name: '行星', color: '#6bcf7f', locked: false },
                    { key: 'moons', symbol: '🌙', name: '月亮', color: '#a8d8ea', locked: false }
                ],
                specialEffects: { enabled: true, triggerRate: 30 },
                unlocked: true
            },
            emoji: {
                name: '表情派对',
                nameEn: 'Emoji Party',
                description: '表情包大乱斗',
                suits: [
                    { key: 'love', symbol: '😍', name: '爱心', color: '#ff6b9d', locked: false },
                    { key: 'cool', symbol: '😎', name: '酷', color: '#4ecdc4', locked: false },
                    { key: 'laugh', symbol: '😂', name: '大笑', color: '#ffe66d', locked: false },
                    { key: 'party', symbol: '🥳', name: '派对', color: '#ff8b94', locked: false }
                ],
                specialEffects: { enabled: true, triggerRate: 25 },
                unlocked: true
            },
            fairy: {
                name: '童话仙境',
                nameEn: 'Fairy Wonderland',
                description: '魔法世界，梦幻仙境',
                suits: [
                    { key: 'fairies', symbol: '🧚‍♀️', name: '仙女', color: '#ff9ff3', locked: false },
                    { key: 'unicorns', symbol: '🦄', name: '独角兽', color: '#f368e0', locked: false },
                    { key: 'wizards', symbol: '🧙‍♂️', name: '巫师', color: '#9b59b6', locked: false },
                    { key: 'dragons', symbol: '🐉', name: '巨龙', color: '#e74c3c', locked: false }
                ],
                specialEffects: { enabled: true, triggerRate: 35 },
                unlocked: true
            }
        };
        
        // 当前配置
        this.configs = JSON.parse(JSON.stringify(this.defaultConfigs));
        
        // 嘲讽语录模板
        this.tauntTemplates = {
            rise: [
                "看我飞升！", "追不上我了吧~", "拜拜了您嘞！",
                "我先走一步！", "塔顶见！", "起飞咯~"
            ],
            provoke: [
                "哎呀，掉下去了？", "小心别摔着！", "需要我拉你一把吗？",
                "哈哈，回原点吧！", "激怒牌好吃吗？", "刺激吗？"
            ],
            win: [
                "首登者是我的！", "还有人比我快吗？", "轻轻松松~",
                "这塔我征服定了！", "谢谢参与，我是冠军！", "还有谁？！"
            ],
            closeCall: [
                "好险好险！", "差点就被追上了！", "心脏都要跳出来了！",
                "最后一刻！", "运气也是实力的一部分！", "惊险过关！"
            ]
        };
        
        // 音效列表
        this.soundEffects = {
            rise: ['taunt-rise-1.mp3', 'taunt-rise-2.mp3'],
            provoke: ['taunt-provoke-1.mp3', 'taunt-provoke-2.mp3'],
            win: ['taunt-win-1.mp3', 'taunt-win-2.mp3'],
            closeCall: ['taunt-close-1.mp3', 'taunt-close-2.mp3'],
            special: ['special-1.mp3', 'special-2.mp3', 'special-3.mp3']
        };
    }
    
    /**
     * 渲染卡牌管理界面
     */
    renderCardManager(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="card-management-system">
                <header class="cms-header">
                    <h2>🃏 卡牌管理系统</h2>
                    <div class="cms-actions">
                        <button class="btn-primary" onclick="cardManager.saveAllConfigs()">
                            💾 保存所有配置
                        </button>
                        <button class="btn-secondary" onclick="cardManager.resetToDefault()">
                            🔄 恢复默认
                        </button>
                    </div>
                </header>
                
                <nav class="deck-tabs">
                    ${this.decks.map(deck => {
                        const config = this.configs[deck];
                        return `
                            <button class="deck-tab ${deck === this.currentDeck ? 'active' : ''}" 
                                    onclick="cardManager.switchDeck('${deck}')"
                                    data-deck="${deck}"
                                    ${!config.unlocked ? 'disabled' : ''}>
                                <span class="tab-icon">${config.suits[0]?.symbol || '🃏'}</span>
                                <span class="tab-name">${config.name}</span>
                                ${!config.unlocked ? '<span class="lock-icon">🔒</span>' : ''}
                            </button>
                        `;
                    }).join('')}
                </nav>
                
                <div class="card-editor">
                    ${this.renderDeckEditor()}
                </div>
                
                <div class="card-preview-panel">
                    <h3>👁️ 实时预览</h3>
                    <div id="card-preview-area" class="preview-area">
                        ${this.renderCardPreview()}
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    /**
     * 渲染牌组编辑器
     */
    renderDeckEditor() {
        const config = this.configs[this.currentDeck];
        
        return `
            <div class="deck-editor" data-deck="${this.currentDeck}">
                <div class="editor-section">
                    <h3>📋 基本信息</h3>
                    <div class="form-group">
                        <label>牌组名称（中文）</label>
                        <input type="text" class="deck-name-zh" 
                               value="${config.name}" 
                               onchange="cardManager.updateDeckName('${this.currentDeck}', this.value, 'zh')">
                    </div>
                    <div class="form-group">
                        <label>牌组名称（英文）</label>
                        <input type="text" class="deck-name-en" 
                               value="${config.nameEn}"
                               onchange="cardManager.updateDeckName('${this.currentDeck}', this.value, 'en')">
                    </div>
                    <div class="form-group">
                        <label>描述</label>
                        <textarea class="deck-description" rows="2"
                                  onchange="cardManager.updateDeckDescription('${this.currentDeck}', this.value)">${config.description}</textarea>
                    </div>
                </div>
                
                <div class="editor-section">
                    <h3>🎨 花色设置</h3>
                    <div class="suit-grid">
                        ${config.suits.map((suit, index) => `
                            <div class="suit-card" data-suit-index="${index}">
                                <div class="suit-header">
                                    <span class="suit-symbol-display" style="color: ${suit.color}">
                                        ${suit.symbol}
                                    </span>
                                    <input type="checkbox" class="suit-lock" 
                                           ${suit.locked ? 'checked' : ''}
                                           onchange="cardManager.toggleSuitLock('${this.currentDeck}', ${index}, this.checked)">
                                </div>
                                <div class="suit-form">
                                    <label>符号</label>
                                    <input type="text" class="suit-symbol" 
                                           value="${suit.symbol}" maxlength="2"
                                           onchange="cardManager.updateSuitSymbol('${this.currentDeck}', ${index}, this.value)">
                                    
                                    <label>名称</label>
                                    <input type="text" class="suit-name" 
                                           value="${suit.name}"
                                           onchange="cardManager.updateSuitName('${this.currentDeck}', ${index}, this.value)">
                                    
                                    <label>颜色</label>
                                    <input type="color" class="suit-color" 
                                           value="${suit.color}"
                                           onchange="cardManager.updateSuitColor('${this.currentDeck}', ${index}, this.value)">
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="editor-section">
                    <h3>✨ 特殊效果设置</h3>
                    <div class="effect-settings">
                        <div class="effect-item">
                            <input type="checkbox" id="enableSpecialEffect" 
                                   ${config.specialEffects.enabled ? 'checked' : ''}
                                   onchange="cardManager.toggleSpecialEffects('${this.currentDeck}', this.checked)">
                            <label for="enableSpecialEffect">启用特殊效果</label>
                        </div>
                        
                        <div class="effect-config ${!config.specialEffects.enabled ? 'disabled' : ''}">
                            <label>触发概率</label>
                            <input type="range" min="0" max="100" 
                                   value="${config.specialEffects.triggerRate}"
                                   onchange="cardManager.updateTriggerRate('${this.currentDeck}', this.value)"
                                   ${!config.specialEffects.enabled ? 'disabled' : ''}>
                            <span class="trigger-rate-value">${config.specialEffects.triggerRate}%</span>
                        </div>
                        
                        <div class="effect-list">
                            <h4>特殊效果列表</h4>
                            ${this.renderSpecialEffectsList(this.currentDeck)}
                        </div>
                    </div>
                </div>
                
                <div class="editor-section">
                    <h3>💬 嘲讽语录管理</h3>
                    <div class="taunt-categories">
                        ${Object.entries(this.tauntTemplates).map(([type, taunts]) => `
                            <div class="taunt-category">
                                <label>${this.getTauntCategoryName(type)}</label>
                                <textarea class="taunt-list" 
                                          data-taunt-type="${type}"
                                          rows="4"
                                          placeholder="每行一条嘲讽">${taunts.join('\n')}</textarea>
                                <button class="btn-small" onclick="cardManager.saveTaunts('${type}')">
                                    保存
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="editor-section">
                    <h3>🔊 音效管理</h3>
                    <div class="sound-manager">
                        ${Object.entries(this.soundEffects).map(([category, sounds]) => `
                            <div class="sound-category">
                                <h4>${this.getSoundCategoryName(category)}</h4>
                                <div class="sound-list">
                                    ${sounds.map(sound => `
                                        <div class="sound-item">
                                            <span class="sound-name">${sound}</span>
                                            <button class="btn-icon" onclick="cardManager.playSound('${sound}')">▶️</button>
                                            <button class="btn-icon" onclick="cardManager.uploadSound('${category}', '${sound}')">📤</button>
                                        </div>
                                    `).join('')}
                                </div>
                                <input type="file" accept="audio/*" 
                                       onchange="cardManager.handleSoundUpload('${category}', this)"
                                       style="display: none;">
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 渲染卡牌预览
     */
    renderCardPreview() {
        const config = this.configs[this.currentDeck];
        const ranks = ['A', 'K', 'Q', 'J', '10', '5'];
        
        return `
            <div class="preview-deck">
                ${config.suits.map(suit => `
                    <div class="preview-suit" style="--suit-color: ${suit.color}">
                        <h4>${suit.symbol} ${suit.name}</h4>
                        <div class="preview-cards">
                            ${ranks.map(rank => `
                                <div class="preview-card">
                                    <span class="card-rank">${rank}</span>
                                    <span class="card-suit" style="color: ${suit.color}">
                                        ${suit.symbol}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    /**
     * 渲染特殊效果列表
     */
    renderSpecialEffectsList(deckType) {
        const effects = this.getSpecialEffectsForDeck(deckType);
        
        if (effects.length === 0) {
            return '<p class="no-effects">此牌组暂无特殊效果</p>';
        }
        
        return effects.map(effect => `
            <div class="effect-card">
                <span class="effect-icon">${effect.icon}</span>
                <div class="effect-info">
                    <span class="effect-name">${effect.name}</span>
                    <span class="effect-desc">${effect.description}</span>
                </div>
                <input type="checkbox" checked 
                       onchange="cardManager.toggleEffect('${deckType}', '${effect.id}', this.checked)">
            </div>
        `).join('');
    }
    
    /**
     * 获取牌组特殊效果
     */
    getSpecialEffectsForDeck(deckType) {
        const effectsMap = {
            animals: [
                { id: 'animal_bonus', name: '动物亲和', description: '同族动物产生共鸣，额外上升1层', icon: '🐾' },
                { id: 'king_of_jungle', name: '丛林之王', description: '狮子王的威严，额外上升2层', icon: '🦁' }
            ],
            space: [
                { id: 'space_bonus', name: '星际穿越', description: '火箭穿越星球，额外上升2层', icon: '🌌' },
                { id: 'star_alignment', name: '星辰连线', description: '星星连成一线，额外上升1层', icon: '✨' }
            ],
            fairy: [
                { id: 'magic_bonus', name: '仙女祝福', description: '获得仙女护盾', icon: '🛡️' },
                { id: 'dragon_awaken', name: '巨龙觉醒', description: '巨龙喷吐烈焰，额外上升3层', icon: '🔥' },
                { id: 'unicorn_magic', name: '独角兽奇迹', description: '彩虹魔法闪耀，额外上升2层并恢复1点生命', icon: '🌈' }
            ],
            emoji: [
                { id: 'love_bonus', name: '爱意满满', description: '爱心治愈，额外上升1层并恢复1点生命', icon: '💕' },
                { id: 'joy_burst', name: '欢乐爆发', description: '笑到飞起，额外上升2层', icon: '🤣' }
            ],
            fruits: [
                { id: 'tropical_combo', name: '热带风情', description: '热带水果大餐，额外上升1层并恢复1点生命', icon: '🏝️' },
                { id: 'berry_burst', name: '浆果爆发', description: '浆果力量爆发，额外上升2层', icon: '🍓' }
            ],
            cartoon: [
                { id: 'cartoon_combo', name: '萌蠢组合', description: '萌蠢无敌，额外上升2层', icon: '🎭' },
                { id: 'happy_jump', name: '开心跳跃', description: '开心到跳起来，额外上升1层', icon: '🦘' }
            ]
        };
        
        return effectsMap[deckType] || [];
    }
    
    /**
     * 切换牌组
     */
    switchDeck(deckType) {
        if (!this.decks.includes(deckType)) return;
        
        this.currentDeck = deckType;
        
        // 更新标签页状态
        document.querySelectorAll('.deck-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.deck === deckType);
        });
        
        // 重新渲染编辑器
        const editor = document.querySelector('.card-editor');
        if (editor) {
            editor.innerHTML = this.renderDeckEditor();
        }
        
        // 更新预览
        this.updatePreview();
    }
    
    /**
     * 更新预览
     */
    updatePreview() {
        const previewArea = document.getElementById('card-preview-area');
        if (previewArea) {
            previewArea.innerHTML = this.renderCardPreview();
        }
    }
    
    /**
     * 保存卡牌配置
     */
    async saveCardConfig(deckType, config) {
        // 保存到配置
        this.configs[deckType] = { ...this.configs[deckType], ...config };
        
        // 发送到服务器
        try {
            const response = await fetch('/api/admin/card-decks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    deck: deckType,
                    config: this.configs[deckType],
                    updatedAt: Date.now()
                })
            });
            
            if (response.ok) {
                // 实时推送到所有客户端
                this.broadcastUpdate(deckType);
                return { success: true, message: '配置已保存' };
            }
        } catch (error) {
            console.error('[CardManagement] 保存失败:', error);
        }
        
        return { success: false, message: '保存失败' };
    }
    
    /**
     * 保存所有配置
     */
    async saveAllConfigs() {
        const results = [];
        
        for (const deck of this.decks) {
            const result = await this.saveCardConfig(deck, this.configs[deck]);
            results.push({ deck, ...result });
        }
        
        const allSuccess = results.every(r => r.success);
        
        alert(allSuccess ? '所有配置已保存！' : '部分配置保存失败，请检查控制台');
        
        return results;
    }
    
    /**
     * 广播更新
     */
    broadcastUpdate(deckType) {
        if (typeof io !== 'undefined') {
            io.emit('cardDeck:updated', {
                deck: deckType,
                config: this.configs[deckType],
                updatedAt: Date.now()
            });
        }
        
        // 触发自定义事件
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('cardDeckUpdated', {
                detail: { deck: deckType, config: this.configs[deckType] }
            }));
        }
    }
    
    /**
     * 获取卡牌统计
     */
    getCardStats() {
        const stats = {
            totalDecks: this.decks.length,
            activeDecks: Object.values(this.configs).filter(c => c.unlocked).length,
            lockedDecks: Object.values(this.configs).filter(c => !c.unlocked).length,
            totalSuits: 0,
            totalSpecialEffects: 0,
            mostPopular: null,
            usageByDeck: {}
        };
        
        for (const deck of this.decks) {
            const config = this.configs[deck];
            stats.totalSuits += config.suits.filter(s => !s.locked).length;
            
            if (config.specialEffects.enabled) {
                stats.totalSpecialEffects += this.getSpecialEffectsForDeck(deck).length;
            }
        }
        
        return stats;
    }
    
    /**
     * 更新牌组名称
     */
    updateDeckName(deckType, value, lang) {
        if (lang === 'zh') {
            this.configs[deckType].name = value;
        } else {
            this.configs[deckType].nameEn = value;
        }
        this.updatePreview();
    }
    
    /**
     * 更新牌组描述
     */
    updateDeckDescription(deckType, value) {
        this.configs[deckType].description = value;
    }
    
    /**
     * 更新花色符号
     */
    updateSuitSymbol(deckType, suitIndex, value) {
        this.configs[deckType].suits[suitIndex].symbol = value;
        this.updatePreview();
    }
    
    /**
     * 更新花色名称
     */
    updateSuitName(deckType, suitIndex, value) {
        this.configs[deckType].suits[suitIndex].name = value;
    }
    
    /**
     * 更新花色颜色
     */
    updateSuitColor(deckType, suitIndex, value) {
        this.configs[deckType].suits[suitIndex].color = value;
        this.updatePreview();
    }
    
    /**
     * 切换花色锁定状态
     */
    toggleSuitLock(deckType, suitIndex, locked) {
        this.configs[deckType].suits[suitIndex].locked = locked;
    }
    
    /**
     * 切换特殊效果
     */
    toggleSpecialEffects(deckType, enabled) {
        this.configs[deckType].specialEffects.enabled = enabled;
        this.updatePreview();
    }
    
    /**
     * 更新触发概率
     */
    updateTriggerRate(deckType, value) {
        this.configs[deckType].specialEffects.triggerRate = parseInt(value);
        document.querySelector('.trigger-rate-value').textContent = value + '%';
    }
    
    /**
     * 恢复默认配置
     */
    resetToDefault() {
        if (confirm('确定要恢复所有默认配置吗？此操作不可撤销。')) {
            this.configs = JSON.parse(JSON.stringify(this.defaultConfigs));
            this.switchDeck(this.currentDeck);
            alert('已恢复默认配置');
        }
    }
    
    /**
     * 获取嘲讽分类名称
     */
    getTauntCategoryName(type) {
        const names = {
            rise: '上升时嘲讽',
            provoke: '激怒对手时',
            win: '获胜时',
            closeCall: '险胜时'
        };
        return names[type] || type;
    }
    
    /**
     * 获取音效分类名称
     */
    getSoundCategoryName(category) {
        const names = {
            rise: '上升音效',
            provoke: '挑衅音效',
            win: '胜利音效',
            closeCall: '险胜音效',
            special: '特殊音效'
        };
        return names[category] || category;
    }
    
    /**
     * 附加事件监听器
     */
    attachEventListeners() {
        // 实时预览更新
        document.querySelectorAll('.suit-symbol, .suit-color').forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
        });
    }
}

// 全局实例
let cardManager;
if (typeof window !== 'undefined') {
    cardManager = new CardManagementSystem();
    window.cardManager = cardManager;
    window.CardManagementSystem = CardManagementSystem;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardManagementSystem;
}
