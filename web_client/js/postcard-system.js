/**
 * 命运塔 - 明信片系统
 * Postcard System for Tower of Fate
 * 
 * 功能：
 * 1. 196个国家明信片管理
 * 2. 特殊明信片（冠军/亚军/季军）
 * 3. 明信片获取与展示
 * 4. 3D翻转效果展示
 * 5. 收集进度统计
 */

// ==================== 国家数据 ====================
const POSTCARD_DATA = {
    // 亚洲 (49个国家)
    'CN': { country: '中国', tower: '东方明珠', region: 'asia', rarity: 'common', acquiredAt: null },
    'JP': { country: '日本', tower: '东京塔', region: 'asia', rarity: 'common', acquiredAt: null },
    'KR': { country: '韩国', tower: 'N塔', region: 'asia', rarity: 'common', acquiredAt: null },
    'IN': { country: '印度', tower: '印度门', region: 'asia', rarity: 'common', acquiredAt: null },
    'ID': { country: '印度尼西亚', tower: '民族独立纪念碑', region: 'asia', rarity: 'common', acquiredAt: null },
    'TH': { country: '泰国', tower: '黎明寺', region: 'asia', rarity: 'common', acquiredAt: null },
    'VN': { country: '越南', tower: '河内旗台', region: 'asia', rarity: 'common', acquiredAt: null },
    'MY': { country: '马来西亚', tower: '双子塔', region: 'asia', rarity: 'common', acquiredAt: null },
    'PH': { country: '菲律宾', tower: '圣地亚哥堡', region: 'asia', rarity: 'common', acquiredAt: null },
    'SG': { country: '新加坡', tower: '滨海湾金沙', region: 'asia', rarity: 'rare', acquiredAt: null },
    'KH': { country: '柬埔寨', tower: '吴哥窟', region: 'asia', rarity: 'common', acquiredAt: null },
    'MM': { country: '缅甸', tower: '仰光大金塔', region: 'asia', rarity: 'common', acquiredAt: null },
    'LA': { country: '老挝', tower: '塔銮', region: 'asia', rarity: 'common', acquiredAt: null },
    'BN': { country: '文莱', tower: '奥马尔清真寺', region: 'asia', rarity: 'rare', acquiredAt: null },
    'TW': { country: '中国台湾', tower: '台北101', region: 'asia', rarity: 'common', acquiredAt: null },
    'HK': { country: '中国香港', tower: '天际100', region: 'asia', rarity: 'common', acquiredAt: null },
    'MO': { country: '中国澳门', tower: '澳门塔', region: 'asia', rarity: 'rare', acquiredAt: null },
    'MN': { country: '蒙古', tower: '成吉思汗广场', region: 'asia', rarity: 'common', acquiredAt: null },
    'KP': { country: '朝鲜', tower: '主体思想塔', region: 'asia', rarity: 'epic', acquiredAt: null },
    'NP': { country: '尼泊尔', tower: '博达哈大佛塔', region: 'asia', rarity: 'common', acquiredAt: null },
    'BT': { country: '不丹', tower: '虎穴寺', region: 'asia', rarity: 'rare', acquiredAt: null },
    'BD': { country: '孟加拉', tower: '国家议会大厦', region: 'asia', rarity: 'common', acquiredAt: null },
    'LK': { country: '斯里兰卡', tower: '狮子岩', region: 'asia', rarity: 'common', acquiredAt: null },
    'MV': { country: '马尔代夫', tower: '伊斯兰中心', region: 'asia', rarity: 'rare', acquiredAt: null },
    'PK': { country: '巴基斯坦', tower: '费萨尔清真寺', region: 'asia', rarity: 'common', acquiredAt: null },
    'AF': { country: '阿富汗', tower: '喀布尔电视塔', region: 'asia', rarity: 'epic', acquiredAt: null },
    'IR': { country: '伊朗', tower: '阿扎迪塔', region: 'asia', rarity: 'common', acquiredAt: null },
    'IQ': { country: '伊拉克', tower: '巴格达塔', region: 'asia', rarity: 'epic', acquiredAt: null },
    'IL': { country: '以色列', tower: '哭墙', region: 'asia', rarity: 'rare', acquiredAt: null },
    'JO': { country: '约旦', tower: '佩特拉古城', region: 'asia', rarity: 'rare', acquiredAt: null },
    'LB': { country: '黎巴嫩', tower: '穆罕默德·阿明清真寺', region: 'asia', rarity: 'rare', acquiredAt: null },
    'SY': { country: '叙利亚', tower: '倭马亚大清真寺', region: 'asia', rarity: 'epic', acquiredAt: null },
    'YE': { country: '也门', tower: '萨利赫大清真寺', region: 'asia', rarity: 'epic', acquiredAt: null },
    'OM': { country: '阿曼', tower: '苏丹卡布斯大清真寺', region: 'asia', rarity: 'rare', acquiredAt: null },
    'AE': { country: '阿联酋', tower: '哈利法塔', region: 'asia', rarity: 'rare', acquiredAt: null },
    'QA': { country: '卡塔尔', tower: '伊斯兰艺术博物馆', region: 'asia', rarity: 'rare', acquiredAt: null },
    'BH': { country: '巴林', tower: '世贸中心', region: 'asia', rarity: 'rare', acquiredAt: null },
    'KW': { country: '科威特', tower: '科威特塔', region: 'asia', rarity: 'rare', acquiredAt: null },
    'SA': { country: '沙特阿拉伯', tower: '麦加大清真寺', region: 'asia', rarity: 'rare', acquiredAt: null },
    'TR': { country: '土耳其', tower: '蓝色清真寺', region: 'asia', rarity: 'common', acquiredAt: null },
    'GE': { country: '格鲁吉亚', tower: '第比利斯圣三一大教堂', region: 'asia', rarity: 'rare', acquiredAt: null },
    'AM': { country: '亚美尼亚', tower: '埃奇米阿津教堂', region: 'asia', rarity: 'rare', acquiredAt: null },
    'AZ': { country: '阿塞拜疆', tower: '少女塔', region: 'asia', rarity: 'rare', acquiredAt: null },
    'KZ': { country: '哈萨克斯坦', tower: '巴伊杰列克塔', region: 'asia', rarity: 'common', acquiredAt: null },
    'UZ': { country: '乌兹别克斯坦', tower: '雷吉斯坦广场', region: 'asia', rarity: 'common', acquiredAt: null },
    'KG': { country: '吉尔吉斯斯坦', tower: '阿拉套广场', region: 'asia', rarity: 'rare', acquiredAt: null },
    'TJ': { country: '塔吉克斯坦', tower: '索莫尼广场', region: 'asia', rarity: 'rare', acquiredAt: null },
    'TM': { country: '土库曼斯坦', tower: '中立门', region: 'asia', rarity: 'epic', acquiredAt: null },

    // 欧洲 (44个国家)
    'FR': { country: '法国', tower: '埃菲尔铁塔', region: 'europe', rarity: 'common', acquiredAt: null },
    'DE': { country: '德国', tower: '柏林电视塔', region: 'europe', rarity: 'common', acquiredAt: null },
    'IT': { country: '意大利', tower: '比萨斜塔', region: 'europe', rarity: 'common', acquiredAt: null },
    'ES': { country: '西班牙', tower: '圣家堂', region: 'europe', rarity: 'common', acquiredAt: null },
    'PT': { country: '葡萄牙', tower: '贝伦塔', region: 'europe', rarity: 'common', acquiredAt: null },
    'GB': { country: '英国', tower: '大本钟', region: 'europe', rarity: 'common', acquiredAt: null },
    'IE': { country: '爱尔兰', tower: '都柏林尖塔', region: 'europe', rarity: 'rare', acquiredAt: null },
    'NL': { country: '荷兰', tower: '风车村', region: 'europe', rarity: 'common', acquiredAt: null },
    'BE': { country: '比利时', tower: '原子球塔', region: 'europe', rarity: 'common', acquiredAt: null },
    'CH': { country: '瑞士', tower: '马特洪峰', region: 'europe', rarity: 'rare', acquiredAt: null },
    'AT': { country: '奥地利', tower: '圣斯蒂芬大教堂', region: 'europe', rarity: 'common', acquiredAt: null },
    'SE': { country: '瑞典', tower: '斯德哥尔摩市政厅', region: 'europe', rarity: 'common', acquiredAt: null },
    'NO': { country: '挪威', tower: '维京船博物馆', region: 'europe', rarity: 'rare', acquiredAt: null },
    'DK': { country: '丹麦', tower: '美人鱼雕像', region: 'europe', rarity: 'common', acquiredAt: null },
    'FI': { country: '芬兰', tower: '赫尔辛基大教堂', region: 'europe', rarity: 'common', acquiredAt: null },
    'IS': { country: '冰岛', tower: '哈尔格林姆斯教堂', region: 'europe', rarity: 'epic', acquiredAt: null },
    'PL': { country: '波兰', tower: '华沙科学文化宫', region: 'europe', rarity: 'common', acquiredAt: null },
    'CZ': { country: '捷克', tower: '天文钟', region: 'europe', rarity: 'common', acquiredAt: null },
    'SK': { country: '斯洛伐克', tower: '布拉迪斯拉发城堡', region: 'europe', rarity: 'rare', acquiredAt: null },
    'HU': { country: '匈牙利', tower: '国会大厦', region: 'europe', rarity: 'common', acquiredAt: null },
    'RO': { country: '罗马尼亚', tower: '议会宫', region: 'europe', rarity: 'common', acquiredAt: null },
    'BG': { country: '保加利亚', tower: '亚历山大·涅夫斯基大教堂', region: 'europe', rarity: 'common', acquiredAt: null },
    'GR': { country: '希腊', tower: '帕特农神庙', region: 'europe', rarity: 'common', acquiredAt: null },
    'AL': { country: '阿尔巴尼亚', tower: '斯坎德培广场', region: 'europe', rarity: 'epic', acquiredAt: null },
    'RS': { country: '塞尔维亚', tower: '圣萨瓦大教堂', region: 'europe', rarity: 'rare', acquiredAt: null },
    'HR': { country: '克罗地亚', tower: '杜布罗夫尼克老城', region: 'europe', rarity: 'rare', acquiredAt: null },
    'SI': { country: '斯洛文尼亚', tower: '卢布尔雅那城堡', region: 'europe', rarity: 'rare', acquiredAt: null },
    'BA': { country: '波黑', tower: '莫斯塔尔古桥', region: 'europe', rarity: 'rare', acquiredAt: null },
    'ME': { country: '黑山', tower: '科托尔老城', region: 'europe', rarity: 'epic', acquiredAt: null },
    'MK': { country: '北马其顿', tower: '亚历山大雕像', region: 'europe', rarity: 'epic', acquiredAt: null },
    'EE': { country: '爱沙尼亚', tower: '塔林老城', region: 'europe', rarity: 'rare', acquiredAt: null },
    'LV': { country: '拉脱维亚', tower: '自由纪念碑', region: 'europe', rarity: 'rare', acquiredAt: null },
    'LT': { country: '立陶宛', tower: '格季米纳斯塔', region: 'europe', rarity: 'rare', acquiredAt: null },
    'BY': { country: '白俄罗斯', tower: '胜利广场', region: 'europe', rarity: 'rare', acquiredAt: null },
    'UA': { country: '乌克兰', tower: '独立广场', region: 'europe', rarity: 'common', acquiredAt: null },
    'MD': { country: '摩尔多瓦', tower: '圣诞大教堂', region: 'europe', rarity: 'epic', acquiredAt: null },
    'RU': { country: '俄罗斯', tower: '克里姆林宫', region: 'europe', rarity: 'common', acquiredAt: null },
    'MC': { country: '摩纳哥', tower: '摩纳哥大教堂', region: 'europe', rarity: 'legendary', acquiredAt: null },
    'LI': { country: '列支敦士登', tower: '瓦杜兹城堡', region: 'europe', rarity: 'legendary', acquiredAt: null },
    'SM': { country: '圣马力诺', tower: '瓜伊塔塔', region: 'europe', rarity: 'legendary', acquiredAt: null },
    'AD': { country: '安道尔', tower: '山谷石屋', region: 'europe', rarity: 'legendary', acquiredAt: null },
    'VA': { country: '梵蒂冈', tower: '圣彼得大教堂', region: 'europe', rarity: 'legendary', acquiredAt: null },
    'MT': { country: '马耳他', tower: '圣约翰大教堂', region: 'europe', rarity: 'rare', acquiredAt: null },
    'CY': { country: '塞浦路斯', tower: '帕福斯考古遗址', region: 'europe', rarity: 'rare', acquiredAt: null },
    'LU': { country: '卢森堡', tower: '大峡谷', region: 'europe', rarity: 'rare', acquiredAt: null },

    // 北美洲 (23个国家)
    'US': { country: '美国', tower: '自由女神像', region: 'americas', rarity: 'common', acquiredAt: null },
    'CA': { country: '加拿大', tower: 'CN塔', region: 'americas', rarity: 'common', acquiredAt: null },
    'MX': { country: '墨西哥', tower: '太阳金字塔', region: 'americas', rarity: 'common', acquiredAt: null },
    'CU': { country: '古巴', tower: '哈瓦那大教堂', region: 'americas', rarity: 'rare', acquiredAt: null },
    'JM': { country: '牙买加', tower: '达芳大宅', region: 'americas', rarity: 'rare', acquiredAt: null },
    'HT': { country: '海地', tower: '国家宫殿', region: 'americas', rarity: 'epic', acquiredAt: null },
    'DO': { country: '多米尼加', tower: '哥伦布灯塔', region: 'americas', rarity: 'rare', acquiredAt: null },
    'PR': { country: '波多黎各', tower: '莫罗城堡', region: 'americas', rarity: 'rare', acquiredAt: null },
    'GT': { country: '危地马拉', tower: '蒂卡尔金字塔', region: 'americas', rarity: 'rare', acquiredAt: null },
    'BZ': { country: '伯利兹', tower: '卡拉克穆尔', region: 'americas', rarity: 'epic', acquiredAt: null },
    'SV': { country: '萨尔瓦多', tower: '圣萨尔瓦多大教堂', region: 'americas', rarity: 'epic', acquiredAt: null },
    'HN': { country: '洪都拉斯', tower: '科潘遗址', region: 'americas', rarity: 'epic', acquiredAt: null },
    'NI': { country: '尼加拉瓜', tower: '莱昂大教堂', region: 'americas', rarity: 'epic', acquiredAt: null },
    'CR': { country: '哥斯达黎加', tower: '国家剧院', region: 'americas', rarity: 'rare', acquiredAt: null },
    'PA': { country: '巴拿马', tower: '巴拿马运河', region: 'americas', rarity: 'rare', acquiredAt: null },
    'BS': { country: '巴哈马', tower: '天堂岛', region: 'americas', rarity: 'legendary', acquiredAt: null },
    'BB': { country: '巴巴多斯', tower: '议会大厦', region: 'americas', rarity: 'legendary', acquiredAt: null },
    'TT': { country: '特立尼达和多巴哥', tower: '总统府', region: 'americas', rarity: 'legendary', acquiredAt: null },
    'GD': { country: '格林纳达', tower: '乔治堡', region: 'americas', rarity: 'legendary', acquiredAt: null },
    'LC': { country: '圣卢西亚', tower: '苏弗里耶尔火山', region: 'americas', rarity: 'legendary', acquiredAt: null },
    'VC': { country: '圣文森特和格林纳丁斯', tower: '夏洛特堡', region: 'americas', rarity: 'legendary', acquiredAt: null },
    'AG': { country: '安提瓜和巴布达', tower: '纳尔逊船坞', region: 'americas', rarity: 'legendary', acquiredAt: null },
    'DM': { country: '多米尼克', tower: '沸湖', region: 'americas', rarity: 'legendary', acquiredAt: null },

    // 南美洲 (12个国家)
    'BR': { country: '巴西', tower: '基督救世主像', region: 'americas', rarity: 'common', acquiredAt: null },
    'AR': { country: '阿根廷', tower: '方尖碑', region: 'americas', rarity: 'common', acquiredAt: null },
    'CL': { country: '智利', tower: '圣克里斯托瓦尔山', region: 'americas', rarity: 'common', acquiredAt: null },
    'PE': { country: '秘鲁', tower: '马丘比丘', region: 'americas', rarity: 'common', acquiredAt: null },
    'CO': { country: '哥伦比亚', tower: '盐矿大教堂', region: 'americas', rarity: 'common', acquiredAt: null },
    'VE': { country: '委内瑞拉', tower: '天使瀑布', region: 'americas', rarity: 'rare', acquiredAt: null },
    'EC': { country: '厄瓜多尔', tower: '赤道纪念碑', region: 'americas', rarity: 'rare', acquiredAt: null },
    'BO': { country: '玻利维亚', tower: '乌尤尼盐湖', region: 'americas', rarity: 'rare', acquiredAt: null },
    'PY': { country: '巴拉圭', tower: '独立之家', region: 'americas', rarity: 'epic', acquiredAt: null },
    'UY': { country: '乌拉圭', tower: '萨尔沃宫', region: 'americas', rarity: 'rare', acquiredAt: null },
    'GY': { country: '圭亚那', tower: '凯厄图尔瀑布', region: 'americas', rarity: 'legendary', acquiredAt: null },
    'SR': { country: '苏里南', tower: '总统宫', region: 'americas', rarity: 'legendary', acquiredAt: null },

    // 非洲 (54个国家)
    'EG': { country: '埃及', tower: '吉萨金字塔', region: 'africa', rarity: 'common', acquiredAt: null },
    'ZA': { country: '南非', tower: '桌山', region: 'africa', rarity: 'common', acquiredAt: null },
    'NG': { country: '尼日利亚', tower: '国家清真寺', region: 'africa', rarity: 'common', acquiredAt: null },
    'KE': { country: '肯尼亚', tower: '肯尼亚山', region: 'africa', rarity: 'common', acquiredAt: null },
    'ET': { country: '埃塞俄比亚', tower: '拉利贝拉岩石教堂', region: 'africa', rarity: 'rare', acquiredAt: null },
    'GH': { country: '加纳', tower: '独立广场', region: 'africa', rarity: 'common', acquiredAt: null },
    'TZ': { country: '坦桑尼亚', tower: '乞力马扎罗山', region: 'africa', rarity: 'rare', acquiredAt: null },
    'UG': { country: '乌干达', tower: '卡苏比王陵', region: 'africa', rarity: 'epic', acquiredAt: null },
    'DZ': { country: '阿尔及利亚', tower: '非洲圣母院', region: 'africa', rarity: 'common', acquiredAt: null },
    'MA': { country: '摩洛哥', tower: '哈桑二世清真寺', region: 'africa', rarity: 'common', acquiredAt: null },
    'TN': { country: '突尼斯', tower: '迦太基遗址', region: 'africa', rarity: 'common', acquiredAt: null },
    'LY': { country: '利比亚', tower: '莱普蒂斯马格纳', region: 'africa', rarity: 'epic', acquiredAt: null },
    'SD': { country: '苏丹', tower: '麦罗埃金字塔', region: 'africa', rarity: 'epic', acquiredAt: null },
    'ZW': { country: '津巴布韦', tower: '大津巴布韦遗址', region: 'africa', rarity: 'rare', acquiredAt: null },
    'ZM': { country: '赞比亚', tower: '维多利亚瀑布', region: 'africa', rarity: 'rare', acquiredAt: null },
    'MW': { country: '马拉维', tower: '马拉维湖', region: 'africa', rarity: 'epic', acquiredAt: null },
    'MZ': { country: '莫桑比克', tower: '马普托要塞', region: 'africa', rarity: 'epic', acquiredAt: null },
    'BW': { country: '博茨瓦纳', tower: '奥卡万戈三角洲', region: 'africa', rarity: 'epic', acquiredAt: null },
    'NA': { country: '纳米比亚', tower: '红沙漠', region: 'africa', rarity: 'rare', acquiredAt: null },
    'AO': { country: '安哥拉', tower: '鲁安达要塞', region: 'africa', rarity: 'epic', acquiredAt: null },
    'CD': { country: '刚果(金)', tower: '金沙萨纪念碑', region: 'africa', rarity: 'epic', acquiredAt: null },
    'CG': { country: '刚果(布)', tower: '布拉柴纪念碑', region: 'africa', rarity: 'epic', acquiredAt: null },
    'GA': { country: '加蓬', tower: '自由雕像', region: 'africa', rarity: 'epic', acquiredAt: null },
    'GQ': { country: '赤道几内亚', tower: '马拉博大教堂', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'CM': { country: '喀麦隆', tower: '林贝火山', region: 'africa', rarity: 'epic', acquiredAt: null },
    'CF': { country: '中非', tower: '博冈达博物馆', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'TD': { country: '乍得', tower: '恩贾梅纳大教堂', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'NE': { country: '尼日尔', tower: '阿加德兹清真寺', region: 'africa', rarity: 'epic', acquiredAt: null },
    'ML': { country: '马里', tower: '杰内大清真寺', region: 'africa', rarity: 'epic', acquiredAt: null },
    'BF': { country: '布基纳法索', tower: '瓦加杜古纪念碑', region: 'africa', rarity: 'epic', acquiredAt: null },
    'SN': { country: '塞内加尔', tower: '非洲复兴纪念碑', region: 'africa', rarity: 'rare', acquiredAt: null },
    'GM': { country: '冈比亚', tower: '拱门22', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'GW': { country: '几内亚比绍', tower: '比绍港', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'GN': { country: '几内亚', tower: '科纳克里大清真寺', region: 'africa', rarity: 'epic', acquiredAt: null },
    'SL': { country: '塞拉利昂', tower: '棉花树', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'LR': { country: '利比里亚', tower: '自由大厦', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'CI': { country: '科特迪瓦', tower: '和平圣母大教堂', region: 'africa', rarity: 'epic', acquiredAt: null },
    'TG': { country: '多哥', tower: '洛美大教堂', region: 'africa', rarity: 'epic', acquiredAt: null },
    'BJ': { country: '贝宁', tower: '阿波美皇宫', region: 'africa', rarity: 'epic', acquiredAt: null },
    'MR': { country: '毛里塔尼亚', tower: '欣盖提古城', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'EH': { country: '西撒哈拉', tower: '阿尤恩大教堂', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'ER': { country: '厄立特里亚', tower: '阿斯马拉大教堂', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'DJ': { country: '吉布提', tower: '哈姆林清真寺', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'SO': { country: '索马里', tower: '摩加迪沙大教堂', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'RW': { country: '卢旺达', tower: '基加利会议中心', region: 'africa', rarity: 'epic', acquiredAt: null },
    'BI': { country: '布隆迪', tower: '鲁蒙盖纪念碑', region: 'africa', rarity: 'legendary', acquiredAt: null },
    'SS': { country: '南苏丹', tower: '约翰·加朗陵墓', region: 'africa', rarity: 'legendary', acquiredAt: null },

    // 大洋洲 (14个国家)
    'AU': { country: '澳大利亚', tower: '悉尼歌剧院', region: 'oceania', rarity: 'common', acquiredAt: null },
    'NZ': { country: '新西兰', tower: '天空塔', region: 'oceania', rarity: 'common', acquiredAt: null },
    'FJ': { country: '斐济', tower: '苏瓦大教堂', region: 'oceania', rarity: 'rare', acquiredAt: null },
    'PG': { country: '巴布亚新几内亚', tower: '议会大厦', region: 'oceania', rarity: 'rare', acquiredAt: null },
    'SB': { country: '所罗门群岛', tower: '霍尼亚拉大教堂', region: 'oceania', rarity: 'epic', acquiredAt: null },
    'VU': { country: '瓦努阿图', tower: '亚苏尔火山', region: 'oceania', rarity: 'epic', acquiredAt: null },
    'WS': { country: '萨摩亚', tower: '钟楼', region: 'oceania', rarity: 'legendary', acquiredAt: null },
    'TO': { country: '汤加', tower: '努库阿洛法王宫', region: 'oceania', rarity: 'legendary', acquiredAt: null },
    'KI': { country: '基里巴斯', tower: '塔拉瓦纪念碑', region: 'oceania', rarity: 'legendary', acquiredAt: null },
    'TV': { country: '图瓦卢', tower: '富纳富提教堂', region: 'oceania', rarity: 'legendary', acquiredAt: null },
    'NR': { country: '瑙鲁', tower: '议会大厦', region: 'oceania', rarity: 'legendary', acquiredAt: null },
    'PW': { country: '帕劳', tower: '巨石阵', region: 'oceania', rarity: 'legendary', acquiredAt: null },
    'MH': { country: '马绍尔群岛', tower: '马朱罗教堂', region: 'oceania', rarity: 'legendary', acquiredAt: null },
    'FM': { country: '密克罗尼西亚', tower: '波纳佩巨石城', region: 'oceania', rarity: 'legendary', acquiredAt: null },

    // 特殊明信片
    'WINNER_GOLD': { 
        type: 'champion', 
        name: '冠军明信片', 
        description: '锦标赛冠军专属',
        rarity: 'legendary',
        icon: '🥇',
        acquiredAt: null 
    },
    'WINNER_SILVER': { 
        type: 'runner', 
        name: '亚军明信片', 
        description: '锦标赛亚军专属',
        rarity: 'epic',
        icon: '🥈',
        acquiredAt: null 
    },
    'WINNER_BRONZE': { 
        type: 'third', 
        name: '季军明信片', 
        description: '锦标赛季军专属',
        rarity: 'rare',
        icon: '🥉',
        acquiredAt: null 
    },
    'PARTICIPANT': {
        type: 'participant',
        name: '完赛明信片',
        description: '参加锦标赛并完赛',
        rarity: 'common',
        icon: '🏁',
        acquiredAt: null
    },
    'ASIA_MASTER': {
        type: 'achievement',
        name: '亚洲征服者',
        description: '集齐亚洲所有国家明信片',
        rarity: 'legendary',
        icon: '🌏',
        acquiredAt: null
    },
    'EUROPE_MASTER': {
        type: 'achievement',
        name: '欧洲征服者',
        description: '集齐欧洲所有国家明信片',
        rarity: 'legendary',
        icon: '🌍',
        acquiredAt: null
    },
    'AMERICAS_MASTER': {
        type: 'achievement',
        name: '美洲征服者',
        description: '集齐美洲所有国家明信片',
        rarity: 'legendary',
        icon: '🌎',
        acquiredAt: null
    },
    'AFRICA_MASTER': {
        type: 'achievement',
        name: '非洲征服者',
        description: '集齐非洲所有国家明信片',
        rarity: 'legendary',
        icon: '🦁',
        acquiredAt: null
    },
    'OCEANIA_MASTER': {
        type: 'achievement',
        name: '大洋洲征服者',
        description: '集齐大洋洲所有国家明信片',
        rarity: 'legendary',
        icon: '🐨',
        acquiredAt: null
    },
    'WORLD_TRAVELER': {
        type: 'achievement',
        name: '环球旅行者',
        description: '集齐所有196个国家明信片',
        rarity: 'mythic',
        icon: '🌐',
        acquiredAt: null
    }
};

// 地区统计
const REGION_STATS = {
    asia: { name: '亚洲', total: 49 },
    europe: { name: '欧洲', total: 44 },
    americas: { name: '美洲', total: 35 },
    africa: { name: '非洲', total: 54 },
    oceania: { name: '大洋洲', total: 14 }
};

// 稀有度配置
const RARITY_CONFIG = {
    common: { name: '普通', color: '#9e9e9e', chance: 0.6 },
    rare: { name: '稀有', color: '#4fc3f7', chance: 0.25 },
    epic: { name: '史诗', color: '#ba68c8', chance: 0.12 },
    legendary: { name: '传说', color: '#ffd700', chance: 0.03 },
    mythic: { name: '神话', color: '#ff5722', chance: 0 }
};

// ==================== 用户明信片管理 ====================
class PostcardSystem {
    constructor() {
        this.userPostcards = this.loadUserPostcards();
        this.onUpdateCallbacks = [];
    }

    // 从本地存储加载
    loadUserPostcards() {
        const saved = localStorage.getItem('towerOfFate_postcards');
        return saved ? JSON.parse(saved) : {};
    }

    // 保存到本地存储
    saveUserPostcards() {
        localStorage.setItem('towerOfFate_postcards', JSON.stringify(this.userPostcards));
    }

    // 获取明信片
    acquirePostcard(countryCode, tournamentResult = null) {
        const postcard = POSTCARD_DATA[countryCode];
        if (!postcard) {
            console.warn(`未知明信片代码: ${countryCode}`);
            return null;
        }

        // 检查是否已拥有
        const isNew = !this.userPostcards[countryCode];
        
        // 记录获取时间和相关信息
        this.userPostcards[countryCode] = {
            code: countryCode,
            acquiredAt: new Date().toISOString(),
            tournamentResult: tournamentResult,
            viewCount: 0,
            isNew: isNew
        };

        // 检查大洲成就
        this.checkContinentAchievements();

        // 保存
        this.saveUserPostcards();

        // 触发更新回调
        this.notifyUpdate();

        return {
            ...postcard,
            isNew: isNew,
            userData: this.userPostcards[countryCode]
        };
    }

    // 根据锦标赛结果发放明信片
    acquireFromTournamentResult(result) {
        const acquired = [];

        // 参与明信片
        if (result.completed) {
            const participant = this.acquirePostcard('PARTICIPANT', result);
            if (participant.isNew) acquired.push(participant);
        }

        // 冠军/亚军/季军明信片
        if (result.rank === 1) {
            const gold = this.acquirePostcard('WINNER_GOLD', result);
            if (gold.isNew) acquired.push(gold);
        } else if (result.rank === 2) {
            const silver = this.acquirePostcard('WINNER_SILVER', result);
            if (silver.isNew) acquired.push(silver);
        } else if (result.rank === 3) {
            const bronze = this.acquirePostcard('WINNER_BRONZE', result);
            if (bronze.isNew) acquired.push(bronze);
        }

        // 国家明信片
        if (result.countryCode) {
            const country = this.acquirePostcard(result.countryCode, result);
            if (country.isNew) acquired.push(country);
        }

        return acquired;
    }

    // 检查大洲成就
    checkContinentAchievements() {
        const continentCodes = {
            'ASIA_MASTER': 'asia',
            'EUROPE_MASTER': 'europe',
            'AMERICAS_MASTER': 'americas',
            'AFRICA_MASTER': 'africa',
            'OCEANIA_MASTER': 'oceania'
        };

        for (const [achievementCode, region] of Object.entries(continentCodes)) {
            if (this.hasCompletedRegion(region) && !this.userPostcards[achievementCode]) {
                this.acquirePostcard(achievementCode);
            }
        }

        // 检查环球旅行者
        const totalCountries = Object.values(REGION_STATS).reduce((sum, r) => sum + r.total, 0);
        if (this.getCollectedCount() >= totalCountries && !this.userPostcards['WORLD_TRAVELER']) {
            this.acquirePostcard('WORLD_TRAVELER');
        }
    }

    // 检查是否完成某个大洲
    hasCompletedRegion(region) {
        const regionCodes = Object.keys(POSTCARD_DATA).filter(code => 
            POSTCARD_DATA[code].region === region
        );
        return regionCodes.every(code => this.userPostcards[code]);
    }

    // 获取收集统计
    getCollectionStats() {
        const stats = {
            total: 0,
            byRegion: {},
            byRarity: {}
        };

        // 初始化统计
        Object.keys(REGION_STATS).forEach(region => {
            stats.byRegion[region] = { collected: 0, total: REGION_STATS[region].total };
        });
        Object.keys(RARITY_CONFIG).forEach(rarity => {
            stats.byRarity[rarity] = { collected: 0, total: 0 };
        });

        // 统计总数
        Object.keys(POSTCARD_DATA).forEach(code => {
            const postcard = POSTCARD_DATA[code];
            if (postcard.region) {
                stats.total++;
                if (postcard.rarity) {
                    stats.byRarity[postcard.rarity].total++;
                }
            }
        });

        // 统计已收集
        Object.keys(this.userPostcards).forEach(code => {
            const postcard = POSTCARD_DATA[code];
            if (postcard) {
                if (postcard.region && stats.byRegion[postcard.region]) {
                    stats.byRegion[postcard.region].collected++;
                }
                if (postcard.rarity && stats.byRarity[postcard.rarity]) {
                    stats.byRarity[postcard.rarity].collected++;
                }
            }
        });

        return stats;
    }

    // 获取已收集数量
    getCollectedCount() {
        return Object.keys(this.userPostcards).filter(code => 
            POSTCARD_DATA[code] && POSTCARD_DATA[code].region
        ).length;
    }

    // 获取所有明信片列表
    getAllPostcards() {
        return Object.keys(POSTCARD_DATA).map(code => ({
            code,
            ...POSTCARD_DATA[code],
            isCollected: !!this.userPostcards[code],
            userData: this.userPostcards[code] || null
        }));
    }

    // 按地区获取明信片
    getPostcardsByRegion(region) {
        return Object.keys(POSTCARD_DATA)
            .filter(code => POSTCARD_DATA[code].region === region)
            .map(code => ({
                code,
                ...POSTCARD_DATA[code],
                isCollected: !!this.userPostcards[code],
                userData: this.userPostcards[code] || null
            }));
    }

    // 标记为已查看
    markAsViewed(code) {
        if (this.userPostcards[code]) {
            this.userPostcards[code].viewCount = (this.userPostcards[code].viewCount || 0) + 1;
            this.userPostcards[code].isNew = false;
            this.saveUserPostcards();
        }
    }

    // 注册更新回调
    onUpdate(callback) {
        this.onUpdateCallbacks.push(callback);
    }

    // 通知更新
    notifyUpdate() {
        this.onUpdateCallbacks.forEach(callback => callback(this.getCollectionStats()));
    }

    // 获取新获得明信片数量
    getNewCount() {
        return Object.values(this.userPostcards).filter(p => p.isNew).length;
    }

    // 获取最近获得的明信片
    getRecentPostcards(limit = 10) {
        return Object.entries(this.userPostcards)
            .sort((a, b) => new Date(b[1].acquiredAt) - new Date(a[1].acquiredAt))
            .slice(0, limit)
            .map(([code, data]) => ({
                code,
                ...POSTCARD_DATA[code],
                userData: data
            }));
    }
}

// ==================== 3D展示系统 ====================
class PostcardGallery {
    constructor(containerId, postcardSystem) {
        this.container = document.getElementById(containerId);
        this.postcardSystem = postcardSystem;
        this.currentFilter = 'all';
        this.selectedPostcard = null;
    }

    // 初始化展示
    init() {
        this.render();
        this.postcardSystem.onUpdate(() => this.render());
    }

    // 渲染明信片册
    render() {
        if (!this.container) return;

        const postcards = this.getFilteredPostcards();
        const stats = this.postcardSystem.getCollectionStats();
        const totalCountries = Object.values(REGION_STATS).reduce((sum, r) => sum + r.total, 0);
        const collected = this.postcardSystem.getCollectedCount();

        this.container.innerHTML = `
            <div class="postcard-header">
                <h2>📮 明信片收藏册 (${collected}/${totalCountries})</h2>
                <div class="postcard-filters">
                    <button class="filter-btn ${this.currentFilter === 'all' ? 'active' : ''}" 
                            onclick="postcardGallery.setFilter('all')">全部</button>
                    <button class="filter-btn ${this.currentFilter === 'collected' ? 'active' : ''}" 
                            onclick="postcardGallery.setFilter('collected')">已收集</button>
                    <button class="filter-btn ${this.currentFilter === 'unCollected' ? 'active' : ''}" 
                            onclick="postcardGallery.setFilter('unCollected')">未收集</button>
                </div>
            </div>
            
            <div class="region-stats">
                ${Object.entries(stats.byRegion).map(([region, data]) => `
                    <div class="region-stat">
                        <span class="region-name">${REGION_STATS[region].name}</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${(data.collected / data.total * 100).toFixed(1)}%"></div>
                        </div>
                        <span class="region-count">${data.collected}/${data.total}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="postcard-grid">
                ${postcards.map(postcard => this.createPostcardHTML(postcard)).join('')}
            </div>
            
            ${this.selectedPostcard ? this.createDetailModal() : ''}
        `;

        this.attachEventListeners();
    }

    // 创建明信片HTML
    createPostcardHTML(postcard) {
        const rarity = RARITY_CONFIG[postcard.rarity] || RARITY_CONFIG.common;
        const isCollected = postcard.isCollected;
        
        return `
            <div class="postcard-item ${isCollected ? 'collected' : 'locked'} ${postcard.userData?.isNew ? 'new' : ''}"
                 data-code="${postcard.code}"
                 onclick="postcardGallery.showDetail('${postcard.code}')">
                <div class="postcard-3d">
                    <div class="postcard-front">
                        <div class="postcard-image" style="border-color: ${rarity.color}">
                            ${isCollected ? `
                                <div class="tower-icon">${this.getTowerEmoji(postcard.code)}</div>
                                <div class="country-flag">${this.getFlagEmoji(postcard.code)}</div>
                            ` : '<div class="locked-icon">❓</div>'}
                        </div>
                        <div class="postcard-info">
                            <div class="postcard-country">${isCollected ? postcard.country : '???'}</div>
                            <div class="postcard-tower">${isCollected ? postcard.tower : '未解锁'}</div>
                            ${isCollected ? `<div class="postcard-rarity" style="color: ${rarity.color}">${rarity.name}</div>` : ''}
                        </div>
                        ${postcard.userData?.isNew ? '<div class="new-badge">NEW</div>' : ''}
                    </div>
                </div>
            </div>
        `;
    }

    // 获取旗帜emoji
    getFlagEmoji(countryCode) {
        const codePoints = countryCode
            .slice(0, 2)
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt());
        return String.fromCodePoint(...codePoints);
    }

    // 获取塔emoji
    getTowerEmoji(countryCode) {
        const towerEmojis = {
            'CN': '🗼', 'JP': '🗼', 'FR': '🗼', 'US': '🗽', 'EG': '🔺',
            'GB': '🕐', 'IT': '📐', 'DE': '📡', 'RU': '🏰', 'IN': '🕌'
        };
        return towerEmojis[countryCode] || '🏛️';
    }

    // 创建详情弹窗
    createDetailModal() {
        const postcard = this.selectedPostcard;
        const rarity = RARITY_CONFIG[postcard.rarity] || RARITY_CONFIG.common;
        
        return `
            <div class="postcard-modal" onclick="postcardGallery.closeDetail()">
                <div class="postcard-modal-content" onclick="event.stopPropagation()">
                    <button class="modal-close" onclick="postcardGallery.closeDetail()">×</button>
                    <div class="postcard-detail">
                        <div class="postcard-large" style="border-color: ${rarity.color}; box-shadow: 0 0 30px ${rarity.color}40">
                            <div class="tower-icon large">${this.getTowerEmoji(postcard.code)}</div>
                            <div class="country-flag large">${this.getFlagEmoji(postcard.code)}</div>
                        </div>
                        <div class="detail-info">
                            <h3>${postcard.country}</h3>
                            <p class="tower-name">${postcard.tower}</p>
                            <p class="rarity-badge" style="background: ${rarity.color}">${rarity.name}</p>
                            ${postcard.userData ? `
                                <p class="acquired-date">获得时间: ${new Date(postcard.userData.acquiredAt).toLocaleString()}</p>
                                <p class="view-count">查看次数: ${postcard.userData.viewCount || 0}</p>
                            ` : ''}
                            <button class="share-btn" onclick="shareSystem.sharePostcard('${postcard.code}')">
                                📤 炫耀明信片
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 显示详情
    showDetail(code) {
        const allPostcards = this.postcardSystem.getAllPostcards();
        this.selectedPostcard = allPostcards.find(p => p.code === code);
        if (this.selectedPostcard && this.selectedPostcard.isCollected) {
            this.postcardSystem.markAsViewed(code);
        }
        this.render();
    }

    // 关闭详情
    closeDetail() {
        this.selectedPostcard = null;
        this.render();
    }

    // 设置筛选
    setFilter(filter) {
        this.currentFilter = filter;
        this.render();
    }

    // 获取筛选后的明信片
    getFilteredPostcards() {
        const all = this.postcardSystem.getAllPostcards().filter(p => p.region);
        switch (this.currentFilter) {
            case 'collected':
                return all.filter(p => p.isCollected);
            case 'unCollected':
                return all.filter(p => !p.isCollected);
            default:
                return all;
        }
    }

    // 附加事件监听
    attachEventListeners() {
        // 3D翻转效果
        const cards = this.container.querySelectorAll('.postcard-item.collected');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.querySelector('.postcard-3d').style.transform = 'rotateY(10deg)';
            });
            card.addEventListener('mouseleave', () => {
                card.querySelector('.postcard-3d').style.transform = 'rotateY(0deg)';
            });
        });
    }
}

// ==================== 初始化 ====================
let postcardSystem;
let postcardGallery;

function initPostcardSystem() {
    postcardSystem = new PostcardSystem();
    
    // 如果有容器，初始化展示
    const galleryContainer = document.getElementById('postcardGallery');
    if (galleryContainer) {
        postcardGallery = new PostcardGallery('postcardGallery', postcardSystem);
        postcardGallery.init();
    }
    
    return postcardSystem;
}

// 导出
window.PostcardSystem = PostcardSystem;
window.PostcardGallery = PostcardGallery;
window.postcardSystem = postcardSystem;
window.postcardGallery = postcardGallery;
window.initPostcardSystem = initPostcardSystem;
window.POSTCARD_DATA = POSTCARD_DATA;
window.REGION_STATS = REGION_STATS;
window.RARITY_CONFIG = RARITY_CONFIG;
