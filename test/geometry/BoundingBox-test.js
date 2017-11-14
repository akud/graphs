var BoundingBox = require('../../src/geometry/BoundingBox');

describe('BoundingBox', function() {
  var box;
  beforeEach(function() {
    box = new BoundingBox({
      left: 10,
      right: 20,
      top: 40,
      bottom: 50,
    });
  });

  describe('contains', function() {
    it('indicates if the box contains the point', function() {
     expect(box.contains({ x: 15, y: 45 })).toBe(true);
      expect(box.contains({ x: 10, y: 40 })).toBe(true);
      expect(box.contains({ x: 20, y: 50 })).toBe(true);
      expect(box.contains({ x: 5, y: 45 })).toBe(false);
      expect(box.contains({ x: 15, y: 35 })).toBe(false);
    });
  });

  describe('translate', function() {
    it('moves the box', function() {
      var translated = box.translate({ x: 10, y: 10 });
      expect(box.contains({ x: 25, y: 55 })).toBe(false);
      expect(translated.contains({ x: 25, y: 55 })).toBe(true);

      expect(box.contains({ x: 15, y: 55 })).toBe(false);
      expect(translated.contains({ x: 15, y: 55 })).toBe(false);

      expect(box.contains({ x: 25, y: 55 })).toBe(false);
      expect(translated.contains({ x: 25, y: 55 })).toBe(true);

      expect(box.contains({ x: 25, y: 35 })).toBe(false);
      expect(translated.contains({ x: 25, y: 35 })).toBe(false);
    });
  });

  describe('expandBy', function() {
    it('expands the box size', function() {
      var expanded = box.expandBy(0.1);
      expect(box.contains({ x: 9, y: 45 })).toBe(false);
      expect(expanded.contains({ x: 9, y: 45 })).toBe(true);

      expect(box.contains({ x: 21, y: 45 })).toBe(false);
      expect(expanded.contains({ x: 21, y: 45 })).toBe(true);

      expect(box.contains({ x: 10, y: 39 })).toBe(false);
      expect(expanded.contains({ x: 10, y: 39 })).toBe(true);

      expect(box.contains({ x: 10, y: 51 })).toBe(false);
      expect(expanded.contains({ x: 10, y: 51 })).toBe(true);
    });
  });

  describe('getWidth', function() {
    it('returns the width of the box', function() {
      expect(box.getWidth()).toBe(10);
    });
  });

  describe('getHeight', function() {
    it('returns the height of the box', function() {
      box = new BoundingBox({
        left: 0,
        right: 10,
        top: 10,
        bottom: 400,
      });
      expect(box.getHeight()).toBe(390);
    });
  });

  describe('getTopLeft', function() {
    it('returns a point in the top left of the box', function() {
      expect(box.getTopLeft()).toEqual({ x: 10, y: 40 });
    });
  });

  describe('getTopRight', function() {
    it('returns a point in the top right of the box', function() {
      expect(box.getTopRight()).toEqual({ x: 20, y: 40 });
    });
  });

  describe('getBottomLeft', function() {
    it('returns a point in the bottom left of the box', function() {
      expect(box.getBottomLeft()).toEqual({ x: 10, y: 50 });
    });
  });

  describe('getBottomRight', function() {
    it('returns a point in the top left of the box', function() {
      expect(box.getBottomRight()).toEqual({ x: 20, y: 50 });
    });
  });
});
