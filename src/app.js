// Import libraries
var http = require('http');
var path = require('path');
var express = require('express');
var compression = require('compression');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var socketio = require('socket.io');
var RedisStore = require('connect-redis')(session);
var GameManager = require('./GameManager.js');
var url = require('url');
var csrf = require('csurf');

// Grab the router
var router = require('./router.js');

// Get database URL
var dbURL = process.env.MONGOLAB_URI || "mongodb://localhost/AirHockey";

// Connect to the database
var db = mongoose.connect(dbURL, function(err) {
	if (err) {
		console.log("Could not connect to the database.");
		throw err;
	}
});

// Get the redis URL
var redisURL = {
	hostname: 'localhost',
	port: 6379
};

var redisPASS;

// Update redis URL to cloud version if this is running on a server
if (process.env.REDISCLOUD_URL) {
	redisURL = url.parse(process.env.REDISCLOUD_URL);
	redisPASS = redisURL.auth.split(":")[1];
}

// Get the server port
var port = process.env.PORT || process.env.NODE_PORT || 3000;

// Create the express app and set it up with our libraries
var app = express();
app.use('/assets', express.static(path.resolve(__dirname + '/../client')));	// load in assets folder
app.use(compression());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(session({
	key: "sessionid",
	store: new RedisStore({
		host: redisURL.hostname,
		port: redisURL.port,
		pass: redisPASS
	}),
	secret: 'Ice Hockeytron',
	resave: true,
	saveUninitialized: true,
	cooke: {
		httpOnly: true
	}
}));
app.set('view engine', 'jade');
app.set('views', __dirname + '/views');
app.set(favicon(__dirname + '/../client/img/favicon.png'));
app.disable('x-powered-by');
app.use(cookieParser());

// set up CSurf
app.use(csrf());
app.use(function(err, req, res, next) {
	if (err.code !== 'EBADCSRFTOKEN') return next(err);
	
	return;
});

// setup http with express app
var server = http.Server(app);

// current open room number
var roomNum = 1;

// all connected users
var queue = [];

// all running games
var games = [];

// Send the app to the router
router(app);

// create websocket server
var io = socketio(server);

// Start the server
server.listen(port, function(err) {
	if (err) {
		throw err;
	}
	
	console.log('Listening on port ' + port);
});

// FUNCTION: creates new game room
function createRoom() {
	// create room name
	var name = "room" + roomNum;
	roomNum++;
	
	// add waiting users to new room
	queue[0].room = name;
	queue[1].room = name;
	queue[0].join(name);
	queue[1].join(name);
	
	// create the new game
	var newGame = new GameManager(name, io, queue[0], queue[1]);
	games.push(newGame);
	
	// clear paired users from queue
	queue.splice(0, 2);
}

// FUNCTION: handle user join
function onJoin(socket) {
	socket.on("join", function(data) {
		// name socket with username and store in user list and queue
		socket.name = data.name;
		queue.push(socket);
		
		// notify user of successful join
		socket.emit("msg", {msg: "Waiting for an opponent..."});
		
		// create a new game if 2 or more players are waiting
		if (queue.length >= 2) {	
			createRoom();
		}
	});
}

// FUNCTION: handle user chat msg
function onMessage(socket) {
	socket.on("chatMsg", function(data) {
		// notify user of successful join
		socket.broadcast.emit("msg", data);
	});
}

// FUNCTION: handle user disconnect
function onDisconnect(socket) {
	socket.on("disconnect", function(data) {
		// delete user
		delete queue[socket.name];
	});
}

// send new connections to handlers
io.sockets.on("connection", function(socket) {
	onJoin(socket);
	onDisconnect(socket);
	onMessage(socket);
});

console.log("Air Hockey server started");