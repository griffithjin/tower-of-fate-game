# 🚀 Tower of Fate - 本地测试服务器

## 快速启动

### 1. 启动游戏服务器
```bash
cd /Users/moutai/.openclaw/workspace/projects/tower-of-fate
python3 server/game_server.py
```

### 2. 启动Web客户端
```bash
cd /Users/moutai/.openclaw/workspace/projects/tower-of-fate
python3 -m http.server 8080 --directory web_client
```

### 3. 访问游戏
打开浏览器: http://localhost:8080

## 服务器端口
- 游戏服务器: 7777 (WebSocket)
- Web客户端: 8080 (HTTP)

## 测试账号
- 游客登录: 直接输入昵称即可
- 测试账号: test1 / test2 / test3 / test4

---

_金先生，服务器已就绪，请测试！🐍_
