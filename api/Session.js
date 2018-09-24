/**
 * API for managing the Sessions
 * @author: Marcos Baez
 */

const csv = require('csvtojson');
const controllers = require('../controllers');

const ChatSessionMgr = controllers.session;


module.exports.use = function (app) {  
  
  // Getting the knowledge graph dictionary
  app.get('/api/sessions', function (req, res) {
    
      ChatSessionMgr.loadSessions((sessions) => {
        res.json(sessions);
      });      
  });  
  
  app.delete('/api/sessions/:id',function (req, res) {
    
      var id = req.params.id;
    
      ChatSessionMgr.deleteSession(id, () => {
        res.end();
      });      
  });  
  
};