const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const path = require('path');
require('dotenv').config();

// 导入配置
const connectDB = require('./config/database');

// 导入路由
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/game');
const shopRoutes = require('./routes/shop');
const tournamentRoutes = require('./routes/tournament');
const paymentRoutes = require('./routes/payment');
const pointsRoutes = require('./routes/points');
const adminRoutes = require('./routes/admin');

// 导入 Socket.io 处理器
const gameSocketHandler = require('./socket/gameHandler');
const adminSocketHandler = require('./socket/adminHandler');

// 初始化 Express
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:8080'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// 连接数据库
connectDB();

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: false // 开发环境禁用 CSP
}));

// CORS 配置
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 压缩响应
app.use(compression());

// 日志
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// 解析 JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  duration: parseInt(process.env.RATE_LIMIT_WINDOW_MS) / 1000 || 900 // 15分钟
});

app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      success: false,
      message: '请求过于频繁，请稍后重试'
    });
  }
});

// API 路由
app.use('/api/users', userRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/tournament', tournamentRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/admin', adminRoutes);

// 静态文件 - 管理后台
app.use('/admin', express.static(path.join(__dirname, 'admin')));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// API 文档路由（简单版）
app.get('/api', (req, res) => {
  res.json({
    name: '命运塔游戏 API',
    version: '1.0.0',
    description: 'Tower of Destiny Game API',
    endpoints: {
      users: '/api/users',
      game: '/api/game',
      shop: '/api/shop',
      tournament: '/api/tournament',
      payment: '/api/payment',
      points: '/api/points'
    },
    documentation: 'https://docs.fatetower.game'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API 端点不存在'
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 初始化 Socket.io
gameSocketHandler(io);
const adminSocket = adminSocketHandler(io);

// 将 io 实例挂载到 app，供路由使用
app.set('io', io);
app.set('adminSocket', adminSocket);

// 启动服务器
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║     🏰 命运塔游戏后端 API 服务器已启动 🏰                    ║
║                                                            ║
║   环境: ${(process.env.NODE_ENV || 'development').padEnd(42)}║
║   端口: ${PORT.toString().padEnd(42)}║
║   API:  http://localhost:${PORT}/api${' '.repeat(23)}║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});

module.exports = { app, server };
