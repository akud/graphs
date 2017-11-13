var NodeCreator = require('../../src/graphs/NodeCreator');
var colors = require('../../src/colors');

describe('NodeCreator', function() {
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
    nodeCreator = new NodeCreator();
  });

  describe('addNode', function() {
    it('adds a node to the adapter and state', function() {
      var id = 0;
      state.persistNode.andCall(function() {
        return id++;
      });

      nodeCreator.addNode({
        state: state,
        adapter: adapter,
        nodeSize: 22,
        color: '#2980B9',
      });

      expect(adapter.addNode).toHaveBeenCalledWith({
        id: 0,
        label: '',
        color: '#2980B9',
        size: 22,
      });
      expect(state.persistNode).toHaveBeenCalledWith({ color: '#2980B9' });

      nodeCreator.addNode({
        state: state,
        adapter: adapter,
        nodeSize: 22,
        color: '#2980B9',
      });
      nodeCreator.addNode({
        state: state,
        adapter: adapter,
        nodeSize: 22,
        color: '#2980B9',
      });
      nodeCreator.addNode({
        state: state,
        adapter: adapter,
        nodeSize: 22,
        color: '#2980B9',
      });

      expect(adapter.addNode.calls.length).toBe(4);
      expect(adapter.addNode).toHaveBeenCalledWith({
        id: 1,
        label: '',
        color: '#2980B9',
        size: 22,
      });
      expect(adapter.addNode).toHaveBeenCalledWith({
        id: 2,
        label: '',
        color: '#2980B9',
        size: 22,
      });
      expect(adapter.addNode).toHaveBeenCalledWith({
        id: 3,
        label: '',
        color: '#2980B9',
        size: 22,
      });

      expect(state.persistNode.calls.length).toBe(4);
      expect(state.persistNode).toHaveBeenCalledWith({ color: '#2980B9' });
      expect(state.persistNode).toHaveBeenCalledWith({ color: '#2980B9' });
      expect(state.persistNode).toHaveBeenCalledWith({ color: '#2980B9' });
    });
  });
});
