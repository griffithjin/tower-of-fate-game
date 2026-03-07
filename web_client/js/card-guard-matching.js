/**
 * 命运塔 - 卡牌与守卫匹配系统
 * Card Guard Matching System - Allegro最强模式
 * 
 * 支持7套不同主题的卡牌：classic, cartoon, animals, fruits, space, emoji, fairy
 */

class CardGuardMatchingSystem {
    constructor() {
        this.deckTypes = ['classic', 'cartoon', 'animals', 'fruits', 'space', 'emoji', 'fairy'];
        this.currentDeck = 'classic';
        
        // 7套卡牌的配置
        this.deckConfigs = {
            classic: {
                name: '经典扑克',
                nameEn: 'Classic Poker',
                suits: ['hearts', 'diamonds', 'clubs', 'spades'],
                suitSymbols: { hearts: '❤️', diamonds: '♦️', clubs: '♣️', spades: '♠️' },
                suitColors: { hearts: '#e74c3c', diamonds: '#e74c3c', clubs: '#2c3e50', spades: '#2c3e50' },
                ranks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
                rankValues: { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 }
            },
            cartoon: {
                name: '卡通世界',
                nameEn: 'Cartoon World',
                suits: ['cute', 'cool', 'happy', 'silly'],
                suitSymbols: { cute: '🥰', cool: '😎', happy: '🤗', silly: '🤪' },
                suitColors: { cute: '#ff6b9d', cool: '#4ecdc4', happy: '#ffe66d', silly: '#a8e6cf' },
                ranks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
                rankValues: { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 }
            },
            animals: {
                name: '动物王国',
                nameEn: 'Animal Kingdom',
                suits: ['land', 'sea', 'sky', 'forest'],
                suitSymbols: { land: '🦁', sea: '🐋', sky: '🦅', forest: '🐼' },
                suitColors: { land: '#d4a373', sea: '#48cae4', sky: '#90e0ef', forest: '#76c893' },
                ranks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
                rankValues: { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 }
            },
            fruits: {
                name: '水果乐园',
                nameEn: 'Fruit Paradise',
                suits: ['berries', 'citrus', 'tropical', 'stone'],
                suitSymbols: { berries: '🍓', citrus: '🍊', tropical: '🍍', stone: '🍑' },
                suitColors: { berries: '#ff6b6b', citrus: '#ffa502', tropical: '#ffeaa7', stone: '#fab1a0' },
                ranks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
                rankValues: { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 }
            },
            space: {
                name: '星际探险',
                nameEn: 'Space Adventure',
                suits: ['rockets', 'stars', 'planets', 'moons'],
                suitSymbols: { rockets: '🚀', stars: '⭐', planets: '🪐', moons: '🌙' },
                suitColors: { rockets: '#ff6b6b', stars: '#ffd93d', planets: '#6bcf7f', moons: '#a8d8ea' },
                ranks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
                rankValues: { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 }
            },
            emoji: {
                name: '表情派对',
                nameEn: 'Emoji Party',
                suits: ['love', 'cool', 'laugh', 'party'],
                suitSymbols: { love: '😍', cool: '😎', laugh: '😂', party: '🥳' },
                suitColors: { love: '#ff6b9d', cool: '#4ecdc4', laugh: '#ffe66d', party: '#ff8b94' },
                ranks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
                rankValues: { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 }
            },
            fairy: {
                name: '童话仙境',
                nameEn: 'Fairy Wonderland',
                suits: ['fairies', 'unicorns', 'wizards', 'dragons'],
                suitSymbols: { fairies: '🧚‍♀️', unicorns: '🦄', wizards: '🧙‍♂️', dragons: '🐉' },
                suitColors: { fairies: '#ff9ff3', unicorns: '#f368e0', wizards: '#9b59b6', dragons: '#e74c3c' },
                ranks: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'],
                rankValues: { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 }
            }
        };
        
        // 动物家族映射（用于animals牌的特效）
        this.animalFamilies = {
            'lion': ['land'], 'tiger': ['land'], 'elephant': ['land'], 'giraffe': ['land'],
            'whale': ['sea'], 'dolphin': ['sea'], 'shark': ['sea'], 'octopus': ['sea'],
            'eagle': ['sky'], 'owl': ['sky'], 'parrot': ['sky'], 'hummingbird': ['sky'],
            'panda': ['forest'], 'monkey': ['forest'], 'deer': ['forest'], 'bear': ['forest']
        };
    }
    
    /**
     * 设置当前使用的牌组
     */
    setCurrentDeck(deckType) {
        if (this.deckTypes.includes(deckType)) {
            this.currentDeck = deckType;
            return true;
        }
        console.warn(`[CardGuardMatching] 无效的牌组类型: ${deckType}`);
        return false;
    }
    
    /**
     * 获取当前牌组配置
     */
    getCurrentDeckConfig() {
        return this.deckConfigs[this.currentDeck];
    }
    
    /**
     * 卡牌与守卫匹配判定
     * @param {Object} playerCard - 玩家出的牌 {suit, rank}
     * @param {Object} guardCard - 守卫的牌 {suit, rank}
     * @param {string} deckType - 牌组类型
     * @returns {Object} 匹配结果
     */
    checkMatch(playerCard, guardCard, deckType = null) {
        const deck = deckType || this.currentDeck;
        const config = this.deckConfigs[deck];
        
        // 基础匹配规则：花色相同 或 点数相同
        const isSuitMatch = playerCard.suit === guardCard.suit;
        const isRankMatch = playerCard.rank === guardCard.rank;
        const isMatch = isSuitMatch || isRankMatch;
        
        // 计算层数变化
        const layerResult = this.calculateLayers(playerCard, guardCard, isMatch, config);
        
        // 获取特殊效果
        const specialEffects = this.getSpecialEffects(deck, playerCard, guardCard, isMatch);
        
        // 获取匹配动画
        const animation = this.getMatchAnimation(deck, isMatch, isSuitMatch, isRankMatch);
        
        return {
            matched: isMatch,
            matchType: isSuitMatch ? 'suit' : (isRankMatch ? 'rank' : null),
            layers: layerResult,
            specialEffects: specialEffects,
            animation: animation,
            deck: deck,
            timestamp: Date.now()
        };
    }
    
    /**
     * 计算层数变化
     */
    calculateLayers(playerCard, guardCard, isMatch, config) {
        if (!isMatch) {
            return {
                change: 0,
                direction: 'none',
                reason: 'no_match',
                totalBonus: 0
            };
        }
        
        const playerValue = config.rankValues[playerCard.rank] || 0;
        const guardValue = config.rankValues[guardCard.rank] || 0;
        
        // 基础层数 = 玩家牌点数 - 守卫牌点数
        let baseLayers = Math.max(1, playerValue - guardValue);
        let bonus = 0;
        
        // 如果点数相同，获得额外奖励
        if (playerCard.rank === guardCard.rank) {
            bonus += 2;
        }
        
        // A牌特殊规则
        if (playerCard.rank === 'A') {
            bonus += 1;
        }
        
        const totalLayers = baseLayers + bonus;
        
        return {
            change: totalLayers,
            direction: 'up',
            reason: 'match_success',
            baseLayers: baseLayers,
            bonus: bonus,
            totalBonus: totalLayers
        };
    }
    
    /**
     * 特殊效果判定
     */
    getSpecialEffects(deckType, playerCard, guardCard, isMatch) {
        const effects = [];
        
        if (!isMatch) return effects;
        
        switch(deckType) {
            case 'animals':
                // 动物牌：相同动物家族有加成
                if (this.isSameAnimalFamily(playerCard, guardCard)) {
                    effects.push({
                        type: 'animal_bonus',
                        name: '动物亲和',
                        nameEn: 'Animal Affinity',
                        description: '同族动物产生共鸣！',
                        bonus: 1,
                        sound: 'sounds/animal-bonus.mp3',
                        animation: 'animal-glow',
                        icon: '🐾'
                    });
                }
                // 狮子王特效
                if (playerCard.rank === 'K' && playerCard.suit === 'land') {
                    effects.push({
                        type: 'king_of_jungle',
                        name: '丛林之王',
                        nameEn: 'King of Jungle',
                        description: '狮子王的威严！',
                        bonus: 2,
                        sound: 'sounds/lion-roar.mp3',
                        animation: 'lion-roar',
                        icon: '🦁'
                    });
                }
                break;
                
            case 'space':
                // 星空牌：火箭vs星球有特殊效果
                if (playerCard.suit === 'rockets' && guardCard.suit === 'planets') {
                    effects.push({
                        type: 'space_bonus',
                        name: '星际穿越',
                        nameEn: 'Interstellar Journey',
                        description: '火箭穿越星球！',
                        bonus: 2,
                        sound: 'sounds/warp-drive.mp3',
                        animation: 'warp-speed',
                        icon: '🌌'
                    });
                }
                // 星星连线
                if (playerCard.suit === 'stars' && guardCard.suit === 'stars') {
                    effects.push({
                        type: 'star_alignment',
                        name: '星辰连线',
                        nameEn: 'Star Alignment',
                        description: '星星连成一线！',
                        bonus: 1,
                        sound: 'sounds/star-twinkle.mp3',
                        animation: 'star-line',
                        icon: '✨'
                    });
                }
                break;
                
            case 'fairy':
                // 童话牌：仙女+王牌 = 护盾
                if (playerCard.suit === 'fairies' && playerCard.rank === 'A') {
                    effects.push({
                        type: 'magic_bonus',
                        name: '仙女祝福',
                        nameEn: 'Fairy Blessing',
                        description: '获得仙女护盾！',
                        effect: 'shield',
                        shieldValue: 1,
                        sound: 'sounds/magic-chime.mp3',
                        animation: 'fairy-sparkle',
                        icon: '🛡️'
                    });
                }
                // 龙族觉醒
                if (playerCard.suit === 'dragons' && playerCard.rank === 'K') {
                    effects.push({
                        type: 'dragon_awaken',
                        name: '巨龙觉醒',
                        nameEn: 'Dragon Awakening',
                        description: '巨龙喷吐烈焰！',
                        bonus: 3,
                        sound: 'sounds/dragon-roar.mp3',
                        animation: 'dragon-fire',
                        icon: '🔥'
                    });
                }
                // 独角兽奇迹
                if (playerCard.suit === 'unicorns' && playerCard.rank === 'Q') {
                    effects.push({
                        type: 'unicorn_magic',
                        name: '独角兽奇迹',
                        nameEn: 'Unicorn Miracle',
                        description: '彩虹魔法闪耀！',
                        bonus: 2,
                        heal: 1,
                        sound: 'sounds/unicorn-magic.mp3',
                        animation: 'rainbow-burst',
                        icon: '🌈'
                    });
                }
                break;
                
            case 'emoji':
                // 表情牌：爱心表情有治愈效果
                if (playerCard.suit === 'love') {
                    effects.push({
                        type: 'love_bonus',
                        name: '爱意满满',
                        nameEn: 'Full of Love',
                        description: '爱心治愈！',
                        heal: 1,
                        bonus: 1,
                        sound: 'sounds/love-pop.mp3',
                        animation: 'heart-burst',
                        icon: '💕'
                    });
                }
                // 大笑表情：获得额外移动
                if (playerCard.suit === 'laugh' && playerCard.rank === 'A') {
                    effects.push({
                        type: 'joy_burst',
                        name: '欢乐爆发',
                        nameEn: 'Joy Burst',
                        description: '笑到飞起！',
                        bonus: 2,
                        sound: 'sounds/laugh-joy.mp3',
                        animation: 'laugh-bounce',
                        icon: '🤣'
                    });
                }
                break;
                
            case 'fruits':
                // 水果牌：热带水果组合
                if (playerCard.suit === 'tropical' && guardCard.suit === 'tropical') {
                    effects.push({
                        type: 'tropical_combo',
                        name: '热带风情',
                        nameEn: 'Tropical Combo',
                        description: '热带水果大餐！',
                        bonus: 1,
                        heal: 1,
                        sound: 'sounds/tropical-swing.mp3',
                        animation: 'fruit-fall',
                        icon: '🏝️'
                    });
                }
                // 浆果爆发
                if (playerCard.suit === 'berries' && playerCard.rank === 'A') {
                    effects.push({
                        type: 'berry_burst',
                        name: '浆果爆发',
                        nameEn: 'Berry Burst',
                        description: '浆果力量爆发！',
                        bonus: 2,
                        sound: 'sounds/berry-pop.mp3',
                        animation: 'berry-splash',
                        icon: '🍓'
                    });
                }
                break;
                
            case 'cartoon':
                // 卡通牌：可爱+搞笑组合
                if (playerCard.suit === 'cute' && guardCard.suit === 'silly') {
                    effects.push({
                        type: 'cartoon_combo',
                        name: '萌蠢组合',
                        nameEn: 'Cute & Silly',
                        description: '萌蠢无敌！',
                        bonus: 2,
                        sound: 'sounds/cartoon-boing.mp3',
                        animation: 'bounce-boing',
                        icon: '🎭'
                    });
                }
                // 开心加倍
                if (playerCard.suit === 'happy' && playerCard.rank === 'J') {
                    effects.push({
                        type: 'happy_jump',
                        name: '开心跳跃',
                        nameEn: 'Happy Jump',
                        description: '开心到跳起来！',
                        bonus: 1,
                        sound: 'sounds/happy-jump.mp3',
                        animation: 'jump-bounce',
                        icon: '🦘'
                    });
                }
                break;
        }
        
        return effects;
    }
    
    /**
     * 检查是否同动物家族
     */
    isSameAnimalFamily(playerCard, guardCard) {
        return playerCard.suit === guardCard.suit;
    }
    
    /**
     * 获取匹配动画
     */
    getMatchAnimation(deckType, isMatch, isSuitMatch, isRankMatch) {
        const animations = {
            classic: {
                match: { type: 'flip', duration: 500, easing: 'ease-out' },
                noMatch: { type: 'shake', duration: 300, easing: 'ease-in-out' }
            },
            cartoon: {
                match: { type: 'bounce', duration: 600, easing: 'elastic' },
                noMatch: { type: 'wobble', duration: 400, easing: 'ease-in-out' }
            },
            animals: {
                match: { type: 'pounce', duration: 500, easing: 'spring' },
                noMatch: { type: 'retreat', duration: 400, easing: 'ease-out' }
            },
            fruits: {
                match: { type: 'squeeze', duration: 400, easing: 'bounce' },
                noMatch: { type: 'drop', duration: 350, easing: 'gravity' }
            },
            space: {
                match: { type: 'warp', duration: 800, easing: 'linear' },
                noMatch: { type: 'float', duration: 500, easing: 'zero-gravity' }
            },
            emoji: {
                match: { type: 'pop', duration: 300, easing: 'bounce' },
                noMatch: { type: 'fade', duration: 400, easing: 'ease-out' }
            },
            fairy: {
                match: { type: 'sparkle', duration: 700, easing: 'magic' },
                noMatch: { type: 'poof', duration: 350, easing: 'dissolve' }
            }
        };
        
        const deckAnims = animations[deckType] || animations.classic;
        
        if (!isMatch) {
            return deckAnims.noMatch;
        }
        
        return {
            ...deckAnims.match,
            matchType: isSuitMatch ? 'suit' : 'rank'
        };
    }
    
    /**
     * 随机触发特殊音效
     */
    triggerRandomSound(deckType, action) {
        const soundPool = {
            animals: ['meow.mp3', 'woof.mp3', 'roar.mp3', 'chirp.mp3', 'elephant.mp3'],
            cartoon: ['boing.mp3', 'squeak.mp3', 'honk.mp3', 'pop.mp3', 'slide.mp3'],
            space: ['laser.mp3', 'warp.mp3', 'alien.mp3', 'robot.mp3', 'cosmic.mp3'],
            fairy: ['magic.mp3', 'sparkle.mp3', 'wand.mp3', 'fairy-laugh.mp3', 'spell.mp3'],
            emoji: ['laugh.mp3', 'heart.mp3', 'cool.mp3', 'surprise.mp3', 'party.mp3'],
            fruits: ['crunch.mp3', 'juice.mp3', 'peel.mp3', 'slice.mp3', 'splash.mp3'],
            classic: ['shuffle.mp3', 'deal.mp3', 'flip.mp3', 'win.mp3', 'tension.mp3']
        };
        
        const sounds = soundPool[deckType] || soundPool.classic;
        const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
        
        // 20%概率触发
        if (Math.random() < 0.2) {
            this.playSound(`sounds/special/${randomSound}`);
            return {
                triggered: true,
                sound: randomSound,
                deck: deckType
            };
        }
        
        return { triggered: false };
    }
    
    /**
     * 播放音效
     */
    playSound(soundPath) {
        if (window.AudioSystem) {
            window.AudioSystem.playSFX(soundPath);
        } else {
            console.log(`[CardGuardMatching] Playing sound: ${soundPath}`);
        }
    }
    
    /**
     * 生成一副完整的牌
     */
    generateDeck(deckType = null) {
        const deck = deckType || this.currentDeck;
        const config = this.deckConfigs[deck];
        const cards = [];
        
        for (const suit of config.suits) {
            for (const rank of config.ranks) {
                cards.push({
                    suit: suit,
                    rank: rank,
                    value: config.rankValues[rank],
                    symbol: config.suitSymbols[suit],
                    color: config.suitColors[suit],
                    deck: deck,
                    id: `${deck}_${suit}_${rank}`
                });
            }
        }
        
        return cards;
    }
    
    /**
     * 洗牌
     */
    shuffleDeck(cards) {
        const shuffled = [...cards];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    /**
     * 获取所有可用牌组信息
     */
    getAvailableDecks() {
        return this.deckTypes.map(type => ({
            id: type,
            ...this.deckConfigs[type],
            isUnlocked: true
        }));
    }
    
    /**
     * 获取牌组统计信息
     */
    getDeckStats(deckType = null) {
        const deck = deckType || this.currentDeck;
        const config = this.deckConfigs[deck];
        
        return {
            deck: deck,
            name: config.name,
            totalCards: config.suits.length * config.ranks.length,
            suits: config.suits.length,
            ranks: config.ranks.length,
            specialEffects: this.countSpecialEffects(deck)
        };
    }
    
    /**
     * 计算牌组特殊效果数量
     */
    countSpecialEffects(deckType) {
        const effectCounts = {
            classic: 0,
            cartoon: 2,
            animals: 2,
            fruits: 2,
            space: 2,
            emoji: 2,
            fairy: 3
        };
        return effectCounts[deckType] || 0;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CardGuardMatchingSystem;
}

// 浏览器环境
if (typeof window !== 'undefined') {
    window.CardGuardMatchingSystem = CardGuardMatchingSystem;
}
