/**
 * 命运塔 - 分享系统
 * Share System for Tower of Fate
 * 
 * 功能：
 * 1. 分享比赛结果
 * 2. 分享明信片
 * 3. 分享荣誉墙
 * 4. 生成分享图片
 * 5. Web Share API 支持
 */

// ==================== 分享系统 ====================
class ShareSystem {
    constructor() {
        this.shareHistory = this.loadShareHistory();
        this.defaultUrl = 'https://tower-of-fate.com';
        this.defaultImage = '/images/share-default.png';
    }

    // 从本地存储加载
    loadShareHistory() {
        const saved = localStorage.getItem('towerOfFate_shareHistory');
        return saved ? JSON.parse(saved) : [];
    }

    // 保存分享历史
    saveShareHistory() {
        localStorage.setItem('towerOfFate_shareHistory', JSON.stringify(this.shareHistory));
    }

    // 记录分享
    recordShare(type, data) {
        this.shareHistory.unshift({
            type,
            data,
            sharedAt: new Date().toISOString()
        });
        // 只保留最近100条
        this.shareHistory = this.shareHistory.slice(0, 100);
        this.saveShareHistory();
    }

    // 分享比赛结果
    async shareMatchResult(result) {
        const rankText = this.getRankText(result.rank);
        const rankEmoji = this.getRankEmoji(result.rank);
        
        const shareData = {
            title: `我在命运塔获得第${result.rank}名！`,
            text: `${rankEmoji} 刚刚在${result.country || '神秘之地'}的锦标赛中获得${rankText}！\n🏆 总积分: ${result.score || 0}\n⚡ 用时: ${result.rounds || 0}回合\n\n来命运塔挑战我吧！`,
            url: this.defaultUrl,
            image: await this.generateMatchResultImage(result)
        };

        const success = await this.executeShare(shareData);
        if (success) {
            this.recordShare('match', result);
        }
        return success;
    }

    // 分享明信片
    async sharePostcard(postcardCode) {
        const postcard = POSTCARD_DATA?.[postcardCode];
        if (!postcard) {
            console.warn('未知明信片:', postcardCode);
            return false;
        }

        const rarity = RARITY_CONFIG?.[postcard.rarity] || RARITY_CONFIG.common;
        
        const shareData = {
            title: `我获得了${postcard.country}明信片！`,
            text: `📮 在命运塔收集到「${postcard.country}」的明信片！\n🏛️ 地标: ${postcard.tower}\n✨ 稀有度: ${rarity.name}\n\n一起来收集全世界的明信片吧！`,
            url: this.defaultUrl,
            image: await this.generatePostcardImage(postcardCode)
        };

        const success = await this.executeShare(shareData);
        if (success) {
            this.recordShare('postcard', { code: postcardCode, ...postcard });
        }
        return success;
    }

    // 分享荣誉墙
    async shareHonorWall() {
        const stats = honorSystem?.getStatsSummary() || { unlocked: 0, total: 24 };
        const equipped = honorSystem?.getEquippedTitle();
        
        const shareData = {
            title: '我的命运塔荣誉墙',
            text: `🏆 我在命运塔已获得 ${stats.unlocked} 个称号！\n${equipped ? `当前装备: ${equipped.icon} ${equipped.name}\n` : ''}\n收集进度: ${stats.percentage}%\n\n来命运塔开启你的荣誉之路！`,
            url: this.defaultUrl,
            image: await this.generateHonorWallImage()
        };

        const success = await this.executeShare(shareData);
        if (success) {
            this.recordShare('honor', stats);
        }
        return success;
    }

    // 分享成就
    async shareAchievement(achievement) {
        const shareData = {
            title: `我解锁了新成就：${achievement.name}！`,
            text: `🎉 刚刚在命运塔解锁了「${achievement.name}」！\n${achievement.description}\n\n来命运塔挑战更多成就！`,
            url: this.defaultUrl,
            image: await this.generateAchievementImage(achievement)
        };

        const success = await this.executeShare(shareData);
        if (success) {
            this.recordShare('achievement', achievement);
        }
        return success;
    }

    // 执行分享
    async executeShare(shareData) {
        // 优先使用 Web Share API
        if (navigator.share) {
            try {
                const sharePayload = {
                    title: shareData.title,
                    text: shareData.text,
                    url: shareData.url
                };
                
                // 如果有图片文件，尝试分享
                if (shareData.image && shareData.image instanceof File) {
                    sharePayload.files = [shareData.image];
                }
                
                await navigator.share(sharePayload);
                this.showToast('分享成功！');
                return true;
            } catch (error) {
                if (error.name === 'AbortError') {
                    // 用户取消，不算失败
                    return false;
                }
                console.log('Web Share API 失败，使用备用方案:', error);
            }
        }

        // 备用方案：复制到剪贴板
        return this.copyToClipboard(shareData.text);
    }

    // 复制到剪贴板
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('已复制到剪贴板！');
            return true;
        } catch (error) {
            // 降级方案
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            
            try {
                document.execCommand('copy');
                this.showToast('已复制到剪贴板！');
                return true;
            } catch (e) {
                console.error('复制失败:', e);
                this.showToast('复制失败，请手动复制');
                return false;
            } finally {
                document.body.removeChild(textarea);
            }
        }
    }

    // 生成比赛结果图片
    async generateMatchResultImage(result) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;

        // 背景渐变
        const gradient = ctx.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(0, '#1a1a3e');
        gradient.addColorStop(1, '#0a0a1a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        // 边框
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, 760, 560);

        // 标题
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 命运塔锦标赛 🏆', 400, 100);

        // 排名
        const rankColor = this.getRankColor(result.rank);
        ctx.fillStyle = rankColor;
        ctx.font = 'bold 120px Arial';
        ctx.fillText(`#${result.rank}`, 400, 250);

        // 排名文字
        ctx.fillStyle = '#fff';
        ctx.font = '36px Arial';
        ctx.fillText(this.getRankText(result.rank), 400, 310);

        // 信息
        ctx.font = '28px Arial';
        ctx.fillText(`🌍 ${result.country || '神秘之地'}`, 400, 380);
        ctx.fillText(`📊 积分: ${result.score || 0}`, 400, 430);
        ctx.fillText(`⚡ 回合: ${result.rounds || 0}`, 400, 480);

        // 底部
        ctx.font = '24px Arial';
        ctx.fillStyle = '#888';
        ctx.fillText('tower-of-fate.com', 400, 540);

        return this.canvasToImage(canvas);
    }

    // 生成明信片图片
    async generatePostcardImage(postcardCode) {
        const postcard = POSTCARD_DATA?.[postcardCode];
        if (!postcard) return null;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 600;
        canvas.height = 800;

        // 背景
        const gradient = ctx.createLinearGradient(0, 0, 600, 800);
        gradient.addColorStop(0, '#2a2a5e');
        gradient.addColorStop(1, '#1a1a3e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 600, 800);

        // 稀有度边框
        const rarity = RARITY_CONFIG?.[postcard.rarity] || RARITY_CONFIG.common;
        ctx.strokeStyle = rarity.color;
        ctx.lineWidth = 12;
        ctx.strokeRect(30, 30, 540, 740);

        // 标题
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('📮 命运塔明信片', 300, 100);

        // 国家
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.fillText(postcard.country, 300, 200);

        // 地标
        ctx.font = '32px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText(postcard.tower, 300, 260);

        // 装饰图案
        ctx.font = '150px Arial';
        ctx.fillText('🏛️', 300, 450);

        // 稀有度
        ctx.fillStyle = rarity.color;
        ctx.font = 'bold 36px Arial';
        ctx.fillText(rarity.name, 300, 580);

        // 底部
        ctx.fillStyle = '#888';
        ctx.font = '24px Arial';
        ctx.fillText('tower-of-fate.com', 300, 720);

        return this.canvasToImage(canvas);
    }

    // 生成荣誉墙图片
    async generateHonorWallImage() {
        const stats = honorSystem?.getStatsSummary() || { unlocked: 0, total: 24, percentage: 0 };
        const equipped = honorSystem?.getEquippedTitle();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;

        // 背景
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#1a1a3e');
        gradient.addColorStop(1, '#0d1b2a');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        // 边框
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, 760, 560);

        // 标题
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 我的荣誉墙', 400, 100);

        // 统计
        ctx.fillStyle = '#fff';
        ctx.font = '36px Arial';
        ctx.fillText(`已获得称号: ${stats.unlocked}/${stats.total}`, 400, 180);

        // 进度
        ctx.font = 'bold 60px Arial';
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`${stats.percentage}%`, 400, 280);

        // 当前装备
        if (equipped) {
            ctx.font = '32px Arial';
            ctx.fillStyle = '#aaa';
            ctx.fillText('当前装备', 400, 360);
            
            ctx.font = 'bold 40px Arial';
            ctx.fillStyle = '#fff';
            ctx.fillText(`${equipped.icon} ${equipped.name}`, 400, 420);
        }

        // 底部
        ctx.fillStyle = '#888';
        ctx.font = '24px Arial';
        ctx.fillText('tower-of-fate.com', 400, 540);

        return this.canvasToImage(canvas);
    }

    // 生成成就图片
    async generateAchievementImage(achievement) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;

        // 背景
        const gradient = ctx.createLinearGradient(0, 0, 800, 600);
        gradient.addColorStop(0, '#2a2a5e');
        gradient.addColorStop(1, '#1a1a3e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 600);

        // 边框
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 8;
        ctx.strokeRect(20, 20, 760, 560);

        // 标题
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🎉 解锁新成就！', 400, 120);

        // 成就图标
        ctx.font = '120px Arial';
        ctx.fillText(achievement.icon || '🏆', 400, 280);

        // 成就名称
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 44px Arial';
        ctx.fillText(achievement.name, 400, 380);

        // 描述
        ctx.font = '28px Arial';
        ctx.fillStyle = '#aaa';
        ctx.fillText(achievement.description, 400, 440);

        // 底部
        ctx.fillStyle = '#888';
        ctx.font = '24px Arial';
        ctx.fillText('tower-of-fate.com', 400, 540);

        return this.canvasToImage(canvas);
    }

    // Canvas转图片
    canvasToImage(canvas) {
        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'share.png', { type: 'image/png' });
                    resolve(file);
                } else {
                    resolve(null);
                }
            }, 'image/png');
        });
    }

    // 获取排名文字
    getRankText(rank) {
        if (rank === 1) return '冠军';
        if (rank === 2) return '亚军';
        if (rank === 3) return '季军';
        return `第${rank}名`;
    }

    // 获取排名emoji
    getRankEmoji(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '🏅';
    }

    // 获取排名颜色
    getRankColor(rank) {
        if (rank === 1) return '#ffd700';
        if (rank === 2) return '#c0c0c0';
        if (rank === 3) return '#cd7f32';
        return '#fff';
    }

    // 显示提示
    showToast(message) {
        const existing = document.querySelector('.share-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = 'share-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.8);
            color: #fff;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            z-index: 10000;
            animation: fadeInUp 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'fadeOutDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // 获取分享历史
    getShareHistory(type = null) {
        if (type) {
            return this.shareHistory.filter(s => s.type === type);
        }
        return this.shareHistory;
    }
}

// ==================== 分享按钮组件 ====================
class ShareButton {
    constructor(containerId, type, data = null) {
        this.container = document.getElementById(containerId);
        this.type = type;
        this.data = data;
    }

    // 渲染按钮
    render() {
        if (!this.container) return;

        const configs = {
            match: { text: '📤 分享战绩', icon: '🏆' },
            postcard: { text: '📤 炫耀明信片', icon: '📮' },
            honor: { text: '📤 分享荣誉墙', icon: '🎖️' },
            achievement: { text: '📤 分享成就', icon: '🎉' }
        };

        const config = configs[this.type] || configs.match;

        this.container.innerHTML = `
            <button class="share-btn" onclick="shareSystem.share${this.capitalize(this.type)}(${this.data ? JSON.stringify(this.data) : ''})">
                ${config.icon} ${config.text}
            </button>
        `;
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// ==================== 初始化 ====================
let shareSystem;

function initShareSystem() {
    shareSystem = new ShareSystem();
    return shareSystem;
}

// 导出
window.ShareSystem = ShareSystem;
window.ShareButton = ShareButton;
window.shareSystem = shareSystem;
window.initShareSystem = initShareSystem;
