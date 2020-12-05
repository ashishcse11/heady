require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');

// Create Express App
const app = express();

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// Configuring the database
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// mongoose.set('useCreateIndex', true);
// Connecting to the database
mongoose.connect(process.env.MONGO_CONN, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

// define a simple route
app.get('/', (req, res) => {
    res.json({"message": "Welcome to taskHeady application. The Task is Building a RESTful APIs from scratch using Express - Node.js."});
});

// Require Products routes
app.use('/team',require('./app/routes/team.routes.js'));

// Require Categories routes
app.use('/match',require('./app/routes/match.routes.js'));

// listen for requests
app.listen(3000, () => {
    console.log("Server is listening on port 3000");
});