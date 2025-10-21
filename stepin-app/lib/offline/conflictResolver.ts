/**
 * Conflict Resolver
 * Handles detection and resolution of sync conflicts
 */

import { supabase } from '../supabase/client';
import { logger } from '../utils/logger';
import type { Walk } from '../../types/database';

export interface SyncConflict {
  id: string;
  type: 'walk' | 'daily_stats' | 'profile';
  localVersion: any;
  serverVersion: any;
  timestamp: number;
  resolved: boolean;
}

export type ConflictResolutionStrategy = 'keep_local' | 'keep_server' | 'merge' | 'manual';

/**
 * Detect if a walk conflicts with existing data
 * Conflicts occur when:
 * - Same walk edited offline and online
 * - Walk with same timestamp exists
 */
export async function detectWalkConflict(
  userId: string,
  localWalk: Partial<Walk>
): Promise<SyncConflict | null> {
  try {
    // Check if a walk with similar characteristics exists
    const { data: existingWalks, error } = await supabase
      .from('walks')
      .select('*')
      .eq('user_id', userId)
      .eq('date', localWalk.date || new Date().toISOString().split('T')[0]);

    if (error) {
      logger.error('Error checking for walk conflicts:', error);
      return null;
    }

    if (!existingWalks || existingWalks.length === 0) {
      return null; // No conflict
    }

    // Check for conflicts based on timing
    for (const serverWalk of existingWalks) {
      // If walk IDs match but data differs, it's a conflict
      if (localWalk.id && localWalk.id === serverWalk.id) {
        if (hasWalkDataChanged(localWalk, serverWalk)) {
          return {
            id: `conflict_${Date.now()}`,
            type: 'walk',
            localVersion: localWalk,
            serverVersion: serverWalk,
            timestamp: Date.now(),
            resolved: false,
          };
        }
      }

      // If walks are at similar times (within 5 minutes), might be duplicate
      if (localWalk.created_at && serverWalk.created_at) {
        const localTime = new Date(localWalk.created_at).getTime();
        const serverTime = new Date(serverWalk.created_at).getTime();
        const timeDiff = Math.abs(localTime - serverTime);

        if (timeDiff < 5 * 60 * 1000) { // 5 minutes
          // Check if steps are similar (within 10%)
          const stepsDiff = Math.abs((localWalk.steps || 0) - serverWalk.steps);
          const stepsThreshold = serverWalk.steps * 0.1;

          if (stepsDiff < stepsThreshold) {
            return {
              id: `conflict_${Date.now()}`,
              type: 'walk',
              localVersion: localWalk,
              serverVersion: serverWalk,
              timestamp: Date.now(),
              resolved: false,
            };
          }
        }
      }
    }

    return null; // No conflict detected
  } catch (error) {
    logger.error('Error detecting walk conflict:', error);
    return null;
  }
}

/**
 * Check if walk data has changed between versions
 */
function hasWalkDataChanged(local: Partial<Walk>, server: Walk): boolean {
  const fieldsToCompare: (keyof Walk)[] = [
    'steps',
    'duration_minutes',
    'distance_meters',
    'date',
  ];

  for (const field of fieldsToCompare) {
    if (local[field] !== undefined && local[field] !== server[field]) {
      return true;
    }
  }

  return false;
}

/**
 * Resolve a conflict using the specified strategy
 */
export async function resolveConflict(
  conflict: SyncConflict,
  strategy: ConflictResolutionStrategy,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    logger.info('Resolving conflict', { conflictId: conflict.id, strategy });

    switch (strategy) {
      case 'keep_local':
        return await applyLocalVersion(conflict, userId);
      
      case 'keep_server':
        return await applyServerVersion(conflict);
      
      case 'merge':
        return await mergeVersions(conflict, userId);
      
      case 'manual':
        // Manual resolution handled by UI
        return { success: true };
      
      default:
        return { success: false, error: 'Unknown resolution strategy' };
    }
  } catch (error) {
    logger.error('Error resolving conflict:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Apply local version (overwrite server)
 */
async function applyLocalVersion(
  conflict: SyncConflict,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (conflict.type === 'walk') {
      const localWalk = conflict.localVersion as Partial<Walk>;
      const serverWalk = conflict.serverVersion as Walk;

      const { error } = await supabase
        .from('walks')
        .update({
          ...localWalk,
          updated_at: new Date().toISOString(),
        })
        .eq('id', serverWalk.id);

      if (error) {
        return { success: false, error: error.message };
      }

      logger.info('Applied local version', { walkId: serverWalk.id });
      return { success: true };
    }

    return { success: false, error: 'Unsupported conflict type' };
  } catch (error) {
    logger.error('Error applying local version:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Apply server version (discard local changes)
 */
async function applyServerVersion(
  conflict: SyncConflict
): Promise<{ success: boolean; error?: string }> {
  try {
    // Server version is already in database, just mark as resolved
    logger.info('Kept server version', { conflictId: conflict.id });
    return { success: true };
  } catch (error) {
    logger.error('Error applying server version:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Merge local and server versions
 * Uses "last write wins" for most fields, sums for numeric fields
 */
async function mergeVersions(
  conflict: SyncConflict,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (conflict.type === 'walk') {
      const localWalk = conflict.localVersion as Partial<Walk>;
      const serverWalk = conflict.serverVersion as Walk;

      // Merge strategy: take max values for steps, distance, duration
      const merged: Partial<Walk> = {
        steps: Math.max(localWalk.steps || 0, serverWalk.steps),
        duration_minutes: Math.max(
          localWalk.duration_minutes || 0,
          serverWalk.duration_minutes || 0
        ),
        distance_meters: Math.max(
          localWalk.distance_meters || 0,
          serverWalk.distance_meters || 0
        ),
        // Keep server's metadata
        date: serverWalk.date,
        created_at: serverWalk.created_at,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('walks')
        .update(merged)
        .eq('id', serverWalk.id);

      if (error) {
        return { success: false, error: error.message };
      }

      logger.info('Merged versions', { walkId: serverWalk.id, merged });
      return { success: true };
    }

    return { success: false, error: 'Unsupported conflict type' };
  } catch (error) {
    logger.error('Error merging versions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Auto-resolve conflicts using smart defaults
 * - For walks: merge numeric values (take max)
 * - For profile: keep most recent
 */
export async function autoResolveConflict(
  conflict: SyncConflict,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  logger.info('Auto-resolving conflict', { conflictId: conflict.id, type: conflict.type });

  // Default to merge strategy for walks
  if (conflict.type === 'walk') {
    return await resolveConflict(conflict, 'merge', userId);
  }

  // Default to server version for other types
  return await resolveConflict(conflict, 'keep_server', userId);
}

