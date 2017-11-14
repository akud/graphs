function NoOpEdgeCreator() {

}

NoOpEdgeCreator.prototype = {
  className: 'NoOpEdgeCreator',
  getConstructorArgs: function() { return {}; },

  addEdge: function() {},

};

module.exports = NoOpEdgeCreator;
