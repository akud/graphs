var Graph = require('./Graph');

function ImmutableGraph() {
  Graph.apply(this, arguments);
}

ImmutableGraph.prototype = Object.assign(new Graph(), {

  addNode: function() {},
  changeColor: function() {},
  addEdge: function() {},
  reset: function() {},

});

module.exports = ImmutableGraph;
