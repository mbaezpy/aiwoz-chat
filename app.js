/*
* Experimental application to collect conversation
* logic based on AI technology and WoZ
*/

const express = require('express')
const app = express()
const vision = require('./Vision')


//middlewares
app.use(express.static('static'))


var port   = process.env.PORT || 8080;
var server = app.listen(port);

console.log('aiwoz server listening at http://localhost:' + port);

//socket.io instantiation
const io = require("socket.io")(server)

io.on('connection', (socket) => {

	socket.username = null;
    socket.role     = null;

    //listen on change_username
    socket.on('user_login', (data) => {
        socket.username = data.username
        socket.role     = data.role
    })

    //listen on new_message
    socket.on('new_message', (data) => {
        //broadcast the new message
        var msg = {message : data.message, 
                   type : data.type,
                   role: socket.role,
                   time : new Date(),
                   username : socket.username}
        
        
        if (socket.role != "human") {      
          io.sockets.emit('new_message', msg)
          return;
        }
      
        // Messages from humans are processed        

        if (data.type == "image"){
          vision.processImage(data.message, {
            done : labels => {
              msg.labels = labels;
              io.sockets.emit('new_message', msg) 
              
              console.log('Labels:');
              labels.forEach(label => console.log(label.description));               
            }, 
            error : err => {
              io.sockets.emit('error', err) 
            }
          });
        } else {
          //TODO: process other types of messages
          msg.labels = [{description: "hidden", score: 1}]
          io.sockets.emit('new_message', msg)  
        }          

    })

    //listen on typing
    socket.on('typing', (data) => {
    	socket.broadcast.emit('typing', {username : socket.username})
    })
})