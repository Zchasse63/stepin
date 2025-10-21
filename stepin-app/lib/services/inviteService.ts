/**
 * Invite Service
 * Handles invite link generation, sharing, and processing
 */

import { Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import { supabase } from '@/lib/supabase/client';

export interface InviteLink {
  id: string;
  inviter_id: string;
  invite_code: string;
  expires_at: string;
  used_by_id: string | null;
  used_at: string | null;
  created_at: string;
}

/**
 * Generates a random 8-character invite code
 * @returns Random lowercase alphanumeric code
 */
function generateRandomCode(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Generates an invite link for a user
 * Creates a new invite record in the database
 * 
 * @param inviterId - The user ID creating the invite
 * @returns Invite link object with URL and code
 */
export async function generateInviteLink(inviterId: string): Promise<{ url: string; code: string } | null> {
  try {
    // Generate unique code
    const inviteCode = generateRandomCode(8);
    
    // Set expiration to 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    // Insert invite link
    const { data, error } = await supabase
      .from('invite_links')
      .insert({
        inviter_id: inviterId,
        invite_code: inviteCode,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('[Invite] Error creating invite link:', error);
      return null;
    }
    
    // Create shareable URL
    const url = `https://stepin.app/invite/${inviteCode}`;
    
    return { url, code: inviteCode };
  } catch (error) {
    console.error('[Invite] Unexpected error generating invite:', error);
    return null;
  }
}

/**
 * Shares an invite link via native share sheet
 * 
 * @param inviterId - The user ID creating the invite
 * @param userName - The user's display name
 * @returns true if shared successfully, false otherwise
 */
export async function shareInviteLink(inviterId: string, userName: string): Promise<boolean> {
  try {
    // Generate invite link
    const invite = await generateInviteLink(inviterId);
    
    if (!invite) {
      return false;
    }
    
    const message = `Hi! I'm using Stepin to track my daily walks. Join me and we can support each other! 🚶\n\n${invite.url}`;
    
    // Try native sharing first
    const isAvailable = await Sharing.isAvailableAsync();
    
    if (isAvailable) {
      await Sharing.shareAsync(invite.url, {
        dialogTitle: 'Invite Friend to Stepin',
        mimeType: 'text/plain',
        UTI: 'public.url'
      });
      return true;
    } else {
      // Fallback to system share sheet
      const result = await Share.share({
        message,
        title: 'Join me on Stepin',
      });
      
      return result.action === Share.sharedAction;
    }
  } catch (error) {
    console.error('[Invite] Error sharing invite link:', error);
    return false;
  }
}

/**
 * Validates an invite code
 * Checks if code exists, is not expired, and not already used
 * 
 * @param inviteCode - The invite code to validate
 * @returns Invite link object if valid, null otherwise
 */
export async function validateInviteCode(inviteCode: string): Promise<InviteLink | null> {
  try {
    const { data, error } = await supabase
      .from('invite_links')
      .select('*')
      .eq('invite_code', inviteCode)
      .single();
    
    if (error || !data) {
      console.error('[Invite] Invalid invite code:', inviteCode);
      return null;
    }
    
    // Check if already used
    if (data.used_by_id) {
      console.warn('[Invite] Invite code already used:', inviteCode);
      return null;
    }
    
    // Check if expired
    if (new Date(data.expires_at) < new Date()) {
      console.warn('[Invite] Invite code expired:', inviteCode);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[Invite] Error validating invite code:', error);
    return null;
  }
}

/**
 * Processes an invite code for a new user
 * Marks invite as used and creates buddy request
 * 
 * @param inviteCode - The invite code to process
 * @param newUserId - The new user's ID
 * @returns Inviter user ID if successful, null otherwise
 */
export async function processInviteCode(inviteCode: string, newUserId: string): Promise<string | null> {
  try {
    // Validate invite code
    const invite = await validateInviteCode(inviteCode);
    
    if (!invite) {
      return null;
    }
    
    // Mark invite as used
    const { error: updateError } = await supabase
      .from('invite_links')
      .update({
        used_by_id: newUserId,
        used_at: new Date().toISOString()
      })
      .eq('invite_code', inviteCode);
    
    if (updateError) {
      console.error('[Invite] Error marking invite as used:', updateError);
      return null;
    }
    
    // Create buddy request from new user to inviter
    const { error: buddyError } = await supabase
      .from('buddies')
      .insert({
        user_id: newUserId,
        buddy_id: invite.inviter_id,
        status: 'pending'
      });
    
    if (buddyError) {
      console.error('[Invite] Error creating buddy request:', buddyError);
      return null;
    }
    
    console.log('[Invite] Successfully processed invite code:', inviteCode);
    return invite.inviter_id;
  } catch (error) {
    console.error('[Invite] Unexpected error processing invite:', error);
    return null;
  }
}

/**
 * Parses an invite code from a deep link URL
 * Supports formats:
 * - stepin://invite/{code}
 * - https://stepin.app/invite/{code}
 * 
 * @param url - The deep link URL to parse
 * @returns The invite code, or null if invalid
 */
export function parseInviteCode(url: string): string | null {
  // Match stepin://invite/{code}
  const stepinMatch = url.match(/stepin:\/\/invite\/([a-z0-9]+)/i);
  if (stepinMatch && stepinMatch[1]) {
    return stepinMatch[1];
  }
  
  // Match https://stepin.app/invite/{code}
  const httpsMatch = url.match(/https:\/\/stepin\.app\/invite\/([a-z0-9]+)/i);
  if (httpsMatch && httpsMatch[1]) {
    return httpsMatch[1];
  }
  
  return null;
}

