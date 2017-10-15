// @flow

const Knot = require('./Knot.react.js');
const React = require('./react/react.js');

import type {KnotType} from './Knot.react.js';

type Props = {
  knotSize: number, // dimensions of the knots in px
  knots: Array<Knot>, // knots know where to render themselves
};
type State = {};

const Board = React.createClass({

  render: function() {
    return (
      <div className="board" id="board" onDragOver={(ev) => ev.stopPropagation}>
        {this.props.knots}
      </div>
    );
  }
});

module.exports = Board;
