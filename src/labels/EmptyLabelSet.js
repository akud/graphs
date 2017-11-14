function EmptyLabelSet() {

}

EmptyLabelSet.prototype = {
  className: 'EmptyLabelSet',
  getConstructorArgs: function() { return {}; },

  initialize: function() {},
  edit: function() {},
  display: function() {},
  closeAll: function() {},
};

module.exports = EmptyLabelSet;
