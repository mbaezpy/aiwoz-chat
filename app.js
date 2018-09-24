/*
* Experimental application to collect conversation
* logic based on AI technology and WoZ
*/

const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//middlewares
app.use(express.static('static'));
app.use(bodyParser.json()); 

var port   = process.env.PORT || 8080;
var server = app.listen(port, function(){
  console.log('aiwoz server listening on port ' + port);  
});

//socket.io instantiation
const io = require("socket.io")(server);

// Load the chat socket api
const socketAPI = require("./api/Socket");
socketAPI.use(io);

// Load the graph api
const graphAPI = require("./api/Graph");
graphAPI.use(app);

// Load the session monitoring api
const sessionAPI = require("./api/Session");
sessionAPI.use(app);