# SIICSERVICE Expo AI System 1.2

面向 `上实服务 SIICSERVICE` 展会场景的会议纪要优化版展示系统。本版本基于 `versions/1.0` 复制生成，不覆盖冻结的 1.0 版本。

## 会议纪要优化重点

1. 公司介绍：走进上实服务
2. 党建引领：党建引领、智慧服务、民生共建
3. 标杆案例：突出 7S、荣誉和项目实践
4. 工作指引：突出安全生产、标准化、应急和客户服务闭环
5. 法律法规：突出资金、装修、收费和审计等物业高频合规场景
6. 城市运营：突出北外滩城市运营场景
7. 数据驾驶舱：突出场景应用
8. AI 问答：固定 16 个展会高频问题，同时保留知识库问答

## 讲解结构

1. 欢迎来到上实服务展区
2. 集团概况
3. 服务项目
4. 科技创新
5. 未来展望

## 当前能力

1. 展厅前台 Web 应用骨架
2. 企业介绍、解决方案、案例、数据驾驶舱页面
3. AI 问答交互页
4. 展会待机吸引页与 60 秒无操作自动跳转
5. 后台概览页
6. 后端健康检查接口
7. 基于 chunk 分块召回的知识库检索式问答
8. 基于本地 JSON 的演示数据持久化
9. 后台支持 FAQ、案例编辑与首页文案修改
10. 后台支持文档上传、处理状态展示与 chunk 预览
11. AI 问答支持相关问题推荐
12. 后台支持 FAQ、案例、文档删除与状态筛选
13. 后台支持统一搜索与问答记录详情查看
14. 首页增加自动轮播展示区
15. 问答记录保存答案、引用与相关问题快照
16. 后台增加简易登录页与前端守卫
17. 后台接口增加服务端 token 校验
18. 文档导入增加按文件类型分流的解析层
19. 支持将外部解析后的正文直接导入知识库
17. 专业版代码生成提示词文档

## 目录结构

```text
.
├── backend
├── frontend
├── .monkeycode/docs
├── docker-compose.yml
└── package.json
```

## 本地开发

### 1. 安装依赖

```bash
npm install
```

### 2. 启动后端

```bash
npm run dev:backend
```

### 3. 启动前端

```bash
npm run dev:frontend
```

前端地址：`http://localhost:5173`

后端健康检查：`http://localhost:3001/api/health`

主要前端路由：

1. `/` 首页
2. `/about` 企业介绍
3. `/solutions` 解决方案
4. `/cases` 案例展示
5. `/data` 数据驾驶舱
6. `/ai` AI 问答
7. `/idle` 展会待机页
8. `/admin` 后台概览

## 构建

```bash
npm run build
```

## 环境变量

参考根目录 `.env.example`。

如果未配置 `OPENAI_API_KEY`，问答接口会自动退化为本地演示回答模式。

## 已落实的关键约束

1. Vite 已配置 `allowedHosts: ['.monkeycode-ai.online']`
2. 前端已配置 `/api` 反向代理到后端
3. 前后端已拆分为 `frontend` 和 `backend`
4. AI 问答页已展示答案与引用来源
5. 已实现 60 秒无操作自动跳转待机页
6. 前台案例与 FAQ 推荐问题已通过 API 拉取

## 当前后端接口

### 内容接口

1. `GET /api/health`
2. `GET /api/content/home`
3. `GET /api/content/faqs`
4. `GET /api/content/cases`

### AI 接口

1. `POST /api/ask`

返回内容当前包含：

1. `answer`
2. `citations`
3. `relatedQuestions`

### 后台接口

1. `POST /api/admin/login`
1. `GET /api/admin/documents`
2. `POST /api/admin/documents`
3. `GET /api/admin/documents/:id/chunks`
4. `GET /api/admin/faqs`
5. `POST /api/admin/faqs`
6. `PUT /api/admin/faqs/:id`
7. `DELETE /api/admin/faqs/:id`
8. `GET /api/admin/cases`
9. `POST /api/admin/cases`
10. `PUT /api/admin/cases/:id`
11. `DELETE /api/admin/cases/:id`
12. `DELETE /api/admin/documents/:id`
13. `GET /api/admin/qa-logs`
14. `PUT /api/admin/home-content`
15. `POST /api/admin/documents/import`

## 当前数据存储方式

当前演示版本采用本地 JSON 文件持久化：

`backend/src/data/store.json`

适合当前快速演示、触摸屏联调和后台功能打样。后续可平滑替换为 PostgreSQL + pgvector。

## 当前知识库检索方式

当前版本已从整篇文档匹配升级为 `chunk` 分块召回：

1. 文档进入本地知识库
2. 问答时按文本块切分
3. 对问题进行关键词匹配与分块排序
4. 返回最相关的多个片段作为引用来源

后台当前还支持查看单篇文档被切分后的 chunk 预览，便于调试知识库质量。

文档当前带有基础处理状态字段：`ready`、`processing`、`failed`。

上传文档后，系统会先写入 `processing`，再自动切换为 `ready`，用于模拟知识库处理任务流。

后台当前支持统一搜索文档、FAQ、案例和问答记录，并可查看单条问答日志详情。

问答日志当前会保存答案快照、引用快照和相关问题快照，便于后续做运营分析与讲解复盘。

## 当前演示版后台登录

当前采用简易登录方式：

1. 默认用户名：`admin`
2. 默认密码：`siicservice123`

后续建议替换为正式鉴权体系和服务端令牌校验。

## 当前后台接口鉴权

除 `POST /api/admin/login` 外，其余 `/api/admin/*` 接口当前均要求携带后台 token。

前端已自动在后台请求中附加 `Authorization: Bearer <token>`。

## 当前文档解析能力

当前解析层会按文件类型分流：

1. `.txt` / `.md`：直接读取正文
2. `.docx`：自动解压并提取 `word/document.xml` 正文
3. `.pdf`：执行基础文本抽取，适用于包含可提取文字的 PDF
4. 外部解析结果：可通过 `POST /api/admin/documents/import` 直接导入正文

扫描版 PDF 仍建议优先走外部解析结果导入，以获得更稳定的文本质量。

这为后续切换到 embedding + vector search 保留了清晰结构。

## 后续计划

1. 增加真正的后台管理前端
2. 接入 PostgreSQL + pgvector
3. 接入更强的 PDF OCR / 向量化流程
4. 完善后台编辑、删除和筛选能力
5. 增加展会待机页轮播与屏保模式
6. 完善触摸屏专用交互细节
