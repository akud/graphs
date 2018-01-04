var EdgeCreator = require('../../src/graphs/EdgeCreator');
var graphelements = require('../../src/graphs/graphelements');

describe('EdgeCreator', function() {
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
    edgeCreator = new EdgeCreator();
  });

  describe('addEdge', function() {
    it('connects the two nodes', function() {
      var originalNode = new graphelements.Node({ id: 0 });
      var otherNode = new graphelements.Node({ id: 4 });

      edgeCreator.addEdge({
        source: originalNode,
        target: otherNode,
        adapter: adapter,
        state: state,
        edgeDistance: 456,
        directed: true,
      });

      expect(adapter.addEdge).toHaveBeenCalledWith({
        source: originalNode,
        target: otherNode,
        distance: 456,
        directed: true,
      });
      expect(state.persistEdge).toHaveBeenCalledWith(originalNode.id, otherNode.id);
    });
  });



});
