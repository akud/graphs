var createSpy = require('expect').createSpy;

function MockDomNode(options) {
  options = options || {};

  this.attributes = {};

  Object.keys(options).forEach((function(key) {
    if (key === 'id') {
      this.id = options[key];
    } else if (key.endsWith('.returnValue')) {
      var property = key.split('.')[0];
      this[property] = createSpy().andReturn(options[key]);
    } else {
      this.attributes[key] = options[key];
    }
  }).bind(this));

  if (!this.id) {
    this.id = 'node-' + Math.floor(Math.random() * 100)
  }

  this.listeners = {};
  spyOn(this, 'addEventListener').andCallThrough();
}

MockDomNode.prototype = {
  addEventListener: function(type, fn) {
    if (!Object.hasOwnProperty(this.listeners, type)) {
      this.listeners[type] = [fn];
    } else {
      this.listeners[type].push(fn);
    }
  },

  trigger: function(eventName, eventObj) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(function(fn) { fn(eventObj) });
    }
  },

  click: function(event) {
    this.trigger('mousedown', event);
    this.trigger('click', event);
    this.trigger('mouseup', event);
  },

  clickAndHold: function(timer, amount) {
    this.trigger('mousedown');
    timer.step(amount || 100);
    this.trigger('mouseup');
  },

  getAttribute: function(key) {
    return this.attributes[key];
  }
};

module.exports = MockDomNode;
