function connectChat(e) {
	// grab references to page chat elements
	var chatWindow = document.querySelector('#chatWindow');
	var chatInput = document.querySelector('#chatInput');
	
	// connect to socket.io
	// the io variable is from the socket.io script and is global
	var socket = socket || io.connect();
	
	// update chat window on connect
	socket.on('connect', function(data) {
		
		chatWindow.innerHTML = "Connected to chat!"
	});
	
	// listener for msg event
	socket.on('msg', function(data) {
		
		chatWindow.innerHTML += "<p>" + data.msg + "</p>";
	});
	
	// allow users to send messages (with the enter key)
	chatInput.addEventListener('keyup', function(e) {
		if (e.keyCode === 13) {
			// catch message over 250 chars
			if (chatInput.value.length > 250) {
				chatWindow.innerHTML += "<p>" + chatInput.value + "</p>";
				return;
			}
			
			chatWindow.innerHTML += "<p>" + chatInput.value + "</p>";
			socket.emit('chatMsg', { msg: chatInput.value } );
			chatInput.value = "";
		}
	});
}

window.addEventListener("load", connectChat);