var createSpy = require('expect').createSpy;

createSpyObjectWith = function() {
  var obj = {};
  Array.prototype.forEach.call(arguments, function(fnName) {
    if (typeof fnName === 'object') {
      var spec = fnName;
      Object.keys(spec).forEach(function(key) {
        var value = spec[key];
        if (key.endsWith('.returnValue')) {
          obj[key.split('.')[0]] = createSpy().andReturn(value === 'this' ? obj : value);
        } else {
          obj[key] = value;
        }
      });
    } else {
      obj[fnName] = createSpy();
    }
  });
  return obj;
};

module.exports = createSpyObjectWith;
