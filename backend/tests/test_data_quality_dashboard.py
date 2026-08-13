"""
Tests for the admin data quality dashboard.
"""
from django.contrib.auth import get_user_model
from django.test import TestCase

from products.models import Material, Product, ProductComponent


class DataQualityDashboardTests(TestCase):
    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='password123',
        )

        self.material = Material.objects.create(
            name='Cotton',
            data_status='draft',
            production_co2e_kg_per_kg=2.0,
            production_water_liters_per_kg=10000,
            production_energy_kwh_per_kg=1.0,
            production_land_m2_per_kg=1.0,
            production_cost_per_kg=5.0,
        )

        self.product = Product.objects.create(
            name='T-Shirt',
            slug='t-shirt',
            purchase_price_usd=20.0,
            data_status='draft',
        )
        ProductComponent.objects.create(
            product=self.product,
            material=self.material,
            weight_grams=200,
        )

    def test_dashboard_lists_materials_and_products(self):
        self.client.force_login(self.user)
        response = self.client.get('/admin/data-quality/')

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'Cotton')
        self.assertContains(response, 'T-Shirt')
        self.assertContains(response, '/admin/products/material/')
        self.assertContains(response, '/admin/products/product/')
