var Component = require('./Component');
var utils = require('./utils');
var LOG = require('./Logger');


function GraphComponent(opts) {
  Component.apply(this, arguments);
  this.adapter = opts && opts.adapter;
  this.editMode = opts && opts.editMode;
  this.graph = opts && opts.graph;
  this.width = opts && opts.width;
  this.height = opts && opts.height;
  this.nodeAreaFuzzFactor = opts.nodeAreaFuzzFactor;
}


GraphComponent.prototype = Object.assign(new Component(), {
  doAttach: function(targetElement) {
    this.graph.initialize({
      element: targetElement,
      width: this.width,
      height: this.height,
    });
  },

  handleClick: function(event) {
    var clickTarget = this.adapter.getClickTarget(
      event, this.nodeAreaFuzzFactor
    );

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
    var clickTarget = this.adapter.getClickTarget(
      event, this.nodeAreaFuzzFactor
    );
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
    if (!this.adapter) {
      throw new Error('adapter is required');
    }
    if (!this.editMode) {
      throw new Error('edit mode is required');
    }
    if (!this.graph) {
      throw new Error('graph is required');
    }
  },
});

module.exports = GraphComponent;
