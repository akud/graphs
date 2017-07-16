function ClickTarget(options) {
  Object.assign(this, options);
}

ClickTarget.prototype = {
  isNode: function() {
    return false;
  },
  isEdge: function() {
    return false;
  },
};

function Node(options) {
  ClickTarget.apply(this, arguments);
  if (options) {
    this.realNode = options.realNode;
  }
}

Node.prototype = Object.assign(new ClickTarget(), {
  isNode: function() { return true; },
});


function Edge() {
  ClickTarget.apply(this, arguments);
}

Edge.prototype = Object.assign(new ClickTarget(), {
  isEdge: function() { return true; },
});

function None() {
  ClickTarget.apply(this, arguments);
}

None.prototype = Object.assign(new ClickTarget(), {

});

module.exports = {
  Node: Node,
  Edge: Edge,
  NONE: new None(),
};
