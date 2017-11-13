function NoOpColorChanger() {

}

NoOpColorChanger.prototype = {
  className: 'NoOpColorChanger',

  getConstructorArgs: function() { return {}; },
  setColor: function() {},
};

module.exports = NoOpColorChanger;
