(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var greuler = global.greuler;
var GreulerAdapter = require('./src/GreulerAdapter');
var Graph = require('./src/Graph');
var Animator = require('./src/Animator');
var UrlState = require('./src/UrlState');

var horizontalPadding = 20;
var width = Math.floor(((window.innerWidth > 0) ? window.innerWidth : screen.width) - (2 * horizontalPadding));
var height = Math.floor(( 3/4 ) * ((window.innerHeight > 0) ? window.innerHeight : screen.height));
var nodeSize;

if (width < 700) {
  nodeSize = Math.floor(Math.min(width, height) * (1/15));
}

global.adapter = new GreulerAdapter(greuler);
global.graph = new Graph(
  {
    adapter: adapter,
    animator: new Animator(),
    state: new UrlState({
      baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname,
      setUrl: window.history.replaceState.bind(window.history, {}, ''),
      urlSearchParams: new URLSearchParams(window.location.search),
    }),
  },
  {
    width: width,
    height: height,
    nodeSize: nodeSize,
    nodeAreaFuzzFactor: 0.1,
    editModeAlternateInterval: 250,
  });

global.graph.attachTo(document.getElementById('main-graph'));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./src/Animator":2,"./src/Graph":4,"./src/GreulerAdapter":5,"./src/UrlState":7}],2:[function(require,module,exports){
(function (global){
function Animator(options) {
  this.setTimeout = (options && options.setTimeout) || global.setTimeout.bind(global);
}

Animator.prototype = {
  alternate: function() {
    return new AlternatingAnimation(this, Array.prototype.slice.call(arguments));
  },
};

function AlternatingAnimation(animator, functions) {
  this.animator = animator;
  this.functions = functions;
  this.currentIndex = 0;
  this.interval = 100;
  this.predicate = function() { return true; };
}

AlternatingAnimation.prototype = {
  every: function(interval) {
    this.interval = interval;
    return this;
  },

  asLongAs: function(predicate) {
    this.predicate = predicate;
    return this;
  },

  play: function() {
    var execute = (function() {
      if (this.predicate()) {
        this.functions[this.currentIndex]();
        this.currentIndex = (this.currentIndex + 1) % this.functions.length;
        this.animator.setTimeout(execute, this.interval);
      }
    }).bind(this);
    execute();
  },
};

module.exports = Animator;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
/**
 * Component constructor
 *
 * services - service objects
 * options - options for the component.
 *         - holdTime - amount of time to wait before triggering a "hold" event
 */
function Component(services, options) {
  this.setTimeout = (services && services.setTimeout) || global.setTimeout.bind(global);
  this.holdTime = (options && options.holdTime) || 250;

  this.mouseDownCount = 0;
  this.mouseUpCount = 0;
  this.isInClickAndHold = false;
}

Component.prototype = {
  handleClick: function() {},
  handleClickAndHold: function() {},


  attachTo: function(targetElement) {
    targetElement.addEventListener('mouseup', (function(event) {
      this.mouseUpCount++;
      if (this.isInClickAndHold) {
        this.isInClickAndHold = false;
      } else {
        this.handleClick(event);
      }
    }).bind(this));

    targetElement.addEventListener('mousedown', (function(event) {
      this.mouseDownCount++;
      var originalCount = this.mouseDownCount;

      this.setTimeout((function() {
        if (this.mouseDownCount === originalCount &&
            this.mouseUpCount === this.mouseDownCount - 1) {
          this.isInClickAndHold = true;
          this.handleClickAndHold(event);
        }
      }).bind(this), this.holdTime);
    }).bind(this));

    this.doAttach(targetElement);
  },

  /**
   * Sub-components should override to initialize on attachment
   */
  doAttach: function(element) {

  },
};

module.exports = Component;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
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
  this.state = (services && services.state);
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

  _checkServices: function() {
    if (!this.adapter) {
      throw new Error('adapter is not present');
    }
    if (!this.animator) {
      throw new Error('animator is not present');
    }
    if (!this.animator) {
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
});

module.exports = Graph;

},{"./Component":3,"./Logger":6,"./colors":8,"./utils":10}],5:[function(require,module,exports){
var graphelements = require('./graphelements');;
var utils = require('./utils');
var LOG = require('./Logger');


function GreulerAdapter(greuler) {
  this.greuler = greuler;
}


GreulerAdapter.prototype = {
  initialize: function(targetNode, options) {
    options = options || {};
    this.instance = this.greuler(utils.optional({
      target: '#' + targetNode.id,
      width: options.width,
      height: options.height,
      data: utils.optional({
        nodes: (options.nodes && options.nodes.map(this._translateNodeObj)),
        links: options.edges,
      }),
    })).update();
    this.graph = this.instance.graph;
  },

  addNode: function(node) {
    var result = this.graph.addNode(this._translateNodeObj(node));
    this.instance = this.instance.update();
  },

  addEdge: function(node1, node2) {
    var result = this.graph.addEdge({
      source: node1.id,
      target: node2.id
    });
    this.instance = this.instance.update();
  },

  setNodeColor: function(target, color) {
    if (target.domElement) {
      target.domElement.setAttribute('fill', color);
    } else if (target.id) {
      var node = this.graph.getNode({ id: target.id });
      this._getDomElement(node).setAttribute('fill', color);
    } else {
      LOG.error('Got unexpected target node', target);
    }
  },

  getClickTarget: function(event, nodeAreaFuzzFactor) {
    return this._getTargetNode(event, nodeAreaFuzzFactor) || graphelements.NONE;
  },

  getNodes: function(filter) {
    filter = filter || function() { return true; };
    return this.graph.getNodesByFn(filter).map((function(node) {
      var domElement = this._getDomElement(node);
      return new graphelements.Node({
        id: node.id,
        realNode: node,
        domElement: domElement,
        color: domElement.getAttribute('fill'),
      });
    }).bind(this));
  },

  _translateNodeObj: function(node) {
    return utils.optional({
      id: node.id,
      fill: node.color,
      label: node.label || '',
      r: node.size,
    }, { force: ['id', 'label'] });
  },

  _getDomElement: function(node) {
    return this.instance.nodeGroup[0][0]
      .childNodes[node.index]
      .getElementsByTagName('circle')[0];
  },

  _getTargetNode: function(event, nodeAreaFuzzFactor) {
    nodeAreaFuzzFactor = nodeAreaFuzzFactor || 0;
    var x = event.clientX;
    var y = event.clientY;
    var matchingNodes = this.getNodes(function(node) {
      var leftBound = node.x - (nodeAreaFuzzFactor * node.width);
      var rightBound = node.x + (( 1+ nodeAreaFuzzFactor) * node.width);
      var topBound = node.y - (nodeAreaFuzzFactor * node.height);
      var bottomBound = node.y + ((1 + nodeAreaFuzzFactor) * node.height);
      return leftBound <= x && x <= rightBound &&
             topBound <= y && y <= bottomBound;
    });

    if (matchingNodes && matchingNodes.length) {
      matchingNodes.sort(function(a, b) {
        var distanceToA = utils.distance(center(a.realNode), [x, y]);
        var distanceToB = utils.distance(center(b.realNode), [x, y]);
        return distanceToA - distanceToB;
      });
      return matchingNodes[0];
    } else {
      return undefined;
    }
  }
};


function center(node) {
    return [node.x + (node.width / 2), node.y + (node.height / 2)];
}

module.exports = GreulerAdapter;

},{"./Logger":6,"./graphelements":9,"./utils":10}],6:[function(require,module,exports){
(function (global){
function Logger() {

}

Logger.prototype = {
  debug: function(msg, objs) {
    this._log.apply(this, ['DEBUG'] + arguments);
  },
  warn: function(msg, objs) {
    this._log.apply(this, ['WARN'] + arguments);
  },
  error: function(msg, objs) {
    this._log.apply(this, ['ERROR'] + arguments);
  },

  _log: function(level, msg) {
    var objs = Array.prototype.splice.call(arguments, 1, arguments.length);
    global.console.log('[' + level + '] ' + msg);
    Array.prototype.forEach.call(objs, function(obj) { console.log(obj); });
  },
};


module.exports = new Logger();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
var utils = require('./utils');

NUM_NODES_PARAM = 'n'
COLOR_PARAM_PREFIX = 'c_';
EDGE_PARAM_PREFIX = 'e_';

function UrlState(options) {
  this.baseUrl = (options && options.baseUrl);
  this.setUrl = (options && options.setUrl);
  this.urlSearchParams = (options && options.urlSearchParams);
}

UrlState.prototype = {
  /**
   * Perist a node and return its id
   */
  persistNode: function(options) {
    var nodeId = this._getNumNodes();
    this.urlSearchParams.set(NUM_NODES_PARAM, nodeId + 1);
    this._persistState();
    if (options && options.color) {
      this.persistNodeColor(nodeId, options.color);
    }

    return nodeId;
  },

  persistNodeColor: function(nodeId, color) {
    var bit = this._idToBit(nodeId);

    this._getColorKeys().forEach((function(key) {
      if (this._isColor({ bit: bit, colorKey: key })) {
        this._removeColor({ bit: bit, colorKey: key });
      }
    }).bind(this));

    this._setColor({ bit: bit, color: color });
    this._persistState();
  },

  persistEdge: function(sourceId, targetId) {
    var param = EDGE_PARAM_PREFIX + sourceId;
    var bitmask;
    if (this.urlSearchParams.has(param)) {
      bitmask = this._getBitmaskParam(param) | this._idToBit(targetId);
    } else {
      bitmask = this._idToBit(targetId);
    }
    this._setBitmaskParam(param, bitmask);
    this._persistState();
  },

  retrievePersistedNodes: function() {
    var nodes = [];
    if (this.urlSearchParams.has(NUM_NODES_PARAM)) {
      var colorParams = this._getColorKeys();
      for (var i = 0 ; i < this.urlSearchParams.get(NUM_NODES_PARAM); i++) {
        var nodeBit = this._idToBit(i);
        var nodeColor = colorParams.find((function(param) {
          return this._isColor({ bit: nodeBit, colorKey: param });
        }).bind(this));
        nodes.push(utils.optional({
          id: i,
          color: (nodeColor && nodeColor.replace(COLOR_PARAM_PREFIX, '#')),
        }, { force: 'id' }));
      }
    }
    return nodes;
  },

  retrievePersistedEdges: function() {
    return this._getEdgeKeys().map((function(key) {
      var sourceId = parseInt(key.replace(EDGE_PARAM_PREFIX, ''));
      var edges = [];
      var bitmask = this._getBitmaskParam(key);
      var maxId = bitmask.toString(2).length;
      for (var targetId = 0; targetId < maxId; targetId++) {
        var bit = this._idToBit(targetId);
        if ((bitmask & bit) === bit) {
          edges.push({ source: sourceId, target: targetId });
        }
      }
      return edges;
    }).bind(this))
    .reduce(function(a, b) { return a.concat(b); }, []);
  },

  getUrl: function() {
    return this.baseUrl + '?' + this.urlSearchParams.toString();
  },

  _isColor: function(options) {
    options = this._normalizeColorOptions(options);

    if (this.urlSearchParams.has(options.colorKey)) {
      return (this._getBitmaskParam(options.colorKey) & options.bit) === options.bit;
    } else {
      return false;
    }
  },

  _setColor: function(options) {
    options = this._normalizeColorOptions(options);
    var bitmask;

    if (this.urlSearchParams.has(options.colorKey)) {
      bitmask = this._getBitmaskParam(options.colorKey) | options.bit;
    } else {
      bitmask = options.bit;
    }
    this._setBitmaskParam(options.colorKey, bitmask);
  },

  _removeColor: function(options) {
    options = this._normalizeColorOptions(options);
    if (!this.urlSearchParams.has(options.colorKey)) {
      throw Error('Attempted to remove color ' + options.colorKey);
    }
    var bitmask = this._getBitmaskParam(options.colorKey) & (~options.bit);
    if (bitmask === 0) {
      this.urlSearchParams.delete(options.colorKey);
    } else {
      this._setBitmaskParam(options.colorKey, bitmask);
    }
  },

  _getBitmaskParam: function(key) {
    return parseInt(this.urlSearchParams.get(key), 16);
  },

  _setBitmaskParam: function(key, value) {
    this.urlSearchParams.set(key, value.toString(16));
  },

  _idToBit: function(id) {
    if (id <= 30) {
      return 1 << id;
    } else {
      return Math.pow(2, id);
    }
  },

  _normalizeColorOptions: function(options) {
    if (!options.hasOwnProperty('bit') && !options.hasOwnProperty('nodeId')) {
      throw Error('bit or nodeId is required');
    }
    if (!options.hasOwnProperty('color') && !options.hasOwnProperty('colorKey')) {
      throw Error('color or colorKey is required');
    }
    var bit = options.hasOwnProperty('bit')
      ? options.bit
      : this._idToBit(options.nodeId);
    var colorKey = options.hasOwnProperty('colorKey')
      ? options.colorKey
      : options.color.replace('#', COLOR_PARAM_PREFIX);
    return { bit: bit, colorKey: colorKey };
  },

  _getColorKeys: function() {
    return this._getKeys(function(k) {
      return k.startsWith(COLOR_PARAM_PREFIX);
    });
  },

  _getEdgeKeys: function() {
    return this._getKeys(function(k) {
      return k.startsWith(EDGE_PARAM_PREFIX);
    });
  },

  _getKeys: function(predicate) {
    var keys = [];
    var iterator = this.urlSearchParams.keys();
    var next = iterator.next();
    while (!next.done) {
      if (predicate(next.value)) {
        keys.push(next.value);
      }
      next = iterator.next();
    }
    return keys;
  },

  _getNumNodes: function() {
    if (this.urlSearchParams.has(NUM_NODES_PARAM)) {
      return parseInt(this.urlSearchParams.get(NUM_NODES_PARAM));
    } else {
      return 0;
    }
  },

  _persistState: function() {
    this.setUrl(this.getUrl());
  },
};

module.exports = UrlState;

},{"./utils":10}],8:[function(require,module,exports){
module.exports = {
  RED: '#db190f',
  ORANGE: '#f76402',
  YELLOW: '#fbff14',
  GREEN: '#28b92b',
  BLUE: '#2826b5',
  INDIGO: '#2980B9',
  VIOLET: '#8c28b7',
  NEON: '#00FF00',
};

},{}],9:[function(require,module,exports){
function GraphElement(options) {
  if (options) {
    this.id = options.id;
    this.domElement = options.domElement;
  }
}

GraphElement.prototype = {
  isNode: function() {
    return false;
  },
  isEdge: function() {
    return false;
  },
};

function Node(options) {
  GraphElement.apply(this, arguments);
  if (options) {
    this.realNode = options.realNode;
    this.color = options.color;
  }
}

Node.prototype = Object.assign(new GraphElement(), {
  isNode: function() { return true; },
});


function Edge() {
  GraphElement.apply(this, arguments);
}

Edge.prototype = Object.assign(new GraphElement(), {
  isEdge: function() { return true; },
});

function None() {
  GraphElement.apply(this, arguments);
}

None.prototype = Object.assign(new GraphElement(), {

});

module.exports = {
  Node: Node,
  Edge: Edge,
  NONE: new None(),
};

},{}],10:[function(require,module,exports){
/**
 * Compute the cartesian distance between two vectors
 */
function distance(vec1, vec2) {
  if (vec1.length != vec2.length) {
    throw new Error(vec1.length + ' != ' + vec2.length);
  }
  return Math.sqrt(
    vec1
      .map(function(x, i) { return x - vec2[i]; })
      .map(function(x) { return x * x; })
      .reduce(function(a, b) { return a + b; })
  );
}

/**
 * Construct an object that has all the key-values for which values
 * are present in the input.
 */
function optional(keyValuePairs, options) {
  var obj = {};
  Object.keys(keyValuePairs).forEach(function(key) {
    if (keyValuePairs[key]) {
      obj[key] = keyValuePairs[key];
    }
  });
  if (options && options.force) {
    if (options.force.constructor === Array) {
      options.force.forEach(function(key) {
        obj[key] = keyValuePairs[key];
      });
    } else {
      obj[options.force] = keyValuePairs[options.force];
    }
  }
  return obj;
}

module.exports = {
  distance: distance,
  optional: optional,
};

},{}]},{},[1])
//# sourceMappingURL=bundle.map.js
