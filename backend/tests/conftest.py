"""
Test configuration for The Full Price backend.
"""
import os
import sys
import django
from pathlib import Path

# Add the_full_price directory to Python path
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'the_full_price.settings')
django.setup()
