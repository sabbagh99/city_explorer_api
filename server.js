'use strict';
var arrayObject = [];
let express = require('express');

const cors = require('cors');


let app = express();
app.use(cors());



require('dotenv').config();

const PORT = process.env.PORT;
app.get('/location', handleLocation);
app.get('/weather',handleWeather);



//  handle location 
function handleLocation(req, res) {
    let searchQuery = req.query.city;
    // getLocationData(searchQuery);
    let locationData = getLocationData(searchQuery);
    res.status(200).send(locationData);



}
// handle weather 

function handleWeather(req,res){

    let requset = req.query;
    let weatherData = getWeatherDeta(requset);
    res.status(200).send(weatherData);
}

function getWeatherDeta (){
    let weatherData = require ('./data/weather.json');
    for (let index = 0; index < weatherData.data.length; index++) {
        let time = weatherData.data[index].valid_date;
        let forecast = weatherData.data[index].weather.description;
        let weatherObject = new CityWeather (forecast,time);
        arrayObject.push(weatherObject);
        return arrayObject;
    };
    
}


function getLocationData(searchQuery) {
    let locationData = require('./data/location.json');
    let longatude = locationData[0].lon;
    let latatude = locationData[0].lat;
    let displayName = locationData[0].display_name;
    let responseObject = new CityLocation(searchQuery,displayName,latatude,longatude);
    return responseObject;

}


function CityLocation (searchQuery,displayName,lot,lon){
    this.search_query = searchQuery;
    this.formatted_query =displayName;
    this.latitude = lon;
    this.longitude = lot;
}

function CityWeather (forecast,time){
    this.forecast = forecast;
    this.time = time;
}
app.listen(PORT, () => {
    console.log('the app is listen on port' + PORT);
});

console.log(arrayObject);
