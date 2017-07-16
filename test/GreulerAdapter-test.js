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

  it('initializes the graph on initialize', function() {
    var adapter = new GreulerAdapter(greuler);
    var node = new MockDomNode('asdkfwer');
    adapter.initialize(node);
    expect(greuler).toHaveBeenCalled();
    expect(greuler).toHaveBeenCalledWith({ target: '#asdkfwer' });
    expect(instance.update).toHaveBeenCalled();
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

      expect(graph.getNodesByFn).toHaveBeenCalled();
      var filter = graph.getNodesByFn.calls[0].arguments[0];

      expect(filter({ x: 125, y: 130, width: 20, height: 20 })).toBe(true);
      expect(filter({ x: 110, y: 120, width: 20, height: 20 })).toBe(true);
      expect(filter({ x: 105, y: 110, width: 20, height: 20 })).toBe(true);

      expect(filter({ x: 100, y: 100, width: 20, height: 20 })).toBe(false);
      expect(filter({ x: 100, y: 115, width: 20, height: 20 })).toBe(false);
      expect(filter({ x: 110, y: 100, width: 20, height: 20 })).toBe(false);
    });
  });
});
