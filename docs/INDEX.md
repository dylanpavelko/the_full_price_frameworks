"""
The Full Price - Documentation Index

This file serves as a guide to all documentation and resources in the project.
Start here if you're new to the project!
"""

# 📖 DOCUMENTATION GUIDE

## 🎯 Start Here

1. **New to the project?** → Read `QUICK_START.md` (5 min read)
2. **Want to understand architecture?** → Read `README.md` (15 min read)  
3. **Need technical details?** → Read `docs/ARCHITECTURE.md` (30 min read)
4. **Looking for something specific?** → See "Finding What You Need" below

---

## 📚 Documentation Files

### QUICK_START.md
**Best for**: Rapid onboarding, running the project
- Quick start commands
- 5-minute overview
- Common commands
- Troubleshooting
- Deployment options

### README.md
**Best for**: Understanding the full project
- Project overview and mission
- Architecture explanation
- Technology stack
- Feature overview
- Development workflow
- Testing guide
- Contributing guidelines

### docs/ARCHITECTURE.md
**Best for**: Deep technical understanding
- Project structure details
- How it works (data flow)
- Development vs production
- Key concepts
- Common tasks with code examples
- Performance considerations
- Security notes

### PROJECT_SUMMARY.md
**Best for**: What was built
- Complete implementation checklist
- All files created
- Feature list
- Testing coverage
- Design principles applied

### This File (INDEX.md)
**Best for**: Navigation
- Finding what you need
- Understanding document purposes
- Code navigation

---

## 🔍 Finding What You Need

### If you want to...

#### Run the project
→ See `QUICK_START.md` → "Quick Start (5 minutes)"

#### Understand the overall structure
→ See `README.md` → "Architecture"

#### Learn how data flows
→ See `docs/ARCHITECTURE.md` → "How It Works"

#### Add a new product
→ See `README.md` → "Adding New Products"
→ See `QUICK_START.md` → "Add a New Product (3 steps)"
→ See `docs/ARCHITECTURE.md` → "Common Tasks"

#### Understand product calculations
→ See `README.md` → "Impact Calculations"
→ See `docs/ARCHITECTURE.md` → "Impact Calculation"
→ See `backend/the_full_price/products/models.py` (code + comments)

#### Write backend tests
→ See `backend/tests/test_products.py` (examples)
→ See `README.md` → "Testing"

#### Build a React component
→ See `frontend/src/components/ProductCard.jsx` (example)
→ See `frontend/src/pages/Home.jsx` (example page)
→ See `README.md` → "Frontend Structure"

#### Deploy the site
→ See `README.md` → "Deployment"
→ See `QUICK_START.md` → "Deployment options"

#### Troubleshoot issues
→ See `QUICK_START.md` → "Troubleshooting"
→ See `docs/ARCHITECTURE.md` → "Troubleshooting"

#### Understand testing
→ See `README.md` → "Testing"
→ See `backend/tests/` (test examples)
→ See `frontend/src/__tests__/` (test examples)

#### Extend the project
→ See `docs/ARCHITECTURE.md` → "Extensibility"
→ See `README.md` → "Contributing"

---

## 🗂️ Code Organization

### Backend (`backend/`)
```
├── requirements.txt                 # Python packages
├── setup.sh                         # Setup script
├── pytest.ini                       # Test configuration
├── the_full_price/
│   ├── manage.py                   # Django CLI
│   ├── settings.py                 # ← Modify for configuration
│   ├── urls.py                     # URL routing
│   ├── products/
│   │   ├── models.py               # ← Add/modify product logic
│   │   ├── views.py                # API endpoints
│   │   └── tests.py                # Product tests
│   ├── posts/
│   │   ├── models.py               # ← Blog/comparison models
│   │   ├── views.py                # Post API
│   │   └── tests.py                # Post tests
│   └── static_generation/
│       └── exporter.py             # ← JSON export logic
└── tests/
    ├── test_products.py            # Product test suite
    ├── test_posts.py               # Post test suite
    └── test_exporter.py            # Export test suite
```

**Key files to modify:**
- `products/models.py` - Add new impact dimensions
- `posts/models.py` - Add new content types
- `settings.py` - Configuration changes
- `static_generation/exporter.py` - Customize exports

### Frontend (`frontend/`)
```
src/
├── main.jsx                        # ← React entry point
├── App.jsx                         # ← Main component
├── components/                     # ← Reusable components
│   ├── Header.jsx
│   ├── ProductCard.jsx
│   ├── ImpactChart.jsx
│   └── LoadingSpinner.jsx
├── pages/                          # ← Full page components
│   ├── Home.jsx
│   ├── Products.jsx
│   ├── ProductDetail.jsx
│   └── Posts.jsx
├── hooks/                          # ← Data fetching logic
│   ├── useProducts.js
│   └── usePosts.js
├── utils/                          # ← Helper functions
│   ├── formatting.js               # ← Display formatting
│   └── comparison.js               # ← Comparison logic
├── data/
│   └── index.js                    # ← Data loading
└── __tests__/
    ├── formatting.test.js
    ├── comparison.test.js
    └── setup.js
```

**Key files to modify:**
- `components/` - Add new visual components
- `pages/` - Add new pages
- `hooks/` - Add new data fetching logic
- `utils/` - Add new calculations

---

## 🧪 Testing Guide

### Running Tests
```bash
# Backend
cd backend && pytest tests/ -v

# Frontend
cd frontend && npm test
```

### Test Files
- **Backend**: `backend/tests/test_*.py`
- **Frontend**: `frontend/src/__tests__/*.test.js`

### What's Tested
- ✅ Product calculations
- ✅ Data export
- ✅ Formatting functions
- ✅ Comparisons
- ✅ API endpoints

**Add new tests when adding features!**

---

## 🚀 Development Workflow

1. **Understand the feature** → Read relevant docs
2. **Find similar code** → Search codebase for patterns
3. **Write tests first** → TDD approach recommended
4. **Implement feature** → Follow existing patterns
5. **Run tests** → Ensure nothing broke
6. **Update docs** → Keep documentation current

---

## 📋 Common File Purposes

| File | Purpose |
|------|---------|
| `models.py` | Data structures and database schema |
| `views.py` | API endpoints or page logic |
| `urls.py` | URL routing configuration |
| `tests.py` | Automated tests for the module |
| `*.jsx` | React components |
| `*.css` | Styling for components |
| `*.test.js` | Tests for utilities |
| `*.js` | Helper/utility functions |
| `hooks/` | Custom React hooks |
| `utils/` | Pure functions |

---

## 💡 Best Practices

### When Adding Code
- ✅ Add comments for non-obvious logic
- ✅ Follow existing code style
- ✅ Add tests for new functionality
- ✅ Keep functions small and focused
- ✅ Use descriptive naming

### When Modifying Code
- ✅ Run tests after changes
- ✅ Update relevant documentation
- ✅ Keep backward compatibility
- ✅ Avoid modifying test structure

### When Deploying
- ✅ Run full test suite
- ✅ Export static data
- ✅ Build frontend
- ✅ Test build locally
- ✅ Deploy with confidence

---

## 🎓 Learning Resources

### In the Codebase
- **Comments**: Read function/class comments for explanations
- **Tests**: See test files for usage examples
- **Similar code**: Find similar patterns to understand

### Online Resources
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Pytest Documentation](https://docs.pytest.org/)

---

## ❓ FAQ

### Q: Where do I start?
**A:** Read `QUICK_START.md` then run `bash setup.sh`

### Q: How do I add a product?
**A:** See `QUICK_START.md` → "Add a New Product (3 steps)"

### Q: How do I add a new page?
**A:** Create new file in `frontend/src/pages/`, add route in `App.jsx`

### Q: How do I deploy?
**A:** See `README.md` → "Deployment"

### Q: Where do I find tests?
**A:** Backend: `backend/tests/` | Frontend: `frontend/src/__tests__/`

### Q: How do impact calculations work?
**A:** See `README.md` → "Impact Calculations"

### Q: Can I run this without Node/Python?
**A:** No, you need Python 3.8+ and Node.js 16+ installed

### Q: How do I update the data?
**A:** Edit in Django shell/admin, then run `run_export()`

---

## 🎯 Next Steps

1. **Read**: Start with `QUICK_START.md`
2. **Setup**: Run `bash setup.sh`
3. **Explore**: Start the dev servers
4. **Modify**: Add your first product
5. **Deploy**: Build and deploy the frontend

---

## 📞 Getting Help

1. **Search the codebase** for similar examples
2. **Read the comments** in the code
3. **Check test files** for usage examples
4. **Refer to documentation** listed above
5. **Review existing code** for patterns

---

**Happy developing! The Full Price is ready for your contributions.** 🚀
