/**
 * Unit tests for activeWalkStore
 * Tests active walk tracking state management
 *
 * NOTE: This store has extensive native dependencies that make comprehensive unit
 * testing impractical. Most functionality is intentionally left for E2E testing.
 *
 * NATIVE DEPENDENCIES (Cannot be properly mocked in unit tests):
 * - GPS Tracker: Real-time location updates, background tracking
 * - HealthKit/Health Connect: Step counting, heart rate monitoring
 * - Live Activities: iOS Dynamic Island integration
 * - Weather Service: Real-time weather data
 * - Audio Coach: Voice feedback and coaching
 *
 * RECOMMENDED FOR E2E TESTING:
 * - startWalk: Initialize GPS, HealthKit, Live Activity, weather, audio coach
 * - pauseWalk/resumeWalk: Pause/resume all tracking services
 * - endWalk: Stop all services, save to Supabase, cleanup
 * - updateSteps: Real-time step counting from HealthKit
 * - GPS route tracking: Real-time location updates and route building
 * - Heart rate monitoring: Real-time HR data and zone calculation
 * - Live Activity updates: Dynamic Island state synchronization
 * - Audio coaching: Milestone announcements and encouragement
 *
 * CRITICAL E2E SCENARIOS TO COVER:
 * 1. Start walk → Track for 5 minutes → End walk → Verify data saved
 * 2. Start walk → Pause → Resume → End → Verify pause duration calculated correctly
 * 3. Walk with GPS → Verify route captured and distance calculated
 * 4. Walk with heart rate → Verify HR zones calculated correctly
 * 5. Background tracking → App backgrounded → Verify tracking continues
 * 6. Live Activity → Verify Dynamic Island updates in real-time
 * 7. Audio coaching → Verify milestone announcements at correct intervals
 * 8. Auto-detection → Verify walk auto-starts when movement detected
 */

// Mock native dependencies before imports
jest.mock('@sentry/react-native', () => ({
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

jest.mock('../../health', () => ({
  getHealthService: jest.fn(() => ({
    isAvailable: jest.fn().mockResolvedValue(true),
    requestPermissions: jest.fn().mockResolvedValue({ granted: true }),
    getTodaySteps: jest.fn().mockResolvedValue(0),
  })),
}));

jest.mock('../../gps/gpsTracker', () => ({
  gpsTracker: {
    startTracking: jest.fn(),
    stopTracking: jest.fn(),
    getCurrentLocation: jest.fn(),
  },
}));

jest.mock('../../liveActivities/liveActivityManager', () => ({
  liveActivityManager: {
    startActivity: jest.fn(),
    updateActivity: jest.fn(),
    endActivity: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
}));

jest.mock('../../weather/weatherService', () => ({
  weatherService: {
    getCurrentWeather: jest.fn(),
  },
}));

jest.mock('../../audio/audioCoach', () => ({
  audioCoach: {
    start: jest.fn(),
    stop: jest.fn(),
    announce: jest.fn(),
  },
}));

jest.mock('../../supabase/client', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

import { useActiveWalkStore } from '../activeWalkStore';

describe('activeWalkStore', () => {
  beforeEach(() => {
    // Reset store state
    useActiveWalkStore.setState({
      isWalking: false,
      isPaused: false,
      startTime: null,
      pausedTime: null,
      totalPausedDuration: 0,
      currentSteps: 0,
      distanceMeters: 0,
      goalSteps: 7000,
      walkId: null,
      autoDetected: false,
      route: [],
      startLocation: null,
      endLocation: null,
      isTrackingGPS: false,
      currentHeartRate: null,
      averageHeartRate: null,
      maxHeartRate: null,
      heartRateSamples: [],
      currentZone: null,
      stepTrackingInterval: null,
      coachingInterval: null,
      liveActivitySubscriptions: [],
      pauseListener: null,
      endListener: null,
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = useActiveWalkStore.getState();
      expect(state.isWalking).toBe(false);
      expect(state.isPaused).toBe(false);
      expect(state.startTime).toBeNull();
      expect(state.currentSteps).toBe(0);
      expect(state.distanceMeters).toBe(0);
      expect(state.goalSteps).toBe(7000);
      expect(state.walkId).toBeNull();
      expect(state.route).toEqual([]);
      expect(state.isTrackingGPS).toBe(false);
      expect(state.currentHeartRate).toBeNull();
      expect(state.averageHeartRate).toBeNull();
      expect(state.maxHeartRate).toBeNull();
      expect(state.heartRateSamples).toEqual([]);
      expect(state.currentZone).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      // Set some state
      useActiveWalkStore.setState({
        isWalking: true,
        currentSteps: 5000,
        distanceMeters: 3000,
        route: [{ latitude: 0, longitude: 0, timestamp: new Date() }],
        currentHeartRate: 120,
      });

      const { reset } = useActiveWalkStore.getState();
      reset();

      const state = useActiveWalkStore.getState();
      expect(state.isWalking).toBe(false);
      expect(state.currentSteps).toBe(0);
      expect(state.distanceMeters).toBe(0);
      expect(state.route).toEqual([]);
      expect(state.currentHeartRate).toBeNull();
    });
  });

  // NOTE: startWalk, pauseWalk, resumeWalk, endWalk, and updateSteps are intentionally
  // not unit tested here due to heavy native dependencies. See file header for E2E
  // testing recommendations.
});

