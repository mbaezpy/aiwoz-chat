$(function(){
	    
	//buttons and inputs
    var isImage = $("#is_image")
    
    var username = null;
    var role = null;
  
    let searchParams = new URLSearchParams(window.location.search)  
    
    
    var socket = io.connect(window.location.origin)
    
    Handlebars.registerHelper('formatNum', function(num) {
      return num == 0? 0 : Math.round(num * 100)/100
    });
  
    Handlebars.registerHelper('formatPerc', function(num, dec) {
      dec = dec===undefined ? 2 : dec
      return (Math.round(num * 100 * (10**dec))/ (10**dec))
    });
     
  
    socket.on("connect", () => {
      
      username = searchParams.get('username')
      role     = searchParams.get('role')
      
      socket.emit('user_login', {username : username, 
                                 role: role} );  
      $("body").addClass("role-" + role)
    })

	//Listen on typing
	socket.on('typing', (data) => {
		$("#feedback").html(data.username + " is typing a message...")
	})  

	//Listen on new_message
	socket.on("new_message", (data) => {
		$("#feedback").html('');
        console.log(data)
      
        var msg = ""
        var params = {
            username : data.username,
            message : data.message,
            isPicture : data.type == "image",
            time : new Date(data.time).toLocaleTimeString().
              replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3")
          };
      
        // comes from me?
        if (data.username == username) {
          // all participants can see their own posts
          var tmpl = Handlebars.compile($("#message-template").html())
          msg = tmpl(params)
        } else if (role == "human"){           
          // humans can see the content
          var tmpl = Handlebars.compile($("#message-response-template").html())
          msg = tmpl(params)
        } else if (role == "chatbot") {
          // chatbots can see only predicted labels
          
          // look at the data type, and based on that the template
          if (data.type == "image") {
            var tmpl = Handlebars.compile($("#message-vision-template").html())          
            params.annotations = data.annotations
            msg = tmpl(params)
          } else {
            var tmpl = Handlebars.compile($("#message-nlp-template").html())          
            params.annotations = data.annotations 
            msg = tmpl(params)            
          }
        } 
      
		$(".chat-history ul").append(msg)
      
        $(".chat-history").animate({scrollTop: $(".chat-history ul").height()}, 1000);
	})  
  
	socket.on('error', (err) => {
		console.log(err)
	})    
  
	$(".chat-message button").click(function(){
		socket.emit('new_message', {message : $("#message-to-send").val(),
                                   type : $(".opt-image").hasClass("selected")? "image" : "text"})
        $("#message-to-send").val('');
        if ($(".opt-image").hasClass("selected")){
          $(".opt-image").click();
        }
      
        $(".chat-history").animate({scrollTop: $(".chat-history ul").height()}, 1000);
	})  
  
    $(".opt-image").click(function(e){
      var $el = $(e.currentTarget)
      $el.toggleClass("selected")
      
      if($el.hasClass("selected")){
        $("#message-to-send").attr("placeholder", "Insert the URL to your picture")
      } else {
        $("#message-to-send").attr("placeholder", "Type your message")
      }
        
      
    })


	//Emit typing
	$("#message-to-send").bind("keypress", () => {
		socket.emit('typing')
	})


});