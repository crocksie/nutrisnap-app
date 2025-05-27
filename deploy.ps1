# NutriSnap Deployment - PowerShell Script
Write-Host "🚀 NutriSnap Deployment Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the nutrisnap-app directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Building the application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📤 Ready for deployment!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Push to GitHub: git add . && git commit -m 'Ready for deployment' && git push" -ForegroundColor Gray
    Write-Host "2. Deploy to Vercel: npx vercel --prod" -ForegroundColor Gray
    Write-Host "3. Or visit vercel.com to import from GitHub" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Your app will be live in minutes! 🎉" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
    exit 1
}
