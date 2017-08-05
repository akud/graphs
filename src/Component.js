/**
 * Component constructor
 *
 * services - service objects
 * options - options for the component.
 *         - holdTime - amount of time to wait before triggering a "hold" event
 */
function Component(services, options) {
  this.actionQueue = (services && services.actionQueue);
  this.holdTime = (options && options.holdTime) || 250;

  this.mouseDownCount = 0;
  this.mouseUpCount = 0;
  this.isInClickAndHold = false;
}

Component.prototype = {
  handleClick: function() {},
  handleClickAndHold: function() {},


  attachTo: function(targetElement) {
    this._checkServices();
    targetElement.addEventListener('mouseup', (function(event) {
      this.mouseUpCount++;
      if (this.isInClickAndHold) {
        this.isInClickAndHold = false;
      } else {
        this.handleClick(event);
      }
    }).bind(this));

    targetElement.addEventListener('mousedown', (function(event) {
      this.mouseDownCount++;
      var originalCount = this.mouseDownCount;

      this.actionQueue.defer(this.holdTime, (function() {
        if (this.mouseDownCount === originalCount &&
            this.mouseUpCount === this.mouseDownCount - 1) {
          this.isInClickAndHold = true;
          this.handleClickAndHold(event);
        }
      }).bind(this));
    }).bind(this));

    this.doAttach(targetElement);
  },

  /**
   * Sub-components should override to initialize on attachment
   */
  doAttach: function(element) {

  },

  _checkServices: function() {
    if (!this.actionQueue) {
      throw Error('actionQueue is required');
    }
  },
};

module.exports = Component;
