function MockActionQueue() {
  this.currentTime = 0;
  this.pendingCalls = {};
  spyOn(this, 'defer').andCallThrough();
}


MockActionQueue.prototype = {
  step: function(steps) {
    this.currentTime += steps;
    Object.keys(this.pendingCalls)
      .filter((function(callTime) {
        return parseInt(callTime) <= this.currentTime;
      }).bind(this))
      .forEach((function(k) {
        this.pendingCalls[k].forEach(function(fn) { fn(); });
        delete this.pendingCalls[k];
      }).bind(this));
  },

  defer: function(timeInFuture, callback) {
    if (arguments.length == 1) {
      callback = timeInFuture;
      timeInFuture = 1;
    }
    var callTime = this.currentTime + timeInFuture;

    if (this.pendingCalls[callTime]) {
      this.pendingCalls[callTime].push(callback);
    } else {
      this.pendingCalls[callTime] = [callback];
    }

    return {
      cancel: (function() {
        if (this.pendingCalls[callTime]) {
          this.pendingCalls[callTime].splice(this.pendingCalls[callTime].indexOf(callback), 1);
        }
      }).bind(this),
    };
  },
};

module.exports = MockActionQueue;
