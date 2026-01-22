"""
Static data exporter for The Full Price project.

This module handles exporting all product and post data to static JSON files.
This allows the React frontend to be completely static (no server required at runtime).

Usage:
    python manage.py shell
    from static_generation.exporter import StaticDataExporter
    exporter = StaticDataExporter()
    exporter.export_all()
"""
import json
import os
from pathlib import Path
from django.conf import settings
from products.models import Product
from posts.models import Post


class StaticDataExporter:
    """
    Handles exporting all product and post data to static JSON files.
    This enables static site hosting without a backend database.
    """

    def __init__(self):
        """Initialize the exporter and ensure output directory exists."""
        self.output_dir = Path(settings.STATIC_DATA_OUTPUT_DIR)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def export_all(self):
        """
        Export all data to static JSON files.
        
        Creates:
        - products.json: All products with their impact calculations
        - posts.json: All published posts
        - posts/{slug}.json: Individual post files for easier caching
        """
        print("Starting static data export...")
        
        self.export_products()
        self.export_posts()
        self.export_individual_posts()
        
        print("✓ Static data export completed successfully!")

    def export_products(self):
        """
        Export all products to a single JSON file with complete impact data.
        """
        products = Product.objects.all()
        data = {
            'products': [product.to_dict() for product in products],
            'export_timestamp': self._get_timestamp(),
        }
        
        output_file = self.output_dir / 'products.json'
        self._write_json(output_file, data)
        print(f"✓ Exported {len(products)} products to {output_file}")

    def export_posts(self):
        """
        Export all published posts to a single JSON file.
        """
        posts = Post.objects.filter(published=True)
        data = {
            'posts': [post.to_dict() for post in posts],
            'export_timestamp': self._get_timestamp(),
        }
        
        output_file = self.output_dir / 'posts.json'
        self._write_json(output_file, data)
        print(f"✓ Exported {len(posts)} posts to {output_file}")

    def export_individual_posts(self):
        """
        Export each post to its own JSON file for better caching and organization.
        This is optional but useful for larger sites.
        """
        posts_dir = self.output_dir / 'posts'
        posts_dir.mkdir(parents=True, exist_ok=True)
        
        posts = Post.objects.filter(published=True)
        
        for post in posts:
            data = {
                'post': post.to_dict(),
                'export_timestamp': self._get_timestamp(),
            }
            
            output_file = posts_dir / f"{post.slug}.json"
            self._write_json(output_file, data)
        
        print(f"✓ Exported {len(posts)} individual post files to {posts_dir}")

    def _write_json(self, file_path, data):
        """
        Write data to a JSON file with pretty formatting.
        
        Args:
            file_path (Path): Where to write the file
            data (dict): Data to serialize to JSON
        """
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def _get_timestamp(self):
        """
        Get current timestamp in ISO format.
        Useful for tracking when data was last exported.
        
        Returns:
            str: ISO format timestamp
        """
        from datetime import datetime
        return datetime.utcnow().isoformat()


# Management command support
def run_export():
    """
    Convenience function to run the export.
    Can be called from management commands or scripts.
    """
    exporter = StaticDataExporter()
    exporter.export_all()
