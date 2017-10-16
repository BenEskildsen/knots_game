var express = require('express')
  , app = express(app) // ... sigh, I have no idea what this does
  , server = require('http').createServer(app);
const Eureca = require('eureca.io');

const eurecaServer = new Eureca.Server({allow: ['onClientConnect', 'clientDispatch']});
eurecaServer.attach(server);
app.use(express.static(__dirname));
// app.get('/', (req, res, next) => {
//   res.sendFile('/index.html');
// }); // not sure why I don't need this..
server.listen(process.env.PORT || 8000);

const clients = {
  oj: null,
  blue: null,
  observers: [],
};
// record all dispatched actions to bring new connections up to date
let actions = [];

eurecaServer.onConnect(function (connection) {
  let client = {
    playerColor: 'white',
    id: connection.id,
    clientDispatch: connection.clientProxy.clientDispatch,
  };
  if (!clients.oj) {
    client.playerColor = 'oj';
    clients.oj = client;
  } else if (!clients.blue) {
    client.playerColor = 'blue';
    clients.blue = client
  } else {
    clients.observers.push(client);
  }
  connection.clientProxy.onClientConnect(client.playerColor, client.id, actions);
  console.log(client.playerColor, "connected");
});

// both players disconnecting is considered restarting the game
eurecaServer.onDisconnect(function (connection) {
  if (clients.oj && clients.oj.id === connection.id) {
    clients.oj = null;
    console.log("oj disconnected");
  }
  if (clients.blue && clients.blue.id === connection.id) {
    clients.blue = null;
    console.log("blue disconnected");
  }
  if (!clients.blue && !clients.oj) {
    actions = []; // restart game
  }
  // TODO support observers disconnecting
});

// eurecaServer.exports is exposed to the client
// the client dispatches its playerColor and the action to dispatch
eurecaServer.exports.onDispatch = (playerColor, action) => {
  console.log("player", playerColor, "dispatched", action);
  actions.push(action);
  if (clients.oj) {
    clients.oj.clientDispatch(action);
  }
  if (clients.blue) {
    clients.blue.clientDispatch(action);
  }
  for (const ob of clients.observers) {
    ob.clientDispatch(action);
  }
}
