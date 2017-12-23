var utils = require('../utils');

function EdgeCreator() {

}

EdgeCreator.prototype = {
  className: 'EdgeCreator',
  getConstructorArgs: function() { return {}; },

  addEdge: function(opts) {
    var adapter = utils.requireNonNull(opts, 'adapter');
    var state = utils.requireNonNull(opts, 'state');
    var source = utils.requireNonNull(opts, 'source');
    var target = utils.requireNonNull(opts, 'target');
    var edgeDistance = opts.edgeDistance;

    adapter.addEdge({
      source: source,
      target: target,
      distance: edgeDistance,
    });
    state.persistEdge(source.id, target.id);
  },

};

module.exports = EdgeCreator;
