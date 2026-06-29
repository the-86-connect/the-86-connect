@echo off
REM 86 Connect - Development Runner
REM Starts both frontend and backend servers

echo.
echo Starting 86 Connect Development Servers...
echo =========================================
echo.

REM Parse arguments
if "%1"=="-clean" goto clean
if "%1"=="--clean" goto clean
if "%1"=="-h" goto help
if "%1"=="--help" goto help
goto start

:clean
echo [1/3] Cleaning caches...
if exist "frontend\.next" rmdir /s /q "frontend\.next"
echo   Cleared frontend .next cache
echo   Cache cleaned
echo.

:start
echo [2/3] Starting Backend Server...
start "86 Backend" cmd /k "cd backend && npm run dev"

echo [3/3] Starting Frontend Server...
start "86 Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo =========================================
echo Servers are starting...
echo.
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo.
echo Press Ctrl+C in each window to stop servers
echo Or close the terminal windows
echo.
goto end

:help
echo.
echo 86 Connect Development Runner
echo =========================================
echo.
echo Usage:
echo   run-dev.cmd           Start both servers
echo   run-dev.cmd -clean   Clear cache and start
echo   run-dev.cmd -h       Show this help
echo.
echo Servers:
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:3001
echo.

:end
