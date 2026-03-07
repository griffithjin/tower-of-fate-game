/**
 * 命运塔 - 音乐播放器系统
 * Tower of Fate - Music Player System
 * 
 * 管理196国背景音乐播放和游戏音效
 * Manages 196 countries background music and game sound effects
 */

class FateMusicPlayer {
    constructor() {
        this.currentCountry = null;
        this.currentMusic = null;
        this.currentAmbient = null;
        this.soundEffects = {};
        this.isMuted = false;
        this.settings = {
            masterVolume: 1.0,
            musicVolume: 0.7,
            sfxVolume: 0.8,
            ambientVolume: 0.4
        };
        this.musicCache = new Map();
        this.maxCacheSize = 5; // 最多缓存5首音乐
        
        // 初始化音频上下文
        this.initAudioContext();
    }

    /**
     * 初始化音频上下文
     */
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.settings.masterVolume;
            
            // 创建分类增益节点
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            this.ambientGain = this.audioContext.createGain();
            
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.ambientGain.connect(this.masterGain);
            
            this.updateVolumes();
        } catch (e) {
            console.warn('Web Audio API not supported, falling back to HTML5 Audio');
            this.useFallback = true;
        }
    }

    /**
     * 更新音量设置
     */
    updateVolumes() {
        if (this.useFallback) return;
        
        this.musicGain.gain.value = this.settings.musicVolume;
        this.sfxGain.gain.value = this.settings.sfxVolume;
        this.ambientGain.gain.value = this.settings.ambientVolume;
        this.masterGain.gain.value = this.settings.masterVolume;
    }

    /**
     * 设置主音量
     * @param {number} volume - 0.0 到 1.0
     */
    setMasterVolume(volume) {
        this.settings.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    /**
     * 设置音乐音量
     * @param {number} volume - 0.0 到 1.0
     */
    setMusicVolume(volume) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    /**
     * 设置音效音量
     * @param {number} volume - 0.0 到 1.0
     */
    setSfxVolume(volume) {
        this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    /**
     * 设置环境音量
     * @param {number} volume - 0.0 到 1.0
     */
    setAmbientVolume(volume) {
        this.settings.ambientVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    /**
     * 静音/取消静音
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.useFallback) {
            // HTML5 Audio 静音
            if (this.currentMusic) this.currentMusic.muted = this.isMuted;
            if (this.currentAmbient) this.currentAmbient.muted = this.isMuted;
            Object.values(this.soundEffects).forEach(sfx => {
                if (sfx.audio) sfx.audio.muted = this.isMuted;
            });
        } else {
            // Web Audio API 静音
            this.masterGain.gain.value = this.isMuted ? 0 : this.settings.masterVolume;
        }
        return this.isMuted;
    }

    /**
     * 播放国家主题音乐
     * @param {string} countryCode - 国家代码 (如 'CN', 'US')
     * @param {Object} options - 播放选项
     */
    async playCountryMusic(countryCode, options = {}) {
        if (!COUNTRY_MUSIC[countryCode]) {
            console.warn(`Country ${countryCode} not found in music library`);
            return;
        }

        const country = COUNTRY_MUSIC[countryCode];
        
        // 如果正在播放同一国家的音乐，不重复播放
        if (this.currentCountry === countryCode && this.currentMusic) {
            return;
        }

        // 停止当前音乐
        this.stopMusic();

        this.currentCountry = countryCode;
        
        // 生成或获取音乐
        const musicUrl = await this.generateOrGetMusic(country);
        
        if (this.useFallback) {
            // 使用 HTML5 Audio
            this.currentMusic = new Audio(musicUrl);
            this.currentMusic.loop = options.loop !== false;
            this.currentMusic.volume = this.settings.musicVolume;
            this.currentMusic.muted = this.isMuted;
            await this.currentMusic.play();
        } else {
            // 使用 Web Audio API
            await this.playWithWebAudio(musicUrl, 'music', options.loop !== false);
        }

        // 触发事件
        this.emit('musicStart', { country: countryCode, data: country });
    }

    /**
     * 生成或获取音乐
     * @param {Object} country - 国家音乐数据
     * @returns {string} - 音乐URL
     */
    async generateOrGetMusic(country) {
        const cacheKey = country.nameEn;
        
        if (this.musicCache.has(cacheKey)) {
            return this.musicCache.get(cacheKey);
        }

        // 生成音乐URL（这里使用占位符，实际应该连接到音乐生成服务）
        const musicUrl = this.generateMusicUrl(country);
        
        // 缓存管理
        if (this.musicCache.size >= this.maxCacheSize) {
            const firstKey = this.musicCache.keys().next().value;
            this.musicCache.delete(firstKey);
        }
        this.musicCache.set(cacheKey, musicUrl);
        
        return musicUrl;
    }

    /**
     * 生成音乐URL（占位符实现）
     * @param {Object} country - 国家音乐数据
     * @returns {string} - 音乐URL
     */
    generateMusicUrl(country) {
        // 实际项目中，这里应该调用音乐生成API
        // 例如：调用 Suno、AIVA 或其他音乐生成服务
        const params = new URLSearchParams({
            style: country.style,
            tempo: country.tempo,
            instruments: country.instruments.join(','),
            scale: country.scale.join(','),
            mood: country.mood,
            duration: country.duration
        });
        
        // 返回占位符URL，实际应替换为真实的音乐生成服务
        return `https://api.toweroffate.com/music/generate?${params.toString()}`;
    }

    /**
     * 使用 Web Audio API 播放
     * @param {string} url - 音频URL
     * @param {string} type - 音频类型 (music, sfx, ambient)
     * @param {boolean} loop - 是否循环
     */
    async playWithWebAudio(url, type, loop = false) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = loop;
            
            const gainNode = type === 'music' ? this.musicGain :
                           type === 'sfx' ? this.sfxGain : this.ambientGain;
            
            source.connect(gainNode);
            source.start(0);
            
            if (type === 'music') {
                this.currentMusic = source;
            } else if (type === 'ambient') {
                this.currentAmbient = source;
            }
            
            source.onended = () => {
                if (type === 'music' && this.currentMusic === source) {
                    this.currentMusic = null;
                    this.emit('musicEnd', { country: this.currentCountry });
                }
            };
        } catch (e) {
            console.error('Web Audio playback failed:', e);
        }
    }

    /**
     * 停止当前音乐
     */
    stopMusic() {
        if (this.currentMusic) {
            if (this.useFallback) {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
            } else {
                try {
                    this.currentMusic.stop();
                } catch (e) {}
            }
            this.currentMusic = null;
        }
        this.currentCountry = null;
    }

    /**
     * 暂停音乐
     */
    pauseMusic() {
        if (this.currentMusic) {
            if (this.useFallback) {
                this.currentMusic.pause();
            } else {
                this.audioContext.suspend();
            }
        }
    }

    /**
     * 恢复音乐
     */
    resumeMusic() {
        if (this.currentMusic) {
            if (this.useFallback) {
                this.currentMusic.play();
            } else {
                this.audioContext.resume();
            }
        }
    }

    /**
     * 播放音效
     * @param {string} soundName - 音效名称
     * @param {Object} options - 播放选项
     */
    async playSound(soundName, options = {}) {
        if (!GAME_SOUNDS[soundName]) {
            console.warn(`Sound ${soundName} not found`);
            return;
        }

        const sound = GAME_SOUNDS[soundName];
        const volume = options.volume || sound.volume || 1.0;
        
        if (this.useFallback) {
            const audio = new Audio(sound.path);
            audio.volume = volume * this.settings.sfxVolume;
            audio.muted = this.isMuted;
            await audio.play();
        } else {
            await this.playWithWebAudio(sound.path, 'sfx', false);
        }

        this.emit('soundPlay', { name: soundName, data: sound });
    }

    /**
     * 播放环境音效
     * @param {string} ambientName - 环境音效名称
     */
    async playAmbient(ambientName) {
        if (!GAME_SOUNDS[ambientName]) return;
        
        this.stopAmbient();
        
        const ambient = GAME_SOUNDS[ambientName];
        
        if (this.useFallback) {
            this.currentAmbient = new Audio(ambient.path);
            this.currentAmbient.loop = true;
            this.currentAmbient.volume = this.settings.ambientVolume;
            this.currentAmbient.muted = this.isMuted;
            await this.currentAmbient.play();
        } else {
            await this.playWithWebAudio(ambient.path, 'ambient', true);
        }
    }

    /**
     * 停止环境音效
     */
    stopAmbient() {
        if (this.currentAmbient) {
            if (this.useFallback) {
                this.currentAmbient.pause();
                this.currentAmbient.currentTime = 0;
            } else {
                try {
                    this.currentAmbient.stop();
                } catch (e) {}
            }
            this.currentAmbient = null;
        }
    }

    /**
     * 播放连续音效（如移动）
     * @param {string} soundName - 音效名称
     * @param {number} duration - 持续时间（秒）
     */
    async playContinuous(soundName, duration) {
        await this.playSound(soundName);
        
        if (duration) {
            setTimeout(() => {
                this.stopSound(soundName);
            }, duration * 1000);
        }
    }

    /**
     * 停止特定音效
     * @param {string} soundName - 音效名称
     */
    stopSound(soundName) {
        if (this.soundEffects[soundName]) {
            const sfx = this.soundEffects[soundName];
            if (sfx.audio) {
                sfx.audio.pause();
                sfx.audio.currentTime = 0;
            }
            delete this.soundEffects[soundName];
        }
    }

    /**
     * 按分类播放随机音效
     * @param {string} category - 音效分类
     */
    playRandomFromCategory(category) {
        if (!SOUND_CATEGORIES[category]) return;
        
        const sounds = SOUND_CATEGORIES[category].sounds;
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        this.playSound(randomSound);
    }

    /**
     * 预加载音效
     * @param {string[]} soundNames - 音效名称列表
     */
    async preloadSounds(soundNames) {
        const promises = soundNames.map(name => {
            if (!GAME_SOUNDS[name]) return Promise.resolve();
            
            return new Promise((resolve) => {
                const audio = new Audio();
                audio.src = GAME_SOUNDS[name].path;
                audio.addEventListener('canplaythrough', resolve, { once: true });
                audio.addEventListener('error', resolve, { once: true });
            });
        });
        
        await Promise.all(promises);
    }

    /**
     * 获取当前播放的国家信息
     * @returns {Object|null}
     */
    getCurrentCountry() {
        if (!this.currentCountry) return null;
        return {
            code: this.currentCountry,
            ...COUNTRY_MUSIC[this.currentCountry]
        };
    }

    /**
     * 获取播放器状态
     * @returns {Object}
     */
    getStatus() {
        return {
            isPlaying: !!this.currentMusic,
            currentCountry: this.currentCountry,
            isMuted: this.isMuted,
            settings: { ...this.settings }
        };
    }

    /**
     * 事件发射器
     */
    emit(eventName, data) {
        const event = new CustomEvent(`fateMusic:${eventName}`, { detail: data });
        window.dispatchEvent(event);
    }

    /**
     * 添加事件监听器
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(eventName, callback) {
        window.addEventListener(`fateMusic:${eventName}`, (e) => callback(e.detail));
    }

    /**
     * 销毁播放器
     */
    destroy() {
        this.stopMusic();
        this.stopAmbient();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.musicCache.clear();
        this.soundEffects = {};
    }

    // ==================== 快捷方法 Quick Methods ====================
    
    /**
     * 播放移动上升音效
     */
    playRise() {
        return this.playSound('playerRise');
    }

    /**
     * 播放移动下降音效
     */
    playFall() {
        return this.playSound('playerFall');
    }

    /**
     * 播放激怒牌触发音效
     */
    playProvoke() {
        return this.playSound('provokeTrigger');
    }

    /**
     * 播放匹配成功音效
     */
    playMatchSuccess() {
        return this.playSound('matchSuccess');
    }

    /**
     * 播放匹配失败音效
     */
    playMatchFail() {
        return this.playSound('matchFail');
    }

    /**
     * 播放晋级音效
     */
    playPromote() {
        return this.playSound('promote');
    }

    /**
     * 播放卡牌音效
     * @param {string} action - 动作 (scroll, select, play, flip)
     */
    playCard(action) {
        const soundMap = {
            scroll: 'cardScroll',
            select: 'cardSelect',
            play: 'cardPlay',
            flip: 'cardFlip',
            shuffle: 'cardShuffle',
            draw: 'cardDraw'
        };
        return this.playSound(soundMap[action] || 'cardSelect');
    }

    /**
     * 播放UI音效
     * @param {string} action - 动作 (click, hover, open, close, back)
     */
    playUI(action) {
        const soundMap = {
            click: 'uiClick',
            hover: 'uiHover',
            open: 'uiOpen',
            close: 'uiClose',
            back: 'uiBack'
        };
        return this.playSound(soundMap[action] || 'uiClick');
    }
}

// ==================== 全局实例 Global Instance ====================

let musicPlayer = null;

/**
 * 获取音乐播放器实例（单例模式）
 * @returns {FateMusicPlayer}
 */
function getMusicPlayer() {
    if (!musicPlayer) {
        musicPlayer = new FateMusicPlayer();
    }
    return musicPlayer;
}

/**
 * 初始化音乐系统
 * @returns {FateMusicPlayer}
 */
function initMusicSystem() {
    return getMusicPlayer();
}

/**
 * 播放国家音乐（快捷函数）
 * @param {string} countryCode - 国家代码
 * @param {Object} options - 播放选项
 */
function playCountryMusic(countryCode, options = {}) {
    return getMusicPlayer().playCountryMusic(countryCode, options);
}

/**
 * 播放音效（快捷函数）
 * @param {string} soundName - 音效名称
 * @param {Object} options - 播放选项
 */
function playSound(soundName, options = {}) {
    return getMusicPlayer().playSound(soundName, options);
}

// ==================== 导出 Exports ====================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FateMusicPlayer,
        getMusicPlayer,
        initMusicSystem,
        playCountryMusic,
        playSound
    };
}

// 浏览器环境全局变量
if (typeof window !== 'undefined') {
    window.FateMusicPlayer = FateMusicPlayer;
    window.getMusicPlayer = getMusicPlayer;
    window.initMusicSystem = initMusicSystem;
    window.playCountryMusic = playCountryMusic;
    window.playSound = playSound;
}
