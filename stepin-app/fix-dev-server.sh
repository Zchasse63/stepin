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
if [ $? -eq 0 ]; then
  rm -rf "Pods 2" "Pods 3" 2>/dev/null
  rm -rf "build 2" "build 3" "build 4" 2>/dev/null
  echo "  ✓ iOS duplicates removed"
  cd ..
else
  echo "  ⚠ ios directory not found, skipping"
fi
echo ""

# Step 6: Clear Metro/Expo caches
echo "Step 6: Clearing Metro/Expo caches..."
rm -rf .expo 2>/dev/null
rm -rf node_modules/.cache 2>/dev/null
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-map-* 2>/dev/null
echo "  ✓ Caches cleared"
echo ""

# Step 7: Verify .watchmanconfig exists
echo "Step 7: Verifying .watchmanconfig..."
if [ -f ".watchmanconfig" ]; then
  echo "  ✓ .watchmanconfig exists"
else
  echo "  ⚠ .watchmanconfig not found"
fi
echo ""

echo "========================================="
echo "Cleanup Complete!"
echo "========================================="
echo ""
echo "Now attempting to start Expo dev server..."
echo ""

# Step 8: Start dev server with local CLI
npx @expo/cli start --clear

