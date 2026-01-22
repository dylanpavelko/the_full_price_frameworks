# The Full Price Framework

A comprehensive static site framework for understanding the 360° impact of purchases. This project demonstrates modern development practices with Django backend, React frontend, automated testing, and static data export.

## Project Overview

**The Full Price** helps users understand the complete impact of their purchases across five key dimensions:

- 💰 **Financial Impact**: Material and production costs
- 🌍 **Climate Impact**: Greenhouse gas emissions (CO₂e)
- 💧 **Water Usage**: Clean water requirements
- ⚡ **Energy**: Energy needed for production and transport
- 🌾 **Land Use**: Land required for material sourcing

## Architecture

```
the_full_price_frameworks/
├── backend/                    # Django REST API
│   ├── the_full_price/        # Main Django project
│   │   ├── products/          # Product models and views
│   │   ├── posts/             # Blog/content models
│   │   └── static_generation/ # JSON export system
│   └── tests/                 # Backend test suite
├── frontend/                   # React single-page app
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Helper functions
│   │   └── __tests__/         # Frontend test suite
│   └── index.html             # HTML entry point
└── docs/                      # Documentation
```

## Key Design Principles

### 1. **Static-First Architecture**
- The entire site can be hosted on any static hosting platform (Netlify, GitHub Pages, AWS S3)
- No database server required at runtime
- Django backend generates JSON files during build time

### 2. **Separation of Concerns**
- **Backend**: Data modeling, calculations, and static export
- **Frontend**: Display, interactivity, and user experience
- **Tests**: Comprehensive test suites for both layers

### 3. **Clean Code**
- Extensive comments explaining non-intuitive code
- Type hints for better IDE support
- Clear naming conventions
- Modular component architecture

### 4. **Easy for Juniors**
- Simple, straightforward code structure
- Well-documented functions and components
- Familiar technologies (Django, React)
- Clear separation between data and presentation

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

```bash
# Run the complete setup script
bash setup.sh

# Or manually:

# Backend setup
cd backend
bash setup.sh

# Frontend setup (in another terminal)
cd frontend
bash setup.sh
```

### Development

**Terminal 1 - Backend:**
```bash
cd backend/the_full_price
source ../venv/bin/activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit http://localhost:3000 in your browser.

## Backend Structure

### Models

#### `Material`
Represents a raw material (cotton, plastic, etc.) with impact factors per kilogram.

```python
Material.objects.create(
    name='Cotton',
    greenhouse_gas_kg_per_kg=3.5,
    water_liters_per_kg=10000,
    energy_kwh_per_kg=0.5,
    land_m2_per_kg=0.5,
    cost_per_kg=5.0
)
```

#### `Product`
Represents a physical product made up of materials.

```python
Product.objects.create(
    name='T-Shirt',
    slug='tshirt',
    purchase_price_usd=25.0,
    average_lifespan_years=2
)
```

#### `ProductComponent`
Links a product to a material with a specific weight, enabling impact calculations.

```python
ProductComponent.objects.create(
    product=tshirt,
    material=cotton,
    weight_grams=200
)
```

#### `Post`
Blog posts and product comparison articles.

```python
Post.objects.create(
    title='Cotton vs Synthetic',
    post_type='comparison',
    content='# Comparing...',
    published=True
)
```

### Impact Calculations

All impacts are calculated dynamically based on:
- Material composition of the product
- Weight of each material component
- Impact factors per kilogram of material

Example:
```
Product impact = Σ(component_weight_kg × material_impact_factor)
```

### Static Data Export

Generate JSON files for the frontend:

```bash
cd the_full_price
python manage.py shell
>>> from static_generation.exporter import StaticDataExporter
>>> exporter = StaticDataExporter()
>>> exporter.export_all()
```

This creates:
- `frontend/src/data/products.json` - All products with impacts
- `frontend/src/data/posts.json` - All posts
- `frontend/src/data/posts/{slug}.json` - Individual posts

## Frontend Structure

### Components

#### `Header`
Navigation and site branding.

#### `ProductCard`
Displays product summary with key impact metrics.

#### `ImpactChart`
Visualizes environmental impacts with bar charts.

#### `LoadingSpinner`
Shows loading state during data fetches.

### Pages

#### `Home`
Welcome page with feature overview.

#### `Products`
Product listing with grid layout.

#### `ProductDetail`
Detailed product view with component breakdown.

#### `Posts`
Blog post listing.

### Hooks

#### `useAllProducts()`
Fetch all products from JSON export.

```javascript
const { products, loading, error } = useAllProducts();
```

#### `useProduct(slug)`
Fetch single product by slug.

```javascript
const { product, loading, error } = useProduct('tshirt');
```

#### `useAllPosts()`
Fetch all posts.

#### `usePost(slug)`
Fetch single post by slug.

### Utilities

#### `formatting.js`
Converts numeric impact values to human-readable formats:
- `formatCurrency()` - USD currency
- `formatGreenhouseGas()` - kg CO₂e or metric tons
- `formatWater()` - Liters or m³
- `formatEnergy()` - kWh
- `formatLand()` - m² or hectares

#### `comparison.js`
Product comparison utilities:
- `compareProducts()` - Calculate differences between products
- `calculateEnvironmentalScore()` - Overall impact score
- `getComponentBreakdown()` - Analyze material composition

## Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

Test suites include:
- **test_products.py**: Product models and calculations
- **test_posts.py**: Post models and content
- **test_exporter.py**: Static data export functionality

### Frontend Tests

```bash
cd frontend
npm test
```

Test suites include:
- **formatting.test.js**: Format utility functions
- **comparison.test.js**: Comparison utility functions

## Deployment

### Static Hosting (Recommended)

1. **Build the frontend:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy the `dist/` folder to:**
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront
   - Any static hosting service

### With Backend Server

1. **Backend deployment:**
   - Any Python/Django hosting (Heroku, PythonAnywhere, etc.)
   - Run migrations and export static data
   - Serve the React build from Django's `staticfiles`

2. **Data updates:**
   - Update product/post data in Django admin
   - Run the static export command
   - Rebuild and redeploy frontend

## Adding New Products

### Via Django Admin

1. Create a Material (if needed)
2. Create a Product
3. Add ProductComponents linking the product to materials with weights
4. Export static data: `python manage.py shell`

### Programmatically

```python
from products.models import Material, Product, ProductComponent

cotton = Material.objects.create(
    name='Cotton', 
    greenhouse_gas_kg_per_kg=3.5,
    water_liters_per_kg=10000,
    energy_kwh_per_kg=0.5,
    land_m2_per_kg=0.5,
    cost_per_kg=5.0
)

shirt = Product.objects.create(
    name='T-Shirt',
    slug='tshirt',
    purchase_price_usd=25,
    average_lifespan_years=2
)

ProductComponent.objects.create(
    product=shirt,
    material=cotton,
    weight_grams=200
)
```

## Development Workflow

1. **Update data in Django**
   - Add/modify materials, products, posts
   - Test calculations in Django admin

2. **Run backend tests**
   ```bash
   pytest tests/ -v
   ```

3. **Export static data**
   ```bash
   cd the_full_price
   python manage.py shell
   from static_generation.exporter import run_export
   run_export()
   ```

4. **Test frontend**
   ```bash
   cd frontend
   npm test
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

6. **Deploy**
   - Upload `dist/` to static hosting
   - Or rebuild Docker image with new data

## Code Style

### Python
- Follow PEP 8
- Use type hints where helpful
- Write docstrings for all classes and functions

### JavaScript/React
- Use modern ES6+ syntax
- Component names are PascalCase
- Function names are camelCase
- Add JSDoc comments for complex logic

## Future Enhancements

- [ ] User-generated comparisons
- [ ] Impact calculator tool
- [ ] CSV export of product data
- [ ] Sustainability recommendations
- [ ] Product ratings by impact
- [ ] Search and filtering interface
- [ ] Advanced analytics dashboard

## Contributing

This project is designed to be easy for junior developers to understand and contribute to. When adding features:

1. Follow the existing code structure
2. Add comprehensive comments
3. Write tests for new functionality
4. Update this README

## License

This project is provided as an example of modern web development practices.

## Support

For questions or issues:
1. Check the code comments
2. Review the test files for usage examples
3. Look at similar components/utilities for patterns

---

**The Full Price** - Making informed purchases, one impact at a time.
