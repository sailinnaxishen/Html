import requests
import time
from datetime import datetime, timedelta
import os
from pymongo import MongoClient
from dotenv import load_dotenv
import logging

# 加载环境变量
load_dotenv()

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('hot_search.log')
    ]
)

# MongoDB连接
MONGODB_URI = os.getenv(
    'MONGODB_URI', 
    'mongodb://hot_user:hot_password@localhost:27017/hot_search_db'
    '?authSource=hot_search_db'       # 认证源必须与用户所属库一致
    '&authMechanism=SCRAM-SHA-1'      # 强制指定 SHA-1 认证
    '&directConnection=true'          # 单节点模式必须添加
    '&connectTimeoutMS=30000'         # 30秒连接超时
)

MONGODB_OPTIONS = {
    'serverSelectionTimeoutMS': 30000,
    'socketTimeoutMS': 30000,
    'connectTimeoutMS': 30000,
    'retryWrites': True,
    'w': 'majority'
}

logging.info(f"最终使用的 MongoDB 连接字符串: {MONGODB_URI}")
try:
    client = MongoClient(MONGODB_URI, **MONGODB_OPTIONS)
    # 测试连接
    client.server_info()
    db = client.get_database()  # 使用URI中指定的数据库
    collection = db['hot_search']
    # 创建索引
    collection.create_index([("platform", 1), ("timestamp", -1)])
    logging.info("MongoDB连接成功")
except Exception as e:
    logging.error(f"MongoDB连接失败: {e}")
    raise

def get_bilibili_hot():
    url = "https://api.bilibili.com/x/web-interface/search/square?limit=50"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data["code"] == 0:
            hot_list = []
            current_time = datetime.now()
            for item in data["data"]["trending"]["list"]:
                hot_list.append({
                    "title": item["keyword"],
                    "hot": item.get("show_name", "0"),  # 使用show_name作为热度值，如果没有则默认为0
                    "url": f"https://search.bilibili.com/all?keyword={item['keyword']}",
                    "platform": "bilibili",
                    "timestamp": current_time
                })
            logging.info(f"成功获取 {len(hot_list)} 条B站热搜")
            return hot_list
    except requests.exceptions.RequestException as e:
        logging.error(f"获取B站热搜失败: {e}")
    except KeyError as e:
        logging.error(f"解析B站热搜数据失败: {e}")
    except Exception as e:
        logging.error(f"获取B站热搜时发生未知错误: {e}")
    return []

def get_weibo_hot():
    url = "https://weibo.com/ajax/side/hotSearch"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        if data["ok"] == 1:
            hot_list = []
            current_time = datetime.now()
            for item in data["data"]["realtime"][:52]:
                hot_list.append({
                    "title": item["note"],
                    "hot": item.get("num", "0"),  # 使用num作为热度值，如果没有则默认为0
                    "url": f"https://s.weibo.com/weibo?q={item['word']}",
                    "platform": "weibo",
                    "timestamp": current_time
                })
            logging.info(f"成功获取 {len(hot_list)} 条微博热搜")
            return hot_list
    except requests.exceptions.RequestException as e:
        logging.error(f"获取微博热搜失败: {e}")
    except KeyError as e:
        logging.error(f"解析微博热搜数据失败: {e}")
    except Exception as e:
        logging.error(f"获取微博热搜时发生未知错误: {e}")
    return []

def save_hot_data():
    try:
        # 获取并保存B站热搜
        bilibili_hot = get_bilibili_hot()
        if bilibili_hot:
            collection.insert_many(bilibili_hot)
            logging.info(f"成功保存 {len(bilibili_hot)} 条B站热搜数据")
        
        # 获取并保存微博热搜
        weibo_hot = get_weibo_hot()
        if weibo_hot:
            collection.insert_many(weibo_hot)
            logging.info(f"成功保存 {len(weibo_hot)} 条微博热搜数据")
        
        # 清理旧数据（保留最近24小时的数据）
        one_day_ago = datetime.now() - timedelta(days=1)
        result = collection.delete_many({"timestamp": {"$lt": one_day_ago}})
        if result.deleted_count > 0:
            logging.info(f"已清理 {result.deleted_count} 条24小时前的数据")
            
        logging.info(f"热搜数据更新完成 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    except Exception as e:
        logging.error(f"保存热搜数据失败: {e}")

if __name__ == "__main__":
    logging.info("热搜数据采集服务启动...")
    while True:
        try:
            save_hot_data()
            time.sleep(3600)  # 每小时更新一次
        except KeyboardInterrupt:
            logging.info("服务停止...")
            break
        except Exception as e:
            logging.error(f"发生未知错误: {e}")
            time.sleep(60)  # 发生错误时等待1分钟后重试 