var APIkey = "c88b81178134ce9eddc0cd13e52c0184";
var APIURL = "https://api.openweathermap.org/data/2.5/";


var weatherDisplayEl = $("#weatherDisplay");


function displayNotFound() {
    weatherDisplayEl.empty();
    weatherDisplayEl.append(`<h3>No Results Found. Please Try Again</h3>`);
}

