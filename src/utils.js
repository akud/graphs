/**
 * Compute the cartesian distance between two vectors
 */
function distance(point1, point2) {
  var x = point1.x - point2.x;
  var y = point1.y - point2.y;
  return Math.sqrt(x*x + y*y);
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


function normalizeEvent(event) {
  if (event && event.touches && event.touches.length) {
    return Object.assign(
      event,
      {
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY,
        screenX: event.touches[0].screenX,
        screenY: event.touches[0].screenY,
      }
    );
  } else {
    return event;
  }
}

function isOneValuedObject(obj) {
  if (obj && (typeof obj === 'object') && !Array.isArray(obj)) {
    var presentKeys = Object.keys(obj)
      .filter(function(k) { return !!obj[k]; });
    return presentKeys.length === 1
  } else {
    return false;
  }
}

function startingAt(array, startingItem) {
  var startingIndex = array.indexOf(startingItem)
  if (startingIndex >= 0) {
    var returnValue = [];
    for (var i = startingIndex; i < array.length; i++) {
      returnValue.push(array[i]);
    }
    for (var i = 0; i < startingIndex; i++) {
      returnValue.push(array[i]);
    }
    return returnValue;
  } else {
    return array;
  }
}

function requireNonNull(obj) {
  if (!obj) {
    throw new Error('missing required object');
  }
  return obj;
}

module.exports = {
  distance: distance,
  optional: optional,
  normalizeEvent: normalizeEvent,
  isOneValuedObject: isOneValuedObject,
  startingAt: startingAt,
  requireNonNull: requireNonNull,
};
