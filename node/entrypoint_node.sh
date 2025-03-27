#!/bin/bash
# 修复 dpkg
sudo dpkg --configure -a

# 安装 tmux
sudo apt-get update
sudo apt-get install -y tmux
echo "清理所有 tmux 会话..."
tmux kill-server 2>/dev/null || true

# 启动 Python 程序
sudo apt-get install -y python3-venv
python3 -m venv venv
source venv/bin/activate
pip install requests pymongo python-dotenv

# 创建新的 tmux 会话并运行 Python 程序
echo "正在启动 Python 程序..."
# 创建新的 tmux 会话
tmux new-session -d -s python_server
if [ $? -ne 0 ]; then
    echo "创建 Python tmux 会话失败"
    exit 1
fi

# 在会话中执行命令
echo "正在执行 Python 命令..."
tmux send-keys -t python_server "python3 init_db.py" C-m
tmux send-keys -t python_server "python3 hot_search.py" C-m

# 等待 Python 程序启动
echo "等待 Python 程序启动..."
sleep 5

# 启动 Node.js 服务器
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# 创建新的 tmux 会话并运行 Node.js 服务器
echo "正在启动 Node.js 服务器..."
tmux new-session -d -s node_server "cd /home/anjier307/Html/node && npm run start"
if [ $? -ne 0 ]; then
    echo "Node.js 服务器启动失败"
    exit 1
fi

# 等待命令执行
sleep 2

# 检查会话是否存在并显示输出
if tmux has-session -t python_server 2>/dev/null; then
    echo "Python 程序会话已创建"
    echo "Python 程序输出："
    tmux capture-pane -t python_server -p
else
    echo "Python 程序会话创建失败"
fi

if tmux has-session -t node_server 2>/dev/null; then
    echo "Node.js 服务器会话已创建"
else
    echo "Node.js 服务器会话创建失败"
fi

echo "使用以下命令查看程序输出："
echo "tmux attach -t python_server  # 查看 Python 程序"
echo "tmux attach -t node_server  # 查看 Node.js 服务器"
echo "使用 Ctrl+b 然后按 d 可以分离会话"
echo "保持容器前台运行..."
tail -f /dev/null  # 无限阻塞