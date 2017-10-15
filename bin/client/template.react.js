const React = require('./react/react.js');

const Game = React.createClass({
  getInitialState: function () {
    return {};
  },

  getDefaultProps: function () {
    return {};
  },

  render: function () {
    return React.createElement(
      "div",
      { className: "background" },
      "hello?"
    );
  }
});

module.exports = Game;