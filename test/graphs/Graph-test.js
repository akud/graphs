var Graph = require('../../src/graphs/Graph');
var colors = require('../../src/colors');
var graphelements = require('../../src/graphs/graphelements');
var MockActionQueue = require('../test_utils/MockActionQueue');


describe('Graph', function() {
  var state;
  var adapter;
  var actionQueue;
  var labelSet;
  var nodeCreator;
  var edgeCreator;
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

    labelSet = createSpyObjectWith('initialize', 'closeAll');
    adapter = createSpyObjectWith(
      'addEdge',
      'addNode',
      'getNodes',
      'getNode',
      'initialize',
      'setNodeColor',
      'removeNode',
      'getNearestElement',
      {
        'performInBulk': function(fn) { fn(adapter); },
      }
    );
    actionQueue = new MockActionQueue();
    nodeCreator = createSpyObjectWith('addNode');
    edgeCreator = createSpyObjectWith('addEdge');
    colorChanger = createSpyObjectWith('setColor');
  });

  function newGraph(opts) {
    return new Graph(Object.assign({
      state: state,
      adapter: adapter,
      actionQueue: actionQueue,
      labelSet: labelSet,
      nodeCreator: nodeCreator,
      edgeCreator: edgeCreator,
      colorChanger: colorChanger,
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
      expect(colorChanger.setColor).toHaveBeenCalledWith({
        adapter: adapter,
        state: state,
        node: node,
        color: color,
      });
    }
  });

  describe('addNode', function() {
    it('delegates to the node creator', function() {
      newGraph({
        colorChoices: [colors.RED, colors.BLUE],
        nodeSize: 22
      }).addNode();
      expect(nodeCreator.addNode).toHaveBeenCalledWith({
        state: state,
        adapter: adapter,
        color: colors.RED,
        nodeSize: 22,
      });
    });
  });

  describe('addEdge', function() {
    it('delegates to the edge creator', function() {
      var originalNode = new graphelements.Node({ id: 0 });
      var otherNode = new graphelements.Node({ id: 4 });

      var graph = newGraph({ edgeDistance: 456 });

      graph.addEdge(originalNode, otherNode);

      expect(edgeCreator.addEdge).toHaveBeenCalledWith({
        source: originalNode,
        target: otherNode,
        edgeDistance: 456,
        state: state,
        adapter: adapter,
      });
    });
  });

  describe('getNearestElement', function() {
    it('delegates to the adapter', function() {
      var graph = newGraph({ nodeAreaFuzzFactor: 0.53 });
      var expected = new graphelements.Node({ id: 234 });
      adapter.getNearestElement.andReturn(expected);
      var result = graph.getNearestElement({ x: 543, y: 182 });
      expect(result).toBe(expected);

      expect(adapter.getNearestElement).toHaveBeenCalledWith({
        point: { x: 543, y: 182 },
        nodeAreaFuzzFactor: 0.53,
      });
    });
  });

  describe('reset', function() {
    var graph;
    beforeEach(function() {
      graph = newGraph();
    });

    it('resets the state', function() {
      graph.reset();
      expect(state.reset).toHaveBeenCalled();
      expect(labelSet.closeAll).toHaveBeenCalled();
    });

    it('removes all the nodes', function() {
      state.retrievePersistedNodes.andReturn([
        { id: 0 },
        { id: 1 },
        { id: 2 },
      ]);
      graph.reset();
      expect(adapter.removeNode).toHaveBeenCalledWith({ id: 0 });
      expect(adapter.removeNode).toHaveBeenCalledWith({ id: 1 });
      expect(adapter.removeNode).toHaveBeenCalledWith({ id: 2 });
    });
  });

});
