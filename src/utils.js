/**
 * Construct an object that has all the key-values for which values
 * are present in the input.
 */
function optional(keyValuePairs, options) {
  var obj = {};
  Object.keys(keyValuePairs).forEach(function(key) {
    if (keyValuePairs[key]) {
      obj[key] = keyValuePairs[key];
    }
  });
  if (options && options.force) {
    if (options.force.constructor === Array) {
      options.force.forEach(function(key) {
        obj[key] = keyValuePairs[key];
      });
    } else {
      obj[options.force] = keyValuePairs[options.force];
    }
  }
  return obj;
}

module.exports = {
  optional: optional,
};
