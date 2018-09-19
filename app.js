/*
* Experimental application to collect conversation
* logic based on AI technology and WoZ
*/

const express = require('express');
const app = express();

//middlewares
app.use(express.static('static'))


var port   = process.env.PORT || 8080;
var server = app.listen(port, function(){
  console.log('aiwoz server listening on port ' + port);  
});

//socket.io instantiation
const io = require("socket.io")(server);

// Load the chat socket api
const socketAPI = require("./Socket");
socketAPI.use(io);

// Load the graph api
const graphAPI = require("./Graph");
graphAPI.use(app);