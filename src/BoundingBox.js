function BoundingBox(dimensions) {
  this.dimensions = dimensions;
}

BoundingBox.prototype = {

  expandBy: function(factor) {
    var width = this.dimensions.right - this.dimensions.left;
    var height = this.dimensions.bottom - this.dimensions.top;
    return new BoundingBox({
      left: this.dimensions.left - width*factor,
      right: this.dimensions.right + width*factor,
      top: this.dimensions.top - height*factor,
      bottom: this.dimensions.bottom + width*factor,
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

};

module.exports = BoundingBox;
