'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
// const pg = require('pg');




let app = express();
app.use(cors());
require('dotenv').config();
// const client = new pg.Client(process.env.DATABASE_URL);


const PORT = process.env.PORT;
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/parks', handlePark);
app.get('*', handleerror);



//  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>handle location<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<
function handleLocation(req, res) {

  let searchQuery = req.query.city;

  getLocationData(searchQuery, res).then(locationData => {
    res.status(200).send(locationData);
  });

}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>handle weather<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function handleWeather(req, res) {
  getWeatherDeta(req, res).then(data => {
    res.status(200).send(data);
  });
}


// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>handle 404 function<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<

function handleerror(req, res) {
  res.status(404).send('Sorry, the page you are trying to access does not exist....');
}

// handle park
function handlePark(req, res) {
  getParkData(req, res).then(parkData => {
    res.status(200).send(parkData);
  });

}

//=============Get wether data===============

function getWeatherDeta(req, res) {
  console.log(req.query);
  const query = {

    key: process.env.WEATHER_API_KEY,
    city: req.query.search_query
  };

  let url = 'http://api.weatherbit.io/v2.0/forecast/daily';
  return superagent.get(url).query(query).then(data => {
    try {
      let arrayObject = [];

      data.body.data.map(value => {
        let time = value.datetime;
        let x = turndate(time);
        let forecast = value.weather.description;
        let weatherObject = new CityWeather(forecast, x);
        arrayObject.push(weatherObject);
      });
      return arrayObject;
    } catch (error) {
      res.status(500).send('Sorry, an error occured ..' + error);
    }
  }).catch(error => {
    res.status(500).send('There was an error getting data from API ' + error);
  });
}


//=========================turn date=============

function turndate(day) {
  let time = new Date(day);
  const event = time;
  const option = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
  let chrTime = event.toLocaleDateString('en-US', option);
  return chrTime;
}

//====================Get location Data===============================

function getLocationData(searchQuery, res) {
  const query = {
    key: process.env.GEOCODE_API_KEY,
    q: searchQuery,
    limit: 1,
    format: 'json'
  };
  let url = 'https://us1.locationiq.com/v1/search.php';
  return superagent.get(url).query(query).then(locationData => {
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
  }).catch(error => {
    res.status(500).send('There was an error getting data from API ' + error);
  });

}


function getParkData(req, res) {
  const query = {

    key: process.env.PARKS_API_KEY,
    city: req.query.search_query
  };

  let url = 'https://developer.nps.gov/api/v1/parks';
  return superagent.get(url).query(query).then(parkData => {
    try {
      let parksArray = [];
      console.log(parksArray);
      parkData.body.data.map(value => {
        let name = value.fullName;
        let address = (value.addresses[0].line1);
        let fee = value.entranceFees[0].cost;
        let description = value.description;
        let url = value.url;
        let parksObject = new CityPark(name, address, fee, description, url);
        parksArray.push(parksObject);
        console.log(name,address,fee,description,url);
      });
      return parksArray;
    } catch (error) {
      res.status(500).send('Sorry, an error occured ..' + error);
    }
  }).catch(error => {
    res.status(500).send('There was an error getting data from API ' + error);
  });

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

function CityPark(name, address, fee, description, url) {
  this.name = name;
  this.address = address;
  this.fee = fee;
  this.description = description;
  this.url = url;
}
//===================================================Parks=========================
app.listen(PORT, () => {
  console.log('the app is listening to port ' + PORT);
});
