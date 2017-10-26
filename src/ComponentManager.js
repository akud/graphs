var utils = require('./utils');
var Position = require('./Position');
var Component = require('./Component');

function ComponentManager(options) {
  this.document = options && options.document;
  this.actionQueue = options && options.actionQueue;
  this.componentServices = options && options.componentServices;
}

ComponentManager.prototype = {
  insertComponent: function(options) {
    options = Object.assign({
      position: new Position({ topLeft: { x: 0, y: 0 }}),
      pinTo: undefined,
      class: Component,
      constructorArgs: undefined,
    }, options);

    var component = new options.class(Object.assign(
      {},
      this.componentServices,
      options.constructorArgs
    ));

    var element = this.document.createElement('div');
    if (options.position) {
      element.style = options.position.getStyle();
    }
    if (typeof options.pinTo === 'function') {
      var positionTracker = this.actionQueue.periodically((function() {
        element.style = options.pinTo().getStyle({
          width: element.offsetWidth,
          height: element.offsetHeight,
        });
      }).bind(this));
      component.onClose(positionTracker.cancel.bind(positionTracker));
    }
    this.document.body.insertBefore(element, this.document.body.firstChild);
    component.attachTo(element);
    return component;
  },
};

module.exports = ComponentManager;
