#!/bin/bash

# Cache Version Update Script for Zhao Zhou Portfolio Website
# This script updates all version parameters in HTML files to force cache refresh

# Get the current date and time as version string (YYYYMMDDHHMMSS format)
VERSION=$(date +%Y%m%d%H%M%S)

# Alternative: Use just the date (YYYYMMDD format)
# VERSION=$(date +%Y%m%d)

echo "Updating cache version to: $VERSION"

# Function to update version parameters in a file
update_file() {
    local file=$1
    if [ -f "$file" ]; then
        # Update version parameters in CSS and JS file references
        # This handles both ?v=XXX and &v=XXX patterns
        sed -i '' -E "s/(\.(css|js))\?v=[0-9]+/\1?v=$VERSION/g" "$file"
        echo "✓ Updated: $file"
    else
        echo "✗ File not found: $file"
    fi
}

# Update all HTML files in root directory
echo ""
echo "Updating root HTML files..."
for file in *.html; do
    if [ -f "$file" ]; then
        update_file "$file"
    fi
done

# Update all HTML files in works directory
echo ""
echo "Updating works directory..."
for file in works/*.html; do
    update_file "$file"
done

# Update all HTML files in projects directory (if it exists)
if [ -d "projects" ]; then
    echo ""
    echo "Updating projects directory..."
    for file in projects/*.html; do
        update_file "$file"
    done
fi

echo ""
echo "✅ Cache version update complete!"
echo ""
echo "Version updated to: $VERSION"
echo ""
echo "Remember to:"
echo "1. Test your site locally to ensure everything works"
echo "2. Commit the changes: git add . && git commit -m 'Update cache version to $VERSION'"
echo "3. Push to your hosting service"