#!/usr/bin/env node

/**
 * 命运塔游戏 - 源代码打包脚本
 * 
 * 用途: 生成软著申请所需的源代码包
 * 输出: source-package/ 目录
 * 
 * 使用: node scripts/generate-source-package.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const CONFIG = {
    projectName: '命运塔游戏软件',
    version: 'V1.0',
    outputDir: 'source-package',
    includeExtensions: ['.js', '.html', '.css', '.json', '.md'],
    excludeDirs: ['node_modules', '.git', 'logs', 'uploads', 'source-package'],
    excludeFiles: ['package-lock.json', '.env', '.env.local'],
    maxFileSize: 1024 * 1024, // 1MB
};

// 颜色输出
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
};

function log(message, type = 'info') {
    const color = type === 'success' ? colors.green : 
                  type === 'warning' ? colors.yellow : 
                  type === 'error' ? colors.red : colors.cyan;
    console.log(`${color}[${type.toUpperCase()}]${colors.reset} ${message}`);
}

function getFileStats(dir) {
    let totalFiles = 0;
    let totalLines = 0;
    let totalSize = 0;
    const fileTypes = {};

    function traverse(currentDir) {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (CONFIG.excludeDirs.includes(item)) continue;
                traverse(fullPath);
            } else {
                const ext = path.extname(item).toLowerCase();
                if (!CONFIG.includeExtensions.includes(ext)) continue;
                if (CONFIG.excludeFiles.includes(item)) continue;
                if (stat.size > CONFIG.maxFileSize) continue;

                totalFiles++;
                totalSize += stat.size;
                
                // 统计代码行数
                try {
                    const content = fs.readFileSync(fullPath, 'utf-8');
                    const lines = content.split('\n').length;
                    totalLines += lines;
                } catch (e) {
                    // 二进制文件跳过
                }

                // 按类型统计
                if (!fileTypes[ext]) {
                    fileTypes[ext] = { count: 0, lines: 0 };
                }
                fileTypes[ext].count++;
            }
        }
    }

    traverse(dir);
    return { totalFiles, totalLines, totalSize, fileTypes };
}

function copySourceFiles(srcDir, destDir) {
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    function traverse(currentDir, relativePath = '') {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const destPath = path.join(destDir, relativePath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (CONFIG.excludeDirs.includes(item)) continue;
                if (!fs.existsSync(destPath)) {
                    fs.mkdirSync(destPath, { recursive: true });
                }
                traverse(fullPath, path.join(relativePath, item));
            } else {
                const ext = path.extname(item).toLowerCase();
                if (!CONFIG.includeExtensions.includes(ext)) continue;
                if (CONFIG.excludeFiles.includes(item)) continue;
                if (stat.size > CONFIG.maxFileSize) continue;

                try {
                    fs.copyFileSync(fullPath, destPath);
                } catch (e) {
                    log(`复制失败: ${fullPath}`, 'warning');
                }
            }
        }
    }

    traverse(srcDir);
}

function generateReadme(stats) {
    const content = `# ${CONFIG.projectName} ${CONFIG.version}

## 软件说明

**软件名称**: ${CONFIG.projectName}  
**版本号**: ${CONFIG.version}  
**开发语言**: JavaScript / HTML / CSS  
**运行环境**: Node.js 18+ / MongoDB 5.0+  

## 代码统计

| 统计项 | 数值 |
|--------|------|
| 源程序文件数 | ${stats.totalFiles} 个 |
| 源代码行数 | ${stats.totalLines.toLocaleString()} 行 |
| 总代码量 | ${(stats.totalSize / 1024).toFixed(2)} KB |

## 文件类型分布

| 文件类型 | 文件数量 |
|----------|----------|
${Object.entries(stats.fileTypes).map(([ext, data]) => `| ${ext} | ${data.count} 个 |`).join('\n')}

## 目录结构

\`\`\`
${CONFIG.projectName}/
├── admin/              # 后台管理系统
├── web_client/         # Web客户端
├── server/             # 服务器端
├── routes/             # API路由
├── models/             # 数据模型
├── middleware/         # 中间件
├── services/           # 业务服务
├── utils/              # 工具函数
├── config/             # 配置文件
└── i18n/               # 国际化
\`\`\`

## 主要功能模块

1. **用户系统** - 注册、登录、个人信息管理
2. **游戏系统** - 卡牌对战、塔楼建造、排行榜
3. **商城系统** - 道具购买、背包管理
4. **支付系统** - 支付宝/微信支付集成
5. **锦标赛系统** - 比赛组织、奖金发放
6. **后台管理** - 数据看板、用户管理、配置管理

## 技术特点

- 基于 Node.js + Express 的高性能后端
- MongoDB 数据库存储
- Socket.io 实现实时对战
- JWT 身份认证
- 多语言国际化支持
- 响应式前端设计

## 版权声明

本软件著作权归开发者所有。

生成时间: ${new Date().toLocaleString('zh-CN')}
`;

    return content;
}

function generateFileList(srcDir, outputFile) {
    let fileList = [];

    function traverse(currentDir, relativePath = '') {
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const relPath = path.join(relativePath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                if (CONFIG.excludeDirs.includes(item)) continue;
                traverse(fullPath, relPath);
            } else {
                const ext = path.extname(item).toLowerCase();
                if (!CONFIG.includeExtensions.includes(ext)) continue;
                if (CONFIG.excludeFiles.includes(item)) continue;
                
                fileList.push({
                    path: relPath,
                    size: stat.size,
                    lines: 0
                });
            }
        }
    }

    traverse(srcDir);

    // 统计行数
    fileList.forEach(file => {
        try {
            const content = fs.readFileSync(path.join(srcDir, file.path), 'utf-8');
            file.lines = content.split('\n').length;
        } catch (e) {
            file.lines = 0;
        }
    });

    // 生成列表文件
    let content = `# 源程序文件列表

生成时间: ${new Date().toLocaleString('zh-CN')}

总计: ${fileList.length} 个文件

| 序号 | 文件路径 | 大小(字节) | 代码行数 |
|------|----------|-----------|----------|
`;

    fileList.forEach((file, index) => {
        content += `| ${index + 1} | ${file.path} | ${file.size} | ${file.lines} |\n`;
    });

    fs.writeFileSync(outputFile, content, 'utf-8');
    return fileList;
}

function main() {
    console.log(`${colors.bright}========================================${colors.reset}`);
    console.log(`${colors.bright}  ${CONFIG.projectName} 源代码打包工具${colors.reset}`);
    console.log(`${colors.bright}========================================${colors.reset}`);
    console.log();

    const rootDir = path.resolve(__dirname, '..');
    const outputPath = path.join(rootDir, CONFIG.outputDir);

    log('开始统计源代码...', 'info');
    const stats = getFileStats(rootDir);
    
    log(`源程序文件数: ${stats.totalFiles} 个`, 'success');
    log(`源代码行数: ${stats.totalLines.toLocaleString()} 行`, 'success');
    log(`总代码量: ${(stats.totalSize / 1024).toFixed(2)} KB`, 'success');
    console.log();

    log('清理旧输出目录...', 'info');
    if (fs.existsSync(outputPath)) {
        fs.rmSync(outputPath, { recursive: true });
    }
    fs.mkdirSync(outputPath, { recursive: true });

    log('复制源代码文件...', 'info');
    copySourceFiles(rootDir, outputPath);
    log('源代码复制完成', 'success');
    console.log();

    log('生成文件列表...', 'info');
    const fileListPath = path.join(outputPath, 'FILE_LIST.md');
    generateFileList(rootDir, fileListPath);
    log(`文件列表已保存: FILE_LIST.md`, 'success');

    log('生成 README...', 'info');
    const readmePath = path.join(outputPath, 'README.md');
    fs.writeFileSync(readmePath, generateReadme(stats), 'utf-8');
    log(`README 已保存: README.md`, 'success');
    console.log();

    // 生成 ZIP 包
    log('生成 ZIP 压缩包...', 'info');
    try {
        const zipName = `${CONFIG.projectName}_${CONFIG.version}_源代码`.replace(/\s+/g, '_');
        process.chdir(rootDir);
        execSync(`zip -r "${zipName}.zip" "${CONFIG.outputDir}"`, { stdio: 'ignore' });
        log(`ZIP 包已生成: ${zipName}.zip`, 'success');
    } catch (e) {
        log('ZIP 生成失败，请手动压缩', 'warning');
    }

    console.log();
    console.log(`${colors.bright}========================================${colors.reset}`);
    console.log(`${colors.green}✅ 源代码打包完成!${colors.reset}`);
    console.log(`${colors.bright}========================================${colors.reset}`);
    console.log();
    console.log(`输出目录: ${outputPath}`);
    console.log(`文件列表: ${fileListPath}`);
    console.log(`说明文档: ${readmePath}`);
    console.log();
    console.log(`${colors.yellow}提示: 请将 ${CONFIG.outputDir}/ 目录内容提交软著申请${colors.reset}`);
}

// 运行
main();
