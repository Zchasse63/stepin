/**
 * Database Verification Script for E2E Tests
 * Verifies test database connection and schema
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.test file
config({ path: resolve(__dirname, '../../.env.test') });

// ============================================================================
// SAFETY: Validate we're using the TEST instance, not production
// ============================================================================
const EXPECTED_TEST_PROJECT_ID = 'hwzyuugggdubeejfpele';
const PRODUCTION_PROJECT_ID = 'mvvndpuwrbsrahytxtjf'; // DO NOT USE FOR TESTING!

// Load test environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_TEST_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_TEST_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  console.error('\nPlease complete the setup steps in SUPABASE_TEST_SETUP.md');
  process.exit(1);
}

// CRITICAL SAFETY CHECK: Ensure we're using the TEST instance
if (!SUPABASE_URL.includes(EXPECTED_TEST_PROJECT_ID)) {
  console.error('\n🚨 CRITICAL ERROR: WRONG SUPABASE INSTANCE! 🚨\n');
  console.error('You are attempting to use the PRODUCTION database for testing!');
  console.error('This could destroy real user data.\n');
  console.error('Expected TEST instance ID:', EXPECTED_TEST_PROJECT_ID);
  console.error('Expected TEST URL: https://hwzyuugggdubeejfpele.supabase.co');
  console.error('Current URL:', SUPABASE_URL);

  if (SUPABASE_URL.includes(PRODUCTION_PROJECT_ID)) {
    console.error('\n⛔ PRODUCTION INSTANCE DETECTED!');
    console.error('Production ID:', PRODUCTION_PROJECT_ID);
    console.error('Production URL: https://mvvndpuwrbsrahytxtjf.supabase.co');
    console.error('\n❌ NEVER use production for testing!');
  }

  console.error('\n📖 See SUPABASE_INSTANCES.md for correct configuration');
  console.error('💡 Update your .env.test file with the correct TEST instance URL\n');
  process.exit(1);
}

console.log('✅ Safety Check Passed: Using TEST instance (hwzyuugggdubeejfpele)\n');

// Create Supabase admin client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Verify database connection
 */
async function verifyConnection() {
  console.log('🔌 Verifying database connection...');
  
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('  ✗ Connection failed:', error.message);
      return false;
    }
    
    console.log('  ✓ Connected to test database');
    console.log(`  URL: ${SUPABASE_URL}`);
    return true;
  } catch (error) {
    console.error('  ✗ Connection error:', error);
    return false;
  }
}

/**
 * Verify required tables exist
 */
async function verifyTables() {
  console.log('\n📊 Verifying database tables...');
  
  const requiredTables = ['profiles', 'walks', 'daily_stats', 'streaks'];
  let allTablesExist = true;

  for (const table of requiredTables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      
      if (error) {
        console.error(`  ✗ Table '${table}' not found or inaccessible`);
        allTablesExist = false;
      } else {
        console.log(`  ✓ Table '${table}' exists`);
      }
    } catch (error) {
      console.error(`  ✗ Error checking table '${table}':`, error);
      allTablesExist = false;
    }
  }

  return allTablesExist;
}

/**
 * Verify test user exists
 */
async function verifyTestUser() {
  console.log('\n👤 Verifying test user...');
  
  try {
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('  ✗ Failed to list users:', error.message);
      return false;
    }

    const testUser = users?.find(u => u.email === 'test@stepin.test');
    
    if (testUser) {
      console.log('  ✓ Test user exists: test@stepin.test');
      console.log(`  User ID: ${testUser.id}`);
      return true;
    } else {
      console.log('  ℹ️  Test user not found (will be created during seeding)');
      return true; // Not an error, just informational
    }
  } catch (error) {
    console.error('  ✗ Error checking test user:', error);
    return false;
  }
}

/**
 * Verify database functions exist
 */
async function verifyFunctions() {
  console.log('\n⚙️  Verifying database functions...');
  
  try {
    // Try to call update_streak function (it should exist)
    const { error } = await supabase.rpc('update_streak', {
      user_uuid: '00000000-0000-0000-0000-000000000000',
      activity_date: '2024-01-01'
    });

    // We expect an error because the user doesn't exist, but the function should be found
    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      console.error('  ✗ Function update_streak not found');
      console.error('  Please run the database schema SQL in Supabase dashboard');
      return false;
    }
    
    console.log('  ✓ Database functions exist');
    return true;
  } catch (error) {
    console.log('  ⚠️  Could not verify functions (may need manual check)');
    return true; // Don't fail on this
  }
}

/**
 * Display environment info
 */
function displayEnvironmentInfo() {
  console.log('\n🔧 Environment Configuration:');
  console.log(`  MOCK_HEALTHKIT: ${process.env.MOCK_HEALTHKIT || 'not set'}`);
  console.log(`  MOCK_NOTIFICATIONS: ${process.env.MOCK_NOTIFICATIONS || 'not set'}`);
  console.log(`  MOCK_DATE: ${process.env.MOCK_DATE || 'not set'}`);
  console.log(`  TEST_MODE: ${process.env.TEST_MODE || 'not set'}`);
  console.log(`  NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
}

/**
 * Main verification function
 */
async function verifyDatabase() {
  console.log('🧪 Stepin E2E Test Database Verification\n');
  console.log('='.repeat(50));

  const results = {
    connection: await verifyConnection(),
    tables: await verifyTables(),
    testUser: await verifyTestUser(),
    functions: await verifyFunctions(),
  };

  displayEnvironmentInfo();

  console.log('\n' + '='.repeat(50));
  console.log('\n📋 Verification Summary:');
  console.log(`  Database Connection: ${results.connection ? '✅' : '❌'}`);
  console.log(`  Required Tables: ${results.tables ? '✅' : '❌'}`);
  console.log(`  Test User: ${results.testUser ? '✅' : '❌'}`);
  console.log(`  Database Functions: ${results.functions ? '✅' : '⚠️'}`);

  const allPassed = results.connection && results.tables && results.testUser;

  if (allPassed) {
    console.log('\n✅ Database verification passed!');
    console.log('\nNext steps:');
    console.log('  1. Run: npm run test:seed-db');
    console.log('  2. Run: npm run test:e2e:auth');
    process.exit(0);
  } else {
    console.log('\n❌ Database verification failed!');
    console.log('\nPlease complete the setup steps in:');
    console.log('  - SUPABASE_TEST_SETUP.md');
    console.log('  - TESTING_QUICK_START.md');
    process.exit(1);
  }
}

// Run verification
verifyDatabase();

