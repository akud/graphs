var expect = require('expect');
var isEqual = require('is-equal');

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
