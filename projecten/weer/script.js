// script.js: alle logica voor Richtpunt Weer (Ninove & Zottegem)
//
// Buienradar heeft geen meetstations in België, daarom gebruiken we
// Open-Meteo. Dat is een gratis weer-API zonder sleutel, die je rechtstreeks
// vanuit de browser kan aanroepen voor elke locatie.

const STORAGE_KEY = "weerweb_locatie";

// Adressen van de campussen zelf, niet het centrum van de stad:
// - Ninove: Centrumlaan 160, 9400 Ninove
// - Zottegem: Sabina van Beierenlaan 35, 9620 Zottegem
const LOCATIONS = [
  { id: "ninove", name: "Richtpunt Ninove", lat: 50.83187, lon: 4.01533 },
  { id: "zottegem", name: "Richtpunt Zottegem", lat: 50.87067, lon: 3.82319 },
];

// WMO-weercodes van Open-Meteo, vertaald naar een korte omschrijving en een emoji.
const WEATHER_CODES = {
  0: ["Onbewolkt", "☀️"],
  1: ["Overwegend helder", "\u{1F324}️"],
  2: ["Half bewolkt", "⛅"],
  3: ["Bewolkt", "☁️"],
  45: ["Mist", "\u{1F32B}️"],
  48: ["Aanvriezende mist", "\u{1F32B}️"],
  51: ["Lichte motregen", "\u{1F327}️"],
  53: ["Motregen", "\u{1F327}️"],
  55: ["Zware motregen", "\u{1F327}️"],
  56: ["Aanvriezende motregen", "\u{1F327}️"],
  57: ["Zware aanvriezende motregen", "\u{1F327}️"],
  61: ["Lichte regen", "\u{1F327}️"],
  63: ["Regen", "\u{1F327}️"],
  65: ["Zware regen", "\u{1F327}️"],
  66: ["Aanvriezende regen", "\u{1F327}️"],
  67: ["Zware aanvriezende regen", "\u{1F327}️"],
  71: ["Lichte sneeuw", "❄️"],
  73: ["Sneeuw", "❄️"],
  75: ["Zware sneeuw", "❄️"],
  77: ["Sneeuwkorrels", "❄️"],
  80: ["Lichte buien", "\u{1F326}️"],
  81: ["Buien", "\u{1F326}️"],
  82: ["Zware buien", "⛈️"],
  85: ["Lichte sneeuwbuien", "\u{1F328}️"],
  86: ["Zware sneeuwbuien", "\u{1F328}️"],
  95: ["Onweer", "⛈️"],
  96: ["Onweer met hagel", "⛈️"],
  99: ["Zwaar onweer met hagel", "⛈️"],
};

function weatherDescription(code) {
  return (WEATHER_CODES[code] && WEATHER_CODES[code][0]) || "Onbekend";
}

function weatherIcon(code) {
  return (WEATHER_CODES[code] && WEATHER_CODES[code][1]) || "\u{1F321}️";
}

function windDirectionText(deg) {
  if (deg === undefined || deg === null) return "";
  const dirs = ["N", "NNO", "NO", "ONO", "O", "OZO", "ZO", "ZZO", "Z", "ZZW", "ZW", "WZW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}


/* ---------- Wind: km/u, knopen en Beaufort ---------- */

const KMH_PER_KNOT = 1.852;

function kmhToKnots(kmh) {
  return kmh / KMH_PER_KNOT;
}

function nl(value, digits = 0) {
  return value.toLocaleString("nl-BE", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

// Beaufort-schaal: ondergrens in km/u per windkracht, met KNMI-benamingen.
const BEAUFORT = [
  [0, "Windstil"], [1, "Zwakke wind"], [6, "Zwakke wind"], [12, "Matige wind"],
  [20, "Matige wind"], [29, "Vrij krachtige wind"], [39, "Krachtige wind"], [50, "Harde wind"],
  [62, "Stormachtig"], [75, "Storm"], [89, "Zware storm"], [103, "Zeer zware storm"], [118, "Orkaan"],
];

function beaufort(kmh) {
  let force = 0;
  BEAUFORT.forEach(([min], i) => {
    if (kmh >= min) force = i;
  });
  return { force, name: BEAUFORT[force][1] };
}

/* ---------- Drone-check ---------- */

// Richtwaarden voor een kleine consumentendrone (tot ongeveer 1 kg).
// Boven de eerste grens is voorzichtigheid nodig, boven de tweede niet vliegen.
const DRONE_LIMITS = {
  wind: [25, 35],       // km/u gemiddelde wind
  gusts: [35, 45],      // km/u windstoten
  rain: [0.1, 0.5],     // mm neerslag per uur
  tempLow: [5, 0],      // °C: onder 5 voorzichtig, onder 0 niet
  tempHigh: [35, 40],   // °C: boven 35 voorzichtig, boven 40 niet
};
const CODES_STOP = [45, 48, 56, 57, 65, 66, 67, 75, 82, 86, 95, 96, 99];
const CODES_WARN = [51, 53, 55, 61, 63, 71, 73, 77, 80, 81, 85];

function levelUp(value, [warn, stop]) {
  if (value >= stop) return "bad";
  if (value >= warn) return "warn";
  return "ok";
}

function evaluateDrone(c) {
  const wind = c.wind_speed_10m;
  const gusts = c.wind_gusts_10m ?? c.wind_speed_10m;
  const rain = c.precipitation ?? 0;
  const temp = c.temperature_2m;
  const checks = [];

  if (wind != null) {
    checks.push({
      label: "Wind",
      hint: "voorzichtig vanaf " + DRONE_LIMITS.wind[0] + " km/u, niet vanaf " + DRONE_LIMITS.wind[1],
      value: nl(wind) + " km/u · " + nl(kmhToKnots(wind), 1) + " kn",
      level: levelUp(wind, DRONE_LIMITS.wind),
    });
  }
  if (gusts != null) {
    checks.push({
      label: "Windstoten",
      hint: "voorzichtig vanaf " + DRONE_LIMITS.gusts[0] + " km/u, niet vanaf " + DRONE_LIMITS.gusts[1],
      value: nl(gusts) + " km/u · " + nl(kmhToKnots(gusts), 1) + " kn",
      level: levelUp(gusts, DRONE_LIMITS.gusts),
    });
  }
  checks.push({
    label: "Neerslag",
    hint: "droog weer is nodig",
    value: nl(rain, 1) + " mm",
    level: levelUp(rain, DRONE_LIMITS.rain),
  });
  if (temp != null) {
    let level = "ok";
    if (temp < DRONE_LIMITS.tempLow[1] || temp > DRONE_LIMITS.tempHigh[1]) level = "bad";
    else if (temp < DRONE_LIMITS.tempLow[0] || temp > DRONE_LIMITS.tempHigh[0]) level = "warn";
    checks.push({
      label: "Temperatuur",
      hint: "accu werkt best tussen 5 en 35 °C",
      value: nl(temp, 1) + " °C",
      level,
    });
  }
  const code = c.weather_code;
  let codeLevel = "ok";
  if (CODES_STOP.includes(code)) codeLevel = "bad";
  else if (CODES_WARN.includes(code)) codeLevel = "warn";
  checks.push({
    label: "Weertype",
    hint: "geen onweer, mist of zware neerslag",
    value: weatherDescription(code),
    level: codeLevel,
  });

  const worst = checks.some((x) => x.level === "bad") ? "bad" : checks.some((x) => x.level === "warn") ? "warn" : "ok";
  const verdict = { ok: "go", warn: "warn", bad: "stop" }[worst];
  const title = { go: "Opstijgen mag", warn: "Voorzichtig opstijgen", stop: "Niet opstijgen" }[verdict];
  const problems = checks.filter((x) => x.level === worst && worst !== "ok").map((x) => x.label.toLowerCase());
  const sub =
    verdict === "go"
      ? "Alle waarden liggen binnen de richtwaarden."
      : (verdict === "stop" ? "Niet geschikt door: " : "Let op: ") + problems.join(", ") + ".";
  return { verdict, title, sub, checks };
}

/* ---------- Lucht en deeltjes (regen, sneeuw) ---------- */

function skyFor(code) {
  if (code === 0 || code === 1) return "clear";
  if (code === 2) return "partly";
  if (code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 95) return "storm";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if (code >= 51) return "rain";
  return "clear";
}

function isDaytime(c, daily) {
  const rise = daily && daily.sunrise ? daily.sunrise[0] : null;
  const set = daily && daily.sunset ? daily.sunset[0] : null;
  if (!rise || !set || !c.time) return true;
  const now = new Date(c.time).getTime();
  return now >= new Date(rise).getTime() && now < new Date(set).getTime();
}

function buildParticles(kind, count) {
  const box = document.getElementById("particles");
  box.innerHTML = "";
  box.className = "particles" + (kind ? " " + kind : "");
  if (!kind) return;
  for (let i = 0; i < count; i++) {
    const drop = document.createElement("i");
    drop.style.left = Math.random() * 100 + "%";
    drop.style.animationDuration = (kind === "rain" ? 0.6 + Math.random() * 0.5 : 6 + Math.random() * 6) + "s";
    drop.style.animationDelay = -Math.random() * 8 + "s";
    drop.style.opacity = 0.35 + Math.random() * 0.6;
    if (kind === "snow") {
      const size = 3 + Math.random() * 7;
      drop.style.width = drop.style.height = size + "px";
    }
    box.appendChild(drop);
  }
}

function applySky(c, daily) {
  const sky = skyFor(c.weather_code);
  document.body.dataset.sky = sky;
  document.body.dataset.time = isDaytime(c, daily) ? "day" : "night";
  if (sky === "rain") buildParticles("rain", [51, 53, 55].includes(c.weather_code) ? 45 : 90);
  else if (sky === "storm") buildParticles("rain", 140);
  else if (sky === "snow") buildParticles("snow", 80);
  else buildParticles(null, 0);
}

/* ---------- Animaties ---------- */

const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Telt een getal omhoog tot de eindwaarde.
// Bij een verversing van dezelfde campus tellen en schuiven we niet opnieuw, de waarden springen gewoon bij.
let quiet = false;
let lastRendered = { id: null, sig: "" };

function countUp(el, target, digits, duration = 1100) {
  if (target == null || Number.isNaN(target)) {
    el.textContent = "n.b.";
    return;
  }
  if (reducedMotion || quiet) {
    el.textContent = nl(target, digits);
    return;
  }
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = nl(target * eased, digits);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Speelt de binnenkomst-animaties van een pagina opnieuw af.
function replayAnimations(pageId) {
  if (quiet) return;
  const page = document.getElementById(pageId);
  page.querySelectorAll(".hero-card, .info-card, .panel, .checks li").forEach((el) => {
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = "";
  });
}

/* ---------- Data ophalen ---------- */

const CURRENT_FIELDS = [
  "temperature_2m",
  "apparent_temperature",
  "relative_humidity_2m",
  "precipitation",
  "weather_code",
  "pressure_msl",
  "surface_pressure",
  "cloud_cover",
  "wind_speed_10m",
  "wind_direction_10m",
  "wind_gusts_10m",
].join(",");

// KNMI Harmonie-Arome: regionaal model met 2 km resolutie voor Nederland en
// België. Fijner dan het standaardmodel (~11 km), dus beter voor lokale bewolking.
const PREFERRED_MODEL = "knmi_harmonie_arome_netherlands";

async function fetchJson(url) {
  // Na 10 seconden geven we op, zodat een trage verbinding de pagina niet blokkeert.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error("Weerdienst gaf een foutmelding (status " + response.status + ")");
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

// Het standaardmodel ("best_match") geeft de actuele waarden in een 'current' blok.
async function fetchWeatherDefault(location) {
  const params = new URLSearchParams({
    latitude: location.lat,
    longitude: location.lon,
    current: CURRENT_FIELDS,
    daily: "sunrise,sunset",
    timezone: "auto",
    timeformat: "unixtime",
  });
  const data = await fetchJson("https://api.open-meteo.com/v1/forecast?" + params.toString());
  data.current.time = data.current.time * 1000;
  data.daily = dailyToMs(data.daily);
  return data;
}

// Open-Meteo geeft tijden in seconden (unixtime). Zo hangt het niet af van de
// tijdzone van de bezoeker; we rekenen om naar milliseconden voor Date.
function dailyToMs(daily) {
  if (!daily) return daily;
  return {
    sunrise: (daily.sunrise || []).map((t) => t * 1000),
    sunset: (daily.sunset || []).map((t) => t * 1000),
  };
}

// Het KNMI-model heeft geen 'current' blok, alleen uurwaarden. Daarom halen
// we de uurdata op en nemen we zelf het huidige uur, zodat de rest van de
// code het hetzelfde kan gebruiken.
async function fetchWeatherKnmi(location) {
  const params = new URLSearchParams({
    latitude: location.lat,
    longitude: location.lon,
    hourly: CURRENT_FIELDS,
    daily: "sunrise,sunset",
    timezone: "auto",
    timeformat: "unixtime",
    models: PREFERRED_MODEL,
    // Alleen de uren rond nu ophalen: veel kleiner antwoord, dus sneller binnen.
    past_hours: 2,
    forecast_hours: 2,
    forecast_days: 1,
  });
  const data = await fetchJson("https://api.open-meteo.com/v1/forecast?" + params.toString());
  const hourly = data.hourly;
  if (!hourly || !Array.isArray(hourly.time) || hourly.time.length === 0) {
    throw new Error("Geen uurdata ontvangen van " + PREFERRED_MODEL);
  }

  const now = Date.now();
  let bestIndex = 0;
  let bestDiff = Infinity;
  hourly.time.forEach((t, i) => {
    const diff = Math.abs(t * 1000 - now);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = i;
    }
  });

  const current = { time: hourly.time[bestIndex] * 1000 };
  CURRENT_FIELDS.split(",").forEach((field) => {
    current[field] = hourly[field] ? hourly[field][bestIndex] : undefined;
  });

  return { current, daily: dailyToMs(data.daily) };
}

// Geeft de KNMI-waarden een luchtdruk uit het standaardmodel als het KNMI-model die niet heeft.
function withPressure(knmi, fallback) {
  if (fallback && knmi.current.pressure_msl == null && knmi.current.surface_pressure == null) {
    knmi.current.pressure_msl = fallback.current.pressure_msl;
    knmi.current.surface_pressure = fallback.current.surface_pressure;
  }
  return knmi;
}

// Beide modellen worden tegelijk opgevraagd. Het KNMI-model heeft voorrang omdat het
// nauwkeuriger is. Komt het niet binnen 2,5 seconden, dan tonen we meteen het standaardmodel
// en schakelen we over zodra het KNMI-model alsnog binnen is (onUpgrade).
async function fetchWeather(location, onUpgrade, patient) {
  const knmi = fetchWeatherKnmi(location);
  const standard = fetchWeatherDefault(location);
  knmi.catch(() => {});
  standard.catch(() => {});
  const slow = new Promise((resolve) => setTimeout(() => resolve("slow"), patient ? 6000 : 900));

  try {
    const first = await Promise.race([knmi, slow]);
    if (first !== "slow") {
      return withPressure(first, await standard.catch(() => null));
    }
  } catch (err) {
    console.warn("Kon " + PREFERRED_MODEL + " niet gebruiken, val terug op standaardmodel.", err);
  }

  const fallback = await standard;
  if (onUpgrade) {
    knmi.then((k) => onUpgrade(withPressure(k, fallback))).catch(() => {});
  }
  return fallback;
}

/* ---------- Locatiekeuze onthouden ---------- */

function saveLocationChoice(locationId) {
  try {
    localStorage.setItem(STORAGE_KEY, locationId);
  } catch (e) {
    // localStorage niet beschikbaar, dan onthouden we het gewoon niet
  }
}

function getSavedLocationChoice() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null;
  }
}

function determineInitialLocationId() {
  const saved = getSavedLocationChoice();
  if (saved && LOCATIONS.some((l) => l.id === saved)) {
    return saved;
  }
  return LOCATIONS[0].id;
}

function findLocation(locationId) {
  return LOCATIONS.find((l) => l.id === locationId);
}

/* ---------- Hulpfuncties voor weergave ---------- */

function fmt(value, suffix = "", digits = null) {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "n.b.";
  }
  const val = digits !== null && typeof value === "number" ? nl(value, digits) : value;
  return val + suffix;
}

// Tijden altijd in Belgische tijd, ook als de bezoeker in een andere tijdzone zit.
function formatTime(ms) {
  if (ms === null || ms === undefined) return "n.b.";
  const d = new Date(ms);
  if (Number.isNaN(d.getTime())) return "n.b.";
  return d.toLocaleTimeString("nl-BE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Brussels" });
}

/* ---------- Navigatie tussen de twee pagina's ---------- */

function showPage(pageName) {
  document.getElementById("page-home").hidden = pageName !== "home";
  const isDash = pageName in DASH_PAGES;
  document.getElementById("page-dashboard").hidden = !isDash;
  document.getElementById("nav-home").classList.toggle("active", pageName === "home");
  document.getElementById("nav-dash-ninove").classList.toggle("active", pageName === "dashboard-ninove");
  document.getElementById("nav-dash-zottegem").classList.toggle("active", pageName === "dashboard-zottegem");
  document.body.classList.toggle("is-dashboard", isDash);
  if (isDash) {
    renderDashboard(DASH_PAGES[pageName], true);
    // Het dashboard staat maar kort in beeld: alles komt meteen netjes binnen.
    const dp = document.getElementById("page-dashboard");
    dp.classList.remove("d-enter", "d-still");
    dp.style.setProperty("--skip", "0s");
    enterStart = performance.now();
    void dp.offsetWidth;
    if (!reducedMotion) {
      dp.classList.add("d-enter");
      setTimeout(() => dp.classList.remove("d-enter"), 2400);
    }
  }
  window.location.hash = pageName;

  if (pageName === "home") {
    // De kaart kan pas goed getekend worden als de container zichtbaar is.
    ensureMapInitialized();
    setTimeout(() => {
      if (cloudMap) {
        cloudMap.invalidateSize();
        const bounds = L.latLngBounds(LOCATIONS.map((l) => [l.lat, l.lon]));
        cloudMap.fitBounds(bounds, {
          paddingTopLeft: [60, 100],
          paddingBottomRight: [60, 40],
          maxZoom: 13,
        });
        updateMapMarkers();
      }
    }, 0);
  }
}

function setupNavigation() {
  document.getElementById("nav-home").addEventListener("click", (e) => {
    e.preventDefault();
    showPage("home");
  });
  Object.keys(DASH_PAGES).forEach((page) => {
    document.getElementById("nav-" + page.replace("dashboard", "dash")).addEventListener("click", (e) => {
      e.preventDefault();
      showPage(page);
    });
  });

  // Kaart aanpassen als het venster van grootte verandert, anders blijft
  // Leaflet de oude afmeting gebruiken.
  window.addEventListener("resize", () => {
    if (cloudMap) {
      cloudMap.invalidateSize();
    }
  });
}

/* ---------- Vullen van het scherm met gegevens ---------- */

function fillLocationSelect(selectEl, selectedId) {
  selectEl.innerHTML = "";
  LOCATIONS.forEach((location) => {
    const opt = document.createElement("option");
    opt.value = location.id;
    opt.textContent = location.name;
    if (location.id === selectedId) {
      opt.selected = true;
    }
    selectEl.appendChild(opt);
  });
}

function renderHome(location, data) {
  const c = data.current;
  document.getElementById("hero-station").textContent = location.name;
  document.getElementById("hero-desc").textContent = weatherDescription(c.weather_code);
  document.getElementById("hero-icon-emoji").textContent = weatherIcon(c.weather_code);

  const tempEl = document.getElementById("hero-temp");
  tempEl.innerHTML = "";
  const tempNum = document.createElement("span");
  tempEl.appendChild(tempNum);
  const unit = document.createElement("span");
  unit.className = "unit";
  unit.textContent = "°C";
  tempEl.appendChild(unit);
  countUp(tempNum, c.temperature_2m, 1);

  document.getElementById("feel-temp").textContent = fmt(c.apparent_temperature, "°C", 1);
  document.getElementById("humidity").textContent = fmt(c.relative_humidity_2m, "%", 0);
  const daily = data.daily;
  document.getElementById("home-sun").textContent =
    formatTime(daily && daily.sunrise ? daily.sunrise[0] : null) + " / " +
    formatTime(daily && daily.sunset ? daily.sunset[0] : null);
  document.getElementById("updated-home").textContent =
    "Gegevens van " + formatTime(c.time) + " uur";

  renderWind(c);
  renderDrone(c);
  applySky(c, daily);
  replayAnimations("page-home");
}

function renderWind(c) {
  const kmh = c.wind_speed_10m;
  const hasWind = kmh !== undefined && kmh !== null;
  countUp(document.getElementById("wind-kmh"), hasWind ? kmh : null, 0);
  countUp(document.getElementById("wind-kn"), hasWind ? kmhToKnots(kmh) : null, 1);

  const b = hasWind ? beaufort(kmh) : null;
  document.getElementById("beaufort").textContent = b ? "Kracht " + b.force + " · " + b.name : "n.b.";

  const dir = c.wind_direction_10m;
  const needle = document.getElementById("needle");
  // De windrichting is waar de wind vandaan komt; de pijl wijst de andere kant op.
  needle.style.setProperty("--deg", dir == null ? "0deg" : ((dir + 180) % 360) + "deg");
  document.getElementById("wind-from").textContent =
    dir == null ? "richting onbekend" : "wind uit " + windDirectionText(dir) + " (" + Math.round(dir) + "°)";

  const gusts = c.wind_gusts_10m;
  document.getElementById("gust-line").textContent =
    gusts == null ? "Windstoten: n.b." : "Windstoten tot " + nl(gusts) + " km/u (" + nl(kmhToKnots(gusts), 1) + " knopen)";
}

function renderDrone(c) {
  const result = evaluateDrone(c);
  const panel = document.getElementById("drone-panel");
  panel.dataset.verdict = result.verdict;
  document.getElementById("verdict-title").textContent = result.title;
  document.getElementById("verdict-sub").textContent = result.sub;

  const list = document.getElementById("drone-checks");
  list.innerHTML = "";
  result.checks.forEach((check, i) => {
    const li = document.createElement("li");
    li.className = check.level;
    li.style.setProperty("--i", i);
    li.innerHTML =
      '<span class="dot"></span><span class="what">' + check.label + "<small>" + check.hint +
      '</small></span><span class="val">' + check.value + "</span>";
    list.appendChild(li);
  });
}

function renderDetails(location, data) {
  const c = data.current;
  const daily = data.daily;

  document.getElementById("details-sub").textContent =
    "Aanvullende weergegevens van " + location.name + ".";

  // Sommige modellen geven geen pressure_msl (zeeniveaudruk). Dan nemen we
  // surface_pressure, dat voor onze twee locaties bijna hetzelfde is.
  const pressure = c.pressure_msl ?? c.surface_pressure;
  document.getElementById("pressure").textContent = fmt(pressure, " hPa", 0);
  document.getElementById("cloud-cover").textContent = fmt(c.cloud_cover, "%", 0);
  document.getElementById("rain-hour").textContent = fmt(c.precipitation, " mm", 1);
  document.getElementById("wind-gusts").textContent = fmt(c.wind_gusts_10m, " km/u", 0);
  document.getElementById("wind-gusts-kn").textContent =
    c.wind_gusts_10m == null ? "" : nl(kmhToKnots(c.wind_gusts_10m), 1) + " knopen";

  const sunrise = daily && daily.sunrise ? daily.sunrise[0] : null;
  const sunset = daily && daily.sunset ? daily.sunset[0] : null;
  document.getElementById("sunrise").textContent = formatTime(sunrise);
  document.getElementById("sunset").textContent = formatTime(sunset);
  if (document.getElementById("updated-details")) document.getElementById("updated-details").textContent =
    "Gegevens van " + formatTime(c.time) + " uur";
}

const weatherCache = {}; // locationId -> laatst opgehaalde Open-Meteo data

function renderLocation(locationId) {
  const location = findLocation(locationId);
  const data = weatherCache[locationId];
  if (!location || !data) return;
  const { time: _t, ...vals } = data.current;
  const sig = JSON.stringify(vals) + JSON.stringify(data.daily || {});
  if (lastRendered.id === locationId && lastRendered.sig === sig) return;
  quiet = lastRendered.id === locationId;
  lastRendered = { id: locationId, sig };
  renderHome(location, data);
  renderDetails(location, data);
  renderBanner(location);
  quiet = false;
}

// Banner bovenaan: kleur, tekening en naam wisselen mee met de gekozen campus.
let bannerId = null;
function renderBanner(location) {
  const b = document.getElementById("campus-banner");
  if (!b) return;
  document.getElementById("cb-name").textContent = location.name;
  b.querySelectorAll("[data-campus]").forEach((btn) => {
    btn.setAttribute("aria-selected", String(btn.dataset.campus === location.id));
  });
  if (bannerId !== location.id) {
    b.dataset.campus = location.id;
    if (bannerId !== null && !reducedMotion) {
      b.classList.remove("swap");
      void b.offsetWidth;
      b.classList.add("swap");
    }
    bannerId = location.id;
  }
}

/* ---------- Kaart met bewolking (Leaflet + OpenStreetMap) ---------- */

let cloudMap = null;
const mapMarkers = {}; // locationId -> Leaflet marker

function buildPinHtml(name, cloudCover) {
  const cloudText =
    cloudCover === undefined || cloudCover === null ? "laden…" : Math.round(cloudCover) + "% bewolking";
  return (
    '<div class="map-pin"><div class="map-pin-name">' +
    name +
    '</div><div class="map-pin-cloud">' +
    cloudText +
    "</div></div>"
  );
}

function ensureMapInitialized() {
  if (cloudMap || typeof L === "undefined") return;

  cloudMap = L.map("cloud-map", { scrollWheelZoom: false });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap-bijdragers",
    maxZoom: 18,
  }).addTo(cloudMap);

  LOCATIONS.forEach((location) => {
    const icon = L.divIcon({
      className: "",
      html: buildPinHtml(location.name, weatherCache[location.id] && weatherCache[location.id].current.cloud_cover),
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    mapMarkers[location.id] = L.marker([location.lat, location.lon], { icon }).addTo(cloudMap);
  });

  // Inzoomen zodat beide schooladressen op de kaart passen.
  const bounds = L.latLngBounds(LOCATIONS.map((l) => [l.lat, l.lon]));
  cloudMap.fitBounds(bounds, {
    paddingTopLeft: [60, 100],
    paddingBottomRight: [60, 40],
    maxZoom: 13,
  });
}

function updateMapMarkers() {
  if (!cloudMap) return;
  LOCATIONS.forEach((location) => {
    const marker = mapMarkers[location.id];
    const data = weatherCache[location.id];
    if (!marker || !data) return;
    marker.setIcon(
      L.divIcon({
        className: "",
        html: buildPinHtml(location.name, data.current.cloud_cover),
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      })
    );
  });
}


/* ---------- Dashboard per campus ---------- */

const DASH_PAGES = { "dashboard-ninove": "ninove", "dashboard-zottegem": "zottegem" };
let currentDashId = "ninove";

const ARROW_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2 20 21 12 16.5 4 21z"/></svg>';

// getal dat bij het laden omhoog telt
function cnt(value, digits) {
  if (value == null || Number.isNaN(value)) return "n.b.";
  return '<span class="cnt" data-to="' + value + '" data-d="' + digits + '">' + nl(value, digits) + "</span>";
}

// Windlijnen: de snelheid van de animatie volgt de windsnelheid, de hoek de windrichting.
function windLines(kmh, dir) {
  const dur = kmh == null ? 10 : Math.max(2.6, 10 - kmh / 6);
  const angle = dir == null ? 0 : (dir + 180) % 360 - 90; // 0° in SVG = naar rechts = oost
  let lines = "";
  for (let i = 0; i < 20; i++) {
    const y = -190 + i * 28;
    const len = 40 + ((i * 37) % 70);
    const delay = -((i * 0.37) % dur);
    lines += '<line x1="-300" x2="700" y1="' + y + '" y2="' + y + '" style="stroke-dasharray:' + len + " " + (260 + (i % 4) * 60) +
      ";animation-duration:" + dur.toFixed(2) + "s;animation-delay:" + delay.toFixed(2) + 's"/>';
  }
  return '<svg class="streams" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice"><g transform="rotate(' + angle.toFixed(1) +
    ' 200 100)">' + lines + "</g></svg>";
}

// Effect achter het weericoon: zonnestralen, regen of sneeuw
function heroFx(c, daily) {
  const sky = skyFor(c.weather_code);
  const day = isDaytime(c, daily);
  let kind = "", n = 0;
  if ((sky === "clear" || sky === "partly") && day) kind = "sun";
  else if (sky === "rain" || sky === "storm") { kind = "rain"; n = 14; }
  else if (sky === "snow") { kind = "snow"; n = 14; }
  if (!kind) return "";
  let drops = "";
  for (let i = 0; i < n; i++) {
    drops += '<i style="left:' + (35 + ((i * 41) % 65)) + "%;animation-delay:" + (-((i * 0.37) % 2)).toFixed(2) + "s;animation-duration:" +
      (kind === "rain" ? 0.8 + (i % 4) * 0.15 : 5 + (i % 5)).toFixed(2) + 's"></i>';
  }
  return '<div class="hero-fx fx-' + kind + '">' + drops + "</div>";
}

// Luchtvochtigheid als waterpeil in een cirkel
function waterGauge(pct) {
  if (pct == null) return '<div class="big-n">n.b.</div>';
  const top = 96 - (92 * pct) / 100;
  return '<svg class="water" viewBox="0 0 100 100"><defs><clipPath id="wc"><circle cx="50" cy="50" r="46"/></clipPath></defs>' +
    '<g clip-path="url(#wc)"><g class="lvl" style="--y:' + (top - 6).toFixed(1) + 'px"><path class="wave" d="M0 6 Q12.5 0 25 6 T50 6 T75 6 T100 6 T125 6 T150 6 T175 6 T200 6 V120 H0Z"/></g></g>' +
    '<circle class="bub" cx="38" cy="90" r="2.5"/><circle class="bub" cx="58" cy="88" r="3.2"/><circle class="bub" cx="68" cy="92" r="2"/>' +
    '<circle class="ring" cx="50" cy="50" r="46"/></svg>';
}

// Luchtdruk als barometer
function barometer(p) {
  const min = 960, max = 1060;
  const clamped = p == null ? min : Math.max(min, Math.min(max, p));
  const angle = ((clamped - min) / (max - min)) * 180 - 90;
  let ticks = "";
  for (let i = 0; i <= 10; i++) {
    const a = (-180 + i * 18) * Math.PI / 180;
    const r1 = i % 5 === 0 ? 66 : 72;
    ticks += '<line x1="' + (100 + Math.cos(a) * r1).toFixed(1) + '" y1="' + (100 + Math.sin(a) * r1).toFixed(1) +
      '" x2="' + (100 + Math.cos(a) * 80).toFixed(1) + '" y2="' + (100 + Math.sin(a) * 80).toFixed(1) + '"/>';
  }
  return '<svg class="baro" viewBox="0 0 200 112"><path class="track" d="M20 100 A80 80 0 0 1 180 100"/>' +
    '<g class="ticks">' + ticks + '</g><text x="20" y="112" class="lim">960</text><text x="180" y="112" class="lim" text-anchor="end">1060</text>' +
    (p == null ? "" : '<g class="needle-g" style="--a:' + angle.toFixed(1) + 'deg"><line x1="100" y1="100" x2="100" y2="34"/><circle cx="100" cy="100" r="7"/></g>') + "</svg>";
}

// Bewolking: hoe meer wolken, hoe meer van de lucht bedekt is
function cloudBox(pct) {
  const p = pct == null ? 0 : pct;
  return '<div class="skybox"><div class="sunball"></div>' +
    '<div class="shade" style="--h:' + p + '%"></div>' +
    '<div class="puff p1" style="opacity:' + Math.min(1, p / 40) + '"></div><div class="puff p2" style="opacity:' + Math.min(1, p / 70) + '"></div>' +
    '<div class="puff p3" style="opacity:' + Math.min(1, p / 25) + '"></div></div>';
}

// Neerslag: aantal druppels volgt de hoeveelheid
function rainBox(mm) {
  const n = mm == null || mm <= 0 ? 0 : Math.min(24, 8 + Math.round(mm * 8));
  let drops = "";
  for (let i = 0; i < n; i++) {
    drops += '<i style="left:' + ((i * 53) % 100) + "%;animation-delay:" + (-((i * 0.29) % 1.6)).toFixed(2) + "s;animation-duration:" + (0.9 + (i % 5) * 0.12).toFixed(2) + 's"></i>';
  }
  return '<div class="rainbox' + (n ? "" : " dry") + '">' + drops + "</div>";
}

// Zonneboog met de zon op haar huidige plek
function sunArc(rise, set) {
  let f = 0;
  if (!Number.isNaN(rise) && !Number.isNaN(set)) f = Math.max(0, Math.min(1, (Date.now() - rise) / (set - rise)));
  const up = Date.now() >= rise && Date.now() <= set;
  return '<svg class="arc" viewBox="0 -14 300 146"><path class="horizon" d="M10 118H290"/>' +
    '<path class="track" d="M30 118 A120 120 0 0 1 270 118" pathLength="100"/>' +
    '<path class="done" d="M30 118 A120 120 0 0 1 270 118" pathLength="100" style="--f:' + (f * 100).toFixed(1) + '"/>' +
    '<g class="sunrot' + (up ? "" : " down") + '" style="--r:' + (f * 180).toFixed(1) + 'deg"><circle cx="30" cy="118" r="11"/></g></svg>';
}

let enterStart = -9999;
function renderDashboard(locationId, fromShow) {
  if (locationId) currentDashId = locationId;
  const location = findLocation(currentDashId);
  const data = weatherCache[currentDashId];
  const root = document.getElementById("dash-root");
  document.getElementById("d-title").textContent = location ? "Weer " + location.name.replace("Richtpunt ", "Richtpunt campus ") : "";
  document.getElementById("dash-date").textContent = new Date().toLocaleDateString("nl-BE", {
    weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Brussels",
  });
  if (!location || !data) return;

  // Zelfde gegevens al getekend? Dan niets opnieuw opbouwen (geen dubbel inladen).
  const { time: _t, ...vals } = data.current; // het meetmoment zelf telt niet mee
  const sig = currentDashId + "|" + JSON.stringify(vals) + "|" + JSON.stringify(data.daily || {});
  if (root.dataset.sig === sig && root.children.length) return;
  root.dataset.sig = sig;
  // Wijzigt er alleen een waarde terwijl het scherm al getekend is, dan niet opnieuw laten binnenkomen.
  const dpage = document.getElementById("page-dashboard");
  const rerender = !fromShow && root.children.length > 0; // al getekend: waarden zonder opnieuw tellen
  const sinceEnter = performance.now() - enterStart;
  if (!fromShow && root.children.length > 0) {
    if (sinceEnter < 2200) dpage.style.setProperty("--skip", sinceEnter / 1000 + "s"); // gewoon verder in de intro
    else dpage.classList.add("d-still");
  }

  const c = data.current;
  const daily = data.daily || {};
  const kmh = c.wind_speed_10m;
  const gusts = c.wind_gusts_10m;
  const dir = c.wind_direction_10m;
  const drone = evaluateDrone(c);
  const b = kmh == null ? null : beaufort(kmh);
  const pressure = c.pressure_msl ?? c.surface_pressure;
  const rise = daily.sunrise ? daily.sunrise[0] : NaN;
  const set = daily.sunset ? daily.sunset[0] : NaN;

  const chips = drone.checks.map((x) => '<span class="chip-l ' + x.level + '"><i></i>' + x.label + "</span>").join("");

  root.innerHTML =
    '<div class="d-row a">' +
    '<section class="d-hero" style="--i:0"><div class="hero-left"><div class="k">Nu</div>' +
    '<div class="temp">' + (c.temperature_2m == null ? "n.b." : cnt(c.temperature_2m, 1) + "<small>°C</small>") + "</div>" +
    '<div class="feel">voelt aan als <b>' + fmt(c.apparent_temperature, " °C", 1) + "</b></div></div>" +
    heroFx(c, daily) + '<div class="hero-right"><div class="ico">' + weatherIcon(c.weather_code) + '</div><div class="desc">' + weatherDescription(c.weather_code) + "</div></div></section>" +
    '<section class="d-wind" style="--i:1">' + windLines(kmh, dir) +
    '<div class="wind-in"><div class="k">Wind</div><div class="figs">' +
    '<div class="big">' + (kmh == null ? "n.b." : cnt(kmh, 0)) + "<small>km/u</small></div>" +
    '<div class="big kn">' + (kmh == null ? "n.b." : cnt(kmhToKnots(kmh), 1)) + "<small>knopen</small></div></div>" +
    '<div class="meta">' + (b ? "Windkracht " + b.force + ", " + b.name.toLowerCase() : "") + (dir == null ? "" : " · uit " + windDirectionText(dir)) + "</div>" +
    '<div class="meta soft">' + (gusts == null ? "Windstoten n.b." : "Windstoten tot " + nl(gusts) + " km/u (" + nl(kmhToKnots(gusts), 1) + " kn)") + "</div></div></section>" +
    "</div>" +

    '<div class="d-row b">' +
    '<section class="d-card" style="--i:2"><div class="k">Luchtvochtigheid</div><div class="gwrap">' + waterGauge(c.relative_humidity_2m) +
    '<div class="gval">' + (c.relative_humidity_2m == null ? "" : cnt(c.relative_humidity_2m, 0) + "<small>%</small>") + "</div></div></section>" +
    '<section class="d-card" style="--i:3"><div class="k">Bewolking</div>' + cloudBox(c.cloud_cover) +
    '<div class="vline">' + (c.cloud_cover == null ? "n.b." : cnt(c.cloud_cover, 0) + "<small>% van de lucht</small>") + "</div></section>" +
    '<section class="d-card" style="--i:4"><div class="k">Neerslag, laatste uur</div>' + rainBox(c.precipitation) +
    '<div class="vline">' + (c.precipitation == null ? "n.b." : (c.precipitation > 0 ? cnt(c.precipitation, 1) + "<small>mm</small>" : "Droog")) + "</div></section>" +
    '<section class="d-card" style="--i:5"><div class="k">Luchtdruk</div>' + barometer(pressure) +
    '<div class="vline">' + (pressure == null ? "n.b." : cnt(pressure, 0) + "<small>hPa</small>") + "</div></section>" +
    "</div>" +

    '<div class="d-row c">' +
    '<section class="d-card sunbox" style="--i:6"><div class="k">Zon</div><div class="sunwrap">' + sunArc(rise, set) +
    '<div class="times"><span><small>Op</small>' + formatTime(rise) + "</span><span><small>Onder</small>" + formatTime(set) + "</span></div></div></section>" +
    '<section class="d-drone" data-verdict="' + drone.verdict + '" style="--i:7">' +
    '<svg class="drone-svg" viewBox="0 0 100 100"><g class="arms"><line x1="30" y1="30" x2="70" y2="70"/><line x1="70" y1="30" x2="30" y2="70"/></g>' +
    '<rect class="body" x="38" y="38" width="24" height="24" rx="7"/><circle class="eye" cx="50" cy="50" r="4"/>' +
    '<g class="rotor r1"><ellipse cx="22" cy="22" rx="16" ry="3.2"/></g><g class="rotor r2"><ellipse cx="78" cy="22" rx="16" ry="3.2"/></g>' +
    '<g class="rotor r3"><ellipse cx="22" cy="78" rx="16" ry="3.2"/></g><g class="rotor r4"><ellipse cx="78" cy="78" rx="16" ry="3.2"/></g></svg>' +
    '<div class="dtext"><div class="k">Drone</div><div class="tt">' + drone.title + '</div><div class="ss">' + drone.sub + '</div><div class="chips">' + chips + "</div></div></section>" +
    "</div>";

  if (!rerender) root.querySelectorAll(".cnt").forEach((el) => countUp(el, parseFloat(el.dataset.to), parseInt(el.dataset.d, 10)));

}

// Analoge klok in Belgische tijd: de wijzers draaien elke seconde mee.
function tickAnalog() {
  const parts = new Intl.DateTimeFormat("nl-BE", {
    hour: "numeric", minute: "numeric", second: "numeric", hourCycle: "h23", timeZone: "Europe/Brussels",
  }).formatToParts(new Date());
  const get = (t) => parseInt(parts.find((p) => p.type === t).value, 10);
  const h = get("hour") % 12, m = get("minute"), sec = get("second");
  document.getElementById("hand-s").style.transform = "rotate(" + sec * 6 + "deg)";
  document.getElementById("hand-m").style.transform = "rotate(" + (m * 6 + sec / 10) + "deg)";
  document.getElementById("hand-h").style.transform = "rotate(" + (h * 30 + m / 2) + "deg)";
}

function buildClockMarks() {
  let marks = "";
  for (let i = 0; i < 60; i++) {
    const hour = i % 5 === 0;
    marks += hour
      ? '<rect class="big" x="48.4" y="7" width="3.2" height="10" rx="0.4" transform="rotate(' + i * 6 + ' 50 50)"/>'
      : '<rect x="49.7" y="7" width="0.6" height="3.4" transform="rotate(' + i * 6 + ' 50 50)"/>';
  }
  document.getElementById("clock-marks").innerHTML = marks;
}

function tickClock() {
  tickAnalog();
  const text = new Date().toLocaleTimeString("nl-BE", {
    hour: "2-digit", minute: "2-digit", timeZone: "Europe/Brussels",
  });
  const el = document.getElementById("dash-clock");
  if (el.dataset.t !== text) {
    el.dataset.t = text;
    el.innerHTML = text.replace(":", '<span class="colon">:</span>');
  }
}

// Haalt de gegevens opnieuw op zonder het scherm te wissen; bij een fout blijven de oude waarden staan.


/* ---------- Poppetje dat af en toe komt spieken ---------- */

function mascotState() {
  const id = document.body.classList.contains("is-dashboard")
    ? currentDashId
    : document.getElementById("station-select").value;
  const data = weatherCache[id];
  if (!data) return null;
  const c = data.current;
  const sky = skyFor(c.weather_code);
  const day = isDaytime(c, data.daily);
  const classes = [];
  let say = "Hoi!";
  if (sky === "rain" || sky === "storm") {
    classes.push("rainy");
    say = sky === "storm" ? "Blijf maar binnen!" : "Paraplu mee!";
  } else if (sky === "snow") {
    classes.push("cold");
    say = "Brrr, sneeuw!";
  } else if (c.wind_speed_10m >= 30) {
    classes.push("windy");
    say = "Hou je pet vast!";
  } else if (c.temperature_2m < 6) {
    classes.push("cold");
    say = "Trek een warme jas aan!";
  } else if (sky === "clear" && day && c.temperature_2m >= 20) {
    classes.push("sunny");
    say = "Zonnebril op!";
  } else if (!day) {
    say = "Goeienavond!";
  }
  if (c.temperature_2m < 6 && !classes.includes("cold")) classes.push("cold");
  return { classes, say };
}

function easterDate(y) {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

// Welk poppetje hoort bij deze periode? Met ?seizoen=halloween|pasen|kerst kun je het testen.
function currentSeason(now = new Date()) {
  const forced = new URLSearchParams(location.search).get("seizoen");
  if (["halloween", "pasen", "kerst", "default"].includes(forced)) return forced;
  const y = now.getFullYear(), md = (now.getMonth() + 1) * 100 + now.getDate();
  if (md >= 1020 && md <= 1102) return "halloween";
  if (md >= 1201 || md <= 106) return "kerst";
  const e = easterDate(y), day = 86400000;
  const t = new Date(y, now.getMonth(), now.getDate()).getTime();
  if (t >= e.getTime() - 7 * day && t <= e.getTime() + 1 * day) return "pasen";
  return "default";
}

const SEASON_SAY = {
  halloween: ["Boe! Gruwelijk weer.", "Trick or treat!", "Spookachtig, hé?"],
  pasen: ["Zalig Pasen!", "Heb je al eitjes gezocht?", "Lentekriebels!"],
  kerst: ["Vrolijk kerstfeest!", "Ho ho ho!", "Sneeuw met Kerst?"],
};

let mascotTimer = null;
function peekMascot() {
  const m = document.getElementById("mascot");
  const state = mascotState();
  if (!state || m.classList.contains("peek")) return;
  const season = currentSeason();
  const lines = SEASON_SAY[season];
  const say = lines && Math.random() < 0.6 ? lines[Math.floor(Math.random() * lines.length)] : state.say;
  m.dataset.season = season;
  m.className = "mascot " + state.classes.join(" ");
  m.querySelector(".bubble").textContent = say;
  void m.offsetWidth;
  m.classList.add("peek");
  clearTimeout(mascotTimer);
  mascotTimer = setTimeout(() => m.classList.remove("peek"), 7600);
}

function scheduleMascot() {
  if (reducedMotion) return;
  setTimeout(() => {
    peekMascot();
    scheduleMascot();
  }, 20000 + Math.random() * 25000);
}

/* ---------- Dashboard: toetsen en terugknop ---------- */

function setupDashboardControls() {
  document.addEventListener("keydown", (e) => {
    if (!document.body.classList.contains("is-dashboard")) return;
    if (e.key === "Escape") showPage("home");
    if (e.key === "ArrowLeft") showPage("dashboard-ninove");
    if (e.key === "ArrowRight") showPage("dashboard-zottegem");
  });
}

/* ---------- Opstarten ---------- */

const CACHE_KEY = "weerweb_cache";

function saveCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: weatherCache }));
  } catch (e) {
    // geen opslag beschikbaar, dan werkt de site gewoon zonder
  }
}

// Bij een volgend bezoek tonen we meteen de laatst bekende gegevens, terwijl de nieuwe binnenkomen.
function loadCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY));
    if (raw && Date.now() - raw.ts < 6 * 3600 * 1000 && LOCATIONS.every((l) => raw.data && raw.data[l.id])) {
      Object.assign(weatherCache, raw.data);
      return true;
    }
  } catch (e) {
    // kapotte of ontbrekende cache, negeren
  }
  return false;
}

function rerenderAll() {
  renderLocation(document.getElementById("station-select").value);
  updateMapMarkers();
  if (!document.getElementById("page-dashboard").hidden) renderDashboard();
}

async function loadWeather() {
  const statusEl = document.getElementById("status");
  await Promise.all(
    LOCATIONS.map(async (location) => {
      try {
        // Staat er al iets op het scherm, dan wachten we op de KNMI-waarden i.p.v. later te wisselen.
        weatherCache[location.id] = await fetchWeather(location, (upgraded) => {
          weatherCache[location.id] = upgraded;
          saveCache();
          rerenderAll();
        }, !!weatherCache[location.id]);
      } catch (err) {
        console.warn("Kon het weer voor " + location.name + " niet ophalen.", err);
      }
    })
  );
  const complete = LOCATIONS.every((l) => weatherCache[l.id]);
  if (complete) {
    saveCache();
    statusEl.hidden = true;
    statusEl.classList.remove("error");
  } else {
    statusEl.textContent = "Kon de weergegevens niet ophalen. Controleer je internetverbinding en probeer het later opnieuw.";
    statusEl.classList.add("error");
    statusEl.hidden = false;
  }
  return complete;
}

async function refreshWeather() {
  if (await loadWeather()) rerenderAll();
}

async function init() {
  setupNavigation();
  document.querySelectorAll(".card-grid").forEach((grid) => {
    grid.querySelectorAll(".info-card").forEach((card, i) => card.style.setProperty("--i", i));
  });

  const selectEl = document.getElementById("station-select");
  const initialId = determineInitialLocationId();
  fillLocationSelect(selectEl, initialId);
  selectEl.disabled = false;

  document.querySelectorAll(".cb-tabs button").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (selectEl.value === btn.dataset.campus) return;
      selectEl.value = btn.dataset.campus;
      selectEl.dispatchEvent(new Event("change"));
    });
  });

  selectEl.addEventListener("change", () => {
    saveLocationChoice(selectEl.value);
    renderLocation(selectEl.value);
  });

  const hash = window.location.hash.replace("#", "");
  const startPage = hash in DASH_PAGES ? hash : "home";

  buildClockMarks();
  setupDashboardControls();
  scheduleMascot();
  setTimeout(peekMascot, 5000);
  tickClock();
  setInterval(tickClock, 1000);
  setInterval(refreshWeather, 10 * 60 * 1000);

  let shown = false;
  if (loadCache()) {
    document.getElementById("status").hidden = true;
    renderLocation(initialId);
    showPage(startPage);
    shown = true;
  }
  const fresh = await loadWeather();
  if (fresh) {
    if (shown) {
      rerenderAll();
    } else {
      renderLocation(selectEl.value);
      updateMapMarkers();
      showPage(startPage);
    }
  }
}

init();
