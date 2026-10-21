@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Bitte Node.js 22 oder neuer installieren.
  pause
  exit /b 1
)
echo Im Browser http://127.0.0.1:8841 oeffnen.
echo Zum Beenden dieses Fenster mit Strg+C stoppen.
node server.mjs
pause
