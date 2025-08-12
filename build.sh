#!/bin/bash

# Exit on any error
set -e

echo "Starting build process..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "Installing dependencies..."
npm install

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Error: node_modules directory was not created"
    exit 1
fi

# Build the project
echo "Building the project..."
npm run build

# Check if dist directory exists
if [ ! -d "dist" ]; then
    echo "Error: dist directory was not created"
    echo "Build failed. Checking for errors..."
    exit 1
fi

echo "Build completed successfully!"
echo "Dist directory contents:"
ls -la dist/

# Verify index.html exists
if [ ! -f "dist/index.html" ]; then
    echo "Error: index.html was not created"
    exit 1
fi

echo "Build verification completed successfully!" 