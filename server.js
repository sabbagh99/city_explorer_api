'use strict';

let express = require('express');

const cors = require('cors');


let app = express();
app.use(cors());



require('dotenv').config();

const PORT = process.env.PORT;
app.get('/location', handleLocation);


//  handle location 
function handleLocation(req, res) {
    let searchQuery = req.query.city;
    // getLocationData(searchQuery);
    let locationData = getLocationData(searchQuery);
    res.status(200).send(locationData);


}

function getLocationData(searchQuery) {
    let locationData = require('./data/location.json');
    let longatude = locationData[0].lon;
    let latatude = locationData[0].lat;
    let displayName = locationData[0].display_name;
    let responseObject = new CityLocation(searchQuery,displayName,latatude,longatude);
    return responseObject;

}function CityLocation (searchQuery,displayName,lot,lon){
    this.search_query = searchQuery;
    this.formatted_query =displayName;
    this.latitude = lon;
    this.longitude = lot;  
}
app.listen(PORT, () => {
    console.log('the app is listen on port' + PORT);
});



