var EditMode = require('./EditMode');
var Logger = require('../Logger');

var LOG = new Logger('NonAnimatingEditMode');


function NonAnimatingEditMode() {
  EditMode.apply(this, arguments);
}


NonAnimatingEditMode.prototype = Object.assign(new EditMode(), {
  className: 'NonAnimatingEditMode',

  _startEditAnimation: function() {
    LOG.debug('not animating for edit mode');
    return { stop: function() {} };
  },

  _validate: function() {
    if (!this.adapter) {
      throw new Error('adapter is required');
    }
    if (!this.modeSwitch) {
      throw new Error('modeSwitch is required');
    }
  },
});

module.exports = NonAnimatingEditMode;
