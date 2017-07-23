var isEqual = require('is-equal');

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
          matches: isEqual(expected, arg),
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
                  expected: 'fn(' + testCase.input + ') -> ' + output,
                  actual: 'fn('+ testCase.input + ') -> ' + output,
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
};
