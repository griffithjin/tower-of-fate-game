/**
 * 命运塔 - 游戏音效系统
 * Tower of Fate - Game Sound Effects System
 * 
 * 包含所有游戏音效配置：玩家移动、卡牌操作、比对结果等
 * Contains all game sound effects configuration
 */

const GAME_SOUNDS = {
    // ==================== 玩家移动音效 Player Movement ====================
    playerRise: {
        path: 'sounds/rise-success.mp3',
        description: '玩家晋级上升',
        descriptionEn: 'Player rises to higher level',
        category: 'movement',
        volume: 0.8,
        loop: false,
        duration: 1.5
    },
    playerFall: {
        path: 'sounds/fall-warning.mp3',
        description: '玩家下降警告',
        descriptionEn: 'Player falls down warning',
        category: 'movement',
        volume: 0.9,
        loop: false,
        duration: 2.0
    },
    playerJump: {
        path: 'sounds/jump-whoosh.mp3',
        description: '玩家跳跃',
        descriptionEn: 'Player jump',
        category: 'movement',
        volume: 0.7,
        loop: false,
        duration: 0.8
    },
    playerLand: {
        path: 'sounds/land-thud.mp3',
        description: '玩家落地',
        descriptionEn: 'Player landing',
        category: 'movement',
        volume: 0.6,
        loop: false,
        duration: 0.5
    },

    // ==================== 激怒牌音效 Provoke Card ====================
    provokeTrigger: {
        path: 'sounds/provoke-laser.mp3',
        description: '激怒牌触发 - 激光音效',
        descriptionEn: 'Provoke card triggers - laser effect',
        category: 'provoke',
        volume: 1.0,
        loop: false,
        duration: 2.5
    },
    provokeCharge: {
        path: 'sounds/provoke-charge.mp3',
        description: '激怒牌充能',
        descriptionEn: 'Provoke card charging',
        category: 'provoke',
        volume: 0.9,
        loop: false,
        duration: 1.8
    },
    provokeImpact: {
        path: 'sounds/provoke-impact.mp3',
        description: '激怒牌冲击',
        descriptionEn: 'Provoke card impact',
        category: 'provoke',
        volume: 1.0,
        loop: false,
        duration: 1.2
    },

    // ==================== 比对结果音效 Match Results ====================
    matchSuccess: {
        path: 'sounds/match-ding.mp3',
        description: '比对成功 - 清脆叮声',
        descriptionEn: 'Match success - crisp ding',
        category: 'match',
        volume: 0.8,
        loop: false,
        duration: 1.0
    },
    matchFail: {
        path: 'sounds/match-buzz.mp3',
        description: '比对失败 - 错误嗡声',
        descriptionEn: 'Match fail - error buzz',
        category: 'match',
        volume: 0.7,
        loop: false,
        duration: 1.2
    },
    matchPerfect: {
        path: 'sounds/match-perfect.mp3',
        description: '完美匹配',
        descriptionEn: 'Perfect match',
        category: 'match',
        volume: 0.9,
        loop: false,
        duration: 2.0
    },

    // ==================== 晋级音效 Promotion ====================
    promote: {
        path: 'sounds/promote-fanfare.mp3',
        description: '晋级成功 - 号角齐鸣',
        descriptionEn: 'Promotion success - fanfare',
        category: 'promotion',
        volume: 1.0,
        loop: false,
        duration: 3.0
    },
    promoteMinor: {
        path: 'sounds/promote-minor.mp3',
        description: '小幅晋级',
        descriptionEn: 'Minor promotion',
        category: 'promotion',
        volume: 0.8,
        loop: false,
        duration: 1.5
    },
    promoteMajor: {
        path: 'sounds/promote-major.mp3',
        description: '大幅晋级',
        descriptionEn: 'Major promotion',
        category: 'promotion',
        volume: 1.0,
        loop: false,
        duration: 2.5
    },

    // ==================== 卡牌音效 Cards ====================
    cardScroll: {
        path: 'sounds/card-scroll.mp3',
        description: '卡牌滚动',
        descriptionEn: 'Card scrolling',
        category: 'card',
        volume: 0.5,
        loop: false,
        duration: 0.6
    },
    cardSelect: {
        path: 'sounds/card-select.mp3',
        description: '选择卡牌',
        descriptionEn: 'Card selected',
        category: 'card',
        volume: 0.6,
        loop: false,
        duration: 0.4
    },
    cardPlay: {
        path: 'sounds/card-play.mp3',
        description: '打出卡牌',
        descriptionEn: 'Card played',
        category: 'card',
        volume: 0.7,
        loop: false,
        duration: 0.8
    },
    cardFlip: {
        path: 'sounds/card-flip.mp3',
        description: '翻牌',
        descriptionEn: 'Card flip',
        category: 'card',
        volume: 0.5,
        loop: false,
        duration: 0.5
    },
    cardShuffle: {
        path: 'sounds/card-shuffle.mp3',
        description: '洗牌',
        descriptionEn: 'Cards shuffle',
        category: 'card',
        volume: 0.6,
        loop: false,
        duration: 1.5
    },
    cardDraw: {
        path: 'sounds/card-draw.mp3',
        description: '抽牌',
        descriptionEn: 'Draw card',
        category: 'card',
        volume: 0.5,
        loop: false,
        duration: 0.6
    },

    // ==================== UI/界面音效 UI ====================
    uiClick: {
        path: 'sounds/ui-click.mp3',
        description: '界面点击',
        descriptionEn: 'UI click',
        category: 'ui',
        volume: 0.4,
        loop: false,
        duration: 0.2
    },
    uiHover: {
        path: 'sounds/ui-hover.mp3',
        description: '悬停效果',
        descriptionEn: 'UI hover',
        category: 'ui',
        volume: 0.3,
        loop: false,
        duration: 0.3
    },
    uiOpen: {
        path: 'sounds/ui-open.mp3',
        description: '打开面板',
        descriptionEn: 'Panel open',
        category: 'ui',
        volume: 0.5,
        loop: false,
        duration: 0.5
    },
    uiClose: {
        path: 'sounds/ui-close.mp3',
        description: '关闭面板',
        descriptionEn: 'Panel close',
        category: 'ui',
        volume: 0.5,
        loop: false,
        duration: 0.4
    },
    uiBack: {
        path: 'sounds/ui-back.mp3',
        description: '返回',
        descriptionEn: 'Back button',
        category: 'ui',
        volume: 0.4,
        loop: false,
        duration: 0.3
    },

    // ==================== 游戏状态音效 Game State ====================
    gameStart: {
        path: 'sounds/game-start.mp3',
        description: '游戏开始',
        descriptionEn: 'Game start',
        category: 'state',
        volume: 0.9,
        loop: false,
        duration: 2.0
    },
    gameWin: {
        path: 'sounds/game-win.mp3',
        description: '游戏胜利',
        descriptionEn: 'Game victory',
        category: 'state',
        volume: 1.0,
        loop: false,
        duration: 4.0
    },
    gameLose: {
        path: 'sounds/game-lose.mp3',
        description: '游戏失败',
        descriptionEn: 'Game defeat',
        category: 'state',
        volume: 0.9,
        loop: false,
        duration: 3.0
    },
    roundStart: {
        path: 'sounds/round-start.mp3',
        description: '回合开始',
        descriptionEn: 'Round start',
        category: 'state',
        volume: 0.7,
        loop: false,
        duration: 1.5
    },
    roundEnd: {
        path: 'sounds/round-end.mp3',
        description: '回合结束',
        descriptionEn: 'Round end',
        category: 'state',
        volume: 0.7,
        loop: false,
        duration: 1.2
    },
    countdown: {
        path: 'sounds/countdown-tick.mp3',
        description: '倒计时滴答',
        descriptionEn: 'Countdown tick',
        category: 'state',
        volume: 0.8,
        loop: false,
        duration: 0.5
    },
    countdownFinal: {
        path: 'sounds/countdown-final.mp3',
        description: '倒计时结束',
        descriptionEn: 'Countdown final',
        category: 'state',
        volume: 1.0,
        loop: false,
        duration: 1.0
    },

    // ==================== 锦标赛音效 Tournament ====================
    tournamentStart: {
        path: 'sounds/tournament-start.mp3',
        description: '锦标赛开始',
        descriptionEn: 'Tournament start',
        category: 'tournament',
        volume: 1.0,
        loop: false,
        duration: 3.5
    },
    tournamentWin: {
        path: 'sounds/tournament-win.mp3',
        description: '锦标赛胜利',
        descriptionEn: 'Tournament victory',
        category: 'tournament',
        volume: 1.0,
        loop: false,
        duration: 5.0
    },
    championCrown: {
        path: 'sounds/champion-crown.mp3',
        description: '冠军加冕',
        descriptionEn: 'Champion crowned',
        category: 'tournament',
        volume: 1.0,
        loop: false,
        duration: 4.0
    },

    // ==================== 特殊音效 Special ====================
    powerUp: {
        path: 'sounds/power-up.mp3',
        description: '能力增强',
        descriptionEn: 'Power up',
        category: 'special',
        volume: 0.9,
        loop: false,
        duration: 1.5
    },
    shieldBlock: {
        path: 'sounds/shield-block.mp3',
        description: '护盾格挡',
        descriptionEn: 'Shield block',
        category: 'special',
        volume: 0.8,
        loop: false,
        duration: 1.0
    },
    combo: {
        path: 'sounds/combo.mp3',
        description: '连击',
        descriptionEn: 'Combo',
        category: 'special',
        volume: 0.9,
        loop: false,
        duration: 1.2
    },
    criticalHit: {
        path: 'sounds/critical-hit.mp3',
        description: '暴击',
        descriptionEn: 'Critical hit',
        category: 'special',
        volume: 1.0,
        loop: false,
        duration: 1.5
    },
    levelUp: {
        path: 'sounds/level-up.mp3',
        description: '等级提升',
        descriptionEn: 'Level up',
        category: 'special',
        volume: 0.9,
        loop: false,
        duration: 2.0
    },

    // ==================== 环境音效 Ambient ====================
    ambientLobby: {
        path: 'sounds/ambient-lobby.mp3',
        description: '大厅环境音',
        descriptionEn: 'Lobby ambient',
        category: 'ambient',
        volume: 0.3,
        loop: true,
        duration: 60.0
    },
    ambientGame: {
        path: 'sounds/ambient-game.mp3',
        description: '游戏环境音',
        descriptionEn: 'Game ambient',
        category: 'ambient',
        volume: 0.4,
        loop: true,
        duration: 60.0
    },
    ambientTournament: {
        path: 'sounds/ambient-tournament.mp3',
        description: '锦标赛环境音',
        descriptionEn: 'Tournament ambient',
        category: 'ambient',
        volume: 0.5,
        loop: true,
        duration: 60.0
    }
};

// 音效分类
const SOUND_CATEGORIES = {
    movement: {
        name: '移动',
        nameEn: 'Movement',
        sounds: ['playerRise', 'playerFall', 'playerJump', 'playerLand']
    },
    provoke: {
        name: '激怒牌',
        nameEn: 'Provoke',
        sounds: ['provokeTrigger', 'provokeCharge', 'provokeImpact']
    },
    match: {
        name: '比对',
        nameEn: 'Match',
        sounds: ['matchSuccess', 'matchFail', 'matchPerfect']
    },
    promotion: {
        name: '晋级',
        nameEn: 'Promotion',
        sounds: ['promote', 'promoteMinor', 'promoteMajor']
    },
    card: {
        name: '卡牌',
        nameEn: 'Cards',
        sounds: ['cardScroll', 'cardSelect', 'cardPlay', 'cardFlip', 'cardShuffle', 'cardDraw']
    },
    ui: {
        name: '界面',
        nameEn: 'UI',
        sounds: ['uiClick', 'uiHover', 'uiOpen', 'uiClose', 'uiBack']
    },
    state: {
        name: '游戏状态',
        nameEn: 'Game State',
        sounds: ['gameStart', 'gameWin', 'gameLose', 'roundStart', 'roundEnd', 'countdown', 'countdownFinal']
    },
    tournament: {
        name: '锦标赛',
        nameEn: 'Tournament',
        sounds: ['tournamentStart', 'tournamentWin', 'championCrown']
    },
    special: {
        name: '特殊',
        nameEn: 'Special',
        sounds: ['powerUp', 'shieldBlock', 'combo', 'criticalHit', 'levelUp']
    },
    ambient: {
        name: '环境',
        nameEn: 'Ambient',
        sounds: ['ambientLobby', 'ambientGame', 'ambientTournament']
    }
};

// 默认音效设置
const DEFAULT_SOUND_SETTINGS = {
    masterVolume: 1.0,
    musicVolume: 0.7,
    sfxVolume: 0.8,
    ambientVolume: 0.4,
    muted: false
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        GAME_SOUNDS,
        SOUND_CATEGORIES,
        DEFAULT_SOUND_SETTINGS
    };
}
