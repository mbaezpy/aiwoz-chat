/**
 * API for managing the knowledge Graph
 * @author: Marcos Baez
 */

const request = require('request');
const csv = require('csvtojson');

const controllers = require('../controllers');
const Question = controllers.question;

module.exports.use = function (app) {  
  
  // Managing questions
  
  app.post('/api/graph/questions', function (req, res) {
    
    var data = req.body;  
    
    Question.saveQuestion(data, (question) => {
        res.json(question);           
    });    
      
  });    
    
  app.get('/api/graph/questions', function (req, res) {
    
      Question.getQuestions((questions) => {
        res.json(questions);
      });      
  });  
  
  app.delete('/api/graph/questions/:id',function (req, res) {
    
      var id = req.params.id;
    
      Question.deleteQuestion(id, () => {
        res.end();
      });      
  });    
  
  // Getting the knowledge graph dictionary
  app.get('/api/graph', function (req, res) {

    var url = "https://docs.google.com/spreadsheets/u/0/d/14orIzVsNMnuqZuBLKpELbodSAfKj2Bb4ixn-SxLqP7c/export?format=csv&id=14orIzVsNMnuqZuBLKpELbodSAfKj2Bb4ixn-SxLqP7c&gid=0";
    
    var list = [];
    csv()
    .fromStream(request.get(url))
    .subscribe((item) => {
      var topic = {};
      
      var topic = list.find((el)=>{
        return el.topic == item.topic;
      });
      
      if (!topic){
        topic = {
          topic : item.topic,
          attributes : []
        }
        list.push(topic);
      }
      
      topic.attributes.push(item);

    }, 
    (obj) => {
      console.log("error : " + obj);
    }, 
    (obj) => {
      res.json(list);
    });    
    
    
  }); 
  
  // Getting the knowledge graph dictionary
  app.get('/api/config', function (req, res) {

    var url = "https://docs.google.com/spreadsheets/u/0/d/14orIzVsNMnuqZuBLKpELbodSAfKj2Bb4ixn-SxLqP7c/export?format=csv&id=14orIzVsNMnuqZuBLKpELbodSAfKj2Bb4ixn-SxLqP7c&gid=1941351220";
    
    var list = [];
    csv()
    .fromStream(request.get(url))
    .subscribe((item) => {      
      list.push(item);
    }, 
    (obj) => {
      console.log("error : " + obj);
    }, 
    (obj) => {
      res.json(list);
    });    
    
    
  });       
  
};