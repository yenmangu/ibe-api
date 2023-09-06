const mongoose = require('mongoose');

const settings = mongoose.Schema({
  mv:{type:String,required:true},
  rover:{type:Boolean,required:false},
  pn:{type:String,required:false},
  en:{type:String,required:false},
  asw:{type:String,required:false},
  oth:{type:String,required:false},

})
const movmentsConfig = mongoose.Schema({
  playStyle:{type:String,required:true},
  rover:{type:Array,required:false},


})

const playerConfig = mongoose.Schema({
  type:{type:String,required:true},
  team_size:{type:Number,required:false},
  players:{type:Array,required:false},

})

const eventSchema = mongoose.Schema({
  name:{type:String,required:true},
  date_started:{type:String,required:true},
  date_ended:{type:String,required:false},
  settings:{type:settings,required:false},
  movmentsConfig:{type:movmentsConfig,required:false},
  playerConfig:{type:playerConfig,required:false},
})

module.exports = mongoose.model('event', eventSchema);
