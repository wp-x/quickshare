# HTML-Go Express Windows 内网部署指南

## 项目简介

HTML-Go Express 是一个基于 Node.js 和 Express 框架的 HTML 代码分享工具，支持：
- HTML 代码在线分享和预览
- 密码保护功能
- 语法高亮显示
- 用户认证系统
- SQLite 数据库存储

## 系统要求

- Windows 10/11
- Node.js 16.x 或更高版本
- 至少 512MB 可用内存
- 至少 100MB 可用磁盘空间

## 部署方案

### 方案一：一键部署（推荐）

1. **下载并安装 Node.js**
   - 访问 https://nodejs.org
   - 下载 LTS 版本并安装
   - 安装时勾选 "Add to PATH" 选项

2. **运行部署脚本**
   ```cmd
   # 双击运行 windows-deploy.bat
   # 或在命令行中执行：
   windows-deploy.bat
   ```

3. **访问应用**
   - 打开浏览器访问：http://localhost:8888
   - 默认登录密码：admin123

### 方案二：手动部署

#### 1. 环境准备
```cmd
# 检查 Node.js 版本
node --version
npm --version
```

#### 2. 安装依赖
```cmd
npm install
```

#### 3. 创建必要目录
```cmd
mkdir db
mkdir sessions
mkdir data
```

#### 4. 配置环境变量
复制 `env.example` 为 `.env` 并修改配置：
```
NODE_ENV=production
PORT=8888
AUTH_ENABLED=true
AUTH_PASSWORD=your_secure_password
```

#### 5. 初始化数据库
```cmd
node -e "const {initDatabase} = require('./models/db'); initDatabase().then(() => console.log('数据库初始化完成')).catch(console.error);"
```

#### 6. 启动应用
```cmd
# 生产环境启动
npm run prod

# 或直接使用 node
node --max-old-space-size=1024 app.js
```

## 内网配置

### 1. 修改监听地址
如需在内网其他设备访问，修改 `app.js` 中的监听配置：

```javascript
// 在 app.js 末尾找到类似代码并修改
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
});
```

### 2. 防火墙配置
```cmd
# 允许端口 8888 通过防火墙
netsh advfirewall firewall add rule name="HTML-Go Express" dir=in action=allow protocol=TCP localport=8888
```

### 3. 获取内网 IP
```cmd
ipconfig
```
记录 IPv4 地址，其他设备可通过 `http://内网IP:8888` 访问

## 安全配置

### 1. 修改默认密码
编辑 `.env` 文件：
```
AUTH_PASSWORD=your_secure_password_here
```

### 2. 启用 HTTPS（可选）
如需 HTTPS，可使用反向代理（如 nginx）或修改应用代码添加 SSL 支持。

## 服务化部署

### 使用 PM2 管理进程

1. **安装 PM2**
```cmd
npm install -g pm2
```

2. **创建 PM2 配置文件** (`ecosystem.config.js`)
```javascript
module.exports = {
  apps: [{
    name: 'html-go-express',
    script: 'app.js',
    env: {
      NODE_ENV: 'production',
      PORT: 8888,
      AUTH_ENABLED: true,
      AUTH_PASSWORD: 'your_password'
    },
    max_memory_restart: '1G',
    instances: 1,
    exec_mode: 'fork'
  }]
};
```

3. **启动服务**
```cmd
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 使用 Windows 服务

1. **安装 node-windows**
```cmd
npm install -g node-windows
```

2. **创建服务脚本** (`install-service.js`)
```javascript
var Service = require('node-windows').Service;

var svc = new Service({
  name: 'HTML-Go Express',
  description: 'HTML代码分享工具',
  script: require('path').join(__dirname, 'app.js'),
  env: {
    name: "NODE_ENV",
    value: "production"
  }
});

svc.on('install', function(){
  svc.start();
});

svc.install();
```

3. **安装服务**
```cmd
node install-service.js
```

## 故障排除

### 常见问题

1. **端口被占用**
```cmd
# 查看端口占用
netstat -ano | findstr :8888
# 结束占用进程
taskkill /PID <进程ID> /F
```

2. **权限问题**
- 以管理员身份运行命令提示符
- 确保对项目目录有读写权限

3. **依赖安装失败**
```cmd
# 清除缓存重新安装
npm cache clean --force
npm install
```

4. **数据库权限问题**
- 确保 `db` 目录有写入权限
- 检查磁盘空间是否充足

### 日志查看

应用日志会输出到控制台，如使用 PM2：
```cmd
pm2 logs html-go-express
```

## 性能优化

### 1. 内存限制
应用启动时已设置内存限制：
```cmd
node --max-old-space-size=1024 app.js
```

### 2. 数据库优化
- 定期清理过期数据
- 考虑数据库备份策略

### 3. 静态资源缓存
生产环境建议配置反向代理处理静态资源。

## 备份与恢复

### 数据备份
```cmd
# 备份数据库
copy db\html-go.db backup\html-go-backup-%date%.db

# 备份会话文件
xcopy sessions backup\sessions\ /E /I
```

### 数据恢复
```cmd
# 恢复数据库
copy backup\html-go-backup-YYYY-MM-DD.db db\html-go.db

# 恢复会话文件
xcopy backup\sessions sessions\ /E /I
```

## 更新升级

1. **备份数据**
2. **拉取最新代码**
3. **安装新依赖**
```cmd
npm install
```
4. **重启应用**

## 技术支持

如遇到问题，请检查：
1. Node.js 版本是否符合要求
2. 防火墙和网络配置
3. 文件权限设置
4. 系统资源使用情况 