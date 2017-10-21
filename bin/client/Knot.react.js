const React = require('./react/react.js');

const Knot = React.createClass({

  // --------------------------------------------------------------------------
  // React lifecycle methods
  // --------------------------------------------------------------------------

  getInitialState: function () {
    return {
      placed: this.props.placed
    };
  },

  getDefaultProps: function () {
    return {
      color: 'white',
      type: 'cross',
      boardX: 0,
      boardY: 0,
      size: 100,
      placed: false,
      orientation: 0,
      onDrop: () => {},
      connections: {
        top: false,
        left: false,
        right: false,
        bottom: false
      }
    };
  },

  componentWillReceiveProps: function (nextProps) {
    if (nextProps.orientation % 90 == 0 && this.connections) {
      this.connections = this.orient(nextProps.orientation - this.props.orientation, this.connections);
    }
  },

  render: function () {
    const src = 'img/' + this.props.color + '_' + this.props.type + '.png';
    return React.createElement('img', {
      className: 'knot',
      draggable: !this.state.placed,
      onDragEnd: this.onDrop,
      src: src,
      style: {
        top: this.props.boardY - this.props.size / 2,
        left: this.props.boardX - this.props.size / 2,
        transform: 'rotate(' + this.props.orientation + 'deg)'
      }
    });
  },

  // --------------------------------------------------------------------------
  // Event handling
  // --------------------------------------------------------------------------

  onDrop: function (ev) {
    this.props.onDrop(ev);
  }
});

module.exports = Knot;