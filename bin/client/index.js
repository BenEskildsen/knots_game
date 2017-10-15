

// const Eureca = require('eureca.io'); // I get this for free from index.html
const Dispatcher = require('./Dispatcher.js');
const Game = require('./Game.react.js');
const React = require('./react/react.js');
// $FlowFixMe
const client = new Eureca.Client();
window.client = client;

let serverProxy;
client.ready(server => {
  serverProxy = server;
});

client.exports.onClientConnect = function (playerColor, id, actions) {
  Dispatcher.listen(action => {
    serverProxy.onDispatch(playerColor, action);
  });
  console.log("connected with", playerColor, id);
  React.render(React.createElement(Game, { id: id, playerColor: playerColor }), document.getElementById('container'));
  // once ready, dispatch all the actions to catch up the game state
  // TODO: this doesn't support the tray, so refreshing will let you refill it
  for (const action of actions) {
    Dispatcher.relayDispatch(action);
  }
};

// when the other player dispatches, that action is passed through the server
// and then to this function
client.exports.relayDispatch = function (action) {
  Dispatcher.relayDispatch(action);
};