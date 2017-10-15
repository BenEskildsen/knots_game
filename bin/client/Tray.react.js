const Dispatcher = require('./Dispatcher.js');
const Knot = require('./Knot.react.js');
const React = require('./react/react.js');
const tweenState = require('react-tween-state');

const Tray = React.createClass({
  mixins: [tweenState.Mixin],

  // --------------------------------------------------------------------------
  // React lifecycle methods
  // --------------------------------------------------------------------------

  getInitialState: function () {
    return {
      knotCounts: {
        pipe: 4,
        turn: 4,
        t: 4,
        cross: 4
      },
      orientation: 90
    };
  },

  getDefaultProps: function () {
    return {
      color: 'white',
      knotSize: 100
    };
  },

  render: function () {
    const knots = [];
    let t = 0;
    for (let type in this.state.knotCounts) {
      for (let i = 0; i < this.state.knotCounts[type]; i++) {
        const { boardX, boardY } = this.props.gridToBoard(i, t);
        knots.push(React.createElement(Knot, {
          x: boardX,
          y: boardY,
          color: this.props.color,
          type: type,
          size: this.props.knotSize,
          orientation: this.getTweeningValue('orientation'),
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
      React.createElement(
        'div',
        { className: 'trayKnotSection' },
        knots
      ),
      React.createElement(
        'div',
        { className: 'trayButtonSection' },
        React.createElement(
          'button',
          { onClick: this.onClockwiseClick },
          'Rotate Unplaced Knots Clockwise'
        ),
        React.createElement(
          'button',
          { onClick: this.onCounterClockwiseClick },
          'Rotate Unplaced Knots CounterClockwise'
        )
      )
    );
  },

  // --------------------------------------------------------------------------
  // Event handling
  // --------------------------------------------------------------------------

  onDrop: function (ev, type, color) {
    const x = ev.clientX;
    const y = ev.clientY;
    ev.preventDefault();
    if (this.props.onBoard(x, y) && this.props.validGridPlacement(x, y)) {
      const orientation = this.state.orientation;
      const placeKnot = { actionType: 'PLACE_KNOT', type, color, x, y, orientation };
      Dispatcher.dispatch(placeKnot);
      // I don't know how to use react :(
      this.state.knotCounts[type] = this.state.knotCounts[type] - 1;
      this.setState({ knotCounts: this.state.knotCounts });
    }
  },

  onClockwiseClick: function () {
    const orientation = this.state.orientation;
    this.tweenState('orientation', {
      easing: tweenState.easingTypes.easeInOutQuad,
      duration: 500,
      endValue: (orientation + 90) % 360
    });
  },

  onCounterClockwiseClick: function () {
    const orientation = this.state.orientation;
    this.tweenState('orientation', {
      easing: tweenState.easingTypes.easeInOutQuad,
      duration: 500,
      endValue: (orientation + 270) % 360
    });
  }
});

module.exports = Tray;