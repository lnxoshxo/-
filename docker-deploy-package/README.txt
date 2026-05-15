SIICSERVICE Expo AI System Docker Deployment Package

使用方式：
1. 解压本包
2. 进入目录 docker-deploy-package
3. 配置 .env 文件
4. 执行: docker compose up -d --build

启动后访问：
- http://localhost:3001

说明：
- 后端将同时托管 frontend/dist 静态文件
- 所有 API 与前端页面通过同一端口 3001 对外提供
