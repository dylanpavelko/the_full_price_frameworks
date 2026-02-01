from django.core.management.base import BaseCommand
from the_full_price.static_generation.exporter import StaticDataExporter

class Command(BaseCommand):
    help = 'Export all static data for the frontend (products, posts, per-post files)'

    def handle(self, *args, **options):
        exporter = StaticDataExporter()
        exporter.export_all()
        self.stdout.write(self.style.SUCCESS('Static data export completed.'))
