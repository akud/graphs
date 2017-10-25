var LOG = require('./Logger');

function ModeSwitch(opts) {
  this.actionQueue = opts && opts.actionQueue;
  this.timeout = (opts && opts.timeout) || 0;
  this.modeStates = (opts && opts.initialStates) || {};
  this.name = (opts && opts.name) || 'ModeSwitch';
  this.currentMode = null;
  this.resetModeFuture = null;
  LOG.debug('Initialized ' + this.name, this);
}

ModeSwitch.prototype = {
  enter: function(mode, fn) {
    this._validate();
    if (this._isPermitted(mode)) {
      LOG.debug(this.name + ': Entering \'' + mode + '\'', this);
      var state = (fn || function() {})();
      this.modeStates[mode] = state;
      this.currentMode = mode;
      this._cancelModeReset();
    } else {
      LOG.debug(this.name + ': Not entering \'' + mode + '\';'
                + ' active mode is ' + this.currentMode, this);
    }
    return this;
  },

  exit: function(mode, fn) {
    this._validate();
    if(this._isActive(mode)) {
      LOG.debug(this.name + ': Exiting ' + mode, this);
      (fn || function() {})(this.modeStates[mode]);
      this._scheduleModeReset();
    } else {
      LOG.debug(this.name + ': Not exiting \'' + mode + '\';'
                + ' active mode is ' + this.currentMode, this);
    }
    return this;
  },

  ifActive: function(callbackObj) {
    var activeMode = this.currentMode || 'default';
    var callback = callbackObj[activeMode];
    if (callback) {
      LOG.debug(this.name + ': Found callback for active mode', activeMode, callbackObj);
      var modeState = this.modeStates[this.currentMode || 'default'];
      callback(modeState);
    } else {
      LOG.debug(this.name + ': No callback for active mode', activeMode, callbackObj);
    }
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
