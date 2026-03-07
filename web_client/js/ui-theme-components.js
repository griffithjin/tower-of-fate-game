/**
 * Allegro 最强模式 - 5个创新UI主题组件
 * 
 * 1. ClassicGameUI - 经典版
 * 2. Tower3DClimbingUI - 3D攀登塔楼
 * 3. CardArenaUI - 卡牌对决竞技场
 * 4. TournamentHallUI - 锦标赛大厅
 * 5. PostcardMuseumUI - 3D明信片收藏馆
 * 6. CommandRoomUI - 团队作战指挥室
 */

// ==================== 1. 经典版UI ====================
class ClassicGameUI {
    constructor(container) {
        this.container = container || document.getElementById('gameContainer');
        this.theme = UI_THEMES?.classic;
        this.isInitialized = false;
    }
    
    async init() {
        console.log('[ClassicUI] 初始化经典版UI');
        this.render();
        this.bindEvents();
        this.isInitialized = true;
        return this;
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="allegro-theme classic-theme">
                <div class="classic-header">
                    <div class="streak-display">
                        <span class="fire-icon">🔥</span>
                        <span class="streak-count" id="streakCount">0</span>
                        <span class="fire-icon">🔥</span>
                    </div>
                    <div class="streak-label">当前连胜</div>
                </div>
                
                <div class="classic-game-board">
                    <div class="hand-section left">
                        <div class="section-title">🎴 我的手牌</div>
                        <div class="hand-container" id="handContainer"></div>
                    </div>
                    
                    <div class="battle-section center">
                        <div class="guard-display" id="guardDisplay">
                            <div class="guard-card-stack">
                                <div class="card-back"></div>
                                <div class="card-back"></div>
                                <div class="card-back"></div>
                                <div class="guard-count" id="guardCount">4</div>
                            </div>
                        </div>
                        <div class="vs-badge">VS</div>
                        <div class="selected-card-slot" id="selectedCardSlot">
                            <span class="placeholder">选择卡牌</span>
                        </div>
                    </div>
                    
                    <div class="info-section right">
                        <div class="level-info">
                            <div class="info-label">当前层数</div>
                            <div class="info-value" id="currentLevel">2/A</div>
                        </div>
                        <div class="cards-info">
                            <div class="info-label">剩余手牌</div>
                            <div class="info-value" id="cardsRemaining">52</div>
                        </div>
                    </div>
                </div>
                
                <div class="classic-controls">
                    <button class="btn-primary" id="playBtn" onclick="streakGame.playRound()">出牌</button>
                    <button class="btn-secondary" id="quitBtn" onclick="streakGame.quitRun()">放弃</button>
                </div>
            </div>
        `;
        
        this.applyStyles();
    }
    
    applyStyles() {
        const styles = `
            .classic-theme {
                font-family: 'Microsoft YaHei', sans-serif;
                color: #fff;
                padding: 20px;
            }
            
            .classic-header {
                text-align: center;
                padding: 20px;
                background: linear-gradient(135deg, rgba(255,107,0,0.2), rgba(255,0,0,0.2));
                border-radius: 15px;
                margin-bottom: 20px;
                border: 2px solid rgba(255,100,0,0.5);
            }
            
            .streak-display {
                font-size: 48px;
                font-weight: bold;
                color: #ff6b00;
                text-shadow: 0 0 30px rgba(255,100,0,0.8);
            }
            
            .fire-icon { animation: fire-pulse 0.5s ease-in-out infinite alternate; }
            
            @keyframes fire-pulse {
                0% { transform: scale(1); }
                100% { transform: scale(1.2); }
            }
            
            .streak-label {
                font-size: 14px;
                color: #ff9d00;
                margin-top: 5px;
            }
            
            .classic-game-board {
                display: grid;
                grid-template-columns: 1fr 200px 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }
            
            .section-title {
                font-size: 14px;
                color: #888;
                margin-bottom: 15px;
                text-align: center;
            }
            
            .hand-container {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: center;
                min-height: 200px;
                padding: 15px;
                background: rgba(0,0,0,0.3);
                border-radius: 15px;
            }
            
            .battle-section {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                gap: 15px;
            }
            
            .card-back {
                width: 70px;
                height: 95px;
                background: linear-gradient(135deg, #4a0080, #2a0040);
                border-radius: 8px;
                border: 2px solid #ffd700;
            }
            
            .guard-card-stack {
                position: relative;
                width: 70px;
                height: 95px;
            }
            
            .guard-card-stack .card-back {
                position: absolute;
            }
            
            .guard-card-stack .card-back:nth-child(1) { transform: rotate(-3deg); }
            .guard-card-stack .card-back:nth-child(2) { transform: rotate(2deg); top: 3px; left: 3px; }
            .guard-card-stack .card-back:nth-child(3) { transform: rotate(-1deg); top: 6px; left: 1px; }
            
            .guard-count {
                position: absolute;
                bottom: -10px;
                right: -10px;
                width: 28px;
                height: 28px;
                background: linear-gradient(45deg, #ff6b00, #ff9500);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 12px;
                border: 2px solid #fff;
            }
            
            .vs-badge {
                width: 50px;
                height: 50px;
                background: linear-gradient(45deg, #ffd700, #ff6b6b);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: 18px;
                color: #000;
                animation: vs-pulse 1s ease-in-out infinite;
            }
            
            @keyframes vs-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); box-shadow: 0 0 20px rgba(255,215,0,0.5); }
            }
            
            .selected-card-slot {
                width: 70px;
                height: 95px;
                background: rgba(255,255,255,0.1);
                border-radius: 8px;
                border: 2px dashed rgba(255,215,0,0.5);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                color: #888;
            }
            
            .info-section {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .level-info, .cards-info {
                background: rgba(0,0,0,0.3);
                padding: 15px;
                border-radius: 10px;
                text-align: center;
            }
            
            .info-label {
                font-size: 12px;
                color: #888;
                margin-bottom: 5px;
            }
            
            .info-value {
                font-size: 24px;
                font-weight: bold;
                color: #ffd700;
            }
            
            .classic-controls {
                display: flex;
                justify-content: center;
                gap: 15px;
            }
            
            .btn-primary, .btn-secondary {
                padding: 12px 30px;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
                font-weight: bold;
            }
            
            .btn-primary {
                background: linear-gradient(45deg, #ffd700, #ffaa00);
                color: #000;
            }
            
            .btn-secondary {
                background: rgba(255,255,255,0.1);
                color: #fff;
                border: 1px solid rgba(255,255,255,0.3);
            }
            
            .btn-primary:hover, .btn-secondary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(255,215,0,0.3);
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    bindEvents() {
        // 绑定游戏事件
    }
    
    update(data) {
        const streakEl = document.getElementById('streakCount');
        const levelEl = document.getElementById('currentLevel');
        const cardsEl = document.getElementById('cardsRemaining');
        const guardEl = document.getElementById('guardCount');
        
        if (streakEl) streakEl.textContent = data.streak || 0;
        if (levelEl) levelEl.textContent = data.level || '2/A';
        if (cardsEl) cardsEl.textContent = data.cardsRemaining || 52;
        if (guardEl) guardEl.textContent = data.guards || 4;
    }
    
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.isInitialized = false;
    }
}

// ==================== 2. 3D攀登塔楼UI ====================
class Tower3DClimbingUI {
    constructor(container) {
        this.container = container || document.getElementById('gameContainer');
        this.theme = UI_THEMES?.['3d-tower'];
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.tower = null;
        this.clouds = [];
        this.currentLayer = 0;
        this.isInitialized = false;
    }
    
    async init() {
        console.log('[Tower3D] 初始化3D攀登塔楼UI');
        
        // 检查WebGL支持
        if (!this.checkWebGL()) {
            console.warn('[Tower3D] WebGL不支持，回退到经典版');
            return new ClassicGameUI(this.container).init();
        }
        
        await this.loadThreeJS();
        this.render();
        this.init3DScene();
        this.bindEvents();
        this.animate();
        
        this.isInitialized = true;
        return this;
    }
    
    checkWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    }
    
    async loadThreeJS() {
        if (typeof THREE !== 'undefined') return;
        
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="allegro-theme tower-3d-theme">
                <div class="tower-3d-container">
                    <canvas id="tower3dCanvas" class="tower-3d-canvas"></canvas>
                    
                    <div class="tower-3d-ui">
                        <div class="tower-header">
                            <div class="streak-ring">
                                <svg viewBox="0 0 100 100">
                                    <circle class="ring-bg" cx="50" cy="50" r="45"/>
                                    <circle class="ring-progress" cx="50" cy="50" r="45" id="streakRing"/>
                                </svg>
                                <div class="streak-number" id="streakCount">0</div>
                            </div>
                            <div class="tower-info">
                                <div class="layer-indicator">
                                    <span class="layer-label">当前层数</span>
                                    <span class="layer-value" id="currentLayer">1F</span>
                                </div>
                                <div class="height-indicator">
                                    <span class="height-icon">📏</span>
                                    <span id="currentHeight">0m</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="tower-controls">
                            <button class="tower-btn climb-btn" id="playBtn">
                                <span class="btn-icon">🧗</span>
                                <span class="btn-text">攀登</span>
                            </button>
                            <button class="tower-btn rotate-btn" id="rotateBtn">
                                <span class="btn-icon">🔄</span>
                            </button>
                        </div>
                        
                        <div class="hand-panel">
                            <div class="hand-label">手牌</div>
                            <div class="hand-scroll" id="handContainer"></div>
                        </div>
                    </div>
                    
                    <div class="cloud-layer" id="cloudLayer"></div>
                </div>
            </div>
        `;
        
        this.applyStyles();
    }
    
    applyStyles() {
        const styles = `
            .tower-3d-theme {
                position: relative;
                width: 100%;
                height: 100vh;
                overflow: hidden;
                background: linear-gradient(180deg, #0c0c2e 0%, #1a0a3e 50%, #0d2b4a 100%);
            }
            
            .tower-3d-canvas {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
            
            .tower-3d-ui {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
            }
            
            .tower-3d-ui > * {
                pointer-events: auto;
            }
            
            .tower-header {
                position: absolute;
                top: 20px;
                left: 20px;
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .streak-ring {
                width: 80px;
                height: 80px;
                position: relative;
            }
            
            .streak-ring svg {
                width: 100%;
                height: 100%;
                transform: rotate(-90deg);
            }
            
            .ring-bg {
                fill: none;
                stroke: rgba(255,255,255,0.1);
                stroke-width: 8;
            }
            
            .ring-progress {
                fill: none;
                stroke: #00d4ff;
                stroke-width: 8;
                stroke-linecap: round;
                stroke-dasharray: 283;
                stroke-dashoffset: 283;
                transition: stroke-dashoffset 0.5s ease;
            }
            
            .streak-number {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 24px;
                font-weight: bold;
                color: #00d4ff;
            }
            
            .tower-info {
                color: #fff;
            }
            
            .layer-indicator {
                margin-bottom: 5px;
            }
            
            .layer-label {
                font-size: 12px;
                color: rgba(255,255,255,0.6);
                margin-right: 10px;
            }
            
            .layer-value {
                font-size: 20px;
                font-weight: bold;
                color: #ffd700;
            }
            
            .height-indicator {
                font-size: 14px;
                color: rgba(255,255,255,0.8);
            }
            
            .tower-controls {
                position: absolute;
                bottom: 200px;
                left: 50%;
                transform: translateX(-50%);
                display: flex;
                gap: 15px;
            }
            
            .tower-btn {
                padding: 15px 30px;
                border: none;
                border-radius: 50px;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .climb-btn {
                background: linear-gradient(45deg, #00d4ff, #7b2cbf);
                color: #fff;
                font-weight: bold;
            }
            
            .rotate-btn {
                width: 50px;
                height: 50px;
                padding: 0;
                justify-content: center;
                background: rgba(255,255,255,0.1);
                color: #fff;
                border: 1px solid rgba(255,255,255,0.3);
            }
            
            .hand-panel {
                position: absolute;
                bottom: 20px;
                left: 20px;
                right: 20px;
                background: rgba(0,0,0,0.5);
                border-radius: 15px;
                padding: 15px;
                backdrop-filter: blur(10px);
            }
            
            .hand-label {
                font-size: 12px;
                color: rgba(255,255,255,0.6);
                margin-bottom: 10px;
            }
            
            .hand-scroll {
                display: flex;
                gap: 10px;
                overflow-x: auto;
                padding-bottom: 5px;
            }
            
            .cloud-layer {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
            }
            
            .cloud {
                position: absolute;
                background: radial-gradient(ellipse at center, rgba(255,255,255,0.3) 0%, transparent 70%);
                border-radius: 50%;
                animation: cloud-float 20s linear infinite;
            }
            
            @keyframes cloud-float {
                0% { transform: translateX(-100px); }
                100% { transform: translateX(calc(100vw + 100px)); }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    init3DScene() {
        const canvas = document.getElementById('tower3dCanvas');
        if (!canvas || typeof THREE === 'undefined') return;
        
        // 场景
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0c0c2e, 0.02);
        
        // 相机
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 10, 0);
        
        // 渲染器
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // 灯光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0x00d4ff, 0.8);
        directionalLight.position.set(10, 20, 10);
        this.scene.add(directionalLight);
        
        // 创建塔
        this.createTower();
        
        // 创建云层
        this.createClouds();
        
        // 窗口大小调整
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    createTower() {
        this.tower = new THREE.Group();
        
        // 创建13层塔
        for (let i = 0; i < 13; i++) {
            const layer = this.createTowerLayer(i);
            layer.position.y = i * 2;
            this.tower.add(layer);
        }
        
        this.scene.add(this.tower);
    }
    
    createTowerLayer(index) {
        const layer = new THREE.Group();
        
        // 平台
        const platformGeometry = new THREE.CylinderGeometry(3 - index * 0.1, 3.2 - index * 0.1, 0.5, 8);
        const platformMaterial = new THREE.MeshPhongMaterial({
            color: index % 2 === 0 ? 0x00d4ff : 0x7b2cbf,
            emissive: index % 2 === 0 ? 0x0044aa : 0x3b0c6f,
            emissiveIntensity: 0.3
        });
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        layer.add(platform);
        
        // 层数标识
        const labelGeometry = new THREE.RingGeometry(2.5, 2.7, 32);
        const labelMaterial = new THREE.MeshBasicMaterial({ 
            color: 0xffd700,
            side: THREE.DoubleSide
        });
        const label = new THREE.Mesh(labelGeometry, labelMaterial);
        label.rotation.x = -Math.PI / 2;
        label.position.y = 0.3;
        layer.add(label);
        
        // 柱子
        for (let j = 0; j < 4; j++) {
            const pillarGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
            const pillarMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            const angle = (j / 4) * Math.PI * 2;
            pillar.position.set(Math.cos(angle) * 2.5, 1, Math.sin(angle) * 2.5);
            layer.add(pillar);
        }
        
        return layer;
    }
    
    createClouds() {
        const cloudGeometry = new THREE.SphereGeometry(2, 16, 16);
        const cloudMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.2
        });
        
        for (let i = 0; i < 10; i++) {
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.position.set(
                (Math.random() - 0.5) * 40,
                5 + Math.random() * 20,
                (Math.random() - 0.5) * 40 - 10
            );
            cloud.scale.set(1 + Math.random(), 0.5 + Math.random() * 0.5, 1 + Math.random());
            this.scene.add(cloud);
            this.clouds.push({
                mesh: cloud,
                speed: 0.01 + Math.random() * 0.02
            });
        }
    }
    
    animate() {
        if (!this.isInitialized) return;
        
        requestAnimationFrame(() => this.animate());
        
        // 旋转塔
        if (this.tower) {
            this.tower.rotation.y += 0.002;
        }
        
        // 移动云层
        this.clouds.forEach(cloud => {
            cloud.mesh.position.x += cloud.speed;
            if (cloud.mesh.position.x > 20) {
                cloud.mesh.position.x = -20;
            }
        });
        
        // 渲染
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    climbToLayer(layerIndex) {
        this.currentLayer = layerIndex;
        
        // 高亮当前层
        if (this.tower) {
            this.tower.children.forEach((layer, i) => {
                const platform = layer.children[0];
                if (platform) {
                    platform.material.emissiveIntensity = i === layerIndex ? 0.8 : 0.3;
                }
            });
        }
        
        // 更新UI
        document.getElementById('currentLayer').textContent = `${layerIndex + 1}F`;
        document.getElementById('currentHeight').textContent = `${layerIndex * 10}m`;
    }
    
    bindEvents() {
        const rotateBtn = document.getElementById('rotateBtn');
        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => {
                if (this.tower) {
                    this.tower.rotation.y += Math.PI / 2;
                }
            });
        }
    }
    
    update(data) {
        if (data.streak !== undefined) {
            document.getElementById('streakCount').textContent = data.streak;
            const ring = document.getElementById('streakRing');
            if (ring) {
                const offset = 283 - (data.streak / 13) * 283;
                ring.style.strokeDashoffset = offset;
            }
        }
        
        if (data.level !== undefined) {
            const layerIndex = parseInt(data.level) - 1;
            this.climbToLayer(Math.max(0, layerIndex));
        }
    }
    
    destroy() {
        this.isInitialized = false;
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// ==================== 3. 卡牌对决竞技场UI (简化版) ====================
class CardArenaUI {
    constructor(container) {
        this.container = container || document.getElementById('gameContainer');
        this.theme = UI_THEMES?.['card-arena'];
        this.isInitialized = false;
    }
    
    async init() {
        console.log('[CardArena] 初始化卡牌对决竞技场UI');
        this.render();
        this.bindEvents();
        this.isInitialized = true;
        return this;
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="allegro-theme card-arena-theme">
                <div class="arena-background">
                    <div class="arena-spotlight"></div>
                </div>
                
                <div class="arena-header">
                    <div class="arena-title">⚔️ 卡牌竞技场</div>
                    <div class="arena-streak">
                        <span class="streak-flame">🔥</span>
                        <span id="streakCount">0</span>
                        <span class="streak-flame">🔥</span>
                    </div>
                </div>
                
                <div class="arena-battlefield">
                    <div class="player-side">
                        <div class="player-avatar">
                            <div class="avatar-frame">
                                <span class="avatar-icon">🧙‍♂️</span>
                            </div>
                            <div class="player-name">挑战者</div>
                        </div>
                        <div class="player-cards" id="handContainer"></div>
                    </div>
                    
                    <div class="arena-center">
                        <div class="vs-container">
                            <div class="vs-circle">
                                <span class="vs-text">VS</span>
                                <div class="vs-glow"></div>
                            </div>
                        </div>
                        
                        <div class="battle-arena">
                            <div class="card-slot player-slot" id="playerCardSlot">
                                <span class="slot-text">选择卡牌</span>
                            </div>
                            <div class="impact-effect" id="impactEffect">💥</div>
                            <div class="card-slot opponent-slot" id="opponentCardSlot">
                                <div class="guard-card">🛡️</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="opponent-side">
                        <div class="opponent-avatar">
                            <div class="avatar-frame enemy">
                                <span class="avatar-icon">👹</span>
                            </div>
                            <div class="opponent-name">守卫</div>
                        </div>
                        <div class="guard-count-display">
                            <span id="guardCount">4</span> 张守卫
                        </div>
                    </div>
                </div>
                
                <div class="arena-controls">
                    <button class="arena-btn battle-btn" id="playBtn">
                        <span class="btn-effect"></span>
                        <span class="btn-text">⚔️ 出击</span>
                    </button>
                </div>
                
                <div class="arena-stats">
                    <div class="stat-item">
                        <span class="stat-label">层数</span>
                        <span class="stat-value" id="currentLevel">2/A</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">剩余</span>
                        <span class="stat-value" id="cardsRemaining">52</span>
                    </div>
                </div>
            </div>
        `;
        
        this.applyStyles();
    }
    
    applyStyles() {
        const styles = `
            .card-arena-theme {
                position: relative;
                width: 100%;
                min-height: 100vh;
                background: linear-gradient(180deg, #1a0a0a 0%, #2d1b1b 50%, #1a0d0d 100%);
                overflow: hidden;
            }
            
            .arena-background {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: 
                    radial-gradient(ellipse at center, rgba(255,107,53,0.1) 0%, transparent 70%),
                    url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ff6b35' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            }
            
            .arena-spotlight {
                position: absolute;
                top: -50%;
                left: 50%;
                transform: translateX(-50%);
                width: 600px;
                height: 600px;
                background: radial-gradient(ellipse at center, rgba(255,107,53,0.3) 0%, transparent 70%);
                animation: spotlight-pulse 3s ease-in-out infinite;
            }
            
            @keyframes spotlight-pulse {
                0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
                50% { opacity: 0.8; transform: translateX(-50%) scale(1.1); }
            }
            
            .arena-header {
                position: relative;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                z-index: 10;
            }
            
            .arena-title {
                font-size: 24px;
                font-weight: bold;
                color: #ff6b35;
                text-shadow: 0 0 20px rgba(255,107,53,0.5);
            }
            
            .arena-streak {
                font-size: 32px;
                font-weight: bold;
                color: #ffd700;
            }
            
            .streak-flame {
                animation: flame-flicker 0.5s ease-in-out infinite alternate;
            }
            
            @keyframes flame-flicker {
                0% { transform: scale(1); }
                100% { transform: scale(1.2); }
            }
            
            .arena-battlefield {
                position: relative;
                display: grid;
                grid-template-columns: 1fr 300px 1fr;
                gap: 30px;
                padding: 40px;
                z-index: 10;
            }
            
            .player-side, .opponent-side {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            
            .player-avatar, .opponent-avatar {
                margin-bottom: 20px;
            }
            
            .avatar-frame {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: linear-gradient(45deg, #667eea, #764ba2);
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid #ffd700;
                box-shadow: 0 0 20px rgba(255,215,0,0.3);
            }
            
            .avatar-frame.enemy {
                background: linear-gradient(45deg, #ff6b35, #f7931e);
                border-color: #ff3333;
            }
            
            .avatar-icon {
                font-size: 40px;
            }
            
            .player-name, .opponent-name {
                text-align: center;
                margin-top: 10px;
                color: #fff;
                font-weight: bold;
            }
            
            .player-cards {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                justify-content: center;
                max-width: 200px;
            }
            
            .guard-count-display {
                color: #ff6b35;
                font-weight: bold;
                font-size: 18px;
            }
            
            .arena-center {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }
            
            .vs-container {
                margin-bottom: 30px;
            }
            
            .vs-circle {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: linear-gradient(45deg, #ff6b35, #f7931e);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                animation: vs-pulse-arena 1s ease-in-out infinite;
            }
            
            @keyframes vs-pulse-arena {
                0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(255,107,53,0.5); }
                50% { transform: scale(1.1); box-shadow: 0 0 40px rgba(255,107,53,0.8); }
            }
            
            .vs-text {
                font-size: 28px;
                font-weight: bold;
                color: #000;
            }
            
            .battle-arena {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .card-slot {
                width: 80px;
                height: 110px;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
            }
            
            .player-slot {
                background: rgba(255,255,255,0.1);
                border: 2px dashed rgba(255,215,0,0.5);
                color: #888;
            }
            
            .opponent-slot {
                background: linear-gradient(135deg, #4a0080, #2a0040);
                border: 3px solid #ff3333;
                font-size: 40px;
            }
            
            .impact-effect {
                font-size: 40px;
                opacity: 0;
                animation: impact-anim 0.5s ease-out;
            }
            
            @keyframes impact-anim {
                0% { transform: scale(0); opacity: 1; }
                50% { transform: scale(1.5); opacity: 1; }
                100% { transform: scale(2); opacity: 0; }
            }
            
            .arena-controls {
                position: relative;
                display: flex;
                justify-content: center;
                padding: 20px;
                z-index: 10;
            }
            
            .arena-btn {
                padding: 18px 50px;
                border: none;
                border-radius: 50px;
                font-size: 20px;
                font-weight: bold;
                cursor: pointer;
                position: relative;
                overflow: hidden;
                background: linear-gradient(45deg, #ff6b35, #f7931e);
                color: #fff;
                text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                box-shadow: 0 5px 20px rgba(255,107,53,0.4);
                transition: all 0.3s;
            }
            
            .arena-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 30px rgba(255,107,53,0.6);
            }
            
            .btn-effect {
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                transition: left 0.5s;
            }
            
            .arena-btn:hover .btn-effect {
                left: 100%;
            }
            
            .arena-stats {
                position: relative;
                display: flex;
                justify-content: center;
                gap: 30px;
                padding: 20px;
                z-index: 10;
            }
            
            .stat-item {
                text-align: center;
                color: #fff;
            }
            
            .stat-label {
                font-size: 12px;
                color: rgba(255,255,255,0.6);
                display: block;
                margin-bottom: 5px;
            }
            
            .stat-value {
                font-size: 24px;
                font-weight: bold;
                color: #ffd700;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    bindEvents() {}
    
    playCardAnimation() {
        const impact = document.getElementById('impactEffect');
        if (impact) {
            impact.style.animation = 'none';
            setTimeout(() => {
                impact.style.animation = 'impact-anim 0.5s ease-out';
            }, 10);
        }
    }
    
    update(data) {
        const streakEl = document.getElementById('streakCount');
        const levelEl = document.getElementById('currentLevel');
        const cardsEl = document.getElementById('cardsRemaining');
        const guardEl = document.getElementById('guardCount');
        
        if (streakEl) streakEl.textContent = data.streak || 0;
        if (levelEl) levelEl.textContent = data.level || '2/A';
        if (cardsEl) cardsEl.textContent = data.cardsRemaining || 52;
        if (guardEl) guardEl.textContent = data.guards || 4;
    }
    
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.isInitialized = false;
    }
}

// ==================== 4. 锦标赛大厅UI (简化版) ====================
class TournamentHallUI {
    constructor(container) {
        this.container = container || document.getElementById('gameContainer');
        this.theme = UI_THEMES?.['tournament-hall'];
        this.isInitialized = false;
    }
    
    async init() {
        console.log('[TournamentHall] 初始化锦标赛大厅UI');
        this.render();
        this.startLiveUpdates();
        this.isInitialized = true;
        return this;
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="allegro-theme tournament-hall-theme">
                <div class="hall-header">
                    <div class="hall-title">🏆 锦标赛大厅</div>
                    <div class="online-counter">
                        <span class="live-dot"></span>
                        <span id="onlineCount">1,234</span> 在线
                    </div>
                </div>
                
                <div class="hall-layout">
                    <div class="matches-section">
                        <div class="section-header">
                            <h3>🔥 正在进行</h3>
                            <button class="refresh-btn" onclick="this.closest('.tournament-hall-theme').dispatchEvent(new CustomEvent('refreshMatches'))">🔄</button>
                        </div>
                        <div class="matches-grid" id="matchesGrid"></div>
                    </div>
                    
                    <div class="sidebar-section">
                        <div class="my-status">
                            <div class="status-header">
                                <span class="status-icon">🎮</span>
                                <span>我的挑战</span>
                            </div>
                            <div class="streak-badge">
                                <span class="badge-flame">🔥</span>
                                <span class="badge-count" id="streakCount">0</span>
                                <span class="badge-label">连胜</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="streakProgress" style="width: 0%"></div>
                            </div>
                            <div class="status-info">
                                <span>层数: <strong id="currentLevel">2/A</strong></span>
                                <span>手牌: <strong id="cardsRemaining">52</strong></span>
                            </div>
                        </div>
                        
                        <div class="world-chat">
                            <div class="chat-header">💬 世界聊天</div>
                            <div class="chat-messages" id="chatMessages"></div>
                            <div class="chat-input">
                                <input type="text" placeholder="发送消息..." id="chatInput">
                                <button onclick="this.closest('.tournament-hall-theme').dispatchEvent(new CustomEvent('sendChat'))">发送</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="hall-controls">
                    <button class="hall-btn primary" id="playBtn">开始对战</button>
                    <button class="hall-btn secondary" id="spectateBtn">观战</button>
                </div>
            </div>
        `;
        
        this.applyStyles();
        this.generateMockMatches();
        this.generateMockChat();
    }
    
    applyStyles() {
        const styles = `
            .tournament-hall-theme {
                width: 100%;
                min-height: 100vh;
                background: linear-gradient(180deg, #0a1a1a 0%, #0a2e1a 50%, #0d1b2a 100%);
                color: #fff;
            }
            
            .hall-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: rgba(0,0,0,0.3);
                border-bottom: 1px solid rgba(0,255,136,0.3);
            }
            
            .hall-title {
                font-size: 24px;
                font-weight: bold;
                color: #00ff88;
                text-shadow: 0 0 10px rgba(0,255,136,0.5);
            }
            
            .online-counter {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #00ccff;
                font-weight: bold;
            }
            
            .live-dot {
                width: 10px;
                height: 10px;
                background: #00ff00;
                border-radius: 50%;
                animation: live-pulse 1s ease-in-out infinite;
            }
            
            @keyframes live-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .hall-layout {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 20px;
                padding: 20px;
            }
            
            .matches-section {
                background: rgba(0,0,0,0.3);
                border-radius: 15px;
                padding: 20px;
            }
            
            .section-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .section-header h3 {
                color: #ffd700;
                margin: 0;
            }
            
            .refresh-btn {
                background: none;
                border: none;
                font-size: 18px;
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.3s;
            }
            
            .refresh-btn:hover { opacity: 1; }
            
            .matches-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 15px;
            }
            
            .match-card {
                background: rgba(255,255,255,0.05);
                border-radius: 10px;
                padding: 15px;
                border: 1px solid rgba(0,255,136,0.2);
                transition: all 0.3s;
            }
            
            .match-card:hover {
                border-color: rgba(0,255,136,0.5);
                transform: translateY(-2px);
            }
            
            .match-players {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }
            
            .match-player {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .player-avatar-small {
                width: 30px;
                height: 30px;
                border-radius: 50%;
                background: linear-gradient(45deg, #667eea, #764ba2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
            }
            
            .match-vs {
                font-weight: bold;
                color: #00ff88;
            }
            
            .match-info {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: rgba(255,255,255,0.6);
            }
            
            .match-streak {
                color: #ff6b00;
            }
            
            .sidebar-section {
                display: flex;
                flex-direction: column;
                gap: 20px;
            }
            
            .my-status {
                background: rgba(0,0,0,0.3);
                border-radius: 15px;
                padding: 20px;
                border: 1px solid rgba(255,215,0,0.3);
            }
            
            .status-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 15px;
                color: #ffd700;
                font-weight: bold;
            }
            
            .streak-badge {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                margin-bottom: 15px;
            }
            
            .badge-flame {
                font-size: 30px;
                animation: badge-flame-anim 0.5s ease-in-out infinite alternate;
            }
            
            @keyframes badge-flame-anim {
                0% { transform: scale(1); }
                100% { transform: scale(1.2); }
            }
            
            .badge-count {
                font-size: 36px;
                font-weight: bold;
                color: #ff6b00;
            }
            
            .badge-label {
                color: rgba(255,255,255,0.6);
            }
            
            .progress-bar {
                height: 10px;
                background: rgba(255,255,255,0.1);
                border-radius: 5px;
                overflow: hidden;
                margin-bottom: 15px;
            }
            
            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff6b00, #ffd700);
                transition: width 0.5s ease;
            }
            
            .status-info {
                display: flex;
                justify-content: space-between;
                font-size: 14px;
                color: rgba(255,255,255,0.8);
            }
            
            .world-chat {
                background: rgba(0,0,0,0.3);
                border-radius: 15px;
                overflow: hidden;
                flex: 1;
                display: flex;
                flex-direction: column;
            }
            
            .chat-header {
                padding: 15px;
                background: rgba(0,0,0,0.2);
                color: #00ff88;
                font-weight: bold;
            }
            
            .chat-messages {
                flex: 1;
                padding: 15px;
                overflow-y: auto;
                max-height: 200px;
            }
            
            .chat-message {
                margin-bottom: 10px;
                font-size: 13px;
            }
            
            .chat-username {
                color: #00ccff;
                font-weight: bold;
            }
            
            .chat-input {
                display: flex;
                padding: 10px;
                background: rgba(0,0,0,0.2);
            }
            
            .chat-input input {
                flex: 1;
                padding: 8px 12px;
                border: none;
                border-radius: 5px;
                background: rgba(255,255,255,0.1);
                color: #fff;
                margin-right: 8px;
            }
            
            .chat-input button {
                padding: 8px 15px;
                border: none;
                border-radius: 5px;
                background: #00ff88;
                color: #000;
                font-weight: bold;
                cursor: pointer;
            }
            
            .hall-controls {
                display: flex;
                justify-content: center;
                gap: 15px;
                padding: 20px;
            }
            
            .hall-btn {
                padding: 15px 40px;
                border: none;
                border-radius: 10px;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .hall-btn.primary {
                background: linear-gradient(45deg, #00ff88, #00ccff);
                color: #000;
            }
            
            .hall-btn.secondary {
                background: rgba(255,255,255,0.1);
                color: #fff;
                border: 1px solid rgba(255,255,255,0.3);
            }
            
            .hall-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(0,255,136,0.3);
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    generateMockMatches() {
        const matchesGrid = document.getElementById('matchesGrid');
        if (!matchesGrid) return;
        
        const players = ['🦊', '🐺', '🦁', '🐯', '🐲', '🦅', '🦉', '🐻'];
        const matches = [];
        
        for (let i = 0; i < 6; i++) {
            const p1 = players[Math.floor(Math.random() * players.length)];
            const p2 = players[Math.floor(Math.random() * players.length)];
            const streak = Math.floor(Math.random() * 10) + 1;
            
            matches.push(`
                <div class="match-card">
                    <div class="match-players">
                        <div class="match-player">
                            <div class="player-avatar-small">${p1}</div>
                            <span>玩家${i+1}</span>
                        </div>
                        <span class="match-vs">VS</span>
                        <div class="match-player">
                            <div class="player-avatar-small">${p2}</div>
                            <span>守卫</span>
                        </div>
                    </div>
                    <div class="match-info">
                        <span class="match-streak">🔥 ${streak} 连胜</span>
                        <span>第 ${Math.floor(Math.random() * 10) + 2} 层</span>
                    </div>
                </div>
            `);
        }
        
        matchesGrid.innerHTML = matches.join('');
    }
    
    generateMockChat() {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messages = [
            { user: '玩家A', msg: '刚刚完成了10连胜！' },
            { user: '玩家B', msg: '太厉害了，恭喜！' },
            { user: '玩家C', msg: '有人一起玩吗？' },
            { user: '玩家D', msg: '3D塔楼界面太酷了！' },
            { user: '玩家E', msg: '卡牌竞技场也很好玩' }
        ];
        
        chatMessages.innerHTML = messages.map(m => `
            <div class="chat-message">
                <span class="chat-username">${m.user}:</span>
                <span class="chat-text">${m.msg}</span>
            </div>
        `).join('');
    }
    
    startLiveUpdates() {
        // 模拟在线人数更新
        setInterval(() => {
            const onlineEl = document.getElementById('onlineCount');
            if (onlineEl) {
                const base = 1234;
                const variation = Math.floor(Math.random() * 100) - 50;
                onlineEl.textContent = (base + variation).toLocaleString();
            }
        }, 5000);
    }
    
    update(data) {
        const streakEl = document.getElementById('streakCount');
        const levelEl = document.getElementById('currentLevel');
        const cardsEl = document.getElementById('cardsRemaining');
        const progressEl = document.getElementById('streakProgress');
        
        if (streakEl) streakEl.textContent = data.streak || 0;
        if (levelEl) levelEl.textContent = data.level || '2/A';
        if (cardsEl) cardsEl.textContent = data.cardsRemaining || 52;
        if (progressEl) progressEl.style.width = `${((data.streak || 0) / 13 * 100)}%`;
    }
    
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.isInitialized = false;
    }
}

// ==================== 5. 3D明信片收藏馆UI (简化版) ====================
class PostcardMuseumUI {
    constructor(container) {
        this.container = container || document.getElementById('gameContainer');
        this.theme = UI_THEMES?.['3d-museum'];
        this.isInitialized = false;
    }
    
    async init() {
        console.log('[PostcardMuseum] 初始化3D明信片收藏馆UI');
        this.render();
        this.isInitialized = true;
        return this;
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="allegro-theme postcard-museum-theme">
                <div class="museum-header">
                    <div class="museum-title">🏛️ 明信片博物馆</div>
                    <div class="collection-progress">
                        <span>收集进度: </span>
                        <div class="progress-ring">
                            <svg viewBox="0 0 100 100">
                                <circle class="progress-bg" cx="50" cy="50" r="45"/>
                                <circle class="progress-fill" cx="50" cy="50" r="45" id="collectionRing"/>
                            </svg>
                            <span class="progress-text" id="collectionPercent">0%</span>
                        </div>
                    </div>
                </div>
                
                <div class="museum-nav">
                    <button class="continent-btn active" data-continent="all">全部</button>
                    <button class="continent-btn" data-continent="asia">亚洲</button>
                    <button class="continent-btn" data-continent="europe">欧洲</button>
                    <button class="continent-btn" data-continent="americas">美洲</button>
                    <button class="continent-btn" data-continent="africa">非洲</button>
                    <button class="continent-btn" data-continent="oceania">大洋洲</button>
                </div>
                
                <div class="museum-gallery">
                    <div class="gallery-stage" id="galleryStage">
                        <div class="postcard-showcase" id="postcardShowcase">
                            <div class="showcase-postcard" id="currentPostcard">
                                <div class="postcard-front">
                                    <div class="postcard-image">🗼</div>
                                    <div class="postcard-name">埃菲尔铁塔</div>
                                    <div class="postcard-location">📍 法国巴黎</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="gallery-thumbs" id="galleryThumbs"></div>
                </div>
                
                <div class="museum-game-panel">
                    <div class="game-stats">
                        <div class="stat-box">
                            <span class="stat-icon">🔥</span>
                            <span class="stat-value" id="streakCount">0</span>
                            <span class="stat-label">连胜</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-icon">🏔️</span>
                            <span class="stat-value" id="currentLevel">2/A</span>
                            <span class="stat-label">层数</span>
                        </div>
                        <div class="stat-box">
                            <span class="stat-icon">🎴</span>
                            <span class="stat-value" id="cardsRemaining">52</span>
                            <span class="stat-label">手牌</span>
                        </div>
                    </div>
                    
                    <div class="game-hand" id="handContainer"></div>
                    
                    <div class="game-controls">
                        <button class="museum-btn play-btn" id="playBtn">出牌</button>
                    </div>
                </div>
            </div>
        `;
        
        this.applyStyles();
        this.generateMockPostcards();
    }
    
    applyStyles() {
        const styles = `
            .postcard-museum-theme {
                width: 100%;
                min-height: 100vh;
                background: linear-gradient(180deg, #1a1a2e 0%, #2e1a1a 50%, #1a1a1a 100%);
                color: #fff;
            }
            
            .museum-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: rgba(0,0,0,0.3);
                border-bottom: 1px solid rgba(224,192,151,0.3);
            }
            
            .museum-title {
                font-size: 24px;
                font-weight: bold;
                color: #e0c097;
                text-shadow: 0 0 10px rgba(224,192,151,0.3);
            }
            
            .collection-progress {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #c9b037;
            }
            
            .progress-ring {
                width: 50px;
                height: 50px;
                position: relative;
            }
            
            .progress-ring svg {
                width: 100%;
                height: 100%;
                transform: rotate(-90deg);
            }
            
            .progress-bg {
                fill: none;
                stroke: rgba(255,255,255,0.1);
                stroke-width: 8;
            }
            
            .progress-fill {
                fill: none;
                stroke: #c9b037;
                stroke-width: 8;
                stroke-linecap: round;
                stroke-dasharray: 283;
                stroke-dashoffset: 283;
                transition: stroke-dashoffset 0.5s ease;
            }
            
            .progress-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 12px;
                font-weight: bold;
                color: #c9b037;
            }
            
            .museum-nav {
                display: flex;
                justify-content: center;
                gap: 10px;
                padding: 15px;
                flex-wrap: wrap;
            }
            
            .continent-btn {
                padding: 8px 20px;
                border: 1px solid rgba(224,192,151,0.3);
                border-radius: 20px;
                background: rgba(0,0,0,0.3);
                color: #e0c097;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .continent-btn:hover, .continent-btn.active {
                background: rgba(224,192,151,0.2);
                border-color: #e0c097;
            }
            
            .museum-gallery {
                padding: 20px;
            }
            
            .gallery-stage {
                display: flex;
                justify-content: center;
                margin-bottom: 30px;
            }
            
            .postcard-showcase {
                perspective: 1000px;
            }
            
            .showcase-postcard {
                width: 300px;
                height: 200px;
                background: linear-gradient(135deg, #f5f5dc, #e8dcc4);
                border-radius: 10px;
                padding: 20px;
                color: #333;
                box-shadow: 
                    0 10px 30px rgba(0,0,0,0.3),
                    0 0 0 10px rgba(255,255,255,0.1);
                transform-style: preserve-3d;
                transition: transform 0.5s ease;
                animation: postcard-float 3s ease-in-out infinite;
            }
            
            @keyframes postcard-float {
                0%, 100% { transform: rotateY(-5deg) translateY(0); }
                50% { transform: rotateY(5deg) translateY(-10px); }
            }
            
            .showcase-postcard:hover {
                transform: rotateY(0deg) scale(1.05);
            }
            
            .postcard-image {
                font-size: 60px;
                text-align: center;
                margin-bottom: 10px;
            }
            
            .postcard-name {
                font-size: 20px;
                font-weight: bold;
                text-align: center;
                margin-bottom: 5px;
            }
            
            .postcard-location {
                font-size: 14px;
                text-align: center;
                color: #666;
            }
            
            .gallery-thumbs {
                display: flex;
                justify-content: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            
            .thumb-item {
                width: 60px;
                height: 40px;
                background: rgba(255,255,255,0.1);
                border-radius: 5px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                transition: all 0.3s;
                border: 2px solid transparent;
            }
            
            .thumb-item:hover, .thumb-item.active {
                border-color: #c9b037;
                transform: scale(1.1);
            }
            
            .museum-game-panel {
                background: rgba(0,0,0,0.3);
                border-radius: 15px 15px 0 0;
                padding: 20px;
                margin-top: 20px;
            }
            
            .game-stats {
                display: flex;
                justify-content: center;
                gap: 30px;
                margin-bottom: 20px;
            }
            
            .stat-box {
                text-align: center;
            }
            
            .stat-icon {
                font-size: 24px;
                display: block;
            }
            
            .stat-value {
                font-size: 20px;
                font-weight: bold;
                color: #ffd700;
            }
            
            .stat-label {
                font-size: 12px;
                color: rgba(255,255,255,0.6);
            }
            
            .game-hand {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }
            
            .game-controls {
                display: flex;
                justify-content: center;
            }
            
            .museum-btn {
                padding: 12px 40px;
                border: none;
                border-radius: 25px;
                background: linear-gradient(45deg, #e0c097, #c9b037);
                color: #1a1a2e;
                font-size: 16px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .museum-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 20px rgba(224,192,151,0.4);
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    generateMockPostcards() {
        const postcards = [
            { icon: '🗼', name: '埃菲尔铁塔', location: '法国巴黎', continent: 'europe' },
            { icon: '🗽', name: '自由女神像', location: '美国纽约', continent: 'americas' },
            { icon: '🏯', name: '富士山', location: '日本', continent: 'asia' },
            { icon: '🏛️', name: '帕特农神庙', location: '希腊雅典', continent: 'europe' },
            { icon: '🦘', name: '悉尼歌剧院', location: '澳大利亚', continent: 'oceania' },
            { icon: '🦁', name: '金字塔', location: '埃及开罗', continent: 'africa' },
            { icon: '🐉', name: '长城', location: '中国北京', continent: 'asia' },
            { icon: '🌉', name: '金门大桥', location: '美国旧金山', continent: 'americas' }
        ];
        
        const thumbsContainer = document.getElementById('galleryThumbs');
        if (thumbsContainer) {
            thumbsContainer.innerHTML = postcards.map((p, i) => `
                <div class="thumb-item ${i === 0 ? 'active' : ''}" data-index="${i}">
                    ${p.icon}
                </div>
            `).join('');
        }
        
        // 绑定缩略图点击事件
        thumbsContainer?.querySelectorAll('.thumb-item').forEach(thumb => {
            thumb.addEventListener('click', () => {
                const index = parseInt(thumb.dataset.index);
                const p = postcards[index];
                
                document.getElementById('currentPostcard').innerHTML = `
                    <div class="postcard-front">
                        <div class="postcard-image">${p.icon}</div>
                        <div class="postcard-name">${p.name}</div>
                        <div class="postcard-location">📍 ${p.location}</div>
                    </div>
                `;
                
                thumbsContainer.querySelectorAll('.thumb-item').forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
            });
        });
    }
    
    update(data) {
        const streakEl = document.getElementById('streakCount');
        const levelEl = document.getElementById('currentLevel');
        const cardsEl = document.getElementById('cardsRemaining');
        
        if (streakEl) streakEl.textContent = data.streak || 0;
        if (levelEl) levelEl.textContent = data.level || '2/A';
        if (cardsEl) cardsEl.textContent = data.cardsRemaining || 52;
    }
    
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.isInitialized = false;
    }
}

// ==================== 6. 团队作战指挥室UI (简化版) ====================
class CommandRoomUI {
    constructor(container) {
        this.container = container || document.getElementById('gameContainer');
        this.theme = UI_THEMES?.['command-room'];
        this.isInitialized = false;
    }
    
    async init() {
        console.log('[CommandRoom] 初始化团队作战指挥室UI');
        this.render();
        this.isInitialized = true;
        return this;
    }
    
    render() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div class="allegro-theme command-room-theme">
                <div class="command-header">
                    <div class="command-title">🎖️ 作战指挥室</div>
                    <div class="mission-status">
                        <span class="status-indicator active"></span>
                        <span>任务进行中</span>
                    </div>
                </div>
                
                <div class="command-layout">
                    <div class="tactical-map">
                        <div class="map-header">
                            <span class="map-title">🗺️ 战术地图</span>
                            <span class="map-coords" id="mapCoords">X: 00 | Y: 00</span>
                        </div>
                        <div class="map-grid" id="mapGrid"></div>
                        <div class="map-legend">
                            <span class="legend-item"><span class="dot ally"></span> 队友</span>
                            <span class="legend-item"><span class="dot enemy"></span> 敌人</span>
                            <span class="legend-item"><span class="dot objective"></span> 目标</span>
                        </div>
                    </div>
                    
                    <div class="command-sidebar">
                        <div class="team-panel">
                            <div class="panel-header">👥 小队状态</div>
                            <div class="team-list" id="teamList"></div>
                        </div>
                        
                        <div class="intel-panel">
                            <div class="panel-header">📡 敌方情报</div>
                            <div class="intel-list" id="intelList"></div>
                        </div>
                        
                        <div class="command-chat">
                            <div class="panel-header">📻 战术通讯</div>
                            <div class="chat-messages" id="commandChat"></div>
                        </div>
                    </div>
                </div>
                
                <div class="command-footer">
                    <div class="player-stats">
                        <div class="stat-item">
                            <span class="stat-label">连胜</span>
                            <span class="stat-value" id="streakCount">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">层数</span>
                            <span class="stat-value" id="currentLevel">2/A</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">手牌</span>
                            <span class="stat-value" id="cardsRemaining">52</span>
                        </div>
                    </div>
                    
                    <div class="command-actions">
                        <button class="cmd-btn tactical" id="tacticalBtn">🎯 战术</button>
                        <button class="cmd-btn attack" id="playBtn">⚔️ 攻击</button>
                        <button class="cmd-btn retreat" id="quitBtn">📡 撤退</button>
                    </div>
                    
                    <div class="hand-display" id="handContainer"></div>
                </div>
            </div>
        `;
        
        this.applyStyles();
        this.generateMap();
        this.generateTeamStatus();
        this.generateIntel();
        this.generateChat();
    }
    
    applyStyles() {
        const styles = `
            .command-room-theme {
                width: 100%;
                min-height: 100vh;
                background: linear-gradient(180deg, #0a0a0a 0%, #1a1a1a 50%, #0d0d0d 100%);
                color: #0f0;
                font-family: 'Courier New', monospace;
            }
            
            .command-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: rgba(0,20,0,0.5);
                border-bottom: 2px solid #0f0;
            }
            
            .command-title {
                font-size: 20px;
                font-weight: bold;
                text-shadow: 0 0 10px rgba(0,255,0,0.5);
            }
            
            .mission-status {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .status-indicator {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #333;
            }
            
            .status-indicator.active {
                background: #0f0;
                animation: status-blink 1s ease-in-out infinite;
            }
            
            @keyframes status-blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
            
            .command-layout {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 15px;
                padding: 15px;
            }
            
            .tactical-map {
                background: rgba(0,20,0,0.3);
                border: 1px solid #0f0;
                border-radius: 5px;
                overflow: hidden;
            }
            
            .map-header {
                display: flex;
                justify-content: space-between;
                padding: 10px;
                background: rgba(0,50,0,0.3);
                border-bottom: 1px solid #0f0;
            }
            
            .map-title {
                font-weight: bold;
            }
            
            .map-coords {
                color: #0a0;
            }
            
            .map-grid {
                display: grid;
                grid-template-columns: repeat(10, 1fr);
                gap: 2px;
                padding: 10px;
            }
            
            .map-cell {
                aspect-ratio: 1;
                background: rgba(0,30,0,0.5);
                border: 1px solid rgba(0,255,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .map-cell:hover {
                background: rgba(0,100,0,0.3);
                border-color: #0f0;
            }
            
            .map-cell.ally { background: rgba(0,0,255,0.3); border-color: #00f; }
            .map-cell.enemy { background: rgba(255,0,0,0.3); border-color: #f00; }
            .map-cell.objective { background: rgba(255,255,0,0.3); border-color: #ff0; }
            
            .map-legend {
                display: flex;
                justify-content: center;
                gap: 20px;
                padding: 10px;
                border-top: 1px solid #0f0;
            }
            
            .legend-item {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 12px;
            }
            
            .dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
            }
            
            .dot.ally { background: #00f; }
            .dot.enemy { background: #f00; }
            .dot.objective { background: #ff0; }
            
            .command-sidebar {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .team-panel, .intel-panel, .command-chat {
                background: rgba(0,20,0,0.3);
                border: 1px solid #0f0;
                border-radius: 5px;
                overflow: hidden;
            }
            
            .panel-header {
                padding: 10px;
                background: rgba(0,50,0,0.3);
                border-bottom: 1px solid #0f0;
                font-weight: bold;
                font-size: 14px;
            }
            
            .team-list, .intel-list, .chat-messages {
                padding: 10px;
                max-height: 150px;
                overflow-y: auto;
            }
            
            .team-member, .intel-item, .chat-message {
                padding: 8px;
                margin-bottom: 8px;
                background: rgba(0,30,0,0.3);
                border-left: 3px solid #0f0;
                font-size: 12px;
            }
            
            .team-member.offline {
                opacity: 0.5;
                border-color: #666;
            }
            
            .member-status {
                float: right;
                font-size: 10px;
            }
            
            .member-status.online { color: #0f0; }
            .member-status.offline { color: #666; }
            .member-status.fighting { color: #ff0; }
            
            .command-footer {
                display: grid;
                grid-template-columns: auto 1fr auto;
                gap: 20px;
                padding: 15px;
                background: rgba(0,20,0,0.5);
                border-top: 2px solid #0f0;
                align-items: center;
            }
            
            .player-stats {
                display: flex;
                gap: 20px;
            }
            
            .player-stats .stat-item {
                text-align: center;
            }
            
            .player-stats .stat-label {
                display: block;
                font-size: 10px;
                color: #0a0;
            }
            
            .player-stats .stat-value {
                font-size: 18px;
                font-weight: bold;
                color: #0f0;
            }
            
            .command-actions {
                display: flex;
                justify-content: center;
                gap: 10px;
            }
            
            .cmd-btn {
                padding: 10px 25px;
                border: 2px solid;
                border-radius: 3px;
                background: transparent;
                font-family: inherit;
                font-size: 14px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s;
                text-transform: uppercase;
            }
            
            .cmd-btn.tactical {
                color: #ff0;
                border-color: #ff0;
            }
            
            .cmd-btn.tactical:hover {
                background: rgba(255,255,0,0.2);
            }
            
            .cmd-btn.attack {
                color: #0f0;
                border-color: #0f0;
            }
            
            .cmd-btn.attack:hover {
                background: rgba(0,255,0,0.2);
            }
            
            .cmd-btn.retreat {
                color: #f00;
                border-color: #f00;
            }
            
            .cmd-btn.retreat:hover {
                background: rgba(255,0,0,0.2);
            }
            
            .hand-display {
                display: flex;
                gap: 5px;
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    
    generateMap() {
        const mapGrid = document.getElementById('mapGrid');
        if (!mapGrid) return;
        
        let html = '';
        for (let i = 0; i < 100; i++) {
            const row = Math.floor(i / 10);
            const col = i % 10;
            
            let content = '';
            let type = '';
            
            // 随机放置单位
            if (Math.random() < 0.05) {
                content = '👤';
                type = 'ally';
            } else if (Math.random() < 0.05) {
                content = '👹';
                type = 'enemy';
            } else if (Math.random() < 0.02) {
                content = '🎯';
                type = 'objective';
            }
            
            html += `<div class="map-cell ${type}" data-row="${row}" data-col="${col}"
                onmouseenter="document.getElementById('mapCoords').textContent='X: ${String(col).padStart(2,'0')} | Y: ${String(row).padStart(2,'0')}'">${content}</div>`;
        }
        
        mapGrid.innerHTML = html;
    }
    
    generateTeamStatus() {
        const teamList = document.getElementById('teamList');
        if (!teamList) return;
        
        const members = [
            { name: '指挥官', status: 'online', role: '队长' },
            { name: '突击手', status: 'fighting', role: '攻击' },
            { name: '狙击手', status: 'online', role: '支援' },
            { name: '医疗兵', status: 'offline', role: '后勤' }
        ];
        
        teamList.innerHTML = members.map(m => `
            <div class="team-member ${m.status}">
                <strong>${m.name}</strong> [${m.role}]
                <span class="member-status ${m.status}">${m.status.toUpperCase()}</span>
            </div>
        `).join('');
    }
    
    generateIntel() {
        const intelList = document.getElementById('intelList');
        if (!intelList) return;
        
        const intel = [
            '守卫强度: 高',
            '剩余守卫: 4单位',
            '建议战术: 保守进攻',
            '风险等级: 中等'
        ];
        
        intelList.innerHTML = intel.map(i => `
            <div class="intel-item">&gt; ${i}</div>
        `).join('');
    }
    
    generateChat() {
        const chat = document.getElementById('commandChat');
        if (!chat) return;
        
        const messages = [
            { user: '指挥官', msg: '准备进攻第2层' },
            { user: '突击手', msg: '收到，准备就绪' },
            { user: '系统', msg: '敌方守卫已发现' }
        ];
        
        chat.innerHTML = messages.map(m => `
            <div class="chat-message">
                <strong>${m.user}:</strong> ${m.msg}
            </div>
        `).join('');
    }
    
    update(data) {
        const streakEl = document.getElementById('streakCount');
        const levelEl = document.getElementById('currentLevel');
        const cardsEl = document.getElementById('cardsRemaining');
        
        if (streakEl) streakEl.textContent = data.streak || 0;
        if (levelEl) levelEl.textContent = data.level || '2/A';
        if (cardsEl) cardsEl.textContent = data.cardsRemaining || 52;
    }
    
    destroy() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        this.isInitialized = false;
    }
}

// 导出所有UI组件
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ClassicGameUI,
        Tower3DClimbingUI,
        CardArenaUI,
        TournamentHallUI,
        PostcardMuseumUI,
        CommandRoomUI
    };
}

// 浏览器环境
if (typeof window !== 'undefined') {
    window.ClassicGameUI = ClassicGameUI;
    window.Tower3DClimbingUI = Tower3DClimbingUI;
    window.CardArenaUI = CardArenaUI;
    window.TournamentHallUI = TournamentHallUI;
    window.PostcardMuseumUI = PostcardMuseumUI;
    window.CommandRoomUI = CommandRoomUI;
}
