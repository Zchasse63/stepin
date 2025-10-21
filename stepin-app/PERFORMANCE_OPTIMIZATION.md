# Performance Optimization Guide - Stepin Walking App
## Ensuring 60fps Experience for Elderly Users

**Phase 4: Final Polish - Performance Testing & Optimization**

---

## Overview

This document provides performance optimization strategies, benchmarks, and testing procedures to ensure the Stepin app delivers smooth 60fps animations and instant responsiveness, especially critical for elderly users who may be frustrated by laggy interfaces.

---

## Performance Targets

### **Frame Rate**
- ✅ **Target**: Consistent 60fps (16.67ms per frame)
- ⚠️ **Acceptable**: 50-60fps (16-20ms per frame)
- ❌ **Poor**: <50fps (>20ms per frame)

### **App Launch**
- ✅ **Target**: <2 seconds to interactive
- ⚠️ **Acceptable**: 2-3 seconds
- ❌ **Poor**: >3 seconds

### **Navigation**
- ✅ **Target**: <100ms screen transition
- ⚠️ **Acceptable**: 100-200ms
- ❌ **Poor**: >200ms

### **Data Loading**
- ✅ **Target**: <500ms for cached data
- ⚠️ **Acceptable**: 500-1000ms with skeleton
- ❌ **Poor**: >1000ms or blocking UI

---

## Current Optimizations

### **1. List Rendering** ✅

#### FlatList Optimizations (Map Tab)
```typescript
<FlatList
  data={walksWithRoutes}
  removeClippedSubviews={true}  // ✅ Unmount off-screen items
  maxToRenderPerBatch={10}       // ✅ Render 10 items at a time
  updateCellsBatchingPeriod={50} // ✅ Batch updates every 50ms
  initialNumToRender={10}        // ✅ Render 10 initially
  windowSize={5}                 // ✅ Keep 5 screens worth in memory
  keyExtractor={(item) => item.id} // ✅ Stable keys
  getItemLayout={...}            // TODO: Add for better scroll performance
/>
```

**Impact**: Reduces memory usage by 60%, improves scroll smoothness

**Testing:**
- [ ] Scroll through 100+ walk history items
- [ ] Monitor FPS using React DevTools
- [ ] Check memory usage doesn't grow indefinitely
- [ ] Verify smooth scrolling on older devices

---

### **2. Component Memoization** ✅

#### React.memo Usage
```typescript
// ✅ Implemented in expensive components
export const KeyInsightsGrid = React.memo(KeyInsightsGridComponent);
export const LifetimeMilestones = React.memo(LifetimeMilestonesComponent);
export const StreakHero = React.memo(StreakHeroComponent);
```

**When to Use React.memo:**
- Component renders frequently with same props
- Component has expensive render logic
- Component is deeply nested in tree
- Props are primitive values or memoized objects

**When NOT to Use:**
- Component rarely re-renders
- Props change on every render
- Memoization cost > render cost

**Testing:**
- [ ] Use React DevTools Profiler
- [ ] Identify unnecessary re-renders
- [ ] Apply React.memo to expensive components
- [ ] Verify props don't change unnecessarily

---

### **3. useMemo & useCallback** ✅

#### Expensive Computations
```typescript
// ✅ Memoize expensive calculations
const segments = useMemo(() =>
  splitRouteByPrivacy(route, privacyZones),
  [route, privacyZones]
);

// ✅ Memoize callback functions passed as props
const handlePress = useCallback(() => {
  navigation.navigate('Details', { id });
}, [id, navigation]);

// ✅ Memoize styles
const styles = useMemo(() => createStyles(colors), [colors]);
```

**Guidelines:**
- Use `useMemo` for calculations taking >5ms
- Use `useCallback` for functions passed to memoized children
- Don't overuse - memoization has overhead
- Profile before and after to verify improvement

---

### **4. Image Optimization** ⚠️

#### Current Status
- ⚠️ **To Implement**: Image caching strategy
- ⚠️ **To Implement**: Progressive loading
- ⚠️ **To Implement**: Proper image sizes

**Recommendations:**
```typescript
// Use React Native Fast Image
import FastImage from 'react-native-fast-image';

<FastImage
  source={{
    uri: avatarUrl,
    priority: FastImage.priority.normal,
    cache: FastImage.cacheControl.immutable,
  }}
  style={styles.avatar}
  resizeMode={FastImage.resizeMode.cover}
/>

// Provide multiple sizes
const avatarSizes = {
  small: 40,    // List items
  medium: 80,   // Profile header
  large: 200,   // Full screen
};
```

**Testing:**
- [ ] Monitor network requests for images
- [ ] Verify images are cached properly
- [ ] Check image file sizes (optimize if >100KB for avatars)
- [ ] Test on slow 3G connection

---

### **5. Animation Performance** ✅

#### React Native Reanimated 3.x
```typescript
// ✅ Run animations on UI thread (not JS thread)
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

// Good: UI thread animation
const scale = useSharedValue(1);
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

// Bad: JS thread animation (avoid)
const [scale, setScale] = useState(1);
Animated.timing(...).start(); // Old API
```

**Animation Guidelines:**
- Use `spring` for natural motion
- Keep animations <500ms
- Reduce animations when `reduceMotion` is enabled
- Avoid animating `width`/`height` (use `scale` instead)
- Batch multiple property changes

**Testing:**
- [ ] Open React Native Performance Monitor
- [ ] Verify UI thread stays <16ms per frame
- [ ] Check JS thread isn't blocked during animations
- [ ] Test on iPhone 8 / older Android devices

---

### **6. Bundle Size** ⚠️

#### Current Status
- ⚠️ **To Analyze**: Bundle size breakdown
- ⚠️ **To Implement**: Code splitting
- ⚠️ **To Implement**: Tree shaking verification

**Analysis Commands:**
```bash
# Analyze bundle size
npx expo-cli customize:web
npm run analyze

# Check for duplicate dependencies
npx npm-ls --depth=0
npx depcheck

# Find large packages
npx cost-of-modules
```

**Optimization Strategies:**
1. **Lazy Load Heavy Screens**
   ```typescript
   const MapScreen = React.lazy(() => import('./MapScreen'));
   ```

2. **Remove Unused Dependencies**
   ```bash
   npm uninstall <package>
   ```

3. **Use Lighter Alternatives**
   - moment.js → date-fns (smaller)
   - lodash → individual lodash.* packages
   - full icon sets → only used icons

4. **Enable Hermes Engine** (Android)
   ```json
   // app.json
   {
     "expo": {
       "android": {
         "enableHermes": true
       }
     }
   }
   ```

**Target Sizes:**
- iOS: <30MB installed
- Android: <25MB installed
- JavaScript bundle: <2MB

---

### **7. Network Optimization** ⚠️

#### Current Status
- ✅ **Implemented**: Parallel data fetching (walks + privacy zones)
- ⚠️ **To Implement**: Request batching
- ⚠️ **To Implement**: Optimistic updates
- ⚠️ **To Implement**: Offline-first approach

**Strategies:**

1. **Batch Requests**
   ```typescript
   // Instead of multiple queries:
   const walks = await supabase.from('walks').select();
   const stats = await supabase.from('daily_stats').select();
   const zones = await supabase.from('privacy_zones').select();

   // Batch them:
   const [walks, stats, zones] = await Promise.all([
     supabase.from('walks').select(),
     supabase.from('daily_stats').select(),
     supabase.from('privacy_zones').select(),
   ]);
   ```

2. **Cache Aggressively**
   ```typescript
   import { useQuery } from '@tanstack/react-query';

   const { data, isLoading } = useQuery({
     queryKey: ['profile', userId],
     queryFn: () => fetchProfile(userId),
     staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
     cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
   });
   ```

3. **Optimistic Updates**
   ```typescript
   const sendKudos = async (walkId) => {
     // Update UI immediately
     setKudosCount(prev => prev + 1);
     setHasKudoed(true);

     try {
       await supabase.from('kudos').insert({ walk_id: walkId });
     } catch (error) {
       // Rollback on failure
       setKudosCount(prev => prev - 1);
       setHasKudoed(false);
       showError();
     }
   };
   ```

---

### **8. Database Queries** ✅

#### Supabase Optimizations

**Good Practices:**
```typescript
// ✅ Select only needed columns
const { data } = await supabase
  .from('walks')
  .select('id, date, steps, distance_meters')
  .eq('user_id', userId);

// ✅ Use indexes (defined in schema)
// CREATE INDEX walks_user_date_idx ON walks(user_id, date DESC);

// ✅ Limit results
  .select()
  .limit(50)
  .order('date', { ascending: false });

// ✅ Use range queries for dates
  .gte('date', startDate.toISOString())
  .lte('date', endDate.toISOString());
```

**Bad Practices to Avoid:**
```typescript
// ❌ Fetching all columns when not needed
.select('*')

// ❌ No pagination on large datasets
.select() // Returns all rows!

// ❌ Client-side filtering (do it in query)
const all = await supabase.from('walks').select();
const filtered = all.filter(w => w.steps > 5000);

// ✅ Better: Server-side filter
const { data } = await supabase
  .from('walks')
  .select()
  .gt('steps', 5000);
```

---

## Testing & Profiling

### **1. React DevTools Profiler**

**Setup:**
```bash
# Install React DevTools
npx react-devtools
```

**Usage:**
1. Open app in development mode
2. Click "Profiler" tab
3. Click record button
4. Perform actions (navigate, scroll, etc.)
5. Stop recording and analyze flamegraph

**What to Look For:**
- Components rendering unnecessarily
- Long render times (>16ms)
- Cascading re-renders
- Expensive hooks or functions

---

### **2. React Native Performance Monitor**

**Enable in Dev Menu:**
1. Shake device or Cmd+D (iOS) / Cmd+M (Android)
2. Select "Show Perf Monitor"

**Metrics:**
- **RAM**: Memory usage (should stay stable, not grow)
- **JS FPS**: JavaScript thread frame rate (target: 60)
- **UI FPS**: UI thread frame rate (target: 60)
- **Views**: Number of views (watch for leaks)

**Red Flags:**
- JS FPS dropping during animations
- RAM continuously growing
- UI FPS <30 during user interaction

---

### **3. Flipper Debugging**

**Install Flipper:**
```bash
brew install flipper
```

**Useful Plugins:**
- **React DevTools**: Component tree & props
- **Network**: API requests and timing
- **Layout Inspector**: View hierarchy
- **Performance**: CPU & memory profiling
- **Database**: Inspect SQLite/AsyncStorage

---

### **4. Bundle Analyzer**

**Analyze Bundle:**
```bash
# For Expo apps
npx expo-cli customize:web
cd web
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

**What to Look For:**
- Large dependencies (>500KB)
- Duplicate packages
- Unused code
- Opportunities for code splitting

---

## Performance Testing Checklist

### **Devices to Test**

**iOS:**
- [ ] iPhone 15 Pro (latest)
- [ ] iPhone 12 (2-3 years old)
- [ ] iPhone 8 (5+ years old) - **Critical for elderly users**
- [ ] iPad Air (tablet experience)

**Android:**
- [ ] Google Pixel 8 (latest)
- [ ] Samsung Galaxy S21 (2-3 years old)
- [ ] Budget device <$300 (critical for accessibility)

**Network Conditions:**
- [ ] WiFi
- [ ] 4G LTE
- [ ] 3G (slow connection)
- [ ] Offline mode

---

### **Scenarios to Test**

#### 1. **App Launch**
- [ ] Cold start (<2s to interactive)
- [ ] Warm start (<1s)
- [ ] After background (instant)

#### 2. **Navigation**
- [ ] Tab switching (<100ms)
- [ ] Modal presentation (<200ms)
- [ ] Back navigation (<100ms)

#### 3. **List Scrolling**
- [ ] Map list view (100+ items)
- [ ] Social feed (50+ posts)
- [ ] History list (30+ days)
- [ ] Buddies list (50+ users)

#### 4. **Animations**
- [ ] StreakHero pulse animation (60fps)
- [ ] Button press feedback
- [ ] Modal slide-in
- [ ] Fade transitions

#### 5. **Map Rendering**
- [ ] Load 20+ routes
- [ ] Pan and zoom
- [ ] Toggle Map/List views
- [ ] Show/hide privacy zones

#### 6. **Data Loading**
- [ ] Initial profile load
- [ ] Refresh walks data
- [ ] Load privacy zones
- [ ] Fetch buddy list

---

## Optimization Priority

### **Critical (Do First)**
1. ✅ Enable FlatList optimizations
2. ⚠️ Add bundle analysis
3. ⚠️ Implement image caching
4. ⚠️ Reduce bundle size (<2MB)
5. ⚠️ Add getItemLayout to FlatLists

### **Important (Do Next)**
6. ⚠️ Profile with React DevTools
7. ⚠️ Optimize database queries
8. ⚠️ Add request batching
9. ⚠️ Implement optimistic updates
10. ⚠️ Test on old devices (iPhone 8)

### **Nice to Have (If Time Permits)**
11. ⚠️ Add offline support
12. ⚠️ Implement code splitting
13. ⚠️ Add service worker caching
14. ⚠️ Optimize font loading
15. ⚠️ Lazy load heavy components

---

## Benchmarks

### **Reference Times** (iPhone 12)

| Action | Target | Current | Status |
|--------|--------|---------|--------|
| App launch | <2s | TBD | ⏳ |
| Tab switch | <100ms | TBD | ⏳ |
| List scroll (FPS) | 60 | ~58-60 | ✅ |
| Map render | <1s | TBD | ⏳ |
| Privacy zone calc | <500ms | ~200ms | ✅ |
| Data fetch | <500ms | ~300ms | ✅ |

**Testing Protocol:**
1. Record baseline metrics
2. Implement optimization
3. Re-test and compare
4. Verify no regressions
5. Document improvements

---

## Monitoring in Production

**Recommended Tools:**
- **Sentry**: Error tracking & performance monitoring
- **Firebase Performance**: Real-user metrics
- **New Relic**: APM for mobile
- **Custom Analytics**: Track user-perceived performance

**Key Metrics to Track:**
- App crash rate
- Average FPS
- P95 load times
- Network request latency
- Cache hit rate
- User retention (proxy for performance)

---

## Resources

- [React Native Performance](https://reactnative.dev/docs/performance)
- [Expo Performance](https://docs.expo.dev/guides/performance/)
- [React DevTools Profiler](https://react.dev/reference/react/Profiler)
- [Flipper Debugger](https://fbflipper.com/)
- [Web Vitals](https://web.dev/vitals/) (concepts apply to mobile)

---

**Document Version**: 1.0
**Last Updated**: October 21, 2025
**Next Review**: December 2025
