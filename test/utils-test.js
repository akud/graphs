var Literal = require('../src/utils/Literal');
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
      expect(utils.distance({ x: 0, y: 1 }, { x: 1, y: 0 })).toEqual(Math.sqrt(2));
      expect(utils.distance({ x: 4, y: 7 }, { x: 2, y: 9 })).toEqual(2 * Math.sqrt(2));
    });
  });

  describe('normalizeEvent', function() {
    it('does nothing if no touches property', function() {
      expect(utils.normalizeEvent({ foo: 'bar' })).toEqual({ foo: 'bar' });
    });

    it('squashes the first touches element into the event', function() {
      var event = {
        touches: [
          {
            clientX: 12,
            clientY: 56,
          }
        ],
      };
      var normalized = utils.normalizeEvent(event);
      expect(normalized.clientX).toBe(12);
      expect(normalized.clientY).toBe(56);
    });
  });

  describe('isOneValuedObject', function() {
    it('returns false if the object is not present', function() {
      expect(utils.isOneValuedObject()).toBe(false)
      expect(utils.isOneValuedObject(undefined)).toBe(false)
      expect(utils.isOneValuedObject(null)).toBe(false)
    });

    it('returns false if the value is not an object', function() {
      expect(utils.isOneValuedObject([])).toBe(false)
      expect(utils.isOneValuedObject(['hello'])).toBe(false)
      expect(utils.isOneValuedObject('h')).toBe(false)
    });

    it('returns true if the object has one value', function() {
      expect(utils.isOneValuedObject({})).toBe(false)
      expect(utils.isOneValuedObject({a: 'b'})).toBe(true)
      expect(utils.isOneValuedObject({a: 'b', c: undefined})).toBe(true)
      expect(utils.isOneValuedObject({a: 'b', c: null})).toBe(true)
      expect(utils.isOneValuedObject({a: 'b', c: 'd'})).toBe(false)
    });
  });

  describe('startingAt', function() {
    it('returns a reording of the array', function() {
      var original = ['foo', 'bar', 'hello', 'world'];
      var reordered = utils.startingAt(original, 'hello');
      expect(reordered).toEqual(['hello', 'world', 'foo', 'bar']);
      expect(original).toEqual(['foo', 'bar', 'hello', 'world']);
    });

    it('can take the last element', function() {
      var original = ['foo', 'bar', 'hello', 'world'];
      var reordered = utils.startingAt(original, 'world');
      expect(reordered).toEqual(['world', 'foo', 'bar', 'hello']);
      expect(original).toEqual(['foo', 'bar', 'hello', 'world']);
    });
  });

  describe('requireNonNull', function() {
    it('throws if the property is not present', function() {
      try {
        utils.requireNonNull({}, 'a');
        fail('should have thrown');
      } catch(err) { }
      try {
        utils.requireNonNull({ 'a': null }, 'a');
        fail('should have thrown');
      } catch(err) { }
    });
    it('returns the property if it is present', function() {
      expect(utils.requireNonNull({ a: 'b' }, 'a')).toEqual('b');
    });
  });

  describe('replaceAll', function() {
    it('replaces all the occurences of original char', function() {
      expect(utils.replaceAll('hello world', 'l', 'u')).toEqual('heuuo worud');
    });
  });

  describe('toJs', function() {
    it('returns primitives', function() {
      expect(utils.toJs('a')).toEqual('\'a\'');
      expect(utils.toJs(3)).toEqual('3');
      expect(utils.toJs(0)).toBe('0');
      expect(utils.toJs(null)).toEqual('null');
    });

    it('escapes quotes in a string', function() {
      expect(utils.toJs("hello 'world'")).toEqual("'hello \\'world\\''");
      expect(utils.toJs(3)).toEqual('3');
      expect(utils.toJs(null)).toEqual('null');
    });

    it('formats arrays of primitives', function() {
      expect(utils.toJs(['a', 'b', 'c'])).toEqual(
        '[\n' +
        '  \'a\',\n' +
        '  \'b\',\n' +
        '  \'c\',\n' +
        ']'
      );
      expect(utils.toJs([1, 2, 3])).toEqual(
        '[\n' +
        '  1,\n' +
        '  2,\n' +
        '  3,\n' +
        ']'
     );
     expect(utils.toJs([1, '2', 3])).toEqual(
        '[\n' +
        '  1,\n' +
        '  \'2\',\n' +
        '  3,\n' +
        ']'
     );
    });

    it('formats objects of primitives', function() {
      expect(utils.toJs({a: 'b', c: 'd' })).toEqual(
        '{\n' +
        '  a: \'b\',\n' +
        '  c: \'d\',\n' +
        '}'
      );
      expect(utils.toJs({a: 1, c: 'd' })).toEqual(
        '{\n' +
        '  a: 1,\n' +
        '  c: \'d\',\n' +
        '}'
      );
    });

    it('formats objects with constructor args and class names', function() {
      var obj = {
        className: 'CoolJsClass',
        getConstructorArgs: function() { return { a: 'b', c: 45 }; },
      };
      expect(utils.toJs(obj)).toEqual(
        'new CoolJsClass({\n' +
        '  a: \'b\',\n' +
        '  c: 45,\n' +
        '})'
      );
    });

    it('returns literal values', function() {
      var foo = { a: new Literal('global.setTimeout') };
      expect(utils.toJs(foo)).toEqual(
        '{\n' +
        '  a: global.setTimeout,\n' +
        '}'
      );
    });

    it('handles objects inside arrays', function() {
      var foo = [ { a: 'b' }, { c: 'd' } ];
      expect(utils.toJs(foo)).toEqual(
        '[\n' +
        '  {\n' +
        '    a: \'b\',\n' +
        '  },\n' +
        '  {\n' +
        '    c: \'d\',\n' +
        '  },\n' +
        ']'
      );
    });

    it('handles everything recursively', function() {
      var obj = {
        className: 'TopLevelClass',
        getConstructorArgs: function() {
          return {
            a: 'b',
            c: [45, { d: 123 }],
            d: {
              className: 'NestedClass',
              getConstructorArgs: function() {
                return { e: [21, 34], f: { foo: 'bar' } };
              },
            },
          };
        },
      };
      expect(utils.toJs(obj)).toEqual(
        'new TopLevelClass({\n' +
        '  a: \'b\',\n' +
        '  c: [\n' +
        '    45,\n' +
        '    {\n' +
        '      d: 123,\n' +
        '    },\n' +
        '  ],\n' +
        '  d: new NestedClass({\n' +
        '    e: [\n' +
        '      21,\n' +
        '      34,\n' +
        '    ],\n' +
        '    f: {\n' +
        '      foo: \'bar\',\n' +
        '    },\n' +
        '  }),\n' +
        '})'
      );
    });

  });
});
