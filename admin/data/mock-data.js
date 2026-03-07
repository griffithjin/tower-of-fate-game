/**
 * 命运塔游戏 - 数据分析模拟数据
 * Fate Tower Game - Analytics Mock Data
 */

const MockData = {
  // 实时数据
  realtime: {
    online: 1234,
    onlineChange: 5.2,
    dau: 5678,
    dauChange: 12,
    revenue: 12580,
    revenueChange: 8,
    paidRate: 3.2,
    paidRateChange: -0.3,
    retention7d: 45.6,
    retention7dChange: 2.1,
    newUsers: 234,
    newUsersChange: 5
  },

  // 24小时在线热力图数据
  heatmap24h: {
    hours: Array.from({length: 24}, (_, i) => `${i}:00`),
    values: [234, 189, 156, 134, 123, 145, 234, 456, 678, 890, 1023, 1156, 
             1234, 1189, 1123, 1089, 1156, 1290, 1345, 1234, 1098, 890, 567, 345]
  },

  // 收入趋势（今日vs昨日）
  revenueTrend: {
    today: {
      hours: Array.from({length: 24}, (_, i) => `${i}:00`),
      values: [0, 0, 0, 0, 0, 120, 340, 890, 1560, 2340, 2890, 3456, 
               4120, 3890, 3560, 3890, 4234, 4560, 4890, 4234, 3560, 2340, 1230, 0]
    },
    yesterday: {
      hours: Array.from({length: 24}, (_, i) => `${i}:00`),
      values: [0, 0, 0, 0, 0, 110, 310, 820, 1450, 2180, 2670, 3180, 
               3800, 3590, 3280, 3590, 3900, 4190, 4500, 3900, 3280, 2150, 1130, 0]
    }
  },

  // 用户来源渠道归因
  channelAttribution: [
    { name: '自然搜索', value: 35, color: '#5470c6' },
    { name: '社交广告', value: 28, color: '#91cc75' },
    { name: '应用商店', value: 18, color: '#fac858' },
    { name: '口碑推荐', value: 12, color: '#ee6666' },
    { name: '其他渠道', value: 7, color: '#73c0de' }
  ],

  // LTV曲线数据
  ltvCurve: {
    days: Array.from({length: 30}, (_, i) => `D${i + 1}`),
    vip0: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    vip1: [0, 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14],
    vip3: [0, 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56],
    vip5: [0, 5, 10, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135, 145, 155, 165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275],
    vip8: [0, 10, 25, 45, 70, 100, 135, 175, 220, 270, 325, 385, 450, 520, 595, 675, 760, 850, 945, 1045, 1150, 1260, 1375, 1495, 1620, 1750, 1885, 2025, 2170, 2320]
  },

  // 转化漏斗数据
  funnel: {
    stages: ['曝光', '点击', '注册', '新手完成', '首次对战', '首次付费', '复购'],
    values: [10000, 4500, 3000, 1800, 1200, 320, 180],
    dropoff: [55, 33, 40, 33, 73, 44]
  },

  // 用户旅程漏斗
  userJourney: {
    stages: ['打开游戏', '注册', '完成新手', '首次付费', '复购'],
    values: [100, 85, 60, 8, 3],
    insights: [
      { stage: '注册', issue: '流失率15%', suggestion: '简化注册流程，支持一键登录' },
      { stage: '新手', issue: '流失率40%（行业平均25%）', suggestion: '优化新手体验，减少强制引导' },
      { stage: '首付费', issue: '转化率8%（目标15%）', suggestion: '增加首充优惠，降低付费门槛' }
    ]
  },

  // RFM用户分群
  userSegments: {
    highValue: {
      name: '高价值用户',
      count: 456,
      criteria: { lastLogin: '<3天', payment: '>500元', frequency: '>10次/周' },
      retention: 85,
      arpu: 680
    },
    potential: {
      name: '潜在付费用户',
      count: 1234,
      criteria: { playTime: '>2小时', payment: 0, activity: '高' },
      conversionRate: 15
    },
    churnRisk: {
      name: '流失预警用户',
      count: 567,
      criteria: { lastLogin: '>7天', historyPayment: '>100元' },
      riskLevel: '高'
    },
    newUsers: {
      name: '新用户',
      count: 1890,
      criteria: { register: '<7天', games: '<10' },
      d1Retention: 35
    }
  },

  // 付费预测模型
  paymentPrediction: [
    { userId: 'user_123', probability: 85, suggestion: '推送限时礼包', segment: '高概率' },
    { userId: 'user_456', probability: 65, suggestion: '增加游戏时长引导', segment: '中概率' },
    { userId: 'user_789', probability: 45, suggestion: '推送首充优惠', segment: '中概率' },
    { userId: 'user_abc', probability: 25, suggestion: '提升游戏参与度', segment: '低概率' },
    { userId: 'user_def', probability: 92, suggestion: '推送VIP专属礼包', segment: '高概率' }
  ],

  // 留存预测模型
  retentionPrediction: {
    atRisk: ['user_789', 'user_abc', 'user_xyz', 'user_mno'],
    intervention: '发送召回邮件+赠送回归礼包',
    expectedRecovery: 35
  },

  // 游戏平衡分析 - 关卡难度
  levelDifficulty: [
    { level: 1, passRate: 98, status: '正常', suggestion: '' },
    { level: 2, passRate: 95, status: '正常', suggestion: '' },
    { level: 3, passRate: 95, status: '正常', suggestion: '' },
    { level: 4, passRate: 88, status: '正常', suggestion: '' },
    { level: 5, passRate: 82, status: '正常', suggestion: '' },
    { level: 6, passRate: 68, status: '正常', suggestion: '' },
    { level: 7, passRate: 45, status: '⚠️偏难', suggestion: '降低守卫牌强度' },
    { level: 8, passRate: 38, status: '⚠️偏难', suggestion: '调整敌人配置' },
    { level: 9, passRate: 32, status: '⚠️偏难', suggestion: '增加提示频率' },
    { level: 10, passRate: 25, status: '⚠️过难', suggestion: '降低整体难度' },
    { level: 11, passRate: 18, status: '⚠️过难', suggestion: '增加复活机会' },
    { level: 12, passRate: 15, status: '⚠️过难', suggestion: '增加激励视频复活' }
  ],

  // 用户行为路径
  userPath: {
    mainPath: ['首页', '锦标赛', '报名', '等待', '对战', '结束', '领取奖励', '再次报名'],
    dropoffPoint: { stage: '等待', rate: 35, time: '2分钟', suggestion: '增加小游戏或观战功能' }
  },

  // 运营日报数据
  dailyReport: {
    date: '2026-03-08',
    coreMetrics: {
      dau: { value: 5678, change: 12 },
      revenue: { value: 12580, change: 8 },
      newUsers: { value: 234, change: 5 },
      paidRate: { value: 3.2, change: -0.3 }
    },
    alerts: [
      { 
        level: '🔴', 
        title: '第7层通关率骤降', 
        detail: '45%→25%',
        analysis: '守卫激怒牌组合过于强大',
        suggestion: '调整第7层激怒牌配置'
      }
    ],
    opportunities: [
      {
        level: '🟡',
        title: '新用户次日留存提升空间大',
        detail: '当前35%，目标50%',
        suggestion: '优化首登奖励，增加新手保护期'
      }
    ],
    highlights: [
      {
        level: '🟢',
        title: '连胜赛模式参与度高',
        detail: '占活跃用户40%',
        suggestion: '增加连胜赛奖励，延长用户生命周期'
      }
    ],
    autoTasks: [
      { type: '推送', target: '23名潜在付费用户', action: '推送首充礼包' },
      { type: '邮件', target: '156名流式预警用户', action: '发送召回邮件' },
      { type: '活动', target: 'VIP5以上用户', action: '推送专属活动' }
    ],
    abTests: [
      { name: '首充礼包价格', variants: ['¥6', '¥12'] },
      { name: '新手引导时长', variants: ['3分钟', '5分钟'] }
    ]
  },

  // 历史数据（用于趋势分析）
  history: {
    dau: [4567, 4789, 4890, 5123, 5345, 5567, 5678],
    revenue: [10230, 10890, 11234, 11560, 11980, 12340, 12580],
    retention: [42.1, 42.8, 43.5, 44.2, 44.8, 45.2, 45.6]
  }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MockData;
}
