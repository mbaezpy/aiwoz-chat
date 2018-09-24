/**
 * API for managing chat exchanges using web sockets
 * @author: Marcos Baez
 */

const controllers = require('../controllers');

const ChatSessionMgr = controllers.session;
const MachineMgr = controllers.machine;

module.exports.use = function (io) {

  io.on('connection', (socket) => {

    socket.username = null;
    socket.role = null;
    socket.room = null;    

    // When user joins
    socket.on('user_login', (data, fn) => {
      socket.username = data.username;
      socket.role = data.role;
      socket.room = data.room;
      socket.mlProcess = data.mlp == 1;
      socket.ctxAware = data.ctx == 1;
      
      socket.join(socket.room);     
      
      // User is reconnecting 
      if (data.sessionId) {
        socket.sessionId = data.sessionId;
        console.log("User reconnected to session id", data.sessionId);
        return;
      }
      
      console.log("User logged in, room", socket.room);
      
      ChatSessionMgr.logSession(data, (session) => {
        fn(session._id);
        socket.sessionId = session._id;
      });              
      
    });

    //listen on new_message
    socket.on('new_message', (data) => {

      var msg = {
        message: data.message,
        type: data.type,
        role: socket.role,
        time: new Date(),
        username: socket.username,
        mlp : socket.mlp
      };   
      
      console.log("Message received:", data.type, "from", socket.role)

      try {
        // Messages from chatbots are not processed
        if (socket.role != "human" || !socket.mlProcess) {
          io.sockets.in(socket.room).emit('new_message', msg);
          ChatSessionMgr.logMessage(socket.sessionId, msg);
          return;
        }      

        // Messages from humans are processed
        console.log("Interpreting message.")
      
        MachineMgr.interpret(data, (annotations) => {
          msg.annotations = annotations;          

          msg.time = Date.parse(msg.time);
          ChatSessionMgr.logMessage(socket.sessionId, msg);
          
          io.sockets.in(socket.room).emit('new_message', msg);                    
        });
      } catch(err){
        console.log(err);
        io.sockets.in(socket.room).emit('error', err);
      }

    });

    //listen on typing
    socket.on('typing', (data) => {
      io.sockets.in(socket.room).emit('typing', {
        username: socket.username
      });
    });
  });

};