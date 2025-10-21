# How to Seed the Steppin-Test Database

## Quick Start (Recommended)

The easiest way to seed the database is to run the SQL script directly in the Supabase SQL Editor:

### Step 1: Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard/project/hwzyuugggdubeejfpele
2. Click on "SQL Editor" in the left sidebar
3. Click "New query"

### Step 2: Copy and Execute the Seed Script
1. Open the file: `database/seed-test-users-complete.sql`
2. Copy the ENTIRE contents of the file
3. Paste it into the Supabase SQL Editor
4. Click "Run" (or press Cmd/Ctrl + Enter)

### Step 3: Verify Success
The script will output a summary at the end showing:
- Users created: 4
- Walks created: ~80-100 (varies due to randomization)
- Buddy connections: 7
- Badges awarded: ~30
- Activity feed entries: 12
- Kudos given: 5

## What Gets Created

### 4 Test Users:
1. **mike.chen@example.com** - Active walker (28/30 days, 12k step goal)
2. **sarah.johnson@example.com** - Beginner (18/30 days, 5k step goal)
3. **emma.rodriguez@example.com** - Recovery mode (20/30 days, 4k step goal, private)
4. **james.williams@example.com** - Steady walker (24/30 days, 6k step goal)

**Password for all users:** `TestPassword123!`

### Complete Data Across ALL Tables:
- ✅ **auth.users** - Authentication records
- ✅ **profiles** - Complete user profiles with preferences
- ✅ **walks** - 30 days of realistic walk data
- ✅ **daily_stats** - Aggregated daily statistics
- ✅ **streaks** - Current and longest streaks
- ✅ **buddies** - Social connections (Mike ↔ Sarah ↔ James, Mike → Emma pending)
- ✅ **activity_feed** - Recent activities
- ✅ **kudos** - Encouragement between buddies
- ✅ **user_badges** - Earned achievements
- ✅ **weekly_summaries** - Last 4 weeks of summaries
- ✅ **invite_links** - Active and expired invite codes

## Alternative: Command Line (if psql is installed)

If you have PostgreSQL client tools installed:

```bash
# Set your Supabase database password
export SUPABASE_DB_PASSWORD="your-password-here"

# Run the seed script
psql "postgresql://postgres.hwzyuugggdubeejfpele:${SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres" -f database/seed-test-users-complete.sql
```

## Troubleshooting

### Error: "relation does not exist"
- Make sure you've run all migrations first
- Check that the phase-11-social-features.sql migration has been applied

### Error: "duplicate key value"
- The script includes `TRUNCATE` commands to clear existing data
- If you get this error, the truncate may have failed
- Manually delete test users from Supabase dashboard first

### Script takes too long
- The script includes procedural code (DO $$ blocks) that generates random data
- This is normal and should complete in 30-60 seconds
- If it times out, try running sections individually

## Verifying the Seed Data

After running the script, you can verify the data was created:

```sql
-- Check users
SELECT email, display_name, daily_step_goal FROM public.profiles;

-- Check walks
SELECT user_id, COUNT(*) as walk_count, SUM(steps) as total_steps 
FROM public.walks 
GROUP BY user_id;

-- Check buddies
SELECT 
  p1.display_name as user, 
  p2.display_name as buddy, 
  b.status 
FROM public.buddies b
JOIN public.profiles p1 ON b.user_id = p1.id
JOIN public.profiles p2 ON b.buddy_id = p2.id;

-- Check badges
SELECT p.display_name, COUNT(ub.id) as badge_count
FROM public.user_badges ub
JOIN public.profiles p ON ub.user_id = p.id
GROUP BY p.display_name;
```

## Re-running the Seed Script

The script is idempotent - it can be run multiple times safely:
1. It truncates all tables first
2. It deletes existing test users
3. It recreates everything from scratch

To re-seed:
1. Just run the script again
2. All old data will be cleared
3. Fresh data will be generated (with different random values for walks)

## Next Steps

After seeding:
1. Try logging in with `mike.chen@example.com` / `TestPassword123!`
2. Test the app features with realistic data
3. Check buddy connections and activity feed
4. Verify badges and streaks are displaying correctly

