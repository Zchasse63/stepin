/**
 * Background Sync Service
 * Periodically retries failed syncs in the background
 */

import { AppState, AppStateStatus } from 'react-native';
import { logger } from '../utils/logger';
import { useHealthStore } from '../store/healthStore';

let syncInterval: NodeJS.Timeout | null = null;
let appStateSubscription: any = null;

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Start background sync service
 * Retries failed syncs every 5 minutes when app is active
 */
export function startBackgroundSync(): void {
  try {
    // Don't start if already running
    if (syncInterval) {
      logger.info('Background sync already running');
      return;
    }

    logger.info('Starting background sync service');

    // Initial retry
    retryFailedSyncs();

    // Set up periodic retry
    syncInterval = setInterval(() => {
      retryFailedSyncs();
    }, SYNC_INTERVAL_MS);

    // Listen for app state changes
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
  } catch (error) {
    logger.error('Error starting background sync:', error);
  }
}

/**
 * Stop background sync service
 */
export function stopBackgroundSync(): void {
  try {
    logger.info('Stopping background sync service');

    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }

    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }
  } catch (error) {
    logger.error('Error stopping background sync:', error);
  }
}

/**
 * Handle app state changes
 * Retry syncs when app becomes active
 */
function handleAppStateChange(nextAppState: AppStateStatus): void {
  if (nextAppState === 'active') {
    logger.info('App became active, retrying failed syncs');
    retryFailedSyncs();
  }
}

/**
 * Retry failed syncs
 */
async function retryFailedSyncs(): Promise<void> {
  try {
    const healthStore = useHealthStore.getState();
    await healthStore.retryFailedSyncs();
  } catch (error) {
    logger.error('Error in background sync retry:', error);
  }
}

/**
 * Force immediate retry of failed syncs
 */
export async function forceRetryNow(): Promise<void> {
  logger.info('Force retrying failed syncs');
  await retryFailedSyncs();
}

