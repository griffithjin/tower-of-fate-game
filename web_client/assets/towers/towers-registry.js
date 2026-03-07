/**
 * 命运之塔 - 塔图片资产注册表
 * Tower of Fate - Tower Assets Registry
 * 
 * 包含70个世界著名塔/地标图片
 * Contains 70 world famous tower/landmark images
 */

const TOWERS_REGISTRY = {
  // 亚洲 (Asia) - 23个
  asia: [
    { id: 'burj-khalifa', name: '哈利法塔', nameEn: 'Burj Khalifa', country: '阿联酋', countryEn: 'UAE', city: '迪拜', filename: 'burj-khalifa.png', continent: 'asia' },
    { id: 'oriental-pearl', name: '东方明珠', nameEn: 'Oriental Pearl Tower', country: '中国', countryEn: 'China', city: '上海', filename: 'oriental-pearl.png', continent: 'asia' },
    { id: 'tokyo-tower', name: '东京塔', nameEn: 'Tokyo Tower', country: '日本', countryEn: 'Japan', city: '东京', filename: 'tokyo-tower.png', continent: 'asia' },
    { id: 'petronas', name: '双子塔', nameEn: 'Petronas Towers', country: '马来西亚', countryEn: 'Malaysia', city: '吉隆坡', filename: 'petronas.png', continent: 'asia' },
    { id: 'taj-mahal', name: '泰姬陵', nameEn: 'Taj Mahal', country: '印度', countryEn: 'India', city: '阿格拉', filename: 'taj-mahal.png', continent: 'asia' },
    { id: 'angkor-wat', name: '吴哥窟', nameEn: 'Angkor Wat', country: '柬埔寨', countryEn: 'Cambodia', city: '暹粒', filename: 'angkor-wat.png', continent: 'asia' },
    { id: 'blue-mosque', name: '蓝色清真寺', nameEn: 'Blue Mosque', country: '土耳其', countryEn: 'Turkey', city: '伊斯坦布尔', filename: 'blue-mosque.png', continent: 'asia' },
    { id: 'grand-palace', name: '大皇宫', nameEn: 'Grand Palace', country: '泰国', countryEn: 'Thailand', city: '曼谷', filename: 'grand-palace.png', continent: 'asia' },
    { id: 'borobudur', name: '婆罗浮屠', nameEn: 'Borobudur', country: '印度尼西亚', countryEn: 'Indonesia', city: '日惹', filename: 'borobudur.png', continent: 'asia' },
    { id: 'shwedagon', name: '仰光大金塔', nameEn: 'Shwedagon Pagoda', country: '缅甸', countryEn: 'Myanmar', city: '仰光', filename: 'shwedagon.png', continent: 'asia' },
    { id: 'n-tower', name: 'N首尔塔', nameEn: 'N Seoul Tower', country: '韩国', countryEn: 'South Korea', city: '首尔', filename: 'n-tower.png', continent: 'asia' },
    { id: 'marina-bay', name: '滨海湾金沙', nameEn: 'Marina Bay Sands', country: '新加坡', countryEn: 'Singapore', city: '新加坡', filename: 'marina-bay.png', continent: 'asia' },
    { id: 'sagrada-familia', name: '圣家堂', nameEn: 'Sagrada Familia', country: '西班牙', countryEn: 'Spain', city: '巴塞罗那', filename: 'sagrada-familia.png', continent: 'europe' },
    { id: 'sky-tower', name: '天空塔', nameEn: 'Sky Tower', country: '新西兰', countryEn: 'New Zealand', city: '奥克兰', filename: 'sky-tower.png', continent: 'oceania' },
    { id: 'patuxai', name: '凯旋门', nameEn: 'Patuxai', country: '老挝', countryEn: 'Laos', city: '万象', filename: 'patuxai.png', continent: 'asia' },
    { id: 'sava-temple', name: '萨瓦寺', nameEn: 'Sava Temple', country: '泰国', countryEn: 'Thailand', city: '清迈', filename: 'sava-temple.png', continent: 'asia' },
    { id: 'lalibela', name: '拉利贝拉', nameEn: 'Lalibela', country: '埃塞俄比亚', countryEn: 'Ethiopia', city: '拉利贝拉', filename: 'lalibela.png', continent: 'africa' },
    { id: 'doha-museum', name: '伊斯兰艺术博物馆', nameEn: 'Museum of Islamic Art', country: '卡塔尔', countryEn: 'Qatar', city: '多哈', filename: 'doha-museum.png', continent: 'asia' },
    { id: 'kyiv', name: '圣索菲亚大教堂', nameEn: "Saint Sophia's Cathedral", country: '乌克兰', countryEn: 'Ukraine', city: '基辅', filename: 'kyiv.png', continent: 'europe' },
    { id: 'imam-square', name: '伊玛目广场', nameEn: 'Imam Square', country: '伊朗', countryEn: 'Iran', city: '伊斯法罕', filename: 'imam-square.png', continent: 'asia' },
    { id: 'jerusalem', name: '耶路撒冷', nameEn: 'Jerusalem', country: '以色列', countryEn: 'Israel', city: '耶路撒冷', filename: 'jerusalem.png', continent: 'asia' },
    { id: 'petra', name: '佩特拉古城', nameEn: 'Petra', country: '约旦', countryEn: 'Jordan', city: '佩特拉', filename: 'petra.png', continent: 'asia' },
    { id: 'cn-tower', name: '加拿大国家电视塔', nameEn: 'CN Tower', country: '加拿大', countryEn: 'Canada', city: '多伦多', filename: 'cn-tower.png', continent: 'north-america' },
  ],

  // 欧洲 (Europe) - 20个
  europe: [
    { id: 'eiffel-tower', name: '埃菲尔铁塔', nameEn: 'Eiffel Tower', country: '法国', countryEn: 'France', city: '巴黎', filename: 'eiffel-tower.png', continent: 'europe' },
    { id: 'big-ben', name: '大本钟', nameEn: 'Big Ben', country: '英国', countryEn: 'UK', city: '伦敦', filename: 'big-ben.png', continent: 'europe' },
    { id: 'pisa-tower', name: '比萨斜塔', nameEn: 'Leaning Tower of Pisa', country: '意大利', countryEn: 'Italy', city: '比萨', filename: 'pisa-tower.png', continent: 'europe' },
    { id: 'brandenburg-gate', name: '勃兰登堡门', nameEn: 'Brandenburg Gate', country: '德国', countryEn: 'Germany', city: '柏林', filename: 'brandenburg-gate.png', continent: 'europe' },
    { id: 'prague', name: '布拉格城堡', nameEn: 'Prague Castle', country: '捷克', countryEn: 'Czech Republic', city: '布拉格', filename: 'prague.png', continent: 'europe' },
    { id: 'budapest', name: '布达佩斯议会', nameEn: 'Hungarian Parliament', country: '匈牙利', countryEn: 'Hungary', city: '布达佩斯', filename: 'budapest.png', continent: 'europe' },
    { id: 'bratislava', name: '布拉迪斯拉发城堡', nameEn: 'Bratislava Castle', country: '斯洛伐克', countryEn: 'Slovakia', city: '布拉迪斯拉发', filename: 'bratislava.png', continent: 'europe' },
    { id: 'vienna-opera', name: '维也纳歌剧院', nameEn: 'Vienna State Opera', country: '奥地利', countryEn: 'Austria', city: '维也纳', filename: 'vienna-opera.png', continent: 'europe' },
    { id: 'matterhorn', name: '马特洪峰', nameEn: 'Matterhorn', country: '瑞士', countryEn: 'Switzerland', city: '采尔马特', filename: 'matterhorn.png', continent: 'europe' },
    { id: 'windmill', name: '荷兰风车', nameEn: 'Dutch Windmill', country: '荷兰', countryEn: 'Netherlands', city: '阿姆斯特丹', filename: 'windmill.png', continent: 'europe' },
    { id: 'parthenon', name: '帕特农神庙', nameEn: 'Parthenon', country: '希腊', countryEn: 'Greece', city: '雅典', filename: 'parthenon.png', continent: 'europe' },
    { id: 'copenhagen', name: '小美人鱼', nameEn: 'Little Mermaid', country: '丹麦', countryEn: 'Denmark', city: '哥本哈根', filename: 'copenhagen.png', continent: 'europe' },
    { id: 'stockholm', name: '斯德哥尔摩市政厅', nameEn: 'Stockholm City Hall', country: '瑞典', countryEn: 'Sweden', city: '斯德哥尔摩', filename: 'stockholm.png', continent: 'europe' },
    { id: 'warsaw', name: '华沙老城', nameEn: 'Warsaw Old Town', country: '波兰', countryEn: 'Poland', city: '华沙', filename: 'warsaw.png', continent: 'europe' },
    { id: 'bran-castle', name: '布兰城堡', nameEn: 'Bran Castle', country: '罗马尼亚', countryEn: 'Romania', city: '布拉索夫', filename: 'bran-castle.png', continent: 'europe' },
    { id: 'rila', name: '里拉修道院', nameEn: 'Rila Monastery', country: '保加利亚', countryEn: 'Bulgaria', city: '里拉', filename: 'rila.png', continent: 'europe' },
    { id: 'st-basil', name: '圣瓦西里大教堂', nameEn: "Saint Basil's Cathedral", country: '俄罗斯', countryEn: 'Russia', city: '莫斯科', filename: 'st-basil.png', continent: 'europe' },
    { id: 'dubrovnik', name: '杜布罗夫尼克', nameEn: 'Dubrovnik', country: '克罗地亚', countryEn: 'Croatia', city: '杜布罗夫尼克', filename: 'dubrovnik.png', continent: 'europe' },
    { id: 'cliffs-of-moher', name: '莫赫悬崖', nameEn: 'Cliffs of Moher', country: '爱尔兰', countryEn: 'Ireland', city: '克莱尔郡', filename: 'cliffs-of-moher.png', continent: 'europe' },
    { id: 'fjord', name: '挪威峡湾', nameEn: 'Norwegian Fjords', country: '挪威', countryEn: 'Norway', city: '卑尔根', filename: 'fjord.png', continent: 'europe' },
  ],

  // 北美洲 (North America) - 10个
  'north-america': [
    { id: 'empire-state', name: '帝国大厦', nameEn: 'Empire State Building', country: '美国', countryEn: 'USA', city: '纽约', filename: 'empire-state.png', continent: 'north-america' },
    { id: 'statue-of-liberty', name: '自由女神像', nameEn: 'Statue of Liberty', country: '美国', countryEn: 'USA', city: '纽约', filename: 'statue-of-liberty.png', continent: 'north-america' },
    { id: 'panama-canal', name: '巴拿马运河', nameEn: 'Panama Canal', country: '巴拿马', countryEn: 'Panama', city: '巴拿马城', filename: 'panama-canal.png', continent: 'north-america' },
    { id: 'ha-long-bay', name: '下龙湾', nameEn: 'Ha Long Bay', country: '越南', countryEn: 'Vietnam', city: '下龙市', filename: 'ha-long-bay.png', continent: 'asia' },
  ],

  // 南美洲 (South America) - 8个
  'south-america': [
    { id: 'christ-redeemer', name: '基督像', nameEn: 'Christ the Redeemer', country: '巴西', countryEn: 'Brazil', city: '里约热内卢', filename: 'christ-redeemer.png', continent: 'south-america' },
    { id: 'machu-picchu', name: '马丘比丘', nameEn: 'Machu Picchu', country: '秘鲁', countryEn: 'Peru', city: '库斯科', filename: 'machu-picchu.png', continent: 'south-america' },
    { id: 'easter-island', name: '复活节岛', nameEn: 'Easter Island', country: '智利', countryEn: 'Chile', city: '复活节岛', filename: 'easter-island.png', continent: 'south-america' },
    { id: 'arenal', name: '阿雷纳火山', nameEn: 'Arenal Volcano', country: '哥斯达黎加', countryEn: 'Costa Rica', city: '福图纳', filename: 'arenal.png', continent: 'north-america' },
  ],

  // 非洲 (Africa) - 9个
  africa: [
    { id: 'pyramids', name: '金字塔', nameEn: 'Great Pyramids', country: '埃及', countryEn: 'Egypt', city: '开罗', filename: 'pyramids.png', continent: 'africa' },
    { id: 'kilimanjaro', name: '乞力马扎罗山', nameEn: 'Mount Kilimanjaro', country: '坦桑尼亚', countryEn: 'Tanzania', city: '莫希', filename: 'kilimanjaro.png', continent: 'africa' },
    { id: 'victoria-falls', name: '维多利亚瀑布', nameEn: 'Victoria Falls', country: '津巴布韦', countryEn: 'Zimbabwe', city: '维多利亚瀑布城', filename: 'victoria-falls.png', continent: 'africa' },
    { id: 'chefchaouen', name: '舍夫沙万', nameEn: 'Chefchaouen', country: '摩洛哥', countryEn: 'Morocco', city: '舍夫沙万', filename: 'chefchaouen.png', continent: 'africa' },
    { id: 'serengeti', name: '塞伦盖蒂', nameEn: 'Serengeti', country: '坦桑尼亚', countryEn: 'Tanzania', city: '阿鲁沙', filename: 'serengeti.png', continent: 'africa' },
    { id: 'baobab', name: '猴面包树', nameEn: 'Baobab Trees', country: '马达加斯加', countryEn: 'Madagascar', city: '穆龙达瓦', filename: 'baobab.png', continent: 'africa' },
    { id: 'obelisk', name: '方尖碑', nameEn: 'Obelisk of Axum', country: '埃塞俄比亚', countryEn: 'Ethiopia', city: '阿克苏姆', filename: 'obelisk.png', continent: 'africa' },
    { id: 'le-morne', name: '莫纳山', nameEn: 'Le Morne Brabant', country: '毛里求斯', countryEn: 'Mauritius', city: '莫纳山', filename: 'le-morne.png', continent: 'africa' },
    { id: 'table-mountain', name: '桌山', nameEn: 'Table Mountain', country: '南非', countryEn: 'South Africa', city: '开普敦', filename: 'table-mountain.png', continent: 'africa' },
  ],

  // 大洋洲 (Oceania) - 6个
  oceania: [
    { id: 'sydney-opera', name: '悉尼歌剧院', nameEn: 'Sydney Opera House', country: '澳大利亚', countryEn: 'Australia', city: '悉尼', filename: 'sydney-opera.png', continent: 'oceania' },
    { id: 'aurora', name: '极光', nameEn: 'Aurora Australis', country: '新西兰', countryEn: 'New Zealand', city: '皇后镇', filename: 'aurora.png', continent: 'oceania' },
    { id: 'fiji', name: '斐济', nameEn: 'Fiji Islands', country: '斐济', countryEn: 'Fiji', city: '楠迪', filename: 'fiji.png', continent: 'oceania' },
    { id: 'vanuatu', name: '瓦努阿图', nameEn: 'Vanuatu', country: '瓦努阿图', countryEn: 'Vanuatu', city: '维拉港', filename: 'vanuatu.png', continent: 'oceania' },
    { id: 'dunn-river', name: '邓恩河瀑布', nameEn: "Dunn's River Falls", country: '牙买加', countryEn: 'Jamaica', city: '奥乔里奥斯', filename: 'dunn-river.png', continent: 'north-america' },
    { id: 'chocolate-hills', name: '巧克力山', nameEn: 'Chocolate Hills', country: '菲律宾', countryEn: 'Philippines', city: '薄荷岛', filename: 'chocolate-hills.png', continent: 'asia' },
  ],

  // 其他/特殊 (Others) - 4个
  others: [
    { id: 'havana', name: '哈瓦那', nameEn: 'Havana', country: '古巴', countryEn: 'Cuba', city: '哈瓦那', filename: 'havana.png', continent: 'north-america' },
    { id: 'steppe', name: '蒙古草原', nameEn: 'Mongolian Steppe', country: '蒙古', countryEn: 'Mongolia', city: '乌兰巴托', filename: 'steppe.png', continent: 'asia' },
    { id: 'rovaniemi', name: '罗瓦涅米', nameEn: 'Rovaniemi', country: '芬兰', countryEn: 'Finland', city: '罗瓦涅米', filename: 'rovaniemi.png', continent: 'europe' },
    { id: 'png', name: '巴布亚新几内亚', nameEn: 'Papua New Guinea', country: '巴布亚新几内亚', countryEn: 'Papua New Guinea', city: '莫尔兹比港', filename: 'png.png', continent: 'oceania' },
  ]
};

// 大洲名称映射
const CONTINENT_NAMES = {
  'asia': { zh: '亚洲', en: 'Asia' },
  'europe': { zh: '欧洲', en: 'Europe' },
  'north-america': { zh: '北美洲', en: 'North America' },
  'south-america': { zh: '南美洲', en: 'South America' },
  'africa': { zh: '非洲', en: 'Africa' },
  'oceania': { zh: '大洋洲', en: 'Oceania' },
  'others': { zh: '其他', en: 'Others' }
};

// 获取所有塔的扁平列表
function getAllTowers() {
  const all = [];
  Object.values(TOWERS_REGISTRY).forEach(towers => {
    all.push(...towers);
  });
  return all;
}

// 按大洲获取塔列表
function getTowersByContinent(continent) {
  return TOWERS_REGISTRY[continent] || [];
}

// 随机获取指定数量的塔
function getRandomTowers(count = 10) {
  const all = getAllTowers();
  const shuffled = [...all].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, all.length));
}

// 获取塔的图片路径
function getTowerImagePath(towerId) {
  const tower = getAllTowers().find(t => t.id === towerId);
  if (tower) {
    return `assets/towers/${tower.filename}`;
  }
  return null;
}

// 统计信息
const TOWERS_STATS = {
  total: 70,
  byContinent: {
    'asia': 23,
    'europe': 20,
    'north-america': 10,
    'south-america': 8,
    'africa': 9,
    'oceania': 6,
    'others': 4
  }
};

// 导出模块 (用于ES6模块系统)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TOWERS_REGISTRY,
    CONTINENT_NAMES,
    TOWERS_STATS,
    getAllTowers,
    getTowersByContinent,
    getRandomTowers,
    getTowerImagePath
  };
}

console.log('🏰 命运之塔 - 塔资产注册表已加载');
console.log(`📊 总计 ${TOWERS_STATS.total} 个塔图片`);
console.log('🌍 覆盖7个大洲');
