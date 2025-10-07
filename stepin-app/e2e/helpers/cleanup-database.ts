/**
 * Database Cleanup Script for E2E Tests
 * Removes all test data from the database
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
const PRODUCTION_PROJECT_ID = 'mvvndpuwrbsrahytxtjf';

// Load test environment variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_TEST_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_TEST_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// CRITICAL SAFETY CHECK: Prevent cleaning production database
if (!SUPABASE_URL.includes(EXPECTED_TEST_PROJECT_ID)) {
  console.error('\n🚨 CRITICAL: WRONG SUPABASE INSTANCE! 🚨');
  console.error('Cannot cleanup database - not using TEST instance!');
  console.error('Expected TEST ID:', EXPECTED_TEST_PROJECT_ID);
  console.error('Current URL:', SUPABASE_URL);
  if (SUPABASE_URL.includes(PRODUCTION_PROJECT_ID)) {
    console.error('\n⛔ PRODUCTION INSTANCE DETECTED - CLEANUP BLOCKED!');
    console.error('This would DELETE ALL PRODUCTION DATA!');
  }
  console.error('\n📖 See SUPABASE_INSTANCES.md for correct configuration\n');
  process.exit(1);
}
console.log('✅ Safety Check: Using TEST instance for cleanup\n');

// Create Supabase admin client with service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Delete all test users and their associated data
 */
async function cleanupUsers() {
  console.log('🗑️  Deleting test users...');

  try {
    // Get all users
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) throw listError;

    if (!users || users.length === 0) {
      console.log('  ℹ️  No users to delete');
      return;
    }

    // Delete each user (cascade will handle related data)
    let deletedCount = 0;
    for (const user of users) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.error(`  ✗ Failed to delete user ${user.email}:`, deleteError);
      } else {
        deletedCount++;
      }
    }

    console.log(`  ✓ Deleted ${deletedCount} users`);
  } catch (error) {
    console.error('  ✗ Failed to cleanup users:', error);
  }
}

/**
 * Clean up orphaned data (if any)
 */
async function cleanupOrphanedData() {
  console.log('🧹 Cleaning up orphaned data...');

  try {
    // Delete all walks (should be handled by cascade, but just in case)
    const { error: walksError } = await supabase
      .from('walks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (walksError && walksError.code !== 'PGRST116') { // Ignore "no rows" error
      console.error('  ✗ Failed to delete walks:', walksError);
    }

    // Delete all daily stats
    const { error: statsError } = await supabase
      .from('daily_stats')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('  ✗ Failed to delete daily stats:', statsError);
    }

    // Delete all streaks
    const { error: streaksError } = await supabase
      .from('streaks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (streaksError && streaksError.code !== 'PGRST116') {
      console.error('  ✗ Failed to delete streaks:', streaksError);
    }

    // Delete all profiles
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (profilesError && profilesError.code !== 'PGRST116') {
      console.error('  ✗ Failed to delete profiles:', profilesError);
    }

    console.log('  ✓ Cleaned up orphaned data');
  } catch (error) {
    console.error('  ✗ Failed to cleanup orphaned data:', error);
  }
}

/**
 * Verify cleanup
 */
async function verifyCleanup() {
  console.log('✅ Verifying cleanup...');

  try {
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const { data: profiles } = await supabase.from('profiles').select('id');
    const { data: walks } = await supabase.from('walks').select('id');
    const { data: stats } = await supabase.from('daily_stats').select('id');
    const { data: streaks } = await supabase.from('streaks').select('id');

    console.log(`  Users: ${users?.length || 0}`);
    console.log(`  Profiles: ${profiles?.length || 0}`);
    console.log(`  Walks: ${walks?.length || 0}`);
    console.log(`  Daily Stats: ${stats?.length || 0}`);
    console.log(`  Streaks: ${streaks?.length || 0}`);

    if ((users?.length || 0) === 0 && 
        (profiles?.length || 0) === 0 && 
        (walks?.length || 0) === 0) {
      console.log('  ✓ Database is clean');
    } else {
      console.log('  ⚠️  Some data remains in database');
    }
  } catch (error) {
    console.error('  ✗ Failed to verify cleanup:', error);
  }
}

/**
 * Main cleanup function
 */
export async function cleanupDatabase() {
  console.log('🧼 Starting database cleanup...\n');

  try {
    await cleanupUsers();
    await cleanupOrphanedData();
    await verifyCleanup();

    console.log('\n✅ Database cleanup completed successfully!');
  } catch (error) {
    console.error('\n❌ Database cleanup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanupDatabase().then(() => process.exit(0));
}

