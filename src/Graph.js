var Component = require('./Component');

function Graph(adapter) {
  Component.apply(this);
  this.adapter = adapter;
  this.nodes = [];
}


Graph.prototype = Object.assign(new Component(), {
  attachTo: function(targetElement) {
    this.adapter.initialize(targetElement);
    targetElement.addEventListener('click', this.handleClick.bind(this));
  },
  handleClick: function(event) {
    console.log({x: event.clientX, y: event.clientY });
    if (this.nodes.length < 5) {
      var node = {
        id: this.nodes.length,
        label: '',
      };
      this.nodes.push(node);
      this.adapter.addNode(node);
    }
  }
});

module.exports = Graph;
