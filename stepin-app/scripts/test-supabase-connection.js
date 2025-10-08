/**
 * Test script to verify Supabase connection
 * Run with: node scripts/test-supabase-connection.js
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');
console.log('Environment Variables:');
console.log('- SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
console.log('- SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please check your .env file.');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('1️⃣ Testing basic connection...');
    
    // Test 1: Simple query to check connection
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!\n');
    
    // Test 2: Try to sign up a test user
    console.log('2️⃣ Testing sign-up functionality...');
    const testEmail = `test-${Date.now()}@stepin.test`;
    const testPassword = 'TestPass123!';
    const testDisplayName = 'Test User';
    
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`   Display Name: ${testDisplayName}\n`);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          display_name: testDisplayName,
        },
      },
    });
    
    if (signUpError) {
      console.error('❌ Sign-up failed:', signUpError.message);
      console.error('   Error details:', JSON.stringify(signUpError, null, 2));
      return false;
    }
    
    console.log('✅ Sign-up successful!');
    console.log('   User ID:', signUpData.user?.id);
    console.log('   Email:', signUpData.user?.email);
    console.log('   Session:', signUpData.session ? '✅ Created' : '❌ Not created');
    console.log('');
    
    // Test 3: Check if profile was created automatically
    if (signUpData.user) {
      console.log('3️⃣ Checking if profile was auto-created...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();
      
      if (profileError) {
        console.error('❌ Profile check failed:', profileError.message);
        return false;
      }
      
      if (profileData) {
        console.log('✅ Profile auto-created successfully!');
        console.log('   Profile:', JSON.stringify(profileData, null, 2));
        console.log('');
      } else {
        console.error('❌ Profile was not created automatically!');
        return false;
      }
      
      // Test 4: Check if streak was created
      console.log('4️⃣ Checking if streak was auto-created...');
      
      const { data: streakData, error: streakError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', signUpData.user.id)
        .single();
      
      if (streakError) {
        console.error('❌ Streak check failed:', streakError.message);
        return false;
      }
      
      if (streakData) {
        console.log('✅ Streak auto-created successfully!');
        console.log('   Streak:', JSON.stringify(streakData, null, 2));
        console.log('');
      } else {
        console.error('❌ Streak was not created automatically!');
        return false;
      }
      
      // Clean up: Delete the test user
      console.log('5️⃣ Cleaning up test user...');
      
      // Sign in as the test user first
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (signInError) {
        console.warn('⚠️  Could not sign in to clean up:', signInError.message);
      } else {
        // Delete the user's profile (cascade will handle streaks)
        const { error: deleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('id', signUpData.user.id);
        
        if (deleteError) {
          console.warn('⚠️  Could not delete profile:', deleteError.message);
        } else {
          console.log('✅ Test user cleaned up successfully!');
        }
      }
    }
    
    console.log('\n🎉 All tests passed! Supabase is configured correctly.\n');
    return true;
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('   Stack:', error.stack);
    return false;
  }
}

testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

