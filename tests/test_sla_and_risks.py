import sqlite3
from datetime import datetime, timedelta

from skillos.db import init_db
from skillos.bootstrap import seed_minimal
from skillos import service


def mk_conn():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    init_db(conn)
    return conn


def test_deadline_created_from_flow_node_sla():
    conn = mk_conn()
    seed_minimal(conn)
    ins = service.start_instance(
        conn,
        {"skillCode": "5.02.03", "flowCode": "FLOW_P1_INCIDENT", "orgId": 1},
    )
    assert len(ins["tasks"]) >= 1
    row = conn.execute("select deadline from task_item limit 1").fetchone()
    assert row["deadline"] is None or len(row["deadline"]) >= 19


def test_escalate_overdue_to_risk_and_idempotent():
    conn = mk_conn()
    seed_minimal(conn)
    service.start_instance(
        conn,
        {"skillCode": "5.02.03", "flowCode": "FLOW_P1_INCIDENT", "orgId": 1},
    )
    past = (datetime.utcnow() - timedelta(hours=1)).strftime("%Y-%m-%d %H:%M:%S")
    conn.execute("update task_item set deadline=? where id=(select id from task_item limit 1)", (past,))
    conn.commit()

    first = service.escalate_overdue_tasks(conn)
    second = service.escalate_overdue_tasks(conn)
    risks = service.list_risks(conn)
    assert len(first) == 1
    assert len(second) == 0
    assert len(risks) == 1


def test_export_csv_contains_header_and_row():
    conn = mk_conn()
    seed_minimal(conn)
    service.upsert_kpi(
        conn,
        {
            "periodKey": "2026Q2",
            "orgId": 1,
            "skillCode": "3.01.03",
            "kpiCode": "milestone_on_time_rate",
            "targetValue": 85,
            "actualValue": 88,
        },
    )
    csv_text = service.export_quarterly_csv(conn, "2026Q2", 1)
    assert "period_key,org_id,skill_code" in csv_text
    assert "2026Q2,1,3.01.03,milestone_on_time_rate,85.0,88.0," in csv_text
