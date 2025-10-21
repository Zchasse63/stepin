/**
 * Offline Queue Management
 * Handles queuing and syncing of offline operations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';
import type { Walk } from '../../types/database';

const OFFLINE_QUEUE_KEY = 'offline_sync_queue';
const MAX_RETRY_ATTEMPTS = 3;

export interface PendingSyncWalk {
  id: string;
  userId: string;
  data: Partial<Walk>;
  timestamp: string;
  retryCount: number;
  lastAttempt?: string;
  error?: string;
}

export interface OfflineQueueStats {
  totalPending: number;
  failedCount: number;
  oldestTimestamp?: string;
}

/**
 * Add a walk to the offline sync queue
 */
export async function addToOfflineQueue(
  userId: string,
  walkData: Partial<Walk>
): Promise<string> {
  try {
    const queue = await getOfflineQueue();
    
    const pendingWalk: PendingSyncWalk = {
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      data: walkData,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    queue.push(pendingWalk);
    await saveOfflineQueue(queue);

    logger.info('Added walk to offline queue', { id: pendingWalk.id });
    return pendingWalk.id;
  } catch (error) {
    logger.error('Error adding to offline queue:', error);
    throw error;
  }
}

/**
 * Get all pending walks from the queue
 */
export async function getOfflineQueue(): Promise<PendingSyncWalk[]> {
  try {
    const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!queueJson) return [];
    
    const queue = JSON.parse(queueJson) as PendingSyncWalk[];
    return queue;
  } catch (error) {
    logger.error('Error reading offline queue:', error);
    return [];
  }
}

/**
 * Save the offline queue
 */
async function saveOfflineQueue(queue: PendingSyncWalk[]): Promise<void> {
  try {
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    logger.error('Error saving offline queue:', error);
    throw error;
  }
}

/**
 * Remove a walk from the queue
 */
export async function removeFromOfflineQueue(id: string): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const filteredQueue = queue.filter(item => item.id !== id);
    await saveOfflineQueue(filteredQueue);
    
    logger.info('Removed walk from offline queue', { id });
  } catch (error) {
    logger.error('Error removing from offline queue:', error);
    throw error;
  }
}

/**
 * Update a pending walk in the queue
 */
export async function updatePendingWalk(
  id: string,
  updates: Partial<PendingSyncWalk>
): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const index = queue.findIndex(item => item.id === id);
    
    if (index !== -1) {
      queue[index] = { ...queue[index], ...updates };
      await saveOfflineQueue(queue);
    }
  } catch (error) {
    logger.error('Error updating pending walk:', error);
    throw error;
  }
}

/**
 * Increment retry count for a pending walk
 */
export async function incrementRetryCount(id: string, error?: string): Promise<void> {
  try {
    const queue = await getOfflineQueue();
    const index = queue.findIndex(item => item.id === id);
    
    if (index !== -1) {
      queue[index].retryCount++;
      queue[index].lastAttempt = new Date().toISOString();
      if (error) {
        queue[index].error = error;
      }
      await saveOfflineQueue(queue);
    }
  } catch (err) {
    logger.error('Error incrementing retry count:', err);
  }
}

/**
 * Get queue statistics
 */
export async function getQueueStats(): Promise<OfflineQueueStats> {
  try {
    const queue = await getOfflineQueue();
    
    const failedCount = queue.filter(
      item => item.retryCount >= MAX_RETRY_ATTEMPTS
    ).length;

    const oldestTimestamp = queue.length > 0
      ? queue.reduce((oldest, item) => 
          item.timestamp < oldest ? item.timestamp : oldest,
          queue[0].timestamp
        )
      : undefined;

    return {
      totalPending: queue.length,
      failedCount,
      oldestTimestamp,
    };
  } catch (error) {
    logger.error('Error getting queue stats:', error);
    return {
      totalPending: 0,
      failedCount: 0,
    };
  }
}

/**
 * Clear all failed items from the queue
 */
export async function clearFailedItems(): Promise<number> {
  try {
    const queue = await getOfflineQueue();
    const failedItems = queue.filter(
      item => item.retryCount >= MAX_RETRY_ATTEMPTS
    );
    
    const filteredQueue = queue.filter(
      item => item.retryCount < MAX_RETRY_ATTEMPTS
    );
    
    await saveOfflineQueue(filteredQueue);
    
    logger.info('Cleared failed items from queue', { count: failedItems.length });
    return failedItems.length;
  } catch (error) {
    logger.error('Error clearing failed items:', error);
    return 0;
  }
}

/**
 * Clear the entire offline queue
 */
export async function clearOfflineQueue(): Promise<void> {
  try {
    await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
    logger.info('Cleared offline queue');
  } catch (error) {
    logger.error('Error clearing offline queue:', error);
  }
}

/**
 * Get walks that are ready to retry (not at max retries)
 */
export async function getRetryableWalks(): Promise<PendingSyncWalk[]> {
  try {
    const queue = await getOfflineQueue();
    return queue.filter(item => item.retryCount < MAX_RETRY_ATTEMPTS);
  } catch (error) {
    logger.error('Error getting retryable walks:', error);
    return [];
  }
}

/**
 * Get walks that have failed (reached max retries)
 */
export async function getFailedWalks(): Promise<PendingSyncWalk[]> {
  try {
    const queue = await getOfflineQueue();
    return queue.filter(item => item.retryCount >= MAX_RETRY_ATTEMPTS);
  } catch (error) {
    logger.error('Error getting failed walks:', error);
    return [];
  }
}

