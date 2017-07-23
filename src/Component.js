/**
 * Component constructor
 *
 * services - service objects
 * options - options for the component.
 *         - holdTime - amount of time to wait before triggering a "hold" event
 */
function Component(services, options) {
  this.setTimeout = (services && services.setTimeout) || global.setTimeout;
  this.holdTime = (options && options.holdtime) || 250;
}

Component.prototype = {
  handleClick: null,
  handleClickAndHold: null,

  isMouseDown: false,

  attachTo: function(targetElement) {

    if(typeof this.handleClick === 'function') {
      targetElement.addEventListener('click', (function(event) {
        this.handleClick(event);
      }).bind(this));
    }

    if(typeof this.handleClickAndHold === 'function') {

      targetElement.addEventListener('mouseup', (function(event) {
        this.isMouseDown = false;
      }).bind(this));

      targetElement.addEventListener('mousedown', (function(event) {
        this.isMouseDown = true;
        this.setTimeout((function() {
          if (this.isMouseDown) {
            this.handleClickAndHold(event);
          }
        }).bind(this), this.holdTime);
      }).bind(this));
    }

    this.doAttach(targetElement);
  },

  /**
   * Sub-components should override to initialize on attachment
   */
  doAttach: function(element) {

  },
};

module.exports = Component;
