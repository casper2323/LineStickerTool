@echo off
cd /d "%~dp0.."
echo ===================================================
echo     Merge from Main (Sync v1 fixes to current)
echo ===================================================
echo.

:: 1. Check if we are on main
for /f %%i in ('git branch --show-current') do set current_branch=%%i
if "%current_branch%"=="main" (
    echo [ERROR] You are currently on 'main'.
    echo You should switch to 'v2' first, then run this to pull changes FROM main.
    echo.
    pause
    goto :EOF
)

echo You are currently on branch: %current_branch%
echo This will pull all latest updates from 'main' into '%current_branch%'.
echo.
set /p confirm="Are you sure? (Y/N): "
if /i "%confirm%" neq "Y" goto :EOF

:: 2. Execute Merge
echo.
echo [1/2] Fetching latest main...
git fetch origin main

echo [2/2] Merging main into %current_branch%...
git merge main

echo.
echo ===================================================
echo     Done!
echo ===================================================
pause
