/**
 * Contact Sync Service
 * Privacy-first contact matching with hashed phone numbers
 * 
 * PRIVACY SAFEGUARDS:
 * - Opt-in only (never automatic)
 * - SHA-256 hashing (irreversible)
 * - No raw phone numbers stored
 * - User can disable at any time
 */

import * as Contacts from 'expo-contacts';
import { sha256 } from 'js-sha256';
import { supabase } from '@/lib/supabase/client';

export interface ContactMatch {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
}

/**
 * Normalizes a phone number by removing all non-digit characters
 * Example: "+1 (555) 123-4567" → "15551234567"
 * 
 * @param phone - The phone number to normalize
 * @returns Normalized phone number (digits only)
 */
export function normalizePhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Hashes a phone number using SHA-256
 * Phone number is normalized before hashing
 * 
 * @param phone - The phone number to hash
 * @returns SHA-256 hash of the normalized phone number
 */
export function hashPhoneNumber(phone: string): string {
  const normalized = normalizePhoneNumber(phone);
  return sha256(normalized);
}

/**
 * Requests permission to access device contacts
 * 
 * @returns Permission status: 'granted', 'denied', or 'undetermined'
 */
export async function requestContactsPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    
    if (status === 'granted') {
      return 'granted';
    } else if (status === 'denied') {
      return 'denied';
    } else {
      return 'undetermined';
    }
  } catch (error) {
    console.error('[ContactSync] Error requesting permission:', error);
    return 'denied';
  }
}

/**
 * Syncs contacts and finds matches on Stepin
 * 
 * PRIVACY NOTES:
 * - Only phone number hashes are sent to server
 * - No contact names or other data are transmitted
 * - Hashes cannot be reversed to get phone numbers
 * 
 * @param userId - The current user's ID (to exclude from results)
 * @returns Array of matched users
 */
export async function syncContacts(userId: string): Promise<ContactMatch[]> {
  try {
    // Check permission
    const { status } = await Contacts.getPermissionsAsync();
    
    if (status !== 'granted') {
      console.warn('[ContactSync] Permission not granted');
      return [];
    }
    
    // Get contacts with phone numbers
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers],
    });
    
    if (!data || data.length === 0) {
      console.log('[ContactSync] No contacts found');
      return [];
    }
    
    // Extract and hash phone numbers
    const hashedPhones = data
      .flatMap(contact => contact.phoneNumbers || [])
      .map(phone => hashPhoneNumber(phone.number))
      .filter((hash, index, self) => self.indexOf(hash) === index); // Remove duplicates
    
    if (hashedPhones.length === 0) {
      console.log('[ContactSync] No phone numbers found in contacts');
      return [];
    }
    
    console.log(`[ContactSync] Checking ${hashedPhones.length} hashed phone numbers for matches`);
    
    // Find matches in database
    const { data: matches, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('phone_hash', hashedPhones)
      .neq('id', userId); // Exclude current user
    
    if (error) {
      console.error('[ContactSync] Error finding matches:', error);
      return [];
    }
    
    console.log(`[ContactSync] Found ${matches?.length || 0} matches`);
    return matches || [];
  } catch (error) {
    console.error('[ContactSync] Unexpected error syncing contacts:', error);
    return [];
  }
}

/**
 * Stores the current user's phone hash in their profile
 * This allows other users to find them via contact sync
 * 
 * @param userId - The user's ID
 * @param phoneNumber - The user's phone number
 * @returns true if successful, false otherwise
 */
export async function storeUserPhoneHash(userId: string, phoneNumber: string): Promise<boolean> {
  try {
    const phoneHash = hashPhoneNumber(phoneNumber);
    
    const { error } = await supabase
      .from('profiles')
      .update({ phone_hash: phoneHash })
      .eq('id', userId);
    
    if (error) {
      console.error('[ContactSync] Error storing phone hash:', error);
      return false;
    }
    
    console.log('[ContactSync] Successfully stored phone hash for user');
    return true;
  } catch (error) {
    console.error('[ContactSync] Unexpected error storing phone hash:', error);
    return false;
  }
}

/**
 * Removes the user's phone hash from their profile
 * Disables contact sync for this user
 * 
 * @param userId - The user's ID
 * @returns true if successful, false otherwise
 */
export async function removeUserPhoneHash(userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ phone_hash: null })
      .eq('id', userId);
    
    if (error) {
      console.error('[ContactSync] Error removing phone hash:', error);
      return false;
    }
    
    console.log('[ContactSync] Successfully removed phone hash for user');
    return true;
  } catch (error) {
    console.error('[ContactSync] Unexpected error removing phone hash:', error);
    return false;
  }
}

