function ActionQueue(options) {
  this.setTimeout = (options && options.setTimeout) || global.setTimeout.bind(global);
}

ActionQueue.prototype = {
  defer: function(timeout, fn) {
    if (arguments.length == 1) {
      fn = timeout;
      timeout = 1;
    }
    this.setTimeout(fn, timeout);
  },

};

module.exports = ActionQueue;
