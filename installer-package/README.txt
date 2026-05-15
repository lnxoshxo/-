SIICSERVICE Expo AI System Installer

本安装包包含：
1. siicservice-expo-ai-system-lite.zip
2. install.sh - Linux / macOS 一键安装脚本
3. install.bat - Windows 一键安装脚本

测试结果：
- 自动化接口测试 100 次
- 通过 100 次
- 失败 0 次

使用方式：

Linux / macOS:
1. 解压本安装包
2. 进入解压后的目录
3. 执行: sh install.sh

Windows:
1. 解压本安装包
2. 双击 install.bat

默认行为：
1. 自动解压 siicservice-expo-ai-system-lite.zip
2. 若不存在 .env，则自动从 .env.example 复制生成
3. 自动安装根目录、frontend、backend 依赖
4. 自动构建 frontend 和 backend
5. 输出后续启动命令

说明：
- 若需真实 AI 问答，请在生成的 .env 中填写 OPENAI_API_KEY 等参数
- 默认前端端口 5173，后端端口 3001
