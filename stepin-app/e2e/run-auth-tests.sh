#!/bin/bash

# Authentication E2E Test Suite Runner (Phase 1A + 1B)
# This script runs all authentication tests in sequence with database cleanup between each test

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
    # Phase 1A: Core Authentication
    "e2e/auth/01-auth-signup.yaml"
    "e2e/auth/02-auth-signin.yaml"
    "e2e/auth/03-auth-signout.yaml"
    "e2e/auth/04-auth-signup-validation.yaml"
    "e2e/auth/05-auth-signin-errors.yaml"
    # Phase 1B: Enhanced Authentication
    "e2e/auth/06-auth-password-reset.yaml"
    "e2e/auth/07-auth-session-persistence.yaml"
    "e2e/auth/08-auth-token-refresh.yaml"
)

# Test names for display
TEST_NAMES=(
    # Phase 1A
    "Sign-Up Flow"
    "Sign-In Flow"
    "Sign-Out Flow"
    "Sign-Up Validation"
    "Sign-In Error Handling"
    # Phase 1B
    "Password Reset Flow"
    "Session Persistence"
    "Token Refresh Configuration"
)

# Track results
PASSED=0
FAILED=0
FAILED_TESTS=()

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Authentication E2E Test Suite${NC}"
echo -e "${BLUE}Phase 1A + 1B${NC}"
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

