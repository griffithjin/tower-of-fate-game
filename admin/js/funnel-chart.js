/**
 * 命运塔数据分析看板 - 漏斗分析模块
 * Fate Tower Analytics Dashboard - Funnel Chart Module
 */

class FunnelAnalyzer {
  constructor(data) {
    this.data = data;
    this.chart = null;
  }

  // 初始化用户旅程漏斗
  initUserJourneyFunnel(containerId) {
    const chartDom = document.getElementById(containerId);
    if (!chartDom) return;
    
    this.chart = echarts.init(chartDom);
    
    const journeyData = this.data.userJourney.stages.map((stage, index) => ({
      value: this.data.userJourney.values[index],
      name: stage
    }));

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        borderColor: '#2d3748',
        textStyle: { color: '#fff' },
        formatter: (params) => {
          const index = journeyData.findIndex(d => d.name === params.name);
          const dropoff = index < this.data.userJourney.values.length - 1 
            ? ((1 - this.data.userJourney.values[index + 1] / params.value) * 100).toFixed(1)
            : 0;
          return `${params.name}<br/>转化率: ${params.value}%<br/>${dropoff > 0 ? `流失率: ${dropoff}%` : ''}`;
        }
      },
      series: [
        {
          name: '用户旅程',
          type: 'funnel',
          left: '5%',
          top: 20,
          bottom: 20,
          width: '60%',
          min: 0,
          max: 100,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'inside',
            formatter: '{b}\n{c}%',
            color: '#fff',
            fontSize: 13,
            fontWeight: 'bold'
          },
          labelLine: { show: false },
          itemStyle: {
            borderColor: '#16213e',
            borderWidth: 2
          },
          emphasis: {
            label: { fontSize: 15 }
          },
          data: journeyData,
          color: [
            '#5470c6',  // 打开游戏 - 蓝色
            '#91cc75',  // 注册 - 绿色
            '#fac858',  // 完成新手 - 黄色
            '#ee6666',  // 首次付费 - 红色
            '#73c0de'   // 复购 - 青色
          ]
        },
        {
          name: '转化率',
          type: 'funnel',
          left: '5%',
          top: 20,
          bottom: 20,
          width: '60%',
          min: 0,
          max: 100,
          minSize: '0%',
          maxSize: '100%',
          sort: 'descending',
          gap: 2,
          label: {
            show: true,
            position: 'right',
            formatter: (params) => {
              const index = journeyData.findIndex(d => d.name === params.name);
              if (index === 0) return '';
              const prevValue = journeyData[index - 1].value;
              const conversion = ((params.value / prevValue) * 100).toFixed(1);
              return `→ ${conversion}%`;
            },
            color: '#a0a0a0',
            fontSize: 12
          },
          labelLine: { show: true, length: 30 },
          itemStyle: { opacity: 0 },
          tooltip: { show: false },
          data: journeyData,
          z: 10
        }
      ]
    };
    
    this.chart.setOption(option);
    return this.chart;
  }

  // 生成流失洞察HTML
  generateInsightsHTML() {
    const insights = this.data.userJourney.insights;
    return insights.map(insight => `
      <div class="insight-card ${insight.issue.includes('40%') ? '' : 'warning'}">
        <div class="insight-title">
          <span>❌</span>
          <span>${insight.stage}阶段：${insight.issue}</span>
        </div>
        <div class="insight-content">
          ${insight.issue.includes('行业平均') ? '高于行业平均水平，需重点关注' : '建议优化此环节'}
        </div>
        <div class="insight-suggestion">
          <span>💡</span>
          <span>建议：${insight.suggestion}</span>
        </div>
      </div>
    `).join('');
  }

  // 计算各阶段转化率
  calculateConversionRates() {
    const stages = this.data.userJourney.stages;
    const values = this.data.userJourney.values;
    const rates = [];

    for (let i = 0; i < stages.length; i++) {
      const overallRate = values[i];
      const stageRate = i === 0 ? 100 : ((values[i] / values[i - 1]) * 100).toFixed(1);
      const dropoffRate = i === stages.length - 1 ? 0 : (100 - ((values[i + 1] / values[i]) * 100)).toFixed(1);

      rates.push({
        stage: stages[i],
        overallRate,
        stageRate,
        dropoffRate,
        isProblem: dropoffRate > 30
      });
    }

    return rates;
  }

  // 生成详细转化报告
  generateConversionReport() {
    const rates = this.calculateConversionRates();
    let report = '\n=== 用户旅程转化报告 ===\n\n';
    
    rates.forEach((rate, index) => {
      report += `${index + 1}. ${rate.stage}\n`;
      report += `   总体转化: ${rate.overallRate}%\n`;
      report += `   阶段转化: ${rate.stageRate}%\n`;
      if (rate.dropoffRate > 0) {
        report += `   流失率: ${rate.dropoffRate}% ${rate.isProblem ? '⚠️ 高风险' : ''}\n`;
      }
      report += '\n';
    });

    const problemStages = rates.filter(r => r.isProblem);
    if (problemStages.length > 0) {
      report += '\n⚠️ 需要关注的阶段：\n';
      problemStages.forEach(stage => {
        report += `   - ${stage.stage} (流失率 ${stage.dropoffRate}%)\n`;
      });
    }

    return report;
  }

  // 生成对比漏斗（A/B测试用）
  generateComparisonFunnel(variantA, variantB) {
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        borderColor: '#2d3748',
        textStyle: { color: '#fff' }
      },
      legend: {
        data: ['方案A', '方案B'],
        textStyle: { color: '#a0a0a0' }
      },
      series: [
        {
          name: '方案A',
          type: 'funnel',
          left: '5%',
          width: '40%',
          min: 0,
          max: 100,
          sort: 'descending',
          label: {
            show: true,
            position: 'inside',
            formatter: '{c}%',
            color: '#fff'
          },
          itemStyle: { opacity: 0.8 },
          data: variantA,
          color: ['#5470c6', '#5470c6', '#5470c6', '#5470c6', '#5470c6']
        },
        {
          name: '方案B',
          type: 'funnel',
          left: '55%',
          width: '40%',
          min: 0,
          max: 100,
          sort: 'descending',
          label: {
            show: true,
            position: 'inside',
            formatter: '{c}%',
            color: '#fff'
          },
          itemStyle: { opacity: 0.8 },
          data: variantB,
          color: ['#91cc75', '#91cc75', '#91cc75', '#91cc75', '#91cc75']
        }
      ]
    };

    return option;
  }

  // 预测优化效果
  predictOptimization(stage, improvement) {
    const currentRates = this.calculateConversionRates();
    const stageIndex = currentRates.findIndex(r => r.stage === stage);
    
    if (stageIndex === -1) return null;

    const newValues = [...this.data.userJourney.values];
    const improvementFactor = 1 + (improvement / 100);
    
    // 计算优化后的转化率
    for (let i = stageIndex; i < newValues.length; i++) {
      if (i === stageIndex) {
        newValues[i] = Math.min(100, newValues[i] * improvementFactor);
      } else {
        // 后续阶段按比例调整
        const prevRatio = newValues[i] / newValues[i - 1];
        newValues[i] = newValues[i - 1] * prevRatio;
      }
    }

    const currentFinal = this.data.userJourney.values[this.data.userJourney.values.length - 1];
    const newFinal = newValues[newValues.length - 1];
    const lift = ((newFinal - currentFinal) / currentFinal * 100).toFixed(1);

    return {
      stage,
      improvement,
      currentValues: this.data.userJourney.values,
      predictedValues: newValues,
      finalConversion: {
        current: currentFinal.toFixed(1) + '%',
        predicted: newFinal.toFixed(1) + '%',
        lift: '+' + lift + '%'
      }
    };
  }

  //  resize
  resize() {
    if (this.chart) {
      this.chart.resize();
    }
  }

  // 销毁
  destroy() {
    if (this.chart) {
      this.chart.dispose();
    }
  }
}

// 全局漏斗分析实例
let funnelAnalyzer = null;

// 初始化漏斗分析
function initFunnelAnalysis(data) {
  funnelAnalyzer = new FunnelAnalyzer(data);
  
  // 初始化图表
  funnelAnalyzer.initUserJourneyFunnel('user-journey-funnel');
  
  // 渲染洞察
  const insightsContainer = document.getElementById('funnel-insights');
  if (insightsContainer) {
    insightsContainer.innerHTML = funnelAnalyzer.generateInsightsHTML();
  }
  
  // 控制台输出报告
  console.log(funnelAnalyzer.generateConversionReport());
  
  return funnelAnalyzer;
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FunnelAnalyzer;
}
