/**
 * Distance formatting utility
 * Converts meters to miles or kilometers based on user preference
 */

import type { UnitsPreference } from '../../types/profile';

/**
 * Convert meters to miles or kilometers based on user preference
 * @param meters - Distance in meters
 * @param units - User's units preference ('miles' or 'kilometers')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted distance string with unit
 */
export function formatDistance(
  meters: number,
  units: UnitsPreference = 'miles',
  decimals: number = 2
): string {
  if (units === 'miles') {
    const miles = meters * 0.000621371; // 1 meter = 0.000621371 miles
    return `${miles.toFixed(decimals)} mi`;
  } else {
    const kilometers = meters / 1000; // 1000 meters = 1 kilometer
    return `${kilometers.toFixed(decimals)} km`;
  }
}

/**
 * Convert meters to miles or kilometers (number only, no unit)
 * @param meters - Distance in meters
 * @param units - User's units preference ('miles' or 'kilometers')
 * @returns Distance as a number
 */
export function convertDistance(
  meters: number,
  units: UnitsPreference = 'miles'
): number {
  if (units === 'miles') {
    return meters * 0.000621371;
  } else {
    return meters / 1000;
  }
}

/**
 * Get the unit label based on user preference
 * @param units - User's units preference ('miles' or 'kilometers')
 * @returns Unit label ('mi' or 'km')
 */
export function getDistanceUnit(units: UnitsPreference = 'miles'): string {
  return units === 'miles' ? 'mi' : 'km';
}

