var graphfactory = require('../../src/graphs/graphfactory');
var ImmutableGraph = require('../../src/graphs/ImmutableGraph');
var ColorChangingGraph= require('../../src/graphs/ColorChangingGraph');
var DisallowedEditMode = require('../../src/modes/DisallowedEditMode');
var EditMode = require('../../src/modes/EditMode');
var Graph = require('../../src/graphs/Graph');

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


  describe('newImmutableGraph', function() {
    it('creates immutable graphs', function() {
      var graph = graphfactory.newImmutableGraph({
        actionQueue: actionQueue,
        adapter: adapter,
        state: state,
        document: document,
      });
      expect(graph).toBeAn(ImmutableGraph);
    });

    it('passes opts to graph', function() {
      var initialNodes = [{ id: 0 }, { id: 2 }];
      var initialEdges = [{ source: 0,  target: 2 }];
      var graph = graphfactory.newImmutableGraph({
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
    });
  });

  describe('newColorChangingGraph', function() {
    it('creates color changing graphs', function() {
      var graph = graphfactory.newColorChangingGraph({
        actionQueue: actionQueue,
        adapter: adapter,
        state: state,
        document: document,
      });
      expect(graph).toBeA(ColorChangingGraph);
    });

    it('passes opts to graph', function() {
      var initialNodes = [{ id: 0 }, { id: 2 }];
      var initialEdges = [{ source: 0,  target: 2 }];
      var graph = graphfactory.newColorChangingGraph({
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
    });

  });

  describe('newMutableGraph', function() {
    it('creates mutable graphs', function() {
      var graph = graphfactory.newMutableGraph({
        actionQueue: actionQueue,
        adapter: adapter,
        state: state,
        document: document,
      });
      expect(graph).toBeA(Graph);
    });

    it('passes opts to graph', function() {
      var initialNodes = [{ id: 0 }, { id: 2 }];
      var initialEdges = [{ source: 0,  target: 2 }];
      var graph = graphfactory.newMutableGraph({
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
    });
  });

  describe('newGraph', function() {
    var graph;
    beforeEach(function() {
      graph = { abcd: 'efg' };
      spyOn(graphfactory, 'newImmutableGraph').andReturn(graph);
      spyOn(graphfactory, 'newColorChangingGraph').andReturn(graph);
      spyOn(graphfactory, 'newMutableGraph').andReturn(graph);
    });

    afterEach(function() {
      graphfactory.newImmutableGraph.restore();
      graphfactory.newColorChangingGraph.restore();
      graphfactory.newMutableGraph.restore();
    });

    it('creates immutable graphs', function() {
      var opts = {
        immutable: true,
        foo: 'bar',
      };
      var result = graphfactory.newGraph(opts);
      expect(result).toEqual(graph);
      expect(graphfactory.newImmutableGraph).toHaveBeenCalledWith(opts);
    });

    it('creates color changing graphs', function() {
      var opts = {
        onlyChangeColors: true,
        foo: 'bar',
      };
      var result = graphfactory.newGraph(opts);
      expect(result).toEqual(graph);
      expect(graphfactory.newColorChangingGraph).toHaveBeenCalledWith(opts);
    });

    it('creates mutable graphs', function() {
      var opts = {
        foo: 'bar',
      };
      var result = graphfactory.newGraph(opts);
      expect(result).toEqual(graph);
      expect(graphfactory.newMutableGraph).toHaveBeenCalledWith(opts);
    });
  });

  describe('newGraphComponent', function() {
    var graph;
    beforeEach(function() {
      graph = { abcd: 'efg' };
      spyOn(graphfactory, 'newImmutableGraph').andReturn(graph);
      spyOn(graphfactory, 'newColorChangingGraph').andReturn(graph);
      spyOn(graphfactory, 'newMutableGraph').andReturn(graph);
    });

    afterEach(function() {
      graphfactory.newImmutableGraph.restore();
      graphfactory.newColorChangingGraph.restore();
      graphfactory.newMutableGraph.restore();
    });

    it('creates immutable graphs', function() {
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
      expect(graphfactory.newImmutableGraph).toHaveBeenCalled();
    });

    it('creates color changing graphs', function() {
      var opts = {
        onlyChangeColors: true,
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
      expect(graphfactory.newColorChangingGraph).toHaveBeenCalled();
    });

    it('creates mutable graphs', function() {
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
      expect(graphfactory.newMutableGraph).toHaveBeenCalled();

    });
  });
});
