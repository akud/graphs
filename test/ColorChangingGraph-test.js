var ColorChangingGraph = require('../src/ColorChangingGraph');
var colors = require('../src/colors');
var graphelements = require('../src/graphelements');
var MockActionQueue = require('./utils/MockActionQueue');

describe('ImmutableGraph', function() {
  var state;
  var adapter;
  var actionQueue;
  var labelSet;

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

    labelSet = createSpyObjectWith('initialize', 'closeAll');
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
    actionQueue = new MockActionQueue();
  });

  function newGraph(opts) {
    return new ColorChangingGraph(Object.assign({
      state: state,
      adapter: adapter,
      actionQueue: actionQueue,
      labelSet: labelSet,
    }, opts));
  }

  describe('initialize', function() {
    it('initializes the graph with initial nodes and edges', function() {
      var graph = newGraph({
        nodeSize: 10,
        initialNodes: [
          { id: 0, color: '#0000FF' },
          { id: 1, color: '#00FF00' },
          { id: 2 },
        ],
        initialEdges: [
          { source: 0, target: 1 },
          { source: 1, target: 2 },
        ]
      });
      var targetElement = createSpyObjectWith();
      graph.initialize({
        element: targetElement,
        width: 8934,
        height: 123,
      });
      expect(adapter.initialize).toHaveBeenCalledWith(
        targetElement,
        {
          width: 8934,
          height: 123,
          nodes: [
            {
              id: 0,
              color: '#0000FF',
              label: '',
              size: 10,
            },
            {
              id: 1,
              color: '#00FF00',
              label: '',
              size: 10,
            },
            {
              id: 2,
              color: colors.INDIGO,
              label: '',
              size: 10,
            },
          ],
          edges: [
            { source: 0, target: 1 },
            { source: 1, target: 2 },
          ],
        }
      );
      expect(adapter.addNode).toNotHaveBeenCalled();
    });

    it('initializes the label set with nodes from state', function() {
      var realNode1 = new graphelements.Node({ id: 0 });
      var realNode2 = new graphelements.Node({ id: 1 });
      var realNode3 = new graphelements.Node({ id: 2 });
      var getNodeIndex = 0;

      var graph = newGraph({
        initialNodes: [
          { id: 0, color: '#0000FF', label: 'asdf', },
          { id: 1, color: '#00FF00' },
          { id: 2, label: 'hello' },
        ],
      });
      adapter.getNode.andCall(function() {
        return [realNode1, realNode2, realNode3][(getNodeIndex++)%3];
      });

      graph.initialize(createSpyObjectWith());

      expect(labelSet.initialize).toNotHaveBeenCalled();

      actionQueue.step(1);

      expect(labelSet.initialize).toHaveBeenCalledWith([
        { node: realNode1, label: 'asdf' },
        { node: realNode2, label: undefined },
        { node: realNode3, label: 'hello' },
      ]);
    });
  });

  describe('changeColor', function() {
    var graph;
    beforeEach(function() {
      graph = newGraph({
        colorChoices: [colors.RED, colors.BLUE, colors.YELLOW],
      });
    });

    it('cycles through color choices', function() {
      var node = new graphelements.Node({
        id: 1,
        color: colors.BLUE,
      });

      graph.changeColor(node);
      expectColorToHaveBeenSet(node, colors.YELLOW);

      node.color = colors.YELLOW;
      graph.changeColor(node);
      expectColorToHaveBeenSet(node, colors.RED);

      node.color = colors.RED;
      graph.changeColor(node);
      expectColorToHaveBeenSet(node, colors.BLUE);
    });

    it('handles unknown colors', function() {
      var node = new graphelements.Node({
        id: 1,
        color: colors.NEON,
      });

      graph.changeColor(node);
      expectColorToHaveBeenSet(node, colors.RED);
    });

    it('tracks colors for nodes separately', function() {
      var node1 = new graphelements.Node({ id: 1, color: colors.RED });
      var node2 = new graphelements.Node({ id: 2, color: colors.BLUE });
      var node3 = new graphelements.Node({ id: 3, color: colors.YELLOW });

      graph.changeColor(node1);
      graph.changeColor(node2);
      graph.changeColor(node3);

      expectColorToHaveBeenSet(node1, colors.BLUE);
      expectColorToHaveBeenSet(node2, colors.YELLOW);
      expectColorToHaveBeenSet(node3, colors.RED);
    });

    function expectColorToHaveBeenSet(node, color) {
      expect(adapter.setNodeColor).toHaveBeenCalledWith(node, color);
      expect(state.persistNode).toHaveBeenCalledWith({ id: node.id, color: color });
    }
  });

  describe('addNode', function() {
    it('does nothing', function() {
      newGraph().addNode();
      expect(adapter.addNode).toNotHaveBeenCalled();
      expect(state.persistNode).toNotHaveBeenCalled();
    });
  });

  describe('addEdge', function() {
    it('does nothing', function() {
      var originalNode = new graphelements.Node({ id: 0 });
      var otherNode = new graphelements.Node({ id: 4 });

      newGraph().addEdge(originalNode, otherNode);
      expect(adapter.addEdge).toNotHaveBeenCalled();
      expect(state.persistEdge).toNotHaveBeenCalled();
    });
  });

  describe('reset', function() {
    it('does nothing', function() {
      newGraph().reset();
      expect(state.reset).toNotHaveBeenCalled();
      expect(labelSet.closeAll).toNotHaveBeenCalled();
    });
  });

});
