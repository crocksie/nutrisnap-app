@echo off
echo 🚀 NutriSnap Deployment Script
echo ================================

if not exist "package.json" (
    echo ❌ Error: Please run this script from the nutrisnap-app directory
    exit /b 1
)

echo 📦 Building the application...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
    echo.
    echo 📤 Ready for deployment!
    echo.
    echo Next steps:
    echo 1. Push to GitHub: git add . ^&^& git commit -m "Ready for deployment" ^&^& git push
    echo 2. Deploy to Vercel: npx vercel --prod
    echo 3. Or visit vercel.com to import from GitHub
    echo.
    echo Your app will be live in minutes! 🎉
) else (
    echo ❌ Build failed. Please check the errors above.
    exit /b 1
)
