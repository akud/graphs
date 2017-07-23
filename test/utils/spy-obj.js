var createSpy = require('expect').createSpy;

createSpyObjectWith = function() {
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

module.exports = createSpyObjectWith;
