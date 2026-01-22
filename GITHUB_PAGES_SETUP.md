# GitHub Pages Setup Guide

This guide will help you set up your Full Price Frameworks project on GitHub and deploy it to GitHub Pages.

## Prerequisites
- GitHub account
- Git installed locally
- Project already built (run `npm run build` in frontend/)

## Step 1: Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Name your repository: `the-full-price-frameworks` (or desired name)
3. Add description: "Environmental impact comparison tool for products"
4. Choose Public (required for free GitHub Pages)
5. Do NOT initialize with README (we already have one)
6. Click "Create repository"

## Step 2: Initialize Git Locally

```bash
cd /home/dylan-pavelko/Code/the_full_price_frameworks

# Initialize git
git init

# Set user info
git config user.email "your-email@example.com"
git config user.name "Your Name"
```

## Step 3: Create .gitignore

The project already has necessary documentation. Create a `.gitignore` file:

```bash
# Backend
backend/db.sqlite3
backend/.env
backend/__pycache__/
backend/*/migrations/__pycache__/
backend/venv/
backend/.pytest_cache/

# Frontend
frontend/node_modules/
frontend/.vite/
frontend/dist/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

## Step 4: Build Frontend for GitHub Pages

```bash
cd frontend/

# Build the frontend
npm run build

# The output will be in frontend/dist/
```

## Step 5: Setup GitHub Pages Serving

GitHub Pages requires the site to be served from either:
- `/docs` folder in main branch
- `gh-pages` branch

### Option A: Serve from `/docs` folder (Recommended - Simpler)

```bash
cd /home/dylan-pavelko/Code/the_full_price_frameworks

# Copy the built frontend to docs folder
mkdir -p docs
cp -r frontend/dist/* docs/

# Add to git
git add .
git commit -m "Initial commit with frontend build for GitHub Pages"
```

Then on GitHub:
1. Go to repository Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select Branch: `main` (or `master`)
4. Select Folder: `/(root)` or `/docs` if the option exists
5. Click Save

### Option B: Serve from `gh-pages` branch (Alternative)

```bash
# Build the frontend first
cd frontend && npm run build && cd ..

# Create and switch to gh-pages branch
git checkout --orphan gh-pages
git rm -rf .

# Copy only the built frontend
cp -r frontend/dist/* .
git add .
git commit -m "Deploy frontend to GitHub Pages"
git push origin gh-pages

# Switch back to main
git checkout main
```

Then on GitHub:
1. Go to repository Settings → Pages
2. Set Source to "Deploy from a branch"
3. Select Branch: `gh-pages`
4. Click Save

## Step 6: Add Remote and Push

```bash
# Add your GitHub remote (replace USERNAME and REPO with your info)
git remote add origin https://github.com/YOUR_USERNAME/the-full-price-frameworks.git

# For main branch approach:
git branch -M main
git push -u origin main

# Or if using gh-pages:
git push -u origin gh-pages
```

## Step 7: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click Settings → Pages
3. Under "Build and deployment"
   - Source: Choose the deployment branch/folder you used
   - Custom domain: (optional)
4. GitHub will show your site URL once deployed (usually takes 1-2 minutes)

## File Structure for GitHub Pages

If using `/docs` folder approach:

```
the-full-price-frameworks/
├── docs/                    # GitHub Pages serves from here
│   ├── index.html
│   ├── assets/
│   └── ...
├── frontend/
│   ├── src/
│   ├── dist/                # Build output (copy to docs)
│   └── package.json
├── backend/
│   └── ...
└── README.md
```

## Automatic Builds (Optional - GitHub Actions)

For automatic rebuilds and deployment on code changes, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm install
      
      - name: Build
        run: cd frontend && npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
```

This automatically deploys whenever you push to main.

## Verification

After setup:

1. Your site will be available at: `https://YOUR_USERNAME.github.io/the-full-price-frameworks`
   (or custom domain if configured)

2. Check deployment status in repository Settings → Pages

3. View deployment history under Actions tab

## Troubleshooting

- **Site not appearing**: GitHub Pages can take 1-2 minutes to deploy. Check the Actions tab for build errors.
- **404 errors**: Ensure the correct branch/folder is selected in Settings → Pages
- **Assets not loading**: Check that paths in your app are relative (not absolute) to the domain root
- **Vite config**: You may need to set `base: '/the-full-price-frameworks/'` in `vite.config.js` if serving from a subdirectory

## Next Steps

1. Complete Step 1-6 above
2. Verify your site is live
3. Continue development - pushes to main will update the site
