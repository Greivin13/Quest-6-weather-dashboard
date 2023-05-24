const apiKey= "cffc5e3f13dae39f4cc563106ec44c08";
const url = `https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid=${apiKey}`;

const searchButton= document.getElementById('search-button');
const historyList = document.getElementById('history-list');
const forecastContainer = document.getElementById('forecast-container')
const cityInput = document.getElementById('city-input');
const cityName = document.getElementById('city-name');
const date = document.getElementById('date');
