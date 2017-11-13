function NoOpNodeCreator() {

}

NoOpNodeCreator.prototype = {
  className: 'NoOpNodeCreator',
  getConstructorArgs: function() { return {}; },
  addNode: function() {},
};

module.exports = NoOpNodeCreator;
