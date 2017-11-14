var NoOpNodeCreator = require('../../src/graphs/NoOpNodeCreator');
var colors = require('../../src/colors');

describe('NoOpNodeCreator', function() {
  var adapter;
  var state;
  var nodeCreator;

  beforeEach(function() {
    state = createSpyObjectWith(
      'persistNode'
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
    nodeCreator = new NoOpNodeCreator();
  });

  describe('addNode', function() {
    it('does nothing', function() {
      nodeCreator.addNode({
        state: state,
        adapter: adapter,
        nodeSize: 22,
        color: '#2980B9',
      });
      expect(adapter.addNode).toNotHaveBeenCalled();
      expect(state.persistNode).toNotHaveBeenCalled();
    });
  });
});
