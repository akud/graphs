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
    this.labelSet = options.labelSet;
    this.editMode = options.editMode;
    this.state = options.state;
    this.width = options.width;
    this.height = options.height;
    this.nodeSize = options.nodeSize;
    this.edgeDistance = options.edgeDistance;
    this.nodeAreaFuzzFactor = options.nodeAreaFuzzFactor;
  }
  this._setInitialState();
}


Graph.prototype = Object.assign(new Component(), {
  doAttach: function(targetElement) {
    var persistedNodes = this.state.retrievePersistedNodes();
    this.adapter.initialize(
      targetElement,
      utils.optional({
        width: this.width,
        height: this.height,
        nodes: persistedNodes.map((function(n) {
          return utils.optional({
            id: n.id,
            color: n.color || COLOR_ORDER[0],
            label: '',
            size: this.nodeSize,
          }, { force: ['id', 'label'] });
        }).bind(this)),
        edges: this.state.retrievePersistedEdges(),
        edgeDistance: this.edgeDistance,
      })
    );
    var labelSetData = persistedNodes.map((function(n) {
      return {
        node: this.adapter.getNode(n.id),
        label: n.label,
      };
    }).bind(this));
    this.labelSet.initialize(labelSetData);
  },

  handleClick: function(event) {
    var clickTarget = this.adapter.getClickTarget(
      event, this.nodeAreaFuzzFactor
    );

    this.editMode.perform({
      ifActive: (function(currentlyEditedNode) {
        if (clickTarget.isNode() && clickTarget.id !== currentlyEditedNode.id) {
           this.adapter.addEdge({
            source: currentlyEditedNode,
            target: clickTarget,
            distance: this.edgeDistance,
          });
          this.state.persistEdge(currentlyEditedNode.id, clickTarget.id);
        } else {
          this.editMode.deactivate();
        }
      }).bind(this),

      ifNotActive: (function() {
        if (clickTarget.isNode()) {
          this._setNextColor(clickTarget);
        } else {
          this._createNode();
        }
      }).bind(this)
    });
  },

  handleClickAndHold: function(event) {
    var clickTarget = this.adapter.getClickTarget(
      event, this.nodeAreaFuzzFactor
    );
    if (clickTarget.isNode()) {
      this.editMode.activate(clickTarget);
    }
  },

  reset: function() {
    this.adapter.performInBulk((function() {
      this.state.retrievePersistedNodes().forEach((function(node) {
        this.adapter.removeNode(node);
      }).bind(this));

    }).bind(this));

    this._setInitialState();
    this.state.reset();
    this.editMode.deactivate();
    this.labelSet.closeAll();
  },

  _setNextColor: function(node) {
    var colorIndex = this._getNextColorIndex(node.id);
    var newColor = COLOR_ORDER[colorIndex];
    this.adapter.setNodeColor(node, newColor);
    this.colors[node.id] = colorIndex;
    this.state.persistNode({ id: node.id, color: newColor });
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

  _validateOptions: function() {
    Component.prototype._validateOptions.call(this, arguments);
    if (!this.adapter) {
      throw new Error('adapter is not present');
    }
    if (!this.editMode) {
      throw new Error('edit mode is not present');
    }
    if (!this.state) {
      throw new Error('state is not present');
    }
    if (!this.labelSet) {
      throw new Error('labelSet is not present');
    }
  },

  _setInitialState: function() {
    this.colors = {};
  },
});

module.exports = Graph;
