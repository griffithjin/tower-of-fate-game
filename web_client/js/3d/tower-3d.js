/**
 * Tower3D - 命运塔3D游戏系统
 * 使用Three.js构建的3D塔楼体验
 */

class Tower3D {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.layers = [];
        this.guards = [];
        this.playerTokens = [];
        this.angerMarks = [];
        this.clouds = [];
        this.controls = {
            rotateSpeed: 0.005,
            zoomSpeed: 0.1,
            isRotating: false,
            autoRotate: true
        };
        
        // 游戏配置
        this.config = {
            layerCount: 13,
            layerHeight: 0.8,
            baseRadius: 3,
            cloudCount: this.detectMobile() ? 5 : 20,
            shadowQuality: this.detectMobile() ? 'low' : 'high',
            animationComplexity: this.detectMobile() ? 'simple' : 'full'
        };
        
        this.init();
    }
    
    // 检测是否为移动设备
    detectMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    // 初始化3D场景
    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createLights();
        this.createTower();
        this.createClouds();
        this.createPlayerTokens();
        this.createControls();
        this.animate();
        
        // 响应式处理
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    // 创建场景
    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a1a);
        this.scene.fog = new THREE.FogExp2(0x0a0a1a, 0.02);
    }
    
    // 创建相机
    createCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(0, 8, 15);
        this.camera.lookAt(0, 4, 0);
    }
    
    // 创建渲染器
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: !this.detectMobile(),
            alpha: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = this.config.shadowQuality !== 'low';
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.container.appendChild(this.renderer.domElement);
    }
    
    // 创建灯光
    createLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404080, 0.5);
        this.scene.add(ambientLight);
        
        // 主光源（模拟月光/神秘光芒）
        const mainLight = new THREE.DirectionalLight(0xffd700, 1);
        mainLight.position.set(5, 10, 5);
        mainLight.castShadow = this.config.shadowQuality !== 'low';
        mainLight.shadow.mapSize.width = this.config.shadowQuality === 'high' ? 2048 : 1024;
        mainLight.shadow.mapSize.height = this.config.shadowQuality === 'high' ? 2048 : 1024;
        this.scene.add(mainLight);
        
        // 补光（蓝色调，增加神秘感）
        const fillLight = new THREE.DirectionalLight(0x4444ff, 0.3);
        fillLight.position.set(-5, 5, -5);
        this.scene.add(fillLight);
        
        // 点光源（每层塔顶的光芒）
        for (let i = 0; i < this.config.layerCount; i++) {
            const pointLight = new THREE.PointLight(this.getLayerColor(i), 0.5, 5);
            pointLight.position.set(0, i * this.config.layerHeight + 0.5, 0);
            this.scene.add(pointLight);
        }
    }
    
    // 获取层颜色
    getLayerColor(index) {
        const colors = [
            0xff6b6b, // 2 - 红色
            0xff8e53, // 3 - 橙色
            0xffcd56, // 4 - 黄色
            0x4bc0c0, // 5 - 青色
            0x36a2eb, // 6 - 蓝色
            0x9966ff, // 7 - 紫色
            0xff9f40, // 8 - 深橙
            0xff6384, // 9 - 粉红
            0xc9cbcf, // 10 - 灰色
            0xffd700, // J - 金色
            0xe91e63, // Q - 玫瑰
            0x9c27b0, // K - 深紫
            0x00bcd4  // A - 青色
        ];
        return colors[index] || 0xffffff;
    }
    
    // 创建塔楼
    createTower() {
        const group = new THREE.Group();
        
        for (let i = 0; i < this.config.layerCount; i++) {
            const layer = this.createLayer(i);
            group.add(layer.mesh);
            this.layers.push(layer);
            
            // 添加发光效果
            if (this.config.animationComplexity === 'full') {
                this.addGlowEffect(layer.mesh, i);
            }
            
            // 添加守卫位置标记
            this.createGuardMarker(i, group);
        }
        
        // 添加塔尖
        this.createTowerTop(group);
        
        this.scene.add(group);
        this.towerGroup = group;
    }
    
    // 创建单层塔
    createLayer(index) {
        const radius = this.config.baseRadius - index * 0.15;
        const height = 0.4;
        
        // 主体几何体
        const geometry = new THREE.CylinderGeometry(radius, radius * 0.95, height, 32);
        const material = new THREE.MeshPhysicalMaterial({
            color: this.getLayerColor(index),
            metalness: 0.3,
            roughness: 0.4,
            transparent: true,
            opacity: 0.9,
            emissive: this.getLayerColor(index),
            emissiveIntensity: 0.1
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.y = index * this.config.layerHeight;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // 添加层标识（数字/字母）
        const label = this.createLayerLabel(index);
        label.position.set(radius + 0.3, index * this.config.layerHeight, 0);
        mesh.add(label);
        
        return { mesh, index, radius, guards: [] };
    }
    
    // 创建层标识
    createLayerLabel(index) {
        const labels = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labels[index], 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.PlaneGeometry(0.4, 0.4);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            side: THREE.DoubleSide
        });
        
        return new THREE.Mesh(geometry, material);
    }
    
    // 添加发光效果
    addGlowEffect(layerMesh, index) {
        const glowGeometry = new THREE.CylinderGeometry(
            layerMesh.geometry.parameters.radiusTop * 1.1,
            layerMesh.geometry.parameters.radiusBottom * 1.1,
            layerMesh.geometry.parameters.height * 1.2,
            32
        );
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.getLayerColor(index),
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(layerMesh.position);
        
        // 脉冲动画
        gsap.to(glowMaterial, {
            opacity: 0.4,
            duration: 1 + Math.random() * 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
        
        this.scene.add(glow);
    }
    
    // 创建守卫标记
    createGuardMarker(layerIndex, group) {
        const radius = this.config.baseRadius - layerIndex * 0.15;
        const angleStep = (Math.PI * 2) / 4; // 每层4个守卫位置
        
        for (let i = 0; i < 4; i++) {
            const angle = i * angleStep;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            // 守卫底座
            const geometry = new THREE.CylinderGeometry(0.15, 0.2, 0.1, 16);
            const material = new THREE.MeshPhongMaterial({
                color: 0x333333,
                emissive: 0x111111
            });
            const marker = new THREE.Mesh(geometry, material);
            marker.position.set(x, layerIndex * this.config.layerHeight - 0.15, z);
            marker.userData = { layerIndex, guardIndex: i, isGuard: true };
            
            group.add(marker);
            
            // 存储守卫信息
            if (!this.guards[layerIndex]) this.guards[layerIndex] = [];
            this.guards[layerIndex][i] = {
                mesh: marker,
                hasCard: false,
                card: null,
                cardMesh: null
            };
        }
    }
    
    // 创建塔尖
    createTowerTop(group) {
        const topGeometry = new THREE.ConeGeometry(0.8, 1.5, 32);
        const topMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffd700,
            metalness: 0.8,
            roughness: 0.2,
            emissive: 0xffd700,
            emissiveIntensity: 0.3
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = this.config.layerCount * this.config.layerHeight + 0.5;
        top.castShadow = true;
        
        // 塔尖光芒
        const light = new THREE.PointLight(0xffd700, 1, 10);
        light.position.copy(top.position);
        group.add(light);
        
        group.add(top);
    }
    
    // 创建云朵
    createClouds() {
        const cloudGeometry = new THREE.SphereGeometry(1, 16, 16);
        const cloudMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.3
        });
        
        for (let i = 0; i < this.config.cloudCount; i++) {
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial.clone());
            
            // 随机位置
            const angle = Math.random() * Math.PI * 2;
            const distance = 8 + Math.random() * 10;
            cloud.position.set(
                Math.cos(angle) * distance,
                Math.random() * 15 + 3,
                Math.sin(angle) * distance
            );
            cloud.scale.set(
                2 + Math.random() * 2,
                0.8 + Math.random() * 0.5,
                1.5 + Math.random() * 1.5
            );
            
            // 漂浮动画
            const duration = 15 + Math.random() * 10;
            gsap.to(cloud.position, {
                x: cloud.position.x + (Math.random() - 0.5) * 5,
                z: cloud.position.z + (Math.random() - 0.5) * 5,
                duration: duration,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
            
            // 透明度动画
            gsap.to(cloud.material, {
                opacity: 0.1 + Math.random() * 0.2,
                duration: duration * 0.5,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
            
            this.scene.add(cloud);
            this.clouds.push(cloud);
        }
    }
    
    // 创建玩家令牌
    createPlayerTokens() {
        const colors = [0x00ff00, 0x0088ff, 0xff0088, 0xff8800];
        
        for (let i = 0; i < 4; i++) {
            const geometry = new THREE.SphereGeometry(0.2, 16, 16);
            const material = new THREE.MeshPhysicalMaterial({
                color: colors[i],
                metalness: 0.5,
                roughness: 0.3,
                emissive: colors[i],
                emissiveIntensity: 0.2
            });
            const token = new THREE.Mesh(geometry, material);
            
            // 初始位置在第0层
            token.position.set(
                Math.cos(i * Math.PI / 2) * 2,
                0.3,
                Math.sin(i * Math.PI / 2) * 2
            );
            
            token.castShadow = true;
            this.scene.add(token);
            
            this.playerTokens[i] = {
                mesh: token,
                currentLayer: 0,
                playerId: i
            };
        }
    }
    
    // 玩家上升动画
    animatePlayerRise(playerId, toLayer) {
        const player = this.playerTokens[playerId];
        if (!player) return;
        
        const endY = toLayer * this.config.layerHeight + 0.3;
        const radius = this.config.baseRadius - toLayer * 0.15 - 0.5;
        const angle = playerId * Math.PI / 2;
        
        gsap.to(player.mesh.position, {
            y: endY,
            x: Math.cos(angle) * radius,
            z: Math.sin(angle) * radius,
            duration: 1.2,
            ease: 'bounce.out'
        });
        
        // 上升轨迹粒子效果
        this.createRiseTrail(player.mesh.position, endY);
        
        player.currentLayer = toLayer;
    }
    
    // 创建上升轨迹粒子
    createRiseTrail(startPos, endY) {
        const particleCount = 10;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const geometry = new THREE.SphereGeometry(0.05, 8, 8);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffd700,
                transparent: true,
                opacity: 0.8
            });
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(startPos);
            particle.position.y += Math.random() * 0.5;
            this.scene.add(particle);
            particles.push(particle);
        }
        
        // 粒子消散动画
        particles.forEach((particle, i) => {
            gsap.to(particle.position, {
                y: particle.position.y + 2,
                x: particle.position.x + (Math.random() - 0.5),
                z: particle.position.z + (Math.random() - 0.5),
                duration: 1 + Math.random(),
                ease: 'power2.out'
            });
            gsap.to(particle.material, {
                opacity: 0,
                duration: 1,
                onComplete: () => this.scene.remove(particle)
            });
        });
    }
    
    // 创建3D卡牌
    create3DCard(suit, rank) {
        const geometry = new THREE.BoxGeometry(0.6, 0.9, 0.02);
        
        // 创建牌面纹理
        const frontTexture = this.createCardTexture(suit, rank);
        const backTexture = this.createCardBackTexture();
        
        const materials = [
            new THREE.MeshStandardMaterial({ color: 0xffffff }), // right
            new THREE.MeshStandardMaterial({ color: 0xffffff }), // left
            new THREE.MeshStandardMaterial({ color: 0xffffff }), // top
            new THREE.MeshStandardMaterial({ color: 0xffffff }), // bottom
            new THREE.MeshStandardMaterial({ map: frontTexture }), // front
            new THREE.MeshStandardMaterial({ map: backTexture })   // back
        ];
        
        const card = new THREE.Mesh(geometry, materials);
        card.castShadow = true;
        
        return card;
    }
    
    // 创建卡牌纹理
    createCardTexture(suit, rank) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 384;
        const ctx = canvas.getContext('2d');
        
        // 背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 256, 384);
        
        // 边框
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeRect(8, 8, 240, 368);
        
        // 花色颜色
        const isRed = suit === '♥' || suit === '♦';
        ctx.fillStyle = isRed ? '#ff0000' : '#000000';
        
        // 点数
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(rank, 40, 60);
        ctx.fillText(rank, 216, 324);
        
        // 花色
        ctx.font = '48px Arial';
        ctx.fillText(suit, 40, 110);
        ctx.fillText(suit, 216, 280);
        ctx.font = '120px Arial';
        ctx.fillText(suit, 128, 220);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    // 创建卡牌背面纹理
    createCardBackTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 384;
        const ctx = canvas.getContext('2d');
        
        // 深蓝色背景
        ctx.fillStyle = '#1a237e';
        ctx.fillRect(0, 0, 256, 384);
        
        // 装饰图案
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, 236, 364);
        ctx.strokeRect(20, 20, 216, 344);
        
        // 中心图案
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.arc(128, 192, 50, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#1a237e';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('命运', 128, 192);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }
    
    // 守卫牌翻转动画
    flipGuardCard(layerIndex, guardIndex, suit, rank) {
        const guard = this.guards[layerIndex]?.[guardIndex];
        if (!guard) return;
        
        // 创建卡牌
        const card = this.create3DCard(suit, rank);
        card.position.copy(guard.mesh.position);
        card.position.y += 0.8;
        card.rotation.x = -Math.PI / 6;
        this.scene.add(card);
        
        guard.cardMesh = card;
        guard.hasCard = true;
        guard.card = { suit, rank };
        
        // 翻转动画
        gsap.from(card.rotation, {
            y: Math.PI,
            duration: 0.6,
            ease: 'power2.out'
        });
        
        gsap.from(card.scale, {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.4,
            ease: 'back.out(1.7)'
        });
    }
    
    // 创建激怒标记
    createAngerMark(layerIndex, guardIndex) {
        const guard = this.guards[layerIndex]?.[guardIndex];
        if (!guard) return;
        
        const geometry = new THREE.SphereGeometry(0.15, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.8
        });
        const mark = new THREE.Mesh(geometry, material);
        mark.position.copy(guard.mesh.position);
        mark.position.y += 1.3;
        
        this.scene.add(mark);
        
        // 脉冲动画
        gsap.to(mark.scale, {
            x: 1.5,
            y: 1.5,
            z: 1.5,
            duration: 0.5,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
        });
        
        if (!this.angerMarks[layerIndex]) this.angerMarks[layerIndex] = [];
        this.angerMarks[layerIndex][guardIndex] = mark;
    }
    
    // 移除激怒标记
    removeAngerMark(layerIndex, guardIndex) {
        const mark = this.angerMarks[layerIndex]?.[guardIndex];
        if (mark) {
            gsap.to(mark.scale, {
                x: 0,
                y: 0,
                z: 0,
                duration: 0.3,
                onComplete: () => this.scene.remove(mark)
            });
            this.angerMarks[layerIndex][guardIndex] = null;
        }
    }
    
    // 创建控制器
    createControls() {
        // 鼠标控制
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        
        this.container.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.container.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;
            
            this.rotateTower(deltaX * 0.01);
            this.tiltCamera(deltaY * 0.01);
            
            previousMousePosition = { x: e.clientX, y: e.clientY };
        });
        
        this.container.addEventListener('mouseup', () => isDragging = false);
        this.container.addEventListener('mouseleave', () => isDragging = false);
        
        // 滚轮缩放
        this.container.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.zoomCamera(e.deltaY * 0.001);
        });
        
        // 触摸控制
        let touchStart = null;
        this.container.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        });
        
        this.container.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && touchStart) {
                const deltaX = e.touches[0].clientX - touchStart.x;
                this.rotateTower(deltaX * 0.01);
                touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            }
        });
    }
    
    // 旋转塔
    rotateTower(angle) {
        if (this.towerGroup) {
            this.towerGroup.rotation.y += angle;
        }
    }
    
    // 倾斜相机
    tiltCamera(angle) {
        const radius = Math.sqrt(
            this.camera.position.x ** 2 + 
            this.camera.position.z ** 2
        );
        const currentAngle = Math.atan2(
            this.camera.position.x,
            this.camera.position.z
        );
        
        this.camera.position.y = Math.max(2, Math.min(15, this.camera.position.y - angle * 5));
        this.camera.lookAt(0, this.config.layerCount * this.config.layerHeight / 2, 0);
    }
    
    // 缩放相机
    zoomCamera(delta) {
        const direction = new THREE.Vector3();
        direction.subVectors(this.camera.position, new THREE.Vector3(0, 5, 0));
        direction.normalize();
        
        const distance = this.camera.position.distanceTo(new THREE.Vector3(0, 5, 0));
        const newDistance = Math.max(5, Math.min(25, distance + delta * 10));
        
        this.camera.position.copy(direction.multiplyScalar(newDistance).add(new THREE.Vector3(0, 5, 0)));
    }
    
    // 窗口大小调整
    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    // 动画循环
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 自动旋转
        if (this.controls.autoRotate && this.towerGroup) {
            this.towerGroup.rotation.y += this.controls.rotateSpeed;
        }
        
        // 渲染
        this.renderer.render(this.scene, this.camera);
    }
    
    // 公共控制方法
    rotateLeft() {
        gsap.to(this.towerGroup.rotation, {
            y: this.towerGroup.rotation.y - Math.PI / 4,
            duration: 0.5,
            ease: 'power2.out'
        });
    }
    
    rotateRight() {
        gsap.to(this.towerGroup.rotation, {
            y: this.towerGroup.rotation.y + Math.PI / 4,
            duration: 0.5,
            ease: 'power2.out'
        });
    }
    
    zoomIn() {
        this.zoomCamera(-0.5);
    }
    
    zoomOut() {
        this.zoomCamera(0.5);
    }
    
    resetView() {
        gsap.to(this.camera.position, {
            x: 0,
            y: 8,
            z: 15,
            duration: 1,
            ease: 'power2.inOut',
            onUpdate: () => this.camera.lookAt(0, 4, 0)
        });
        
        gsap.to(this.towerGroup.rotation, {
            y: 0,
            duration: 1,
            ease: 'power2.inOut'
        });
    }
    
    toggleAutoRotate() {
        this.controls.autoRotate = !this.controls.autoRotate;
    }
    
    // 高亮特定层
    highlightLayer(layerIndex) {
        const layer = this.layers[layerIndex];
        if (!layer) return;
        
        gsap.to(layer.mesh.material, {
            emissiveIntensity: 0.8,
            duration: 0.3,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
                layer.mesh.material.emissiveIntensity = 0.1;
            }
        });
    }
    
    // 庆祝动画（玩家获胜）
    celebrateWin(playerId) {
        const player = this.playerTokens[playerId];
        if (!player) return;
        
        // 创建烟花效果
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createFirework(player.mesh.position);
            }, i * 200);
        }
        
        // 玩家旋转庆祝
        gsap.to(player.mesh.rotation, {
            y: Math.PI * 4,
            duration: 2,
            ease: 'power2.out'
        });
    }
    
    // 创建烟花效果
    createFirework(position) {
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        for (let i = 0; i < 20; i++) {
            const geometry = new THREE.SphereGeometry(0.05, 8, 8);
            const material = new THREE.MeshBasicMaterial({ color });
            const particle = new THREE.Mesh(geometry, material);
            
            particle.position.copy(position);
            particle.position.y += 1;
            
            const angle = (i / 20) * Math.PI * 2;
            const speed = 0.1 + Math.random() * 0.1;
            const velocity = {
                x: Math.cos(angle) * speed,
                y: Math.random() * 0.2,
                z: Math.sin(angle) * speed
            };
            
            this.scene.add(particle);
            
            // 动画
            gsap.to(particle.position, {
                x: particle.position.x + velocity.x * 10,
                y: particle.position.y + velocity.y * 10,
                z: particle.position.z + velocity.z * 10,
                duration: 1 + Math.random(),
                ease: 'power2.out'
            });
            
            gsap.to(particle.material, {
                opacity: 0,
                duration: 1,
                onComplete: () => this.scene.remove(particle)
            });
        }
    }
    
    // 销毁
    destroy() {
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tower3D;
}
