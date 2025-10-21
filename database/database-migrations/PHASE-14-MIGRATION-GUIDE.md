# Phase 14: Buddy Discovery Migrations - Execution Guide

## Overview
This guide walks you through running the 4 SQL migrations for the Buddy Discovery system.

**Target Database:** TEST Supabase (hwzyuugggdubeejfpele)  
**Estimated Time:** 5 minutes  
**Order:** Must be run sequentially (1 → 2 → 3 → 4)

---

## Migration Files

1. **phase-14-buddy-discovery-username.sql** - Username fields and search
2. **phase-14-buddy-discovery-invites.sql** - Invite links table
3. **phase-14-buddy-discovery-contacts.sql** - Phone hash for contact sync
4. **phase-14-generate-test-usernames.sql** - Generate usernames for test users

---

## Step-by-Step Instructions

### 1. Open Supabase SQL Editor

Navigate to: https://supabase.com/dashboard/project/hwzyuugggdubeejfpele/sql

### 2. Run Migration 1: Username Fields

**File:** `phase-14-buddy-discovery-username.sql`

**What it does:**
- Adds `username` and `username_lowercase` columns to profiles table
- Creates indexes for fast username search
- Creates trigger to auto-update lowercase username

**Steps:**
1. Click "New Query" in SQL Editor
2. Copy entire contents of `phase-14-buddy-discovery-username.sql`
3. Paste into SQL Editor
4. Click "Run"
5. ✅ Verify success message: "Phase 14 (Username) migration completed successfully"

**Expected Output:**
```
NOTICE: Phase 14 (Username) migration completed successfully
NOTICE: Added columns: username, username_lowercase
NOTICE: Created indexes: idx_profiles_username_search, idx_profiles_username
NOTICE: Created trigger: trigger_update_username_lowercase
```

---

### 3. Run Migration 2: Invite Links

**File:** `phase-14-buddy-discovery-invites.sql`

**What it does:**
- Creates `invite_links` table for shareable invite links
- Creates indexes for fast invite code lookup
- Creates `generate_invite_code()` function
- Sets up RLS policies for invite links

**Steps:**
1. Click "New Query" in SQL Editor
2. Copy entire contents of `phase-14-buddy-discovery-invites.sql`
3. Paste into SQL Editor
4. Click "Run"
5. ✅ Verify success message: "Phase 14 (Invite Links) migration completed successfully"

**Expected Output:**
```
NOTICE: Phase 14 (Invite Links) migration completed successfully
NOTICE: Created table: invite_links
NOTICE: Created indexes: 3 performance indexes
NOTICE: Created function: generate_invite_code()
NOTICE: Created policies: 4 RLS policies
```

---

### 4. Run Migration 3: Contact Sync

**File:** `phase-14-buddy-discovery-contacts.sql`

**What it does:**
- Adds `phone_hash` column to profiles table for privacy-first contact matching
- Creates index for fast contact matching
- Documents privacy safeguards

**Steps:**
1. Click "New Query" in SQL Editor
2. Copy entire contents of `phase-14-buddy-discovery-contacts.sql`
3. Paste into SQL Editor
4. Click "Run"
5. ✅ Verify success message: "Phase 14 (Contact Sync) migration completed successfully"

**Expected Output:**
```
NOTICE: Phase 14 (Contact Sync) migration completed successfully
NOTICE: Added column: phone_hash (SHA-256 hash)
NOTICE: Created index: idx_profiles_phone_hash
NOTICE: Privacy: Opt-in only, hashed data, user control
```

---

### 5. Run Migration 4: Generate Test Usernames

**File:** `phase-14-generate-test-usernames.sql`

**What it does:**
- Assigns memorable usernames to the 5 existing test users
- Displays test usernames for reference

**Steps:**
1. Click "New Query" in SQL Editor
2. Copy entire contents of `phase-14-generate-test-usernames.sql`
3. Paste into SQL Editor
4. Click "Run"
5. ✅ Verify success message and see test usernames displayed

**Expected Output:**
```
NOTICE: Phase 14 (Test Usernames) migration completed successfully
NOTICE: Generated usernames for 5 test users:
NOTICE:   - sarah_walker (Sarah Johnson)
NOTICE:   - mike_active (Mike Chen)
NOTICE:   - emma_recovery (Emma Rodriguez)
NOTICE:   - james_senior (James Williams)
NOTICE:   - lisa_busy (Lisa Thompson)
NOTICE: 
NOTICE: You can now test username search with these usernames!

Results:
display_name      | username       | email                        | location_city
------------------|----------------|------------------------------|---------------
Emma Rodriguez    | emma_recovery  | emma.rodriguez@example.com   | Austin, TX
James Williams    | james_senior   | james.williams@example.com   | Portland, OR
Lisa Thompson     | lisa_busy      | lisa.thompson@example.com    | New York, NY
Mike Chen         | mike_active    | mike.chen@example.com        | San Francisco, CA
Sarah Johnson     | sarah_walker   | sarah.johnson@example.com    | Tampa, FL
```

---

## Verification Checklist

After running all 4 migrations, verify:

- [ ] Migration 1: Username fields added to profiles table
- [ ] Migration 2: invite_links table created
- [ ] Migration 3: phone_hash field added to profiles table
- [ ] Migration 4: All 5 test users have usernames

**Quick Verification Query:**
```sql
-- Run this to verify all changes
SELECT 
  column_name, 
  data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('username', 'username_lowercase', 'phone_hash')
ORDER BY column_name;

-- Should return 3 rows:
-- phone_hash, username, username_lowercase
```

---

## Troubleshooting

### Error: "column already exists"
**Solution:** Migration already ran successfully. Skip to next migration.

### Error: "relation does not exist"
**Solution:** Ensure you're running migrations in order (1 → 2 → 3 → 4).

### Error: "permission denied"
**Solution:** Verify you're logged into the correct Supabase project (hwzyuugggdubeejfpele).

---

## What Happens Next

Once all 4 migrations are complete, the AI agent can autonomously:

1. ✅ Install npm dependencies (react-native-qrcode-svg, expo-camera, etc.)
2. ✅ Update app.json with deep linking configuration
3. ✅ Implement all buddy discovery features (QR codes, search, invites, contacts)
4. ✅ Create all UI components and screens
5. ✅ Implement all tests

**No further manual database work required!** 🎉

---

## Test Usernames Reference

Use these usernames to test the buddy search feature:

| Display Name    | Username       | Email                        | Location        |
|-----------------|----------------|------------------------------|-----------------|
| Sarah Johnson   | sarah_walker   | sarah.johnson@example.com    | Tampa, FL       |
| Mike Chen       | mike_active    | mike.chen@example.com        | San Francisco   |
| Emma Rodriguez  | emma_recovery  | emma.rodriguez@example.com   | Austin, TX      |
| James Williams  | james_senior   | james.williams@example.com   | Portland, OR    |
| Lisa Thompson   | lisa_busy      | lisa.thompson@example.com    | New York, NY    |

**Test Search Examples:**
- Search "sarah" → finds sarah_walker
- Search "mike" → finds mike_active
- Search "senior" → finds james_senior
- Search "sarah.johnson@example.com" → finds Sarah Johnson

---

## Summary

**Total Migrations:** 4  
**Total Time:** ~5 minutes  
**Database Changes:**
- 3 new columns (username, username_lowercase, phone_hash)
- 1 new table (invite_links)
- 5 new indexes
- 1 new trigger
- 1 new function
- 4 new RLS policies

**Ready for:** Autonomous implementation of 51 remaining tasks! 🚀

