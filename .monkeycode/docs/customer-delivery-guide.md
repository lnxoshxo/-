# SIICSERVICE Expo AI System 客户交付说明书

## 一、项目简介

本系统用于 `上实服务 SIICSERVICE` 展会场景，提供前台展示、AI 问答、后台管理、知识库导入与资料下载能力。

## 二、交付内容

当前已提供以下交付物：

1. `siicservice-expo-ai-system-installer.zip`
2. `siicservice-expo-ai-system-docker-package.zip`
3. `siicservice-expo-ai-system-offline-runtime.zip`
4. `siicservice-expo-ai-system-windows-package.zip`
5. `siicservice-expo-ai-system-lite.zip`

## 三、推荐使用方式

### 1. 普通交付与安装

建议优先使用：`siicservice-expo-ai-system-installer.zip`

适合：

- 需要标准安装流程的客户环境
- Windows / Linux / macOS 混合环境

### 2. Docker 部署

建议使用：`siicservice-expo-ai-system-docker-package.zip`

适合：

- 已有 Docker 环境
- 希望快速统一部署
- 希望通过单端口 `3001` 提供前后端服务

### 3. 离线运行

建议使用：`siicservice-expo-ai-system-offline-runtime.zip`

适合：

- 已安装 Node.js
- 不使用 Docker
- 需要较轻量运行方式

### 4. Windows 专用环境

建议使用：`siicservice-expo-ai-system-windows-package.zip`

适合：

- Windows 电脑现场演示
- 以双击脚本方式快速启动

## 四、基础环境要求

### 安装包 / 离线包 / Windows 包

- Node.js 20+
- npm 10+

### Docker 包

- Docker
- Docker Compose

## 五、模型配置说明

若需启用真实 AI 生成能力，需要在 `.env` 中配置：

```env
OPENAI_API_KEY=
OPENAI_BASE_URL=
OPENAI_CHAT_MODEL=
OPENAI_EMBEDDING_MODEL=
```

若未配置 `OPENAI_API_KEY`，系统将退化为演示模式。

## 六、默认访问地址

部署完成后默认访问：

- 前后台统一入口：`http://localhost:3001`
- 后台登录页：`http://localhost:3001/admin-login`
- AI 问答页：`http://localhost:3001/ai`

## 七、后台默认账号

- 用户名：`admin`
- 密码：`siicservice123`

## 八、测试结果

本次交付前已执行自动化接口测试：

- 总计 100 次
- 通过 100 次
- 失败 0 次

## 九、知识库能力说明

当前支持：

1. `txt`
2. `md`
3. `docx`
4. 可提取文字的 `pdf`
5. 外部解析结果导入

## 十、后续建议

1. 上线前更换正式管理员账号与令牌
2. 生产环境中不要提交真实 `.env`
3. 如需更高质量 PDF 识别，可继续接入 OCR 方案
4. 如需更稳定知识召回，可继续升级为向量检索
