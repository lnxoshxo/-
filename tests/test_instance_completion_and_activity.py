import sqlite3

from skillos.db import init_db
from skillos.bootstrap import seed_minimal
from skillos import service


def mk_conn():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    init_db(conn)
    return conn


def test_instance_auto_completes_when_all_tasks_done():
    conn = mk_conn()
    seed_minimal(conn)
    ins = service.start_instance(
        conn,
        {"skillCode": "3.01.03", "flowCode": "FLOW_PLATFORM_LAUNCH", "orgId": 1},
    )
    for task in ins["tasks"]:
        service.complete_task(conn, task["task_no"], "done")
    refreshed = service.get_instance(conn, ins["instance_no"])
    assert refreshed is not None
    assert refreshed["status"] == "done"


def test_risk_affects_instance_health_and_activity_log_created():
    conn = mk_conn()
    seed_minimal(conn)
    ins = service.start_instance(
        conn,
        {"skillCode": "3.01.03", "flowCode": "FLOW_PLATFORM_LAUNCH", "orgId": 1},
    )
    service.create_risk(
        conn,
        {"instanceNo": ins["instance_no"], "riskLevel": "high", "riskDesc": "demo risk"},
    )
    refreshed = service.get_instance(conn, ins["instance_no"])
    assert refreshed is not None
    assert refreshed["status"] == "running_with_risk"

    activities = service.list_recent_activities(conn, 10)
    assert len(activities) >= 2
    assert any(a["activity_type"] == "risk_created" for a in activities)
