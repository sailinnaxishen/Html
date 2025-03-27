from pymongo import MongoClient
from bson import json_util
import json

# 连接到 MongoDB
MONGODB_URI = 'mongodb://hot_user:hot_password@localhost:27017/hot_search_db'
client = MongoClient(MONGODB_URI)

# 获取数据库
db = client.hot_search_db

# 获取所有集合名称
collections = db.list_collection_names()
print("数据库中的集合：")
print(collections)

# 遍历每个集合并显示数据
for collection_name in collections:
    collection = db[collection_name]
    print(f"\n{collection_name} 集合中的数据：")
    # 按时间戳降序排序
    for doc in collection.find().sort("timestamp", -1):
        # 使用 json_util.dumps 来处理 MongoDB 的特殊类型
        print(json_util.dumps(doc, ensure_ascii=False, indent=2))

client.close() 