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
    type:String,
    required:true
  }
},{collection:"tribes"});

let Tribes = module.exports = mongoose.model('Tribes',tribe_schema);

//DATABASE FUNCTIONS FOR RETURNING INFORMATION ABOUT TRIBES.
module.exports.getTribes = function(callback,limit){
  Tribes.find(callback).limit(limit);
}
