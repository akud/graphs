/**
 * Compute the cartesian distance between two vectors
 */
function distance(vec1, vec2) {
  if (vec1.length != vec2.length) {
    throw new Error(vec1.length + ' != ' + vec2.length);
  }
  return Math.sqrt(
    vec1
      .map(function(x, i) { return x - vec2[i]; })
      .map(function(x) { return x * x; })
      .reduce(function(a, b) { return a + b; })
  );
}

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
  distance: distance,
  optional: optional,
};
