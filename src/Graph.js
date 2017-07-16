var Component = require('./Component');

var RED = '#db190f';
var ORANGE = '#f76402';
var YELLOW = '#fbff14';
var GREEN = '#28b92b';
var BLUE = '#2826b5';
var INDIGO = '#2980B9';
var VIOLET = '#8c28b7';

var COLORS = [
  INDIGO,
  VIOLET,
  RED,
  ORANGE,
  YELLOW,
  GREEN,
  BLUE,
];

function Graph(adapter) {
  Component.apply(this);
  this.adapter = adapter;
  this.nodes = [];
  this.colors = {};
}


Graph.prototype = Object.assign(new Component(), {
  attachTo: function(targetElement) {
    this.adapter.initialize(targetElement);
    targetElement.addEventListener('click', this.handleClick.bind(this));
  },

  handleClick: function(event) {
    var clickTarget = this.adapter.getClickTarget(event);
    if (clickTarget.isNode()) {
      var colorIndex = this._getNextColorIndex(clickTarget.id);
      this.adapter.setNodeColor(clickTarget, COLORS[colorIndex]);
      this.colors[clickTarget.id] = colorIndex;
    } else {
      this._createNode();
    }
  },

  _createNode: function() {
    var node = {
      id: this.nodes.length,
      fill: COLORS[0],
      label: '',
    };
    this.nodes.push(node);
    this.adapter.addNode(node);
  },

  _getNextColorIndex: function(nodeId) {
    var colorIndex = this.colors[nodeId] || 0;
    return (colorIndex + 1) % COLORS.length;
  },
});

module.exports = Graph;
