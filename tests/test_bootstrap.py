import sqlite3

from skillos.bootstrap import seed_minimal
from skillos.db import init_db
from skillos import service


def mk_conn():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    init_db(conn)
    return conn


def test_seed_minimal_idempotent():
    conn = mk_conn()
    r1 = seed_minimal(conn)
    assert r1["upsertedFlows"] == 3
    skills = service.list_skills(conn)
    assert len(skills) == 3

    r2 = seed_minimal(conn)
    assert r2["createdSkills"] == 0
    skills2 = service.list_skills(conn)
    assert len(skills2) == 3
