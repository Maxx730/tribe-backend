let mongo = require('mongodb');
let mongoose = require('mongoose');
let express = require('express');
let body = require('body-parser');
let TribeUsers = require("./models/user");
let Tribes = require("./models/tribe");

//ERROR CODES
EMAIL_EXISTS = 237;

//Connect to Mongoose
mongoose.connect("mongodb://localhost:27017/tribe");

//Initializes the express application, this must be done before
//applying any middleware to the app.
let app = express();
app.use(body.urlencoded());
app.use(body.json());

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

//TRIBE FUNCTIONS HERE
//GET TRIBE BY NAME
app.get('/tribe/:name',function(req,res){
  Tribes.getTribeByName(req.params.name,function(err,tribes){
    if(err){
      throw err;
    }else{
      res.json(tribes);
    }
  });
});
//GET TRIBES BY CREATOR
app.get('/tribe/creator/:creator',function(req,res){
  Tribes.getTribesByCreator(req.params.creator,function(err,tribes){
    if(err){
      throw err;
    }else{
      res.json(tribes);
    }
  });
});
//ADD TRIBE TO DATABASE.
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
//GET USER BY USERNAME
app.get('/user/:name',function(req,res){
  TribeUsers.getUserByName(req.params.name,function(err,users){
    if(err){
      throw err;
    }else{
      res.json(users);
    }
  });
});
//ADDS NEW USER TO THE DATABASE I.E SIGNUP
app.post('/user/new',function(req,res){
  let post_date = req.body;

  //CHECK IF THE NEW USER EMAIL ALREADY EXISTS WITHIN THE DATABASE.
  TribeUsers.checkUserEmail(req.body.email,function(err,res){
    if(err){
      throw err;
    }else{
      if(res.length > 0){
        //THROW AN ERROR CODE BASED ON WHAT WAS WRONG, I.E. THE EMAIL ALREADY EXISTS.
      }else{
        console.log("adding new user to database");
      }
    }
  });
});

//Start the application on the given port.
app.listen(4000);
module.exports = app;
