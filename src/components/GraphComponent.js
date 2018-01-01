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
