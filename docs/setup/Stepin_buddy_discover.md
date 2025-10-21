Stepin Buddy Discovery & Connection System
Overview
This document defines the complete buddy discovery and connection system for Stepin, designed to be privacy-first, non-competitive, and elderly-friendly.

Discovery Methods (Priority Order)
1. QR Code Connection (PRIMARY - Most Accessible)
User Flow:

User taps profile picture → "Show My QR Code"
Screen displays large QR code with name below
Friend opens app → taps "Scan QR Code" (camera icon in buddy screen)
Points camera at QR code
Preview shows friend's name → "Send Request"
Request sent instantly

Why This is Primary:

✅ Perfect for elderly users (visual, no typing)
✅ Works for walking groups meeting in person
✅ Physical proximity = implicit trust
✅ No privacy concerns (explicit consent)
✅ Works offline (scan saved, sends when connected)

Technical Implementation:
typescript// lib/qr/qrCodeManager.ts
import QRCode from 'react-native-qrcode-svg';
import { Linking } from 'react-native';

export function generateBuddyQRCode(userId: string): string {
  // Deep link format: stepin://buddy/add/{userId}
  return `stepin://buddy/add/${userId}`;
}

export async function handleBuddyDeepLink(url: string) {
  // Extract userId from URL
  const match = url.match(/stepin:\/\/buddy\/add\/(.+)/);
  if (!match) return;
  
  const buddyId = match[1];
  
  // Navigate to buddy preview screen
  router.push({
    pathname: '/modals/buddy-preview',
    params: { buddyId }
  });
}

// components/QRCodeDisplay.tsx
import QRCode from 'react-native-qrcode-svg';

export function QRCodeDisplay({ userId, userName }: Props) {
  const qrValue = generateBuddyQRCode(userId);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan to Connect</Text>
      <QRCode
        value={qrValue}
        size={250}
        backgroundColor="white"
        color="#4CAF50"
        logo={require('@/assets/icon-small.png')}
        logoSize={50}
      />
      <Text style={styles.name}>{userName}</Text>
      <Text style={styles.subtitle}>Have a friend scan this code</Text>
    </View>
  );
}

// components/QRScanner.tsx
import { CameraView, useCameraPermissions } from 'expo-camera';

export function QRScanner({ onScan }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  
  if (!permission?.granted) {
    return (
      <View>
        <Text>Camera access needed to scan QR codes</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }
  
  return (
    <CameraView
      style={styles.camera}
      onBarcodeScanned={({ data }) => {
        if (data.startsWith('stepin://buddy/add/')) {
          handleBuddyDeepLink(data);
          onScan();
        }
      }}
      barcodeScannerSettings={{
        barcodeTypes: ['qr'],
      }}
    />
  );
}
Database Changes:
sql-- No database changes needed for QR codes
-- Uses existing buddies table

2. Direct Search by Username/Email (ESSENTIAL)
User Flow:

User taps "Add Buddy" → "Search by Name"
Types username or email in search box
Results appear as user types (3+ characters)
Taps result → sees preview (name, avatar, stats)
Taps "Send Request"

Why This Matters:

✅ Works remotely (family in different cities)
✅ Precise, intentional connections
✅ No accidental discovery
✅ Respects privacy (no browsing users)

Technical Implementation:
typescript// Database changes needed
-- Add username field (must be unique)
ALTER TABLE public.profiles 
ADD COLUMN username text UNIQUE,
ADD COLUMN username_lowercase text;

-- Create index for fast searching
CREATE INDEX idx_profiles_username_search 
ON public.profiles (username_lowercase);

-- Function to generate lowercase username automatically
CREATE OR REPLACE FUNCTION update_username_lowercase()
RETURNS TRIGGER AS $$
BEGIN
  NEW.username_lowercase := LOWER(NEW.username);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_username_lowercase
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_username_lowercase();

-- Update existing users to have usernames
UPDATE public.profiles 
SET username = LOWER(REPLACE(display_name, ' ', '')) || FLOOR(RANDOM() * 1000)
WHERE username IS NULL;

// lib/services/buddySearchService.ts
import { supabase } from '@/lib/supabase/client';

export async function searchBuddies(searchTerm: string) {
  if (searchTerm.length < 3) return [];
  
  const term = searchTerm.toLowerCase();
  
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, avatar_url')
    .or(`username_lowercase.ilike.%${term}%,email.ilike.%${term}%`)
    .limit(10);
  
  if (error) {
    console.error('Search error:', error);
    return [];
  }
  
  return data;
}

// components/BuddySearch.tsx
import { useState, useEffect } from 'react';
import { searchBuddies } from '@/lib/services/buddySearchService';
import { debounce } from 'lodash';

export function BuddySearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedSearch = debounce(async (term: string) => {
    if (term.length < 3) {
      setResults([]);
      return;
    }
    
    setLoading(true);
    const data = await searchBuddies(term);
    setResults(data);
    setLoading(false);
  }, 300);
  
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm]);
  
  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search by username or email"
        value={searchTerm}
        onChangeText={setSearchTerm}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      
      {loading && <ActivityIndicator />}
      
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BuddySearchResult
            buddy={item}
            onPress={() => {
              router.push({
                pathname: '/modals/buddy-preview',
                params: { buddyId: item.id }
              });
            }}
          />
        )}
        ListEmptyComponent={
          searchTerm.length >= 3 && !loading ? (
            <Text style={styles.emptyText}>No users found</Text>
          ) : null
        }
      />
    </View>
  );
}

3. Shareable Invite Links (For Non-Users)
User Flow:

User taps "Invite Friend" → chooses method (SMS, Email, WhatsApp, Copy Link)
App generates unique invite link with user's ID
Message pre-filled: "Join me on Stepin! [link]"
Friend clicks link → downloads app → signs up
After signup, automatically shows "Connect with [User]?" prompt
Taps "Yes" → request sent automatically

Why This Matters:

✅ Brings new users to the app
✅ Elderly users can invite family easily
✅ Works with any messaging app
✅ Pre-establishes connection intent

Technical Implementation:
typescript// Database changes needed
CREATE TABLE public.invite_links (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  inviter_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  invite_code text UNIQUE NOT NULL,
  expires_at timestamp with time zone,
  used_by_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  used_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_invite_links_code ON public.invite_links (invite_code);
CREATE INDEX idx_invite_links_inviter ON public.invite_links (inviter_id);

-- Generate random invite code function
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
BEGIN
  RETURN LOWER(
    SUBSTRING(MD5(RANDOM()::text || CLOCK_TIMESTAMP()::text) FROM 1 FOR 8)
  );
END;
$$ LANGUAGE plpgsql;

// lib/services/inviteService.ts
import * as Linking from 'expo-linking';
import * as Sharing from 'expo-sharing';
import { supabase } from '@/lib/supabase/client';

export async function generateInviteLink(inviterId: string) {
  // Generate unique code
  const inviteCode = generateRandomCode(8); // or use DB function
  
  // Store in database
  const { data, error } = await supabase
    .from('invite_links')
    .insert({
      inviter_id: inviterId,
      invite_code: inviteCode,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    })
    .select()
    .single();
  
  if (error) throw error;
  
  // Create shareable link
  const url = `https://stepin.app/invite/${inviteCode}`;
  
  return { url, code: inviteCode };
}

export async function shareInviteLink(inviterId: string, userName: string) {
  const { url } = await generateInviteLink(inviterId);
  
  const message = `Hi! I'm using Stepin to track my daily walks. Join me and we can support each other! 🚶\n\n${url}`;
  
  // Check if sharing is available
  const isAvailable = await Sharing.isAvailableAsync();
  
  if (isAvailable) {
    await Sharing.shareAsync(url, {
      dialogTitle: 'Invite Friend to Stepin',
      mimeType: 'text/plain',
      UTI: 'public.url'
    });
  } else {
    // Fallback to system share sheet
    await Share.share({
      message,
      title: 'Join me on Stepin',
    });
  }
}

export async function processInviteCode(inviteCode: string, newUserId: string) {
  // Fetch invite details
  const { data: invite, error } = await supabase
    .from('invite_links')
    .select('inviter_id, used_by_id, expires_at')
    .eq('invite_code', inviteCode)
    .single();
  
  if (error || !invite) {
    throw new Error('Invalid invite code');
  }
  
  // Check if already used
  if (invite.used_by_id) {
    throw new Error('Invite already used');
  }
  
  // Check expiration
  if (new Date(invite.expires_at) < new Date()) {
    throw new Error('Invite expired');
  }
  
  // Mark as used
  await supabase
    .from('invite_links')
    .update({ used_by_id: newUserId, used_at: new Date().toISOString() })
    .eq('invite_code', inviteCode);
  
  // Auto-send buddy request
  await supabase
    .from('buddies')
    .insert({
      user_id: newUserId,
      buddy_id: invite.inviter_id,
      status: 'pending'
    });
  
  return { inviterId: invite.inviter_id };
}

// components/InviteFriend.tsx
export function InviteFriend({ userId, userName }: Props) {
  const handleInvite = async () => {
    try {
      await shareInviteLink(userId, userName);
    } catch (error) {
      Alert.alert('Error', 'Failed to share invite link');
    }
  };
  
  return (
    <TouchableOpacity style={styles.button} onPress={handleInvite}>
      <Feather name="user-plus" size={20} color="#4CAF50" />
      <Text style={styles.buttonText}>Invite Friend</Text>
    </TouchableOpacity>
  );
}
Deep Link Handling:
typescript// app/_layout.tsx
import * as Linking from 'expo-linking';

useEffect(() => {
  // Handle invite links on app open
  const handleDeepLink = async (event: { url: string }) => {
    const { path, queryParams } = Linking.parse(event.url);
    
    // Format: stepin://invite/{code} or https://stepin.app/invite/{code}
    if (path === 'invite') {
      const inviteCode = queryParams?.code || path.split('/').pop();
      
      // Check if user is logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Process invite
        const { inviterId } = await processInviteCode(inviteCode, user.id);
        
        // Show success and navigate to buddy preview
        Alert.alert('Success!', 'Buddy request sent');
        router.push({
          pathname: '/modals/buddy-preview',
          params: { buddyId: inviterId }
        });
      } else {
        // Store invite code for after signup
        await AsyncStorage.setItem('pending_invite_code', inviteCode);
        router.push('/sign-up');
      }
    }
  };
  
  // Listen for deep links
  const subscription = Linking.addEventListener('url', handleDeepLink);
  
  // Check initial URL (app opened via link)
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });
  
  return () => subscription.remove();
}, []);

// app/(auth)/sign-up.tsx - After successful signup
useEffect(() => {
  const checkPendingInvite = async () => {
    const inviteCode = await AsyncStorage.getItem('pending_invite_code');
    
    if (inviteCode && user) {
      await processInviteCode(inviteCode, user.id);
      await AsyncStorage.removeItem('pending_invite_code');
      
      Alert.alert(
        'Connected!',
        'You\'re now connected with your friend',
        [{ text: 'Great!', onPress: () => router.push('/(tabs)') }]
      );
    }
  };
  
  if (user) checkPendingInvite();
}, [user]);

4. Phone Contacts Sync (OPTIONAL - Opt-In Only)
User Flow:

User taps "Find Friends from Contacts"
Privacy prompt: "We'll check which contacts use Stepin. Your contacts stay private."
User grants permission
App uploads hashed phone numbers (not actual contacts)
Shows list of contacts on Stepin
User selects who to connect with

Privacy Considerations:

⚠️ Must be completely opt-in
⚠️ Upload hashed phone numbers only (SHA-256)
⚠️ Never store full contact list on servers
⚠️ Clear "Skip" option
⚠️ Explain data usage in plain language

Technical Implementation:
typescript// Only implement if user explicitly requests this feature
// NOT part of MVP - too complex for initial launch

import * as Contacts from 'expo-contacts';
import { sha256 } from 'js-sha256';

export async function syncContacts(userId: string) {
  // Request permission
  const { status } = await Contacts.requestPermissionsAsync();
  
  if (status !== 'granted') {
    return { matched: [], error: 'Permission denied' };
  }
  
  // Get contacts with phone numbers
  const { data } = await Contacts.getContactsAsync({
    fields: [Contacts.Fields.PhoneNumbers],
  });
  
  // Extract and hash phone numbers
  const hashedPhones = data
    .flatMap(contact => contact.phoneNumbers || [])
    .map(phone => {
      const normalized = phone.number.replace(/\D/g, ''); // Remove non-digits
      return sha256(normalized);
    });
  
  // Send hashed phones to server for matching
  const { data: matches } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, phone_hash')
    .in('phone_hash', hashedPhones)
    .neq('id', userId);
  
  return { matched: matches || [] };
}
Database Changes:
sql-- ONLY if implementing contact sync
ALTER TABLE public.profiles 
ADD COLUMN phone_hash text;

CREATE INDEX idx_profiles_phone_hash 
ON public.profiles (phone_hash);

5. Local Walking Groups (FUTURE - Post-MVP)
Concept:

Users can join local walking groups based on zip code
Groups are community-focused, not competitive
"Tampa Tuesday Walkers", "Portland Seniors Group", etc.
Groups have scheduled walks with location pins

Why This is Future:

Requires moderation system
Needs group management features
Location privacy concerns
Better suited for Phase 2+

Database Schema (Future):
sqlCREATE TABLE public.walking_groups (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  name text NOT NULL,
  description text,
  location_city text,
  location_zip text,
  member_count integer DEFAULT 0,
  created_by uuid REFERENCES public.profiles(id),
  created_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE public.group_members (
  group_id uuid REFERENCES public.walking_groups(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member', -- 'member', 'moderator', 'admin'
  joined_at timestamp with time zone DEFAULT NOW(),
  PRIMARY KEY (group_id, user_id)
);

Recommended Implementation Priority
Phase 1 (MVP - Essential):

✅ QR Code Connection (highest priority - most accessible)
✅ Direct Search by Username (essential remote connection)
✅ Shareable Invite Links (growth mechanism)
✅ Phone Contacts Sync (opt-in, privacy-first)

Phase 2 (Post-Launch):

⏳ Local Walking Groups (community building, requires moderation)

Never Implement:

❌ Public user browsing/discovery feeds
❌ "People near you" without explicit consent
❌ Performance-based matching
❌ Algorithmic "suggested friends"


UI/UX Screens Needed
1. Add Buddy Screen (app/(tabs)/buddies.tsx)
typescriptexport default function BuddiesScreen() {
  return (
    <ScrollView>
      {/* Buddy List */}
      <BuddyList />
      
      {/* Add Buddy Section */}
      <View style={styles.addSection}>
        <Text style={styles.sectionTitle}>Connect with Friends</Text>
        
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/modals/qr-scan')}
        >
          <Feather name="camera" size={24} color="white" />
          <Text style={styles.buttonText}>Scan QR Code</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/modals/buddy-search')}
        >
          <Feather name="search" size={20} color="#4CAF50" />
          <Text style={styles.buttonText}>Search by Name</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={handleInviteFriend}
        >
          <Feather name="share" size={20} color="#4CAF50" />
          <Text style={styles.buttonText}>Invite a Friend</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/modals/show-qr')}
        >
          <Feather name="grid" size={20} color="#4CAF50" />
          <Text style={styles.buttonText}>Show My QR Code</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
2. QR Code Display Modal (app/modals/show-qr.tsx)
Shows user's personal QR code for others to scan
3. QR Scanner Modal (app/modals/qr-scan.tsx)
Camera view to scan buddy QR codes
4. Buddy Search Modal (app/modals/buddy-search.tsx)
Search input with live results
5. Buddy Preview Modal (app/modals/buddy-preview.tsx)
Shows buddy profile before sending request

Complete Feature Checklist
Database

 Add username field to profiles table (unique, indexed)
 Create invite_links table
 Add username generation for existing users
 Set up RLS policies for invite links

Backend Services

 buddySearchService.ts - Search by username/email
 inviteService.ts - Generate and process invite links
 qrCodeManager.ts - Generate QR codes and handle deep links

Components

 QRCodeDisplay.tsx - Show user's QR code
 QRScanner.tsx - Camera-based QR scanner
 BuddySearch.tsx - Search input and results
 BuddySearchResult.tsx - Individual search result card
 BuddyPreview.tsx - Profile preview before request
 InviteFriend.tsx - Share invite link button

Screens/Modals

 app/modals/show-qr.tsx - Display QR code modal
 app/modals/qr-scan.tsx - QR scanner modal
 app/modals/buddy-search.tsx - Search modal
 app/modals/buddy-preview.tsx - Preview before request

Deep Linking

 Configure deep link scheme in app.json
 Handle stepin://buddy/add/{userId} for QR codes
 Handle stepin://invite/{code} for invite links
 Handle web URLs (https://stepin.app/invite/{code})

Permissions

 Camera permission (for QR scanning)
 Share/Linking capabilities
 (Optional) Contacts permission if implementing sync


Privacy & Safety Considerations
What We DO:

✅ Require explicit buddy requests (no auto-add)
✅ Default to private profiles (buddies-only visibility)
✅ Allow blocking without explanation
✅ Let users delete buddy connections anytime
✅ Hash sensitive data (phone numbers if used)
✅ Explain data usage in plain language

What We DON'T DO:

❌ Never auto-suggest buddies without consent
❌ Never share location without explicit permission
❌ Never expose email/phone to other users
❌ Never use data for advertising
❌ Never sell user data


Testing Scenarios
After implementation, test these flows:

QR Code Flow:

 User A shows QR code
 User B scans code
 Request sent successfully
 User A receives notification
 User A accepts request
 Both users now buddies


Search Flow:

 User searches for username
 Results appear correctly
 Preview shows accurate info
 Request sends successfully
 Search handles no results gracefully


Invite Flow:

 User generates invite link
 Shares via SMS/WhatsApp
 New user clicks link
 App opens to signup
 After signup, auto-connects


Edge Cases:

 Duplicate requests prevented
 Invalid QR codes handled
 Expired invite links rejected
 Offline QR scanning works




Summary: Recommended Approach
For MVP, implement these 3 methods:

QR Code Connection - Primary method (most accessible)
Username Search - Essential for remote connections
Invite Links - Growth and family connections

Design principles:

Privacy-first (no public discovery)
Explicit consent (no auto-suggestions)
Elderly-friendly (QR codes, large text)
Non-competitive (no performance matching)

This gives users multiple ways to connect while maintaining Stepin's supportive, non-competitive mission. The QR code method is particularly powerful for elderly users and in-person walking groups, while search handles remote family connections.