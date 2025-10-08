#!/usr/bin/env bash

# EAS Build hook to configure Mapbox authentication for CocoaPods
# This runs before npm install

set -e

echo "🔧 Configuring Mapbox authentication for CocoaPods..."

if [ -z "$EXPO_PUBLIC_MAPBOX_TOKEN" ]; then
  echo "⚠️  Warning: EXPO_PUBLIC_MAPBOX_TOKEN is not set"
  exit 0
fi

# Create .netrc file for Mapbox authentication
cat > ~/.netrc << EOF
machine api.mapbox.com
login mapbox
password $EXPO_PUBLIC_MAPBOX_TOKEN
EOF

chmod 600 ~/.netrc

echo "✅ Mapbox authentication configured successfully"

