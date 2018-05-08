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
app.use(body.urlencoded());
app.use(body.json());

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
  Tribes.getTribeByName(req.params.name,function(err,tribes){
    if(err){
      throw err;
    }else{
      res.json(tribes);
    }
  });
});

app.get('/tribe/creator/:creator',function(req,res){
  Tribes.getTribesByCreator(req.params.creator,function(err,tribes){
    if(err){
      throw err;
    }else{
      res.json(tribes);
    }
  });
});

app.post('/tribe/add',function(req,res){
  //Grab all the info passed in through the post form.
  let post_date = req.body;

  //First check if the database already has a tribe with the name
  Tribes.getTribeByName(req.body.title,function(err,tribe){
    if(err){
      throw err;
    }else{
      //Check if tribe is not empty, if not then the tribe with the new title already exists.
      if(tribe.length > 0){
        console.log("we have found a tribe with said name.");
      }else{
        console.log("we have NOT found a tribe with said name.");
      }
    }
  });
  //After we have hit the post request we want to verify the information coming in and
  //pass it along to the mongo database schema object.
  //Tribes.addTribe(req.body);
});

//USER FUNCTIONS HERE
app.get('/user/:name',function(req,res){
  TribeUsers.getUserByName(req.params.name,function(err,users){
    if(err){
      throw err;
    }else{
      res.json(users);
    }
  });
});



//Start the application on the given port.
app.listen(4000);
module.exports = app;
