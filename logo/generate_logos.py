#!/usr/bin/env python3
"""
generate_logos.py - 使用多种方法生成Logo PNG
"""

import os
import sys

# 尝试导入cairosvg
try:
    import cairosvg
    HAS_CAIROSVG = True
except ImportError:
    HAS_CAIROSVG = False

# 尝试导入svglib
try:
    from svglib.svglib import svg2rlg
    from reportlab.graphics import renderPM
    HAS_SVGLIB = True
except ImportError:
    HAS_SVGLIB = False

# 尝试导入PIL/Pillow
try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

SVG_FILE = "tower-of-fate-logo.svg"
ICON_SVG = "tower-of-fate-icon.svg"

# 需要生成的尺寸
SIZES = [16, 32, 64, 128, 256, 512, 1024]

def generate_with_cairosvg():
    """使用CairoSVG生成PNG"""
    print("🎨 使用 CairoSVG 生成Logo PNG...")
    
    for size in SIZES:
        print(f"  📐 生成 {size}x{size}...")
        
        # 完整版
        output_file = f"logo-{size}x{size}.png"
        cairosvg.svg2png(
            url=SVG_FILE,
            write_to=output_file,
            output_width=size,
            output_height=size
        )
        
        # 图标版 (小尺寸)
        if size <= 64:
            icon_file = f"icon-{size}x{size}.png"
            cairosvg.svg2png(
                url=ICON_SVG,
                write_to=icon_file,
                output_width=size,
                output_height=size
            )
    
    # 特殊尺寸
    print("  📐 生成 iOS App Store图标...")
    cairosvg.svg2png(
        url=ICON_SVG,
        write_to="ios-app-icon.png",
        output_width=1024,
        output_height=1024
    )
    
    print("  📐 生成 Android Play Store图标...")
    cairosvg.svg2png(
        url=ICON_SVG,
        write_to="android-play-store.png",
        output_width=512,
        output_height=512
    )
    
    print("  📐 生成 favicon...")
    cairosvg.svg2png(
        url=ICON_SVG,
        write_to="favicon.png",
        output_width=32,
        output_height=32
    )
    
    return True

def generate_with_svglib():
    """使用svglib生成PNG"""
    print("🎨 使用 svglib + reportlab 生成Logo PNG...")
    
    for size in SIZES:
        print(f"  📐 生成 {size}x{size}...")
        
        drawing = svg2rlg(SVG_FILE)
        
        # 缩放
        scale = size / drawing.width
        drawing.width = size
        drawing.height = size
        drawing.scale(scale, scale)
        
        # 保存
        renderPM.drawToFile(drawing, f"logo-{size}x{size}.png", "PNG")
    
    return True

def generate_placeholder():
    """生成占位符说明文件"""
    print("⚠️  未找到可用的SVG转PNG工具")
    print("")
    print("请安装以下任一工具:")
    print("  1. CairoSVG: pip install cairosvg")
    print("  2. ImageMagick: brew install imagemagick")
    print("  3. Inkscape: brew install inkscape")
    print("")
    print("或者使用在线转换工具:")
    print("  - https://cloudconvert.com/svg-to-png")
    print("  - https://convertio.co/svg-png/")
    print("")
    
    # 创建说明文件
    with open("GENERATION_INSTRUCTIONS.txt", "w") as f:
        f.write("""Logo PNG生成说明
================

SVG源文件已创建:
  - tower-of-fate-logo.svg (完整版)
  - tower-of-fate-icon.svg (图标版)

需要生成的尺寸:
  - 16x16 (favicon)
  - 32x32 (浏览器标签)
  - 64x64 (桌面图标)
  - 128x128 (应用商店)
  - 256x256 (高分辨率)
  - 512x512 (App Store)
  - 1024x1024 (Play Store)

生成方法:

1. 使用 CairoSVG (推荐):
   pip install cairosvg
   python3 generate_logos.py

2. 使用 ImageMagick:
   brew install imagemagick
   ./generate-logo-pngs.sh

3. 使用 Inkscape:
   brew install inkscape
   for size in 16 32 64 128 256 512 1024; do
     inkscape tower-of-fate-logo.svg --export-filename=logo-${size}x${size}.png -w $size -h $size
   done

4. 在线转换:
   - https://cloudconvert.com/svg-to-png
   - https://convertio.co/svg-png/
""")
    
    print("✅ 已创建 GENERATION_INSTRUCTIONS.txt")
    return False

def main():
    print("🗼 命运塔 Logo PNG 生成器")
    print("=" * 40)
    
    if HAS_CAIROSVG:
        success = generate_with_cairosvg()
    elif HAS_SVGLIB:
        success = generate_with_svglib()
    else:
        success = generate_placeholder()
    
    if success:
        print("")
        print("✅ Logo生成完成！")
        print("")
        print("生成的文件:")
        for f in os.listdir('.'):
            if f.endswith('.png'):
                size = os.path.getsize(f)
                print(f"  - {f} ({size/1024:.1f} KB)")

if __name__ == "__main__":
    main()
