@echo off
echo ========================================
echo GuardBulldog - Deploy to GitHub
echo ========================================
echo.

cd /d C:\Users\USER\CascadeProjects\GUARDBULLDOG

echo [1/5] Initializing Git (if needed)...
git init

echo.
echo [2/5] Adding remote repository...
git remote remove origin 2>nul
git remote add origin https://github.com/jartinese-png/Guardbulldog.git

echo.
echo [3/5] Adding all files...
git add .

echo.
echo [4/5] Committing changes...
git commit -m "GuardBulldog V2.0 - Complete with all features"

echo.
echo [5/5] Pushing to GitHub...
git branch -M main
git push -u origin main --force

echo.
echo ========================================
echo SUCCESS! Code pushed to GitHub
echo ========================================
echo.
echo Next Steps:
echo 1. Go to https://render.com
echo 2. Sign up/Login with GitHub
echo 3. Click "New +" and select "Blueprint"
echo 4. Select your Guardbulldog repository
echo 5. Click "Apply"
echo.
echo Your site will be live in 5-10 minutes!
echo.
pause
