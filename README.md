# HTML-Go Express

一个基于 Node.js 和 Express 框架的 HTML 代码分享工具，支持多种内容类型的在线分享和预览。

![dd376e4bef4758fe3472362ce910eeea](https://github.com/user-attachments/assets/1e237e3c-3c76-4af3-abb0-aeecc24bfa60)


## 🚀 功能特性

- **多格式支持**: 支持 HTML、Markdown、SVG、Mermaid 图表等多种内容类型
- **在线预览**: 实时渲染和预览分享的内容
- **密码保护**: 支持为分享的内容设置密码保护
- **多级权限系统**: 支持普通用户和管理员两种权限级别
- **管理后台**: 完整的管理界面，支持页面管理和统计
- **语法高亮**: 内置代码语法高亮功能
- **用户认证**: 可选的用户认证系统
- **响应式设计**: 支持桌面和移动设备访问
- **数据持久化**: 使用 SQLite 数据库存储数据
- **会话管理**: 基于文件的会话存储

## 🛠️ 技术栈

- **后端**: Node.js, Express.js
- **模板引擎**: EJS
- **数据库**: SQLite3
- **前端**: HTML5, CSS3, JavaScript
- **图表渲染**: Mermaid.js
- **Markdown解析**: Marked.js
- **代码高亮**: Highlight.js

## 📋 系统要求

- Node.js 16.x 或更高版本
- Windows 10/11, macOS, 或 Linux
- 至少 512MB 可用内存
- 至少 100MB 可用磁盘空间

## 🚀 快速开始

Docker 部署

#### 使用 Docker Compose（推荐）

1. **克隆项目**
   ```bash
   git clone https://github.com/EEEricG/quickshare.git
   cd quickshare
   ```

2. **启动服务**
   ```bash
   docker-compose up -d
   ```

3. **查看日志**
   ```bash
   docker-compose logs -f
   ```

4. **访问应用**
   ```
   http://localhost:8888
   ```

#### 使用 Docker 命令

1. **构建镜像**
   ```bash
   docker build -t html-go-express .
   ```

2. **创建数据卷**
   ```bash
   docker volume create html-go-data
   ```

3. **运行容器**
   ```bash
   docker run -d \
     --name html-go-express \
     -p 8888:8888 \
     -v html-go-data:/usr/src/app/data \
     -e NODE_ENV=production \
     -e AUTH_ENABLED=true \
     -e AUTH_PASSWORD=your_password \
     --restart unless-stopped \
     html-go-express
   ```

## ⚙️ 配置选项

### 环境变量

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `NODE_ENV` | `development` | 运行环境 (development/production/test) |
| `PORT` | `5678` | 应用端口 |
| `HOST` | `localhost` | 监听地址 (设置为 0.0.0.0 允许外部访问) |
| `AUTH_ENABLED` | `false` | 是否启用认证功能 |
| `AUTH_PASSWORD` | `admin123` | 登录密码（向后兼容，作为管理员密码） |
| `ADMIN_PASSWORD` | `admin123` | 管理员密码（完全权限） |
| `USER_PASSWORD` | `user123` | 普通用户密码（只能发布HTML） |

### 配置文件

复制 `env.example` 为 `.env` 并根据需要修改：

```env
NODE_ENV=production
PORT=8888
HOST=0.0.0.0
AUTH_ENABLED=true
AUTH_PASSWORD=your_secure_admin_password
ADMIN_PASSWORD=your_secure_admin_password
USER_PASSWORD=your_secure_user_password
```

## 📖 使用说明

### 多级权限系统

系统支持两种用户类型，提供不同的功能权限：

#### 普通用户权限 (user)
- ✅ 登录系统
- ✅ 创建和分享HTML/Markdown/SVG/Mermaid内容
- ✅ 设置密码保护
- ❌ 无法看到管理页面按钮
- ❌ 无法访问管理功能

#### 管理员权限 (admin)
- ✅ 所有普通用户权限
- ✅ 访问管理页面
- ✅ 查看所有页面列表和统计信息
- ✅ 查看受保护页面的访问密码
- ✅ 删除任意页面（单个或批量）
- ✅ 管理系统设置

### 基本使用

1. **访问应用**: 在浏览器中打开 `http://localhost:8888`
2. **登录**: 如果启用了认证，使用配置的密码登录
   - 使用管理员密码：获得完全权限，可以看到管理页面按钮
   - 使用普通用户密码：只能创建和分享内容
3. **创建分享**: 在主页面粘贴或上传您的代码内容
4. **设置保护**: 可选择为内容设置密码保护
5. **分享链接**: 获取生成的分享链接
6. **管理内容**: 管理员可以通过管理页面查看和管理所有内容

### 支持的内容类型

- **HTML**: 完整的 HTML 文档或代码片段
- **Markdown**: 标准 Markdown 语法
- **SVG**: 可缩放矢量图形
- **Mermaid**: 流程图、序列图、类图等

### API 接口

#### 创建页面
```http
POST /api/pages/create
Content-Type: application/json

{
  "htmlContent": "your content here",
  "isProtected": true
}
```

#### 获取页面
```http
GET /view/:id?password=your_password
```

#### 管理API（需要管理员权限）

**获取页面列表**
```http
GET /api/admin/pages?page=1&limit=10&search=keyword
```

**删除单个页面**
```http
DELETE /api/admin/pages/:id
```

**批量删除页面**
```http
POST /api/admin/pages/batch-delete
Content-Type: application/json

{
  "ids": ["page_id_1", "page_id_2"]
}
```

**获取统计信息**
```http
GET /api/admin/stats
```

## 🔧 高级配置

### 使用 PM2 管理进程

1. **安装 PM2**
   ```bash
   npm install -g pm2
   ```

2. **创建配置文件** (`ecosystem.config.js`)
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
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

### 反向代理配置

#### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8888;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🐳 Docker Desktop 部署详细说明

### 前提条件
- 安装 [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- 确保 Docker Desktop 正在运行

### 部署步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd quickshare
   ```

2. **使用 Docker Compose 部署**
   ```bash
   # 构建并启动服务
   docker-compose up -d --build
   
   # 查看服务状态
   docker-compose ps
   
   # 查看实时日志
   docker-compose logs -f html-go-express
   ```

3. **访问应用**
   - 打开浏览器访问: `http://localhost:8888`
   - 默认登录密码: `admin123`

### Docker 管理命令

```bash
# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 更新应用
git pull
docker-compose up -d --build

# 查看容器状态
docker-compose ps

# 进入容器
docker-compose exec html-go-express sh

# 查看数据卷
docker volume ls
docker volume inspect quickshare_html-go-data
```

### 自定义 Docker 配置

如需自定义配置，可以修改 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  html-go-express:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: html-go-express
    restart: unless-stopped
    ports:
      - "8888:8888"
    volumes:
      - html-go-data:/usr/src/app/data
      - html-go-sessions:/usr/src/app/sessions
      - html-go-db:/usr/src/app/db
    environment:
      - NODE_ENV=production
      - PORT=8888
      - AUTH_ENABLED=true
      - AUTH_PASSWORD=your_secure_admin_password  # 向后兼容
      - ADMIN_PASSWORD=your_secure_admin_password  # 管理员密码
      - USER_PASSWORD=your_secure_user_password    # 普通用户密码
      - HOST=0.0.0.0
    networks:
      - html-go-network

volumes:
  html-go-data:
    driver: local
  html-go-sessions:
    driver: local
  html-go-db:
    driver: local

networks:
  html-go-network:
    driver: bridge
```

## 🔒 安全建议

1. **修改默认密码**: 务必修改默认的认证密码
2. **权限分离**: 普通用户和管理员密码应该不同，确保权限隔离
3. **强密码策略**: 使用复杂的密码，特别是管理员密码
4. **定期更换密码**: 建议定期更换认证密码
5. **使用 HTTPS**: 生产环境建议配置 SSL/TLS
6. **防火墙配置**: 合理配置防火墙规则
7. **定期备份**: 定期备份数据库和会话文件
8. **更新依赖**: 定期更新 Node.js 依赖包
9. **权限审计**: 定期检查用户权限和访问日志
10. **管理员权限**: 谨慎分配管理员权限，避免权限滥用

## 📊 性能优化

- **内存限制**: 应用启动时设置了内存限制 `--max-old-space-size=1024`
- **语法高亮**: 大文件自动禁用语法高亮以提升性能
- **会话存储**: 使用文件存储会话，减少内存占用
- **静态资源**: 建议使用 CDN 或反向代理处理静态资源

## 🔧 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # Windows
   netstat -ano | findstr :8888
   taskkill /PID <进程ID> /F
   
   # Linux/macOS
   lsof -i :8888
   kill -9 <进程ID>
   ```

2. **权限问题**
   - 确保对项目目录有读写权限
   - Windows 用户可能需要以管理员身份运行

3. **依赖安装失败**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Docker 问题**
   ```bash
   # 清理 Docker 缓存
   docker system prune -a
   
   # 重新构建镜像
   docker-compose build --no-cache
   ```

## 📝 更新日志

### v2.1.0 - 多级权限系统
- ✨ 新增多级权限系统，支持普通用户和管理员两种权限
- ✨ 新增完整的管理后台界面
- ✨ 管理员可以查看所有页面列表和统计信息
- ✨ 管理员可以查看受保护页面的访问密码
- ✨ 支持单个和批量删除页面功能
- ✨ 新增页面标题提取和显示功能
- 🔧 优化了用户认证流程和权限控制
- 🔧 改进了数据库结构，添加了title字段
- 📚 完善了文档和配置说明

### v2.0.0 - 功能增强
- ✨ 添加了密码保护功能
- ✨ 支持多种内容类型（HTML、Markdown、SVG、Mermaid）
- ✨ 改进了用户界面和体验
- 🔧 优化了代码检测和渲染逻辑
- 🐳 完善了Docker部署支持

查看 [开发经验.md](./开发经验.md) 了解详细的开发历程和优化记录。

## 🤝 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 技术支持

如遇到问题，请检查：
1. Node.js 版本是否符合要求
2. 防火墙和网络配置
3. 文件权限设置
4. 系统资源使用情况

---

**快速链接**
- [开发经验总结](./开发经验.md)
- [多级权限系统更新说明](./多级权限系统更新说明.md)
- [管理页面功能说明](./管理页面功能说明.md)
