// global variables
var APIkey = "c88b81178134ce9eddc0cd13e52c0184";
var APIurl = "https://api.openweathermap.org/data/2.5/";

// elements created from html
var searchEL = $("#search");
var previousSearchEL = $("#previousSearch");
var weatherDisplayEL = $("#weatherDisplay");

// tracking variables
var citySearched;
var successfulSearch = false; //equaling false because we are implying that the user is going to enter an incorrect city, and will become true ONLY IF the user typed a legitmate city. The data is pulled from 'APIurl'
var fiveDays = 5;
var offset = 0; //starting off at 0 because that is the current day.
var previousSearches = JSON.parse(localStorage.getItem("previousSearches")) || [];

// if user types an incorrect city, or a city that does not exist within the API, error will display.
function errorDisplay() {
    weatherDisplayEL.empty();
    weatherDisplayEL.append(`
        <div id="error">
        <h2>No Results Found.</h2>
        <h2>Please Enter a Valid City.</h2>
        </div>
    `);
}

// The weather is displayed on the screen in its appropriate format of the current day and city that was typed. It also leads into its forecasted display.
function weatherDisplayed(weatherData) {
    weatherDisplayEL.empty();
    weatherDisplayEL.append(`
        <div id="currentWeatherBox">
            <h2>${citySearched} (${moment(weatherData.current.dt, "X").format("MM/DD/YYYY")})
                <img src="https://openweathermap.org/img/wn/${weatherData.current.weather[0].icon}@2x.png" alt="weather icon" class="icon"> 
            </h2>
            <p>Temp: ${weatherData.current.temp} <span>&#176;</span>F</p>
            <p>Wind: ${weatherData.current.wind_speed} MPH</p>
            <p>Humidity: ${weatherData.current.humidity} %</p>
            <p>UV Index: <span class="uvIndex ${(weatherData.current.uvi)}">${weatherData.current.uvi}</span></p>
        </div>
        <h3>5-Day Forecast:</h3>
        <div id="fiveDays">
            ${forecastDisplayed(weatherData)}
        </div>
    `);
}

// Here is where the next 5 days of forecasted weather will appear starting with tomorrows forecast.
function forecastDisplayed(forecastData) {
    var forecast = [];

    offset = (moment(forecastData.current.dt, "X").format("D") === moment(forecastData.daily[0].dt, "X").format("D") ? 1 : 0);

    for(var i = 0 + offset; i < fiveDays + offset; i++) {
        forecast.push(`
            <div class="forecastBox ${(forecastData.daily[i].temp.day)}">
                <h4>${moment(forecastData.daily[i].dt, "X").format("MM/DD/YYYY")}</h4>
                <img src="https://openweathermap.org/img/wn/${forecastData.daily[i].weather[0].icon}@2x.png" alt="weather icon" class="icon"> 
                <p>Temp: ${forecastData.daily[i].temp.day} <span>&#176;</span>F</p>
                <p>Wind: ${forecastData.daily[i].wind_speed} MPH</p>
                <p>Humidity: ${forecastData.daily[i].humidity} %</p>    
            </div>
        `)
    }
    return forecast.join("");
}

// Here we are calling the api's longitude and latitude for the wind, UV, etc.
function searchApiByCoordinates(lat,lon) {
    var locQueryUrl = `${APIurl}onecall?${lat}&${lon}&exclude=minutely,hourly&units=imperial&appid=${APIkey}`;

    fetch(locQueryUrl)
        .then(function (response) {
            if(!response.ok) {
                errorDisplay();
                throw response.json();
            }
            return response.json();
        })
        .then(function (local) {
            weatherDisplayed(local);
            successfulSearch = true;
            displayPreviousSearch();
        })
        .catch(function (error) {
            return error;
        });
}

// Similar to the function above, but this is purely for the city
function searchApiByCity() {
    var locQueryUrl = `${APIurl}weather?q=${citySearched}&appid=${APIkey}`;

    fetch(locQueryUrl)
        .then(function (response) {
            if(!response.ok) {
                errorDisplay();
                throw response.json();
            }
            return response.json();
        })
        .then(function (local) {
            citySearched = local.name;
            var cityLat = `lat=${local.coord.lat}`;
            var cityLon = `lon=${local.coord.lon}`;
            searchApiByCoordinates(cityLat, cityLon);
        })
        .catch(function (error) {
            return error;
        });
}

// Save the correct inputed searches locally
function saveSearches() {
    localStorage.setItem("previousSearches", JSON.stringify(previousSearches));
}

// This will clear the searchbox everytime the user clicks enter or 'search'
function clearSearchbox() {
    searchEL.empty();
    searchEL.append(`
        <input type="search" placeholder="Bellevue" class="form-control" id="searchInput">
        <button type="submit" class="btn" id="searchBtn">Search</button>
    `)
}

// Will clear the saved cities
function clearSavedHistory() {
    previousSearchEL.empty();
    previousSearchEL.append(`
        <button type="button" class="btn" id="clearBtn" value="clear">Clear</button>
    `)
}

// This function displays the searches entered thus far
function displayPreviousSearch() {
    if(successfulSearch) {
        var cities = citySearched;

        for(var i = 0; i < previousSearches.length; i++) {
            if(cities === previousSearches[i]) {
                previousSearches.splice(i, 1);
            }
        }
        previousSearches.unshift(cities);
    }

    clearSavedHistory();
    clearSearchbox();

    for(var i = 0; i < previousSearches.length; i++) {
        previousSearchEL.append(`
            <button type="button" class="btn" value="${previousSearches[i]}">${previousSearches[i]}</button>
        `);
    }

    saveSearches();
}

// Submit the searched up city for API to find
function searchSubmit(event) {
    event.preventDefault();

    citySearched = $("#searchInput").val(); //pulled id from function 'clearSearchbox'

    searchApiByCity();
}

// Once the search buttion is clicked, display values
function buttonClick(event) {
    event.preventDefault();

    var btnValue = event.target.value;

    if(btnValue === "clear") {
        clearSavedHistory();
        weatherDisplayEL.empty();
        previousSearches = [];
        saveSearches();
    } else {
        citySearched = btnValue;
        searchApiByCity();
    }
}

// calling function
displayPreviousSearch();

// event listeners
searchEL.on("submit", searchSubmit);
previousSearchEL.on("click", buttonClick);