let mongo = require('mongodb');
let mongoose = require('mongoose');
let express = require('express');
let body = require('body-parser');
let bcrypt = require('bcrypt');

let SALT_WORK_FACTOR = 10;

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

//
//
//DEFINE OUR MONGOOSE SCHEMAS HERE
let Schema = mongoose.Schema;

//USER SCHEMA
let UserSchema = new Schema({
  _id: Schema.Types.ObjectId,
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true },
  firstname: String,
  lastname: String,
  email: { type: String, required: true },
  bio: { type: String, default: "" },
  signup: {type: Date, default: Date.now },
  profileImage: { type: String, default:"" },
});

//TRIBE SCHEMA
let TribeSchema = new Schema({
  _id: Schema.Types.ObjectId,
  title: { type: String, required: true },
  description: { type: String },
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  events: [{ type: Schema.Types.ObjectId, ref: 'Event' }],
  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
  votes: [{ type: Schema.Types.ObjectId, ref: 'Vote' }]
});

//EVENT SCHEMA
let EventScema = new Schema({
  _id: Schema.Types.ObjectId,
  title: String,
  description: String,
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  startDate: { type: Date },
  endDate: { type: Date },
  membersGoing: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  membersNotGoing: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

let CommentSchema = new Schema({
    _id: Schema.Types.ObjectId,
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    comment: String,
    posted: { type: Date }
});

let PostSchema = new Schema({
  _id: Schema.Types.ObjectId,
  tribe:  { type: Schema.Types.ObjectId, ref: 'Tribe' },
  user:  { type: Schema.Types.ObjectId, ref: 'User' },
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comments' }],
  content: String,
  image: String
});

let VoteSchema = new Schema({
  _id: Schema.Types.ObjectId,
  tribe: { type: Schema.Types.ObjectId, ref: 'Tribe' },
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  vote_type: { type: String, required: true },
  votes_yes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  votes_no: [{ type: Schema.Types.ObjectId, ref: 'User' }]
})


//
// SCHEMA FUNCTIONS ARE HERE.
//

    //
    //USER SCHEMA FUNCTIONS HERE
    //

    //BEFORE WE SAVE A USER RUN THIS.
    UserSchema.pre('save',function(next){
      let user = this;

      //ONLY HASH PASSWORD IF CHANGED OR IS NEW.
      if(!user.isModified('password')){
        return next();
      }

      bcrypt.genSalt(SALT_WORK_FACTOR,function(err,salt){
        if(err){
          return next(err);
        }else{
          bcrypt.hash(user.password,salt,function(err,hash){
            if(err){
              return next(err);
            }else{
              user.password = hash;
              next();
            }
          })
        }
      })
    })

    //FUNCTION USED WHEN LOGGING IN THE COMPARE PASSWORDS TO MAKE SURE THE USER CAN LOG IN
    UserSchema.methods.comparePassword = function(candidate,callback){
      bcrypt.compare(candidate,this.password,function(err,match){
        if(err){
          return callback(err);
        }else{
          callback(undefined,match)
        }
      })
    }

    //
    //END USER SCHEMA FUNCTIONS
    //

//
// SCHEMA FUNCTIONS END HERE.
//



let Votes = mongoose.model('Vote', VoteSchema);
let Users = mongoose.model('User', UserSchema);
let Comments = mongoose.model('Comment', CommentSchema);
let Posts = mongoose.model('Post', PostSchema);
let Events = mongoose.model('Event', EventScema);
let Tribes = mongoose.model('Tribe', TribeSchema);
//END OF DEFINING MONGOOSE SCHEMAS
//
//

//
//ENDPOINTS FOR EXPRESS ARE HERE
//
  
    //
    //USER ENDPOINTS START HERE
    //

    //FIND A USER BY GIVEN ID. (WE NEED TO MAKE SURE TO PREVENT SENDING THE PASSWORD BACK)
    app.get('/user/:id',(req,res) => {
      res.set('Content-Type', 'application/json');
      
      Users.findOne({_id:req.params.id}).exec(function(err,user){
        if(!err && user != null){
          res.json({username:user.username,firstname:user.firstname,lastname:user.lastname,bio:user.bio});
          res.end();
        }else{
          res.end();
        }
      })
    });

    //CREATE A NEW USER IN THE USER COLLECTION
    app.post('/user/new',(req,res) => {
      res.set('Content-Type', 'application/json');

      //MAKE SURE ALL THE REQUIRED FIELDS ARE IN THE REQUEST BODY BEFORE ADDING/CHECKING IF A USER EXISTS IN THE DATABASE.
      if(req.body.username != null && req.body.username != "" && typeof req.body.username != "undefined" && req.body.password != null && req.body.password != "" && typeof req.body.password != "undefined" && req.body.email != null && req.body.email != "" && typeof req.body.email != "undefined"){

        Users.find({username:req.body.username}).exec(function(err,user){
          if(user.length == 0){

            //IF THERE ARE NOW USERS WITH THE GIVEN USERNAME IN THE DATABASE, THEN WE NOW WANT TO CREATE A NEW USER.
            let new_user = new Users({
              _id: new mongoose.Types.ObjectId(),
              username: req.body.username,
              password: req.body.password,
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              email: req.body.email
            });

            //SAVE THE NEW USER TO THE MONGO DATABASE.
            new_user.save(function(err){
              if(err){
                res.status(200);
                res.json({"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"PROBLEM SAVING USER TO DATABASE"}}}});
                res.end();
              }else{
                res.status(200);
                res.json({"RESULT":{"TYPE":{"SUCCESS":{"MESSAGE":"SAVED "+req.body.username+" TO DATABASE"}}}});
                res.end();
              }
            });
          }else{
            res.status(200);
            res.json({"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"USER ALREADY EXISTS"}}}});
            res.end();
          }
        });
      }
    });

    //USER LOGIN ENDPOINT
    app.post('/login',(req,res) => {
      res.set('Content-Type', 'application/json');

      //MAKE SURE THE REQUIRED FIELDS HAVE BEEN SENT.
      if(req.body.username != null && req.body.username != "" && typeof req.body.username != "undefined" && req.body.password != null && req.body.password != "" && typeof req.body.password != "undefined"){

        //CHECK DATABASE FOR USERNAME AND PASSWORD, IF SUCCESS THEN SEND BACK A SUCCESS OBJECT.
        Users.findOne({username:req.body.username},(err,user) => {
          if(err || user == null){
            res.status(200);
            res.json({"PASSED":false,RESULT:{"TYPE":{"ERROR":{"MESSAGE":"INCORRECT USERNAME OR PASSWORD"}}}});
            res.end();
          }else{
            user.comparePassword(req.body.password,function(err,match){
              if(match == true && match){
                res.status(200);
                res.json({"PASSED":true,RESULT:{"TYPE":{"SUCCESS":{"MESSAGE":"LOGIN PASSED"}}},"USER":{"ID":user._id}});
                res.end();
              }else{
                res.status(200);
                res.json({"PASSED":true,"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"INCORRECT USERNAME OR PASSWORD"}}}});
                res.end();                
              }
            });
          }
        });
      }
    });

    app.post('/user/search',(req,res) => {
      Users.find({username:{$regex:req.body.search}},(err,user) => {
        if(!err && user != null){
          res.json(user)
          res.end();
        }else{
          res.end();
        }
      });
    });

    //
    //USER ENDPOINTS END HERE
    //




    //
    //TRIBE ENDPOINTS START HERE
    //

    //RETURNS TRIBE INFORMATION BASED ON ID.
    app.get('/tribe/:id',(req,res) => {
      res.set('Content-Type', 'application/json');

      Tribes.findOne({_id:req.params.id}).populate('members').populate('votes').exec(function(err,tribe){
        if(!err && tribe != null){
          res.json(tribe);
          res.end();
        }else{
          res.end();
        }
      })
    });

    //ADDS A TRIBE TO THE DATABASE BUT FIRST CHECKS IF THIS TRIBE + CREATOR COMBO
    //ALREADY EXISTS IN THE DATABASE.
    app.post('/tribe/create',(req,res) => {
      Tribes.findOne({title:req.body.title,creator:req.body.creator},(err,result) => {
        if(!err && result == null){
          //CREATE A NEW TRIBE HERE.
          let new_tribe = new Tribes({
            _id: new mongoose.Types.ObjectId(),
            title:req.body.title,
            description:req.body.description,
            creator:req.body.creator,
            members:[req.body.creator]
          });

          new_tribe.save(function(err){
            if(err){
              res.json({"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"ERROR CREATING TRIBE"}}}})
              res.end();
            }else{
              res.json({"RESULT":{"TYPE":{"SUCCESS":{"MESSAGE":"TRIBE "+req.body.title+" WAS CREATED"}}}})
              res.end();
            }
          })
        }else{
          res.json({"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"TRIBE HAS ALREADY BEEN CREATED WITH THIS NAME"}}}})
          res.end();
        }
      });
    });

    //ADDS A GIVEN MEMBER TO A TRIBE BASED ON THE TRIBE ID AND THE MEMBER ID (IT CAN INCLUDE AN ARRAY OF MEMBER IDS)
    app.post('/tribe/member/add',(req,res) => {
      Tribes.findOne({_id:req.body.tribe_id},(err,tribe) => {
        if(!err && tribe != null){
          //LOOP THROUGH THE MEMBERS IN THE ARRAY AND CHECK IF THEY ARE IN THE TRIBE ALREADY.
          
          for(let i = 0;i < req.body.members.length;i++){
            if(tribe.members.indexOf(req.body.members[i]) == -1){
              tribe.members.push(req.body.members[i]);

              tribe.save(function(err){
                if(!err){
                  res.json({"RESULT":{"TYPE":{"SUCCESS":{"MESSAGE":"ADDED MEMBERS TO "+tribe.title}}}})
                  res.end();
                }else{
                  res.json({"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"ERROR ADDING MEMBERS TO TRIBE"}}}})
                  res.end();                  
                }
              })
            }else{
              res.end();
            }
          }
        }else{
          res.json({"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"TRIBE DOES NOT EXIST"}}}})
          res.end();
        }
      });
    });

    //RETURNS ALL THE TRIBES THE USER IS A PART OF REGARDLESS OF WHETHER OR NOT THEY ARE THE CREATOR.
    app.get('/tribes/:id',(req,res) => {
      Tribes.find({members:req.params.id},(err,tribes) => {
        if(!err && tribes.length > 0){
          res.json(tribes);
          res.end();
        }else{
          res.end();
        }
      })
    })

    //
    //TRIBE ENDPOINTS START HERE
    //






    //
    // VOTING ENDPOINTS START HERE
    //

    //RETURNS INFORMATION ON A SPECIFIC VOTE
    app.get('/vote/:id',(req,res) => {
      Votes.findOne({_id:req.params.id},(err,vote) => {
        if(!err && vote != null){
          res.json(vote);
          res.end();
        }else{
          res.end();
        }
      });
    });

    // CREATES A VOTE FOR A GIVEN TRIBE, THE TRIBE ID AND CREATOR ARE REQUIRED.
    app.post('/vote/create',(req,res) => {
      if(req.body.tribe != null && req.body.tribe != "" && typeof req.body.tribe != "undefined" && req.body.creator != null && req.body.creator != "" && typeof req.body.creator != "undefined" && req.body.vote_type != null && req.body.vote_type != "" && typeof req.body.vote_type != "undefined"){
        Tribes.findOne({_id:req.body.tribe},(err,tribe) => {

          let new_vote = new Votes({
            _id: new mongoose.Types.ObjectId(),
            tribe: req.body.tribe,
            creator: req.body.creator,
            votes_yes:[req.body.creator],
            vote_type: req.body.vote_type
          });

          new_vote.save(function(err){
            if(!err){
              tribe.votes.push(new_vote._id);
              tribe.save(function(err){
                if(!err){
                  res.json({"RESULT":{"TYPE":{"SUCCESS":{"MESSAGE":"CREATED NEW VOTE FOR "+tribe.title}}}})
                  res.end();                     
                }else{
                  res.json({"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"ERROR CREATING NEW VOTE"}}}})
                  res.end();                     
                }
              })
            }else{
              res.json({"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"ERROR CREATING NEW VOTE"}}}})
              res.end();             
            }
          });
        });
      }else{
          res.json({"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"TRIBE DOES NOT EXIST"}}}})
          res.end();
      }
    });

    // VOTE YES/NO BASED ON THE GIVEN VOTE ID.
    app.post('/vote/yes',(req,res) => {
      if(req.body.vote != null && req.body.vote != "" && typeof req.body.vote != "undifined" && req.body.member != null && req.body.member != "" && typeof req.body.member != "undifined" && req.body.tribe != null && req.body.tribe != "" && typeof req.body.tribe != "undifined"){
        Votes.findOne({_id:req.body.vote},(err,vote) => {
          if(!err && vote != null){
            if(vote.votes_yes.indexOf(req.body.member == -1)){
              vote.votes_yes.push(req.body.member);
            }
          }else{
            res.json({"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"VOTE DOES NOT EXIST"}}}})
            res.end();
          }
        });
      }else{
        res.json({"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"MISSING ARGUMENT VARIABLES"}}}})
        res.end();
      }
    });

    app.post('/vote/no',(req,res) => {
      if(req.body.vote != null && req.body.vote != "" && typeof req.body.vote != "undifined" && req.body.member != null && req.body.member != "" && typeof req.body.member != "undifined" && req.body.tribe != null && req.body.tribe != "" && typeof req.body.tribe != "undifined"){
            if(vote.votes_no.indexOf(req.body.member == -1)){
              vote.votes_no.push(req.body.member);
            }
      }else{
        res.json({"RESULT":{"TYPE":{"ERROR":{"MESSAGE":"MISSING ARGUMENT VARIABLES"}}}})
        res.end();
      }
    })

    //
    // END OF VOTING ENDPOINTS
    //

//
//END OF EXPRESS ENDPOINTS
//


//FUNCTIONS TO RETURN IDS BASED ON USERNAME OR TRIBE

//Start the application on the given port.
app.listen(4000);
module.exports = app;
