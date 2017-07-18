var GreulerAdapter = require('../src/GreulerAdapter');
var clicktargets = require('../src/clicktargets');

describe('GreulerAdapter', function() {
  var graph;
  var greuler;
  var instance;

  beforeEach(function() {
    greuler = createSpy();
    graph = createSpyObjectWith('addNode', 'getNodesByFn');
    instance = createSpyObjectWith('update', { graph: graph });
    greuler.andReturn(instance);
    instance.update.andReturn(instance);
  });

  it('does nothing when constructed', function() {
    new GreulerAdapter(greuler);
    expect(greuler).toNotHaveBeenCalled();
  });

  describe('initialize', function() {
    var adapter;
    var node;
    beforeEach(function() {
      adapter = new GreulerAdapter(greuler);
      node = new MockDomNode('asdkfwer');
    });

    it('initializes the graph', function() {
      adapter.initialize(node);
      expect(greuler).toHaveBeenCalledWith({ target: '#asdkfwer' });
      expect(instance.update).toHaveBeenCalled();
    });

    it('passes width and height to the graph', function() {
      adapter.initialize(node, { width: 123, height: 243 });
      expect(greuler).toHaveBeenCalledWith({
        target: '#asdkfwer',
        width: 123,
        height: 243,
      });
    });

    it('passes width to the graph', function() {
      adapter.initialize(node, { width: 123 });
      expect(greuler).toHaveBeenCalledWith({
        target: '#asdkfwer',
        width: 123,
      });
    });

    it('passes height to the graph', function() {
      adapter.initialize(node, { height: 243 });
      expect(greuler).toHaveBeenCalledWith({
        target: '#asdkfwer',
        height: 243,
      });
    });

  });

  describe('add node', function() {
    var adapter;
    beforeEach(function() {
      adapter = new GreulerAdapter(greuler);
      adapter.initialize(new MockDomNode());
    });

    it('adds a node and updates this instance', function() {
      var node = { id: 34 };
      adapter.addNode(node);
      expect(instance.graph.addNode).toHaveBeenCalledWith(node);
      expect(instance.update).toHaveBeenCalled();
    });
  });

  describe('getClickTarget', function() {
    var adapter;
    beforeEach(function() {
      adapter = new GreulerAdapter(greuler);
      adapter.initialize(new MockDomNode());
    });

    it('returns NONE if no target', function() {
      var event = createSpyObjectWith({ explicitOriginalTarget: null });
      expect(adapter.getClickTarget(event)).toBe(clicktargets.NONE);
    });

    it('compares node position to click position', function() {
      var realNode = {id: 345}
      var event = createSpyObjectWith({
        clientX: 125,
        clientY: 130,
        explicitOriginalTarget: createSpyObjectWith({
          nodeName: 'circle',
        }),
      });

      graph.getNodesByFn.andReturn([realNode]);

      var target = adapter.getClickTarget(event);
      expect(target).toBeA(clicktargets.Node);
      expect(target.id).toBe(345);
      expect(target.realNode).toBe(realNode);
      expect(target.domElement).toBe(event.explicitOriginalTarget);

      expect(graph.getNodesByFn).toHaveBeenCalledWithFunctionThatReturns(
        { input: { x: 125, y: 130, width: 20, height: 20 }, output: true },
        { input: { x: 110, y: 120, width: 20, height: 20 }, output: true },
        { input: { x: 105, y: 110, width: 20, height: 20 }, output: true },
        { input: { x: 100, y: 100, width: 20, height: 20 }, output: false },
        { input: { x: 100, y: 115, width: 20, height: 20 }, output: false },
        { input: { x: 110, y: 100, width: 20, height: 20 }, output: false }
      );
    });
  });

  describe('setNodeColor', function() {
    var adapter;
    beforeEach(function() {
      adapter = new GreulerAdapter(greuler);
      adapter.initialize(new MockDomNode());
    });

    it('sets the node fill color', function() {
      var clickTarget = new clicktargets.Node({
        id: 23,
        realNode: createSpyObjectWith(),
        domElement: createSpyObjectWith('setAttribute'),
      });
      adapter.setNodeColor(clickTarget, '#000');
      expect(clickTarget.domElement.setAttribute).toHaveBeenCalledWith('fill', '#000');
    });
  });
});
