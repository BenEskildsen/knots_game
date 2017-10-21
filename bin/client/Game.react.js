var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const Board = require('./Board.react.js');
const Dispatcher = require('./Dispatcher.js');
const Knot = require('./Knot.react.js');
const React = require('./react/react.js');
const Tray = require('./Tray.react.js');
const tweenState = require('react-tween-state');

/**
 * Note: board refers to the pixel coordinates dom element, grid refers to the
 * WxH playing field
 *
 * This is basically the god object
 */
const Game = React.createClass({
  mixins: [tweenState.Mixin],

  // --------------------------------------------------------------------------
  // React lifecycle methods
  // --------------------------------------------------------------------------

  componentDidMount: function () {
    Dispatcher.clientListen(this.onClientDispatch);
  },

  getDefaultProps: function () {
    return {
      gridWidth: 9,
      gridHeight: 9,
      knotSize: 100,
      playerColor: 'white'
    };
  },

  getInitialState: function () {
    const { grid, knots } = this.makeGrid(this.props.gridWidth, this.props.gridHeight, [this.neutralPipesMostly] // <-- functions that seed the grid
    );
    return {
      boardDimensions: {
        top: this.props.knotSize / 2,
        left: this.props.knotSize / 2,
        right: (this.props.gridWidth + 1 / 2) * this.props.knotSize,
        bottom: (this.props.gridHeight + 1 / 2) * this.props.knotSize
      },
      grid,
      knots,
      xOffset: 0, // for eg. rumbling the screen
      yOffset: 0,
      turnColor: 'oj'
    };
  },

  render: function () {
    const renderedKnots = [];
    for (let i = 0; i < this.state.knots.length; i++) {
      const knot = this.state.knots[i];
      renderedKnots.push(React.createElement(Knot, _extends({}, knot.props, {
        boardX: knot.props.boardX + this.state.xOffset,
        boardY: knot.props.boardY + this.state.yOffset })));
    }

    return React.createElement(
      'div',
      { className: 'background' },
      React.createElement(Board, {
        width: this.props.gridWidth,
        height: this.props.gridHeight,
        knotSize: this.props.knotSize,
        knots: renderedKnots
      }),
      React.createElement(Tray, {
        knotSize: this.props.knotSize,
        color: this.props.playerColor,
        onBoard: this.onBoard,
        validGridPlacement: this.validGridPlacement,
        gridToBoard: this.gridToBoard
      })
    );
  },

  // --------------------------------------------------------------------------
  // Rendering helpers
  // --------------------------------------------------------------------------

  renderKnot: function (color, type, gridX, gridY, orientation = 0, placed = true) {
    const { boardX, boardY } = this.gridToBoard(gridX, gridY);
    const connections = {
      top: type == 'pipe' || type == 'cross',
      left: type == 'turn' || type == 't' || type == 'cross',
      right: type == 't' || type == 'cross',
      bottom: type == 'pipe' || type == 't' || type == 'cross' || type == 'turn'
    };
    return React.createElement(Knot, {
      type: type, color: color,
      boardX: boardX,
      boardY: boardY,
      size: this.props.knotSize,
      placed: placed,
      orientation: orientation,
      connections: this.orient(orientation, connections)
    });
  },

  rumble: function () {
    const nextKnots = this.state.knots;
    const offset = Math.random() * 50 - 25;
    const xOrYOffset = Math.random() > 0.5 ? 'xOffset' : 'yOffset';
    this.tweenState(xOrYOffset, {
      easing: tweenState.easingTypes.easeInOutQuad,
      duration: 25,
      endValue: this.state[xOrYOffset] + offset
    });
  },

  // --------------------------------------------------------------------------
  // Action handling
  // --------------------------------------------------------------------------

  onClientDispatch: function (action) {
    switch (action.actionType) {
      case 'PLACE_KNOT':
        this.placeKnot(action);
        break;
      case 'RUMBLE':
        this.rumbleSequence(action);
        break;
    }
  },

  // assumes that the target location for the knot is valid (ie unoccupied)
  // and inside of the grid
  placeKnot: function (action) {
    const { knots, grid } = this.state;
    const { x, y, color, type, orientation } = action;
    let gridX, gridY;
    if (x == null && y == null) {
      gridX = action.gridX;
      gridY = action.gridY;
      const knot = this.renderKnot(color, type, gridX, gridY, orientation);
    } else {
      const gridCoord = this.boardToGrid(x, y);
      gridX = gridCoord.gridX;
      gridY = gridCoord.gridY;
    }
    const knot = this.renderKnot(color, type, gridX, gridY, orientation);
    grid[gridX][gridY] = knot;
    knots.push(knot);
    this.convertNeighbors(color, type, gridX, gridY, knot.props.connections);
    this.setState({ grid, knots });
  },

  rumblerInterval: null,
  rumbles: 0,

  rumbleSequence: function (action) {
    this.rumbles = 10;

    this.rumblerInterval = setInterval(() => {
      this.rumbles === 0 ? this.endRumble() : this.rumble();
      this.rumbles--;
    }, 30);
  },

  endRumble: function () {
    clearInterval(this.rumblerInterval);
    this.setState({
      xOffset: 0,
      yOffset: 0
    });
  },

  // --------------------------------------------------------------------------
  // Helpers TODO move this out to a non-react-specfic utils file
  // --------------------------------------------------------------------------

  // convert board coordinates (pixels) to grid coordinates
  boardToGrid: function (boardX, boardY) {
    return {
      gridX: Math.round(boardX / this.props.knotSize - 1),
      gridY: Math.round(boardY / this.props.knotSize - 1)
    };
  },

  // convert grid coordinates to board coordinates
  gridToBoard: function (gridX, gridY) {
    return {
      boardX: (gridX + 1) * this.props.knotSize,
      boardY: (gridY + 1) * this.props.knotSize
    };
  },

  convertNeighbors: function (color, type, gridX, gridY, connections) {
    // TODO centralize in helper fn
    const x = gridX;
    const y = gridY;
    const g = this.state.grid;
    const width = this.props.gridWidth;
    const height = this.props.gridHeight;
    const neighbors = {
      top: y > 0 ? g[x][y - 1] : null,
      left: x > 0 ? g[x - 1][y] : null,
      right: x < width - 1 ? g[x + 1][y] : null,
      bottom: y < height - 1 ? g[x][y + 1] : null
    };
    for (const dir in neighbors) {
      if (neighbors[dir]) {
        if (neighbors[dir].props.color !== color && neighbors[dir].props.connections[this.op(dir)] && connections[dir]) {
          neighbors[dir].props.color = color;
          const pos = this.boardToGrid(neighbors[dir].props.boardX, neighbors[dir].props.boardY);
          const nType = neighbors[dir].props.type;
          const c = {
            top: nType == 'pipe' || nType == 'cross',
            left: nType == 'turn' || nType == 't' || nType == 'cross',
            right: nType == 't' || nType == 'cross',
            bottom: nType == 'pipe' || nType == 't' || nType == 'cross' || nType == 'turn'
          };
          this.convertNeighbors(color, nType, pos.gridX, pos.gridY, this.orient(neighbors[dir].props.orientation, c));
        }
      }
    }
  },

  // are this knot's board coordinates within the board itself?
  onBoard: function (knotX, knotY) {
    const { left, top, bottom, right } = this.state.boardDimensions;
    return knotX < right && knotX > left && knotY > top && knotY < bottom;
  },

  validGridPlacement: function (knotX, knotY, color, connections) {
    const { gridX, gridY } = this.boardToGrid(knotX, knotY);
    const unoccupied = this.unoccupied(gridX, gridY);
    const connectionsValid = this.connectionsValid(gridX, gridY, color, connections);
    return unoccupied && connectionsValid;
  },

  unoccupied: function (gridX, gridY) {
    return !this.state.grid[gridX][gridY];
  },

  connectionsValid: function (x, y, color, connections) {
    const g = this.state.grid;
    const width = this.props.gridWidth;
    const height = this.props.gridHeight;
    const neighbors = {
      top: y > 0 ? g[x][y - 1] : null,
      left: x > 0 ? g[x - 1][y] : null,
      right: x < width - 1 ? g[x + 1][y] : null,
      bottom: y < height - 1 ? g[x][y + 1] : null
    };

    // if there are none of your color then you don't have to be color connected
    let colorConnected = true;
    for (const knot of this.state.knots) {
      if (knot.props.color === color) {
        colorConnected = false;
        break;
      }
    }

    // connections
    for (const dir in neighbors) {
      if (neighbors[dir]) {
        if (neighbors[dir].props.connections[this.op(dir)] != connections[dir]) {
          return false; // misconnected
        }
        if (neighbors[dir].props.color === color && neighbors[dir].props.connections[this.op(dir)] && connections[dir]) {
          colorConnected = true;
        }
      }
    }

    return colorConnected;
  },

  op: function (dir) {
    switch (dir) {
      case 'top':
        return 'bottom';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      case 'bottom':
        return 'top';
    }
  },

  makeGrid: function (width, height, seedFunctions) {
    const grid = [];
    const knots = [];
    for (let x = 0; x < width; x++) {
      const row = [];
      for (let y = 0; y < height; y++) {
        let maybeKnot = null;
        // NOTE: seeding grid done server side now
        row.push(maybeKnot);
      }
      grid.push(row);
    }
    return { grid, knots };
  },

  // NOTE: this is duplicated in Tray.react. I'm sorry.
  orient: function (orientation, connections) {
    let rotations = orientation / 90;
    const neg = rotations < 0;
    rotations = Math.abs(rotations);
    for (let i = 0; i < rotations; i++) {
      // clockwise vs counterclockwise
      if (!neg) {
        const topTemp = connections.top;
        connections.top = connections.left;
        connections.left = connections.bottom;
        connections.bottom = connections.right;
        connections.right = topTemp;
      } else {
        const topTemp = connections.top;
        connections.top = connections.right;
        connections.right = connections.bottom;
        connections.bottom = connections.left;
        connections.left = topTemp;
      }
    }
    return connections;
  }

});

module.exports = Game;