(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var greuler = global.greuler;
var GreulerAdapter = require('./src/GreulerAdapter');
var Graph = require('./src/Graph');
var Animator = require('./src/Animator');
var UrlState = require('./src/UrlState');
var ActionQueue = require('./src/ActionQueue');
var ResetButton = require('./src/ResetButton');
var EditMode = require('./src/EditMode');
var NodeLabelSet = require('./src/NodeLabelSet');
var ComponentManager = require('./src/ComponentManager');

require('./src/Logger').level = global.logLevel;

global.adapter = new GreulerAdapter(greuler);

var actionQueue = new ActionQueue();
var componentServices = {
  actionQueue: actionQueue,
};
var componentManager = new ComponentManager({
  actionQueue: actionQueue,
  componentServices: componentServices,
  document: document,
});

var state = new UrlState({
  baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname,
  setUrl: window.history.replaceState.bind(window.history, {}, ''),
  urlSearchParams: new URLSearchParams(window.location.search),
});

var labelSet = new NodeLabelSet({
  componentManager: componentManager,
  state: state,
});

var editMode = new EditMode({
  adapter: adapter,
  animator: new Animator({ actionQueue: actionQueue }),
  labelSet: labelSet,
  alternateInterval: 250,
});

var horizontalPadding = 20;
var width = Math.floor(((window.innerWidth > 0) ? window.innerWidth : screen.width) - (2 * horizontalPadding));
var height = Math.floor(( 3/4 ) * ((window.innerHeight > 0) ? window.innerHeight : screen.height));
var nodeSize;
var edgeDistance;

if (width < 1000) {
  nodeSize = Math.floor(Math.min(width, height) * (1/18));
  edgeDistance = 200;
}


global.graph = new Graph(Object.assign(
  {
    adapter: adapter,
    editMode: editMode,
    labelSet: labelSet,
    state: state,
    width: width,
    height: height,
    nodeSize: nodeSize,
    edgeDistance: edgeDistance,
    nodeAreaFuzzFactor: 0.1,
  },
  componentServices
));

global.resetButton = new ResetButton({
  actionQueue: actionQueue,
  resettables: [
    global.graph,
  ],
});

global.graph.attachTo(document.getElementById('main-graph'));
global.resetButton.attachTo(document.getElementById('reset-button'));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./src/ActionQueue":2,"./src/Animator":3,"./src/ComponentManager":7,"./src/EditMode":8,"./src/Graph":10,"./src/GreulerAdapter":11,"./src/Logger":12,"./src/NodeLabelSet":14,"./src/ResetButton":16,"./src/UrlState":18}],2:[function(require,module,exports){
(function (global){
function ActionQueue(options) {
  this.setTimeout = (options && options.setTimeout) || global.setTimeout.bind(global);
  this.clearTimeout = (options && options.clearTimeout) || global.clearTimeout.bind(global);
  this.actionInterval = (options && options.actionInterval) || 10;
  this.periodicActions = [];
  this.hasStartedPeriodicActions = false;
}

ActionQueue.prototype = {
  defer: function(timeout, fn) {
    if (arguments.length == 1) {
      fn = timeout;
      timeout = 1;
    }
    var timeoutId = this.setTimeout(fn, timeout);
    return {
      cancel: (function() {
        this.clearTimeout(timeoutId);
      }).bind(this),
    };
  },

  periodically: function(fn) {
    var periodicActions = this.periodicActions;
    periodicActions.push(fn);

    if(!this.hasStartedPeriodicActions) {
      this._startPeriodicActions();
    }

    return {
      cancel: function() {
        periodicActions.splice(
          periodicActions.indexOf(fn),
          1
        );
      },
    };
  },

  _startPeriodicActions: function() {
      var queueFn = (function() {
        this.periodicActions.forEach(function(fn) { fn(); });
        this.setTimeout(queueFn, this.actionInterval);
      }).bind(this);
      queueFn();
      this.hasStartedPeriodicActions = true;
  },
};

module.exports = ActionQueue;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
function Animator(options) {
  this.actionQueue = (options && options.actionQueue);
}

Animator.prototype = {
  alternate: function() {
    this._checkDependencies();
    return new AlternatingAnimation(this.actionQueue, Array.prototype.slice.call(arguments));
  },

  _checkDependencies: function() {
    if (!this.actionQueue) {
      throw Error('ActionQueue is required');
    }
  },
};

function AlternatingAnimation(actionQueue, functions) {
  this.actionQueue = actionQueue;
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
        this.actionQueue.defer(this.interval, execute);
      }
    }).bind(this);
    execute();
    return this;
  },

  stop: function() {
    return this.asLongAs(function() { return false; });
  },
};

module.exports = Animator;

},{}],4:[function(require,module,exports){
var Component = require('./Component');

function BlockText(opts) {
  Component.apply(this, arguments);
  this.text = opts && opts.text;
}

BlockText.prototype = Object.assign(new Component(), {
  getGeneratedMarkup: function() {
    return this.text && ('<p>'  + this.text + '</p>');
  },
});

module.exports = BlockText;

},{"./Component":6}],5:[function(require,module,exports){
function BoundingBox(dimensions) {
  this.dimensions = dimensions || {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };
}

BoundingBox.prototype = {

  expandBy: function(factor) {
    return new BoundingBox({
      left: this.dimensions.left - this.getWidth()*factor,
      right: this.dimensions.right + this.getWidth()*factor,
      top: this.dimensions.top - this.getHeight()*factor,
      bottom: this.dimensions.bottom + this.getHeight()*factor,
    });
  },

  translate: function(vector) {
    return new BoundingBox({
      left: this.dimensions.left + vector.x,
      right: this.dimensions.right + vector.x,
      top: this.dimensions.top + vector.y,
      bottom: this.dimensions.bottom + vector.y,
    });
  },

  contains: function(point) {
    return this.dimensions.left <= point.x && point.x <= this.dimensions.right &&
           this.dimensions.top <= point.y && point.y <= this.dimensions.bottom;

  },

  getCenter: function() {
    return {
      x: this.dimensions.left + this.getWidth() / 2,
      y: this.dimensions.top + this.getHeight() / 2,
    };
  },

  getTopLeft: function() {
    return {
      x: this.dimensions.left,
      y: this.dimensions.top,
    };
  },


  getTopRight: function() {
    return {
      x: this.dimensions.right,
      y: this.dimensions.top,
    };
  },


  getBottomLeft: function() {
    return {
      x: this.dimensions.left,
      y: this.dimensions.bottom,
    };
  },

  getBottomRight: function() {
    return {
      x: this.dimensions.right,
      y: this.dimensions.bottom,
    };
  },

  getWidth: function() {
    return this.dimensions.right - this.dimensions.left;
  },

  getHeight: function() {
    return this.dimensions.bottom - this.dimensions.top;
  },

};

module.exports = BoundingBox;

},{}],6:[function(require,module,exports){
var utils = require('./utils');
var ModeSwitch = require('./ModeSwitch');
var LOG = require('./Logger');

/**
 * Component constructor
 *
 * options - service objects
 * options - options for the component.
 *         - holdTime - amount of time to wait before triggering a "hold" event
 */
function Component(options) {
  if (options) {
    this.actionQueue = options.actionQueue;
    this.holdTime = options.holdTime || 250;
    this.mouseTouchSwitch = new ModeSwitch({
      actionQueue: this.actionQueue,
      timeout: 500,
      name: 'mouseTouchSwitch',
    });
  }

  this.mouseDownCount = 0;
  this.mouseUpCount = 0;
  this.isInClickAndHold = false;
  this.closeListeners = [];
}

Component.prototype = {
  handleClick: function() {},
  handleClickAndHold: function() {},
  handleEnter: function() {},

  attachTo: function(targetElement) {
    this._validateOptions();
    this.element = targetElement;

    targetElement.addEventListener('mouseup', (function(event) {
      LOG.debug('mouseup', utils.normalizeEvent(event));
      this.mouseTouchSwitch.exit('mouse', (function(modeState) {
        this._handleMouseUp(modeState.lastDownEvent);
      }).bind(this));
    }).bind(this));

    targetElement.addEventListener('touchend', (function(event) {
      LOG.debug('touchend', utils.normalizeEvent(event));
      this.mouseTouchSwitch.exit('touch', (function(modeState) {
        this._handleMouseUp(modeState.lastDownEvent);
      }).bind(this));
    }).bind(this));

    targetElement.addEventListener('mousedown', (function(event) {
      event = utils.normalizeEvent(event);
      LOG.debug('mousedown', event);
      this.mouseTouchSwitch.enter('mouse', (function() {
        this._handleMouseDown(event);
        return { lastDownEvent: event };
      }).bind(this));
    }).bind(this));

    targetElement.addEventListener('touchstart', (function(event) {
      event = utils.normalizeEvent(event);
      LOG.debug('touchstart', event);
      this.mouseTouchSwitch.enter('touch', (function() {
        this._handleMouseDown(event);
        return { lastDownEvent: event };
      }).bind(this));
    }).bind(this));

    targetElement.addEventListener('keyup', (function(event) {
      event = utils.normalizeEvent(event);
      LOG.debug('keyup', event);
      if (event.keyCode === 13) {
        this.handleEnter(event);
      }
    }).bind(this));

    if (this.getGeneratedMarkup()) {
      targetElement.innerHTML = this.getGeneratedMarkup();
    }

    this.doAttach(targetElement);
  },

  /**
   * subclasses can override to indicate initial markup
   * to be set on the target element
   */
  getGeneratedMarkup: function() {
    return null;
  },

  /**
   * Sub-components should override to initialize on attachment
   */
  doAttach: function(element) {

  },

  onClose: function(listener) {
    this.closeListeners.push(listener);
    return this;
  },

  close: function() {
    this.closeListeners.forEach((function(f) {
      f(this);
    }).bind(this));
    this.element.remove();
    LOG.debug('closed component', this);
  },

  _validateOptions: function() {
    if (!this.actionQueue) {
      throw Error('actionQueue is required');
    }
  },

  _handleMouseUp: function(event) {
    this.mouseUpCount++;
    if (this.isInClickAndHold) {
      this.isInClickAndHold = false;
    } else {
      this.handleClick(event);
    }
  },

  _handleMouseDown: function(event) {
    this.mouseDownCount++;
    var originalCount = this.mouseDownCount;

    this.actionQueue.defer(this.holdTime, (function() {
      if (this.mouseDownCount === originalCount &&
          this.mouseUpCount === this.mouseDownCount - 1) {
        this.isInClickAndHold = true;
        this.handleClickAndHold(event);
      }
    }).bind(this));
  },

};

module.exports = Component;

},{"./Logger":12,"./ModeSwitch":13,"./utils":21}],7:[function(require,module,exports){
var utils = require('./utils');
var Position = require('./Position');
var Component = require('./Component');

function ComponentManager(options) {
  this.document = options && options.document;
  this.actionQueue = options && options.actionQueue;
  this.componentServices = options && options.componentServices;
}

ComponentManager.prototype = {
  insertComponent: function(options) {
    options = Object.assign({
      position: new Position({ topLeft: { x: 0, y: 0 }}),
      pinTo: undefined,
      class: Component,
      constructorArgs: undefined,
    }, options);

    var component = new options.class(Object.assign(
      {},
      this.componentServices,
      options.constructorArgs
    ));

    var element = this.document.createElement('div');
    if (options.position) {
      element.style = options.position.getStyle();
    }
    if (typeof options.pinTo === 'function') {
      var positionTracker = this.actionQueue.periodically((function() {
        element.style = options.pinTo().getStyle({
          width: element.offsetWidth,
          height: element.offsetHeight,
        });
      }).bind(this));
      component.onClose(positionTracker.cancel.bind(positionTracker));
    }
    this.document.body.insertBefore(element, this.document.body.firstChild);
    component.attachTo(element);
    return component;
  },
};

module.exports = ComponentManager;

},{"./Component":6,"./Position":15,"./utils":21}],8:[function(require,module,exports){
var ModeSwitch = require('./ModeSwitch');
var colors = require('./colors');
var LOG = require('./Logger');


function EditMode(opts) {
  this.adapter = opts && opts.adapter;
  this.animator = opts && opts.animator;
  this.alternateInterval = (opts && opts.alternateInterval) || 100;
  this.labelSet = opts && opts.labelSet;
  this.modeSwitch = (opts && opts.modeSwitch) || new ModeSwitch({
    name: 'editMode',
  });
  this.modeSwitch.enter('display');
}


EditMode.prototype = {

  activate: function(node) {
    LOG.info('EditMode: activating');
    this._validate();
    this.modeSwitch
      .exit('display')
      .exit('edit', this._cleanUpEditState.bind(this))
      .enter('edit', (function() {
        var otherNodes = this.adapter.getNodes(function(n) {
          return n.id !== node.id;
        });
        var originalColors = otherNodes.reduce(function(accum, node) {
          accum[node.id] = node.color;
          return accum;
        }, {});

        var animation = this.animator
          .alternate(
            this._setNeon.bind(this, otherNodes),
            this._setOriginalColors.bind(this, otherNodes, originalColors)
          )
          .every(this.alternateInterval)
          .play();

        this.labelSet.edit(node);

        var editState = {
          node: node,
          animation: animation,
          otherNodes: otherNodes,
          originalColors: originalColors,
        };
        LOG.debug('EditMode: activated', editState);
        return editState;
      }).bind(this));
  },

  deactivate: function() {
    LOG.debug('EditMode: deactvating');
    this._validate();
    this.modeSwitch
      .exit('edit', this._cleanUpEditState.bind(this))
      .enter('display', function() {
        LOG.debug('EditMode: deactvated');
      });
  },

  perform: function(opts) {
    opts = Object.assign({
      ifActive: function() {},
      ifNotActive: function() {},
    }, opts);
    this._validate();

    this.modeSwitch.ifActive({
      edit: function(editState) { opts.ifActive(editState.node); },
      display: opts.ifNotActive,
    });
  },

  _setNeon: function(otherNodes) {
    otherNodes.forEach((function(n) {
      this.adapter.setNodeColor(n, colors.NEON);
    }).bind(this));
  },

  _setOriginalColors: function(otherNodes, originalColors) {
    otherNodes.forEach((function(n) {
      this.adapter.setNodeColor(n, originalColors[n.id]);
    }).bind(this));
  },

  _cleanUpEditState: function(editState) {
    LOG.debug('cleaning up edit mode state', editState);
    editState.animation.stop();
    this.labelSet.display(editState.node);
    this._setOriginalColors(editState.otherNodes, editState.originalColors);
  },

  _validate: function() {
    if (!this.adapter) {
      throw new Error('adapter is required');
    }
    if (!this.animator) {
      throw new Error('animator is required');
    }
    if (!this.modeSwitch) {
      throw new Error('modeSwitch is required');
    }
  }

};

module.exports = EditMode;

},{"./Logger":12,"./ModeSwitch":13,"./colors":19}],9:[function(require,module,exports){
var ModeSwitch = require('./ModeSwitch');
var BlockText = require('./BlockText');
var TextBox = require('./TextBox');
var LOG = require('./Logger');

function EditableLabel(opts) {
  if (opts) {
    this.componentManager = opts.componentManager;
    this.text = opts.text;
    this.pinTo = opts.pinTo;
    this.modeSwitch = new ModeSwitch({
      name: 'EditableLabel({ text: \'' + this.text + '\'})'
    });
    this.onChange = opts.onChange || function() {};
  }
}

EditableLabel.prototype = {
  display: function() {
    LOG.debug('EditableLabel: displaying text', this.text);
    this._validate();

    this.modeSwitch.exit('edit', (function(editState) {
      this.text = editState.component.getText();
      editState.component.close();
      LOG.debug('EditableLabel: got text from input component', this.text);
    }).bind(this));

    if (this.text) {
      this.modeSwitch.enter('display', (function() {
        var component = this.componentManager.insertComponent({
          class: BlockText,
          constructorArgs: { text: this.text },
          pinTo: this.pinTo,
        });
        this.onChange(this.text);
        LOG.debug('EditableLabel: displaying component with text', this.text);
        return { component: component };
      }).bind(this));
    }
    return this;
  },

  edit: function() {
    LOG.debug('EditableLabel: editing text', this.text);
    this._validate();
    this.modeSwitch.exit('display', (function(displayState) {
      displayState.component.close();
      LOG.debug('EditableLabel: closed display component');
    }).bind(this));

    this.modeSwitch.enter('edit', (function() {
       var component = this.componentManager.insertComponent({
        class: TextBox,
        constructorArgs: {
          text: this.text,
          onSave: this.display.bind(this),
        },
        pinTo: this.pinTo,
      });
      LOG.debug('EditableLabel: opened edit component');
      return { component: component };
    }).bind(this));
    return this;
  },

  _validate: function() {
    if(!this.componentManager) {
      throw new Error('componentManager is required');
    }
    if(!this.modeSwitch) {
      throw new Error('modeSwitch is required');
    }
  },

  close: function() {
    this.modeSwitch
      .exit('display', function(displayState) { displayState.component.close(); })
      .exit('edit', function(editState) { editState.component.close(); }) ;

  },
};

EditableLabel.Factory = {
  create: function(opts) { return new EditableLabel(opts); },
};

module.exports = EditableLabel;

},{"./BlockText":4,"./Logger":12,"./ModeSwitch":13,"./TextBox":17}],10:[function(require,module,exports){
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

},{"./Component":6,"./Logger":12,"./colors":19,"./utils":21}],11:[function(require,module,exports){
var graphelements = require('./graphelements');;
var utils = require('./utils');
var BoundingBox = require('./BoundingBox');
var LOG = require('./Logger');


function GreulerAdapter(greuler) {
  this.greuler = greuler;
  this.isInBulkOperation = false;
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
        linkDistance: options.edgeDistance && function() {
          return options.edgeDistance;
        },
      }),
    })).update();
    this.graph = this.instance.graph;
  },

  addNode: function(node) {
    var result = this.graph.addNode(this._translateNodeObj(node));
    this._updateInstance();
  },

  removeNode: function(node) {
    var result = this.graph.removeNode(this._translateNodeObj(node));
    this._updateInstance();
  },

  addEdge: function(options) {
    var result = this.graph.addEdge(utils.optional({
      source: options.source.id,
      target: options.target.id,
      linkDistance: options.distance,
    }, { force: ['source', 'target'] }));
    this._updateInstance();
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

  getNode: function(nodeId) {
    return this.getNodes(function(n) { return n.id === nodeId; })[0];
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
        getCurrentBoundingBox: this._getBoundingBox.bind(this, node),
      });
    }).bind(this));
  },

  performInBulk: function(actions) {
    this.isInBulkOperation = true;
    actions(this);
    this.isInBulkOperation = false;
    this._updateInstance();
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
    var point = {
      x: event.clientX,
      y: event.clientY,
    };
    var matchingNodes = this.getNodes((function(node) {
      return this._getBoundingBox(node)
        .expandBy(nodeAreaFuzzFactor)
        .contains(point);
    }).bind(this));

    if (matchingNodes && matchingNodes.length) {
      matchingNodes.sort(function(a, b) {
        var distanceToA = utils.distance(a.getCenter(), point);
        var distanceToB = utils.distance(b.getCenter(), point);
        return distanceToA - distanceToB;
      });
      return matchingNodes[0];
    } else {
      return undefined;
    }
  },

  _updateInstance: function() {
    if (!this.isInBulkOperation) {
      this.instance = this.instance.update();
    }
  },

  _getBoundingBox: function(node) {
    var graphElementBounds = this.instance.root[0][0].getBoundingClientRect();
    return new BoundingBox({
      left: node.bounds.x,
      right: node.bounds.X,
      top: node.bounds.y,
      bottom: node.bounds.Y,
    })
    .translate({
      x: graphElementBounds.left,
      y: graphElementBounds.top
    });
  },
};

module.exports = GreulerAdapter;

},{"./BoundingBox":5,"./Logger":12,"./graphelements":20,"./utils":21}],12:[function(require,module,exports){
(function (global){
var LEVEL_ORDER = [
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
];

function Logger() {
  this.level = 'WARN';
}

Logger.prototype = {
  debug: function(msg, objs) {
    this._log.apply(this, [new Date().getTime(), 'DEBUG'].concat(Array.prototype.splice.call(arguments, 0)));
  },
  info: function(msg, objs) {
    this._log.apply(this, [new Date().getTime(), 'INFO'].concat(Array.prototype.splice.call(arguments, 0)));
  },
  warn: function(msg, objs) {
    this._log.apply(this, [new Date().getTime(), 'WARN'].concat(Array.prototype.splice.call(arguments, 0)));
  },
  error: function(msg, objs) {
    this._log.apply(this, [new Date().getTime(), 'ERROR'].concat(Array.prototype.splice.call(arguments, 0)));
  },

  _log: function() {
    var level = arguments[1];
    if (LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(this.level)) {
      global.console.log.apply(global.console.log, arguments);
    }
  },
};


module.exports = new Logger();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],13:[function(require,module,exports){
var LOG = require('./Logger');

function ModeSwitch(opts) {
  this.actionQueue = opts && opts.actionQueue;
  this.timeout = (opts && opts.timeout) || 0;
  this.modeStates = (opts && opts.initialStates) || {};
  this.name = (opts && opts.name) || 'ModeSwitch';
  this.currentMode = null;
  this.resetModeFuture = null;
  LOG.debug('Initialized ' + this.name, this);
}

ModeSwitch.prototype = {
  enter: function(mode, fn) {
    this._validate();
    if (this._isPermitted(mode)) {
      LOG.debug(this.name + ': Entering \'' + mode + '\'', this);
      var state = (fn || function() {})();
      this.modeStates[mode] = state;
      this.currentMode = mode;
      this._cancelModeReset();
    } else {
      LOG.debug(this.name + ': Not entering \'' + mode + '\';'
                + ' active mode is ' + this.currentMode, this);
    }
    return this;
  },

  exit: function(mode, fn) {
    this._validate();
    if(this._isActive(mode)) {
      LOG.debug(this.name + ': Exiting ' + mode, this);
      (fn || function() {})(this.modeStates[mode]);
      this._scheduleModeReset();
    } else {
      LOG.debug(this.name + ': Not exiting \'' + mode + '\';'
                + ' active mode is ' + this.currentMode, this);
    }
    return this;
  },

  ifActive: function(callbackObj) {
    var activeMode = this.currentMode || 'default';
    var callback = callbackObj[activeMode];
    if (callback) {
      LOG.debug(this.name + ': Found callback for active mode', activeMode, callbackObj);
      var modeState = this.modeStates[this.currentMode || 'default'];
      callback(modeState);
    } else {
      LOG.debug(this.name + ': No callback for active mode', activeMode, callbackObj);
    }
    return this;
  },

  _isPermitted: function(mode) {
    return !this.currentMode || this._isActive(mode);
  },

  _isActive: function(mode) {
    return this.currentMode === mode;
  },

  _cancelModeReset: function() {
    this.resetModeFuture && this.resetModeFuture.cancel();
  },

  _scheduleModeReset: function() {
    var resetFunction = (function() {
      delete this.modeStates[this.currentMode];
      this.currentMode = null;
    }).bind(this);

    this._cancelModeReset();
    if (this.timeout) {
      this.resetModeFuture = this.actionQueue.defer(
        this.timeout, resetFunction
      );
    } else {
      resetFunction();
    }
  },

  _validate: function() {
    if(this.timeout && !this.actionQueue) {
      throw new Error('action queue is required if a timeout is specified');
    }
  },
};

module.exports = ModeSwitch;

},{"./Logger":12}],14:[function(require,module,exports){
var Position = require('./Position');
var EditableLabel = require('./EditableLabel');
var LOG = require('./Logger');

function NodeLabelSet(opts) {
  this.componentManager = opts && opts.componentManager;
  this.state = opts && opts.state;
  this.editableLabelFactory = (opts && opts.editableLabelFactory) || EditableLabel.Factory;
  this.labels = {};
}

NodeLabelSet.prototype = {

  initialize: function(initialData) {
    initialData
      .filter(function(o) { return !!o.label; })
      .forEach((function(o) {
        var label = this._createLabel(o.node, o.label);
        this.labels[o.node.id] = label;
        label.display();
      }).bind(this));
  },

  edit: function(node) {
    LOG.debug('LabelSet: editing label for node ' + node.id);
    this._getOrCreateLabel(node).edit();
  },

  display: function(node) {
    LOG.debug('LabelSet: displaying label for node ' + node.id);
    this._getOrCreateLabel(node).display();
  },

  closeAll: function() {
    Object.values(this.labels).forEach(function(label) {
      label.close();
    });
    this.labels = {};
  },

  _getOrCreateLabel: function(node) {
    var label;
    if (this.labels[node.id]) {
      label = this.labels[node.id];
      LOG.info('reusing existing label for node ' + node.id, label);
    } else {
      label = this._createLabel(node);
      this.labels[node.id] = label;
      LOG.info('created new label for node ' + node.id, label);
    }
    return label;
  },

  _createLabel: function(node, label) {
    return this.editableLabelFactory.create({
      text: label,
      componentManager: this.componentManager,
      pinTo: function() {
        return new Position({
          bottomRight: node.getCurrentBoundingBox().getTopLeft(),
        });
      },
      onChange: (function(text) {
        this.state.persistNode({ id: node.id, label: text });
      }).bind(this),
    });
  },

  _validate: function() {
    if (!this.componentManager) {
      throw new Error('componentManager is required');
    }
    if (!this.state) {
      throw new Error('state is required');
    }
  },
};

module.exports = NodeLabelSet;

},{"./EditableLabel":9,"./Logger":12,"./Position":15}],15:[function(require,module,exports){
var utils = require('./utils');

function Position(opts) {
  /* opts -
   * {
    topLeft: { x: 0, y: 0 },
    topRight: undefined,
    bottomLeft: undefined,
    bottomRight: undefined,
    }
   */
  if (!utils.isOneValuedObject(opts)) {
    throw new Error('invalid position object ' + opts);
  }

  Object.assign(this, opts);
}


Position.prototype = {
  getStyle: function(opts) {
    opts = Object.assign({
      width: 0,
      height: 0,
    }, opts);

    if (this.topLeft) {
        return 'position: absolute;' +
        ' left: ' + this.topLeft.x + ';' +
        ' top: ' + this.topLeft.y + ';';
    } else if (this.topRight) {
      return 'position: absolute;' +
        ' left: ' + (this.topRight.x - opts.width) + ';' +
        ' top: ' + this.topRight.y + ';';
    } else if (this.bottomLeft) {
      return 'position: absolute;' +
        ' left: ' + this.bottomLeft.x + ';' +
        ' top: ' + (this.bottomLeft.y - opts.height) + ';';
    } else if (this.bottomRight) {
      return 'position: absolute;' +
        ' left: ' + (this.bottomRight.x  - opts.width)+ ';' +
        ' top: ' + (this.bottomRight.y - opts.height) + ';';
    } else {
      throw new Error('invalid position object: ' + this);
    }
  },
};

module.exports = Position;

},{"./utils":21}],16:[function(require,module,exports){
var Component = require('./Component');

function ResetButton(options) {
  Component.apply(this, arguments);
  if (options) {
    this.resettables = options.resettables;
  } else {
    this.resettables = [];
  }

}

ResetButton.prototype = Object.assign(new Component(), {
  handleClick: function(event) {
    this.resettables.forEach(function(resettable) {
      resettable.reset();
    });
  },
});

module.exports = ResetButton;

},{"./Component":6}],17:[function(require,module,exports){
var Component = require('./Component');

function TextBox(options) {
  Component.apply(this, arguments);
  this.initialText = (options && options.text) || '';
  this.onSave = (options && options.onSave) || function() {};
}

TextBox.prototype = Object.assign(new Component(), {
  getGeneratedMarkup: function() {
    return '<input type="text"' +
    ' value="' + this.initialText + '"' +
    '></input>';
  },

  getText: function() {
    return this.element.getElementsByTagName('input')[0].value;
  },

  handleEnter: function(event) {
    this.onSave();
  },
});

module.exports = TextBox;

},{"./Component":6}],18:[function(require,module,exports){
var utils = require('./utils');

NUM_NODES_PARAM = 'n'
COLOR_PARAM_PREFIX = 'c_';
EDGE_PARAM_PREFIX = 'e_';
LABEL_PARAM_PREFIX = 'l_';

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
    options = options || {};
    var nodeId;
    if (options.id) {
      nodeId = options.id;
    } else {
      nodeId = this._getNumNodes();
      this.urlSearchParams.set(NUM_NODES_PARAM, nodeId + 1);
    }

    if (options.color) {
      this._setNodeColor(nodeId, options.color);
    }

    if (options.label) {
      this._setNodeLabel(nodeId, options.label);
    }

    this._persistState();
    return nodeId;
  },

  retrieveNode: function(nodeId) {
    var nodeBit = this._idToBit(nodeId);
    var nodeColor = this._getColorKeys().find((function(param) {
      return this._isColor({ bit: nodeBit, colorKey: param });
    }).bind(this));
    var label = this.urlSearchParams.get(LABEL_PARAM_PREFIX + nodeId);
    return utils.optional({
      id: nodeId,
      color: (nodeColor && nodeColor.replace(COLOR_PARAM_PREFIX, '#')),
      label: label && decodeURIComponent(label),
    }, { force: 'id' });
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
      for (var i = 0 ; i < this.urlSearchParams.get(NUM_NODES_PARAM); i++) {
        nodes.push(this.retrieveNode(i));
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

  _setNodeLabel: function(nodeId, label) {
    this.urlSearchParams.set(
      LABEL_PARAM_PREFIX + nodeId,
      encodeURIComponent(label)
    );
  },

  getUrl: function() {
    return this.baseUrl + '?' + this.urlSearchParams.toString();
  },

  reset: function() {
    this._getKeys().forEach((function(key) {
      this.urlSearchParams.delete(key);
    }).bind(this));
    this._persistState();
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
    predicate = predicate || function() { return true; };
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

  _setNodeColor: function(nodeId, color) {
    var bit = this._idToBit(nodeId);

    this._getColorKeys().forEach((function(key) {
      if (this._isColor({ bit: bit, colorKey: key })) {
        this._removeColor({ bit: bit, colorKey: key });
      }
    }).bind(this));

    this._setColor({ bit: bit, color: color });
  },


  _persistState: function() {
    this.setUrl(this.getUrl());
  },
};

module.exports = UrlState;

},{"./utils":21}],19:[function(require,module,exports){
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

},{}],20:[function(require,module,exports){
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
    this.getCurrentBoundingBox = options.getCurrentBoundingBox;
  }
}

Node.prototype = Object.assign(new GraphElement(), {
  isNode: function() { return true; },

  getCenter: function() {
    return this.getCurrentBoundingBox().getCenter();
  },

  getTopLeft: function() {
    return this.getCurrentBoundingBox().getTopLeft();
  },

  getTopRight: function() {
    return this.getCurrentBoundingBox().getTopRight();
  },

  getBottomLeft: function() {
    return this.getCurrentBoundingBox().getBottomLeft();
  },

  getBottomRight: function() {
    return this.getCurrentBoundingBox().getBottomRight();
  },
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

},{}],21:[function(require,module,exports){
/**
 * Compute the cartesian distance between two vectors
 */
function distance(point1, point2) {
  var x = point1.x - point2.x;
  var y = point1.y - point2.y;
  return Math.sqrt(x*x + y*y);
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


function normalizeEvent(event) {
  if (event && event.touches && event.touches.length) {
    return Object.assign(
      event,
      {
        clientX: event.touches[0].clientX,
        clientY: event.touches[0].clientY,
        screenX: event.touches[0].screenX,
        screenY: event.touches[0].screenY,
      }
    );
  } else {
    return event;
  }
}

function isOneValuedObject(obj) {
  if (obj && (typeof obj === 'object') && !Array.isArray(obj)) {
    var presentKeys = Object.keys(obj)
      .filter(function(k) { return !!obj[k]; });
    return presentKeys.length === 1
  } else {
    return false;
  }

}

module.exports = {
  distance: distance,
  optional: optional,
  normalizeEvent: normalizeEvent,
  isOneValuedObject: isOneValuedObject,
};

},{}]},{},[1])
//# sourceMappingURL=bundle.map.js
