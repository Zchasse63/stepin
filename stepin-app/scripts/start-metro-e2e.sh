#!/bin/bash
# Start Metro bundler with E2E_TEST mode enabled
# This disables Fast Refresh to prevent session restoration during E2E tests

echo "🧪 Starting Metro in E2E test mode (Fast Refresh disabled)..."
E2E_TEST=true npx expo start --clear

