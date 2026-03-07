/**
 * Tower of Fate - Performance Optimizer
 * 命运塔 - 性能优化器
 * 
 * 包含功能：
 * - 图片懒加载
 * - 代码分割按需加载
 * - Service Worker资源缓存
 * - 资源压缩优化
 * - 加载时间监控
 * - 慢加载优化降级
 */

class PerformanceOptimizer {
    constructor() {
        this.missingTranslations = [];
        this.init();
    }
    
    init() {
        this.lazyLoadImages();
        this.codeSplitting();
        this.cacheAssets();
        this.compressResources();
        this.preloadCriticalResources();
        this.optimizeAnimations();
    }
    
    /**
     * 图片懒加载
     * 使用 IntersectionObserver 实现高性能图片懒加载
     */
    lazyLoadImages() {
        if (!('IntersectionObserver' in window)) {
            // 降级处理：立即加载所有图片
            document.querySelectorAll('img[data-src]').forEach(img => {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            });
            return;
        }

        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // 添加淡入效果
                    img.style.opacity = '0';
                    img.style.transition = 'opacity 0.3s ease';
                    
                    // 加载图片
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                    }
                    
                    // 加载完成后淡入
                    img.onload = () => {
                        img.style.opacity = '1';
                    };
                    
                    // 处理加载失败
                    img.onerror = () => {
                        img.src = '/images/placeholder.png';
                        img.style.opacity = '1';
                    };
                    
                    observer.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px', // 提前50px开始加载
            threshold: 0.01
        });
        
        // 观察所有懒加载图片
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        console.log('[Performance] Lazy loading initialized for', 
            document.querySelectorAll('img[data-src]').length, 'images');
    }
    
    /**
     * 代码分割按需加载
     * 动态导入大型库，减少首屏加载时间
     */
    codeSplitting() {
        // 按需加载3D库 (Three.js)
        if (document.querySelector('#game-container, .tower-3d, [data-require-3d]')) {
            this.load3DModule();
        }
        
        // 按需加载图表库 (ECharts)
        if (document.querySelector('.chart-container, [data-require-chart]')) {
            this.loadChartModule();
        }
        
        // 按需加载音效库 (Tone.js)
        if (document.querySelector('[data-require-audio]')) {
            this.loadAudioModule();
        }
        
        // 按需加载动画库 (GSAP)
        if (document.querySelector('[data-require-animation]')) {
            this.loadAnimationModule();
        }
    }
    
    async load3DModule() {
        try {
            const startTime = performance.now();
            const module = await import('./3d/three-bundle.js');
            window.ThreeJS = module;
            console.log(`[Performance] 3D module loaded in ${performance.now() - startTime}ms`);
            
            // 触发加载完成事件
            window.dispatchEvent(new CustomEvent('tower:3d-ready'));
        } catch (error) {
            console.error('[Performance] Failed to load 3D module:', error);
        }
    }
    
    async loadChartModule() {
        try {
            const startTime = performance.now();
            await import('./charts/echarts-bundle.js');
            console.log(`[Performance] Chart module loaded in ${performance.now() - startTime}ms`);
            window.dispatchEvent(new CustomEvent('tower:chart-ready'));
        } catch (error) {
            console.error('[Performance] Failed to load chart module:', error);
        }
    }
    
    async loadAudioModule() {
        try {
            const startTime = performance.now();
            const module = await import('./audio/tone-bundle.js');
            window.AudioEngine = module;
            console.log(`[Performance] Audio module loaded in ${performance.now() - startTime}ms`);
            window.dispatchEvent(new CustomEvent('tower:audio-ready'));
        } catch (error) {
            console.error('[Performance] Failed to load audio module:', error);
        }
    }
    
    async loadAnimationModule() {
        try {
            const startTime = performance.now();
            const module = await import('./animation/gsap-bundle.js');
            window.AnimationEngine = module;
            console.log(`[Performance] Animation module loaded in ${performance.now() - startTime}ms`);
            window.dispatchEvent(new CustomEvent('tower:animation-ready'));
        } catch (error) {
            console.error('[Performance] Failed to load animation module:', error);
        }
    }
    
    /**
     * 资源缓存
     * 注册Service Worker实现离线缓存
     */
    cacheAssets() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('[Performance] Service Worker registered:', registration.scope);
                    
                    // 监听Service Worker更新
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // 发现新版本，提示用户刷新
                                this.showUpdateNotification(newWorker);
                            }
                        });
                    });
                })
                .catch(error => {
                    console.error('[Performance] Service Worker registration failed:', error);
                });
            
            // 监听Service Worker消息
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data.type === 'CACHE_UPDATED') {
                    console.log('[Performance] Cache updated:', event.data.url);
                }
            });
        }
    }
    
    /**
     * 显示更新通知
     */
    showUpdateNotification(worker) {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <span data-i18n="update.available">有新版本可用</span>
            <button id="update-app" data-i18n="update.refresh">刷新</button>
        `;
        document.body.appendChild(notification);
        
        document.getElementById('update-app').addEventListener('click', () => {
            worker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
        });
    }
    
    /**
     * 资源压缩
     * 配置资源压缩选项
     */
    compressResources() {
        // 检查浏览器是否支持现代压缩格式
        const supportsWebP = document.createElement('canvas')
            .toDataURL('image/webp')
            .indexOf('data:image/webp') === 0;
        
        const supportsAvif = document.createElement('canvas')
            .toDataURL('image/avif')
            .indexOf('data:image/avif') === 0;
        
        // 存储支持状态供图片加载使用
        window.imageCompressionSupport = {
            webp: supportsWebP,
            avif: supportsAvif,
            preferred: supportsAvif ? 'avif' : (supportsWebP ? 'webp' : 'jpg')
        };
        
        console.log('[Performance] Image compression support:', window.imageCompressionSupport);
        
        // 自动转换图片URL到最优格式
        this.optimizeImageUrls();
    }
    
    /**
     * 优化图片URL
     * 自动添加格式后缀
     */
    optimizeImageUrls() {
        const format = window.imageCompressionSupport?.preferred;
        if (!format || format === 'jpg') return;
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            const src = img.dataset.src;
            if (src && !src.includes('?format=') && !src.endsWith('.svg')) {
                img.dataset.src = `${src}?format=${format}`;
            }
        });
    }
    
    /**
     * 预加载关键资源
     */
    preloadCriticalResources() {
        const criticalResources = [
            { href: '/css/critical.css', as: 'style' },
            { href: '/fonts/main.woff2', as: 'font', type: 'font/woff2', crossorigin: true },
            { href: '/images/logo.png', as: 'image' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.type) link.type = resource.type;
            if (resource.crossorigin) link.crossOrigin = 'anonymous';
            document.head.appendChild(link);
        });
    }
    
    /**
     * 优化动画性能
     */
    optimizeAnimations() {
        // 检测用户是否偏好减少动画
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (prefersReducedMotion) {
            document.documentElement.classList.add('reduce-motion');
            console.log('[Performance] Reduced motion mode enabled');
        }
        
        // 监听可见性变化，暂停不可见页面的动画
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                document.documentElement.classList.add('page-hidden');
            } else {
                document.documentElement.classList.remove('page-hidden');
            }
        });
    }
}

/**
 * 加载时间监控器
 */
class LoadTimeMonitor {
    constructor() {
        this.metrics = {};
        this.init();
    }
    
    init() {
        this.measureLoadTime();
        this.measureResourceTiming();
        this.measurePaintTiming();
    }
    
    measureLoadTime() {
        window.addEventListener('load', () => {
            // 使用 setTimeout 确保所有资源都已加载
            setTimeout(() => {
                const timing = performance.timing;
                const navigation = performance.getEntriesByType('navigation')[0];
                
                this.metrics = {
                    // 传统 timing API
                    dnsLookup: timing.domainLookupEnd - timing.domainLookupStart,
                    tcpConnection: timing.connectEnd - timing.connectStart,
                    serverResponse: timing.responseEnd - timing.requestStart,
                    domProcessing: timing.domComplete - timing.domLoading,
                    totalLoadTime: timing.loadEventEnd - timing.navigationStart,
                    
                    // 现代 Navigation Timing API
                    loadTime: navigation ? navigation.loadEventEnd : null,
                    domContentLoaded: navigation ? navigation.domContentLoadedEventEnd : null
                };
                
                console.log('[Performance] Page load metrics:', this.metrics);
                
                // 上报数据到分析服务
                this.reportMetrics('page_load_time', this.metrics);
                
                // 如果加载时间超过3秒，启用慢加载优化
                if (this.metrics.totalLoadTime > 3000) {
                    this.optimizeSlowLoad();
                }
                
                // 触发性能指标事件
                window.dispatchEvent(new CustomEvent('tower:performance-metrics', {
                    detail: this.metrics
                }));
                
            }, 0);
        });
    }
    
    /**
     * 测量资源加载时间
     */
    measureResourceTiming() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const resources = performance.getEntriesByType('resource');
                const slowResources = resources.filter(r => r.duration > 1000);
                
                if (slowResources.length > 0) {
                    console.warn('[Performance] Slow resources detected:', 
                        slowResources.map(r => ({ name: r.name, duration: r.duration })));
                }
                
                this.reportMetrics('slow_resources', {
                    count: slowResources.length,
                    resources: slowResources.map(r => ({
                        name: r.name.split('/').pop(),
                        duration: Math.round(r.duration)
                    }))
                });
            }, 100);
        });
    }
    
    /**
     * 测量绘制时间 (FP, FCP, LCP)
     */
    measurePaintTiming() {
        // First Paint & First Contentful Paint
        const paintObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (entry.name === 'first-contentful-paint') {
                    this.metrics.fcp = entry.startTime;
                    console.log('[Performance] FCP:', entry.startTime.toFixed(2), 'ms');
                }
                if (entry.name === 'first-paint') {
                    this.metrics.fp = entry.startTime;
                    console.log('[Performance] FP:', entry.startTime.toFixed(2), 'ms');
                }
            }
        });
        
        try {
            paintObserver.observe({ entryTypes: ['paint'] });
        } catch (e) {
            console.warn('[Performance] Paint timing not supported');
        }
        
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.lcp = lastEntry.startTime;
            console.log('[Performance] LCP:', lastEntry.startTime.toFixed(2), 'ms');
        });
        
        try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.warn('[Performance] LCP not supported');
        }
    }
    
    /**
     * 慢加载优化
     */
    optimizeSlowLoad() {
        console.log('[Performance] Enabling slow load optimizations...');
        
        // 启用简化模式
        document.body.classList.add('lite-mode');
        
        // 禁用非必要动画
        document.querySelectorAll('.animation-heavy, .parallax, .floating').forEach(el => {
            el.style.animation = 'none';
            el.style.transition = 'none';
        });
        
        // 降低图片质量
        document.querySelectorAll('img[data-quality="high"]').forEach(img => {
            img.dataset.quality = 'medium';
            if (img.src) {
                img.src = img.src.replace('quality=high', 'quality=medium');
            }
        });
        
        // 禁用3D效果
        document.querySelectorAll('[data-3d="true"]').forEach(el => {
            el.dataset.d3 = 'false';
        });
        
        console.log('[Performance] Slow load optimizations applied');
        
        // 上报慢加载事件
        this.reportMetrics('slow_load_detected', {
            loadTime: this.metrics.totalLoadTime,
            timestamp: Date.now()
        });
    }
    
    /**
     * 上报性能指标
     */
    reportMetrics(event, data) {
        // 如果有分析库，使用它
        if (typeof analytics !== 'undefined' && analytics.track) {
            analytics.track(`performance_${event}`, data);
        }
        
        // 发送到服务器（可选）
        if (navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/performance', JSON.stringify({
                event,
                data,
                url: window.location.pathname,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            }));
        }
    }
}

/**
 * 内存优化器
 */
class MemoryOptimizer {
    constructor() {
        this.cleanupInterval = null;
        this.init();
    }
    
    init() {
        // 定期清理内存
        this.startCleanupInterval();
        
        // 页面卸载时清理
        window.addEventListener('beforeunload', () => this.cleanup());
        
        // 监听内存警告
        if ('storage' in navigator && 'estimate' in navigator.storage) {
            this.monitorStorage();
        }
    }
    
    startCleanupInterval() {
        // 每5分钟清理一次
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }
    
    cleanup() {
        // 清理未使用的图片缓存
        if (window.imageCache) {
            const now = Date.now();
            for (const [key, value] of window.imageCache.entries()) {
                if (now - value.timestamp > 10 * 60 * 1000) { // 10分钟未使用
                    window.imageCache.delete(key);
                }
            }
        }
        
        // 清理控制台
        if (console.clear && Math.random() > 0.9) {
            console.clear();
        }
        
        // 提示垃圾回收（如果可能）
        if (window.gc) {
            window.gc();
        }
    }
    
    async monitorStorage() {
        try {
            const estimate = await navigator.storage.estimate();
            const usage = (estimate.usage / estimate.quota * 100).toFixed(2);
            
            if (usage > 80) {
                console.warn('[Performance] Storage usage high:', usage + '%');
                this.aggressiveCleanup();
            }
        } catch (error) {
            console.error('[Performance] Storage estimate failed:', error);
        }
    }
    
    aggressiveCleanup() {
        // 清除所有缓存
        if (window.imageCache) {
            window.imageCache.clear();
        }
        
        // 清除Service Worker缓存
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    if (name !== 'tower-of-fate-v1') {
                        caches.delete(name);
                    }
                });
            });
        }
    }
}

// 自动初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.perfOptimizer = new PerformanceOptimizer();
        window.loadMonitor = new LoadTimeMonitor();
        window.memoryOptimizer = new MemoryOptimizer();
    });
} else {
    window.perfOptimizer = new PerformanceOptimizer();
    window.loadMonitor = new LoadTimeMonitor();
    window.memoryOptimizer = new MemoryOptimizer();
}

// 导出供外部使用
window.PerformanceOptimizer = PerformanceOptimizer;
window.LoadTimeMonitor = LoadTimeMonitor;
window.MemoryOptimizer = MemoryOptimizer;
