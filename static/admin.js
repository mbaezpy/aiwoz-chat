$(function () {

  Handlebars.registerHelper('times', function(n, block) {
    var accum = '';
    for(var i = 0; i < n; ++i)
        accum += block.fn(i);
    return accum;
  });
  
  Handlebars.registerHelper('formatNum', function (num) {
    return num == 0 ? 0 : Math.round(num * 100) / 100
  });

  Handlebars.registerHelper('formatPerc', function (num, dec) {
    dec = dec === undefined ? 2 : dec
    return (Math.round(num * 100 * (10 ** dec)) / (10 ** dec))
  });
  
  Handlebars.registerHelper('isEq', function (a, b) {
    return a == b;
  });
  
  Handlebars.registerHelper('formatDate', function (date) {
    date = new Date(date);
    return date.toLocaleDateString();
  });
  
  Handlebars.registerHelper('formatTime', function (date) {
    date = new Date(date);
    return date.toLocaleTimeString().
      replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
  });  

  Handlebars.registerHelper('toLowerCase', function (str) {
    return str.toLowerCase()
  });

  Handlebars.registerHelper('likert', function (label, score) {
    var tmpl = Handlebars.compile($("#likert-template").html())
    return tmpl({
      label: label,
      score: score,
      class: score.toLowerCase()
    })
  });
  
  Handlebars.registerHelper('displayAnnotations', function (data, type) {
      // look at the data type, and based on that the template
      if (type == "image") {
        var tmpl = Handlebars.compile($("#message-vision-template").html())
        msg = tmpl({annotations : data})
      } else {
        var tmpl = Handlebars.compile($("#message-nlp-template").html())
        msg = tmpl({annotations : data})
      }
      return msg;
  });  
  

  var sessions = null;
  $.get("/api/sessions", function (data) {
    var tmpl = Handlebars.compile($("#session-list-template").html())
    var el = tmpl({
      sessions: data
    });
    $(".sessions").append(el);
    sessions = data;
  });

  
  $(".sessions").on("click", ".opt-view-messages", function(e){
    var sessionId = $(this).data("sessionid");
    
    var session = sessions.find(function(item){
      return item._id == sessionId;
    })
    
    $(".sessions").hide();    
    var tmpl = Handlebars.compile($("#message-template").html());
    var el = tmpl({ messages: session.messages });
    $(".messages").append(el);   
    
  });
  
  $(".sessions").on("click", ".opt-delete-session", function(e){
    var sessionId = $(this).data("sessionid");
    
    $.ajax({
        url: "/api/sessions/" + sessionId,
        type: 'DELETE',
        success: function(){
          window.location.reload();  
        },
        error: function(){
          console.log("Error deleting session");
        }
    });         
    
  });  
  
  $(".messages").on("change", "#showAnnotations", function(e){
    console.log(e.currentTarget.checked);
    
    $(".messages .annotations").toggle(e.currentTarget.checked);
    
  });
  

});