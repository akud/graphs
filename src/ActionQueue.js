function ActionQueue(options) {
  this.setTimeout = (options && options.setTimeout) || global.setTimeout.bind(global);
  this.clearTimeout = (options && options.clearTimeout) || global.clearTimeout.bind(global);
}

ActionQueue.prototype = {
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

};

module.exports = ActionQueue;
