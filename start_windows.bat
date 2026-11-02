@echo off
title Doccure Hospital Analytics
echo =====================================================================
echo   Doccure Hospital Executive Commercial Analytics - Windows Launcher
echo =====================================================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not found on your system!
    echo Please install Node.js (version 18 or higher) from:
    echo   https://nodejs.org/
    echo.
    echo Once installed, restart your command prompt and run start_windows.bat again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed.
echo.

if not exist "node_modules\" (
    echo [1/2] Installing project dependencies (npm install)...
    echo This may take 1-2 minutes on first run. Please wait...
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install npm packages.
        echo Please ensure you have internet access and run: npm install
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed successfully.
) else (
    echo [1/2] Dependencies already installed. Skipping npm install.
)

echo.
echo [2/2] Starting Next.js Analytics Server on http://localhost:3000...
echo.
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"

echo Server is running. Press Ctrl+C in this terminal window to stop.
echo.
call npm run dev

pause
