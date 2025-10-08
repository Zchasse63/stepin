#!/bin/bash

echo "========================================="
echo "Expo Dev Server Fix Script"
echo "========================================="
echo ""

# Step 1: Kill any running expo/metro processes
echo "Step 1: Killing existing expo/metro processes..."
pkill -f "expo start" 2>/dev/null || echo "  No expo processes found"
pkill -f "node.*metro" 2>/dev/null || echo "  No metro processes found"
pkill -f "node.*8081" 2>/dev/null || echo "  No processes on port 8081"
sleep 2
echo "  ✓ Processes killed"
echo ""

# Step 2: Remove global expo-cli
echo "Step 2: Removing global expo-cli..."
npm uninstall -g expo-cli 2>&1 | grep -E "(removed|up to date|not found)" || echo "  No global expo-cli found"
echo "  ✓ Global expo-cli removed"
echo ""

# Step 3: Clear npx cache
echo "Step 3: Clearing npx cache..."
rm -rf ~/.npm/_npx
echo "  ✓ npx cache cleared"
echo ""

# Step 4: Nuclear watchman reset
echo "Step 4: Resetting watchman..."
watchman watch-del-all 2>&1 | head -3
watchman shutdown-server 2>&1 | head -3
rm -rf /usr/local/var/run/watchman/$USER-state
rm -rf ~/.watchman
echo "  ✓ Watchman reset complete"
echo ""

# Step 5: Clean iOS duplicate directories
echo "Step 5: Cleaning iOS duplicate directories..."
cd ios 2>/dev/null
if [ -d "Pods 2" ] || [ -d "Pods 3" ] || [ -d "build 2" ]; then
    rm -rf "Pods 2" "Pods 3" 2>/dev/null
    rm -rf "build 2" "build 3" "build 4" 2>/dev/null
    echo "  ✓ Removed duplicate iOS directories"
else
    echo "  ✓ No duplicate directories found"
fi
cd ..
echo ""

# Step 6: Verify .watchmanconfig exists
echo "Step 6: Verifying .watchmanconfig..."
if [ -f ".watchmanconfig" ]; then
    echo "  ✓ .watchmanconfig exists"
else
    echo "  ⚠ .watchmanconfig not found - creating it..."
    cat > .watchmanconfig << 'EOF'
{
  "ignore_dirs": [
    "node_modules",
    ".expo",
    ".git",
    "ios/build",
    "ios/Pods",
    "android/build",
    "android/.gradle",
    ".maestro",
    "coverage",
    "dist",
    "build"
  ],
  "settle": 20
}
EOF
    echo "  ✓ .watchmanconfig created"
fi
echo ""

# Step 7: Check which expo binary will be used
echo "Step 7: Checking expo CLI resolution..."
echo "  Global expo: $(which expo 2>/dev/null || echo 'not found')"
echo "  Local @expo/cli: $([ -f node_modules/@expo/cli/build/bin/cli ] && echo 'found' || echo 'not found')"
echo ""

# Step 8: Display next steps
echo "========================================="
echo "Cleanup Complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "1. Run: npx @expo/cli start --clear"
echo "2. Watch for Metro bundler to start"
echo "3. Look for QR code in terminal"
echo ""
echo "If still hanging, run complete cache purge:"
echo "  rm -rf ~/.expo node_modules/.cache .expo /tmp/metro-* /tmp/haste-map-*"
echo "  rm -rf node_modules package-lock.json"
echo "  npm install"
echo ""

