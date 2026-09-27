@echo off
setlocal
cd /d "%~dp0"
 powershell -NoProfile -Command "try { Invoke-WebRequest -Uri 'http://127.0.0.1:4173/' -TimeoutSec 2 | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 start "Steam Playtime Server" /min cmd /c "node server.mjs"
timeout /t 2 /nobreak >nul
start "" "http://127.0.0.1:4173"
endlocal
