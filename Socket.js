/**
 * API for managing chat exchanges using web sockets
 * @author: Marcos Baez
 */

const machine = require('./Machine');

module.exports.use = function (io) {

  io.on('connection', (socket) => {

    socket.username = null;
    socket.role = null;
    socket.room = null;

    //listen on change_username
    socket.on('user_login', (data) => {
      socket.username = data.username;
      socket.role = data.role;
      socket.room = data.room;
      
      socket.join(socket.room);
    });

    //listen on new_message
    socket.on('new_message', (data) => {
      //broadcast the new message
      var msg = {
        message: data.message,
        type: data.type,
        role: socket.role,
        time: new Date(),
        username: socket.username
      };      

      if (socket.role != "human") {
        io.sockets.in(socket.room).emit('new_message', msg);
        return;
      }

      // Messages from humans are processed        

      if (data.type == "image") {
        machine.processImage(data.message, {
          done: annotations => {

            msg.annotations = {
              labels: annotations.labelAnnotations,
              landmarks: annotations.landmarkAnnotations,
              faces: annotations.faceAnnotations,
              properties: annotations.imagePropertiesAnnotation
            };

            io.sockets.in(socket.room).emit('new_message', msg);
          },
          error: err => {
            io.sockets.in(socket.room).emit('error', {
              msg: "Error processing image",
              error: err
            });
          }
        });
      } else {
        //TODO: process other types of messages

        machine.processUserResponse(data.message, {
          done: annotations => {
            msg.annotations = annotations;
            io.sockets.in(socket.room).emit('new_message', msg);
          },
          error: err => {
            io.sockets.in(socket.room).emit('error', {
              msg: "Error in NLU",
              error: err
            });
          }
        });
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