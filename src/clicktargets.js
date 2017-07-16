function ClickTarget(options) {
  if (options) {
    this.id = options.id;
    this.adapter = options.adapter;
  }
}

function Node(options) {
  ClickTarget.apply(this, arguments);
  if (options) {
    this.realNode = options.realNode;
  }
}

Node.prototype = Object.assign(new ClickTarget(), {

});


function Edge() {
  ClickTarget.apply(this, arguments);
}

Edge.prototype = Object.assign(new ClickTarget(), {

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
