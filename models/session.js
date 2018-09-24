var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// participants
var SessionParticipants = new Schema({ 
  username: String, 
  role : String,
  ctx : String,
  mlp : String,
  joined_at : Date
});

// participants
var Message = new Schema({ 
  username: String, 
  role : String,
  message: String,
  time : Date,
  type : String,
  mlp : String,
  annotations: Object
});

// session
var ChatSession = new Schema({
  participants : [SessionParticipants],
  messages : [Message],
  room_name : String,
  created_at: Date,
});

// make this available to our users in our Node applications
module.exports = mongoose.model('sessions', ChatSession);
