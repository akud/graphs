var TrackedObject = require('../TrackedObject');
var utils = require('../utils');

function ColorChanger() {
  TrackedObject.apply(this);
}

ColorChanger.prototype = Object.assign(new TrackedObject(), {
  className: 'ColorChanger',
  getConstructorArgs: function() { return {}; },

  setColor: function(opts) {
    var adapter = utils.requireNonNull(opts, 'adapter');
    var state = utils.requireNonNull(opts, 'state');
    var node = utils.requireNonNull(opts, 'node');
    var color = utils.requireNonNull(opts, 'color');

    adapter.setNodeColor(node, color);
    state.persistNode({ id: node.id, color: color });
  },
});

module.exports = ColorChanger;
