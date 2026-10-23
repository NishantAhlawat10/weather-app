const search = document.getElementById("search");
const suggestions = document.getElementById("suggestions");
const container = document.getElementById("weather-container");

let debounceTimer;

search.addEventListener("input", () => {
  suggestions.innerHTML = "";
  suggestions.style.display = "none";

  const searchValue = search.value.trim();
  if (searchValue.length < 2) return;

  debounceTimer = setTimeout(() => {
    getCity(searchValue);
  }, 700);
});

async function getCity(cityName) {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=10&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to load cities");
    }
    const data = await res.json();

    suggestions.style.display = data.results?.length ? "block" : "none";
    console.log(data);

    data.results.forEach((element) => {
      const item = document.createElement("li");
      item.className = "city-name";
      item.textContent = `${element.name},${element.admin2}, ${element.country}`;

      item.addEventListener("click", () => {
        search.value = `${element.name}, ${element.country}`;
        suggestions.innerHTML = ``;
        suggestions.style.display = "none";

        getWeather(element.latitude, element.longitude);
      });

      suggestions.appendChild(item);
    });
  } catch (error) {
    console.error(error);
  }
}

const getWeather = async (latitude, longitude) => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,wind_speed_10m_max&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to load");
    }
    const data = await res.json();

    displayWeather(data.daily);

    console.log(data);
  } catch (error) {
    console.error(error);
  }
};

function displayWeather(days) {
  container.innerHTML = ``;
  const length = days.time.length;
  for (let i = 0; i < length; i++) {
    const div = document.createElement("div");
    div.className = "weather-info";
    const weather = getVision(days.weathercode[i]);

    div.innerHTML = `
    <h3>${days.time[i]}</h3>
    <h2>${weather.icon}</h2>
    <p>${weather.text}</p>
    <p>Max: ${days.temperature_2m_max[i]}°C </p>
    <p>Min: ${days.temperature_2m_min[i]}°C </p>
    <p>Rain: ${days.precipitation_probability_max[i] ?? "N/A"}%</p>
    <p>Wind: ${days.wind_speed_10m_max[i]}Km/h</p>
    `;

    container.appendChild(div);
  }
}

const getVision = (code) => {
  if (code === 0) {
    return { text: "Clear Sky", icon: "☀️" };
  } else if (code === 1) {
    return { text: "Mainly Clear", icon: "🌤️" };
  } else if (code === 2) {
    return { text: "Partly Cloudy", icon: "⛅" };
  } else if (code === 3) {
    return { text: "Overcast", icon: "☁️" };
  } else if (code >= 45 && code <= 48) {
    return { text: "Foggy", icon: "🌫️" };
  } else if (code >= 51 && code <= 55) {
    return { text: "Drizzle", icon: "🌦️" };
  } else if (code >= 56 && code <= 57) {
    return { text: "Freezing Drizzle", icon: "🌧️" };
  } else if (code >= 61 && code <= 65) {
    return { text: "Rain", icon: "🌧️" };
  } else if (code >= 66 && code <= 67) {
    return { text: "Freezing Rain", icon: "🌧️" };
  } else if (code >= 71 && code <= 77) {
    return { text: "Snow", icon: "🌨️" };
  } else if (code >= 80 && code <= 82) {
    return { text: "Rain Showers", icon: "🌦️" };
  } else if (code >= 85 && code <= 86) {
    return { text: "Snow Showers", icon: "🌨️" };
  } else if (code === 95) {
    return { text: "Thunderstorm", icon: "⛈️" };
  } else if (code === 96 || code === 99) {
    return { text: "Thunderstorm with Hail", icon: "🌩️" };
  } else {
    return { text: "Unknown Weather", icon: "❔" };
  }
};
