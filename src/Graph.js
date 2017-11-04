var colors = require('./colors');
var utils = require('./utils');
var Logger = require('./Logger');
var LOG = new Logger('Graph');

function Graph(opts) {
  this.state = opts && opts.state;
  this.adapter = opts && opts.adapter;
  this.actionQueue = opts && opts.actionQueue;
  this.labelSet = opts && opts.labelSet;

  this.colorChoices = (opts && opts.colorChoices) || utils.startingAt(colors.RAINBOW, colors.INDIGO);
  this.nodeSize = opts && opts.nodeSize;
  this.edgeDistance = opts && opts.edgeDistance;
  this.initialNodes = (opts && opts.initialNodes) || [];
  this.initialEdges = (opts && opts.initialEdges) || [];
}

Graph.prototype = {
  initialize: function(opts) {
    this._validate();
    LOG.debug('initializing graph', this);

    this.adapter.initialize(
      opts.element,
      utils.optional({
        width: opts.width,
        height: opts.height,
        nodes: this.initialNodes.map((function(n) {
          return utils.optional({
            id: n.id,
            color: n.color || this.colorChoices[0],
            label: '',
            size: this.nodeSize,
          }, { force: ['id', 'label'] });
        }).bind(this)),
        edges: this.initialEdges,
        edgeDistance: this.edgeDistance,
      })
    );
    this.actionQueue.defer((function() {
      LOG.debug('initializing label set');
      this.labelSet.initialize(
        this.initialNodes.map((function(n) {
          return {
            node: this.adapter.getNode(n.id),
            label: n.label,
          };
        }).bind(this))
      );
    }).bind(this));
  },

  addNode: function() {
    var nodeId = this.state.persistNode({
      color: this.colorChoices[0],
    });
    var node = utils.optional({
      id: nodeId,
      color: this.colorChoices[0],
      label: '',
      size: this.nodeSize,
    }, { force: ['id', 'label'] });
    this.adapter.addNode(node);
  },

  changeColor: function(node) {
    var colorIndex = this._getNextColorIndex(node);
    var newColor = this.colorChoices[colorIndex];
    this.adapter.setNodeColor(node, newColor);
    this.state.persistNode({ id: node.id, color: newColor });
  },

  addEdge: function(source, target) {
    this.adapter.addEdge({
      source: source,
      target: target,
      distance: this.edgeDistance,
    });
    this.state.persistEdge(source.id, target.id);
  },

  reset: function() {
    this.adapter.performInBulk((function() {
      this.state.retrievePersistedNodes().forEach((function(node) {
        this.adapter.removeNode(node);
      }).bind(this));
    }).bind(this));

    this.state.reset();
    this.labelSet.closeAll();
  },

  _getNextColorIndex: function(node) {
    var colorIndex = this.colorChoices.indexOf(node.color);
    return (colorIndex + 1) % this.colorChoices.length;
  },

  _validate: function() {
    if (!this.state) {
      throw new Error('state is required');
    }
    if (!this.adapter) {
      throw new Error('adapter is required');
    }
    if (!this.actionQueue) {
      throw new Error('actionQueue is required');
    }
    if (!this.labelSet) {
      throw new Error('labelSet is required');
    }
  },
};

module.exports = Graph;
