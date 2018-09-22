/**
* Load model 
* Adapted from the quora post at: http://qr.ae/RoCld1
*/ 
const fs = require('fs');

fs.readdirSync(__dirname).forEach(function(file) {
  if (file !== 'index.js') {
    var moduleName = file.split('.')[0];
    exports[moduleName] = require('./' + moduleName);
  }
});