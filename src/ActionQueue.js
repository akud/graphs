var Literal = require('./Literal');

function ActionQueue(options) {
  this.setTimeout = (options && options.setTimeout) || global.setTimeout.bind(global);
  this.clearTimeout = (options && options.clearTimeout) || global.clearTimeout.bind(global);
  this.actionInterval = (options && options.actionInterval) || 10;
  this.periodicActions = [];
  this.hasStartedPeriodicActions = false;
}

ActionQueue.prototype = {
  className: 'ActionQueue',

  defer: function(timeout, fn) {
    if (arguments.length == 1) {
      fn = timeout;
      timeout = 1;
    }
    var timeoutId = this.setTimeout(fn, timeout);
    return {
      cancel: (function() {
        this.clearTimeout(timeoutId);
      }).bind(this),
    };
  },

  periodically: function(fn) {
    var periodicActions = this.periodicActions;
    periodicActions.push(fn);

    if(!this.hasStartedPeriodicActions) {
      this._startPeriodicActions();
    }

    return {
      cancel: function() {
        periodicActions.splice(
          periodicActions.indexOf(fn),
          1
        );
      },
    };
  },

  _startPeriodicActions: function() {
      var queueFn = (function() {
        this.periodicActions.forEach(function(fn) { fn(); });
        this.setTimeout(queueFn, this.actionInterval);
      }).bind(this);
      queueFn();
      this.hasStartedPeriodicActions = true;
  },

  getConstructorArgs: function() {
    return {
      setTimeout: new Literal('global.setTimeout.bind(global)'),
      clearTimeout: new Literal('global.clearTimeout.bind(global)'),
      actionInterval: this.actionInterval,
    };
  },
};

module.exports = ActionQueue;
