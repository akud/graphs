var Graph = require('../src/Graph');
var clicktargets = require('../src/clicktargets');
var colors = require('../src/colors');


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
    new Graph({ adapter: adapter });
    expect(adapter.initialize).toNotHaveBeenCalled();
  });

  describe('attachTo', function() {
    var graph;
    var width;
    var height;
    beforeEach(function() {
      width = 123;
      height = 456;
      graph = new Graph(
        { adapter: adapter },
        { width: width, height: height }
      );
    });
    it('initializes the graph', function() {
      graph.attachTo(targetElement);
      expect(adapter.initialize).toHaveBeenCalledWith(
        targetElement,
        { width: width, height: height }
      );
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
      graph = new Graph({ adapter: adapter });
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
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.RED);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.ORANGE);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.YELLOW);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.GREEN);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.BLUE);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.INDIGO);
      expect(adapter.setNodeColor).toHaveBeenCalledWith(clickTarget, colors.VIOLET);
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

      expect(adapter.setNodeColor.calls[0].arguments).toEqual([target1, colors.VIOLET]);
      expect(adapter.setNodeColor.calls[1].arguments).toEqual([target1, colors.RED]);
      expect(adapter.setNodeColor.calls[2].arguments).toEqual([target1, colors.ORANGE]);

      expect(adapter.setNodeColor.calls[3].arguments).toEqual([target2, colors.VIOLET]);
    });
  });
});
