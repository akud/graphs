function MockTimer() {
  this.currentTime = 0;
  this.pendingCalls = {};
}


MockTimer.prototype = {
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

  getSetTimeoutFn: function() {
    return (function(callback, timeInFuture) {
      timeInFuture = timeInFuture || 0;
      var callTime = this.currentTime + timeInFuture;
      if (this.pendingCalls[callTime]) {
        this.pendingCalls[callTime].push(callback);
      } else {
        this.pendingCalls[callTime] = [callback];
      }
    }).bind(this);
  },
};

module.exports = MockTimer;
