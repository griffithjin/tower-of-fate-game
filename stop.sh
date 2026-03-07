#!/bin/bash
# Tower of Fate - 停止脚本

echo "🛑 停止 Tower of Fate 服务..."

# 读取PID文件
if [ -f /tmp/tower_of_fate_pids ]; then
    PIDS=$(cat /tmp/tower_of_fate_pids)
    for PID in $PIDS; do
        if kill -0 $PID 2>/dev/null; then
            kill $PID
            echo "✅ 已停止进程 $PID"
        fi
    done
    rm /tmp/tower_of_fate_pids
else
    # 如果没有PID文件，强制杀死相关进程
    pkill -f "python3.*game_server" 2>/dev/null
    pkill -f "http.server.*18080" 2>/dev/null
    pkill -f "http.server.*18081" 2>/dev/null
    echo "✅ 已清理所有相关进程"
fi

echo ""
echo "🎮 Tower of Fate 已停止"
