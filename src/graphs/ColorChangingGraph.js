var Graph = require('./Graph');

function ColorChangingGraph() {
  Graph.apply(this, arguments);
}

ColorChangingGraph.prototype = Object.assign(new Graph(), {
  className: 'ColorChangingGraph',

  addNode: function() {},
  addEdge: function() {},
  reset: function() {},

});

module.exports = ColorChangingGraph;
