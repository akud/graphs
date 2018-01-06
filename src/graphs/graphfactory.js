
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

var SMALL_SCREEN_THRESHOLD = 1000;

module.exports = {
  newGraph: function(opts) {
    opts = Object.assign({
      immutable: false,
      allowAddNodes: true,
      allowAddEdges: true,
      allowChangeColors: true,
      allowLabels: true,
      directed: false,
      nodeAreaFuzzFactor: 0.1,
    }, opts);
    LOG.debug('instantiating graph', opts);


    return new Graph({
      actionQueue: utils.requireNonNull(opts, 'actionQueue'),
      adapter: utils.requireNonNull(opts, 'adapter'),
      colorChoices: opts.colorChoices,
      colorChanger: this._getColorChanger(opts),
      edgeCreator: this._getEdgeCreator(opts),
      edgeDistance: opts.edgeDistance,
      initialNodes: opts.initialNodes,
      initialEdges: opts.initialEdges,
      labelSet: opts.labelSet || this._getLabelSet(opts),
      nodeAreaFuzzFactor: opts.nodeAreaFuzzFactor,
      nodeCreator: this._getNodeCreator(opts),
      nodeSize: opts.nodeSize,
      state: utils.requireNonNull(opts, 'state'),
      directed: opts.directed,
    });
  },

  /**
   * document: global.document,
   * screen: global.screen,
   * window: window,
   * size: 'fullscreen'|'large'|'wide'|'small'|undefined
   * adapter: new GreulerAdapter({ greuler: global.greuler }),
   * actionQueue: actionQueue,
   * state: state,
   * nodeAreaFuzzFactor: 0.1,
   * alternateInterval: 250,
   * immutable: boolean,
   * allowAddNodes: boolean,
   * allowAddEdges: boolean,
   * allowChangeColors: boolean,
   * allowEdit: boolean,
   * allowLabels: boolean,
   * colorChoices: Array<String>
   * directed: boolean
   * initialNodes: Array<Node>
   * initialEdges: Array<Edge>
   */
  newGraphComponent: function(opts) {
    opts = Object.assign({
      immutable: false,
      allowAddNodes: true,
      allowAddEdges: true,
      allowChangeColors: true,
      allowLabels: true,
      allowEdit: true,
      nodeAreaFuzzFactor: 0.1,
      alternateInterval: 250,
      size: 'large',
      directed: false,
    }, opts);
    LOG.debug('instantiating graph component', opts);
    var sizing = this._getSizing(opts);

    var labelSet = this._getLabelSet(opts);

    return new GraphComponent(Object.assign({
        graph: this.newGraph(Object.assign({
          labelSet: labelSet,
          nodeSize: sizing.nodeSize,
          edgeDistance: sizing.edgeDistance,
        }, opts)),
        editMode: this._getEditMode(opts, labelSet),
        width: sizing.width,
        height: sizing.height,
      },
      this._getComponentServices(opts)
    ));
  },

  _newComponentManager: function(opts) {
    return new ComponentManager({
      actionQueue: utils.requireNonNull(opts, 'actionQueue'),
      componentServices: this._getComponentServices(opts),
      document: utils.requireNonNull(opts, 'document'),
    });
  },

  _getComponentServices: function(opts) {
    var actionQueue = utils.requireNonNull(opts, 'actionQueue');
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
        adapter: utils.requireNonNull(opts, 'adapter'),
        labelSet: labelSet,
        alternateInterval: opts.alternateInterval,
      });
    } else {
      return new EditMode({
        adapter: utils.requireNonNull(opts, 'adapter'),
        animator: new Animator({ actionQueue: utils.requireNonNull(opts, 'actionQueue') }),
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

  _getSizing: function(opts) {
    var customSize = opts.width && opts.height;
    if (!customSize && opts.size == 'fullscreen') {
      return this._getFullScreenSizing(opts);
    } else if (!customSize && opts.size === 'large') {
      return this._getLargeSizing(opts);
    } else if (!customSize && opts.size === 'wide') {
      return this._getWideSizing(opts);
    } else if (!customSize && opts.size === 'small') {
      return this._getSmallSizing(opts);
    } else {
      return {
        width: utils.requireNonNull(opts, 'width'),
        height: utils.requireNonNull(opts, 'height'),
        nodeSize: opts.nodeSize || 10,
        edgeDistance: opts.edgeDistance || 100,
      };
    }
  },

  _getFullScreenSizing: function(opts) {
    var window = utils.requireNonNull(opts, 'window');
    var screen = utils.requireNonNull(opts, 'screen');
    var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    var screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    return {
      width: screenWidth - 10,
      height: screenHeight - 10,
      nodeSize: this._getNodeSize(screenWidth, screenHeight),
      edgeDistance: this._getEdgeDistance(screenWidth),
    };
  },

  _getLargeSizing: function(opts) {
    var window = utils.requireNonNull(opts, 'window');
    var screen = utils.requireNonNull(opts, 'screen');
    var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    var screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    var width = screenWidth > SMALL_SCREEN_THRESHOLD ? 700 : 300;
    return {
      width: width,
      height: opts.height || width,
      nodeSize: this._getNodeSize(screenWidth, screenHeight),
      edgeDistance: this._getEdgeDistance(screenWidth),
    };
  },

  _getWideSizing: function(opts) {
    var window = utils.requireNonNull(opts, 'window');
    var screen = utils.requireNonNull(opts, 'screen');
    var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    var screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    var width = screenWidth < 1200 ? screenWidth : 1200;
    return {
      width: width,
      height: opts.height || width / 2,
      nodeSize: this._getNodeSize(screenWidth, screenHeight),
      edgeDistance: this._getEdgeDistance(screenWidth),
    };
  },


  _getSmallSizing: function(opts) {
    var window = utils.requireNonNull(opts, 'window');
    var screen = utils.requireNonNull(opts, 'screen');
    var screenWidth = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    var screenHeight = (window.innerHeight > 0) ? window.innerHeight : screen.height;
    return {
      width: 300,
      height: opts.height || 500,
      nodeSize: this._getNodeSize(screenWidth, screenHeight),
      edgeDistance: this._getEdgeDistance(screenWidth),
    };
  },

  _getNodeSize: function(screenWidth, screenHeight) {
    return screenWidth > SMALL_SCREEN_THRESHOLD ? 10 : (Math.min(screenWidth, screenHeight) / 20);
  },

  _getEdgeDistance: function(screenWidth) {
    return screenWidth > SMALL_SCREEN_THRESHOLD ? 100 : 250;
  },
};
