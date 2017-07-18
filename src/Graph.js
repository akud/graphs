var Component = require('./Component');
var colors = require('./colors');

var COLOR_ORDER = [
  colors.INDIGO,
  colors.VIOLET,
  colors.RED,
  colors.ORANGE,
  colors.YELLOW,
  colors.GREEN,
  colors.BLUE,
];

function Graph(services, options) {
  Component.apply(this, arguments);
  this.adapter = services.adapter;
  this.nodes = [];
  this.colors = {};
  this.width = (options && options.width) || 750;
  this.height = (options && options.height) || 750;
}


Graph.prototype = Object.assign(new Component(), {
  attachTo: function(targetElement) {
    this.adapter.initialize(
      targetElement,
      { width: this.width, height: this.height }
    );
    targetElement.addEventListener('click', this.handleClick.bind(this));
  },

  handleClick: function(event) {
    var clickTarget = this.adapter.getClickTarget(event);
    if (clickTarget.isNode()) {
      var colorIndex = this._getNextColorIndex(clickTarget.id);
      this.adapter.setNodeColor(clickTarget, COLOR_ORDER[colorIndex]);
      this.colors[clickTarget.id] = colorIndex;
    } else {
      this._createNode();
    }
  },

  _createNode: function() {
    var node = {
      id: this.nodes.length,
      fill: COLOR_ORDER[0],
      label: '',
    };
    this.nodes.push(node);
    this.adapter.addNode(node);
  },

  _getNextColorIndex: function(nodeId) {
    var colorIndex = this.colors[nodeId] || 0;
    return (colorIndex + 1) % COLOR_ORDER.length;
  },
});

module.exports = Graph;
