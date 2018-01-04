var TrackedObject = require('../TrackedObject');

function NoOpEdgeCreator() {
  TrackedObject.apply(this);
}

NoOpEdgeCreator.prototype = Object.assign(new TrackedObject(), {
  className: 'NoOpEdgeCreator',
  getConstructorArgs: function() { return {}; },

  addEdge: function() {},

});

module.exports = NoOpEdgeCreator;
