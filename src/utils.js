/**
 * Construct an object that has all the key-values for which values
 * are present in the input.
 */
function optional(keyValuePairs) {
  var obj = {};
  Object.keys(keyValuePairs).forEach(function(key) {
    if (keyValuePairs[key]) {
      obj[key] = keyValuePairs[key];
    }
  });
  return obj;
}

module.exports = {
  optional: optional,
};
