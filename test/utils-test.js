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

    it('forces keys specified by an array', function() {
      var optional = utils.optional({
        hello: 'world',
        num: 3,
        not: undefined,
        m: null,
        n: '',
        z: 0,
        f: false,
      }, { force: ['z', 'f'] });
      expect(optional).toEqual({
        hello: 'world',
        num: 3,
        f: false,
        z: 0,
      });
    });

    it('forces a single key', function() {
      var optional = utils.optional({
        hello: 'world',
        num: 3,
        not: undefined,
        m: null,
        n: '',
        z: 0,
        f: false,
      }, { force: 'z' });
      expect(optional).toEqual({
        hello: 'world',
        num: 3,
        z: 0,
      });
    });
  });
});
