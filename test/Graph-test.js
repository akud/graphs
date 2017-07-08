var Graph = require('../src/Graph');

describe('Graph', function() {
  var adapter;
  var targetElement;

  beforeEach(function() {
    adapter = createSpyObjectWith('initialize', 'addNode');
    targetElement = new MockDomNode();
  });

  it('does nothing when constructed', function() {
    new Graph(adapter);
    expect(adapter.initialize).toNotHaveBeenCalled();
  });

  describe('attachTo', function() {
    var graph;
    beforeEach(function() { graph = new Graph(adapter); });
    it('initializes the graph', function() {
      graph.attachTo(targetElement);
      expect(adapter.initialize).toHaveBeenCalledWith(targetElement);
      expect(adapter.addNode).toNotHaveBeenCalled();
    });

    it('adds a click listener', function() {
      graph.attachTo(targetElement);
      expect(targetElement.addEventListener).toHaveBeenCalled();
      expect(targetElement.addEventListener.calls[0].arguments[0]).toEqual('click');
    });
  })

  describe('click', function() {
    var graph;
    beforeEach(function() {
      graph = new Graph(adapter);
      graph.attachTo(targetElement);
    });

    it('adds a node to the graph', function() {
      expect(adapter.addNode).toNotHaveBeenCalled();
      targetElement.click();

      expect(adapter.addNode).toHaveBeenCalled();
      expect(adapter.addNode).toHaveBeenCalledWith({ id: 0, label: '' });

      targetElement.click();
      targetElement.click();
      targetElement.click();
      expect(adapter.addNode.calls.length).toBe(4);
      expect(adapter.addNode).toHaveBeenCalledWith({ id: 1, label: '' });
      expect(adapter.addNode).toHaveBeenCalledWith({ id: 2, label: '' });
      expect(adapter.addNode).toHaveBeenCalledWith({ id: 3, label: '' });
    });
  });
});
