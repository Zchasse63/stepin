/**
 * Database Seeding Script for E2E Tests
 * Seeds the test database with fixture data for consistent test execution
 */

import { createClient } from '@supabase/supabase-js';
import users from '../fixtures/users.json';
import walks from '../fixtures/walks.json';
import streaks from '../fixtures/streaks.json';
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

// CRITICAL SAFETY CHECK: Prevent seeding production database
if (!SUPABASE_URL.includes(EXPECTED_TEST_PROJECT_ID)) {
  console.error('\n🚨 CRITICAL: WRONG SUPABASE INSTANCE! 🚨');
  console.error('Cannot seed database - not using TEST instance!');
  console.error('Expected TEST ID:', EXPECTED_TEST_PROJECT_ID);
  console.error('Current URL:', SUPABASE_URL);
  if (SUPABASE_URL.includes(PRODUCTION_PROJECT_ID)) {
    console.error('\n⛔ PRODUCTION INSTANCE DETECTED - SEEDING BLOCKED!');
  }
  console.error('\n📖 See SUPABASE_INSTANCES.md for correct configuration\n');
  process.exit(1);
}
console.log('✅ Safety Check: Using TEST instance for seeding\n');

// Create Supabase admin client with service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Seed test users
 */
async function seedUsers() {
  console.log('📝 Seeding test users...');
  
  for (const [key, userData] of Object.entries(users)) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          display_name: userData.profile.display_name,
        },
      });

      if (authError) {
        // User might already exist, try to get existing user
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers?.users.find(u => u.email === userData.email);
        
        if (existingUser) {
          console.log(`  ✓ User already exists: ${userData.email}`);
          continue;
        } else {
          throw authError;
        }
      }

      const userId = authData.user!.id;

      // Update profile (created by trigger)
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          daily_step_goal: userData.profile.daily_step_goal,
          units_preference: userData.profile.units_preference,
          theme_preference: userData.profile.theme_preference,
          notification_settings: userData.profile.notification_settings,
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      // Seed walks
      if (userData.walks && userData.walks.length > 0) {
        const walksData = userData.walks.map(walk => ({
          user_id: userId,
          date: walk.date,
          steps: walk.steps,
          duration_minutes: walk.duration_minutes,
          distance_meters: walk.distance_meters,
        }));

        const { error: walksError } = await supabase
          .from('walks')
          .insert(walksData);

        if (walksError) throw walksError;
      }

      // Update streak
      if (userData.streak) {
        const { error: streakError } = await supabase
          .from('streaks')
          .update({
            current_streak: userData.streak.current_streak,
            longest_streak: userData.streak.longest_streak,
            last_activity_date: userData.streak.last_activity_date,
          })
          .eq('user_id', userId);

        if (streakError) throw streakError;
      }

      console.log(`  ✓ Created user: ${userData.email}`);
    } catch (error) {
      console.error(`  ✗ Failed to create user ${userData.email}:`, error);
    }
  }
}

/**
 * Seed daily stats (calculated from walks)
 */
async function seedDailyStats() {
  console.log('📊 Calculating daily stats...');

  // Get all walks
  const { data: allWalks, error } = await supabase
    .from('walks')
    .select('user_id, date, steps');

  if (error) {
    console.error('  ✗ Failed to fetch walks:', error);
    return;
  }

  // Group by user and date
  const statsMap = new Map<string, { user_id: string; date: string; total_steps: number }>();

  allWalks?.forEach(walk => {
    const key = `${walk.user_id}-${walk.date}`;
    if (statsMap.has(key)) {
      const existing = statsMap.get(key)!;
      existing.total_steps += walk.steps;
    } else {
      statsMap.set(key, {
        user_id: walk.user_id,
        date: walk.date,
        total_steps: walk.steps,
      });
    }
  });

  // Get user goals
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, daily_step_goal');

  const goalsMap = new Map(profiles?.map(p => [p.id, p.daily_step_goal]) || []);

  // Insert daily stats
  const statsData = Array.from(statsMap.values()).map(stat => ({
    user_id: stat.user_id,
    date: stat.date,
    total_steps: stat.total_steps,
    goal_met: stat.total_steps >= (goalsMap.get(stat.user_id) || 7000),
  }));

  if (statsData.length > 0) {
    const { error: statsError } = await supabase
      .from('daily_stats')
      .upsert(statsData, { onConflict: 'user_id,date' });

    if (statsError) {
      console.error('  ✗ Failed to insert daily stats:', error);
    } else {
      console.log(`  ✓ Created ${statsData.length} daily stats records`);
    }
  }
}

/**
 * Main seeding function
 */
export async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    await seedUsers();
    await seedDailyStats();

    console.log('\n✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

