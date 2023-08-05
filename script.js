const apiKey = "c4f5ca2badb9d5f957645806cd35233f";
let currentCity = "";
let lastCity = "";

// Function to handle errors during fetch requests
const handleErrors = (response) => {
  if (!response.ok) {
    throw Error(response.statusText);
  }
  return response;
};

// Function to get current weather conditions
const getCurrentConditions = () => {
  const city = $('#city-input').val();
  currentCity = $('#city-input').val();

    // Create API URL for current weather data
  const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=imperial&appid=${apiKey}`;

  fetch(queryURL)
    .then(handleErrors)
    .then((response) => response.json())
    .then((response) => {
      saveCity(city);
      $('#search-error').text("");
      const currentWeatherIcon = `https://openweathermap.org/img/w/${response.weather[0].icon}.png`;
      const currentTimeUTC = response.dt;
      const currentTimeZoneOffset = response.timezone;
      const currentTimeZoneOffsetHours = currentTimeZoneOffset / 60 / 60;
      const currentMoment = moment.unix(currentTimeUTC).utc().utcOffset(currentTimeZoneOffsetHours);

      renderCities();

      // Function to get the five-day forecast
      getFiveDayForecast();
      $('#city-name').text(response.name);
      const currentWeatherHTML = `
        <h3>${response.name} ${currentMoment.format("(MM/DD/YY)")}<img src="${currentWeatherIcon}"></h3>
        <ul class="list-unstyled">
          <li>Temperature: ${response.main.temp}&#8457;</li>
          <li>Humidity: ${response.main.humidity}%</li>
          <li>Wind Speed: ${response.wind.speed} mph</li>
          <li id="uvIndex">UV Index:</li>
        </ul>`;
      $('#current-weather').html(currentWeatherHTML);

      const latitude = response.coord.lat;
      const longitude = response.coord.lon;
      const uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

      fetch(uvQueryURL)
        .then(handleErrors)
        .then((response) => response.json())
        .then((response) => {
          const uvIndex = response.value;
          $('#uvIndex').html(`UV Index: <span id="uvVal"> ${uvIndex}</span>`);
          if (uvIndex >= 0 && uvIndex < 3) {
            $('#uvVal').attr("class", "uv-favorable");
          } else if (uvIndex >= 3 && uvIndex < 8) {
            $('#uvVal').attr("class", "uv-moderate");
          } else if (uvIndex >= 8) {
            $('#uvVal').attr("class", "uv-severe");
          }
        });
    })
    .catch((error) => {
      console.log('Error:', error);
      alert('An error occurred while fetching weather data.');
    });
};

const getFiveDayForecast = () => {
  const city = $('#city-input').val();
  const queryURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=imperial&appid=${apiKey}`;

  fetch(queryURL)
    .then(handleErrors)
    .then((response) => response.json())
    .then((response) => {
      let fiveDayForecastHTML = `<h2>5-Day Forecast:</h2><div id="forecast-container" class="d-inline-flex flex-wrap ">`;

      for (let i = 0; i < response.list.length; i++) {
        const dayData = response.list[i];
        const dayTimeUTC = dayData.dt;
        const timeZoneOffset = response.city.timezone;
        const timeZoneOffsetHours = timeZoneOffset / 60 / 60;
        const thisMoment = moment.unix(dayTimeUTC).utc().utcOffset(timeZoneOffsetHours);
        const iconURL = `https://openweathermap.org/img/w/${dayData.weather[0].icon}.png`;

        if (thisMoment.format("HH:mm:ss") === "11:00:00" || thisMoment.format("HH:mm:ss") === "12:00:00" || thisMoment.format("HH:mm:ss") === "13:00:00") {
          fiveDayForecastHTML += `
            <div class="weather-card card bg-warning m-2 p0">
              <ul class="list-unstyled p-3">
                <li>${thisMoment.format("MM/DD/YY")}</li>
                <li class="weather-icon"><img src="${iconURL}"></li>
                <li>Temp: ${dayData.main.temp}&#8457;</li>
                <br>
                <li>Humidity: ${dayData.main.humidity}%</li>
              </ul>
            </div>`;
        }
      }
      fiveDayForecastHTML += `</div>`;
      $('#forecast').html(fiveDayForecastHTML);
    })
    .catch((error) => {
      console.log('Error:', error);
      alert('An error occurred while fetching the five-day forecast.');
    });
};

function saveCity(newCity) {
  let cityExists = false;
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage["cities" + i] === newCity) {
      cityExists = true;
      break;
    }
  }
  if (!cityExists) {
    localStorage.setItem('cities' + localStorage.length, newCity);
  }
}
// Function to render the list of searched cities
function renderCities() {
  $('#history-list').empty();
  if (localStorage.length === 0) {
    if (lastCity) {
      $('#city-input').val(lastCity);
    } else {
      $('#city-input').val("Costa Rica");
    }
  } else {
    let lastCityKey = "cities" + (localStorage.length - 1);
    lastCity = localStorage.getItem(lastCityKey);
    $('#city-input').val(lastCity);
    for (let i = 0; i < localStorage.length; i++) {
      let city = localStorage.getItem("cities" + i);
      let cityEl;
      if (currentCity === "") {
        currentCity = lastCity;
      }
      if (city === currentCity) {
        cityEl = `<li><button type="button" class="list-group-item list-group-item-action active">${city}</button></li>`;
      } else {
        cityEl = `<li><button type="button" class="list-group-item list-group-item-action">${city}</button></li>`;
      }
      $('#history-list').prepend(cityEl);
    }
    if (localStorage.length > 0) {
      $('#clear-storage').html($('<button type="button" class="btn btn-danger">Clear</button> '));
    } else {
      $('#clear-storage').html('');
    }
  }
}

$('#search-button').on("click", (event) => {
  event.preventDefault();
  currentCity = $('#city-input').val();
  getCurrentConditions();
});

$('#history-list').on("click", "button", (event) => {
  event.preventDefault();
  $('#city-input').val(event.target.textContent);
  currentCity = $('#city-input').val();
  getCurrentConditions();
});

$("#clear-storage").on("click", (event) => {
  localStorage.clear();
  renderCities();
});

renderCities();
getCurrentConditions();
