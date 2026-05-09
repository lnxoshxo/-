import sqlite3

from skillos.db import init_db
from skillos.bootstrap import seed_minimal
from skillos import service


def mk_conn():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    init_db(conn)
    return conn


def test_list_tasks_after_start_instance():
    conn = mk_conn()
    seed_minimal(conn)
    ins = service.start_instance(
        conn,
        {
            "skillCode": "3.01.03",
            "flowCode": "FLOW_PLATFORM_LAUNCH",
            "orgId": 1,
        },
    )
    tasks = service.list_tasks(conn)
    assert len(tasks) >= 1
    assert tasks[0]["instance_id"] > 0
