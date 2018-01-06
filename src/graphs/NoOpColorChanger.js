var TrackedObject = require('../TrackedObject');

function NoOpColorChanger() {
  TrackedObject.apply(this);
}

NoOpColorChanger.prototype = Object.assign(new TrackedObject(), {
  className: 'NoOpColorChanger',

  getConstructorArgs: function() { return {}; },
  setColor: function() {},
});

module.exports = NoOpColorChanger;
