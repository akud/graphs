var NonAnimatingEditMode = require('../../src/modes/NonAnimatingEditMode');
var graphelements = require('../../src/graphs/graphelements');
var colors = require('../../src/colors');

describe('NonAnimatingEditMode', function() {

  var adapter;
  var editMode;
  var labelSet;
  var alternateInterval = 456;

  beforeEach(function() {
    adapter = createSpyObjectWith(
      'getNodes',
      'setNodeColor'
    );

    labelSet = createSpyObjectWith('display', 'edit');

    editMode = new NonAnimatingEditMode({
      adapter: adapter,
      labelSet: labelSet,
      alternateInterval: alternateInterval,
    });
  });

  describe('activate', function() {

    it('edits the node label', function() {
      var node = new graphelements.Node({ id: 1, color: '#FFFFFF' });
      adapter.getNodes.andReturn([]);
      editMode.activate(node);
      expect(labelSet.edit).toHaveBeenCalledWith(node);
    });

    it('cleans up state if was previously active', function() {
      var node1 = new graphelements.Node({ id: 1, color: '#FFFFFF' });
      var node2 = new graphelements.Node({ id: 2, color: '#FFFF00' });
      var node3 = new graphelements.Node({ id: 3, color: '#FF00FF' });
      adapter.getNodes.andReturn([ node2, node3 ]);

      editMode.activate(node1);

      adapter.getNodes.andReturn([ node1, node3 ]);

      editMode.activate(node2);

      expect(adapter.setNodeColor).toHaveBeenCalledWith(node2, '#FFFF00');
      expect(adapter.setNodeColor).toHaveBeenCalledWith(node3, '#FF00FF');
      expect(adapter.setNodeColor.calls.length).toBe(2);
      expect(labelSet.display).toHaveBeenCalledWith(node1);
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

      expect(adapter.setNodeColor).toHaveBeenCalledWith(node2, '#FFFF00');
      expect(adapter.setNodeColor).toHaveBeenCalledWith(node3, '#FF00FF');
      expect(adapter.setNodeColor.calls.length).toBe(2);
      expect(labelSet.display).toHaveBeenCalledWith(node1);
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
