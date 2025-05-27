#!/bin/bash
# Quick deployment script for NutriSnap

echo "🚀 NutriSnap Deployment Script"
echo "================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the nutrisnap-app directory"
    exit 1
fi

echo "📦 Building the application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    echo "📤 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Push to GitHub: git add . && git commit -m 'Ready for deployment' && git push"
    echo "2. Deploy to Vercel: npx vercel --prod"
    echo "3. Or visit vercel.com to import from GitHub"
    echo ""
    echo "Your app will be live in minutes! 🎉"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi
