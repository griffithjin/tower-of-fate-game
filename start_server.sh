#!/bin/bash
# Tower of Fate 快速启动脚本

echo "🚀 启动命运之塔测试服务器..."
echo "================================"

# 检查Python
cd "$(dirname "$0")/.."

# 安装依赖
echo "📦 安装依赖..."
pip3 install -q -r server/requirements.txt 2>/dev/null || pip install -q -r server/requirements.txt

# 启动游戏服务器
echo "🎮 启动游戏服务器 (端口: 7777)..."
python3 server/game_server.py &
SERVER_PID=$!

# 启动Web客户端
echo "🌐 启动Web客户端 (端口: 8080)..."
cd web_client
python3 -m http.server 8080 &
WEB_PID=$!

echo ""
echo "================================"
echo "✅ 服务器已启动!"
echo ""
echo "🎮 游戏访问地址:"
echo "   http://localhost:8080"
echo ""
echo "🔗 WebSocket 端口: 7777"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "================================"

# 等待用户中断
trap "kill $SERVER_PID $WEB_PID 2>/dev/null; echo ''; echo '🛑 服务器已停止'; exit 0" INT
wait
