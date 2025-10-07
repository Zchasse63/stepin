/**
 * Weather Service
 * Integrates with OpenWeatherMap API for weather data and forecasts
 * Phase 10: Weather Integration & Audio Coaching
 */

import axios from 'axios';
import Constants from 'expo-constants';
import type { WeatherConditions } from '@/types/database';
import type { PreferredWalkTime } from '@/types/profile';
import { logger } from '../utils/logger';
import * as Sentry from '@sentry/react-native';

const OPENWEATHER_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENWEATHER_API_KEY || 
                            process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Weather alert from OpenWeatherMap
 */
interface WeatherAlert {
  event: string;
  description: string;
  start: number;
  end: number;
}

/**
 * Weather forecast data point
 */
interface WeatherForecast {
  dt: number; // Unix timestamp
  temperature: number; // Fahrenheit
  condition: string; // 'clear', 'rain', 'clouds', etc.
  rain_probability: number; // 0-100
}

/**
 * Walk reminder recommendation
 */
interface WalkReminderResult {
  shouldSend: boolean;
  reason: string;
  suggestedTime: string;
}

/**
 * Weather Service Class
 * Handles all weather API interactions with error handling and caching
 */
class WeatherService {
  private lastWeatherFetch: Date | null = null;
  private cachedWeather: WeatherConditions | null = null;
  private readonly CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

  /**
   * Get current weather conditions for a location
   * @param lat Latitude
   * @param lng Longitude
   * @returns WeatherConditions object or null on error
   */
  async getCurrentWeather(lat: number, lng: number): Promise<WeatherConditions | null> {
    try {
      // Check cache first
      if (this.cachedWeather && this.lastWeatherFetch) {
        const cacheAge = Date.now() - this.lastWeatherFetch.getTime();
        if (cacheAge < this.CACHE_DURATION_MS) {
          logger.info('Weather: Using cached data', { cacheAge: Math.round(cacheAge / 1000) });
          return this.cachedWeather;
        }
      }

      if (!OPENWEATHER_API_KEY) {
        logger.error('Weather: API key not configured');
        return null;
      }

      Sentry.addBreadcrumb({
        category: 'weather',
        message: 'Fetching current weather',
        level: 'info',
        data: { lat, lng },
      });

      const response = await axios.get(`${BASE_URL}/weather`, {
        params: {
          lat,
          lon: lng,
          appid: OPENWEATHER_API_KEY,
          units: 'imperial', // Fahrenheit
        },
        timeout: 10000, // 10 second timeout
      });

      const data = response.data;

      const weather: WeatherConditions = {
        temperature: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        condition: data.weather[0].main.toLowerCase(),
        description: data.weather[0].description,
        humidity: data.main.humidity,
        wind_speed: Math.round(data.wind.speed),
        icon: data.weather[0].icon,
      };

      // Update cache
      this.cachedWeather = weather;
      this.lastWeatherFetch = new Date();

      logger.info('Weather: Fetched successfully', { 
        temp: weather.temperature, 
        condition: weather.condition 
      });

      return weather;
    } catch (error: any) {
      logger.error('Weather: Failed to fetch current weather', error);
      Sentry.captureException(error, {
        tags: { feature: 'weather' },
        extra: { lat, lng },
      });
      return null;
    }
  }

  /**
   * Get 5-day weather forecast
   * @param lat Latitude
   * @param lng Longitude
   * @returns Array of forecast data points
   */
  async get5DayForecast(lat: number, lng: number): Promise<WeatherForecast[]> {
    try {
      if (!OPENWEATHER_API_KEY) {
        logger.error('Weather: API key not configured');
        return [];
      }

      Sentry.addBreadcrumb({
        category: 'weather',
        message: 'Fetching 5-day forecast',
        level: 'info',
        data: { lat, lng },
      });

      const response = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          lat,
          lon: lng,
          appid: OPENWEATHER_API_KEY,
          units: 'imperial',
        },
        timeout: 10000,
      });

      const forecasts: WeatherForecast[] = response.data.list.map((item: any) => ({
        dt: item.dt,
        temperature: Math.round(item.main.temp),
        condition: item.weather[0].main.toLowerCase(),
        rain_probability: Math.round((item.pop || 0) * 100), // Probability of precipitation
      }));

      logger.info('Weather: Fetched 5-day forecast', { count: forecasts.length });

      return forecasts;
    } catch (error: any) {
      logger.error('Weather: Failed to fetch forecast', error);
      Sentry.captureException(error, {
        tags: { feature: 'weather' },
        extra: { lat, lng },
      });
      return [];
    }
  }

  /**
   * Get weather alerts for a location
   * Note: Requires One Call API 3.0 (not included in free tier)
   * @param lat Latitude
   * @param lng Longitude
   * @returns Array of weather alerts
   */
  async getWeatherAlerts(lat: number, lng: number): Promise<WeatherAlert[]> {
    try {
      if (!OPENWEATHER_API_KEY) {
        logger.error('Weather: API key not configured');
        return [];
      }

      // Note: This endpoint requires One Call API subscription
      // For free tier, we'll return empty array
      logger.info('Weather: Alerts endpoint not available on free tier');
      return [];
    } catch (error: any) {
      logger.error('Weather: Failed to fetch alerts', error);
      return [];
    }
  }

  /**
   * Determine if a walk reminder should be sent based on weather forecast
   * @param forecast Array of forecast data points
   * @param preferredTime User's preferred walk time
   * @returns Recommendation object
   */
  shouldSendWalkReminder(
    forecast: WeatherForecast[],
    preferredTime: PreferredWalkTime
  ): WalkReminderResult {
    if (forecast.length === 0) {
      return {
        shouldSend: false,
        reason: 'No forecast data available',
        suggestedTime: '',
      };
    }

    // Determine target hour based on preferred time
    const targetHour = this.getTargetHour(preferredTime);
    
    // Find forecast closest to target hour (within next 24 hours)
    const now = Date.now() / 1000; // Unix timestamp
    const targetTime = now + (targetHour * 3600); // Target time in seconds
    
    const closestForecast = forecast.reduce((closest, current) => {
      const closestDiff = Math.abs(closest.dt - targetTime);
      const currentDiff = Math.abs(current.dt - targetTime);
      return currentDiff < closestDiff ? current : closest;
    });

    // Check for bad weather conditions
    const highRainProbability = closestForecast.rain_probability > 60;
    const extremeTemperature = closestForecast.temperature < 20 || closestForecast.temperature > 95;
    const badCondition = ['thunderstorm', 'snow', 'extreme'].includes(closestForecast.condition);

    if (highRainProbability) {
      return {
        shouldSend: true,
        reason: `${closestForecast.rain_probability}% chance of rain at your usual walk time`,
        suggestedTime: this.getSuggestedAlternativeTime(forecast, preferredTime),
      };
    }

    if (extremeTemperature) {
      const tempMessage = closestForecast.temperature < 20 
        ? `Very cold (${closestForecast.temperature}°F)` 
        : `Very hot (${closestForecast.temperature}°F)`;
      return {
        shouldSend: true,
        reason: `${tempMessage} at your usual walk time`,
        suggestedTime: this.getSuggestedAlternativeTime(forecast, preferredTime),
      };
    }

    if (badCondition) {
      return {
        shouldSend: true,
        reason: `${closestForecast.condition} expected at your usual walk time`,
        suggestedTime: this.getSuggestedAlternativeTime(forecast, preferredTime),
      };
    }

    return {
      shouldSend: false,
      reason: 'Weather looks good for your walk',
      suggestedTime: '',
    };
  }

  /**
   * Get target hour for preferred walk time
   * @param preferredTime User's preferred walk time
   * @returns Hour (0-23)
   */
  private getTargetHour(preferredTime: PreferredWalkTime): number {
    switch (preferredTime) {
      case 'morning':
        return 8; // 8 AM
      case 'afternoon':
        return 14; // 2 PM
      case 'evening':
        return 18; // 6 PM
      default:
        return 14;
    }
  }

  /**
   * Find alternative time with better weather
   * @param forecast Array of forecast data points
   * @param preferredTime User's preferred walk time
   * @returns Suggested time string
   */
  private getSuggestedAlternativeTime(
    forecast: WeatherForecast[],
    preferredTime: PreferredWalkTime
  ): string {
    // Find forecast with best conditions (low rain, moderate temp)
    const goodForecast = forecast.find(f => 
      f.rain_probability < 30 && 
      f.temperature >= 40 && 
      f.temperature <= 85
    );

    if (!goodForecast) {
      return 'Check forecast for better conditions';
    }

    const forecastDate = new Date(goodForecast.dt * 1000);
    const hour = forecastDate.getHours();
    
    if (hour >= 6 && hour < 12) {
      return 'Try morning instead';
    } else if (hour >= 12 && hour < 17) {
      return 'Try afternoon instead';
    } else {
      return 'Try evening instead';
    }
  }

  /**
   * Clear cached weather data
   */
  clearCache(): void {
    this.cachedWeather = null;
    this.lastWeatherFetch = null;
    logger.info('Weather: Cache cleared');
  }
}

// Export singleton instance
export const weatherService = new WeatherService();

