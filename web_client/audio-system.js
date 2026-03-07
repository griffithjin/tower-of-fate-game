/**
 * 命运塔游戏音效系统
 * Tower of Fate - Audio System
 * 
 * 使用 Web Audio API 实现完整的游戏音频管理
 * 支持背景音乐、音效播放、音量控制、静音等功能
 * 音效通过程序合成生成，无需外部音频文件
 */

class TowerAudioSystem {
    constructor() {
        // 音频上下文
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        // 音量设置 (0-1)
        this.volume = {
            master: 0.8,
            music: 0.7,
            sfx: 0.9
        };
        
        // 静音状态
        this.isMuted = false;
        this.wasMuted = false;
        
        // 背景音乐状态
        this.currentMusic = null;
        this.currentMusicSource = null;
        this.currentMusicType = null;
        
        // 音效缓存
        this.soundCache = new Map();
        this.preloadedSounds = new Set();
        
        // 音乐循环标记
        this.musicLoops = {
            menu: true,
            game: true,
            battle: true
        };
        
        // 初始化状态
        this.isInitialized = false;
    }

    /**
     * 初始化音频系统
     * 必须在用户交互后调用（浏览器策略要求）
     */
    init() {
        if (this.isInitialized) return true;
        
        try {
            // 创建音频上下文
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // 创建主音量节点
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.value = this.volume.master;
            this.masterGain.connect(this.audioContext.destination);
            
            // 创建音乐音量节点
            this.musicGain = this.audioContext.createGain();
            this.musicGain.gain.value = this.volume.music;
            this.musicGain.connect(this.masterGain);
            
            // 创建音效音量节点
            this.sfxGain = this.audioContext.createGain();
            this.sfxGain.gain.value = this.volume.sfx;
            this.sfxGain.connect(this.masterGain);
            
            this.isInitialized = true;
            console.log('[AudioSystem] 音频系统初始化成功');
            return true;
        } catch (error) {
            console.error('[AudioSystem] 初始化失败:', error);
            return false;
        }
    }

    /**
     * 恢复音频上下文（处理浏览器自动暂停）
     */
    resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            return this.audioContext.resume();
        }
        return Promise.resolve();
    }

    /**
     * 生成程序化音效数据
     * @param {string} type - 音效类型
     * @returns {AudioBuffer} 生成的音频缓冲区
     */
    generateSoundEffect(type) {
        const duration = this.getSoundDuration(type);
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(1, duration * sampleRate, sampleRate);
        const data = buffer.getChannelData(0);
        
        switch (type) {
            case 'cardPlay':
                // 出牌音效 - 清脆的滑音
                this.generateCardPlaySound(data, sampleRate);
                break;
            case 'rageTrigger':
                // 激怒牌触发 - 低沉的冲击音
                this.generateRageSound(data, sampleRate);
                break;
            case 'levelUp':
                // 层数晋升 - 上升的魔法音
                this.generateLevelUpSound(data, sampleRate);
                break;
            case 'victory':
                // 胜利音效 - 欢快的和弦
                this.generateVictorySound(data, sampleRate);
                break;
            case 'defeat':
                // 失败音效 - 低沉的下降音
                this.generateDefeatSound(data, sampleRate);
                break;
            case 'buttonClick':
                // 按钮点击 - 短促的点击声
                this.generateClickSound(data, sampleRate);
                break;
            case 'coinGet':
                // 金币获得 - 清脆的叮铃声
                this.generateCoinSound(data, sampleRate);
                break;
            default:
                // 默认白噪音
                for (let i = 0; i < data.length; i++) {
                    data[i] = (Math.random() * 2 - 1) * 0.1;
                }
        }
        
        return buffer;
    }

    /**
     * 获取音效时长
     */
    getSoundDuration(type) {
        const durations = {
            cardPlay: 0.3,
            rageTrigger: 0.5,
            levelUp: 1.5,
            victory: 2.0,
            defeat: 1.5,
            buttonClick: 0.1,
            coinGet: 0.4
        };
        return durations[type] || 0.3;
    }

    /**
     * 生成出牌音效
     */
    generateCardPlaySound(data, sampleRate) {
        const duration = data.length;
        for (let i = 0; i < duration; i++) {
            const t = i / sampleRate;
            // 快速上升的滑音
            const freq = 800 + t * 400;
            const envelope = Math.exp(-t * 8);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }
    }

    /**
     * 生成激怒音效
     */
    generateRageSound(data, sampleRate) {
        const duration = data.length;
        for (let i = 0; i < duration; i++) {
            const t = i / sampleRate;
            // 低频冲击 + 噪声
            const baseFreq = 150;
            const noise = (Math.random() * 2 - 1) * 0.3;
            const envelope = Math.exp(-t * 4);
            const tone = Math.sin(2 * Math.PI * baseFreq * t) * envelope;
            data[i] = (tone + noise * (1 - t / (duration / sampleRate))) * 0.4;
        }
    }

    /**
     * 生成层数晋升音效
     */
    generateLevelUpSound(data, sampleRate) {
        const duration = data.length;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        for (let i = 0; i < duration; i++) {
            const t = i / sampleRate;
            let sample = 0;
            notes.forEach((freq, idx) => {
                const noteTime = idx * 0.15;
                if (t >= noteTime && t < noteTime + 0.3) {
                    const localT = t - noteTime;
                    const envelope = Math.exp(-localT * 6) * (1 - localT / 0.3);
                    sample += Math.sin(2 * Math.PI * freq * localT) * envelope * 0.25;
                }
            });
            data[i] = sample;
        }
    }

    /**
     * 生成胜利音效
     */
    generateVictorySound(data, sampleRate) {
        const duration = data.length;
        const chords = [
            [523.25, 659.25, 783.99], // C major
            [659.25, 783.99, 1046.50], // E minor
            [783.99, 987.77, 1174.66], // G major
            [1046.50, 1318.51, 1567.98] // C major high
        ];
        for (let i = 0; i < duration; i++) {
            const t = i / sampleRate;
            let sample = 0;
            chords.forEach((chord, idx) => {
                const chordTime = idx * 0.4;
                if (t >= chordTime && t < chordTime + 0.5) {
                    const localT = t - chordTime;
                    const envelope = Math.exp(-localT * 3);
                    chord.forEach(freq => {
                        sample += Math.sin(2 * Math.PI * freq * localT) * envelope * 0.15;
                    });
                }
            });
            data[i] = sample;
        }
    }

    /**
     * 生成失败音效
     */
    generateDefeatSound(data, sampleRate) {
        const duration = data.length;
        for (let i = 0; i < duration; i++) {
            const t = i / sampleRate;
            // 下降的滑音
            const freq = 300 - t * 100;
            const envelope = Math.exp(-t * 2);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }
    }

    /**
     * 生成按钮点击音效
     */
    generateClickSound(data, sampleRate) {
        const duration = data.length;
        for (let i = 0; i < duration; i++) {
            const t = i / sampleRate;
            // 短促的高频音
            const freq = 2000;
            const envelope = Math.exp(-t * 30);
            data[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.2;
        }
    }

    /**
     * 生成金币音效
     */
    generateCoinSound(data, sampleRate) {
        const duration = data.length;
        for (let i = 0; i < duration; i++) {
            const t = i / sampleRate;
            // 清脆的铃声效果
            const freq1 = 1200;
            const freq2 = 1800;
            const envelope = Math.exp(-t * 10);
            const harmonic = Math.sin(2 * Math.PI * freq1 * t) * 0.5 + 
                           Math.sin(2 * Math.PI * freq2 * t) * 0.3;
            data[i] = harmonic * envelope * 0.3;
        }
    }

    /**
     * 生成背景音乐（程序合成）
     * @param {string} type - 音乐类型: menu, game, battle
     * @returns {AudioBuffer}
     */
    generateBackgroundMusic(type) {
        const duration = type === 'menu' ? 30 : type === 'battle' ? 20 : 40;
        const sampleRate = this.audioContext.sampleRate;
        const buffer = this.audioContext.createBuffer(2, duration * sampleRate, sampleRate);
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);
        
        switch (type) {
            case 'menu':
                this.generateMenuMusic(leftChannel, rightChannel, sampleRate, duration);
                break;
            case 'game':
                this.generateGameMusic(leftChannel, rightChannel, sampleRate, duration);
                break;
            case 'battle':
                this.generateBattleMusic(leftChannel, rightChannel, sampleRate, duration);
                break;
        }
        
        return buffer;
    }

    /**
     * 生成主菜单音乐
     */
    generateMenuMusic(left, right, sampleRate, duration) {
        const bpm = 80;
        const beatDuration = 60 / bpm;
        const melody = [261.63, 329.63, 392.00, 523.25, 392.00, 329.63]; // C major arpeggio
        
        for (let i = 0; i < left.length; i++) {
            const t = i / sampleRate;
            const beat = (t % (beatDuration * 4)) / beatDuration;
            const noteIndex = Math.floor(beat) % melody.length;
            const freq = melody[noteIndex];
            
            // 添加一些和声
            const harmony = freq * 1.5;
            const envelope = 0.3 + 0.2 * Math.sin(t * 0.5);
            
            const sample = Math.sin(2 * Math.PI * freq * t) * 0.15 +
                          Math.sin(2 * Math.PI * harmony * t) * 0.08;
            
            left[i] = sample * envelope;
            right[i] = sample * envelope * 0.9; // 轻微立体声分离
        }
    }

    /**
     * 生成游戏内音乐
     */
    generateGameMusic(left, right, sampleRate, duration) {
        const bpm = 100;
        const beatDuration = 60 / bpm;
        
        for (let i = 0; i < left.length; i++) {
            const t = i / sampleRate;
            const beat = t / beatDuration;
            
            // 基础节奏
            const bassFreq = 110; // A2
            const bassEnvelope = Math.max(0, Math.sin(beat * Math.PI) * 0.5);
            const bass = Math.sin(2 * Math.PI * bassFreq * t) * bassEnvelope * 0.2;
            
            // 旋律层
            const melodyNotes = [440, 554.37, 659.25, 440, 523.25, 659.25];
            const melodyIndex = Math.floor(beat / 2) % melodyNotes.length;
            const melodyFreq = melodyNotes[melodyIndex];
            const melodyEnvelope = (beat % 2 < 1.5) ? 0.1 : 0;
            const melody = Math.sin(2 * Math.PI * melodyFreq * t) * melodyEnvelope * 0.15;
            
            const sample = bass + melody;
            left[i] = sample;
            right[i] = sample;
        }
    }

    /**
     * 生成战斗音乐
     */
    generateBattleMusic(left, right, sampleRate, duration) {
        const bpm = 140;
        const beatDuration = 60 / bpm;
        
        for (let i = 0; i < left.length; i++) {
            const t = i / sampleRate;
            const beat = t / beatDuration;
            
            // 激烈的低音节奏
            const bassFreq = 80;
            const bassHit = Math.floor(beat) % 2 === 0;
            const bassEnvelope = bassHit ? Math.exp(-(beat % 1) * 8) : 0;
            const bass = Math.sin(2 * Math.PI * bassFreq * t) * bassEnvelope * 0.3;
            
            // 紧张的弦乐感觉
            const stringFreq = 220 + Math.sin(t * 2) * 20;
            const stringTone = Math.sin(2 * Math.PI * stringFreq * t) * 0.1;
            
            // 打击乐感
            const percussion = (beat % 1 < 0.1) ? (Math.random() - 0.5) * 0.2 : 0;
            
            const sample = bass + stringTone + percussion;
            left[i] = sample;
            right[i] = sample * 0.95;
        }
    }

    /**
     * 预加载所有音频资源
     */
    preloadAllSounds() {
        if (!this.isInitialized) {
            console.warn('[AudioSystem] 请先初始化音频系统');
            return;
        }
        
        const soundTypes = [
            'cardPlay', 'rageTrigger', 'levelUp',
            'victory', 'defeat', 'buttonClick', 'coinGet'
        ];
        
        const musicTypes = ['menu', 'game', 'battle'];
        
        // 预加载音效
        soundTypes.forEach(type => {
            if (!this.soundCache.has(type)) {
                const buffer = this.generateSoundEffect(type);
                this.soundCache.set(type, buffer);
                this.preloadedSounds.add(type);
            }
        });
        
        // 预加载音乐
        musicTypes.forEach(type => {
            const cacheKey = `music_${type}`;
            if (!this.soundCache.has(cacheKey)) {
                const buffer = this.generateBackgroundMusic(type);
                this.soundCache.set(cacheKey, buffer);
                this.preloadedSounds.add(cacheKey);
            }
        });
        
        console.log(`[AudioSystem] 已预加载 ${this.preloadedSounds.size} 个音频资源`);
    }

    /**
     * 播放音效
     * @param {string} soundType - 音效类型
     * @param {Object} options - 播放选项
     */
    playSound(soundType, options = {}) {
        if (!this.isInitialized || this.isMuted) return;
        
        this.resume().then(() => {
            let buffer = this.soundCache.get(soundType);
            if (!buffer) {
                buffer = this.generateSoundEffect(soundType);
                this.soundCache.set(soundType, buffer);
            }
            
            const source = this.audioContext.createBufferSource();
            source.buffer = buffer;
            
            // 创建单独的增益节点用于此音效
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = options.volume || 1.0;
            
            source.connect(gainNode);
            gainNode.connect(this.sfxGain);
            
            // 播放设置
            if (options.loop) {
                source.loop = true;
            }
            if (options.playbackRate) {
                source.playbackRate.value = options.playbackRate;
            }
            
            source.start(0);
            console.log(`[AudioSystem] 播放音效: ${soundType}`);
            
            return source;
        });
    }

    /**
     * 播放背景音乐
     * @param {string} musicType - 音乐类型: menu, game, battle
     * @param {boolean} fade - 是否淡入淡出
     */
    playMusic(musicType, fade = true) {
        if (!this.isInitialized) return;
        
        // 如果当前正在播放同类型音乐，不重复播放
        if (this.currentMusicType === musicType && this.currentMusicSource) {
            return;
        }
        
        this.resume().then(() => {
            // 停止当前音乐
            if (fade) {
                this.fadeOutMusic(() => this.startMusic(musicType));
            } else {
                this.stopMusic();
                this.startMusic(musicType);
            }
        });
    }

    /**
     * 开始播放指定音乐
     */
    startMusic(musicType) {
        const cacheKey = `music_${musicType}`;
        let buffer = this.soundCache.get(cacheKey);
        if (!buffer) {
            buffer = this.generateBackgroundMusic(musicType);
            this.soundCache.set(cacheKey, buffer);
        }
        
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.loop = this.musicLoops[musicType] || true;
        
        source.connect(this.musicGain);
        source.start(0);
        
        this.currentMusicSource = source;
        this.currentMusicType = musicType;
        this.currentMusic = buffer;
        
        // 淡入效果
        if (this.musicGain) {
            this.musicGain.gain.setValueAtTime(0, this.audioContext.currentTime);
            this.musicGain.gain.linearRampToValueAtTime(
                this.isMuted ? 0 : this.volume.music,
                this.audioContext.currentTime + 1
            );
        }
        
        console.log(`[AudioSystem] 开始播放背景音乐: ${musicType}`);
        
        // 音乐结束时清理（如果不是循环的）
        source.onended = () => {
            if (!source.loop) {
                this.currentMusicSource = null;
                this.currentMusicType = null;
            }
        };
    }

    /**
     * 停止背景音乐
     */
    stopMusic() {
        if (this.currentMusicSource) {
            try {
                this.currentMusicSource.stop();
            } catch (e) {
                // 可能已经停止了
            }
            this.currentMusicSource = null;
            this.currentMusicType = null;
        }
    }

    /**
     * 音乐淡出效果
     */
    fadeOutMusic(callback, duration = 1.0) {
        if (!this.currentMusicSource || !this.musicGain) {
            if (callback) callback();
            return;
        }
        
        const currentVolume = this.musicGain.gain.value;
        this.musicGain.gain.setValueAtTime(currentVolume, this.audioContext.currentTime);
        this.musicGain.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
        
        setTimeout(() => {
            this.stopMusic();
            if (callback) callback();
        }, duration * 1000);
    }

    /**
     * 设置主音量
     */
    setMasterVolume(value) {
        this.volume.master = Math.max(0, Math.min(1, value));
        if (this.masterGain) {
            this.masterGain.gain.value = this.isMuted ? 0 : this.volume.master;
        }
        console.log(`[AudioSystem] 主音量设置为: ${this.volume.master}`);
    }

    /**
     * 设置音乐音量
     */
    setMusicVolume(value) {
        this.volume.music = Math.max(0, Math.min(1, value));
        if (this.musicGain) {
            this.musicGain.gain.value = this.isMuted ? 0 : this.volume.music;
        }
        console.log(`[AudioSystem] 音乐音量设置为: ${this.volume.music}`);
    }

    /**
     * 设置音效音量
     */
    setSfxVolume(value) {
        this.volume.sfx = Math.max(0, Math.min(1, value));
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.isMuted ? 0 : this.volume.sfx;
        }
        console.log(`[AudioSystem] 音效音量设置为: ${this.volume.sfx}`);
    }

    /**
     * 设置静音状态
     */
    setMute(muted) {
        this.isMuted = muted;
        
        if (this.masterGain) {
            this.masterGain.gain.value = muted ? 0 : this.volume.master;
        }
        
        console.log(`[AudioSystem] ${muted ? '已静音' : '已取消静音'}`);
    }

    /**
     * 切换静音状态
     */
    toggleMute() {
        this.setMute(!this.isMuted);
        return this.isMuted;
    }

    /**
     * 获取当前音量设置
     */
    getVolumeSettings() {
        return {
            master: this.volume.master,
            music: this.volume.music,
            sfx: this.volume.sfx,
            isMuted: this.isMuted
        };
    }

    /**
     * 暂停背景音乐
     */
    pauseMusic() {
        if (this.currentMusicSource) {
            this.currentMusicSource.stop();
            this.wasMuted = this.isMuted;
        }
    }

    /**
     * 恢复背景音乐
     */
    resumeMusic() {
        if (this.currentMusicType && !this.wasMuted) {
            this.startMusic(this.currentMusicType);
        }
    }

    /**
     * 销毁音频系统
     */
    destroy() {
        this.stopMusic();
        
        if (this.audioContext) {
            this.audioContext.close();
        }
        
        this.soundCache.clear();
        this.preloadedSounds.clear();
        this.isInitialized = false;
        
        console.log('[AudioSystem] 音频系统已销毁');
    }
}

// ==================== 便捷播放函数 ====================

/**
 * 创建全局音频系统实例
 */
const towerAudio = new TowerAudioSystem();

/**
 * 便捷音效播放函数
 */
const AudioSFX = {
    playCard: () => towerAudio.playSound('cardPlay'),
    playRage: () => towerAudio.playSound('rageTrigger'),
    playLevelUp: () => towerAudio.playSound('levelUp'),
    playVictory: () => towerAudio.playSound('victory'),
    playDefeat: () => towerAudio.playSound('defeat'),
    playClick: () => towerAudio.playSound('buttonClick'),
    playCoin: () => towerAudio.playSound('coinGet')
};

/**
 * 背景音乐控制
 */
const AudioMusic = {
    playMenu: (fade = true) => towerAudio.playMusic('menu', fade),
    playGame: (fade = true) => towerAudio.playMusic('game', fade),
    playBattle: (fade = true) => towerAudio.playMusic('battle', fade),
    stop: () => towerAudio.stopMusic(),
    pause: () => towerAudio.pauseMusic(),
    resume: () => towerAudio.resumeMusic()
};

/**
 * 音量控制
 */
const AudioVolume = {
    setMaster: (v) => towerAudio.setMasterVolume(v),
    setMusic: (v) => towerAudio.setMusicVolume(v),
    setSfx: (v) => towerAudio.setSfxVolume(v),
    mute: () => towerAudio.setMute(true),
    unmute: () => towerAudio.setMute(false),
    toggle: () => towerAudio.toggleMute(),
    get: () => towerAudio.getVolumeSettings()
};

// ==================== 导出模块 ====================

// ES6 模块导出
export { TowerAudioSystem, towerAudio, AudioSFX, AudioMusic, AudioVolume };

// 浏览器全局变量（非模块环境）
if (typeof window !== 'undefined') {
    window.TowerAudioSystem = TowerAudioSystem;
    window.towerAudio = towerAudio;
    window.AudioSFX = AudioSFX;
    window.AudioMusic = AudioMusic;
    window.AudioVolume = AudioVolume;
}

// ==================== 使用示例 ====================

/*
// 1. 初始化（需要在用户交互后调用）
document.addEventListener('click', () => {
    towerAudio.init();
    towerAudio.preloadAllSounds();
}, { once: true });

// 2. 播放背景音乐
AudioMusic.playMenu();  // 主菜单音乐
AudioMusic.playGame();  // 游戏内音乐
AudioMusic.playBattle(); // 战斗音乐

// 3. 播放音效
AudioSFX.playClick();    // 按钮点击
AudioSFX.playCard();     // 出牌
AudioSFX.playRage();     // 激怒触发
AudioSFX.playLevelUp();  // 层数晋升
AudioSFX.playVictory();  // 胜利
AudioSFX.playDefeat();   // 失败
AudioSFX.playCoin();     // 获得金币

// 4. 音量控制
AudioVolume.setMaster(0.8);  // 主音量 80%
AudioVolume.setMusic(0.6);   // 音乐音量 60%
AudioVolume.setSfx(1.0);     // 音效音量 100%
AudioVolume.toggle();        // 切换静音

// 5. 获取当前设置
const settings = AudioVolume.get();
console.log(settings);
*/

console.log('[AudioSystem] 命运塔音效系统已加载，版本 1.0.0');
