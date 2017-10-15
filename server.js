var express = require('express')
  , app = express(app) // ... sigh, I have no idea what this does
  , server = require('http').createServer(app);
const Eureca = require('eureca.io');

const eurecaServer = new Eureca.Server();
eurecaServer.attach(server);

// exports is exposed to the client
eurecaServer.exports.sendMessage = (message) => {
  console.log(message);
}

app.use(express.static(__dirname));
// app.get('/', (req, res, next) => {
//   res.sendFile('/index.html');
// });

server.listen(8000);

const clients = {};

eurecaServer.onConnect(function (connection) {
  console.log("Client connected with id: ", connection.id, connection.eureca.remoteAddress);
});


