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

  describe('distance', function() {
    it('computes the cartesian distance', function() {
      expect(utils.distance([0, 1], [1, 0])).toEqual(Math.sqrt(2));
      expect(utils.distance([4, 7], [2, 9])).toEqual(2 * Math.sqrt(2));
    });
  });
});
