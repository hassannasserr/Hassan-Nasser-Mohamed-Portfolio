@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Please install Node.js LTS version 22.12 or newer first.
 pause
 exit /b 1
)
if not exist node_modules (
 call npm ci
 if errorlevel 1 goto failure
)
call npm run build
if errorlevel 1 goto failure
echo Open http://localhost:3000 in your browser. Ctrl+C stops the server.
call npm start
exit /b
:failure
echo Setup or build failed. Read the error above.
pause
exit /b 1
