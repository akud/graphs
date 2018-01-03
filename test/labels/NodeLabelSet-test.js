var NodeLabelSet = require('../../src/labels/NodeLabelSet');
var Position = require('../../src/geometry/Position');
var BoundingBox = require('../../src/geometry/BoundingBox');

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

  function expectLabelToHaveBeenCreated(node, label, link) {
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
        arguments: [{ text: 'askjf', link: 'hijk' }],
        before: function() { expect(state.persistNode).toNotHaveBeenCalled(); },
        after: function() {
          expect(state.persistNode).toHaveBeenCalledWith({
            id: node.id,
            label: 'askjf',
            link: 'hijk',
          });
        },
        reset: function() { state.persistNode.reset(); },
        link: link,
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
        { node: node3, label: 'world', link: '/foobar/' },
      ]);

      expectLabelToHaveBeenCreated(node1, 'hello');
      expectLabelToHaveBeenCreated(node3, 'world', '/foobar/');
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

    it('reuses an existing label from initial data', function() {
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

    it('reuses an existing label from a previous mode', function() {
      var node = createNode({ id: 123 });

      labelSet.display(node);

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

    it('reuses an existing label from initial data', function() {
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

    it('reuses an existing label from a previous mode', function() {
      var node = createNode({ id: 123 });

      labelSet.edit(node);

      labelFactory.create.reset();
      label.reset();

      labelSet.display(node);

      expect(labelFactory.create).toNotHaveBeenCalled();
      expect(label.edit).toNotHaveBeenCalled();
      expect(label.display).toHaveBeenCalled();
    });
  });

  describe('closeAll', function() {
    it('closes all the labels', function() {
      var label1 = createSpyObjectWith('display', 'edit', 'remove');
      var label2 = createSpyObjectWith('display', 'edit', 'remove');
      var label3 = createSpyObjectWith('display', 'edit', 'remove');
      var createCallCount = 0;
      labelFactory.create.andCall(function(opts) {
        return [label1, label2, label3][(createCallCount++)%3];
      });

      labelSet.initialize([
        { node: createNode({ id: 0 }), label: 'asdf' }
      ]);
      labelSet.edit(createNode({ id: 1 }));
      labelSet.display(createNode({ id: 2 }));

      labelSet.closeAll();
      expect(label1.remove).toHaveBeenCalled();
      expect(label2.remove).toHaveBeenCalled();
      expect(label3.remove).toHaveBeenCalled();

      labelFactory.create.reset();

      labelSet.edit(createNode({ id: 1 }));

      expect(labelFactory.create).toHaveBeenCalled();
    });
  });
});
