var utils = require('./utils');

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
  getStyle: function() {
    if (this.topLeft) {
        return 'position: absolute;' +
        ' left: ' + this.topLeft.x + ';' +
        ' top: ' + this.topLeft.y + ';';
    } else if (this.topRight) {
      return 'position: absolute;' +
        ' right: ' + this.topRight.x + ';' +
        ' top: ' + this.topRight.y + ';';
    } else if (this.bottomLeft) {
      return 'position: absolute;' +
        ' left: ' + this.bottomLeft.x + ';' +
        ' bottom: ' + this.bottomLeft.y + ';';
    } else if (this.bottomRight) {
      return 'position: absolute;' +
        ' right: ' + this.bottomRight.x + ';' +
        ' bottom: ' + this.bottomRight.y + ';';
    } else {
      throw new Error('invalid position object: ' + this);
    }
  },
};

module.exports = Position;
