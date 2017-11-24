var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var messages = [];

var storeMessage = function(name, data) {
	messages.push({name: name, data: data});
	if(messages.length > 10) {
		messages.shift();
	}
}

io.on('connection', function(client) {
	client.on('join', function(name) {
		messages.forEach(function(message) {
			client.emit("messages", message.name + ": " + message.data);
		})
		client.nickname = name;
		client.broadcast.emit("chat", name + " joined the chat");
	});
	client.on('messages', function(data) {
		var nickname = client.nickname;
		client.broadcast.emit("messages", nickname + ": " + data);
		client.emit("myMessage", nickname + ": " + data);
		storeMessage(nickname, data);
	});
});

app.get('/', function(req, res) {
	res.sendFile(__dirname + "/index.html");
});

server.listen(8080);