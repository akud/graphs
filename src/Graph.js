var Component = require('./Component');
var colors = require('./colors');
var utils = require('./utils');
var LOG = require('./Logger');

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
  this.width = (options && options.width);
  this.height = (options && options.height);
  this.nodeSize = (options && options.nodeSize);
}


Graph.prototype = Object.assign(new Component(), {
  doAttach: function(targetElement) {
    this.adapter.initialize(
      targetElement,
      utils.optional({ width: this.width, height: this.height })
    );
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

  handleDrag: function(event) {
    LOG.debug('drag', event);
  },

  _createNode: function() {
    var node = utils.optional({
      id: this.nodes.length,
      color: COLOR_ORDER[0],
      label: '',
      size: this.nodeSize,
    }, { force: ['id', 'label'] });
    this.nodes.push(node);
    this.adapter.addNode(node);
  },

  _getNextColorIndex: function(nodeId) {
    var colorIndex = this.colors[nodeId] || 0;
    return (colorIndex + 1) % COLOR_ORDER.length;
  },
});

module.exports = Graph;
