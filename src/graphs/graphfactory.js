
var GreulerAdapter = require('./GreulerAdapter');
var ColorChanger = require('./ColorChanger');
var EdgeCreator = require('./EdgeCreator');
var NodeCreator = require('./NodeCreator');
var NoOpColorChanger = require('./NoOpColorChanger');
var NoOpEdgeCreator = require('./NoOpEdgeCreator');
var NoOpNodeCreator = require('./NoOpNodeCreator');
var Graph = require('./Graph');

var DisallowedEditMode = require('../modes/DisallowedEditMode');
var EditMode = require('../modes/EditMode');
var NonAnimatingEditMode = require('../modes/NonAnimatingEditMode');

var EmptyLabelSet = require('../labels/EmptyLabelSet');
var NodeLabelSet = require('../labels/NodeLabelSet');

var GraphComponent = require('../components/GraphComponent');

var Animator = require('../Animator');
var ComponentManager = require('../ComponentManager');
var utils = require('../utils');
var Logger = require('../Logger');

var LOG = new Logger('graphfactory');

module.exports = {
  newGraph: function(opts) {
    opts = Object.assign({
      immutable: false,
      allowAddNodes: true,
      allowAddEdges: true,
      allowChangeColors: true,
      allowLabels: true,
    }, opts);
    LOG.debug('instantiating graph', opts);


    return new Graph({
      actionQueue: utils.requireNonNull(opts.actionQueue),
      adapter: utils.requireNonNull(opts.adapter),
      colorChoices: opts.colorChoices,
      colorChanger: this._getColorChanger(opts),
      edgeCreator: this._getEdgeCreator(opts),
      edgeDistance: opts.edgeDistance,
      initialNodes: opts.initialNodes,
      initialEdges: opts.initialEdges,
      labelSet: this._getLabelSet(opts),
      nodeCreator: this._getNodeCreator(opts),
      nodeSize: opts.nodeSize,
      state: utils.requireNonNull(opts.state),
    });
  },

  newGraphComponent: function(opts) {
    opts = Object.assign({
      immutable: false,
      allowAddNodes: true,
      allowAddEdges: true,
      allowChangeColors: true,
      allowLabels: true,
      allowEdit: true,
    }, opts);
    LOG.debug('instantiating graph component', opts);

    var labelSet = this._getLabelSet(opts);

    return new GraphComponent(Object.assign({
      graph: this.newGraph(Object.assign({ labelSet: labelSet }, opts)),
      adapter: utils.requireNonNull(opts.adapter),
      editMode: this._getEditMode(opts, labelSet),
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

  _getColorChanger: function(opts) {
    if (opts.immutable || !opts.allowChangeColors) {
      return new NoOpColorChanger();
    } else {
      return new ColorChanger();
    }
  },

  _getEdgeCreator: function(opts) {
    if (opts.immutable || !opts.allowAddEdges) {
      return new NoOpEdgeCreator();
    } else {
      return new EdgeCreator();
    }
  },

  _getNodeCreator: function(opts) {
    if (opts.immutable || !opts.allowAddNodes) {
      return new NoOpNodeCreator();
    } else {
      return new NodeCreator();
    }
  },

  _getEditMode: function(opts, labelSet) {
    if (opts.immutable || !opts.allowEdit) {
      return new DisallowedEditMode();
    } else if (!opts.allowAddEdges) {
      return new NonAnimatingEditMode({
        adapter: utils.requireNonNull(opts.adapter),
        labelSet: labelSet,
        alternateInterval: opts.alternateInterval,
      });
    } else {
      return new EditMode({
        adapter: utils.requireNonNull(opts.adapter),
        animator: new Animator({ actionQueue: utils.requireNonNull(opts.actionQueue) }),
        labelSet: labelSet,
        alternateInterval: opts.alternateInterval,
      });
    }
  },

  _getLabelSet: function(opts) {
    if (!opts.allowLabels) {
      return new EmptyLabelSet();
    } else {
      return new NodeLabelSet({
        componentManager: opts.componentManager || this._newComponentManager(opts),
        state: opts.state,
      });
    }
  },
};
