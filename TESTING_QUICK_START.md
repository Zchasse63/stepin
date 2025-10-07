# Stepin E2E Testing - Quick Start Guide

## 🎯 Overview

This guide helps you get started with implementing the Stepin E2E testing plan using Maestro.

**Full Plan:** See `MAESTRO_E2E_TESTING_PLAN.md` for complete details.

---

## 📋 Prerequisites

Before starting, ensure you have:

- [ ] macOS with Xcode 15+ installed
- [ ] Node.js 18+ installed
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] Maestro CLI installed (see below)
- [ ] Supabase test instance set up
- [ ] iOS Simulator configured

---

## 🚀 Quick Setup (30 minutes)

### Step 1: Install Maestro

```bash
# Install Maestro CLI
curl -Ls "https://get.maestro.mobile.dev" | bash

# Add to PATH
echo 'export PATH="$HOME/.maestro/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify installation
maestro --version
```

### Step 2: Set Up Test Database

```bash
# 1. Create a new Supabase project for testing
# Go to https://supabase.com/dashboard

# 2. Copy the test project URL and anon key

# 3. Create .env.test file in stepin-app/
cd stepin-app
cat > .env.test << EOF
EXPO_PUBLIC_SUPABASE_URL=https://your-test-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-test-anon-key
SUPABASE_SERVICE_KEY=your-test-service-key
MOCK_HEALTHKIT=true
MOCK_NOTIFICATIONS=true
MOCK_DATE=true
EOF
```

### Step 3: Create Test Directory Structure

```bash
cd stepin-app

# Create E2E test directories
mkdir -p e2e/{auth,today,logging,streaks,history,profile,errors,journeys}
mkdir -p e2e/{fixtures,helpers}

# Create fixture files
touch e2e/fixtures/{users.json,walks.json,streaks.json}
touch e2e/helpers/{setup.yaml,teardown.yaml,seed-database.ts}
```

### Step 4: Build Test App

```bash
cd stepin-app

# Clean build
npx expo prebuild --platform ios --clean

# Build for simulator
npx expo run:ios --configuration Release
```

---

## 📝 Your First Test (15 minutes)

Let's create a simple test to verify the setup works.

### Create Test File

```bash
# Create your first test
cat > e2e/auth/01-auth-signup.yaml << 'EOF'
appId: com.stepin.app
---
# Test: User can sign up for a new account
- launchApp
- assertVisible: "Sign Up"
- tapOn: "Sign Up"
- assertVisible: "Create Account"
- inputText: "test-${timestamp}@stepin.test"
- tapOn: "Password"
- inputText: "TestPass123!"
- tapOn: "Display Name"
- inputText: "Test User"
- tapOn: "Sign Up"
- assertVisible: "Welcome to Stepin"
EOF
```

### Run the Test

```bash
# Run your first test
maestro test e2e/auth/01-auth-signup.yaml

# If successful, you'll see:
# ✓ Test passed
```

---

## 🏗️ Implementation Roadmap

### Week 1-2: Infrastructure (CURRENT PRIORITY)

**Goal:** Set up all mocking services and test infrastructure

#### Task 1: Implement HealthKit Mock Service (2-3 days)

**File:** `stepin-app/lib/health/__mocks__/HealthKitService.ts`

```typescript
// Create this file
export class MockHealthKitService {
  async getTodaySteps(): Promise<number> {
    if (process.env.MOCK_HEALTHKIT === 'true') {
      return parseInt(process.env.MOCK_HEALTHKIT_STEPS || '0', 10);
    }
    // Real implementation
    return super.getTodaySteps();
  }
  
  async requestPermissions(): Promise<boolean> {
    if (process.env.MOCK_HEALTHKIT === 'true') {
      return process.env.MOCK_HEALTHKIT_PERMISSION === 'granted';
    }
    return super.requestPermissions();
  }
}
```

**Checklist:**
- [ ] Create mock service file
- [ ] Replace all HealthKit calls with mockable version
- [ ] Add environment variable checks
- [ ] Test with `MOCK_HEALTHKIT=true`

---

#### Task 2: Implement Date Injection Service (1-2 days)

**File:** `stepin-app/lib/utils/dateService.ts`

```typescript
class DateService {
  private mockDate: Date | null = null;

  now(): Date {
    if (process.env.MOCK_DATE === 'true' && this.mockDate) {
      return new Date(this.mockDate);
    }
    return new Date();
  }

  setMockDate(date: string | Date) {
    this.mockDate = new Date(date);
  }
}

export const dateService = new DateService();
```

**Checklist:**
- [ ] Create date service file
- [ ] Replace all `new Date()` calls with `dateService.now()`
- [ ] Add test helper methods
- [ ] Test with `MOCK_DATE=true`

---

#### Task 3: Create Database Fixtures (1 day)

**File:** `stepin-app/e2e/fixtures/users.json`

```json
{
  "test-user-1": {
    "email": "test1@stepin.test",
    "password": "TestPass123!",
    "profile": {
      "display_name": "Test User 1",
      "daily_step_goal": 7000,
      "units_preference": "miles"
    },
    "walks": [
      {
        "date": "2024-01-15",
        "steps": 5000,
        "duration": 30
      }
    ]
  }
}
```

**Checklist:**
- [ ] Create user fixtures
- [ ] Create walk fixtures
- [ ] Create streak fixtures
- [ ] Create seed script

---

### Week 3-4: Phase 1A Tests (P0 - Critical)

**Goal:** Implement 21 critical tests

#### Priority Order:
1. **Authentication (4 tests)** - 3 days
   - 01-auth-signup.yaml
   - 02-auth-signin.yaml
   - 04-auth-session.yaml
   - 05-auth-errors.yaml

2. **Manual Logging (8 tests)** - 5 days
   - All tests in `e2e/logging/`

3. **Core Tracking (4 tests)** - 4.5 days
   - 10-today-initial-load.yaml
   - 11-today-refresh.yaml (requires HealthKit mock)
   - 12-today-goal-celebration.yaml
   - 15-today-offline.yaml

4. **Streak System (5 tests)** - 7 days
   - 50-streak-init.yaml
   - 51-streak-continue.yaml (requires date mock)
   - 52-streak-break.yaml (requires date mock)
   - 54-streak-milestones.yaml
   - 55-streak-multiple-walks.yaml

---

## 🔧 Common Commands

```bash
# Run all tests
maestro test e2e/

# Run specific test suite
maestro test e2e/auth/

# Run single test
maestro test e2e/auth/01-auth-signup.yaml

# Run with environment variables
MOCK_HEALTHKIT=true MOCK_HEALTHKIT_STEPS=5000 maestro test e2e/today/11-today-refresh.yaml

# Record test execution (for debugging)
maestro test --record e2e/auth/01-auth-signup.yaml

# Run tests in CI mode (no interactive output)
maestro test --format junit e2e/
```

---

## 📊 Progress Tracking

### Phase 1 Progress (Target: 75 tests)

**Week 1-2: Infrastructure**
- [ ] HealthKit mock service
- [ ] Date injection service
- [ ] Notification mock service
- [ ] Database fixtures
- [ ] Seed/teardown scripts
- [ ] CI/CD pipeline (basic)

**Week 3-4: P0 Tests (21 tests)**
- [ ] Authentication (4)
- [ ] Manual Logging (8)
- [ ] Core Tracking (4)
- [ ] Streak System (5)

**Week 5-6: P1 Tests (13 tests)**
- [ ] History Screen (7)
- [ ] Profile & Settings (6)

**Week 7: P2 Tests (8 tests)**
- [ ] Error Handling (6)
- [ ] User Journeys (2)

**Week 8: Optimization**
- [ ] Add remaining automatable tests (5)
- [ ] Optimize test execution
- [ ] Fix flaky tests
- [ ] Documentation

---

## 🐛 Troubleshooting

### Test fails with "App not found"
```bash
# Rebuild the app
cd stepin-app
npx expo prebuild --platform ios --clean
npx expo run:ios --configuration Release
```

### Test fails with "Element not found"
```yaml
# Add explicit wait
- assertVisible:
    id: "element-id"
    timeout: 10000  # 10 seconds
```

### HealthKit mock not working
```bash
# Verify environment variables
echo $MOCK_HEALTHKIT
echo $MOCK_HEALTHKIT_STEPS

# Set them explicitly
export MOCK_HEALTHKIT=true
export MOCK_HEALTHKIT_STEPS=5000
```

### Database conflicts between tests
```bash
# Run cleanup script
npm run test:cleanup-db
npm run test:seed-db
```

---

## 📚 Resources

- **Full Testing Plan:** `MAESTRO_E2E_TESTING_PLAN.md`
- **Maestro Documentation:** https://maestro.mobile.dev/
- **Maestro Examples:** https://github.com/mobile-dev-inc/maestro/tree/main/maestro-test
- **Supabase Testing:** https://supabase.com/docs/guides/getting-started/local-development

---

## 🎯 Next Steps

1. ✅ Complete infrastructure setup (Week 1-2)
2. ⏳ Implement first 4 authentication tests
3. ⏳ Set up CI/CD pipeline
4. ⏳ Begin Phase 1A implementation

**Questions?** Review the full plan in `MAESTRO_E2E_TESTING_PLAN.md`

---

**Last Updated:** 2025-01-15  
**Status:** Ready to begin implementation

