/**
 * 命运塔 - 3D特效触发系统
 * Tower of Fate - 3D Effect Trigger System
 * 管理游戏中的特效触发逻辑
 */

// ============================================
// 特效触发管理器
// ============================================

class EffectTriggerManager {
    constructor(scene, camera, effectItems3D) {
        this.scene = scene;
        this.camera = camera;
        this.effectItems3D = effectItems3D;
        
        // 激活的特效
        this.activeEffects = new Map();
        
        // 特效历史
        this.effectHistory = [];
        
        // 玩家位置追踪
        this.playerPositions = new Map();
        
        // 动画循环
        this.animationId = null;
        this.lastTime = 0;
        
        // 与装备系统联动
        this.equipmentManager = null;
        
        this.startAnimationLoop();
    }

    setEquipmentManager(manager) {
        this.equipmentManager = manager;
    }

    // ============================================
    // 动画循环
    // ============================================

    startAnimationLoop() {
        const animate = (currentTime) => {
            const deltaTime = currentTime - this.lastTime;
            this.lastTime = currentTime;
            
            // 更新所有激活的特效
            this.updateEffects(deltaTime, currentTime);
            
            this.animationId = requestAnimationFrame(animate);
        };
        
        this.animationId = requestAnimationFrame(animate);
    }

    stopAnimationLoop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    // ============================================
    // 特效触发器
    // ============================================

    /**
     * 触发玩家上升特效
     * @param {string} playerId - 玩家ID
     * @param {THREE.Vector3} startPosition - 起始位置
     * @param {THREE.Vector3} endPosition - 目标位置
     * @param {number} duration - 持续时间(ms)
     */
    triggerRiseEffect(playerId, startPosition, endPosition, duration = 2000) {
        const effectId = this.getEquippedEffectId('rise', playerId);
        
        if (!effectId) {
            console.log(`玩家 ${playerId} 未装备上升特效`);
            return null;
        }
        
        const effectKey = `rise_${playerId}`;
        
        // 清除之前的效果
        this.clearEffect(effectKey);
        
        // 创建特效
        const effectMesh = this.effectItems3D.getEffect(effectId);
        if (!effectMesh) {
            console.warn(`无法创建特效: ${effectId}`);
            return null;
        }
        
        // 设置初始位置
        effectMesh.position.copy(startPosition);
        effectMesh.position.y -= 0.5; // 在玩家脚下
        
        // 添加到场景
        this.scene.add(effectMesh);
        
        // 存储特效信息
        const effectData = {
            key: effectKey,
            mesh: effectMesh,
            type: 'rise',
            effectId: effectId,
            playerId: playerId,
            startPosition: startPosition.clone(),
            endPosition: endPosition.clone(),
            startTime: Date.now(),
            duration: duration,
            progress: 0,
            phase: 'rising' // rising, complete
        };
        
        this.activeEffects.set(effectKey, effectData);
        
        // 记录历史
        this.recordEffectHistory('rise', effectId, playerId);
        
        console.log(`🚀 触发上升特效: ${effectId} for ${playerId}`);
        
        return effectData;
    }

    /**
     * 触发玩家下降特效
     * @param {string} playerId - 玩家ID
     * @param {THREE.Vector3} startPosition - 起始位置
     * @param {THREE.Vector3} endPosition - 目标位置
     * @param {number} duration - 持续时间(ms)
     */
    triggerFallEffect(playerId, startPosition, endPosition, duration = 3000) {
        const effectId = this.getEquippedEffectId('fall', playerId);
        
        if (!effectId) {
            console.log(`玩家 ${playerId} 未装备下降特效`);
            return null;
        }
        
        const effectKey = `fall_${playerId}`;
        
        // 清除之前的效果
        this.clearEffect(effectKey);
        
        // 创建特效
        const effectMesh = this.effectItems3D.getEffect(effectId);
        if (!effectMesh) {
            console.warn(`无法创建特效: ${effectId}`);
            return null;
        }
        
        // 设置初始位置
        effectMesh.position.copy(startPosition);
        effectMesh.position.y += 0.3; // 在玩家上方
        
        // 添加到场景
        this.scene.add(effectMesh);
        
        // 存储特效信息
        const effectData = {
            key: effectKey,
            mesh: effectMesh,
            type: 'fall',
            effectId: effectId,
            playerId: playerId,
            startPosition: startPosition.clone(),
            endPosition: endPosition.clone(),
            startTime: Date.now(),
            duration: duration,
            progress: 0,
            phase: 'falling'
        };
        
        this.activeEffects.set(effectKey, effectData);
        
        // 记录历史
        this.recordEffectHistory('fall', effectId, playerId);
        
        console.log(`🪂 触发下降特效: ${effectId} for ${playerId}`);
        
        return effectData;
    }

    /**
     * 触发守卫激怒特效
     * @param {string} guardId - 守卫ID
     * @param {string} targetId - 目标玩家ID
     * @param {THREE.Vector3} guardPosition - 守卫位置
     * @param {THREE.Vector3} targetPosition - 目标位置
     */
    triggerProvokeEffect(guardId, targetId, guardPosition, targetPosition) {
        // 激怒特效由守卫装备或系统决定
        const effectId = this.getEquippedEffectId('provoke', guardId) || 'laser';
        
        const effectKey = `provoke_${guardId}_${targetId}`;
        
        // 清除之前的效果
        this.clearEffect(effectKey);
        
        // 创建特效
        const effectMesh = this.effectItems3D.getEffect(effectId, {
            from: guardPosition,
            to: targetPosition
        });
        
        if (!effectMesh) {
            console.warn(`无法创建特效: ${effectId}`);
            return null;
        }
        
        // 添加到场景
        this.scene.add(effectMesh);
        
        // 存储特效信息
        const effectData = {
            key: effectKey,
            mesh: effectMesh,
            type: 'provoke',
            effectId: effectId,
            guardId: guardId,
            targetId: targetId,
            guardPosition: guardPosition.clone(),
            targetPosition: targetPosition.clone(),
            startTime: Date.now(),
            duration: effectMesh.userData.duration || 2000,
            progress: 0,
            phase: 'attacking'
        };
        
        this.activeEffects.set(effectKey, effectData);
        
        // 记录历史
        this.recordEffectHistory('provoke', effectId, guardId, targetId);
        
        // 屏幕震动效果
        this.triggerScreenShake(0.1, 500);
        
        console.log(`⚡ 触发激怒特效: ${effectId} from ${guardId} to ${targetId}`);
        
        return effectData;
    }

    /**
     * 触发购买特效
     * @param {THREE.Vector3} position - 特效位置
     * @param {string} rarity - 稀有度
     */
    triggerPurchaseEffect(position, rarity = 'epic') {
        const colors = {
            common: 0x888888,
            rare: 0x4a9eff,
            epic: 0xa855f7,
            legendary: 0xfbbf24
        };
        
        const particleCount = rarity === 'legendary' ? 100 : rarity === 'epic' ? 60 : 40;
        
        // 创建购买成功粒子效果
        const particles = this.effectItems3D.createParticleSystem({
            color: colors[rarity] || colors.epic,
            secondaryColor: 0xffffff,
            count: particleCount,
            size: 0.05,
            lifetime: 1500,
            spread: 0.5,
            velocity: { x: 0.2, y: 0.3, z: 0.2 }
        });
        
        particles.position.copy(position);
        this.scene.add(particles);
        
        const effectKey = `purchase_${Date.now()}`;
        const effectData = {
            key: effectKey,
            mesh: particles,
            type: 'purchase',
            startTime: Date.now(),
            duration: 1500,
            progress: 0,
            autoRemove: true
        };
        
        this.activeEffects.set(effectKey, effectData);
        
        return effectData;
    }

    /**
     * 触发装备特效
     * @param {THREE.Vector3} position - 特效位置
     */
    triggerEquipEffect(position) {
        const ringGeometry = new THREE.RingGeometry(0.3, 0.35, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(position);
        ring.rotation.x = -Math.PI / 2;
        
        this.scene.add(ring);
        
        const effectKey = `equip_${Date.now()}`;
        const effectData = {
            key: effectKey,
            mesh: ring,
            type: 'equip',
            startTime: Date.now(),
            duration: 1000,
            progress: 0,
            autoRemove: true
        };
        
        this.activeEffects.set(effectKey, effectData);
        
        return effectData;
    }

    // ============================================
    // 特效更新
    // ============================================

    updateEffects(deltaTime, currentTime) {
        const elapsedTime = currentTime;
        
        for (const [key, effect] of this.activeEffects) {
            const elapsed = currentTime - effect.startTime;
            effect.progress = Math.min(elapsed / effect.duration, 1);
            
            switch (effect.type) {
                case 'rise':
                    this.updateRiseEffect(effect, deltaTime, elapsedTime);
                    break;
                case 'fall':
                    this.updateFallEffect(effect, deltaTime, elapsedTime);
                    break;
                case 'provoke':
                    this.updateProvokeEffect(effect, deltaTime, elapsedTime);
                    break;
                case 'purchase':
                case 'equip':
                    this.updateOneShotEffect(effect);
                    break;
            }
            
            // 更新3D动画
            if (effect.mesh) {
                this.effectItems3D.updateEffect(effect.mesh, deltaTime, elapsedTime);
            }
            
            // 检查是否结束
            if (effect.progress >= 1) {
                if (effect.autoRemove) {
                    this.clearEffect(key);
                } else {
                    effect.phase = 'complete';
                }
            }
        }
    }

    updateRiseEffect(effect, deltaTime, elapsedTime) {
        const { startPosition, endPosition, progress } = effect;
        
        // 线性插值计算位置
        effect.mesh.position.lerpVectors(startPosition, endPosition, progress);
        effect.mesh.position.y -= 0.5; // 保持在脚下
        
        // 添加上升速度感
        const speedMultiplier = 1 + Math.sin(progress * Math.PI) * 0.5;
        effect.mesh.scale.setScalar(speedMultiplier);
    }

    updateFallEffect(effect, deltaTime, elapsedTime) {
        const { startPosition, endPosition, progress, effectId } = effect;
        
        // 缓慢飘落效果
        const easeProgress = this.easeOutQuad(progress);
        effect.mesh.position.lerpVectors(startPosition, endPosition, easeProgress);
        effect.mesh.position.y += 0.3;
        
        // 特定特效的额外处理
        if (effectId === 'parachute') {
            // 降落伞摇摆
            const sway = Math.sin(progress * Math.PI * 4) * 0.1;
            effect.mesh.position.x += sway;
        }
    }

    updateProvokeEffect(effect, deltaTime, elapsedTime) {
        const { guardPosition, targetPosition, effectId, progress } = effect;
        
        if (effectId === 'laser') {
            // 激光需要持续跟踪目标
            effect.mesh.lookAt(targetPosition);
        }
        
        // 缩放效果
        const scale = progress < 0.2 ? progress * 5 : (progress > 0.8 ? (1 - progress) * 5 : 1);
        effect.mesh.scale.setScalar(scale);
    }

    updateOneShotEffect(effect) {
        const { progress, mesh } = effect;
        
        if (effect.type === 'equip') {
            // 装备特效：扩散并淡出
            const scale = 1 + progress * 2;
            mesh.scale.set(scale, scale, scale);
            mesh.material.opacity = 0.8 * (1 - progress);
        }
    }

    // ============================================
    // 特效管理
    // ============================================

    clearEffect(key) {
        const effect = this.activeEffects.get(key);
        if (effect) {
            this.effectItems3D.disposeEffect(effect.mesh);
            this.activeEffects.delete(key);
        }
    }

    clearAllEffects() {
        for (const [key, effect] of this.activeEffects) {
            this.effectItems3D.disposeEffect(effect.mesh);
        }
        this.activeEffects.clear();
    }

    clearPlayerEffects(playerId) {
        for (const [key, effect] of this.activeEffects) {
            if (effect.playerId === playerId || effect.targetId === playerId) {
                this.effectItems3D.disposeEffect(effect.mesh);
                this.activeEffects.delete(key);
            }
        }
    }

    // ============================================
    // 装备查询
    // ============================================

    getEquippedEffectId(type, playerId) {
        // 优先从装备管理器获取
        if (this.equipmentManager) {
            const equipped = this.equipmentManager.getEquippedEffect(type);
            if (equipped) return equipped.id;
        }
        
        // 从本地存储获取当前玩家
        if (playerId === 'local') {
            const saved = localStorage.getItem('tower_effect_inventory');
            if (saved) {
                const inventory = JSON.parse(saved);
                return inventory.effects?.[type];
            }
        }
        
        return null;
    }

    // ============================================
    // 视觉效果
    // ============================================

    triggerScreenShake(intensity, duration) {
        // 屏幕震动效果
        const startTime = Date.now();
        const originalPosition = this.camera.position.clone();
        
        const shake = () => {
            const elapsed = Date.now() - startTime;
            
            if (elapsed < duration) {
                const progress = elapsed / duration;
                const currentIntensity = intensity * (1 - progress);
                
                this.camera.position.x = originalPosition.x + (Math.random() - 0.5) * currentIntensity;
                this.camera.position.y = originalPosition.y + (Math.random() - 0.5) * currentIntensity;
                this.camera.position.z = originalPosition.z + (Math.random() - 0.5) * currentIntensity;
                
                requestAnimationFrame(shake);
            } else {
                this.camera.position.copy(originalPosition);
            }
        };
        
        shake();
    }

    // ============================================
    // 历史记录
    // ============================================

    recordEffectHistory(type, effectId, sourceId, targetId = null) {
        const record = {
            type,
            effectId,
            sourceId,
            targetId,
            timestamp: Date.now()
        };
        
        this.effectHistory.unshift(record);
        
        // 限制历史记录数量
        if (this.effectHistory.length > 100) {
            this.effectHistory.pop();
        }
    }

    getEffectHistory(limit = 50) {
        return this.effectHistory.slice(0, limit);
    }

    // ============================================
    // 工具函数
    // ============================================

    easeOutQuad(t) {
        return t * (2 - t);
    }

    easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    // ============================================
    // 统计数据
    // ============================================

    getStats() {
        const activeCount = this.activeEffects.size;
        const byType = { rise: 0, fall: 0, provoke: 0, other: 0 };
        
        for (const effect of this.activeEffects.values()) {
            byType[effect.type] = (byType[effect.type] || 0) + 1;
        }
        
        return {
            activeEffects: activeCount,
            byType,
            totalHistory: this.effectHistory.length
        };
    }

    // ============================================
    // 清理
    // ============================================

    dispose() {
        this.stopAnimationLoop();
        this.clearAllEffects();
    }
}

// ============================================
// 游戏集成帮助函数
// ============================================

const EffectTriggers = {
    /**
     * 玩家升级时调用
     */
    onPlayerLevelUp(playerId, fromLevel, toLevel, position) {
        const manager = window.effectTriggerManager;
        if (!manager) return;
        
        const endPosition = position.clone();
        endPosition.y += (toLevel - fromLevel) * 0.5;
        
        manager.triggerRiseEffect(playerId, position, endPosition, 2000);
    },

    /**
     * 玩家降级时调用
     */
    onPlayerLevelDown(playerId, fromLevel, toLevel, position) {
        const manager = window.effectTriggerManager;
        if (!manager) return;
        
        const endPosition = position.clone();
        endPosition.y -= (fromLevel - toLevel) * 0.5;
        
        manager.triggerFallEffect(playerId, position, endPosition, 3000);
    },

    /**
     * 守卫激怒时调用
     */
    onGuardProvoke(guardId, targetId, guardPosition, targetPosition) {
        const manager = window.effectTriggerManager;
        if (!manager) return;
        
        manager.triggerProvokeEffect(guardId, targetId, guardPosition, targetPosition);
    },

    /**
     * 购买成功时调用
     */
    onPurchaseSuccess(position, rarity) {
        const manager = window.effectTriggerManager;
        if (!manager) return;
        
        manager.triggerPurchaseEffect(position, rarity);
    },

    /**
     * 装备特效时调用
     */
    onEffectEquip(position) {
        const manager = window.effectTriggerManager;
        if (!manager) return;
        
        manager.triggerEquipEffect(position);
    }
};

// ============================================
// 初始化函数
// ============================================

function initEffectTrigger(scene, camera, effectItems3D) {
    const manager = new EffectTriggerManager(scene, camera, effectItems3D);
    window.effectTriggerManager = manager;
    
    // 关联装备系统
    if (window.effectEquipmentManager) {
        manager.setEquipmentManager(window.effectEquipmentManager);
    }
    
    console.log('⚡ 3D特效触发系统已初始化');
    return manager;
}

// ============================================
// 导出模块
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        EffectTriggerManager,
        EffectTriggers,
        initEffectTrigger
    };
}

export {
    EffectTriggerManager,
    EffectTriggers,
    initEffectTrigger
};
