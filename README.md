# SkillOS MVP

基于标准库实现的 SkillOS MVP 后端。

## 启动

```bash
python3 -m skillos.cli init-db
python3 -m skillos.cli seed-minimal
python3 -m skillos.server
```

默认监听 `0.0.0.0:8787`。

## 测试

```bash
python -m pytest -q
```

## 已实现 API
- `GET /api/health`
- `GET /api/skills`
- `POST /api/skills`
- `GET /api/skills/{skillCode}`
- `PUT /api/skills/{skillCode}`
- `POST /api/flows`
- `POST /api/instances`
- `GET /api/instances`
- `GET /api/instances/{instanceNo}`
- `POST /api/tasks/{taskNo}/complete`
- `POST /api/deliverables`
- `POST /api/risks`
- `GET /api/kpis`
- `POST /api/bootstrap/minimal`
- `GET /api/activities`
- `GET /api/search?q=...`
- `GET /api/dashboard/summary`

## 快速演示

```bash
# 启动服务
python3 -m skillos.server

# 健康检查
curl http://127.0.0.1:8787/api/health

# 初始化最小演示数据
curl -X POST http://127.0.0.1:8787/api/bootstrap/minimal

# 查看 Skill 列表
curl http://127.0.0.1:8787/api/skills

# 打开控制台
# 浏览器访问 http://127.0.0.1:8787/
```

控制台能力：
- 健康检查
- 一键初始化演示数据
- 发起流程实例
- 查看并完成任务
- 实例筛选、任务详情、交付物录入
- KPI 看板、风险看板、活动流、统一搜索

## 交付说明

完整运行说明见：`.monkeycode/docs/skillos-runbook.md`
