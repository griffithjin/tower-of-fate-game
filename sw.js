/**
 * Tower of Fate - Service Worker
 * 命运塔 - Service Worker 缓存策略
 * 
 * 版本: v1
 * 策略: 缓存优先，网络回退
 */

const CACHE_NAME = 'tower-of-fate-v1';
const STATIC_CACHE = 'tower-of-fate-static-v1';
const IMAGE_CACHE = 'tower-of-fate-images-v1';
const API_CACHE = 'tower-of-fate-api-v1';

// 核心静态资源 - 安装时预缓存
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/main.css',
    '/css/critical.css',
    '/js/core.js',
    '/js/i18n-system.js',
    '/js/performance-optimizer.js',
    '/images/logo.png',
    '/images/icons/favicon.ico',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-512x512.png'
];

// 可选资源 - 不强求缓存成功
const OPTIONAL_ASSETS = [
    '/fonts/main.woff2',
    '/fonts/icons.woff2',
    '/css/themes/dark.css',
    '/css/themes/light.css'
];

// 安装事件 - 预缓存核心资源
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...');
    
    event.waitUntil(
        Promise.all([
            // 缓存核心资源
            caches.open(STATIC_CACHE).then(cache => {
                console.log('[SW] Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // 尝试缓存可选资源（不阻塞安装）
            caches.open(STATIC_CACHE).then(cache => {
                return Promise.allSettled(
                    OPTIONAL_ASSETS.map(url => 
                        fetch(url).then(response => {
                            if (response.ok) cache.put(url, response);
                        }).catch(() => {})
                    )
                );
            })
        ])
        .then(() => {
            console.log('[SW] Installation complete');
            return self.skipWaiting();
        })
        .catch(error => {
            console.error('[SW] Installation failed:', error);
        })
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => {
                        // 清理旧版本的缓存
                        return name.startsWith('tower-of-fate-') && 
                               name !== STATIC_CACHE && 
                               name !== IMAGE_CACHE && 
                               name !== API_CACHE;
                    })
                    .map(name => {
                        console.log('[SW] Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            console.log('[SW] Activation complete');
            return self.clients.claim();
        })
    );
});

// 获取事件 - 缓存策略
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // 跳过非 GET 请求
    if (request.method !== 'GET') {
        return;
    }
    
    // 跳过 Chrome 扩展请求
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // 根据不同资源类型使用不同策略
    if (isStaticAsset(url)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isImage(url)) {
        event.respondWith(handleImage(request));
    } else if (isAPI(request)) {
        event.respondWith(handleAPI(request));
    } else {
        event.respondWith(handleGeneric(request));
    }
});

// 判断是否为静态资源
function isStaticAsset(url) {
    return STATIC_ASSETS.includes(url.pathname) ||
           url.pathname.match(/\.(js|css|woff2?)$/);
}

// 判断是否为图片
function isImage(url) {
    return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/i);
}

// 判断是否为 API 请求
function isAPI(request) {
    return request.url.includes('/api/');
}

/**
 * 静态资源策略：缓存优先，网络回退
 */
async function handleStaticAsset(request) {
    const cache = await caches.open(STATIC_CACHE);
    
    // 先尝试从缓存获取
    const cached = await cache.match(request);
    if (cached) {
        // 后台更新缓存
        fetch(request).then(response => {
            if (response.ok) {
                cache.put(request, response);
                notifyClients('CACHE_UPDATED', { url: request.url });
            }
        }).catch(() => {});
        
        return cached;
    }
    
    // 缓存未命中，从网络获取
    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] Failed to fetch static asset:', error);
        return new Response('Network error', { status: 408 });
    }
}

/**
 * 图片策略： stale-while-revalidate
 * 先返回缓存，后台更新
 */
async function handleImage(request) {
    const cache = await caches.open(IMAGE_CACHE);
    
    const cached = await cache.match(request);
    
    // 始终发起网络请求更新缓存
    const networkPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => {
        // 网络失败，如果已有缓存则静默失败
        if (cached) return null;
        // 没有缓存，返回占位图
        return fetch('/images/placeholder.png');
    });
    
    // 如果有缓存，立即返回
    if (cached) {
        // 后台更新
        networkPromise.then(response => {
            if (response) {
                notifyClients('IMAGE_UPDATED', { url: request.url });
            }
        });
        return cached;
    }
    
    // 没有缓存，等待网络响应
    const networkResponse = await networkPromise;
    if (networkResponse) {
        return networkResponse;
    }
    
    // 全部失败
    return new Response('Image not available', { status: 404 });
}

/**
 * API 策略：网络优先，缓存回退
 */
async function handleAPI(request) {
    const cache = await caches.open(API_CACHE);
    
    try {
        // 优先从网络获取
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // 缓存成功的响应
            const responseClone = networkResponse.clone();
            cache.put(request, responseClone);
            return networkResponse;
        }
        
        // 网络返回错误，尝试缓存
        throw new Error('Network response not ok');
        
    } catch (error) {
        // 网络失败，尝试缓存
        const cached = await cache.match(request);
        if (cached) {
            console.log('[SW] Serving API from cache:', request.url);
            return cached;
        }
        
        // 没有缓存，返回离线响应
        return new Response(
            JSON.stringify({ 
                error: 'offline', 
                message: 'You are currently offline. Please check your connection.' 
            }),
            { 
                status: 503, 
                headers: { 'Content-Type': 'application/json' } 
            }
        );
    }
}

/**
 * 通用策略：网络优先
 */
async function handleGeneric(request) {
    try {
        return await fetch(request);
    } catch (error) {
        // 尝试缓存
        const cache = await caches.open(STATIC_CACHE);
        const cached = await cache.match(request);
        if (cached) return cached;
        
        throw error;
    }
}

/**
 * 通知所有客户端
 */
function notifyClients(type, data) {
    self.clients.matchAll().then(clients => {
        clients.forEach(client => {
            client.postMessage({ type, ...data });
        });
    });
}

// 监听消息
self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(names => {
            return Promise.all(names.map(name => caches.delete(name)));
        }).then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// 后台同步
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-game-actions') {
        event.waitUntil(syncGameActions());
    }
});

/**
 * 同步游戏操作
 */
async function syncGameActions() {
    // 从 IndexedDB 获取待同步的操作
    // 这里可以实现离线游戏操作的同步
    console.log('[SW] Syncing game actions...');
}

// 推送通知
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: '/images/icons/icon-192x192.png',
                badge: '/images/icons/badge-72x72.png',
                data: data.data
            })
        );
    }
});

// 通知点击
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        self.clients.openWindow(event.notification.data?.url || '/')
    );
});

console.log('[SW] Service Worker loaded');
