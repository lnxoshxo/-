@echo off
setlocal

set SCRIPT_DIR=%~dp0
set APP_DIR=%SCRIPT_DIR%app

cd /d "%APP_DIR%"

if not exist .env (
  copy .env.example .env >nul
  echo 已创建默认 .env，请先按需补充模型配置。
)

call npm install --omit=dev --workspace backend
call npm run start --workspace backend

endlocal
