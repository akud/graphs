var TrackedObject = require('../TrackedObject');

function NoOpNodeCreator() {
  TrackedObject.apply(this);
}

NoOpNodeCreator.prototype = Object.assign(new TrackedObject(), {
  className: 'NoOpNodeCreator',
  getConstructorArgs: function() { return {}; },
  addNode: function() {},
});

module.exports = NoOpNodeCreator;
