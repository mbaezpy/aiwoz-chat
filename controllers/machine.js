/**
 * API for managing chat exchanges using web sockets
 * @author: Marcos Baez
 */

const machine = require('../Machine');

      
module.exports.interpret = function(data, fn){
      
  // The message contains an image
  if (data.type == "image") {
      machine.processImage(data.message, {
        done: annotations => {

          var data = {
            labels: annotations.labelAnnotations,
            landmarks: annotations.landmarkAnnotations,
            faces: annotations.faceAnnotations,
            properties: annotations.imagePropertiesAnnotation
          };
          
          fn(data);
        },
        error: err => {
          throw { msg: "Error processing image", error: err };
        }
      });
    
    // The message contains text
    } else {
      machine.processUserResponse(data.message, {
        done: annotations => {
          fn(annotations);
        },
        error: err => {
          throw {  msg: "Error in NLU", error: err };
        }
      });
    }
};