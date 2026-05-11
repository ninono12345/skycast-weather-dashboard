"""
Service B: Weather and Air Quality service using Open-Meteo API.
Fetches current weather, daily forecast, and air quality data.
Open-Meteo is free, no API key required, built on open data.
"""

import requests

OPEN_METEO_WEATHER = "https://api.open-meteo.com/v1/forecast"
OPEN_METEO_AIR = "https://air-quality-api.open-meteo.com/v1/air-quality"

WMO_CODES = {
    0: ("Clear sky", "sunny"),
    1: ("Mainly clear", "sunny"),
    2: ("Partly cloudy", "cloudy"),
    3: ("Overcast", "cloudy"),
    45: ("Foggy", "fog"),
    48: ("Depositing rime fog", "fog"),
    51: ("Light drizzle", "rain"),
    53: ("Moderate drizzle", "rain"),
    55: ("Dense drizzle", "rain"),
    61: ("Slight rain", "rain"),
    63: ("Moderate rain", "rain"),
    65: ("Heavy rain", "rain"),
    71: ("Slight snow", "snow"),
    73: ("Moderate snow", "snow"),
    75: ("Heavy snow", "snow"),
    77: ("Snow grains", "snow"),
    80: ("Slight rain showers", "rain"),
    81: ("Moderate rain showers", "rain"),
    82: ("Violent rain showers", "rain"),
    85: ("Slight snow showers", "snow"),
    86: ("Heavy snow showers", "snow"),
    95: ("Thunderstorm", "storm"),
    96: ("Thunderstorm with slight hail", "storm"),
    99: ("Thunderstorm with heavy hail", "storm"),
}


class WeatherService:
    def __init__(self):
        self.session = requests.Session()

    def _wmo_description(self, code: int) -> tuple[str, str]:
        return WMO_CODES.get(code, ("Unknown", "unknown"))

    def _wind_direction(self, degrees: int) -> str:
        dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
                "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"]
        idx = round(degrees / 22.5) % 16
        return dirs[idx]

    def get_weather(self, lat: float, lon: float) -> dict:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "is_day",
                "precipitation",
                "rain",
                "showers",
                "snowfall",
                "weather_code",
                "cloud_cover",
                "pressure_msl",
                "surface_pressure",
                "wind_speed_10m",
                "wind_direction_10m",
                "wind_gusts_10m",
            ],
            "daily": [
                "weather_code",
                "temperature_2m_max",
                "temperature_2m_min",
                "precipitation_probability_max",
                "wind_speed_10m_max",
                "sunrise",
                "sunset",
            ],
            "timezone": "auto",
            "forecast_days": 7,
        }
        resp = self.session.get(OPEN_METEO_WEATHER, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        current = data["current"]
        desc, icon = self._wmo_description(current["weather_code"])

        daily = []
        for i in range(len(data["daily"]["time"])):
            d_code = data["daily"]["weather_code"][i]
            d_desc, d_icon = self._wmo_description(d_code)
            daily.append({
                "date": data["daily"]["time"][i],
                "weather_desc": d_desc,
                "weather_icon": d_icon,
                "temp_max": data["daily"]["temperature_2m_max"][i],
                "temp_min": data["daily"]["temperature_2m_min"][i],
                "precip_prob": data["daily"]["precipitation_probability_max"][i],
                "wind_max": data["daily"]["wind_speed_10m_max"][i],
                "sunrise": data["daily"]["sunrise"][i],
                "sunset": data["daily"]["sunset"][i],
            })

        return {
            "current": {
                "temperature": current["temperature_2m"],
                "feels_like": current["apparent_temperature"],
                "humidity": current["relative_humidity_2m"],
                "is_day": bool(current["is_day"]),
                "weather_code": current["weather_code"],
                "weather_desc": desc,
                "weather_icon": icon,
                "cloud_cover": current["cloud_cover"],
                "pressure": current["pressure_msl"],
                "wind_speed": current["wind_speed_10m"],
                "wind_direction": self._wind_direction(current["wind_direction_10m"]),
                "wind_gusts": current["wind_gusts_10m"],
                "precipitation": current["precipitation"],
                "rain": current["rain"],
                "showers": current["showers"],
                "snowfall": current["snowfall"],
            },
            "daily": daily,
            "timezone": data.get("timezone", "UTC"),
        }

    def get_air_quality(self, lat: float, lon: float) -> dict:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": [
                "european_aqi",
                "us_aqi",
                "pm10",
                "pm2_5",
                "carbon_monoxide",
                "nitrogen_dioxide",
                "sulphur_dioxide",
                "ozone",
                "dust",
                "uv_index",
            ],
        }
        resp = self.session.get(OPEN_METEO_AIR, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        current = data["current"]
        eaqi = current.get("european_aqi", -1)

        if eaqi <= 20:
            label, color = "Good", "#22c55e"
        elif eaqi <= 40:
            label, color = "Fair", "#84cc16"
        elif eaqi <= 60:
            label, color = "Moderate", "#eab308"
        elif eaqi <= 80:
            label, color = "Poor", "#f97316"
        elif eaqi <= 100:
            label, color = "Very Poor", "#ef4444"
        elif eaqi > 100:
            label, color = "Extremely Poor", "#7c3aed"
        else:
            label, color = "Unknown", "#9ca3af"

        return {
            "european_aqi": eaqi,
            "aqi_label": label,
            "aqi_color": color,
            "us_aqi": current.get("us_aqi"),
            "pm10": current.get("pm10"),
            "pm2_5": current.get("pm2_5"),
            "co": current.get("carbon_monoxide"),
            "no2": current.get("nitrogen_dioxide"),
            "so2": current.get("sulphur_dioxide"),
            "o3": current.get("ozone"),
            "dust": current.get("dust"),
            "uv_index": current.get("uv_index"),
        }


weather_service = WeatherService()
