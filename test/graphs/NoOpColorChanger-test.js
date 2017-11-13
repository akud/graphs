var NoOpColorChanger = require('../../src/graphs/NoOpColorChanger');

describe('NoOpColorChanger', function() {
  var state;
  var adapter;

  var colorChanger;


  beforeEach(function() {
    state = createSpyObjectWith(
      'persistEdge',
      'persistNode',
      'reset',
      {
        'retrievePersistedEdges.returnValue': [],
        'retrievePersistedNodes.returnValue': [],
      }
    );

    adapter = createSpyObjectWith(
      'addEdge',
      'addNode',
      'getNodes',
      'getNode',
      'initialize',
      'setNodeColor',
      'removeNode',
      {
        'performInBulk': function(fn) { fn(adapter); },
      }
    );
    colorChanger = new NoOpColorChanger();
  });

  describe('setColor', function() {
    it('does nothing', function() {
      var node = createSpyObjectWith();
      var color = 'asdf';
      colorChanger.setColor({
        adapter: adapter,
        state: state,
        node: node,
        color: color,
      });
      expect(adapter.setNodeColor).toNotHaveBeenCalled();
      expect(state.persistNode).toNotHaveBeenCalled();
    });
  });
});
