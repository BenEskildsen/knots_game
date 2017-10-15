// @flow

export type Token = {
  unlisten: () => void,
};

export type Action = {
  actionType: string,
};

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
  relayListeners: [],

  dispatch: function(action: Action): void {
    for (const fn of this.listeners) {
      fn(action);
    }
  },
  // listen to actions dispatched from the Dispatcher
  listen: function(callback: () => any): void {
    this.listeners.push(callback);
  },

  relayDispatch: function(action: Action): void {
    for (const fn of this.relayListeners) {
      fn(action);
    }
  },
  relayListen: function(callback: () => any): void {
    this.relayListeners.push(callback);
  },

};

module.exports = Dispatcher;
