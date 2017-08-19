var isEqual = require('is-equal');

function isEqualRespectingMatchers(expected, actual) {
  if (expected && expected._isMatcher) {
    return expected.match(actual).matches;
  } else if (typeof expected === 'object') {
    return Object.keys(expected).every(function(key) {
      return isEqualRespectingMatchers(expected[key], actual[key]);
    });
  } else if (Array.isArray(expected)) {
    return expected.every(function(entry, i) {
      return isEqualRespectingMatchers(entry, actual[i]);
    });
  } else {
    return isEqual(expected, actual);
  }
}

module.exports = {
  any: function(constructor) {
    return {
      match: function(arg) {
        return {
          matches: (constructor && arg.constructor === constructor) || true,
          expected: 'anything',
          actual: arg,
        };
      },
      _isMatcher: true,
    };
  },

  equals: function(expected) {
    return {
      match: function(arg) {
        return {
          matches: isEqualRespectingMatchers(expected, arg),
          expected: expected,
          actual: arg,
        };
      },
      _isMatcher: true,
    };
  },

  functionThatReturns: function() {
    var testCases = Array.prototype.slice.call(arguments);
    return {
      match: function(fn) {
        if (typeof fn === 'function') {
          var results = testCases.map(function(testCase) {
            var output;
            if (typeof testCase === 'object' &&
                testCase.hasOwnProperty('input')  &&
                testCase.hasOwnProperty('output')) {

                output = fn(testCase.input);
                return {
                  matches: isEqual(testCase.output, output),
                  expected: 'fn(' + toString(testCase.input) + ') -> ' + output,
                  actual: 'fn('+ toString(testCase.input) + ') -> ' + output,
                };
            } else {
              result = fn();
              return {
                matches: isEqual(testCase, result),
                expected: 'fn() -> ' + testCase,
                actual: 'fn() -> ' + output,
              };
            }
          });
          return {
            matches: results.every(function(r) { return r.matches; }),
            expected: results.map(function(r) { return r.expected; }),
            actual: results.map(function(r) { return r.actual; }),
          };
        } else {
          return {
            matches: false,
            expected: 'function',
            actual: fn,
          };
        }
      },
      _isMatcher: true,
    };
  },

  hexEncodedBinary: function(binaryString) {
    var expectedHex = parseInt(binaryString, 2).toString(16);
    return {
      match: function(str) {
        try {
          return {
            matches: isEqual(expectedHex, str),
            expected: binaryString,
            actual: parseInt(str, 16).toString(2),
          };
        } catch(err) {
          return {
            matches: false,
            expected: binaryString,
            actual: str,
          };
        }
      },
      _isMatcher: true,
    };
  },

  objectThatHas: function(expectedProps) {
    return {
      match: function(actual) {
        var matches = Object.keys(expectedProps)
          .every(function(k) { return expectedProps[k] === actual[k]; })
        return {
          matches: matches,
          expected: expectedProps,
          actual: actual,
        };
      },
      _isMatcher: true,
    };
  },
};

function toString(obj) {
  if (obj === undefined) {
    return 'undefined';
  } else if (obj === null) {
    return 'null';
  } else if (Array.isArray(obj)) {
    return '[' +
      obj
      .map(function(a) { return toString(a); })
      .reduce(function(a, b) { return a + ', ' + b; }, '') +
    ']';
  } else if (typeof obj === 'object') {
    return '{' +
      Object.keys(obj)
      .map(function(k) { return toString(k) + ': ' + toString(obj[k]); })
      .reduce(function(a, b) { return a + ', ' + b; }, '') +
    '}';
  } else {
    return obj;
  }

}
