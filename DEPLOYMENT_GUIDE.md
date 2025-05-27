# NutriSnap App - Deployment Guide 🚀

## Quick Deploy with Vercel (Recommended)

### Prerequisites
1. GitHub account
2. Vercel account (free at vercel.com)
3. Git installed on your computer

### Step 1: Push to GitHub

1. **Initialize Git repository** (if not already done):
```bash
cd "d:\Projects\Food Tracker from scratch\nutrisnap-app"
git init
git add .
git commit -m "Initial commit - NutriSnap app ready for deployment"
```

2. **Create GitHub repository**:
   - Go to github.com → New Repository
   - Name: `nutrisnap-app`
   - Make it public (for free Vercel deployment)
   - Don't initialize with README (we already have files)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/nutrisnap-app.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Sign up/Login to Vercel**:
   - Go to vercel.com
   - Sign up with your GitHub account

2. **Import Project**:
   - Click "New Project"
   - Import your `nutrisnap-app` repository
   - Vercel will auto-detect it's a Vite project

3. **Configure Environment Variables**:
   Add these in Vercel's Environment Variables section:
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_GOOGLE_GEMINI_API_KEY=your_google_gemini_api_key_here
   FATSECRET_API_KEY=your_fatsecret_api_key_here
   FATSECRET_SHARED_SECRET=your_fatsecret_shared_secret_here
   ```
   
   **⚠️ SECURITY NOTE**: Never commit real API keys to your repository. Use environment variables in your deployment platform.

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Your app will be live at `https://your-app-name.vercel.app`

### Step 3: Test Your Deployment

1. **Visit your live app** and test:
   - ✅ User signup/login
   - ✅ Upload food images (AI recognition)
   - ✅ Search food database (FatSecret API)
   - ✅ Set goals and track nutrition
   - ✅ Amount editing

### Step 4: Share for Feedback

**Your app is now live!** Share the URL with users for feedback:
- `https://your-app-name.vercel.app`

---

## Alternative: Netlify Deployment

If you prefer Netlify:

1. **Netlify Drop**: Go to netlify.com/drop
2. **Build locally**: `npm run build`
3. **Drag & drop** the `dist` folder
4. **Add environment variables** in Netlify settings

---

## Development vs Production

- **Development**: Uses `http://localhost:3001` for FatSecret proxy
- **Production**: Uses `/api/fatsecret` Vercel serverless function

The app automatically detects the environment and uses the correct endpoint!

---

## Updating Your Deployment

1. **Make changes locally**
2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Update feature X"
   git push
   ```
3. **Auto-deploy**: Vercel automatically rebuilds and deploys

---

## Custom Domain (Optional)

1. **In Vercel Dashboard**: Go to your project
2. **Domains tab**: Add your custom domain
3. **Follow DNS instructions**: Update your domain's DNS settings

---

## Monitoring & Analytics

- **Vercel Analytics**: Built-in performance monitoring
- **Error tracking**: Check Vercel Functions tab for API errors
- **User feedback**: Monitor Supabase dashboard for user activity

🎉 **Your NutriSnap app is now live and ready for user feedback!**
