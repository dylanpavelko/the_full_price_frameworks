# GitHub Setup Checklist

Complete these steps to get your project on GitHub with automated deployment to GitHub Pages.

## ✅ Checklist

### Step 1: Create GitHub Repository
- [ ] Go to https://github.com/new
- [ ] Repository name: `the-full-price-frameworks`
- [ ] Description: "Environmental impact comparison tool for products"
- [ ] Set to PUBLIC (required for free GitHub Pages)
- [ ] Do NOT initialize with README/gitignore/license
- [ ] Click "Create repository"
- [ ] Copy the HTTPS URL (you'll need it in Step 3)

### Step 2: Configure Git Locally
```bash
cd /home/dylan-pavelko/Code/the_full_price_frameworks

# Initialize if needed
git init

# Set your git user info
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

- [ ] Git repository initialized
- [ ] User email configured
- [ ] User name configured

### Step 3: First Push
```bash
# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Full Price Frameworks with GitHub Pages setup"

# Add remote (replace USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/the-full-price-frameworks.git

# Push to GitHub
git branch -M main
git push -u origin main
```

- [ ] All files added to git
- [ ] First commit created
- [ ] Remote added
- [ ] Code pushed to GitHub

### Step 4: Enable GitHub Pages
1. Go to your repository on GitHub
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under "Build and deployment":
   - **Source**: Select "Deploy from a branch"
   - **Branch**: Select `main`
   - **Folder**: Select `/ (root)`
5. Click **Save**

- [ ] GitHub Pages source configured
- [ ] Pages enabled and building

### Step 5: Verify Deployment
GitHub will automatically:
1. Run all tests (via GitHub Actions)
2. Build the frontend
3. Deploy to GitHub Pages

Monitor the deployment:
- [ ] Go to **Actions** tab → "Deploy to GitHub Pages" workflow
- [ ] Wait for the workflow to complete (usually 2-5 minutes)
- [ ] Check your site at: `https://YOUR_USERNAME.github.io/the-full-price-frameworks`

### Step 6: Update Environment (Optional)
If you need to work with the backend locally:

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Run backend tests
python -m pytest tests/
```

- [ ] Backend environment set up (optional)
- [ ] Backend tests passing

## 📋 Files Modified for GitHub Pages

The following files were automatically configured for GitHub Pages hosting:

| File | Change |
|------|--------|
| `frontend/vite.config.js` | Added `base: '/the-full-price-frameworks/'` for subdirectory deployment |
| `.github/workflows/deploy.yml` | Added GitHub Actions workflow for automated testing and deployment |
| `GITHUB_PAGES_SETUP.md` | Detailed setup instructions and troubleshooting |
| `.gitignore` | Already configured to exclude build files and dependencies |

## 🚀 How It Works

### Automatic Deployment
Every time you push to the `main` branch:

1. **GitHub Actions** runs the workflow (`.github/workflows/deploy.yml`)
2. **Tests** are executed (`npm run test:ci`)
3. **Frontend** is built (`npm run build`)
4. **Results** are deployed to GitHub Pages automatically

### Static Site Serving
- The frontend is built once and served statically
- No backend server needed for GitHub Pages hosting
- The backend code is available in the repository for reference and local development
- Data is loaded from static JSON files in `frontend/public/data/`

### Site URL
Your live site will be available at:
```
https://YOUR_USERNAME.github.io/the-full-price-frameworks
```

## 📖 Reference Guides

- **GitHub Pages Documentation**: https://pages.github.com/
- **GitHub Actions Documentation**: https://docs.github.com/en/actions
- **Vite Deployment Guide**: https://vitejs.dev/guide/static-deploy.html#github-pages
- **Full Setup Details**: See `GITHUB_PAGES_SETUP.md`

## ❓ Troubleshooting

### Site not appearing?
- Check the Actions tab for build failures
- Ensure the source branch/folder is correctly configured in Settings → Pages
- Wait 2-5 minutes for GitHub to process

### 404 errors on assets?
- The base path is configured to `/the-full-price-frameworks/` in Vite
- This is set in `frontend/vite.config.js`

### Want to use a custom domain?
- Go to Settings → Pages
- Add your custom domain under "Custom domain"
- GitHub will show DNS configuration instructions

### Need to debug locally?
```bash
cd frontend
npm run dev
# Site will be at http://localhost:3000
```

## 📝 Next Steps After Deployment

1. **Share your site** - Send the GitHub Pages URL to others
2. **Make content updates** - Edit data files and push to update the site
3. **Add more products** - Use the Django admin to add products and regenerate JSON
4. **Monitor performance** - Check GitHub Actions tab for any deployment issues

---

**Need help?** See `GITHUB_PAGES_SETUP.md` for detailed instructions on every step.
