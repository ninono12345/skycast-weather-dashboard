"""
Service A: Geocoding service using Nominatim (OpenStreetMap).
Validates and formats location names for use by the weather service.
"""

import requests
import urllib.parse

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"


class GeocodingService:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update(
            {"User-Agent": "SkyCastWeatherDashboard/1.0 (university project)"}
        )

    def search_location(self, query: str, limit: int = 5) -> list[dict]:
        params = {
            "q": query,
            "format": "json",
            "limit": limit,
            "addressdetails": 1,
            "accept-language": "en",
        }
        resp = self.session.get(NOMINATIM_URL, params=params, timeout=10)
        resp.raise_for_status()
        return resp.json()

    def format_location(self, location: dict) -> dict:
        address = location.get("address", {})
        return {
            "display_name": location.get("display_name", "Unknown"),
            "city": (
                address.get("city")
                or address.get("town")
                or address.get("village")
                or address.get("municipality")
                or "Unknown"
            ),
            "country": address.get("country", ""),
            "country_code": address.get("country_code", "").upper(),
            "lat": float(location.get("lat", 0)),
            "lon": float(location.get("lon", 0)),
        }

    def geocode(self, query: str) -> dict | None:
        results = self.search_location(query)
        if not results:
            return None
        return self.format_location(results[0])


geocoding_service = GeocodingService()
