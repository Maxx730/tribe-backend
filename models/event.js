let mongoose = require('mongoose');

//SCHEMA FOR EVENTS OBJECTS IN TRIBE DATABASE.
let tribe_schema = mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  description:{
    type: String,
    required: true
  },
  creator:{
    type: String,
    required: true
  },
  tribes:{
    type: Array,
    default: []
  },
  eventDate:{
    type: Date,
    required: true
  }
},{collection:'events'});

let TribeEvents = module.exports = mongoose.model('Events',tribe_schema);
