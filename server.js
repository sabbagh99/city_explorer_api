'use strict';
var arrayObject = [];

let express = require('express');
const cors = require('cors');
let superagent = require('superagent');



let app = express();
app.use(cors());
require('dotenv').config();


const PORT = process.env.PORT;
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('*', handle404);



//  handle location 
function handleLocation(req, res) {
    let searchQuery = req.query.city;
    // getLocationData(searchQuery);
   getLocationData(searchQuery).then(locationData=>{
       res.status(200).send(locationData);
   });
    



}
// handle weather 

function handleWeather(req, res) {

    let requset = req.query;
    let weatherData = getWeatherDeta(requset);
    res.status(200).send(weatherData);
}


// 404 function

function handle404(req, res) {
    res.status(404).send('Sorry, the page you are trying to access does not exist....'); 
}

// 


function getWeatherDeta() {
    try {
        let weatherData = require('./data/weather.json');
        weatherData.data.map(element => {
            let time = new Date(element.valid_date);
            const event = time;
            const option = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            let chrTime = event.toLocaleDateString('en-US', option);

            let forecast = element.weather.description;
            let weatherObject = new CityWeather(forecast, chrTime);
            arrayObject.push(weatherObject);
        });
        return arrayObject;
    }
    catch (error) {
        res.status(500).send('Sorry, an error occured ..' + error);
    }
}


function getLocationData(searchQuery) {
    const query = {
        key: process.env.GEOCODE_API_KEY,
        q: searchQuery,
        limit: 1,
        format: 'json'
      };
      let url = 'https://us1.locationiq.com/v1/search.php';
     return superagent.get(url).query(query).then(locationData=>{

    try {
        let longatude = locationData.body[0].lon;
        let latatude = locationData.body[0].lat;
        let displayName = locationData.body[0].display_name;
        let responseObject = new CityLocation(searchQuery, displayName, latatude, longatude);
        return responseObject;
    }
    catch (error) {
        res.status(500).send('Sorry, an error occured ..' + error);
    }
}).catch (error=>{
    res.status(500).send('There was an error getting data from API ' + error);
})


}


function CityLocation(searchQuery, displayName, lot, lon) {
    this.search_query = searchQuery;
    this.formatted_query = displayName;
    this.latitude = lon;
    this.longitude = lot;
}

function CityWeather(forecast, time) {
    this.forecast = forecast;
    this.time = time;
}



app.listen(PORT, () => {
    console.log('the app is listen on port' + PORT);
});

