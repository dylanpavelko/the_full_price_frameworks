#!/bin/bash
# Frontend build and test script for The Full Price
# This script installs dependencies and runs tests

set -e  # Exit on any error

# Get the script's directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "================================"
echo "The Full Price - Frontend Setup"
echo "================================"

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Install dependencies
echo "Installing dependencies with npm..."
npm install

# Run tests (non-interactive)
echo "Running tests..."
npm run test:ci

# Build for production
echo "Building for production..."
npm run build

echo ""
echo "✓ Frontend setup complete!"
echo ""
echo "Production build is in: dist/"
echo ""
echo "To run the development server:"
echo "  npm run dev"
