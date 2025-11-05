/**
 * Configuration Validator
 * Centralized validation for required environment variables
 */

import { logger } from '../utils/logger';

interface ConfigValidation {
  isValid: boolean;
  missing: string[];
  errors: string[];
}

interface RequiredConfig {
  key: string;
  description: string;
  required: boolean;
}

/**
 * List of required environment variables
 */
const REQUIRED_CONFIGS: RequiredConfig[] = [
  {
    key: 'EXPO_PUBLIC_SUPABASE_URL',
    description: 'Supabase project URL',
    required: true,
  },
  {
    key: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    description: 'Supabase anonymous key',
    required: true,
  },
  {
    key: 'EXPO_PUBLIC_MAPBOX_TOKEN',
    description: 'Mapbox access token for maps',
    required: true,
  },
];

/**
 * Optional environment variables
 */
const OPTIONAL_CONFIGS: RequiredConfig[] = [
  {
    key: 'OPENWEATHER_API_KEY',
    description: 'OpenWeather API key for weather features',
    required: false,
  },
  {
    key: 'SENTRY_DSN',
    description: 'Sentry DSN for error tracking',
    required: false,
  },
];

/**
 * Validate all required environment variables
 * @returns ConfigValidation object with validation results
 */
export function validateConfig(): ConfigValidation {
  const missing: string[] = [];
  const errors: string[] = [];

  // Check required configs
  for (const config of REQUIRED_CONFIGS) {
    const value = process.env[config.key];

    if (!value || value.trim() === '') {
      missing.push(config.key);
      errors.push(`Missing required config: ${config.key} (${config.description})`);
    } else {
      // Additional validation for specific configs
      if (config.key === 'EXPO_PUBLIC_SUPABASE_URL') {
        if (!value.startsWith('http://') && !value.startsWith('https://')) {
          errors.push(`Invalid ${config.key}: Must be a valid URL starting with http:// or https://`);
        }
      }
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    missing,
    errors,
  };
}

/**
 * Validate and throw error if configuration is invalid
 * Use this at app startup to ensure all required configs are present
 */
export function validateConfigOrThrow(): void {
  const validation = validateConfig();

  if (!validation.isValid) {
    const errorMessage = [
      '❌ Configuration Error: Missing or invalid environment variables',
      '',
      'Please check your .env file and ensure the following are set:',
      '',
      ...validation.errors.map(err => `  - ${err}`),
      '',
      'See .env.example for a template.',
    ].join('\n');

    logger.error('Configuration validation failed', {
      missing: validation.missing,
      errors: validation.errors,
    });

    throw new Error(errorMessage);
  }

  logger.info('Configuration validated successfully', {
    required: REQUIRED_CONFIGS.length,
    optional: OPTIONAL_CONFIGS.length,
  });
}

/**
 * Get config validation status without throwing
 * Useful for displaying warnings in UI
 */
export function getConfigStatus(): {
  required: { valid: boolean; missing: string[] };
  optional: { available: string[]; missing: string[] };
} {
  const validation = validateConfig();

  const optionalAvailable: string[] = [];
  const optionalMissing: string[] = [];

  for (const config of OPTIONAL_CONFIGS) {
    const value = process.env[config.key];
    if (value && value.trim() !== '') {
      optionalAvailable.push(config.key);
    } else {
      optionalMissing.push(config.key);
    }
  }

  return {
    required: {
      valid: validation.isValid,
      missing: validation.missing,
    },
    optional: {
      available: optionalAvailable,
      missing: optionalMissing,
    },
  };
}

/**
 * Log config status (for debugging)
 * Safe to call - will not expose sensitive values
 */
export function logConfigStatus(): void {
  const status = getConfigStatus();

  logger.info('Configuration Status:', {
    requiredValid: status.required.valid,
    requiredMissing: status.required.missing,
    optionalAvailable: status.optional.available.length,
    optionalMissing: status.optional.missing,
  });

  if (!status.required.valid) {
    logger.warn('Required configuration variables are missing!', {
      missing: status.required.missing,
    });
  }

  if (status.optional.missing.length > 0) {
    logger.info('Optional features may be unavailable:', {
      missing: status.optional.missing,
    });
  }
}
