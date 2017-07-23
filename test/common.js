global.expect = require('expect');
global.createSpy = expect.createSpy
global.spyOn = expect.spyOn
global.isSpy = expect.isSpy

var isEqual = require('is-equal');

global.createSpyObjectWith = function() {
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

global.MockDomNode = function(options) {
  options = options || {};

  Object.keys(options).forEach((function(key) {
    if (key === 'id') {
      this.id = options[key];
    } else if (key.endsWith('.returnValue')) {
      var property = key.split('.')[0];
      this[property] = createSpy().andReturn(options[key]);
    }
  }).bind(this));

  if (!this.id) {
    this.id = 'node-' + Math.floor(Math.random() * 100)
  }

  this.listeners = {};
  spyOn(this, 'addEventListener').andCallThrough();
}

global.MockDomNode.prototype = {
  addEventListener: function(type, fn) {
    if (!Object.hasOwnProperty(this.listeners, type)) {
      this.listeners[type] = [fn];
    } else {
      this.listeners[type].push(fn);
    }
  },

  click: function(event) {
    if (this.listeners.click) {
      this.listeners.click.forEach(function(fn) {
        fn(event)
      });
    }
  },
};

global.matchers = {
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

expect.extend({
  toBeA: function(clazz) {
    expect.assert(
      this.actual instanceof clazz,
      'expected %s to be a %s',
      this.actual,
      clazz
    );
    return this;
  },

  toHaveBeenCalledWith: function() {
    this.toHaveBeenCalled();
    var expected = Array.prototype.map.call(arguments, function(e) {
      if (e && e._isMatcher) {
        return e;
      } else {
        return global.matchers.equals(e);
      }
    });
    var matches = this.actual.calls.map(function(call) {
      return expected.map(function(e, i) { return e.match(call.arguments[i]); });
    });

    try {
      expect.assert(
        matches.some(function(row) { return row.every(function(m) { return m.matches; }) }),
        'expected to be called with %s',
        expected
      );
    } catch(error) {
      error.expected = matches.map(function(row) {
        return row.map(function(m) { return m.expected; });
      });
      error.actual = matches.map(function(row) {
        return row.map(function(m) { return m.actual; });
      });
      error.showDiff = true;
      throw error;
    }
    return this;
  },
});
