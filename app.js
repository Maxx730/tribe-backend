let mongo = require('mongodb');
let mongoose = require('mongoose');
let express = require('express');
let body = require('body-parser');
let TribeUsers = require("./models/user");
let Tribes = require("./models/tribe");

//ERROR CODES
EMAIL_EXISTS = 237;

//SUCCESS_CODES
USER_CREATED = 337;

//Connect to Mongoose
mongoose.connect("mongodb://localhost:27017/tribe");

//Initializes the express application, this must be done before
//applying any middleware to the app.
let app = express();
app.use(body.urlencoded({extended:true}));
app.use(body.json());


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//First two functions are very simple, they are going to simply just spit out all
//of the users (for now) and tribes mostly for building purposes within our backend.

//GET ALL USERS
app.get('/users',function(req,res){
  TribeUsers.getUsers(function(err,users){
    if(err){
      throw err;
    }else{
      res.json(users);
    }
  });
});

//GET ALL TRIBES
app.get('/tribes',function(req,res){
  Tribes.getTribes(function(err,tribes){
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
//{
//  title: required
//  description: required
//  creator: required
//}
app.post('/tribe/add',function(req,res){
  //Grab all the info passed in through the post form.
  let post_date = req.body;

  console.log(req.body);

  //First check if the database already has a tribe with the name
  Tribes.checkTribeUser(req.body.title,req.body.creator,function(err,tribes){
    res.setHeader('Content-Type','application/json');
    if(err){
      throw err;
    }else{
      if(tribes.length == 0){
        //Now add the tribe to the database.
        Tribes.addTribe(req.body,function(err,tribe){
          if(err){
            throw err;
          }else{
            res.json({"SUCCESS":"TRIBE CREATED"});
            res.end();
          }
        })
      }else{
        res.json({error:{type:"TRIBE ALREADY CREATED"}});
        res.end();
      }
    }
  });
  //After we have hit the post request we want to verify the information coming in and
  //pass it along to the mongo database schema object.
  //Tribes.addTribe(req.body);
});

//ADD USER TO TRIBE
//{
//  user_id: required
//  tribe_id: required
//}
app.post('/tribe/add/user',function(req,res){
  Tribes.checkUserInTribe(req.body.tribeId,req.body.userId,function(err,tribe){
    res.setHeader('Content-Type','application/json');
    if(err){
      throw err;
    }else{
      if(tribe.length == 0){
        Tribes.addUserToTribe(req.body.tribeId,req.body.userId,function(err,tribe){
          if(err){
            throw err;
          }else{
            res.json({"SUCCESS":"USER ADDED TO TRIBE"});
            res.end();
          }
        });
      }else{
        res.json({"ERROR":{"type":"USER ALREADY IN TRIBE"}});
        res.end();
      }
    }
  });
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
  console.log(req.body);
  //CHECK IF THE NEW USER EMAIL ALREADY EXISTS WITHIN THE DATABASE.
  TribeUsers.checkUserEmail(req.body.email,function(err,resu){
    res.setHeader('Content-Type','application/json');
    if(err){
      throw err;
      res.end();
    }else{
      if(resu.length > 0){
        //THROW AN ERROR CODE BASED ON WHAT WAS WRONG, I.E. THE EMAIL ALREADY EXISTS.
        //MOBILE APPLICATION WILL READ THIS ERROR CODE TO DETERMINE WHAT WHEN WRONG.
        res.json({error:{type:"EMAIL_EXISTS"}});
        res.end();
      }else{
        //HERE WE ACTUALLY WANT TO ADD ANOTHER USER TO THE DATABASE.
        TribeUsers.addNewUser(req.body,function(err,result){
          if(err){
            throw err;
            res.end();
          }else{
            res.json({type:"USER_CREATED"});
            res.end();
          }
        })
      }
    }
  });
});

//LOGIN FUNCTIONS BEGIN HERE
app.post('/user/login',function(req,res){
  let post_data = req.body;

  TribeUsers.checkNamePassword(req.body.username,req.body.password,function(err,resu){
    res.setHeader('Content-Type','application/json');
      if(err){
        throw err;
        res.end();
      }else{
        if(resu.length > 0){
          res.json({type:"SUCCESS",message:"LOGIN SUCCESS",requested:req.body});
        }else{
          res.json({type:"ERROR",message:"LOGIN FAILED",requested:req.body});
        }
      }

      res.end();
  });
});


//RETURNS ALL THE EVENTS ASSOCIATED WITH A GIVEN TRIBE.
app.get('/events/:tribeId',function(req,res){
  
});

//FUNCTIONS TO RETURN IDS BASED ON USERNAME OR TRIBE

//Start the application on the given port.
app.listen(4000);
module.exports = app;
