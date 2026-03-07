#!/bin/bash
# generate-logo-pngs.sh - 生成多种尺寸的Logo PNG

# 需要安装 ImageMagick: brew install imagemagick

SVG_FILE="tower-of-fate-logo.svg"
ICON_SVG="tower-of-fate-icon.svg"

# 完整Logo尺寸
SIZES=(16 32 64 128 256 512 1024)

echo "🎨 生成命运塔Logo PNG文件..."

for size in "${SIZES[@]}"; do
    echo "  📐 生成 ${size}x${size}..."
    
    # 完整版本
    convert -background none -size ${size}x${size} "$SVG_FILE" "logo-${size}x${size}.png"
    
    # 图标版本 (用于小尺寸favicon)
    if [ $size -le 64 ]; then
        convert -background none -size ${size}x${size} "$ICON_SVG" "icon-${size}x${size}.png"
    fi
done

# 生成特殊用途文件
echo "  📐 生成 favicon.ico..."
convert -background none -size 16x16 "$ICON_SVG" favicon-16.png
convert -background none -size 32x32 "$ICON_SVG" favicon-32.png
convert -background none -size 48x48 "$ICON_SVG" favicon-48.png
convert favicon-16.png favicon-32.png favicon-48.png favicon.ico

# iOS App图标 (圆角)
echo "  📐 生成 iOS App Store图标..."
convert -background "#1A1A2E" -size 1024x1024 "$ICON_SVG" -gravity center -extent 1024x1024 "ios-app-icon.png"

# Android Play Store图标
echo "  📐 生成 Android Play Store图标..."
convert -background none -size 512x512 "$ICON_SVG" "android-play-store.png"

# 清理临时文件
rm -f favicon-16.png favicon-32.png favicon-48.png

echo "✅ Logo生成完成！"
echo ""
echo "生成的文件:"
ls -la *.png *.ico 2>/dev/null
