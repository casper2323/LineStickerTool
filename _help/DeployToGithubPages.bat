@echo off
cd /d "%~dp0.."
echo ===================================================
echo     Deploy to GitHub Pages
echo ===================================================
echo.
echo This script will build the project and publish it to the gh-pages branch.
echo Your app will be available at: https://casper2323.github.io/LineStickerTool/
echo.

:: 1. Confirm
set /p confirm="Are you sure you want to build and deploy? (Y/N): "
if /i "%confirm%" neq "Y" goto :EOF

:: 2. Run Deploy
echo.
echo [1/2] Building project...
echo [2/2] Publishing to GitHub Pages...
cmd /c "npm run deploy"

echo.
echo ===================================================
echo     Done!
echo     Please wait a few minutes for GitHub to update the site.
echo ===================================================
pause
