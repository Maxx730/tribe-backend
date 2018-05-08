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
  }
},{collection:'users'});

let TribeUsers = module.exports = mongoose.model('TribeUser',user_schema);

//DATABASE FUNCTIONS FOR RETURNING INFORMATION ABOUT USERS.
module.exports.getUsers = function(callback,limit){
  TribeUsers.find(callback).limit(limit);
}

module.exports.getUserByName = function(name,callback){
  TribeUsers.find({username:name},callback);
}
