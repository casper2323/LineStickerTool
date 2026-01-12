@echo off
cd /d "%~dp0\.."
echo Starting Line Sticker Tool...
start http://localhost:5173
npm run dev
pause
