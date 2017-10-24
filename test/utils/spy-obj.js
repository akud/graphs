var createSpy = require('expect').createSpy;

createSpyObjectWith = function() {
  var obj = {};
  var spies = [];
  Array.prototype.forEach.call(arguments, function(fnName) {
    if (typeof fnName === 'object') {
      var spy = null;;
      var spec = fnName;
      Object.keys(spec).forEach(function(key) {
        var value = spec[key];
        if (key.endsWith('.returnValue')) {
          spy = createSpy().andReturn(value === 'this' ? obj : value);
          obj[key.split('.')[0]] = spy;
        } else {
          obj[key] = value;
        }
      });
    } else {
      spy = createSpy();
      obj[fnName] = spy;
    }
    if (spy) {
      spies.push(spy);
    }
  });
  obj.reset = obj.reset || function() {
    spies.forEach(function(s) { s.reset() });
  }
  return obj;
};

module.exports = createSpyObjectWith;
