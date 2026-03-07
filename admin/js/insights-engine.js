/**
 * 命运塔数据分析看板 - 智能建议引擎
 * Fate Tower Analytics Dashboard - Insights Engine
 */

class InsightsEngine {
  constructor(data) {
    this.data = data;
    this.rules = this.initRules();
    this.historicalAlerts = [];
  }

  // 初始化分析规则
  initRules() {
    return {
      // 用户相关规则
      user: {
        // 留存率异常
        retention: {
          d1: { threshold: 40, operator: 'lt', severity: 'high', message: '次日留存率低于40%' },
          d7: { threshold: 25, operator: 'lt', severity: 'high', message: '7日留存率低于25%' },
          d30: { threshold: 10, operator: 'lt', severity: 'medium', message: '30日留存率低于10%' }
        },
        // 新增用户
        newUsers: {
          dropThreshold: -20, // 环比下降20%
          severity: 'medium',
          message: '新增用户数量显著下降'
        }
      },
      
      // 收入相关规则
      revenue: {
        // 收入异常
        dailyDrop: { threshold: -15, severity: 'high', message: '日收入大幅下降' },
        arpuDrop: { threshold: -10, severity: 'medium', message: 'ARPU值下降' },
        paidRate: { threshold: 2, operator: 'lt', severity: 'high', message: '付费率低于2%' }
      },
      
      // 游戏平衡规则
      gameBalance: {
        // 关卡难度
        levelPassRate: {
          easy: { min: 70, max: 100, severity: 'normal' },
          normal: { min: 40, max: 70, severity: 'warning' },
          hard: { min: 0, max: 40, severity: 'critical' }
        }
      },
      
      // 转化漏斗规则
      funnel: {
        // 各阶段基准转化率
        benchmarks: {
          register: 30,      // 注册率
          tutorial: 60,      // 新手完成率
          firstBattle: 70,   // 首次对战率
          firstPay: 15,      // 首次付费率
          repurchase: 20     // 复购率（占首付费用户）
        }
      }
    };
  }

  // 生成智能建议报告
  generateInsightsReport() {
    const alerts = [];
    const opportunities = [];
    const actions = [];

    // 1. 分析留存率
    const retentionInsights = this.analyzeRetention();
    alerts.push(...retentionInsights.alerts);
    opportunities.push(...retentionInsights.opportunities);

    // 2. 分析收入
    const revenueInsights = this.analyzeRevenue();
    alerts.push(...revenueInsights.alerts);
    opportunities.push(...revenueInsights.opportunities);
    actions.push(...revenueInsights.actions);

    // 3. 分析游戏平衡
    const balanceInsights = this.analyzeGameBalance();
    alerts.push(...balanceInsights.alerts);
    actions.push(...balanceInsights.actions);

    // 4. 分析转化漏斗
    const funnelInsights = this.analyzeFunnel();
    alerts.push(...funnelInsights.alerts);
    opportunities.push(...funnelInsights.opportunities);
    actions.push(...funnelInsights.actions);

    // 5. 分析用户分群
    const segmentInsights = this.analyzeUserSegments();
    opportunities.push(...segmentInsights.opportunities);
    actions.push(...segmentInsights.actions);

    // 6. 预测性分析
    const predictionInsights = this.generatePredictions();
    opportunities.push(...predictionInsights.opportunities);
    actions.push(...predictionInsights.actions);

    return {
      timestamp: new Date().toISOString(),
      summary: this.generateSummary(alerts, opportunities, actions),
      alerts: this.prioritizeAlerts(alerts),
      opportunities: opportunities.slice(0, 5),
      actions: this.prioritizeActions(actions),
      trends: this.analyzeTrends()
    };
  }

  // 分析留存率
  analyzeRetention() {
    const alerts = [];
    const opportunities = [];
    const realtime = this.data.realtime;

    // 次日留存分析
    if (realtime.d1Retention < this.rules.user.retention.d1.threshold) {
      alerts.push({
        id: 'retention-d1-low',
        level: 'high',
        category: '留存',
        title: '次日留存率偏低',
        detail: `当前 ${realtime.d1Retention}%，目标 ${this.rules.user.retention.d1.threshold}%`,
        analysis: '新用户首次体验可能存在问题',
        suggestion: '优化新手引导流程，增加首登奖励',
        impact: '预计提升DAU 15-20%',
        autoAction: false
      });
    } else {
      opportunities.push({
        level: 'medium',
        category: '留存',
        title: '次日留存有提升空间',
        detail: `当前 ${realtime.d1Retention}%，行业优秀水平 50%+`,
        suggestion: '实施精细化新用户运营策略',
        expectedImpact: '+5-8% DAU'
      });
    }

    // 7日留存分析
    if (realtime.retention7d < this.rules.user.retention.d7.threshold) {
      alerts.push({
        id: 'retention-d7-low',
        level: 'high',
        category: '留存',
        title: '7日留存率偏低',
        detail: `当前 ${realtime.retention7d}%，目标 ${this.rules.user.retention.d7.threshold}%`,
        analysis: '用户中期留存需要加强',
        suggestion: '增加第3、7日回归奖励，推送个性化内容',
        impact: '预计提升留存 5-10%',
        autoAction: true
      });
    }

    return { alerts, opportunities };
  }

  // 分析收入
  analyzeRevenue() {
    const alerts = [];
    const opportunities = [];
    const actions = [];
    const realtime = this.data.realtime;

    // 付费率分析
    if (realtime.paidRate < this.rules.revenue.paidRate.threshold) {
      alerts.push({
        id: 'paid-rate-low',
        level: 'high',
        category: '收入',
        title: '付费率低于预期',
        detail: `当前 ${realtime.paidRate}%，目标 ${this.rules.revenue.paidRate.threshold}%`,
        analysis: '付费转化环节存在瓶颈',
        suggestion: '增加首充优惠，降低首次付费门槛',
        impact: '预计提升收入 20-30%',
        autoAction: false
      });
    }

    // 收入机会
    if (realtime.paidRate >= 3) {
      opportunities.push({
        level: 'high',
        category: '收入',
        title: '付费率表现良好，可进一步提升ARPPU',
        detail: `当前付费率 ${realtime.paidRate}%`,
        suggestion: '推出高价值礼包，优化付费点设计',
        expectedImpact: '+15-25% 日收入'
      });
    }

    // 自动触达任务
    actions.push({
      priority: 'high',
      type: '推送',
      target: this.data.userSegments.potential.count + '名潜在付费用户',
      action: '推送首充礼包',
      timing: '立即',
      expectedConversion: '5-8%'
    });

    actions.push({
      priority: 'medium',
      type: '邮件',
      target: this.data.userSegments.churnRisk.count + '名流失预警用户',
      action: '发送召回邮件+赠送回归礼包',
      timing: '今日18:00',
      expectedConversion: '10-15%'
    });

    return { alerts, opportunities, actions };
  }

  // 分析游戏平衡
  analyzeGameBalance() {
    const alerts = [];
    const actions = [];

    this.data.levelDifficulty.forEach(level => {
      if (level.passRate < 40) {
        const severity = level.passRate < 20 ? 'critical' : 'high';
        alerts.push({
          id: `level-${level.level}-hard`,
          level: severity,
          category: '游戏平衡',
          title: `第${level.level}层难度过高`,
          detail: `通关率仅 ${level.passRate}%`,
          analysis: level.suggestion || '玩家在该层大量流失',
          suggestion: `建议：${level.suggestion || '降低难度或增加辅助机制'}`,
          impact: '影响用户游戏体验和留存',
          autoAction: false
        });
      } else if (level.passRate > 95) {
        opportunities.push({
          level: 'low',
          category: '游戏平衡',
          title: `第${level.level}层可能过于简单`,
          detail: `通关率 ${level.passRate}%`,
          suggestion: '可适当增加挑战性',
          expectedImpact: '提升游戏深度'
        });
      }
    });

    return { alerts, actions };
  }

  // 分析转化漏斗
  analyzeFunnel() {
    const alerts = [];
    const opportunities = [];
    const actions = [];
    const benchmarks = this.rules.funnel.benchmarks;

    // 注册转化率
    const registerRate = (this.data.funnel.values[1] / this.data.funnel.values[0] * 100).toFixed(1);
    if (registerRate < benchmarks.register) {
      alerts.push({
        id: 'funnel-register-low',
        level: 'medium',
        category: '转化',
        title: '注册转化率偏低',
        detail: `当前 ${registerRate}%，基准 ${benchmarks.register}%`,
        analysis: '注册流程可能存在摩擦',
        suggestion: '简化注册流程，支持一键登录',
        impact: '预计提升注册 10-15%',
        autoAction: false
      });
    }

    // 首付费转化
    const firstPayRate = (this.data.funnel.values[5] / this.data.funnel.values[0] * 100).toFixed(1);
    if (firstPayRate < benchmarks.firstPay) {
      alerts.push({
        id: 'funnel-firstpay-low',
        level: 'high',
        category: '转化',
        title: '首次付费转化率偏低',
        detail: `当前 ${firstPayRate}%，基准 ${benchmarks.firstPay}%`,
        analysis: '付费点设计和价值感知需要优化',
        suggestion: '增加首充优惠，优化付费引导',
        impact: '预计提升收入 25-35%',
        autoAction: false
      });
    }

    // A/B测试建议
    actions.push({
      priority: 'medium',
      type: 'A/B测试',
      target: '首充礼包价格',
      action: '测试 ¥6 vs ¥12 两种定价',
      duration: '7天',
      expectedInsight: '确定最优价格点'
    });

    return { alerts, opportunities, actions };
  }

  // 分析用户分群
  analyzeUserSegments() {
    const opportunities = [];
    const actions = [];
    const segments = this.data.userSegments;

    // 高价值用户
    if (segments.highValue.count > 100) {
      opportunities.push({
        level: 'high',
        category: '用户运营',
        title: '高价值用户群体稳定',
        detail: `${segments.highValue.count}名高价值用户`,
        suggestion: '推出VIP专属活动和客服通道',
        expectedImpact: '+20% 高价值用户LTV'
      });

      actions.push({
        priority: 'high',
        type: '活动',
        target: 'VIP5以上用户',
        action: '推送专属活动',
        timing: '本周五',
        expectedConversion: '30-40%'
      });
    }

    // 潜在付费用户
    if (segments.potential.count > 500) {
      opportunities.push({
        level: 'high',
        category: '用户运营',
        title: '大量潜在付费用户待转化',
        detail: `${segments.potential.count}名潜在付费用户`,
        suggestion: '定向推送限时优惠，增加游戏引导',
        expectedImpact: '+50名新付费用户/天'
      });
    }

    return { opportunities, actions };
  }

  // 生成预测
  generatePredictions() {
    const opportunities = [];
    const actions = [];

    // 付费预测
    const highProbUsers = this.data.paymentPrediction.filter(u => u.probability >= 80);
    if (highProbUsers.length > 0) {
      opportunities.push({
        level: 'high',
        category: '预测',
        title: `${highProbUsers.length}名用户7日内付费概率>80%`,
        detail: 'AI模型识别的高意向付费用户',
        suggestion: '立即推送限时礼包',
        expectedImpact: `预计转化 ${Math.floor(highProbUsers.length * 0.6)}名用户`
      });

      actions.push({
        priority: 'high',
        type: '推送',
        target: `${highProbUsers.length}名高概率付费用户`,
        action: '推送限时专属礼包',
        timing: '立即',
        expectedConversion: '60-70%'
      });
    }

    // 流失预测
    const atRiskUsers = this.data.retentionPrediction.atRisk;
    if (atRiskUsers.length > 0) {
      opportunities.push({
        level: 'medium',
        category: '预测',
        title: `${atRiskUsers.length}名用户存在流失风险`,
        detail: 'AI模型预测可能流失',
        suggestion: this.data.retentionPrediction.intervention,
        expectedImpact: `${this.data.retentionPrediction.expectedRecovery}% 用户可挽回`
      });
    }

    return { opportunities, actions };
  }

  // 生成报告摘要
  generateSummary(alerts, opportunities, actions) {
    const criticalCount = alerts.filter(a => a.level === 'critical').length;
    const highCount = alerts.filter(a => a.level === 'high').length;
    const mediumCount = alerts.filter(a => a.level === 'medium').length;

    let status = '正常';
    let statusColor = 'green';
    
    if (criticalCount > 0) {
      status = '严重';
      statusColor = 'red';
    } else if (highCount > 2) {
      status = '警告';
      statusColor = 'orange';
    } else if (highCount > 0) {
      status = '关注';
      statusColor = 'yellow';
    }

    return {
      status,
      statusColor,
      alertCount: { critical: criticalCount, high: highCount, medium: mediumCount },
      opportunityCount: opportunities.length,
      actionCount: actions.length,
      summaryText: `发现 ${alerts.length} 个问题，${opportunities.length} 个机会，建议执行 ${actions.length} 个行动`
    };
  }

  // 优先级排序
  prioritizeAlerts(alerts) {
    const priorityMap = { critical: 4, high: 3, medium: 2, low: 1 };
    return alerts.sort((a, b) => priorityMap[b.level] - priorityMap[a.level]);
  }

  prioritizeActions(actions) {
    const priorityMap = { high: 3, medium: 2, low: 1 };
    return actions.sort((a, b) => priorityMap[b.priority] - priorityMap[a.priority]);
  }

  // 趋势分析
  analyzeTrends() {
    const history = this.data.history;
    
    // 计算趋势
    const dauTrend = this.calculateTrend(history.dau);
    const revenueTrend = this.calculateTrend(history.revenue);
    const retentionTrend = this.calculateTrend(history.retention);

    return {
      dau: { direction: dauTrend > 0 ? 'up' : 'down', value: Math.abs(dauTrend).toFixed(1) + '%' },
      revenue: { direction: revenueTrend > 0 ? 'up' : 'down', value: Math.abs(revenueTrend).toFixed(1) + '%' },
      retention: { direction: retentionTrend > 0 ? 'up' : 'down', value: Math.abs(retentionTrend).toFixed(1) + '%' }
    };
  }

  calculateTrend(data) {
    if (data.length < 2) return 0;
    const first = data[0];
    const last = data[data.length - 1];
    return ((last - first) / first) * 100;
  }

  // 生成每日运营报告
  generateDailyReport() {
    const insights = this.generateInsightsReport();
    const date = new Date().toLocaleDateString('zh-CN');

    return {
      date,
      title: `📊 命运塔运营日报 - ${date}`,
      content: insights
    };
  }

  // 渲染运营日报到页面
  renderDailyReport(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const report = this.generateDailyReport();
    const insights = report.content;

    // 这里可以生成HTML并插入到页面
    console.log('运营日报:', report);
    
    return report;
  }
}

// 全局实例
let insightsEngine = null;

// 初始化智能建议引擎
function initInsightsEngine(data) {
  insightsEngine = new InsightsEngine(data);
  return insightsEngine;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InsightsEngine;
}
