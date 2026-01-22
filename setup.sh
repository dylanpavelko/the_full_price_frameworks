#!/bin/bash
# Main deployment script for The Full Price
# This script sets up both backend and frontend

set -e

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  The Full Price - Complete Setup       ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Get the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Setup backend
echo "Setting up backend..."
cd "$SCRIPT_DIR/backend"
bash setup.sh
echo ""

# Setup frontend
echo "Setting up frontend..."
cd "$SCRIPT_DIR/frontend"
bash setup.sh
echo ""

echo "╔════════════════════════════════════════╗"
echo "║  ✓ Setup Complete!                    ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Backend (in terminal 1):"
echo "   cd backend/the_full_price"
echo "   source ../venv/bin/activate"
echo "   python manage.py runserver"
echo ""
echo "2. Frontend (in terminal 2):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "The site will be available at http://localhost:3000"
echo ""
