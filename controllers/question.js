/**
 * Managing chabot questions
 * @author: Marcos Baez
 */

const Question = require('../models').question;


module.exports.getQuestions = function(fn){
  Question.find({}, function(err, questions){
    if (err) throw { msg: "Error loading chat sessions", error: err };
    
    fn(questions);
  });
  
};

module.exports.saveQuestion = function (data, fn) {

  var currentTime = new Date();
    
  var question = Question(data);
  question.created_at = currentTime; 

  question.save(function (err) {
    if (err) throw { msg: "Error saving question", error: err };

    fn(question);
  });  

};

module.exports.deleteQuestion = function (questionId, fn) {

  Question.findByIdAndRemove(questionId, function (err) {
        
      if (err) throw { msg: "Error deleting question", error: err };

      if (fn) fn();
  });    
};

