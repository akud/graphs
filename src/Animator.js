function Animator(options) {
  this.setTimeout = (options && options.setTimeout) || global.setTimeout.bind(global);
}

Animator.prototype = {
  alternate: function() {
    return new AlternatingAnimation(this, Array.prototype.slice.call(arguments));
  },
};

function AlternatingAnimation(animator, functions) {
  this.animator = animator;
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
        this.animator.setTimeout(execute, this.interval);
      }
    }).bind(this);
    execute();
  },
};

module.exports = Animator;
