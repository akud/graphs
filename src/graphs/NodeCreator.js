var utils = require('../utils');

function NodeCreator() {
}

NodeCreator.prototype = {
  className: 'NodeCreator',
  getConstructorArgs: function() { return {}; },

  addNode: function(opts) {
    var state = utils.requireNonNull(opts.state);
    var adapter = utils.requireNonNull(opts.adapter);
    var color = utils.requireNonNull(opts.color);
    var nodeSize = opts.nodeSize;

    var nodeId = state.persistNode({
      color: color,
    });
    var node = utils.optional({
      id: nodeId,
      color: color,
      label: '',
      size: nodeSize,
    }, { force: ['id', 'label'] });
    adapter.addNode(node);
  },
};

module.exports = NodeCreator;
