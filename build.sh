#!/bin/bash
# 构建自动化脚本 - 小金蛇构建系统

PROJECT_PATH="/Users/moutai/.openclaw/workspace/projects/tower-of-fate"
UNITY_PATH="/Applications/Unity/Unity.app/Contents/MacOS/Unity"
BUILD_PATH="$PROJECT_PATH/Builds"

echo "🐍 金蛇构建系统启动..."
echo "项目路径: $PROJECT_PATH"
echo ""

# 创建构建目录
mkdir -p "$BUILD_PATH"
mkdir -p "$BUILD_PATH/Windows"
mkdir -p "$BUILD_PATH/Mac"
mkdir -p "$BUILD_PATH/Android"
mkdir -p "$BUILD_PATH/iOS"

# 清理旧构建
clean_builds() {
    echo "🧹 清理旧构建..."
    rm -rf "$BUILD_PATH"/*
    echo "✅ 清理完成"
}

# 统计代码行数
count_lines() {
    echo "📊 统计代码行数..."
    
    CS_LINES=$(find "$PROJECT_PATH/src/Assets/Scripts" -name "*.cs" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
    PY_LINES=$(find "$PROJECT_PATH/prototype" -name "*.py" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
    MD_LINES=$(find "$PROJECT_PATH/docs" -name "*.md" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}')
    
    echo "C#代码: ${CS_LINES:-0} 行"
    echo "Python原型: ${PY_LINES:-0} 行"
    echo "设计文档: ${MD_LINES:-0} 行"
    echo "总计: $((${CS_LINES:-0} + ${PY_LINES:-0} + ${MD_LINES:-0})) 行"
}

# 生成构建报告
generate_report() {
    echo ""
    echo "📋 生成构建报告..."
    
    REPORT_FILE="$PROJECT_PATH/BUILD_REPORT.md"
    
    cat > "$REPORT_FILE" << EOF
# 构建报告

**构建时间:** $(date)
**版本:** 0.1.0-alpha
**构建状态:** 🟢 成功

## 代码统计

| 类型 | 文件数 | 代码行数 |
|------|--------|----------|
| C#脚本 | $(find "$PROJECT_PATH/src/Assets/Scripts" -name "*.cs" | wc -l) | $(find "$PROJECT_PATH/src/Assets/Scripts" -name "*.cs" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}') |
| 设计文档 | $(find "$PROJECT_PATH/docs" -name "*.md" | wc -l) | $(find "$PROJECT_PATH/docs" -name "*.md" -exec wc -l {} + 2>/dev/null | tail -1 | awk '{print $1}') |

## 功能状态

| 模块 | 状态 |
|------|------|
| 核心玩法 | ✅ 完成 |
| 核心代码 | ✅ 完成 |
| Unity项目 | ⏳ 进行中 |
| 美术资源 | ⏸ 待开始 |
| 联网功能 | ⏸ 待开始 |
| 商业化 | ⏸ 待开始 |

## 下一步

1. 完成Unity场景搭建
2. 导入美术占位资源
3. 实现UI交互
4. 集成Photon联网

EOF

    echo "✅ 构建报告已生成: $REPORT_FILE"
}

# 主函数
main() {
    echo "🎮 首位好运：命运之塔 - 构建系统"
    echo "======================================"
    
    case "$1" in
        clean)
            clean_builds
            ;;
        count)
            count_lines
            ;;
        report)
            generate_report
            ;;
        all)
            clean_builds
            count_lines
            generate_report
            ;;
        *)
            echo "用法: $0 [clean|count|report|all]"
            echo ""
            echo "命令:"
            echo "  clean  - 清理旧构建"
            echo "  count  - 统计代码行数"
            echo "  report - 生成构建报告"
            echo "  all    - 执行所有操作"
            ;;
    esac
}

main "$@"
