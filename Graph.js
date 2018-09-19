/**
 * API for managing the knowledge Graph
 * @author: Marcos Baez
 */

const request = require('request');
const csv = require('csvtojson');
var bodyParser = require('body-parser');


module.exports.use = function (app) {

  app.use(bodyParser.json()); // support json encoded bodies  
  
  
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
  
};