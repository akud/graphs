var TrackedObject = require('../TrackedObject');

function EmptyLabelSet() {
  TrackedObject.apply(this);
}

EmptyLabelSet.prototype = Object.assign(new TrackedObject(), {
  className: 'EmptyLabelSet',
  getConstructorArgs: function() { return {}; },

  initialize: function() {},
  edit: function() {},
  display: function() {},
  closeAll: function() {},
});

module.exports = EmptyLabelSet;
