import json
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from skillos.db import DEFAULT_DB_PATH, connect, init_db
from skillos import service
from skillos.bootstrap import seed_minimal


STATIC_DIR = Path("/workspace/web")


def _json(handler: BaseHTTPRequestHandler, status: int, payload):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _error(handler: BaseHTTPRequestHandler, status: int, message: str, code: str | None = None):
    _json(
        handler,
        status,
        {
            "ok": False,
            "error": {
                "code": code or str(status),
                "message": message,
            },
        },
    )


def _text(handler: BaseHTTPRequestHandler, status: int, text: str, content_type: str = "text/plain; charset=utf-8"):
    body = text.encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", content_type)
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def _parse_json(handler: BaseHTTPRequestHandler):
    length = int(handler.headers.get("Content-Length", "0"))
    if length == 0:
        return {}
    raw = handler.rfile.read(length)
    try:
        return json.loads(raw.decode("utf-8"))
    except json.JSONDecodeError as exc:
        raise ValueError("invalid json body") from exc


class SkillHandler(BaseHTTPRequestHandler):
    def _conn(self):
        return connect(DEFAULT_DB_PATH)

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        query = parse_qs(parsed.query)

        if path == "/" or path == "/index.html":
            index = STATIC_DIR / "index.html"
            if not index.exists():
                _error(self, HTTPStatus.NOT_FOUND, "index not found", "INDEX_NOT_FOUND")
                return
            content = index.read_bytes()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
            return

        conn = self._conn()
        try:
            if path == "/api/skills":
                domain = query.get("domainNo", [None])[0]
                domain_no = int(domain) if domain else None
                _json(self, HTTPStatus.OK, service.list_skills(conn, domain_no))
                return

            if path.startswith("/api/skills/"):
                skill_code = path.rsplit("/", 1)[-1]
                item = service.get_skill(conn, skill_code)
                if not item:
                    _error(self, HTTPStatus.NOT_FOUND, "not found", "NOT_FOUND")
                    return
                _json(self, HTTPStatus.OK, item)
                return

            if path == "/api/instances":
                status = query.get("status", [None])[0]
                skill_code = query.get("skillCode", [None])[0]
                _json(self, HTTPStatus.OK, service.list_instances_filtered(conn, status, skill_code))
                return

            if path.startswith("/api/instances/") and path.endswith("/deliverables"):
                instance_no = path.split("/")[3]
                _json(self, HTTPStatus.OK, service.list_deliverables_by_instance(conn, instance_no))
                return

            if path.startswith("/api/instances/"):
                instance_no = path.rsplit("/", 1)[-1]
                item = service.get_instance(conn, instance_no)
                if not item:
                    _error(self, HTTPStatus.NOT_FOUND, "not found", "NOT_FOUND")
                    return
                _json(self, HTTPStatus.OK, item)
                return

            if path == "/api/kpis":
                period_key = query.get("periodKey", [None])[0]
                org = query.get("orgId", [None])[0]
                org_id = int(org) if org else None
                _json(self, HTTPStatus.OK, service.list_kpis_filtered(conn, period_key, org_id))
                return

            if path == "/api/tasks":
                status = query.get("status", [None])[0]
                _json(self, HTTPStatus.OK, service.list_tasks(conn, status))
                return

            if path.startswith("/api/tasks/"):
                task_no = path.rsplit("/", 1)[-1]
                item = service.get_task_detail(conn, task_no)
                if not item:
                    _error(self, HTTPStatus.NOT_FOUND, "not found", "NOT_FOUND")
                    return
                _json(self, HTTPStatus.OK, item)
                return

            if path == "/api/exports/quarterly":
                period_key = query.get("periodKey", [None])[0]
                if not period_key:
                    _error(self, HTTPStatus.BAD_REQUEST, "periodKey is required", "BAD_REQUEST")
                    return
                org = query.get("orgId", [None])[0]
                org_id = int(org) if org else None
                export_format = query.get("format", ["json"])[0]
                if export_format == "csv":
                    csv_text = service.export_quarterly_csv(conn, period_key, org_id)
                    _text(self, HTTPStatus.OK, csv_text, "text/csv; charset=utf-8")
                    return
                _json(self, HTTPStatus.OK, service.export_quarterly_summary(conn, period_key, org_id))
                return

            if path == "/api/sla/overdue":
                _json(self, HTTPStatus.OK, service.scan_overdue_tasks(conn))
                return

            if path == "/api/risks":
                status = query.get("status", [None])[0]
                _json(self, HTTPStatus.OK, service.list_risks(conn, status))
                return

            if path == "/api/health":
                _json(self, HTTPStatus.OK, {"status": "ok"})
                return

            if path == "/api/dashboard/summary":
                _json(self, HTTPStatus.OK, service.dashboard_summary(conn))
                return

            if path == "/api/activities":
                limit = int(query.get("limit", [20])[0])
                _json(self, HTTPStatus.OK, service.list_recent_activities(conn, limit))
                return

            if path == "/api/search":
                q = query.get("q", [""])[0]
                limit = int(query.get("limit", [20])[0])
                _json(self, HTTPStatus.OK, service.search_all(conn, q, limit))
                return

            _error(self, HTTPStatus.NOT_FOUND, "not found", "NOT_FOUND")
        finally:
            conn.close()

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        conn = self._conn()
        try:
            payload = _parse_json(self)
            if path == "/api/skills":
                item = service.create_skill(conn, payload)
                _json(self, HTTPStatus.CREATED, item)
                return

            if path == "/api/flows":
                item = service.upsert_flow(conn, payload)
                _json(self, HTTPStatus.CREATED, item)
                return

            if path == "/api/instances":
                item = service.start_instance(conn, payload)
                _json(self, HTTPStatus.CREATED, item)
                return

            if path.startswith("/api/tasks/") and path.endswith("/complete"):
                task_no = path.split("/")[3]
                item = service.complete_task(conn, task_no, payload.get("comments"))
                _json(self, HTTPStatus.OK, item)
                return

            if path.startswith("/api/tasks/") and path.endswith("/comments"):
                task_no = path.split("/")[3]
                item = service.add_task_comment(conn, task_no, payload.get("commentText", ""))
                _json(self, HTTPStatus.CREATED, item)
                return

            if path == "/api/deliverables":
                item = service.create_deliverable(conn, payload)
                _json(self, HTTPStatus.CREATED, item)
                return

            if path == "/api/risks":
                item = service.create_risk(conn, payload)
                _json(self, HTTPStatus.CREATED, item)
                return

            if path == "/api/sla/escalate":
                item = service.escalate_overdue_tasks(conn)
                _json(self, HTTPStatus.CREATED, item)
                return

            if path.startswith("/api/risks/") and path.endswith("/close"):
                risk_id = int(path.split("/")[3])
                item = service.close_risk(conn, risk_id)
                _json(self, HTTPStatus.OK, item)
                return

            if path == "/api/kpis":
                item = service.upsert_kpi(conn, payload)
                _json(self, HTTPStatus.CREATED, item)
                return

            if path == "/api/bootstrap/minimal":
                result = seed_minimal(conn)
                _json(self, HTTPStatus.CREATED, result)
                return

            _error(self, HTTPStatus.NOT_FOUND, "not found", "NOT_FOUND")
        except ValueError as exc:
            _error(self, HTTPStatus.BAD_REQUEST, str(exc), "BAD_REQUEST")
        finally:
            conn.close()

    def do_PUT(self):
        parsed = urlparse(self.path)
        path = parsed.path
        conn = self._conn()
        try:
            if path.startswith("/api/skills/"):
                skill_code = path.rsplit("/", 1)[-1]
                payload = _parse_json(self)
                payload["skillCode"] = skill_code
                # simple replace strategy
                old = service.get_skill(conn, skill_code)
                if not old:
                    _error(self, HTTPStatus.NOT_FOUND, "not found", "NOT_FOUND")
                    return
                conn.execute("delete from skill_definition where skill_code=?", (skill_code,))
                conn.commit()
                item = service.create_skill(conn, payload)
                _json(self, HTTPStatus.OK, item)
                return
            _error(self, HTTPStatus.NOT_FOUND, "not found", "NOT_FOUND")
        except ValueError as exc:
            _error(self, HTTPStatus.BAD_REQUEST, str(exc), "BAD_REQUEST")
        finally:
            conn.close()


def run(host: str = "0.0.0.0", port: int = 8787) -> None:
    conn = connect(DEFAULT_DB_PATH)
    init_db(conn)
    conn.close()
    server = ThreadingHTTPServer((host, port), SkillHandler)
    server.serve_forever()


if __name__ == "__main__":
    run()
