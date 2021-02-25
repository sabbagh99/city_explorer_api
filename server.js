'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');




let app = express();
app.use(cors());
require('dotenv').config();
// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });


const PORT = process.env.PORT;
app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/parks', handlePark);
app.get('/movies', handleMovie);
app.get('/yelp', handleYelp);
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

//  handel movies 

function handleMovie(req, res) {
  getMovieData(req, res).then(movieData => {
    res.status(200).send(movieData);
  });
}

//  handle yelp 

function handleYelp(req, res) {
  getYelpData(req, res).then(yelpData => {
    res.status(200).send(yelpData);
  });


}

//=============Get wether data===============

function getWeatherDeta(req, res) {
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

//    getMovieData function 

function getMovieData(req, res) {
  const query = {
    api_key: process.env.MOVIE_API_KEY,
    query: req.query.search_query
  };

  let url = 'https://api.themoviedb.org/3/search/movie';
  return superagent.get(url).query(query).then(movieData => {
    try {
      // console.log(movieData);
      let arrayMovie = movieData.body.results.map(value => {
        let titleMovie = value.title;
        let overviewMovie = value.overview;
        let averageVotes = value.vote_avarage;
        let totalVotes = value.vote_count;
        let imageUrl = 'https://image.tmdb.org/t/p/w500' +value.poster_path;
        let popularityMovie = value.popularity;
        let releasedOn = value.release_date;
        let movieObject = new CityMovie(titleMovie, overviewMovie, averageVotes, totalVotes, imageUrl, popularityMovie, releasedOn);
        // arrayMovie.push(movieObject);
        // return arrayMovie;
        return movieObject;
      });
      // console.log(arrayMovie);
      res.status(200).send(arrayMovie);
    } catch (erorr) {
      console.log('erorr in geting movie info' + erorr);
    }

  }).catch(error => {
    res.status(500).send('There was an error getting data from API ' + error);
  });
}

function getYelpData(req, res) {
  const query = {
    location: req.query.search_query
  };
  // console.log(req.query.search_query);
  let url = 'https://api.yelp.com/v3/businesses/search';
  return superagent.get(url).set('Authorization', `Bearer ${process.env.YELP_API_KEY}`).query(query).then(yelpData => {
    try {
      // console.log(yelpData.body);
      let arrayYelp = [];
      yelpData.body.businesses.map(value => {
        let nameYelp = value.name;
        let image_urlYelp = value.image_url;
        let priceYelp = value.price;
        let ratingYelp = value.rating;
        let urlYelp = value.url;
        let yeloObject = new CityYelp(nameYelp, image_urlYelp, priceYelp, ratingYelp, urlYelp);
        arrayYelp.push(yeloObject);
      });
      return arrayYelp;
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
  let checkExisit = 'SELECT * FROM city_info WHERE city_name=$1';
  let safeValues = [searchQuery];
  return client.query(checkExisit, safeValues).then(locationData => {
    if (locationData.rowCount !== 0) {
      let databaseRecord = locationData.rows[0];
      let locationObject = new CityLocation(databaseRecord.city_name, databaseRecord.formatted_query, databaseRecord.lat, databaseRecord.lon);
      return locationObject;

    }
    else {
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
          let dbQuery = `INSERT INTO city_info(city_name, lon,lat,formatted_query) VALUES ($1,$2,$3,$4)RETURNING *`;
          let safeValues = [searchQuery, longatude, latatude, displayName];

          client.query(dbQuery, safeValues).then(() => {
            console.log('data returned back from db ');
          }).catch(error => {
            console.log('an error occurred ' + error);
          });

          return responseObject;

        }
        catch (error) {
          res.status(500).send('Sorry, an error occured ..' + error);
        }


      }).catch(error => {
        res.status(500).send('There was an error getting data from API ' + error);
      });
    }
  }).catch(error => {
    res.status(500).send('location ' + error);
  });

}


function getParkData(req, res) {
  const query = {

    api_key: process.env.PARKS_API_KEY,
    p: req.query.search_query
  };

  let url = 'https://developer.nps.gov/api/v1/parks';
  return superagent.get(url).query(query).then(parkData => {
    try {
      let parksArray = [];
      parkData.body.data.map(value => {
        let name = value.fullName;
        let address = (value.addresses[0].line1);
        let fee = value.entranceFees[0];
        let description = value.description;
        let url = value.url;
        let parksObject = new CityPark(name, address, fee, description, url);
        parksArray.push(parksObject);
      });
      return parksArray;
    } catch (error) {
      res.status(500).send('Sorry, an error occured ..' + error);
    }
  }).catch(error => {
    res.status(500).send('There was an error getting data from API ' + error);
  });

}

function CityYelp(nameYelp, image_urlYelp, priceYelp, ratingYelp, urlYelp) {
  this.name = nameYelp;
  this.image_url = image_urlYelp;
  this.price = priceYelp;
  this.rating = ratingYelp;
  this.url = urlYelp;
}

function CityMovie(titleMovie, overviewMovie, averageVotes, totalVotes, imageUrl, popularityMovie, releasedOn) {
  this.title = titleMovie;
  this.overview = overviewMovie;
  this.average_votes = averageVotes;
  this.total_votes = totalVotes;
  this.image_url = imageUrl;
  this.popularity = popularityMovie;
  this.released_on = releasedOn;
}
function CityLocation(locationData, displayName, latatude, longatude) {
  this.search_query = locationData;
  this.formatted_query = displayName;
  this.latitude = latatude;
  this.longitude = longatude;
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
client.connect().then(() => {
  app.listen(PORT, () => {
    console.log('the app is listening to port ' + PORT);
  });
}).catch(error => {
  console.log('an error occurred while connecting to database ' + error);
});
