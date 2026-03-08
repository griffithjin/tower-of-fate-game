# 命运塔游戏测试套件

## 测试结构

```
tests/
├── unit/                    # 单元测试
│   ├── game-logic.test.js  # 游戏核心逻辑测试
│   ├── user.test.js        # 用户模型测试
│   └── utils.test.js       # 工具函数测试
├── integration/            # 集成测试
│   ├── api.test.js        # API接口测试
│   ├── payment.test.js    # 支付流程测试
│   └── redis.test.js      # Redis缓存测试
├── e2e/                   # 端到端测试
│   └── gameplay.test.js   # 游戏流程测试
└── setup.js              # 测试环境配置
```

## 运行测试

```bash
# 运行所有测试
npm test

# 运行单元测试
npm run test:unit

# 运行集成测试
npm run test:integration

# 运行特定测试文件
npm test -- tests/unit/game-logic.test.js

# 带覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

## 测试环境配置

测试使用以下内存数据库：
- **MongoDB**: mongodb-memory-server
- **Redis**: ioredis-mock

## 编写测试

### 单元测试示例

```javascript
const Game = require('../models/schemas/Game');

describe('游戏逻辑', () => {
    test('应该正确初始化', () => {
        const game = new Game({ roomId: 'TEST', mode: 'solo' });
        expect(game.status).toBe('waiting');
    });
});
```

### 集成测试示例

```javascript
const request = require('supertest');
const app = require('../server');

describe('API测试', () => {
    test('GET /api/users/profile', async () => {
        const res = await request(app)
            .get('/api/users/profile')
            .set('Authorization', 'Bearer token');
        expect(res.status).toBe(200);
    });
});
```

## 测试覆盖率目标

- 单元测试: ≥ 80%
- 集成测试: ≥ 60%
- 整体覆盖率: ≥ 70%

## 持续集成

测试在以下场景自动运行：
- Pull Request创建时
- 代码推送到 main 分支
- 每日定时构建

## 注意事项

1. 测试数据使用 faker.js 生成
2. 敏感信息使用环境变量
3. 测试后自动清理数据
4. 避免测试间相互影响
