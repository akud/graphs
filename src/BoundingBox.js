function BoundingBox(dimensions) {
  this.dimensions = dimensions;
}

BoundingBox.prototype = {

  expandBy: function(factor) {
    return new BoundingBox({
      left: this.dimensions.left - this.getWidth()*factor,
      right: this.dimensions.right + this.getWidth()*factor,
      top: this.dimensions.top - this.getHeight()*factor,
      bottom: this.dimensions.bottom + this.getHeight()*factor,
    });
  },

  translate: function(vector) {
    return new BoundingBox({
      left: this.dimensions.left + vector.x,
      right: this.dimensions.right + vector.x,
      top: this.dimensions.top + vector.y,
      bottom: this.dimensions.bottom + vector.y,
    });
  },

  contains: function(point) {
    return this.dimensions.left <= point.x && point.x <= this.dimensions.right &&
           this.dimensions.top <= point.y && point.y <= this.dimensions.bottom;

  },

  getCenter: function() {
    return {
      x: this.dimensions.left + this.getWidth() / 2,
      y: this.dimensions.top + this.getHeight() / 2,
    };
  },

  getTopLeft: function() {
    return {
      x: this.dimensions.left,
      y: this.dimensions.top,
    };
  },


  getTopRight: function() {
    return {
      x: this.dimensions.right,
      y: this.dimensions.top,
    };
  },


  getBottomLeft: function() {
    return {
      x: this.dimensions.left,
      y: this.dimensions.bottom,
    };
  },

  getBottomRight: function() {
    return {
      x: this.dimensions.right,
      y: this.dimensions.bottom,
    };
  },

  getWidth: function() {
    return this.dimensions.right - this.dimensions.left;
  },

  getHeight: function() {
    return this.dimensions.bottom - this.dimensions.top;
  },

};

module.exports = BoundingBox;
