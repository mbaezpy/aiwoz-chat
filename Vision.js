/*
* Experimental application to collect conversation
* logic based on AI technology and WoZ
*/

// Imports the Google Cloud client library
const vision = require('@google-cloud/vision');

// Creates a client
const client = new vision.ImageAnnotatorClient();



module.exports.processImage = (url, cb) => { 

// Performs label detection on the image file
  client
    .labelDetection(url)
    .then(results => {
      cb.done(results[0].labelAnnotations)
    })
    .catch(err => {
      console.error('ERROR:', err);
      if (cb.error) cb.error(err) 
    });
};