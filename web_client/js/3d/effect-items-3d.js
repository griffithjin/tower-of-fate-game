/**
 * 命运塔 - 3D特效道具模型系统
 * Tower of Fate - 3D Effect Items System
 * 使用Three.js程序化生成3D特效道具
 */

// ============================================
// 3D特效道具模型生成器
// ============================================

class EffectItems3D {
    constructor(scene) {
        this.scene = scene;
        this.effectMeshes = new Map();
        this.particleSystems = new Map();
        this.animations = new Map();
        
        // 缓存材质以提高性能
        this.materialCache = new Map();
    }

    // ============================================
    // 材质缓存系统
    // ============================================
    
    getMaterial(key, createFn) {
        if (!this.materialCache.has(key)) {
            this.materialCache.set(key, createFn());
        }
        return this.materialCache.get(key);
    }

    // ============================================
    // 上升特效道具
    // ============================================

    /**
     * 筋斗云 - 史诗级上升特效
     * 半透明云朵，金色边框，飘动效果
     */
    createCloud3D() {
        const cloud = new THREE.Group();
        cloud.name = 'effect_cloud';
        
        // 创建云朵主体 - 多个球体组合
        const cloudColors = [0xffffff, 0xfff8dc, 0xffd700];
        const sphereCount = 5 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < sphereCount; i++) {
            const radius = 0.3 + Math.random() * 0.25;
            const geometry = new THREE.SphereGeometry(radius, 32, 32);
            
            const material = this.getMaterial(`cloud_${i}`, () => {
                return new THREE.MeshPhongMaterial({
                    color: cloudColors[Math.floor(Math.random() * cloudColors.length)],
                    transparent: true,
                    opacity: 0.75 + Math.random() * 0.15,
                    emissive: 0xffd700,
                    emissiveIntensity: 0.1,
                    shininess: 100
                });
            });
            
            const sphere = new THREE.Mesh(geometry, material);
            sphere.position.set(
                (Math.random() - 0.5) * 1.0,
                (Math.random() - 0.5) * 0.4,
                (Math.random() - 0.5) * 0.6
            );
            sphere.scale.set(
                0.8 + Math.random() * 0.4,
                0.8 + Math.random() * 0.4,
                0.8 + Math.random() * 0.4
            );
            
            cloud.add(sphere);
        }
        
        // 添加金色光环边框
        const ringGeometry = new THREE.TorusGeometry(0.6, 0.02, 16, 100);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.position.y = -0.2;
        cloud.add(ring);
        
        // 存储动画数据
        cloud.userData = {
            type: 'rise',
            effectId: 'cloud',
            animationType: 'float',
            speed: 0.02,
            amplitude: 0.1,
            phase: Math.random() * Math.PI * 2
        };
        
        return cloud;
    }

    /**
     * 火箭背包 - 传说级上升特效
     * 火箭+尾焰粒子，喷射火焰效果
     */
    createRocket3D() {
        const rocket = new THREE.Group();
        rocket.name = 'effect_rocket';
        
        // 火箭主体 - 圆锥体
        const bodyGeometry = new THREE.ConeGeometry(0.15, 0.6, 16);
        const bodyMaterial = new THREE.MeshPhongMaterial({
            color: 0xff3333,
            emissive: 0x880000,
            emissiveIntensity: 0.3,
            shininess: 80
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI;
        body.position.y = 0.2;
        rocket.add(body);
        
        // 火箭头部
        const noseGeometry = new THREE.ConeGeometry(0.12, 0.3, 16);
        const noseMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            shininess: 100
        });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.y = 0.65;
        rocket.add(nose);
        
        // 侧翼
        for (let i = 0; i < 4; i++) {
            const finGeometry = new THREE.BoxGeometry(0.02, 0.25, 0.15);
            const finMaterial = new THREE.MeshPhongMaterial({ color: 0xff6666 });
            const fin = new THREE.Mesh(finGeometry, finMaterial);
            const angle = (i / 4) * Math.PI * 2;
            fin.position.set(Math.cos(angle) * 0.12, -0.1, Math.sin(angle) * 0.12);
            fin.rotation.y = angle;
            rocket.add(fin);
        }
        
        // 创建尾焰粒子系统
        const flameParticles = this.createParticleSystem({
            color: 0xff6600,
            secondaryColor: 0xffcc00,
            count: 80,
            size: 0.08,
            lifetime: 600,
            spread: 0.2,
            velocity: { x: 0, y: -0.8, z: 0 }
        });
        flameParticles.position.y = -0.4;
        rocket.add(flameParticles);
        
        // 添加光晕效果
        const glowGeometry = new THREE.SphereGeometry(0.4, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4400,
            transparent: true,
            opacity: 0.2
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.y = -0.3;
        glow.scale.y = 0.5;
        rocket.add(glow);
        
        rocket.userData = {
            type: 'rise',
            effectId: 'rocket',
            animationType: 'rocket',
            speed: 0.05,
            particles: flameParticles
        };
        
        return rocket;
    }

    // ============================================
    // 下降特效道具
    // ============================================

    /**
     * 神奇降落伞 - 稀有级下降特效
     * 彩色伞面+绳索，缓慢飘落旋转
     */
    createParachute3D() {
        const parachute = new THREE.Group();
        parachute.name = 'effect_parachute';
        
        // 伞面 - 半球体，彩色分段
        const canopyColors = [0xff6b6b, 0xffd93d, 0x6bcf7f, 0x4d96ff];
        const segmentCount = 8;
        
        for (let i = 0; i < segmentCount; i++) {
            const segmentGeometry = new THREE.SphereGeometry(
                0.6, 16, 8, 
                (i / segmentCount) * Math.PI * 2, 
                (Math.PI * 2) / segmentCount, 
                0, 
                Math.PI / 2.2
            );
            const segmentMaterial = new THREE.MeshPhongMaterial({
                color: canopyColors[i % canopyColors.length],
                side: THREE.DoubleSide,
                shininess: 60
            });
            const segment = new THREE.Mesh(segmentGeometry, segmentMaterial);
            parachute.add(segment);
        }
        
        // 伞顶装饰
        const topGeometry = new THREE.SphereGeometry(0.08, 16, 16);
        const topMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0.58;
        parachute.add(top);
        
        // 绳索
        const ropePositions = [
            { x: 0.4, z: 0.4 }, { x: -0.4, z: 0.4 },
            { x: 0.4, z: -0.4 }, { x: -0.4, z: -0.4 }
        ];
        
        ropePositions.forEach(pos => {
            const ropeGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0.55, 0),
                new THREE.Vector3(pos.x * 0.8, 0.1, pos.z * 0.8),
                new THREE.Vector3(pos.x * 0.5, -0.3, pos.z * 0.5)
            ]);
            const ropeMaterial = new THREE.LineBasicMaterial({
                color: 0xffffff,
                linewidth: 2
            });
            const rope = new THREE.Line(ropeGeometry, ropeMaterial);
            parachute.add(rope);
        });
        
        parachute.userData = {
            type: 'fall',
            effectId: 'parachute',
            animationType: 'parachute',
            rotationSpeed: 0.01,
            swayAmplitude: 0.05,
            swaySpeed: 0.02
        };
        
        return parachute;
    }

    /**
     * 天使羽毛 - 史诗级下降特效
     * 白色羽毛，发光，轻盈飘落闪烁
     */
    createFeather3D() {
        const feather = new THREE.Group();
        feather.name = 'effect_feather';
        
        // 羽毛主体 - 使用多个平面组合模拟羽毛形状
        const featherGroup = new THREE.Group();
        
        // 主羽轴
        const shaftGeometry = new THREE.CylinderGeometry(0.01, 0.008, 0.8, 8);
        const shaftMaterial = new THREE.MeshPhongMaterial({ color: 0xf0f0f0 });
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.rotation.z = Math.PI / 2;
        featherGroup.add(shaft);
        
        // 羽毛叶片 - 左右两侧
        for (let side = -1; side <= 1; side += 2) {
            for (let i = 0; i < 12; i++) {
                const t = i / 11;
                const width = 0.15 * Math.sin(Math.PI * (1 - t));
                const height = 0.06;
                
                const barbGeometry = new THREE.PlaneGeometry(width, height);
                const barbMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 0.9,
                    side: THREE.DoubleSide,
                    emissive: 0xffffff,
                    emissiveIntensity: 0.2
                });
                
                const barb = new THREE.Mesh(barbGeometry, barbMaterial);
                barb.position.set(
                    side * width / 2,
                    0.35 - t * 0.7,
                    0
                );
                barb.rotation.z = side * 0.1;
                barb.rotation.y = side * t * 0.1;
                featherGroup.add(barb);
            }
        }
        
        feather.add(featherGroup);
        
        // 添加发光效果
        const glowGeometry = new THREE.PlaneGeometry(0.5, 1.0);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.z = -0.05;
        feather.add(glow);
        
        // 闪烁粒子
        const sparkleParticles = this.createParticleSystem({
            color: 0xffffff,
            count: 20,
            size: 0.03,
            lifetime: 1000,
            spread: 0.3,
            velocity: { x: 0, y: 0.1, z: 0 }
        });
        feather.add(sparkleParticles);
        
        feather.userData = {
            type: 'fall',
            effectId: 'feather',
            animationType: 'feather',
            rotationSpeed: 0.008,
            flutterSpeed: 0.03,
            particles: sparkleParticles
        };
        
        return feather;
    }

    // ============================================
    // 守卫激怒特效
    // ============================================

    /**
     * 激光眼 - 传说限定级激怒特效
     * 从守卫眼睛射出红色激光，命中爆炸
     */
    createLaserEye3D(from, to) {
        const laserGroup = new THREE.Group();
        laserGroup.name = 'effect_laser';
        
        const direction = new THREE.Vector3().subVectors(to, from).normalize();
        const distance = from.distanceTo(to);
        
        // 主激光束
        const laserGeometry = new THREE.CylinderGeometry(0.03, 0.03, distance, 16);
        const laserMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.9,
            emissive: 0xff0000,
            emissiveIntensity: 3
        });
        const laser = new THREE.Mesh(laserGeometry, laserMaterial);
        
        // 定位激光
        const midPoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
        laser.position.copy(midPoint);
        laser.lookAt(to);
        laser.rotateX(Math.PI / 2);
        
        laserGroup.add(laser);
        
        // 外层光晕
        const glowGeometry = new THREE.CylinderGeometry(0.08, 0.08, distance, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff3300,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(midPoint);
        glow.lookAt(to);
        glow.rotateX(Math.PI / 2);
        laserGroup.add(glow);
        
        // 发射点光晕
        const sourceGlowGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const sourceGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 5
        });
        const sourceGlow = new THREE.Mesh(sourceGlowGeometry, sourceGlowMaterial);
        sourceGlow.position.copy(from);
        laserGroup.add(sourceGlow);
        
        // 命中点爆炸效果
        const explosion = this.createExplosion3D(to);
        laserGroup.add(explosion);
        
        // 激光扫描线效果
        const scanLines = [];
        for (let i = 0; i < 3; i++) {
            const scanGeometry = new THREE.CylinderGeometry(0.01, 0.01, distance, 8);
            const scanMaterial = new THREE.MeshBasicMaterial({
                color: 0xffff00,
                transparent: true,
                opacity: 0.6
            });
            const scan = new THREE.Mesh(scanGeometry, scanMaterial);
            scan.position.copy(midPoint);
            scan.lookAt(to);
            scan.rotateX(Math.PI / 2);
            scan.userData = { offset: i * (distance / 3), speed: 2 + i * 0.5 };
            laserGroup.add(scan);
            scanLines.push(scan);
        }
        
        laserGroup.userData = {
            type: 'provoke',
            effectId: 'laser',
            animationType: 'laser',
            scanLines: scanLines,
            explosion: explosion,
            duration: 2000
        };
        
        return laserGroup;
    }

    /**
     * 创建爆炸效果
     */
    createExplosion3D(position) {
        const explosion = new THREE.Group();
        explosion.position.copy(position);
        
        // 核心爆炸球
        const coreGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0xffaa00,
            emissive: 0xff4400,
            emissiveIntensity: 2
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        explosion.add(core);
        
        // 爆炸粒子
        const particleColors = [0xff0000, 0xff6600, 0xffff00];
        for (let i = 0; i < 30; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.03 + Math.random() * 0.04, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: particleColors[Math.floor(Math.random() * particleColors.length)]
            });
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = 0.1 + Math.random() * 0.3;
            
            particle.position.set(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            );
            
            particle.userData = {
                velocity: particle.position.clone().normalize().multiplyScalar(0.1 + Math.random() * 0.1),
                life: 1.0
            };
            
            explosion.add(particle);
        }
        
        explosion.userData = {
            animationType: 'explosion',
            maxScale: 2.0
        };
        
        return explosion;
    }

    /**
     * 雷电链 - 史诗级激怒特效
     * 闪电从守卫劈向玩家，电光闪烁震动效果
     */
    createThunderChain3D(from, to) {
        const thunderGroup = new THREE.Group();
        thunderGroup.name = 'effect_thunder';
        
        // 生成闪电路径点
        const segments = 15;
        const points = [from.clone()];
        const direction = new THREE.Vector3().subVectors(to, from);
        
        for (let i = 1; i < segments; i++) {
            const t = i / segments;
            const basePoint = new THREE.Vector3().copy(from).add(direction.clone().multiplyScalar(t));
            
            // 添加随机偏移
            const offset = 0.15 * Math.sin(t * Math.PI);
            basePoint.x += (Math.random() - 0.5) * offset * 2;
            basePoint.z += (Math.random() - 0.5) * offset * 2;
            
            points.push(basePoint);
        }
        points.push(to.clone());
        
        // 创建多条闪电分支
        const lightningCount = 3;
        for (let l = 0; l < lightningCount; l++) {
            const lightningPoints = points.map((p, i) => {
                if (i === 0 || i === points.length - 1) return p;
                const offset = (0.1 + l * 0.05) * Math.sin((i / points.length) * Math.PI);
                return new THREE.Vector3(
                    p.x + (Math.random() - 0.5) * offset,
                    p.y,
                    p.z + (Math.random() - 0.5) * offset
                );
            });
            
            const lightningGeometry = new THREE.BufferGeometry().setFromPoints(lightningPoints);
            const lightningMaterial = new THREE.LineBasicMaterial({
                color: l === 0 ? 0x00ffff : 0x0088ff,
                linewidth: 3 - l,
                opacity: 0.8 + l * 0.1,
                transparent: true
            });
            
            const lightning = new THREE.Line(lightningGeometry, lightningMaterial);
            thunderGroup.add(lightning);
        }
        
        // 闪电光晕
        const glowPoints = points.map(p => p.clone());
        const glowGeometry = new THREE.BufferGeometry().setFromPoints(glowPoints);
        const glowMaterial = new THREE.LineBasicMaterial({
            color: 0x88ffff,
            linewidth: 8,
            transparent: true,
            opacity: 0.2,
            blending: THREE.AdditiveBlending
        });
        const glow = new THREE.Line(glowGeometry, glowMaterial);
        thunderGroup.add(glow);
        
        // 起点电光
        const sourceGlowGeometry = new THREE.SphereGeometry(0.2, 16, 16);
        const sourceGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            emissive: 0x00ffff,
            emissiveIntensity: 3,
            transparent: true,
            opacity: 0.8
        });
        const sourceGlow = new THREE.Mesh(sourceGlowGeometry, sourceGlowMaterial);
        sourceGlow.position.copy(from);
        thunderGroup.add(sourceGlow);
        
        // 终点爆炸
        const destExplosionGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const destExplosionMaterial = new THREE.MeshBasicMaterial({
            color: 0x0088ff,
            emissive: 0x0044ff,
            emissiveIntensity: 2,
            transparent: true,
            opacity: 0.7
        });
        const destExplosion = new THREE.Mesh(destExplosionGeometry, destExplosionMaterial);
        destExplosion.position.copy(to);
        thunderGroup.add(destExplosion);
        
        // 震动粒子
        const sparkParticles = this.createParticleSystem({
            color: 0x00ffff,
            secondaryColor: 0xffffff,
            count: 50,
            size: 0.05,
            lifetime: 300,
            spread: 0.4,
            velocity: { x: 0.3, y: 0.3, z: 0.3 }
        });
        sparkParticles.position.copy(to);
        thunderGroup.add(sparkParticles);
        
        thunderGroup.userData = {
            type: 'provoke',
            effectId: 'thunder',
            animationType: 'thunder',
            flashSpeed: 50,
            shakeIntensity: 0.1,
            duration: 1500
        };
        
        return thunderGroup;
    }

    // ============================================
    // 粒子系统
    // ============================================

    /**
     * 创建粒子系统
     */
    createParticleSystem(config) {
        const {
            color = 0xffffff,
            secondaryColor = null,
            count = 50,
            size = 0.05,
            lifetime = 1000,
            spread = 0.2,
            velocity = { x: 0, y: 0.1, z: 0 }
        } = config;
        
        const particleGroup = new THREE.Group();
        particleGroup.name = 'particle_system';
        
        const particles = [];
        
        for (let i = 0; i < count; i++) {
            const particleGeometry = new THREE.PlaneGeometry(size, size);
            const particleColor = secondaryColor && Math.random() > 0.5 ? secondaryColor : color;
            
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: particleColor,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide,
                blending: THREE.AdditiveBlending
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // 随机初始位置
            particle.position.set(
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread,
                (Math.random() - 0.5) * spread
            );
            
            particle.userData = {
                initialPosition: particle.position.clone(),
                velocity: new THREE.Vector3(
                    velocity.x + (Math.random() - 0.5) * 0.1,
                    velocity.y + Math.random() * 0.1,
                    velocity.z + (Math.random() - 0.5) * 0.1
                ),
                life: Math.random() * lifetime,
                maxLife: lifetime,
                phase: Math.random() * Math.PI * 2
            };
            
            particleGroup.add(particle);
            particles.push(particle);
        }
        
        particleGroup.userData = {
            particles: particles,
            config: config
        };
        
        return particleGroup;
    }

    /**
     * 更新粒子系统
     */
    updateParticleSystem(particleGroup, deltaTime) {
        const particles = particleGroup.userData.particles;
        const config = particleGroup.userData.config;
        
        particles.forEach(particle => {
            const data = particle.userData;
            
            // 更新位置
            particle.position.add(data.velocity.clone().multiplyScalar(deltaTime * 0.001));
            
            // 更新生命周期
            data.life -= deltaTime;
            
            if (data.life <= 0) {
                // 重置粒子
                data.life = data.maxLife;
                particle.position.copy(data.initialPosition);
                particle.material.opacity = 0.8;
            } else {
                // 根据生命周期调整透明度
                const lifeRatio = data.life / data.maxLife;
                particle.material.opacity = lifeRatio * 0.8;
                
                // 闪烁效果
                if (config.twinkle) {
                    particle.material.opacity *= 0.5 + 0.5 * Math.sin(Date.now() * 0.01 + data.phase);
                }
            }
            
            // 面向相机
            particle.lookAt(camera.position);
        });
    }

    // ============================================
    // 特效获取器
    // ============================================

    getEffect(effectId, params = {}) {
        switch (effectId) {
            case 'cloud':
                return this.createCloud3D();
            case 'rocket':
                return this.createRocket3D();
            case 'parachute':
                return this.createParachute3D();
            case 'feather':
                return this.createFeather3D();
            case 'laser':
                return this.createLaserEye3D(params.from, params.to);
            case 'thunder':
                return this.createThunderChain3D(params.from, params.to);
            default:
                console.warn(`未知的特效ID: ${effectId}`);
                return null;
        }
    }

    // ============================================
    // 动画更新
    // ============================================

    updateEffect(effectMesh, deltaTime, elapsedTime) {
        if (!effectMesh || !effectMesh.userData) return;
        
        const data = effectMesh.userData;
        
        switch (data.animationType) {
            case 'float':
                // 漂浮动画
                effectMesh.position.y += Math.sin(elapsedTime * data.speed + data.phase) * data.amplitude * 0.1;
                effectMesh.rotation.y += data.speed * 0.5;
                break;
                
            case 'rocket':
                // 火箭抖动
                effectMesh.rotation.z = Math.sin(elapsedTime * 0.02) * 0.05;
                // 更新粒子
                if (data.particles) {
                    this.updateParticleSystem(data.particles, deltaTime);
                }
                break;
                
            case 'parachute':
                // 降落伞摇摆
                effectMesh.rotation.y += data.rotationSpeed;
                effectMesh.rotation.z = Math.sin(elapsedTime * data.swaySpeed) * data.swayAmplitude;
                break;
                
            case 'feather':
                // 羽毛飘动
                effectMesh.rotation.x = Math.sin(elapsedTime * data.flutterSpeed) * 0.3;
                effectMesh.rotation.z = Math.cos(elapsedTime * data.flutterSpeed * 0.7) * 0.3;
                effectMesh.rotation.y += data.rotationSpeed;
                
                // 上下漂移
                effectMesh.position.y += Math.sin(elapsedTime * 0.001) * 0.01;
                
                // 更新粒子
                if (data.particles) {
                    this.updateParticleSystem(data.particles, deltaTime);
                }
                break;
                
            case 'laser':
                // 激光扫描线动画
                if (data.scanLines) {
                    data.scanLines.forEach((scan, i) => {
                        const offset = (elapsedTime * scan.userData.speed * 0.001 + scan.userData.offset) % 2;
                        scan.material.opacity = offset < 1 ? 0.6 : 0.2;
                    });
                }
                break;
                
            case 'thunder':
                // 雷电闪烁
                const flash = Math.sin(elapsedTime * 0.1) > 0.7;
                effectMesh.children.forEach(child => {
                    if (child.material) {
                        child.material.opacity = flash ? 1 : 0.6 + Math.random() * 0.3;
                    }
                });
                break;
        }
    }

    // ============================================
    // 资源清理
    // ============================================

    disposeEffect(effectMesh) {
        if (!effectMesh) return;
        
        effectMesh.traverse(child => {
            if (child.geometry) {
                child.geometry.dispose();
            }
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach(m => m.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        
        if (this.scene) {
            this.scene.remove(effectMesh);
        }
    }

    disposeAll() {
        this.materialCache.forEach(material => material.dispose());
        this.materialCache.clear();
    }
}

// ============================================
// 导出模块
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { EffectItems3D };
}

export { EffectItems3D };
