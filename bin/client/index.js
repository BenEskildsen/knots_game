

// const Eureca = require('eureca.io'); // I get this for free from index.html
const Game = require('./Game.react.js');
const React = require('./react/react.js');
// $FlowFixMe
const client = new Eureca.Client({ uri: 'http://localhost:8000/' });
window.client = client;

client.ready(server => {
   server.sendMessage("hello");
});

React.render(React.createElement(Game, null), document.getElementById('container'));