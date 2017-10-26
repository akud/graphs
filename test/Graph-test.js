var Graph = require('../src/Graph');
var graphelements = require('../src/graphelements');
var colors = require('../src/colors');
var MockActionQueue = require('./utils/MockActionQueue');


describe('Graph', function() {
  var adapter;
  var targetElement;
  var state;
  var editMode;
  var labelSet;
  var actionQueue;

  beforeEach(function() {
    actionQueue = new MockActionQueue();
    adapter = createSpyObjectWith(
      'addEdge',
      'addNode',
      'getClickTarget',
      'getNodes',
      'getNode',
      'initialize',
      'setNodeColor',
      'removeNode',
      {
        'performInBulk': function(fn) { fn(adapter); },
      }
    );
    editMode = createSpyObjectWith(
      'activate',
      'deactivate',
      'perform'
    );
    deactivateEditMode();
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
    targetElement = new MockDomNode();
  });

  function newGraph(options) {
    return new Graph(Object.assign({
        adapter: adapter,
        actionQueue: actionQueue,
        state: state,
        editMode: editMode,
        labelSet: labelSet,
        holdTime: 100,
      }, options));
  }

  function deactivateEditMode() {
    editMode.perform.andCall(function(opts) { opts.ifNotActive(); });
  }

  function activateEditMode(node) {
    editMode.perform.andCall(function(opts) { opts.ifActive(node); });
  }

  it('does nothing when constructed', function() {
    newGraph();
    expect(adapter.initialize).toNotHaveBeenCalled();
  });

  describe('attachTo', function() {
    var graph;
    var width;
    var height;
    beforeEach(function() {
      width = 123;
      height = 456;
      graph = newGraph(
        { width: width, height: height }
      );
    });

    it('initializes the graph', function() {
      graph.attachTo(targetElement);
      expect(adapter.initialize).toHaveBeenCalledWith(
        targetElement,
        {
          width: width,
          height: height,
          nodes: [],
          edges: [],
        }
      );
      expect(adapter.addNode).toNotHaveBeenCalled();
    });

    it('initializes the graph with nodes and edges from state', function() {
      graph = newGraph({ nodeSize: 10 });
      state.retrievePersistedNodes.andReturn([
        { id: 0, color: '#0000FF' },
        { id: 1, color: '#00FF00' },
        { id: 2 },
      ]);
      state.retrievePersistedEdges.andReturn([
        { source: 0, target: 1 },
        { source: 1, target: 2 },
      ]);
      graph.attachTo(targetElement);
      expect(adapter.initialize).toHaveBeenCalledWith(
        targetElement,
        {
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

      graph = newGraph();
      state.retrievePersistedNodes.andReturn([
        { id: 0, color: '#0000FF', label: 'asdf', },
        { id: 1, color: '#00FF00' },
        { id: 2, label: 'hello' },
      ]);
      adapter.getNode.andCall(function() {
        return [realNode1, realNode2, realNode3][(getNodeIndex++)%3];
      });
      state.retrievePersistedEdges.andReturn([]);

      graph.attachTo(targetElement);

      expect(labelSet.initialize).toNotHaveBeenCalled();

      actionQueue.step(1);

      expect(labelSet.initialize).toHaveBeenCalledWith([
        { node: realNode1, label: 'asdf' },
        { node: realNode2, label: undefined },
        { node: realNode3, label: 'hello' },
      ]);
    });
  });

  describe('click', function() {
    var graph;
    beforeEach(function() {
      graph = newGraph();
      graph.attachTo(targetElement);
    });

    it('adds a node to the graph by default', function() {
      var id = 0;
      state.persistNode.andCall(function() {
        return id++;
      });
      adapter.getClickTarget.andReturn(graphelements.NONE);
      expect(adapter.addNode).toNotHaveBeenCalled();
      targetElement.click();

      expect(adapter.getClickTarget).toHaveBeenCalled();
      expect(adapter.addNode).toHaveBeenCalled();
      expect(adapter.addNode).toHaveBeenCalledWith({ id: 0, label: '', color: '#2980B9' });
      expect(state.persistNode).toHaveBeenCalledWith({ color: '#2980B9' });

      targetElement.click();
      targetElement.click();
      targetElement.click();
      expect(adapter.addNode.calls.length).toBe(4);
      expect(adapter.addNode).toHaveBeenCalledWith({ id: 1, label: '', color: '#2980B9' });
      expect(adapter.addNode).toHaveBeenCalledWith({ id: 2, label: '', color: '#2980B9' });
      expect(adapter.addNode).toHaveBeenCalledWith({ id: 3, label: '', color: '#2980B9' });

      expect(state.persistNode.calls.length).toBe(4);
      expect(state.persistNode).toHaveBeenCalledWith({ color: '#2980B9' });
      expect(state.persistNode).toHaveBeenCalledWith({ color: '#2980B9' });
      expect(state.persistNode).toHaveBeenCalledWith({ color: '#2980B9' });
    });

    it('passes node size to adapter', function() {
      graph = newGraph(
        { nodeSize: 56 }
      );
      graph.attachTo(targetElement);
      adapter.getClickTarget.andReturn(graphelements.NONE);

      state.persistNode.andReturn(3);

      targetElement.click();

      expect(adapter.addNode).toHaveBeenCalledWith(
        { id: 3, label: '', color: '#2980B9', size: 56 }
      );
    });

    it('cycles through node colors when clicking on a node', function() {
      var clickTarget = new graphelements.Node({ id: 1 });
      adapter.getClickTarget.andReturn(clickTarget);

      targetElement.click();
      targetElement.click();
      targetElement.click();
      targetElement.click();
      targetElement.click();
      targetElement.click();
      targetElement.click();

      expect(adapter.getClickTarget).toHaveBeenCalled();
      expect(adapter.addNode).toNotHaveBeenCalled();
      expect(adapter.setNodeColor.calls.length).toBe(7);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.RED);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.ORANGE);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.YELLOW);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.GREEN);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.BLUE);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.INDIGO);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.VIOLET);

      expect(state.persistNode.calls.length).toBe(7);
      expect(state.persistNode).toHaveBeenCalledWith({ id: clickTarget.id, color: colors.RED });
      expect(state.persistNode).toHaveBeenCalledWith({ id: clickTarget.id, color: colors.ORANGE });
      expect(state.persistNode).toHaveBeenCalledWith({ id: clickTarget.id, color: colors.YELLOW });
      expect(state.persistNode).toHaveBeenCalledWith({ id: clickTarget.id, color: colors.GREEN });
      expect(state.persistNode).toHaveBeenCalledWith({ id: clickTarget.id, color: colors.BLUE });
      expect(state.persistNode).toHaveBeenCalledWith({ id: clickTarget.id, color: colors.INDIGO });
      expect(state.persistNode).toHaveBeenCalledWith({ id: clickTarget.id, color: colors.VIOLET });
    });

    it('tracks colors for nodes separately', function() {
      var target1 = new graphelements.Node({ id: 1 });
      var target2 = new graphelements.Node({ id: 2 });

      adapter.getClickTarget.andReturn(target1);
      targetElement.click();
      targetElement.click();
      targetElement.click();

      adapter.getClickTarget.andReturn(target2);
      targetElement.click();

      expect(adapter.setNodeColor.calls[0].arguments).toEqual([target1, colors.VIOLET]);
      expect(adapter.setNodeColor.calls[1].arguments).toEqual([target1, colors.RED]);
      expect(adapter.setNodeColor.calls[2].arguments).toEqual([target1, colors.ORANGE]);

      expect(adapter.setNodeColor.calls[3].arguments).toEqual([target2, colors.VIOLET]);
    });
  });

  describe('edit mode', function() {
    var graph;
    var edgeDistance;
    beforeEach(function() {
      edgeDistance = 234;
      graph = newGraph({ edgeDistance: edgeDistance });
      graph.attachTo(targetElement);
    });

    it('is triggered on click and hold on a graph node', function() {
      var node = new graphelements.Node();
      adapter.getClickTarget.andReturn(node);
      targetElement.trigger('mousedown');
      actionQueue.step(50);
      expect(editMode.activate).toNotHaveBeenCalled();
      actionQueue.step(50);
      expect(editMode.activate).toHaveBeenCalledWith(node);
      expect(editMode.deactivate).toNotHaveBeenCalled();
    });

    it('is not triggered by click and hold on other graph elements', function() {
      adapter.getClickTarget.andReturn(graphelements.NONE);
      targetElement.clickAndHold(actionQueue, 100);
      expect(editMode.activate).toNotHaveBeenCalled();
      expect(editMode.deactivate).toNotHaveBeenCalled();
    });

    it('makes a connection when clicking on another node', function() {
      var originalNode = createSpyObjectWith({
        id: 1231,
        'isNode.returnValue': true,
      });
      var otherNode = createSpyObjectWith({
        id: 567,
        'isNode.returnValue': true,
      });
      activateEditMode(originalNode);

      adapter.getClickTarget.andReturn(otherNode);
      targetElement.click();

      expect(adapter.addEdge).toHaveBeenCalledWith({
        source: originalNode,
        target: otherNode,
        distance: edgeDistance,
      });
      expect(editMode.deactivate).toNotHaveBeenCalled();
      expect(adapter.addNode).toNotHaveBeenCalled();
      expect(state.persistEdge).toHaveBeenCalledWith(originalNode.id, otherNode.id);
    });

    it('does not make a connection when clicking on the same node', function() {
      var originalNode = createSpyObjectWith({
        id: 1231,
        'isNode.returnValue': true,
      });
      activateEditMode(originalNode);

      adapter.getClickTarget.andReturn(originalNode);
      targetElement.click();

      expect(adapter.addEdge).toNotHaveBeenCalled();
      expect(adapter.addNode).toNotHaveBeenCalled();
      expect(state.persistEdge).toNotHaveBeenCalled();
    });

    it('does not make a connection when clicking elsewhere', function() {
      var originalNode = createSpyObjectWith({
        id: 1231,
        'isNode.returnValue': true,
      });
      activateEditMode(originalNode);

      adapter.getClickTarget.andReturn(graphelements.NONE);
      targetElement.click();

      expect(adapter.addEdge).toNotHaveBeenCalled();
      expect(adapter.addNode).toNotHaveBeenCalled();
    });

    it('exits edit mode when clicking elsewhere', function() {
      activateEditMode(new graphelements.Node({ id: 20 }));

      adapter.getClickTarget.andReturn(graphelements.NONE);
      targetElement.click();

      expect(editMode.deactivate).toHaveBeenCalled();
    });

    it('exits edit mode when clicking on the same node', function() {
      var node = new graphelements.Node({ id: 21 });
      activateEditMode(node);

      adapter.getClickTarget.andReturn(node);

      targetElement.click();

      expect(editMode.deactivate).toHaveBeenCalled();
    });


    it('does not exit edit mode when clicking on another node', function() {
      activateEditMode(new graphelements.Node({ id: 21 }));

      adapter.getClickTarget.andReturn(new graphelements.Node({ id: 23 }));
      targetElement.click();

      expect(editMode.deactivate).toNotHaveBeenCalled();
    });
  });

  describe('reset', function() {
    var graph;
    beforeEach(function() {
      graph = newGraph();
      graph.attachTo(targetElement);
    });

    it('resets the state', function() {
      graph.reset();
      expect(state.reset).toHaveBeenCalled();
      expect(editMode.deactivate).toHaveBeenCalled();
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
