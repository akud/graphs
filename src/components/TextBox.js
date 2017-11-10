var Component = require('../Component');

function TextBox(options) {
  Component.apply(this, arguments);
  this.initialText = (options && options.text) || '';
  this.onSave = (options && options.onSave) || function() {};
}

TextBox.prototype = Object.assign(new Component(), {
  className: 'TextBox',

  getGeneratedMarkup: function() {
    return '<input type="text"' +
    ' value="' + this.initialText + '"' +
    '></input>';
  },

  getText: function() {
    return this.element.getElementsByTagName('input')[0].value;
  },

  handleEnter: function(event) {
    this.onSave();
  },
});

module.exports = TextBox;
