# SkyCast - Weather & Air Quality Dashboard

Real-time weather and air quality dashboard built as a static site. Calls Open-Meteo and Nominatim APIs directly from the browser — no backend needed.

## How it works

```
Browser (index.html + app.js)
  ├── Nominatim API   → geocoding (city name → coordinates)
  └── Open-Meteo API  → weather forecast + air quality
```

No API keys required. Both APIs support CORS and are free to use.

## Run locally

Open `index.html` in your browser, or serve with any static server:

```bash
python -m http.server 8000
# or
npx serve .
```

Then open http://localhost:8000

## Deploy on GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Under **Branch**, select `master` (or `main`), folder: `/ (root)`
4. Click **Save**
5. Your site will be live at `https://YOUR_USERNAME.github.io/skycast-weather-dashboard/`

## APIs Used

- [Open-Meteo](https://open-meteo.com/) — free weather & air quality API, no key required
- [Nominatim](https://nominatim.org/) — free geocoding (OpenStreetMap), no key required
