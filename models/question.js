var mongoose = require('mongoose');
var Schema = mongoose.Schema;



// Fields expected in the responses
var QuestionAttribute = new Schema({ 
  name: String, 
  type : String
});

// question
var Question = new Schema({
  topic : String,
  question : String,
  attributes : [QuestionAttribute],
  created_at: Date,
});

// make this available to our users in our Node applications
module.exports = mongoose.model('questions', Question);
