/**
 * SkyCast Weather & Air Quality Dashboard
 * Frontend logic for search, rendering, and geolocation.
 */

const searchInput = document.getElementById("city-input");
const searchBtn = document.getElementById("search-btn");
const locateBtn = document.getElementById("locate-btn");
const searchError = document.getElementById("search-error");
const loadingState = document.getElementById("loading-state");
const weatherContent = document.getElementById("weather-content");
const welcomeState = document.getElementById("welcome-state");
const currentWeather = document.getElementById("current-weather");
const airQualitySection = document.getElementById("air-quality");
const detailsGrid = document.getElementById("details");
const forecastSection = document.getElementById("forecast");

// ===== Weather Icons (inline SVG) =====
const weatherIcons = {
  sunny_day:
    '<svg viewBox="0 0 100 100" class="weather-icon-large" aria-label="Sunny">' +
    '<defs><radialGradient id="sunGrad"><stop offset="0%" stop-color="#F59E0B"/><stop offset="100%" stop-color="#FBBF24"/></radialGradient></defs>' +
    '<circle cx="50" cy="50" r="28" fill="url(#sunGrad)"><animate attributeName="r" values="28;30;28" dur="3s" repeatCount="indefinite"/></circle>' +
    '<animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="30s" repeatCount="indefinite"/>' +
    '<g stroke="#F59E0B" stroke-width="3" stroke-linecap="round">' +
    '<line x1="50" y1="12" x2="50" y2="4"/><line x1="50" y1="88" x2="50" y2="96"/>' +
    '<line x1="12" y1="50" x2="4" y2="50"/><line x1="88" y1="50" x2="96" y2="50"/>' +
    '<line x1="23" y1="23" x2="18" y2="18"/><line x1="77" y1="23" x2="82" y2="18"/>' +
    '<line x1="23" y1="77" x2="18" y2="82"/><line x1="77" y1="77" x2="82" y2="82"/>' +
    '</g></svg>',

  sunny_night:
    '<svg viewBox="0 0 100 100" class="weather-icon-large" aria-label="Clear night">' +
    '<circle cx="50" cy="40" r="24" fill="#E2E8F0"><animate attributeName="opacity" values="1;0.85;1" dur="4s" repeatCount="indefinite"/></circle>' +
    '<circle cx="42" cy="36" r="4" fill="#CBD5E1"/><circle cx="48" cy="32" r="3" fill="#CBD5E1"/><circle cx="54" cy="38" r="2.5" fill="#CBD5E1"/>' +
    '<path d="M55 55 Q50 45 38 50 Q48 38 55 55Z" fill="#0F172A" opacity="0.15"/>' +
    '</svg>',

  cloudy:
    '<svg viewBox="0 0 100 100" class="weather-icon-large" aria-label="Cloudy">' +
    '<g fill="#94A3B8"><circle cx="38" cy="55" r="20"/><circle cx="56" cy="52" r="22"/><circle cx="48" cy="45" r="18"/>' +
    '<circle cx="38" cy="58" r="22" fill="#CBD5E1"/></g>' +
    '<g fill="#F59E0B" opacity="0.7"><circle cx="30" cy="45" r="14"/><circle cx="52" cy="42" r="10"/></g>' +
    '</svg>',

  fog:
    '<svg viewBox="0 0 100 100" class="weather-icon-large" aria-label="Foggy">' +
    '<g opacity="0.5"><rect x="10" y="35" width="80" height="6" rx="3" fill="#94A3B8">' +
    '<animate attributeName="x" values="10;14;10" dur="6s" repeatCount="indefinite"/></rect>' +
    '<rect x="14" y="48" width="72" height="6" rx="3" fill="#94A3B8">' +
    '<animate attributeName="x" values="14;10;14" dur="7s" repeatCount="indefinite"/></rect>' +
    '<rect x="8" y="61" width="76" height="6" rx="3" fill="#94A3B8">' +
    '<animate attributeName="x" values="8;12;8" dur="5s" repeatCount="indefinite"/></rect></g>' +
    '</svg>',

  rain:
    '<svg viewBox="0 0 100 100" class="weather-icon-large" aria-label="Rain">' +
    '<g fill="#94A3B8"><circle cx="45" cy="38" r="18"/><circle cx="60" cy="42" r="16"/></g>' +
    '<g stroke="#0EA5E9" stroke-width="2.5" stroke-linecap="round">' +
    '<line x1="30" y1="52" x2="24" y2="68"><animate attributeName="y1" values="52;60;52" dur="1s" repeatCount="indefinite"/>' +
    '<animate attributeName="y2" values="68;76;68" dur="1s" repeatCount="indefinite"/></line>' +
    '<line x1="42" y1="52" x2="36" y2="68"><animate attributeName="y1" values="52;60;52" dur="0.9s" repeatCount="indefinite"/>' +
    '<animate attributeName="y2" values="68;76;68" dur="0.9s" repeatCount="indefinite"/></line>' +
    '<line x1="54" y1="52" x2="48" y2="68"><animate attributeName="y1" values="52;60;52" dur="1.1s" repeatCount="indefinite"/>' +
    '<animate attributeName="y2" values="68;76;68" dur="1.1s" repeatCount="indefinite"/></line>' +
    '</g></svg>',

  snow:
    '<svg viewBox="0 0 100 100" class="weather-icon-large" aria-label="Snow">' +
    '<g fill="#94A3B8"><circle cx="45" cy="35" r="18"/><circle cx="60" cy="38" r="16"/></g>' +
    '<g fill="#BAE6FD">' +
    '<circle cx="30" cy="62" r="3"><animate attributeName="cy" values="62;70;62" dur="2s" repeatCount="indefinite"/>' +
    '<animate attributeName="opacity" values="1;0;1" dur="2s" repeatCount="indefinite"/></circle>' +
    '<circle cx="45" cy="55" r="3"><animate attributeName="cy" values="55;68;55" dur="2.3s" repeatCount="indefinite"/>' +
    '<animate attributeName="opacity" values="1;0;1" dur="2.3s" repeatCount="indefinite"/></circle>' +
    '<circle cx="58" cy="58" r="3"><animate attributeName="cy" values="58;70;58" dur="1.8s" repeatCount="indefinite"/>' +
    '<animate attributeName="opacity" values="1;0;1" dur="1.8s" repeatCount="indefinite"/></circle>' +
    '</g></svg>',

  storm:
    '<svg viewBox="0 0 100 100" class="weather-icon-large" aria-label="Thunderstorm">' +
    '<g fill="#64748B"><circle cx="45" cy="38" r="18"/><circle cx="60" cy="42" r="16"/></g>' +
    '<polygon points="46,45 40,62 48,62 42,80 58,58 50,58 54,45" fill="#F59E0B">' +
    '<animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/></polygon>' +
    '</svg>',

  unknown:
    '<svg viewBox="0 0 100 100" class="weather-icon-large" aria-label="Unknown conditions">' +
    '<circle cx="50" cy="50" r="30" stroke="#94A3B8" stroke-width="4" fill="none"/>' +
    '<text x="50" y="58" text-anchor="middle" font-size="28" fill="#94A3B8">?</text></svg>'
};

function getWeatherIconSVG(icon, isDay) {
  if (icon === "sunny") return isDay ? weatherIcons.sunny_day : weatherIcons.sunny_night;
  if (icon === "cloudy") return weatherIcons.cloudy;
  if (icon === "fog") return weatherIcons.fog;
  if (icon === "rain") return weatherIcons.rain;
  if (icon === "snow") return weatherIcons.snow;
  if (icon === "storm") return weatherIcons.storm;
  return weatherIcons.unknown;
}

// Small forecast icons (simpler, no animations)
const smallIcons = {
  sunny: '<svg viewBox="0 0 40 40" class="forecast-icon"><circle cx="20" cy="20" r="12" fill="#F59E0B" opacity="0.8"/></svg>',
  cloudy: '<svg viewBox="0 0 40 40" class="forecast-icon"><circle cx="14" cy="22" r="10" fill="#CBD5E1"/><circle cx="24" cy="20" r="11" fill="#94A3B8"/><circle cx="18" cy="17" r="8" fill="#F59E0B" opacity="0.5"/></svg>',
  fog: '<svg viewBox="0 0 40 40" class="forecast-icon"><rect x="5" y="15" width="30" height="3" rx="1.5" fill="#94A3B8" opacity="0.5"/><rect x="6" y="21" width="28" height="3" rx="1.5" fill="#94A3B8" opacity="0.5"/><rect x="7" y="27" width="26" height="3" rx="1.5" fill="#94A3B8" opacity="0.5"/></svg>',
  rain: '<svg viewBox="0 0 40 40" class="forecast-icon"><circle cx="18" cy="14" r="10" fill="#CBD5E1"/><circle cx="26" cy="17" r="9" fill="#94A3B8"/><line x1="14" y1="18" x2="11" y2="28" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round"/><line x1="22" y1="18" x2="19" y2="28" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round"/><line x1="30" y1="18" x2="27" y2="28" stroke="#0EA5E9" stroke-width="2" stroke-linecap="round"/></svg>',
  snow: '<svg viewBox="0 0 40 40" class="forecast-icon"><circle cx="18" cy="14" r="10" fill="#CBD5E1"/><circle cx="26" cy="17" r="9" fill="#94A3B8"/><circle cx="14" cy="25" r="2.5" fill="#BAE6FD"/><circle cx="22" cy="22" r="2.5" fill="#BAE6FD"/><circle cx="28" cy="26" r="2.5" fill="#BAE6FD"/></svg>',
  storm: '<svg viewBox="0 0 40 40" class="forecast-icon"><circle cx="18" cy="12" r="10" fill="#64748B"/><circle cx="24" cy="15" r="9" fill="#94A3B8"/><polygon points="22,16 18,26 23,26 19,35 29,23 25,23 28,16" fill="#F59E0B"/></svg>',
  unknown: '<svg viewBox="0 0 40 40" class="forecast-icon"><circle cx="20" cy="20" r="12" stroke="#94A3B8" stroke-width="3" fill="none"/><text x="20" y="25" text-anchor="middle" font-size="12" fill="#94A3B8">?</text></svg>'
};

// ===== Detail Icons =====
const detailIcons = {
  humidity: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3c-4 6-8 10-8 14a8 8 0 0016 0c0-4-4-8-8-14z"/><circle cx="12" cy="17" r="2" fill="currentColor"/></svg>',
  wind: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 15h10a4 4 0 000-8H2"/><path d="M2 7h16a4 4 0 010 8h-4"/></svg>',
  pressure: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17.5 19H9a7 7 0 116.71-9h1.79a4.5 4.5 0 110 9z"/></svg>',
  visibility: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  uv: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>',
  rain: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 16.2A4.5 4.5 0 0017.5 8h-1.8A7 7 0 104 14.9"/><path d="M8 18v4M12 18v4M16 18v4"/></svg>',
  feels_like: '<svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/></svg>',
};

// ===== API Calls =====
async function fetchWeather(query) {
  const url = `/api/weather?${query}`;
  const resp = await fetch(url);
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.error || "Unknown error");
  return data;
}

// ===== Render Functions =====

function showError(msg) {
  searchError.textContent = msg;
  searchError.hidden = false;
}

function hideError() {
  searchError.hidden = true;
}

function showLoading() {
  welcomeState.hidden = true;
  weatherContent.hidden = true;
  loadingState.hidden = false;
  hideError();
}

function hideLoading() {
  loadingState.hidden = true;
}

function renderCurrentWeather(loc, w) {
  const cur = w.current;
  const iconHtml = getWeatherIconSVG(cur.weather_icon, cur.is_day);

  currentWeather.innerHTML = `
    <div class="current-grid">
      <div>
        <div class="location-label">
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="6" r="3"/><path d="M8 1C5.2 1 3 3.7 3 6.5 3 11 8 15 8 15s5-4 5-8.5C13 3.7 10.8 1 8 1z"/></svg>
          ${loc.city}${loc.country ? ", " + loc.country : ""}
        </div>
        <div class="temp-row">
          <span class="temp-value">${Math.round(cur.temperature)}</span>
          <span class="temp-unit">&deg;C</span>
        </div>
        <div class="weather-desc">${cur.weather_desc}</div>
        <div class="feels-like">Feels like ${Math.round(cur.feels_like)}&deg;C</div>
      </div>
      <div>${iconHtml}</div>
    </div>`;
}

function renderAirQuality(aq) {
  airQualitySection.innerHTML = `
    <div class="aq-header">
      <h3 class="aq-title">Air Quality</h3>
      <span class="aq-badge" style="background:${aq.aqi_color}">${aq.aqi_label}</span>
    </div>
    <div class="aq-grid">
      <div class="aq-item">
        <div class="aq-item-value">${aq.european_aqi >= 0 ? aq.european_aqi : "—"}</div>
        <div class="aq-item-label">European AQI</div>
      </div>
      <div class="aq-item">
        <div class="aq-item-value">${aq.pm2_5 != null ? Math.round(aq.pm2_5) : "—"}</div>
        <div class="aq-item-label">PM2.5 &micro;g/m&sup3;</div>
      </div>
      <div class="aq-item">
        <div class="aq-item-value">${aq.pm10 != null ? Math.round(aq.pm10) : "—"}</div>
        <div class="aq-item-label">PM10 &micro;g/m&sup3;</div>
      </div>
      <div class="aq-item">
        <div class="aq-item-value">${aq.uv_index != null ? Math.round(aq.uv_index) : "—"}</div>
        <div class="aq-item-label">UV Index</div>
      </div>
      <div class="aq-item">
        <div class="aq-item-value">${aq.o3 != null ? Math.round(aq.o3) : "—"}</div>
        <div class="aq-item-label">Ozone &micro;g/m&sup3;</div>
      </div>
      <div class="aq-item">
        <div class="aq-item-value">${aq.no2 != null ? Math.round(aq.no2) : "—"}</div>
        <div class="aq-item-label">NO&sb2; &micro;g/m&sup3;</div>
      </div>
    </div>`;
}

function renderDetails(w) {
  const c = w.current;
  const cards = [
    { icon: detailIcons.feels_like, value: `${Math.round(c.feels_like)}&deg;C`, label: "Feels Like" },
    { icon: detailIcons.humidity, value: `${c.humidity}%`, label: "Humidity" },
    { icon: detailIcons.wind, value: `${Math.round(c.wind_speed)} km/h`, label: `Wind ${c.wind_direction}` },
    { icon: detailIcons.pressure, value: `${Math.round(c.pressure)} hPa`, label: "Pressure" },
    { icon: detailIcons.cloud, value: `${c.cloud_cover}%`, label: "Cloud Cover" },
    { icon: detailIcons.uv, value: `${c.wind_gusts ? Math.round(c.wind_gusts) : "—"} km/h`, label: "Wind Gusts" },
    { icon: detailIcons.rain, value: `${c.precipitation} mm`, label: "Precipitation" },
    { icon: detailIcons.visibility, value: c.snowfall > 0 ? `${c.snowfall} cm` : "0 cm", label: "Snowfall" },
  ];

  detailsGrid.innerHTML = cards
    .map(
      (d) => `
    <div class="detail-card glass-card">
      <div class="detail-icon">${d.icon}</div>
      <div class="detail-value">${d.value}</div>
      <div class="detail-label">${d.label}</div>
    </div>`
    )
    .join("");
}

function renderForecast(daily) {
  const days = daily.slice(0, 7).map((d) => {
    const date = new Date(d.date + "T12:00:00");
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const icon = smallIcons[d.weather_icon] || smallIcons.unknown;

    return `
      <div class="forecast-day">
        <div class="forecast-day-name">${dayName}</div>
        <div class="forecast-day-date">${dayDate}</div>
        ${icon}
        <div class="forecast-temps">
          <span class="forecast-temp-max">${Math.round(d.temp_max)}&deg;</span>
          <span class="forecast-temp-min"> ${Math.round(d.temp_min)}&deg;</span>
        </div>
        ${d.precip_prob ? `<div class="forecast-precip">${d.precip_prob}% rain</div>` : ""}
      </div>`;
  });

  forecastSection.innerHTML = `
    <h3 class="forecast-title">7-Day Forecast</h3>
    <div class="forecast-scroll">${days.join("")}</div>`;
}

function renderAll(data) {
  renderCurrentWeather(data.location, data.weather);
  renderAirQuality(data.air_quality);
  renderDetails(data.weather);
  renderForecast(data.weather.daily);

  welcomeState.hidden = true;
  weatherContent.hidden = false;
}

// ===== Search Handler =====
async function search(query) {
  showLoading();
  try {
    const data = await fetchWeather(query);
    hideLoading();
    hideError();
    renderAll(data);
  } catch (err) {
    hideLoading();
    weatherContent.hidden = true;
    welcomeState.hidden = true;
    showError(err.message);
  }
}

function handleSearch() {
  const value = searchInput.value.trim();
  if (!value) return;
  search(`q=${encodeURIComponent(value)}`);
}

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleSearch();
});
searchBtn.addEventListener("click", handleSearch);

// ===== Geolocation =====
locateBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    showError("Geolocation is not supported by your browser.");
    return;
  }

  showLoading();
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      search(`lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
    },
    (err) => {
      hideLoading();
      if (err.code === 1) showError("Location access denied. Please allow location access or search by city name.");
      else if (err.code === 2) showError("Location unavailable. Please try again or search by city name.");
      else if (err.code === 3) showError("Location request timed out. Please try again.");
      else showError("Could not get your location. Please search by city name.");
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
});

// ===== Sample Cities =====
document.querySelectorAll(".sample-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const city = chip.dataset.city;
    searchInput.value = city;
    search(`q=${encodeURIComponent(city)}`);
  });
});

// ===== Load Vilnius by default on first visit =====
// (kept commented - welcome screen shown instead)
// Uncomment below to auto-load default city:
// search('q=Vilnius');
