#!/bin/bash
# ============================================================
# 命运塔 (Tower of Fate) GitHub 部署脚本
# ============================================================
# 用法: ./deploy.sh [commit_message]
# 默认提交信息: "Update web client and tower assets"

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
PROJECT_DIR="/Users/moutai/.openclaw/workspace/projects/tower-of-fate"
WEB_CLIENT_DIR="$PROJECT_DIR/web_client"
TOWERS_BATCH1="/Users/moutai/.openclaw/workspace/towers_batch1"
TOWERS_BATCH2="/Users/moutai/.openclaw/workspace/towers_batch2"
ASSETS_DIR="$WEB_CLIENT_DIR/assets/images/towers"
GITHUB_REPO="github.com/username/tower-of-fate.git"  # 请修改为你的GitHub仓库

# 提交信息
COMMIT_MSG="${1:-"Update web client and tower assets ($(date +%Y-%m-%d))"}"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  命运塔 (Tower of Fate) 部署脚本${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================================
# 步骤 1: 验证环境
# ============================================================
echo -e "${YELLOW}[1/5] 验证环境...${NC}"

if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "${RED}错误: 项目目录不存在: $PROJECT_DIR${NC}"
    exit 1
fi

if [ ! -d "$WEB_CLIENT_DIR" ]; then
    echo -e "${RED}错误: web_client 目录不存在: $WEB_CLIENT_DIR${NC}"
    exit 1
fi

cd "$PROJECT_DIR"

# 检查Git配置
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo -e "${RED}错误: 当前目录不是Git仓库${NC}"
    exit 1
fi

echo -e "${GREEN}✓ 环境验证通过${NC}"
echo ""

# ============================================================
# 步骤 2: 创建assets目录结构
# ============================================================
echo -e "${YELLOW}[2/5] 创建assets目录结构...${NC}"

mkdir -p "$ASSETS_DIR"
mkdir -p "$WEB_CLIENT_DIR/assets/images"
mkdir -p "$WEB_CLIENT_DIR/assets/music"
mkdir -p "$WEB_CLIENT_DIR/assets/skins"

echo -e "${GREEN}✓ Assets目录结构已创建${NC}"
echo ""

# ============================================================
# 步骤 3: 复制塔图片到assets
# ============================================================
echo -e "${YELLOW}[3/5] 复制塔图片到assets...${NC}"

TOWER_COUNT=0

# 复制batch1塔图片
if [ -d "$TOWERS_BATCH1" ]; then
    echo "  复制 towers_batch1..."
    for img in "$TOWERS_BATCH1"/*.png; do
        if [ -f "$img" ]; then
            cp "$img" "$ASSETS_DIR/"
            ((TOWER_COUNT++))
        fi
    done
    echo -e "    ${GREEN}✓ 已复制 batch1 塔图片${NC}"
fi

# 复制batch2塔图片
if [ -d "$TOWERS_BATCH2" ]; then
    echo "  复制 towers_batch2..."
    for img in "$TOWERS_BATCH2"/*.png; do
        if [ -f "$img" ]; then
            cp "$img" "$ASSETS_DIR/"
            ((TOWER_COUNT++))
        fi
    done
    echo -e "    ${GREEN}✓ 已复制 batch2 塔图片${NC}"
fi

echo -e "${GREEN}✓ 共复制 $TOWER_COUNT 张塔图片${NC}"
echo ""

# ============================================================
# 步骤 4: 验证12个JS模块
# ============================================================
echo -e "${YELLOW}[4/5] 验证12个JS模块...${NC}"

JS_MODULES=(
    "achievements.js"
    "analytics.js"
    "audio-system.js"
    "battle-pass.js"
    "daily-missions.js"
    "leaderboard.js"
    "mail-system.js"
    "shop-expanded.js"
    "social-system.js"
    "tournament-enhanced.js"
    "tutorial.js"
    "vip-system.js"
)

MISSING_MODULES=()

for module in "${JS_MODULES[@]}"; do
    if [ -f "$WEB_CLIENT_DIR/$module" ]; then
        SIZE=$(du -h "$WEB_CLIENT_DIR/$module" | cut -f1)
        echo -e "  ${GREEN}✓${NC} $module (${SIZE})"
    else
        echo -e "  ${RED}✗${NC} $module (缺失!)"
        MISSING_MODULES+=("$module")
    fi
done

if [ ${#MISSING_MODULES[@]} -gt 0 ]; then
    echo ""
    echo -e "${RED}警告: 以下模块缺失:${NC}"
    for module in "${MISSING_MODULES[@]}"; do
        echo "  - $module"
    done
    echo ""
    read -p "是否继续部署? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}部署已取消${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ 所有12个JS模块已验证${NC}"
fi
echo ""

# ============================================================
# 步骤 5: Git提交和推送
# ============================================================
echo -e "${YELLOW}[5/5] Git提交和推送...${NC}"

# 添加web_client目录
echo "  添加 web_client 文件..."
git add web_client/

# 检查是否有变更要提交
if git diff --cached --quiet; then
    echo -e "${YELLOW}没有变更需要提交${NC}"
else
    echo "  创建提交: $COMMIT_MSG"
    git commit -m "$COMMIT_MSG"
    
    echo "  推送到GitHub..."
    if git push origin main 2>/dev/null || git push origin master 2>/dev/null; then
        echo -e "${GREEN}✓ 已成功推送到GitHub${NC}"
    else
        echo -e "${YELLOW}⚠ 推送失败，可能没有配置远程仓库${NC}"
        echo "  请手动运行: git remote add origin <your-repo-url>"
    fi
fi

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  部署完成!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "部署摘要:"
echo "  - 项目目录: $PROJECT_DIR"
echo "  - Web客户端: $WEB_CLIENT_DIR"
echo "  - 塔图片数量: $TOWER_COUNT"
echo "  - JS模块: 12个"
echo "  - 提交信息: $COMMIT_MSG"
echo ""
echo "GitHub Pages URL:"
echo "  https://username.github.io/tower-of-fate/web_client/"
echo ""
echo "本地测试:"
echo "  open $WEB_CLIENT_DIR/index.html"
echo ""
