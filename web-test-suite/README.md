# Stepin Web Test Suite

**Author:** Manus AI  
**Date:** October 31, 2025  
**Version:** 1.0.0

---

## Overview

This is a comprehensive automated test suite for the Stepin web version, designed to test authentication, database operations, and business logic. It uses **Jest** as the testing framework and interacts directly with your **Supabase** backend.

This test suite provides a reliable way to verify that the core backend functionality of your application is working correctly. It is designed to be run in a CI/CD pipeline or locally by developers.

## Features

- **Authentication Testing:** Covers user signup, signin, signout, and session management.
- **Database Testing:** Verifies profile operations, walk logging, and RLS policies.
- **Business Logic Testing:** Includes tests for streaks, daily stats, and data integrity.
- **Automated & Repeatable:** Can be run automatically to ensure code quality.
- **Comprehensive Coverage:** Includes over 50 individual test cases.
- **Easy to Use:** Simple setup and clear test commands.

## Project Structure

```
web-test-suite/
├── tests/                  # Test suites
│   ├── auth.test.js        # Authentication tests
│   ├── database.test.js    # Profile and RLS tests
│   ├── walks.test.js       # Walk logging tests
│   └── streaks.test.js     # Streak and stats tests
├── utils/                  # Helper utilities
│   ├── supabaseClient.js   # Supabase client configuration
│   └── testHelpers.js      # Helper functions for tests
├── config/                 # (Future use for environment configs)
├── coverage/               # Test coverage reports (generated)
├── node_modules/           # Project dependencies
├── .env                    # Environment variables (Supabase keys)
├── .env.example            # Example environment file
├── .gitignore              # Files to ignore in version control
├── jest.config.js          # Jest configuration
├── package.json            # Project metadata and scripts
└── README.md               # This documentation
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### 1. Installation

Navigate to the `web-test-suite` directory and install the dependencies:

```bash
cd web-test-suite
npm install
```

### 2. Configuration

Create a `.env` file in the `web-test-suite` directory and add your Supabase project credentials. You can copy the `.env.example` file:

```bash
cp .env.example .env
```

Then, edit the `.env` file with your actual Supabase URL and anon key:

```
# .env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

TEST_USER_EMAIL=testuser@stepin.test
TEST_USER_PASSWORD=testpass123
```

## Running the Tests

You can run the entire test suite or individual test files using the npm scripts defined in `package.json`.

### Run All Tests

To run all test suites:

```bash
npm test
```

### Run a Specific Test Suite

To run a single test file (e.g., authentication tests):

```bash
npm run test:auth
```

Available test suites:
- `npm run test:auth` - Authentication tests
- `npm run test:database` - Profile and RLS tests
- `npm run test:walks` - Walk logging tests
- `npm run test:streaks` - Streak and stats tests

### Run in Watch Mode

To run tests in watch mode, which automatically re-runs tests when files change:

```bash
npm run test:watch
```

### Generate Test Coverage Report

To generate a test coverage report, which shows how much of your code is covered by tests:

```bash
npm run test:coverage
```

This will create a `coverage/` directory with a detailed HTML report.

## Test Suites

### 1. Authentication (`auth.test.js`)

- **Sign Up:**
  - ✅ Successfully creates a new user
  - ❌ Fails with invalid email
  - ❌ Fails with weak password
  - ❌ Fails on duplicate email
- **Sign In:**
  - ✅ Successfully signs in with correct credentials
  - ❌ Fails with incorrect password
  - ❌ Fails with non-existent email
- **Sign Out:**
  - ✅ Successfully signs out
- **Session Management:**
  - ✅ Retrieves current session and user
  - ✅ Returns null when no user is signed in
- **Auth State Changes:**
  - ✅ Detects `SIGNED_IN` and `SIGNED_OUT` events

### 2. Database Operations (`database.test.js`)

- **Profile Operations:**
  - ✅ Creates profile on signup
  - ✅ Reads own profile
  - ✅ Updates own profile
  - ❌ Does not read other users profiles (RLS)
  - ❌ Does not update other users profiles (RLS)
- **Database Connection:**
  - ✅ Connects to Supabase successfully
  - ❌ Handles invalid table names gracefully
- **RLS Policies:**
  - ✅ Enforces RLS on profiles table
  - ✅ Allows authenticated users to insert their own profile

### 3. Walks (`walks.test.js`)

- **Walk Creation:**
  - ✅ Creates a walk with all fields
  - ✅ Creates a walk with minimal fields
  - ❌ Fails to create walk without required fields
  - ❌ Fails to create walk with invalid steps
  - ✅ Creates walk with heart rate data
- **Walk Retrieval:**
  - ✅ Retrieves all walks for a user
  - ✅ Retrieves walks for a specific date
  - ✅ Retrieves walks with filtering
  - ❌ Does not retrieve other users walks (RLS)
- **Walk Updates:**
  - ✅ Updates walk steps
  - ✅ Updates walk duration
  - ✅ Updates multiple fields at once
- **Walk Deletion:**
  - ✅ Deletes own walk
  - ❌ Does not delete other users walks (RLS)
- **Walk Statistics:**
  - ✅ Calculates total steps for today
  - ✅ Calculates total distance for today

### 4. Streaks & Daily Stats (`streaks.test.js`)

- **Daily Stats Operations:**
  - ✅ Creates daily stats
  - ✅ Retrieves daily stats for a specific date
  - ✅ Updates existing daily stats
  - ✅ Retrieves weekly stats
  - ✅ Calculates weekly total steps
- **Streak Operations:**
  - ✅ Creates a streak record
  - ✅ Retrieves streak for a user
  - ✅ Updates a streak
  - ✅ Updates longest streak when current exceeds it
  - ✅ Uses a streak freeze
  - ✅ Earns a streak freeze
- **Integration:**
  - ✅ Updates stats when a walk is logged
  - ✅ Maintains streak when goal is met
- **RLS Policies:**
  - ❌ Does not access other users daily stats
  - ❌ Does not access other users streaks

## How It Works

- **Jest:** The test runner that executes the tests.
- **Supabase Client:** The official Supabase JavaScript client for interacting with the database.
- **dotenv:** Loads environment variables from the `.env` file.
- **Test Helpers:** Utility functions to generate test data and perform common actions.

Each test file is self-contained and sets up its own test data. The `beforeEach` and `afterEach` hooks ensure that tests are isolated and that test data is cleaned up after each run.

## Future Improvements

- **CI/CD Integration:** Integrate this test suite into your GitHub Actions workflow to run automatically on every push or pull request.
- **Mocking:** For more advanced tests, you could mock the Supabase client to test offline behavior or error handling.
- **More Business Logic:** Add more tests for complex business logic, such as achievement unlocking or social features.
- **Performance Testing:** Add tests to measure the performance of database queries.

---

This test suite provides a solid foundation for ensuring the quality and reliability of your Stepin application. By running these tests regularly, you can catch bugs early and deploy with confidence.
