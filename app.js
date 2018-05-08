let mongo = require('mongodb');
let mongoose = require('mongoose');
let express = require('express');
let body = require('body-parser');

//Connect to Mongoose
mongoose.connect('mongodb://localhost:27017/tribe');
let tribe_db = mongoose.connection;

//Initializes the express application, this must be done before
//applying any middleware to the app.
let app = express();

//Here we are going to set up our REST api for PUT and GET requests to
//the tribe backend database.
//GET Request first here, POST will come later when adding things to the database.

//First two functions are very simple, they are going to simply just spit out all
//of the users (for now) and tribes mostly for building purposes within our backend.
app.get('/users',function(req,res){

});

app.get('/tribes',function(req,res){

});

//Start the application on the given port.
app.listen(4000);
module.exports = app;
