var Animator = require('./Animator');
var ColorChangingGraph = require('./ColorChangingGraph');
var ComponentManager = require('./ComponentManager');
var DisallowedEditMode = require('./DisallowedEditMode');
var EditMode = require('./EditMode');
var Graph = require('./Graph');
var GraphComponent = require('./GraphComponent');
var GreulerAdapter = require('./GreulerAdapter');
var ImmutableGraph = require('./ImmutableGraph');
var NodeLabelSet = require('./NodeLabelSet');
var utils = require('./utils');

var Logger = require('./Logger');
var LOG = new Logger('graphfactory');

module.exports = {

  newImmutableGraph: function(opts) {
    LOG.debug('instantiating immmutable graph', opts);
    var actionQueue = utils.requireNonNull(opts.actionQueue);
    var state = utils.requireNonNull(opts.state);
    var adapter = utils.requireNonNull(opts.adapter);

    var labelSet = opts.labelSet || new NodeLabelSet({
      componentManager: opts.componentManager || this._newComponentManager(opts),
      state: state,
    });


    return new ImmutableGraph({
      state: state,
      adapter: adapter,
      actionQueue: actionQueue,
      labelSet: labelSet,
      initialNodes: opts.initialNodes,
      initialEdges: opts.initialEdges,
      nodeSize: opts.nodeSize,
      edgeDistance: opts.edgeDistance,
      colorChoices: opts.colorChoices,
    });
  },

  newColorChangingGraph: function(opts) {
    LOG.debug('instantiating color changing graph', opts);
    var actionQueue = utils.requireNonNull(opts.actionQueue);
    var state = utils.requireNonNull(opts.state);
    var adapter = utils.requireNonNull(opts.adapter);

    var labelSet = opts.labelSet || new NodeLabelSet({
      componentManager: opts.componentManager || this._newComponentManager(opts),
      state: state,
    });

    return new ColorChangingGraph({
      state: state,
      adapter: adapter,
      actionQueue: actionQueue,
      labelSet: labelSet,
      initialNodes: opts.initialNodes,
      initialEdges: opts.initialEdges,
      nodeSize: opts.nodeSize,
      edgeDistance: opts.edgeDistance,
      colorChoices: opts.colorChoices,
    });
  },

  newMutableGraph: function(opts) {
    LOG.debug('instantiating mutable graph', opts);
    var actionQueue = utils.requireNonNull(opts.actionQueue);
    var state = utils.requireNonNull(opts.state);
    var adapter = utils.requireNonNull(opts.adapter);

    var labelSet = opts.labelSet || new NodeLabelSet({
      componentManager: opts.componentManager || this._newComponentManager(opts),
      state: state,
    });

    return new Graph({
      state: state,
      adapter: adapter,
      actionQueue: actionQueue,
      labelSet: labelSet,
      initialNodes: opts.initialNodes,
      initialEdges: opts.initialEdges,
      nodeSize: opts.nodeSize,
      edgeDistance: opts.edgeDistance,
      colorChoices: opts.colorChoices,
    });
  },

  newGraph: function(opts) {
    if (opts.immutable) {
      return this.newImmutableGraph(opts);
    } else if (opts.onlyChangeColors) {
      return this.newColorChangingGraph(opts);
    } else {
      return this.newMutableGraph(opts);
    }
  },

  newGraphComponent: function(opts) {
    var actionQueue = utils.requireNonNull(opts.actionQueue);
    var adapter = utils.requireNonNull(opts.adapter);
    var state = utils.requireNonNull(opts.state);
    var componentManager = opts.componentManager = this._newComponentManager(opts);
    var labelSet = new NodeLabelSet({
      componentManager: componentManager,
      state: state,
    });

    var editMode;

    if (opts.immutable || opts.onlyChangeColors) {
      editMode = new DisallowedEditMode();
    } else {
      editMode = new EditMode({
        adapter: adapter,
        animator: new Animator({ actionQueue: actionQueue }),
        labelSet: labelSet,
        alternateInterval: opts.alternateInterval,
      });
    }


    return new GraphComponent(Object.assign({
      graph: this.newGraph(opts),
      adapter: adapter,
      editMode: editMode,
      width: opts.width,
      height: opts.height,
      nodeAreaFuzzFactor: opts.nodeAreaFuzzFactor,
    }, this._getComponentServices(opts)));
  },

  _newComponentManager: function(opts) {
    return new ComponentManager({
      actionQueue: utils.requireNonNull(opts.actionQueue),
      componentServices: this._getComponentServices(opts),
      document: utils.requireNonNull(opts.document),
    });
  },

  _getComponentServices: function(opts) {
    var actionQueue = utils.requireNonNull(opts.actionQueue);
    return { actionQueue: actionQueue };
  },
};
