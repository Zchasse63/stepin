#!/bin/bash

# Phase 2 Core Feature E2E Test Suite Runner
# This script runs all Phase 2 feature tests in sequence with database cleanup between each test

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Set Java home for Maestro
export JAVA_HOME="/opt/homebrew/opt/openjdk@17"
export PATH="$JAVA_HOME/bin:$PATH"

# Test files in priority order
TESTS=(
    # Walk Tracking Tests
    "e2e/logging/01-log-walk-modal-open.yaml"
    "e2e/logging/02-log-simple-walk.yaml"
    "e2e/logging/03-log-detailed-walk.yaml"
    "e2e/logging/04-log-walk-validation.yaml"
    "e2e/logging/05-view-walk-history.yaml"
    # Goal Management Tests
    "e2e/profile/03-goal-adjustment.yaml"
    # Profile Management Tests
    "e2e/profile/04-profile-edit.yaml"
    "e2e/profile/05-settings-units.yaml"
    # Social Features Tests
    "e2e/buddies/02-buddies-tab-access.yaml"
    "e2e/buddies/03-add-buddy-modal.yaml"
)

# Test names for display
TEST_NAMES=(
    # Walk Tracking
    "Log Walk Modal Open"
    "Log Simple Walk"
    "Log Detailed Walk"
    "Walk Logging Validation"
    "View Walk History"
    # Goal Management
    "Goal Adjustment UI"
    # Profile Management
    "Profile Edit UI"
    "Settings Units Display"
    # Social Features
    "Buddies Tab Access"
    "Add Buddy Modal"
)

# Track results
PASSED=0
FAILED=0
FAILED_TESTS=()

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Phase 2: Core Feature E2E Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Running ${#TESTS[@]} tests..."
echo ""

# Run each test
for i in "${!TESTS[@]}"; do
    TEST_FILE="${TESTS[$i]}"
    TEST_NAME="${TEST_NAMES[$i]}"
    TEST_NUM=$((i + 1))
    
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}Test $TEST_NUM/${#TESTS[@]}: $TEST_NAME${NC}"
    echo -e "${BLUE}File: $TEST_FILE${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
    
    # Clean database before each test
    echo -e "${YELLOW}Cleaning database...${NC}"
    npm run test:cleanup-db
    echo ""
    
    # Run the test
    echo -e "${YELLOW}Running test...${NC}"
    if maestro test "$TEST_FILE"; then
        echo ""
        echo -e "${GREEN}✅ PASSED: $TEST_NAME${NC}"
        echo ""
        PASSED=$((PASSED + 1))
    else
        echo ""
        echo -e "${RED}❌ FAILED: $TEST_NAME${NC}"
        echo ""
        FAILED=$((FAILED + 1))
        FAILED_TESTS+=("$TEST_NAME")
    fi
    
    # Wait a bit between tests
    if [ $TEST_NUM -lt ${#TESTS[@]} ]; then
        echo -e "${YELLOW}Waiting 3 seconds before next test...${NC}"
        sleep 3
        echo ""
    fi
done

# Print summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Test Suite Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Total Tests: ${#TESTS[@]}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -gt 0 ]; then
    echo -e "${RED}Failed Tests:${NC}"
    for test in "${FAILED_TESTS[@]}"; do
        echo -e "${RED}  - $test${NC}"
    done
    echo ""
    exit 1
else
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    echo ""
    exit 0
fi

