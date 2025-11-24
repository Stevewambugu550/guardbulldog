@echo off
echo ========================================
echo GuardBulldog V2.0 - Starting Services
echo ========================================
echo.

echo [1/3] Starting Backend Server...
start "GuardBulldog Backend" cmd /k "cd /d %~dp0 && powershell -ExecutionPolicy Bypass -Command npm run server"
timeout /t 3 >nul

echo [2/3] Starting Frontend...
start "GuardBulldog Frontend" cmd /k "cd /d %~dp0\client && powershell -ExecutionPolicy Bypass -Command npm start"
timeout /t 3 >nul

echo.
echo ========================================
echo ✅ GuardBulldog V2.0 is starting!
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo NEW FEATURES:
echo - Guest Report: http://localhost:3000/guest-report
echo - Track Report: http://localhost:3000/track-report
echo.
echo Press any key to exit...
pause >nul
