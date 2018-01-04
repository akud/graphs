var colors = require('../colors');
var utils = require('../utils');
var Logger = require('../Logger');
var NodeCreator = require('./NodeCreator');
var EdgeCreator = require('./EdgeCreator');
var ColorChanger = require('./ColorChanger');
var TrackedObject = require('../TrackedObject');

var LOG = new Logger('Graph');

function Graph(opts) {
  TrackedObject.apply(this);
  this.state = opts && opts.state;
  this.adapter = opts && opts.adapter;
  this.actionQueue = opts && opts.actionQueue;
  this.labelSet = opts && opts.labelSet;
  this.nodeCreator = (opts && opts.nodeCreator) || new NodeCreator();
  this.edgeCreator = (opts && opts.edgeCreator) || new EdgeCreator();
  this.colorChanger = (opts && opts.colorChanger) || new ColorChanger();

  this.colorChoices = (opts && opts.colorChoices) || utils.startingAt(colors.RAINBOW, colors.INDIGO);
  this.nodeSize = opts && opts.nodeSize;
  this.edgeDistance = opts && opts.edgeDistance;
  this.initialNodes = (opts && opts.initialNodes) || [];
  this.initialEdges = (opts && opts.initialEdges) || [];
  this.nodeAreaFuzzFactor = (opts && opts.nodeAreaFuzzFactor) || 0;
  this.directed = !!(opts && opts.directed);
  this.constructorArgs = opts;
}

Graph.prototype = Object.assign(new TrackedObject(), {
  className: 'Graph',

  getConstructorArgs: function() {
    return Object.assign({
      initialNodes: this.state.retrievePersistedNodes(),
      initialEdges: this.state.retrievePersistedEdges(),
    }, this.constructorArgs);
  },

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
        edges: this.initialEdges.map((function(e) {
          return Object.assign({ directed: this.directed }, e);
        }).bind(this)),
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
            link: n.link,
          };
        }).bind(this))
      );
    }).bind(this));
  },

  addNode: function() {
    this.nodeCreator.addNode({
      state: this.state,
      adapter: this.adapter,
      color: this.colorChoices[0],
      nodeSize: this.nodeSize,
    });
  },

  changeColor: function(node) {
    var colorIndex = this._getNextColorIndex(node);
    var newColor = this.colorChoices[colorIndex];
    this.colorChanger.setColor({
      adapter: this.adapter,
      state: this.state,
      node: node,
      color: newColor,
    });
  },

  addEdge: function(source, target) {
    this.edgeCreator.addEdge({
      source: source,
      target: target,
      adapter: this.adapter,
      state: this.state,
      edgeDistance: this.edgeDistance,
      directed: this.directed,
    });
  },

  getNearestElement: function(point) {
    utils.requireNonNull(point, 'x');
    utils.requireNonNull(point, 'y');

    return this.adapter.getNearestElement({
      point: point,
      nodeAreaFuzzFactor: this.nodeAreaFuzzFactor,
    });
  },

  reset: function() {
    LOG.debug('resetting');
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
    if (!this.nodeCreator) {
      throw new Error('nodeCreator is required');
    }
    if (!this.edgeCreator) {
      throw new Error('edgeCreator is required');
    }
  },
});

module.exports = Graph;
