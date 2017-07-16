global.expect = require('expect');
global.createSpy = expect.createSpy
global.spyOn = expect.spyOn
global.isSpy = expect.isSpy

global.createSpyObjectWith = function() {
  var obj = {};
  Array.prototype.forEach.call(arguments, function(fnName) {
    if (typeof fnName === 'object') {
      Object.assign(obj, fnName);
    } else {
      obj[fnName] = createSpy();
    }
  });
  return obj;
};

global.MockDomNode = function(id) {
  if (id === undefined) {
    this.id = 'node-' + Math.floor(Math.random() * 100)
  } else {
    this.id = id;
  }

  this.listeners = {};
  spyOn(this, 'addEventListener').andCallThrough();
}

global.MockDomNode.prototype = {
  addEventListener: function(type, fn) {
    if (!Object.hasOwnProperty(this.listeners, type)) {
      this.listeners[type] = [fn];
    } else {
      this.listeners[type].push(fn);
    }
  },

  click: function(event) {
    if (this.listeners.click) {
      this.listeners.click.forEach(function(fn) {
        fn(event)
      });
    }
  },
};

expect.extend({
  toBeA: function(clazz) {
    expect.assert(
      this.actual instanceof clazz,
      'expected %s to be a %s',
      this.actual,
      clazz
    );
    return this;
  },
});
