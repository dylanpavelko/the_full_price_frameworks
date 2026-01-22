#!/bin/bash
# Verification script to confirm project structure
# Run this to verify all files were created correctly

echo "🔍 Verifying The Full Price Project Structure..."
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Counter
TOTAL=0
FOUND=0

check_file() {
    TOTAL=$((TOTAL + 1))
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        FOUND=$((FOUND + 1))
    else
        echo -e "${RED}✗${NC} $1"
    fi
}

check_dir() {
    TOTAL=$((TOTAL + 1))
    if [ -d "$1" ]; then
        echo -e "${GREEN}✓${NC} $1/"
        FOUND=$((FOUND + 1))
    else
        echo -e "${RED}✗${NC} $1/"
    fi
}

echo "📁 DIRECTORIES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_dir "backend"
check_dir "backend/the_full_price"
check_dir "backend/the_full_price/products"
check_dir "backend/the_full_price/posts"
check_dir "backend/the_full_price/static_generation"
check_dir "backend/tests"
check_dir "frontend"
check_dir "frontend/src"
check_dir "frontend/src/components"
check_dir "frontend/src/pages"
check_dir "frontend/src/hooks"
check_dir "frontend/src/utils"
check_dir "frontend/src/data"
check_dir "frontend/src/__tests__"
check_dir "docs"
echo ""

echo "📄 BACKEND FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "backend/requirements.txt"
check_file "backend/setup.sh"
check_file "backend/pytest.ini"
check_file "backend/setup.cfg"
check_file "backend/the_full_price/manage.py"
check_file "backend/the_full_price/settings.py"
check_file "backend/the_full_price/urls.py"
check_file "backend/the_full_price/__init__.py"
check_file "backend/the_full_price/products/__init__.py"
check_file "backend/the_full_price/products/apps.py"
check_file "backend/the_full_price/products/models.py"
check_file "backend/the_full_price/products/views.py"
check_file "backend/the_full_price/products/urls.py"
check_file "backend/the_full_price/posts/__init__.py"
check_file "backend/the_full_price/posts/apps.py"
check_file "backend/the_full_price/posts/models.py"
check_file "backend/the_full_price/posts/views.py"
check_file "backend/the_full_price/posts/urls.py"
check_file "backend/the_full_price/static_generation/__init__.py"
check_file "backend/the_full_price/static_generation/exporter.py"
check_file "backend/tests/__init__.py"
check_file "backend/tests/conftest.py"
check_file "backend/tests/test_products.py"
check_file "backend/tests/test_posts.py"
check_file "backend/tests/test_exporter.py"
echo ""

echo "📄 FRONTEND FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "frontend/package.json"
check_file "frontend/vite.config.js"
check_file "frontend/vite.config.test.js"
check_file "frontend/.gitignore"
check_file "frontend/setup.sh"
check_file "frontend/index.html"
check_file "frontend/src/main.jsx"
check_file "frontend/src/App.jsx"
check_file "frontend/src/App.css"
check_file "frontend/src/index.css"
check_file "frontend/src/data/index.js"
check_file "frontend/src/hooks/useProducts.js"
check_file "frontend/src/hooks/usePosts.js"
check_file "frontend/src/utils/formatting.js"
check_file "frontend/src/utils/comparison.js"
check_file "frontend/src/components/Header.jsx"
check_file "frontend/src/components/Header.css"
check_file "frontend/src/components/ProductCard.jsx"
check_file "frontend/src/components/ProductCard.css"
check_file "frontend/src/components/ImpactChart.jsx"
check_file "frontend/src/components/ImpactChart.css"
check_file "frontend/src/components/LoadingSpinner.jsx"
check_file "frontend/src/components/LoadingSpinner.css"
check_file "frontend/src/pages/Home.jsx"
check_file "frontend/src/pages/Home.css"
check_file "frontend/src/pages/Products.jsx"
check_file "frontend/src/pages/Products.css"
check_file "frontend/src/pages/ProductDetail.jsx"
check_file "frontend/src/pages/ProductDetail.css"
check_file "frontend/src/pages/Posts.jsx"
check_file "frontend/src/pages/Posts.css"
check_file "frontend/src/__tests__/setup.js"
check_file "frontend/src/__tests__/formatting.test.js"
check_file "frontend/src/__tests__/comparison.test.js"
echo ""

echo "📄 DOCUMENTATION & CONFIG FILES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
check_file "README.md"
check_file "QUICK_START.md"
check_file "PROJECT_SUMMARY.md"
check_file "setup.sh"
check_file ".gitignore"
check_file "docs/ARCHITECTURE.md"
check_file "docs/INDEX.md"
check_file "backend/the_full_price/static_generation/management_command_example.py"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 SUMMARY: $FOUND / $TOTAL items found"
echo ""

if [ $FOUND -eq $TOTAL ]; then
    echo -e "${GREEN}✓ All project files verified!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: bash setup.sh"
    echo "2. Read: QUICK_START.md"
    echo "3. Start: npm run dev (frontend) + python manage.py runserver (backend)"
    exit 0
else
    echo -e "${RED}✗ Some files are missing!${NC}"
    echo "Missing: $((TOTAL - FOUND)) files"
    exit 1
fi
