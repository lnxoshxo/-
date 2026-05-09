from skillos import service


SEED_SKILLS = [
    {
        "skillCode": "3.01.03",
        "skillName": "立项可研编制",
        "domainNo": 3,
        "moduleNo": 1,
        "goal": "形成可审议可追溯的立项材料",
    },
    {
        "skillCode": "5.02.03",
        "skillName": "故障响应与恢复",
        "domainNo": 5,
        "moduleNo": 2,
        "goal": "降低故障恢复时长",
    },
    {
        "skillCode": "8.01.01",
        "skillName": "年度预算编制",
        "domainNo": 8,
        "moduleNo": 1,
        "goal": "预算与战略对齐",
    },
]


SEED_FLOWS = [
    {
        "flowCode": "FLOW_PLATFORM_LAUNCH",
        "flowName": "平台新建上线",
        "skillCode": "3.01.03",
        "flowJson": {
            "nodes": [
                {"key": "start", "type": "start"},
                {"key": "feasibility", "type": "approval"},
                {"key": "execute", "type": "task"},
                {"key": "acceptance", "type": "approval"},
                {"key": "end", "type": "end"},
            ]
        },
    },
    {
        "flowCode": "FLOW_P1_INCIDENT",
        "flowName": "P1故障应急",
        "skillCode": "5.02.03",
        "flowJson": {
            "nodes": [
                {"key": "start", "type": "start"},
                {"key": "triage", "type": "task"},
                {"key": "command", "type": "approval"},
                {"key": "recover", "type": "task"},
                {"key": "postmortem", "type": "task"},
                {"key": "end", "type": "end"},
            ]
        },
    },
    {
        "flowCode": "FLOW_ANNUAL_BUDGET",
        "flowName": "年度预算编制",
        "skillCode": "8.01.01",
        "flowJson": {
            "nodes": [
                {"key": "start", "type": "start"},
                {"key": "collect", "type": "task"},
                {"key": "review", "type": "approval"},
                {"key": "compile", "type": "task"},
                {"key": "approve", "type": "approval"},
                {"key": "end", "type": "end"},
            ]
        },
    },
]


def seed_minimal(conn) -> dict:
    created_skills = 0
    upserted_flows = 0

    existing = {s["skill_code"] for s in service.list_skills(conn)}
    for skill in SEED_SKILLS:
        if skill["skillCode"] not in existing:
            service.create_skill(conn, skill)
            created_skills += 1

    for flow in SEED_FLOWS:
        service.upsert_flow(conn, flow)
        upserted_flows += 1

    return {
        "createdSkills": created_skills,
        "upsertedFlows": upserted_flows,
    }
