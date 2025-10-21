# Privacy Features Implementation - Phase 3

## Overview

This document describes the privacy features implemented in Phase 3 of the Stepin app UX/UI improvements. These features give users fine-grained control over their location data and activity visibility.

## Features Implemented

### 1. Privacy Zones

**Purpose**: Allow users to hide GPS tracking in specific geographic areas (home, work, school, etc.)

**Components**:
- `components/PrivacyZones.tsx` - Main privacy zones management component
- `app/privacy-zones.tsx` - Privacy zones settings screen

**Database**:
- `privacy_zones` table with the following schema:
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key to profiles)
  - `name` (text) - User-friendly name (e.g., "Home", "Work")
  - `address` (text) - Human-readable address
  - `latitude` (numeric) - Zone center latitude
  - `longitude` (numeric) - Zone center longitude
  - `radius_meters` (integer) - Privacy radius (100m, 250m, 500m, or 1km)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

**Features**:
- Add/edit/delete privacy zones
- Address input with autocomplete suggestions (mock implementation - integrate Google Places API in production)
- Radius selector with 4 preset options (100m, 250m, 500m, 1km)
- Automatic retroactive application to existing walks
- Visual representation planned for map display (grey dashed lines)

**How It Works**:
1. User adds a privacy zone with address and radius
2. System geocodes address to get lat/lng coordinates
3. For all walks (existing and future), route points within the zone radius are marked as `private: true`
4. Map display shows grey dashed lines for private sections (to be implemented in map component)

**Access**:
- Profile tab → Privacy & Safety → Privacy Zones

### 2. Activity Visibility Controls

**Purpose**: Control who can see user activities (walks, routes, feed posts)

**Components**:
- `components/ActivityVisibilityModal.tsx` - Activity visibility selection modal

**Database**:
- Added `activity_visibility` column to `profiles` table:
  - Values: `'private'`, `'buddies'`, `'public'`
  - Default: `'buddies'`
- Added `visibility` column to `walks` table:
  - Values: `'inherit'`, `'private'`, `'buddies'`, `'public'`
  - Default: `'inherit'` (uses profile setting)

**Visibility Levels**:
1. **Private**: Only the user can see their activities
2. **Buddies Only**: Only accepted buddies can see activities (recommended)
3. **Public**: Anyone can see activities

**Features**:
- Modal with clear visual options for each visibility level
- Icon-coded visibility levels (lock, users, globe)
- Recommendation banner for "Buddies Only" setting
- Real-time updates across all activities

**Row Level Security (RLS) Policies**:
- Users can always view their own walks
- Public walks are visible to everyone
- Buddies-only walks are visible only to accepted buddies
- Private walks are visible only to the owner
- Helper function `can_view_walk(walk_id, viewer_id)` for programmatic checks

**Access**:
- Profile tab → Privacy & Safety → Activity Visibility

## Database Migrations

### Migration Files Created:

1. **`003_add_visibility_settings.sql`**
   - Adds `activity_visibility` to profiles table
   - Adds `visibility` to walks table
   - Sets default values for existing data

2. **`004_visibility_rls_policies.sql`**
   - Updates RLS policies to enforce visibility rules
   - Creates helper function for visibility checks
   - Ensures data privacy through database-level security

### Applying Migrations:

To apply these migrations to your Supabase instance:

1. Open Supabase SQL Editor
2. Copy contents of `database/migrations/003_add_visibility_settings.sql`
3. Execute the migration
4. Copy contents of `database/migrations/004_visibility_rls_policies.sql`
5. Execute the migration

**Note**: The main `database/database-schema.sql` file has been updated to include these changes for new installations.

## Type System Updates

**File**: `types/profile.ts`

Added:
- `ActivityVisibility` type: `'private' | 'buddies' | 'public'`
- `activity_visibility` field to `UserProfile` interface
- `activity_visibility` field to `ProfileUpdateData` interface

## Implementation Details

### Privacy Zone GPS Filtering

**Algorithm** (in `app/privacy-zones.tsx`):

```typescript
// Haversine formula for distance calculation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

// Apply to route points
const filteredRoute = route.coordinates.map((point) => {
  const distance = calculateDistance(
    point.latitude,
    point.longitude,
    zone.latitude,
    zone.longitude
  );

  if (distance <= zone.radius_meters) {
    return { ...point, private: true };
  }
  return point;
});
```

### Retroactive Application

When a user adds or edits a privacy zone:
1. Fetch all walks for the user
2. For each walk, filter route points within the zone
3. Mark points within radius as `private: true`
4. Update walk records in database

When a zone is deleted:
1. Fetch all walks for the user
2. Remove `private` flag from all route points
3. Update walk records in database

### Activity Visibility Enforcement

**Client-Side**:
- Modal enforces selection before saving
- Profile screen displays current visibility setting
- Default to "Buddies Only" for new users

**Server-Side (RLS Policies)**:
- Database-level enforcement through Row Level Security
- Policies automatically filter queries based on:
  - Ownership (users always see their own data)
  - Visibility setting (private/buddies/public)
  - Buddy relationship (for buddies-only content)

## User Experience

### Privacy Zones UX Flow

1. User taps "Privacy Zones" in Profile → Privacy & Safety
2. Empty state shows shield icon with explanatory text
3. User taps "Add Privacy Zone" button
4. Modal appears with form:
   - Name input (e.g., "Home")
   - Address input with autocomplete
   - Radius selector (4 options)
   - Info box explaining grey dashed lines
5. User fills form and taps "Save"
6. Zone is created and applied retroactively
7. Success alert confirms creation
8. Zone appears in list with edit/delete actions

### Activity Visibility UX Flow

1. User taps "Activity Visibility" in Profile → Privacy & Safety
2. Modal appears showing current setting
3. Three options displayed with:
   - Icon and color coding
   - Clear labels and descriptions
   - Visual selection state
4. Recommendation box suggests "Buddies Only"
5. User selects preferred option
6. Taps "Save" to confirm
7. Success alert confirms change
8. Setting updates across all activities

## Accessibility

**Privacy Zones**:
- All interactive elements meet 48px minimum touch target
- Clear visual hierarchy with icons
- VoiceOver support for screen readers
- High contrast colors for visibility

**Activity Visibility Modal**:
- 60px touch targets for option selection
- Icon and text labels for clarity
- Color-coded options (red=private, blue=buddies, green=public)
- Accessibility labels for all interactive elements

## Performance Considerations

**Privacy Zones**:
- Haversine calculation is O(1) per point
- Batch updates for retroactive application
- Efficient indexing on `privacy_zones.user_id`

**Activity Visibility**:
- Database-level filtering through RLS (no client-side filtering needed)
- Indexed buddy relationships for fast lookups
- Helper function uses prepared statements for performance

## Security

**Privacy Zones**:
- RLS policies prevent users from viewing/editing others' zones
- Cascade delete when user account is deleted
- Validation checks on radius values (must be 100, 250, 500, or 1000)

**Activity Visibility**:
- RLS policies enforce visibility at database level
- Cannot be bypassed by client-side code
- Buddy relationship verification before granting access
- SQL injection protection through parameterized queries

## Future Enhancements

### Phase 4 Polish Tasks

1. **Map Visualization**:
   - Display grey dashed lines for private route sections
   - Show privacy zone boundaries on map
   - Visual indicators for protected areas

2. **Testing**:
   - Unit tests for distance calculation
   - Integration tests for RLS policies
   - E2E tests for privacy zone creation flow
   - Accessibility testing with screen readers

3. **Geocoding Integration**:
   - Integrate Google Places API for address autocomplete
   - Reverse geocoding for zone addresses
   - Place name suggestions

4. **Enhanced Features**:
   - Multiple privacy zones per user (already supported in DB)
   - Time-based privacy (hide during work hours)
   - Privacy zone sharing (e.g., family zones)
   - Import/export privacy zones

## Files Changed

### New Files Created:
- `components/PrivacyZones.tsx` (384 lines)
- `components/ActivityVisibilityModal.tsx` (285 lines)
- `app/privacy-zones.tsx` (282 lines)
- `database/migrations/003_add_visibility_settings.sql` (73 lines)
- `database/migrations/004_visibility_rls_policies.sql` (212 lines)

### Files Modified:
- `app/(tabs)/profile.tsx` - Added visibility modal integration
- `database/database-schema.sql` - Added privacy_zones table and visibility columns
- `types/profile.ts` - Added ActivityVisibility type and fields

**Total Lines Added**: ~1,236 lines of production code + documentation

## Testing Checklist

- [ ] Privacy zone creation flow
- [ ] Privacy zone editing flow
- [ ] Privacy zone deletion flow
- [ ] Retroactive application to existing walks
- [ ] Activity visibility modal display
- [ ] Activity visibility saving
- [ ] RLS policies for private visibility
- [ ] RLS policies for buddies-only visibility
- [ ] RLS policies for public visibility
- [ ] Map display with privacy zones (pending)
- [ ] Accessibility with VoiceOver
- [ ] Performance with 100+ route points
- [ ] Database migration execution

## Usage Instructions

### For Users:

**Setting Up Privacy Zones**:
1. Open Profile tab
2. Tap "Privacy Zones" under Privacy & Safety
3. Tap "Add Privacy Zone"
4. Enter a name (e.g., "Home")
5. Enter your address
6. Select a privacy radius
7. Tap "Save"

**Changing Activity Visibility**:
1. Open Profile tab
2. Tap "Activity Visibility" under Privacy & Safety
3. Select your preferred visibility level
4. Tap "Save"

### For Developers:

**Checking Visibility Programmatically**:
```typescript
import { supabase } from '../lib/supabase';

// Check if a user can view a specific walk
const { data, error } = await supabase
  .rpc('can_view_walk', {
    walk_id: 'walk-uuid',
    viewer_id: 'viewer-uuid'
  });

console.log('Can view:', data); // true or false
```

**Querying Walks with Visibility**:
```typescript
// This query automatically respects RLS policies
const { data: walks } = await supabase
  .from('walks')
  .select('*')
  .eq('user_id', 'some-user-id');

// Only returns walks the current user is allowed to see
```

## Support

For questions or issues:
- Check inline code comments for implementation details
- Review RLS policies in migration files
- Test with different user roles (owner, buddy, stranger)
- Verify buddy relationships are "accepted" status

## Credits

Phase 3: Privacy Features
Implemented as part of UX/UI Polish initiative
Focus: Elderly-friendly privacy controls with clear, simple interfaces
