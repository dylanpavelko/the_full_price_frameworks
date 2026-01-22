#!/bin/bash
# Backend build and test script for The Full Price
# This script builds the backend, runs migrations, and executes tests

set -e  # Exit on any error

# Get the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "================================"
echo "The Full Price - Backend Setup"
echo "================================"

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed"
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Install pytest-django
pip install pytest-django

# Create migrations for Django apps
echo "Creating database migrations..."
(cd the_full_price && PYTHONPATH=.. python manage.py makemigrations)

# Run migrations from manage.py location
echo "Running database migrations..."
(cd the_full_price && PYTHONPATH=.. python manage.py migrate)

# Collect static files
echo "Collecting static files..."
(cd the_full_price && PYTHONPATH=.. python manage.py collectstatic --noinput 2>/dev/null || true)

# Run tests with proper PYTHONPATH
echo "Running tests..."
export PYTHONPATH="${SCRIPT_DIR}:${PYTHONPATH}"
pytest tests/ -v --tb=short

# Export static data for frontend
echo "Exporting static data for frontend..."
(cd the_full_price && PYTHONPATH=.. python manage.py shell << 'EOF'
from static_generation.exporter import run_export
run_export()
EOF
)

echo ""
echo "✓ Backend setup complete!"
echo ""
echo "To run the development server:"
echo "  source venv/bin/activate"
echo "  cd the_full_price"
echo "  python manage.py runserver"
