#!/bin/bash
# 下载游戏资源脚本

echo "🎵 下载游戏音乐资源..."
echo "================================"

ASSETS_DIR="/Users/moutai/.openclaw/workspace/projects/tower-of-fate/web_client/assets"
MUSIC_DIR="$ASSETS_DIR/music"
IMAGES_DIR="$ASSETS_DIR/images"

mkdir -p "$MUSIC_DIR" "$IMAGES_DIR"

# 使用免费音效资源
# 由于无法直接下载，创建占位文件说明

cat > "$MUSIC_DIR/README.txt" << 'EOF'
音乐资源说明
==============

需要添加以下音乐文件：

1. bgm_main.mp3 - 主界面背景音乐 (循环播放)
   - 建议：史诗感、轻快节奏
   - 推荐来源：Freesound.org, OpenGameArt.org

2. bgm_game.mp3 - 游戏进行背景音乐 (循环播放)
   - 建议：紧张刺激、节奏感强
   
3. sfx_win.mp3 - 胜利音效
   - 建议：欢快、庆祝感
   
4. sfx_fail.mp3 - 失败音效
   - 建议：低沉、遗憾感
   
5. sfx_card.mp3 - 出牌音效
   - 建议：清脆、短促
   
6. sfx_levelup.mp3 - 升级音效
   - 建议：升级感、成就感

推荐免费资源网站：
- https://freesound.org
- https://opengameart.org
- https://mixkit.co/free-sound-effects/
EOF

echo "✅ 音乐目录已创建: $MUSIC_DIR"

# 创建占位图片
cat > "$IMAGES_DIR/README.txt" << 'EOF'
图片资源说明
==============

需要添加以下图片资源：

头像 (avatars/):
- avatar_01.png - 默认头像
- avatar_02.png - 勇者头像
- avatar_03.png - 法师头像
- avatar_04.png - 刺客头像
- avatar_05.png - 国王头像

背景 (backgrounds/):
- bg_main.jpg - 主界面背景
- bg_game.jpg - 游戏界面背景
- bg_win.jpg - 胜利背景

卡牌皮肤 (skins/):
- skin_default.png - 默认卡牌
- skin_gold.png - 黄金卡牌
- skin_crystal.png - 水晶卡牌
- skin_wood.png - 木质卡牌

头像框 (frames/):
- frame_default.png - 默认边框
- frame_king.png - 王者边框
- frame_star.png - 星辰边框

推荐免费资源网站：
- https://opengameart.org
- https://craftpix.net/freebies/
- https://itch.io/game-assets/free
EOF

echo "✅ 图片目录已创建: $IMAGES_DIR"
echo ""
echo "📝 请手动下载资源文件到对应目录"
echo "================================"
