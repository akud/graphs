var graphfactory = require('../../src/graphs/graphfactory');
var DisallowedEditMode = require('../../src/modes/DisallowedEditMode');
var EditMode = require('../../src/modes/EditMode');
var NonAnimatingEditMode = require('../../src/modes/NonAnimatingEditMode');
var Graph = require('../../src/graphs/Graph');

var ColorChanger = require('../../src/graphs/ColorChanger');
var EdgeCreator = require('../../src/graphs/EdgeCreator');
var NodeCreator = require('../../src/graphs/NodeCreator');
var NodeLabelSet = require('../../src/labels/NodeLabelSet');
var EmptyLabelSet = require('../../src/labels/EmptyLabelSet');
var NoOpColorChanger = require('../../src/graphs/NoOpColorChanger');
var NoOpEdgeCreator = require('../../src/graphs/NoOpEdgeCreator');
var NoOpNodeCreator = require('../../src/graphs/NoOpNodeCreator');

describe('GraphFactory', function() {
  var actionQueue;
  var adapter;
  var state;
  var document;

  beforeEach(function() {
    actionQueue = createSpyObjectWith();
    adapter = createSpyObjectWith();
    state = createSpyObjectWith();
    document = createSpyObjectWith();
  });


  describe('newGraph', function() {
    it('can create immutable graphs', function() {
      var graph = graphfactory.newGraph({
        actionQueue: actionQueue,
        adapter: adapter,
        state: state,
        document: document,
        immutable: true,
      });
      expect(graph.colorChanger).toBeA(NoOpColorChanger);
      expect(graph.edgeCreator).toBeA(NoOpEdgeCreator);
      expect(graph.nodeCreator).toBeA(NoOpNodeCreator);
      expect(graph.labelSet).toBeA(NodeLabelSet);
    });

    it('can restrict ability to change colors', function() {
      var graph = graphfactory.newGraph({
        actionQueue: actionQueue,
        adapter: adapter,
        state: state,
        document: document,
        allowChangeColors: false,
      });
      expect(graph.colorChanger).toBeA(NoOpColorChanger);
      expect(graph.edgeCreator).toBeAn(EdgeCreator);
      expect(graph.nodeCreator).toBeA(NodeCreator);
      expect(graph.labelSet).toBeA(NodeLabelSet);
    });

    it('can restrict ability to add edges', function() {
      var graph = graphfactory.newGraph({
        actionQueue: actionQueue,
        adapter: adapter,
        state: state,
        document: document,
        allowAddEdges: false,
      });
      expect(graph.colorChanger).toBeA(ColorChanger);
      expect(graph.edgeCreator).toBeA(NoOpEdgeCreator);
      expect(graph.nodeCreator).toBeA(NodeCreator);
      expect(graph.labelSet).toBeA(NodeLabelSet);
    });

    it('can restrict ability to add nodes', function() {
      var graph = graphfactory.newGraph({
        actionQueue: actionQueue,
        adapter: adapter,
        state: state,
        document: document,
        allowAddNodes: false,
      });
      expect(graph.colorChanger).toBeA(ColorChanger);
      expect(graph.edgeCreator).toBeAn(EdgeCreator);
      expect(graph.nodeCreator).toBeA(NoOpNodeCreator);
      expect(graph.labelSet).toBeA(NodeLabelSet);
    });

    it('can restrict ability to have labels', function() {
      var graph = graphfactory.newGraph({
        actionQueue: actionQueue,
        adapter: adapter,
        state: state,
        document: document,
        allowLabels: false,
      });
      expect(graph.colorChanger).toBeA(ColorChanger);
      expect(graph.edgeCreator).toBeAn(EdgeCreator);
      expect(graph.nodeCreator).toBeA(NodeCreator);
      expect(graph.labelSet).toBeAn(EmptyLabelSet);
    });

    it('passes opts to graph', function() {
      var initialNodes = [{ id: 0 }, { id: 2 }];
      var initialEdges = [{ source: 0,  target: 2 }];
      var graph = graphfactory.newGraph({
        actionQueue: actionQueue,
        adapter: adapter,
        state: state,
        document: document,
        initialNodes: initialNodes,
        initialEdges: initialEdges,
        nodeSize: 123,
        edgeDistance: 456,
        colorChoices: ['#FF00FF', '#FFFFFF'],
      });
      expect(graph.initialNodes).toEqual(initialNodes);
      expect(graph.initialEdges).toEqual(initialEdges);
      expect(graph.nodeSize).toBe(123)
      expect(graph.edgeDistance).toBe(456)
      expect(graph.adapter).toBe(adapter);
      expect(graph.colorChoices).toEqual(['#FF00FF', '#FFFFFF']);

      expect(graph.colorChanger).toBeA(ColorChanger);
      expect(graph.edgeCreator).toBeAn(EdgeCreator);
      expect(graph.nodeCreator).toBeA(NodeCreator);
      expect(graph.labelSet).toBeA(NodeLabelSet);
    });
  });

  describe('newGraphComponent', function() {
    var graph;
    beforeEach(function() {
      graph = { abcd: 'efg' };
      spyOn(graphfactory, 'newGraph').andReturn(graph);
    });

    afterEach(function() {
      graphfactory.newGraph.restore();
    });

    it('can create immutable graphs', function() {
      var opts = {
        immutable: true,
        state: state,
        actionQueue: actionQueue,
        adapter: adapter,
        document: document,
        width: 100,
        height: 500,
        nodeAreaFuzzFactor: 0.1,
      };
      var component = graphfactory.newGraphComponent(opts);
      expect(component.graph).toEqual(graph);
      expect(component.editMode).toBeA(DisallowedEditMode);
      expect(component.width).toBe(100);
      expect(component.height).toBe(500);
      expect(component.nodeAreaFuzzFactor).toBe(0.1);
      expect(graphfactory.newGraph).toHaveBeenCalledWith(Object.assign({
        allowAddNodes: true,
        allowAddEdges: true,
        allowChangeColors: true,
        allowLabels: true,
        allowEdit: true,
      }, opts));
    });

    it('can disable edit mode', function() {
      var opts = {
        allowEdit: false,
        state: state,
        actionQueue: actionQueue,
        adapter: adapter,
        document: document,
        width: 100,
        height: 500,
        nodeAreaFuzzFactor: 0.1,
      };
      var component = graphfactory.newGraphComponent(opts);
      expect(component.graph).toEqual(graph);
      expect(component.editMode).toBeA(DisallowedEditMode);
      expect(component.width).toBe(100);
      expect(component.height).toBe(500);
      expect(component.nodeAreaFuzzFactor).toBe(0.1);
      expect(graphfactory.newGraph).toHaveBeenCalledWith(Object.assign({
        immutable: false,
        allowAddNodes: true,
        allowAddEdges: true,
        allowChangeColors: true,
        allowLabels: true,
      }, opts));
    });

    it('allows edit mode by default', function() {
      var opts = {
        state: state,
        actionQueue: actionQueue,
        adapter: adapter,
        document: document,
        width: 100,
        height: 500,
        nodeAreaFuzzFactor: 0.1,
      };
      var component = graphfactory.newGraphComponent(opts);
      expect(component.graph).toEqual(graph);
      expect(component.editMode).toBeAn(EditMode);
      expect(component.width).toBe(100);
      expect(component.height).toBe(500);
      expect(component.nodeAreaFuzzFactor).toBe(0.1);
      expect(graphfactory.newGraph).toHaveBeenCalledWith(Object.assign({
        immutable: false,
        allowAddNodes: true,
        allowAddEdges: true,
        allowChangeColors: true,
        allowLabels: true,
        allowEdit: true,
      }, opts));
    });

    it('uses a non-animating edit mode if edges are not allowed', function() {
      var opts = {
        allowAddEdges: false,
        state: state,
        actionQueue: actionQueue,
        adapter: adapter,
        document: document,
        width: 100,
        height: 500,
        nodeAreaFuzzFactor: 0.1,
      };
      var component = graphfactory.newGraphComponent(opts);
      expect(component.graph).toEqual(graph);
      expect(component.editMode).toBeA(NonAnimatingEditMode);
      expect(component.width).toBe(100);
      expect(component.height).toBe(500);
      expect(component.nodeAreaFuzzFactor).toBe(0.1);
      expect(graphfactory.newGraph).toHaveBeenCalledWith(Object.assign({
        immutable: false,
        allowAddNodes: true,
        allowChangeColors: true,
        allowLabels: true,
        allowEdit: true,
      }, opts));
    });

  });
});
