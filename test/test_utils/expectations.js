var expect = require('expect');
var isEqual = require('is-equal');
var matchers = require('./matchers');

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

  toBeAn: function() {
    this.toBeA.apply(this, arguments);
  },

  toBePresent: function() {
    expect.assert(
      this.actual !== undefined && this.actual !== null,
      'expected %s to be present',
      this.actual
    );
    return this;
  },

  toEqual: function(expected) {
    var matcher = matchers.equals(expected).match(this.actual);
    try {
      expect.assert(
        matcher.matches,
        'expected %s to equal %s',
        this.actual,
        expected
      );
    } catch(error) {
      error.expected = expected;
      error.actual = this.actual;
      throw error;
    }
  },

  toEqualWithoutOrder: function(expected) {
    var matcher = matchers.equals(expected).match(this.actual);
    try {
      expect.assert(Array.isArray(this.actual), 'expected an array');
      this.actual.sort();
      expected.sort();
      expect.assert(
        expected
        .map((function(e, i) {
          return matchers.equals(e).match(this.actual[i]);
        }).bind(this))
        .every(function(m) { return m.matches }),
        'expected %s to equal %s (without order)',
        this.actual,
        expected
      );
    } catch(error) {
      error.expected = expected;
      error.actual = this.actual;
      throw error;
    }
  },

  toHaveBeenCalledWith: function() {
    this.toHaveBeenCalled();
    var expected = Array.prototype.map.call(arguments, function(e) {
      if (e && e._isMatcher) {
        return e;
      } else {
        return matchers.equals(e);
      }
    });
    var matches = this.actual.calls.map(function(call) {
      return expected.map(function(e, i) { return e.match(call.arguments[i]); });
    });

    try {
      expect.assert(
        matches.some(function(row) { return row.every(function(m) { return m.matches; }) }),
        'expected to have been called with: '
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

  toNotHaveBeenCalledWith: function() {
    try {
      this.toHaveBeenCalledWith.apply(this, arguments);
      expect.assert(
        false,
        'expected to not be called with %s; calls were %s',
        arguments,
        this.actual.calls
      );
    } catch (error) {
      // Ignore
    }
  },
});
