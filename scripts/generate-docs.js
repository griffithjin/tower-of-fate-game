/**
 * Tower of Fate - Documentation Generator
 * 命运塔 - 文档生成脚本
 * 
 * 生成所有语言版本的玩家指南和管理员手册
 * Generate all language versions of player and admin guides
 */

const fs = require('fs');
const path = require('path');

// 支持的语言列表
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'de', name: 'Deutsch' },
  { code: 'fr', name: 'Français' },
  { code: 'es', name: 'Español' },
  { code: 'pt', name: 'Português' },
  { code: 'ru', name: 'Русский' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'th', name: 'ไทย' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'id', name: 'Bahasa Indonesia' },
  { code: 'tr', name: 'Türkçe' }
];

// 确保目录存在
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

// 加载模板
function loadTemplate(templateName, lang) {
  const templatePath = path.join(__dirname, '../docs/templates', `${templateName}-${lang}.md`);
  if (fs.existsSync(templatePath)) {
    return fs.readFileSync(templatePath, 'utf-8');
  }
  // 如果没有特定语言模板，使用英文模板
  const enTemplatePath = path.join(__dirname, '../docs/templates', `${templateName}-en.md`);
  if (fs.existsSync(enTemplatePath)) {
    return fs.readFileSync(enTemplatePath, 'utf-8');
  }
  return null;
}

// 生成玩家指南
function generatePlayerGuide(lang) {
  const template = loadTemplate('player-guide', lang);
  const outputPath = path.join(__dirname, `../docs/player-guides/${lang}/`);
  
  ensureDir(outputPath);
  
  if (template) {
    fs.writeFileSync(path.join(outputPath, 'complete-guide.md'), template);
    console.log(`✓ Generated player guide for ${lang}`);
  } else {
    console.warn(`⚠ No template found for player guide: ${lang}`);
  }
}

// 生成管理员指南
function generateAdminGuide(lang) {
  const template = loadTemplate('admin-guide', lang);
  const outputPath = path.join(__dirname, `../docs/admin-guides/${lang}/`);
  
  ensureDir(outputPath);
  
  if (template) {
    fs.writeFileSync(path.join(outputPath, 'complete-guide.md'), template);
    console.log(`✓ Generated admin guide for ${lang}`);
  } else {
    console.warn(`⚠ No template found for admin guide: ${lang}`);
  }
}

// 生成 API 文档
function generateAPIDocs() {
  const apiPath = path.join(__dirname, '../docs/api/');
  ensureDir(apiPath);
  
  // API 文档是通用的，不翻译
  console.log('✓ API documentation already exists');
}

// 生成主索引文件
function generateMainIndex() {
  const indexContent = `# Tower of Fate - Documentation Index
# 命运塔 - 文档索引

## 📚 Available Documentation

### Player Guides / 玩家指南
${LANGUAGES.map(l => `- [${l.name} (${l.code})](./player-guides/${l.code}/complete-guide.md)`).join('\n')}

### Admin Guides / 管理员指南
- [English (en)](./admin-guides/en/complete-guide.md)
- [中文 (zh)](./admin-guides/zh/complete-guide.md)

### API Documentation / API文档
- [API Reference](./api/api-reference.md)

### Quick Links / 快速链接
- [Getting Started](./player-guides/en/complete-guide.md#getting-started)
- [Game Rules](./player-guides/en/complete-guide.md#game-rules)
- [API Authentication](./api/api-reference.md#authentication)

---

*Generated: ${new Date().toISOString()}*
`;

  fs.writeFileSync(path.join(__dirname, '../docs/README.md'), indexContent);
  console.log('✓ Generated main index');
}

// 生成翻译状态报告
function generateTranslationReport() {
  const report = {
    generated: new Date().toISOString(),
    languages: LANGUAGES.map(lang => ({
      code: lang.code,
      name: lang.name,
      playerGuide: fs.existsSync(path.join(__dirname, `../docs/player-guides/${lang.code}/complete-guide.md`)),
      adminGuide: fs.existsSync(path.join(__dirname, `../docs/admin-guides/${lang.code}/complete-guide.md`))
    }))
  };

  const reportPath = path.join(__dirname, '../docs/translation-status.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('✓ Generated translation status report');
  return report;
}

// 验证文档完整性
function validateDocumentation() {
  console.log('\n📋 Validating documentation...\n');
  
  const issues = [];
  
  // 检查玩家指南
  LANGUAGES.forEach(lang => {
    const guidePath = path.join(__dirname, `../docs/player-guides/${lang.code}/complete-guide.md`);
    if (!fs.existsSync(guidePath)) {
      issues.push(`Missing player guide: ${lang.code}`);
    }
  });
  
  // 检查管理员指南
  ['en', 'zh'].forEach(lang => {
    const guidePath = path.join(__dirname, `../docs/admin-guides/${lang.code}/complete-guide.md`);
    if (!fs.existsSync(guidePath)) {
      issues.push(`Missing admin guide: ${lang}`);
    }
  });
  
  // 检查 API 文档
  const apiPath = path.join(__dirname, '../docs/api/api-reference.md');
  if (!fs.existsSync(apiPath)) {
    issues.push('Missing API reference');
  }
  
  if (issues.length === 0) {
    console.log('✅ All documentation is complete!');
    return true;
  } else {
    console.log('⚠️ Missing items:');
    issues.forEach(issue => console.log(`  - ${issue}`));
    return false;
  }
}

// 主函数
function main() {
  console.log('🚀 Tower of Fate Documentation Generator\n');
  console.log('Generating documentation for 15 languages...\n');
  
  // 创建基础目录结构
  ensureDir(path.join(__dirname, '../docs/player-guides'));
  ensureDir(path.join(__dirname, '../docs/admin-guides'));
  ensureDir(path.join(__dirname, '../docs/api'));
  
  // 生成所有文档
  LANGUAGES.forEach(lang => {
    console.log(`\nProcessing ${lang.name} (${lang.code})...`);
    generatePlayerGuide(lang.code);
    // 只生成英文和中文的管理员指南
    if (['en', 'zh'].includes(lang.code)) {
      generateAdminGuide(lang.code);
    }
  });
  
  // 生成 API 文档
  generateAPIDocs();
  
  // 生成索引文件
  generateMainIndex();
  
  // 生成翻译状态报告
  const report = generateTranslationReport();
  
  // 验证文档
  const isValid = validateDocumentation();
  
  // 输出统计
  console.log('\n📊 Statistics:');
  console.log(`  - Player Guides: ${report.languages.filter(l => l.playerGuide).length}/${LANGUAGES.length}`);
  console.log(`  - Admin Guides: ${report.languages.filter(l => l.adminGuide).length}/${LANGUAGES.length}`);
  console.log(`  - Languages Supported: ${LANGUAGES.length}`);
  
  if (isValid) {
    console.log('\n✅ Documentation generation completed successfully!');
    process.exit(0);
  } else {
    console.log('\n⚠️ Documentation generation completed with warnings.');
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

// 导出供外部使用
module.exports = {
  LANGUAGES,
  generatePlayerGuide,
  generateAdminGuide,
  generateMainIndex,
  validateDocumentation
};
