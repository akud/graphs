function Component(services, options) {
}

Component.prototype = {
  handleClick: null,

  attachTo: function(targetElement) {
    if(typeof this.handleClick === 'function') {
      targetElement.addEventListener('click', (function(event) {
        this.handleClick(event);
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
