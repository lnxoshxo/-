import argparse
import json
from pathlib import Path

from skillos.bootstrap import seed_minimal
from skillos.db import DEFAULT_DB_PATH, connect, init_db
from skillos import service


def _connect(path: str | None):
    return connect(Path(path) if path else DEFAULT_DB_PATH)


def cmd_init_db(args) -> None:
    conn = _connect(args.db)
    init_db(conn)
    conn.close()
    print(json.dumps({"ok": True, "message": "database initialized"}, ensure_ascii=False))


def cmd_seed_minimal(args) -> None:
    conn = _connect(args.db)
    init_db(conn)
    result = seed_minimal(conn)
    conn.close()
    print(json.dumps({"ok": True, "data": result}, ensure_ascii=False))


def cmd_demo_instance(args) -> None:
    conn = _connect(args.db)
    init_db(conn)
    seed_minimal(conn)
    result = service.start_instance(
        conn,
        {
            "skillCode": args.skill_code,
            "flowCode": args.flow_code,
            "orgId": args.org_id,
            "triggerSource": "cli-demo",
        },
    )
    conn.close()
    print(json.dumps({"ok": True, "data": result}, ensure_ascii=False))


def cmd_summary(args) -> None:
    conn = _connect(args.db)
    init_db(conn)
    result = service.dashboard_summary(conn)
    conn.close()
    print(json.dumps({"ok": True, "data": result}, ensure_ascii=False))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="SkillOS command line tools")
    parser.add_argument("--db", help="SQLite database path")
    sub = parser.add_subparsers(dest="command", required=True)

    init_cmd = sub.add_parser("init-db", help="initialize database schema")
    init_cmd.set_defaults(func=cmd_init_db)

    seed_cmd = sub.add_parser("seed-minimal", help="seed minimal demo skills and flows")
    seed_cmd.set_defaults(func=cmd_seed_minimal)

    demo_cmd = sub.add_parser("demo-instance", help="create a demo flow instance")
    demo_cmd.add_argument("--skill-code", default="3.01.03")
    demo_cmd.add_argument("--flow-code", default="FLOW_PLATFORM_LAUNCH")
    demo_cmd.add_argument("--org-id", type=int, default=1)
    demo_cmd.set_defaults(func=cmd_demo_instance)

    summary_cmd = sub.add_parser("summary", help="print dashboard summary")
    summary_cmd.set_defaults(func=cmd_summary)
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
