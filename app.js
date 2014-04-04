var http = require('http'),
    fs = require('fs'),
    // NEVER use a Sync function except at start-up!
    index = fs.readFileSync(__dirname + '/index.html');

// Send index.html to all requests
var app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

// Socket.io server listens to our app
var io = require('socket.io').listen(app);

// Send current time to all connected clients
function sendTime() {
    io.sockets.emit('time', { time: new Date().toJSON() });
}

// Send current time every 10 secs
setInterval(sendTime, 30000);




// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
    
    socket.emit('welcome', { message: 'Welcome!' });
    socket.broadcast.emit('welcome', {message: 'A new user connected...'});


    socket.on('message', function(data){
      console.log(data);
      socket.broadcast.emit('welcome', { message: data.data, user: data.user});
    });

    socket.on('new user', function(data){
      console.log(data);
      //user = data.data;
      socket.broadcast.emit('welcome', { message: 'Welcome new user: <em>'+ data.data +'</em>!' });
    });


    //socket.on('i am client', console.log);
});


app.listen(3000);