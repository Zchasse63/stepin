/**
 * QR Code Manager
 * Handles QR code generation and deep link processing for buddy connections
 */

import { router } from 'expo-router';

/**
 * Generates a deep link URL for buddy connection via QR code
 * Format: stepin://buddy/add/{userId}
 * 
 * @param userId - The user ID to encode in the QR code
 * @returns Deep link URL string
 */
export function generateBuddyQRCode(userId: string): string {
  return `stepin://buddy/add/${userId}`;
}

/**
 * Parses a buddy ID from a deep link URL
 * Supports formats:
 * - stepin://buddy/add/{userId}
 * - https://stepin.app/buddy/add/{userId}
 * 
 * @param url - The deep link URL to parse
 * @returns The buddy user ID, or null if invalid
 */
export function parseBuddyId(url: string): string | null {
  // Match stepin://buddy/add/{userId}
  const stepinMatch = url.match(/stepin:\/\/buddy\/add\/([a-f0-9-]+)/i);
  if (stepinMatch && stepinMatch[1]) {
    return stepinMatch[1];
  }
  
  // Match https://stepin.app/buddy/add/{userId}
  const httpsMatch = url.match(/https:\/\/stepin\.app\/buddy\/add\/([a-f0-9-]+)/i);
  if (httpsMatch && httpsMatch[1]) {
    return httpsMatch[1];
  }
  
  return null;
}

/**
 * Handles a buddy deep link by navigating to the buddy preview screen
 * 
 * @param url - The deep link URL to handle
 * @returns true if handled successfully, false if invalid
 */
export function handleBuddyDeepLink(url: string): boolean {
  const buddyId = parseBuddyId(url);
  
  if (!buddyId) {
    console.warn('[QR] Invalid buddy deep link:', url);
    return false;
  }
  
  console.log('[QR] Handling buddy deep link for user:', buddyId);
  
  // Navigate to buddy preview modal
  router.push({
    pathname: '/modals/buddy-preview',
    params: { buddyId }
  });
  
  return true;
}

/**
 * Validates if a URL is a valid buddy deep link
 * 
 * @param url - The URL to validate
 * @returns true if valid buddy deep link, false otherwise
 */
export function isValidBuddyDeepLink(url: string): boolean {
  return parseBuddyId(url) !== null;
}

