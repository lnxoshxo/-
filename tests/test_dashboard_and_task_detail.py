import sqlite3

from skillos.db import init_db
from skillos.bootstrap import seed_minimal
from skillos import service


def mk_conn():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    init_db(conn)
    return conn


def test_task_detail_timeline_and_comment():
    conn = mk_conn()
    seed_minimal(conn)
    ins = service.start_instance(
        conn,
        {"skillCode": "3.01.03", "flowCode": "FLOW_PLATFORM_LAUNCH", "orgId": 1},
    )
    task_no = ins["tasks"][0]["task_no"]
    service.add_task_comment(conn, task_no, "first note")
    detail = service.get_task_detail(conn, task_no)
    assert detail is not None
    assert len(detail["timeline"]) == 1
    assert detail["timeline"][0]["comment_text"] == "first note"


def test_close_risk_and_dashboard_summary_and_instance_filter():
    conn = mk_conn()
    seed_minimal(conn)
    service.start_instance(
        conn,
        {"skillCode": "5.02.03", "flowCode": "FLOW_P1_INCIDENT", "orgId": 1},
    )
    service.create_risk(
        conn,
        {"instanceNo": service.list_instances(conn)[0]["instance_no"], "riskLevel": "high", "riskDesc": "demo"},
    )
    risks = service.list_risks(conn)
    closed = service.close_risk(conn, risks[0]["id"])
    assert closed["status"] == "closed"

    summary = service.dashboard_summary(conn)
    assert summary["instanceCount"] >= 1
    filtered = service.list_instances_filtered(conn, status="running", skill_code="5.02.03")
    assert len(filtered) == 1
