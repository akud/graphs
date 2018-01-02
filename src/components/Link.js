var Component = require('../Component');

function Link(opts) {
  Component.apply(this, arguments);
  this.text = opts && opts.text;
  this.link = opts && opts.link;
}

Link.prototype = Object.assign(new Component(), {
  className: 'Link',

  getGeneratedMarkup: function() {
    if (this.text && this.link) {
      return '<a href="' + this.link + '">' + this.text + '</a>';
    } else {
      return null;
    }
  },
});

module.exports = Link;
