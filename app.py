"""
SkyCast Weather & Air Quality Dashboard
Main Flask application orchestrating Geocoding and Weather services.

Architecture:
  Service A (geocoding.py): Validates city names via Nominatim API
  Service B (weather.py):     Fetches weather + air quality via Open-Meteo API
  Flask app (this file):      Orchestrates services and serves the web UI
"""

from flask import Flask, render_template, request, jsonify

from services.geocoding import geocoding_service
from services.weather import weather_service

app = Flask(__name__)


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/weather", methods=["GET"])
def api_weather():
    query = request.args.get("q", "").strip()
    lat = request.args.get("lat", type=float)
    lon = request.args.get("lon", type=float)

    # If coordinates are provided directly, skip geocoding
    if lat is not None and lon is not None:
        location = {"city": f"{lat:.2f}, {lon:.2f}", "country": "",
                     "lat": lat, "lon": lon}
    elif query:
        try:
            geo_result = geocoding_service.geocode(query)
        except Exception as e:
            return jsonify({"error": f"Geocoding service error: {str(e)}"}), 502

        if geo_result is None:
            return jsonify({"error": f"Location '{query}' not found. Try a more specific name."}), 404
        location = geo_result
    else:
        return jsonify({"error": "Provide a city name (q=) or coordinates (lat= & lon=)"}), 400

    try:
        weather_data = weather_service.get_weather(location["lat"], location["lon"])
        air_data = weather_service.get_air_quality(location["lat"], location["lon"])
    except Exception as e:
        return jsonify({"error": f"Weather service error: {str(e)}"}), 502

    return jsonify({
        "location": location,
        "weather": weather_data,
        "air_quality": air_data,
    })


@app.errorhandler(404)
def not_found(_e):
    return jsonify({"error": "Not found"}), 404


@app.errorhandler(500)
def server_error(_e):
    return jsonify({"error": "Internal server error"}), 500


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
