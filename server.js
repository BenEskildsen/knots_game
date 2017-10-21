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

const GRID_WIDTH = 9;
const GRID_HEIGHT = 9;
const SEED = 0.3;

// record all dispatched actions to bring new connections up to date
let actions = initActions();

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
  connection.clientProxy.onClientConnect(
    client.playerColor, client.id,
    actions,
    GRID_WIDTH, GRID_HEIGHT
  );
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
    actions = initActions(); // restart game
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

// ----------------------------------------------------------------------------
// seeding the board
// TODO break this out into its own file
// ----------------------------------------------------------------------------

function initActions() {
  const actions = [];
  for (let x = 0; x < GRID_WIDTH; x++) {
    const row = [];
    for (let y = 0; y < GRID_HEIGHT; y++) {
      const maybeAction = maybePlaceKnotAction(x, y);
      if (maybeAction) {
        actions.push(maybeAction);
      }
    }
  }

  return actions;
}

function maybePlaceKnotAction(gridX, gridY) {
  if (Math.random() < SEED) {
    let type = 'pipe';
    const rand = Math.random();
    if (rand < 0.25) {
      type = 'turn';
    } else if (rand < 0.5) {
      type = 't';
    } else if (rand < 0.75) {
      type = 'cross';
    }

    return {
      actionType: 'PLACE_KNOT',
      type, color: 'white',
      gridX, gridY,
      orientation: Math.round(Math.random() * 4) * 90,
    }
  }
}



// neutralKnotsAroundBorder(x: number, y: number): ?Action {
//   const {gridWidth, gridHeight} = this.props;
//   if (x == 0 || y == 0 || x == gridWidth - 1 || y == gridHeight - 1) {
//     return this.renderKnot('white', 'cross', x, y);
//   }
//   return null;
// },
//
// neutralPipesMostly(x: number, y: number): ?Knot {
//   const {gridWidth, gridHeight} = this.props;
//   // corners
//   if (x == 0 && y == 0) {
//     return this.renderKnot('white', 'turn', x, y, 270);
//   }
//   if (x == 0 && y == gridHeight - 1) {
//     return this.renderKnot('white', 'turn', x, y, 180);
//   }
//   if (y == 0 && x == gridWidth - 1) {
//     return this.renderKnot('white', 'turn', x, y);
//   }
//   if (x == gridWidth - 1 && y == gridHeight - 1) {
//     return this.renderKnot('white', 'turn', x, y, 90);
//   }
//
//   // some connections in the sides
//   if (x == Math.floor(this.props.gridWidth/2) && (y == 0 || y == gridHeight - 1)) {
//     return this.renderKnot('white', 't', x, y, (y == 0 ? 0 : 180));
//   }
//   if (y == Math.floor(this.props.gridHeight/2) && (x == 0 || x == gridWidth - 1)) {
//     return this.renderKnot('white', 't', x, y, (x == 0 ? 270 : 90));
//   }
//
//   // sides
//   if (x == 0 || x == gridWidth - 1) {
//     return this.renderKnot('white', 'pipe', x, y);
//   }
//   if (y == 0 || y == gridHeight - 1) {
//     return this.renderKnot('white', 'pipe', x, y, 90);
//   }
//   return null;
// },
