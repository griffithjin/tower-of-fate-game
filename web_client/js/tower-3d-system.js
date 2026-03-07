/**
 * Tower3DSystem - 3D塔模型管理系统
 * 与RealtimeSync配合，处理塔的3D模型加载和更新
 */

class Tower3DSystem {
  constructor(options = {}) {
    this.towers = new Map();
    this.loader = options.loader || null;
    this.scene = options.scene || null;
    this.onUpdate = options.onUpdate || null;
    this.onAdd = options.onAdd || null;
    this.onRemove = options.onRemove || null;
  }
  
  // 初始化塔列表
  async initializeTowers(towerList) {
    for (const tower of towerList) {
      this.towers.set(tower.towerId || tower.id, tower);
    }
    
    if (this.onUpdate) {
      this.onUpdate([...this.towers.values()]);
    }
    
    console.log(`[Tower3DSystem] 已初始化 ${this.towers.size} 个塔模型`);
  }
  
  // 添加新塔
  addTower(towerData) {
    const id = towerData.id || towerData.towerId;
    
    if (this.towers.has(id)) {
      console.warn(`[Tower3DSystem] 塔 ${id} 已存在，将更新`);
      return this.updateTowerConfig(id, towerData.config);
    }
    
    this.towers.set(id, towerData);
    
    if (this.onAdd) {
      this.onAdd(towerData);
    }
    
    console.log(`[Tower3DSystem] 添加新塔: ${id}`);
    return true;
  }
  
  // 更新塔配置
  updateTowerConfig(id, config) {
    const tower = this.towers.get(id);
    
    if (!tower) {
      console.warn(`[Tower3DSystem] 塔 ${id} 不存在`);
      return false;
    }
    
    // 更新配置
    tower.config = { ...tower.config, ...config };
    tower.config3D = { ...tower.config3D, ...config };
    tower.lastUpdated = Date.now();
    
    this.towers.set(id, tower);
    
    if (this.onUpdate) {
      this.onUpdate(tower);
    }
    
    console.log(`[Tower3DSystem] 更新塔配置: ${id}`);
    return true;
  }
  
  // 移除塔
  removeTower(id) {
    if (!this.towers.has(id)) {
      console.warn(`[Tower3DSystem] 塔 ${id} 不存在`);
      return false;
    }
    
    const tower = this.towers.get(id);
    this.towers.delete(id);
    
    if (this.onRemove) {
      this.onRemove(tower);
    }
    
    console.log(`[Tower3DSystem] 移除塔: ${id}`);
    return true;
  }
  
  // 获取塔
  getTower(id) {
    return this.towers.get(id);
  }
  
  // 获取所有塔
  getAllTowers() {
    return [...this.towers.values()];
  }
  
  // 按稀有度过滤
  getTowersByRarity(rarity) {
    return this.getAllTowers().filter(t => 
      t.attributes?.rarity === rarity || t.rarity === rarity
    );
  }
  
  // 按元素过滤
  getTowersByElement(element) {
    return this.getAllTowers().filter(t => 
      t.attributes?.element === element
    );
  }
  
  // 按地区过滤
  getTowersByRegion(countryCode) {
    return this.getAllTowers().filter(t => 
      t.region?.countryCode === countryCode
    );
  }
  
  // 加载3D模型
  async loadTowerModel(id) {
    const tower = this.towers.get(id);
    if (!tower) {
      throw new Error(`塔 ${id} 不存在`);
    }
    
    if (!this.loader || !this.scene) {
      throw new Error('3D加载器或场景未设置');
    }
    
    const modelUrl = tower.config3D?.modelUrl || tower.config?.modelUrl;
    if (!modelUrl) {
      throw new Error(`塔 ${id} 没有模型URL`);
    }
    
    try {
      const model = await this.loader.load(modelUrl);
      
      // 应用配置
      if (tower.config3D?.scale) {
        model.scale.set(
          tower.config3D.scale.x,
          tower.config3D.scale.y,
          tower.config3D.scale.z
        );
      }
      
      if (tower.config3D?.position) {
        model.position.set(
          tower.config3D.position.x,
          tower.config3D.position.y,
          tower.config3D.position.z
        );
      }
      
      if (tower.config3D?.rotation) {
        model.rotation.set(
          tower.config3D.rotation.x,
          tower.config3D.rotation.y,
          tower.config3D.rotation.z
        );
      }
      
      // 添加到场景
      this.scene.add(model);
      tower._model = model;
      
      console.log(`[Tower3DSystem] 加载模型成功: ${id}`);
      return model;
    } catch (error) {
      console.error(`[Tower3DSystem] 加载模型失败: ${id}`, error);
      throw error;
    }
  }
  
  // 卸载3D模型
  unloadTowerModel(id) {
    const tower = this.towers.get(id);
    if (!tower || !tower._model) {
      return false;
    }
    
    if (this.scene) {
      this.scene.remove(tower._model);
    }
    
    // 清理资源
    if (tower._model.geometry) {
      tower._model.geometry.dispose();
    }
    if (tower._model.material) {
      if (Array.isArray(tower._model.material)) {
        tower._model.material.forEach(m => m.dispose());
      } else {
        tower._model.material.dispose();
      }
    }
    
    tower._model = null;
    console.log(`[Tower3DSystem] 卸载模型: ${id}`);
    return true;
  }
  
  // 预加载所有塔模型
  async preloadAllModels() {
    const promises = [];
    
    for (const [id, tower] of this.towers) {
      if (tower.config3D?.modelUrl) {
        promises.push(
          this.loadTowerModel(id).catch(err => {
            console.warn(`[Tower3DSystem] 预加载失败: ${id}`, err.message);
          })
        );
      }
    }
    
    await Promise.all(promises);
    console.log(`[Tower3DSystem] 预加载完成`);
  }
  
  // 更新塔的3D属性
  updateTower3DProperty(id, property, value) {
    const tower = this.towers.get(id);
    if (!tower || !tower._model) {
      return false;
    }
    
    switch (property) {
      case 'position':
        tower._model.position.set(value.x, value.y, value.z);
        break;
      case 'rotation':
        tower._model.rotation.set(value.x, value.y, value.z);
        break;
      case 'scale':
        tower._model.scale.set(value.x, value.y, value.z);
        break;
      case 'visible':
        tower._model.visible = value;
        break;
      default:
        return false;
    }
    
    return true;
  }
  
  // 播放塔动画
  playTowerAnimation(id, animationName) {
    const tower = this.towers.get(id);
    if (!tower || !tower._model) {
      return false;
    }
    
    // 检查是否有动画
    const animations = tower.config3D?.animations || [];
    const animation = animations.find(a => a.name === animationName);
    
    if (!animation) {
      console.warn(`[Tower3DSystem] 动画不存在: ${animationName}`);
      return false;
    }
    
    // 播放动画（需要具体的动画实现）
    console.log(`[Tower3DSystem] 播放动画: ${id} - ${animationName}`);
    return true;
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Tower3DSystem;
}

if (typeof window !== 'undefined') {
  window.Tower3DSystem = Tower3DSystem;
}
