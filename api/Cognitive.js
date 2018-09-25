/**
 * API for accessing the cognitive services
 * @author: Marcos Baez
 */

const csv = require('csvtojson');
const controllers = require('../controllers');

const MachineMgr = controllers.machine;


module.exports.use = function (app) {  
  
  // Getting the knowledge graph dictionary
  // post method as body can get very long
  app.post('/api/cognitive/interpret', function (req, res) {
    
    var data = req.body;  
    
    MachineMgr.interpret(data, (annotations) => {
      res.json(annotations);             
    });    
      
  });   
  
};