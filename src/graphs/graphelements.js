function GraphElement(options) {
  if (options) {
    this.id = options.id;
    this.domElement = options.domElement;
  }
}

GraphElement.prototype = {
  isNode: function() {
    return false;
  },
  isEdge: function() {
    return false;
  },
};

function Node(options) {
  GraphElement.apply(this, arguments);
  if (options) {
    this.realNode = options.realNode;
    this.color = options.color;
    this.getCurrentBoundingBox = options.getCurrentBoundingBox;
  }
}

Node.prototype = Object.assign(new GraphElement(), {
  isNode: function() { return true; },

  getCenter: function() {
    return this.getCurrentBoundingBox().getCenter();
  },

  getTopLeft: function() {
    return this.getCurrentBoundingBox().getTopLeft();
  },

  getTopRight: function() {
    return this.getCurrentBoundingBox().getTopRight();
  },

  getBottomLeft: function() {
    return this.getCurrentBoundingBox().getBottomLeft();
  },

  getBottomRight: function() {
    return this.getCurrentBoundingBox().getBottomRight();
  },
});


function Edge() {
  GraphElement.apply(this, arguments);
}

Edge.prototype = Object.assign(new GraphElement(), {
  isEdge: function() { return true; },
});

function None() {
  GraphElement.apply(this, arguments);
}

None.prototype = Object.assign(new GraphElement(), {

});

module.exports = {
  Node: Node,
  Edge: Edge,
  NONE: new None(),
};
