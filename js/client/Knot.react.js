// @flow

const React = require('./react/react.js');

export type KnotType = 'cross' | 't' | 'turn' | 'pipe' | 'end';
export type KnotColor = 'white' | 'oj' | 'blue';
export type KnotOrientation = 0 | 90 | 180 | 270;
export type KnotConnectionConfig = {};

type Props = {
  color: KnotColor,
  type: KnotType,
  placed: boolean, // has the piece been placed on the board
  boardX: number, // center of the sprite in px
  boardY: number,
  size: number,
  orientation: KnotOrientation,
  onDrop: () => any,
};

type State = {
  placed: boolean,
};

const Knot = React.createClass({
  getInitialState: function (): State {
    return {
      placed: this.props.placed,
    };
  },

  getDefaultProps: function(): Props {
    return {
      color: 'white',
      type: 'cross',
      boardX: 0,
      boardY: 0,
      size: 100,
      placed: false,
      orientation: 0,
      onDrop: () => {},
    };
  },

  onDrop: function(ev: Object): void {
    this.props.onDrop(ev);
  },

  render: function() {
    const src = 'img/' + this.props.color + '_' + this.props.type + '.png';
    return (
      <img
        className="knot"
        draggable={!this.state.placed}
        onDragEnd={this.onDrop}
        src={src}
        style={{
          top:  this.props.boardY - this.props.size / 2,
          left: this.props.boardX - this.props.size / 2,
          transform: 'rotate(' + this.props.orientation + 'deg)',
        }}
      >
      </img>
    );
  }
});

module.exports = Knot;
