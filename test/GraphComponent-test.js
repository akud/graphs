var GraphComponent = require('../src/GraphComponent');
var graphelements = require('../src/graphelements');
var MockActionQueue = require('./utils/MockActionQueue');


describe('GraphComponent', function() {
  var adapter;
  var targetElement;
  var editMode;
  var graph;

  beforeEach(function() {
    actionQueue = new MockActionQueue();
    adapter = createSpyObjectWith('getClickTarget');
    editMode = createSpyObjectWith(
      'activate',
      'deactivate',
      'perform'
    );
    deactivateEditMode();
    graph = createSpyObjectWith(
      'initialize',
      'changeColor',
      'addNode',
      'addEdge',
      'reset'
    );
    targetElement = new MockDomNode();
  });

  function newComponent(options) {
    return new GraphComponent(Object.assign({
        actionQueue: actionQueue,
        adapter: adapter,
        editMode: editMode,
        graph: graph,
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
    newComponent();
    expect(graph.initialize).toNotHaveBeenCalled();
  });

  describe('attachTo', function() {
    it('initializes the graph', function() {
      var component = newComponent({
        width: 1234,
        height: 89,
      });
      component.attachTo(targetElement);
      expect(graph.initialize).toHaveBeenCalledWith({
        element: targetElement,
        width: 1234,
        height: 89,
      });
    });
  });

  describe('click', function() {
    var component;
    beforeEach(function() {
      component = newComponent();
      component.attachTo(targetElement);
    });

    it('adds a node to the graph by default', function() {
      adapter.getClickTarget.andReturn(graphelements.NONE);
      targetElement.click();

      expect(graph.addNode).toHaveBeenCalled();
    });

    it('changes node color when clicking on a node', function() {
      var clickTarget = new graphelements.Node({ id: 1 });
      adapter.getClickTarget.andReturn(clickTarget);

      targetElement.click();

      expect(adapter.getClickTarget).toHaveBeenCalled();
      expect(graph.addNode).toNotHaveBeenCalled();
      expect(graph.changeColor).toHaveBeenCalledWith(clickTarget);
    });
  });

  describe('edit mode', function() {
    var component;
    beforeEach(function() {
      component = newComponent();
      component.attachTo(targetElement);
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

      expect(graph.addEdge).toHaveBeenCalledWith(originalNode, otherNode);
      expect(editMode.deactivate).toNotHaveBeenCalled();
      expect(graph.addNode).toNotHaveBeenCalled();
    });

    it('does not make a connection when clicking on the same node', function() {
      var originalNode = createSpyObjectWith({
        id: 1231,
        'isNode.returnValue': true,
      });
      activateEditMode(originalNode);

      adapter.getClickTarget.andReturn(originalNode);
      targetElement.click();

      expect(graph.addEdge).toNotHaveBeenCalled();
      expect(graph.addNode).toNotHaveBeenCalled();
    });

    it('does not make a connection when clicking elsewhere', function() {
      var originalNode = createSpyObjectWith({
        id: 1231,
        'isNode.returnValue': true,
      });
      activateEditMode(originalNode);

      adapter.getClickTarget.andReturn(graphelements.NONE);
      targetElement.click();

      expect(graph.addEdge).toNotHaveBeenCalled();
      expect(graph.addNode).toNotHaveBeenCalled();
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
    var component;
    beforeEach(function() {
      component = newComponent();
      component.attachTo(targetElement);
    });

    it('resets the graph and deactivates edit mode', function() {
      component.reset();
      expect(graph.reset).toHaveBeenCalled();
      expect(editMode.deactivate).toHaveBeenCalled();
    });
  });
});
