import json
import sqlite3

from skillos.db import init_db
from skillos import service


def mk_conn():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    init_db(conn)
    return conn


def test_skill_crud_and_list():
    conn = mk_conn()
    created = service.create_skill(
        conn,
        {
            "skillCode": "1.01.01",
            "skillName": "趋势雷达",
            "domainNo": 1,
            "moduleNo": 1,
            "inputSchema": {"a": 1},
        },
    )
    assert created["skill_code"] == "1.01.01"
    items = service.list_skills(conn)
    assert len(items) == 1
    assert items[0]["skill_name"] == "趋势雷达"


def test_instance_and_tasks_flow():
    conn = mk_conn()
    service.create_skill(
        conn,
        {
            "skillCode": "3.02.01",
            "skillName": "项目执行",
            "domainNo": 3,
            "moduleNo": 2,
        },
    )
    flow = {
        "nodes": [
            {"key": "start", "type": "start"},
            {"key": "exec", "type": "task"},
            {"key": "approve", "type": "approval"},
            {"key": "end", "type": "end"},
        ]
    }
    service.upsert_flow(
        conn,
        {
            "flowCode": "FLOW_A",
            "flowName": "A",
            "skillCode": "3.02.01",
            "flowJson": flow,
        },
    )
    ins = service.start_instance(
        conn,
        {"skillCode": "3.02.01", "flowCode": "FLOW_A", "orgId": 1},
    )
    assert ins["instance_no"].startswith("INS-")
    assert len(ins["tasks"]) == 2
    task_no = ins["tasks"][0]["task_no"]
    done = service.complete_task(conn, task_no, "ok")
    assert done["status"] == "done"


def test_deliverable_and_risk():
    conn = mk_conn()
    service.create_skill(
        conn,
        {
            "skillCode": "8.01.01",
            "skillName": "预算",
            "domainNo": 8,
            "moduleNo": 1,
        },
    )
    service.upsert_flow(
        conn,
        {
            "flowCode": "FLOW_B",
            "flowName": "B",
            "skillCode": "8.01.01",
            "flowJson": {"nodes": [{"key": "start", "type": "start"}, {"key": "end", "type": "end"}]},
        },
    )
    ins = service.start_instance(
        conn,
        {"skillCode": "8.01.01", "flowCode": "FLOW_B", "orgId": 2},
    )

    d = service.create_deliverable(
        conn,
        {
            "instanceNo": ins["instance_no"],
            "templateCode": "TMP-ROI",
            "fileUri": "s3://demo/roi.md",
        },
    )
    assert d["template_code"] == "TMP-ROI"

    r = service.create_risk(
        conn,
        {
            "instanceNo": ins["instance_no"],
            "riskLevel": "high",
            "riskDesc": "预算偏差",
        },
    )
    assert r["risk_level"] == "high"


def test_invalid_missing_field():
    conn = mk_conn()
    try:
        service.create_skill(conn, {"skillCode": "x"})
    except ValueError as exc:
        assert "missing required fields" in str(exc)
    else:
        raise AssertionError("expected ValueError")
