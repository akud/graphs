function ModeSwitch(options) {
  if (options) {
    this.actionQueue = options.actionQueue;
    this.timeout = options.timeout || 1;
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
    this._cancelModeReset();
    this.resetModeFuture = this.actionQueue.defer(this.timeout, (function() {
      this.currentMode = null;
    }).bind(this));
  },

  _validate: function() {
    if(!this.actionQueue) {
      throw new Error('action queue is required');
    }
  },
};

module.exports = ModeSwitch;
