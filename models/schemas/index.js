/**
 * 模型Schema导出
 * 统一导出所有数据模型
 */

module.exports = {
    User: require('./User'),
    Game: require('./Game'),
    Order: require('./Order'),
    Tournament: require('./Tournament'),
    Guild: require('./Guild'),
    RedisSchemas: require('./RedisSchemas')
};
