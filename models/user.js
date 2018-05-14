let mongoose = require('mongoose');

//OUR DATABASE MODEL OR EACH TRIBE USER
//ONLY REQUIRED TO APPLICATION NOT DB
let user_schema = mongoose.Schema({
  //Tells the system the types of data that are going to be pulled from the
  //mongo database.
  username:{
    type:String,
    required:true
  },
  password:{
    type: String,
    required:true
  },
  email:{
    type: String,
    required:true
  },
  firstName:{
    type: String
  },
  lastName:{
    type: String
  },
  signup:{
    type: Date,
    default: Date.now
  }
},{collection:'users'});

let TribeUsers = module.exports = mongoose.model('TribeUser',user_schema);

//DATABASE FUNCTIONS FOR RETURNING INFORMATION ABOUT USERS.
module.exports.getUsers = function(callback,limit){
  TribeUsers.find(callback).limit(limit);
}
//RETURNS A USER OBJECT(JSON) BASED ON A GIVEN USERNAME
module.exports.getUserByName = function(name,callback){
  TribeUsers.find({username:name},callback);
}
//CHECKS IF THE GIVEN EMAIL ALREADY EXISTS IN THE SYSTEM FOR ANOTHER USER.
module.exports.checkUserEmail = function(email,callback){
  TribeUsers.find({email:email},callback);
}
//IF THE CHECK PASSES THEN
module.exports.addNewUser = function(user,callback){
  TribeUsers.create(user,callback);
}

module.exports.checkNamePassword = function(name,password,callback){
  TribeUsers.find({username:name,password:password},callback);
}



