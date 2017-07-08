function GreulerAdapter(greuler) {
  this.greuler = greuler;
}


GreulerAdapter.prototype = {
  initialize: function(targetNode) {
    this.instance = this.greuler({
      target: '#' + targetNode.id,
    }).update();
  },

  addNode: function(node) {
    this.instance.graph.addNode(node);
    this.instance.update();
  },
};

module.exports = GreulerAdapter;
