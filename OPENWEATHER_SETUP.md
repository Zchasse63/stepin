# OpenWeatherMap API Setup Guide

## Overview
Phase 10 integrates OpenWeatherMap API for weather-based walk planning and notifications.

## Setup Instructions

### 1. Create OpenWeatherMap Account
1. Go to [https://openweathermap.org/api](https://openweathermap.org/api)
2. Click "Sign Up" in the top right
3. Complete registration with email verification

### 2. Generate API Key
1. After login, go to [https://home.openweathermap.org/api_keys](https://home.openweathermap.org/api_keys)
2. Your default API key will be shown (or create a new one)
3. Copy the API key (format: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
4. **Note**: New API keys take 10-15 minutes to activate

### 3. Add to Environment Variables
1. Open `stepin-app/.env`
2. Replace `your_api_key_here` with your actual API key:
   ```
   EXPO_PUBLIC_OPENWEATHER_API_KEY=your_actual_api_key_here
   ```
3. Save the file
4. Restart the Expo development server

## Free Tier Limits

### API Call Limits
- **1,000 calls per day**
- **60 calls per minute**
- No credit card required

### Usage Estimates
- **Per User**: ~1-2 calls per day
  - 1 call for current weather (refreshed every 30 min, cached)
  - 1 call for 5-day forecast (for notifications)
- **Capacity**: Supports 500-1,000 daily active users on free tier
- **Scaling**: Upgrade to paid plan ($40/month) for 100,000 calls/day

### Rate Limiting Strategy
Our implementation includes:
- Client-side caching (30-minute refresh)
- Graceful fallback if API unavailable
- No calls when user location unavailable
- Batch forecast calls (once per day per user)

## API Endpoints Used

### 1. Current Weather
**Endpoint**: `https://api.openweathermap.org/data/2.5/weather`
**Usage**: Display weather card on Today screen
**Frequency**: Every 30 minutes (cached)
**Parameters**:
- `lat`, `lon`: User location coordinates
- `appid`: Your API key
- `units`: imperial (Fahrenheit)

### 2. 5-Day Forecast
**Endpoint**: `https://api.openweathermap.org/data/2.5/forecast`
**Usage**: Proactive walk notifications
**Frequency**: Once per day per user
**Parameters**:
- `lat`, `lon`: User location coordinates
- `appid`: Your API key
- `units`: imperial

### 3. Weather Alerts (Optional)
**Endpoint**: `https://api.openweathermap.org/data/2.5/onecall`
**Usage**: Severe weather warnings
**Frequency**: As needed
**Note**: Requires One Call API 3.0 subscription (not used in Phase 10)

## Testing Your Setup

### 1. Verify API Key
```bash
# Test API call (replace YOUR_API_KEY)
curl "https://api.openweathermap.org/data/2.5/weather?lat=40.7128&lon=-74.0060&appid=YOUR_API_KEY&units=imperial"
```

Expected response:
```json
{
  "weather": [{"main": "Clear", "description": "clear sky"}],
  "main": {"temp": 72, "feels_like": 70},
  ...
}
```

### 2. Check App Integration
1. Launch the app
2. Grant location permissions
3. Navigate to Today screen
4. Weather card should appear above step progress
5. Check console for any API errors

## Troubleshooting

### "Invalid API Key" Error
- **Cause**: New API key not yet activated
- **Solution**: Wait 10-15 minutes after key generation

### "401 Unauthorized" Error
- **Cause**: API key not in .env file or incorrect format
- **Solution**: Verify `EXPO_PUBLIC_OPENWEATHER_API_KEY` in .env

### Weather Card Not Showing
- **Cause**: Location permissions not granted
- **Solution**: Grant location permissions in device settings

### "429 Too Many Requests" Error
- **Cause**: Exceeded 60 calls/minute or 1,000 calls/day
- **Solution**: Implement rate limiting or upgrade plan

## Privacy & Data Usage

### User Location
- Location coordinates stored in `profiles.location_coordinates`
- Used only for weather API calls
- Not shared with third parties
- User can disable weather features in settings

### Data Retention
- Weather data cached for 30 minutes
- Historical weather saved with walk records
- No personal data sent to OpenWeatherMap

## Cost Considerations

### Free Tier (Current)
- **Cost**: $0/month
- **Limit**: 1,000 calls/day
- **Best For**: Development, testing, <500 DAU

### Startup Plan (Future)
- **Cost**: $40/month
- **Limit**: 100,000 calls/day
- **Best For**: 5,000-50,000 DAU

### Professional Plan (Scale)
- **Cost**: $125/month
- **Limit**: 1,000,000 calls/day
- **Best For**: 50,000+ DAU

## Alternative Weather APIs

If OpenWeatherMap limits are exceeded:
1. **WeatherAPI.com**: 1M calls/month free
2. **Tomorrow.io**: 500 calls/day free
3. **Visual Crossing**: 1,000 calls/day free

## Support

- OpenWeatherMap Docs: [https://openweathermap.org/api](https://openweathermap.org/api)
- API Status: [https://status.openweathermap.org/](https://status.openweathermap.org/)
- Support: [https://openweathermap.org/faq](https://openweathermap.org/faq)

