var utils = require('../src/utils');

describe('utils', function() {
  describe('optional', function() {
    it('returns keys for which values are present', function() {
      var optional = utils.optional({
        hello: 'world',
        num: 3,
        not: undefined,
        m: null,
        n: '',
        z: 0,
        f: false,
      });
      expect(optional).toEqual({ hello: 'world', num: 3 });
    });
  });
});
