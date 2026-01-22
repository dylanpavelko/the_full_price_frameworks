"""
Django management command to export static data.

Usage:
    python manage.py export_static_data
"""
from django.core.management.base import BaseCommand
from static_generation.exporter import StaticDataExporter


class Command(BaseCommand):
    help = 'Export all product and post data to static JSON files'

    def handle(self, *args, **options):
        """Execute the export command."""
        try:
            exporter = StaticDataExporter()
            exporter.export_all()
            self.stdout.write(
                self.style.SUCCESS('✓ Static data exported successfully!')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'✗ Error exporting data: {str(e)}')
            )
