var NoOpEdgeCreator = require('../../src/graphs/NoOpEdgeCreator');
var graphelements = require('../../src/graphs/graphelements');

describe('NoOpEdgeCreator', function() {
  var state;
  var adapter;
  var edgeCreator;

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
    edgeCreator = new NoOpEdgeCreator();
  });

  describe('addEdge', function() {
    it('does nothing', function() {
      var originalNode = new graphelements.Node({ id: 0 });
      var otherNode = new graphelements.Node({ id: 4 });

      edgeCreator.addEdge({
        source: originalNode,
        target: otherNode,
        adapter: adapter,
        state: state,
        edgeDistance: 456,
      });

      expect(adapter.addEdge).toNotHaveBeenCalled();
      expect(state.persistEdge).toNotHaveBeenCalled();
    });
  });



});
