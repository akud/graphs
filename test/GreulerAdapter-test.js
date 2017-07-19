var GreulerAdapter = require('../src/GreulerAdapter');
var graphelements = require('../src/graphelements');

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
      var node = { id: 34, label: 'asdf' };
      adapter.addNode(node);
      expect(instance.graph.addNode).toHaveBeenCalledWith(node);
      expect(instance.update).toHaveBeenCalled();
    });

    it('can add a node with id equal to 0', function() {
      var node = { id: 0 };
      adapter.addNode(node);
      expect(instance.graph.addNode).toHaveBeenCalledWith(
        { id: 0, label: '' }
      );
    });

    it('adds passes size as radius', function() {
      var node = { id: 34, size: 67 };
      adapter.addNode(node);
      expect(instance.graph.addNode).toHaveBeenCalledWith({
        id: 34,
        r: 67,
        label: '',
      });
    });

    it('passes label and fill color', function() {
      var node = { id: 34, label: '', color: '#faddad' };
      adapter.addNode(node);
      expect(instance.graph.addNode).toHaveBeenCalledWith({
        id: 34,
        label: '',
        fill: '#faddad',
      });
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
      expect(adapter.getClickTarget(event)).toBe(graphelements.NONE);
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
      expect(target).toBeA(graphelements.Node);
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
      var clickTarget = new graphelements.Node({
        id: 23,
        realNode: createSpyObjectWith(),
        domElement: createSpyObjectWith('setAttribute'),
      });
      adapter.setNodeColor(clickTarget, '#000');
      expect(clickTarget.domElement.setAttribute).toHaveBeenCalledWith('fill', '#000');
    });
  });

  describe('getNodes', function() {
    var adapter;
    beforeEach(function() {
      adapter = new GreulerAdapter(greuler);
      adapter.initialize(new MockDomNode());
    });

    it('matches nodes to dom elements', function() {
      var mockDomElement1 = new MockDomNode();
      var mockDomElement2 = new MockDomNode();
      var mockDomElement3 = new MockDomNode();

      var node1 = { id: 34, index: 0 };
      var node2 = { id: 45, index: 1 };
      var node3 = { id: 98, index: 2 };
      graph.getNodesByFn.andReturn([
        node1,
        node2,
        node3,
      ]);
      instance.nodeGroup = [
        [
          {
            childNodes: [
              mockDomElement1,
              mockDomElement2,
              mockDomElement3,
            ],
          }
        ],
      ];

      var results = adapter.getNodes();
      expect(graph.getNodesByFn).toHaveBeenCalledWithFunctionThatReturns(true);
      expect(results).toEqual([
        new graphelements.Node({
          id: 34,
          realNode: node1,
          domElement: mockDomElement1,
        }),
        new graphelements.Node({
          id: 45,
          realNode: node2,
          domElement: mockDomElement2,
        }),
        new graphelements.Node({
          id: 98,
          realNode: node3,
          domElement: mockDomElement3,
        }),
      ]);
    });

    it('passes filter to greuler', function() {
      var filter = function() { };
      graph.getNodesByFn.andReturn([]);
      adapter.getNodes(filter);
      expect(graph.getNodesByFn).toHaveBeenCalledWith(filter);
    });
  });
});
