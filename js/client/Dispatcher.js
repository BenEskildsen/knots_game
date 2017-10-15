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
 * For now Game.react will listen to the dispatcher directly, but once I have
 * Eureca clients set up the server proxy will listen to the dispatcher
 * instead and I will have a separate mechanism for sending server responses
 * back to Game.react
 */
const Dispatcher = {
  listeners: [],

  dispatch: function(action: Action): void {
    for (const fn of this.listeners) {
      fn(action);
    }
  },

  listen: function(callback: () => any): void {
    this.listeners.push(callback);
  }

};

module.exports = Dispatcher;
