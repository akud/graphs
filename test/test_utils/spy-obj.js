var createSpy = require('expect').createSpy;

createSpyObjectWith = function() {
  var obj = {};
  var spies = [];
  function setSpy(name, spy) {
    obj[name] = spy;
    spies.push(spy);
  }

  Array.prototype.forEach.call(arguments, function(fnName) {
    if (typeof fnName === 'object') {
      var spy = null;;
      var spec = fnName;
      Object.keys(spec).forEach(function(key) {
        var value = spec[key];
        if (key.endsWith('.returnValue')) {
          setSpy(key.split('.')[0], createSpy().andReturn(value === 'this' ? obj : value));
        } else {
          obj[key] = value;
        }
      });
    } else {
      setSpy(fnName, createSpy());
    }
  });
  obj.reset = obj.reset || function() {
    spies.forEach(function(s) { s.reset() });
  }
  return obj;
};

module.exports = createSpyObjectWith;
