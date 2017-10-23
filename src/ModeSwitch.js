function ModeSwitch(options) {
  this.actionQueue = options && options.actionQueue;
  this.timeout = (options && options.timeout) || 0;
  this.modeStates = (options && options.initialStates) || {};
  this.currentMode = null;
  this.resetModeFuture = null;
}

ModeSwitch.prototype = {
  enter: function(mode, fn) {
    this._validate();
    if (this._isPermitted(mode)) {
      var state = (fn || function() {})();
      this.modeStates[mode] = state;
      this.currentMode = mode;
      this._cancelModeReset();
    }
    return this;
  },

  exit: function(mode, fn) {
    this._validate();
    if(this._isActive(mode)) {
      (fn || function() {})(this.modeStates[mode]);
      this._scheduleModeReset();
    }
    return this;
  },

  ifActive: function(callbackObj) {
    var callback = callbackObj[this.currentMode || 'default'];
    var modeState = this.modeStates[this.currentMode || 'default'];
    (callback || function(){})(modeState);
    return this;
  },

  _isPermitted: function(mode) {
    return !this.currentMode || this._isActive(mode);
  },

  _isActive: function(mode) {
    return this.currentMode === mode;
  },

  _cancelModeReset: function() {
    this.resetModeFuture && this.resetModeFuture.cancel();
  },

  _scheduleModeReset: function() {
    var resetFunction = (function() {
      delete this.modeStates[this.currentMode];
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
