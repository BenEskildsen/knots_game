const Board = require('./Board.react.js');
const Dispatcher = require('./Dispatcher.js');
const Knot = require('./Knot.react.js');
const React = require('./react/react.js');
const Tray = require('./Tray.react.js');

/**
 * Note: board refers to the pixel coordinates dom element, grid refers to the
 * WxH playing field
 */
const Game = React.createClass({

  // --------------------------------------------------------------------------
  // React lifecycle methods
  // --------------------------------------------------------------------------

  componentDidMount: function () {
    Dispatcher.relayListen(this.onRelayDispatch);
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
    const { grid, knots } = this.makeGrid(this.props.gridWidth, this.props.gridHeight, [this.neutralKnotsAroundBorder] // <-- functions that seed the grid
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
      turnColor: 'oj'
    };
  },

  render: function () {
    return React.createElement(
      'div',
      { className: 'background' },
      React.createElement(Board, {
        width: this.props.gridWidth,
        height: this.props.gridHeight,
        knotSize: this.props.knotSize,
        knots: this.state.knots
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
  // Action handling
  // --------------------------------------------------------------------------

  onRelayDispatch: function (action) {
    switch (action.actionType) {
      case 'PLACE_KNOT':
        this.placeKnot(action);
        break;
    }
  },

  // assumes that the target location for the knot is valid (ie unoccupied)
  // and inside of the grid
  placeKnot: function (action) {
    const { knots, grid } = this.state;
    const { x, y, color, type, orientation } = action;
    const { gridX, gridY } = this.boardToGrid(x, y);
    const knot = this.makeKnot(color, type, gridX, gridY, orientation);
    grid[gridX][gridY] = knot;
    knots.push(knot);
    this.setState({ grid, knots });
  },

  // --------------------------------------------------------------------------
  // Helpers
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

  // is knotX, knotY unoccupied?
  validGridPlacement: function (knotX, knotY) {
    const { gridX, gridY } = this.boardToGrid(knotX, knotY);
    return !this.state.grid[gridX][gridY];
  },

  makeKnot: function (color, type, gridX, gridY, orientation = 0, placed = true) {
    const { boardX, boardY } = this.gridToBoard(gridX, gridY);
    return React.createElement(Knot, {
      type: type, color: color,
      x: boardX,
      y: boardY,
      size: this.props.knotSize,
      placed: placed,
      orientation: orientation
    });
  },

  makeGrid: function (width, height, seedFunctions) {
    const grid = [];
    const knots = [];
    for (let x = 0; x < width; x++) {
      const row = [];
      for (let y = 0; y < height; y++) {
        let maybeKnot;
        for (const seedFn of seedFunctions) {
          maybeKnot = seedFn(x, y);
        }
        if (maybeKnot) {
          knots.push(maybeKnot);
        }
        row.push(maybeKnot);
      }
      grid.push(row);
    }
    return { grid, knots };
  },

  neutralKnotsAroundBorder(x, y) {
    const { gridWidth, gridHeight } = this.props;
    if (x == 0 || y == 0 || x == gridWidth - 1 || y == gridHeight - 1) {
      return this.makeKnot('white', 'cross', x, y);
    }
    return null;
  }

});

module.exports = Game;