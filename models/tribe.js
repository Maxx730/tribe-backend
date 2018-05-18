let mongoose = require('mongoose');

let tribe_schema = mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  description:{
    type:String,
    required:true
  },
  creator:{
    type:Number,
    required:true
  },
  events:{
    type: Array,
    default: []
  },
  members:{
    type: Array,
    default:[]
  }
},{collection:"tribes"});

let Tribes = module.exports = mongoose.model('Tribes',tribe_schema);

//DATABASE FUNCTIONS FOR RETURNING INFORMATION ABOUT TRIBES.
module.exports.getTribes = function(callback,limit){
  Tribes.find(callback).limit(limit);
}

module.exports.getTribeByName = function(name,callback){
  Tribes.find({title:name},callback);
}

module.exports.getTribesByCreator = function(creator,callback){
  Tribes.find({creator:creator},callback);
}

//ADDITION FUNCTIONS BELOW.
module.exports.addTribe = function(data,callback){
  Tribes.create(data,callback);
}

module.exports.addUserToTribe = function(tribeId,userId,callback){
  Tribes.update({_id:tribeId},{$push:{members:userId}},callback)
}

module.exports.checkUserInTribe = function(tribeId,userId,callback){
  Tribes.find({_id:tribeId,members:{$in:[userId]}},callback);
}

module.exports.checkTribeUser = function(tribeName,creatorId,callback){
  Tribes.find({title:tribeName,creator:creatorId},callback);
}

module.exports.getUserTribes = function(userId,callback){
  Tribes.find({members:{$in:[userId]}},callback);
}
