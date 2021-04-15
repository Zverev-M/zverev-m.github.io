const MongoClient = require("mongodb").MongoClient;
const express = require('express')
const fetch = require("node-fetch")
const app = express()
const port = 3000;

const url = "mongodb://localhost:27017/";
const mongoClient = new MongoClient(url, { useUnifiedTopology: true });

const parseIp = (req) =>
    (typeof req.headers['x-forwarded-for'] === 'string'
        && req.headers['x-forwarded-for'].split(',').shift())
    || req.connection?.remoteAddress
    || req.socket?.remoteAddress
    || req.connection?.socket?.remoteAddress

const selectByCity = (city) => {
    return `https://api.openweathermap.org/data/2.5/weather?q=${city}&lang=ru&appid=94d4575428dc92002c2aca36ad6f2ca9`
}

const selectByCoords = (lat, lon) => {
    return `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&lang=ru&appid=94d4575428dc92002c2aca36ad6f2ca9`
}

let allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Headers', "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
}

app.use(allowCrossDomain);

app.get('/weather/city', (request, response) => {
    const city = request.query['q'];
    fetch(selectByCity(encodeURIComponent(city)))
        .then(response => response.json())
        .then(data => {
            response.send(data);
        })
})

app.get('/weather/coordinates', (request, response) => {
    const lat = request.query['lat'];
    const lon = request.query['lon'];
    fetch(selectByCoords(lat, lon))
        .then(response => response.json())
        .then(data => {
            response.send(data);
        })
})

app.get('/features', (request, response) => {
    let ip = parseIp(request);
    if (ip) {
        mongoClient.connect((err, client) => {
            var db = client.db("citiesDB");
            var collection = db.collection("cities");

            collection.find({"ip": ip}).toArray((err, result) => {
                let cities = result;
                console.log(result);
                response.send(Array.prototype.map.call(cities, el => el['city']));
            });
        })
    }
})

app.post('/features', (request, response) => {
    let ip = parseIp(request);
    let city = request.query['city'];
    if (ip && city) {
        mongoClient.connect((err, client) => {
            var db = client.db("citiesDB");
            var collection = db.collection("cities");

            collection.insertOne({"ip": ip, "city": city}, (err, result) => {
                if (err) {
                    console.log(err);
                }
                response.send(city);
            });
        });
    }
})

app.delete('/features', (request, response) => {
    let ip = parseIp(request);
    let city = request.query['city'];
    if (ip && city) {
        mongoClient.connect( (err, client) => {
            var db = client.db("citiesDB");
            var collection = db.collection("cities");

            collection.deleteOne({"ip": ip, "city": city}, function (err, result){
                if (err) {
                    console.log(err);
                } else {
                    console.log(result);
                }
                response.send(city);
            });
        });
    }
})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err);
    }
    console.log(`server is listening on ${port}`);
})