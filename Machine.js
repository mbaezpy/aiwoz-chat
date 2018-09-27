/*
* Experimental application to collect conversation
* logic based on AI technology and WoZ
*/

// Imports the Google Cloud client library
const Vision   = require('@google-cloud/vision');
const Language = require('@google-cloud/language');

// Creates a client
const visCli = new Vision.ImageAnnotatorClient();
const txtCli = new Language.LanguageServiceClient();

// Instantiate a DialogFlow client.
const axios = require('axios');


module.exports.processImage = (url, cb) => { 
// Performs label detection on the image file
  visCli
    .annotateImage({
      image: {source: {imageUri: url}},
      features: [{type: "FACE_DETECTION"},
                 {type: "LABEL_DETECTION", 
                  maxResults: 20},
                 {type: "IMAGE_PROPERTIES"},
                 {type: "LANDMARK_DETECTION"}
                ],
    })
    .then(results => {
      cb.done(results[0]);
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

module.exports.processUserResponse = (query, cb) =>{
  const baseUrl = "https://dry-thicket-91678.herokuapp.com/parse";
  
  var aspects = ["topics", "smalltalk"];
  var callQ = [];
  
  var mergeCalls = function(){
    var done = true;
    var annotations = [];
    callQ.forEach(function(fn, i){
      done = done && fn.done;      
      annotations.push({
        name : aspects[i],
        annotations : fn.response.data
      });
    });
    
    if (done){    
      cb.done(annotations);
    }
    
  };
  
  aspects.forEach(function(bot, i){
    callQ.push(function(){
      axios.get(baseUrl, {
        params : {
          q : query,
          project : aspects[i]
        }
      })
      .then(function (response) {
        // handle success
        callQ[i].done = true;
        callQ[i].response = response;
        mergeCalls();
      })
      .catch(function (err) {
        // handle error
        // TODO: This does not work
        if (cb.error) cb.error('ERROR: ' + err); 
        
      });
    })
  });
  
  callQ.forEach(function(fn){fn()}); 
    
  
  
};
