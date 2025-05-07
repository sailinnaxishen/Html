# 构建阶段
FROM node:18-alpine as build-stage 

WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache python3 make g++

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 验证构建输出
RUN ls -la dist

# 生产阶段
FROM nginx:stable-alpine as production-stage

# 复制构建产物到 Nginx
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动 Nginx
CMD ["nginx", "-g", "daemon off;"] 