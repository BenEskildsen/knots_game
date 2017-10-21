

/**
 * User actions are sent through the dispatcher. Anyone can listen to the
 * dispatcher and receive the actions sent to it in the form of a
 * parameter to a callback
 *
 * I have it set up such that the server is listening to dispatch and Game.react
 * is listening to relayDispatch. So when the user places a piece it first goes
 * to the server, and then the server relayDispatches that action to all clients
 */
const Dispatcher = {
  listeners: [],
  clientListeners: [],

  // TODO clear up this distinction.
  // an action is dispatched TOO the server, not by the server
  serverDispatch: function (action) {
    for (const fn of this.listeners) {
      fn(action);
    }
  },

  // server listens to actions dispatched from the Dispatcher
  serverListen: function (callback) {
    this.listeners.push(callback);
  },

  clientDispatch: function (action) {
    for (const fn of this.clientListeners) {
      fn(action);
    }
  },
  clientListen: function (callback) {
    this.clientListeners.push(callback);
  }

};

module.exports = Dispatcher;