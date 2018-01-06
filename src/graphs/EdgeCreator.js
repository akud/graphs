var TrackedObject = require('../TrackedObject');
var utils = require('../utils');

function EdgeCreator() {
  TrackedObject.apply(this);
}

EdgeCreator.prototype = Object.assign(new TrackedObject(), {
  className: 'EdgeCreator',
  getConstructorArgs: function() { return {}; },

  addEdge: function(opts) {
    var adapter = utils.requireNonNull(opts, 'adapter');
    var state = utils.requireNonNull(opts, 'state');
    var source = utils.requireNonNull(opts, 'source');
    var target = utils.requireNonNull(opts, 'target');
    var edgeDistance = opts.edgeDistance;
    var directed = opts.directed;

    adapter.addEdge({
      source: source,
      target: target,
      distance: edgeDistance,
      directed: directed,
    });
    state.persistEdge(source.id, target.id);
  },

});

module.exports = EdgeCreator;
