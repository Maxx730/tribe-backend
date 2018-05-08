let mongo = require('mongodb');
let mongoose = require('mongoose');
let express = require('express');
let body = require('body-parser');
let TribeUsers = require("./models/user");
let Tribes = require("./models/tribe");
//Connect to Mongoose
mongoose.connect("mongodb://localhost:27017/tribe");

//Initializes the express application, this must be done before
//applying any middleware to the app.
let app = express();

//Here we are going to set up our REST api for PUT and GET requests to
//the tribe backend database.
//GET Request first here, POST will come later when adding things to the database.

//First two functions are very simple, they are going to simply just spit out all
//of the users (for now) and tribes mostly for building purposes within our backend.
app.get('/users',function(req,res){
  TribeUsers.getUsers(function(err,users){
    if(err){
      throw err;
    }else{
      res.json(users);
    }
  });
});

app.get('/tribes',function(req,res){
  Tribes.getTribes(function(err,tribes){
    if(err){
      throw err;
    }else{
      res.json(tribes);
    }
  });
});

//Here we are going to start having more specific requests such as, get tribes by username
//id, creator etc.

//TRIBE FUNCTIONS HERE
app.get('/tribe/:name',function(req,res){

});

app.get('/tribe/:creator',function(req,res){

});

//USER FUNCTIONS HERE

//Start the application on the given port.
app.listen(4000);
module.exports = app;
