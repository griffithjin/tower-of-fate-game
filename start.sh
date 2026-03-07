#!/bin/bash
# Tower of Fate - 一键启动脚本
# 作者: 小金蛇
# 日期: 2026-03-03

echo "========================================"
echo "🎮 Tower of Fate (命运之塔)"
echo "========================================"
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="/Users/moutai/.openclaw/workspace/projects/tower-of-fate"

# 检查并杀死已存在的进程
echo "🧹 清理旧进程..."
pkill -f "python3.*game_server" 2>/dev/null
pkill -f "http.server.*8080" 2>/dev/null
pkill -f "http.server.*8081" 2>/dev/null
sleep 2

# 启动游戏服务器
echo "🚀 启动游戏服务器..."
cd "$PROJECT_DIR"
GAME_PORT=7778 python3 server/game_server.py > /tmp/game_server.log 2>&1 &
GAME_PID=$!
echo "${GREEN}✅${NC} 游戏服务器 PID: $GAME_PID"

# 启动Web客户端
echo "🌐 启动Web客户端..."
cd "$PROJECT_DIR/web_client"
python3 -m http.server 8080 > /tmp/web_server.log 2>&1 &
WEB_PID=$!
echo "${GREEN}✅${NC} Web客户端 PID: $WEB_PID"

# 启动后台管理
echo "🔧 启动后台管理系统..."
cd "$PROJECT_DIR/admin"
python3 -m http.server 8081 > /tmp/admin_server.log 2>&1 &
ADMIN_PID=$!
echo "${GREEN}✅${NC} 后台管理 PID: $ADMIN_PID"

# 等待服务启动
sleep 3

echo ""
echo "========================================"
echo "🎉 所有服务已启动!"
echo "========================================"
echo ""
echo "${YELLOW}游戏客户端:${NC} http://localhost:8080"
echo "${YELLOW}后台管理:${NC}   http://localhost:8081"
echo "${YELLOW}游戏服务器:${NC} ws://localhost:7778"
echo ""
echo "📝 日志文件:"
echo "   游戏服务器: /tmp/game_server.log"
echo "   Web客户端:  /tmp/web_server.log"
echo "   后台管理:   /tmp/admin_server.log"
echo ""
echo "🛑 停止所有服务: ./stop.sh"
echo "========================================"

# 保存PID到文件
echo "$GAME_PID $WEB_PID $ADMIN_PID" > /tmp/tower_of_fate_pids
