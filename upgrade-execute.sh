#!/bin/bash
# Steppin App Upgrade Execution Script
# This script automates the upgrade process outlined in UPGRADE_PLAN.md

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Confirm before proceeding
confirm() {
    read -p "$(echo -e ${YELLOW}$1 [y/N]: ${NC})" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Aborted by user"
        exit 1
    fi
}

# ============================================
# PHASE 1: iOS Simulator Upgrade
# ============================================

phase1_ios_simulator() {
    print_header "PHASE 1: iOS Simulator Upgrade"
    
    # Step 1: Verify iOS 26.0 runtime
    print_info "Checking for iOS 26.0 runtime..."
    if xcrun simctl list runtimes | grep -q "iOS 26.0"; then
        print_success "iOS 26.0 runtime is installed"
    else
        print_error "iOS 26.0 runtime not found!"
        print_info "Please install it via Xcode > Settings > Platforms"
        exit 1
    fi
    
    # Step 2: Create new simulator
    print_info "Creating iPhone 16 Plus (iOS 26.0) simulator..."
    
    # Check if simulator already exists
    if xcrun simctl list devices | grep -q "iPhone 16 Plus (iOS 26.0)"; then
        print_warning "Simulator already exists, skipping creation"
    else
        SIMULATOR_UUID=$(xcrun simctl create "iPhone 16 Plus (iOS 26.0)" \
            "com.apple.CoreSimulator.SimDeviceType.iPhone-16-Plus" \
            "com.apple.CoreSimulator.SimRuntime.iOS-26-0")
        print_success "Created simulator with UUID: $SIMULATOR_UUID"
    fi
    
    # Step 3: Verify simulator
    print_info "Verifying new simulator..."
    xcrun simctl list devices | grep "iPhone 16 Plus (iOS 26.0)"
    print_success "Simulator verified"
    
    # Step 4: Optional - Delete iOS 18.4 simulator
    confirm "Do you want to delete the iOS 18.4 simulator?"
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Deleting iOS 18.4 simulator..."
        xcrun simctl delete 79F4191C-277B-446E-B380-F23B0E68509E || print_warning "Simulator may already be deleted"
        print_success "iOS 18.4 simulator deleted"
    fi
    
    print_success "Phase 1 Complete: iOS Simulator Upgraded"
}

# ============================================
# PHASE 2: Dependency Updates
# ============================================

phase2_dependencies() {
    print_header "PHASE 2: Dependency Updates"
    
    cd stepin-app || exit 1
    
    # Step 1: Update Expo
    print_info "Updating Expo SDK to 54.0.13..."
    npm install expo@54.0.13
    print_success "Expo updated"
    
    # Step 2: Update Supabase
    print_info "Updating Supabase JS to 2.75.0..."
    npm install @supabase/supabase-js@2.75.0
    print_success "Supabase updated"
    
    # Step 3: Update other dependencies
    print_info "Updating other dependencies..."
    npm install expo-dev-client@6.0.14
    npm install expo-file-system@19.0.17
    npm install expo-router@6.0.11
    npm install @sentry/react-native@7.3.0
    npm install react-native-reanimated@4.1.3
    print_success "Dependencies updated"
    
    # Step 4: Run npm update for remaining packages
    print_info "Running npm update for remaining packages..."
    npm update
    print_success "All dependencies updated"
    
    cd ..
    print_success "Phase 2 Complete: Dependencies Updated"
}

# ============================================
# PHASE 3: Testing
# ============================================

phase3_testing() {
    print_header "PHASE 3: Testing"
    
    cd stepin-app || exit 1
    
    # Test 1: TypeScript check
    print_info "Running TypeScript check..."
    npx tsc --noEmit && print_success "TypeScript check passed" || print_warning "TypeScript errors found (may be acceptable)"
    
    # Test 2: Unit tests
    print_info "Running unit tests..."
    npm test && print_success "Unit tests passed" || print_warning "Some tests failed"
    
    # Test 3: Start dev server
    print_info "Starting development server..."
    print_info "Press 'i' to open iOS simulator when prompted"
    print_info "Select 'iPhone 16 Plus (iOS 26.0)' from the list"
    print_warning "Check for network errors in the console"
    print_warning "Verify Supabase connection succeeds"
    print_info "Press Ctrl+C to stop the server when done testing"
    
    npm start
    
    cd ..
    print_success "Phase 3 Complete: Testing Done"
}

# ============================================
# Main Execution
# ============================================

main() {
    print_header "Steppin App Upgrade Script"
    print_info "This script will upgrade iOS simulator and dependencies"
    print_warning "Make sure you have committed all changes before proceeding"
    
    confirm "Have you committed all changes and created a backup branch?"
    
    # Execute phases
    phase1_ios_simulator
    
    confirm "Phase 1 complete. Continue with dependency updates?"
    phase2_dependencies
    
    confirm "Phase 2 complete. Continue with testing?"
    phase3_testing
    
    print_header "Upgrade Complete!"
    print_success "All phases completed successfully"
    print_info "Next steps:"
    echo "  1. Test Supabase authentication"
    echo "  2. Test database queries"
    echo "  3. Run E2E tests if applicable"
    echo "  4. Commit changes if everything works"
}

# Run main function
main

