var utils = require('./utils');
var Position = require('./geometry/Position');
var Component = require('./Component');
var Literal = require('./utils/Literal');
var TrackedObject = require('./TrackedObject');

function ComponentManager(options) {
  TrackedObject.apply(this);
  this.document = options && options.document;
  this.actionQueue = options && options.actionQueue;
  this.componentServices = options && options.componentServices;
}

ComponentManager.prototype = Object.assign(new TrackedObject(), {
  className: 'ComponentManager',

  getConstructorArgs: function() {
    return {
      document: new Literal('global.document'),
      actionQueue: this.actionQueue,
      componentServices: this.componentServices,
    };
  },

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
      this._setPositionOnElement(options.position, element);
    }
    if (typeof options.pinTo === 'function') {
      var positionTracker = this.actionQueue.periodically((function() {
        this._setPositionOnElement(options.pinTo(), element);
      }).bind(this));
      component.onRemove(positionTracker.cancel.bind(positionTracker));
    }
    this.document.body.insertBefore(element, this.document.body.firstChild);
    component.attachTo(element);
    return component;
  },

  _setPositionOnElement: function(position, element) {
    var elementPosition = position.getElementPosition({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
    element.style.position = 'fixed';
    element.style.zIndex = '1';
    element.style.top = elementPosition.top + 'px';
    element.style.left = elementPosition.left + 'px';
  },
});

module.exports = ComponentManager;
