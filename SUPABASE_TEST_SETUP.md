# Supabase Test Instance Setup Guide

## ✅ Test Instance Created

**Project Name:** Steppin-Test  
**Project ID:** hwzyuugggdubeejfpele  
**Region:** us-east-1  
**Status:** ACTIVE_HEALTHY  
**Created:** 2025-10-07

---

## 🔧 Manual Setup Steps Required

### Step 1: Access the Test Project Dashboard

1. Go to: https://supabase.com/dashboard/project/hwzyuugggdubeejfpele
2. Log in with your Supabase account

### Step 2: Apply Database Schema

1. In the Supabase dashboard, navigate to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `database-schema.sql` from the project root
4. Paste into the SQL editor
5. Click **Run** to execute the schema
6. Verify all tables were created successfully:
   - profiles
   - walks
   - daily_stats
   - streaks

### Step 3: Retrieve API Keys

1. Navigate to **Settings** > **API**
2. Copy the following values:

   **Project URL:**
   ```
   https://hwzyuugggdubeejfpele.supabase.co
   ```

   **Anon/Public Key:**
   ```
   (Copy from dashboard - starts with eyJ...)
   ```

   **Service Role Key:**
   ```
   (Copy from dashboard - starts with eyJ...)
   ```

### Step 4: Update Environment Variables

1. Open `stepin-app/.env.test`
2. Replace the placeholder values:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://hwzyuugggdubeejfpele.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=<paste-anon-key-here>
   SUPABASE_SERVICE_KEY=<paste-service-key-here>
   ```

3. Save the file

### Step 5: Configure GitHub Secrets (for CI/CD)

1. Go to your GitHub repository settings
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Add the following secrets:

   ```
   SUPABASE_TEST_URL=https://hwzyuugggdubeejfpele.supabase.co
   SUPABASE_TEST_ANON_KEY=<your-anon-key>
   SUPABASE_TEST_SERVICE_KEY=<your-service-key>
   ```

### Step 6: Create Test User Account

1. In Supabase dashboard, go to **Authentication** > **Users**
2. Click **Add User** > **Create new user**
3. Create a test account:
   - Email: `test@stepin.test`
   - Password: `TestPassword123!`
   - Auto Confirm User: ✅ Yes
4. Note the user ID for test fixtures

---

## 🧪 Verify Setup

Run this command to verify the test database connection:

```bash
cd stepin-app
npm run test:verify-db
```

Expected output:
```
✅ Connected to test database
✅ Tables exist: profiles, walks, daily_stats, streaks
✅ Test user exists: test@stepin.test
```

---

## 📊 Test Data Management

### Seeding Test Data

```bash
npm run test:seed-db
```

### Cleaning Test Data

```bash
npm run test:cleanup-db
```

### Reset Test Database

```bash
npm run test:reset-db
```

---

## 🔒 Security Notes

- ⚠️ **Never commit `.env.test` with real API keys to version control**
- ✅ `.env.test` is already in `.gitignore`
- ✅ Use GitHub Secrets for CI/CD
- ✅ Test database has separate credentials from production
- ✅ Row Level Security (RLS) is enabled on all tables

---

## 🚨 Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:** Ensure `.env.test` has all required values filled in.

### Issue: "Failed to connect to database"

**Solution:** 
1. Verify the project URL is correct
2. Check that API keys are valid
3. Ensure the test project status is ACTIVE_HEALTHY

### Issue: "Tables not found"

**Solution:** Re-run the database schema SQL in the Supabase SQL Editor.

---

## 📝 Next Steps

After completing this setup:

1. ✅ Verify database connection
2. ✅ Seed test data
3. ✅ Run your first test: `npm run test:e2e:auth`
4. ✅ Configure CI/CD pipeline

---

## 📚 Resources

- [Supabase Dashboard](https://supabase.com/dashboard/project/hwzyuugggdubeejfpele)
- [Supabase Documentation](https://supabase.com/docs)
- [Testing Quick Start Guide](../TESTING_QUICK_START.md)
- [Full E2E Testing Plan](../MAESTRO_E2E_TESTING_PLAN.md)

