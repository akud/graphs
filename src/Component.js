/**
 * Component constructor
 *
 * services - service objects
 * options - options for the component.
 *         - holdTime - amount of time to wait before triggering a "hold" event
 */
function Component(services, options) {
  this.setTimeout = (services && services.setTimeout) || global.setTimeout.bind(global);
  this.holdTime = (options && options.holdTime) || 250;

  this.mouseDownCount = 0;
  this.mouseUpCount = 0;
  this.isInClickAndHold = false;
}

Component.prototype = {
  handleClick: function() {},
  handleClickAndHold: function() {},


  attachTo: function(targetElement) {
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

      this.setTimeout((function() {
        if (this.mouseDownCount === originalCount &&
            this.mouseUpCount === this.mouseDownCount - 1) {
          this.isInClickAndHold = true;
          this.handleClickAndHold(event);
        }
      }).bind(this), this.holdTime);
    }).bind(this));

    this.doAttach(targetElement);
  },

  /**
   * Sub-components should override to initialize on attachment
   */
  doAttach: function(element) {

  },
};

module.exports = Component;
