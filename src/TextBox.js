var Component = require('./Component');

function TextBox(options) {
  Component.apply(this, arguments);
  this.initialText = (options && options.text) || '';
}

TextBox.prototype = Object.assign(new Component(), {
  getGeneratedMarkup: function() {
    return '<input type="text"' +
    ' value="' + this.initialText + '"' +
    '></input>';
  },

  getText: function() {
    return this.element.getElementsByTagName('input')[0].value;
  },
});

module.exports = TextBox;
