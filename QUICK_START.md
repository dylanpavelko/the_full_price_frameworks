# The Full Price - Quick Reference Guide

## 🚀 Quick Start (5 minutes)

```bash
# Clone to your local machine
cd /home/dylan-pavelko/Code/the_full_price_frameworks

# Run complete setup
bash setup.sh

# Terminal 1: Start Backend
cd backend/the_full_price
source ../venv/bin/activate
python manage.py runserver

# Terminal 2: Start Frontend
cd frontend
npm run dev

# Open browser
http://localhost:3000
```

---

## 📊 5-Minute Overview

### What It Does
Helps users understand the **360° impact** of purchases on:
- 💰 **Finances** - Material costs
- 🌍 **Climate** - CO₂e emissions
- 💧 **Water** - Clean water needed
- ⚡ **Energy** - kWh required
- 🌾 **Land** - m² required

### Architecture
```
Django Backend (data) → JSON Export → React Frontend (static files)
```

### Key Benefit
**Static hosting** - Deploy anywhere (Netlify, GitHub Pages, AWS S3)

---

## 🏗️ Project Structure At a Glance

```
backend/           Django + testing
├── products/      Product/Material models
├── posts/         Blog/comparison posts
├── static_generation/  JSON export
└── tests/          30+ automated tests

frontend/          React + Vite
├── components/    Reusable parts
├── pages/         Full pages
├── hooks/         Data fetching
├── utils/         Helpers
└── __tests__/     Frontend tests
```

---

## 🎯 Common Commands

### Development
```bash
# Backend server
cd backend/the_full_price && python manage.py runserver

# Frontend dev
cd frontend && npm run dev

# Backend tests
cd backend && pytest tests/ -v

# Frontend tests
cd frontend && npm test
```

### Data Management
```bash
# Add products via Django shell
cd backend/the_full_price
python manage.py shell
# >>> from products.models import Material, Product, ProductComponent
# >>> Material.objects.create(...)

# Export to JSON
python manage.py shell
# >>> from static_generation.exporter import run_export
# >>> run_export()
```

### Deployment
```bash
# Build frontend
cd frontend && npm run build
# → Output in: frontend/dist/

# Deploy static files to hosting
# (Netlify, Vercel, GitHub Pages, AWS S3, etc.)
```

---

## 📝 Add a New Product (3 steps)

### Step 1: Create Material (if needed)
```python
from products.models import Material

Material.objects.create(
    name='Cotton',
    greenhouse_gas_kg_per_kg=3.5,
    water_liters_per_kg=10000,
    energy_kwh_per_kg=0.5,
    land_m2_per_kg=0.5,
    cost_per_kg=5.0
)
```

### Step 2: Create Product
```python
from products.models import Product

Product.objects.create(
    name='T-Shirt',
    slug='tshirt',
    description='Basic cotton t-shirt',
    purchase_price_usd=25.0,
    average_lifespan_years=2
)
```

### Step 3: Add Components
```python
from products.models import ProductComponent

ProductComponent.objects.create(
    product=tshirt,
    material=cotton,
    weight_grams=200
)
```

### Step 4: Export Data
```python
from static_generation.exporter import run_export
run_export()
```

---

## 🧪 Testing

### Run All Tests
```bash
# Backend
cd backend && pytest tests/ -v

# Frontend
cd frontend && npm test
```

### What's Tested
- ✅ Product impact calculations
- ✅ Material weight conversions
- ✅ Static JSON export
- ✅ Formatting utilities (currency, emissions, etc.)
- ✅ Product comparisons
- ✅ API endpoints

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `backend/the_full_price/products/models.py` | Product data models |
| `backend/the_full_price/static_generation/exporter.py` | JSON export system |
| `frontend/src/components/ProductCard.jsx` | Product display card |
| `frontend/src/pages/ProductDetail.jsx` | Detailed product page |
| `frontend/src/utils/formatting.js` | Format numbers for display |
| `frontend/src/utils/comparison.js` | Product comparison logic |

---

## 🎨 Styling

- **CSS Modules**: Each component has accompanying `.css` file
- **Color Scheme**:
  - Primary: `#2c3e50` (dark blue)
  - Accent: `#3498db` (light blue)
  - Success: `#27ae60` (green)
  - Warning: `#f39c12` (orange)
  - Danger: `#e74c3c` (red)

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Ensure virtual environment activated
source backend/venv/bin/activate

# Run migrations
cd backend/the_full_price && python manage.py migrate
```

### Frontend won't build
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Data not showing up
```bash
# Did you export?
cd backend/the_full_price
python manage.py shell
from static_generation.exporter import run_export
run_export()

# Check frontend/src/data/products.json exists
```

---

## 📚 Documentation

- **README.md** - Full project guide
- **docs/ARCHITECTURE.md** - Technical details
- **PROJECT_SUMMARY.md** - What was built
- **Code Comments** - Inline explanations

---

## 🚀 Deployment Options

### Option 1: Static Hosting (Recommended)
```bash
cd frontend && npm run build
# Upload frontend/dist/ to:
# - Netlify
# - Vercel
# - GitHub Pages
# - AWS S3 + CloudFront
```

### Option 2: Traditional Server
- Deploy Django backend to Python hosting
- Build frontend and serve from Django
- Database updates trigger rebuild

### Option 3: Docker
Create Dockerfile with both services running in containers

---

## 💡 Pro Tips

1. **Test before deploying**: `pytest tests/ -v && npm test`
2. **Always export after data changes**: `run_export()`
3. **Use versioning for data**: Add timestamps to exports
4. **Monitor bundle size**: `npm run build` shows output size
5. **Use browser DevTools**: Debug React with React DevTools

---

## 📞 Getting Help

1. Check inline code comments
2. Review test files for usage examples
3. Read ARCHITECTURE.md for deep dives
4. Look at similar components for patterns

---

## ✅ Checklist for First Run

- [ ] Run `bash setup.sh`
- [ ] Backend starts: `python manage.py runserver`
- [ ] Frontend starts: `npm run dev`
- [ ] Visit http://localhost:3000
- [ ] Tests pass: `pytest tests/ -v` && `npm test`
- [ ] Add sample product via Django shell
- [ ] Export data: `run_export()`
- [ ] See product on frontend

---

## 🎯 Next Features to Add

- [ ] User impact calculator (real-time)
- [ ] Product filtering and search
- [ ] Sustainability recommendations
- [ ] Export data as CSV
- [ ] Advanced analytics dashboard
- [ ] Community user comparisons

---

**Happy coding! The Full Price is ready to help people make informed purchases.** 🌍
