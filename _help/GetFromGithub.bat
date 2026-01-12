@echo off
rem Switch to the root directory (parent of _help)
cd /d "%~dp0.."

echo Updating LineStickerTool (sticker-factory)...
git pull

echo.
echo Update complete.
pause
