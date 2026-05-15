@echo off
setlocal

set SCRIPT_DIR=%~dp0
set TARGET_DIR=%SCRIPT_DIR%siicservice-expo-ai-system

echo 开始安装 SIICSERVICE Expo AI System...

if exist "%TARGET_DIR%" (
  echo 检测到已存在目录: %TARGET_DIR%
) else (
  powershell -Command "Expand-Archive -Path '%SCRIPT_DIR%siicservice-expo-ai-system-lite.zip' -DestinationPath '%TARGET_DIR%' -Force"
)

cd /d "%TARGET_DIR%\workspace"

if not exist .env (
  copy .env.example .env >nul
  echo 已创建默认 .env，请按需填写模型配置。
)

call npm install
call npm install --workspace frontend
call npm install --workspace backend
call npm run build --workspace frontend
call npm run build --workspace backend

echo.
echo 安装完成。
echo 启动后端: npm run dev --workspace backend
echo 启动前端: npm run dev --workspace frontend
endlocal
