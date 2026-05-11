# SkyCast - Weather & Air Quality Dashboard

Real-time weather and air quality dashboard built with Flask, Open-Meteo, and Nominatim APIs.

## Architecture

```
User → Flask App (app.py)
         ├── Service A (services/geocoding.py) → Nominatim API
         └── Service B (services/weather.py)    → Open-Meteo API
                                                      ├── Weather Forecast
                                                      └── Air Quality
```

### Service A: Geocoding
Validates and resolves city names to coordinates via Nominatim (OpenStreetMap).

### Service B: Weather & Air Quality
Fetches current weather, 7-day forecast, and air quality data via the free Open-Meteo API.

## Quick Start

```bash
pip install -r requirements.txt
python app.py
```

Open http://localhost:5000

## Deploy to Render (Free Tier)

1. Push this repo to GitHub
2. On Render.com, create a new **Web Service**
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app -b 0.0.0.0:$PORT`
5. Deploy

## APIs Used

- [Open-Meteo](https://open-meteo.com/) — free weather & air quality API, no key required
- [Nominatim](https://nominatim.org/) — free geocoding (OpenStreetMap), no key required
