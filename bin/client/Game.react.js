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
    return React.createElement(Knot, {
      type: type, color: color,
      boardX: boardX,
      boardY: boardY,
      size: this.props.knotSize,
      placed: placed,
      orientation: orientation
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
    this.setState({ grid, knots });
  },

  rumblerInterval: null,
  rumbles: 0,

  rumbleSequence: function (action) {
    this.rumbles = 30;

    this.rumblerInterval = setInterval(() => {
      this.rumbles === 0 ? clearInterval(this.rumblerInterval) : this.rumble;
      this.rumbles--;
    }, 30);
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

  // are this knot's board coordinates within the board itself?
  onBoard: function (knotX, knotY) {
    const { left, top, bottom, right } = this.state.boardDimensions;
    return knotX < right && knotX > left && knotY > top && knotY < bottom;
  },

  validGridPlacement: function (knotX, knotY) {
    const { gridX, gridY } = this.boardToGrid(knotX, knotY);
    const unoccupied = this.unoccupied(gridX, gridY);
    const connected = this.connected(gridX, gridY);
    const notBlockingConnections = this.notBlockingConnections(gridX, gridY);
    return unoccupied && connected && notBlockingConnections;
  },

  unoccupied: function (gridX, gridY) {
    return !this.state.grid[gridX][gridY];
  },

  connected: function (gridX, gridY) {
    return !this.state.grid[gridX][gridY];
  },

  notBlockingConnections: function (gridX, gridY) {
    return !this.state.grid[gridX][gridY];
  },

  makeGrid: function (width, height, seedFunctions) {
    const grid = [];
    const knots = [];
    for (let x = 0; x < width; x++) {
      const row = [];
      for (let y = 0; y < height; y++) {
        let maybeKnot = null;
        // NOTE: seeding grid done server side now
        // for (const seedFn of seedFunctions) {
        //   maybeKnot = seedFn(x, y);
        // }
        // if (maybeKnot) {
        //   knots.push(maybeKnot);
        // }
        row.push(maybeKnot);
      }
      grid.push(row);
    }
    return { grid, knots };
  }

});

module.exports = Game;