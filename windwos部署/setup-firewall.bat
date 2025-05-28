@echo off
echo ========================================
echo HTML-Go Express 防火墙配置脚本
echo ========================================
echo.
echo 此脚本将配置 Windows 防火墙以允许端口 8888 的访问
echo 需要管理员权限运行
echo.

REM 检查管理员权限
net session >nul 2>&1
if %errorLevel% == 0 (
    echo 检测到管理员权限，继续配置...
) else (
    echo 错误: 需要管理员权限运行此脚本
    echo 请右键点击此文件，选择"以管理员身份运行"
    pause
    exit /b 1
)

echo.
echo 正在配置防火墙规则...

REM 删除可能存在的旧规则
netsh advfirewall firewall delete rule name="HTML-Go Express" >nul 2>&1

REM 添加入站规则
netsh advfirewall firewall add rule name="HTML-Go Express" dir=in action=allow protocol=TCP localport=8888
if %errorlevel% == 0 (
    echo ✓ 入站规则添加成功
) else (
    echo ✗ 入站规则添加失败
)

REM 添加出站规则（可选）
netsh advfirewall firewall add rule name="HTML-Go Express Out" dir=out action=allow protocol=TCP localport=8888
if %errorlevel% == 0 (
    echo ✓ 出站规则添加成功
) else (
    echo ✗ 出站规则添加失败
)

echo.
echo 防火墙配置完成！
echo 端口 8888 现在可以被内网其他设备访问
echo.

REM 显示当前防火墙规则
echo 当前相关防火墙规则:
netsh advfirewall firewall show rule name="HTML-Go Express"

echo.
echo 配置完成！现在可以运行 start-intranet.bat 启动应用
pause 