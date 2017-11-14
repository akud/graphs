var Component = require('../Component');

function BlockText(opts) {
  Component.apply(this, arguments);
  this.text = opts && opts.text;
}

BlockText.prototype = Object.assign(new Component(), {
  className: 'BlockText',

  getGeneratedMarkup: function() {
    return this.text && ('<p>'  + this.text + '</p>');
  },
});

module.exports = BlockText;
