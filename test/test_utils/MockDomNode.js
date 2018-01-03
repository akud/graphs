var createSpy = require('expect').createSpy;

function MockDomNode(options) {
  options = Object.assign({
    'getElementsByTagName.returnValue': [],
    'remove.returnValue': undefined,
  }, options);

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

  this.style = {};
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
    eventObj = eventObj || createSpyObjectWith();
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach(function(fn) { fn(eventObj) });
    }
  },

  click: function(events) {
    events = Object.assign({
      mousedown: createSpyObjectWith({ name: 'mousedown' }),
      mouseup: createSpyObjectWith({ name: 'mouseup' }),
      click: createSpyObjectWith({ name: 'click' }),
    }, events);
    this.trigger('mousedown', events.mousedown);
    this.trigger('click', events.mouseup);
    this.trigger('mouseup', events.click);
  },

  touch: function(events) {
    events = Object.assign({
      mousedown: createSpyObjectWith({ name: 'mousedown' }),
      mouseup: createSpyObjectWith({ name: 'mouseup' }),
      click: createSpyObjectWith({ name: 'click' }),
      touchstart: createSpyObjectWith({ name: 'touchstart' }),
      touchend: createSpyObjectWith({ name: 'touchend' }),
    }, events);

    this.trigger('touchstart', events.touchstart);
    this.trigger('touchend', events.touchend);
    this.trigger('mousedown', events.mousedown);
    this.trigger('click', events.click);
    this.trigger('mouseup', events.mouseup);
  },

  clickAndHold: function(timer, amount, events) {
    events = Object.assign({
      mousedown: createSpyObjectWith({ name: 'mousedown' }),
      mouseup: createSpyObjectWith({ name: 'mouseup' }),
      click: createSpyObjectWith({ name: 'click' }),
    }, events);

    this.trigger('mousedown', events.mousedown);
    timer.step(amount || 100);
    this.trigger('mouseup', events.mouseup);
    this.trigger('click', events.click);
  },

  touchAndHold: function(timer, amount, events) {
    events = Object.assign({
      mousedown: createSpyObjectWith({ name: 'mousedown' }),
      mouseup: createSpyObjectWith({ name: 'mouseup' }),
      click: createSpyObjectWith({ name: 'click' }),
      touchstart: createSpyObjectWith({ name: 'touchstart' }),
      touchend: createSpyObjectWith({ name: 'touchend' }),
    }, events);

    this.trigger('touchstart', events.touchstart);
    this.trigger('mousedown', events.mousedown);
    timer.step(amount || 100);
    this.trigger('touchend', events.touchend);
    this.trigger('mouseup', events.mouseup);
    this.trigger('click', events.click);
  },

  pressKey: function(keyCode) {
    this.trigger('keydown', { keyCode: keyCode });
    this.trigger('keyup', { keyCode: keyCode });
  },

  pressEnter: function() {
    this.pressKey(13);
  },

  getAttribute: function(key) {
    return this.attributes[key];
  }
};

module.exports = MockDomNode;

