"""
Custom management command to export static data for the frontend.
"""
from django.core.management.base import BaseCommand
from the_full_price.static_generation.exporter import run_export

class Command(BaseCommand):
    help = "Export all static data for the frontend."

    def handle(self, *args, **options):
        run_export()
        self.stdout.write(self.style.SUCCESS("Static data export complete."))
