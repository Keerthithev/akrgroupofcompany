#!/bin/bash

# Build the project
cd frontend
npm run build

# Copy CSS file to a different location to avoid Netlify routing issues
cp dist/assets/index-eKBDyv6r.css dist/styles.css

# Update the HTML to use the new CSS location
sed -i '' 's|/assets/index-eKBDyv6r.css|/styles.css|g' dist/index.html

echo "Build completed with CSS fix" 