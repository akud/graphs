(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
global.utils = require('./src/utils')
global.TextBox = require('./src/components/TextBox')
global.GraphComponent = require('./src/components/GraphComponent')
global.BlockText = require('./src/components/BlockText')
global.Link = require('./src/components/Link')
global.ResetButton = require('./src/components/ResetButton')
global.ActionQueue = require('./src/ActionQueue')
global.TrackedObject = require('./src/TrackedObject')
global.Logger = require('./src/Logger')
global.Position = require('./src/geometry/Position')
global.BoundingBox = require('./src/geometry/BoundingBox')
global.Component = require('./src/Component')
global.graphelements = require('./src/graphs/graphelements')
global.EdgeCreator = require('./src/graphs/EdgeCreator')
global.NoOpColorChanger = require('./src/graphs/NoOpColorChanger')
global.NodeCreator = require('./src/graphs/NodeCreator')
global.graphfactory = require('./src/graphs/graphfactory')
global.NoOpNodeCreator = require('./src/graphs/NoOpNodeCreator')
global.Graph = require('./src/graphs/Graph')
global.GreulerAdapter = require('./src/graphs/GreulerAdapter')
global.ColorChanger = require('./src/graphs/ColorChanger')
global.NoOpEdgeCreator = require('./src/graphs/NoOpEdgeCreator')
global.InMemoryState = require('./src/state/InMemoryState')
global.UrlState = require('./src/state/UrlState')
global.ModeSwitch = require('./src/ModeSwitch')
global.Animator = require('./src/Animator')
global.DisallowedEditMode = require('./src/modes/DisallowedEditMode')
global.EditMode = require('./src/modes/EditMode')
global.NonAnimatingEditMode = require('./src/modes/NonAnimatingEditMode')
global.ComponentManager = require('./src/ComponentManager')
global.NodeLabelSet = require('./src/labels/NodeLabelSet')
global.EditableLabel = require('./src/labels/EditableLabel')
global.EmptyLabelSet = require('./src/labels/EmptyLabelSet')
global.Literal = require('./src/utils/Literal')
global.colors = require('./src/colors')
var GreulerAdapter = require('./src/graphs/GreulerAdapter');
var UrlState = require('./src/state/UrlState');
var ActionQueue = require('./src/ActionQueue');
var ResetButton = require('./src/components/ResetButton');
var graphfactory = require('./src/graphs/graphfactory');

require('./src/Logger').level = global.logLevel;

var actionQueue = new ActionQueue();
var urlSearchParams = new URLSearchParams(window.location.search);
var state = new UrlState({
  baseUrl: window.location.protocol + "//" + window.location.host + window.location.pathname,
  setUrl: window.history.replaceState.bind(window.history, {}, ''),
  urlSearchParams: urlSearchParams,
});


var immutable = urlSearchParams.get('immutable') === 'true';
var allowAddNodes = urlSearchParams.get('allowAddNodes') !== 'false';
var allowAddEdges = urlSearchParams.get('allowAddEdges') !== 'false';
var allowEdit = urlSearchParams.get('allowEdit') !== 'false';
var allowChangeColors = urlSearchParams.get('allowChangeColors') !== 'false';
var allowLabels = urlSearchParams.get('allowLabels') !== 'false';
var directed = urlSearchParams.get('directed') === 'true';


global.graphComponent = graphfactory.newGraphComponent({
  document: global.document,
  screen: global.screen,
  window: window,
  size: 'fullscreen',
  adapter: new GreulerAdapter({ greuler: global.greuler }),
  actionQueue: actionQueue,
  state: state,
  nodeAreaFuzzFactor: 0.1,
  alternateInterval: 250,
  immutable: immutable,
  allowAddNodes: allowAddNodes,
  allowAddEdges: allowAddEdges,
  allowChangeColors: allowChangeColors,
  allowEdit: allowEdit,
  allowLabels: allowLabels,
  colorChoices: urlSearchParams.has('colorChoices') &&
    urlSearchParams.getAll('colorChoices').map(addHashIfMissing),
  directed: directed,
  initialNodes: state.retrievePersistedNodes(),
  initialEdges: state.retrievePersistedEdges(),
});

function addHashIfMissing(c) { return c.indexOf('#') === 0 ? c : '#' + c; }

global.graph = global.graphComponent.graph;

global.graphComponent.attachTo(document.getElementById('main-graph'));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./src/ActionQueue":2,"./src/Animator":3,"./src/Component":4,"./src/ComponentManager":5,"./src/Logger":6,"./src/ModeSwitch":7,"./src/TrackedObject":8,"./src/colors":9,"./src/components/BlockText":10,"./src/components/GraphComponent":11,"./src/components/Link":12,"./src/components/ResetButton":13,"./src/components/TextBox":14,"./src/geometry/BoundingBox":15,"./src/geometry/Position":16,"./src/graphs/ColorChanger":17,"./src/graphs/EdgeCreator":18,"./src/graphs/Graph":19,"./src/graphs/GreulerAdapter":20,"./src/graphs/NoOpColorChanger":21,"./src/graphs/NoOpEdgeCreator":22,"./src/graphs/NoOpNodeCreator":23,"./src/graphs/NodeCreator":24,"./src/graphs/graphelements":25,"./src/graphs/graphfactory":26,"./src/labels/EditableLabel":27,"./src/labels/EmptyLabelSet":28,"./src/labels/NodeLabelSet":29,"./src/modes/DisallowedEditMode":30,"./src/modes/EditMode":31,"./src/modes/NonAnimatingEditMode":32,"./src/state/InMemoryState":33,"./src/state/UrlState":34,"./src/utils":35,"./src/utils/Literal":36}],2:[function(require,module,exports){
(function (global){
var Literal = require('./utils/Literal');
var TrackedObject = require('./TrackedObject');

function ActionQueue(options) {
  TrackedObject.apply(this);
  this.setTimeout = (options && options.setTimeout) || global.setTimeout.bind(global);
  this.clearTimeout = (options && options.clearTimeout) || global.clearTimeout.bind(global);
  this.actionInterval = (options && options.actionInterval) || 10;
  this.periodicActions = [];
  this.hasStartedPeriodicActions = false;
}

ActionQueue.prototype = Object.assign(new TrackedObject(), {
  className: 'ActionQueue',

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

  getConstructorArgs: function() {
    return {
      setTimeout: new Literal('global.setTimeout.bind(global)'),
      clearTimeout: new Literal('global.clearTimeout.bind(global)'),
      actionInterval: this.actionInterval,
    };
  },
});

module.exports = ActionQueue;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./TrackedObject":8,"./utils/Literal":36}],3:[function(require,module,exports){
var TrackedObject = require('./TrackedObject');

function Animator(options) {
  TrackedObject.apply(this);
  this.actionQueue = (options && options.actionQueue);
}

Animator.prototype = Object.assign(new TrackedObject(), {
  className: 'Animator',

  alternate: function() {
    this._checkDependencies();
    return new AlternatingAnimation(this.actionQueue, Array.prototype.slice.call(arguments));
  },

  getConstructorArgs: function() {
    return { actionQueue: this.actionQueue };
  },

  _checkDependencies: function() {
    if (!this.actionQueue) {
      throw Error('ActionQueue is required');
    }
  },
});

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

},{"./TrackedObject":8}],4:[function(require,module,exports){
var utils = require('./utils');
var ModeSwitch = require('./ModeSwitch');
var TrackedObject = require('./TrackedObject');
var Logger = require('./Logger');

var LOG = new Logger('Component');


/**
 * Component constructor
 *
 * options - service objects
 * options - options for the component.
 *         - holdTime - amount of time to wait before triggering a "hold" event
 */
function Component(options) {
  TrackedObject.apply(this);
  if (options) {
    this.actionQueue = options.actionQueue;
    this.holdTime = options.holdTime || 250;
    this.mouseTouchSwitch = new ModeSwitch({
      actionQueue: this.actionQueue,
      timeout: 500,
      name: 'mouseTouchSwitch',
    });
    this.constructorArgs = options;
  }

  this.mouseDownCount = 0;
  this.mouseUpCount = 0;
  this.isInClickAndHold = false;
  this.closeListeners = [];
}

Component.prototype = Object.assign(new TrackedObject(), {
  handleClick: function() {},
  handleClickAndHold: function() {},
  handleEnter: function() {},
  className: '',

  getConstructorArgs: function() { return this.constructorArgs; },

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

  onRemove: function(listener) {
    this.closeListeners.push(listener);
    return this;
  },

  remove: function() {
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
    if (!this.className) {
      throw new Error('Must override className');
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
});

module.exports = Component;

},{"./Logger":6,"./ModeSwitch":7,"./TrackedObject":8,"./utils":35}],5:[function(require,module,exports){
var utils = require('./utils');
var Position = require('./geometry/Position');
var Component = require('./Component');
var Literal = require('./utils/Literal');
var TrackedObject = require('./TrackedObject');

function ComponentManager(options) {
  TrackedObject.apply(this);
  this.document = options && options.document;
  this.actionQueue = options && options.actionQueue;
  this.componentServices = options && options.componentServices;
}

ComponentManager.prototype = Object.assign(new TrackedObject(), {
  className: 'ComponentManager',

  getConstructorArgs: function() {
    return {
      document: new Literal('global.document'),
      actionQueue: this.actionQueue,
      componentServices: this.componentServices,
    };
  },

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
      this._setPositionOnElement(options.position, element);
    }
    if (typeof options.pinTo === 'function') {
      var positionTracker = this.actionQueue.periodically((function() {
        this._setPositionOnElement(options.pinTo(), element);
      }).bind(this));
      component.onRemove(positionTracker.cancel.bind(positionTracker));
    }
    this.document.body.insertBefore(element, this.document.body.firstChild);
    component.attachTo(element);
    return component;
  },

  _setPositionOnElement: function(position, element) {
    var elementPosition = position.getElementPosition({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
    element.style.position = 'fixed';
    element.style.zIndex = '1';
    element.style.top = elementPosition.top + 'px';
    element.style.left = elementPosition.left + 'px';
  },
});

module.exports = ComponentManager;

},{"./Component":4,"./TrackedObject":8,"./geometry/Position":16,"./utils":35,"./utils/Literal":36}],6:[function(require,module,exports){
(function (global){
var LEVEL_ORDER = [
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
];

function Logger(name) {
  this.name = name || 'Logger';
}

Logger.level = 'WARN';
Logger.levels = {};

Logger.prototype = {
  debug: function(msg, objs) {
    this._log.apply(this, [new Date().getTime(), 'DEBUG', this.name].concat(Array.prototype.splice.call(arguments, 0)));
  },
  info: function(msg, objs) {
    this._log.apply(this, [new Date().getTime(), 'INFO', this.name].concat(Array.prototype.splice.call(arguments, 0)));
  },
  warn: function(msg, objs) {
    this._log.apply(this, [new Date().getTime(), 'WARN', this.name].concat(Array.prototype.splice.call(arguments, 0)));
  },
  error: function(msg, objs) {
    this._log.apply(this, [new Date().getTime(), 'ERROR', this.name].concat(Array.prototype.splice.call(arguments, 0)));
  },

  _log: function() {
    var level = arguments[1];
    var logLevel = Logger.levels[this.name] || Logger.level;
    if (LEVEL_ORDER.indexOf(level) >= LEVEL_ORDER.indexOf(logLevel)) {
      global.console.log.apply(global.console.log, arguments);
    }
  },
};


module.exports = Logger;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],7:[function(require,module,exports){
var Logger = require('./Logger');
var TrackedObject = require('./TrackedObject');

var LOG = new Logger('ModeSwitch');

function ModeSwitch(opts) {
  TrackedObject.apply(this);
  this.actionQueue = opts && opts.actionQueue;
  this.timeout = (opts && opts.timeout) || 0;
  this.modeStates = (opts && opts.initialStates) || {};
  this.name = (opts && opts.name) || 'ModeSwitch';
  this.currentMode = null;
  this.resetModeFuture = null;
  LOG.debug('Initialized ' + this.name, this);
}

ModeSwitch.prototype = Object.assign(new TrackedObject(), {
  className: 'ModeSwitch',
  getConstructorArgs: function() {
    return {
      actionQueue: this.actionQueue,
      timeout: this.timeout,
      initialStates: this.modeStates,
      name: this.name,
    };
  },

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
});

module.exports = ModeSwitch;

},{"./Logger":6,"./TrackedObject":8}],8:[function(require,module,exports){
var id = 0;

function TrackedObject() {
  this.id = id++;
}

module.exports = TrackedObject;

},{}],9:[function(require,module,exports){
var RED = '#db190f';
var ORANGE = '#f76402';
var YELLOW = '#fbff14';
var GREEN = '#28b92b';
var BLUE = '#2826b5';
var INDIGO = '#2980B9';
var VIOLET = '#8c28b7';
var NEON = '#00FF00';

module.exports = {
  RED: RED,
  ORANGE: ORANGE,
  YELLOW: YELLOW,
  GREEN: GREEN,
  BLUE: BLUE,
  INDIGO: INDIGO,
  VIOLET: VIOLET,
  NEON: NEON,
  RAINBOW: [
    RED,
    ORANGE,
    YELLOW,
    GREEN,
    BLUE,
    INDIGO,
    VIOLET,
  ],
};

},{}],10:[function(require,module,exports){
var Component = require('../Component');

function BlockText(opts) {
  Component.apply(this, arguments);
  this.text = opts && opts.text;
}

BlockText.prototype = Object.assign(new Component(), {
  className: 'BlockText',

  getGeneratedMarkup: function() {
    return this.text && ('<p>'  + this.text + '</p>');
  },
});

module.exports = BlockText;

},{"../Component":4}],11:[function(require,module,exports){
var Component = require('../Component');
var utils = require('../utils');
var Logger = require('../Logger');

var LOG = new Logger('GraphComponent');


function GraphComponent(opts) {
  Component.apply(this, arguments);
  this.editMode = opts && opts.editMode;
  this.graph = opts && opts.graph;
  this.width = opts && opts.width;
  this.height = opts && opts.height;
}


GraphComponent.prototype = Object.assign(new Component(), {
  className: 'GraphComponent',

  doAttach: function(targetElement) {
    this.graph.initialize({
      element: targetElement,
      width: this.width,
      height: this.height,
    });
  },

  handleClick: function(event) {
    var clickTarget = this.graph.getNearestElement({
      x: event.clientX,
      y: event.clientY,
    });

    this.editMode.perform({
      ifActive: (function(currentlyEditedNode) {
        if (clickTarget.isNode() && clickTarget.id !== currentlyEditedNode.id) {
          this.graph.addEdge(currentlyEditedNode, clickTarget);
       } else {
          this.editMode.deactivate();
        }
      }).bind(this),

      ifNotActive: (function() {
        if (clickTarget.isNode()) {
          this.graph.changeColor(clickTarget);
        } else {
          this.graph.addNode();
        }
      }).bind(this)
    });
  },

  handleClickAndHold: function(event) {
    var clickTarget = this.graph.getNearestElement({
      x: event.clientX,
      y: event.clientY,
    });

    if (clickTarget.isNode()) {
      this.editMode.activate(clickTarget);
    }
  },

  reset: function() {
    this.graph.reset();
    this.editMode.deactivate();
  },

  _validateOptions: function() {
    Component.prototype._validateOptions.call(this, arguments);
    if (!this.editMode) {
      throw new Error('edit mode is required');
    }
    if (!this.graph) {
      throw new Error('graph is required');
    }
  },
});

module.exports = GraphComponent;

},{"../Component":4,"../Logger":6,"../utils":35}],12:[function(require,module,exports){
var Component = require('../Component');

function Link(opts) {
  Component.apply(this, arguments);
  this.text = opts && opts.text;
  this.link = opts && opts.link;
}

Link.prototype = Object.assign(new Component(), {
  className: 'Link',

  getGeneratedMarkup: function() {
    if (this.text && this.link) {
      return '<a href="' + this.link + '">' + this.text + '</a>';
    } else {
      return null;
    }
  },
});

module.exports = Link;

},{"../Component":4}],13:[function(require,module,exports){
var Component = require('../Component');

function ResetButton(options) {
  Component.apply(this, arguments);
  if (options) {
    this.resettables = options.resettables;
  } else {
    this.resettables = [];
  }

}

ResetButton.prototype = Object.assign(new Component(), {
  className: 'ResetButton',

  handleClick: function(event) {
    this.resettables.forEach(function(resettable) {
      resettable.reset();
    });
  },
});

module.exports = ResetButton;

},{"../Component":4}],14:[function(require,module,exports){
var Component = require('../Component');

function TextBox(options) {
  Component.apply(this, arguments);
  this.initialText = (options && options.text) || '';
  this.onSave = (options && options.onSave) || function() {};
}

TextBox.prototype = Object.assign(new Component(), {
  className: 'TextBox',

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

},{"../Component":4}],15:[function(require,module,exports){
function BoundingBox(dimensions) {
  this.dimensions = dimensions || {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  };
}

BoundingBox.prototype = {
  className: 'BoundingBox',

  getConstructorArgs: function() { return this.dimensions; },

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

},{}],16:[function(require,module,exports){
var utils = require('../utils');

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
  className: 'Position',
  getConstructorArgs: function() { return this; },

  getElementPosition: function(elementSize) {
    elementSize = Object.assign({
      width: 0,
      height: 0,
    }, elementSize);

    if (this.topLeft) {
      return {
        left: this.topLeft.x,
        top: this.topLeft.y,
      };
    } else if (this.topRight) {
      return {
        left: this.topRight.x - elementSize.width,
        top: this.topRight.y,
      };
    } else if (this.bottomLeft) {
      return {
        left: this.bottomLeft.x,
        top: this.bottomLeft.y - elementSize.height,
      };
    } else if (this.bottomRight) {
      return {
        left: this.bottomRight.x  - elementSize.width,
        top: this.bottomRight.y - elementSize.height,
      }
    } else {
      throw new Error('invalid position object: ' + this);
    }
  },
};

module.exports = Position;

},{"../utils":35}],17:[function(require,module,exports){
var TrackedObject = require('../TrackedObject');
var utils = require('../utils');

function ColorChanger() {
  TrackedObject.apply(this);
}

ColorChanger.prototype = Object.assign(new TrackedObject(), {
  className: 'ColorChanger',
  getConstructorArgs: function() { return {}; },

  setColor: function(opts) {
    var adapter = utils.requireNonNull(opts, 'adapter');
    var state = utils.requireNonNull(opts, 'state');
    var node = utils.requireNonNull(opts, 'node');
    var color = utils.requireNonNull(opts, 'color');

    adapter.setNodeColor(node, color);
    state.persistNode({ id: node.id, color: color });
  },
});

module.exports = ColorChanger;

},{"../TrackedObject":8,"../utils":35}],18:[function(require,module,exports){
var TrackedObject = require('../TrackedObject');
var utils = require('../utils');

function EdgeCreator() {
  TrackedObject.apply(this);
}

EdgeCreator.prototype = Object.assign(new TrackedObject(), {
  className: 'EdgeCreator',
  getConstructorArgs: function() { return {}; },

  addEdge: function(opts) {
    var adapter = utils.requireNonNull(opts, 'adapter');
    var state = utils.requireNonNull(opts, 'state');
    var source = utils.requireNonNull(opts, 'source');
    var target = utils.requireNonNull(opts, 'target');
    var edgeDistance = opts.edgeDistance;
    var directed = opts.directed;

    adapter.addEdge({
      source: source,
      target: target,
      distance: edgeDistance,
      directed: directed,
    });
    state.persistEdge(source.id, target.id);
  },

});

module.exports = EdgeCreator;

},{"../TrackedObject":8,"../utils":35}],19:[function(require,module,exports){
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

},{"../Logger":6,"../TrackedObject":8,"../colors":9,"../utils":35,"./ColorChanger":17,"./EdgeCreator":18,"./NodeCreator":24}],20:[function(require,module,exports){
var graphelements = require('./graphelements');;
var utils = require('../utils');
var BoundingBox = require('../geometry/BoundingBox');
var Literal = require('../utils/Literal');
var Logger = require('../Logger');
var TrackedObject = require('../TrackedObject');

var LOG = new Logger('GreulerAdapter');


function GreulerAdapter(opts) {
  TrackedObject.apply(this);
  this.greuler = opts && opts.greuler;
  this.isInBulkOperation = false;
}


GreulerAdapter.prototype = Object.assign(new TrackedObject(), {
  className: 'GreulerAdapter',

  getConstructorArgs: function() {
    return { greuler: new Literal('global.greuler') };
  },

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
      directed: !!options.directed,
    }, { force: ['source', 'target', 'directed'] }));
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

  getNearestElement: function(opts) {
    var point = utils.requireNonNull(opts, 'point');
    var nodeAreaFuzzFactor = opts.nodeAreaFuzzFactor || 0;
    return this._getTargetNode(point, nodeAreaFuzzFactor) || graphelements.NONE;
  },

  getNode: function(nodeId) {
    LOG.debug('retrieving node', nodeId);
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
    LOG.debug('retrieving dom element for node: ' + node.index, this.instance);
    var childNodes = this.instance.nodeGroup[0][0].childNodes;
    LOG.debug(childNodes);
    return childNodes[node.index].getElementsByTagName('circle')[0];
  },

  _getTargetNode: function(point, nodeAreaFuzzFactor) {
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
});

module.exports = GreulerAdapter;

},{"../Logger":6,"../TrackedObject":8,"../geometry/BoundingBox":15,"../utils":35,"../utils/Literal":36,"./graphelements":25}],21:[function(require,module,exports){
var TrackedObject = require('../TrackedObject');

function NoOpColorChanger() {
  TrackedObject.apply(this);
}

NoOpColorChanger.prototype = Object.assign(new TrackedObject(), {
  className: 'NoOpColorChanger',

  getConstructorArgs: function() { return {}; },
  setColor: function() {},
});

module.exports = NoOpColorChanger;

},{"../TrackedObject":8}],22:[function(require,module,exports){
var TrackedObject = require('../TrackedObject');

function NoOpEdgeCreator() {
  TrackedObject.apply(this);
}

NoOpEdgeCreator.prototype = Object.assign(new TrackedObject(), {
  className: 'NoOpEdgeCreator',
  getConstructorArgs: function() { return {}; },

  addEdge: function() {},

});

module.exports = NoOpEdgeCreator;

},{"../TrackedObject":8}],23:[function(require,module,exports){
var TrackedObject = require('../TrackedObject');

function NoOpNodeCreator() {
  TrackedObject.apply(this);
}

NoOpNodeCreator.prototype = Object.assign(new TrackedObject(), {
  className: 'NoOpNodeCreator',
  getConstructorArgs: function() { return {}; },
  addNode: function() {},
});

module.exports = NoOpNodeCreator;

},{"../TrackedObject":8}],24:[function(require,module,exports){
var TrackedObject = require('../TrackedObject');
var utils = require('../utils');

function NodeCreator() {
  TrackedObject.apply(this);
}

NodeCreator.prototype = Object.assign(new TrackedObject(), {
  className: 'NodeCreator',
  getConstructorArgs: function() { return {}; },

  addNode: function(opts) {
    var state = utils.requireNonNull(opts, 'state');
    var adapter = utils.requireNonNull(opts, 'adapter');
    var color = utils.requireNonNull(opts, 'color');
    var nodeSize = opts.nodeSize;

    var nodeId = state.persistNode({
      color: color,
    });
    var node = utils.optional({
      id: nodeId,
      color: color,
      label: '',
      size: nodeSize,
    }, { force: ['id', 'label'] });
    adapter.addNode(node);
  },
});

module.exports = NodeCreator;

},{"../TrackedObject":8,"../utils":35}],25:[function(require,module,exports){
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

},{}],26:[function(require,module,exports){

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

},{"../Animator":3,"../ComponentManager":5,"../Logger":6,"../components/GraphComponent":11,"../labels/EmptyLabelSet":28,"../labels/NodeLabelSet":29,"../modes/DisallowedEditMode":30,"../modes/EditMode":31,"../modes/NonAnimatingEditMode":32,"../utils":35,"./ColorChanger":17,"./EdgeCreator":18,"./Graph":19,"./GreulerAdapter":20,"./NoOpColorChanger":21,"./NoOpEdgeCreator":22,"./NoOpNodeCreator":23,"./NodeCreator":24}],27:[function(require,module,exports){
var ModeSwitch = require('../ModeSwitch');
var BlockText = require('../components/BlockText');
var Link = require('../components/Link');
var TextBox = require('../components/TextBox');
var utils = require('../utils');
var Logger = require('../Logger');
var TrackedObject = require('../TrackedObject');

var LOG = new Logger('EditableLabel');


function EditableLabel(opts) {
  TrackedObject.apply(this);
  if (opts) {
    this.componentManager = opts.componentManager;
    this.text = opts.text;
    this.pinTo = opts.pinTo;
    this.modeSwitch = new ModeSwitch({
      name: 'EditableLabel({ text: \'' + this.text + '\'})'
    });
    this.onChange = opts.onChange || function() {};
    this.link = opts.link;
  }
}

EditableLabel.prototype = Object.assign(new TrackedObject(), {
  className: 'EditableLabel',

  getConstructorArgs: function() {
    return {
      componentManager: this.componentManager,
      text: this.text,
      pinTo: this.pinTo,
      onChange: this.onChange,
      link: this.link,
    };
  },

  display: function() {
    LOG.debug('displaying text', this.text);
    this._validate();

    this.modeSwitch.exit('edit', (function(editState) {
      this._setText(editState.component.getText());
      editState.component.remove();
      LOG.debug('got text from input component', this.text);
    }).bind(this))
    .exit('display', function(displayState) { displayState.component.remove(); });

    if (this.text) {
      this.modeSwitch.enter('display', (function() {
        var component = this.componentManager.insertComponent({
          class: this.link ? Link : BlockText,
          constructorArgs: utils.optional({ text: this.text, link: this.link }),
          pinTo: this.pinTo,
        });
        this.onChange({ text: this.text, link: this.link });
        LOG.debug(
          'displaying component text=\'' + this.text + '\'' +
          (this.link ? ', link=\'' + this.link + '\'' : '')
        );
        return { component: component };
      }).bind(this));
    }
    return this;
  },

  edit: function() {
    LOG.debug('editing text', this.text);
    this._validate();
    this.modeSwitch.exit('display', (function(displayState) {
      displayState.component.remove();
      LOG.debug('closed display component');
    }).bind(this))
    .exit('edit', function(editState) { editState.component.remove(); });

    this.modeSwitch.enter('edit', (function() {
       var component = this.componentManager.insertComponent({
        class: TextBox,
        constructorArgs: {
          text: this._getTextForEdit(),
          onSave: this.display.bind(this),
        },
        pinTo: this.pinTo,
      });
      LOG.debug('opened edit component');
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

  remove: function() {
    LOG.debug('removing', this);
    this.modeSwitch
      .exit('display', function(displayState) {
        displayState.component.remove();
        LOG.debug('closed display component');
      })
      .exit('edit', function(editState) {
        editState.component.remove();
        LOG.debug('closed edit component');
      }) ;
    return this;
  },

  _closeComponent: function(state) {
    state.component.remove();
  },

  _setText: function(text) {
    var match;
    if (text && !!(match = /\[(.*)\]\((.*)\)/.exec(text))) {
      this.text = match[1];
      this.link = match[2];
    } else {
      this.text = text;
      this.link = null;
    }
  },

  _getTextForEdit: function() {
    if (this.text && this.link) {
      return '[' + this.text + '](' + this.link + ')';
    } else {
      return this.text;
    }
  },
});

EditableLabel.Factory = {
  create: function(opts) { return new EditableLabel(opts); },

};
module.exports = EditableLabel;

},{"../Logger":6,"../ModeSwitch":7,"../TrackedObject":8,"../components/BlockText":10,"../components/Link":12,"../components/TextBox":14,"../utils":35}],28:[function(require,module,exports){
var TrackedObject = require('../TrackedObject');

function EmptyLabelSet() {
  TrackedObject.apply(this);
}

EmptyLabelSet.prototype = Object.assign(new TrackedObject(), {
  className: 'EmptyLabelSet',
  getConstructorArgs: function() { return {}; },

  initialize: function() {},
  edit: function() {},
  display: function() {},
  closeAll: function() {},
});

module.exports = EmptyLabelSet;

},{"../TrackedObject":8}],29:[function(require,module,exports){
var Position = require('../geometry/Position');
var EditableLabel = require('./EditableLabel');
var utils = require('../utils');
var Logger = require('../Logger');
var TrackedObject = require('../TrackedObject');

var LOG = new Logger('NodeLabelSet');
var id = 0;

function NodeLabelSet(opts) {
  TrackedObject.apply(this);
  this.componentManager = opts && opts.componentManager;
  this.state = opts && opts.state;
  this.editableLabelFactory = (opts && opts.editableLabelFactory) || EditableLabel.Factory;
  this.labels = {};
  this.id = (id++);
}

NodeLabelSet.prototype = Object.assign(new TrackedObject(), {
  className: 'NodeLabelSet',
  getConstructorArgs: function() {
    return {
      componentManager: this.componentManager,
      state: this.state,
    };
  },

  initialize: function(initialData) {
    LOG.debug('initializing', initialData);
    initialData
      .filter(function(o) { return !!o.label; })
      .forEach((function(o) {
        var label = this._createLabel(o);
        this.labels[o.node.id] = label;
        label.display();
      }).bind(this));
  },

  edit: function(node) {
    LOG.debug('editing label for node ' + node.id);
    this._getOrCreateLabel(node).edit();
  },

  display: function(node) {
    LOG.debug('displaying label for node ' + node.id);
    this._getOrCreateLabel(node).display();
  },

  closeAll: function() {
    LOG.debug('closing all labels', this.labels);
    Object.values(this.labels).forEach(function(label) {
      label.remove();
    });
    this.labels = {};
  },

  _getOrCreateLabel: function(node) {
    var label;
    if (this.labels[node.id]) {
      label = this.labels[node.id];
      LOG.info('reusing existing label for node ' + node.id, label);
    } else {
      label = this._createLabel({ node: node });
      this.labels[node.id] = label;
      LOG.info('created new label for node ' + node.id, label);
    }
    return label;
  },

  _createLabel: function(opts) {
    var node = utils.requireNonNull(opts, 'node');
    var label = opts.label;
    var link = opts.link;
    LOG.debug('Creating label', node);

    return this.editableLabelFactory.create({
      text: label,
      componentManager: this.componentManager,
      pinTo: function() {
        return new Position({
          bottomRight: node.getCurrentBoundingBox().getTopLeft(),
        });
      },
      onChange: (function(opts) {
        LOG.debug('saving label', node, opts);
        this.state.persistNode({ id: node.id, label: opts.text, link: opts.link });
      }).bind(this),
      link: link,
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
});

module.exports = NodeLabelSet;

},{"../Logger":6,"../TrackedObject":8,"../geometry/Position":16,"../utils":35,"./EditableLabel":27}],30:[function(require,module,exports){
var EditMode = require('./EditMode');

function DisallowedEditMode() {
  EditMode.apply(this, arguments);
}

DisallowedEditMode.prototype = Object.assign(new EditMode(), {
  className: 'DisallowedEditMode',

  activate: function() {},
  _validate: function() {},
});

module.exports = DisallowedEditMode;

},{"./EditMode":31}],31:[function(require,module,exports){
var ModeSwitch = require('../ModeSwitch');
var colors = require('../colors');
var Logger = require('../Logger');
var TrackedObject = require('../TrackedObject');

var LOG = new Logger('EditMode');


function EditMode(opts) {
  TrackedObject.apply(this);
  this.adapter = opts && opts.adapter;
  this.animator = opts && opts.animator;
  this.alternateInterval = (opts && opts.alternateInterval) || 250;
  this.labelSet = opts && opts.labelSet;
  this.modeSwitch = (opts && opts.modeSwitch) || new ModeSwitch({
    name: 'editMode',
  });
  this.modeSwitch.enter('display');
}


EditMode.prototype = Object.assign(new TrackedObject(), {
  className: 'EditMode',

  getConstructorArgs: function() {
    return {
      adapter: this.adapter,
      animator: this.animator,
      alternateInterval: this.alternateInterval,
      labelSet: this.labelSet,
      modeSwitch: this.modeSwitch,
    };
  },

  activate: function(node) {
    LOG.info('activating');
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

        var animation = this._startEditAnimation(otherNodes, originalColors);

        this.labelSet.edit(node);

        var editState = {
          node: node,
          animation: animation,
          otherNodes: otherNodes,
          originalColors: originalColors,
        };
        LOG.debug('activated', editState);
        return editState;
      }).bind(this));
  },

  deactivate: function() {
    LOG.debug('deactvating');
    this._validate();
    this.modeSwitch
      .exit('edit', this._cleanUpEditState.bind(this))
      .enter('display', function() {
        LOG.debug('deactvated');
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

  _startEditAnimation: function(otherNodes, originalColors) {
    return this.animator
    .alternate(
      this._setNeon.bind(this, otherNodes),
      this._setOriginalColors.bind(this, otherNodes, originalColors)
    )
    .every(this.alternateInterval)
    .play();
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

});

module.exports = EditMode;

},{"../Logger":6,"../ModeSwitch":7,"../TrackedObject":8,"../colors":9}],32:[function(require,module,exports){
var EditMode = require('./EditMode');
var Logger = require('../Logger');

var LOG = new Logger('NonAnimatingEditMode');


function NonAnimatingEditMode() {
  EditMode.apply(this, arguments);
}


NonAnimatingEditMode.prototype = Object.assign(new EditMode(), {
  className: 'NonAnimatingEditMode',

  _startEditAnimation: function() {
    LOG.debug('not animating for edit mode');
    return { stop: function() {} };
  },

  _validate: function() {
    if (!this.adapter) {
      throw new Error('adapter is required');
    }
    if (!this.modeSwitch) {
      throw new Error('modeSwitch is required');
    }
  },
});

module.exports = NonAnimatingEditMode;

},{"../Logger":6,"./EditMode":31}],33:[function(require,module,exports){
var TrackedObject = require('../TrackedObject');

function InMemoryState() {
  TrackedObject.apply(this);
  this.nodes = {};
  this.edges = [];
}

InMemoryState.prototype = Object.assign(new TrackedObject(), {
  className: 'InMemoryState',
  getConstructorArgs: function() { return {}; },

  persistNode: function(options) {
    options = options || {};
    if (options.hasOwnProperty('id') && options.id !== null && options.id !== undefined) {
      nodeId = options.id;
    } else {
      nodeId = this._getNumNodes();
      options.id = nodeId;
    }

    this.nodes[nodeId] = Object.assign({}, this.nodes[nodeId], options);
    return nodeId;
  },

  retrieveNode: function(nodeId) {
    return this.nodes[nodeId];
  },

  persistEdge: function(sourceId, targetId) {
    this.edges.push({ source: sourceId, target: targetId });
  },

  retrievePersistedNodes: function() {
    return Object.values(this.nodes);
  },

  retrievePersistedEdges: function() {
    return this.edges;
  },

  getUrl: function() {
    return '';
  },

  reset: function() {
    this.nodes = {};
    this.edges = [];
  },

  _getNumNodes: function() {
    return Object.keys(this.nodes).length;
  },

});

module.exports = InMemoryState;

},{"../TrackedObject":8}],34:[function(require,module,exports){
var utils = require('../utils');
var Literal = require('../utils/Literal');
var Logger = require('../Logger');
var TrackedObject = require('../TrackedObject');

var LOG = new Logger('UrlState');

NUM_NODES_PARAM = 'n'
COLOR_PARAM_PREFIX = 'c_';
EDGE_PARAM_PREFIX = 'e_';
LABEL_PARAM_PREFIX = 'l_';
LINK_PARAM_PREFIX = 'li_';

function UrlState(options) {
  TrackedObject.apply(this);
  this.baseUrl = (options && options.baseUrl);
  this.setUrl = (options && options.setUrl);
  this.urlSearchParams = (options && options.urlSearchParams);
}

UrlState.prototype = Object.assign(new TrackedObject(), {
  className: 'UrlState',
  getConstructorArgs: function() {
    return {
      baseUrl: this.baseUrl,
      setUrl: new Literal('window.history.replaceState.bind(window.history, {}, \'\')'),
      urlSearchParams: new Literal('new URLSearchParams(window.location.search)'),
    };
  },

  /**
   * Perist a node and return its id
   */
  persistNode: function(options) {
    options = options || {};
    var nodeId;
    if (options.hasOwnProperty('id') && options.id !== null && options.id !== undefined) {
      nodeId = options.id;
    } else {
      nodeId = this._getNumNodes();
      this.urlSearchParams.set(NUM_NODES_PARAM, nodeId + 1);
    }

    if (options.hasOwnProperty('color')) {
      this._setNodeColor(nodeId, options.color);
    }

    if (options.hasOwnProperty('label')) {
      this._setNodeLabel(nodeId, options.label);
    }

    if (options.hasOwnProperty('link')) {
      this._setNodeLink(nodeId, options.link);
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
    var link = this.urlSearchParams.get(LINK_PARAM_PREFIX + nodeId);
    return utils.optional({
      id: nodeId,
      color: (nodeColor && nodeColor.replace(COLOR_PARAM_PREFIX, '#')),
      label: label && decodeURIComponent(label),
      link: link && decodeURIComponent(link),
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
    if (label) {
      this.urlSearchParams.set(
        LABEL_PARAM_PREFIX + nodeId,
        encodeURIComponent(label)
      );
    } else {
      this.urlSearchParams.delete(LABEL_PARAM_PREFIX + nodeId);
    }
  },

  _setNodeLink: function(nodeId, link) {
    if (link) {
      this.urlSearchParams.set(
        LINK_PARAM_PREFIX + nodeId,
        encodeURIComponent(link)
      );
    } else {
      this.urlSearchParams.delete(LINK_PARAM_PREFIX + nodeId);
    }
  },

  getUrl: function() {
    return this.baseUrl + '?' + this.urlSearchParams.toString();
  },

  reset: function() {
    LOG.debug('resetting');
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

    if (color) {
      this._setColor({ bit: bit, color: color });
    }
  },


  _persistState: function() {
    this.setUrl(this.getUrl());
  },
});

module.exports = UrlState;

},{"../Logger":6,"../TrackedObject":8,"../utils":35,"../utils/Literal":36}],35:[function(require,module,exports){
var Literal = require('./utils/Literal');

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

function startingAt(array, startingItem) {
  var startingIndex = array.indexOf(startingItem)
  if (startingIndex >= 0) {
    var returnValue = [];
    for (var i = startingIndex; i < array.length; i++) {
      returnValue.push(array[i]);
    }
    for (var i = 0; i < startingIndex; i++) {
      returnValue.push(array[i]);
    }
    return returnValue;
  } else {
    return array;
  }
}

function requireNonNull(container, property) {
  if (!container[property]) {
    throw new Error('missing required property ' + property);
  }
  return container[property];
}

function toJs(value, indentLevel) {
  indentLevel = indentLevel || 0;
  function indentOutro(line) {
    return ' '.repeat(indentLevel) + line;
  }
  function indentNestedLine(line) {
    return ' '.repeat(indentLevel + 2) + line;
  }
  if (value instanceof Literal) {
    return value.value;
  } else if (Array.isArray(value)) {
    return '[\n' +
      value.map(function(a) { return toJs(a, indentLevel + 2) + ','; })
      .map(indentNestedLine)
      .join('\n') +
      '\n' +
      indentOutro(']');
  } else if (value && value.className && value.getConstructorArgs) {
    return 'new ' + value.className + '({\n' +
      Object.keys(value.getConstructorArgs())
      .map(function(k) { return k +': ' + toJs(value.getConstructorArgs()[k], indentLevel + 2) + ','; })
      .map(indentNestedLine)
      .join('\n') +
      '\n' +
      indentOutro('})');
  } else if (value && typeof value === 'object') {
    return '{\n' +
      Object.keys(value).map(function(k) {
        return k + ': ' + toJs(value[k], indentLevel + 2) + ',';
      })
      .map(indentNestedLine)
      .join('\n') +
      '\n' +
      indentOutro('}');
  } else if (value && typeof value === 'string') {
    return '\'' + replaceAll(value, "'", "\\'") + '\'';
  } else if (value || value === 0) {
    return value.toString();
  } else {
    return 'null';
  }
}

function replaceAll(str, original, replacement) {
  return str.split(original).join(replacement);
}

module.exports = {
  distance: distance,
  optional: optional,
  normalizeEvent: normalizeEvent,
  isOneValuedObject: isOneValuedObject,
  startingAt: startingAt,
  toJs: toJs,
  replaceAll: replaceAll,
  requireNonNull: requireNonNull,
};

},{"./utils/Literal":36}],36:[function(require,module,exports){
function Literal(value) {
  this.value = value;
}

module.exports = Literal;

},{}]},{},[1])
//# sourceMappingURL=bundle.debug.map.js
