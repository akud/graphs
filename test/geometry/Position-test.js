var Position = require('../../src/geometry/Position');

describe('Position', function() {
  describe('getElementPosition', function() {
    it('returns correct position for top left position', function() {
      var position = new Position({ topLeft: { x: 12, y: 789 } });
      expect(position.getElementPosition({ width: 10, height: 100 })).toEqual({ left: 12, top: 789 });
    });

    it('returns correct position for bottom left position', function() {
      var position = new Position({ bottomLeft: { x: 12, y: 789 } });
      expect(position.getElementPosition({ width: 10, height: 100 })).toEqual({ left: 12, top: 689 });
    });

    it('returns correct position for top right position', function() {
      var position = new Position({ topRight: { x: 12, y: 789 } });
      expect(position.getElementPosition({ width: 10, height: 100 })).toEqual({ left: 2, top: 789 });
    });

    it('returns correct position for bottom right position', function() {
      var position = new Position({ bottomRight: { x: 12, y: 789 } });
      expect(position.getElementPosition({ width: 10, height: 100 })).toEqual({ left: 2, top: 689 });
    });
  });
});
