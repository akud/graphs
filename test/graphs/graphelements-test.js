var graphelements = require('../../src/graphs/graphelements');
var BoundingBox = require('../../src/geometry/BoundingBox');

describe('Node', function() {
  it('can return its position from the supplied bounding box', function() {
    var boundingBox = new BoundingBox({
      left: 10,
      right: 20,
      top: 30,
      bottom: 40,
    });
    var node = new graphelements.Node({
      realNode: createSpyObjectWith(),
      color: '#FFFFFF',
      getCurrentBoundingBox: function() { return boundingBox; },
    });
    expect(node.getCenter()).toEqual({ x: 15, y: 35 });
    expect(node.getTopLeft()).toEqual({ x: 10, y: 30 });
    expect(node.getTopRight()).toEqual({ x: 20, y: 30 });
    expect(node.getBottomLeft()).toEqual({ x: 10, y: 40 });
    expect(node.getBottomRight()).toEqual({ x: 20, y: 40 });
  });
});
