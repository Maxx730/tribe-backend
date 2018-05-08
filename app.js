let mongo = require('mongodb');
let mongoose = require('mongoose');
let express = require('express');

//Initializes the express application, this must be done before
//applying any middleware to the app.
let app = express();

//Here we are going to set up our REST api for PUT and GET requests to
//the tribe backend database.


//Start the application on the given port.
app.listen(3000);
