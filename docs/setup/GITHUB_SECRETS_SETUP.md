# GitHub Secrets Configuration for E2E Testing CI/CD

**Repository:** https://github.com/Zchasse63/stepin  
**Status:** ✅ Repository created and code pushed  
**Workflow:** `.github/workflows/e2e-tests.yml` detected

---

## 🔐 Required GitHub Secrets

You need to configure **3 GitHub Secrets** for the CI/CD pipeline to work. These secrets will be used by GitHub Actions to connect to your test Supabase instance.

### Secrets to Add:

| Secret Name | Value | Where to Get It |
|-------------|-------|-----------------|
| `SUPABASE_TEST_URL` | `https://hwzyuugggdubeejfpele.supabase.co` | Already known (test instance) |
| `SUPABASE_TEST_ANON_KEY` | `eyJ...` (long JWT token) | Supabase Dashboard > Settings > API |
| `SUPABASE_TEST_SERVICE_KEY` | `eyJ...` (long JWT token) | Supabase Dashboard > Settings > API |

---

## 📋 Step-by-Step Instructions

### Step 1: Get Supabase API Keys

1. **Go to Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/hwzyuugggdubeejfpele
   ```

2. **Navigate to Settings > API:**
   - Click "Settings" in the left sidebar
   - Click "API" under Project Settings

3. **Copy the Keys:**
   - **Project URL:** Already known (`https://hwzyuugggdubeejfpele.supabase.co`)
   - **Anon/Public Key:** Copy the `anon` `public` key (starts with `eyJ...`)
   - **Service Role Key:** Click "Reveal" next to `service_role` and copy (starts with `eyJ...`)

   ⚠️ **Important:** The service role key has admin privileges. Keep it secret!

---

### Step 2: Add Secrets to GitHub

1. **Go to Repository Settings:**
   ```
   https://github.com/Zchasse63/stepin/settings/secrets/actions
   ```

2. **Click "New repository secret"**

3. **Add Each Secret:**

   **Secret 1: SUPABASE_TEST_URL**
   - Name: `SUPABASE_TEST_URL`
   - Value: `https://hwzyuugggdubeejfpele.supabase.co`
   - Click "Add secret"

   **Secret 2: SUPABASE_TEST_ANON_KEY**
   - Click "New repository secret" again
   - Name: `SUPABASE_TEST_ANON_KEY`
   - Value: Paste the anon key from Supabase (long JWT token)
   - Click "Add secret"

   **Secret 3: SUPABASE_TEST_SERVICE_KEY**
   - Click "New repository secret" again
   - Name: `SUPABASE_TEST_SERVICE_KEY`
   - Value: Paste the service role key from Supabase (long JWT token)
   - Click "Add secret"

---

## ✅ Verification

After adding all 3 secrets, you should see them listed at:
```
https://github.com/Zchasse63/stepin/settings/secrets/actions
```

The list should show:
- ✅ SUPABASE_TEST_ANON_KEY
- ✅ SUPABASE_TEST_SERVICE_KEY
- ✅ SUPABASE_TEST_URL

**Note:** GitHub will show when each secret was last updated, but won't show the actual values (for security).

---

## 🚀 Testing the CI/CD Pipeline

Once secrets are configured, the GitHub Actions workflow will run automatically on:

1. **Every push to any branch** - Runs P0 (critical) tests
2. **Push to main/develop branches** - Runs P0 + P1 (high priority) tests
3. **Daily at 2 AM UTC** - Runs full test suite (P0 + P1 + P2)

### Manual Test Run

To test the pipeline immediately:

1. Go to: https://github.com/Zchasse63/stepin/actions
2. Click on "E2E Tests" workflow
3. Click "Run workflow" dropdown
4. Select branch: `main`
5. Click "Run workflow" button

The workflow will:
- Set up macOS runner
- Install dependencies
- Start iOS simulator
- Build the app
- Seed test database
- Run E2E tests
- Upload results and screenshots

---

## 🔧 Workflow Configuration

The workflow file is located at:
```
.github/workflows/e2e-tests.yml
```

### Jobs Configured:

**1. test-p0-critical** (Runs on every commit)
- Timeout: 25 minutes
- Tests: 21 critical tests
- Triggers: All pushes

**2. test-p1-high** (Runs on main/develop)
- Timeout: 30 minutes
- Tests: P0 + P1 (50 tests total)
- Triggers: Push to main/develop branches

**3. test-full-suite** (Runs daily)
- Timeout: 45 minutes
- Tests: All 75 tests
- Triggers: Daily at 2 AM UTC

---

## 📊 Viewing Test Results

After a workflow run:

1. **Go to Actions tab:**
   ```
   https://github.com/Zchasse63/stepin/actions
   ```

2. **Click on a workflow run** to see:
   - ✅ Passed tests
   - ❌ Failed tests
   - 📸 Screenshots (if tests fail)
   - 📹 Recordings (if enabled)
   - 📝 Detailed logs

3. **Download Artifacts:**
   - Test results (JSON/XML)
   - Screenshots of failures
   - Maestro recordings

---

## 🛠️ Troubleshooting

### Secrets Not Working

**Symptom:** Workflow fails with "SUPABASE_TEST_URL is not set"

**Solution:**
1. Verify secrets are added at: https://github.com/Zchasse63/stepin/settings/secrets/actions
2. Check secret names match exactly (case-sensitive)
3. Re-run the workflow

### Database Connection Fails

**Symptom:** Tests fail with "Failed to connect to database"

**Solution:**
1. Verify Supabase instance is running: https://supabase.com/dashboard/project/hwzyuugggdubeejfpele
2. Check that database schema is applied (see `SUPABASE_TEST_SETUP.md`)
3. Verify service key has correct permissions

### Tests Timeout

**Symptom:** Workflow cancelled after 25/30/45 minutes

**Solution:**
1. Check if iOS simulator is starting correctly
2. Verify app builds successfully
3. Check individual test timeouts in YAML files
4. Consider increasing workflow timeout in `.github/workflows/e2e-tests.yml`

---

## 📚 Related Documentation

- **Supabase Setup:** `SUPABASE_TEST_SETUP.md`
- **E2E Infrastructure:** `E2E_INFRASTRUCTURE_COMPLETE.md`
- **Week 1-2 Handoff:** `E2E_WEEK_1-2_HANDOFF.md`
- **Testing Plan:** `MAESTRO_E2E_TESTING_PLAN.md`
- **Quick Start:** `TESTING_QUICK_START.md`

---

## 🎯 Next Steps

After configuring GitHub Secrets:

1. ✅ **Complete Supabase manual setup** (see `SUPABASE_TEST_SETUP.md`)
2. ✅ **Verify local tests work** (`npm run test:verify-db`)
3. ✅ **Push a commit to trigger CI/CD**
4. ✅ **Monitor first workflow run**
5. ✅ **Begin Week 3-4 test implementation**

---

## 🔗 Quick Links

- **Repository:** https://github.com/Zchasse63/stepin
- **Actions:** https://github.com/Zchasse63/stepin/actions
- **Secrets:** https://github.com/Zchasse63/stepin/settings/secrets/actions
- **Workflow File:** https://github.com/Zchasse63/stepin/blob/main/.github/workflows/e2e-tests.yml
- **Supabase Dashboard:** https://supabase.com/dashboard/project/hwzyuugggdubeejfpele

---

**Status:** 🟡 Waiting for GitHub Secrets configuration  
**Blocker:** Manual secret addition required (cannot be automated via API)  
**ETA:** 5-10 minutes to configure secrets

