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
  this.adapter = (services && services.adapter);
  this.animator = (services && services.animator);
  this.nodes = [];
  this.colors = {};
  this.width = (options && options.width);
  this.height = (options && options.height);
  this.nodeSize = (options && options.nodeSize);
  this.nodeAreaFuzzFactor = (options && options.nodeAreaFuzzFactor);
  this.editModeAlternateInterval = (options && options.editModeAlternateInterval) || 100;

  this.currentlyEditedNode = null;
  this.editModeOtherNodes = [];
  this.editModeOriginalColors = {};
}


Graph.prototype = Object.assign(new Component(), {
  doAttach: function(targetElement) {
    this._checkServices();
    this.adapter.initialize(
      targetElement,
      utils.optional({ width: this.width, height: this.height })
    );
  },

  handleClick: function(event) {
    var clickTarget = this.adapter.getClickTarget(
      event, this.nodeAreaFuzzFactor
    );

    if (this._isInEditMode()) {
      if (clickTarget.isNode() &&
          clickTarget.id !== this.currentlyEditedNode.id) {
        this.adapter.addEdge(this.currentlyEditedNode, clickTarget);
      }
      this._exitEditMode();
    } else {
      if (clickTarget.isNode()) {
        this._setNextColor(clickTarget);
      } else {
        this._createNode();
      }
    }
  },

  handleClickAndHold: function(event) {
    if (!this._isInEditMode()) {
      var clickTarget = this.adapter.getClickTarget(
        event, this.nodeAreaFuzzFactor
      );
      if (clickTarget.isNode()) {
        this._enterEditMode(clickTarget);
      }
    }
  },

  _setNextColor: function(node) {
    var colorIndex = this._getNextColorIndex(node.id);
    this.adapter.setNodeColor(node, COLOR_ORDER[colorIndex]);
    this.colors[node.id] = colorIndex;
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

  _isInEditMode: function() {
    return !!this.currentlyEditedNode;
  },

  _enterEditMode: function(node) {
    if (!this.animator) {
      throw new Error('adapter is not present');
    }
    this.currentlyEditedNode = node;

    this.editModeOtherNodes = this.adapter.getNodes(function(n) {
      return n.id !== node.id;
    });

    this.animator
      .alternate(
        this._setNeon.bind(this),
        this._setOriginalColor.bind(this)
      )
      .every(this.editModeAlternateInterval)
      .asLongAs(this._isInEditMode.bind(this))
      .play();
  },

  _exitEditMode: function() {
    this.currentlyEditedNode = null;
    this._setOriginalColor();
    this.editModeOriginalColors = {};
  },

  _checkServices: function() {
    if (!this.adapter) {
      throw new Error('adapter is not present');
    }
    if (!this.animator) {
      throw new Error('animator is not present');
    }
  },

  _setNeon: function() {
    this.editModeOtherNodes.forEach((function(n) {
      if (!this.editModeOriginalColors[n.id]) {
        this.editModeOriginalColors[n.id] = n.color;
      }
      this.adapter.setNodeColor(n, colors.NEON);
    }).bind(this));
  },

  _setOriginalColor: function() {
    this.editModeOtherNodes.forEach((function(n) {
      if (this.editModeOriginalColors[n.id]) {
        this.adapter.setNodeColor(n, this.editModeOriginalColors[n.id]);
      }
    }).bind(this));
  },
});

module.exports = Graph;
