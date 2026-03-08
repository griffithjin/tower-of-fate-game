/**
 * 健康检查模块
 * 提供各组件健康状态检测
 */
const mongoose = require('mongoose');
const redis = require('../config/redis');

class HealthChecker {
    constructor() {
        this.checks = new Map();
        this.registerDefaultChecks();
    }

    registerDefaultChecks() {
        // MongoDB健康检查
        this.register('mongodb', async () => {
            const state = mongoose.connection.readyState;
            // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
            return {
                status: state === 1 ? 'healthy' : 'unhealthy',
                connected: state === 1,
                state: ['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown'
            };
        });

        // Redis健康检查
        this.register('redis', async () => {
            try {
                const start = Date.now();
                await redis.ping();
                const latency = Date.now() - start;
                
                return {
                    status: 'healthy',
                    connected: true,
                    latency: `${latency}ms`
                };
            } catch (error) {
                return {
                    status: 'unhealthy',
                    connected: false,
                    error: error.message
                };
            }
        });

        // 内存使用检查
        this.register('memory', async () => {
            const usage = process.memoryUsage();
            const heapUsedMB = Math.round(usage.heapUsed / 1024 / 1024);
            const heapTotalMB = Math.round(usage.heapTotal / 1024 / 1024);
            const percentUsed = Math.round((usage.heapUsed / usage.heapTotal) * 100);
            
            return {
                status: percentUsed > 90 ? 'warning' : 'healthy',
                heapUsed: `${heapUsedMB}MB`,
                heapTotal: `${heapTotalMB}MB`,
                percentUsed: `${percentUsed}%`
            };
        });

        // 磁盘空间检查 (需要额外实现)
        this.register('disk', async () => {
            // 这里可以使用 diskusage 库
            return {
                status: 'healthy',
                message: 'Disk check not implemented'
            };
        });
    }

    register(name, checkFn) {
        this.checks.set(name, checkFn);
    }

    async check(name) {
        const checkFn = this.checks.get(name);
        if (!checkFn) {
            throw new Error(`Health check '${name}' not found`);
        }

        const start = Date.now();
        try {
            const result = await checkFn();
            result.responseTime = `${Date.now() - start}ms`;
            return result;
        } catch (error) {
            return {
                status: 'unhealthy',
                error: error.message,
                responseTime: `${Date.now() - start}ms`
            };
        }
    }

    async checkAll() {
        const results = {};
        let overallStatus = 'healthy';

        for (const [name, checkFn] of this.checks) {
            results[name] = await this.check(name);
            if (results[name].status === 'unhealthy') {
                overallStatus = 'unhealthy';
            } else if (results[name].status === 'warning' && overallStatus === 'healthy') {
                overallStatus = 'warning';
            }
        }

        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: process.env.npm_package_version || 'unknown',
            nodeVersion: process.version,
            checks: results
        };
    }
}

// 导出单例
module.exports = new HealthChecker();
