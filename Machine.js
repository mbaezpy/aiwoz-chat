/*
* Experimental application to collect conversation
* logic based on AI technology and WoZ
*/

// Imports the Google Cloud client library
const vision   = require('@google-cloud/vision');
const language = require('@google-cloud/language');

// Creates a client
const visCli = new vision.ImageAnnotatorClient();
const txtCli = new language.LanguageServiceClient();


module.exports.processImage = (url, cb) => { 

// Performs label detection on the image file
  visCli
    .labelDetection(url)
    .then(results => {
      cb.done(results[0].labelAnnotations);
      console.log(results[0]);
    })
    .catch(err => {
      console.error('ERROR:', err);
      if (cb.error) cb.error('ERROR:' + err); 
    });
};

module.exports.processText = (text, cb) => { 

  var document = {
    content: text,
    type: 'PLAIN_TEXT'
  };
  
  txtCli
    .annotateText({
      document: document,
      features: {extractEntities : true,
                 extractDocumentSentiment : true,
                 extractEntitySentiment : true
                }
    })
    .then(results => {
    
      cb.done(results[0]);
      console.log(results[0]);

    })
    .catch(err => {
      console.error('ERROR:', err);
      if (cb.error) cb.error('ERROR:' + err); 
    });  
  
};