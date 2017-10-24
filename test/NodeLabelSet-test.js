var NodeLabelSet = require('../src/NodeLabelSet');
var Position = require('../src/Position');
var BoundingBox = require('../src/BoundingBox');

describe('NodeLabelSet', function() {
  var componentManager;
  var state;
  var nodeLabelSet;
  var labelFactory;
  var label;
  var labelSet;

  beforeEach(function() {
    componentManager = createSpyObjectWith('insertComponent');
    state = createSpyObjectWith('persistNode');
    label = createSpyObjectWith({
      'display.returnValue': 'this',
      'edit.returnValue': 'this',
    });
    labelFactory = createSpyObjectWith({
      'create.returnValue': label,
    });
    labelSet = new NodeLabelSet({
      componentManager: componentManager,
      state: state,
      editableLabelFactory: labelFactory,
    });
  });

  function createNode(opts) {
    return Object.assign(
      createSpyObjectWith({
        'getCurrentBoundingBox.returnValue': new BoundingBox(),
      }),
      opts
    );
  }

  function expectLabelToHaveBeenCreated(node, label) {
    var reset = function() { node.getCurrentBoundingBox.reset() };
    expect(labelFactory.create).toHaveBeenCalledWith({
      text: label,
      componentManager: componentManager,
      pinTo: matchers.functionThatHasSideEffect({
        before: function() { expect(node.getCurrentBoundingBox).toNotHaveBeenCalled(); },
        after: function(result) {
          expect(node.getCurrentBoundingBox).toHaveBeenCalled();
          expect(result).toEqual(new Position({
            bottomRight: node.getCurrentBoundingBox().getTopLeft()
          }));

        },
        reset: function() {
          node.getCurrentBoundingBox.reset();
        },
      }),
      onChange: matchers.functionThatHasSideEffect({
        arguments: ['askjf'],
        before: function() { expect(state.persistNode).toNotHaveBeenCalled(); },
        after: function() {
          expect(state.persistNode).toHaveBeenCalledWith({
            id: node.id,
            label: 'askjf',
          });
        },
        reset: function() { state.persistNode.reset(); },
      }),
    });
  }

  describe('initialize', function() {
    it('creates labels for each of the nodes that has a label', function() {
      var label1 = createSpyObjectWith('display', 'edit');
      var label2 = createSpyObjectWith('display', 'edit');
      labelFactory.create.andCall(function(opts) {
        return opts.text === 'hello' ? label1 : label2;
      });


      var node1 = createNode({ id: 1 });
      var node2 = createNode({ id: 2 });
      var node3 = createNode({ id: 3 });
      labelSet.initialize([
        { node: node1, label: 'hello' },
        { node: node2, label: '' },
        { node: node3, label: 'world' },
      ]);

      expectLabelToHaveBeenCreated(node1, 'hello');
      expectLabelToHaveBeenCreated(node3, 'world');
      expect(labelFactory.create.calls.length).toBe(2);

      expect(label1.display).toHaveBeenCalled();
      expect(label1.edit).toNotHaveBeenCalled();

      expect(label2.display).toHaveBeenCalled();
      expect(label2.edit).toNotHaveBeenCalled();
    });
  });

  describe('edit', function() {
    it('creates a label for the node if it does not already have one', function() {
      var node = createNode({ id: 123 });
      labelSet.edit(node);
      expectLabelToHaveBeenCreated(node);
      expect(label.edit).toHaveBeenCalled();
      expect(label.display).toNotHaveBeenCalled();
    });

    it('reuses an existing label', function() {
      var node = createNode({ id: 123 });
      labelSet.initialize([
        { node: node, label: 'hello' }
      ]);
      labelFactory.create.reset();
      label.reset();

      labelSet.edit(node);

      expect(labelFactory.create).toNotHaveBeenCalled();
      expect(label.edit).toHaveBeenCalled();
      expect(label.display).toNotHaveBeenCalled();
    });
  });

  describe('display', function() {
    it('creates a label for the node if it does not already have one', function() {
      var node = createNode({ id: 123 });
      labelSet.display(node);
      expectLabelToHaveBeenCreated(node);
      expect(label.display).toHaveBeenCalled();
      expect(label.edit).toNotHaveBeenCalled();
    });

    it('reuses an existing label', function() {
      var node = createNode({ id: 123 });
      labelSet.initialize([
        { node: node, label: 'hello' }
      ]);
      labelFactory.create.reset();
      label.reset();

      labelSet.display(node);

      expect(labelFactory.create).toNotHaveBeenCalled();
      expect(label.edit).toNotHaveBeenCalled();
      expect(label.display).toHaveBeenCalled();
    });
  });
});
