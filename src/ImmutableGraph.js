var Graph = require('./Graph');

function ImmutableGraph() {
  Graph.apply(this, arguments);
}

ImmutableGraph.prototype = Object.assign(new Graph(), {
  className: 'ImmutableGraph',

  addNode: function() {},
  changeColor: function() {},
  addEdge: function() {},
  reset: function() {},

});

module.exports = ImmutableGraph;
