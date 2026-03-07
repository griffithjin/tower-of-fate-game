/**
 * 命运塔 - 公会系统使用示例
 * Tower of Fate - Guild System Demo
 * 
 * 展示如何使用公会系统的完整功能
 * 
 * @author 小金蛇 🐍
 */

import GuildManager, { GUILD_ROLES, GUILD_TASK_TYPES } from './guild-system.js';

// 创建公会管理器实例
const guildManager = new GuildManager();

// ==================== 示例1: 创建公会 ====================
console.log('=== 示例1: 创建公会 ===');

const createResult = guildManager.createGuild('player_001', {
  name: '命运守护者',
  description: '征服命运之塔的最强公会！',
  badge: '🐉'
});

console.log('创建公会结果:', createResult.success ? '成功' : '失败');
console.log('公会信息:', createResult.guild);

// ==================== 示例2: 申请加入公会 ====================
console.log('\n=== 示例2: 申请加入公会 ===');

const guildId = createResult.guild.id;

// 多个玩家申请加入
const applicants = ['player_002', 'player_003', 'player_004'];
applicants.forEach(playerId => {
  const applyResult = guildManager.applyToJoin(playerId, guildId);
  console.log(`${playerId} 申请结果:`, applyResult.message);
});

// ==================== 示例3: 处理入会申请 ====================
console.log('\n=== 示例3: 处理入会申请 ===');

// 会长批准申请
applicants.forEach((playerId, index) => {
  const role = index === 0 ? GUILD_ROLES.VICE_LEADER : GUILD_ROLES.MEMBER;
  const approveResult = guildManager.handleApplication(guildId, 'player_001', playerId, true);
  console.log(`批准 ${playerId}:`, approveResult.message);
  
  // 设置职位
  if (role !== GUILD_ROLES.MEMBER) {
    guildManager.setMemberRole('player_001', playerId, role);
    console.log(`设置 ${playerId} 为副会长`);
  }
});

// ==================== 示例4: 添加贡献值 ====================
console.log('\n=== 示例4: 添加贡献值 ===');

const contributionResult = guildManager.addContribution('player_002', 500, 'donation');
console.log('贡献结果:', contributionResult);

// 批量添加贡献
for (let i = 1; i <= 5; i++) {
  guildManager.addContribution(`player_00${i}`, Math.floor(Math.random() * 300) + 100);
}

// ==================== 示例5: 查看公会信息 ====================
console.log('\n=== 示例5: 公会信息 ===');

const guildInfo = guildManager.getGuildInfo(guildId);
console.log('公会名称:', guildInfo.name);
console.log('公会等级:', guildInfo.level);
console.log('成员数量:', guildInfo.memberCount);
console.log('在线成员:', guildInfo.onlineCount);

// ==================== 示例6: 公会商店 ====================
console.log('\n=== 示例6: 公会商店 ===');

const shopResult = guildManager.getShopItems('player_001');
console.log('商店商品数量:', shopResult.items.length);
console.log('我的贡献:', shopResult.userContribution);
console.log('可购买商品:');
shopResult.items.slice(0, 3).forEach(item => {
  console.log(`  - ${item.name}: ${item.price}贡献值 (剩余:${item.remaining})`);
});

// ==================== 示例7: 公会聊天 ====================
console.log('\n=== 示例7: 公会聊天 ===');

// 发送消息
guildManager.sendChatMessage('player_001', '大家好！欢迎加入命运守护者！', 'general');
guildManager.sendChatMessage('player_002', '谢谢会长！', 'general');
guildManager.sendChatMessage('player_003', '有什么任务可以做吗？', 'general');

// 获取聊天记录
const chatHistory = guildManager.getChatHistory('player_001', 'general', 10);
console.log('最近聊天记录:');
chatHistory.messages.forEach(msg => {
  console.log(`  [${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.userName}: ${msg.content}`);
});

// ==================== 示例8: 创建公会任务 ====================
console.log('\n=== 示例8: 创建公会任务 ===');

// 创建团队任务
const taskResult = guildManager.createTask(guildId, {
  name: '击败命运守卫',
  description: '公会成员齐心协力击败100个命运守卫',
  type: GUILD_TASK_TYPES.WEEKLY,
  targetProgress: 100,
  isTeamTask: true,
  rewards: {
    contribution: 200,
    exp: 100,
    items: ['guild_chest_rare']
  }
});
console.log('创建任务结果:', taskResult.success);
console.log('任务名称:', taskResult.task.name);

// 创建个人任务
const dailyTaskResult = guildManager.createTask(guildId, {
  name: '每日捐献',
  description: '今日捐献任意金额',
  type: GUILD_TASK_TYPES.DAILY,
  targetProgress: 1,
  isTeamTask: false,
  rewards: {
    contribution: 50
  }
});

// ==================== 示例9: 更新任务进度 ====================
console.log('\n=== 示例9: 更新任务进度 ===');

const taskId = taskResult.task.id;

// 多个成员贡献进度
for (let i = 1; i <= 4; i++) {
  const progressResult = guildManager.updateTaskProgress(`player_00${i}`, taskId, 20);
  console.log(`player_00${i} 贡献进度: ${progressResult.progress}/${taskResult.task.targetProgress}`);
  if (progressResult.completed) {
    console.log('  ✅ 任务完成！');
  }
}

// ==================== 示例10: 创建第二个公会并进行公会战 ====================
console.log('\n=== 示例10: 公会战 ===');

// 创建敌对公会
const enemyGuildResult = guildManager.createGuild('enemy_001', {
  name: '黑暗军团',
  description: '来自深渊的力量',
  badge: '👹'
});

const enemyGuildId = enemyGuildResult.guild.id;

// 添加敌对公会成员
for (let i = 1; i <= 10; i++) {
  guildManager.applyToJoin(`enemy_${String(i).padStart(3, '0')}`, enemyGuildId);
  guildManager.handleApplication(enemyGuildId, 'enemy_001', `enemy_${String(i).padStart(3, '0')}`, true);
}

// 创建公会战
const battleResult = guildManager.createGuildBattle(guildId, enemyGuildId);
console.log('公会战创建:', battleResult.success);
console.log('战斗ID:', battleResult.battle.id);

// 双方报名
const battleId = battleResult.battle.id;

// 我方报名
for (let i = 1; i <= 4; i++) {
  guildManager.registerForBattle(`player_00${i}`, battleId, {
    name: `Player 00${i}`,
    power: Math.floor(Math.random() * 5000) + 5000
  });
}

// 敌方报名
for (let i = 1; i <= 4; i++) {
  guildManager.registerForBattle(`enemy_${String(i).padStart(3, '0')}`, battleId, {
    name: `Enemy ${i}`,
    power: Math.floor(Math.random() * 5000) + 5000
  });
}

// 开始战斗
const startResult = guildManager.startBattle(battleId);
console.log('\n战斗结果:');
console.log('胜利方:', startResult.result.winnerId === guildId ? '我方' : '敌方');
console.log('比分:', `${startResult.result.scoreA} : ${startResult.result.scoreB}`);
console.log('回合数:', startResult.result.rounds);

// ==================== 示例11: 排行榜 ====================
console.log('\n=== 示例11: 公会排行榜 ===');

guildManager.updateLeaderboard();
const leaderboard = guildManager.getLeaderboard(10);
console.log('排行榜:');
leaderboard.forEach(guild => {
  console.log(`  ${guild.rank}. ${guild.badge} ${guild.name} (Lv.${guild.level}) - 积分:${guild.score}`);
});

// ==================== 示例12: 公会基地 ====================
console.log('\n=== 示例12: 公会基地 ===');

const baseInfo = guildManager.getBaseInfo('player_001');
console.log('基地等级:', baseInfo.base.level);
console.log('建筑物:');
Object.entries(baseInfo.base.buildings).forEach(([key, building]) => {
  console.log(`  - ${building.name}: Lv.${building.level}`);
});

// 升级建筑
const upgradeResult = guildManager.upgradeBaseBuilding('player_001', 'hall');
console.log('升级大厅结果:', upgradeResult.success ? '成功' : upgradeResult.error);

// ==================== 示例13: 成员管理 ====================
console.log('\n=== 示例13: 成员管理 ===');

// 踢出成员
const kickResult = guildManager.kickMember('player_001', 'player_004');
console.log('踢出成员结果:', kickResult.success ? '成功' : kickResult.error);

// 获取贡献排行
const ranking = guildManager.getContributionRanking(guildId, 'total');
console.log('\n贡献排行:');
ranking.forEach((member, index) => {
  console.log(`  ${index + 1}. ${member.userId}: ${member.contribution}贡献 (${member.getRoleName()})`);
});

// ==================== 示例14: 获取公会列表 ====================
console.log('\n=== 示例14: 公会列表 ===');

const guildList = guildManager.getGuildList();
console.log('所有公会:');
guildList.forEach(guild => {
  console.log(`  ${guild.badge} ${guild.name} - Lv.${guild.level} (${guild.memberCount}/${guild.maxMembers})`);
});

// ==================== 示例15: 退出公会 ====================
console.log('\n=== 示例15: 退出公会 ===');

const leaveResult = guildManager.leaveGuild('player_003');
console.log('退出公会结果:', leaveResult.success ? '成功' : leaveResult.error);

// ==================== 示例16: 数据持久化 ====================
console.log('\n=== 示例16: 数据持久化 ===');

// 导出数据
const saveData = guildManager.toJSON();
console.log('数据导出成功');
console.log('公会数量:', Object.keys(saveData.guilds).length);
console.log('战斗数量:', Object.keys(saveData.battles).length);

// 模拟重新加载
const newManager = new GuildManager();
newManager.fromJSON(saveData);
console.log('数据加载成功');
console.log('恢复后的公会数量:', newManager.guilds.size);

// ==================== 示例17: 系统重置 ====================
console.log('\n=== 示例17: 系统重置 ===');

// 每日重置
const dailyResetResult = guildManager.dailyReset();
console.log('每日重置:', dailyResetResult.message);

// 每周重置
const weeklyResetResult = guildManager.weeklyReset();
console.log('每周重置:', weeklyResetResult.message);

// ==================== 总结 ====================
console.log('\n=== 示例运行完成 ===');
console.log('公会系统所有功能演示完毕！');
console.log('主要功能:');
console.log('  ✅ 公会创建/加入/退出');
console.log('  ✅ 公会等级系统（1-20级）');
console.log('  ✅ 公会成员管理（会长/副会长/精英/普通）');
console.log('  ✅ 公会战（每周公会vs公会）');
console.log('  ✅ 公会贡献系统');
console.log('  ✅ 公会商店（专属商品）');
console.log('  ✅ 公会聊天频道');
console.log('  ✅ 公会任务（团队任务）');
console.log('  ✅ 公会排行榜');
console.log('  ✅ 公会基地（虚拟空间）');
