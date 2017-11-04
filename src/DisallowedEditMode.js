var EditMode = require('./EditMode');

function DisallowedEditMode() {
  EditMode.apply(this, arguments);
}

DisallowedEditMode.prototype = Object.assign(new EditMode(), {
  activate: function() {},
  _validate: function() {},
});

module.exports = DisallowedEditMode;
