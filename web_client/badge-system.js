/**
 * 命运塔 - 成就徽章系统与收集系统
 * Fate Tower - Badge & Collection System
 * 
 * @author 小金蛇 🐍
 * @version 1.0.0
 */

// ============================================
// 常量定义
// ============================================

const BADGE_RARITY = {
    NOVICE: { id: 'novice', name: '新手', color: '#90EE90', bgColor: '#2d5016', star: 1 },
    ADVANCED: { id: 'advanced', name: '进阶', color: '#87CEEB', bgColor: '#1a3a52', star: 2 },
    EXPERT: { id: 'expert', name: '专家', color: '#DDA0DD', bgColor: '#4a1a4a', star: 3 },
    LEGENDARY: { id: 'legendary', name: '传说', color: '#FFD700', bgColor: '#5a4a00', star: 4 },
    LIMITED: { id: 'limited', name: '限定', color: '#FF6B6B', bgColor: '#5a1a1a', star: 5 }
};

const BADGE_CATEGORIES = {
    PROGRESSION: 'progression',      // 进度类
    COMBAT: 'combat',                // 战斗类
    COLLECTION: 'collection',        // 收集类
    SKILL: 'skill',                  // 技巧类
    SPECIAL: 'special',              // 特殊类
    EVENT: 'event'                   // 活动类
};

const COLLECTION_TYPES = {
    TOWER: 'tower',                  // 塔模型
    SKIN: 'skin',                    // 皮肤
    CARD_BACK: 'cardBack',           // 卡背
    AVATAR_FRAME: 'avatarFrame',     // 头像框
    TITLE: 'title'                   // 称号
};

// ============================================
// 徽章数据定义 (100个徽章)
// ============================================

const BADGES_DATA = {
    // ===== 新手徽章 (20个) =====
    novice: [
        {
            id: 'first_step',
            name: '首登者',
            description: '首次登顶任意一座塔',
            icon: '🏔️',
            rarity: 'NOVICE',
            category: 'PROGRESSION',
            condition: { type: 'first_clear', count: 1 },
            reward: { gold: 100, gems: 10 }
        },
        {
            id: 'card_master_bronze',
            name: '卡牌学徒',
            description: '累计打出100张卡牌',
            icon: '🃏',
            rarity: 'NOVICE',
            category: 'COMBAT',
            condition: { type: 'cards_played', count: 100 },
            reward: { gold: 50, gems: 5 }
        },
        {
            id: 'gold_collector',
            name: '金币收集者',
            description: '累计获得1000金币',
            icon: '🪙',
            rarity: 'NOVICE',
            category: 'PROGRESSION',
            condition: { type: 'gold_earned', count: 1000 },
            reward: { gold: 200, gems: 10 }
        },
        {
            id: 'battle_rookie',
            name: '战斗新手',
            description: '完成10场战斗',
            icon: '⚔️',
            rarity: 'NOVICE',
            category: 'COMBAT',
            condition: { type: 'battles_won', count: 10 },
            reward: { gold: 100, gems: 5 }
        },
        {
            id: 'tower_explorer',
            name: '塔之探索者',
            description: '解锁3座不同的塔',
            icon: '🗼',
            rarity: 'NOVICE',
            category: 'PROGRESSION',
            condition: { type: 'towers_unlocked', count: 3 },
            reward: { gold: 150, gems: 15 }
        },
        {
            id: 'card_collector_novice',
            name: '卡牌收集新手',
            description: '收集10张不同的卡牌',
            icon: '🎴',
            rarity: 'NOVICE',
            category: 'COLLECTION',
            condition: { type: 'cards_collected', count: 10 },
            reward: { gold: 100, gems: 10 }
        },
        {
            id: 'shop_visitor',
            name: '商店常客',
            description: '在商店购买5件物品',
            icon: '🏪',
            rarity: 'NOVICE',
            category: 'PROGRESSION',
            condition: { type: 'shop_purchases', count: 5 },
            reward: { gold: 50, gems: 5 }
        },
        {
            id: 'damage_dealer',
            name: '伤害输出者',
            description: '单场战斗造成超过100点伤害',
            icon: '💥',
            rarity: 'NOVICE',
            category: 'COMBAT',
            condition: { type: 'damage_single_battle', count: 100 },
            reward: { gold: 100, gems: 10 }
        },
        {
            id: 'healer_novice',
            name: '初级治疗师',
            description: '累计恢复500点生命值',
            icon: '💚',
            rarity: 'NOVICE',
            category: 'COMBAT',
            condition: { type: 'health_restored', count: 500 },
            reward: { gold: 80, gems: 8 }
        },
        {
            id: 'defender',
            name: '防御者',
            description: '累计获得200点护盾',
            icon: '🛡️',
            rarity: 'NOVICE',
            category: 'COMBAT',
            condition: { type: 'shield_gained', count: 200 },
            reward: { gold: 80, gems: 8 }
        },
        {
            id: 'enemy_slayer',
            name: '敌人猎手',
            description: '击败50个敌人',
            icon: '💀',
            rarity: 'NOVICE',
            category: 'COMBAT',
            condition: { type: 'enemies_defeated', count: 50 },
            reward: { gold: 150, gems: 15 }
        },
        {
            id: 'level_up',
            name: '等级提升',
            description: '玩家等级达到5级',
            icon: '⬆️',
            rarity: 'NOVICE',
            category: 'PROGRESSION',
            condition: { type: 'player_level', count: 5 },
            reward: { gold: 200, gems: 20 }
        },
        {
            id: 'combo_starter',
            name: '连击 starter',
            description: '在一回合内打出3张卡牌',
            icon: '🎯',
            rarity: 'NOVICE',
            category: 'SKILL',
            condition: { type: 'combo_3', count: 1 },
            reward: { gold: 100, gems: 10 }
        },
        {
            id: 'daily_player',
            name: '日常玩家',
            description: '连续登录3天',
            icon: '📅',
            rarity: 'NOVICE',
            category: 'SPECIAL',
            condition: { type: 'login_streak', count: 3 },
            reward: { gold: 300, gems: 30 }
        },
        {
            id: 'tutorial_complete',
            name: '毕业学员',
            description: '完成新手教程',
            icon: '🎓',
            rarity: 'NOVICE',
            category: 'PROGRESSION',
            condition: { type: 'tutorial_complete', count: 1 },
            reward: { gold: 500, gems: 50 }
        },
        {
            id: 'first_victory',
            name: '初次胜利',
            description: '赢得第一场PVP战斗',
            icon: '🏆',
            rarity: 'NOVICE',
            category: 'COMBAT',
            condition: { type: 'pvp_wins', count: 1 },
            reward: { gold: 200, gems: 20 }
        },
        {
            id: 'social_butterfly',
            name: '社交蝴蝶',
            description: '添加5位好友',
            icon: '🦋',
            rarity: 'NOVICE',
            category: 'SPECIAL',
            condition: { type: 'friends_added', count: 5 },
            reward: { gold: 100, gems: 10 }
        },
        {
            id: 'quest_complete',
            name: '任务完成',
            description: '完成10个日常任务',
            icon: '📋',
            rarity: 'NOVICE',
            category: 'PROGRESSION',
            condition: { type: 'quests_completed', count: 10 },
            reward: { gold: 150, gems: 15 }
        },
        {
            id: 'upgrade_first',
            name: '首次升级',
            description: '升级第一张卡牌',
            icon: '⬆️',
            rarity: 'NOVICE',
            category: 'PROGRESSION',
            condition: { type: 'card_upgraded', count: 1 },
            reward: { gold: 100, gems: 10 }
        },
        {
            id: 'treasure_hunter',
            name: '宝藏猎人',
            description: '开启10个宝箱',
            icon: '🎁',
            rarity: 'NOVICE',
            category: 'COLLECTION',
            condition: { type: 'chests_opened', count: 10 },
            reward: { gold: 200, gems: 20 }
        }
    ],

    // ===== 进阶徽章 (30个) =====
    advanced: [
        {
            id: 'double_clear',
            name: '双塔征服者',
            description: '通关2座不同的塔',
            icon: '🏰',
            rarity: 'ADVANCED',
            category: 'PROGRESSION',
            condition: { type: 'towers_cleared', count: 2 },
            reward: { gold: 300, gems: 30 }
        },
        {
            id: 'card_master_silver',
            name: '卡牌专家',
            description: '累计打出1000张卡牌',
            icon: '🎴',
            rarity: 'ADVANCED',
            category: 'COMBAT',
            condition: { type: 'cards_played', count: 1000 },
            reward: { gold: 300, gems: 30 }
        },
        {
            id: 'wealthy_adventurer',
            name: '富有的冒险者',
            description: '累计获得10000金币',
            icon: '💰',
            rarity: 'ADVANCED',
            category: 'PROGRESSION',
            condition: { type: 'gold_earned', count: 10000 },
            reward: { gold: 500, gems: 50 }
        },
        {
            id: 'battle_veteran',
            name: '战斗老兵',
            description: '完成100场战斗',
            icon: '⚔️',
            rarity: 'ADVANCED',
            category: 'COMBAT',
            condition: { type: 'battles_won', count: 100 },
            reward: { gold: 400, gems: 40 }
        },
        {
            id: 'provoke_master',
            name: '激怒大师',
            description: '使用激怒牌100次',
            icon: '😤',
            rarity: 'ADVANCED',
            category: 'SKILL',
            condition: { type: 'card_type_used', cardType: 'provoke', count: 100 },
            reward: { gold: 500, gems: 50 }
        },
        {
            id: 'heal_master',
            name: '治疗大师',
            description: '使用治疗牌100次',
            icon: '💊',
            rarity: 'ADVANCED',
            category: 'SKILL',
            condition: { type: 'card_type_used', cardType: 'heal', count: 100 },
            reward: { gold: 500, gems: 50 }
        },
        {
            id: 'shield_master',
            name: '护盾大师',
            description: '使用护盾牌100次',
            icon: '🛡️',
            rarity: 'ADVANCED',
            category: 'SKILL',
            condition: { type: 'card_type_used', cardType: 'shield', count: 100 },
            reward: { gold: 500, gems: 50 }
        },
        {
            id: 'attack_master',
            name: '攻击大师',
            description: '使用攻击牌500次',
            icon: '⚔️',
            rarity: 'ADVANCED',
            category: 'SKILL',
            condition: { type: 'card_type_used', cardType: 'attack', count: 500 },
            reward: { gold: 600, gems: 60 }
        },
        {
            id: 'combo_expert',
            name: '连击专家',
            description: '在一回合内打出5张卡牌',
            icon: '🎯',
            rarity: 'ADVANCED',
            category: 'SKILL',
            condition: { type: 'combo_5', count: 1 },
            reward: { gold: 400, gems: 40 }
        },
        {
            id: 'win_streak_5',
            name: '连胜达人',
            description: '获得5连胜',
            icon: '🔥',
            rarity: 'ADVANCED',
            category: 'COMBAT',
            condition: { type: 'win_streak', count: 5 },
            reward: { gold: 500, gems: 50 }
        },
        {
            id: 'collector_advanced',
            name: '卡牌收藏家',
            description: '收集30张不同的卡牌',
            icon: '🃏',
            rarity: 'ADVANCED',
            category: 'COLLECTION',
            condition: { type: 'cards_collected', count: 30 },
            reward: { gold: 400, gems: 40 }
        },
        {
            id: 'deck_builder',
            name: '卡组构建者',
            description: '创建5套不同的卡组',
            icon: '📚',
            rarity: 'ADVANCED',
            category: 'SKILL',
            condition: { type: 'decks_created', count: 5 },
            reward: { gold: 300, gems: 30 }
        },
        {
            id: 'perfect_victory',
            name: '完美胜利',
            description: '满血通关一座塔',
            icon: '💎',
            rarity: 'ADVANCED',
            category: 'COMBAT',
            condition: { type: 'full_health_clear', count: 1 },
            reward: { gold: 600, gems: 60 }
        },
        {
            id: 'damage_dealer_pro',
            name: '专业伤害输出',
            description: '单场战斗造成超过500点伤害',
            icon: '💣',
            rarity: 'ADVANCED',
            category: 'COMBAT',
            condition: { type: 'damage_single_battle', count: 500 },
            reward: { gold: 400, gems: 40 }
        },
        {
            id: 'boss_slayer',
            name: 'Boss猎手',
            description: '击败10个Boss',
            icon: '👹',
            rarity: 'ADVANCED',
            category: 'COMBAT',
            condition: { type: 'bosses_defeated', count: 10 },
            reward: { gold: 600, gems: 60 }
        },
        {
            id: 'speed_runner',
            name: '速度跑者',
            description: '在15回合内通关一座塔',
            icon: '⚡',
            rarity: 'ADVANCED',
            category: 'SKILL',
            condition: { type: 'clear_under_turns', count: 15 },
            reward: { gold: 500, gems: 50 }
        },
        {
            id: 'daily_dedicated',
            name: '忠实玩家',
            description: '连续登录7天',
            icon: '📆',
            rarity: 'ADVANCED',
            category: 'SPECIAL',
            condition: { type: 'login_streak', count: 7 },
            reward: { gold: 700, gems: 70 }
        },
        {
            id: 'pvp_warrior',
            name: 'PVP战士',
            description: '赢得20场PVP战斗',
            icon: '🥊',
            rarity: 'ADVANCED',
            category: 'COMBAT',
            condition: { type: 'pvp_wins', count: 20 },
            reward: { gold: 600, gems: 60 }
        },
        {
            id: 'guild_member',
            name: '公会成员',
            description: '加入一个公会',
            icon: '🏛️',
            rarity: 'ADVANCED',
            category: 'SPECIAL',
            condition: { type: 'guild_joined', count: 1 },
            reward: { gold: 300, gems: 30 }
        },
        {
            id: 'arena_fighter',
            name: '竞技场斗士',
            description: '参加10场竞技场战斗',
            icon: '🏟️',
            rarity: 'ADVANCED',
            category: 'COMBAT',
            condition: { type: 'arena_battles', count: 10 },
            reward: { gold: 500, gems: 50 }
        },
        {
            id: 'card_enhancer',
            name: '卡牌强化师',
            description: '将10张卡牌强化到+5',
            icon: '✨',
            rarity: 'ADVANCED',
            category: 'PROGRESSION',
            condition: { type: 'cards_plus_5', count: 10 },
            reward: { gold: 500, gems: 50 }
        },
        {
            id: 'tower_master_cn',
            name: '东方塔主',
            description: '通关所有中国主题塔',
            icon: '🐉',
            rarity: 'ADVANCED',
            category: 'PROGRESSION',
            condition: { type: 'clear_tower_theme', theme: 'china', count: 3 },
            reward: { gold: 800, gems: 80 }
        },
        {
            id: 'tower_master_eu',
            name: '欧洲塔主',
            description: '通关所有欧洲主题塔',
            icon: '🏰',
            rarity: 'ADVANCED',
            category: 'PROGRESSION',
            condition: { type: 'clear_tower_theme', theme: 'europe', count: 3 },
            reward: { gold: 800, gems: 80 }
        },
        {
            id: 'critical_striker',
            name: '暴击专家',
            description: '累计造成100次暴击',
            icon: '💫',
            rarity: 'ADVANCED',
            category: 'COMBAT',
            condition: { type: 'critical_hits', count: 100 },
            reward: { gold: 400, gems: 40 }
        },
        {
            id: 'status_inflicter',
            name: '状态大师',
            description: '对敌人施加200次状态效果',
            icon: '☠️',
            rarity: 'ADVANCED',
            category: 'SKILL',
            condition: { type: 'status_applied', count: 200 },
            reward: { gold: 450, gems: 45 }
        },
        {
            id: 'survivor',
            name: '生存专家',
            description: '在生命值低于10%的情况下赢得战斗',
            icon: '🩸',
            rarity: 'ADVANCED',
            category: 'COMBAT',
            condition: { type: 'low_hp_win', count: 10 },
            reward: { gold: 500, gems: 50 }
        },
        {
            id: 'combo_breaker',
            name: '连击破坏者',
            description: '打断敌人的10次连击',
            icon: '🔨',
            rarity: 'ADVANCED',
            category: 'SKILL',
            condition: { type: 'combos_broken', count: 10 },
            reward: { gold: 400, gems: 40 }
        },
        {
            id: 'wealth_hoarder',
            name: '财富囤积者',
            description: '同时拥有5000金币',
            icon: '🏦',
            rarity: 'ADVANCED',
            category: 'PROGRESSION',
            condition: { type: 'gold_held', count: 5000 },
            reward: { gold: 300, gems: 30 }
        },
        {
            id: 'skin_collector',
            name: '皮肤爱好者',
            description: '收集5个不同的皮肤',
            icon: '👔',
            rarity: 'ADVANCED',
            category: 'COLLECTION',
            condition: { type: 'skins_collected', count: 5 },
            reward: { gold: 400, gems: 40 }
        },
        {
            id: 'ascension_first',
            name: '初次飞升',
            description: '完成一次塔的难度提升',
            icon: '🌟',
            rarity: 'ADVANCED',
            category: 'PROGRESSION',
            condition: { type: 'ascension_complete', count: 1 },
            reward: { gold: 1000, gems: 100 }
        }
    ],

    // ===== 专家徽章 (25个) =====
    expert: [
        {
            id: 'tower_master',
            name: '塔之大师',
            description: '通关5座不同的塔',
            icon: '🗼',
            rarity: 'EXPERT',
            category: 'PROGRESSION',
            condition: { type: 'towers_cleared', count: 5 },
            reward: { gold: 1000, gems: 100 }
        },
        {
            id: 'card_master_gold',
            name: '卡牌大师',
            description: '累计打出5000张卡牌',
            icon: '👑',
            rarity: 'EXPERT',
            category: 'COMBAT',
            condition: { type: 'cards_played', count: 5000 },
            reward: { gold: 800, gems: 80 }
        },
        {
            id: 'millionaire',
            name: '百万富翁',
            description: '累计获得100000金币',
            icon: '💎',
            rarity: 'EXPERT',
            category: 'PROGRESSION',
            condition: { type: 'gold_earned', count: 100000 },
            reward: { gold: 2000, gems: 200 }
        },
        {
            id: 'battle_legend',
            name: '战斗传说',
            description: '完成500场战斗',
            icon: '⚔️',
            rarity: 'EXPERT',
            category: 'COMBAT',
            condition: { type: 'battles_won', count: 500 },
            reward: { gold: 1500, gems: 150 }
        },
        {
            id: 'win_streak_10',
            name: '连胜王',
            description: '获得10连胜',
            icon: '🔥',
            rarity: 'EXPERT',
            category: 'COMBAT',
            condition: { type: 'win_streak', count: 10 },
            reward: { gold: 1500, gems: 150 }
        },
        {
            id: 'speed_demon',
            name: '速度恶魔',
            description: '在10回合内登顶一座塔',
            icon: '⚡',
            rarity: 'EXPERT',
            category: 'SKILL',
            condition: { type: 'clear_under_turns', count: 10 },
            reward: { gold: 2000, gems: 200 }
        },
        {
            id: 'collector_expert',
            name: '卡牌大师收藏家',
            description: '收集60张不同的卡牌',
            icon: '🃏',
            rarity: 'EXPERT',
            category: 'COLLECTION',
            condition: { type: 'cards_collected', count: 60 },
            reward: { gold: 1500, gems: 150 }
        },
        {
            id: 'deck_master',
            name: '卡组大师',
            description: '创建10套不同的卡组',
            icon: '📚',
            rarity: 'EXPERT',
            category: 'SKILL',
            condition: { type: 'decks_created', count: 10 },
            reward: { gold: 1000, gems: 100 }
        },
        {
            id: 'damage_dealer_master',
            name: '伤害大师',
            description: '单场战斗造成超过1000点伤害',
            icon: '💣',
            rarity: 'EXPERT',
            category: 'COMBAT',
            condition: { type: 'damage_single_battle', count: 1000 },
            reward: { gold: 1500, gems: 150 }
        },
        {
            id: 'boss_hunter',
            name: 'Boss猎人',
            description: '击败50个Boss',
            icon: '👺',
            rarity: 'EXPERT',
            category: 'COMBAT',
            condition: { type: 'bosses_defeated', count: 50 },
            reward: { gold: 2000, gems: 200 }
        },
        {
            id: 'pvp_master',
            name: 'PVP大师',
            description: '赢得100场PVP战斗',
            icon: '🥇',
            rarity: 'EXPERT',
            category: 'COMBAT',
            condition: { type: 'pvp_wins', count: 100 },
            reward: { gold: 2000, gems: 200 }
        },
        {
            id: 'arena_champion',
            name: '竞技场冠军',
            description: '赢得竞技场第一名',
            icon: '🏆',
            rarity: 'EXPERT',
            category: 'COMBAT',
            condition: { type: 'arena_rank_1', count: 1 },
            reward: { gold: 3000, gems: 300 }
        },
        {
            id: 'daily_master',
            name: '每日大师',
            description: '连续登录30天',
            icon: '📅',
            rarity: 'EXPERT',
            category: 'SPECIAL',
            condition: { type: 'login_streak', count: 30 },
            reward: { gold: 3000, gems: 300 }
        },
        {
            id: 'guild_officer',
            name: '公会官员',
            description: '成为公会官员',
            icon: '⚜️',
            rarity: 'EXPERT',
            category: 'SPECIAL',
            condition: { type: 'guild_officer', count: 1 },
            reward: { gold: 1500, gems: 150 }
        },
        {
            id: 'ascension_master',
            name: '飞升大师',
            description: '完成10次塔的难度提升',
            icon: '🌠',
            rarity: 'EXPERT',
            category: 'PROGRESSION',
            condition: { type: 'ascension_complete', count: 10 },
            reward: { gold: 5000, gems: 500 }
        },
        {
            id: 'critical_god',
            name: '暴击之神',
            description: '累计造成1000次暴击',
            icon: '💥',
            rarity: 'EXPERT',
            category: 'COMBAT',
            condition: { type: 'critical_hits', count: 1000 },
            reward: { gold: 1500, gems: 150 }
        },
        {
            id: 'no_damage_clear',
            name: '无伤通关',
            description: '在不受到任何伤害的情况下通关一座塔',
            icon: '🛡️',
            rarity: 'EXPERT',
            category: 'SKILL',
            condition: { type: 'no_damage_clear', count: 1 },
            reward: { gold: 5000, gems: 500 }
        },
        {
            id: 'one_turn_boss',
            name: '一击必杀',
            description: '在一回合内击败Boss',
            icon: '⚡',
            rarity: 'EXPERT',
            category: 'SKILL',
            condition: { type: 'one_turn_boss', count: 5 },
            reward: { gold: 3000, gems: 300 }
        },
        {
            id: 'combo_master',
            name: '连击大师',
            description: '在一回合内打出8张卡牌',
            icon: '🎯',
            rarity: 'EXPERT',
            category: 'SKILL',
            condition: { type: 'combo_8', count: 1 },
            reward: { gold: 2000, gems: 200 }
        },
        {
            id: 'tower_expert_all',
            name: '全塔专家',
            description: '通关所有标准塔',
            icon: '🏛️',
            rarity: 'EXPERT',
            category: 'PROGRESSION',
            condition: { type: 'all_standard_towers', count: 15 },
            reward: { gold: 5000, gems: 500 }
        },
        {
            id: 'skin_master',
            name: '皮肤大师',
            description: '收集15个不同的皮肤',
            icon: '👗',
            rarity: 'EXPERT',
            category: 'COLLECTION',
            condition: { type: 'skins_collected', count: 15 },
            reward: { gold: 2000, gems: 200 }
        },
        {
            id: 'card_back_collector',
            name: '卡背收藏家',
            description: '收集10个不同的卡背',
            icon: '🎴',
            rarity: 'EXPERT',
            category: 'COLLECTION',
            condition: { type: 'card_backs_collected', count: 10 },
            reward: { gold: 1500, gems: 150 }
        },
        {
            id: 'avatar_frame_collector',
            name: '头像框收藏家',
            description: '收集10个不同的头像框',
            icon: '🖼️',
            rarity: 'EXPERT',
            category: 'COLLECTION',
            condition: { type: 'avatar_frames_collected', count: 10 },
            reward: { gold: 1500, gems: 150 }
        },
        {
            id: 'title_holder',
            name: '称号持有者',
            description: '获得5个不同的称号',
            icon: '📛',
            rarity: 'EXPERT',
            category: 'COLLECTION',
            condition: { type: 'titles_earned', count: 5 },
            reward: { gold: 2000, gems: 200 }
        },
        {
            id: 'legendary_cards',
            name: '传说卡牌师',
            description: '收集10张传说品质卡牌',
            icon: '✨',
            rarity: 'EXPERT',
            category: 'COLLECTION',
            condition: { type: 'legendary_cards', count: 10 },
            reward: { gold: 3000, gems: 300 }
        }
    ],

    // ===== 传说徽章 (15个) =====
    legendary: [
        {
            id: 'global_conqueror',
            name: '全球征服者',
            description: '在所有国家塔获胜',
            icon: '🌍',
            rarity: 'LEGENDARY',
            category: 'PROGRESSION',
            condition: { type: 'all_country_towers', countries: ['CN', 'US', 'JP', 'EU', 'EG'], count: 5 },
            reward: { gold: 10000, gems: 1000 }
        },
        {
            id: 'win_streak_20',
            name: '不败神话',
            description: '获得20连胜',
            icon: '👑',
            rarity: 'LEGENDARY',
            category: 'COMBAT',
            condition: { type: 'win_streak', count: 20 },
            reward: { gold: 10000, gems: 1000 }
        },
        {
            id: 'speed_god',
            name: '极速之神',
            description: '在5回合内登顶一座塔',
            icon: '⚡',
            rarity: 'LEGENDARY',
            category: 'SKILL',
            condition: { type: 'clear_under_turns', count: 5 },
            reward: { gold: 15000, gems: 1500 }
        },
        {
            id: 'card_god',
            name: '卡牌之神',
            description: '累计打出10000张卡牌',
            icon: '🃏',
            rarity: 'LEGENDARY',
            category: 'COMBAT',
            condition: { type: 'cards_played', count: 10000 },
            reward: { gold: 10000, gems: 1000 }
        },
        {
            id: 'billionaire',
            name: '亿万富翁',
            description: '累计获得1000000金币',
            icon: '💰',
            rarity: 'LEGENDARY',
            category: 'PROGRESSION',
            condition: { type: 'gold_earned', count: 1000000 },
            reward: { gold: 50000, gems: 5000 }
        },
        {
            id: 'tower_god',
            name: '塔之神',
            description: '通关所有塔的最高难度',
            icon: '🗽',
            rarity: 'LEGENDARY',
            category: 'PROGRESSION',
            condition: { type: 'all_towers_max_difficulty', count: 225 },
            reward: { gold: 50000, gems: 5000 }
        },
        {
            id: 'pvp_god',
            name: 'PVP之神',
            description: '赢得500场PVP战斗',
            icon: '👑',
            rarity: 'LEGENDARY',
            category: 'COMBAT',
            condition: { type: 'pvp_wins', count: 500 },
            reward: { gold: 20000, gems: 2000 }
        },
        {
            id: 'collector_legend',
            name: '传说收藏家',
            description: '收集所有卡牌',
            icon: '✨',
            rarity: 'LEGENDARY',
            category: 'COLLECTION',
            condition: { type: 'all_cards', count: 100 },
            reward: { gold: 30000, gems: 3000 }
        },
        {
            id: 'damage_god',
            name: '伤害之神',
            description: '单场战斗造成超过5000点伤害',
            icon: '☄️',
            rarity: 'LEGENDARY',
            category: 'COMBAT',
            condition: { type: 'damage_single_battle', count: 5000 },
            reward: { gold: 20000, gems: 2000 }
        },
        {
            id: 'one_hp_hero',
            name: '一血英雄',
            description: '在仅剩1点生命值的情况下通关一座塔',
            icon: '❤️',
            rarity: 'LEGENDARY',
            category: 'SKILL',
            condition: { type: 'one_hp_clear', count: 1 },
            reward: { gold: 30000, gems: 3000 }
        },
        {
            id: 'combo_god',
            name: '连击之神',
            description: '在一回合内打出10张卡牌',
            icon: '🎯',
            rarity: 'LEGENDARY',
            category: 'SKILL',
            condition: { type: 'combo_10', count: 1 },
            reward: { gold: 20000, gems: 2000 }
        },
        {
            id: 'ascension_god',
            name: '飞升之神',
            description: '完成100次塔的难度提升',
            icon: '🌌',
            rarity: 'LEGENDARY',
            category: 'PROGRESSION',
            condition: { type: 'ascension_complete', count: 100 },
            reward: { gold: 50000, gems: 5000 }
        },
        {
            id: 'guild_master',
            name: '公会之主',
            description: '创建一个达到满级的公会',
            icon: '🏰',
            rarity: 'LEGENDARY',
            category: 'SPECIAL',
            condition: { type: 'max_level_guild', count: 1 },
            reward: { gold: 30000, gems: 3000 }
        },
        {
            id: 'yearly_dedicated',
            name: '年度玩家',
            description: '连续登录365天',
            icon: '📅',
            rarity: 'LEGENDARY',
            category: 'SPECIAL',
            condition: { type: 'login_streak', count: 365 },
            reward: { gold: 50000, gems: 5000 }
        },
        {
            id: 'legend_complete',
            name: '传说达成',
            description: '获得所有其他传说徽章',
            icon: '🌟',
            rarity: 'LEGENDARY',
            category: 'SPECIAL',
            condition: { type: 'all_other_legendary', count: 14 },
            reward: { gold: 100000, gems: 10000 }
        }
    ],

    // ===== 限定徽章 (10个) =====
    limited: [
        {
            id: 'beta_tester',
            name: '内测先驱',
            description: '参与游戏内测',
            icon: '🧪',
            rarity: 'LIMITED',
            category: 'SPECIAL',
            condition: { type: 'beta_participant', count: 1 },
            reward: { gold: 5000, gems: 500 },
            available: false
        },
        {
            id: 'founder',
            name: '创始玩家',
            description: '在游戏发布首周注册',
            icon: '🎖️',
            rarity: 'LIMITED',
            category: 'SPECIAL',
            condition: { type: 'first_week_player', count: 1 },
            reward: { gold: 10000, gems: 1000 },
            available: false
        },
        {
            id: 'anniversary_1st',
            name: '一周年纪念',
            description: '参与游戏一周年庆典活动',
            icon: '🎂',
            rarity: 'LIMITED',
            category: 'EVENT',
            condition: { type: 'anniversary_event', year: 1 },
            reward: { gold: 10000, gems: 1000 },
            available: false
        },
        {
            id: 'spring_festival_2024',
            name: '春节庆典2024',
            description: '完成2024年春节活动',
            icon: '🧧',
            rarity: 'LIMITED',
            category: 'EVENT',
            condition: { type: 'spring_festival', year: 2024 },
            reward: { gold: 8888, gems: 888 },
            available: false
        },
        {
            id: 'halloween_2024',
            name: '万圣节惊魂2024',
            description: '完成2024年万圣节活动',
            icon: '🎃',
            rarity: 'LIMITED',
            category: 'EVENT',
            condition: { type: 'halloween_event', year: 2024 },
            reward: { gold: 6666, gems: 666 },
            available: false
        },
        {
            id: 'christmas_2024',
            name: '圣诞奇迹2024',
            description: '完成2024年圣诞节活动',
            icon: '🎄',
            rarity: 'LIMITED',
            category: 'EVENT',
            condition: { type: 'christmas_event', year: 2024 },
            reward: { gold: 8888, gems: 888 },
            available: false
        },
        {
            id: 'summer_event_2024',
            name: '夏日狂欢2024',
            description: '完成2024年夏日活动',
            icon: '☀️',
            rarity: 'LIMITED',
            category: 'EVENT',
            condition: { type: 'summer_event', year: 2024 },
            reward: { gold: 6666, gems: 666 },
            available: false
        },
        {
            id: 'top_100_season1',
            name: '第一赛季百强',
            description: '在第一赛季进入前100名',
            icon: '🏅',
            rarity: 'LIMITED',
            category: 'EVENT',
            condition: { type: 'season_rank', season: 1, rank: 100 },
            reward: { gold: 20000, gems: 2000 },
            available: false
        },
        {
            id: 'easter_2024',
            name: '复活节彩蛋2024',
            description: '完成2024年复活节活动',
            icon: '🥚',
            rarity: 'LIMITED',
            category: 'EVENT',
            condition: { type: 'easter_event', year: 2024 },
            reward: { gold: 5555, gems: 555 },
            available: false
        },
        {
            id: 'special_collaboration',
            name: '特别联动',
            description: '参与特别联动活动',
            icon: '🤝',
            rarity: 'LIMITED',
            category: 'EVENT',
            condition: { type: 'collaboration_event', event: 'special' },
            reward: { gold: 15000, gems: 1500 },
            available: false
        }
    ]
};

// 计算徽章总数
const TOTAL_BADGES = Object.values(BADGES_DATA).reduce((sum, arr) => sum + arr.length, 0);

// ============================================
// 收集系统数据定义
// ============================================

const COLLECTION_DATA = {
    // 塔模型收集 (225个)
    towers: {
        type: COLLECTION_TYPES.TOWER,
        name: '塔图鉴',
        description: '收集世界各地的神秘塔楼',
        totalCount: 225,
        categories: [
            { id: 'cn', name: '东方神塔', count: 45, region: 'CN', theme: '东方古典' },
            { id: 'us', name: '自由之塔', count: 45, region: 'US', theme: '现代科技' },
            { id: 'jp', name: '樱花之塔', count: 45, region: 'JP', theme: '和风幻想' },
            { id: 'eu', name: '欧洲古塔', count: 45, region: 'EU', theme: '欧洲中世纪' },
            { id: 'eg', name: '神秘方塔', count: 45, region: 'EG', theme: '古埃及' }
        ],
        sets: [
            {
                id: 'cn_set',
                name: '东方套装',
                items: ['cn_tower_01', 'cn_tower_02', 'cn_tower_03'],
                bonus: { attack: 5, description: '东方之力：攻击+5%' }
            },
            {
                id: 'us_set',
                name: '自由套装',
                items: ['us_tower_01', 'us_tower_02', 'us_tower_03'],
                bonus: { defense: 5, description: '自由护盾：防御+5%' }
            },
            {
                id: 'jp_set',
                name: '樱花套装',
                items: ['jp_tower_01', 'jp_tower_02', 'jp_tower_03'],
                bonus: { speed: 5, description: '樱花闪避：速度+5%' }
            },
            {
                id: 'eu_set',
                name: '骑士套装',
                items: ['eu_tower_01', 'eu_tower_02', 'eu_tower_03'],
                bonus: { health: 5, description: '骑士荣耀：生命+5%' }
            },
            {
                id: 'eg_set',
                name: '法老套装',
                items: ['eg_tower_01', 'eg_tower_02', 'eg_tower_03'],
                bonus: { magic: 5, description: '法老诅咒：魔法伤害+5%' }
            }
        ],
        rewards: [
            { milestone: 10, reward: { gold: 1000, gems: 100 } },
            { milestone: 25, reward: { gold: 3000, gems: 300 } },
            { milestone: 50, reward: { gold: 8000, gems: 800 } },
            { milestone: 100, reward: { gold: 20000, gems: 2000 } },
            { milestone: 150, reward: { gold: 50000, gems: 5000 } },
            { milestone: 200, reward: { gold: 100000, gems: 10000 } },
            { milestone: 225, reward: { gold: 500000, gems: 50000, title: '塔之主宰' } }
        ]
    },

    // 皮肤收集
    skins: {
        type: COLLECTION_TYPES.SKIN,
        name: '皮肤收藏',
        description: '个性化你的角色外观',
        totalCount: 50,
        categories: [
            { id: 'common', name: '普通', count: 15 },
            { id: 'rare', name: '稀有', count: 15 },
            { id: 'epic', name: '史诗', count: 12 },
            { id: 'legendary', name: '传说', count: 8 }
        ],
        sets: [
            {
                id: 'warrior_set',
                name: '战士套装',
                items: ['warrior_skin_01', 'warrior_skin_02', 'warrior_skin_03'],
                bonus: { attack: 10, description: '战士之力：攻击+10' }
            },
            {
                id: 'mage_set',
                name: '法师套装',
                items: ['mage_skin_01', 'mage_skin_02', 'mage_skin_03'],
                bonus: { magicPower: 10, description: '魔法增幅：魔法+10' }
            },
            {
                id: 'assassin_set',
                name: '刺客套装',
                items: ['assassin_skin_01', 'assassin_skin_02', 'assassin_skin_03'],
                bonus: { critChance: 5, description: '致命一击：暴击+5%' }
            }
        ],
        rewards: [
            { milestone: 5, reward: { gold: 500, gems: 50 } },
            { milestone: 15, reward: { gold: 2000, gems: 200 } },
            { milestone: 30, reward: { gold: 8000, gems: 800 } },
            { milestone: 50, reward: { gold: 30000, gems: 3000, title: '时尚达人' } }
        ]
    },

    // 卡背收集
    cardBacks: {
        type: COLLECTION_TYPES.CARD_BACK,
        name: '卡背收藏',
        description: '展示独特的卡牌背面',
        totalCount: 30,
        categories: [
            { id: 'basic', name: '基础', count: 10 },
            { id: 'themed', name: '主题', count: 15 },
            { id: 'legendary', name: '传说', count: 5 }
        ],
        sets: [
            {
                id: 'element_set',
                name: '元素套装',
                items: ['fire_back', 'water_back', 'earth_back', 'wind_back'],
                bonus: { elementDamage: 8, description: '元素共鸣：元素伤害+8%' }
            }
        ],
        rewards: [
            { milestone: 5, reward: { gold: 300, gems: 30 } },
            { milestone: 15, reward: { gold: 1500, gems: 150 } },
            { milestone: 30, reward: { gold: 10000, gems: 1000, title: '卡牌艺术家' } }
        ]
    },

    // 头像框收集
    avatarFrames: {
        type: COLLECTION_TYPES.AVATAR_FRAME,
        name: '头像框收藏',
        description: '个性化你的头像展示',
        totalCount: 40,
        categories: [
            { id: 'common', name: '普通', count: 15 },
            { id: 'rare', name: '稀有', count: 15 },
            { id: 'legendary', name: '传说', count: 10 }
        ],
        sets: [
            {
                id: 'season_set',
                name: '赛季套装',
                items: ['s1_frame', 's2_frame', 's3_frame', 's4_frame'],
                bonus: { prestige: 50, description: '赛季荣耀：声望+50' }
            }
        ],
        rewards: [
            { milestone: 5, reward: { gold: 400, gems: 40 } },
            { milestone: 15, reward: { gold: 2000, gems: 200 } },
            { milestone: 30, reward: { gold: 10000, gems: 1000 } },
            { milestone: 40, reward: { gold: 50000, gems: 5000, title: '形象大师' } }
        ]
    },

    // 称号收集
    titles: {
        type: COLLECTION_TYPES.TITLE,
        name: '称号收藏',
        description: '展示你的荣耀头衔',
        totalCount: 60,
        categories: [
            { id: 'achievement', name: '成就称号', count: 25 },
            { id: 'ranked', name: '排位称号', count: 20 },
            { id: 'event', name: '活动称号', count: 15 }
        ],
        rewards: [
            { milestone: 10, reward: { gold: 1000, gems: 100 } },
            { milestone: 30, reward: { gold: 5000, gems: 500 } },
            { milestone: 60, reward: { gold: 20000, gems: 2000, title: '称号之王' } }
        ]
    }
};

// ============================================
// 徽章系统核心类
// ============================================

class BadgeSystem {
    constructor() {
        this.badges = this._flattenBadges();
        this.userBadges = new Map(); // 用户已获得的徽章
        this.badgeProgress = new Map(); // 徽章进度追踪
        this.listeners = [];
    }

    /**
     * 将徽章数据扁平化为数组
     */
    _flattenBadges() {
        const allBadges = [];
        Object.values(BADGES_DATA).forEach(category => {
            allBadges.push(...category);
        });
        return allBadges;
    }

    /**
     * 获取所有徽章
     */
    getAllBadges() {
        return this.badges;
    }

    /**
     * 按稀有度获取徽章
     */
    getBadgesByRarity(rarity) {
        return this.badges.filter(badge => badge.rarity === rarity);
    }

    /**
     * 按分类获取徽章
     */
    getBadgesByCategory(category) {
        return this.badges.filter(badge => badge.category === category);
    }

    /**
     * 获取用户已获得的徽章
     */
    getUserBadges(userId) {
        return this.userBadges.get(userId) || [];
    }

    /**
     * 检查用户是否已获得某徽章
     */
    hasBadge(userId, badgeId) {
        const userBadgeList = this.userBadges.get(userId) || [];
        return userBadgeList.includes(badgeId);
    }

    /**
     * 获取徽章进度
     */
    getBadgeProgress(userId, badgeId) {
        const key = `${userId}:${badgeId}`;
        return this.badgeProgress.get(key) || { current: 0, target: 0, percentage: 0 };
    }

    /**
     * 更新徽章进度
     */
    updateProgress(userId, badgeId, current, target) {
        const key = `${userId}:${badgeId}`;
        const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
        
        this.badgeProgress.set(key, {
            current,
            target,
            percentage,
            updatedAt: Date.now()
        });

        // 检查是否完成
        if (current >= target && !this.hasBadge(userId, badgeId)) {
            this.awardBadge(userId, badgeId);
        }

        return this.badgeProgress.get(key);
    }

    /**
     * 授予徽章
     */
    awardBadge(userId, badgeId) {
        if (this.hasBadge(userId, badgeId)) {
            return { success: false, message: '徽章已获得' };
        }

        const badge = this.badges.find(b => b.id === badgeId);
        if (!badge) {
            return { success: false, message: '徽章不存在' };
        }

        // 添加到用户徽章列表
        if (!this.userBadges.has(userId)) {
            this.userBadges.set(userId, []);
        }
        this.userBadges.get(userId).push(badgeId);

        // 触发事件
        this._notifyListeners('badgeAwarded', { userId, badge, timestamp: Date.now() });

        return {
            success: true,
            badge,
            reward: badge.reward
        };
    }

    /**
     * 批量检查并授予徽章
     */
    checkAndAwardBadges(userId, stats) {
        const newlyAwarded = [];

        this.badges.forEach(badge => {
            if (this.hasBadge(userId, badge.id)) return;

            const condition = badge.condition;
            let shouldAward = false;

            switch (condition.type) {
                case 'first_clear':
                    shouldAward = stats.towersCleared >= condition.count;
                    break;
                case 'cards_played':
                    shouldAward = stats.cardsPlayed >= condition.count;
                    break;
                case 'gold_earned':
                    shouldAward = stats.goldEarned >= condition.count;
                    break;
                case 'battles_won':
                    shouldAward = stats.battlesWon >= condition.count;
                    break;
                case 'towers_unlocked':
                    shouldAward = stats.towersUnlocked >= condition.count;
                    break;
                case 'cards_collected':
                    shouldAward = stats.cardsCollected >= condition.count;
                    break;
                case 'shop_purchases':
                    shouldAward = stats.shopPurchases >= condition.count;
                    break;
                case 'damage_single_battle':
                    shouldAward = stats.maxDamageInBattle >= condition.count;
                    break;
                case 'health_restored':
                    shouldAward = stats.healthRestored >= condition.count;
                    break;
                case 'shield_gained':
                    shouldAward = stats.shieldGained >= condition.count;
                    break;
                case 'enemies_defeated':
                    shouldAward = stats.enemiesDefeated >= condition.count;
                    break;
                case 'player_level':
                    shouldAward = stats.playerLevel >= condition.count;
                    break;
                case 'win_streak':
                    shouldAward = stats.maxWinStreak >= condition.count;
                    break;
                case 'login_streak':
                    shouldAward = stats.loginStreak >= condition.count;
                    break;
                case 'pvp_wins':
                    shouldAward = stats.pvpWins >= condition.count;
                    break;
                case 'towers_cleared':
                    shouldAward = stats.uniqueTowersCleared >= condition.count;
                    break;
                case 'card_type_used':
                    shouldAward = (stats.cardTypesUsed[condition.cardType] || 0) >= condition.count;
                    break;
                case 'clear_under_turns':
                    shouldAward = stats.fastestClearTurns <= condition.count && stats.fastestClearTurns > 0;
                    break;
                default:
                    // 其他复杂条件需要自定义处理
                    break;
            }

            if (shouldAward) {
                const result = this.awardBadge(userId, badge.id);
                if (result.success) {
                    newlyAwarded.push(result);
                }
            }
        });

        return newlyAwarded;
    }

    /**
     * 获取统计信息
     */
    getStats(userId) {
        const userBadges = this.getUserBadges(userId);
        const byRarity = {};
        
        userBadges.forEach(badgeId => {
            const badge = this.badges.find(b => b.id === badgeId);
            if (badge) {
                byRarity[badge.rarity] = (byRarity[badge.rarity] || 0) + 1;
            }
        });

        return {
            total: TOTAL_BADGES,
            earned: userBadges.length,
            percentage: Math.round((userBadges.length / TOTAL_BADGES) * 100),
            byRarity,
            nextBadge: this._getNextRecommendedBadge(userId)
        };
    }

    /**
     * 获取下一个推荐徽章
     */
    _getNextRecommendedBadge(userId) {
        const userBadges = this.getUserBadges(userId);
        const unearned = this.badges.filter(b => !userBadges.includes(b.id));
        
        // 按稀有度排序，优先推荐容易获得的
        const rarityOrder = ['NOVICE', 'ADVANCED', 'EXPERT', 'LEGENDARY', 'LIMITED'];
        unearned.sort((a, b) => rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity));
        
        return unearned[0] || null;
    }

    /**
     * 添加事件监听器
     */
    addListener(callback) {
        this.listeners.push(callback);
    }

    /**
     * 通知所有监听器
     */
    _notifyListeners(event, data) {
        this.listeners.forEach(callback => {
            try {
                callback(event, data);
            } catch (e) {
                console.error('Badge listener error:', e);
            }
        });
    }

    /**
     * 生成分享图数据
     */
    generateShareData(userId) {
        const stats = this.getStats(userId);
        const userBadges = this.getUserBadges(userId);
        
        // 获取最近获得的徽章
        const recentBadges = userBadges.slice(-6).map(id => 
            this.badges.find(b => b.id === id)
        ).filter(Boolean);

        return {
            title: '我的徽章成就',
            stats: {
                total: stats.total,
                earned: stats.earned,
                percentage: stats.percentage
            },
            featured: recentBadges,
            shareText: `我在命运塔获得了 ${stats.earned}/${stats.total} 个徽章！一起来挑战吧！`,
            timestamp: Date.now()
        };
    }
}

// ============================================
// 收集系统核心类
// ============================================

class CollectionSystem {
    constructor() {
        this.collections = COLLECTION_DATA;
        this.userCollections = new Map();
        this.setBonuses = new Map();
    }

    /**
     * 获取所有收集类型
     */
    getAllCollections() {
        return this.collections;
    }

    /**
     * 获取特定类型的收集
     */
    getCollection(type) {
        return this.collections[type];
    }

    /**
     * 获取用户的收集
     */
    getUserCollection(userId, type) {
        const userData = this.userCollections.get(userId) || {};
        return userData[type] || { items: [], sets: [] };
    }

    /**
     * 添加收集物品
     */
    addItem(userId, type, itemId) {
        if (!this.userCollections.has(userId)) {
            this.userCollections.set(userId, {});
        }

        const userData = this.userCollections.get(userId);
        if (!userData[type]) {
            userData[type] = { items: [], sets: [] };
        }

        const collection = userData[type];
        if (collection.items.includes(itemId)) {
            return { success: false, message: '物品已收集' };
        }

        collection.items.push(itemId);

        // 检查套装
        this._checkSetCompletion(userId, type);
        
        // 检查里程碑奖励
        const reward = this._checkMilestone(userId, type);

        return {
            success: true,
            itemId,
            collectionProgress: this.getProgress(userId, type),
            reward
        };
    }

    /**
     * 检查套装完成
     */
    _checkSetCompletion(userId, type) {
        const collection = this.collections[type];
        const userData = this.getUserCollection(userId, type);
        
        collection.sets.forEach(set => {
            const hasAllItems = set.items.every(itemId => 
                userData.items.includes(itemId)
            );
            
            if (hasAllItems && !userData.sets.includes(set.id)) {
                userData.sets.push(set.id);
                
                // 激活套装效果
                this._activateSetBonus(userId, set);
            }
        });
    }

    /**
     * 激活套装加成
     */
    _activateSetBonus(userId, set) {
        if (!this.setBonuses.has(userId)) {
            this.setBonuses.set(userId, []);
        }
        this.setBonuses.get(userId).push(set.bonus);
    }

    /**
     * 获取用户的套装加成
     */
    getSetBonuses(userId) {
        return this.setBonuses.get(userId) || [];
    }

    /**
     * 检查里程碑奖励
     */
    _checkMilestone(userId, type) {
        const collection = this.collections[type];
        const userData = this.getUserCollection(userId, type);
        const count = userData.items.length;

        const milestone = collection.rewards.find(r => r.milestone === count);
        return milestone ? milestone.reward : null;
    }

    /**
     * 获取收集进度
     */
    getProgress(userId, type) {
        const collection = this.collections[type];
        const userData = this.getUserCollection(userId, type);
        const collected = userData.items.length;

        return {
            type,
            name: collection.name,
            collected,
            total: collection.totalCount,
            percentage: Math.round((collected / collection.totalCount) * 100),
            nextMilestone: this._getNextMilestone(type, collected)
        };
    }

    /**
     * 获取下一个里程碑
     */
    _getNextMilestone(type, collected) {
        const collection = this.collections[type];
        const next = collection.rewards.find(r => r.milestone > collected);
        return next || null;
    }

    /**
     * 获取总进度统计
     */
    getTotalProgress(userId) {
        const types = Object.keys(this.collections);
        const progress = {};
        let totalCollected = 0;
        let totalItems = 0;

        types.forEach(type => {
            const p = this.getProgress(userId, type);
            progress[type] = p;
            totalCollected += p.collected;
            totalItems += p.total;
        });

        return {
            byType: progress,
            totalCollected,
            totalItems,
            overallPercentage: Math.round((totalCollected / totalItems) * 100),
            activeSetBonuses: this.getSetBonuses(userId)
        };
    }

    /**
     * 获取套装信息
     */
    getSetInfo(setId) {
        for (const type of Object.keys(this.collections)) {
            const collection = this.collections[type];
            const set = collection.sets.find(s => s.id === setId);
            if (set) return { ...set, collectionType: type };
        }
        return null;
    }
}

// ============================================
// 徽章展示墙组件 (3D翻转效果)
// ============================================

class BadgeShowcase {
    constructor(containerId, badgeSystem) {
        this.container = document.getElementById(containerId);
        this.badgeSystem = badgeSystem;
        this.currentFilter = 'all';
        this.animationEnabled = true;
    }

    /**
     * 渲染徽章墙
     */
    render(userId) {
        if (!this.container) return;

        const badges = this._getFilteredBadges(userId);
        const stats = this.badgeSystem.getStats(userId);

        this.container.innerHTML = `
            <div class="badge-showcase">
                ${this._renderHeader(stats)}
                ${this._renderFilters()}
                ${this._renderBadgeGrid(badges, userId)}
            </div>
        `;

        this._attachEventListeners(userId);
    }

    /**
     * 渲染头部统计
     */
    _renderHeader(stats) {
        return `
            <div class="badge-header">
                <div class="badge-stats">
                    <div class="stat-item">
                        <span class="stat-value">${stats.earned}</span>
                        <span class="stat-label">已获得</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.total}</span>
                        <span class="stat-label">总徽章</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-value">${stats.percentage}%</span>
                        <span class="stat-label">完成度</span>
                    </div>
                </div>
                ${stats.nextBadge ? `
                    <div class="next-badge">
                        <span>下一个目标:</span>
                        <span class="next-badge-name">${stats.nextBadge.name}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * 渲染过滤器
     */
    _renderFilters() {
        const filters = [
            { id: 'all', label: '全部' },
            { id: 'NOVICE', label: '新手' },
            { id: 'ADVANCED', label: '进阶' },
            { id: 'EXPERT', label: '专家' },
            { id: 'LEGENDARY', label: '传说' },
            { id: 'LIMITED', label: '限定' }
        ];

        return `
            <div class="badge-filters">
                ${filters.map(f => `
                    <button class="filter-btn ${this.currentFilter === f.id ? 'active' : ''}" 
                            data-filter="${f.id}">
                        ${f.label}
                    </button>
                `).join('')}
            </div>
        `;
    }

    /**
     * 渲染徽章网格
     */
    _renderBadgeGrid(badges, userId) {
        return `
            <div class="badge-grid">
                ${badges.map(badge => this._renderBadgeCard(badge, userId)).join('')}
            </div>
        `;
    }

    /**
     * 渲染单个徽章卡片 (3D翻转效果)
     */
    _renderBadgeCard(badge, userId) {
        const hasBadge = this.badgeSystem.hasBadge(userId, badge.id);
        const progress = this.badgeSystem.getBadgeProgress(userId, badge.id);
        const rarity = BADGE_RARITY[badge.rarity];

        return `
            <div class="badge-card ${hasBadge ? 'earned' : 'locked'}" 
                 data-badge-id="${badge.id}"
                 style="--rarity-color: ${rarity.color}; --rarity-bg: ${rarity.bgColor}">
                <div class="badge-card-inner">
                    <div class="badge-card-front">
                        <div class="badge-icon">${hasBadge ? badge.icon : '🔒'}</div>
                        <div class="badge-stars">${'⭐'.repeat(rarity.star)}</div>
                        <div class="badge-name">${hasBadge ? badge.name : '???'}</div>
                    </div>
                    <div class="badge-card-back">
                        <div class="badge-detail">
                            <h4>${badge.name}</h4>
                            <p class="badge-desc">${badge.description}</p>
                            <div class="badge-rarity" style="color: ${rarity.color}">
                                ${rarity.name}
                            </div>
                            ${!hasBadge ? `
                                <div class="badge-progress">
                                    <div class="progress-bar">
                                        <div class="progress-fill" style="width: ${progress.percentage}%"></div>
                                    </div>
                                    <span>${progress.current}/${progress.target}</span>
                                </div>
                            ` : `
                                <div class="badge-reward">
                                    <span>💰 ${badge.reward.gold}</span>
                                    <span>💎 ${badge.reward.gems}</span>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取过滤后的徽章
     */
    _getFilteredBadges(userId) {
        let badges = this.badgeSystem.getAllBadges();

        if (this.currentFilter !== 'all') {
            badges = badges.filter(b => b.rarity === this.currentFilter);
        }

        // 已获得的排前面
        return badges.sort((a, b) => {
            const hasA = this.badgeSystem.hasBadge(userId, a.id);
            const hasB = this.badgeSystem.hasBadge(userId, b.id);
            if (hasA && !hasB) return -1;
            if (!hasA && hasB) return 1;
            return 0;
        });
    }

    /**
     * 附加事件监听器
     */
    _attachEventListeners(userId) {
        // 过滤器点击
        this.container.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.render(userId);
            });
        });

        // 徽章卡片悬停3D效果
        this.container.querySelectorAll('.badge-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (this.animationEnabled) {
                    card.classList.add('flipped');
                }
            });
            card.addEventListener('mouseleave', () => {
                card.classList.remove('flipped');
            });
            card.addEventListener('click', () => {
                this._showBadgeDetail(card.dataset.badgeId, userId);
            });
        });
    }

    /**
     * 显示徽章详情
     */
    _showBadgeDetail(badgeId, userId) {
        const badge = this.badgeSystem.badges.find(b => b.id === badgeId);
        if (!badge) return;

        // 可以触发模态框或详情面板
        const event = new CustomEvent('badgeDetailRequested', {
            detail: { badge, userId }
        });
        document.dispatchEvent(event);
    }
}

// ============================================
// 徽章分享系统
// ============================================

class BadgeShareSystem {
    constructor(badgeSystem) {
        this.badgeSystem = badgeSystem;
    }

    /**
     * 生成分享图片
     */
    async generateShareImage(userId) {
        const data = this.badgeSystem.generateShareData(userId);
        
        // 创建Canvas
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        // 绘制背景
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#1a1a2e');
        gradient.addColorStop(1, '#16213e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        // 绘制标题
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏰 命运塔成就 🏰', 400, 80);

        // 绘制统计
        ctx.font = '32px Arial';
        ctx.fillText(`已获得 ${data.stats.earned}/${data.stats.total} 个徽章`, 400, 150);

        // 绘制进度条
        const progressWidth = 400;
        const progress = data.stats.earned / data.stats.total;
        ctx.fillStyle = '#333';
        ctx.fillRect(200, 180, progressWidth, 30);
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(200, 180, progressWidth * progress, 30);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(200, 180, progressWidth, 30);

        // 绘制百分比
        ctx.fillStyle = '#fff';
        ctx.font = '24px Arial';
        ctx.fillText(`${data.stats.percentage}% 完成`, 400, 240);

        // 绘制特色徽章
        ctx.font = 'bold 28px Arial';
        ctx.fillText('最近获得', 400, 300);

        data.featured.forEach((badge, index) => {
            const x = 150 + (index % 3) * 200;
            const y = 350 + Math.floor(index / 3) * 120;
            
            // 徽章背景
            ctx.fillStyle = BADGE_RARITY[badge.rarity].bgColor;
            ctx.beginPath();
            ctx.arc(x, y, 40, 0, Math.PI * 2);
            ctx.fill();
            
            // 徽章图标
            ctx.font = '48px Arial';
            ctx.fillText(badge.icon, x, y + 16);
            
            // 徽章名称
            ctx.font = '16px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText(badge.name, x, y + 65);
        });

        // 绘制二维码区域占位
        ctx.fillStyle = '#fff';
        ctx.fillRect(600, 450, 120, 120);
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText('扫码一起玩', 660, 590);

        return canvas.toDataURL('image/png');
    }

    /**
     * 分享文本
     */
    generateShareText(userId) {
        const data = this.badgeSystem.generateShareData(userId);
        return data.shareText;
    }
}

// ============================================
// 排行榜系统
// ============================================

class CollectionLeaderboard {
    constructor() {
        this.leaderboard = [];
    }

    /**
     * 更新排行榜数据
     */
    updateLeaderboard(userData) {
        this.leaderboard = Object.entries(userData)
            .map(([userId, data]) => ({
                userId,
                ...data,
                rank: 0
            }))
            .sort((a, b) => b.collectionScore - a.collectionScore)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));
    }

    /**
     * 获取排行榜
     */
    getLeaderboard(limit = 100) {
        return this.leaderboard.slice(0, limit);
    }

    /**
     * 获取用户排名
     */
    getUserRank(userId) {
        const entry = this.leaderboard.find(e => e.userId === userId);
        return entry ? entry.rank : null;
    }

    /**
     * 计算收集分数
     */
    calculateCollectionScore(progress) {
        const baseScore = progress.totalCollected * 10;
        const setBonus = progress.activeSetBonuses.length * 100;
        const completionBonus = progress.overallPercentage * 5;
        return baseScore + setBonus + completionBonus;
    }
}

// ============================================
// CSS样式 (用于3D翻转效果)
// ============================================

const BADGE_SYSTEM_STYLES = `
.badge-showcase {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.badge-header {
    text-align: center;
    margin-bottom: 30px;
    padding: 20px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    color: white;
}

.badge-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 15px;
}

.stat-item {
    text-align: center;
}

.stat-value {
    display: block;
    font-size: 36px;
    font-weight: bold;
    color: #ffd700;
}

.stat-label {
    font-size: 14px;
    color: #888;
}

.next-badge {
    font-size: 16px;
    color: #aaa;
}

.next-badge-name {
    color: #ffd700;
    font-weight: bold;
}

.badge-filters {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 30px;
    flex-wrap: wrap;
}

.filter-btn {
    padding: 10px 20px;
    border: 2px solid #333;
    background: #1a1a2e;
    color: #fff;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-btn:hover {
    border-color: #ffd700;
    transform: translateY(-2px);
}

.filter-btn.active {
    background: #ffd700;
    color: #1a1a2e;
    border-color: #ffd700;
}

.badge-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
}

/* 3D翻转卡片样式 */
.badge-card {
    perspective: 1000px;
    height: 200px;
    cursor: pointer;
}

.badge-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    text-align: center;
    transition: transform 0.6s;
    transform-style: preserve-3d;
}

.badge-card.flipped .badge-card-inner {
    transform: rotateY(180deg);
}

.badge-card-front,
.badge-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 15px;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.badge-card-front {
    background: linear-gradient(135deg, var(--rarity-bg) 0%, #1a1a2e 100%);
    border: 2px solid var(--rarity-color);
}

.badge-card-back {
    background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
    border: 2px solid var(--rarity-color);
    transform: rotateY(180deg);
}

.badge-card.locked .badge-card-front {
    filter: grayscale(0.7);
    opacity: 0.7;
}

.badge-card.earned .badge-card-front {
    animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
    from {
        box-shadow: 0 0 10px var(--rarity-color);
    }
    to {
        box-shadow: 0 0 20px var(--rarity-color), 0 0 30px var(--rarity-color);
    }
}

.badge-icon {
    font-size: 48px;
    margin-bottom: 10px;
}

.badge-stars {
    font-size: 12px;
    margin-bottom: 5px;
}

.badge-name {
    font-size: 14px;
    font-weight: bold;
    color: #fff;
}

.badge-detail h4 {
    margin: 0 0 10px 0;
    color: var(--rarity-color);
    font-size: 16px;
}

.badge-desc {
    font-size: 12px;
    color: #ccc;
    margin-bottom: 10px;
}

.badge-rarity {
    font-size: 12px;
    font-weight: bold;
    margin-bottom: 10px;
}

.badge-progress {
    width: 100%;
}

.progress-bar {
    height: 8px;
    background: #333;
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: 5px;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #4CAF50, #8BC34A);
    transition: width 0.3s ease;
}

.badge-progress span {
    font-size: 11px;
    color: #888;
}

.badge-reward {
    display: flex;
    gap: 15px;
    justify-content: center;
    font-size: 14px;
}

/* 收集系统样式 */
.collection-panel {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.collection-header {
    text-align: center;
    margin-bottom: 30px;
}

.collection-tabs {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 20px;
}

.collection-tab {
    padding: 12px 24px;
    background: #1a1a2e;
    color: #fff;
    border: 2px solid #333;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
}

.collection-tab:hover,
.collection-tab.active {
    border-color: #ffd700;
    background: #2d2d44;
}

.collection-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 15px;
}

.collection-item {
    aspect-ratio: 1;
    background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
    border: 2px solid #444;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;
    cursor: pointer;
}

.collection-item.collected {
    border-color: #4CAF50;
    box-shadow: 0 0 15px rgba(76, 175, 80, 0.3);
}

.collection-item:hover {
    transform: translateY(-5px) scale(1.05);
}

.set-bonus-panel {
    background: linear-gradient(135deg, #2d2d44 0%, #1a1a2e 100%);
    border-radius: 16px;
    padding: 20px;
    margin-top: 20px;
}

.set-bonus-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px;
    background: rgba(255,255,255,0.05);
    border-radius: 8px;
    margin-bottom: 10px;
}

.set-bonus-item.active {
    border-left: 4px solid #4CAF50;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .badge-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
    
    .badge-stats {
        gap: 20px;
    }
    
    .stat-value {
        font-size: 28px;
    }
}
`;

// ============================================
// 初始化与导出
// ============================================

/**
 * 初始化徽章系统和收集系统
 */
function initializeBadgeSystem(containerId, userId) {
    // 添加样式
    if (!document.getElementById('badge-system-styles')) {
        const styleEl = document.createElement('style');
        styleEl.id = 'badge-system-styles';
        styleEl.textContent = BADGE_SYSTEM_STYLES;
        document.head.appendChild(styleEl);
    }

    // 创建系统实例
    const badgeSystem = new BadgeSystem();
    const collectionSystem = new CollectionSystem();
    const showcase = new BadgeShowcase(containerId, badgeSystem);
    const shareSystem = new BadgeShareSystem(badgeSystem);
    const leaderboard = new CollectionLeaderboard();

    // 初始渲染
    showcase.render(userId);

    return {
        badgeSystem,
        collectionSystem,
        showcase,
        shareSystem,
        leaderboard,
        
        // 便捷方法
        refresh: () => showcase.render(userId),
        share: () => shareSystem.generateShareImage(userId),
        getStats: () => badgeSystem.getStats(userId)
    };
}

// ============================================
// 模拟数据生成 (用于测试)
// ============================================

function generateMockUserData(userId) {
    const mockStats = {
        towersCleared: 3,
        cardsPlayed: 2500,
        goldEarned: 50000,
        battlesWon: 150,
        towersUnlocked: 8,
        cardsCollected: 35,
        shopPurchases: 25,
        maxDamageInBattle: 800,
        healthRestored: 2000,
        shieldGained: 800,
        enemiesDefeated: 300,
        playerLevel: 25,
        maxWinStreak: 8,
        loginStreak: 15,
        pvpWins: 50,
        uniqueTowersCleared: 5,
        cardTypesUsed: {
            provoke: 150,
            heal: 120,
            shield: 80,
            attack: 2000
        },
        fastestClearTurns: 12
    };

    return mockStats;
}

// ============================================
// 导出模块
// ============================================

// ES6 模块导出
export {
    BadgeSystem,
    CollectionSystem,
    BadgeShowcase,
    BadgeShareSystem,
    CollectionLeaderboard,
    initializeBadgeSystem,
    generateMockUserData,
    BADGES_DATA,
    COLLECTION_DATA,
    BADGE_RARITY,
    BADGE_CATEGORIES,
    COLLECTION_TYPES,
    TOTAL_BADGES
};

// 全局变量导出 (用于浏览器环境)
if (typeof window !== 'undefined') {
    window.FateTowerBadgeSystem = {
        BadgeSystem,
        CollectionSystem,
        BadgeShowcase,
        BadgeShareSystem,
        CollectionLeaderboard,
        initializeBadgeSystem,
        generateMockUserData,
        BADGES_DATA,
        COLLECTION_DATA,
        BADGE_RARITY,
        BADGE_CATEGORIES,
        COLLECTION_TYPES,
        TOTAL_BADGES
    };
}

// ============================================
// 使用示例
// ============================================

/*
// HTML 中使用示例:
<div id="badge-showcase"></div>

// JavaScript:
const { badgeSystem, collectionSystem, shareSystem } = initializeBadgeSystem('badge-showcase', 'user123');

// 检查并授予徽章
const newBadges = badgeSystem.checkAndAwardBadges('user123', generateMockUserData('user123'));
console.log('新获得徽章:', newBadges);

// 添加收集物品
const result = collectionSystem.addItem('user123', 'towers', 'cn_tower_01');
console.log('收集结果:', result);

// 生成分享图
shareSystem.generateShareImage('user123').then(dataUrl => {
    // 显示或下载图片
});
*/

console.log(`🐍 命运塔徽章系统已加载 - 共 ${TOTAL_BADGES} 个徽章`);
