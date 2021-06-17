// global variables
var APIkey = "c88b81178134ce9eddc0cd13e52c0184";
var APIurl = "https://api.openweathermap.org/data/2.5/";

// elements created from html
var searchEL = $("#search");
var previousSearchEL = $("#previousSearch");
var weatherDisplayEL = $("#weatherDisplay");

// tracking variables
var searchedCity;
var searchSuccess = false; //equaling false because we are implying that the user is going to enter an incorrect city, and will become true ONLY IF the user typed a legitmate city. The data is pulled from 'APIurl'

var fiveDay = 5;
var offset = 0; //starting off at 0 because that is the current day.
var previousSearches = JSON.parse(localStorage.getItem("previousSearches")) || [];


function errorDisplay() {
    weatherDisplayEL.empty();
    weatherDisplayEL.append(`
        <h3>No Results Found. Please Try Again</h3>
    `);
}

function displayForecast(forecastData) {
    var forecast = [];

    offset = (moment(forecastData.current.dt, "X").format("D") === moment(forecastData.daily[0].dt, "X").format("D") ? 1 : 0);

    for(var i = 0 + offset; i < fiveDay + offset; i++) {
        forecast.push(`
            <div class="forecastBox ${(forecastData.daily[i].temp.day)}">
                <h4>${moment(forecastData.daily[i].dt, "X").format("MM/DD/YYYY")}</h4>
                <img src="https://openweathermap.org/img/wn/${forecastData.daily[i].weather[0].icon}@2x.png" alt="weather icon" class="icon"> 
                <p>Temp: ${forecastData.daily[i].temp.day} <span>&#176;</span> F</p>
                <p>Wind: ${forecastData.daily[i].wind_speed} MPH</p>
                <p>Humidity: ${forecastData.daily[i].humidity} %</p>    
            </div>
        `)
    }
    return forecast.join("");
}

function weatherDisplayed(weatherData) {
    weatherDisplayEL.empty();
    weatherDisplayEL.append(`
        <div id="currentWeatherBox">
            <h2>${searchedCity} (${moment(weatherData.current.dt, "X").format("MM/DD/YYYY")})
                <img src="https://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}@2x.png" alt="weather icon" class="icon"> 
            </h2>
            <p>Temp: ${weatherData.current.temp} <span>&#176;</span> F</p>
            <p>Wind: ${weatherData.current.wind_speed} MPH</p>
            <p>Humidity: ${weatherData.current.humidity} %</p>
            <p>UV Index: <span class="uvColor ${(weatherData.current.uvi)}">${weatherData.current.uvi}</span></p>
        </div>
        <h3>5-Day Forecast:</h3>
        <div id="fiveDayContainer">
            ${displayForecast(weatherData)}
        </div>
    `);
}

function saveSearches() {
    localStorage.setItem("previousSearches", JSON.stringify(previousSearches));
}

function resetSearchBox() {
    searchEL.empty();
    searchEL.append(`
        <input type="search" placeholder="Ex: Seattle" class="form-control" id="searchInput">
        <button type="submit" class="btn" id="searchBtn">Search</button>
    `)
}

function clearHistoryDisplay() {
    previousSearchEL.empty();
    previousSearchEL.append(`
        <button type="button" class="btn clearBtn" value="clear">CLEAR HISTORY</button>
    `)
}

function displayPreviousSearch() {
    if(searchSuccess) {
        var cityCaps = searchedCity;

        for(var i = 0; i < previousSearches.length; i++) {
            if(cityCaps === previousSearches[i]) {
                previousSearches.splice(i, 1);
            }
        }

        previousSearches.unshift(cityCaps);
    }

    resetSearchBox();
    clearHistoryDisplay();

    for(var i = 0; i < previousSearches.length; i++) {
        previousSearchEL.append(`
            <button type="button" class="btn" value="${previousSearches[i]}">${previousSearches[i]}</button>
        `);
    }

    saveSearches();
}

function searchApiByCoordinates(lat, lon) {
    var locQueryUrl = `${APIurl}onecall?${lat}&${lon}&exclude=minutely,hourly&units=imperial&appid=${APIkey}`;

    fetch(locQueryUrl)
        .then(function (response) {
            if(!response.ok) {
                errorDisplay();
                throw response.json();
            }
            return response.json();
        })
        .then(function (locRes) {
            weatherDisplayed(locRes);
            searchSuccess = true;
            displayPreviousSearch();
        })
        .catch(function (error) {
            return error;
        });
}

function searchApiByCity() {
    var locQueryUrl = `${APIurl}weather?q=${searchedCity}&appid=${APIkey}`;

    fetch(locQueryUrl)
        .then(function (response) {
            if(!response.ok) {
                errorDisplay();
                throw response.json();
            }
            return response.json();
        })
        .then(function (locRes) {
            searchedCity = locRes.name;
            var cityLat = `lat=${locRes.coord.lat}`;
            var cityLon = `lon=${locRes.coord.lon}`;
            searchApiByCoordinates(cityLat, cityLon);
        })
        .catch(function (error) {
            return error;
        });
}

function handleSearchSubmit(event) {
    event.preventDefault();

    searchedCity = $("#searchInput").val();

    searchApiByCity();
}

function handleButtonClick(event) {
    event.preventDefault();

    var btnValue = event.target.value;

    if(btnValue === "clear") {
        clearHistoryDisplay();
        weatherDisplayEL.empty();
        previousSearches = [];
        saveSearches();
    } else {
        searchedCity = btnValue;
        searchApiByCity();
    }
}

displayPreviousSearch();

searchEL.on("submit", handleSearchSubmit);
previousSearchEL.on("click", handleButtonClick);