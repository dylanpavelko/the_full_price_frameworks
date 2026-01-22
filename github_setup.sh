#!/bin/bash

# GitHub Setup Script for The Full Price Frameworks

echo "================================================"
echo "The Full Price Frameworks - GitHub Setup"
echo "================================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "ERROR: git is not installed. Please install git first."
    exit 1
fi

cd "$(dirname "$0")" || exit 1

# Initialize git if not already done
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    
    read -p "Enter your Git email: " git_email
    read -p "Enter your Git name: " git_name
    
    git config user.email "$git_email"
    git config user.name "$git_name"
    echo "✓ Git initialized"
else
    echo "✓ Git repository already initialized"
fi

echo ""
echo "Next steps:"
echo ""
echo "1. Create a new repository on GitHub:"
echo "   - Go to https://github.com/new"
echo "   - Name it: the-full-price-frameworks"
echo "   - Make it PUBLIC (required for GitHub Pages)"
echo "   - Do NOT initialize with README/gitignore/license"
echo "   - Click 'Create repository'"
echo ""
echo "2. Add the remote and push (replace USERNAME):"
echo "   git remote add origin https://github.com/USERNAME/the-full-price-frameworks.git"
echo "   git branch -M main"
echo "   git add ."
echo "   git commit -m 'Initial commit'"
echo "   git push -u origin main"
echo ""
echo "3. Enable GitHub Pages:"
echo "   - Go to Settings → Pages"
echo "   - Source: Deploy from a branch"
echo "   - Branch: main / (root)"
echo "   - Click Save"
echo ""
echo "4. GitHub Actions will automatically:"
echo "   - Run tests on every push"
echo "   - Build the frontend"
echo "   - Deploy to GitHub Pages"
echo ""
echo "Your site will be available at:"
echo "https://USERNAME.github.io/the-full-price-frameworks"
echo ""
echo "For detailed instructions, see GITHUB_PAGES_SETUP.md"
