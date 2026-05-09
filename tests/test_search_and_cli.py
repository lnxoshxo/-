import json
import sqlite3

from skillos.db import init_db
from skillos.bootstrap import seed_minimal
from skillos import service
from skillos.cli import build_parser


def mk_conn():
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    init_db(conn)
    return conn


def test_unified_search_finds_multiple_entities():
    conn = mk_conn()
    seed_minimal(conn)
    ins = service.start_instance(
        conn,
        {"skillCode": "3.01.03", "flowCode": "FLOW_PLATFORM_LAUNCH", "orgId": 1},
    )
    service.create_deliverable(
        conn,
        {"instanceNo": ins["instance_no"], "templateCode": "TMP-DEMO", "fileName": "demo.md"},
    )
    result = service.search_all(conn, "demo", 10)
    assert result["deliverables"]
    assert "skills" in result


def test_cli_parser_accepts_demo_instance_command():
    parser = build_parser()
    args = parser.parse_args(["demo-instance", "--skill-code", "3.01.03"])
    assert args.command == "demo-instance"
    assert args.skill_code == "3.01.03"
