#!/bin/bash

# 命运塔后端 API 部署脚本
# Fate Tower Backend Deployment Script

echo "🏰 命运塔游戏后端部署脚本"
echo "================================"

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装${NC}"
    echo "请先安装 Node.js 18+: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 版本过低 (需要 >= 18)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js 版本: $(node --version)${NC}"

# 检查 MongoDB
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB 未检测到，请确保已安装并运行${NC}"
    echo "安装指南: https://docs.mongodb.com/manual/installation/"
else
    echo -e "${GREEN}✅ MongoDB 已安装${NC}"
fi

# 安装依赖
echo ""
echo "📦 安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 依赖安装失败${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 依赖安装完成${NC}"

# 环境变量配置
if [ ! -f .env ]; then
    echo ""
    echo "🔧 配置环境变量..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  请编辑 .env 文件，填入你的配置${NC}"
fi

# 创建日志目录
mkdir -p logs

# 启动方式选择
echo ""
echo "请选择启动方式:"
echo "1) 开发模式 (nodemon)"
echo "2) 生产模式 (pm2)"
echo "3) Docker 部署"
echo "4) 仅构建"
read -p "输入选项 [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "🚀 启动开发服务器..."
        npm install -g nodemon
        npm run dev
        ;;
    2)
        echo ""
        echo "🚀 使用 PM2 启动生产服务器..."
        npm install -g pm2
        pm2 start server.js --name fate-tower-api
        pm2 save
        pm2 startup
        echo -e "${GREEN}✅ 服务已启动${NC}"
        echo "常用命令:"
        echo "  pm2 status       - 查看状态"
        echo "  pm2 logs         - 查看日志"
        echo "  pm2 restart all  - 重启服务"
        echo "  pm2 stop all     - 停止服务"
        ;;
    3)
        echo ""
        echo "🐳 Docker 部署..."
        if ! command -v docker &> /dev/null; then
            echo -e "${RED}❌ Docker 未安装${NC}"
            exit 1
        fi
        
        # 检查 .env 文件
        if [ ! -f .env ]; then
            echo -e "${YELLOW}⚠️  请先创建 .env 文件${NC}"
            exit 1
        fi
        
        docker-compose up -d
        echo -e "${GREEN}✅ Docker 容器已启动${NC}"
        echo "查看日志: docker-compose logs -f"
        ;;
    4)
        echo ""
        echo "🔨 构建完成"
        echo -e "${GREEN}✅ 项目已准备就绪${NC}"
        echo ""
        echo "下一步:"
        echo "1. 编辑 .env 文件配置环境变量"
        echo "2. 确保 MongoDB 已运行"
        echo "3. 运行 npm start 启动服务"
        ;;
    *)
        echo -e "${RED}❌ 无效选项${NC}"
        exit 1
        ;;
esac

echo ""
echo "🏰 命运塔后端 API 部署完成!"
echo "API 地址: http://localhost:3000"
echo "健康检查: http://localhost:3000/health"
