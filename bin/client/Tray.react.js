const Dispatcher = require('./Dispatcher.js');
const Knot = require('./Knot.react.js');
const React = require('./react/react.js');

const Tray = React.createClass({
  getInitialState: function () {
    return {
      pipe: 3,
      turn: 3,
      t: 3,
      cross: 3
    };
  },

  getDefaultProps: function () {
    return {
      color: 'white',
      knotSize: 100
    };
  },

  onDrop: function (ev, type, color) {
    const x = ev.clientX;
    const y = ev.clientY;
    ev.preventDefault();
    if (this.props.onBoard(x, y) && this.props.validGridPlacement(x, y)) {
      const placeKnot = { actionType: 'PLACE_KNOT', type, color, x, y };
      Dispatcher.dispatch(placeKnot);
      this.setState({
        [type]: this.state[type] - 1
      });
    }
  },

  render: function () {
    const knots = [];
    let t = 0;
    for (let type in this.state) {
      for (let i = 0; i < this.state[type]; i++) {
        knots.push(React.createElement(Knot, {
          x: i * this.props.knotSize + this.props.knotSize,
          y: t * this.props.knotSize + this.props.knotSize,
          color: this.props.color,
          type: type,
          size: this.props.knotSize,
          onDrop: ev => {
            this.onDrop(ev, type, this.props.color);
          }
        }));
      }
      t++;
    }

    return React.createElement(
      'div',
      { className: 'tray', id: 'tray' },
      knots
    );
  }
});

module.exports = Tray;