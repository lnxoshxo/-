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


def test_kpi_filter_and_export_summary():
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
    rows = service.list_kpis_filtered(conn, period_key="2026Q2", org_id=1)
    assert len(rows) == 1
    data = service.export_quarterly_summary(conn, "2026Q2", 1)
    assert data["summary"]["kpiCount"] == 1


def test_overdue_scan_and_deliverables_by_instance():
    conn = mk_conn()
    seed_minimal(conn)
    ins = service.start_instance(
        conn,
        {"skillCode": "3.01.03", "flowCode": "FLOW_PLATFORM_LAUNCH", "orgId": 1},
    )
    service.create_deliverable(
        conn,
        {"instanceNo": ins["instance_no"], "templateCode": "TMP-A", "fileName": "a.md"},
    )
    ds = service.list_deliverables_by_instance(conn, ins["instance_no"])
    assert len(ds) == 1

    deadline = (datetime.utcnow() - timedelta(hours=2)).strftime("%Y-%m-%d %H:%M:%S")
    conn.execute(
        "update task_item set deadline=? where id=(select id from task_item limit 1)",
        (deadline,),
    )
    conn.commit()
    overdue = service.scan_overdue_tasks(conn)
    assert len(overdue) >= 1
