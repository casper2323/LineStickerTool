@echo off
cd /d "%~dp0.."
echo ===================================================
echo     Switch Version (Git Branch)
echo ===================================================
echo.
echo Current Status:
git branch --show-current
echo.
echo Available Local Branches:
git branch
echo.
echo ===================================================
echo.
echo Enter the branch name to switch to (e.g., main, v2).
echo Or type 'v2' to create/switch to v2 if it's new.
echo.
set /p branch="Target Branch Name: "

if "%branch%"=="" goto :EOF

:: Try to checkout existing branch
git checkout %branch% 2>nul
if %errorlevel% equ 0 goto :Success

:: If failed, ask if they want to create it
echo.
echo Branch '%branch%' not found. 
set /p create="Do you want to create new branch '%branch%'? (Y/N): "
if /i "%create%" neq "Y" goto :EOF

git checkout -b %branch%

:Success
echo.
echo ===================================================
echo     Now on branch:
git branch --show-current
echo ===================================================
pause
