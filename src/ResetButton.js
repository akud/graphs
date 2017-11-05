var Component = require('./Component');

function ResetButton(options) {
  Component.apply(this, arguments);
  if (options) {
    this.resettables = options.resettables;
  } else {
    this.resettables = [];
  }

}

ResetButton.prototype = Object.assign(new Component(), {
  className: 'ResetButton',

  handleClick: function(event) {
    this.resettables.forEach(function(resettable) {
      resettable.reset();
    });
  },
});

module.exports = ResetButton;
