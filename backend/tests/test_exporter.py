"""
Tests for the static data exporter.

Tests verify:
- Data is correctly exported to JSON format
- All products and posts are included
- JSON files are properly formatted
- Timestamp is included in exports
"""
import json
import os
from pathlib import Path
from tempfile import TemporaryDirectory
from django.test import TestCase, override_settings
from products.models import Material, Product, ProductComponent
from posts.models import Post
from static_generation.exporter import StaticDataExporter


class StaticDataExporterTests(TestCase):
    """Test the static data exporter functionality."""

    def setUp(self):
        """Create test fixtures."""
        # Create materials
        self.cotton = Material.objects.create(
            name='Cotton',
            greenhouse_gas_kg_per_kg=2.0,
            water_liters_per_kg=10000,
            energy_kwh_per_kg=1.0,
            land_m2_per_kg=1.0,
            cost_per_kg=5.0
        )
        
        # Create product
        self.product = Product.objects.create(
            name='Test T-Shirt',
            slug='test-tshirt',
            purchase_price_usd=20.0
        )
        ProductComponent.objects.create(
            product=self.product,
            material=self.cotton,
            weight_grams=200
        )
        
        # Create post
        self.post = Post.objects.create(
            title='Test Blog Post',
            slug='test-blog',
            content='This is a test post',
            published=True
        )

    @override_settings(STATIC_DATA_OUTPUT_DIR='/tmp/test_export')
    def test_exporter_creates_directories(self):
        """Test that exporter creates output directories if they don't exist."""
        with TemporaryDirectory() as tmpdir:
            with override_settings(STATIC_DATA_OUTPUT_DIR=tmpdir):
                exporter = StaticDataExporter()
                self.assertTrue(exporter.output_dir.exists())

    @override_settings(STATIC_DATA_OUTPUT_DIR='/tmp/test_export')
    def test_export_products_file(self):
        """Test that products are correctly exported to JSON."""
        with TemporaryDirectory() as tmpdir:
            with override_settings(STATIC_DATA_OUTPUT_DIR=tmpdir):
                exporter = StaticDataExporter()
                exporter.export_products()
                
                products_file = Path(tmpdir) / 'products.json'
                self.assertTrue(products_file.exists())
                
                with open(products_file, 'r') as f:
                    data = json.load(f)
                
                self.assertIn('products', data)
                self.assertEqual(len(data['products']), 1)
                self.assertEqual(data['products'][0]['name'], 'Test T-Shirt')
                self.assertIn('export_timestamp', data)

    @override_settings(STATIC_DATA_OUTPUT_DIR='/tmp/test_export')
    def test_export_posts_file(self):
        """Test that posts are correctly exported to JSON."""
        with TemporaryDirectory() as tmpdir:
            with override_settings(STATIC_DATA_OUTPUT_DIR=tmpdir):
                exporter = StaticDataExporter()
                exporter.export_posts()
                
                posts_file = Path(tmpdir) / 'posts.json'
                self.assertTrue(posts_file.exists())
                
                with open(posts_file, 'r') as f:
                    data = json.load(f)
                
                self.assertIn('posts', data)
                self.assertEqual(len(data['posts']), 1)
                self.assertEqual(data['posts'][0]['title'], 'Test Blog Post')
                self.assertIn('export_timestamp', data)

    @override_settings(STATIC_DATA_OUTPUT_DIR='/tmp/test_export')
    def test_export_individual_posts(self):
        """Test that individual post files are created."""
        with TemporaryDirectory() as tmpdir:
            with override_settings(STATIC_DATA_OUTPUT_DIR=tmpdir):
                exporter = StaticDataExporter()
                exporter.export_individual_posts()
                
                posts_dir = Path(tmpdir) / 'posts'
                self.assertTrue(posts_dir.exists())
                
                post_file = posts_dir / 'test-blog.json'
                self.assertTrue(post_file.exists())
                
                with open(post_file, 'r') as f:
                    data = json.load(f)
                
                self.assertIn('post', data)
                self.assertEqual(data['post']['title'], 'Test Blog Post')

    @override_settings(STATIC_DATA_OUTPUT_DIR='/tmp/test_export')
    def test_export_all(self):
        """Test the complete export process."""
        with TemporaryDirectory() as tmpdir:
            with override_settings(STATIC_DATA_OUTPUT_DIR=tmpdir):
                exporter = StaticDataExporter()
                exporter.export_all()
                
                # Check all expected files exist
                products_file = Path(tmpdir) / 'products.json'
                posts_file = Path(tmpdir) / 'posts.json'
                post_file = Path(tmpdir) / 'posts' / 'test-blog.json'
                
                self.assertTrue(products_file.exists())
                self.assertTrue(posts_file.exists())
                self.assertTrue(post_file.exists())

    @override_settings(STATIC_DATA_OUTPUT_DIR='/tmp/test_export')
    def test_exported_data_has_complete_product_impacts(self):
        """Test that exported products include all impact calculations."""
        with TemporaryDirectory() as tmpdir:
            with override_settings(STATIC_DATA_OUTPUT_DIR=tmpdir):
                exporter = StaticDataExporter()
                exporter.export_products()
                
                products_file = Path(tmpdir) / 'products.json'
                with open(products_file, 'r') as f:
                    data = json.load(f)
                
                product = data['products'][0]
                impacts = product['impacts']
                
                # Verify all impact dimensions are present
                self.assertIn('greenhouse_gas_kg', impacts)
                self.assertIn('water_liters', impacts)
                self.assertIn('energy_kwh', impacts)
                self.assertIn('land_m2', impacts)
                self.assertIn('cost_usd', impacts)
