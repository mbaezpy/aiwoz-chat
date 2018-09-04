$(function(){
	    
	//buttons and inputs
    var isImage = $("#is_image")
    
    var username = null;
    var role = null;
    
    
    var socket = io.connect(window.location.origin)
     
  
    socket.on("connect", () => {
      let searchParams = new URLSearchParams(window.location.search)
      username = searchParams.get('username')
      role     = searchParams.get('role')
      
      socket.emit('user_login', {username : username, 
                                 role: role} );      
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
          var tmpl = Handlebars.compile($("#message-response-template").html())
          
          params.message = ""
          data.labels.forEach(label => {
            params.message += label.description + "(" + (Math.round(label.score *100)/100) + ") "
          }); 
          msg = tmpl(params)
        } 
      
		$(".chat-history ul").append(msg)
      
        $(".chat-history").animate({scrollTop: $(".chat-history").height()}, 1000);
	})  
  
	$(".chat-message button").click(function(){
		socket.emit('new_message', {message : $("#message-to-send").val(),
                                   type : $(".opt-image").hasClass("selected")? "image" : "text"})
        $("#message-to-send").val('');
        if ($(".opt-image").hasClass("selected")){
          $(".opt-image").click();
        }
      
        $(".chat-history").animate({scrollTop: $(".chat-history").height()}, 1000);
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