var GreulerAdapter = require('../src/GreulerAdapter');

describe('GreulerAdapter', function() {
  var greuler;
  var instance;

  beforeEach(function() {
    greuler = createSpy();
    instance = createSpyObjectWith(
      'update',
      {
        graph: createSpyObjectWith('addNode')
      }
    );
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
});
