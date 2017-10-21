// @flow

const Board = require('./Board.react.js');
const Dispatcher = require('./Dispatcher.js');
const Knot = require('./Knot.react.js');
const React = require('./react/react.js');
const Tray = require('./Tray.react.js');
const tweenState = require('react-tween-state');

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
  grid: Array<Array<?Knot>>, // TODO make knots their own object type that's not
  knots: Array<Knot>,        // related to react
};

/**
 * Note: board refers to the pixel coordinates dom element, grid refers to the
 * WxH playing field
 */
const Game = React.createClass({
  mixins: [tweenState.Mixin],

  // --------------------------------------------------------------------------
  // React lifecycle methods
  // --------------------------------------------------------------------------

  componentDidMount: function(): void {
    Dispatcher.clientListen(this.onClientDispatch);
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
      [this.neutralPipesMostly], // <-- functions that seed the grid
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
      xOffset: 0, // for eg. rumbling the screen
      yOffset: 0,
      turnColor: 'oj',
    };
  },

  render: function() {
    const renderedKnots = [];
    for (let i = 0; i < this.state.knots.length; i++) {
      const knot = this.state.knots[i];
      renderedKnots.push(<Knot
        {...knot.props}
        boardX={knot.props.boardX + this.state.xOffset}
        boardY={knot.props.boardY + this.state.yOffset} />
      );
    }

    return (
      <div className="background">
        <Board
          width={this.props.gridWidth}
          height={this.props.gridHeight}
          knotSize={this.props.knotSize}
          knots={renderedKnots}
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
  // Rendering helpers
  // --------------------------------------------------------------------------

  renderKnot: function(
    color: KnotColor, type: KnotType,
    gridX: number, gridY: number,
    orientation: KnotOrientation = 0,
    placed: boolean = true,
  ): React.Node {
    const {boardX, boardY} = this.gridToBoard(gridX, gridY);
    return <Knot
      type={type} color={color}
      boardX={boardX}
      boardY={boardY}
      size={this.props.knotSize}
      placed={placed}
      orientation={orientation}
    />;
  },

  rumble: function(): void {
    const nextKnots = this.state.knots;
    const offset = Math.random() * 50 - 25;
    const xOrYOffset = Math.random() > 0.5 ?
      'xOffset' :
      'yOffset';
    this.tweenState(xOrYOffset, {
      easing: tweenState.easingTypes.easeInOutQuad,
      duration: 25,
      endValue: this.state[xOrYOffset] + offset,
    });
  },

  // --------------------------------------------------------------------------
  // Action handling
  // --------------------------------------------------------------------------

  onClientDispatch: function(action: Action): void {
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
  placeKnot: function(action: PlaceKnotAction): void {
    const {knots, grid} = this.state;
    const {x, y, color, type, orientation} = action;
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
    this.setState({grid, knots});
  },

  rumblerInterval: null,
  rumbles: 0,

  rumbleSequence: function(action: RumbleAction): void {
    this.rumbles = 30;

    this.rumblerInterval = setInterval(() => {
        (this.rumbles === 0) ?
          clearInterval(this.rumblerInterval) :
          this.rumble;
        this.rumbles--;
      },
      30,
    );
  },

  // --------------------------------------------------------------------------
  // Helpers TODO move this out to a non-react-specfic utils file
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

  validGridPlacement: function(knotX: number, knotY: number): boolean {
    const {gridX, gridY} = this.boardToGrid(knotX, knotY);
    const unoccupied = this.unoccupied(gridX, gridY);
    const connected = this.connected(gridX, gridY);
    const notBlockingConnections = this.notBlockingConnections(gridX, gridY);
    return unoccupied && connected && notBlockingConnections;
  },

  unoccupied: function(gridX: number, gridY: number): boolean {
    return !this.state.grid[gridX][gridY];
  },

  connected: function(gridX: number, gridY: number): boolean {
    return !this.state.grid[gridX][gridY];
  },

  notBlockingConnections: function(gridX: number, gridY: number): boolean {
    return !this.state.grid[gridX][gridY];
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
    return {grid, knots}
  },

});

module.exports = Game;
