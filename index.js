var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.sendfile('public/index.html');
});

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;

io.on('connection', function(socket){
    var addedUser = false;

    socket.on('new move', function (data) {
        socket.broadcast.emit('new move', {
            username: socket.username,
            xPos: data.xPos,
            yPos: data.yPos
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
    
        // we store the username in the socket session for this client
        socket.username = username;
    
        // add the client's username to the global list
        usernames[username] = username;
        ++numUsers;
        addedUser = true;

        socket.emit('login', {
            numUsers: numUsers
        });

        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        // remove the username from global usernames list
        if (addedUser) {
            delete usernames[socket.username];
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
});

server.listen(3000, function(){
    console.log('listening on :3000');
});