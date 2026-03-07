/**
 * 命运之塔 - 背景切换系统
 * Tower of Fate - Background Switching System
 * 
 * 支持从塔图片库中随机或手动选择背景
 * Supports random or manual selection from tower image library
 */

// 背景系统配置
const BACKGROUND_CONFIG = {
  // 图片基础路径
  basePath: 'assets/towers/',
  
  // 默认背景（当图片加载失败时使用CSS渐变）
  defaultBackground: 'linear-gradient(180deg, #0a0a1a 0%, #1a1a3e 50%, #0d1b2a 100%)',
  
  // 预加载图片数量
  preloadCount: 10,
  
  // 切换动画时长（毫秒）
  transitionDuration: 500,
  
  // 是否启用自动轮换
  autoRotate: false,
  
  // 自动轮换间隔（毫秒）
  rotateInterval: 30000
};

// 当前背景状态
let currentBackgroundState = {
  currentTowerId: null,
  currentTower: null,
  isTransitioning: false,
  preloadedImages: new Map(),
  rotationTimer: null
};

/**
 * 初始化背景系统
 */
function initBackgroundSystem() {
  console.log('🎨 背景系统初始化中...');
  
  // 预加载部分图片
  preloadRandomTowers(BACKGROUND_CONFIG.preloadCount);
  
  // 设置初始背景
  setRandomBackground();
  
  // 如果启用自动轮换，启动定时器
  if (BACKGROUND_CONFIG.autoRotate) {
    startAutoRotation();
  }
  
  console.log('✅ 背景系统初始化完成');
}

/**
 * 预加载随机塔图片
 */
function preloadRandomTowers(count = 10) {
  if (typeof getRandomTowers === 'undefined') {
    console.warn('⚠️ towers-registry.js 未加载，跳过预加载');
    return;
  }
  
  const towers = getRandomTowers(count);
  towers.forEach(tower => {
    const img = new Image();
    img.src = `${BACKGROUND_CONFIG.basePath}${tower.filename}`;
    currentBackgroundState.preloadedImages.set(tower.id, img);
  });
  
  console.log(`📥 预加载了 ${towers.length} 个塔图片`);
}

/**
 * 设置随机背景
 */
function setRandomBackground() {
  if (typeof getAllTowers === 'undefined') {
    console.warn('⚠️ towers-registry.js 未加载，使用默认背景');
    applyBackground(null);
    return;
  }
  
  const towers = getAllTowers();
  const randomTower = towers[Math.floor(Math.random() * towers.length)];
  setBackgroundByTower(randomTower);
}

/**
 * 根据塔ID设置背景
 */
function setBackgroundById(towerId) {
  if (typeof getAllTowers === 'undefined') {
    console.warn('⚠️ towers-registry.js 未加载');
    return false;
  }
  
  const tower = getAllTowers().find(t => t.id === towerId);
  if (tower) {
    setBackgroundByTower(tower);
    return true;
  }
  console.warn(`⚠️ 未找到塔ID: ${towerId}`);
  return false;
}

/**
 * 根据塔对象设置背景
 */
function setBackgroundByTower(tower) {
  if (currentBackgroundState.isTransitioning) {
    console.log('⏳ 背景切换中，请稍候...');
    return;
  }
  
  currentBackgroundState.isTransitioning = true;
  currentBackgroundState.currentTower = tower;
  currentBackgroundState.currentTowerId = tower ? tower.id : null;
  
  const imagePath = tower ? `${BACKGROUND_CONFIG.basePath}${tower.filename}` : null;
  
  // 创建过渡效果
  const towerSection = document.getElementById('towerSection');
  if (!towerSection) {
    console.warn('⚠️ 未找到 towerSection 元素');
    currentBackgroundState.isTransitioning = false;
    return;
  }
  
  // 淡出效果
  towerSection.style.transition = `opacity ${BACKGROUND_CONFIG.transitionDuration}ms ease`;
  towerSection.style.opacity = '0.5';
  
  setTimeout(() => {
    applyBackground(imagePath, tower);
    towerSection.style.opacity = '1';
    currentBackgroundState.isTransitioning = false;
  }, BACKGROUND_CONFIG.transitionDuration);
  
  console.log(`🖼️ 背景切换为: ${tower ? tower.name : '默认背景'}`);
}

/**
 * 应用背景到元素
 */
function applyBackground(imagePath, tower = null) {
  const towerSection = document.getElementById('towerSection');
  if (!towerSection) return;
  
  if (imagePath) {
    // 使用图片背景
    towerSection.style.background = `
      linear-gradient(180deg, rgba(10,10,26,0.7) 0%, rgba(26,26,62,0.5) 50%, rgba(13,27,42,0.7) 100%),
      url('${imagePath}')
    `;
    towerSection.style.backgroundSize = 'cover';
    towerSection.style.backgroundPosition = 'center';
    towerSection.style.backgroundRepeat = 'no-repeat';
    
    // 添加塔信息标签
    updateTowerInfoLabel(tower);
  } else {
    // 使用默认渐变背景
    towerSection.style.background = BACKGROUND_CONFIG.defaultBackground;
    towerSection.style.backgroundSize = '';
    towerSection.style.backgroundPosition = '';
    towerSection.style.backgroundRepeat = '';
    
    // 移除塔信息标签
    removeTowerInfoLabel();
  }
}

/**
 * 更新塔信息标签
 */
function updateTowerInfoLabel(tower) {
  if (!tower) return;
  
  let label = document.getElementById('towerInfoLabel');
  if (!label) {
    label = document.createElement('div');
    label.id = 'towerInfoLabel';
    label.style.cssText = `
      position: absolute;
      top: 10px;
      left: 10px;
      background: rgba(0,0,0,0.7);
      color: #ffd700;
      padding: 8px 15px;
      border-radius: 20px;
      font-size: 12px;
      border: 1px solid #ffd700;
      z-index: 10;
      backdrop-filter: blur(5px);
    `;
    
    const towerSection = document.getElementById('towerSection');
    if (towerSection) {
      towerSection.appendChild(label);
    }
  }
  
  const continentName = CONTINENT_NAMES[tower.continent] ? CONTINENT_NAMES[tower.continent].zh : tower.continent;
  label.innerHTML = `
    🏰 ${tower.name} <span style="color: #888; margin-left: 8px;">${tower.country} · ${continentName}</span>
    <button onclick="showBackgroundSelector()" style="
      margin-left: 10px;
      background: rgba(255,215,0,0.2);
      border: 1px solid #ffd700;
      color: #ffd700;
      border-radius: 10px;
      padding: 2px 8px;
      font-size: 10px;
      cursor: pointer;
    ">切换</button>
  `;
}

/**
 * 移除塔信息标签
 */
function removeTowerInfoLabel() {
  const label = document.getElementById('towerInfoLabel');
  if (label) {
    label.remove();
  }
}

/**
 * 显示背景选择器
 */
function showBackgroundSelector() {
  if (typeof getAllTowers === 'undefined') {
    alert('⚠️ 塔库未加载');
    return;
  }
  
  const towers = getAllTowers();
  const currentId = currentBackgroundState.currentTowerId;
  
  // 创建选择器弹窗
  let selector = document.getElementById('backgroundSelector');
  if (selector) {
    selector.remove();
  }
  
  selector = document.createElement('div');
  selector.id = 'backgroundSelector';
  selector.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.9);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  // 按大洲分组显示
  const continents = ['asia', 'europe', 'north-america', 'south-america', 'africa', 'oceania', 'others'];
  
  let html = `
    <div style="
      background: linear-gradient(135deg, #1a1a3e, #0d1b2a);
      border-radius: 20px;
      border: 2px solid #ffd700;
      padding: 30px;
      max-width: 900px;
      max-height: 80vh;
      overflow-y: auto;
      width: 90%;
    ">
      <h2 style="color: #ffd700; margin-bottom: 20px; text-align: center;">🖼️ 选择背景</h2>
      <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap;">
        <button onclick="selectRandomBackgroundFromSelector()" style="
          background: linear-gradient(45deg, #ffd700, #ffaa00);
          color: #000;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: bold;
        ">🎲 随机选择</button>
        <button onclick="closeBackgroundSelector()" style="
          background: rgba(255,255,255,0.1);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 10px 20px;
          border-radius: 10px;
          cursor: pointer;
        ">关闭</button>
      </div>
  `;
  
  continents.forEach(continent => {
    const continentTowers = towers.filter(t => t.continent === continent);
    if (continentTowers.length === 0) return;
    
    const continentName = CONTINENT_NAMES[continent] ? CONTINENT_NAMES[continent].zh : continent;
    html += `
      <div style="margin-bottom: 20px;">
        <h3 style="color: #888; font-size: 14px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,215,0,0.3); padding-bottom: 5px;">
          ${continentName} (${continentTowers.length}个)
        </h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 10px;">
    `;
    
    continentTowers.forEach(tower => {
      const isActive = tower.id === currentId;
      html += `
        <div onclick="selectBackgroundFromSelector('${tower.id}')" style="
          cursor: pointer;
          padding: 10px;
          background: ${isActive ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.05)'};
          border: 2px solid ${isActive ? '#ffd700' : 'transparent'};
          border-radius: 10px;
          text-align: center;
          transition: all 0.3s;
        " onmouseover="this.style.background='rgba(255,215,0,0.2)'" onmouseout="this.style.background='${isActive ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.05)'}'">
          <div style="font-size: 24px; margin-bottom: 5px;">🏰</div>
          <div style="font-size: 11px; color: ${isActive ? '#ffd700' : '#fff'};">${tower.name}</div>
          <div style="font-size: 9px; color: #888;">${tower.country}</div>
        </div>
      `;
    });
    
    html += '</div></div>';
  });
  
  html += '</div></div>';
  selector.innerHTML = html;
  document.body.appendChild(selector);
}

/**
 * 从选择器中随机选择背景
 */
function selectRandomBackgroundFromSelector() {
  setRandomBackground();
  closeBackgroundSelector();
}

/**
 * 从选择器中选择指定背景
 */
function selectBackgroundFromSelector(towerId) {
  if (setBackgroundById(towerId)) {
    closeBackgroundSelector();
  }
}

/**
 * 关闭背景选择器
 */
function closeBackgroundSelector() {
  const selector = document.getElementById('backgroundSelector');
  if (selector) {
    selector.remove();
  }
}

/**
 * 启动自动轮换
 */
function startAutoRotation() {
  if (currentBackgroundState.rotationTimer) {
    clearInterval(currentBackgroundState.rotationTimer);
  }
  
  currentBackgroundState.rotationTimer = setInterval(() => {
    setRandomBackground();
  }, BACKGROUND_CONFIG.rotateInterval);
  
  console.log(`🔄 自动轮换已启动，间隔 ${BACKGROUND_CONFIG.rotateInterval / 1000} 秒`);
}

/**
 * 停止自动轮换
 */
function stopAutoRotation() {
  if (currentBackgroundState.rotationTimer) {
    clearInterval(currentBackgroundState.rotationTimer);
    currentBackgroundState.rotationTimer = null;
    console.log('⏹️ 自动轮换已停止');
  }
}

/**
 * 获取当前背景信息
 */
function getCurrentBackgroundInfo() {
  return currentBackgroundState.currentTower;
}

/**
 * 按大洲筛选并随机选择
 */
function setRandomBackgroundByContinent(continent) {
  if (typeof getTowersByContinent === 'undefined') {
    console.warn('⚠️ towers-registry.js 未加载');
    return;
  }
  
  const towers = getTowersByContinent(continent);
  if (towers.length > 0) {
    const randomTower = towers[Math.floor(Math.random() * towers.length)];
    setBackgroundByTower(randomTower);
  }
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initBackgroundSystem,
    setRandomBackground,
    setBackgroundById,
    setBackgroundByTower,
    showBackgroundSelector,
    startAutoRotation,
    stopAutoRotation,
    getCurrentBackgroundInfo,
    setRandomBackgroundByContinent,
    BACKGROUND_CONFIG
  };
}

console.log('🎨 背景切换系统已加载');
