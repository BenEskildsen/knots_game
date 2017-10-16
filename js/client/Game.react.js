// @flow

const Board = require('./Board.react.js');
const Dispatcher = require('./Dispatcher.js');
const Knot = require('./Knot.react.js');
const React = require('./react/react.js');
const Tray = require('./Tray.react.js');

import type {Action} from './Dispatcher.js';
import type {KnotColor, KnotType, KnotOrientation} from './Knot.react.js';
import type {PlaceKnotAction, RumbleAction} from './Tray.react.js';

type Props = {
  gridWidth: number, // in grid coordinates (not pixels, see note below)
  gridHeight: number,
  knotSize: number, // in pixels
  playerColor: KnotColor, // color of the player on this client
};
type State = {
  boardDimensions: {
    top: number,
    left: number,
    right: number,
    bottom: number,
  },
  turnColor: KnotColor, // color of the player whose turn it is
  grid: Array<Array<?Knot>>,
  knots: Array<Knot>,
};

/**
 * Note: board refers to the pixel coordinates dom element, grid refers to the
 * WxH playing field
 */
const Game = React.createClass({

  // --------------------------------------------------------------------------
  // React lifecycle methods
  // --------------------------------------------------------------------------

  componentDidMount: function(): void {
    Dispatcher.clientListen(this.onRelayDispatch);
  },

  getDefaultProps: function(): Props {
    return {
      gridWidth: 9,
      gridHeight: 9,
      knotSize: 100,
      playerColor: 'white',
    };
  },

  getInitialState: function (): State {
    const {grid, knots} = this.makeGrid(
      this.props.gridWidth, this.props.gridHeight,
      [this.neutralKnotsAroundBorder], // <-- functions that seed the grid
    );
    return {
      boardDimensions: {
        top: this.props.knotSize / 2,
        left: this.props.knotSize / 2,
        right: (this.props.gridWidth + 1/2) * this.props.knotSize,
        bottom: (this.props.gridHeight + 1/2) * this.props.knotSize,
      },
      grid,
      knots,
      turnColor: 'oj',
    };
  },

  render: function() {
    return (
      <div className="background">
        <Board
          width={this.props.gridWidth}
          height={this.props.gridHeight}
          knotSize={this.props.knotSize}
          knots={this.state.knots}
        />
        <Tray
          knotSize={this.props.knotSize}
          color={this.props.playerColor}
          onBoard={this.onBoard}
          validGridPlacement={this.validGridPlacement}
          gridToBoard={this.gridToBoard}
        />
      </div>
    );
  },

  // --------------------------------------------------------------------------
  // Action handling
  // --------------------------------------------------------------------------

  onRelayDispatch: function(action: Action): void {
    switch (action.actionType) {
      case 'PLACE_KNOT':
        this.placeKnot(action);
        break;
      case 'RUMBLE':
        this.rumble(action);
        break;
    }
  },

  // assumes that the target location for the knot is valid (ie unoccupied)
  // and inside of the grid
  placeKnot: function(action: PlaceKnotAction): void {
    const {knots, grid} = this.state;
    const {x, y, color, type, orientation} = action;
    const {gridX, gridY} = this.boardToGrid(x, y);
    const knot = this.makeKnot(color, type, gridX, gridY, orientation);
    grid[gridX][gridY] = knot;
    knots.push(knot);
    this.setState({grid, knots});
  },

  rumble: function(action: RumbleAction): void {

  },

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  // convert board coordinates (pixels) to grid coordinates
  boardToGrid: function(
    boardX: number, boardY: number,
  ): {gridX: number, gridY: number} {
    return {
      gridX: Math.round((boardX / this.props.knotSize) - 1),
      gridY: Math.round((boardY / this.props.knotSize) - 1),
    };
  },

  // convert grid coordinates to board coordinates
  gridToBoard: function(
    gridX: number, gridY: number,
  ): {boardX: number, boardY: number} {
    return {
      boardX: (gridX + 1) * this.props.knotSize,
      boardY: (gridY + 1) * this.props.knotSize,
    };
  },

  // are this knot's board coordinates within the board itself?
  onBoard: function(knotX: number, knotY: number): boolean {
    const {left, top, bottom, right} = this.state.boardDimensions;
    return knotX < right && knotX > left && knotY > top && knotY < bottom;
  },

  // is knotX, knotY unoccupied?
  validGridPlacement: function(knotX: number, knotY: number): boolean {
    const {gridX, gridY} = this.boardToGrid(knotX, knotY);
    return !this.state.grid[gridX][gridY];
  },

  makeKnot: function(
    color: KnotColor, type: KnotType,
    gridX: number, gridY: number,
    orientation: KnotOrientation = 0,
    placed: boolean = true,
  ): React.Node {
    const {boardX, boardY} = this.gridToBoard(gridX, gridY);
    return <Knot
      type={type} color={color}
      x={boardX}
      y={boardY}
      size={this.props.knotSize}
      placed={placed}
      orientation={orientation}
    />;
  },

  makeGrid: function(
    width: number, height: number,
    seedFunctions: Array<(x: number, y: number) => ?Knot>
  ): {grid: Array<Array<?Knot>>, knots: Array<Knot>} {
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
    return {grid, knots}
  },

  neutralKnotsAroundBorder(x: number, y: number): ?Knot {
    const {gridWidth, gridHeight} = this.props;
    if (x == 0 || y == 0 || x == gridWidth - 1 || y == gridHeight - 1) {
      return this.makeKnot('white', 'cross', x, y);
    }
    return null;
  },

});

module.exports = Game;
