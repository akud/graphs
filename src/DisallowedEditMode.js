var EditMode = require('./EditMode');

function DisallowedEditMode() {
  EditMode.apply(this, arguments);
}

DisallowedEditMode.prototype = Object.assign(new EditMode(), {
  className: 'DisallowedEditMode',

  activate: function() {},
  _validate: function() {},
});

module.exports = DisallowedEditMode;
