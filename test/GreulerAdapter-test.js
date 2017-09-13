var colors = require('../src/colors');
var GreulerAdapter = require('../src/GreulerAdapter');
var graphelements = require('../src/graphelements');

describe('GreulerAdapter', function() {
  var graph;
  var greuler;
  var instance;
  var root;
  var nodeId = 0;

  beforeEach(function() {
    greuler = createSpy();
    graph = createSpyObjectWith('addNode', 'addEdge', 'getNodesByFn');
    root = createSpyObjectWith({
      'getBoundingClientRect.returnValue': {
        top: 0,
        left: 0,
      },
    });
    instance = createSpyObjectWith(
      'update',
      {
        graph: graph,
        root: [[root]],
      }
    );
    greuler.andReturn(instance);
    instance.update.andReturn(instance);
  });

  function makeNode(options) {
    options = Object.assign({
      left: 10,
      top: 30,
    }, options);
    if (options.hasOwnProperty('x')) {
      options.left = options.x;
    }
    if (options.hasOwnProperty('y')) {
      options.top = options.y;
    }
    return Object.assign({
      id: nodeId++,
      label: '',
      index: 0,
      fill: colors.RED,
      bounds: {
        x: options.left,
        X: options.right || options.left + 10,
        y: options.top,
        Y: options.bottom || options.top + 10,
      },
    }, options);
  };

  function makeEvent(options) {
    return createSpyObjectWith(Object.assign({
      clientX: 0,
      clientY: 0,
    }, options));
  }

  it('does nothing when constructed', function() {
    new GreulerAdapter(greuler);
    expect(greuler).toNotHaveBeenCalled();
  });

  describe('initialize', function() {
    var adapter;
    var element;
    beforeEach(function() {
      adapter = new GreulerAdapter(greuler);
      element = new MockDomNode({ id: 'asdkfwer' });
    });

    it('initializes the graph', function() {
      adapter.initialize(element);
      expect(greuler).toHaveBeenCalledWith({ target: '#asdkfwer', data: {} });
      expect(instance.update).toHaveBeenCalled();
    });

    it('passes width and height to the graph', function() {
      adapter.initialize(element, { width: 123, height: 243 });
      expect(greuler).toHaveBeenCalledWith({
        target: '#asdkfwer',
        width: 123,
        height: 243,
        data: {},
      });
    });

    it('passes width to the graph', function() {
      adapter.initialize(element, { width: 123 });
      expect(greuler).toHaveBeenCalledWith({
        target: '#asdkfwer',
        width: 123,
        data: {},
      });
    });

    it('passes height to the graph', function() {
      adapter.initialize(element, { height: 243 });
      expect(greuler).toHaveBeenCalledWith({
        target: '#asdkfwer',
        height: 243,
        data: {},
      });
    });

    it('passes edge distance to graph as a function', function() {
      adapter.initialize(element, { edgeDistance: 243 });
      expect(greuler).toHaveBeenCalledWith({
        target: '#asdkfwer',
        data: {
          linkDistance: matchers.functionThatReturns(243),
        },
      });
    });

    it('adds nodes and edges to the graph', function() {
      adapter.initialize(element, {
        nodes: [
          {
            id: 0,
            color: '#0000FF',
            size: 10,
          },
          {
            id: 1,
            color: '#00FF00',
            size: 20,
          },
        ],
        edges: [ { source: 0, target: 1 }]
      });
      expect(greuler).toHaveBeenCalledWith({
        target: '#asdkfwer',
        data: {
          nodes: [
            {
              id: 0,
              fill: '#0000FF',
              label: '',
              r: 10,
            },
            {
              id: 1,
              fill: '#00FF00',
              label: '',
              r: 20,
            },
          ],
          links: [{ source: 0, target: 1 }],
        },
      });
    });
  });

  describe('add node', function() {
    var adapter;
    beforeEach(function() {
      adapter = new GreulerAdapter(greuler);
      adapter.initialize(new MockDomNode());
    });

    it('adds a node and updates the instance', function() {
      var node = makeNode({ id: 34, label: 'asdf' });
      adapter.addNode(node);
      expect(instance.graph.addNode).toHaveBeenCalledWith(matchers.objectThatHas({
        id: 34,
        label: 'asdf',
      }));
      expect(instance.update).toHaveBeenCalled();
    });

    it('can add a node with id equal to 0', function() {
      var node = makeNode({ id: 0 });
      adapter.addNode(node);
      expect(instance.graph.addNode).toHaveBeenCalledWith(
        matchers.objectThatHas({ id: 0, label: '' })
      );
    });

    it('adds passes size as radius', function() {
      var node = makeNode({ id: 34, size: 67 });
      adapter.addNode(node);
      expect(instance.graph.addNode).toHaveBeenCalledWith(matchers.objectThatHas({
        id: 34,
        r: 67,
        label: '',
      }));
    });

    it('passes label and fill color', function() {
      var node = makeNode({ id: 34, label: '', color: '#faddad' });
      adapter.addNode(node);
      expect(instance.graph.addNode).toHaveBeenCalledWith(matchers.objectThatHas({
        id: 34,
        label: '',
        fill: '#faddad',
      }));
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
      adapter.addEdge({ source: node1, target: node2 });
      expect(instance.graph.addEdge).toHaveBeenCalledWith({
        source: 78,
        target: 91
      });
      expect(instance.update).toHaveBeenCalled();
    });

    it('works if source id is 0', function() {
      var node1 = { id: 0 };
      var node2 = { id: 91 };
      adapter.addEdge({ source: node1, target: node2 });
      expect(instance.graph.addEdge).toHaveBeenCalledWith({
        source: 0,
        target: 91
      });
    });

    it('works if target id is 0', function() {
      var node1 = { id: 123 };
      var node2 = { id: 0 };
      adapter.addEdge({ source: node1, target: node2 });
      expect(instance.graph.addEdge).toHaveBeenCalledWith({
        source: 123,
        target: 0
      });
    });

    it('passes the distance to the graph', function() {
      var node1 = { id: 78 };
      var node2 = { id: 91 };
      adapter.addEdge({ source: node1, target: node2, distance: 4589 });
      expect(instance.graph.addEdge).toHaveBeenCalledWith({
        source: 78,
        target: 91,
        linkDistance: 4589,
      });
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
      var event = makeEvent({ explicitOriginalTarget: null });
      graph.getNodesByFn.andReturn([]);
      expect(adapter.getClickTarget(event)).toBe(graphelements.NONE);
    });

    it('compares node position to click position', function() {
      var realNode = makeNode({ id: 345, index: 2 })
      var event = makeEvent({
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
        { input: makeNode({ left: 125, right: 125 + 20, top: 130, bottom: 130 + 20 }), output: true },
        { input: makeNode({ left: 110, right: 110 + 20, top: 120, bottom: 120 + 20 }), output: true },
        { input: makeNode({ left: 105, right: 105 + 20, top: 110, bottom: 110 + 20 }), output: true },
        { input: makeNode({ left: 100, right: 100 + 20, top: 100, bottom: 100 + 20 }), output: false },
        { input: makeNode({ left: 100, right: 100 + 20, top: 115, bottom: 115 + 20 }), output: false },
        { input: makeNode({ left: 110, right: 110 + 20, top: 100, bottom: 100 + 20 }), output: false }
      ));
    });

    it('adds a fuzz factor to node bounding box', function() {
      var realNode = makeNode({ id: 345, index: 1 })
      var event = makeEvent({
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
        { input: makeNode({ left: 52, right: 52 + 20, top: 102, bottom: 102 + 20 }), output: true },
        { input: makeNode({ left: 55, right: 55 + 20, top: 102, bottom: 102 + 20 }), output: false },
        { input: makeNode({ left: 52, right: 52 + 20, top: 105, bottom: 105 + 20 }), output: false },

        //top right
        { input: makeNode({ left: 28, right: 28 + 20, top: 102, bottom: 102 + 20 }), output: true },
        { input: makeNode({ left: 25, right: 25 + 20, top: 102, bottom: 102 + 20 }), output: false },
        { input: makeNode({ left: 28, right: 28 + 20, top: 105, bottom: 105 + 20 }), output: false },

        //bottom right
        { input: makeNode({ left: 28, right: 28 + 20, top: 78, bottom: 78 + 20 }), output: true },
        { input: makeNode({ left: 25, right: 25 + 20, top: 78, bottom: 78 + 20 }), output: false },
        { input: makeNode({ left: 28, right: 28 + 20, top: 75, bottom: 75 + 20 }), output: false },

        //bottom left
        { input: makeNode({ left: 52, right: 52 + 20, top: 78, bottom: 78 + 20 }), output: true },
        { input: makeNode({ left: 55, right: 55 + 20, top: 78, bottom: 78 + 20 }), output: false },
        { input: makeNode({ left: 52, right: 52 + 20, top: 75, bottom: 75 + 20 }), output: false }
      ));
    });

    it('chooses the closest node', function() {
      var event = makeEvent({
        clientX: 50,
        clientY: 100,
      });

      graph.getNodesByFn.andReturn([
        makeNode({ id: 1, index: 0, left: 60, right: 60 + 10, top: 110, bottom: 110 + 10, }),
        makeNode({ id: 2, index: 1, left: 55, right: 55 + 10, top: 95, bottom: 95 + 10, }),
      ]);

      var target = adapter.getClickTarget(event);
      expect(target).toBeA(graphelements.Node);
      expect(target.id).toBe(2);
      expect(target.domElement).toBe(domElements[1]);
    });

    it('translates client coordinates into internal coordinates', function() {
      root.getBoundingClientRect.andReturn({
        left: 140,
        top: 500,
      });
      var event = makeEvent({
        clientX: 190,
        clientY: 600,
      });

      graph.getNodesByFn.andReturn([]);

      adapter.getClickTarget(event);

      expect(graph.getNodesByFn).toHaveBeenCalledWith(matchers.functionThatReturns(
        { input: makeNode({ x: 50, y: 100 }), output: true },
        { input: makeNode({ x: 190, y: 600 }), output: false }
      ));
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

      var node1 = makeNode({ id: 34, index: 0 });
      var node2 = makeNode({ id: 45, index: 1 });
      var node3 = makeNode({ id: 98, index: 2 });
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

  describe('performInBulk', function() {
    var adapter;
    beforeEach(function() {
      adapter = new GreulerAdapter(greuler);
      adapter.initialize(new MockDomNode());
    });

    it('defers updating instance until after operations complete', function() {
      instance.update.reset();
      adapter.performInBulk(function() {
        expect(arguments[0]).toBe(adapter);
        arguments[0].addNode({ color: '#FFFFFF' });
        expect(instance.update).toNotHaveBeenCalled();
      });
      expect(instance.update).toHaveBeenCalled();
    });
  });
});
