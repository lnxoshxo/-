# SkillOS 可交付运行说明

## 1. 运行目标
- 本说明用于本地演示、测试验收和研发接管。
- 当前系统为零外部依赖的 Python 标准库 MVP，数据库使用 SQLite。

## 2. 初始化

```bash
# 初始化数据库结构
python3 -m skillos.cli init-db

# 写入最小演示数据
python3 -m skillos.cli seed-minimal

# 创建一个演示流程实例
python3 -m skillos.cli demo-instance

# 查看驾驶舱摘要
python3 -m skillos.cli summary
```

## 3. 启动服务

```bash
python3 -m skillos.server
```

默认访问地址：
- 控制台：`http://127.0.0.1:8787/`
- 健康检查：`http://127.0.0.1:8787/api/health`

## 4. 演示路径
1. 打开控制台。
2. 点击“初始化演示数据”。
3. 点击“发起流程实例”。
4. 在任务看板中查看任务，并点击“详情”或“完成”。
5. 在实例详情中新增交付物。
6. 写入示例 KPI 并查看 KPI 图表。
7. 扫描超时任务或执行风险升级。
8. 查看首页驾驶舱和最近活动流。

## 5. 核心 API 验证

```bash
# 健康检查
curl http://127.0.0.1:8787/api/health

# 初始化演示数据
curl -X POST http://127.0.0.1:8787/api/bootstrap/minimal

# 查询 Skill
curl http://127.0.0.1:8787/api/skills

# 统一搜索
curl 'http://127.0.0.1:8787/api/search?q=3.01.03'

# 查询驾驶舱
curl http://127.0.0.1:8787/api/dashboard/summary
```

## 6. 测试

```bash
python3 -m pytest -q
```

当前验收点：
- Skill、Flow、Instance、Task 基础能力可用。
- 任务评论、交付物、KPI、风险、活动流可用。
- 实例状态可随任务与风险自动流转。
- 季度 JSON/CSV 导出可用。
- 统一搜索可用。

## 7. 研发接管建议
1. 将 SQLite 替换为 PostgreSQL。
2. 将内置 HTTP Server 替换为 FastAPI 或企业已有后端框架。
3. 接入 SSO、组织权限、工单、监控、安全、财务系统。
4. 将 `web/index.html` 拆分为正式前端工程。
5. 将流程配置迁移到可视化流程引擎。
