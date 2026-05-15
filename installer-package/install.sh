#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
TARGET_DIR="$SCRIPT_DIR/siicservice-expo-ai-system"

printf '开始安装 SIICSERVICE Expo AI System...\n'

if [ -d "$TARGET_DIR" ]; then
  printf '检测到已存在目录: %s\n' "$TARGET_DIR"
else
  unzip -q "$SCRIPT_DIR/siicservice-expo-ai-system-lite.zip" -d "$TARGET_DIR"
fi

cd "$TARGET_DIR/workspace"

if [ ! -f .env ]; then
  cp .env.example .env
  printf '已创建默认 .env，请按需填写模型配置。\n'
fi

npm install
npm install --workspace frontend
npm install --workspace backend
npm run build --workspace frontend
npm run build --workspace backend

printf '\n安装完成。\n'
printf '启动后端: npm run dev --workspace backend\n'
printf '启动前端: npm run dev --workspace frontend\n'
