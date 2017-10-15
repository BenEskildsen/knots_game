// @flow

const React = require('./react/react.js');

export type KnotType = 'cross' | 't' | 'turn' | 'pipe' | 'end';
export type KnotColor = 'white' | 'oj' | 'blue';

type Props = {
  color: KnotColor,
  type: KnotType,
  placed: boolean, // has the piece been placed on the board
  x: number, // center of the img
  y: number,
  size: number,
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
      y: 0,
      x: 0,
      size: 100,
      placed: false,
      onDrop: () => {},
    };
  },

  onDragStart: function(ev: Object): void {
    // console.log("tryna drag", ev, ev.clientX, ev.screenX);
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
        onDragStart={this.onDragStart}
        onDragEnd={this.onDrop}
        src={src}
        style={{
          top: this.props.y - this.props.size / 2,
          left:this.props.x - this.props.size / 2,
        }}
      >
      </img>
    );
  }
});

module.exports = Knot;
