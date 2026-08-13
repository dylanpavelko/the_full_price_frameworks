"""
Tests for the products app.

Tests verify:
- Material model creation and data integrity
- Product impact calculations are accurate
- ProductComponent calculations work correctly
- API endpoints return correct data
"""
import pytest
from django.test import TestCase
from products.models import Material, Product, ProductComponent


class MaterialModelTests(TestCase):
    """Test the Material model."""

    def setUp(self):
        """Create test fixtures."""
        self.cotton = Material.objects.create(
            name='Cotton',
            production_co2e_kg_per_kg=3.5,
            production_water_liters_per_kg=10000,
            production_energy_kwh_per_kg=0.5,
            production_land_m2_per_kg=0.5,
            production_cost_per_kg=5.0,
            production_source_name='Test source',
            transport_source_name='Test source',
            end_of_life_source_name='Test source',
        )

    def test_material_creation(self):
        """Test that a material can be created with all fields."""
        self.assertEqual(self.cotton.name, 'Cotton')
        self.assertEqual(self.cotton.production_co2e_kg_per_kg, 3.5)
        self.assertEqual(self.cotton.production_water_liters_per_kg, 10000)

    def test_material_str(self):
        """Test material string representation."""
        self.assertEqual(str(self.cotton), 'Cotton')

    def test_material_completeness_summary(self):
        summary = self.cotton.get_completeness_summary()

        self.assertEqual(summary['status'], 'draft')
        self.assertEqual(summary['overall_percent'], 100.0)
        self.assertEqual(summary['missing_items'], [])

    def test_material_uniqueness(self):
        """Test that material names are unique."""
        with self.assertRaises(Exception):
            Material.objects.create(name='Cotton')


class ProductComponentTests(TestCase):
    """Test the ProductComponent model and its calculations."""

    def setUp(self):
        """Create test fixtures."""
        self.cotton = Material.objects.create(
            name='Cotton',
            data_status='approved',
            production_co2e_kg_per_kg=2.0,
            production_water_liters_per_kg=10000,
            production_energy_kwh_per_kg=1.0,
            production_land_m2_per_kg=1.0,
            production_cost_per_kg=10.0,
            production_source_name='Test source',
            transport_source_name='Test source',
            end_of_life_source_name='Test source',
        )
        
        self.product = Product.objects.create(
            name='T-Shirt',
            slug='t-shirt',
            purchase_price_usd=20.0,
            uses_per_year=50,
            average_lifespan_uses=100
        )
        
        # 200 grams = 0.2 kg of cotton
        self.component = ProductComponent.objects.create(
            product=self.product,
            material=self.cotton,
            weight_grams=200
        )

    def test_weight_conversion(self):
        """Test conversion from grams to kilograms."""
        self.assertEqual(self.component.get_weight_kg(), 0.2)

    def test_greenhouse_gas_calculation(self):
        """Test greenhouse gas impact calculation."""
        # 0.2 kg * 2.0 kg CO2e per kg = 0.4 kg CO2e
        expected = 0.4
        self.assertEqual(self.component.get_greenhouse_gas_impact(), expected)

    def test_water_calculation(self):
        """Test water impact calculation."""
        # 0.2 kg * 10000 L/kg = 2000 L
        expected = 2000.0
        self.assertEqual(self.component.get_water_impact(), expected)

    def test_energy_calculation(self):
        """Test energy impact calculation."""
        # 0.2 kg * 1.0 kWh/kg = 0.2 kWh
        expected = 0.2
        self.assertEqual(self.component.get_energy_impact(), expected)

    def test_land_calculation(self):
        """Test land impact calculation."""
        # 0.2 kg * 1.0 m²/kg = 0.2 m²
        expected = 0.2
        self.assertEqual(self.component.get_land_impact(), expected)

    def test_cost_calculation(self):
        """Test material cost calculation."""
        # 0.2 kg * $10/kg = $2
        expected = 2.0
        self.assertEqual(self.component.get_cost_impact(), expected)

    def test_component_to_dict(self):
        """Test conversion to dictionary for JSON serialization."""
        data = self.component.to_dict()
        
        self.assertEqual(data['material_name'], 'Cotton')
        self.assertEqual(data['weight_grams'], 200)
        self.assertEqual(data['impacts']['greenhouse_gas_kg'], 0.4)
        self.assertEqual(data['impacts']['water_liters'], 2000.0)
        self.assertEqual(data['impacts']['cost_usd'], 2.0)


class ProductTests(TestCase):
    """Test the Product model and its aggregate calculations."""

    def setUp(self):
        """Create test fixtures."""
        self.cotton = Material.objects.create(
            name='Cotton',
            data_status='approved',
            production_co2e_kg_per_kg=2.0,
            production_water_liters_per_kg=10000,
            production_energy_kwh_per_kg=1.0,
            production_land_m2_per_kg=1.0,
            production_cost_per_kg=10.0,
            production_source_name='Test source',
            transport_source_name='Test source',
            end_of_life_source_name='Test source',
        )
        
        self.plastic = Material.objects.create(
            name='Plastic',
            data_status='approved',
            production_co2e_kg_per_kg=3.0,
            production_water_liters_per_kg=100,
            production_energy_kwh_per_kg=2.0,
            production_land_m2_per_kg=0.1,
            production_cost_per_kg=2.0,
            production_source_name='Test source',
            transport_source_name='Test source',
            end_of_life_source_name='Test source',
        )
        
        self.product = Product.objects.create(
            name='Hybrid Bag',
            slug='hybrid-bag',
            purchase_price_usd=50.0,
            uses_per_year=75,
            average_lifespan_uses=300
        )
        
        # 400g cotton
        ProductComponent.objects.create(
            product=self.product,
            material=self.cotton,
            weight_grams=400
        )
        
        # 100g plastic
        ProductComponent.objects.create(
            product=self.product,
            material=self.plastic,
            weight_grams=100
        )

    def test_product_creation(self):
        """Test that a product can be created."""
        self.assertEqual(self.product.name, 'Hybrid Bag')
        self.assertEqual(self.product.purchase_price_usd, 50.0)

    def test_product_total_greenhouse_gas(self):
        """Test total greenhouse gas calculation across all components."""
        impact = self.product.get_total_impact()
        
        # Upfront total: 1.1, annualized over 300 uses and 75 uses/year = 0.275
        expected = 0.275
        self.assertEqual(impact['greenhouse_gas_kg']['value'], expected)

    def test_product_total_water(self):
        """Test total water impact across all components."""
        impact = self.product.get_total_impact()
        
        # Upfront total: 4010, annualized over 300 uses and 75 uses/year = 1002.5
        expected = 1002.5
        self.assertEqual(impact['water_liters']['value'], expected)

    def test_product_total_cost(self):
        """Test total cost including material costs and purchase price."""
        impact = self.product.get_total_impact()
        
        # Upfront material cost total: $4.20, annualized over 300 uses and 75 uses/year = $1.05
        expected = 1.05
        self.assertEqual(impact['cost_usd']['value'], expected)

    def test_product_to_dict(self):
        """Test conversion to dictionary for JSON serialization."""
        data = self.product.to_dict()
        
        self.assertEqual(data['name'], 'Hybrid Bag')
        self.assertEqual(data['slug'], 'hybrid-bag')
        self.assertEqual(len(data['components']), 2)
        self.assertIn('impacts', data)
        
        # Verify impacts are included
        self.assertIn('greenhouse_gas_kg', data['impacts'])
        self.assertIn('water_liters', data['impacts'])
        self.assertIn('energy_kwh', data['impacts'])
        self.assertIn('land_m2', data['impacts'])
        self.assertIn('cost_usd', data['impacts'])
        self.assertIn('completeness', data)

    def test_product_completeness_summary(self):
        summary = self.product.get_completeness_summary()

        self.assertEqual(summary['status'], 'draft')
        self.assertEqual(summary['phase_percentages']['components'], 100)
        self.assertEqual(summary['missing_items'], ['use phase source'])


class ProductAPITests(TestCase):
    """Test the product API endpoints."""

    def setUp(self):
        """Create test fixtures."""
        self.material = Material.objects.create(
            name='Test Material',
            production_co2e_kg_per_kg=1.0,
            production_water_liters_per_kg=100,
            production_energy_kwh_per_kg=0.5,
            production_land_m2_per_kg=0.1,
            production_cost_per_kg=5.0,
            production_source_name='Test source',
            transport_source_name='Test source',
            end_of_life_source_name='Test source',
        )
        
        self.product = Product.objects.create(
            name='Test Product',
            slug='test-product',
            purchase_price_usd=25.0
        )
        
        ProductComponent.objects.create(
            product=self.product,
            material=self.material,
            weight_grams=100
        )

    def test_product_list_endpoint(self):
        """Test the product list API endpoint."""
        response = self.client.get('/api/products/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertIn('products', data)
        self.assertEqual(len(data['products']), 1)
        self.assertEqual(data['products'][0]['name'], 'Test Product')

    def test_product_detail_endpoint(self):
        """Test the product detail API endpoint."""
        response = self.client.get('/api/products/test-product/')
        self.assertEqual(response.status_code, 200)
        
        data = response.json()
        self.assertEqual(data['name'], 'Test Product')
        self.assertEqual(data['slug'], 'test-product')
        self.assertIn('impacts', data)

    def test_product_not_found(self):
        """Test product detail endpoint with non-existent slug."""
        response = self.client.get('/api/products/nonexistent/')
        self.assertEqual(response.status_code, 404)
