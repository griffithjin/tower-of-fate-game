/**
 * Effects3D - 3D特效系统
 * 粒子效果、光影特效、环境动画
 */

class Effects3D {
    constructor(scene) {
        this.scene = scene;
        this.particles = [];
        this.lights = [];
        this.animations = [];
    }
    
    // 创建粒子爆炸效果
    createExplosion(position, color = 0xffd700, count = 30) {
        const particles = [];
        const geometry = new THREE.SphereGeometry(0.05, 8, 8);
        const material = new THREE.MeshBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8
        });
        
        for (let i = 0; i < count; i++) {
            const particle = new THREE.Mesh(geometry, material.clone());
            particle.position.copy(position);
            
            // 随机速度
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = 0.1 + Math.random() * 0.2;
            
            particle.userData.velocity = new THREE.Vector3(
                Math.sin(phi) * Math.cos(theta) * speed,
                Math.sin(phi) * Math.sin(theta) * speed,
                Math.cos(phi) * speed
            );
            
            this.scene.add(particle);
            particles.push(particle);
        }
        
        // 动画
        const animate = () => {
            let alive = false;
            particles.forEach(p => {
                if (p.material.opacity > 0) {
                    p.position.add(p.userData.velocity);
                    p.userData.velocity.y -= 0.005; // 重力
                    p.material.opacity -= 0.015;
                    alive = true;
                } else {
                    this.scene.remove(p);
                }
            });
            
            if (alive) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    }
    
    // 创建上升光柱
    createLightPillar(position, color = 0xffd700) {
        const geometry = new THREE.CylinderGeometry(0.1, 0.3, 10, 16, 1, true);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        const pillar = new THREE.Mesh(geometry, material);
        pillar.position.copy(position);
        pillar.position.y += 5;
        
        this.scene.add(pillar);
        
        // 动画
        gsap.to(pillar.material, {
            opacity: 0,
            duration: 2,
            ease: 'power2.out',
            onComplete: () => this.scene.remove(pillar)
        });
        
        gsap.to(pillar.scale, {
            x: 2,
            z: 2,
            duration: 2,
            ease: 'power2.out'
        });
    }
    
    // 创建魔法光环
    createMagicCircle(position, color = 0xffd700) {
        const geometry = new THREE.RingGeometry(0.5, 0.6, 32);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const circle = new THREE.Mesh(geometry, material);
        circle.position.copy(position);
        circle.rotation.x = -Math.PI / 2;
        
        this.scene.add(circle);
        
        // 动画
        gsap.to(circle.scale, {
            x: 5,
            y: 5,
            duration: 1.5,
            ease: 'power2.out'
        });
        
        gsap.to(circle.material, {
            opacity: 0,
            duration: 1.5,
            ease: 'power2.out',
            onComplete: () => this.scene.remove(circle)
        });
    }
    
    // 创建星星粒子
    createStarParticles(position, count = 20) {
        const starShape = new THREE.Shape();
        const outerRadius = 0.1;
        const innerRadius = 0.05;
        const points = 5;
        
        for (let i = 0; i < points * 2; i++) {
            const angle = (i / (points * 2)) * Math.PI * 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                starShape.moveTo(x, y);
            } else {
                starShape.lineTo(x, y);
            }
        }
        starShape.closePath();
        
        const geometry = new THREE.ShapeGeometry(starShape);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });
        
        for (let i = 0; i < count; i++) {
            const star = new THREE.Mesh(geometry, material.clone());
            star.position.copy(position);
            star.position.x += (Math.random() - 0.5) * 2;
            star.position.z += (Math.random() - 0.5) * 2;
            star.position.y += Math.random() * 2;
            
            this.scene.add(star);
            
            // 飘散动画
            gsap.to(star.position, {
                y: star.position.y + 3 + Math.random() * 2,
                x: star.position.x + (Math.random() - 0.5) * 3,
                z: star.position.z + (Math.random() - 0.5) * 3,
                duration: 2 + Math.random(),
                ease: 'power2.out'
            });
            
            gsap.to(star.rotation, {
                z: Math.random() * Math.PI * 4,
                duration: 2 + Math.random()
            });
            
            gsap.to(star.material, {
                opacity: 0,
                duration: 2,
                onComplete: () => this.scene.remove(star)
            });
        }
    }
    
    // 创建冲击波
    createShockwave(position, color = 0xffffff) {
        const geometry = new THREE.RingGeometry(0.1, 0.2, 32);
        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide
        });
        
        const wave = new THREE.Mesh(geometry, material);
        wave.position.copy(position);
        wave.rotation.x = -Math.PI / 2;
        
        this.scene.add(wave);
        
        // 扩散动画
        gsap.to(wave.scale, {
            x: 15,
            y: 15,
            duration: 1,
            ease: 'power2.out'
        });
        
        gsap.to(wave.material, {
            opacity: 0,
            duration: 1,
            ease: 'power2.out',
            onComplete: () => this.scene.remove(wave)
        });
    }
    
    // 创建文字浮动效果
    createFloatingText(text, position, color = '#ffd700') {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        
        ctx.font = 'bold 40px Microsoft YaHei';
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.strokeText(text, 128, 80);
        ctx.fillText(text, 128, 80);
        
        const texture = new THREE.CanvasTexture(canvas);
        const geometry = new THREE.PlaneGeometry(2, 1);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: 1,
            side: THREE.DoubleSide
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.lookAt(this.scene.camera?.position || new THREE.Vector3(0, 0, 10));
        
        this.scene.add(mesh);
        
        // 上浮动画
        gsap.to(mesh.position, {
            y: mesh.position.y + 2,
            duration: 1.5,
            ease: 'power2.out'
        });
        
        gsap.to(material, {
            opacity: 0,
            duration: 1.5,
            ease: 'power2.out',
            onComplete: () => this.scene.remove(mesh)
        });
    }
    
    // 创建闪电效果
    createLightning(startPos, endPos, color = 0xffff00) {
        const points = [];
        const segments = 20;
        const deviation = 0.3;
        
        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const x = startPos.x + (endPos.x - startPos.x) * t;
            const y = startPos.y + (endPos.y - startPos.y) * t;
            const z = startPos.z + (endPos.z - startPos.z) * t;
            
            if (i > 0 && i < segments) {
                points.push(new THREE.Vector3(
                    x + (Math.random() - 0.5) * deviation,
                    y,
                    z + (Math.random() - 0.5) * deviation
                ));
            } else {
                points.push(new THREE.Vector3(x, y, z));
            }
        }
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: color,
            linewidth: 3
        });
        
        const lightning = new THREE.Line(geometry, material);
        this.scene.add(lightning);
        
        // 闪烁动画
        let flashes = 0;
        const flash = () => {
            lightning.visible = !lightning.visible;
            flashes++;
            
            if (flashes < 6) {
                setTimeout(flash, 50);
            } else {
                this.scene.remove(lightning);
            }
        };
        flash();
    }
    
    // 创建传送门效果
    createPortal(position) {
        const group = new THREE.Group();
        group.position.copy(position);
        
        // 外环
        const outerGeometry = new THREE.TorusGeometry(1, 0.1, 16, 50);
        const outerMaterial = new THREE.MeshBasicMaterial({
            color: 0x9c27b0,
            transparent: true,
            opacity: 0.8
        });
        const outerRing = new THREE.Mesh(outerGeometry, outerMaterial);
        outerRing.rotation.x = Math.PI / 2;
        group.add(outerRing);
        
        // 内环
        const innerGeometry = new THREE.TorusGeometry(0.7, 0.05, 16, 50);
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0xe91e63,
            transparent: true,
            opacity: 0.6
        });
        const innerRing = new THREE.Mesh(innerGeometry, innerMaterial);
        innerRing.rotation.x = Math.PI / 2;
        group.add(innerRing);
        
        // 中心漩涡
        const vortexGeometry = new THREE.CircleGeometry(0.6, 32);
        const vortexMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a148c,
            transparent: true,
            opacity: 0.7,
            side: THREE.DoubleSide
        });
        const vortex = new THREE.Mesh(vortexGeometry, vortexMaterial);
        vortex.rotation.x = -Math.PI / 2;
        group.add(vortex);
        
        this.scene.add(group);
        
        // 旋转动画
        gsap.to(outerRing.rotation, {
            z: Math.PI * 2,
            duration: 3,
            repeat: -1,
            ease: 'none'
        });
        
        gsap.to(innerRing.rotation, {
            z: -Math.PI * 2,
            duration: 2,
            repeat: -1,
            ease: 'none'
        });
        
        return group;
    }
    
    // 创建胜利彩带
    createConfetti(position) {
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
        const geometry = new THREE.PlaneGeometry(0.1, 0.2);
        
        for (let i = 0; i < 50; i++) {
            const material = new THREE.MeshBasicMaterial({
                color: colors[Math.floor(Math.random() * colors.length)],
                side: THREE.DoubleSide
            });
            
            const confetti = new THREE.Mesh(geometry, material);
            confetti.position.copy(position);
            confetti.position.x += (Math.random() - 0.5) * 3;
            confetti.position.z += (Math.random() - 0.5) * 3;
            confetti.position.y += Math.random() * 2;
            
            this.scene.add(confetti);
            
            // 飘落动画
            gsap.to(confetti.position, {
                y: confetti.position.y - 8,
                x: confetti.position.x + (Math.random() - 0.5) * 4,
                z: confetti.position.z + (Math.random() - 0.5) * 4,
                duration: 3 + Math.random() * 2,
                ease: 'power2.in',
                onComplete: () => this.scene.remove(confetti)
            });
            
            gsap.to(confetti.rotation, {
                x: Math.random() * Math.PI * 4,
                y: Math.random() * Math.PI * 4,
                z: Math.random() * Math.PI * 4,
                duration: 3 + Math.random() * 2
            });
        }
    }
    
    // 清理所有特效
    clear() {
        this.particles.forEach(p => this.scene.remove(p));
        this.particles = [];
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Effects3D;
}
