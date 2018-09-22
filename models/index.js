/**
* Load model schemas
* Adapted from the quora post at: http://qr.ae/RoCld1
*/ 
const fs = require('fs');
const mongoose = require('mongoose');

// Connection URL
const url = process.env.MONGODB_CONNECT


// Use connect method to connect to the server
mongoose.connect(url);

fs.readdirSync(__dirname).forEach(function(file) {
  if (file !== 'index.js') {
    var moduleName = file.split('.')[0];
    exports[moduleName] = require('./' + moduleName);
  }
});