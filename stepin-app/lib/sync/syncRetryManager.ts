/**
 * Sync Retry Manager
 * Handles retry logic with exponential backoff for failed sync operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import * as Sentry from '@sentry/react-native';

const FAILED_SYNCS_KEY = 'failed_syncs';
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second
const MAX_RETRY_DELAY = 300000; // 5 minutes

export interface FailedSync {
  id: string;
  type: 'daily_stats' | 'walk' | 'streak';
  data: any;
  timestamp: number;
  retryCount: number;
  lastRetryAt?: number;
  error?: string;
}

export interface SyncRetryResult {
  success: boolean;
  error?: string;
  shouldRetry: boolean;
}

/**
 * Get all failed syncs from AsyncStorage
 */
export async function getFailedSyncs(): Promise<FailedSync[]> {
  try {
    const data = await AsyncStorage.getItem(FAILED_SYNCS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    logger.error('Error getting failed syncs:', error);
    return [];
  }
}

/**
 * Save a failed sync to AsyncStorage
 */
export async function saveFailedSync(failedSync: Omit<FailedSync, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
  try {
    const failedSyncs = await getFailedSyncs();
    
    const newSync: FailedSync = {
      ...failedSync,
      id: `${failedSync.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    failedSyncs.push(newSync);
    await AsyncStorage.setItem(FAILED_SYNCS_KEY, JSON.stringify(failedSyncs));
    
    logger.info('Saved failed sync', { type: failedSync.type, id: newSync.id });
  } catch (error) {
    logger.error('Error saving failed sync:', error);
    Sentry.captureException(error);
  }
}

/**
 * Remove a failed sync from AsyncStorage
 */
export async function removeFailedSync(id: string): Promise<void> {
  try {
    const failedSyncs = await getFailedSyncs();
    const filtered = failedSyncs.filter(sync => sync.id !== id);
    await AsyncStorage.setItem(FAILED_SYNCS_KEY, JSON.stringify(filtered));
    
    logger.info('Removed failed sync', { id });
  } catch (error) {
    logger.error('Error removing failed sync:', error);
  }
}

/**
 * Update retry count for a failed sync
 */
export async function updateFailedSyncRetry(id: string, error?: string): Promise<void> {
  try {
    const failedSyncs = await getFailedSyncs();
    const sync = failedSyncs.find(s => s.id === id);
    
    if (sync) {
      sync.retryCount++;
      sync.lastRetryAt = Date.now();
      if (error) {
        sync.error = error;
      }
      
      await AsyncStorage.setItem(FAILED_SYNCS_KEY, JSON.stringify(failedSyncs));
      logger.info('Updated failed sync retry count', { id, retryCount: sync.retryCount });
    }
  } catch (error) {
    logger.error('Error updating failed sync retry:', error);
  }
}

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoffDelay(retryCount: number): number {
  const delay = Math.min(
    INITIAL_RETRY_DELAY * Math.pow(2, retryCount),
    MAX_RETRY_DELAY
  );
  
  // Add jitter (±20%) to prevent thundering herd
  const jitter = delay * 0.2 * (Math.random() * 2 - 1);
  return Math.floor(delay + jitter);
}

/**
 * Check if a sync should be retried based on retry count and last retry time
 */
export function shouldRetrySync(sync: FailedSync): boolean {
  // Don't retry if max attempts reached
  if (sync.retryCount >= MAX_RETRY_ATTEMPTS) {
    return false;
  }

  // If never retried, should retry
  if (!sync.lastRetryAt) {
    return true;
  }

  // Check if enough time has passed since last retry
  const backoffDelay = calculateBackoffDelay(sync.retryCount);
  const timeSinceLastRetry = Date.now() - sync.lastRetryAt;
  
  return timeSinceLastRetry >= backoffDelay;
}

/**
 * Get syncs that are ready to be retried
 */
export async function getSyncsReadyForRetry(): Promise<FailedSync[]> {
  try {
    const failedSyncs = await getFailedSyncs();
    return failedSyncs.filter(shouldRetrySync);
  } catch (error) {
    logger.error('Error getting syncs ready for retry:', error);
    return [];
  }
}

/**
 * Clear all failed syncs (for testing or after successful bulk retry)
 */
export async function clearAllFailedSyncs(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FAILED_SYNCS_KEY);
    logger.info('Cleared all failed syncs');
  } catch (error) {
    logger.error('Error clearing failed syncs:', error);
  }
}

/**
 * Get count of failed syncs
 */
export async function getFailedSyncCount(): Promise<number> {
  try {
    const failedSyncs = await getFailedSyncs();
    return failedSyncs.length;
  } catch (error) {
    logger.error('Error getting failed sync count:', error);
    return 0;
  }
}

/**
 * Remove syncs that have exceeded max retry attempts
 */
export async function cleanupExpiredSyncs(): Promise<number> {
  try {
    const failedSyncs = await getFailedSyncs();
    const validSyncs = failedSyncs.filter(sync => sync.retryCount < MAX_RETRY_ATTEMPTS);
    const removedCount = failedSyncs.length - validSyncs.length;
    
    if (removedCount > 0) {
      await AsyncStorage.setItem(FAILED_SYNCS_KEY, JSON.stringify(validSyncs));
      logger.info('Cleaned up expired syncs', { removedCount });
      
      // Log to Sentry for monitoring
      Sentry.captureMessage(`Removed ${removedCount} failed syncs after max retries`, 'warning');
    }
    
    return removedCount;
  } catch (error) {
    logger.error('Error cleaning up expired syncs:', error);
    return 0;
  }
}

