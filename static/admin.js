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
        msg = tmpl({aspects : data})
      }
      return msg;
  });  
  

  var sessions = null;
  var currentSession = null;
  
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
    $(".messages").append(el).show();   
    
    currentSession = session;
    
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
  
  var processMessage = function(msg, cb){
    $.ajax({
        url: "/api/cognitive/interpret",
        type: 'POST',
        contentType: 'application/json',
        data : JSON.stringify(msg),
        success: function(data){
          cb.done(data);                    
        },
        error: function(){
          console.log("Error processing message");
          cb.error();
        }
    });           
  };
  
  
  $(".messages").on("click", ".opt-mlp", function(e){
    var $el = $(this);
    var messageId = $el.data("messageid");
    
    var message = currentSession.messages.find(function(item){
      return item._id == messageId;
    })      
    
    console.log(message);
    var msg = {
      message : message.message,
      type : message.type
    };
    
    $el.addClass("disabled");
    
    $.ajax({
        url: "/api/cognitive/interpret",
        type: 'POST',
        contentType: 'application/json',
        data : JSON.stringify(msg),
        success: function(data){
          console.log(data);
          
          var tmpl = Handlebars.compile("{{{displayAnnotations annotations type}}}");
          var el = tmpl({ type : msg.type, annotations : data });
          $("#m-"+ messageId + " .annotations-mlp .card-body > div").append(el);
          $("#m-"+ messageId + " .annotations-mlp").show();
          $el.removeClass("disabled");
          
        },
        error: function(){
          console.log("Error processing message");
          $el.removeClass("disabled").addClass("text-danger");
        }
    });          
    
  });  
  
  
  $('.testing').on("keydown", "textarea", function (event) {
    var keypressed = event.keyCode || event.which;
    if (keypressed == 13) {
      event.preventDefault();
      var message = $("#test-message").val();
      var $el = $(this);

      var msg = {
        message : message,
        type : "text"
      };    

      $el.attr("disabled", ""); 
      $("#test-message").val('');
      processMessage(msg, {
        done : function(data){
          var tmpl = Handlebars.compile($("#training-results-template").html());
          var el = tmpl({ type : msg.type, 
                         annotations : data,
                         message : msg.message
                        });        

          $(".testing .test-results").prepend(el);
          $el.removeAttr("disabled");
          $el.focus();

        },
        error : function(){
        }      
      });    
    }
  });
  
  $(".schema").on("click", ".opt-add-question", function(e){  
    var question = {
      question : $("#question-title").val(),
      topic : $("#question-topic").val(),
      attributes : []
    };
    
    var attributes = $("#question-attributes").val().split("\n");
    attributes.forEach(function(attr, i){
      var c = attr.split(",");
      question.attributes.push({
        name : c[0].trim(),
        type : c[1]? c[1].trim() : 'String'
      });
    });
    
    console.log(question);
    
    $(".opt-add-question").addClass("disabled"); 
    $.ajax({
        url: "/api/graph/questions",
        type: 'POST',
        contentType: 'application/json',
        data : JSON.stringify(question),
        success: function(data){
          renderSchema();   
        },
        error: function(){
          console.log("Error processing message");
          $(".opt-add-question").removeClass("disabled");          
        }
    });       
    
  });
  
  $(".schema").on("click", ".opt-delete-question", function(e){
    var questionId = $(this).data("questionid");
    
    $.ajax({
        url: "/api/graph/questions/" + questionId,
        type: 'DELETE',
        success: function(){
          renderSchema(); 
        },
        error: function(){
          console.log("Error deleting session");
          $(".opt-delete-question").removeClass("btn-outline-dark").addClass("btn-outline-danger");
        }
    });         
    
  });    
  

  var questions = null;
  var displayRandomQuestion = function(){
    var q = questions[Math.floor(Math.random() * questions.length)];        
    var tmpl = Handlebars.compile($("#rand-question-template").html());
    var el = tmpl(q);  
    $(".testing .rand-question").html(el);  
  };
  var loadRandomQuestion = function(){
        
    if (!questions){    
      $.get("/api/graph/questions", function (data) {
        questions = data;
        displayRandomQuestion();
      });      
    } else {
      displayRandomQuestion();
    }
    
  };
  $(".testing").on("click", ".opt-rand-question", function(e){
    displayRandomQuestion();
  });
  
  
  var renderSandbox = function(){
    var tmpl = Handlebars.compile($("#training-template").html());
    var el = tmpl({});
    $(".testing").html(el);  
    questions = null;
    
    loadRandomQuestion();
    
  };
  
  var renderSchema = function(){
    var tmpl = Handlebars.compile($("#schema-template").html());
    var el = tmpl({topics : ["school", "family", "childhood"]});
    $(".schema").html(el);          
    
    $.get("/api/graph/questions", function (data) {
      var tmpl = Handlebars.compile($("#schema-questions-template").html());
      var el = tmpl({
        questions: data
      });
      
      $(".schema .questions").append(el);
    });              
  };  
  
  var loadTab = function(){
    var tab = window.location.hash.split("/").pop();
    console.log(tab)
    if (! tab) tab = "sessions";
    
    $(".tab").hide();    
    
    $("." + tab).show();    
    $("nav .nav-item").removeClass("active").filter(".tab-"+tab).addClass("active");
    
    if (tab == "testing"){      
      renderSandbox();
    } else if (tab == "schema") {
      renderSchema();
    }
    
  };
  
  
  $(window).on('hashchange', function() {
    loadTab();
  });  
  loadTab();
  

});