const Knot = require('./Knot.react.js');
const React = require('./react/react.js');

const Board = React.createClass({

  render: function () {
    return React.createElement(
      'div',
      { className: 'board', id: 'board', onDragOver: ev => ev.stopPropagation },
      this.props.knots
    );
  }
});

module.exports = Board;