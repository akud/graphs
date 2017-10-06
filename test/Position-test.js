var Position = require('../src/Position');

describe('Position', function() {
  describe('getStyle', function() {
    it('returns correct style for top left position', function() {
      var position = new Position({ topLeft: { x: 12, y: 789 } });
      expect(position.getStyle()).toEqual('position: absolute; left: 12; top: 789;');
    });

    it('returns correct style for bottom left position', function() {
      var position = new Position({ bottomLeft: { x: 12, y: 789 } });
      expect(position.getStyle()).toEqual('position: absolute; left: 12; bottom: 789;');
    });

    it('returns correct style for top right position', function() {
      var position = new Position({ topRight: { x: 12, y: 789 } });
      expect(position.getStyle()).toEqual('position: absolute; right: 12; top: 789;');
    });

    it('returns correct style for bottom right position', function() {
      var position = new Position({ bottomRight: { x: 12, y: 789 } });
      expect(position.getStyle()).toEqual('position: absolute; right: 12; bottom: 789;');
    });
  });
});
