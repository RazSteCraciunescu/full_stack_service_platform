@echo off
setlocal
cd /d "%~dp0.."

if not exist "dist\server\src\server.js" (
  echo Compiled server not found; building it first.
  call npm run build
  if errorlevel 1 exit /b 1
)

node dist\server\src\server.js
