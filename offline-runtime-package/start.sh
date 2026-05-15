#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
APP_DIR="$SCRIPT_DIR/app"

cd "$APP_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
  printf '已创建默认 .env，请按需补充模型配置。\n'
fi

npm install --omit=dev --workspace backend
npm run start --workspace backend
