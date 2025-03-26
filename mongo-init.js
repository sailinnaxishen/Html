// 创建数据库、用户
db = db.getSiblingDB('hot_search_db');
db.createUser({
  user: 'hot_user',
  pwd: 'hot_password',
  roles: [
    {
      role: 'readWrite',
      db: 'hot_search_db'
    },
    {
      role: 'dbAdmin',
      db: 'hot_search_db'
    }
  ],
  mechanisms: ['SCRAM-SHA-1']
});
// 创建必要的集合
db.createCollection('hot_search');
db.createCollection('files');
// 创建索引
db.hot_search.createIndex({ platform: 1, timestamp: -1 });
db.files.createIndex({ filename: 1 }); 