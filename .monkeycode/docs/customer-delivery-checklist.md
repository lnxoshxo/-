# SIICSERVICE Expo AI System 客户交付清单

## 一、交付文件

请根据客户环境选择以下包之一：

1. `siicservice-expo-ai-system-installer.zip`
2. `siicservice-expo-ai-system-docker-package.zip`
3. `siicservice-expo-ai-system-offline-runtime.zip`
4. `siicservice-expo-ai-system-windows-package.zip`

## 二、推荐选择

- 普通安装：使用 `一键安装包`
- Docker 环境：使用 `Docker 一键部署包`
- Windows 现场演示：使用 `Windows 专用交付包`
- 已装 Node.js 且不使用 Docker：使用 `离线运行包`

## 三、默认访问地址

- 系统入口：`http://localhost:3001`
- AI 问答：`http://localhost:3001/ai`
- 后台登录：`http://localhost:3001/admin-login`

## 四、后台默认账号

- 用户名：`admin`
- 密码：`siicservice123`

## 五、部署前提醒

1. 检查机器是否已安装 Node.js 或 Docker
2. 按需填写 `.env` 中的模型配置
3. 若用于正式环境，请更换默认后台账号与令牌

## 六、测试结论

- 自动化测试执行次数：100
- 通过：100
- 失败：0
