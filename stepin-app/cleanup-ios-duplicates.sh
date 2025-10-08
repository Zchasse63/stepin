#!/bin/bash

echo "========================================="
echo "iOS Duplicate Files Cleanup Script"
echo "========================================="
echo ""
echo "This script will remove duplicate Xcode projects and build artifacts"
echo "that are causing the 'org.name.HelloWorld' bundle identifier error."
echo ""
echo "⚠️  WARNING: This will delete the following:"
echo "   - Stepin 2.xcodeproj (contains WRONG bundle ID)"
echo "   - Stepin 3.xcodeproj (duplicate)"
echo "   - Stepin 2.xcworkspace (duplicate)"
echo "   - Stepin 3.xcworkspace (duplicate)"
echo "   - Stepin 2/ directory (duplicate source)"
echo "   - Stepin 3/ directory (duplicate source)"
echo "   - Podfile 2, Podfile 3 (duplicates)"
echo "   - All associated lock files and properties"
echo ""
echo "✅ WILL KEEP:"
echo "   - Stepin.xcodeproj (correct bundle ID: com.stepin.app)"
echo "   - Stepin.xcworkspace (main workspace)"
echo "   - Stepin/ directory (main source)"
echo "   - Podfile (main Podfile)"
echo ""

read -p "Do you want to continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Cleanup cancelled."
    exit 0
fi

echo ""
echo "Starting cleanup..."
echo ""

# Change to ios directory
cd ios || { echo "Error: ios directory not found"; exit 1; }

# Step 1: Remove duplicate Xcode projects
echo "Step 1: Removing duplicate Xcode projects..."
if [ -d "Stepin 2.xcodeproj" ]; then
    rm -rf "Stepin 2.xcodeproj"
    echo "  ✓ Removed Stepin 2.xcodeproj"
else
    echo "  ℹ Stepin 2.xcodeproj not found (already removed)"
fi

if [ -d "Stepin 3.xcodeproj" ]; then
    rm -rf "Stepin 3.xcodeproj"
    echo "  ✓ Removed Stepin 3.xcodeproj"
else
    echo "  ℹ Stepin 3.xcodeproj not found (already removed)"
fi
echo ""

# Step 2: Remove duplicate workspaces
echo "Step 2: Removing duplicate workspaces..."
if [ -d "Stepin 2.xcworkspace" ]; then
    rm -rf "Stepin 2.xcworkspace"
    echo "  ✓ Removed Stepin 2.xcworkspace"
else
    echo "  ℹ Stepin 2.xcworkspace not found (already removed)"
fi

if [ -d "Stepin 3.xcworkspace" ]; then
    rm -rf "Stepin 3.xcworkspace"
    echo "  ✓ Removed Stepin 3.xcworkspace"
else
    echo "  ℹ Stepin 3.xcworkspace not found (already removed)"
fi
echo ""

# Step 3: Remove duplicate source directories
echo "Step 3: Removing duplicate source directories..."
if [ -d "Stepin 2" ]; then
    rm -rf "Stepin 2"
    echo "  ✓ Removed Stepin 2/ directory"
else
    echo "  ℹ Stepin 2/ directory not found (already removed)"
fi

if [ -d "Stepin 3" ]; then
    rm -rf "Stepin 3"
    echo "  ✓ Removed Stepin 3/ directory"
else
    echo "  ℹ Stepin 3/ directory not found (already removed)"
fi
echo ""

# Step 4: Remove duplicate Podfiles
echo "Step 4: Removing duplicate Podfiles..."
if [ -f "Podfile 2" ]; then
    rm -f "Podfile 2"
    echo "  ✓ Removed Podfile 2"
else
    echo "  ℹ Podfile 2 not found (already removed)"
fi

if [ -f "Podfile 3" ]; then
    rm -f "Podfile 3"
    echo "  ✓ Removed Podfile 3"
else
    echo "  ℹ Podfile 3 not found (already removed)"
fi

if [ -f "Podfile 2.lock" ]; then
    rm -f "Podfile 2.lock"
    echo "  ✓ Removed Podfile 2.lock"
else
    echo "  ℹ Podfile 2.lock not found (already removed)"
fi

if [ -f "Podfile 3.lock" ]; then
    rm -f "Podfile 3.lock"
    echo "  ✓ Removed Podfile 3.lock"
else
    echo "  ℹ Podfile 3.lock not found (already removed)"
fi

if [ -f "Podfile.properties 2.json" ]; then
    rm -f "Podfile.properties 2.json"
    echo "  ✓ Removed Podfile.properties 2.json"
else
    echo "  ℹ Podfile.properties 2.json not found (already removed)"
fi

if [ -f "Podfile.properties 3.json" ]; then
    rm -f "Podfile.properties 3.json"
    echo "  ✓ Removed Podfile.properties 3.json"
else
    echo "  ℹ Podfile.properties 3.json not found (already removed)"
fi
echo ""

# Step 5: Verify remaining files
echo "Step 5: Verifying remaining Xcode projects..."
xcode_projects=$(ls -d *.xcodeproj 2>/dev/null | wc -l)
if [ "$xcode_projects" -eq 1 ]; then
    echo "  ✅ SUCCESS: Only one Xcode project remains"
    ls -d *.xcodeproj
else
    echo "  ⚠️  WARNING: Found $xcode_projects Xcode projects:"
    ls -d *.xcodeproj
fi
echo ""

# Step 6: Clean and reinstall CocoaPods
echo "Step 6: Cleaning and reinstalling CocoaPods..."
echo "  Running: pod deintegrate"
pod deintegrate 2>&1 | grep -E "(Deintegrating|Deleted|Removing)" || echo "  ℹ No pods to deintegrate"

echo "  Running: pod install"
pod install 2>&1 | tail -10
echo ""

# Step 7: Verify bundle identifier
echo "Step 7: Verifying bundle identifier in remaining project..."
if [ -f "Stepin.xcodeproj/project.pbxproj" ]; then
    bundle_id=$(grep -m 1 "PRODUCT_BUNDLE_IDENTIFIER" "Stepin.xcodeproj/project.pbxproj" | sed 's/.*= \(.*\);/\1/')
    if [ "$bundle_id" == "com.stepin.app" ]; then
        echo "  ✅ Bundle identifier is correct: $bundle_id"
    else
        echo "  ⚠️  WARNING: Bundle identifier is: $bundle_id"
        echo "     Expected: com.stepin.app"
    fi
else
    echo "  ❌ ERROR: Stepin.xcodeproj/project.pbxproj not found!"
fi
echo ""

# Step 8: Summary
echo "========================================="
echo "Cleanup Complete!"
echo "========================================="
echo ""
echo "Summary of changes:"
echo "  - Removed duplicate Xcode projects (Stepin 2, Stepin 3)"
echo "  - Removed duplicate workspaces"
echo "  - Removed duplicate source directories"
echo "  - Removed duplicate Podfiles"
echo "  - Reinstalled CocoaPods dependencies"
echo ""
echo "Next steps:"
echo "  1. cd .."
echo "  2. npx expo prebuild --clean"
echo "  3. npx @expo/cli start --clear"
echo ""
echo "Expected result:"
echo "  ✅ No more 'org.name.HelloWorld' errors"
echo "  ✅ Build uses correct bundle ID: com.stepin.app"
echo "  ✅ Only one Xcode project in ios/ directory"
echo ""

