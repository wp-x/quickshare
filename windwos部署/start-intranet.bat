@echo off
chcp 65001 >nul
echo ========================================
echo HTML-Go Express 内网部署启动脚本
echo ========================================

echo.
echo 正在配置内网访问环境...

REM 设置环境变量
set NODE_ENV=production
set PORT=8888
set HOST=0.0.0.0
set AUTH_ENABLED=true
set AUTH_PASSWORD=admin123

echo.
echo 环境配置:
echo - 运行环境: %NODE_ENV%
echo - 监听端口: %PORT%
echo - 监听地址: %HOST% (允许内网访问)
echo - 认证功能: %AUTH_ENABLED%
echo - 登录密码: %AUTH_PASSWORD%

echo.
echo 正在启动应用...
echo.
echo ========================================
echo 应用启动后，内网其他设备可通过以下方式访问:
echo 1. 查看控制台输出的内网IP地址
echo 2. 在其他设备浏览器中输入: http://内网IP:8888
echo 3. 使用密码 %AUTH_PASSWORD% 登录
echo ========================================
echo.

REM 启动应用
node --max-old-space-size=1024 app.js

pause 