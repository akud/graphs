var GreulerAdapter = require('../src/GreulerAdapter');
var graphelements = require('../src/graphelements');

describe('GreulerAdapter', function() {
  var graph;
  var greuler;
  var instance;

  beforeEach(function() {
    greuler = createSpy();
    graph = createSpyObjectWith('addNode', 'addEdge', 'getNodesByFn');
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
      node = new MockDomNode({ id: 'asdkfwer' });
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

  describe('addEdge', function() {
    var adapter;
    beforeEach(function() {
      adapter = new GreulerAdapter(greuler);
      adapter.initialize(new MockDomNode());
    });

    it('adds an edge and updates the instance', function() {
      var node1 = { id: 78 };
      var node2 = { id: 91 };
      adapter.addEdge(node1, node2);
      expect(instance.graph.addEdge).toHaveBeenCalledWith(78, 91);
      expect(instance.update).toHaveBeenCalled();
    });
  });

  describe('getClickTarget', function() {
    var adapter;
    var domElements;

    beforeEach(function() {
      adapter = new GreulerAdapter(greuler);
      adapter.initialize(new MockDomNode());
      domElements = [
        new MockDomNode(),
        new MockDomNode(),
        new MockDomNode(),
      ];
      instance.nodeGroup = [
        [
          {
            childNodes: domElements.map(function(d) {
              return new MockDomNode({ 'getElementsByTagName.returnValue': [ d ] });
            }),
          }
        ],
      ];
    });

    it('returns NONE if no target', function() {
      var event = createSpyObjectWith({ explicitOriginalTarget: null });
      graph.getNodesByFn.andReturn([]);
      expect(adapter.getClickTarget(event)).toBe(graphelements.NONE);
    });

    it('compares node position to click position', function() {
      var realNode = { id: 345, index: 2 }
      var event = createSpyObjectWith({
        clientX: 125,
        clientY: 130,
      });

      graph.getNodesByFn.andReturn([realNode]);

      var target = adapter.getClickTarget(event);
      expect(target).toBeA(graphelements.Node);
      expect(target.id).toBe(345);
      expect(target.realNode).toBe(realNode);
      expect(target.domElement).toBe(domElements[2]);

      expect(graph.getNodesByFn).toHaveBeenCalledWith(matchers.functionThatReturns(
        { input: { x: 125, y: 130, width: 20, height: 20 }, output: true },
        { input: { x: 110, y: 120, width: 20, height: 20 }, output: true },
        { input: { x: 105, y: 110, width: 20, height: 20 }, output: true },
        { input: { x: 100, y: 100, width: 20, height: 20 }, output: false },
        { input: { x: 100, y: 115, width: 20, height: 20 }, output: false },
        { input: { x: 110, y: 100, width: 20, height: 20 }, output: false }
      ));
    });

    it('adds a fuzz factor to node bounding box', function() {
      var realNode = { id: 345, index: 1 }
      var event = createSpyObjectWith({
        clientX: 50,
        clientY: 100,
      });

      graph.getNodesByFn.andReturn([realNode]);

      var target = adapter.getClickTarget(event, 0.1);
      expect(target).toBeA(graphelements.Node);
      expect(target.id).toBe(345);
      expect(target.realNode).toBe(realNode);
      expect(target.domElement).toBe(domElements[1]);

      //click at (50, 100)
      expect(graph.getNodesByFn).toHaveBeenCalledWith(matchers.functionThatReturns(
        //top left
        { input: { x: 52, y: 102, width: 20, height: 20 }, output: true },
        { input: { x: 55, y: 102, width: 20, height: 20 }, output: false },
        { input: { x: 52, y: 105, width: 20, height: 20 }, output: false },

        //top right
        { input: { x: 28, y: 102, width: 20, height: 20 }, output: true },
        { input: { x: 25, y: 102, width: 20, height: 20 }, output: false },
        { input: { x: 28, y: 105, width: 20, height: 20 }, output: false },

        //bottom right
        { input: { x: 28, y: 78, width: 20, height: 20 }, output: true },
        { input: { x: 25, y: 78, width: 20, height: 20 }, output: false },
        { input: { x: 28, y: 75, width: 20, height: 20 }, output: false },

        //bottom left
        { input: { x: 52, y: 78, width: 20, height: 20 }, output: true },
        { input: { x: 55, y: 78, width: 20, height: 20 }, output: false },
        { input: { x: 52, y: 75, width: 20, height: 20 }, output: false }
      ));
    });

    it('chooses the closest node', function() {
      var event = createSpyObjectWith({
        clientX: 50,
        clientY: 100,
      });

      graph.getNodesByFn.andReturn([
        { id: 1, index: 0, x: 60, y: 110, width: 10, height: 10, },
        { id: 2, index: 1, x: 55, y: 95, width: 10, height: 10, },
      ]);

      var target = adapter.getClickTarget(event);
      expect(target).toBeA(graphelements.Node);
      expect(target.id).toBe(2);
      expect(target.domElement).toBe(domElements[1]);
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
      var circle1 = new MockDomNode({ fill: '#FF0000' });
      var circle2 = new MockDomNode({ fill: '#00FF00' });
      var circle3 = new MockDomNode({ fill: '#0000FF' });

      var childNode1 = new MockDomNode({
        'getElementsByTagName.returnValue': [circle1],
      });
      var childNode2 = new MockDomNode({
        'getElementsByTagName.returnValue': [circle2],
      });
      var childNode3 = new MockDomNode({
        'getElementsByTagName.returnValue': [circle3],
      });

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
            childNodes: [ childNode1, childNode2, childNode3, ],
          }
        ],
      ];

      var results = adapter.getNodes();
      expect(graph.getNodesByFn).toHaveBeenCalledWith(matchers.functionThatReturns(true));
      expect(results).toEqual([
        new graphelements.Node({
          id: 34,
          realNode: node1,
          domElement: circle1,
          color: '#FF0000',
        }),
        new graphelements.Node({
          id: 45,
          realNode: node2,
          domElement: circle2,
          color: '#00FF00',
        }),
        new graphelements.Node({
          id: 98,
          realNode: node3,
          domElement: circle3,
          color: '#0000FF',
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
