var InMemoryState = require('../../src/state/InMemoryState');

describe('InMemoryState', function() {
  var state;

  beforeEach(function() {
    state = new InMemoryState();
  });


  describe('persistNode', function() {

    it('persists a new node', function() {
      var nodeId = state.persistNode({
        color: '#FFFF00',
        label: 'hello',
      });
      expect(state.retrieveNode(nodeId)).toEqual({
        id: nodeId,
        color: '#FFFF00',
        label: 'hello',
      });
    });

    it('updates an existing node', function() {
      var nodeId = state.persistNode({
        color: '#FFFF00',
        label: 'hello',
      });
      state.persistNode({
        id: nodeId,
        label: 'world',
      });
      expect(state.retrieveNode(nodeId)).toEqual({
        id: nodeId,
        color: '#FFFF00',
        label: 'world',
      });
    });
  });

  describe('persistEdge', function() {
    it('persists the source and target in the edge', function() {
      state.persistEdge(7, 2);
      expect(state.retrievePersistedEdges()).toEqual([
        { source: 7, target: 2 },
      ]);
    });
  });

  describe('retrieve persisted nodes', function() {
    it('returns empty array if there are no nodes', function() {
      expect(state.retrievePersistedNodes()).toEqual([]);
    });

    it('returns all the nodes', function() {
      state.persistNode({ label: 'hello' });
      state.persistNode({ label: 'world' });
      state.persistNode({ color: '#FF00FF', label: 'wtf' });
      expect(state.retrievePersistedNodes()).toEqualWithoutOrder([
        { id: 0, label: 'hello' },
        { id: 1, label: 'world' },
        { id: 2, label: 'wtf', color: '#FF00FF' },
      ]);
    });
  });

  describe('retrievePersistedEdges', function() {
    it('returns an empty array if there are no edges', function() {
      expect(state.retrievePersistedEdges()).toEqual([]);
    });

    it('returns an array of edges', function() {
      state.persistEdge(1, 2);
      state.persistEdge(5, 6);
      state.persistEdge(3, 9);
      expect(state.retrievePersistedEdges()).toEqualWithoutOrder([
        { source: 1, target: 2 },
        { source: 5, target: 6 },
        { source: 3, target: 9 },
      ]);
    });
  });

  describe('reset', function() {
    it('deletes nodes and edges', function() {
      state.persistNode({ label: 'hello' });
      state.persistEdge(1, 2);
      state.reset();
      expect(state.retrievePersistedNodes()).toEqual([]);
      expect(state.retrievePersistedEdges()).toEqual([]);
    });
  });
});
