var Graph = require('../src/Graph');
var clicktargets = require('../src/clicktargets');


describe('Graph', function() {
  var adapter;
  var targetElement;

  beforeEach(function() {
    adapter = createSpyObjectWith(
      'initialize',
      'addNode',
      'getClickTarget',
      'setNodeColor'
    );
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
  });

  describe('click', function() {
    var graph;
    beforeEach(function() {
      graph = new Graph(adapter);
      graph.attachTo(targetElement);
    });

    it('adds a node to the graph by default', function() {
      adapter.getClickTarget.andReturn(clicktargets.NONE);
      expect(adapter.addNode).toNotHaveBeenCalled();
      targetElement.click();

      expect(adapter.getClickTarget).toHaveBeenCalled();
      expect(adapter.addNode).toHaveBeenCalled();
      expect(adapter.addNode).toHaveBeenCalledWith({ id: 0, label: '', fill: '#2980B9' });

      targetElement.click();
      targetElement.click();
      targetElement.click();
      expect(adapter.addNode.calls.length).toBe(4);
      expect(adapter.addNode).toHaveBeenCalledWith({ id: 1, label: '', fill: '#2980B9' });
      expect(adapter.addNode).toHaveBeenCalledWith({ id: 2, label: '', fill: '#2980B9' });
      expect(adapter.addNode).toHaveBeenCalledWith({ id: 3, label: '', fill: '#2980B9' });
    });

    it('cycles through node colors when clicking on a node', function() {
      var clickTarget = new clicktargets.Node({ id: 1 });
      adapter.getClickTarget.andReturn(clickTarget);

      targetElement.click();
      targetElement.click();
      targetElement.click();
      targetElement.click();
      targetElement.click();
      targetElement.click();
      targetElement.click();

      expect(adapter.getClickTarget).toHaveBeenCalled();
      expect(adapter.addNode).toNotHaveBeenCalled();
      expect(adapter.setNodeColor.calls.length).toBe(7);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, '#db190f');
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, '#f76402');
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, '#fbff14');
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, '#28b92b');
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, '#2826b5');
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, '#2980B9');
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, '#8c28b7');
    });

    it('tracks colors for nodes separately', function() {
      var target1 = new clicktargets.Node({ id: 1 });
      var target2 = new clicktargets.Node({ id: 2 });

      adapter.getClickTarget.andReturn(target1);
      targetElement.click();
      targetElement.click();
      targetElement.click();

      adapter.getClickTarget.andReturn(target2);
      targetElement.click();

      expect(adapter.setNodeColor.calls[0].arguments).toEqual([target1, '#8c28b7']);
      expect(adapter.setNodeColor.calls[1].arguments).toEqual([target1, '#db190f']);
      expect(adapter.setNodeColor.calls[2].arguments).toEqual([target1, '#f76402']);

      expect(adapter.setNodeColor.calls[3].arguments).toEqual([target2, '#8c28b7']);
    });
  });
});
