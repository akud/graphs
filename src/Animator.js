var TrackedObject = require('./TrackedObject');

function Animator(options) {
  TrackedObject.apply(this);
  this.actionQueue = (options && options.actionQueue);
}

Animator.prototype = Object.assign(new TrackedObject(), {
  className: 'Animator',

  alternate: function() {
    this._checkDependencies();
    return new AlternatingAnimation(this.actionQueue, Array.prototype.slice.call(arguments));
  },

  getConstructorArgs: function() {
    return { actionQueue: this.actionQueue };
  },

  _checkDependencies: function() {
    if (!this.actionQueue) {
      throw Error('ActionQueue is required');
    }
  },
});

function AlternatingAnimation(actionQueue, functions) {
  this.actionQueue = actionQueue;
  this.functions = functions;
  this.currentIndex = 0;
  this.interval = 100;
  this.predicate = function() { return true; };
}

AlternatingAnimation.prototype = {
  every: function(interval) {
    this.interval = interval;
    return this;
  },

  asLongAs: function(predicate) {
    this.predicate = predicate;
    return this;
  },

  play: function() {
    var execute = (function() {
      if (this.predicate()) {
        this.functions[this.currentIndex]();
        this.currentIndex = (this.currentIndex + 1) % this.functions.length;
        this.actionQueue.defer(this.interval, execute);
      }
    }).bind(this);
    execute();
    return this;
  },

  stop: function() {
    return this.asLongAs(function() { return false; });
  },
};

module.exports = Animator;
