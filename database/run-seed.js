#!/usr/bin/env node
/**
 * Script to execute the seed SQL file on Supabase
 * Usage: node database/run-seed.js
 */

const fs = require('fs');
const path = require('path');

// Read the seed SQL file
const sqlFile = path.join(__dirname, 'seed-test-users-complete.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

// Supabase project details
const PROJECT_ID = 'hwzyuugggdubeejfpele';
const SUPABASE_URL = `https://${PROJECT_ID}.supabase.co`;

// You need to set this environment variable with your Supabase service role key
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: SUPABASE_SERVICE_KEY environment variable is not set');
  console.error('');
  console.error('Please set it with:');
  console.error('export SUPABASE_SERVICE_KEY="your-service-role-key-here"');
  console.error('');
  console.error('You can find your service role key in:');
  console.error('Supabase Dashboard > Project Settings > API > service_role key');
  process.exit(1);
}

async function executeSeed() {
  console.log('🌱 Starting database seed...');
  console.log(`📍 Project: ${PROJECT_ID}`);
  console.log(`📄 SQL File: ${sqlFile}`);
  console.log('');

  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
      body: JSON.stringify({
        query: sqlContent
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP ${response.status}: ${error}`);
    }

    const result = await response.json();
    console.log('✅ Seed script executed successfully!');
    console.log('');
    console.log('📊 Summary:');
    console.log('  - 4 test users created');
    console.log('  - ~80-100 walks generated');
    console.log('  - 7 buddy connections');
    console.log('  - ~30 badges awarded');
    console.log('  - 12 activity feed entries');
    console.log('  - 5 kudos given');
    console.log('');
    console.log('🔐 Test Users:');
    console.log('  1. mike.chen@example.com');
    console.log('  2. sarah.johnson@example.com');
    console.log('  3. emma.rodriguez@example.com');
    console.log('  4. james.williams@example.com');
    console.log('');
    console.log('  Password for all: TestPassword123!');
    console.log('');
    console.log('✨ Database is ready for testing!');

  } catch (error) {
    console.error('❌ Error executing seed script:');
    console.error(error.message);
    console.error('');
    console.error('💡 Alternative: Run the SQL file manually in Supabase SQL Editor');
    console.error('   1. Go to https://supabase.com/dashboard/project/hwzyuugggdubeejfpele');
    console.error('   2. Click "SQL Editor" > "New query"');
    console.error('   3. Copy/paste contents of database/seed-test-users-complete.sql');
    console.error('   4. Click "Run"');
    process.exit(1);
  }
}

// Run the seed
executeSeed();

