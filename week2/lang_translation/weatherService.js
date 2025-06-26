const axios = require('axios');

// Custom error classes
class WeatherError extends Error {
    constructor(message) {
        super(message);
        this.name = 'WeatherError';
    }
}

class APIError extends WeatherError {
    constructor(message) {
        super(message);
        this.name = 'APIError';
    }
}

class ValidationError extends WeatherError {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

// Weather code descriptions
const weatherCodes = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
};

/**
 * Get current weather for a city using Open-Meteo API
 * @param {string} city - Name of the city
 * @returns {Promise<Object>} Weather information
 * @throws {APIError} If API request fails
 * @throws {ValidationError} If input is invalid
 */
async function getWeather(city) {
    try {
        // Validate inputs
        if (!city || typeof city !== 'string') {
            throw new ValidationError('City name must be a non-empty string');
        }

        // First, get coordinates for the city using geocoding API
        const geocodingUrl = 'https://geocoding-api.open-meteo.com/v1/search';
        const geocodingParams = {
            name: city,
            count: 1,
            language: 'en',
            format: 'json'
        };

        const geocodingResponse = await axios.get(geocodingUrl, { params: geocodingParams });
        const geocodingData = geocodingResponse.data;

        if (!geocodingData.results || geocodingData.results.length === 0) {
            throw new ValidationError(`City '${city}' not found`);
        }

        const location = geocodingData.results[0];
        const { latitude, longitude } = location;

        // Now get weather data using coordinates
        const weatherUrl = 'https://api.open-meteo.com/v1/forecast';
        const weatherParams = {
            latitude,
            longitude,
            current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code',
            timezone: 'auto'
        };

        const weatherResponse = await axios.get(weatherUrl, { params: weatherParams });
        const data = weatherResponse.data;
        const current = data.current;

        // Extract relevant information
        const weatherInfo = {
            city: location.name,
            country: location.country,
            temperature: current.temperature_2m,
            description: weatherCodes[current.weather_code] || 'Unknown',
            humidity: current.relative_humidity_2m,
            windSpeed: current.wind_speed_10m,
            timestamp: new Date(current.time).toISOString()
        };

        console.log(`Weather data retrieved for ${city}`);
        return weatherInfo;

    } catch (error) {
        if (error instanceof ValidationError) {
            throw error;
        }
        if (error.response) {
            throw new APIError(`API request failed: ${error.response.data.message || error.message}`);
        }
        throw new APIError(`Failed to fetch weather data: ${error.message}`);
    }
}

// Example usage
if (require.main === module) {
    const CITY = 'Chennai';

    getWeather(CITY)
        .then(weather => {
            console.log(`Current weather in ${weather.city}, ${weather.country}:`);
            console.log(`Temperature: ${weather.temperature}°C`);
            console.log(`Description: ${weather.description}`);
            console.log(`Humidity: ${weather.humidity}%`);
            console.log(`Wind Speed: ${weather.windSpeed} km/h`);
            console.log(`Last Updated: ${weather.timestamp}`);
        })
        .catch(error => {
            console.error(error.message);
        });
}

module.exports = {
    getWeather,
    WeatherError,
    APIError,
    ValidationError
}; 