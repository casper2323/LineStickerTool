@echo off
cd /d "%~dp0.."
echo ===================================================
echo     Push to GitHub (Auto Commit & Push)
echo ===================================================
echo.

:: 1. Check Status
git status
echo.

:: 2. Confirm
set /p confirm="Do you want to Stage All, Commit, and Push? (Y/N): "
if /i "%confirm%" neq "Y" goto :EOF

:: 3. Input Commit Message
set /p msg="Enter Commit Message: "
if "%msg%"=="" set msg=Auto Update %date% %time%

:: 4. Commands
echo.
echo [1/3] Adding all files...
git add .

echo [2/3] Committing...
git commit -m "%msg%"

echo [3/3] Pushing to main...
git push origin main

echo.
echo ===================================================
echo     Done!
echo ===================================================
pause
