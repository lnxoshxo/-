#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

if [ ! -f "index.html" ]; then
  printf '%s\n' "未找到 index.html，请在项目根目录执行本脚本。"
  exit 1
fi

if ! command -v python3 >/dev/null 2>&1; then
  printf '%s\n' "当前环境未检测到 python3。"
  printf '%s\n' "可直接用浏览器打开 index.html，或安装 Python 3 后重新执行 bash install.sh。"
  exit 1
fi

PORT="${PORT:-8000}"
MAX_PORT="${MAX_PORT:-8020}"

port_available() {
  python3 - "$1" <<'PY'
import socket
import sys

port = int(sys.argv[1])
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    sock.bind(("127.0.0.1", port))
except OSError:
    sys.exit(1)
finally:
    sock.close()
PY
}

while [ "$PORT" -le "$MAX_PORT" ]; do
  if port_available "$PORT"; then
    break
  fi
  PORT=$((PORT + 1))
done

if [ "$PORT" -gt "$MAX_PORT" ]; then
  printf '%s\n' "8000-8020 端口均被占用，请释放端口后重试。"
  exit 1
fi

printf '%s\n' "上实服务 2026 展会 AI 智能问答模块启动中..."
printf '%s\n' "本地访问地址：http://127.0.0.1:${PORT}/index.html"
printf '%s\n' "局域网访问地址：http://$(hostname -I 2>/dev/null | cut -d' ' -f1):${PORT}/index.html"
printf '%s\n' "按 Ctrl+C 停止服务。"

python3 -m http.server "$PORT" --bind 0.0.0.0
