# HTML-Go Express Docker Desktop 部署指南

本指南专门针对在有互联网连接的本地电脑上使用 Docker Desktop 部署 HTML-Go Express 应用。

## 🐳 前提条件

### 1. 安装 Docker Desktop

#### Windows 用户
1. 访问 [Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
2. 下载并安装 Docker Desktop
3. 启动 Docker Desktop
4. 确保 WSL 2 已启用（推荐）

#### macOS 用户
1. 访问 [Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
2. 根据您的芯片类型（Intel 或 Apple Silicon）下载对应版本
3. 安装并启动 Docker Desktop

#### Linux 用户
1. 访问 [Docker Desktop for Linux](https://docs.docker.com/desktop/install/linux-install/)
2. 按照发行版说明安装

### 2. 验证安装

打开终端/命令提示符，运行以下命令验证安装：

```bash
docker --version
docker-compose --version
```

应该看到类似输出：
```
Docker version 24.0.x, build xxxxx
Docker Compose version v2.x.x
```

## 🚀 快速部署

### 方法一：使用 Docker Compose（推荐）

1. **获取项目代码**
   ```bash
   # 如果有 Git
   git clone <repository-url>
   cd quickshare
   
   # 或者下载 ZIP 文件并解压
   ```

2. **启动服务-推荐⬇️**
   ```bash
   docker-compose up -d
   ```

3. **验证部署**
   ```bash
   # 查看容器状态
   docker-compose ps
   
   # 查看日志
   docker-compose logs -f
   ```

4. **访问应用**
   - 打开浏览器访问：`http://localhost:8888`
   - 默认登录密码：`admin123`

### 方法二：使用 Docker 命令

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
     -e AUTH_PASSWORD=admin123 \
     --restart unless-stopped \
     html-go-express
   ```

## ⚙️ 自定义配置

### 修改 docker-compose.yml

创建自定义的 `docker-compose.override.yml` 文件：

```yaml
version: '3.8'

services:
  html-go-express:
    environment:
      - AUTH_PASSWORD=your_secure_password  # 修改为您的密码
      - PORT=8888
      - HOST=0.0.0.0
    ports:
      - "8888:8888"  # 可以修改外部端口，如 "3000:8888"
```

### 环境变量配置

支持的环境变量：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `NODE_ENV` | `production` | 运行环境 |
| `PORT` | `8888` | 容器内端口 |
| `HOST` | `0.0.0.0` | 监听地址 |
| `AUTH_ENABLED` | `true` | 是否启用认证 |
| `AUTH_PASSWORD` | `admin123` | 登录密码 |

## 🔧 管理操作

### 基本操作

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看服务状态
docker-compose ps

# 查看实时日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f html-go-express
```

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose up -d --build

# 或者强制重新构建
docker-compose build --no-cache
docker-compose up -d
```

### 数据管理

```bash
# 查看数据卷
docker volume ls

# 查看数据卷详情
docker volume inspect quickshare_html-go-data

# 备份数据
docker run --rm \
  -v quickshare_html-go-data:/data \
  -v $(pwd):/backup \
  alpine tar -czvf /backup/backup-$(date +%Y%m%d-%H%M%S).tar.gz /data

# 恢复数据（谨慎操作）
docker run --rm \
  -v quickshare_html-go-data:/data \
  -v $(pwd):/backup \
  alpine sh -c "rm -rf /data/* && tar -xzvf /backup/backup-YYYYMMDD-HHMMSS.tar.gz -C /"
```

## 🌐 网络配置

### 内网访问配置

默认配置已支持内网访问，容器启动后会显示所有可用的访问地址。

### 自定义端口

如果 8888 端口被占用，可以修改 `docker-compose.yml`：

```yaml
services:
  html-go-express:
    ports:
      - "3000:8888"  # 外部端口:内部端口
```

然后通过 `http://localhost:3000` 访问。

### 多实例部署

如需运行多个实例：

```yaml
version: '3.8'

services:
  html-go-express-1:
    build: .
    container_name: html-go-express-1
    ports:
      - "8888:8888"
    volumes:
      - html-go-data-1:/usr/src/app/data
    environment:
      - NODE_ENV=production

  html-go-express-2:
    build: .
    container_name: html-go-express-2
    ports:
      - "8889:8888"
    volumes:
      - html-go-data-2:/usr/src/app/data
    environment:
      - NODE_ENV=production

volumes:
  html-go-data-1:
  html-go-data-2:
```

## 🔍 监控和调试

### 查看容器信息

```bash
# 查看容器详细信息
docker inspect html-go-express

# 查看容器资源使用情况
docker stats html-go-express

# 进入容器内部
docker exec -it html-go-express sh
```

### 日志管理

```bash
# 查看最近的日志
docker-compose logs --tail=100 html-go-express

# 实时跟踪日志
docker-compose logs -f html-go-express

# 查看特定时间段的日志
docker-compose logs --since="2024-01-01T00:00:00" html-go-express
```

### 性能监控

使用 Docker Desktop 的内置监控功能：

1. 打开 Docker Desktop
2. 点击 "Containers" 标签
3. 选择 `html-go-express` 容器
4. 查看 CPU、内存、网络使用情况

## 🔒 安全配置

### 1. 修改默认密码

编辑 `docker-compose.yml` 或创建 `.env` 文件：

```env
AUTH_PASSWORD=your_very_secure_password_here
```

### 2. 网络隔离

```yaml
version: '3.8'

services:
  html-go-express:
    # ... 其他配置
    networks:
      - internal

networks:
  internal:
    driver: bridge
    internal: true  # 禁止外部网络访问
```

### 3. 只读文件系统

```yaml
services:
  html-go-express:
    # ... 其他配置
    read_only: true
    tmpfs:
      - /tmp
      - /usr/src/app/sessions
```

## 🚨 故障排除

### 常见问题

1. **Docker Desktop 未启动**
   ```
   错误: Cannot connect to the Docker daemon
   解决: 启动 Docker Desktop 应用
   ```

2. **端口冲突**
   ```bash
   # 查看端口占用
   netstat -an | grep 8888
   
   # 修改 docker-compose.yml 中的端口映射
   ports:
     - "3000:8888"
   ```

3. **构建失败**
   ```bash
   # 清理 Docker 缓存
   docker system prune -a
   
   # 重新构建
   docker-compose build --no-cache
   ```

4. **容器无法启动**
   ```bash
   # 查看详细错误信息
   docker-compose logs html-go-express
   
   # 检查容器状态
   docker-compose ps
   ```

5. **数据丢失**
   ```bash
   # 检查数据卷是否存在
   docker volume ls | grep html-go-data
   
   # 如果数据卷丢失，重新创建
   docker volume create quickshare_html-go-data
   ```

### 性能问题

1. **内存不足**
   - 在 Docker Desktop 设置中增加内存分配
   - 或修改容器内存限制：
   ```yaml
   services:
     html-go-express:
       deploy:
         resources:
           limits:
             memory: 1G
   ```

2. **启动缓慢**
   - 检查 Docker Desktop 的资源分配
   - 考虑使用更轻量的基础镜像

## 📋 最佳实践

1. **定期备份数据**
   ```bash
   # 创建备份脚本
   #!/bin/bash
   DATE=$(date +%Y%m%d-%H%M%S)
   docker run --rm \
     -v quickshare_html-go-data:/data \
     -v $(pwd)/backups:/backup \
     alpine tar -czvf /backup/html-go-backup-$DATE.tar.gz /data
   ```

2. **使用 .dockerignore**
   ```
   node_modules
   npm-debug.log
   .git
   .gitignore
   README.md
   .env
   .nyc_output
   coverage
   .nyc_output
   ```

3. **健康检查**
   ```yaml
   services:
     html-go-express:
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:8888"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

4. **日志轮转**
   ```yaml
   services:
     html-go-express:
       logging:
         driver: "json-file"
         options:
           max-size: "10m"
           max-file: "3"
   ```

## 🎯 生产环境建议

1. **使用具体的镜像标签**
   ```yaml
   services:
     html-go-express:
       image: html-go-express:v1.0.0  # 而不是 latest
   ```

2. **配置重启策略**
   ```yaml
   services:
     html-go-express:
       restart: unless-stopped
   ```

3. **使用外部配置**
   ```yaml
   services:
     html-go-express:
       env_file:
         - .env.production
   ```

4. **监控和告警**
   - 集成 Prometheus + Grafana
   - 配置日志聚合系统
   - 设置健康检查和告警

---

通过以上配置，您就可以在 Docker Desktop 上成功部署和运行 HTML-Go Express 应用了！ 