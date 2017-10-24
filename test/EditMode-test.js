var EditMode = require('../src/EditMode');
var graphelements = require('../src/graphelements');
var colors = require('../src/colors');

describe('EditMode', function() {

  var adapter;
  var animator;
  var animation;
  var editMode;
  var alternateInterval = 456;

  beforeEach(function() {
    adapter = createSpyObjectWith(
      'getNodes',
      'setNodeColor'
    );
    animation = createSpyObjectWith(
      { 'every.returnValue': 'this' },
      { 'play.returnValue': 'this' },
      'stop'
    );
    animator = createSpyObjectWith({
      'alternate.returnValue': animation,
    });
    editMode = new EditMode({
      adapter: adapter,
      animator: animator,
      alternateInterval: alternateInterval,
    });
  });

  describe('activate', function() {

    it('animates the other nodes', function() {
      var otherNode1 = new graphelements.Node({ id: 1, color: '#FFFFFF' });
      var otherNode2 = new graphelements.Node({ id: 2, color: '#FFFF00' });
      var otherNode3 = new graphelements.Node({ id: 3, color: '#FF00FF' });
      adapter.getNodes.andReturn([
        otherNode1,
        otherNode2,
        otherNode3,
      ]);

      editMode.activate(new graphelements.Node({ id: 0 }));
      expect(adapter.getNodes).toHaveBeenCalledWith(matchers.functionThatReturns(
        { input: { id: 0 }, output: false },
        { input: otherNode1, output: true },
        { input: otherNode2, output: true },
        { input: otherNode3, output: true }
      ));
      expect(animator.alternate).toHaveBeenCalled();
      expect(animation.every).toHaveBeenCalledWith(alternateInterval);
      expect(animation.play).toHaveBeenCalled();
      var setNeonFunc = animator.alternate.calls[0].arguments[0];
      var setOriginalColorFunc = animator.alternate.calls[0].arguments[1];
      expect(adapter.setNodeColor).toNotHaveBeenCalled();

      setNeonFunc();
      expect(adapter.setNodeColor).toHaveBeenCalledWith(otherNode1, colors.NEON);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(otherNode2, colors.NEON);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(otherNode3, colors.NEON);
      expect(adapter.setNodeColor.calls.length).toBe(3);

      adapter.setNodeColor.reset();
      setOriginalColorFunc();
      expect(adapter.setNodeColor).toHaveBeenCalledWith(otherNode1, '#FFFFFF');
      expect(adapter.setNodeColor).toHaveBeenCalledWith(otherNode2, '#FFFF00');
      expect(adapter.setNodeColor).toHaveBeenCalledWith(otherNode3, '#FF00FF');
      expect(adapter.setNodeColor.calls.length).toBe(3);
    });

    it('cleans up state if was previously active', function() {
      var node1 = new graphelements.Node({ id: 1, color: '#FFFFFF' });
      var node2 = new graphelements.Node({ id: 2, color: '#FFFF00' });
      var node3 = new graphelements.Node({ id: 3, color: '#FF00FF' });
      adapter.getNodes.andReturn([ node2, node3 ]);

      editMode.activate(node1);

      adapter.getNodes.andReturn([ node1, node3 ]);

      editMode.activate(node2);

      expect(animation.stop).toHaveBeenCalled();
      expect(adapter.setNodeColor).toHaveBeenCalledWith(node2, '#FFFF00');
      expect(adapter.setNodeColor).toHaveBeenCalledWith(node3, '#FF00FF');
      expect(adapter.setNodeColor.calls.length).toBe(2);
    });
  });

  describe('deactivate', function() {
    it('cleans up edit state', function() {
      var node1 = new graphelements.Node({ id: 1, color: '#FFFFFF' });
      var node2 = new graphelements.Node({ id: 2, color: '#FFFF00' });
      var node3 = new graphelements.Node({ id: 3, color: '#FF00FF' });
      adapter.getNodes.andReturn([ node2, node3 ]);

      editMode.activate(node1);

      editMode.deactivate();

      expect(animation.stop).toHaveBeenCalled();
      expect(adapter.setNodeColor).toHaveBeenCalledWith(node2, '#FFFF00');
      expect(adapter.setNodeColor).toHaveBeenCalledWith(node3, '#FF00FF');
      expect(adapter.setNodeColor.calls.length).toBe(2);
    });
  });

  describe('perform', function() {
    it('passes the node to the ifActive function if it is active', function() {
      var node1 = new graphelements.Node({ id: 1, color: '#FFFFFF' });
      var node2 = new graphelements.Node({ id: 2, color: '#FFFF00' });
      var node3 = new graphelements.Node({ id: 3, color: '#FF00FF' });
      var ifActive = createSpy();
      var ifNotActive = createSpy();
      adapter.getNodes.andReturn([ node2, node3 ]);

      editMode.activate(node1);

      editMode.perform({ ifActive: ifActive, ifNotActive: ifNotActive });
      expect(ifActive).toHaveBeenCalledWith(node1);
      expect(ifNotActive).toNotHaveBeenCalled();
    });

    it('calls the ifNotActive function if it has not been activated', function() {
      var node1 = new graphelements.Node({ id: 1, color: '#FFFFFF' });
      var node2 = new graphelements.Node({ id: 2, color: '#FFFF00' });
      var node3 = new graphelements.Node({ id: 3, color: '#FF00FF' });
      var ifActive = createSpy();
      var ifNotActive = createSpy();
      adapter.getNodes.andReturn([ node2, node3 ]);

      editMode.perform({ ifActive: ifActive, ifNotActive: ifNotActive });
      expect(ifActive).toNotHaveBeenCalled();
      expect(ifNotActive).toHaveBeenCalled();
    });

    it('calls the ifNotActive function if it has been deactivated', function() {
      var node1 = new graphelements.Node({ id: 1, color: '#FFFFFF' });
      var node2 = new graphelements.Node({ id: 2, color: '#FFFF00' });
      var node3 = new graphelements.Node({ id: 3, color: '#FF00FF' });
      var ifActive = createSpy();
      var ifNotActive = createSpy();
      adapter.getNodes.andReturn([ node2, node3 ]);

      editMode.activate(node1);
      editMode.deactivate();

      editMode.perform({ ifActive: ifActive, ifNotActive: ifNotActive });
      expect(ifActive).toNotHaveBeenCalled();
      expect(ifNotActive).toHaveBeenCalled();
    });
  });
});
