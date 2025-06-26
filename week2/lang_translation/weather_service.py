import requests
import logging
from typing import Dict, Optional
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class WeatherError(Exception):
    """Base exception for weather service errors."""
    pass

class APIError(WeatherError):
    """Exception raised for API-related errors."""
    pass

class ValidationError(WeatherError):
    """Exception raised for validation errors."""
    pass

def get_weather(city: str, api_key: str) -> Dict:
    """
    Get current weather for a city using OpenWeatherMap API.
    
    Args:
        city: Name of the city
        api_key: OpenWeatherMap API key
        
    Returns:
        Dict containing weather information
        
    Raises:
        APIError: If API request fails
        ValidationError: If input is invalid
    """
    try:
        # Validate inputs
        if not city or not isinstance(city, str):
            raise ValidationError("City name must be a non-empty string")
        if not api_key or not isinstance(api_key, str):
            raise ValidationError("API key must be a non-empty string")
            
        # Make API request
        base_url = "http://api.openweathermap.org/data/2.5/weather"
        params = {
            "q": city,
            "appid": api_key,
            "units": "metric"  # Use metric units
        }
        
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise exception for bad status codes
        
        data = response.json()
        
        # Extract relevant information
        weather_info = {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "description": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"],
            "timestamp": datetime.fromtimestamp(data["dt"]).isoformat()
        }
        
        logger.info(f"Weather data retrieved for {city}")
        return weather_info
        
    except requests.exceptions.RequestException as e:
        logger.error(f"API request failed: {str(e)}")
        raise APIError(f"Failed to fetch weather data: {str(e)}")
    except (KeyError, ValueError) as e:
        logger.error(f"Invalid API response: {str(e)}")
        raise APIError(f"Invalid API response: {str(e)}")

if __name__ == "__main__":
    # Example usage
    API_KEY = "YOUR_API_KEY"  # Replace with your OpenWeatherMap API key
    CITY = "London"
    
    try:
        weather = get_weather(CITY, API_KEY)
        print(f"Current weather in {weather['city']}:")
        print(f"Temperature: {weather['temperature']}°C")
        print(f"Description: {weather['description']}")
        print(f"Humidity: {weather['humidity']}%")
        print(f"Wind Speed: {weather['wind_speed']} m/s")
        print(f"Last Updated: {weather['timestamp']}")
    except WeatherError as e:
        print(f"Error: {str(e)}") 