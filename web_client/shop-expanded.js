/**
 * 命运塔 - 扩展商店系统
 * Tower of Fate - Expanded Shop System
 * 包含105个商品：皮肤30 + 特效20 + 卡背20 + 头像框15 + 道具10 + 礼包10
 */

class TowerShop {
  constructor() {
    this.items = [];
    this.cart = [];
    this.purchaseHistory = [];
    this.favorites = [];
    this.discounts = new Map();
    this.searchQuery = '';
    this.activeFilters = {
      category: 'all',
      priceRange: 'all',
      rarity: 'all',
      sortBy: 'default'
    };
    this.userInventory = new Set();
    this.userCoins = 10000;
    this.userGems = 500;
    
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.generateItems();
    this.generateDailyDiscounts();
    this.saveToStorage();
  }

  // ==================== 商品数据生成 ====================
  
  generateItems() {
    this.items = [
      // ========== 皮肤类 (30个) ==========
      // 国家主题皮肤 (10个)
      { id: 'skin_china', name: '华夏龙魂', description: '金龙缠身，威风凛凛，彰显华夏威严', category: 'skin', price: 888, currency: 'gem', icon: '🐉', rarity: 'legendary', subCategory: 'country', region: 'china' },
      { id: 'skin_japan', name: '樱花武士', description: '落樱缤纷，武士道精神永存', category: 'skin', price: 688, currency: 'gem', icon: '🌸', rarity: 'epic', subCategory: 'country', region: 'japan' },
      { id: 'skin_korea', name: '韩服典雅', description: '传统韩服，优雅端庄', category: 'skin', price: 588, currency: 'gem', icon: '👘', rarity: 'epic', subCategory: 'country', region: 'korea' },
      { id: 'skin_usa', name: '自由雄鹰', description: '自由之翼，翱翔天际', category: 'skin', price: 588, currency: 'gem', icon: '🦅', rarity: 'epic', subCategory: 'country', region: 'usa' },
      { id: 'skin_uk', name: '英伦绅士', description: '优雅绅士，风度翩翩', category: 'skin', price: 588, currency: 'gem', icon: '🇬🇧', rarity: 'epic', subCategory: 'country', region: 'uk' },
      { id: 'skin_france', name: '浪漫巴黎', description: '法式浪漫，艺术之都', category: 'skin', price: 588, currency: 'gem', icon: '🗼', rarity: 'epic', subCategory: 'country', region: 'france' },
      { id: 'skin_russia', name: '冰雪熊魂', description: '西伯利亚的寒风，熊的力量', category: 'skin', price: 688, currency: 'gem', icon: '🐻', rarity: 'epic', subCategory: 'country', region: 'russia' },
      { id: 'skin_brazil', name: '桑巴热情', description: '热情桑巴，足球王国', category: 'skin', price: 488, currency: 'gem', icon: '⚽', rarity: 'rare', subCategory: 'country', region: 'brazil' },
      { id: 'skin_egypt', name: '法老之怒', description: '古埃及的神秘力量', category: 'skin', price: 788, currency: 'gem', icon: '🔺', rarity: 'epic', subCategory: 'country', region: 'egypt' },
      { id: 'skin_india', name: '宝莱坞之星', description: '印度风情，歌舞升平', category: 'skin', price: 488, currency: 'gem', icon: '🕌', rarity: 'rare', subCategory: 'country', region: 'india' },
      
      // 季节皮肤 (8个)
      { id: 'skin_spring', name: '春暖花开', description: '万物复苏，春意盎然', category: 'skin', price: 388, currency: 'gem', icon: '🌸', rarity: 'rare', subCategory: 'season', season: 'spring' },
      { id: 'skin_summer', name: '烈日炎炎', description: '夏日海滩，清凉一夏', category: 'skin', price: 388, currency: 'gem', icon: '☀️', rarity: 'rare', subCategory: 'season', season: 'summer' },
      { id: 'skin_autumn', name: '金秋送爽', description: '枫叶飘零，秋意浓浓', category: 'skin', price: 388, currency: 'gem', icon: '🍂', rarity: 'rare', subCategory: 'season', season: 'autumn' },
      { id: 'skin_winter', name: '寒冬飞雪', description: '银装素裹，冰雪世界', category: 'skin', price: 388, currency: 'gem', icon: '❄️', rarity: 'rare', subCategory: 'season', season: 'winter' },
      { id: 'skin_spring_premium', name: '桃花源记', description: '世外桃源，梦幻仙境', category: 'skin', price: 688, currency: 'gem', icon: '🌺', rarity: 'epic', subCategory: 'season', season: 'spring' },
      { id: 'skin_summer_premium', name: '深海秘境', description: '潜入深海，探索未知', category: 'skin', price: 688, currency: 'gem', icon: '🐙', rarity: 'epic', subCategory: 'season', season: 'summer' },
      { id: 'skin_autumn_premium', name: '月桂传说', description: '希腊神话，月桂女神', category: 'skin', price: 688, currency: 'gem', icon: '🏛️', rarity: 'epic', subCategory: 'season', season: 'autumn' },
      { id: 'skin_winter_premium', name: '北极极光', description: '极光舞动，冰雪奇缘', category: 'skin', price: 888, currency: 'gem', icon: '🌌', rarity: 'legendary', subCategory: 'season', season: 'winter' },
      
      // 节日皮肤 (12个)
      { id: 'skin_newyear', name: '新年快乐', description: '辞旧迎新，万象更新', category: 'skin', price: 588, currency: 'gem', icon: '🎊', rarity: 'epic', subCategory: 'festival', festival: 'newyear' },
      { id: 'skin_lantern', name: '元宵灯会', description: '灯火阑珊，团圆美满', category: 'skin', price: 488, currency: 'gem', icon: '🏮', rarity: 'rare', subCategory: 'festival', festival: 'lantern' },
      { id: 'skin_valentine', name: '情人节限定', description: '玫瑰与巧克力，爱的告白', category: 'skin', price: 520, currency: 'gem', icon: '💕', rarity: 'epic', subCategory: 'festival', festival: 'valentine' },
      { id: 'skin_dragonboat', name: '端午龙舟', description: '龙舟竞渡，粽叶飘香', category: 'skin', price: 388, currency: 'gem', icon: '🐲', rarity: 'rare', subCategory: 'festival', festival: 'dragonboat' },
      { id: 'skin_mooncake', name: '中秋月圆', description: '月饼香甜，人月两圆', category: 'skin', price: 488, currency: 'gem', icon: '🌕', rarity: 'rare', subCategory: 'festival', festival: 'midautumn' },
      { id: 'skin_halloween', name: '万圣狂欢', description: '不给糖就捣蛋！', category: 'skin', price: 388, currency: 'gem', icon: '🎃', rarity: 'rare', subCategory: 'festival', festival: 'halloween' },
      { id: 'skin_christmas', name: '圣诞奇迹', description: '白雪圣诞，礼物满屋', category: 'skin', price: 588, currency: 'gem', icon: '🎄', rarity: 'epic', subCategory: 'festival', festival: 'christmas' },
      { id: 'skin_springfestival', name: '春节大吉', description: '爆竹声中一岁除', category: 'skin', price: 888, currency: 'gem', icon: '🧧', rarity: 'legendary', subCategory: 'festival', festival: 'springfestival' },
      { id: 'skin_qixi', name: '七夕相会', description: '牛郎织女，鹊桥相会', category: 'skin', price: 520, currency: 'gem', icon: '💑', rarity: 'epic', subCategory: 'festival', festival: 'qixi' },
      { id: 'skin_national', name: '国庆盛典', description: '举国同庆，盛世华章', category: 'skin', price: 588, currency: 'gem', icon: '🇨🇳', rarity: 'epic', subCategory: 'festival', festival: 'national' },
      { id: 'skin_labor', name: '劳动光荣', description: '勤劳致富，劳动最美', category: 'skin', price: 288, currency: 'gem', icon: '🔧', rarity: 'common', subCategory: 'festival', festival: 'labor' },
      { id: 'skin_children', name: '童心未泯', description: '保持童心，永远年轻', category: 'skin', price: 388, currency: 'gem', icon: '🎈', rarity: 'rare', subCategory: 'festival', festival: 'children' },

      // ========== 特效类 (20个) ==========
      // 出牌特效 (5个)
      { id: 'effect_card_fire', name: '烈焰出牌', description: '出牌时燃烧烈焰，气势磅礴', category: 'effect', price: 388, currency: 'gem', icon: '🔥', rarity: 'epic', subCategory: 'card_play', target: 'card_play' },
      { id: 'effect_card_ice', name: '冰霜出牌', description: '出牌时凝结冰霜，寒气逼人', category: 'effect', price: 388, currency: 'gem', icon: '❄️', rarity: 'epic', subCategory: 'card_play', target: 'card_play' },
      { id: 'effect_card_lightning', name: '雷霆出牌', description: '出牌时电闪雷鸣，威震四方', category: 'effect', price: 488, currency: 'gem', icon: '⚡', rarity: 'legendary', subCategory: 'card_play', target: 'card_play' },
      { id: 'effect_card_gold', name: '金光出牌', description: '出牌时金光闪耀，富贵逼人', category: 'effect', price: 588, currency: 'gem', icon: '✨', rarity: 'legendary', subCategory: 'card_play', target: 'card_play' },
      { id: 'effect_card_shadow', name: '暗影出牌', description: '出牌时暗影涌动，神秘莫测', category: 'effect', price: 388, currency: 'gem', icon: '🌑', rarity: 'epic', subCategory: 'card_play', target: 'card_play' },
      
      // 胜利特效 (5个)
      { id: 'effect_win_fireworks', name: '烟花绽放', description: '胜利时烟花绽放，庆祝胜利', category: 'effect', price: 288, currency: 'gem', icon: '🎆', rarity: 'rare', subCategory: 'victory', target: 'victory' },
      { id: 'effect_win_confetti', name: '彩带飞扬', description: '胜利时彩带飞舞，欢乐无比', category: 'effect', price: 188, currency: 'gem', icon: '🎉', rarity: 'common', subCategory: 'victory', target: 'victory' },
      { id: 'effect_win_crown', name: '皇冠加冕', description: '胜利时皇冠降临，王者风范', category: 'effect', price: 488, currency: 'gem', icon: '👑', rarity: 'legendary', subCategory: 'victory', target: 'victory' },
      { id: 'effect_win_star', name: '星辰坠落', description: '胜利时星辰坠落，梦幻唯美', category: 'effect', price: 388, currency: 'gem', icon: '⭐', rarity: 'epic', subCategory: 'victory', target: 'victory' },
      { id: 'effect_win_dragon', name: '龙腾九天', description: '胜利时巨龙腾飞，霸气侧漏', category: 'effect', price: 588, currency: 'gem', icon: '🐉', rarity: 'legendary', subCategory: 'victory', target: 'victory' },
      
      // 层数晋升特效 (5个)
      { id: 'effect_level_up', name: '光芒晋升', description: '晋升时圣光普照，荣耀加身', category: 'effect', price: 288, currency: 'gem', icon: '📈', rarity: 'rare', subCategory: 'level_up', target: 'level_up' },
      { id: 'effect_level_spiral', name: '螺旋升天', description: '晋升时螺旋上升，气势如虹', category: 'effect', price: 388, currency: 'gem', icon: '🌪️', rarity: 'epic', subCategory: 'level_up', target: 'level_up' },
      { id: 'effect_level_portal', name: '传送门现', description: '晋升时传送门开，跨越时空', category: 'effect', price: 488, currency: 'gem', icon: '🌀', rarity: 'legendary', subCategory: 'level_up', target: 'level_up' },
      { id: 'effect_level_wings', name: '天使之翼', description: '晋升时羽翼展开，圣洁高贵', category: 'effect', price: 388, currency: 'gem', icon: '🕊️', rarity: 'epic', subCategory: 'level_up', target: 'level_up' },
      { id: 'effect_level_runes', name: '符文环绕', description: '晋升时符文环绕，魔法涌动', category: 'effect', price: 288, currency: 'gem', icon: '🔮', rarity: 'rare', subCategory: 'level_up', target: 'level_up' },
      
      // 激怒特效 (5个)
      { id: 'effect_anger_red', name: '怒火中烧', description: '激怒时双眼赤红，怒火滔天', category: 'effect', price: 188, currency: 'gem', icon: '😡', rarity: 'common', subCategory: 'anger', target: 'anger' },
      { id: 'effect_anger_flame', name: '烈焰焚身', description: '激怒时全身烈焰，势不可挡', category: 'effect', price: 388, currency: 'gem', icon: '🔥', rarity: 'epic', subCategory: 'anger', target: 'anger' },
      { id: 'effect_anger_dark', name: '黑暗觉醒', description: '激怒时黑暗降临，力量爆发', category: 'effect', price: 488, currency: 'gem', icon: '🌑', rarity: 'legendary', subCategory: 'anger', target: 'anger' },
      { id: 'effect_anger_thunder', name: '雷鸣怒吼', description: '激怒时雷霆万钧，威震八方', category: 'effect', price: 288, currency: 'gem', icon: '⛈️', rarity: 'rare', subCategory: 'anger', target: 'anger' },
      { id: 'effect_anger_berserk', name: '狂战士魂', description: '激怒时进入狂暴，战无不胜', category: 'effect', price: 388, currency: 'gem', icon: '⚔️', rarity: 'epic', subCategory: 'anger', target: 'anger' },

      // ========== 卡背类 (20个) ==========
      // 各国国旗卡背 (10个)
      { id: 'cardback_china', name: '五星红旗', description: '中国国旗，红色信仰', category: 'cardback', price: 188, currency: 'coin', icon: '🇨🇳', rarity: 'common', subCategory: 'flag', country: 'china' },
      { id: 'cardback_usa', name: '星条旗', description: '美国国旗，自由之旗', category: 'cardback', price: 188, currency: 'coin', icon: '🇺🇸', rarity: 'common', subCategory: 'flag', country: 'usa' },
      { id: 'cardback_uk', name: '米字旗', description: '英国国旗，英伦风情', category: 'cardback', price: 188, currency: 'coin', icon: '🇬🇧', rarity: 'common', subCategory: 'flag', country: 'uk' },
      { id: 'cardback_japan', name: '日之丸', description: '日本国旗，旭日东升', category: 'cardback', price: 188, currency: 'coin', icon: '🇯🇵', rarity: 'common', subCategory: 'flag', country: 'japan' },
      { id: 'cardback_france', name: '三色旗', description: '法国国旗，自由平等', category: 'cardback', price: 188, currency: 'coin', icon: '🇫🇷', rarity: 'common', subCategory: 'flag', country: 'france' },
      { id: 'cardback_germany', name: '黑红金', description: '德国国旗，严谨高效', category: 'cardback', price: 188, currency: 'coin', icon: '🇩🇪', rarity: 'common', subCategory: 'flag', country: 'germany' },
      { id: 'cardback_italy', name: '绿白红', description: '意大利国旗，艺术之国', category: 'cardback', price: 188, currency: 'coin', icon: '🇮🇹', rarity: 'common', subCategory: 'flag', country: 'italy' },
      { id: 'cardback_brazil', name: '绿黄旗', description: '巴西国旗，桑巴热情', category: 'cardback', price: 188, currency: 'coin', icon: '🇧🇷', rarity: 'common', subCategory: 'flag', country: 'brazil' },
      { id: 'cardback_russia', name: '白蓝红', description: '俄罗斯国旗，战斗民族', category: 'cardback', price: 188, currency: 'coin', icon: '🇷🇺', rarity: 'common', subCategory: 'flag', country: 'russia' },
      { id: 'cardback_korea', name: '太极旗', description: '韩国国旗，阴阳平衡', category: 'cardback', price: 188, currency: 'coin', icon: '🇰🇷', rarity: 'common', subCategory: 'flag', country: 'korea' },
      
      // 图案卡背 (6个)
      { id: 'cardback_dragon', name: '龙纹卡背', description: '龙腾四海，气势磅礴', category: 'cardback', price: 388, currency: 'coin', icon: '🐲', rarity: 'rare', subCategory: 'pattern', theme: 'dragon' },
      { id: 'cardback_phoenix', name: '凤凰卡背', description: '凤凰涅槃，浴火重生', category: 'cardback', price: 388, currency: 'coin', icon: '🔥', rarity: 'rare', subCategory: 'pattern', theme: 'phoenix' },
      { id: 'cardback_tiger', name: '猛虎卡背', description: '猛虎下山，势不可挡', category: 'cardback', price: 388, currency: 'coin', icon: '🐯', rarity: 'rare', subCategory: 'pattern', theme: 'tiger' },
      { id: 'cardback_phoenix2', name: '朱雀卡背', description: '南方朱雀，火焰之主', category: 'cardback', price: 488, currency: 'coin', icon: '🦅', rarity: 'epic', subCategory: 'pattern', theme: 'phoenix' },
      { id: 'cardback_turtle', name: '玄武卡背', description: '北方玄武，坚不可摧', category: 'cardback', price: 488, currency: 'coin', icon: '🐢', rarity: 'epic', subCategory: 'pattern', theme: 'turtle' },
      { id: 'cardback_kirin', name: '麒麟卡背', description: '麒麟降世，祥瑞之兆', category: 'cardback', price: 588, currency: 'coin', icon: '🦄', rarity: 'legendary', subCategory: 'pattern', theme: 'kirin' },
      
      // 主题卡背 (4个)
      { id: 'cardback_galaxy', name: '银河卡背', description: '浩瀚银河，星辰大海', category: 'cardback', price: 588, currency: 'coin', icon: '🌌', rarity: 'legendary', subCategory: 'theme', theme: 'space' },
      { id: 'cardback_ocean', name: '深海卡背', description: '深海秘境，神秘莫测', category: 'cardback', price: 388, currency: 'coin', icon: '🌊', rarity: 'rare', subCategory: 'theme', theme: 'ocean' },
      { id: 'cardback_forest', name: '森林卡背', description: '神秘森林，生机盎然', category: 'cardback', price: 388, currency: 'coin', icon: '🌲', rarity: 'rare', subCategory: 'theme', theme: 'forest' },
      { id: 'cardback_volcano', name: '火山卡背', description: '熔岩涌动，烈焰焚天', category: 'cardback', price: 488, currency: 'coin', icon: '🌋', rarity: 'epic', subCategory: 'theme', theme: 'volcano' },

      // ========== 头像框类 (15个) ==========
      // 等级框 (5个)
      { id: 'avatar_bronze', name: '青铜边框', description: '初入塔中，青铜加身', category: 'avatar', price: 100, currency: 'coin', icon: '🥉', rarity: 'common', subCategory: 'level', level: 'bronze' },
      { id: 'avatar_silver', name: '白银边框', description: '银光闪闪，实力初显', category: 'avatar', price: 500, currency: 'coin', icon: '🥈', rarity: 'common', subCategory: 'level', level: 'silver' },
      { id: 'avatar_gold', name: '黄金边框', description: '金光璀璨，荣耀加身', category: 'avatar', price: 1000, currency: 'coin', icon: '🥇', rarity: 'rare', subCategory: 'level', level: 'gold' },
      { id: 'avatar_platinum', name: '铂金边框', description: '铂金尊贵，实力超群', category: 'avatar', price: 2000, currency: 'coin', icon: '💎', rarity: 'epic', subCategory: 'level', level: 'platinum' },
      { id: 'avatar_diamond', name: '钻石边框', description: '钻石永恒，巅峰王者', category: 'avatar', price: 5000, currency: 'coin', icon: '💠', rarity: 'legendary', subCategory: 'level', level: 'diamond' },
      
      // 成就框 (6个)
      { id: 'avatar_winner', name: '胜者边框', description: '百战百胜，常胜将军', category: 'avatar', price: 888, currency: 'coin', icon: '🏆', rarity: 'epic', subCategory: 'achievement', achievement: 'winner' },
      { id: 'avatar_collector', name: '收藏家框', description: '收集控的专属荣耀', category: 'avatar', price: 666, currency: 'coin', icon: '🎒', rarity: 'rare', subCategory: 'achievement', achievement: 'collector' },
      { id: 'avatar_master', name: '大师边框', description: '登峰造极，一代宗师', category: 'avatar', price: 1288, currency: 'coin', icon: '👨‍🏫', rarity: 'legendary', subCategory: 'achievement', achievement: 'master' },
      { id: 'avatar_lucky', name: '幸运边框', description: '欧气满满，好运连连', category: 'avatar', price: 520, currency: 'coin', icon: '🍀', rarity: 'rare', subCategory: 'achievement', achievement: 'lucky' },
      { id: 'avatar_legend', name: '传说边框', description: '传奇玩家，载入史册', category: 'avatar', price: 1688, currency: 'coin', icon: '📜', rarity: 'legendary', subCategory: 'achievement', achievement: 'legend' },
      { id: 'avatar_newbie', name: '新人边框', description: '新来的小可爱', category: 'avatar', price: 66, currency: 'coin', icon: '🌱', rarity: 'common', subCategory: 'achievement', achievement: 'newbie' },
      
      // 限定框 (4个)
      { id: 'avatar_anniversary', name: '周年限定框', description: '周年庆典，感恩有你', category: 'avatar', price: 888, currency: 'gem', icon: '🎂', rarity: 'legendary', subCategory: 'limited', limited: 'anniversary' },
      { id: 'avatar_beta', name: '元老边框', description: '内测玩家，一路相伴', category: 'avatar', price: 0, currency: 'coin', icon: '🌟', rarity: 'legendary', subCategory: 'limited', limited: 'beta' },
      { id: 'avatar_vip', name: 'VIP尊享框', description: '尊贵的VIP会员专属', category: 'avatar', price: 999, currency: 'gem', icon: '👑', rarity: 'legendary', subCategory: 'limited', limited: 'vip' },
      { id: 'avatar_event', name: '活动限定框', description: '限时活动，机不可失', category: 'avatar', price: 666, currency: 'gem', icon: '🎁', rarity: 'epic', subCategory: 'limited', limited: 'event' },

      // ========== 道具类 (10个) ==========
      { id: 'item_double_coin', name: '双倍金币卡', description: '下一场游戏获得双倍金币', category: 'item', price: 500, currency: 'coin', icon: '💰', rarity: 'common', effect: 'double_coin', duration: 1 },
      { id: 'item_xray', name: '透视卡', description: '可透视对手一张手牌', category: 'item', price: 800, currency: 'coin', icon: '👁️', rarity: 'rare', effect: 'xray', uses: 1 },
      { id: 'item_shield', name: '护盾卡', description: '免疫一次激怒效果', category: 'item', price: 600, currency: 'coin', icon: '🛡️', rarity: 'rare', effect: 'shield', uses: 1 },
      { id: 'item_speed', name: '加速卡', description: '出牌时间增加10秒', category: 'item', price: 300, currency: 'coin', icon: '⚡', rarity: 'common', effect: 'speed', duration: 1 },
      { id: 'item_reroll', name: '刷新卡', description: '重新抽取初始手牌', category: 'item', price: 400, currency: 'coin', icon: '🔄', rarity: 'common', effect: 'reroll', uses: 1 },
      { id: 'item_heal', name: '治疗卡', description: '恢复10点怒气值', category: 'item', price: 350, currency: 'coin', icon: '💊', rarity: 'common', effect: 'heal', amount: 10 },
      { id: 'item_bomb', name: '炸弹卡', description: '直接击败一层敌人', category: 'item', price: 1200, currency: 'coin', icon: '💣', rarity: 'epic', effect: 'bomb', uses: 1 },
      { id: 'item_freeze', name: '冰冻卡', description: '冻结对手一回合', category: 'item', price: 1000, currency: 'coin', icon: '🧊', rarity: 'epic', effect: 'freeze', duration: 1 },
      { id: 'item_clone', name: '克隆卡', description: '复制一张手牌', category: 'item', price: 900, currency: 'coin', icon: '📋', rarity: 'rare', effect: 'clone', uses: 1 },
      { id: 'item_steal', name: '偷窃卡', description: '偷取对手一张手牌', category: 'item', price: 1500, currency: 'coin', icon: '🤏', rarity: 'legendary', effect: 'steal', uses: 1 },

      // ========== 礼包类 (10个) ==========
      { id: 'pack_newbie', name: '新手礼包', description: '初入命运塔的最佳选择', category: 'pack', price: 60, currency: 'gem', icon: '🎁', rarity: 'common', subCategory: 'newbie', contents: { coins: 5000, gems: 100, items: ['item_double_coin', 'item_speed', 'item_heal'] } },
      { id: 'pack_weekly', name: '周礼包', description: '每周必买，物超所值', category: 'pack', price: 120, currency: 'gem', icon: '📦', rarity: 'rare', subCategory: 'weekly', contents: { coins: 10000, gems: 200, items: ['item_double_coin', 'item_xray', 'item_shield'] } },
      { id: 'pack_monthly', name: '月礼包', description: '月度巨献，豪华内容', category: 'pack', price: 388, currency: 'gem', icon: '🎉', rarity: 'epic', subCategory: 'monthly', contents: { coins: 50000, gems: 800, items: ['item_double_coin', 'item_xray', 'item_shield', 'item_bomb', 'item_clone'] } },
      { id: 'pack_spring', name: '春节礼包', description: '新春大吉，福气满满', category: 'pack', price: 188, currency: 'gem', icon: '🧧', rarity: 'epic', subCategory: 'festival', contents: { coins: 20000, gems: 388, skin: 'skin_springfestival' } },
      { id: 'pack_valentine', name: '情人节礼包', description: '爱在心口难开', category: 'pack', price: 168, currency: 'gem', icon: '💝', rarity: 'epic', subCategory: 'festival', contents: { coins: 15000, gems: 288, skin: 'skin_valentine' } },
      { id: 'pack_halloween', name: '万圣节礼包', description: '不给糖就捣蛋！', category: 'pack', price: 128, currency: 'gem', icon: '🎃', rarity: 'rare', subCategory: 'festival', contents: { coins: 12000, gems: 188, skin: 'skin_halloween' } },
      { id: 'pack_christmas', name: '圣诞礼包', description: '圣诞奇迹，礼物满屋', category: 'pack', price: 188, currency: 'gem', icon: '🎄', rarity: 'epic', subCategory: 'festival', contents: { coins: 20000, gems: 388, skin: 'skin_christmas' } },
      { id: 'pack_luxury', name: '豪华礼包', description: '土豪专属，应有尽有', category: 'pack', price: 648, currency: 'gem', icon: '💎', rarity: 'legendary', subCategory: 'luxury', contents: { coins: 100000, gems: 1688, items: ['item_steal', 'item_bomb', 'item_freeze', 'item_clone', 'item_xray'] } },
      { id: 'pack_starter', name: '启航礼包', description: '扬帆起航，开启征程', category: 'pack', price: 30, currency: 'gem', icon: '⛵', rarity: 'common', subCategory: 'starter', contents: { coins: 3000, gems: 50, items: ['item_speed'] } },
      { id: 'pack_anniversary', name: '周年庆礼包', description: '一周年纪念，感恩回馈', category: 'pack', price: 328, currency: 'gem', icon: '🎊', rarity: 'legendary', subCategory: 'anniversary', contents: { coins: 66666, gems: 666, skin: 'skin_springfestival', avatar: 'avatar_anniversary' } }
    ];

    // 添加创建时间和更新时间
    this.items.forEach(item => {
      item.createdAt = Date.now();
      item.updatedAt = Date.now();
    });
  }

  // ==================== 本地存储 ====================
  
  loadFromStorage() {
    try {
      const saved = localStorage.getItem('towerShop_data');
      if (saved) {
        const data = JSON.parse(saved);
        this.purchaseHistory = data.purchaseHistory || [];
        this.favorites = data.favorites || [];
        this.userInventory = new Set(data.userInventory || []);
        this.userCoins = data.userCoins || 10000;
        this.userGems = data.userGems || 500;
      }
    } catch (e) {
      console.warn('加载商店数据失败:', e);
    }
  }

  saveToStorage() {
    try {
      const data = {
        purchaseHistory: this.purchaseHistory,
        favorites: this.favorites,
        userInventory: Array.from(this.userInventory),
        userCoins: this.userCoins,
        userGems: this.userGems,
        lastSaved: Date.now()
      };
      localStorage.setItem('towerShop_data', JSON.stringify(data));
    } catch (e) {
      console.warn('保存商店数据失败:', e);
    }
  }

  // ==================== 限时折扣系统 ====================
  
  generateDailyDiscounts() {
    const discountRates = [0.7, 0.8, 0.85, 0.9];
    const discountedItems = [];
    
    // 随机选择5-8个商品打折
    const count = 5 + Math.floor(Math.random() * 4);
    const shuffled = [...this.items].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < count && i < shuffled.length; i++) {
      const item = shuffled[i];
      const discount = discountRates[Math.floor(Math.random() * discountRates.length)];
      this.discounts.set(item.id, {
        originalPrice: item.price,
        discountPrice: Math.floor(item.price * discount),
        discountRate: Math.floor((1 - discount) * 100),
        endTime: Date.now() + 24 * 60 * 60 * 1000 // 24小时后过期
      });
      discountedItems.push({ item, discount: this.discounts.get(item.id) });
    }
    
    return discountedItems;
  }

  getDiscountedItems() {
    const result = [];
    const now = Date.now();
    
    for (const [itemId, discount] of this.discounts) {
      if (discount.endTime > now) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
          result.push({ item, discount });
        }
      }
    }
    
    return result.sort((a, b) => b.discount.discountRate - a.discount.discountRate);
  }

  getDiscountInfo(itemId) {
    const discount = this.discounts.get(itemId);
    if (discount && discount.endTime > Date.now()) {
      return discount;
    }
    return null;
  }

  // ==================== 商品筛选 ====================
  
  filterItems(filters = {}) {
    let result = [...this.items];
    
    // 分类筛选
    if (filters.category && filters.category !== 'all') {
      result = result.filter(item => item.category === filters.category);
    }
    
    // 价格范围筛选
    if (filters.priceRange && filters.priceRange !== 'all') {
      const ranges = {
        'low': [0, 200],
        'medium': [200, 500],
        'high': [500, 1000],
        'premium': [1000, Infinity]
      };
      const [min, max] = ranges[filters.priceRange] || [0, Infinity];
      result = result.filter(item => item.price >= min && item.price < max);
    }
    
    // 稀有度筛选
    if (filters.rarity && filters.rarity !== 'all') {
      result = result.filter(item => item.rarity === filters.rarity);
    }
    
    // 搜索查询
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }
    
    // 排序
    if (filters.sortBy) {
      const sortOptions = {
        'price_asc': (a, b) => a.price - b.price,
        'price_desc': (a, b) => b.price - a.price,
        'rarity': (a, b) => {
          const rarityOrder = { 'legendary': 4, 'epic': 3, 'rare': 2, 'common': 1 };
          return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        },
        'name': (a, b) => a.name.localeCompare(b.name),
        'newest': (a, b) => b.createdAt - a.createdAt
      };
      if (sortOptions[filters.sortBy]) {
        result.sort(sortOptions[filters.sortBy]);
      }
    }
    
    return result;
  }

  searchItems(query) {
    return this.filterItems({ ...this.activeFilters, searchQuery: query });
  }

  getItemsByCategory(category) {
    return this.items.filter(item => item.category === category);
  }

  getItemsByRarity(rarity) {
    return this.items.filter(item => item.rarity === rarity);
  }

  // ==================== 推荐商品 ====================
  
  getRecommendedItems(count = 6) {
    const recommendations = [];
    const categories = ['skin', 'effect', 'cardback', 'avatar'];
    
    // 每个分类推荐1-2个
    categories.forEach(category => {
      const items = this.items.filter(i => i.category === category && !this.userInventory.has(i.id));
      if (items.length > 0) {
        const shuffled = items.sort(() => Math.random() - 0.5);
        recommendations.push(...shuffled.slice(0, 2));
      }
    });
    
    // 补充打折商品
    const discounted = this.getDiscountedItems();
    recommendations.push(...discounted.slice(0, 2).map(d => d.item));
    
    // 去重并随机排序
    const unique = [...new Map(recommendations.map(i => [i.id, i])).values()];
    return unique.sort(() => Math.random() - 0.5).slice(0, count);
  }

  getHotItems(count = 8) {
    // 基于购买历史的热门商品
    const purchaseCounts = {};
    this.purchaseHistory.forEach(purchase => {
      purchaseCounts[purchase.itemId] = (purchaseCounts[purchase.itemId] || 0) + 1;
    });
    
    return this.items
      .map(item => ({ item, count: purchaseCounts[item.id] || 0 }))
      .sort((a, b) => b.count - a.count)
      .slice(0, count)
      .map(i => i.item);
  }

  // ==================== 购买系统 ====================
  
  canAfford(item) {
    const discount = this.getDiscountInfo(item.id);
    const price = discount ? discount.discountPrice : item.price;
    
    if (item.currency === 'coin') {
      return this.userCoins >= price;
    } else if (item.currency === 'gem') {
      return this.userGems >= price;
    }
    return false;
  }

  getItemPrice(item) {
    const discount = this.getDiscountInfo(item.id);
    return discount ? discount.discountPrice : item.price;
  }

  purchase(itemId, quantity = 1) {
    const item = this.items.find(i => i.id === itemId);
    if (!item) {
      return { success: false, error: '商品不存在' };
    }
    
    if (this.userInventory.has(itemId)) {
      return { success: false, error: '已拥有该商品' };
    }
    
    const price = this.getItemPrice(item) * quantity;
    
    if (item.currency === 'coin') {
      if (this.userCoins < price) {
        return { success: false, error: '金币不足' };
      }
      this.userCoins -= price;
    } else if (item.currency === 'gem') {
      if (this.userGems < price) {
        return { success: false, error: '宝石不足' };
      }
      this.userGems -= price;
    }
    
    // 添加到库存
    this.userInventory.add(itemId);
    
    // 记录购买历史
    const purchase = {
      itemId: item.id,
      itemName: item.name,
      price: price,
      currency: item.currency,
      quantity: quantity,
      timestamp: Date.now()
    };
    this.purchaseHistory.unshift(purchase);
    
    // 保存数据
    this.saveToStorage();
    
    return { 
      success: true, 
      purchase,
      remainingCoins: this.userCoins,
      remainingGems: this.userGems
    };
  }

  purchaseMultiple(itemIds) {
    const results = [];
    let totalCostCoins = 0;
    let totalCostGems = 0;
    
    // 计算总价
    for (const itemId of itemIds) {
      const item = this.items.find(i => i.id === itemId);
      if (item && !this.userInventory.has(itemId)) {
        const price = this.getItemPrice(item);
        if (item.currency === 'coin') {
          totalCostCoins += price;
        } else {
          totalCostGems += price;
        }
      }
    }
    
    // 检查余额
    if (this.userCoins < totalCostCoins || this.userGems < totalCostGems) {
      return { success: false, error: '余额不足' };
    }
    
    // 执行购买
    for (const itemId of itemIds) {
      results.push(this.purchase(itemId));
    }
    
    return { success: true, results };
  }

  // ==================== 购买历史 ====================
  
  getPurchaseHistory(limit = 50) {
    return this.purchaseHistory.slice(0, limit);
  }

  getTotalSpent() {
    const coins = this.purchaseHistory
      .filter(p => p.currency === 'coin')
      .reduce((sum, p) => sum + p.price, 0);
    const gems = this.purchaseHistory
      .filter(p => p.currency === 'gem')
      .reduce((sum, p) => sum + p.price, 0);
    return { coins, gems };
  }

  // ==================== 收藏功能 ====================
  
  toggleFavorite(itemId) {
    const index = this.favorites.indexOf(itemId);
    if (index > -1) {
      this.favorites.splice(index, 1);
    } else {
      this.favorites.push(itemId);
    }
    this.saveToStorage();
    return this.favorites.includes(itemId);
  }

  isFavorite(itemId) {
    return this.favorites.includes(itemId);
  }

  getFavoriteItems() {
    return this.items.filter(item => this.favorites.includes(item.id));
  }

  // ==================== 库存管理 ====================
  
  getOwnedItems() {
    return this.items.filter(item => this.userInventory.has(item.id));
  }

  isOwned(itemId) {
    return this.userInventory.has(itemId);
  }

  getInventoryStats() {
    const stats = {
      total: this.items.length,
      owned: this.userInventory.size,
      byCategory: {},
      byRarity: {}
    };
    
    this.items.forEach(item => {
      if (!stats.byCategory[item.category]) {
        stats.byCategory[item.category] = { total: 0, owned: 0 };
      }
      stats.byCategory[item.category].total++;
      if (this.userInventory.has(item.id)) {
        stats.byCategory[item.category].owned++;
      }
      
      if (!stats.byRarity[item.rarity]) {
        stats.byRarity[item.rarity] = { total: 0, owned: 0 };
      }
      stats.byRarity[item.rarity].total++;
      if (this.userInventory.has(item.id)) {
        stats.byRarity[item.rarity].owned++;
      }
    });
    
    return stats;
  }

  // ==================== 货币管理 ====================
  
  addCoins(amount) {
    this.userCoins += amount;
    this.saveToStorage();
    return this.userCoins;
  }

  addGems(amount) {
    this.userGems += amount;
    this.saveToStorage();
    return this.userGems;
  }

  getBalance() {
    return { coins: this.userCoins, gems: this.userGems };
  }

  // ==================== 商品详情 ====================
  
  getItem(itemId) {
    return this.items.find(i => i.id === itemId);
  }

  getItemByName(name) {
    return this.items.find(i => i.name === name);
  }

  getAllItems() {
    return this.items;
  }

  // ==================== 统计信息 ====================
  
  getShopStats() {
    return {
      totalItems: this.items.length,
      byCategory: {
        skin: this.items.filter(i => i.category === 'skin').length,
        effect: this.items.filter(i => i.category === 'effect').length,
        cardback: this.items.filter(i => i.category === 'cardback').length,
        avatar: this.items.filter(i => i.category === 'avatar').length,
        item: this.items.filter(i => i.category === 'item').length,
        pack: this.items.filter(i => i.category === 'pack').length
      },
      byRarity: {
        common: this.items.filter(i => i.rarity === 'common').length,
        rare: this.items.filter(i => i.rarity === 'rare').length,
        epic: this.items.filter(i => i.rarity === 'epic').length,
        legendary: this.items.filter(i => i.rarity === 'legendary').length
      },
      discountedItems: this.getDiscountedItems().length,
      ownedItems: this.userInventory.size,
      totalPurchases: this.purchaseHistory.length
    };
  }

  // ==================== 购买确认弹窗 ====================
  
  showPurchaseConfirm(itemId, onConfirm, onCancel) {
    const item = this.getItem(itemId);
    if (!item) return;
    
    const discount = this.getDiscountInfo(itemId);
    const currentPrice = discount ? discount.discountPrice : item.price;
    
    const confirmData = {
      item,
      originalPrice: item.price,
      currentPrice,
      discount: discount ? discount.discountRate : 0,
      canAfford: this.canAfford(item),
      balance: this.getBalance()
    };
    
    // 返回确认数据，由UI层显示弹窗
    return confirmData;
  }

  // ==================== 刷新折扣 ====================
  
  refreshDiscounts() {
    this.discounts.clear();
    return this.generateDailyDiscounts();
  }

  // ==================== 导出/导入 ====================
  
  exportData() {
    return {
      items: this.items,
      purchaseHistory: this.purchaseHistory,
      favorites: this.favorites,
      userInventory: Array.from(this.userInventory),
      userCoins: this.userCoins,
      userGems: this.userGems,
      exportTime: Date.now()
    };
  }

  importData(data) {
    if (data.purchaseHistory) this.purchaseHistory = data.purchaseHistory;
    if (data.favorites) this.favorites = data.favorites;
    if (data.userInventory) this.userInventory = new Set(data.userInventory);
    if (data.userCoins !== undefined) this.userCoins = data.userCoins;
    if (data.userGems !== undefined) this.userGems = data.userGems;
    this.saveToStorage();
  }
}

// ==================== UI渲染类 ====================

class ShopUI {
  constructor(shop) {
    this.shop = shop;
    this.currentView = 'grid'; // grid, list
    this.selectedItem = null;
  }

  // 渲染商品卡片
  renderItemCard(item) {
    const discount = this.shop.getDiscountInfo(item.id);
    const isOwned = this.shop.isOwned(item.id);
    const isFavorite = this.shop.isFavorite(item.id);
    const canAfford = this.shop.canAfford(item);
    
    const rarityColors = {
      common: '#888',
      rare: '#4a9eff',
      epic: '#a855f7',
      legendary: '#fbbf24'
    };
    
    const rarityNames = {
      common: '普通',
      rare: '稀有',
      epic: '史诗',
      legendary: '传说'
    };

    return `
      <div class="shop-item ${item.rarity} ${isOwned ? 'owned' : ''}" data-id="${item.id}">
        <div class="item-header">
          <span class="item-icon">${item.icon}</span>
          <button class="favorite-btn ${isFavorite ? 'active' : ''}" data-id="${item.id}">
            ${isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
        <div class="item-content">
          <h3 class="item-name">${item.name}</h3>
          <p class="item-desc">${item.description}</p>
          <span class="item-rarity" style="color: ${rarityColors[item.rarity]}">
            ${rarityNames[item.rarity]}
          </span>
        </div>
        <div class="item-footer">
          ${discount ? `
            <div class="price-discount">
              <span class="original-price">${item.price} ${item.currency === 'coin' ? '🪙' : '💎'}</span>
              <span class="discount-tag">-${discount.discountRate}%</span>
            </div>
            <div class="current-price">${discount.discountPrice} ${item.currency === 'coin' ? '🪙' : '💎'}</div>
          ` : `
            <div class="current-price">${item.price} ${item.currency === 'coin' ? '🪙' : '💎'}</div>
          `}
          ${isOwned ? 
            '<button class="btn-owned" disabled>已拥有</button>' : 
            `<button class="btn-buy ${!canAfford ? 'disabled' : ''}" data-id="${item.id}">
              ${canAfford ? '购买' : '余额不足'}
            </button>`
          }
        </div>
      </div>
    `;
  }

  // 渲染商品列表
  renderItemList(items) {
    if (items.length === 0) {
      return '<div class="empty-state">暂无符合条件的商品</div>';
    }
    
    return `
      <div class="shop-grid">
        ${items.map(item => this.renderItemCard(item)).join('')}
      </div>
    `;
  }

  // 渲染分类筛选器
  renderCategoryFilter() {
    const categories = [
      { id: 'all', name: '全部', icon: '📦' },
      { id: 'skin', name: '皮肤', icon: '👕' },
      { id: 'effect', name: '特效', icon: '✨' },
      { id: 'cardback', name: '卡背', icon: '🃏' },
      { id: 'avatar', name: '头像框', icon: '🖼️' },
      { id: 'item', name: '道具', icon: '🎒' },
      { id: 'pack', name: '礼包', icon: '🎁' }
    ];
    
    return `
      <div class="category-filter">
        ${categories.map(cat => `
          <button class="filter-btn ${this.shop.activeFilters.category === cat.id ? 'active' : ''}" 
                  data-category="${cat.id}">
            <span>${cat.icon}</span>
            <span>${cat.name}</span>
          </button>
        `).join('')}
      </div>
    `;
  }

  // 渲染排序和筛选
  renderSortAndFilter() {
    return `
      <div class="sort-filter-bar">
        <div class="search-box">
          <input type="text" id="shop-search" placeholder="搜索商品..." value="${this.shop.searchQuery}">
          <button class="search-btn">🔍</button>
        </div>
        <div class="filter-dropdowns">
          <select id="price-filter">
            <option value="all">所有价格</option>
            <option value="low">低价 (0-200)</option>
            <option value="medium">中价 (200-500)</option>
            <option value="high">高价 (500-1000)</option>
            <option value="premium">豪华 (1000+)</option>
          </select>
          <select id="rarity-filter">
            <option value="all">所有稀有度</option>
            <option value="common">普通</option>
            <option value="rare">稀有</option>
            <option value="epic">史诗</option>
            <option value="legendary">传说</option>
          </select>
          <select id="sort-by">
            <option value="default">默认排序</option>
            <option value="price_asc">价格从低到高</option>
            <option value="price_desc">价格从高到低</option>
            <option value="rarity">稀有度</option>
            <option value="name">名称</option>
            <option value="newest">最新</option>
          </select>
        </div>
      </div>
    `;
  }

  // 渲染推荐商品
  renderRecommendedItems() {
    const recommended = this.shop.getRecommendedItems(6);
    return `
      <div class="recommended-section">
        <h2>🌟 推荐商品</h2>
        <div class="recommended-grid">
          ${recommended.map(item => this.renderItemCard(item)).join('')}
        </div>
      </div>
    `;
  }

  // 渲染限时折扣
  renderDiscountedItems() {
    const discounted = this.shop.getDiscountedItems();
    if (discounted.length === 0) return '';
    
    return `
      <div class="discount-section">
        <h2>⏰ 限时特惠</h2>
        <div class="discount-countdown">距结束还有 23:59:59</div>
        <div class="discount-grid">
          ${discounted.slice(0, 4).map(({ item, discount }) => this.renderItemCard(item)).join('')}
        </div>
      </div>
    `;
  }

  // 渲染购买确认弹窗
  renderPurchaseModal(item) {
    const discount = this.shop.getDiscountInfo(item.id);
    const currentPrice = discount ? discount.discountPrice : item.price;
    const balance = this.shop.getBalance();
    const canAfford = this.shop.canAfford(item);
    
    const rarityNames = {
      common: '普通',
      rare: '稀有', 
      epic: '史诗',
      legendary: '传说'
    };

    return `
      <div class="purchase-modal-overlay" id="purchase-modal">
        <div class="purchase-modal">
          <button class="modal-close">&times;</button>
          <div class="modal-content">
            <div class="item-preview">
              <span class="preview-icon">${item.icon}</span>
              <h3>${item.name}</h3>
              <span class="preview-rarity ${item.rarity}">${rarityNames[item.rarity]}</span>
            </div>
            <div class="item-details">
              <p>${item.description}</p>
              <div class="price-info">
                ${discount ? `
                  <div class="discount-info">
                    <span class="original">原价: ${item.price} ${item.currency === 'coin' ? '🪙' : '💎'}</span>
                    <span class="discount-badge">-${discount.discountRate}%</span>
                  </div>
                ` : ''}
                <div class="final-price">
                  <span>现价: </span>
                  <span class="price-value">${currentPrice} ${item.currency === 'coin' ? '🪙' : '💎'}</span>
                </div>
              </div>
              <div class="balance-info">
                <span>当前余额: </span>
                <span class="balance-value">
                  ${item.currency === 'coin' ? `${balance.coins} 🪙` : `${balance.gems} 💎`}
                </span>
              </div>
              ${!canAfford ? '<div class="insufficient-funds">余额不足，请充值</div>' : ''}
            </div>
            <div class="modal-actions">
              <button class="btn-cancel">取消</button>
              <button class="btn-confirm ${!canAfford ? 'disabled' : ''}" ${!canAfford ? 'disabled' : ''}>
                确认购买
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // 渲染购买历史
  renderPurchaseHistory() {
    const history = this.shop.getPurchaseHistory(20);
    
    if (history.length === 0) {
      return '<div class="empty-history">暂无购买记录</div>';
    }
    
    return `
      <div class="purchase-history">
        <h3>购买历史</h3>
        <div class="history-list">
          ${history.map(purchase => `
            <div class="history-item">
              <div class="history-info">
                <span class="history-name">${purchase.itemName}</span>
                <span class="history-time">${this.formatTime(purchase.timestamp)}</span>
              </div>
              <div class="history-price">
                <span>-${purchase.price} ${purchase.currency === 'coin' ? '🪙' : '💎'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // 渲染完整商店界面
  renderShop() {
    const items = this.shop.filterItems(this.shop.activeFilters);
    const stats = this.shop.getShopStats();
    const balance = this.shop.getBalance();
    
    return `
      <div class="tower-shop">
        <header class="shop-header">
          <h1>🏪 命运塔商店</h1>
          <div class="balance-display">
            <span class="coin-balance">🪙 ${balance.coins.toLocaleString()}</span>
            <span class="gem-balance">💎 ${balance.gems.toLocaleString()}</span>
          </div>
        </header>
        
        ${this.renderDiscountedItems()}
        ${this.renderRecommendedItems()}
        
        <div class="shop-main">
          ${this.renderCategoryFilter()}
          ${this.renderSortAndFilter()}
          
          <div class="shop-stats">
            <span>共 ${items.length} 件商品</span>
            <span>已拥有 ${stats.ownedItems}/${stats.totalItems}</span>
          </div>
          
          ${this.renderItemList(items)}
        </div>
        
        <aside class="shop-sidebar">
          ${this.renderPurchaseHistory()}
        </aside>
      </div>
    `;
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  }
}

// ==================== CSS样式 ====================

const shopStyles = `
<style>
/* 商店整体样式 */
.tower-shop {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Microsoft YaHei', sans-serif;
  color: #fff;
  background: linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 50%, #0d1b2a 100%);
  min-height: 100vh;
}

/* 头部 */
.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.shop-header h1 {
  margin: 0;
  font-size: 1.8em;
  background: linear-gradient(45deg, #ffd700, #ff6b6b);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.balance-display {
  display: flex;
  gap: 20px;
  font-size: 1.2em;
  font-weight: bold;
}

.coin-balance { color: #fbbf24; }
.gem-balance { color: #a855f7; }

/* 限时特惠 */
.discount-section {
  background: linear-gradient(135deg, rgba(255, 107, 107, 0.2), rgba(255, 215, 0, 0.2));
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 107, 107, 0.3);
}

.discount-section h2 {
  margin: 0 0 10px 0;
  color: #ff6b6b;
}

.discount-countdown {
  color: #ffd700;
  font-size: 1.1em;
  margin-bottom: 15px;
}

.discount-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

/* 推荐商品 */
.recommended-section {
  background: rgba(255, 215, 0, 0.1);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.recommended-section h2 {
  margin: 0 0 15px 0;
  color: #ffd700;
}

.recommended-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
}

/* 分类筛选 */
.category-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-btn:hover, .filter-btn.active {
  background: linear-gradient(45deg, #ffd700, #ff6b6b);
  border-color: #ffd700;
  transform: translateY(-2px);
}

/* 排序和搜索 */
.sort-filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 5px;
}

.search-box input {
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  width: 250px;
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-btn {
  padding: 10px 15px;
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  cursor: pointer;
}

.filter-dropdowns {
  display: flex;
  gap: 10px;
}

.filter-dropdowns select {
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
}

.filter-dropdowns select option {
  background: #1a1a3e;
}

/* 商品网格 */
.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

/* 商品卡片 */
.shop-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
}

.shop-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.shop-item.common { border-color: rgba(136, 136, 136, 0.3); }
.shop-item.rare { border-color: rgba(74, 158, 255, 0.3); }
.shop-item.epic { border-color: rgba(168, 85, 247, 0.3); }
.shop-item.legendary { 
  border-color: rgba(251, 191, 36, 0.5);
  box-shadow: 0 0 20px rgba(251, 191, 36, 0.2);
}

.shop-item.owned {
  opacity: 0.6;
  filter: grayscale(0.5);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
}

.item-icon {
  font-size: 2.5em;
}

.favorite-btn {
  background: none;
  border: none;
  font-size: 1.5em;
  cursor: pointer;
  transition: transform 0.2s;
}

.favorite-btn:hover {
  transform: scale(1.2);
}

.item-content {
  padding: 15px;
  flex: 1;
}

.item-name {
  margin: 0 0 8px 0;
  font-size: 1.1em;
  color: #fff;
}

.item-desc {
  margin: 0 0 10px 0;
  font-size: 0.85em;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
}

.item-rarity {
  font-size: 0.8em;
  font-weight: bold;
  text-transform: uppercase;
}

.item-footer {
  padding: 15px;
  background: rgba(0, 0, 0, 0.2);
}

.price-discount {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 5px;
}

.original-price {
  text-decoration: line-through;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9em;
}

.discount-tag {
  background: #ff6b6b;
  color: #fff;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75em;
  font-weight: bold;
}

.current-price {
  font-size: 1.3em;
  font-weight: bold;
  color: #ffd700;
  margin-bottom: 10px;
}

.btn-buy, .btn-owned {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-buy {
  background: linear-gradient(45deg, #ffd700, #ffaa00);
  color: #000;
}

.btn-buy:hover:not(.disabled) {
  transform: scale(1.02);
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.4);
}

.btn-buy.disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.btn-owned {
  background: rgba(100, 255, 100, 0.2);
  color: #6f6;
  cursor: default;
}

/* 统计信息 */
.shop-stats {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  margin-bottom: 15px;
  color: rgba(255, 255, 255, 0.7);
}

/* 购买历史 */
.shop-sidebar {
  margin-top: 30px;
}

.purchase-history {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
}

.purchase-history h3 {
  margin: 0 0 15px 0;
  color: #ffd700;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 300px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.history-name {
  font-weight: bold;
}

.history-time {
  font-size: 0.8em;
  color: rgba(255, 255, 255, 0.5);
  margin-left: 10px;
}

.history-price {
  color: #ff6b6b;
  font-weight: bold;
}

.empty-state, .empty-history {
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.5);
}

/* 购买确认弹窗 */
.purchase-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.purchase-modal {
  background: linear-gradient(135deg, #1a1a3e, #0d1b2a);
  border-radius: 20px;
  padding: 30px;
  max-width: 400px;
  width: 90%;
  border: 1px solid rgba(255, 215, 0, 0.3);
  position: relative;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  color: #fff;
  font-size: 1.5em;
  cursor: pointer;
}

.item-preview {
  text-align: center;
  margin-bottom: 20px;
}

.preview-icon {
  font-size: 4em;
  display: block;
  margin-bottom: 10px;
}

.preview-rarity {
  display: inline-block;
  padding: 5px 15px;
  border-radius: 20px;
  font-size: 0.9em;
  font-weight: bold;
  margin-top: 10px;
}

.preview-rarity.common { background: rgba(136, 136, 136, 0.3); }
.preview-rarity.rare { background: rgba(74, 158, 255, 0.3); }
.preview-rarity.epic { background: rgba(168, 85, 247, 0.3); color: #d8b4fe; }
.preview-rarity.legendary { background: rgba(251, 191, 36, 0.3); color: #fcd34d; }

.item-details {
  text-align: center;
  margin-bottom: 20px;
}

.price-info {
  margin: 15px 0;
}

.discount-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
}

.discount-badge {
  background: #ff6b6b;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.final-price {
  font-size: 1.5em;
  font-weight: bold;
  color: #ffd700;
}

.balance-info {
  color: rgba(255, 255, 255, 0.7);
}

.insufficient-funds {
  color: #ff6b6b;
  margin-top: 10px;
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-actions button {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.btn-confirm {
  background: linear-gradient(45deg, #ffd700, #ffaa00);
  color: #000;
}

.btn-confirm.disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 768px) {
  .shop-grid, .discount-grid, .recommended-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .sort-filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .filter-dropdowns {
    flex-wrap: wrap;
  }
  
  .shop-header {
    flex-direction: column;
    gap: 15px;
  }
}
</style>
`;

// ==================== 初始化函数 ====================

function initShop() {
  // 创建全局商店实例
  window.towerShop = new TowerShop();
  window.shopUI = new ShopUI(window.towerShop);
  
  console.log('🏪 命运塔商店已初始化');
  console.log('📊 商品统计:', window.towerShop.getShopStats());
  
  return window.towerShop;
}

// 如果在浏览器环境中，自动初始化
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShop);
  } else {
    initShop();
  }
}

// ==================== 导出模块 ====================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TowerShop, ShopUI, shopStyles };
}

// ES模块导出
export { TowerShop, ShopUI, shopStyles };
