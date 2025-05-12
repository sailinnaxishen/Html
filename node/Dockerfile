FROM node:18-alpine

WORKDIR /app

# 安装 Node.js 依赖
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 安装 Python3 和 pip
RUN apk add --no-cache python3 py3-pip gcc musl-dev

# 复制 Node.js 源码
COPY . .

# 创建虚拟环境并安装 Python 依赖
RUN python3 -m venv /venv \
    && . /venv/bin/activate \
    && pip install --no-cache-dir -r requirements.txt

# 创建上传目录
RUN mkdir -p uploads

# 暴露端口
EXPOSE 3000

# 启动 Node.js 和 Python 热搜脚本
CMD ["sh", "-c", "npm start & /venv/bin/python3 hot_search.py"] 