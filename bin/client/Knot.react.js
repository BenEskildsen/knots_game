const React = require('./react/react.js');

const Knot = React.createClass({
  getInitialState: function () {
    return {
      placed: this.props.placed
    };
  },

  getDefaultProps: function () {
    return {
      color: 'white',
      type: 'cross',
      y: 0,
      x: 0,
      size: 100,
      placed: false,
      onDrop: () => {}
    };
  },

  onDragStart: function (ev) {
    // console.log("tryna drag", ev, ev.clientX, ev.screenX);
  },

  onDrop: function (ev) {
    this.props.onDrop(ev);
  },

  render: function () {
    const src = 'img/' + this.props.color + '_' + this.props.type + '.png';
    return React.createElement('img', {
      className: 'knot',
      draggable: !this.state.placed,
      onDragStart: this.onDragStart,
      onDragEnd: this.onDrop,
      src: src,
      style: {
        top: this.props.y - this.props.size / 2,
        left: this.props.x - this.props.size / 2
      }
    });
  }
});

module.exports = Knot;