function ModeSwitch(options) {
  if (options) {
    this.actionQueue = options.actionQueue;
    this.timeout = options.timeout || 0;
  }
  this.currentMode = null;
  this.resetModeFuture = null;
}

ModeSwitch.prototype = {
  enter: function(mode, fn) {
    this._validate();
    if (this.isPermitted(mode)) {
      (fn || function() {})();
      this.currentMode = mode;
      this._cancelModeReset();
    }
  },

  exit: function(mode, fn) {
    this._validate();
    if(this.isActive(mode)) {
      (fn || function() {})();
      this._scheduleModeReset();
    }
  },

  isPermitted: function(mode) {
    return !this.currentMode || this.isActive(mode);
  },

  isActive: function(mode) {
    return this.currentMode === mode;
  },

  _cancelModeReset: function() {
    this.resetModeFuture && this.resetModeFuture.cancel();
  },

  _scheduleModeReset: function() {
    var resetFunction = (function() {
      this.currentMode = null;
    }).bind(this);

    this._cancelModeReset();
    if (this.timeout) {
      this.resetModeFuture = this.actionQueue.defer(
        this.timeout, resetFunction
      );
    } else {
      resetFunction();
    }
  },

  _validate: function() {
    if(this.timeout && !this.actionQueue) {
      throw new Error('action queue is required if a timeout is specified');
    }
  },
};

module.exports = ModeSwitch;
