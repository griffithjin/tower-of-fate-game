/**
 * 命运塔 - 玩家嘲讽互动系统
 * Player Taunt System - Allegro最强模式
 * 
 * 支持多种嘲讽类型：rise(上升), provoke(激怒), win(获胜), closeCall(险胜)
 */

class PlayerTauntSystem {
    constructor() {
        // 嘲讽语录库
        this.taunts = {
            rise: [ // 上升时嘲讽
                { text: "看我飞升！", weight: 1 },
                { text: "追不上我了吧~", weight: 1 },
                { text: "拜拜了您嘞！", weight: 1 },
                { text: "我先走一步！", weight: 1 },
                { text: "塔顶见！", weight: 1 },
                { text: "风一样的男子/女子！", weight: 0.8 },
                { text: "这就是实力！", weight: 1 },
                { text: "起飞咯~", weight: 1 },
                { text: "一步一步往上爬~", weight: 0.8 },
                { text: "高处不胜寒啊~", weight: 0.6 }
            ],
            provoke: [ // 激怒对手时
                { text: "哎呀，掉下去了？", weight: 1 },
                { text: "小心别摔着！", weight: 1 },
                { text: "需要我拉你一把吗？", weight: 1 },
                { text: "哈哈，回原点吧！", weight: 1 },
                { text: "激怒牌好吃吗？", weight: 1 },
                { text: "原地踏步的感觉如何？", weight: 1 },
                { text: "我在上面等你哦~", weight: 1 },
                { text: "要不要我教你怎么玩？", weight: 0.8 },
                { text: "这就是命运的安排~", weight: 0.8 },
                { text: "刺激吗？", weight: 1 }
            ],
            win: [ // 获胜时
                { text: "首登者是我的！", weight: 1 },
                { text: "还有人比我快吗？", weight: 1 },
                { text: "轻轻松松~", weight: 1 },
                { text: "这塔我征服定了！", weight: 1 },
                { text: "谢谢参与，我是冠军！", weight: 1 },
                { text: "王者归来！", weight: 1 },
                { text: "这就是塔主的实力！", weight: 1 },
                { text: "还有谁？！", weight: 1 },
                { text: "完美登顶！", weight: 1 },
                { text: "今天的塔顶风景真美~", weight: 0.8 }
            ],
            closeCall: [ // 险胜时
                { text: "好险好险！", weight: 1 },
                { text: "差点就被追上了！", weight: 1 },
                { text: "心脏都要跳出来了！", weight: 1 },
                { text: "最后一刻！", weight: 1 },
                { text: "运气也是实力的一部分！", weight: 1 },
                { text: "差一点点就...", weight: 1 },
                { text: "紧张刺激！", weight: 1 },
                { text: "命悬一线啊！", weight: 1 },
                { text: "这就是命运的眷顾！", weight: 0.8 },
                { text: "惊险过关！", weight: 1 }
            ],
            comeback: [ // 逆袭时
                { text: "我回来了！", weight: 1 },
                { text: "永远不要放弃！", weight: 1 },
                { text: "逆袭成功！", weight: 1 },
                { text: "置之死地而后生！", weight: 0.8 },
                { text: "这才是真正的实力！", weight: 1 }
            ],
            revenge: [ // 复仇时
                { text: "君子报仇，十年不晚！", weight: 0.8 },
                { text: "刚才的账该算了！", weight: 1 },
                { text: "以牙还牙！", weight: 0.8 },
                { text: "这次轮到你了！", weight: 1 },
                { text: "复仇成功！", weight: 1 }
            ]
        };
        
        // 表情符号库
        this.emojis = {
            rise: ['🚀', '☁️', '🏔️', '👑', '🔥', '⬆️', '📈', '💨'],
            provoke: ['😈', '😏', '🤭', '😂', '🤣', '😜', '🙃', '😤'],
            win: ['🏆', '🥇', '👑', '🎉', '✨', '🎯', '💯', '🌟'],
            closeCall: ['😅', '😰', '😮', '🤯', '💦', '😵', '🙀', '💨'],
            comeback: ['💪', '🔥', '🚀', '⭐', '🎊', '😤', '🦁', '🦅'],
            revenge: ['⚔️', '🔥', '💀', '😈', '🎯', '💥', '👊', '🗡️']
        };
        
        // 音效映射
        this.soundEffects = {
            rise: 'sounds/taunt-rise.mp3',
            provoke: 'sounds/taunt-provoke.mp3',
            win: 'sounds/taunt-win.mp3',
            closeCall: 'sounds/taunt-close.mp3',
            comeback: 'sounds/taunt-comeback.mp3',
            revenge: 'sounds/taunt-revenge.mp3'
        };
        
        // 快捷嘲讽配置
        this.quickTauntConfig = [
            { type: 'rise', emoji: '🚀', text: '我先走了！', cooldown: 3000 },
            { type: 'provoke', emoji: '😈', text: '激怒你！', cooldown: 5000 },
            { type: 'win', emoji: '🏆', text: '我要赢了！', cooldown: 5000 },
            { type: 'closeCall', emoji: '😅', text: '好险！', cooldown: 3000 },
            { type: 'comeback', emoji: '💪', text: '我回来了！', cooldown: 4000 },
            { type: 'revenge', emoji: '⚔️', text: '受死吧！', cooldown: 5000 }
        ];
        
        // 冷却时间记录
        this.cooldowns = new Map();
        
        // 配置
        this.config = {
            bubbleDuration: 3000,
            maxTauntLength: 50,
            cooldownBetweenTaunts: 2000,
            enable3DBubbles: true,
            enableChatDisplay: true,
            enableSound: true
        };
    }
    
    /**
     * 发送嘲讽
     * @param {string} playerId - 发送者ID
     * @param {string} type - 嘲讽类型
     * @param {string} targetId - 目标玩家ID（可选）
     * @param {Object} options - 额外选项
     */
    sendTaunt(playerId, type, targetId = null, options = {}) {
        // 检查冷却时间
        if (this.isOnCooldown(playerId)) {
            return { success: false, reason: 'cooldown', message: '嘲讽冷却中...' };
        }
        
        // 获取嘲讽内容
        const taunt = this.generateTaunt(type);
        if (!taunt) {
            return { success: false, reason: 'invalid_type', message: '无效的嘲讽类型' };
        }
        
        const message = `${taunt.emoji} ${taunt.text}`;
        
        // 设置冷却
        this.setCooldown(playerId);
        
        // 显示在聊天区
        if (this.config.enableChatDisplay) {
            this.displayTauntInChat(playerId, message, targetId, type);
        }
        
        // 播放音效
        if (this.config.enableSound) {
            this.playTauntSound(type);
        }
        
        // 3D显示在塔上（气泡形式）
        if (this.config.enable3DBubbles) {
            this.show3DBubble(playerId, message, type);
        }
        
        // 触发屏幕震动效果（如果是挑衅）
        if (type === 'provoke' || type === 'revenge') {
            this.triggerScreenShake();
        }
        
        // 发送到服务器
        const tauntData = {
            from: playerId,
            to: targetId,
            message: message,
            text: taunt.text,
            emoji: taunt.emoji,
            type: type,
            timestamp: Date.now(),
            duration: this.config.bubbleDuration
        };
        
        this.broadcastTaunt(tauntData);
        
        return { success: true, data: tauntData };
    }
    
    /**
     * 生成嘲讽内容
     */
    generateTaunt(type) {
        const tauntList = this.taunts[type];
        if (!tauntList || tauntList.length === 0) {
            return null;
        }
        
        // 根据权重随机选择
        const totalWeight = tauntList.reduce((sum, t) => sum + t.weight, 0);
        let random = Math.random() * totalWeight;
        
        let selectedTaunt;
        for (const taunt of tauntList) {
            random -= taunt.weight;
            if (random <= 0) {
                selectedTaunt = taunt;
                break;
            }
        }
        
        // 随机选择表情
        const emojiList = this.emojis[type] || this.emojis.rise;
        const randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)];
        
        return {
            text: selectedTaunt.text,
            emoji: randomEmoji,
            type: type
        };
    }
    
    /**
     * 显示3D气泡
     */
    show3DBubble(playerId, message, type) {
        if (typeof window === 'undefined' || !window.scene) {
            console.log(`[TauntSystem] 3D气泡: ${message}`);
            return;
        }
        
        // 获取玩家3D令牌位置
        const playerToken = this.getPlayerToken3D(playerId);
        if (!playerToken) {
            console.warn(`[TauntSystem] 找不到玩家3D令牌: ${playerId}`);
            return;
        }
        
        // 创建气泡
        const bubble = this.create3DTextBubble(message, type);
        bubble.position.set(
            playerToken.position.x,
            playerToken.position.y + 0.8,
            playerToken.position.z
        );
        
        window.scene.add(bubble);
        
        // 浮动动画
        this.animateBubble(bubble);
        
        // 3秒后消失
        setTimeout(() => {
            this.removeBubble(bubble);
        }, this.config.bubbleDuration);
        
        return bubble;
    }
    
    /**
     * 创建3D文本气泡
     */
    create3DTextBubble(message, type) {
        // 使用Three.js创建气泡
        const group = new THREE.Group();
        
        // 气泡背景
        const bubbleGeometry = new THREE.SphereGeometry(0.6, 32, 32);
        const bubbleMaterial = new THREE.MeshBasicMaterial({
            color: this.getBubbleColor(type),
            transparent: true,
            opacity: 0.9
        });
        const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
        group.add(bubble);
        
        // 气泡尾部
        const tailGeometry = new THREE.ConeGeometry(0.2, 0.4, 32);
        const tailMaterial = new THREE.MeshBasicMaterial({
            color: this.getBubbleColor(type),
            transparent: true,
            opacity: 0.9
        });
        const tail = new THREE.Mesh(tailGeometry, tailMaterial);
        tail.position.y = -0.6;
        tail.rotation.x = Math.PI;
        group.add(tail);
        
        return group;
    }
    
    /**
     * 获取气泡颜色
     */
    getBubbleColor(type) {
        const colors = {
            rise: 0x4ecdc4,
            provoke: 0xff6b6b,
            win: 0xffd93d,
            closeCall: 0xff8b94,
            comeback: 0x6bcf7f,
            revenge: 0xc0392b
        };
        return colors[type] || 0xffffff;
    }
    
    /**
     * 动画气泡
     */
    animateBubble(bubble) {
        let startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = elapsed / this.config.bubbleDuration;
            
            if (progress >= 1) return;
            
            // 上下浮动
            bubble.position.y += Math.sin(elapsed * 0.003) * 0.002;
            
            // 渐隐
            if (progress > 0.7) {
                const opacity = 1 - (progress - 0.7) / 0.3;
                bubble.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity = opacity * 0.9;
                    }
                });
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * 移除气泡
     */
    removeBubble(bubble) {
        if (window.scene) {
            window.scene.remove(bubble);
        }
        // 清理资源
        bubble.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
    
    /**
     * 获取玩家3D令牌
     */
    getPlayerToken3D(playerId) {
        if (window.GameState && window.GameState.players) {
            const player = window.GameState.players.get(playerId);
            if (player && player.token3D) {
                return player.token3D;
            }
        }
        return null;
    }
    
    /**
     * 在聊天区显示嘲讽
     */
    displayTauntInChat(playerId, message, targetId, type) {
        const chatContainer = document.getElementById('game-chat');
        if (!chatContainer) return;
        
        const tauntElement = document.createElement('div');
        tauntElement.className = `taunt-message taunt-${type}`;
        
        const playerName = this.getPlayerName(playerId);
        const targetName = targetId ? this.getPlayerName(targetId) : null;
        
        let html = `
            <span class="taunt-player">${playerName}</span>
            <span class="taunt-action">${targetName ? `对 ${targetName}` : ''}</span>
            <span class="taunt-content">${message}</span>
        `;
        
        tauntElement.innerHTML = html;
        chatContainer.appendChild(tauntElement);
        
        // 自动滚动到底部
        chatContainer.scrollTop = chatContainer.scrollHeight;
        
        // 5秒后淡出
        setTimeout(() => {
            tauntElement.style.opacity = '0.5';
        }, 5000);
    }
    
    /**
     * 获取玩家名称
     */
    getPlayerName(playerId) {
        if (window.GameState && window.GameState.players) {
            const player = window.GameState.players.get(playerId);
            if (player) return player.name || playerId;
        }
        return playerId;
    }
    
    /**
     * 播放嘲讽音效
     */
    playTauntSound(type) {
        const soundPath = this.soundEffects[type];
        if (!soundPath) return;
        
        if (window.AudioSystem) {
            window.AudioSystem.playSFX(soundPath);
        } else {
            // 回退方案
            const audio = new Audio(soundPath);
            audio.volume = 0.6;
            audio.play().catch(() => {});
        }
    }
    
    /**
     * 触发屏幕震动
     */
    triggerScreenShake() {
        if (typeof document !== 'undefined') {
            document.body.classList.add('screen-shake');
            setTimeout(() => {
                document.body.classList.remove('screen-shake');
            }, 300);
        }
    }
    
    /**
     * 广播嘲讽
     */
    broadcastTaunt(tauntData) {
        if (window.SocketClient) {
            window.SocketClient.emit('player:taunt', tauntData);
        } else if (window.socket) {
            window.socket.emit('taunt', tauntData);
        }
        
        // 触发自定义事件
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('playerTaunt', { detail: tauntData }));
        }
    }
    
    /**
     * 接收嘲讽
     */
    receiveTaunt(tauntData) {
        // 显示接收到的嘲讽
        if (this.config.enableChatDisplay) {
            this.displayTauntInChat(
                tauntData.from,
                tauntData.message,
                tauntData.to,
                tauntData.type
            );
        }
        
        // 如果是针对自己的嘲讽，显示特效
        if (tauntData.to === this.getCurrentPlayerId()) {
            this.showTargetedEffect(tauntData);
        }
    }
    
    /**
     * 显示被针对特效
     */
    showTargetedEffect(tauntData) {
        const effect = document.createElement('div');
        effect.className = `targeted-effect targeted-${tauntData.type}`;
        effect.innerHTML = `
            <div class="targeted-arrow">⬇️</div>
            <div class="targeted-message">${tauntData.message}</div>
        `;
        
        document.body.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 2000);
    }
    
    /**
     * 获取当前玩家ID
     */
    getCurrentPlayerId() {
        if (window.GameState && window.GameState.currentPlayer) {
            return window.GameState.currentPlayer.id;
        }
        return null;
    }
    
    /**
     * 检查是否在冷却中
     */
    isOnCooldown(playerId) {
        const lastTaunt = this.cooldowns.get(playerId);
        if (!lastTaunt) return false;
        
        return Date.now() - lastTaunt < this.config.cooldownBetweenTaunts;
    }
    
    /**
     * 设置冷却
     */
    setCooldown(playerId) {
        this.cooldowns.set(playerId, Date.now());
    }
    
    /**
     * 获取快捷嘲讽按钮
     */
    getQuickTaunts() {
        return this.quickTauntConfig.map(config => ({
            ...config,
            action: () => this.sendTaunt(this.getCurrentPlayerId(), config.type)
        }));
    }
    
    /**
     * 渲染快捷嘲讽UI
     */
    renderQuickTauntUI(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
        container.className = 'quick-taunt-panel';
        
        const quickTaunts = this.getQuickTaunts();
        
        quickTaunts.forEach((taunt, index) => {
            const btn = document.createElement('button');
            btn.className = `quick-taunt-btn taunt-${taunt.type}`;
            btn.innerHTML = `${taunt.emoji} ${taunt.text}`;
            btn.title = taunt.text;
            
            btn.addEventListener('click', () => {
                const result = taunt.action();
                if (!result.success) {
                    this.showCooldownMessage(btn, result.message);
                } else {
                    this.animateButtonPress(btn);
                }
            });
            
            container.appendChild(btn);
        });
    }
    
    /**
     * 显示冷却提示
     */
    showCooldownMessage(button, message) {
        button.classList.add('on-cooldown');
        button.setAttribute('data-cooldown-msg', message);
        
        setTimeout(() => {
            button.classList.remove('on-cooldown');
        }, 1000);
    }
    
    /**
     * 按钮按压动画
     */
    animateButtonPress(button) {
        button.classList.add('pressed');
        setTimeout(() => {
            button.classList.remove('pressed');
        }, 200);
    }
    
    /**
     * 添加自定义嘲讽
     */
    addCustomTaunt(type, text, weight = 1) {
        if (this.taunts[type]) {
            this.taunts[type].push({ text, weight });
            return true;
        }
        return false;
    }
    
    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    
    /**
     * 获取统计信息
     */
    getStats() {
        return {
            totalTauntTypes: Object.keys(this.taunts).length,
            totalTauntMessages: Object.values(this.taunts).reduce((sum, list) => sum + list.length, 0),
            quickTaunts: this.quickTauntConfig.length,
            cooldownActive: this.cooldowns.size
        };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PlayerTauntSystem;
}

// 浏览器环境
if (typeof window !== 'undefined') {
    window.PlayerTauntSystem = PlayerTauntSystem;
}
