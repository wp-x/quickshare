@echo off
echo ========================================
echo HTML-Go Express Windows 部署脚本
echo ========================================

echo.
echo 1. 检查 Node.js 环境...
node --version
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo.
echo 2. 安装项目依赖...
npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 3. 创建必要的目录...
if not exist "db" mkdir db
if not exist "sessions" mkdir sessions
if not exist "data" mkdir data

echo.
echo 4. 设置环境变量...
set NODE_ENV=production
set PORT=8888
set AUTH_ENABLED=true
set AUTH_PASSWORD=admin123

echo.
echo 5. 初始化数据库...
node -e "const {initDatabase} = require('./models/db'); initDatabase().then(() => console.log('数据库初始化完成')).catch(console.error);"

echo.
echo 6. 启动应用...
echo 应用将在 http://localhost:8888 启动
echo 默认登录密码: admin123
echo 按 Ctrl+C 停止应用
echo.
node --max-old-space-size=1024 app.js

pause 