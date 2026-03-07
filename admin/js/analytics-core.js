/**
 * 命运塔数据分析看板 - 核心逻辑
 * Fate Tower Analytics Dashboard Core
 */

class AnalyticsDashboard {
  constructor() {
    this.charts = {};
    this.data = MockData;
    this.updateInterval = null;
    this.init();
  }

  init() {
    this.initCharts();
    this.updateKPIs();
    this.updateUserSegments();
    this.updateDailyReport();
    this.updateDifficultyAnalysis();
    this.startRealtimeUpdate();
  }

  // 初始化所有图表
  initCharts() {
    this.initHeatmapChart();
    this.initRevenueTrendChart();
    this.initChannelChart();
    this.initLTVChart();
    this.initFunnelChart();
    this.initDifficultyChart();
  }

  // 24小时在线热力图
  initHeatmapChart() {
    const chartDom = document.getElementById('heatmap-chart');
    if (!chartDom) return;
    
    this.charts.heatmap = echarts.init(chartDom);
    
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        borderColor: '#2d3748',
        textStyle: { color: '#fff' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.data.heatmap24h.hours,
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#a0a0a0' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#a0a0a0' },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
      },
      series: [{
        data: this.data.heatmap24h.values,
        type: 'bar',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#5470c6' },
            { offset: 1, color: 'rgba(84, 112, 198, 0.3)' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: '#91cc75'
          }
        }
      }]
    };
    
    this.charts.heatmap.setOption(option);
  }

  // 收入趋势图
  initRevenueTrendChart() {
    const chartDom = document.getElementById('revenue-chart');
    if (!chartDom) return;
    
    this.charts.revenue = echarts.init(chartDom);
    
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        borderColor: '#2d3748',
        textStyle: { color: '#fff' }
      },
      legend: {
        data: ['今日', '昨日'],
        textStyle: { color: '#a0a0a0' },
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: this.data.revenueTrend.today.hours,
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#a0a0a0' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { 
          color: '#a0a0a0',
          formatter: '¥{value}'
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
      },
      series: [
        {
          name: '今日',
          type: 'line',
          smooth: true,
          data: this.data.revenueTrend.today.values,
          lineStyle: { color: '#5470c6', width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
              { offset: 1, color: 'rgba(84, 112, 198, 0.05)' }
            ])
          },
          itemStyle: { color: '#5470c6' }
        },
        {
          name: '昨日',
          type: 'line',
          smooth: true,
          data: this.data.revenueTrend.yesterday.values,
          lineStyle: { color: '#91cc75', width: 2, type: 'dashed' },
          itemStyle: { color: '#91cc75' }
        }
      ]
    };
    
    this.charts.revenue.setOption(option);
  }

  // 渠道归因饼图
  initChannelChart() {
    const chartDom = document.getElementById('channel-chart');
    if (!chartDom) return;
    
    this.charts.channel = echarts.init(chartDom);
    
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        borderColor: '#2d3748',
        textStyle: { color: '#fff' },
        formatter: '{b}: {c}%'
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#a0a0a0' }
      },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#16213e',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: '#fff'
          }
        },
        labelLine: { show: false },
        data: this.data.channelAttribution
      }]
    };
    
    this.charts.channel.setOption(option);
  }

  // LTV曲线图
  initLTVChart() {
    const chartDom = document.getElementById('ltv-chart');
    if (!chartDom) return;
    
    this.charts.ltv = echarts.init(chartDom);
    
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        borderColor: '#2d3748',
        textStyle: { color: '#fff' }
      },
      legend: {
        data: ['VIP0', 'VIP1', 'VIP3', 'VIP5', 'VIP8'],
        textStyle: { color: '#a0a0a0' },
        top: 0
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.data.ltvCurve.days,
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#a0a0a0' }
      },
      yAxis: {
        type: 'value',
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { 
          color: '#a0a0a0',
          formatter: '¥{value}'
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
      },
      series: [
        {
          name: 'VIP0',
          type: 'line',
          data: this.data.ltvCurve.vip0,
          lineStyle: { color: '#a0a0a0', width: 2 },
          itemStyle: { color: '#a0a0a0' },
          symbol: 'none'
        },
        {
          name: 'VIP1',
          type: 'line',
          data: this.data.ltvCurve.vip1,
          lineStyle: { color: '#73c0de', width: 2 },
          itemStyle: { color: '#73c0de' },
          symbol: 'none'
        },
        {
          name: 'VIP3',
          type: 'line',
          data: this.data.ltvCurve.vip3,
          lineStyle: { color: '#91cc75', width: 2 },
          itemStyle: { color: '#91cc75' },
          symbol: 'none'
        },
        {
          name: 'VIP5',
          type: 'line',
          data: this.data.ltvCurve.vip5,
          lineStyle: { color: '#fac858', width: 2 },
          itemStyle: { color: '#fac858' },
          symbol: 'none'
        },
        {
          name: 'VIP8',
          type: 'line',
          data: this.data.ltvCurve.vip8,
          lineStyle: { color: '#ee6666', width: 3 },
          itemStyle: { color: '#ee6666' },
          symbol: 'none'
        }
      ]
    };
    
    this.charts.ltv.setOption(option);
  }

  // 漏斗图
  initFunnelChart() {
    const chartDom = document.getElementById('funnel-chart');
    if (!chartDom) return;
    
    this.charts.funnel = echarts.init(chartDom);
    
    const data = this.data.funnel.stages.map((stage, index) => ({
      value: this.data.funnel.values[index],
      name: stage
    }));
    
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        borderColor: '#2d3748',
        textStyle: { color: '#fff' },
        formatter: '{b}: {c}'
      },
      series: [{
        type: 'funnel',
        left: '10%',
        top: 20,
        bottom: 20,
        width: '80%',
        min: 0,
        max: 10000,
        minSize: '0%',
        maxSize: '100%',
        sort: 'descending',
        gap: 2,
        label: {
          show: true,
          position: 'inside',
          formatter: '{b}\n{c}',
          color: '#fff',
          fontSize: 12
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: 'solid'
          }
        },
        itemStyle: {
          borderColor: '#16213e',
          borderWidth: 1
        },
        emphasis: {
          label: {
            fontSize: 14
          }
        },
        data: data,
        color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452']
      }]
    };
    
    this.charts.funnel.setOption(option);
  }

  // 难度分析图
  initDifficultyChart() {
    const chartDom = document.getElementById('difficulty-chart');
    if (!chartDom) return;
    
    this.charts.difficulty = echarts.init(chartDom);
    
    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(22, 33, 62, 0.9)',
        borderColor: '#2d3748',
        textStyle: { color: '#fff' },
        formatter: '{b}: {c}% 通关率'
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: this.data.levelDifficulty.map(d => d.level + '层'),
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#a0a0a0' }
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { 
          color: '#a0a0a0',
          formatter: '{value}%'
        },
        splitLine: { lineStyle: { color: 'rgba(255,255,255,0.05)' } }
      },
      series: [{
        data: this.data.levelDifficulty.map(d => ({
          value: d.passRate,
          itemStyle: {
            color: d.passRate >= 70 ? '#91cc75' : 
                   d.passRate >= 40 ? '#fac858' : '#ee6666'
          }
        })),
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0]
        },
        markLine: {
          data: [
            { yAxis: 70, label: { formatter: '正常线' }, lineStyle: { color: '#91cc75', type: 'dashed' } },
            { yAxis: 40, label: { formatter: '警告线' }, lineStyle: { color: '#ee6666', type: 'dashed' } }
          ]
        }
      }]
    };
    
    this.charts.difficulty.setOption(option);
  }

  // 更新KPI指标
  updateKPIs() {
    const kpiData = this.data.realtime;
    
    this.updateKPICard('kpi-online', kpiData.online, kpiData.onlineChange, '');
    this.updateKPICard('kpi-dau', kpiData.dau, kpiData.dauChange, '');
    this.updateKPICard('kpi-revenue', kpiData.revenue, kpiData.revenueChange, '¥');
    this.updateKPICard('kpi-paidrate', kpiData.paidRate, kpiData.paidRateChange, '', '%');
    this.updateKPICard('kpi-retention', kpiData.retention7d, kpiData.retention7dChange, '', '%');
  }

  updateKPICard(id, value, change, prefix = '', suffix = '') {
    const card = document.getElementById(id);
    if (!card) return;
    
    const valueEl = card.querySelector('.kpi-value');
    const changeEl = card.querySelector('.kpi-change');
    
    if (valueEl) {
      valueEl.textContent = `${prefix}${value.toLocaleString()}${suffix}`;
    }
    
    if (changeEl) {
      const isUp = change >= 0;
      changeEl.className = `kpi-change ${isUp ? 'up' : 'down'}`;
      changeEl.innerHTML = `
        <span>${isUp ? '↑' : '↓'}</span>
        <span>${Math.abs(change)}%</span>
      `;
    }
  }

  // 更新用户分群
  updateUserSegments() {
    // 数据已存在于MockData中，页面使用模板渲染
    // 这里可以添加动态更新逻辑
  }

  // 更新运营日报
  updateDailyReport() {
    const report = this.data.dailyReport;
    
    // 更新核心指标
    this.updateReportMetric('report-dau', report.coreMetrics.dau);
    this.updateReportMetric('report-revenue', report.coreMetrics.revenue, '¥');
    this.updateReportMetric('report-newusers', report.coreMetrics.newUsers);
    this.updateReportMetric('report-paidrate', report.coreMetrics.paidRate, '', '%');
  }

  updateReportMetric(id, metric, prefix = '', suffix = '') {
    const el = document.getElementById(id);
    if (!el) return;
    
    const valueEl = el.querySelector('.report-metric-value');
    const changeEl = el.querySelector('.report-metric-change');
    
    if (valueEl) {
      const isUp = metric.change >= 0;
      valueEl.className = `report-metric-value ${isUp ? 'up' : 'down'}`;
      valueEl.textContent = `${prefix}${metric.value}${suffix}`;
    }
    
    if (changeEl) {
      const isUp = metric.change >= 0;
      changeEl.className = `report-metric-change ${isUp ? 'up' : 'down'}`;
      changeEl.textContent = `${isUp ? '+' : ''}${metric.change}%`;
    }
  }

  // 更新游戏难度分析
  updateDifficultyAnalysis() {
    // 难度数据已通过图表展示
  }

  // 开始实时更新
  startRealtimeUpdate() {
    // 每30秒模拟数据更新
    this.updateInterval = setInterval(() => {
      this.simulateRealtimeUpdate();
    }, 30000);
  }

  // 模拟实时数据更新
  simulateRealtimeUpdate() {
    // 随机微调在线人数
    const variation = Math.floor(Math.random() * 50) - 25;
    this.data.realtime.online = Math.max(1000, this.data.realtime.online + variation);
    
    // 更新KPI显示
    this.updateKPIs();
    
    // 更新热力图最后一个数据点
    const heatmapData = this.data.heatmap24h.values;
    const currentHour = new Date().getHours();
    heatmapData[currentHour] = this.data.realtime.online;
    
    if (this.charts.heatmap) {
      this.charts.heatmap.setOption({
        series: [{ data: heatmapData }]
      });
    }
  }

  // 手动刷新数据
  refreshData() {
    // 模拟从服务器获取最新数据
    console.log('刷新数据...');
    this.simulateRealtimeUpdate();
    
    // 显示刷新提示
    const btn = document.querySelector('.refresh-btn');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>✓</span><span>已刷新</span>';
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 1500);
    }
  }

  // 切换时间范围
  switchTimeRange(range) {
    console.log('切换时间范围:', range);
    // 这里可以根据时间范围重新加载数据
    
    // 更新按钮状态
    document.querySelectorAll('.chart-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.range === range) {
        btn.classList.add('active');
      }
    });
  }

  // 窗口大小改变时重绘图表
  resize() {
    Object.values(this.charts).forEach(chart => {
      if (chart && chart.resize) {
        chart.resize();
      }
    });
  }

  // 销毁
  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
    Object.values(this.charts).forEach(chart => {
      if (chart && chart.dispose) {
        chart.dispose();
      }
    });
  }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  window.analyticsDashboard = new AnalyticsDashboard();
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (window.analyticsDashboard) {
      window.analyticsDashboard.resize();
    }
  });
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalyticsDashboard;
}
