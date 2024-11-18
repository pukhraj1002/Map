// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// Load map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 18,
}).addTo(map);

// Temperature-based icon colors
const getTempIcon = (temperature) => {
  let color;
  if (temperature <= -30) color = "blue";
  else if (temperature >= 50) color = "red";
  else color = "green";
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
    shadowSize: [41, 41],
  });
};

// Predefined places
const places = [
  { name: "Furnace Creek, Death Valley", temp: 56.7, coords: [36.4623, -116.8666] },
  { name: "Kebili, Tunisia", temp: 55, coords: [33.707, 8.973] },
  { name: "Ahvaz, Iran", temp: 54, coords: [31.3203, 48.6691] },
  { name: "Tirat Tsvi, Israel", temp: 54, coords: [32.4231, 35.5381] },
  { name: "Mitribah, Kuwait", temp: 53.9, coords: [29.3333, 47.6667] },
  { name: "Vostok Station, Antarctica", temp: -89.2, coords: [-78.4647, 106.8327] },
  { name: "Denali, Alaska, USA", temp: -83, coords: [63.0695, -151.0074] },
  { name: "Oymyakon, Russia", temp: -88, coords: [63.4641, 142.7737] },
  { name: "Verkhoyansk, Russia", temp: -89.2, coords: [67.5506, 133.3900] },
  { name: "Klinck Research Station, Greenland", temp: -89.4, coords: [72.5796, -40.6698] },
];

// Add predefined markers
places.forEach((place) => {
  L.marker(place.coords, { icon: getTempIcon(place.temp) })
    .addTo(map)
    .bindPopup(`<b>${place.name}</b><br>Temperature: ${place.temp}°C`);
});

// Fetch coordinates for a place
async function getCoordsByPlaceName(name) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(name)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    } else {
      alert("Place not found. Please enter a valid location.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching coordinates:", error);
    alert("Unable to fetch location. Try again.");
    return null;
  }
}

// Fetch temperature for coordinates
async function getTemperature(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data.current_weather.temperature;
  } catch (error) {
    console.error("Error fetching temperature:", error);
    alert("Unable to fetch temperature. Try again.");
    return null;
  }
}

// Add a new place with temperature
document.getElementById("submitBtn").addEventListener("click", async () => {
  const place = document.getElementById("placeInput").value.trim();
  if (!place) {
    alert("Please enter a valid place name.");
    return;
  }
  const coords = await getCoordsByPlaceName(place);
  if (coords) {
    const temp = await getTemperature(coords[0], coords[1]);
    if (temp !== null) {
      L.marker(coords, { icon: getTempIcon(temp) })
        .addTo(map)
        .bindPopup(`<b>${place}</b><br>Temperature: ${temp}°C`)
        .openPopup();
    }
  }
});

// Fetch live location and temperature
document.getElementById("fetchLocationBtn").addEventListener("click", async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      const temp = await getTemperature(lat, lon);
      if (temp !== null) {
        L.marker([lat, lon], { icon: getTempIcon(temp) })
          .addTo(map)
          .bindPopup(`<b>Your Location</b><br>Temperature: ${temp}°C`)
          .openPopup();
        map.setView([lat, lon], 10);
      }
    }, (error) => {
      alert("Unable to fetch location. Please enable location services.");
      console.error(error);
    });
  } else {
    alert("Geolocation is not supported by your browser.");
  }
});
