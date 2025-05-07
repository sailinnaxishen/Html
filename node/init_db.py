from pymongo import MongoClient
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)

# MongoDB连接
MONGODB_URI = 'mongodb://hot_user:hot_password@localhost:27017/hot_search_db'

try:
    # 连接到MongoDB
    client = MongoClient(MONGODB_URI)
    
    # 创建数据库
    db = client['hot_search_db']
    
    # 创建集合
    hot_search_collection = db['hot_search']
    files_collection = db['files']
    
    # 创建索引
    hot_search_collection.create_index([("platform", 1), ("timestamp", -1)])
    files_collection.create_index([("filename", 1)])
    
    logging.info("数据库初始化成功！")
    
except Exception as e:
    logging.error(f"数据库初始化失败: {e}")
    raise
finally:
    client.close() 