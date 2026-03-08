# 命运塔游戏部署手册

## 📋 目录

- [环境要求](#环境要求)
- [基础设施](#基础设施)
- [Docker部署](#docker部署)
- [手动部署](#手动部署)
- [CI/CD流程](#cicd流程)
- [环境配置](#环境配置)
- [监控与日志](#监控与日志)
- [故障排查](#故障排查)

---

## 环境要求

### 生产环境最低配置

| 组件 | 配置 | 数量 |
|------|------|------|
| 应用服务器 | 8核16GB内存 | 2+ |
| MongoDB | 4核8GB内存 | 3 (副本集) |
| Redis | 2核4GB内存 | 2 (主从) |
| Nginx | 2核4GB内存 | 1 |
| 存储 | 100GB SSD | - |

### 软件版本要求

- **操作系统**: Ubuntu 20.04 LTS / CentOS 8
- **Node.js**: v18.x LTS
- **MongoDB**: v6.x
- **Redis**: v7.x
- **Nginx**: v1.24+
- **Docker**: v24.x
- **Docker Compose**: v2.x

### 域名和SSL证书

```
tower-of-fate.com          # 主域名 (Web客户端)
api.tower-of-fate.com      # API服务
cdn.tower-of-fate.com      # 静态资源
ws.tower-of-fate.com       # WebSocket服务
admin.tower-of-fate.com    # 管理后台
```

---

## 基础设施

### 网络架构

```
┌─────────────┐
│   用户      │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  CloudFlare │────▶│   Nginx     │
│  (CDN/WAF)  │     │  (负载均衡)  │
└─────────────┘     └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  App Node  │  │  App Node  │  │  App Node  │
    │    #1      │  │    #2      │  │    #3      │
    └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
          │               │               │
          └───────────────┼───────────────┘
                          ▼
                   ┌────────────┐
                   │   Redis    │
                   │  (Sentinel)│
                   └─────┬──────┘
                         ▼
                   ┌────────────┐
                   │  MongoDB   │
                   │ (ReplicaSet)│
                   └────────────┘
```

---

## Docker部署

### 1. 项目结构

```
tower-of-fate/
├── docker/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── Dockerfile
├── nginx/
│   ├── nginx.conf
│   └── ssl/
├── config/
│   └── pm2.config.js
└── scripts/
    ├── deploy.sh
    └── backup.sh
```

### 2. Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apk add --no-cache python3 make g++

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 创建非root用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
USER nodejs

# 暴露端口
EXPOSE 3000

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js || exit 1

# 启动命令
CMD ["node", "server.js"]
```

### 3. Docker Compose配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # 应用服务
  app:
    build: .
    container_name: toweroffate-app
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODB_URI=mongodb://mongo:27017/toweroffate
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - ENCRYPTION_KEY=${ENCRYPTION_KEY}
    depends_on:
      - mongo
      - redis
    networks:
      - toweroffate-network
    volumes:
      - ./logs:/app/logs
      - ./uploads:/app/uploads
    healthcheck:
      test: ["CMD", "node", "healthcheck.js"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # MongoDB
  mongo:
    image: mongo:6
    container_name: toweroffate-mongo
    restart: unless-stopped
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USER}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASS}
      - MONGO_INITDB_DATABASE=toweroffate
    volumes:
      - mongo_data:/data/db
      - ./mongo/init.js:/docker-entrypoint-initdb.d/init.js:ro
    networks:
      - toweroffate-network
    command: mongod --auth --wiredTigerCacheSizeGB 2

  # Redis
  redis:
    image: redis:7-alpine
    container_name: toweroffate-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/usr/local/etc/redis/redis.conf:ro
    networks:
      - toweroffate-network
    command: redis-server /usr/local/etc/redis/redis.conf

  # Nginx
  nginx:
    image: nginx:alpine
    container_name: toweroffate-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./web_client:/usr/share/nginx/html:ro
    depends_on:
      - app
    networks:
      - toweroffate-network

  # 监控
  prometheus:
    image: prom/prometheus:latest
    container_name: toweroffate-prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prometheus_data:/prometheus
    networks:
      - toweroffate-network

  grafana:
    image: grafana/grafana:latest
    container_name: toweroffate-grafana
    restart: unless-stopped
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana:/etc/grafana/provisioning:ro
    networks:
      - toweroffate-network

volumes:
  mongo_data:
  redis_data:
  prometheus_data:
  grafana_data:

networks:
  toweroffate-network:
    driver: bridge
```

### 4. Nginx配置

```nginx
# nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for" '
                    'rt=$request_time uct="$upstream_connect_time" '
                    'uht="$upstream_header_time" urt="$upstream_response_time"';

    access_log /var/log/nginx/access.log main;

    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript 
               application/x-javascript application/xml application/javascript
               application/json;

    # 限流配置
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

    # 上游服务器
    upstream app_servers {
        least_conn;
        server app:3000 max_fails=3 fail_timeout=30s;
        # 多节点时添加更多
        # server app2:3000 max_fails=3 fail_timeout=30s;
    }

    upstream ws_servers {
        ip_hash;
        server app:3000;
    }

    # HTTP重定向到HTTPS
    server {
        listen 80;
        server_name _;
        return 301 https://$host$request_uri;
    }

    # 主站
    server {
        listen 443 ssl http2;
        server_name tower-of-fate.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
            add_header Cache-Control "public, max-age=3600";
        }

        location /api {
            limit_req zone=api_limit burst=20 nodelay;
            proxy_pass http://app_servers;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_connect_timeout 5s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        location /socket.io {
            proxy_pass http://ws_servers;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_read_timeout 86400s;
            proxy_send_timeout 86400s;
        }

        # 静态资源缓存
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }

    # API子域名
    server {
        listen 443 ssl http2;
        server_name api.tower-of-fate.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        location / {
            limit_req zone=api_limit burst=50 nodelay;
            proxy_pass http://app_servers;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## 手动部署

### 1. 环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 安装MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org

# 安装Redis
sudo apt install -y redis-server

# 安装Nginx
sudo apt install -y nginx

# 安装PM2
sudo npm install -g pm2
```

### 2. 应用部署

```bash
# 创建应用目录
sudo mkdir -p /opt/toweroffate
sudo chown $USER:$USER /opt/toweroffate

# 克隆代码
git clone https://github.com/yourusername/tower-of-fate.git /opt/toweroffate
cd /opt/toweroffate

# 安装依赖
npm ci --only=production

# 创建环境文件
cat > .env << EOF
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/toweroffate
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-encryption-key
EOF

# 使用PM2启动
pm2 start server.js --name toweroffate \
  --instances max \
  --exec-mode cluster \
  --max-memory-restart 512M \
  --log-date-format "YYYY-MM-DD HH:mm Z"

# 保存PM2配置
pm2 save
pm2 startup systemd
```

### 3. 数据库初始化

```bash
# MongoDB初始化
mongo toweroffate << EOF
db.createCollection('users');
db.createCollection('games');
db.createCollection('orders');
db.createCollection('tournaments');
db.createCollection('guilds');

// 创建索引
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ 'stats.highestLayer': -1 });
db.games.createIndex({ roomId: 1 }, { unique: true });
db.games.createIndex({ status: 1 });
db.orders.createIndex({ orderId: 1 }, { unique: true });
EOF
```

---

## CI/CD流程

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm test
        env:
          MONGODB_URI: mongodb://localhost:27017/test
          REDIS_URL: redis://localhost:6379
          JWT_SECRET: test-secret
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ secrets.DOCKER_USERNAME }}/toweroffate:${{ github.sha }}
            ${{ secrets.DOCKER_USERNAME }}/toweroffate:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.SSH_HOST }}
          username: ${{ secrets.SSH_USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/toweroffate
            docker-compose pull
            docker-compose up -d --no-deps --build app
            docker image prune -f
            
            # 健康检查
            sleep 10
            curl -f http://localhost:3000/health || exit 1
            
            echo "Deployment completed successfully!"
```

---

## 环境配置

### 生产环境 .env 示例

```bash
# 基础配置
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# 数据库
MONGODB_URI=mongodb://user:pass@mongo1:27017,mongo2:27017,mongo3:27017/toweroffate?replicaSet=rs0
REDIS_URL=redis://redis:6379
REDIS_PASSWORD=your-redis-password

# 安全
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your-32-char-encryption-key

# 支付配置
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PUBLIC_KEY=your-alipay-public-key
ALIPAY_PRIVATE_KEY=your-alipay-private-key
WECHAT_PAY_MCH_ID=your-wechat-mch-id
WECHAT_PAY_API_KEY=your-wechat-api-key

# 第三方服务
SENDGRID_API_KEY=your-sendgrid-key
FIREBASE_PROJECT_ID=your-firebase-project
SENTRY_DSN=your-sentry-dsn

# 游戏配置
MAX_GAME_DURATION=3600
DEFAULT_TURN_TIME=30
MAX_PLAYERS_PER_GAME=8

# 监控
METRICS_ENABLED=true
METRICS_PORT=9090
LOG_LEVEL=info
```

---

## 监控与日志

### 日志配置

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'toweroffate' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

module.exports = logger;
```

### 备份脚本

```bash
#!/bin/bash
# scripts/backup.sh

BACKUP_DIR="/backups/toweroffate"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

# 创建备份目录
mkdir -p $BACKUP_DIR

# MongoDB备份
mongodump --host mongo:27017 --db toweroffate --out $BACKUP_DIR/mongo_$DATE

# Redis备份
redis-cli BGSAVE
cp /data/redis/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# 压缩备份
cd $BACKUP_DIR
tar -czf backup_$DATE.tar.gz mongo_$DATE redis_$DATE.rdb

# 删除旧备份
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "mongo_*" -mtime +$RETENTION_DAYS -exec rm -rf {} \;

# 上传到S3 (可选)
# aws s3 cp $BACKUP_DIR/backup_$DATE.tar.gz s3://your-bucket/backups/

echo "Backup completed: backup_$DATE.tar.gz"
```

---

## 故障排查

### 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 应用无法启动 | 依赖缺失 | 运行 `npm install` |
| 数据库连接失败 | MongoDB未启动 | 检查 MongoDB 服务状态 |
| 内存不足 | 内存泄漏 | 重启服务，检查代码 |
| 高延迟 | 数据库查询慢 | 检查索引，优化查询 |
| 连接数过高 | 连接未释放 | 检查连接池配置 |

### 诊断命令

```bash
# 检查服务状态
docker-compose ps
docker-compose logs -f app

# 检查MongoDB
mongo --eval "db.serverStatus()"

# 检查Redis
redis-cli INFO

# 网络诊断
netstat -tlnp
curl -v http://localhost:3000/health

# 性能分析
pm2 monit
htop
```

---

## 安全清单

- [ ] 修改所有默认密码
- [ ] 配置防火墙规则
- [ ] 启用SSL/TLS
- [ ] 设置DDoS防护
- [ ] 配置日志审计
- [ ] 定期安全扫描
- [ ] 数据库访问控制
- [ ] 敏感数据加密

---

## 联系与支持

如有部署问题，请联系：

- 技术支持: support@tower-of-fate.com
- 紧急热线: +86-xxx-xxxx-xxxx
- 文档: https://docs.tower-of-fate.com
