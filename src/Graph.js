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

function Graph(options) {
  Component.apply(this, arguments);
  if (options) {
    this.adapter = options.adapter;
    this.animator = options.animator;
    this.state = options.state;
    this.width = options.width;
    this.height = options.height;
    this.nodeSize = options.nodeSize;
    this.nodeAreaFuzzFactor = options.nodeAreaFuzzFactor;
    this.editModeAlternateInterval = options.editModeAlternateInterval || 100;
  }
  this._setInitialState();
}


Graph.prototype = Object.assign(new Component(), {
  doAttach: function(targetElement) {
    this.adapter.initialize(
      targetElement,
      utils.optional({
        width: this.width,
        height: this.height,
        nodes: this.state.retrievePersistedNodes().map((function(n) {
          return utils.optional({
            id: n.id,
            color: n.color || COLOR_ORDER[0],
            label: '',
            size: this.nodeSize,
          }, { force: ['id', 'label'] });
        }).bind(this)),
        edges: this.state.retrievePersistedEdges(),
      })
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
        this.state.persistEdge(this.currentlyEditedNode.id, clickTarget.id);
      } else {
        this._exitEditMode();
      }
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

  reset: function() {
    this.adapter.performInBulk((function() {
      this.state.retrievePersistedNodes().forEach((function(node) {
        this.adapter.removeNode(node);
      }).bind(this));

      this.state.retrievePersistedNodes().forEach((function(node) {
        this.adapter.removeNode(node);
      }).bind(this));

    }).bind(this));

    this._setInitialState();
    this.state.reset();
  },

  _setNextColor: function(node) {
    var colorIndex = this._getNextColorIndex(node.id);
    var newColor = COLOR_ORDER[colorIndex];
    this.adapter.setNodeColor(node, newColor);
    this.colors[node.id] = colorIndex;
    this.state.persistNodeColor(node.id, newColor);
  },

  _createNode: function() {
    var nodeId = this.state.persistNode({
      color: COLOR_ORDER[0],
    });
    var node = utils.optional({
      id: nodeId,
      color: COLOR_ORDER[0],
      label: '',
      size: this.nodeSize,
    }, { force: ['id', 'label'] });
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

  _validateOptions: function() {
    Component.prototype._validateOptions.call(this, arguments);
    if (!this.adapter) {
      throw new Error('adapter is not present');
    }
    if (!this.animator) {
      throw new Error('animator is not present');
    }
    if (!this.state) {
      throw new Error('state is not present');
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

  _setInitialState: function() {
    this.colors = {};
    this.currentlyEditedNode = null;
    this.editModeOtherNodes = [];
    this.editModeOriginalColors = {};
  },
});

module.exports = Graph;
