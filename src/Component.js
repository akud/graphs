var utils = require('./utils');
var ModeSwitch = require('./ModeSwitch');
var LOG = require('./Logger');

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
      name: 'mouseTouchSwitch',
    });
  }

  this.mouseDownCount = 0;
  this.mouseUpCount = 0;
  this.isInClickAndHold = false;
  this.closeListeners = [];
}

Component.prototype = {
  handleClick: function() {},
  handleClickAndHold: function() {},
  handleEnter: function() {},

  attachTo: function(targetElement) {
    this._validateOptions();
    this.element = targetElement;

    targetElement.addEventListener('mouseup', (function(event) {
      LOG.debug('mouseup', utils.normalizeEvent(event));
      this.mouseTouchSwitch.exit('mouse', (function(modeState) {
        this._handleMouseUp(modeState.lastDownEvent);
      }).bind(this));
    }).bind(this));

    targetElement.addEventListener('touchend', (function(event) {
      LOG.debug('touchend', utils.normalizeEvent(event));
      this.mouseTouchSwitch.exit('touch', (function(modeState) {
        this._handleMouseUp(modeState.lastDownEvent);
      }).bind(this));
    }).bind(this));

    targetElement.addEventListener('mousedown', (function(event) {
      event = utils.normalizeEvent(event);
      LOG.debug('mousedown', event);
      this.mouseTouchSwitch.enter('mouse', (function() {
        this._handleMouseDown(event);
        return { lastDownEvent: event };
      }).bind(this));
    }).bind(this));

    targetElement.addEventListener('touchstart', (function(event) {
      event = utils.normalizeEvent(event);
      LOG.debug('touchstart', event);
      this.mouseTouchSwitch.enter('touch', (function() {
        this._handleMouseDown(event);
        return { lastDownEvent: event };
      }).bind(this));
    }).bind(this));

    targetElement.addEventListener('keyup', (function(event) {
      event = utils.normalizeEvent(event);
      LOG.debug('keyup', event);
      if (event.keyCode === 13) {
        this.handleEnter(event);
      }
    }).bind(this));

    if (this.getGeneratedMarkup()) {
      targetElement.innerHTML = this.getGeneratedMarkup();
    }

    this.doAttach(targetElement);
  },

  /**
   * subclasses can override to indicate initial markup
   * to be set on the target element
   */
  getGeneratedMarkup: function() {
    return null;
  },

  /**
   * Sub-components should override to initialize on attachment
   */
  doAttach: function(element) {

  },

  onRemove: function(listener) {
    this.closeListeners.push(listener);
    return this;
  },

  remove: function() {
    this.closeListeners.forEach((function(f) {
      f(this);
    }).bind(this));
    this.element.remove();
    LOG.debug('closed component', this);
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
