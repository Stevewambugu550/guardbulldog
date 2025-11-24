@echo off
echo ========================================
echo GuardBulldog - Push to GitHub
echo ========================================
echo.

echo [Step 1] Adding all files...
git add .

echo.
echo [Step 2] Committing changes...
git commit -m "GuardBulldog V2.0 - Ready for deployment"

echo.
echo [Step 3] Pushing to GitHub...
git push

echo.
echo ========================================
echo Done! Code pushed to GitHub
echo ========================================
pause
