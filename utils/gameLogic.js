/**
 * 游戏逻辑工具
 */

// 卡牌定义
const CARDS = {
  attack: {
    id: 'attack',
    name: '攻击',
    damage: 10,
    layerCost: 1,
    description: '造成10点伤害，上升1层'
  },
  heavy_attack: {
    id: 'heavy_attack',
    name: '重击',
    damage: 25,
    layerCost: 2,
    description: '造成25点伤害，上升2层'
  },
  magic: {
    id: 'magic',
    name: '魔法',
    damage: 15,
    layerCost: 1,
    special: true,
    description: '造成15点魔法伤害，上升1层'
  },
  defense: {
    id: 'defense',
    name: '防御',
    damage: 5,
    layerCost: 1,
    block: 15,
    description: '造成5点伤害，获得15点护盾'
  },
  burst: {
    id: 'burst',
    name: '爆发',
    damage: 50,
    layerCost: 5,
    description: '造成50点巨额伤害，上升5层'
  },
  heal: {
    id: 'heal',
    name: '治疗',
    damage: 0,
    layerCost: 0,
    heal: 25,
    description: '恢复25点生命值'
  },
  poison: {
    id: 'poison',
    name: '毒药',
    damage: 5,
    layerCost: 1,
    poison: 3,
    description: '造成5点伤害，附加3层中毒'
  },
  shield: {
    id: 'shield',
    name: '护盾',
    damage: 0,
    layerCost: 0,
    shield: 30,
    description: '获得30点护盾'
  }
};

// 计算卡牌效果
exports.calculateCardEffect = (cardType, playerState, opponentState) => {
  const card = CARDS[cardType];
  if (!card) return null;

  const result = {
    damage: card.damage || 0,
    heal: card.heal || 0,
    shield: card.shield || 0,
    block: card.block || 0,
    layerProgress: card.layerCost || 0,
    effects: []
  };

  // 暴击计算
  const criticalChance = 0.15;
  const isCritical = Math.random() < criticalChance;
  
  if (isCritical) {
    result.damage *= 2;
    result.effects.push('critical');
  }

  // 连击加成
  if (playerState.combo >= 3) {
    result.damage *= 1.5;
    result.effects.push('combo');
  }

  // VIP 加成
  if (playerState.vipLevel > 0) {
    const vipBonus = 1 + (playerState.vipLevel * 0.05);
    result.damage *= vipBonus;
  }

  return {
    ...result,
    damage: Math.floor(result.damage),
    isCritical
  };
};

// 生成随机卡牌
exports.generateRandomCard = () => {
  const cardTypes = Object.keys(CARDS);
  const weights = [30, 20, 15, 15, 10, 5, 3, 2]; // 权重分布
  
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < cardTypes.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return {
        ...CARDS[cardTypes[i]],
        cardId: generateId()
      };
    }
  }
  
  return { ...CARDS.attack, cardId: generateId() };
};

// 生成卡牌组
exports.generateCardDeck = (count = 5) => {
  return Array.from({ length: count }, () => exports.generateRandomCard());
};

// 计算游戏奖励
exports.calculateRewards = (gameResult) => {
  const { layersClimbed, cardsUsed, comboCount, isWinner, mode } = gameResult;
  
  let baseGold = 50;
  let baseDiamond = 5;
  let baseExp = 10;
  
  // 层数奖励
  const layerBonus = Math.floor(layersClimbed / 10) * 10;
  baseGold += layerBonus;
  
  // 胜利奖励
  if (isWinner) {
    baseGold *= 2;
    baseDiamond *= 2;
    baseExp *= 2;
  }
  
  // 连击奖励
  const comboBonus = Math.floor(comboCount / 5) * 5;
  baseGold += comboBonus;
  
  // 效率奖励（使用卡牌少但层数高）
  const efficiency = layersClimbed / Math.max(cardsUsed, 1);
  if (efficiency > 2) {
    baseGold += 20;
  }
  
  // 模式加成
  const modeMultiplier = {
    solo: 1,
    team: 1.2,
    tournament: 1.5,
    streak: 1.3
  };
  
  const multiplier = modeMultiplier[mode] || 1;
  
  return {
    gold: Math.floor(baseGold * multiplier),
    diamond: Math.floor(baseDiamond * multiplier),
    exp: Math.floor(baseExp * multiplier),
    score: isWinner ? 25 : -15
  };
};

// 检查游戏结束条件
exports.checkGameEnd = (player, config = {}) => {
  const { maxLayers = 50, maxCards = 20, maxTime = 300 } = config;
  
  const conditions = {
    reachedTop: player.currentLayer >= maxLayers,
    outOfCards: player.cardsUsed >= maxCards,
    timeout: player.elapsedTime >= maxTime,
    healthZero: player.health <= 0
  };
  
  const ended = Object.values(conditions).some(c => c);
  const reason = ended 
    ? Object.keys(conditions).find(k => conditions[k])
    : null;
  
  return { ended, reason, conditions };
};

// 生成唯一ID
function generateId() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

// 导出卡牌定义
exports.CARDS = CARDS;

// 导出所有卡牌类型
exports.CARD_TYPES = Object.keys(CARDS);
