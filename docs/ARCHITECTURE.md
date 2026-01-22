# The Full Price - Documentation

## Project Structure

### Backend
- **products/**: Django app for product models and impact calculations
- **posts/**: Django app for blog content and comparisons
- **static_generation/**: System for exporting data to JSON
- **tests/**: Comprehensive test suite with 30+ tests

### Frontend
- **components/**: Reusable React components
- **pages/**: Full-page components (Home, Products, Posts, etc.)
- **hooks/**: Custom React hooks for data fetching
- **utils/**: Helper functions for formatting and comparisons
- **__tests__/**: Test suites for utilities

## How It Works

### 1. Data Entry
Product and material data is managed through Django models:
- Admins/developers add materials and their impact factors
- Admins/developers create products and specify their composition
- Posts are written and linked to products (optional)

### 2. Impact Calculation
When products are viewed, impacts are calculated dynamically:
- Each product component (material + weight) is multiplied by material impact factors
- Total product impacts are the sum of all components

### 3. Static Export
Before deployment, all data is exported to JSON:
- `products.json`: All products with calculated impacts
- `posts.json`: All posts with metadata
- `posts/{slug}.json`: Individual post files

### 4. Frontend Display
The React frontend loads static JSON and displays:
- Product cards with summary impacts
- Detailed product pages with component breakdown
- Blog posts with comparisons
- Impact visualizations

### 5. Deployment
The built frontend is deployed to any static host:
- No server needed at runtime
- No database queries
- Fast, scalable, cheap hosting

## Technology Stack

### Backend
- **Django 5.0**: Web framework and ORM
- **SQLite**: Development database
- **pytest**: Testing framework
- **Python 3.8+**: Language

### Frontend
- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **React Router**: Client-side routing
- **Vitest**: Testing framework

## Development vs Production

### Development
1. Backend runs Django dev server with SQLite database
2. Frontend runs Vite dev server with hot reload
3. Data is live from the database
4. Tests run continuously

### Production
1. No backend server needed (except for updates)
2. Frontend is static HTML/CSS/JS
3. All data is pre-generated JSON
4. Hosted on CDN for speed
5. Updates require rebuilding and redeploying

## Key Concepts

### Impact Calculation
All environmental impacts are calculated based on:
- **Material**: Contains impact factors per kg
- **Weight**: Amount of material used
- **Formula**: impact = weight_kg × material_factor

Example:
```
Product: T-Shirt (200g cotton)
Cotton: 3.5 kg CO2e per kg
T-Shirt CO2e = 0.2 kg × 3.5 = 0.7 kg CO2e
```

### Component-Based UI
React components are organized by responsibility:
- **Page components**: Full pages (Products, Home, etc.)
- **Reusable components**: Cards, charts, spinners
- **Hooks**: Data fetching logic
- **Utils**: Pure functions for calculations

### Testing Strategy
- **Backend tests**: Verify calculations and models
- **Frontend tests**: Verify utilities and formatting
- **Integration**: Manual testing of complete flows
- **CI/CD**: Automated tests on code changes

## Common Tasks

### Add a New Material
```python
Material.objects.create(
    name='Aluminum',
    greenhouse_gas_kg_per_kg=8.0,
    water_liters_per_kg=1000,
    energy_kwh_per_kg=2.0,
    land_m2_per_kg=0.01,
    cost_per_kg=3.0
)
```

### Create a Product
```python
aluminum = Material.objects.get(name='Aluminum')
can = Product.objects.create(
    name='Aluminum Can',
    slug='aluminum-can',
    purchase_price_usd=0.10,
    average_lifespan_years=0.25
)
ProductComponent.objects.create(
    product=can,
    material=aluminum,
    weight_grams=15
)
```

### Write a Comparison Post
```python
post = Post.objects.create(
    title='Paper vs Plastic Bags',
    slug='paper-vs-plastic',
    post_type='comparison',
    content='# Which is better?...',
    published=True
)
# Add products to the comparison
for product in [paper_bag, plastic_bag]:
    ComparisonPost.objects.create(post=post, product=product)
```

### Run Tests
```bash
# Backend
cd backend && pytest tests/ -v

# Frontend
cd frontend && npm test
```

### Export Data and Build
```bash
# Backend export
cd backend/the_full_price
python manage.py shell
from static_generation.exporter import run_export
run_export()

# Frontend build
cd frontend
npm run build
```

## Performance Considerations

### Backend
- Calculations run once during export (not on every request)
- Database queries are minimal
- No real-time processing needed

### Frontend
- Static files load instantly from CDN
- No API calls after page load
- React bundle is optimized by Vite
- Component code splitting reduces initial load

### Scaling
- Add more materials and products without performance impact
- Export time is O(n) where n = number of products
- Frontend load time is independent of data size

## Security

### Backend
- No user inputs (admin-only content management)
- CSRF protection on forms
- Environment variables for secrets
- SQLite safe for small projects

### Frontend
- Static files only (no server vulnerabilities)
- No authentication needed
- Safe from XSS (no dynamic HTML generation)
- Content Security Policy ready

## Extensibility

### Adding New Impact Dimensions
1. Add field to Material model (e.g., `air_quality_impact`)
2. Update ProductComponent calculation method
3. Update exporter to include new field
4. Update frontend to display new metric

### Adding New Content Types
1. Create new model in appropriate app
2. Add `to_dict()` method for JSON export
3. Update StaticDataExporter
4. Create frontend component to display

### Custom API Endpoints
Add views to display specific data:
```python
# In products/views.py
def products_by_material(request, material_id):
    products = Product.objects.filter(
        components__material_id=material_id
    ).distinct()
    return JsonResponse([p.to_dict() for p in products])
```

## Troubleshooting

### Backend won't start
- Ensure Python 3.8+ is installed
- Run migrations: `python manage.py migrate`
- Check PYTHONPATH includes the project

### Frontend won't build
- Ensure Node.js 16+ is installed
- Clear `node_modules/`: `rm -rf node_modules && npm install`
- Check for JavaScript syntax errors

### Data not updating
- Did you run the export command?
- Are you looking at the correct data files?
- Clear browser cache or hard refresh (Ctrl+Shift+R)

### Tests failing
- Run with verbose flag: `pytest -v` or `npm test -- --reporter=verbose`
- Check that all fixtures are created
- Ensure database is clean: `pytest --tb=short --lf` (last failed)

---

For more detailed information, see the main README.md or the code comments.
