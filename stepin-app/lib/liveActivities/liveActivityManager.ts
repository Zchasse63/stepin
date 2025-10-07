/**
 * Live Activity Manager
 * TypeScript wrapper for iOS Live Activities native module
 * Manages walk tracking display on lock screen and Dynamic Island
 */

import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import { logger } from '../utils/logger';

const { LiveActivityModule } = NativeModules;

// TypeScript interfaces for Live Activity data structures

export interface LiveActivityAttributes {
  walkId: string;
  goalSteps: number;
  startTime: string; // ISO 8601 date string
}

export interface LiveActivityState {
  elapsedSeconds: number;
  currentSteps: number;
  distanceMeters: number;
  goalProgress: number; // 0.0 to 1.0
}

export interface LiveActivityConfig {
  attributes: LiveActivityAttributes;
  initialState: LiveActivityState;
}

// Event types for button taps from Live Activity
export type LiveActivityEventType = 'pauseWalk' | 'endWalk';
export type LiveActivityEventListener = () => void;

/**
 * LiveActivityManager class
 * Singleton manager for iOS Live Activities
 */
class LiveActivityManager {
  private activityId: string | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private eventEmitter: NativeEventEmitter | null = null;
  private eventListeners: Map<LiveActivityEventType, Set<LiveActivityEventListener>> = new Map();
  private isSupported: boolean = false;

  constructor() {
    // Check if Live Activities are supported
    this.isSupported = this.checkSupport();

    if (this.isSupported && LiveActivityModule) {
      // Set up event emitter for button taps
      this.eventEmitter = new NativeEventEmitter(LiveActivityModule);
      this.setupEventListeners();
    }
  }

  /**
   * Check if Live Activities are supported on this device
   * Requires iOS 16.2+ and physical device (not simulator for full functionality)
   */
  private checkSupport(): boolean {
    if (Platform.OS !== 'ios') {
      logger.info('Live Activities are only supported on iOS');
      return false;
    }

    if (!LiveActivityModule) {
      logger.warn('LiveActivityModule native module not found');
      return false;
    }

    // Check iOS version (16.2+)
    const iosVersion = Platform.Version;
    if (typeof iosVersion === 'string') {
      const majorVersion = parseInt(iosVersion.split('.')[0], 10);
      const minorVersion = parseInt(iosVersion.split('.')[1] || '0', 10);
      
      if (majorVersion < 16 || (majorVersion === 16 && minorVersion < 2)) {
        logger.info(`Live Activities require iOS 16.2+. Current version: ${iosVersion}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Set up event listeners for button taps from Live Activity
   */
  private setupEventListeners(): void {
    if (!this.eventEmitter) return;

    // Listen for pause button tap
    this.eventEmitter.addListener('pauseWalk', () => {
      logger.info('Live Activity: Pause button tapped');
      this.notifyListeners('pauseWalk');
    });

    // Listen for end button tap
    this.eventEmitter.addListener('endWalk', () => {
      logger.info('Live Activity: End button tapped');
      this.notifyListeners('endWalk');
    });
  }

  /**
   * Notify all registered listeners for a specific event
   */
  private notifyListeners(eventType: LiveActivityEventType): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener();
        } catch (error) {
          logger.error(`Error in Live Activity event listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Register an event listener for Live Activity button taps
   */
  public addEventListener(eventType: LiveActivityEventType, listener: LiveActivityEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    this.eventListeners.get(eventType)!.add(listener);
  }

  /**
   * Remove an event listener
   */
  public removeEventListener(eventType: LiveActivityEventType, listener: LiveActivityEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Start a new Live Activity
   * @param config - Configuration with attributes and initial state
   * @returns Promise resolving to activity ID or null if not supported
   */
  public async startActivity(config: LiveActivityConfig): Promise<string | null> {
    if (!this.isSupported) {
      logger.info('Live Activities not supported, skipping start');
      return null;
    }

    try {
      logger.info('Starting Live Activity', config);

      const activityId = await LiveActivityModule.startActivity(
        config.attributes,
        config.initialState
      );

      this.activityId = activityId;
      logger.info('Live Activity started successfully', { activityId });

      return activityId;
    } catch (error: any) {
      logger.error('Failed to start Live Activity:', error);
      
      // Handle specific error cases
      if (error.code === 'LIVE_ACTIVITY_DISABLED') {
        logger.warn('Live Activities are disabled in system settings');
      }
      
      return null;
    }
  }

  /**
   * Update the current Live Activity with new state
   * @param state - New state to display
   * @returns Promise resolving to success boolean
   */
  public async updateActivity(state: LiveActivityState): Promise<boolean> {
    if (!this.isSupported || !this.activityId) {
      return false;
    }

    try {
      await LiveActivityModule.updateActivity(this.activityId, state);
      logger.debug('Live Activity updated', state);
      return true;
    } catch (error) {
      logger.error('Failed to update Live Activity:', error);
      return false;
    }
  }

  /**
   * End the current Live Activity
   * @returns Promise resolving to success boolean
   */
  public async endActivity(): Promise<boolean> {
    if (!this.isSupported || !this.activityId) {
      return false;
    }

    try {
      await LiveActivityModule.endActivity(this.activityId);
      logger.info('Live Activity ended successfully');
      
      // Clean up
      this.stopAutoUpdate();
      this.activityId = null;
      
      return true;
    } catch (error) {
      logger.error('Failed to end Live Activity:', error);
      return false;
    }
  }

  /**
   * Start automatic updates at regular intervals
   * @param updateFn - Function to call for each update (should return new state)
   * @param intervalMs - Update interval in milliseconds (default: 15000 = 15 seconds)
   */
  public startAutoUpdate(
    updateFn: () => Promise<LiveActivityState | null>,
    intervalMs: number = 15000
  ): void {
    if (!this.isSupported || !this.activityId) {
      return;
    }

    // Clear any existing interval
    this.stopAutoUpdate();

    logger.info(`Starting Live Activity auto-update (interval: ${intervalMs}ms)`);

    this.updateInterval = setInterval(async () => {
      try {
        const newState = await updateFn();
        if (newState) {
          await this.updateActivity(newState);
        }
      } catch (error) {
        logger.error('Error in Live Activity auto-update:', error);
      }
    }, intervalMs);
  }

  /**
   * Stop automatic updates
   */
  public stopAutoUpdate(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
      logger.info('Live Activity auto-update stopped');
    }
  }

  /**
   * Check if Live Activities are supported on this device
   */
  public get supported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if a Live Activity is currently active
   */
  public get isActive(): boolean {
    return this.activityId !== null;
  }

  /**
   * Get the current activity ID
   */
  public get currentActivityId(): string | null {
    return this.activityId;
  }

  /**
   * Clean up all resources
   * Call this when the app is closing or the manager is no longer needed
   */
  public cleanup(): void {
    this.stopAutoUpdate();
    
    if (this.eventEmitter) {
      this.eventEmitter.removeAllListeners('pauseWalk');
      this.eventEmitter.removeAllListeners('endWalk');
    }
    
    this.eventListeners.clear();
    logger.info('Live Activity Manager cleaned up');
  }
}

// Export singleton instance
export const liveActivityManager = new LiveActivityManager();

// Export class for testing purposes
export { LiveActivityManager };

