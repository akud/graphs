var ColorChanger = require('../../src/graphs/ColorChanger');

describe('ColorChanger', function() {
  var state;
  var adapter;

  var colorChanger;


  beforeEach(function() {
    state = createSpyObjectWith(
      'persistEdge',
      'persistNode',
      'reset',
      {
        'retrievePersistedEdges.returnValue': [],
        'retrievePersistedNodes.returnValue': [],
      }
    );

    adapter = createSpyObjectWith(
      'addEdge',
      'addNode',
      'getNodes',
      'getNode',
      'initialize',
      'setNodeColor',
      'removeNode',
      {
        'performInBulk': function(fn) { fn(adapter); },
      }
    );
    colorChanger = new ColorChanger();
  });

  describe('setColor', function() {
    it('sets the color', function() {
      var node = createSpyObjectWith();
      var color = 'asdf';
      colorChanger.setColor({
        adapter: adapter,
        state: state,
        node: node,
        color: color,
      });
      expect(adapter.setNodeColor).toHaveBeenCalledWith(node, color);
      expect(state.persistNode).toHaveBeenCalledWith({ id: node.id, color: color });
    });
  });
});
