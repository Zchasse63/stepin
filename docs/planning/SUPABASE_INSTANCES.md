# Supabase Instance Configuration

**⚠️ CRITICAL: Always verify you're using the correct Supabase instance!**

---

## 🗄️ Supabase Projects

### Production Instance (DO NOT USE FOR TESTING)
- **Name:** `Steppin`
- **Project ID:** `mvvndpuwrbsrahytxtjf`
- **URL:** `https://mvvndpuwrbsrahytxtjf.supabase.co`
- **Created:** October 5, 2025
- **Purpose:** Production data - REAL USER DATA
- **Dashboard:** https://supabase.com/dashboard/project/mvvndpuwrbsrahytxtjf
- **⛔ DO NOT:** Run tests, seed data, or cleanup scripts against this instance

### Test Instance (USE THIS FOR ALL TESTING)
- **Name:** `Steppin-Test`
- **Project ID:** `hwzyuugggdubeejfpele`
- **URL:** `https://hwzyuugggdubeejfpele.supabase.co`
- **Created:** October 7, 2025
- **Purpose:** E2E testing, development, CI/CD
- **Dashboard:** https://supabase.com/dashboard/project/hwzyuugggdubeejfpele
- **✅ SAFE TO:** Run tests, seed data, cleanup, reset database

---

## 🔒 Safety Mechanisms

### 1. Environment Variable Validation

All test scripts validate the Supabase URL before running:

```typescript
// stepin-app/e2e/helpers/verify-database.ts
const EXPECTED_TEST_PROJECT_ID = 'hwzyuugggdubeejfpele';
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;

if (!supabaseUrl?.includes(EXPECTED_TEST_PROJECT_ID)) {
  console.error('❌ WRONG SUPABASE INSTANCE!');
  console.error(`Expected test instance: ${EXPECTED_TEST_PROJECT_ID}`);
  console.error(`Current URL: ${supabaseUrl}`);
  process.exit(1);
}
```

### 2. Configuration Files

**Test Environment (`.env.test`):**
```bash
# Test instance - SAFE for testing
EXPO_PUBLIC_SUPABASE_URL=https://hwzyuugggdubeejfpele.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<test-anon-key>
SUPABASE_SERVICE_KEY=<test-service-key>
```

**Production Environment (`.env` or `.env.production`):**
```bash
# Production instance - DO NOT USE FOR TESTING
EXPO_PUBLIC_SUPABASE_URL=https://mvvndpuwrbsrahytxtjf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>
SUPABASE_SERVICE_KEY=<prod-service-key>
```

### 3. GitHub Secrets (CI/CD)

GitHub Actions uses separate secrets for testing:

```yaml
# .github/workflows/e2e-tests.yml
env:
  EXPO_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_TEST_URL }}
  EXPO_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_TEST_ANON_KEY }}
  SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_TEST_SERVICE_KEY }}
```

**GitHub Secrets Configuration:**
- `SUPABASE_TEST_URL` = `https://hwzyuugggdubeejfpele.supabase.co`
- `SUPABASE_TEST_ANON_KEY` = Test instance anon key
- `SUPABASE_TEST_SERVICE_KEY` = Test instance service key

**Production Secrets (separate):**
- `SUPABASE_PROD_URL` = `https://mvvndpuwrbsrahytxtjf.supabase.co`
- `SUPABASE_PROD_ANON_KEY` = Production anon key
- `SUPABASE_PROD_SERVICE_KEY` = Production service key

---

## ✅ Verification Checklist

Before running any test or database operation:

### For Developers
- [ ] Check `.env.test` contains `hwzyuugggdubeejfpele`
- [ ] Run `npm run test:verify-db` to validate connection
- [ ] Verify terminal output shows "Steppin-Test" instance
- [ ] Never use `.env` or `.env.production` for testing

### For CI/CD
- [ ] GitHub Secrets use `SUPABASE_TEST_*` prefix
- [ ] Workflow files reference test secrets only
- [ ] No production secrets in test workflows

### For AI Assistants
- [ ] Always use project ID `hwzyuugggdubeejfpele` for testing
- [ ] Verify project name is `Steppin-Test` before operations
- [ ] Never interact with `mvvndpuwrbsrahytxtjf` for testing
- [ ] Check project list before making changes

---

## 🛡️ Safety Commands

### Verify Current Instance
```bash
cd stepin-app
npm run test:verify-db
```

**Expected Output:**
```
✅ Connected to Supabase
📊 Project: Steppin-Test
🔗 URL: https://hwzyuugggdubeejfpele.supabase.co
```

**Wrong Instance Output:**
```
❌ WRONG SUPABASE INSTANCE!
Expected test instance: hwzyuugggdubeejfpele
Current URL: https://mvvndpuwrbsrahytxtjf.supabase.co
```

### Safe Test Commands
```bash
# All these commands validate the instance first
npm run test:verify-db      # Verify connection to TEST instance
npm run test:seed-db        # Seed TEST database (safe)
npm run test:cleanup-db     # Cleanup TEST database (safe)
npm run test:e2e            # Run E2E tests against TEST instance
```

### Dangerous Commands (Production Only)
```bash
# NEVER run these against test instance
npm run db:migrate          # Production migrations
npm run db:seed-prod        # Production seeding
npm run deploy              # Production deployment
```

---

## 🚨 What to Do If You Accidentally Use Production

If you accidentally run a test command against production:

1. **STOP IMMEDIATELY** - Cancel the operation
2. **Assess Damage:**
   - Check what data was modified
   - Review database logs in Supabase dashboard
3. **Restore if Needed:**
   - Use Supabase point-in-time recovery
   - Dashboard > Database > Backups
4. **Update Safeguards:**
   - Add more validation checks
   - Update this document

---

## 📋 Quick Reference

| Aspect | Production | Test |
|--------|-----------|------|
| **Name** | Steppin | Steppin-Test |
| **Project ID** | `mvvndpuwrbsrahytxtjf` | `hwzyuugggdubeejfpele` |
| **URL** | `https://mvvndpuwrbsrahytxtjf.supabase.co` | `https://hwzyuugggdubeejfpele.supabase.co` |
| **Env File** | `.env`, `.env.production` | `.env.test` |
| **GitHub Secrets** | `SUPABASE_PROD_*` | `SUPABASE_TEST_*` |
| **Safe for Testing** | ❌ NO | ✅ YES |
| **Safe for Cleanup** | ❌ NO | ✅ YES |
| **Safe for Seeding** | ❌ NO | ✅ YES |

---

## 🔧 Implementation Details

### Database Validation Script

Location: `stepin-app/e2e/helpers/verify-database.ts`

```typescript
const EXPECTED_TEST_PROJECT_ID = 'hwzyuugggdubeejfpele';
const EXPECTED_TEST_PROJECT_NAME = 'Steppin-Test';

// Validates before ANY database operation
function validateTestInstance() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  
  if (!url?.includes(EXPECTED_TEST_PROJECT_ID)) {
    console.error('❌ WRONG SUPABASE INSTANCE!');
    console.error(`Expected: ${EXPECTED_TEST_PROJECT_ID}`);
    console.error(`Got: ${url}`);
    process.exit(1);
  }
  
  console.log('✅ Verified: Using TEST instance');
}
```

### GitHub Actions Validation

Location: `.github/workflows/e2e-tests.yml`

```yaml
- name: Validate Test Instance
  run: |
    if [[ "${{ secrets.SUPABASE_TEST_URL }}" != *"hwzyuugggdubeejfpele"* ]]; then
      echo "❌ ERROR: Wrong Supabase instance configured!"
      echo "Expected test instance ID: hwzyuugggdubeejfpele"
      exit 1
    fi
    echo "✅ Verified: Using TEST instance"
```

---

## 📚 Related Documentation

- **GitHub Secrets Setup:** `GITHUB_SECRETS_SETUP.md`
- **Supabase Test Setup:** `SUPABASE_TEST_SETUP.md`
- **E2E Infrastructure:** `E2E_INFRASTRUCTURE_COMPLETE.md`

---

## 🎯 Summary

**Always use `hwzyuugggdubeejfpele` (Steppin-Test) for:**
- ✅ E2E testing
- ✅ Development
- ✅ CI/CD pipelines
- ✅ Database seeding
- ✅ Database cleanup
- ✅ Experimentation

**Never use `mvvndpuwrbsrahytxtjf` (Steppin) for:**
- ❌ Testing
- ❌ Development
- ❌ Seeding test data
- ❌ Cleanup operations
- ❌ Experimentation

**When in doubt:** Run `npm run test:verify-db` to confirm you're using the test instance.

---

**Last Updated:** October 7, 2025  
**Maintained By:** Development Team  
**Critical:** Keep this document updated if instances change

