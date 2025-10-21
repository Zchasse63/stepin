# Network Resilience Architecture

## Problem Statement

The Stepin app experienced recurring network connectivity issues when returning to development after 1-2 hours of downtime. This manifested as:

- `TypeError: Network request failed` errors
- `AuthRetryableFetchError: Network request failed` during authentication
- Inability to reach Supabase API despite valid configuration

**Root Cause:** iOS Simulator network stack enters a stale state after idle periods, causing all network requests to fail until the stack is "woken up."

## Solution Architecture

We implemented a **multi-layer network resilience system** that automatically detects and recovers from network issues:

### Layer 1: Custom Fetch with Retry Logic

**File:** `lib/supabase/client.ts`

```typescript
const createResilientFetch = () => {
  return async (url, options) => {
    // 30-second timeout
    // Automatic retry with exponential backoff (3 attempts)
    // Detects network errors and retries automatically
  };
};
```

**Features:**
- 30-second timeout per request
- 3 automatic retries with exponential backoff (1s, 2s, 4s)
- Detects `TypeError` and network-related errors
- Integrated directly into Supabase client

### Layer 2: Network Health Monitoring

**File:** `lib/utils/networkHealth.ts`

**Functions:**
- `checkNetworkHealth()` - Lightweight HEAD request to test connectivity
- `attemptNetworkRecovery()` - Multi-strategy recovery process
- `withNetworkRecovery()` - Wrapper for critical operations
- `isNetworkError()` - Error type detection

**Recovery Strategies:**
1. **Rapid Fire:** 3 quick requests to wake up network stack
2. **Delayed Retry:** Wait 2 seconds and retry (for slow initialization)

### Layer 3: Startup Health Checks

**File:** `lib/utils/appStartup.ts`

Proactively checks network health on app startup:
- Runs before authentication check
- Attempts recovery if network is unhealthy
- Logs detailed diagnostics

**Integration:** `app/_layout.tsx`
```typescript
useEffect(() => {
  const initAuth = async () => {
    await performStartupHealthChecks(); // ← Runs first
    await checkSession();
    setIsReady(true);
  };
  initAuth();
}, []);
```

### Layer 4: Auth Store Integration

**File:** `lib/store/authStore.ts`

Critical auth operations wrapped with network recovery:
- `signIn()` - 2 retries with 1.5s delay
- `checkSession()` - 2 retries with 1s delay

```typescript
const { data, error } = await withNetworkRecovery(
  () => supabase.auth.signInWithPassword({ email, password }),
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  { maxRetries: 2, retryDelay: 1500 }
);
```

## How It Works

### Normal Flow (Network Healthy)
```
App Start → Health Check (passes) → Auth Check → App Ready
           ↓
        50-200ms
```

### Recovery Flow (Network Stale)
```
App Start → Health Check (fails) → Recovery Attempt → Success → Auth Check → App Ready
           ↓                       ↓                   ↓
        Network Error          3 rapid requests    Network restored
                              + 2s delayed retry
                              ↓
                           2-5 seconds total
```

### Auth Flow with Retry
```
Sign In → Network Error → Retry 1 (1.5s delay) → Network Error → Retry 2 (1.5s delay) → Success
        ↓                                        ↓
    Attempt recovery                        Attempt recovery
```

## Configuration

### Timeouts
- **Fetch timeout:** 30 seconds (per request)
- **Health check timeout:** 5 seconds
- **Session check timeout:** Removed (now uses retry logic)

### Retry Settings
- **Fetch retries:** 3 attempts (exponential backoff: 1s, 2s, 4s max)
- **Auth retries:** 2 attempts (1.5s delay)
- **Session check retries:** 2 attempts (1s delay)

### Recovery Delays
- **Rapid fire:** Immediate (3 parallel requests)
- **Delayed retry:** 2 seconds
- **Between auth retries:** 1.5 seconds

## Benefits

1. **Automatic Recovery:** No manual intervention needed after idle periods
2. **Fast When Healthy:** Minimal overhead when network is working (50-200ms)
3. **Resilient When Unhealthy:** Recovers within 2-5 seconds
4. **Detailed Logging:** Easy to diagnose issues in development
5. **Production Ready:** Works on physical devices without overhead

## Testing

### Verify Network Resilience

1. **Idle Test:**
   ```bash
   # Start app, wait 2 hours, try to sign in
   # Should recover automatically
   ```

2. **Cold Start Test:**
   ```bash
   # Kill simulator, restart, launch app
   # Should perform health check and recover if needed
   ```

3. **Manual Recovery Test:**
   ```bash
   # Disable WiFi, enable WiFi, try to sign in
   # Should retry and succeed
   ```

### Monitoring Logs

Look for these log messages:

**Healthy Network:**
```
✅ Network health check passed { latencyMs: 150 }
```

**Recovery in Progress:**
```
⚠️ Network health check failed, attempting recovery...
Recovery check 1/3 { isHealthy: false }
Recovery check 2/3 { isHealthy: true }
✅ Network recovery successful
```

**Auth Retry:**
```
Network request failed, retrying in 1000ms (attempt 1/3)
Network request failed, retrying in 2000ms (attempt 2/3)
```

## Troubleshooting

### Issue: Still getting network errors

**Check:**
1. Environment variables loaded? (Look for `env: export EXPO_PUBLIC_SUPABASE_URL` in startup logs)
2. Supabase accessible from Mac? (`curl -I https://hwzyuugggdubeejfpele.supabase.co`)
3. Simulator has internet? (Open Safari, visit google.com)

**Solution:**
- Restart simulator completely
- Clear Metro cache: `npm start -- --clear`
- Check firewall/VPN settings

### Issue: Slow startup

**Expected:** 2-5 seconds on first launch after idle (recovery time)
**Unexpected:** >10 seconds

**Solution:**
- Check network latency
- Verify Supabase region (should be us-east-1 for test instance)
- Check for other network-heavy operations on startup

## Future Enhancements

1. **NetInfo Integration:** Use `@react-native-community/netinfo` for real-time network monitoring
2. **Offline Queue:** Queue requests when offline, retry when online
3. **Circuit Breaker:** Temporarily disable features if network consistently fails
4. **Metrics:** Track recovery success rate and latency

## Related Files

- `lib/supabase/client.ts` - Supabase client with resilient fetch
- `lib/utils/networkHealth.ts` - Network health utilities
- `lib/utils/appStartup.ts` - Startup health checks
- `lib/store/authStore.ts` - Auth with network recovery
- `app/_layout.tsx` - App initialization with health checks

## References

- [iOS Simulator Network Issues](https://developer.apple.com/forums/thread/684312)
- [Supabase Client Options](https://supabase.com/docs/reference/javascript/initializing)
- [React Native Network Debugging](https://reactnative.dev/docs/network)

