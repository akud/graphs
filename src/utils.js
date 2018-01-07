var Literal = require('./utils/Literal');
var FunctionCall = require('../src/utils/FunctionCall');

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

function requireNonNull(container, property) {
  if (!container[property]) {
    throw new Error('missing required property ' + property);
  }
  return container[property];
}

function toJs(value, indentLevel) {
  debugger;
  indentLevel = indentLevel || 0;
  function indentOutro(line) {
    return ' '.repeat(indentLevel) + line;
  }
  function indentNestedLine(line) {
    return ' '.repeat(indentLevel + 2) + line;
  }
  if (value instanceof Literal) {
    return value.value;
  } else if (value instanceof FunctionCall) {
    debugger;
    return value.name + '(\n' +
      value.arguments.map(function(a, index) {
        var isLastArg = index === value.arguments.length - 1;
        return toJs(a, indentLevel + 2) + (isLastArg ? '' : ',');
      })
      .map(indentNestedLine)
      .join('\n')
      + '\n'
      + indentOutro(')');
  } else if (Array.isArray(value)) {
    return '[\n' +
      value.map(function(a) { return toJs(a, indentLevel + 2) + ','; })
      .map(indentNestedLine)
      .join('\n') +
      '\n' +
      indentOutro(']');
  } else if (value && value.className && value.getConstructorArgs) {
    return 'new ' + value.className + '({\n' +
      Object.keys(value.getConstructorArgs())
      .map(function(k) { return k +': ' + toJs(value.getConstructorArgs()[k], indentLevel + 2) + ','; })
      .map(indentNestedLine)
      .join('\n') +
      '\n' +
      indentOutro('})');
  } else if (value && typeof value === 'object') {
    return '{\n' +
      Object.keys(value).map(function(k) {
        return k + ': ' + toJs(value[k], indentLevel + 2) + ',';
      })
      .map(indentNestedLine)
      .join('\n') +
      '\n' +
      indentOutro('}');
  } else if (value && typeof value === 'string') {
    return '\'' + replaceAll(value, "'", "\\'") + '\'';
  } else if (value || value === 0) {
    return value.toString();
  } else {
    return 'null';
  }
}

function replaceAll(str, original, replacement) {
  return str.split(original).join(replacement);
}

module.exports = {
  distance: distance,
  optional: optional,
  normalizeEvent: normalizeEvent,
  isOneValuedObject: isOneValuedObject,
  startingAt: startingAt,
  toJs: toJs,
  replaceAll: replaceAll,
  requireNonNull: requireNonNull,
};
