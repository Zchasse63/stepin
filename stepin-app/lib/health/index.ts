/**
 * Health Service Factory
 * Returns the appropriate health service based on platform and test mode
 */

import { Platform } from 'react-native';
import { HealthServiceInterface } from './healthService';
import HealthKitService from './HealthKitService';
import HealthConnectService from './HealthConnectService';
import MockHealthKitService from './MockHealthKitService';

/**
 * Get the platform-specific health service
 * In test mode (MOCK_HEALTHKIT=true), returns mock service
 */
export function getHealthService(): HealthServiceInterface {
  // Check if we're in test/mock mode
  const useMock = process.env.MOCK_HEALTHKIT === 'true' || process.env.TEST_MODE === 'true';

  if (useMock) {
    return MockHealthKitService;
  }

  if (Platform.OS === 'ios') {
    return HealthKitService;
  } else if (Platform.OS === 'android') {
    return HealthConnectService;
  } else {
    // For web or other platforms, return a mock service
    throw new Error('Health services are only available on iOS and Android');
  }
}

export * from './healthService';
export { HealthKitService, HealthConnectService, MockHealthKitService };

