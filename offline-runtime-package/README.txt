SIICSERVICE Expo AI System Offline Runtime Package

适用场景：
- 已安装 Node.js 20+
- 不想使用 Docker

使用方式：
1. 解压本包
2. 进入目录 offline-runtime-package/app
3. 若不存在 .env，可复制 .env.example 为 .env
4. 执行: npm install --omit=dev --workspace backend
5. 执行: npm run start --workspace backend

启动后访问：
- http://localhost:3001

说明：
- backend/dist 已预构建
- frontend/dist 已预构建
- 后端会同时托管前端静态页面
