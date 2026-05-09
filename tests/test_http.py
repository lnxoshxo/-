import json
import sqlite3
from pathlib import Path

from skillos import server


class DummyHeaders(dict):
    def get(self, key, default=None):
        return super().get(key, default)


def test_parse_json_empty_body():
    class H:
        headers = DummyHeaders({"Content-Length": "0"})

    h = H()
    h.rfile = None
    assert server._parse_json(h) == {}


def test_json_response_builder():
    captured = {}

    class H:
        def send_response(self, status):
            captured["status"] = status

        def send_header(self, k, v):
            captured.setdefault("headers", {})[k] = v

        def end_headers(self):
            captured["ended"] = True

        class W:
            def write(self, b):
                captured["body"] = b

        wfile = W()

    server._json(H(), 200, {"ok": True})
    assert captured["status"] == 200
    assert b'"ok": true' in captured["body"]
