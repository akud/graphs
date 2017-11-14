var utils = require('../utils');

function Position(opts) {
  /* opts -
   * {
    topLeft: { x: 0, y: 0 },
    topRight: undefined,
    bottomLeft: undefined,
    bottomRight: undefined,
    }
   */
  if (!utils.isOneValuedObject(opts)) {
    throw new Error('invalid position object ' + opts);
  }

  Object.assign(this, opts);
}


Position.prototype = {
  className: 'Position',
  getConstructorArgs: function() { return this; },

  getStyle: function(opts) {
    opts = Object.assign({
      width: 0,
      height: 0,
    }, opts);

    if (this.topLeft) {
        return 'position: absolute;' +
        ' left: ' + this.topLeft.x + ';' +
        ' top: ' + this.topLeft.y + ';';
    } else if (this.topRight) {
      return 'position: absolute;' +
        ' left: ' + (this.topRight.x - opts.width) + ';' +
        ' top: ' + this.topRight.y + ';';
    } else if (this.bottomLeft) {
      return 'position: absolute;' +
        ' left: ' + this.bottomLeft.x + ';' +
        ' top: ' + (this.bottomLeft.y - opts.height) + ';';
    } else if (this.bottomRight) {
      return 'position: absolute;' +
        ' left: ' + (this.bottomRight.x  - opts.width)+ ';' +
        ' top: ' + (this.bottomRight.y - opts.height) + ';';
    } else {
      throw new Error('invalid position object: ' + this);
    }
  },
};

module.exports = Position;
