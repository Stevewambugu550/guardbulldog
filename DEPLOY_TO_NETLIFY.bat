@echo off
echo ========================================
echo    GUARDBULLDOG - Deploy to Netlify
echo ========================================
echo.

cd /d C:\Users\USER\CascadeProjects\GUARDBULLDOG\client

echo [1/3] Installing dependencies...
call npm install

echo.
echo [2/3] Building the application...
call npm run build

echo.
echo [3/3] Deploying to Netlify...
call npx netlify-cli deploy --prod --dir=build

echo.
echo ========================================
echo    Deployment Complete!
echo ========================================
pause

