/**
 * Managing chat sessions
 * @author: Marcos Baez
 */

const ChatSession = require('../models').session;


module.exports.logSession = function (data, fn) {

  ChatSession.findOne({
    room_name: data.room
  }, function (err, session) {

    if (err) throw { msg: "Error finding chat session", error: err };

    var room = data.room;
    var currentTime = new Date();

    if (!session) {
      session = ChatSession({
        room_name: room,
        created_at: currentTime
      });
      console.log('Preparing a new chat session..');
    }

    session.participants.push({
      username: data.username,
      role: data.role,
      joined_at: currentTime
    });

    session.save(function (err) {
      if (err) throw { msg: "Error saving chat session", error: err };

      console.log('Chat session', session.id, "updated");
      
      if (fn) fn(session);
    });
    
  });
};

module.exports.logMessage = function (sessionId, msg, fn) {

  ChatSession.findById(sessionId, function (err, session) {
  
    if (!session) throw { msg: "Session " + sessionId + " not found", error: {} };
    
    session.messages.push(msg);
    
    session.save(function (err) {
      
      if (err) throw { msg: "Error saving message", error: err };

      if (fn) fn(session);
    });    
  
  });


};
