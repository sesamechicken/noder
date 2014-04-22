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

// User arrays
var user_name_arr = [];
var user_id_arr = [];


// Send current time to all connected clients
function sendTime() {
    io.sockets.emit('time', { time: new Date().toJSON() });
}

function userList(){
  io.sockets.emit('userlist', { 
    user_count: user_id_arr.length,
    user_id_list: user_id_arr,
    user_name_list: user_name_arr
  });
}


setInterval(userList, 10000);

// Send current time every 30 secs
setInterval(sendTime, 30000);




// Emit welcome message on connection
io.sockets.on('connection', function(socket) {
    
    socket.emit('welcome', { message: 'Welcome!' });

    socket.broadcast.emit('message', {
      message: 'A new client is connecting. Awaiting identity...',
      user: 'system-info'
    });

    // Main message func. Broadcasts to all connected clients
    socket.on('message', function(data){
      console.log(data);
      socket.broadcast.emit('message', { 
        message: data.data, 
        user: data.user
      });
    });

    // New user func. Officially pushes user to user list array
    socket.on('new user', function(data){
      console.log(data);
      //user = data.data;
      socket.broadcast.emit('welcome', { 
        message: 'Welcome new user: <em>'+ data.data +'</em>!' 
      });

      // TODO: Check for duplicate .id and rename as necessary

      user_name_arr.push(data.data);
      user_id_arr.push(socket.id);
    });



    socket.on('disconnect', function () {
        console.log('DISCONNESSO!!! ');

        var index = user_id_arr.indexOf(socket.id);

        console.log('User index on array: ' + index);
        console.log('client_id: ' + socket.id);

        socket.broadcast.emit('message', { 
          message: user_name_arr[index] + ' disconnected.',
          user: 'system-info'
        });

        // Remove user from user array
        user_id_arr.splice(index, 1);
        user_name_arr.splice(index, 1);

        userList();

    });




});


app.listen(3000);