var TrackedObject = require('../TrackedObject');

function InMemoryState() {
  TrackedObject.apply(this);
  this.nodes = {};
  this.edges = [];
}

InMemoryState.prototype = Object.assign(new TrackedObject(), {
  className: 'InMemoryState',
  getConstructorArgs: function() { return {}; },

  persistNode: function(options) {
    options = options || {};
    if (options.hasOwnProperty('id') && options.id !== null && options.id !== undefined) {
      nodeId = options.id;
    } else {
      nodeId = this._getNumNodes();
      options.id = nodeId;
    }

    this.nodes[nodeId] = Object.assign({}, this.nodes[nodeId], options);
    return nodeId;
  },

  retrieveNode: function(nodeId) {
    return this.nodes[nodeId];
  },

  persistEdge: function(sourceId, targetId) {
    this.edges.push({ source: sourceId, target: targetId });
  },

  retrievePersistedNodes: function() {
    return Object.values(this.nodes);
  },

  retrievePersistedEdges: function() {
    return this.edges;
  },

  getUrl: function() {
    return '';
  },

  reset: function() {
    this.nodes = {};
    this.edges = [];
  },

  _getNumNodes: function() {
    return Object.keys(this.nodes).length;
  },

});

module.exports = InMemoryState;
