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

  getElementPosition: function(elementSize) {
    elementSize = Object.assign({
      width: 0,
      height: 0,
    }, elementSize);

    if (this.topLeft) {
      return {
        left: this.topLeft.x,
        top: this.topLeft.y,
      };
    } else if (this.topRight) {
      return {
        left: this.topRight.x - elementSize.width,
        top: this.topRight.y,
      };
    } else if (this.bottomLeft) {
      return {
        left: this.bottomLeft.x,
        top: this.bottomLeft.y - elementSize.height,
      };
    } else if (this.bottomRight) {
      return {
        left: this.bottomRight.x  - elementSize.width,
        top: this.bottomRight.y - elementSize.height,
      }
    } else {
      throw new Error('invalid position object: ' + this);
    }
  },
};

module.exports = Position;
