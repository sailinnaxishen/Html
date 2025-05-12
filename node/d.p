# FROM python:3.9-slim

# WORKDIR /app

# # 安装系统依赖
# RUN apt-get update && apt-get install -y \
#     gcc \
#     && rm -rf /var/lib/apt/lists/*

# # 复制 requirements.txt
# COPY requirements.txt .

# # 安装 Python 依赖
# RUN pip install --no-cache-dir -r requirements.txt

# # 设置环境变量
# ENV PYTHONUNBUFFERED=1

# # 启动脚本
# CMD ["python", "hot_search.py"] 