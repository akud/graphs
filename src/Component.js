var utils = require('./utils');
var ModeSwitch = require('./ModeSwitch');

/**
 * Component constructor
 *
 * options - service objects
 * options - options for the component.
 *         - holdTime - amount of time to wait before triggering a "hold" event
 */
function Component(options) {
  if (options) {
    this.actionQueue = options.actionQueue;
    this.holdTime = options.holdTime || 250;
    this.mouseTouchSwitch = new ModeSwitch({
      actionQueue: this.actionQueue,
      timeout: 500,
    });
  }

  this.mouseDownCount = 0;
  this.mouseUpCount = 0;
  this.isInClickAndHold = false;
}

Component.prototype = {
  handleClick: function() {},
  handleClickAndHold: function() {},


  attachTo: function(targetElement) {
    this._validateOptions();

    targetElement.addEventListener('mouseup', (function(event) {
      event = utils.normalizeEvent(event);
      this.mouseTouchSwitch.exit('mouse', (function() {
        this._handleMouseUp(event);
      }).bind(this));
    }).bind(this));

    targetElement.addEventListener('touchend', (function(event) {
      event = utils.normalizeEvent(event);
      this.mouseTouchSwitch.exit('touch', (function() {
        this._handleMouseUp(event);
      }).bind(this));
    }).bind(this));

    targetElement.addEventListener('mousedown', (function(event) {
      event = utils.normalizeEvent(event);
      this.mouseTouchSwitch.enter('mouse', (function() {
        this._handleMouseDown(event);
      }).bind(this));
    }).bind(this));

    targetElement.addEventListener('touchstart', (function(event) {
      event - utils.normalizeEvent(event);
      this.mouseTouchSwitch.enter('touch', (function() {
        this._handleMouseDown(event);
      }).bind(this));
    }).bind(this));

    this.doAttach(targetElement);
  },

  /**
   * Sub-components should override to initialize on attachment
   */
  doAttach: function(element) {

  },

  _validateOptions: function() {
    if (!this.actionQueue) {
      throw Error('actionQueue is required');
    }
  },

  _handleMouseUp: function(event) {
    this.mouseUpCount++;
    if (this.isInClickAndHold) {
      this.isInClickAndHold = false;
    } else {
      this.handleClick(event);
    }
  },

  _handleMouseDown: function(event) {
    this.mouseDownCount++;
    var originalCount = this.mouseDownCount;

    this.actionQueue.defer(this.holdTime, (function() {
      if (this.mouseDownCount === originalCount &&
          this.mouseUpCount === this.mouseDownCount - 1) {
        this.isInClickAndHold = true;
        this.handleClickAndHold(event);
      }
    }).bind(this));
  },
};

module.exports = Component;
